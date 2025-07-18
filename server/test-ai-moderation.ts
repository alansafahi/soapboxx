// Simple test script for AI moderation
import { analyzeContentForViolations } from './ai-moderation';

async function testModerationScenarios() {
  console.log('🧪 Testing AI Content Moderation System...\n');

  const testCases = [
    {
      name: 'High Priority - Harassment',
      content: 'You are a fake Christian and should leave this app immediately. Your faith is worthless.',
      expectedPriority: 'high'
    },
    {
      name: 'High Priority - Inappropriate Content',
      content: 'This church event will have violent and sexual content that should not be shared with children.',
      expectedPriority: 'high'
    },
    {
      name: 'Medium Priority - Misinformation',
      content: 'The Bible verse John 3:16 actually says something completely different than what pastors teach.',
      expectedPriority: 'medium'
    },
    {
      name: 'Low Priority - Spam',
      content: 'Check out my amazing crypto investment opportunity! Visit my website for huge returns guaranteed!',
      expectedPriority: 'low'
    },
    {
      name: 'Safe Content',
      content: 'I am grateful for our church community and the wonderful sermon last Sunday about love and compassion.',
      expectedPriority: 'none'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: ${testCase.name}`);
    console.log(`Content: "${testCase.content.slice(0, 50)}..."`);
    
    const startTime = Date.now();
    try {
      const result = await analyzeContentForViolations(testCase.content, 'discussion');
      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Analysis Time: ${duration}ms`);
      console.log(`🚩 Flagged: ${result.flagged ? 'YES' : 'NO'}`);
      if (result.flagged) {
        console.log(`⚠️  Priority: ${result.priority.toUpperCase()}`);
        console.log(`📋 Violations: ${result.violations.join(', ')}`);
        console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`🔧 Action: ${result.actionRequired}`);
      }
      
      // Check if result matches expectation
      const expectedFlag = testCase.expectedPriority !== 'none';
      const correct = (result.flagged === expectedFlag) && 
                     (result.flagged ? result.priority === testCase.expectedPriority : true);
      console.log(`✅ Result: ${correct ? 'CORRECT' : 'INCORRECT'}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎯 AI Moderation Test Complete!');
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testModerationScenarios().catch(console.error);
}

export { testModerationScenarios };