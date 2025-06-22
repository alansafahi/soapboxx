/**
 * Count Placeholder Verses in Scripture Database
 * Simple script to count remaining placeholder verses
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function countPlaceholders() {
  console.log('🔍 Counting placeholder verses in scripture database...');
  
  try {
    // Count all placeholder patterns
    const placeholderQuery = `
      SELECT COUNT(*) as total_placeholders
      FROM bible_verses 
      WHERE text LIKE '%Scripture according to%'
         OR text LIKE '%GOD''s Word according to%'  
         OR text LIKE '%GOD''s Message according to%'
         OR text LIKE '%Jesus said to them as recorded in%'
         OR text LIKE '%In those days it happened as recorded in%'
         OR text LIKE '%The LORD spoke as written in%'
         OR text LIKE '%As it is written in%'
         OR length(text) < 20
    `;
    
    const result = await pool.query(placeholderQuery);
    const totalPlaceholders = result.rows[0].total_placeholders;
    
    console.log('📊 Total placeholder verses found:', totalPlaceholders);
    
    // Break down by pattern type
    const patterns = [
      'Scripture according to',
      'GOD\'s Word according to',
      'In those days it happened as recorded in',
      'Jesus said to them as recorded in',
      'The LORD spoke as written in',
      'As it is written in'
    ];
    
    console.log('\n📋 Breakdown by pattern:');
    for (const pattern of patterns) {
      const patternQuery = `SELECT COUNT(*) as count FROM bible_verses WHERE text LIKE '%${pattern}%'`;
      const patternResult = await pool.query(patternQuery);
      console.log(`   ${pattern}: ${patternResult.rows[0].count} verses`);
    }
    
    // Count very short verses (likely incomplete)
    const shortQuery = `SELECT COUNT(*) as count FROM bible_verses WHERE length(text) < 20`;
    const shortResult = await pool.query(shortQuery);
    console.log(`   Very short verses (< 20 chars): ${shortResult.rows[0].count}`);
    
    // Total verses in database
    const totalQuery = `SELECT COUNT(*) as total FROM bible_verses`;
    const totalResult = await pool.query(totalQuery);
    const totalVerses = totalResult.rows[0].total;
    
    console.log(`\n📈 Database statistics:`);
    console.log(`   Total verses: ${totalVerses}`);
    console.log(`   Placeholder verses: ${totalPlaceholders}`);
    console.log(`   Authentic verses: ${totalVerses - totalPlaceholders}`);
    console.log(`   Completion rate: ${((totalVerses - totalPlaceholders) / totalVerses * 100).toFixed(2)}%`);
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

countPlaceholders();