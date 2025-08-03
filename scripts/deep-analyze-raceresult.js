#!/usr/bin/env node

/**
 * Deep Analysis Script for RaceResult Sites
 * 
 * This script specifically targets RaceResult sites to find participant data
 * and understand their data structure.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

/**
 * Analyze RaceResult HTML for participant data patterns
 */
function analyzeRaceResultHTML(html) {
  console.log('🔍 Deep analyzing RaceResult HTML...');
  
  const analysis = {
    eventInfo: {},
    potentialEndpoints: [],
    participantData: [],
    javascriptCode: [],
    dataAttributes: []
  };
  
  // Extract event information from JSON-LD
  const jsonLdMatches = html.match(/\{[^{}]*"@type"[^{}]*\}/g);
  if (jsonLdMatches) {
    console.log(`📋 Found ${jsonLdMatches.length} JSON-LD structures`);
    
    jsonLdMatches.forEach((match, index) => {
      try {
        const parsed = JSON.parse(match);
        if (parsed['@type'] === 'Event') {
          analysis.eventInfo = parsed;
          console.log(`🎯 Event: ${parsed.name}`);
          console.log(`📅 Date: ${parsed.startDate}`);
          console.log(`📍 Location: ${parsed.location?.address?.streetAddress || 'Unknown'}`);
        }
      } catch (e) {
        // Skip invalid JSON
      }
    });
  }
  
  // Look for potential participant data endpoints
  const endpointPatterns = [
    /https?:\/\/[^"'\s]+(?:participants?|startlist|results?|data)[^"'\s]*/gi,
    /https?:\/\/[^"'\s]+(?:\.json|\.xml|\.csv)[^"'\s]*/gi,
    /https?:\/\/[^"'\s]+(?:api|ajax)[^"'\s]*/gi
  ];
  
  endpointPatterns.forEach(pattern => {
    const matches = html.match(pattern);
    if (matches) {
      analysis.potentialEndpoints.push(...matches);
    }
  });
  
  // Look for JavaScript code that might load data
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    console.log(`📜 Found ${scriptMatches.length} script tags`);
    
    scriptMatches.forEach(script => {
      // Look for AJAX calls, fetch requests, or data loading
      const dataPatterns = [
        /fetch\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /\.ajax\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /\.get\s*\(\s*['"`]([^'"`]+)['"`]/gi,
        /\.post\s*\(\s*['"`]([^'"`]+)['"`]/gi
      ];
      
      dataPatterns.forEach(pattern => {
        const matches = script.match(pattern);
        if (matches) {
          analysis.javascriptCode.push(...matches);
        }
      });
    });
  }
  
  // Look for data attributes that might contain participant info
  const dataAttrMatches = html.match(/data-[^=]+="[^"]*"/gi);
  if (dataAttrMatches) {
    analysis.dataAttributes = dataAttrMatches;
    console.log(`📊 Found ${dataAttrMatches.length} data attributes`);
  }
  
  return analysis;
}

/**
 * Try to construct potential participant data URLs
 */
function constructParticipantUrls(baseUrl, eventId) {
  console.log('🔗 Constructing potential participant data URLs...');
  
  const baseDomain = new URL(baseUrl).origin;
  const potentialUrls = [
    `${baseDomain}/${eventId}/participants.json`,
    `${baseDomain}/${eventId}/participants.xml`,
    `${baseDomain}/${eventId}/startlist.json`,
    `${baseDomain}/${eventId}/startlist.xml`,
    `${baseDomain}/${eventId}/data/participants.json`,
    `${baseDomain}/${eventId}/data/startlist.json`,
    `${baseDomain}/api/events/${eventId}/participants`,
    `${baseDomain}/api/events/${eventId}/startlist`,
    `${baseDomain}/ajax/participants?event=${eventId}`,
    `${baseDomain}/ajax/startlist?event=${eventId}`
  ];
  
  console.log(`🔍 Generated ${potentialUrls.length} potential URLs to test`);
  return potentialUrls;
}

/**
 * Test a URL to see if it returns participant data
 */
async function testUrl(url) {
  try {
    console.log(`🧪 Testing: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/html, */*'
      },
      timeout: 5000
    });
    
    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
      return null;
    }
    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    console.log(`✅ Status: ${response.status}, Type: ${contentType}, Size: ${contentLength || 'unknown'}`);
    
    // Try to get a preview of the content
    const text = await response.text();
    const preview = text.substring(0, 200);
    
    return {
      url,
      status: response.status,
      contentType,
      contentLength,
      preview,
      fullContent: text
    };
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }
}

/**
 * Main analysis function
 */
async function deepAnalyzeRaceResult(url) {
  console.log('🚀 Starting Deep RaceResult Analysis\n');
  console.log('='.repeat(60));
  
  // First, fetch the main page
  console.log(`🌐 Fetching main page: ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  
  if (!response.ok) {
    console.error(`❌ Failed to fetch main page: ${response.status}`);
    return;
  }
  
  const html = await response.text();
  console.log(`✅ Fetched ${html.length} characters`);
  
  // Analyze the HTML
  const analysis = analyzeRaceResultHTML(html);
  
  // Extract event ID from URL
  const eventIdMatch = url.match(/\/(\d+)\//);
  const eventId = eventIdMatch ? eventIdMatch[1] : 'unknown';
  console.log(`🎯 Event ID: ${eventId}`);
  
  // Construct potential URLs
  const potentialUrls = constructParticipantUrls(url, eventId);
  
  // Test each potential URL
  console.log('\n🧪 Testing potential data endpoints...');
  const results = [];
  
  for (const urlToTest of potentialUrls) {
    const result = await testUrl(urlToTest);
    if (result) {
      results.push(result);
    }
    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = 'import_experiments';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  const outputFile = path.join(outputDir, `raceresult_deep_analysis_${timestamp}.json`);
  const outputData = {
    originalUrl: url,
    eventId,
    analysis,
    potentialUrls,
    testResults: results
  };
  
  fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
  console.log(`\n💾 Saved deep analysis to: ${outputFile}`);
  
  // Summary
  console.log('\n📋 Deep Analysis Summary');
  console.log('='.repeat(60));
  console.log(`Event: ${analysis.eventInfo.name || 'Unknown'}`);
  console.log(`Date: ${analysis.eventInfo.startDate || 'Unknown'}`);
  console.log(`Location: ${analysis.eventInfo.location?.address?.streetAddress || 'Unknown'}`);
  console.log(`Potential Endpoints Found: ${analysis.potentialEndpoints.length}`);
  console.log(`JavaScript Data Calls: ${analysis.javascriptCode.length}`);
  console.log(`URLs Tested: ${potentialUrls.length}`);
  console.log(`Successful Responses: ${results.length}`);
  
  if (results.length > 0) {
    console.log('\n🎉 Found potential data sources!');
    results.forEach(result => {
      console.log(`  ${result.url} (${result.contentType})`);
    });
  }
  
  return outputData;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Deep RaceResult Analysis Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/deep-analyze-raceresult.js <RACERESULT_URL>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/deep-analyze-raceresult.js https://my.raceresult.com/321983/participants');
    console.log('');
    return;
  }
  
  const url = args[0];
  
  try {
    await deepAnalyzeRaceResult(url);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { deepAnalyzeRaceResult }; 