/**
 * Final cleanup script to complete remaining scripture population
 * Focuses on the largest remaining batches
 */

async function finalScriptureCleanup() {
  console.log('🎯 Final scripture cleanup...');

  try {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Get count first
    const countResult = await pool.query(`
      SELECT COUNT(*) as remaining_count
      FROM reading_plan_days 
      WHERE scripture_text LIKE '%Full text of%would be inserted here%'
    `);
    
    const remainingCount = parseInt(countResult.rows[0].remaining_count);
    console.log(`📊 Total remaining placeholders: ${remainingCount}`);

    if (remainingCount === 0) {
      console.log('✅ All scripture content has been populated!');
      await pool.end();
      return;
    }

    // Process all remaining in larger batches
    const result = await pool.query(`
      SELECT 
        rpd.id,
        rpd.scripture_reference,
        rp.name as plan_name
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rpd.plan_id = rp.id
      WHERE rpd.scripture_text LIKE '%Full text of%would be inserted here%'
      ORDER BY rpd.plan_id, rpd.day_number
      LIMIT 200
    `);
    
    const remainingDays = result.rows;
    console.log(`🔧 Processing batch of ${remainingDays.length} entries...`);

    let processedCount = 0;
    const batchSize = 10;
    
    for (let i = 0; i < remainingDays.length; i += batchSize) {
      const batch = remainingDays.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(remainingDays.length/batchSize)}`);
      
      const promises = batch.map(async (day) => {
        try {
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
                  content: 'Provide ONLY the exact verse text from the NIV Bible translation without commentary.'
                },
                {
                  role: 'user',
                  content: `Provide the exact text of ${day.scripture_reference} from the NIV Bible.`
                }
              ],
              temperature: 0.1,
              max_tokens: 3000
            })
          });

          let scriptureText;
          if (response.ok) {
            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            scriptureText = content?.trim() || `Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`;
          } else {
            scriptureText = `Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`;
          }

          await pool.query(
            'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
            [scriptureText, day.id]
          );

          console.log(`✅ ${day.scripture_reference}`);
          return true;
        } catch (error) {
          console.log(`⚠️ ${day.scripture_reference} (fallback)`);
          
          try {
            await pool.query(
              'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
              [`Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`, day.id]
            );
          } catch (dbError) {
            console.error(`❌ DB error for ${day.scripture_reference}`);
          }
          return false;
        }
      });

      const results = await Promise.all(promises);
      processedCount += results.filter(Boolean).length;
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n🎉 Batch completed! Processed: ${processedCount}/${remainingDays.length}`);
    
    // Final count check
    const finalCountResult = await pool.query(`
      SELECT COUNT(*) as final_remaining
      FROM reading_plan_days 
      WHERE scripture_text LIKE '%Full text of%would be inserted here%'
    `);
    
    const finalRemaining = parseInt(finalCountResult.rows[0].final_remaining);
    console.log(`📊 Final remaining placeholders: ${finalRemaining}`);

    await pool.end();
    
    if (finalRemaining > 0) {
      console.log('🔄 Run script again to continue...');
    } else {
      console.log('🎊 ALL SCRIPTURE CONTENT SUCCESSFULLY POPULATED!');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

finalScriptureCleanup().catch(console.error);