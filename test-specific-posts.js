// Test the specific posts from the screenshot to see why AI didn't flag them
import { analyzeContentForViolations } from './server/ai-moderation.js';

async function testProblematicPosts() {
  console.log('🔍 Testing Posts from Screenshot...\n');

  const problematicPosts = [
    {
      name: "Data Solicitation",
      content: "Any personal info for sale?",
      shouldFlag: true,
      reason: "Soliciting personal information"
    },
    {
      name: "Inappropriate Flirting", 
      content: "Hey babe! you look mighty fine. Wanna get married?",
      shouldFlag: true,
      reason: "Inappropriate harassment/flirting"
    },
    {
      name: "Potentially Harmful Advice",
      content: "You need to really quit your job now",
      shouldFlag: true,
      reason: "Could be harmful advice or harassment"
    }
  ];

  for (const post of problematicPosts) {
    console.log(`\n📝 Testing: ${post.name}`);
    console.log(`Content: "${post.content}"`);
    console.log(`Should be flagged: ${post.shouldFlag}`);
    console.log(`Reason: ${post.reason}`);
    
    try {
      const startTime = Date.now();
      const result = await analyzeContentForViolations(post.content, 'discussion');
      const duration = Date.now() - startTime;
      
      console.log(`⏱️  Analysis Time: ${duration}ms`);
      console.log(`🚩 Flagged: ${result.flagged ? 'YES' : 'NO'}`);
      
      if (result.flagged) {
        console.log(`⚠️  Priority: ${result.priority.toUpperCase()}`);
        console.log(`📋 Violations: ${result.violations.join(', ')}`);
        console.log(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`🔧 Action: ${result.actionRequired}`);
        console.log(`📝 Reason: ${result.reason}`);
      } else {
        console.log(`❌ MISSED: Should have been flagged for ${post.reason}`);
      }
      
      console.log(`✅ Result: ${result.flagged === post.shouldFlag ? 'CORRECT' : 'INCORRECT DETECTION'}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.error(error);
    }
  }

  console.log('\n🎯 Test Complete!');
}

// Run the test
testProblematicPosts().catch(console.error);