/**
 * Update Church Denominations Script
 * Updates existing churches with correct denominations based on church names
 */

import { db } from './server/db.ts';
import { churches } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

/**
 * Extract denomination from church name
 */
function extractDenomination(churchName) {
  const name = churchName.toLowerCase();
  
  // Denomination keywords mapping
  const denominations = {
    'presbyterian': ['presbyterian', 'pca', 'pcusa'],
    'baptist': ['baptist', 'southern baptist', 'first baptist', 'missionary baptist'],
    'methodist': ['methodist', 'united methodist', 'wesleyan'],
    'lutheran': ['lutheran', 'elca', 'lcms'],
    'episcopal': ['episcopal', 'anglican'],
    'catholic': ['catholic', 'roman catholic', 'st.', 'saint', 'our lady', 'sacred heart'],
    'pentecostal': ['pentecostal', 'assembly of god', 'foursquare', 'apostolic'],
    'reformed': ['reformed', 'christian reformed'],
    'evangelical': ['evangelical', 'evangelical free', 'evangelical covenant'],
    'congregational': ['congregational', 'united church of christ', 'ucc'],
    'adventist': ['adventist', 'seventh-day adventist'],
    'nazarene': ['nazarene', 'church of the nazarene'],
    'christian': ['christian church', 'disciples of christ', 'church of christ'],
    'community': ['community church', 'community', 'non-denominational', 'fellowship'],
    'calvary': ['calvary chapel', 'calvary church'],
    'bible': ['bible church', 'bible fellowship']
  };
  
  // Check for specific denomination keywords
  for (const [denomination, keywords] of Object.entries(denominations)) {
    for (const keyword of keywords) {
      if (name.includes(keyword)) {
        return denomination.charAt(0).toUpperCase() + denomination.slice(1);
      }
    }
  }
  
  // Check for generic church types
  if (name.includes('new life') || name.includes('grace') || name.includes('faith')) {
    return 'Community';
  }
  
  // Default fallback
  return 'Non-denominational';
}

/**
 * Update all church denominations
 */
async function updateChurchDenominations() {
  console.log('Starting church denomination updates...');
  
  try {
    // Get all churches
    const allChurches = await db.select().from(churches);
    console.log(`Found ${allChurches.length} churches to update`);
    
    let updated = 0;
    let denominationCounts = {};
    
    // Update each church with correct denomination
    for (const church of allChurches) {
      const correctDenomination = extractDenomination(church.name);
      
      // Track denomination counts
      denominationCounts[correctDenomination] = (denominationCounts[correctDenomination] || 0) + 1;
      
      // Update if denomination has changed
      if (church.denomination !== correctDenomination) {
        await db
          .update(churches)
          .set({ denomination: correctDenomination })
          .where(eq(churches.id, church.id));
        
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`Updated ${updated} churches so far...`);
        }
      }
    }
    
    console.log(`\nUpdate complete! Updated ${updated} churches.`);
    console.log('\nDenomination distribution:');
    
    // Sort denominations by count
    const sortedDenominations = Object.entries(denominationCounts)
      .sort(([,a], [,b]) => b - a);
    
    for (const [denomination, count] of sortedDenominations) {
      console.log(`  ${denomination}: ${count} churches`);
    }
    
    return { updated, denominationCounts };
    
  } catch (error) {
    console.error('Error updating church denominations:', error);
    throw error;
  }
}

/**
 * Test denomination detection with sample names
 */
function testDenominationDetection() {
  console.log('\nTesting denomination detection:');
  
  const testNames = [
    'Woodgreen Presbyterian Church',
    'First Baptist Church',
    'St. Matthews Episcopal Church', 
    'Sacred Heart Catholic Church',
    'Grace Community Church',
    'New Life Baptist Church',
    'Hillside Methodist Church',
    'Christ the King Lutheran Church',
    'Calvary Chapel',
    'Faith Bible Church',
    'Community Fellowship Church'
  ];
  
  for (const name of testNames) {
    const denomination = extractDenomination(name);
    console.log(`  "${name}" → ${denomination}`);
  }
}

// Run the update
async function main() {
  try {
    // Test denomination detection first
    testDenominationDetection();
    
    // Update all church denominations
    const result = await updateChurchDenominations();
    
    console.log('\nDenomination update completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Failed to update denominations:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { updateChurchDenominations, extractDenomination };