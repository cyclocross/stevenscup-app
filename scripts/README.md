# Registration Import Scripts

This directory contains scripts for experimenting with and testing registration data imports from external websites.

## Scripts Overview

### 1. `test-registration-import.js` - Main Import Script

The main script for testing registration imports. It fetches HTML content from URLs, converts it to markdown using turndown, and analyzes the content for potential registration data.

**Features:**
- 🌐 Fetches HTML content from external URLs
- 🔄 Converts HTML to clean markdown using turndown
- 🔍 Analyzes content for potential registration data patterns
- 💾 Saves HTML, markdown, and extracted data to files
- 📊 Provides detailed analysis and summary

**Usage:**
```bash
# Basic usage
node scripts/test-registration-import.js <URL>

# With custom filename
node scripts/test-registration-import.js <URL> --filename my_event

# Examples
node scripts/test-registration-import.js https://example.com/register
node scripts/test-registration-import.js https://example.com/participants --filename round1
```

**Output:**
Files are saved to the `import_experiments/` directory:
- `{filename}_{timestamp}.html` - Raw HTML content
- `{filename}_{timestamp}.md` - Converted markdown
- `{filename}_{timestamp}_data.json` - Extracted data analysis

### 2. `test-import-demo.js` - Demo Script

A simple demo script that shows how to use the import functions programmatically.

**Usage:**
```bash
node scripts/test-import-demo.js
```

## How It Works

### 1. HTML Fetching
- Uses `node-fetch` to retrieve HTML content
- Includes realistic User-Agent headers
- Handles HTTP errors and timeouts

### 2. HTML to Markdown Conversion
- Uses `turndown` library for conversion
- Custom rules for better table handling
- Preserves structure and formatting

### 3. Data Analysis
The script looks for common patterns in registration data:
- **Tables**: Participant lists, results tables
- **Forms**: Registration forms, input fields
- **Links**: External references, downloads
- **Patterns**: Birth years, names, club names, bib numbers

### 4. File Output
- Creates timestamped files for analysis
- Organized output directory structure
- JSON format for extracted data

## Example Output

```
🚀 Starting Registration Import Experiment
============================================================
🌐 Fetching content from: https://example.com/register
✅ Successfully fetched 15420 characters
🔄 Converting HTML to markdown...
✅ Converted to 8234 characters of markdown
🔍 Analyzing markdown for registration data...
📊 Found 45 potential table rows
📝 Found 12 potential form elements
🔗 Found 8 links
💾 Saved HTML to: import_experiments/registration_import_2024-01-15T10-30-45-123Z.html
💾 Saved markdown to: import_experiments/registration_import_2024-01-15T10-30-45-123Z.md
💾 Saved extracted data to: import_experiments/registration_import_2024-01-15T10-30-45-123Z_data.json

📋 Import Experiment Summary
============================================================
URL: https://example.com/register
HTML Size: 15420 characters
Markdown Size: 8234 characters
Tables Found: 45
Forms Found: 12
Links Found: 8

🔍 Potential Data Patterns:
  birthYear: 23 matches
  name: 45 matches
  club: 12 matches
  bibNumber: 45 matches

💡 Next Steps:
1. Review the generated files for data structure
2. Identify patterns in the extracted data
3. Create parsing rules for specific data types
4. Implement data transformation logic
```

## Next Steps for Implementation

1. **Review Generated Files**: Examine the HTML, markdown, and JSON files to understand the data structure
2. **Identify Patterns**: Look for consistent formatting in participant data
3. **Create Parsers**: Build specific parsing rules for different data types
4. **Data Transformation**: Convert extracted data to your application's format
5. **Integration**: Connect the parsing logic to your event import system

## Dependencies

- `turndown` - HTML to markdown conversion
- `dotenv` - Environment variable loading
- Built-in `fetch` API (Node.js 18+)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Some websites block external requests
2. **JavaScript Content**: Dynamic content may not be captured
3. **Authentication**: Some sites require login
4. **Rate Limiting**: Some sites limit request frequency

### Solutions

- Use realistic User-Agent headers
- Check if the site has an API
- Consider using a headless browser for JavaScript-heavy sites
- Implement request delays for rate-limited sites

## Future Enhancements

- [ ] Support for JavaScript-rendered content
- [ ] Authentication handling
- [ ] Rate limiting and retry logic
- [ ] More sophisticated data pattern recognition
- [ ] Integration with database import functions
- [ ] Webhook support for automatic imports 