// Test the enhanced AI classification system with your specific examples
import { aiTrainingSystem } from './server/ai-training-system.js';

async function testEnhancedClassification() {
  console.log('🧪 TESTING ENHANCED AI CLASSIFICATION SYSTEM');
  console.log('============================================\n');

  console.log('Testing with your specific classification examples...\n');
  
  // Run the built-in test with your examples
  await aiTrainingSystem.testWithExamples();
  
  console.log('\n🔍 Testing Additional Problematic Posts from Screenshot...\n');
  
  const additionalTests = [
    { content: 'Any personal info for sale?', expected: 'critical', reason: 'Privacy violation - soliciting personal info' },
    { content: 'Hey babe! you look mighty fine. Wanna get married?', expected: 'high', reason: 'Sexual harassment/inappropriate flirting' },
    { content: 'You need to really quit your job now', expected: 'low', reason: 'Borderline - could be harmful advice but context matters' }
  ];
  
  let additionalCorrect = 0;
  for (const test of additionalTests) {
    console.log(`📝 Testing: "${test.content}"`);
    console.log(`   Expected: ${test.expected} (${test.reason})`);
    
    try {
      const result = await aiTrainingSystem.analyzeContentWithLearning(test.content, 'discussion');
      const isCorrect = result.priority === test.expected;
      if (isCorrect) additionalCorrect++;
      
      console.log(`   Result: ${result.flagged ? '🚩 FLAGGED' : '✅ CLEAR'}`);
      console.log(`   Priority: ${result.priority} | Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`   Action: ${result.actionRequired} | Category: ${result.category}`);
      console.log(`   Reason: ${result.reason}`);
      if (result.learningNote) {
        console.log(`   Learning: ${result.learningNote}`);
      }
      console.log(`   ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'} Classification\n`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log(`🎯 Additional Tests Accuracy: ${additionalCorrect}/${additionalTests.length} (${((additionalCorrect/additionalTests.length)*100).toFixed(1)}%)`);
  
  // Show training feedback
  console.log('\n📊 TRAINING SYSTEM STATUS:');
  const feedback = aiTrainingSystem.generateTrainingFeedback();
  console.log(`   Total Training Cases: ${feedback.totalCases}`);
  console.log(`   Overall Accuracy: ${(feedback.accuracyRate * 100).toFixed(1)}%`);
  
  if (feedback.commonMisclassifications.length > 0) {
    console.log('\n❌ Common Misclassifications:');
    feedback.commonMisclassifications.forEach(misc => {
      console.log(`   ${misc.aiPredicted} -> ${misc.humanCorrected} (${misc.frequency} times)`);
    });
  }
  
  if (feedback.improvementSuggestions.length > 0) {
    console.log('\n💡 Improvement Suggestions:');
    feedback.improvementSuggestions.forEach(suggestion => {
      console.log(`   • ${suggestion}`);
    });
  }
  
  console.log('\n✅ ENHANCED AI CLASSIFICATION TEST COMPLETE!');
  console.log('\n🎯 Key Features Implemented:');
  console.log('   ✓ 4-tier priority system (Critical, High, Medium, Low)');
  console.log('   ✓ Specific category classification');
  console.log('   ✓ Action-based responses (remove, hide, review, coach)');
  console.log('   ✓ Learning from moderator decisions');
  console.log('   ✓ Self-improving accuracy over time');
  console.log('   ✓ Detailed feedback and confidence scoring');
}

// Run the enhanced test
testEnhancedClassification().catch(console.error);