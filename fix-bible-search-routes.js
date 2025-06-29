#!/usr/bin/env node

/**
 * Clean up duplicate Bible search endpoints in routes.ts
 * Keep only the three-tier system endpoint
 */

import fs from 'fs';

const ROUTES_FILE = './server/routes.ts';

console.log('🧹 Cleaning up duplicate Bible search endpoints...');

// Read the routes file
let content = fs.readFileSync(ROUTES_FILE, 'utf8');

// Remove the first duplicate endpoint (around line 286)
const firstEndpointRegex = /\/\/ Public Bible verse search\s*app\.get\('\/api\/bible\/search'[^}]+}\s*\);\s*}\s*catch[^}]+}\s*}\s*\);\s*}/s;
if (firstEndpointRegex.test(content)) {
  content = content.replace(firstEndpointRegex, '  // REMOVED: First duplicate Bible search endpoint');
  console.log('✅ Removed first duplicate Bible search endpoint');
}

// Remove the second duplicate endpoint (around line 481)
const secondEndpointRegex = /\/\/ Public Bible verse search \(POST-AUTH OVERRIDE\)\s*app\.get\('\/api\/bible\/search'[^}]+}\s*\);\s*}\s*catch[^}]+}\s*}\s*\);\s*}/s;
if (secondEndpointRegex.test(content)) {
  content = content.replace(secondEndpointRegex, '  // REMOVED: Second duplicate Bible search endpoint');
  console.log('✅ Removed second duplicate Bible search endpoint');
}

// Remove the third duplicate endpoint (around line 2857)
const thirdEndpointRegex = /\/\/ Public Bible verse search across all translations\s*app\.get\('\/api\/bible\/search'[^}]+}\s*\);\s*}\s*catch[^}]+}\s*}\s*\);\s*}/s;
if (thirdEndpointRegex.test(content)) {
  content = content.replace(thirdEndpointRegex, '  // REMOVED: Third duplicate Bible search endpoint');
  console.log('✅ Removed third duplicate Bible search endpoint');
}

// Write the cleaned content back
fs.writeFileSync(ROUTES_FILE, content);

console.log('🎉 Bible search endpoints cleanup complete!');
console.log('📝 Only the three-tier system endpoint remains');