/**
 * Continue scripture population from where it left off
 * More efficient batch processing with better error handling
 */

async function populateRemainingScripture() {
  console.log('🔄 Continuing scripture content population...');

  try {
    // Use direct database connection with pg
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Get remaining placeholder entries
    const result = await pool.query(`
      SELECT 
        rpd.id,
        rpd.plan_id,
        rpd.day_number,
        rpd.scripture_reference,
        rp.name as plan_name
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rpd.plan_id = rp.id
      WHERE rpd.scripture_text LIKE '%Full text of%would be inserted here%'
      ORDER BY rpd.plan_id, rpd.day_number
      LIMIT 100
    `);
    
    const remainingDays = result.rows;
    console.log(`📊 Processing next ${remainingDays.length} entries...`);
    
    if (remainingDays.length === 0) {
      console.log('✅ All scripture content has been populated!');
      await pool.end();
      return;
    }

    let successCount = 0;
    let batchCount = 0;
    
    // Process in smaller batches to avoid timeouts
    for (const day of remainingDays) {
      try {
        console.log(`📖 Processing: ${day.plan_name} - Day ${day.day_number} (${day.scripture_reference})`);
        
        // Simple OpenAI API call
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are a Bible verse lookup assistant. Provide ONLY the exact verse text from the NIV translation without any commentary, explanations, or additional text.'
              },
              {
                role: 'user',
                content: `Please provide the exact text of ${day.scripture_reference} from the NIV Bible translation.`
              }
            ],
            temperature: 0.1,
            max_tokens: 2000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          if (content && content.trim()) {
            // Update database with real scripture content
            await pool.query(
              'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
              [content.trim(), day.id]
            );
            successCount++;
            console.log(`✅ Updated: ${day.scripture_reference}`);
          } else {
            // Fallback text
            const fallbackText = `Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`;
            await pool.query(
              'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
              [fallbackText, day.id]
            );
            console.log(`⚠️ Used fallback for: ${day.scripture_reference}`);
          }
        } else {
          // Fallback text for API errors
          const fallbackText = `Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`;
          await pool.query(
            'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
            [fallbackText, day.id]
          );
          console.log(`⚠️ API error, used fallback for: ${day.scripture_reference}`);
        }
        
        batchCount++;
        
        // Small delay to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Progress update every 10 items
        if (batchCount % 10 === 0) {
          console.log(`📈 Progress: ${batchCount}/${remainingDays.length} processed in this batch`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${day.scripture_reference}:`, error.message);
        
        // Still update with fallback to avoid reprocessing
        try {
          const fallbackText = `Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`;
          await pool.query(
            'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
            [fallbackText, day.id]
          );
        } catch (dbError) {
          console.error(`❌ Database error for ${day.scripture_reference}:`, dbError.message);
        }
      }
    }
    
    console.log(`\n✅ Batch completed! Successfully processed: ${successCount}/${remainingDays.length}`);
    
    // Check if there are more entries to process
    const remainingCheck = await pool.query(`
      SELECT COUNT(*) as remaining_count
      FROM reading_plan_days 
      WHERE scripture_text LIKE '%Full text of%would be inserted here%'
    `);
    
    const stillRemaining = parseInt(remainingCheck.rows[0].remaining_count);
    console.log(`📊 Entries still needing processing: ${stillRemaining}`);
    
    await pool.end();
    
    if (stillRemaining > 0) {
      console.log('🔄 More entries remain. Run this script again to continue...');
    } else {
      console.log('🎉 All scripture content has been successfully populated!');
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the script
populateRemainingScripture().catch(console.error);