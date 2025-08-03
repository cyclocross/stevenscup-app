#!/usr/bin/env node

/**
 * Demo script for testing registration import functionality
 * This script demonstrates how to use the import functions
 */

const { runImportExperiment } = require('./test-registration-import.js');

async function runDemo() {
  console.log('🎯 Registration Import Demo\n');
  
  // Example URLs to test (replace with actual registration URLs)
  const testUrls = [
    'https://example.com/register',
    'https://example.com/participants',
    'https://example.com/startlist'
  ];
  
  console.log('Available test URLs:');
  testUrls.forEach((url, index) => {
    console.log(`  ${index + 1}. ${url}`);
  });
  
  console.log('\nTo test with a real URL, run:');
  console.log('  node scripts/test-registration-import.js <YOUR_URL>');
  console.log('\nExample:');
  console.log('  node scripts/test-registration-import.js https://your-event-site.com/register --filename my_event');
  
  // You can uncomment the following lines to test with a real URL
  /*
  try {
    const result = await runImportExperiment('https://your-actual-url.com', {
      filename: 'demo_test'
    });
    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
  */
}

// Run the demo
runDemo(); 