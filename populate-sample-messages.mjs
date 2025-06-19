import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function populateMessages() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to populate sample messages...');

    // Create sample users for messaging if they don't exist
    const sampleUsers = [
      { id: 'msg_user_1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@soapbox.app', role: 'pastor' },
      { id: 'msg_user_2', firstName: 'Michael', lastName: 'Davis', email: 'michael.davis@soapbox.app', role: 'member' },
      { id: 'msg_user_3', firstName: 'Emily', lastName: 'Wilson', email: 'emily.wilson@soapbox.app', role: 'church_admin' },
      { id: 'msg_user_4', firstName: 'David', lastName: 'Brown', email: 'david.brown@soapbox.app', role: 'member' },
      { id: 'msg_user_5', firstName: 'Jessica', lastName: 'Miller', email: 'jessica.miller@soapbox.app', role: 'volunteer' }
    ];

    console.log('Creating sample users...');
    for (const user of sampleUsers) {
      await client.query(`
        INSERT INTO users (id, first_name, last_name, email, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.firstName, user.lastName, user.email, user.role]);
    }

    console.log('Creating conversations...');
    const conversations = [
      { id: 1, participant1: 'msg_user_1', participant2: 'msg_user_2' },
      { id: 2, participant1: 'msg_user_1', participant2: 'msg_user_3' },
      { id: 3, participant1: 'msg_user_2', participant2: 'msg_user_3' }
    ];

    for (const conv of conversations) {
      await client.query(`
        INSERT INTO conversations (id, participant1_id, participant2_id, conversation_type, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [conv.id, conv.participant1, conv.participant2, 'direct']);
    }

    // Create sample messages between users
    const sampleMessages = [
      // Conversation 1: Prayer Request Discussion
      {
        conversationId: 1,
        senderId: 'msg_user_1',
        receiverId: 'msg_user_2',
        content: "Hi! I saw your prayer request on the prayer wall. I wanted to let you know I'm praying for your family during this difficult time.",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        conversationId: 1,
        senderId: 'msg_user_2',
        receiverId: 'msg_user_1',
        content: "Thank you so much, Pastor Sarah. Your prayers mean the world to us. The doctor said the surgery went well and mom is recovering nicely.",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
      },
      {
        conversationId: 1,
        senderId: 'msg_user_1',
        receiverId: 'msg_user_2',
        content: "That's wonderful news! God is so good. We'll continue to pray for her full recovery. Please don't hesitate to reach out if your family needs anything.",
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },

      // Conversation 2: Sunday Service Planning
      {
        conversationId: 2,
        senderId: 'msg_user_3',
        receiverId: 'msg_user_1',
        content: "Pastor Sarah, I've finished preparing the worship slides for this Sunday. The theme 'Walking in Faith' is really powerful. Should I add the additional scripture references you mentioned?",
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        conversationId: 2,
        senderId: 'msg_user_1',
        receiverId: 'msg_user_3',
        content: "Yes, please add Hebrews 11:1 and Romans 10:17. Also, could you prepare the communion slides for the end of service? Thank you for all your hard work, Emily!",
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        conversationId: 2,
        senderId: 'msg_user_3',
        receiverId: 'msg_user_1',
        content: "Absolutely! I'll have everything ready by Saturday evening. Looking forward to a blessed service.",
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },

      // Conversation 3: Community Outreach
      {
        conversationId: 3,
        senderId: 'msg_user_4',
        receiverId: 'msg_user_5',
        content: "Jessica, I heard about the community food drive you're organizing. Count me in! When do you need volunteers and what can I bring?",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        conversationId: 3,
        senderId: 'msg_user_5',
        receiverId: 'msg_user_4',
        content: "David, thank you so much! We need volunteers next Saturday from 9 AM to 2 PM. Non-perishable items like canned goods, pasta, and rice would be perfect. Every contribution helps!",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
      },
      {
        conversationId: 3,
        senderId: 'msg_user_4',
        receiverId: 'msg_user_5',
        content: "Perfect! I'll be there at 9 AM sharp and I'll bring a few bags of groceries. This is such a great way to serve our community. God bless this ministry!",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },

      // Conversation 4: Bible Study Group
      {
        conversationId: 4,
        senderId: 'msg_user_2',
        receiverId: 'msg_user_4',
        content: "Hey David! Are you planning to join the Wednesday evening Bible study? We're starting a new series on the Book of James next week.",
        isRead: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        conversationId: 4,
        senderId: 'msg_user_4',
        receiverId: 'msg_user_2',
        content: "Absolutely! I've been looking forward to it. James has so much practical wisdom for daily living. What time does it start and do I need to bring anything?",
        isRead: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000)
      },
      {
        conversationId: 4,
        senderId: 'msg_user_2',
        receiverId: 'msg_user_4',
        content: "7 PM in the fellowship hall. Just bring your Bible and an open heart! Looking forward to studying God's word together.",
        isRead: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000)
      }
    ];

    console.log('Inserting sample messages...');
    
    for (const message of sampleMessages) {
      await client.query(`
        INSERT INTO messages (
          conversation_id, 
          sender_id, 
          content, 
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [
        message.conversationId,
        message.senderId,
        message.content,
        message.createdAt,
        message.createdAt
      ]);
    }

    console.log(`Successfully populated ${sampleMessages.length} sample messages`);
    console.log('Message distribution:');
    console.log('- Prayer request discussion: 3 messages');
    console.log('- Sunday service planning: 3 messages');
    console.log('- Community outreach: 3 messages');
    console.log('- Bible study group: 3 messages');
    console.log('Unread messages: 4 (for realistic notification badges)');
    
  } catch (error) {
    console.error('Error populating messages:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the population script
populateMessages()
  .then(() => {
    console.log('\nSample messages population completed successfully!');
    console.log('Users can now see realistic conversation threads in the Messages feature');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFailed to populate sample messages:', error);
    process.exit(1);
  });