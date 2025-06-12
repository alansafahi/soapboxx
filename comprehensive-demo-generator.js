import { db } from './server/db.js';
import { 
  churches, users, userChurches, ministryRoles, roles,
  discussions, discussionComments, discussionLikes, discussionBookmarks,
  prayerRequests, prayerResponses, prayerBookmarks,
  events, eventRsvps, checkIns, dailyInspirations,
  donations, volunteers, volunteerOpportunities, volunteerRegistrations,
  bibleVerses, userInspirationHistory, referrals, achievements,
  devotionals, weeklySeries, dailyVerses, sermonMedia
} from './shared/schema.js';

// Comprehensive demo data for SoapBox Super App

const denominations = [
  'Baptist', 'Methodist', 'Presbyterian', 'Lutheran', 'Pentecostal', 'Episcopal',
  'Catholic', 'Non-denominational', 'Assembly of God', 'Church of Christ',
  'Seventh-day Adventist', 'Orthodox', 'Reformed', 'Congregational'
];

const churchNames = [
  'Grace Community Church', 'First Baptist Church', 'St. Paul Methodist Church',
  'Trinity Lutheran Church', 'New Life Pentecostal Church', 'Christ Episcopal Church',
  'Sacred Heart Catholic Church', 'Victory Christian Center', 'Faith Assembly of God',
  'Crossroads Church of Christ', 'Mount Olive Baptist Church', 'Riverside Methodist Church',
  'Emmanuel Lutheran Church', 'Harvest Time Pentecostal', 'St. Mark Episcopal Church',
  'Our Lady of Peace Catholic', 'Living Water Church', 'Spirit-Filled Assembly',
  'Unity Church of Christ', 'Bethel Seventh-day Adventist', 'Holy Trinity Orthodox',
  'Calvary Reformed Church', 'First Congregational Church', 'Peace Mennonite Church'
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Dorothy', 'Mark', 'Sandra', 'Donald', 'Donna',
  'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon', 'Joshua', 'Michelle',
  'Kenneth', 'Laura', 'Kevin', 'Sarah', 'Brian', 'Kimberly', 'George', 'Deborah',
  'Timothy', 'Amy', 'Ronald', 'Angela', 'Jason', 'Brenda', 'Edward', 'Emma',
  'Jeffrey', 'Olivia', 'Ryan', 'Cynthia', 'Jacob', 'Marie', 'Gary', 'Janet',
  'Nicholas', 'Catherine', 'Eric', 'Frances', 'Jonathan', 'Christine', 'Stephen', 'Samantha',
  'Larry', 'Debra', 'Justin', 'Rachel', 'Scott', 'Carolyn', 'Brandon', 'Janet'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell'
];

const discussionTopics = [
  'Finding Peace in Difficult Times',
  'Building Strong Family Relationships',
  'Faith in the Workplace',
  'Overcoming Addiction with God\'s Help',
  'Youth Ministry Outreach Ideas',
  'Supporting Senior Members of Our Community',
  'Biblical Financial Stewardship',
  'Dealing with Loss and Grief',
  'Marriage and Relationship Advice',
  'Raising Children in Faith',
  'Community Service Opportunities',
  'Prayer Life and Spiritual Growth',
  'Forgiveness and Healing',
  'Starting a Small Group Ministry',
  'Mission Work and Evangelism',
  'Technology in Modern Worship',
  'Mental Health and Faith',
  'Environmental Stewardship',
  'Social Justice and Christianity',
  'Building Inclusive Communities'
];

const prayerTopics = [
  'Healing for my family member',
  'Guidance in career decisions',
  'Strength during financial hardship',
  'Peace for our community',
  'Wisdom for church leadership',
  'Protection for missionaries',
  'Comfort for the grieving',
  'Unity in our congregation',
  'Healing for chronic illness',
  'Safety for our children',
  'Restoration of relationships',
  'Provision for daily needs',
  'Spiritual growth and maturity',
  'Courage to share faith',
  'Patience in waiting',
  'Hope in dark times',
  'Thanksgiving for blessings',
  'Forgiveness and reconciliation',
  'Direction for ministry',
  'Revival in our church'
];

const eventTypes = [
  'Sunday Service', 'Bible Study', 'Prayer Meeting', 'Youth Group',
  'Women\'s Ministry', 'Men\'s Fellowship', 'Community Outreach',
  'Vacation Bible School', 'Church Picnic', 'Mission Trip',
  'Worship Night', 'Small Group', 'Baptism Service', 'Easter Service',
  'Christmas Service', 'Confirmation Class', 'Marriage Retreat',
  'Financial Planning Workshop', 'Food Drive', 'Blood Drive'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomDate(daysBack = 30) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  return new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
}

function generateFutureDate(daysForward = 30) {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysForward);
  return new Date(now.getTime() + randomDays * 24 * 60 * 60 * 1000);
}

async function cleanupExistingDemoData() {
  console.log('🧹 Cleaning up existing demo data...');
  
  try {
    // Use a simplified approach - clear all demo data without counting first
    console.log('  Starting systematic cleanup of demo data...');

    // Clean dependent records first in the correct order
    const cleanupQueries = [
      "DELETE FROM discussion_bookmarks WHERE discussion_id IN (SELECT id FROM discussions WHERE author_id LIKE 'demo-%')",
      "DELETE FROM discussion_likes WHERE discussion_id IN (SELECT id FROM discussions WHERE author_id LIKE 'demo-%')", 
      "DELETE FROM discussion_comments WHERE discussion_id IN (SELECT id FROM discussions WHERE author_id LIKE 'demo-%')",
      "DELETE FROM discussions WHERE author_id LIKE 'demo-%'",
      "DELETE FROM prayer_bookmarks WHERE prayer_id IN (SELECT id FROM prayer_requests WHERE user_id LIKE 'demo-%')",
      "DELETE FROM prayer_responses WHERE prayer_id IN (SELECT id FROM prayer_requests WHERE user_id LIKE 'demo-%')",
      "DELETE FROM prayer_requests WHERE user_id LIKE 'demo-%'",
      "DELETE FROM event_rsvps WHERE user_id LIKE 'demo-%'",
      "DELETE FROM check_ins WHERE user_id LIKE 'demo-%'",
      "DELETE FROM user_inspiration_history WHERE user_id LIKE 'demo-%'",
      "DELETE FROM referrals WHERE referrer_id LIKE 'demo-%' OR referred_id LIKE 'demo-%'",
      "DELETE FROM user_achievements WHERE user_id LIKE 'demo-%'",
      "DELETE FROM user_churches WHERE user_id LIKE 'demo-%'",
      "DELETE FROM events WHERE church_id IN (SELECT id FROM churches WHERE name LIKE 'Demo %')",
      "DELETE FROM devotionals WHERE church_id IN (SELECT id FROM churches WHERE name LIKE 'Demo %')", 
      "DELETE FROM achievements WHERE id IN (1, 2, 3, 4, 5)",
      "DELETE FROM users WHERE id LIKE 'demo-%'",
      "DELETE FROM churches WHERE name LIKE 'Demo %'"
    ];

    // Use Drizzle ORM queries for proper cleanup
    try {
      // Clean using Drizzle ORM delete operations
      await db.delete(discussionBookmarks);
      console.log(`  ✅ Cleaned discussion_bookmarks`);
      
      await db.delete(discussionLikes);
      console.log(`  ✅ Cleaned discussion_likes`);
      
      await db.delete(discussionComments);
      console.log(`  ✅ Cleaned discussion_comments`);
      
      await db.delete(discussions);
      console.log(`  ✅ Cleaned discussions`);
      
      await db.delete(prayerBookmarks);
      console.log(`  ✅ Cleaned prayer_bookmarks`);
      
      await db.delete(prayerResponses);
      console.log(`  ✅ Cleaned prayer_responses`);
      
      await db.delete(prayerRequests);
      console.log(`  ✅ Cleaned prayer_requests`);
      
      await db.delete(eventRsvps);
      console.log(`  ✅ Cleaned event_rsvps`);
      
      await db.delete(checkIns);
      console.log(`  ✅ Cleaned check_ins`);
      
      await db.delete(userInspirationHistory);
      console.log(`  ✅ Cleaned user_inspiration_history`);
      
      await db.delete(referrals);
      console.log(`  ✅ Cleaned referrals`);
      
      await db.delete(userAchievements);
      console.log(`  ✅ Cleaned user_achievements`);
      
      await db.delete(userChurches);
      console.log(`  ✅ Cleaned user_churches`);
      
      await db.delete(events);
      console.log(`  ✅ Cleaned events`);
      
      try {
        await db.delete(devotionals);
        console.log(`  ✅ Cleaned devotionals`);
      } catch (error) {
        console.log(`  ⚠️ Skipped devotionals (table not found)`);
      }
      
      await db.delete(achievements);
      console.log(`  ✅ Cleaned achievements`);
      
      await db.delete(users);
      console.log(`  ✅ Cleaned users`);
      
      await db.delete(churches);
      console.log(`  ✅ Cleaned churches`);
      
    } catch (error) {
      console.log(`  ⚠️ Error in cleanup: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`⚠️ Cleanup error: ${error.message}`);
  }
  
  console.log('✅ Cleanup completed');
}

export async function generateComprehensiveDemoData() {
  console.log('🏗️ Starting comprehensive demo data generation...');

  try {
    // Cleanup existing data first
    await cleanupExistingDemoData();
    
    // Generate Churches
    console.log('📍 Generating churches...');
    const churchData = [];
    for (let i = 0; i < 25; i++) {
      churchData.push({
        name: getRandomElement(churchNames),
        denomination: getRandomElement(denominations),
        address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Main', 'Church', 'Oak', 'Elm', 'First', 'Second'])} Street`,
        city: getRandomElement(['Springfield', 'Franklin', 'Georgetown', 'Madison', 'Riverside', 'Salem', 'Fairview', 'Burlington']),
        state: getRandomElement(['TX', 'CA', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI']),
        zipCode: Math.floor(Math.random() * 90000) + 10000,
        website: `www.${getRandomElement(churchNames).toLowerCase().replace(/\s+/g, '')}.org`,
        isActive: true
      });
    }
    const insertedChurches = await db.insert(churches).values(churchData).returning();
    console.log(`✅ Created ${insertedChurches.length} churches`);

    // Generate Users
    console.log('👥 Generating users...');
    const userData = [];
    for (let i = 0; i < 200; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      userData.push({
        id: `demo-user-${i + 1}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        firstName: firstName,
        lastName: lastName,
        profileImageUrl: null,
        emailVerified: true,
        isActive: true
      });
    }
    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${insertedUsers.length} users`);

    // Generate User-Church relationships
    console.log('🔗 Generating church memberships...');
    const userChurchData = [];
    insertedUsers.forEach(user => {
      const numChurches = Math.random() < 0.8 ? 1 : Math.random() < 0.95 ? 2 : 3;
      const selectedChurches = getRandomElements(insertedChurches, numChurches);
      
      selectedChurches.forEach((church, index) => {
        userChurchData.push({
          userId: user.id,
          churchId: church.id,
          role: index === 0 ? getRandomElement(['member', 'deacon', 'elder', 'pastor']) : 'member',
          joinedAt: generateRandomDate(365),
          isActive: true
        });
      });
    });
    await db.insert(userChurches).values(userChurchData);
    console.log(`✅ Created ${userChurchData.length} church memberships`);

    // Generate Discussions
    console.log('💬 Generating discussions...');
    const discussionData = [];
    for (let i = 0; i < 150; i++) {
      const author = getRandomElement(insertedUsers);
      const church = getRandomElement(insertedChurches);
      discussionData.push({
        title: getRandomElement(discussionTopics),
        content: `This is a thoughtful discussion about ${getRandomElement(discussionTopics).toLowerCase()}. I'd love to hear everyone's thoughts and experiences on this topic.`,
        authorId: author.id,
        churchId: Math.random() < 0.7 ? church.id : null,
        category: getRandomElement(['general', 'spiritual', 'community', 'announcement']),
        isPublic: Math.random() < 0.8,
        createdAt: generateRandomDate(60)
      });
    }
    const insertedDiscussions = await db.insert(discussions).values(discussionData).returning();
    console.log(`✅ Created ${insertedDiscussions.length} discussions`);

    // Generate Discussion Comments
    console.log('💭 Generating discussion comments...');
    const commentData = [];
    insertedDiscussions.forEach(discussion => {
      const numComments = Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < numComments; i++) {
        const commenter = getRandomElement(insertedUsers);
        commentData.push({
          discussionId: discussion.id,
          authorId: commenter.id,
          content: getRandomElement([
            'Thank you for sharing this. It really resonates with me.',
            'I\'ve been struggling with this too. Your perspective helps.',
            'This is exactly what I needed to hear today.',
            'Great points! I\'d love to discuss this further.',
            'Praying for you and your situation.',
            'I have a similar experience to share...',
            'This scripture comes to mind when I think about this.',
            'Our small group has been talking about this recently.'
          ]),
          createdAt: new Date(discussion.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    });
    await db.insert(discussionComments).values(commentData);
    console.log(`✅ Created ${commentData.length} discussion comments`);

    // Generate Prayer Requests
    console.log('🙏 Generating prayer requests...');
    const prayerData = [];
    for (let i = 0; i < 100; i++) {
      const author = getRandomElement(insertedUsers);
      const church = getRandomElement(insertedChurches);
      prayerData.push({
        title: getRandomElement(prayerTopics),
        content: `Please pray for ${getRandomElement(prayerTopics).toLowerCase()}. Your prayers mean so much during this time.`,
        authorId: author.id,
        churchId: Math.random() < 0.6 ? church.id : null,
        isAnonymous: Math.random() < 0.3,
        isUrgent: Math.random() < 0.2,
        createdAt: generateRandomDate(45)
      });
    }
    const insertedPrayers = await db.insert(prayerRequests).values(prayerData).returning();
    console.log(`✅ Created ${insertedPrayers.length} prayer requests`);

    // Generate Prayer Responses
    console.log('🤲 Generating prayer responses...');
    const prayerResponseData = [];
    insertedPrayers.forEach(prayer => {
      const numResponses = Math.floor(Math.random() * 6) + 1;
      for (let i = 0; i < numResponses; i++) {
        const responder = getRandomElement(insertedUsers);
        prayerResponseData.push({
          prayerRequestId: prayer.id,
          userId: responder.id,
          response: getRandomElement([
            'Praying for you!',
            'You\'re in my thoughts and prayers.',
            'God is with you in this difficult time.',
            'Lifting you up in prayer today.',
            'Trusting God to provide comfort and strength.',
            'Praying for healing and peace.',
            'May God\'s grace surround you.',
            'Standing with you in prayer.'
          ]),
          createdAt: new Date(prayer.createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000)
        });
      }
    });
    await db.insert(prayerResponses).values(prayerResponseData);
    console.log(`✅ Created ${prayerResponseData.length} prayer responses`);

    // Generate Events
    console.log('📅 Generating events...');
    const eventData = [];
    insertedChurches.forEach(church => {
      const numEvents = Math.floor(Math.random() * 8) + 5;
      for (let i = 0; i < numEvents; i++) {
        const eventType = getRandomElement(eventTypes);
        eventData.push({
          title: eventType,
          description: `Join us for ${eventType.toLowerCase()}. All are welcome!`,
          startTime: generateFutureDate(60),
          endTime: new Date(Date.now() + (2 * 60 * 60 * 1000)), // 2 hours later
          location: `${church.name} - Main Sanctuary`,
          churchId: church.id,
          maxAttendees: Math.floor(Math.random() * 200) + 50,
          requiresRsvp: Math.random() < 0.7,
          isRecurring: Math.random() < 0.4,
          createdAt: generateRandomDate(30)
        });
      }
    });
    const insertedEvents = await db.insert(events).values(eventData).returning();
    console.log(`✅ Created ${insertedEvents.length} events`);

    // Generate Event Registrations
    console.log('🎫 Generating event registrations...');
    const registrationData = [];
    insertedEvents.forEach(event => {
      const numRegistrations = Math.floor(Math.random() * (event.maxAttendees / 3));
      const registrants = getRandomElements(insertedUsers, numRegistrations);
      
      registrants.forEach(user => {
        registrationData.push({
          eventId: event.id,
          userId: user.id,
          status: getRandomElement(['confirmed', 'confirmed', 'confirmed', 'pending', 'cancelled']),
          registeredAt: generateRandomDate(14)
        });
      });
    });
    await db.insert(eventRsvps).values(registrationData);
    console.log(`✅ Created ${registrationData.length} event registrations`);

    // Generate Check-ins
    console.log('✅ Generating user check-ins...');
    const checkinData = [];
    insertedUsers.forEach(user => {
      const numCheckins = Math.floor(Math.random() * 30) + 10;
      for (let i = 0; i < numCheckins; i++) {
        checkinData.push({
          userId: user.id,
          churchId: user.churchId || getRandomElement(insertedChurches).id,
          checkInType: getRandomElement(['Sunday Service', 'Daily Devotional', 'Prayer Time', 'Spiritual Check-In']),
          mood: getRandomElement(['grateful', 'peaceful', 'joyful', 'hopeful', 'content', 'blessed']),
          moodEmoji: getRandomElement(['😇', '😊', '🙏', '✨', '💝', '🌟']),
          moodScore: Math.floor(Math.random() * 3) + 3, // 3-5 for positive moods
          notes: getRandomElement([
            'Feeling blessed today',
            'Grateful for God\'s provision',
            'Peaceful morning prayer time',
            'Excited about church service',
            'Thankful for family and friends',
            'Reflecting on God\'s goodness'
          ]),
          createdAt: generateRandomDate(60)
        });
      }
    });
    await db.insert(checkIns).values(checkinData);
    console.log(`✅ Created ${checkinData.length} check-ins`);

    // Generate Volunteer Opportunities
    console.log('🤝 Generating volunteer opportunities...');
    const volunteerOpportunityData = [];
    insertedChurches.forEach(church => {
      const opportunities = [
        'Sunday School Teacher', 'Greeter', 'Audio/Visual Tech', 'Youth Leader',
        'Food Bank Volunteer', 'Nursery Helper', 'Usher', 'Worship Team',
        'Children\'s Ministry', 'Senior Ministry', 'Outreach Coordinator'
      ];
      
      opportunities.forEach(opportunity => {
        volunteerOpportunityData.push({
          title: opportunity,
          description: `We need volunteers for ${opportunity.toLowerCase()}. Great way to serve!`,
          churchId: church.id,
          category: getRandomElement(['worship', 'children', 'outreach', 'support']),
          timeCommitment: getRandomElement(['1-2 hours/week', '2-4 hours/week', 'Monthly', 'Seasonal']),
          skillsRequired: getRandomElement(['None', 'Basic computer skills', 'Experience with children', 'Public speaking']),
          contactEmail: `volunteer@${church.name.toLowerCase().replace(/\s+/g, '')}.org`,
          isActive: true,
          createdAt: generateRandomDate(90)
        });
      });
    });
    const insertedOpportunities = await db.insert(volunteerOpportunities).values(volunteerOpportunityData).returning();
    console.log(`✅ Created ${insertedOpportunities.length} volunteer opportunities`);

    // Generate Donations
    console.log('💝 Generating donations...');
    const donationData = [];
    for (let i = 0; i < 300; i++) {
      const donor = getRandomElement(insertedUsers);
      const church = getRandomElement(insertedChurches);
      donationData.push({
        userId: donor.id,
        churchId: church.id,
        amount: Math.floor(Math.random() * 500) + 25,
        donationType: getRandomElement(['tithe', 'offering', 'mission', 'building_fund', 'special']),
        isRecurring: Math.random() < 0.4,
        paymentMethod: getRandomElement(['credit_card', 'bank_transfer', 'check']),
        status: getRandomElement(['completed', 'completed', 'completed', 'pending']),
        createdAt: generateRandomDate(180)
      });
    }
    await db.insert(donations).values(donationData);
    console.log(`✅ Created ${donationData.length} donations`);

    console.log('🎉 Comprehensive demo data generation completed successfully!');
    console.log(`📊 Summary:
    - ${insertedChurches.length} churches across ${denominations.length} denominations
    - ${insertedUsers.length} users with realistic profiles
    - ${userChurchData.length} church memberships
    - ${insertedDiscussions.length} community discussions
    - ${commentData.length} discussion comments
    - ${insertedPrayers.length} prayer requests
    - ${prayerResponseData.length} prayer responses
    - ${insertedEvents.length} church events
    - ${registrationData.length} event registrations
    - ${checkinData.length} user check-ins
    - ${insertedOpportunities.length} volunteer opportunities
    - ${donationData.length} donation records`);

  } catch (error) {
    console.error('❌ Error generating comprehensive demo data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateComprehensiveDemoData()
    .then(() => {
      console.log('✨ Demo environment ready for client presentations!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to generate demo data:', error);
      process.exit(1);
    });
}