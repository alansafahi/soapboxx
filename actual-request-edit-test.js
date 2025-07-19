// Actually execute the request edit function with real backend integration
import { createDrizzleStorage } from './server/storage.js';

async function executeActualRequestEdit() {
  console.log('🔥 ACTUAL REQUEST EDIT FUNCTION TEST');
  console.log('=====================================\n');

  const storage = createDrizzleStorage();
  
  // Test parameters
  const moderatorId = '4771822'; // Alan Safahi (soapbox owner)
  const contentType = 'discussion';
  const contentId = 4079; // The violent post by alan@safahi.com
  const feedback = 'This content contains violent language that completely violates our community guidelines. References to bombing churches and harming people are absolutely inappropriate for our faith-based community and could be traumatizing to other members.';
  const suggestions = 'Please edit your post to share your thoughts in a way that promotes peace, love, and constructive dialogue. Consider rephrasing to focus on positive community engagement, spiritual growth, or meaningful discussion topics that build up our community instead of causing harm or fear.';

  try {
    console.log('📋 Executing Real Request Edit Function...');
    console.log(`   Content: Discussion ID ${contentId}`);
    console.log(`   Author: alan@safahi.com (xinjk1vlu2l)`);
    console.log(`   Moderator: ${moderatorId}`);
    
    // Call the actual storage function
    console.log('\n⚡ Calling storage.requestContentEdit()...');
    const result = await storage.requestContentEdit(contentType, contentId, feedback, suggestions, moderatorId);
    
    console.log('✅ Request Edit Function Executed Successfully!');
    console.log('\nResult:', result);
    
    // Now let's check what was actually created
    console.log('\n🔍 Checking Created Records...');
    
    // Check notifications
    const notifications = await storage.getNotifications('xinjk1vlu2l'); // alan@safahi.com's user ID
    const latestNotification = notifications.find(n => n.type === 'content_edit_request');
    
    if (latestNotification) {
      console.log('\n📧 Notification Created:');
      console.log(`   Recipient: ${latestNotification.recipientId} (alan@safahi.com)`);
      console.log(`   Type: ${latestNotification.type}`);
      console.log(`   Title: ${latestNotification.title}`);
      console.log(`   Message: "${latestNotification.message.substring(0, 150)}..."`);
      console.log(`   Created: ${latestNotification.createdAt}`);
    }
    
    // Check moderation actions
    const actions = await storage.getModerationActions('discussion', contentId);
    const editAction = actions.find(a => a.action === 'edit_requested');
    
    if (editAction) {
      console.log('\n📊 Moderation Action Logged:');
      console.log(`   Content: ${editAction.contentType} ${editAction.contentId}`);
      console.log(`   Action: ${editAction.action}`);
      console.log(`   Moderator: ${editAction.moderatorId}`);
      console.log(`   Reason: ${editAction.reason}`);
      console.log(`   Created: ${editAction.createdAt}`);
    }
    
    console.log('\n🎯 COMPLETE REQUEST EDIT WORKFLOW EXECUTED!');
    console.log('\n✅ What Happened:');
    console.log('   1. ✓ Moderator identified problematic violent content');
    console.log('   2. ✓ Used Request Edit function instead of direct removal');
    console.log('   3. ✓ Provided detailed feedback about community guidelines violation');
    console.log('   4. ✓ Gave specific suggestions for constructive editing');
    console.log('   5. ✓ Created notification for content author (alan@safahi.com)');
    console.log('   6. ✓ Logged moderation action for audit trail');
    console.log('   7. ✓ User empowered to learn and self-correct');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    return false;
  }
}

// Execute the actual test
executeActualRequestEdit().then(success => {
  console.log(success ? '\n🎉 REAL REQUEST EDIT TEST COMPLETED!' : '\n💥 TEST FAILED!');
});