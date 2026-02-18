const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = path.join(__dirname, 'biermarket_bierliste.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Parse CSV (semicolon-separated)
const beers = [];
let currentCountry = '';

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Skip empty lines
  if (!line) continue;
  
  // Track country headers
  if (line.startsWith('===')) {
    currentCountry = line.replace(/=/g, '').trim();
    continue;
  }
  
  // Parse beer entry
  const parts = line.split(';');
  if (parts.length >= 4 && parts[0].match(/^\d+$/)) {
    beers.push({
      nr: parts[0],
      name: parts[1].trim(),
      brewery: parts[2].trim(),
      country: currentCountry,
      category: parts[9]?.trim() || ''
    });
  }
}

// Now read beer-domains.ts and extract mappings
const domainsPath = path.join(__dirname, 'src', 'lib', 'beer-domains.ts');
const domainsContent = fs.readFileSync(domainsPath, 'utf-8');

// Extract breweryMap
const breweryMapMatch = domainsContent.match(/const breweryMap: Record<string, string> = \{([\s\S]*?)\};/);
const breweryMapContent = breweryMapMatch ? breweryMapMatch[1] : '';
const breweryEntries = {};
const breweryRegex = /^\s*"([^"]+)":\s*"([^"]+)"/gm;
let match;
while ((match = breweryRegex.exec(breweryMapContent)) !== null) {
  breweryEntries[match[1].toLowerCase()] = match[2];
}

// Extract brandMap
const brandMapMatch = domainsContent.match(/const brandMap: Record<string, string> = \{([\s\S]*?)\};/);
const brandMapContent = brandMapMatch ? brandMapMatch[1] : '';
const brandEntries = {};
const brandRegex = /^\s*"([^"]+)":\s*"([^"]+)"/gm;
while ((match = brandRegex.exec(brandMapContent)) !== null) {
  brandEntries[match[1].toLowerCase()] = match[2];
}

console.log(`Total breweries in map: ${Object.keys(breweryEntries).length}`);
console.log(`Total brands in map: ${Object.keys(brandEntries).length}`);
console.log(`Total beers in CSV: ${beers.length}\n`);

// Analyze missing logos
const missing = [];
const byCountry = {};

for (const beer of beers) {
  const normalizedBeer = beer.name.toLowerCase().trim();
  const normalizedBrewery = beer.brewery.toLowerCase().trim();
  
  let hasDomain = false;
  
  // Check brand map first
  if (brandEntries[normalizedBeer]) {
    hasDomain = true;
  }
  // Then check brewery map
  else if (normalizedBrewery !== '-' && breweryEntries[normalizedBrewery]) {
    hasDomain = true;
  }
  
  if (!hasDomain) {
    missing.push({
      nr: beer.nr,
      name: beer.name,
      brewery: beer.brewery,
      country: beer.country,
      category: beer.category
    });
    
    if (!byCountry[beer.country]) {
      byCountry[beer.country] = [];
    }
    byCountry[beer.country].push(beer);
  }
}

// Sort countries
const countries = Object.keys(byCountry).sort();

console.log(`===== MISSING LOGO REPORT =====\n`);
console.log(`TOTAL BEERS WITHOUT LOGO DOMAIN: ${missing.length} (${((missing.length/beers.length)*100).toFixed(1)}%)\n`);

for (const country of countries) {
  const countryBeers = byCountry[country];
  console.log(`\n${country} (${countryBeers.length} beers):`);
  console.log('-'.repeat(80));
  
  for (const beer of countryBeers) {
    console.log(`  • ${beer.name} | ${beer.brewery} | ${beer.category}`);
  }
}

// Write JSON report for further processing
const report = {
  timestamp: new Date().toISOString(),
  totalBeers: beers.length,
  totalMissing: missing.length,
  percentageMissing: ((missing.length/beers.length)*100).toFixed(1),
  byCountry: byCountry,
  breweryMapSize: Object.keys(breweryEntries).length,
  brandMapSize: Object.keys(brandEntries).length
};

fs.writeFileSync(
  path.join(__dirname, 'missing_logos_report.json'),
  JSON.stringify(report, null, 2),
  'utf-8'
);

console.log(`\n\nReport saved to: missing_logos_report.json`);
