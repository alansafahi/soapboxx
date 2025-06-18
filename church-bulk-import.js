/**
 * Church Bulk Import System
 * Imports real churches from CSV and sets up claiming functionality
 */

import { db } from './server/db.ts';
import { churches } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Parse CSV line handling quoted fields and commas
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i-1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

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
 * Clean and validate church data
 */
function cleanChurchData(data) {
  return {
    name: data.name?.trim() || '',
    city: data.city?.trim() || '',
    state: data.state?.trim() || '',
    country: data.country?.trim() || 'United States',
    phone: data.phone?.trim() === '-' ? null : data.phone?.trim(),
    email: data.email?.trim() === '-' ? null : data.email?.trim(),
    website: data.website?.trim() === '-' ? null : data.website?.trim(),
    adminEmail: data.adminEmail?.trim() || null,
    adminName: data.adminName?.trim() || '',
    adminTitle: data.adminTitle?.trim() || 'Pastor'
  };
}

/**
 * Remove all demo churches from database
 */
async function removeDemoChurches() {
  console.log('Removing demo churches...');
  
  try {
    // Find demo churches (typically have generic names or test data)
    const demoPatterns = [
      'Demo Church',
      'Test Church', 
      'Sample Church',
      'Victory Christian',
      'Grace Community',
      'First Baptist'
    ];
    
    let totalRemoved = 0;
    
    for (const pattern of demoPatterns) {
      const result = await db.delete(churches)
        .where(eq(churches.name, pattern));
      console.log(`Removed ${result.count || 0} churches matching "${pattern}"`);
      totalRemoved += result.count || 0;
    }
    
    console.log(`Total demo churches removed: ${totalRemoved}`);
    return totalRemoved;
    
  } catch (error) {
    console.error('Error removing demo churches:', error);
    throw error;
  }
}

/**
 * Import churches from CSV file
 */
async function importChurchesFromCSV(csvFilePath) {
  console.log(`Starting church import from ${csvFilePath}...`);
  
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have header and at least one data row');
    }
    
    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);
    
    const churches_to_import = [];
    let skipped = 0;
    
    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      if (values.length < headers.length) {
        console.log(`Skipping incomplete row ${i + 1}`);
        skipped++;
        continue;
      }
      
      // Map CSV columns to church data
      const rawData = {
        name: values[0] || '',
        city: values[1] || '',
        state: values[2] || '',
        country: values[3] || 'United States',
        phone: values[4] || null,
        email: values[5] || null,
        website: values[6] || null,
        adminTitle: values[7] || 'Pastor',
        adminName: values[8] || ''
      };
      
      // Clean and validate data
      const cleanData = cleanChurchData(rawData);
      
      // Skip if missing required fields
      if (!cleanData.name || !cleanData.city || !cleanData.state) {
        console.log(`Skipping row ${i + 1}: Missing required fields`);
        skipped++;
        continue;
      }
      
      // Create church record
      const churchRecord = {
        name: cleanData.name,
        city: cleanData.city,
        state: cleanData.state,
        phone: cleanData.phone,
        email: cleanData.email,
        website: cleanData.website,
        address: `${cleanData.city}, ${cleanData.state}`,
        description: `Welcome to ${cleanData.name} located in ${cleanData.city}, ${cleanData.state}. Contact us to learn more about our community.`,
        isActive: true,
        isClaimed: false,
        adminEmail: cleanData.email, // Store admin email for claiming
        memberCount: 0,
        rating: 0,
        denomination: extractDenomination(cleanData.name)
      };
      
      churches_to_import.push(churchRecord);
    }
    
    console.log(`Processed ${lines.length - 1} rows, ${churches_to_import.length} valid churches, ${skipped} skipped`);
    
    // Batch insert churches
    if (churches_to_import.length > 0) {
      console.log('Inserting churches into database...');
      
      // Insert in batches of 100 for better performance
      const batchSize = 100;
      let totalInserted = 0;
      
      for (let i = 0; i < churches_to_import.length; i += batchSize) {
        const batch = churches_to_import.slice(i, i + batchSize);
        
        try {
          const result = await db.insert(churches).values(batch).returning({ id: churches.id });
          totalInserted += result.length;
          console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${result.length} churches`);
        } catch (error) {
          console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
          // Continue with next batch
        }
      }
      
      console.log(`Successfully imported ${totalInserted} churches`);
      return totalInserted;
    }
    
    return 0;
    
  } catch (error) {
    console.error('Error importing churches:', error);
    throw error;
  }
}

/**
 * Main import function
 */
async function runChurchImport() {
  console.log('=== Church Bulk Import System ===');
  
  try {
    // Step 1: Remove demo churches
    await removeDemoChurches();
    
    // Step 2: Import real churches from CSV
    const csvPath = './attached_assets/Church Prospects_1750204903166.csv';
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found: ${csvPath}`);
    }
    
    const importedCount = await importChurchesFromCSV(csvPath);
    
    console.log('\n=== Import Summary ===');
    console.log(`Churches imported: ${importedCount}`);
    console.log('All churches are marked as unclaimed and ready for admin claiming');
    console.log('Church admins can claim their churches by registering with their designated email');
    
    return {
      success: true,
      imported: importedCount,
      message: 'Church import completed successfully'
    };
    
  } catch (error) {
    console.error('Church import failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in API routes
export { runChurchImport, removeDemoChurches, importChurchesFromCSV };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runChurchImport()
    .then(result => {
      console.log('Final result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}