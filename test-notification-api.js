/**
 * TEST: Notification API Response Check
 * Verifies that the notification API returns actionUrl field properly
 */
async function testNotificationAPI() {
  console.log('🔍 TESTING NOTIFICATION API RESPONSE');
  console.log('=====================================\n');

  try {
    const response = await fetch('http://localhost:5000/api/notifications', {
      headers: {
        'Cookie': 'soapbox_session=s%3AYourSessionID.signature'
      }
    });

    if (response.ok) {
      const notifications = await response.json();
      console.log('✅ API Response successful');
      console.log('📊 Notification count:', notifications.length);
      
      if (notifications.length > 0) {
        const notification = notifications[0];
        console.log('\n📋 First notification structure:');
        console.log('   • ID:', notification.id);
        console.log('   • Type:', notification.type);
        console.log('   • Title:', notification.title);
        console.log('   • ActionURL:', notification.actionUrl || 'MISSING!');
        console.log('   • IsRead:', notification.isRead);
        
        if (notification.actionUrl) {
          console.log('\n✅ SUCCESS: actionUrl is present in API response');
          console.log('   Navigation should work correctly');
        } else {
          console.log('\n❌ ISSUE: actionUrl is missing from API response');
          console.log('   This explains why navigation fails');
        }
      }
    } else {
      console.log('❌ API request failed:', response.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNotificationAPI();