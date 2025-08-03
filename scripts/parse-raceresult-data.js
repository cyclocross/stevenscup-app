#!/usr/bin/env node

/**
 * RaceResult Data Parser
 * 
 * This script parses the JSON data from RaceResult's direct API endpoints
 * and converts it to a structured list of registrations.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

/**
 * Parse RaceResult participant data
 */
function parseRaceResultData(jsonData) {
  console.log('🔍 Parsing RaceResult participant data...');
  
  const parsedData = {
    event: {
      name: jsonData.list.HeadLine1 || 'Unknown Event',
      date: jsonData.list.LastChange ? new Date(jsonData.list.LastChange).toISOString().split('T')[0] : 'Unknown',
      location: 'Neu Duvenstedt, Germany', // From previous analysis
      organizer: 'SG Athletico Büdelsdorf', // From previous analysis
      totalParticipants: jsonData.list.ListFooterText ? parseInt(jsonData.list.ListFooterText.match(/\d+/)[0]) : 0
    },
    contests: [],
    participants: [],
    summary: {
      totalContests: 0,
      totalParticipants: 0,
      genderBreakdown: { M: 0, W: 0 },
      ageGroups: {}
    }
  };
  
  // Parse contest categories and participants
  if (jsonData.data) {
    Object.entries(jsonData.data).forEach(([contestKey, contestData]) => {
      const contestInfo = parseContestKey(contestKey);
      const participants = contestData.slice(0, -1); // Remove the count at the end
      
      const contest = {
        id: contestInfo.id,
        name: contestInfo.name,
        ageRange: contestInfo.ageRange,
        category: contestInfo.category,
        participantCount: participants.length,
        participants: []
      };
      
      // Parse participants in this contest
      participants.forEach(participant => {
        const parsedParticipant = parseParticipant(participant, contest);
        contest.participants.push(parsedParticipant);
        parsedData.participants.push(parsedParticipant);
        
        // Update summary statistics
        parsedData.summary.totalParticipants++;
        if (parsedParticipant.gender) {
          parsedData.summary.genderBreakdown[parsedParticipant.gender]++;
        }
        
        // Age group breakdown
        if (parsedParticipant.birthYear) {
          const age = new Date().getFullYear() - parsedParticipant.birthYear;
          const ageGroup = getAgeGroup(age);
          parsedData.summary.ageGroups[ageGroup] = (parsedData.summary.ageGroups[ageGroup] || 0) + 1;
        }
      });
      
      parsedData.contests.push(contest);
      parsedData.summary.totalContests++;
    });
  }
  
  return parsedData;
}

/**
 * Parse contest key to extract contest information
 */
function parseContestKey(contestKey) {
  // Example: "#1_Hobby M 40 M 1977 - 1986"
  const parts = contestKey.split('_');
  const id = parts[0].replace('#', '');
  
  if (parts.length >= 2) {
    const contestInfo = parts[1];
    
    // Extract category and age range
    const categoryMatch = contestInfo.match(/^([^0-9]+)/);
    const ageMatch = contestInfo.match(/(\d{4})\s*-\s*(\d{4})/);
    
    return {
      id: parseInt(id),
      name: contestInfo,
      category: categoryMatch ? categoryMatch[1].trim() : 'Unknown',
      ageRange: ageMatch ? `${ageMatch[1]}-${ageMatch[2]}` : 'Unknown'
    };
  }
  
  return {
    id: parseInt(id),
    name: contestKey,
    category: 'Unknown',
    ageRange: 'Unknown'
  };
}

/**
 * Parse individual participant data
 */
function parseParticipant(participantData, contest) {
  // Data structure: ["BIB", "ID", "LASTNAME", "FIRSTNAME", "YEAR", "CLUB", "TEAM", "GENDER"]
  const [bib, id, lastName, firstName, birthYear, club, team, gender] = participantData;
  
  return {
    bib: parseInt(bib) || null,
    id: parseInt(id) || null,
    lastName: lastName || '',
    firstName: firstName || '',
    fullName: `${firstName || ''} ${lastName || ''}`.trim(),
    birthYear: parseInt(birthYear) || null,
    age: birthYear ? new Date().getFullYear() - parseInt(birthYear) : null,
    club: club || '',
    team: team || '',
    gender: gender || null,
    contest: {
      id: contest.id,
      name: contest.name,
      category: contest.category
    },
    // Additional derived fields
    ageGroup: birthYear ? getAgeGroup(new Date().getFullYear() - parseInt(birthYear)) : null,
    hasTeam: team && team !== 'keine' && team !== '',
    isLicensed: contest.name.includes('Lizenz')
  };
}

/**
 * Get age group category
 */
function getAgeGroup(age) {
  if (age < 13) return 'U13';
  if (age < 15) return 'U15';
  if (age < 17) return 'U17';
  if (age < 19) return 'U19';
  if (age < 23) return 'U23';
  if (age < 30) return 'Elite';
  if (age < 35) return 'Masters 1';
  if (age < 40) return 'Masters 2';
  if (age < 45) return 'Masters 3';
  if (age < 50) return 'Masters 4';
  if (age < 55) return 'Masters 5';
  if (age < 60) return 'Masters 6';
  if (age < 65) return 'Masters 7';
  if (age < 70) return 'Masters 8';
  return 'Masters 9+';
}

/**
 * Convert parsed data to Stevens Cup format
 */
function convertToStevensCupFormat(parsedData) {
  console.log('🔄 Converting to Stevens Cup format...');
  
  const stevensCupData = {
    event: {
      name: parsedData.event.name,
      date: parsedData.event.date,
      location: parsedData.event.location,
      organizer: parsedData.event.organizer,
      externalId: '321983', // From the URL
      source: 'raceresult'
    },
    contests: parsedData.contests.map(contest => ({
      name: contest.name,
      category: contest.category,
      ageRange: contest.ageRange,
      participantCount: contest.participantCount,
      externalId: contest.id.toString()
    })),
    participants: parsedData.participants.map(participant => ({
      bibNumber: participant.bib,
      firstName: participant.firstName,
      lastName: participant.lastName,
      birthYear: participant.birthYear,
      gender: participant.gender,
      club: participant.club,
      team: participant.team,
      contest: participant.contest.name,
      externalId: participant.id?.toString(),
      importMetadata: {
        source: 'raceresult',
        importDate: new Date().toISOString(),
        originalData: participant
      }
    })),
    summary: parsedData.summary
  };
  
  return stevensCupData;
}

/**
 * Save parsed data to files
 */
function saveParsedData(originalData, parsedData, stevensCupData, baseFilename) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = 'import_experiments';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  try {
    // Save original JSON
    const originalFile = path.join(outputDir, `${baseFilename}_original_${timestamp}.json`);
    fs.writeFileSync(originalFile, JSON.stringify(originalData, null, 2));
    console.log(`💾 Saved original data to: ${originalFile}`);
    
    // Save parsed data
    const parsedFile = path.join(outputDir, `${baseFilename}_parsed_${timestamp}.json`);
    fs.writeFileSync(parsedFile, JSON.stringify(parsedData, null, 2));
    console.log(`💾 Saved parsed data to: ${parsedFile}`);
    
    // Save Stevens Cup format
    const stevensCupFile = path.join(outputDir, `${baseFilename}_stevens_cup_${timestamp}.json`);
    fs.writeFileSync(stevensCupFile, JSON.stringify(stevensCupData, null, 2));
    console.log(`💾 Saved Stevens Cup format to: ${stevensCupFile}`);
    
    // Save CSV for easy viewing
    const csvFile = path.join(outputDir, `${baseFilename}_participants_${timestamp}.csv`);
    const csvContent = generateCSV(stevensCupData.participants);
    fs.writeFileSync(csvFile, csvContent);
    console.log(`💾 Saved CSV to: ${csvFile}`);
    
  } catch (error) {
    console.error(`❌ Error saving files: ${error.message}`);
  }
}

/**
 * Generate CSV from participant data
 */
function generateCSV(participants) {
  const headers = ['BIB', 'First Name', 'Last Name', 'Birth Year', 'Gender', 'Club', 'Team', 'Contest', 'Age Group'];
  const rows = participants.map(p => [
    p.bibNumber || '',
    p.firstName || '',
    p.lastName || '',
    p.birthYear || '',
    p.gender || '',
    p.club || '',
    p.team || '',
    p.contest || '',
    p.importMetadata?.originalData?.ageGroup || ''
  ]);
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

/**
 * Main function to parse RaceResult data
 */
async function parseRaceResultDataFromUrl(url, options = {}) {
  console.log('🚀 Starting RaceResult Data Parsing\n');
  console.log('='.repeat(60));
  
  try {
    // Fetch data from URL
    console.log(`🌐 Fetching data from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const jsonData = await response.json();
    console.log(`✅ Successfully fetched data (${JSON.stringify(jsonData).length} characters)`);
    
    // Parse the data
    const parsedData = parseRaceResultData(jsonData);
    
    // Convert to Stevens Cup format
    const stevensCupData = convertToStevensCupFormat(parsedData);
    
    // Save everything to files
    const baseFilename = options.filename || 'raceresult_parsed';
    saveParsedData(jsonData, parsedData, stevensCupData, baseFilename);
    
    // Display summary
    console.log('\n📋 Parsing Summary');
    console.log('='.repeat(60));
    console.log(`Event: ${parsedData.event.name}`);
    console.log(`Date: ${parsedData.event.date}`);
    console.log(`Total Contests: ${parsedData.summary.totalContests}`);
    console.log(`Total Participants: ${parsedData.summary.totalParticipants}`);
    console.log(`Gender Breakdown: M=${parsedData.summary.genderBreakdown.M}, W=${parsedData.summary.genderBreakdown.W}`);
    
    if (Object.keys(parsedData.summary.ageGroups).length > 0) {
      console.log('\n📊 Age Group Breakdown:');
      Object.entries(parsedData.summary.ageGroups)
        .sort(([,a], [,b]) => b - a)
        .forEach(([group, count]) => {
          console.log(`  ${group}: ${count} participants`);
        });
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Review the generated files for data accuracy');
    console.log('2. Import the Stevens Cup format data into your database');
    console.log('3. Map contest categories to your contest structure');
    console.log('4. Handle any data validation or cleaning needed');
    
    return { originalData: jsonData, parsedData, stevensCupData };
    
  } catch (error) {
    console.error(`❌ Error parsing data: ${error.message}`);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 RaceResult Data Parser');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/parse-raceresult-data.js <RACERESULT_DATA_URL> [options]');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/parse-raceresult-data.js "https://my4.raceresult.com/321983/RRPublish/data/list?key=..."');
    console.log('  node scripts/parse-raceresult-data.js "https://..." --filename stevens_cup_round1');
    console.log('');
    console.log('Options:');
    console.log('  --filename <name>  Base filename for output files');
    console.log('');
    return;
  }
  
  const url = args[0];
  const options = {};
  
  // Parse options
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--filename' && i + 1 < args.length) {
      options.filename = args[i + 1];
      i++; // Skip next argument
    }
  }
  
  try {
    await parseRaceResultDataFromUrl(url, options);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { parseRaceResultDataFromUrl, parseRaceResultData, convertToStevensCupFormat }; 