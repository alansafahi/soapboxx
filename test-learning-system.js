import { LearningIntegration } from './server/learning-integration.js';

/**
 * Comprehensive test of the AI Learning System
 * Tests the complete feedback loop from AI prediction to moderator decision to system improvement
 */
async function testLearningSystem() {
  console.log('🧠 TESTING COMPLETE AI LEARNING SYSTEM');
  console.log('======================================\n');

  try {
    // Test 1: AI Analysis with Learning
    console.log('📝 Step 1: Testing AI Content Analysis with Learning');
    const testContent = "Hey babe! you look mighty fine. Wanna get married?";
    const contentId = "test_123";
    
    const aiResult = await LearningIntegration.analyzeWithLearning(testContent, 'discussion', contentId);
    console.log(`   AI Result: ${aiResult.flagged ? 'FLAGGED' : 'CLEAR'}`);
    console.log(`   Priority: ${aiResult.priority} | Confidence: ${(aiResult.confidence * 100).toFixed(1)}%`);
    console.log(`   Action: ${aiResult.actionRequired} | Category: ${aiResult.category || 'other'}`);
    console.log(`   Reason: ${aiResult.reason || 'No reason provided'}\n`);

    // Test 2: Moderator Decision Recording
    console.log('👨‍⚖️ Step 2: Recording Moderator Decision');
    const moderatorDecision = {
      finalPriority: 'high', // Correcting AI's assessment
      finalCategory: 'sexual_content',
      action: 'edit_requested',
      moderatorNotes: 'Inappropriate flirting language in faith community. Request tone adjustment.',
      moderatorId: 'moderator_456'
    };

    await LearningIntegration.recordModeratorDecision(contentId, moderatorDecision);
    console.log('   ✅ Moderator decision recorded for learning\n');

    // Test 3: Training Feedback
    console.log('📊 Step 3: Generating Training Feedback');
    const feedback = await LearningIntegration.getTrainingFeedback();
    console.log(`   Total Training Cases: ${feedback.totalCases}`);
    console.log(`   Overall Accuracy: ${(feedback.accuracyRate * 100).toFixed(1)}%`);
    if (feedback.commonMisclassifications.length > 0) {
      console.log('   Common Misclassifications:');
      feedback.commonMisclassifications.forEach((misc, index) => {
        console.log(`     ${index + 1}. AI: ${misc.aiPredicted} → Human: ${misc.humanCorrected} (${misc.frequency} times)`);
      });
    }
    console.log('   Improvement Suggestions:');
    feedback.improvementSuggestions.forEach((suggestion, index) => {
      console.log(`     ${index + 1}. ${suggestion}`);
    });
    console.log('');

    // Test 4: Enhanced Classification with Examples
    console.log('🎯 Step 4: Testing Enhanced Classification System');
    await LearningIntegration.testEnhancedClassification();

    // Test 5: Multiple Content Scenarios
    console.log('\n🔍 Step 5: Testing Multiple Content Scenarios');
    const testScenarios = [
      {
        content: "Any personal info for sale?",
        expected: "critical",
        description: "Privacy violation - selling personal info"
      },
      {
        content: "Catholics aren't real Christians",
        expected: "medium", 
        description: "Denominational criticism"
      },
      {
        content: "Is attraction a sin?",
        expected: "low",
        description: "Sincere faith question"
      },
      {
        content: "Prayer is more powerful than medicine. Don't take pills—just pray.",
        expected: "high",
        description: "Dangerous medical misinformation"
      }
    ];

    for (const [index, scenario] of testScenarios.entries()) {
      const result = await LearningIntegration.analyzeWithLearning(
        scenario.content, 
        'discussion', 
        `scenario_${index + 1}`
      );
      
      const status = result.priority === scenario.expected ? '✅' : '❌';
      console.log(`   ${status} "${scenario.content.substring(0, 40)}..."`);
      console.log(`      Expected: ${scenario.expected} | Got: ${result.priority}`);
      console.log(`      Description: ${scenario.description}`);
      console.log(`      Confidence: ${(result.confidence * 100).toFixed(1)}%\n`);
    }

    console.log('🎉 LEARNING SYSTEM TEST COMPLETE!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('   ✓ AI content analysis with contextual learning');
    console.log('   ✓ Moderator decision recording and feedback loop');
    console.log('   ✓ Training accuracy tracking and improvement suggestions');
    console.log('   ✓ Enhanced classification with 4-tier priority system');
    console.log('   ✓ Real-time learning from moderator corrections');
    console.log('   ✓ Comprehensive content safety for faith communities');

  } catch (error) {
    console.error('\n❌ Learning System Test Failed:', error);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testLearningSystem();