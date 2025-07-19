import { LearningIntegration } from './server/learning-integration.js';

/**
 * DEMONSTRATION: SoapBox AI Learning System
 * Shows how the system learns from moderator corrections and improves over time
 */
async function demonstrateLearningSystem() {
  console.log('🔮 SOAPBOX AI LEARNING SYSTEM DEMONSTRATION');
  console.log('===========================================\n');

  console.log('This system continuously learns from moderator decisions to improve content moderation accuracy for faith-based communities.\n');

  // Scenario 1: Borderline Content Example
  console.log('🎯 SCENARIO 1: Borderline Romantic Content');
  console.log('Content: "Hey gorgeous! Want to grab coffee after service?"');
  
  const result1 = await LearningIntegration.analyzeWithLearning(
    "Hey gorgeous! Want to grab coffee after service?", 
    'discussion', 
    'demo_1'
  );
  
  console.log(`   🤖 AI Classification: ${result1.priority.toUpperCase()} priority`);
  console.log(`   📊 Confidence: ${(result1.confidence * 100).toFixed(1)}%`);
  console.log(`   💡 AI Reasoning: ${result1.reason}`);
  console.log('   👨‍⚖️ Human Moderator: "Actually, this is just friendly church interaction - LOW priority"');
  
  // Record moderator correction
  await LearningIntegration.recordModeratorDecision('demo_1', {
    finalPriority: 'low',
    finalCategory: 'community_interaction',
    action: 'approved',
    moderatorNotes: 'Friendly church interaction, not inappropriate',
    moderatorId: 'demo_moderator'
  });
  
  console.log('   📚 System learns: AI was too strict on friendly interactions\n');

  // Scenario 2: Privacy Violation
  console.log('🎯 SCENARIO 2: Privacy Violation Detection');
  console.log('Content: "Sarah\'s having marriage problems. Her address is 123 Main St if anyone wants to help."');
  
  const result2 = await LearningIntegration.analyzeWithLearning(
    "Sarah's having marriage problems. Her address is 123 Main St if anyone wants to help.", 
    'discussion', 
    'demo_2'
  );
  
  console.log(`   🤖 AI Classification: ${result2.priority.toUpperCase()} priority`);
  console.log(`   📊 Confidence: ${(result2.confidence * 100).toFixed(1)}%`);
  console.log(`   💡 AI Reasoning: ${result2.reason}`);
  console.log('   👨‍⚖️ Human Moderator: "Correct - sharing personal info without consent is HIGH priority"');
  
  await LearningIntegration.recordModeratorDecision('demo_2', {
    finalPriority: 'high',
    finalCategory: 'privacy_violation',
    action: 'edit_requested',
    moderatorNotes: 'Remove personal address and use more appropriate approach',
    moderatorId: 'demo_moderator'
  });
  
  console.log('   📚 System learns: AI correctly identified privacy violation\n');

  // Show learning statistics
  console.log('📈 LEARNING STATISTICS');
  const feedback = await LearningIntegration.getTrainingFeedback();
  console.log(`   Training Cases Recorded: ${feedback.totalCases}`);
  console.log(`   Current Accuracy Rate: ${(feedback.accuracyRate * 100).toFixed(1)}%`);
  
  if (feedback.commonMisclassifications.length > 0) {
    console.log('   Learning Patterns:');
    feedback.commonMisclassifications.forEach((misc, index) => {
      console.log(`     • AI predicted ${misc.aiPredicted} → Human corrected to ${misc.humanCorrected}`);
    });
  }
  
  console.log('\n   System Improvements:');
  feedback.improvementSuggestions.forEach((suggestion, index) => {
    console.log(`     ${index + 1}. ${suggestion}`);
  });

  console.log('\n🎯 KEY BENEFITS FOR FAITH COMMUNITIES:');
  console.log('   ✓ Continuous learning from expert moderators');
  console.log('   ✓ Reduces false positives on innocent content');
  console.log('   ✓ Improves detection of subtle violations');
  console.log('   ✓ Maintains faith-appropriate community standards');
  console.log('   ✓ Educational approach with "Request Edit" instead of removal');
  console.log('   ✓ 4-tier priority system for appropriate response');

  console.log('\n🛡️ COMPREHENSIVE PROTECTION:');
  console.log('   🔴 CRITICAL: Sexual content, predatory behavior, violence threats');
  console.log('   🟠 HIGH: Harassment, inappropriate content, dangerous misinformation');
  console.log('   🟡 MEDIUM: Divisive theology, privacy concerns, false prophecy');
  console.log('   🟢 LOW: Spam, repetitive content, minor guideline issues');

  console.log('\n✨ The system gets smarter with every moderator decision!');
}

// Run demonstration
demonstrateLearningSystem().catch(console.error);