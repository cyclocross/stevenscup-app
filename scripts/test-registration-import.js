#!/usr/bin/env node

/**
 * Registration Import Experiment Script
 * 
 * This script helps experiment with importing registration data from external URLs.
 * It fetches HTML content, converts it to markdown using turndown, and provides
 * various parsing and analysis tools.
 */

const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configure turndown for better markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
  strongDelimiter: '**',
});

// Add custom rules for better parsing
turndownService.addRule('tables', {
  filter: 'table',
  replacement: function (content, node) {
    const rows = Array.from(node.querySelectorAll('tr'));
    if (rows.length === 0) return '';
    
    let markdown = '\n';
    
    rows.forEach((row, index) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      if (cells.length === 0) return;
      
      const cellContent = cells.map(cell => {
        const text = cell.textContent?.trim() || '';
        return text.replace(/\|/g, '\\|'); // Escape pipe characters
      });
      
      markdown += '| ' + cellContent.join(' | ') + ' |\n';
      
      // Add header separator after first row
      if (index === 0) {
        markdown += '| ' + cellContent.map(() => '---').join(' | ') + ' |\n';
      }
    });
    
    return markdown;
  }
});

/**
 * Fetch HTML content from a URL
 */
async function fetchHtml(url) {
  try {
    console.log(`🌐 Fetching content from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`✅ Successfully fetched ${html.length} characters`);
    
    return html;
  } catch (error) {
    console.error(`❌ Error fetching URL: ${error.message}`);
    return null;
  }
}

/**
 * Convert HTML to markdown
 */
function htmlToMarkdown(html) {
  try {
    console.log('🔄 Converting HTML to markdown...');
    
    const markdown = turndownService.turndown(html);
    
    console.log(`✅ Converted to ${markdown.length} characters of markdown`);
    return markdown;
  } catch (error) {
    console.error(`❌ Error converting HTML to markdown: ${error.message}`);
    return null;
  }
}

/**
 * Extract potential registration data from markdown
 */
function extractRegistrationData(markdown) {
  console.log('🔍 Analyzing markdown for registration data...');
  
  const data = {
    participants: [],
    tables: [],
    forms: [],
    links: [],
    potentialData: [],
    debug: {
      contentPreview: markdown.substring(0, 500) + '...',
      totalLength: markdown.length,
      lineCount: markdown.split('\n').length
    }
  };
  
  // Look for table structures
  const tableMatches = markdown.match(/\|.*\|/g);
  if (tableMatches) {
    data.tables = tableMatches;
    console.log(`📊 Found ${tableMatches.length} potential table rows`);
  }
  
  // Look for form-like structures
  const formMatches = markdown.match(/\[.*?\]\(.*?\)/g);
  if (formMatches) {
    data.forms = formMatches;
    console.log(`📝 Found ${formMatches.length} potential form elements`);
  }
  
  // Look for links
  const linkMatches = markdown.match(/https?:\/\/[^\s\)]+/g);
  if (linkMatches) {
    data.links = linkMatches;
    console.log(`🔗 Found ${linkMatches.length} links`);
  }
  
  // Look for potential participant data patterns
  const participantPatterns = [
    /\b\d{4}\b/g, // Birth years
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Names
    /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g, // Club names
    /\b\d{1,3}\b/g, // Bib numbers
  ];
  
  participantPatterns.forEach((pattern, index) => {
    const matches = markdown.match(pattern);
    if (matches) {
      data.potentialData.push({
        type: ['birthYear', 'name', 'club', 'bibNumber'][index] || 'unknown',
        matches: matches.slice(0, 10) // Limit to first 10 matches
      });
    }
  });
  
  // Look for JSON-LD structured data (common in modern sites)
  const jsonLdMatches = markdown.match(/\{[^{}]*"@type"[^{}]*\}/g);
  if (jsonLdMatches) {
    data.jsonLd = jsonLdMatches;
    console.log(`📋 Found ${jsonLdMatches.length} potential JSON-LD structures`);
  }
  
  // Look for script tags or JavaScript content
  const scriptMatches = markdown.match(/script[^}]*/gi);
  if (scriptMatches) {
    data.scripts = scriptMatches;
    console.log(`📜 Found ${scriptMatches.length} potential script references`);
  }
  
  return data;
}

/**
 * Analyze HTML for potential data endpoints
 */
function analyzeForDataEndpoints(html) {
  console.log('🔍 Analyzing HTML for data endpoints...');
  
  const endpoints = {
    apiUrls: [],
    dataUrls: [],
    ajaxCalls: [],
    jsonData: []
  };
  
  // Look for API endpoints
  const apiMatches = html.match(/https?:\/\/[^"'\s]+(?:api|data|json|xml)[^"'\s]*/gi);
  if (apiMatches) {
    endpoints.apiUrls = apiMatches;
    console.log(`🔌 Found ${apiMatches.length} potential API endpoints`);
  }
  
  // Look for AJAX calls or fetch requests
  const ajaxMatches = html.match(/(?:fetch|ajax|xmlhttprequest|\.get|\.post)\s*\(\s*['"`]([^'"`]+)['"`]/gi);
  if (ajaxMatches) {
    endpoints.ajaxCalls = ajaxMatches;
    console.log(`📡 Found ${ajaxMatches.length} potential AJAX calls`);
  }
  
  // Look for JSON data embedded in HTML
  const jsonMatches = html.match(/\{[^{}]*"participants?"[^{}]*\}/gi);
  if (jsonMatches) {
    endpoints.jsonData = jsonMatches;
    console.log(`📄 Found ${jsonMatches.length} potential JSON data blocks`);
  }
  
  // Look for data attributes
  const dataAttrMatches = html.match(/data-[^=]+="[^"]*"/gi);
  if (dataAttrMatches) {
    console.log(`📊 Found ${dataAttrMatches.length} data attributes`);
  }
  
  return endpoints;
}

/**
 * Save content to files for analysis
 */
function saveToFiles(html, markdown, extractedData, baseFilename) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  try {
    // Create output directory if it doesn't exist
    const outputDir = 'import_experiments';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Save HTML
    const htmlFile = path.join(outputDir, `${baseFilename}_${timestamp}.html`);
    fs.writeFileSync(htmlFile, html);
    console.log(`💾 Saved HTML to: ${htmlFile}`);
    
    // Save markdown
    const mdFile = path.join(outputDir, `${baseFilename}_${timestamp}.md`);
    fs.writeFileSync(mdFile, markdown);
    console.log(`💾 Saved markdown to: ${mdFile}`);
    
    // Save extracted data as JSON
    const jsonFile = path.join(outputDir, `${baseFilename}_${timestamp}_data.json`);
    fs.writeFileSync(jsonFile, JSON.stringify(extractedData, null, 2));
    console.log(`💾 Saved extracted data to: ${jsonFile}`);
    
  } catch (error) {
    console.error(`❌ Error saving files: ${error.message}`);
  }
}

/**
 * Main function to run the import experiment
 */
async function runImportExperiment(url, options = {}) {
  console.log('🚀 Starting Registration Import Experiment\n');
  console.log('='.repeat(60));
  
  // Fetch HTML content
  const html = await fetchHtml(url);
  if (!html) {
    console.log('❌ Cannot continue without HTML content');
    return;
  }
  
  // Convert to markdown
  const markdown = htmlToMarkdown(html);
  if (!markdown) {
    console.log('❌ Cannot continue without markdown content');
    return;
  }
  
  // Extract potential registration data
  const extractedData = extractRegistrationData(markdown);
  
  // Analyze HTML for data endpoints
  const dataEndpoints = analyzeForDataEndpoints(html);
  
  // Combine the data
  const combinedData = {
    ...extractedData,
    dataEndpoints
  };
  
  // Save everything to files
  const baseFilename = options.filename || 'registration_import';
  saveToFiles(html, markdown, combinedData, baseFilename);
  
  // Display summary
  console.log('\n📋 Import Experiment Summary');
  console.log('='.repeat(60));
  console.log(`URL: ${url}`);
  console.log(`HTML Size: ${html.length} characters`);
  console.log(`Markdown Size: ${markdown.length} characters`);
  console.log(`Tables Found: ${extractedData.tables.length}`);
  console.log(`Forms Found: ${extractedData.forms.length}`);
  console.log(`Links Found: ${extractedData.links.length}`);
  
  if (extractedData.potentialData.length > 0) {
    console.log('\n🔍 Potential Data Patterns:');
    extractedData.potentialData.forEach(item => {
      console.log(`  ${item.type}: ${item.matches.length} matches`);
    });
  }
  
  if (dataEndpoints.apiUrls.length > 0) {
    console.log('\n🔌 Potential Data Endpoints:');
    dataEndpoints.apiUrls.forEach(endpoint => {
      console.log(`  ${endpoint}`);
    });
  }
  
  if (dataEndpoints.jsonData.length > 0) {
    console.log(`\n📄 JSON Data Blocks: ${dataEndpoints.jsonData.length}`);
  }
  
  console.log('\n💡 Next Steps:');
  console.log('1. Review the generated files for data structure');
  console.log('2. Check for API endpoints or data URLs');
  console.log('3. Identify patterns in the extracted data');
  console.log('4. Create parsing rules for specific data types');
  console.log('5. Implement data transformation logic');
  
  return { html, markdown, extractedData };
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Registration Import Experiment Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/test-registration-import.js <URL> [options]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/test-registration-import.js https://example.com/register');
    console.log('  node scripts/test-registration-import.js https://example.com/register --filename my_event');
    console.log('');
    console.log('Options:');
    console.log('  --filename <name>  Base filename for output files');
    console.log('');
    console.log('Output:');
    console.log('  Files will be saved to the "import_experiments" directory');
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
    await runImportExperiment(url, options);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = { runImportExperiment, fetchHtml, htmlToMarkdown, extractRegistrationData }; 