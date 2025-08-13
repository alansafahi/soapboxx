#!/usr/bin/env node

// Fix all remaining missing scripture text in Torchbearer plans
// Fetch authentic scripture content from Bible API

import { Pool } from 'pg';
import fetch from 'node-fetch';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const BIBLE_API_BASE = 'https://bible-api.com';

async function fixMissingScripture() {
  const client = await pool.connect();
  
  try {
    console.log("🔧 Fixing ALL missing scripture text in Torchbearer plans...");
    
    // Get all days with missing scripture text
    const daysResult = await client.query(`
      SELECT rpd.id, rpd.day_number, rpd.title, rpd.scripture_reference, rp.name as plan_name
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rp.id = rpd.plan_id
      WHERE rp.subscription_tier = 'torchbearer' 
      AND rp.is_active = true
      AND (rpd.scripture_text IS NULL OR rpd.scripture_text = '' OR rpd.scripture_text = '...')
      ORDER BY rp.name, rpd.day_number
    `);
    
    const days = daysResult.rows;
    console.log(`\n📊 Found ${days.length} days with missing scripture text to fix`);
    
    if (days.length === 0) {
      console.log("✅ No missing scripture found - all Torchbearer plans are complete!");
      return;
    }
    
    let currentPlan = '';
    let fixedCount = 0;
    
    // Fix each day
    for (const day of days) {
      if (day.plan_name !== currentPlan) {
        currentPlan = day.plan_name;
        console.log(`\n📚 Fixing ${currentPlan}...`);
      }
      
      const scriptureText = await fetchScriptureText(day.scripture_reference);
      
      if (scriptureText) {
        await client.query(`
          UPDATE reading_plan_days 
          SET scripture_text = $1
          WHERE id = $2
        `, [scriptureText, day.id]);
        
        console.log(`   ✅ Day ${day.day_number}: ${day.scripture_reference}`);
        fixedCount++;
      } else {
        console.log(`   ⚠️  Day ${day.day_number}: Could not fetch ${day.scripture_reference}`);
      }
      
      // Rate limiting to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    
    // Final verification
    const remainingResult = await client.query(`
      SELECT COUNT(*) as remaining_missing
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rp.id = rpd.plan_id
      WHERE rp.subscription_tier = 'torchbearer' 
      AND rp.is_active = true
      AND (rpd.scripture_text IS NULL OR rpd.scripture_text = '' OR rpd.scripture_text = '...')
    `);
    
    const remainingMissing = remainingResult.rows[0].remaining_missing;
    
    console.log(`\n📈 Scripture Fix Results:`);
    console.log(`   • Total days processed: ${days.length}`);
    console.log(`   • Successfully fixed: ${fixedCount}`);
    console.log(`   • Remaining missing: ${remainingMissing}`);
    
    if (remainingMissing === 0) {
      console.log("\n🎉 SUCCESS: All Torchbearer plans now have complete scripture text!");
    } else {
      console.log(`\n⚠️  ${remainingMissing} days still need manual attention`);
    }
    
  } catch (error) {
    console.error("❌ Error fixing missing scripture:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function fetchScriptureText(reference) {
  try {
    console.log(`     📖 Fetching ${reference}...`);
    const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=kjv`, {
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.text && data.text.trim()) {
        return data.text.trim();
      }
    } else {
      console.warn(`     ⚠️  API returned ${response.status} for ${reference}`);
    }
  } catch (error) {
    console.warn(`     ⚠️  Failed to fetch ${reference}: ${error.message}`);
  }
  return null;
}

// Execute the fix
fixMissingScripture()
  .then(() => {
    console.log("\n✨ Scripture fixing process complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to fix missing scripture:", error);
    process.exit(1);
  });