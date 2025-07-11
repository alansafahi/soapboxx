// Quick verification script to check message delivery
import { execSync } from 'child_process';

console.log('🔍 Checking recent notifications for communication verification...\n');

try {
  // Check recent notifications that might be from our test
  const recentNotifications = execSync(`
    psql "${process.env.DATABASE_URL}" -c "
      SELECT 
        n.title,
        n.message,
        n.type,
        n.created_at,
        u.email as recipient_email,
        u.first_name,
        u.last_name
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE n.created_at > NOW() - INTERVAL '10 minutes'
      ORDER BY n.created_at DESC
      LIMIT 5;
    "
  `, { encoding: 'utf8' });
  
  console.log('📧 Recent Notifications (last 10 minutes):');
  console.log(recentNotifications);
  
  // Check church members count
  const memberCount = execSync(`
    psql "${process.env.DATABASE_URL}" -c "
      SELECT COUNT(*) as total_church_members
      FROM user_churches uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.church_id = 1 AND uc.is_active = true;
    "
  `, { encoding: 'utf8' });
  
  console.log('👥 Church Member Count:');
  console.log(memberCount);
  
} catch (error) {
  console.error('Error checking notifications:', error.message);
}