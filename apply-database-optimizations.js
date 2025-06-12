import { Pool } from '@neondatabase/serverless';
import fs from 'fs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function applyDatabaseOptimizations() {
  console.log('🔧 Applying database performance optimizations...');
  
  try {
    // Read optimization SQL file
    const optimizationSQL = fs.readFileSync('database-optimization.sql', 'utf8');
    
    // Split into individual statements
    const statements = optimizationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📊 Executing ${statements.length} optimization statements...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        successCount++;
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        errorCount++;
        console.log(`⚠️ Warning: ${statement.substring(0, 50)}... - ${error.message}`);
      }
    }
    
    console.log(`\n📈 Optimization Results:`);
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ⚠️ Warnings: ${errorCount}`);
    
    // Test query performance
    await testQueryPerformance();
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
  } finally {
    await pool.end();
  }
}

async function testQueryPerformance() {
  console.log('\n🏃 Testing query performance...');
  
  const testQueries = [
    {
      name: 'User lookup by email',
      query: 'SELECT * FROM users WHERE email = $1 LIMIT 1',
      params: ['test@example.com']
    },
    {
      name: 'Recent check-ins',
      query: 'SELECT * FROM checkins WHERE user_id = $1 ORDER BY date DESC LIMIT 10',
      params: ['4771822']
    },
    {
      name: 'Church events',
      query: 'SELECT * FROM events WHERE church_id = $1 AND date >= CURRENT_DATE ORDER BY date ASC LIMIT 20',
      params: [1]
    },
    {
      name: 'Prayer requests feed',
      query: 'SELECT * FROM prayer_requests WHERE church_id = $1 ORDER BY created_at DESC LIMIT 15',
      params: [1]
    }
  ];
  
  for (const test of testQueries) {
    const startTime = performance.now();
    try {
      const result = await pool.query(test.query, test.params);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      console.log(`  📊 ${test.name}: ${duration}ms (${result.rows.length} rows)`);
    } catch (error) {
      console.log(`  ❌ ${test.name}: Failed - ${error.message}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  applyDatabaseOptimizations()
    .then(() => {
      console.log('\n🎉 Database optimization complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Optimization failed:', error);
      process.exit(1);
    });
}

export default applyDatabaseOptimizations;