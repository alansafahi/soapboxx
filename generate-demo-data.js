import { db } from './server/db.js';
import { churches, users, userChurches, ministryRoles, roles } from './shared/schema.js';

const denominations = [
  'Baptist', 'Methodist', 'Presbyterian', 'Lutheran', 'Pentecostal', 'Episcopal',
  'Catholic', 'Non-denominational', 'Assembly of God', 'Church of Christ',
  'Seventh-day Adventist', 'Orthodox', 'Reformed', 'Congregational', 'Mennonite',
  'Quaker', 'Unitarian Universalist', 'Disciples of Christ', 'Moravian', 'Brethren'
];

const churchNames = [
  'Grace Community Church', 'First Baptist Church', 'St. Paul Methodist Church',
  'Trinity Lutheran Church', 'New Life Pentecostal Church', 'Christ Episcopal Church',
  'Sacred Heart Catholic Church', 'Victory Christian Center', 'Faith Assembly of God',
  'Crossroads Church of Christ', 'Mount Olive Baptist Church', 'Riverside Methodist Church',
  'Emmanuel Lutheran Church', 'Harvest Time Pentecostal', 'St. Mark Episcopal Church',
  'Our Lady of Peace Catholic', 'Living Water Church', 'Spirit-Filled Assembly',
  'Unity Church of Christ', 'Bethel Seventh-day Adventist', 'Holy Trinity Orthodox',
  'Calvary Reformed Church', 'First Congregational Church', 'Peace Mennonite Church',
  'Friends Meeting House', 'Unity Unitarian Universalist', 'New Hope Disciples',
  'Bethany Moravian Church', 'Grace Brethren Church', 'City Church',
  'The Bridge Church', 'Cornerstone Fellowship', 'River of Life Church',
  'Mountain View Baptist', 'Valley Methodist Church', 'Lighthouse Presbyterian',
  'Crosspoint Lutheran', 'Fire & Glory Pentecostal', 'St. Andrew Episcopal',
  'St. Joseph Catholic Church', 'New Creation Church', 'Power House Assembly',
  'Central Church of Christ', 'Hillside Baptist Church', 'Wesley Methodist Church',
  'Knox Presbyterian Church', 'Good Shepherd Lutheran', 'Filled with Fire Pentecostal',
  'All Saints Episcopal', 'Immaculate Heart Catholic', 'The Rock Church',
  'Full Gospel Assembly', 'Eastside Church of Christ', 'Sunrise Baptist Church',
  'Heritage Methodist Church', 'Christ Presbyterian Church', 'Zion Lutheran Church',
  'Victory Pentecostal Church', 'St. Thomas Episcopal', 'Holy Family Catholic',
  'New Covenant Church', 'Mighty Fortress Assembly', 'Restoration Church of Christ',
  'Fellowship Baptist Church', 'Grace Methodist Church', 'Faith Presbyterian Church',
  'Peace Lutheran Church', 'Glory Pentecostal Church', 'Christ the King Episcopal',
  'Our Savior Catholic Church', 'Abundant Life Church', 'Spirit Assembly of God',
  'Community Church of Christ', 'Hope Baptist Church', 'United Methodist Church',
  'First Presbyterian Church', 'St. John Lutheran Church', 'Word of Life Pentecostal',
  'Holy Cross Episcopal', 'St. Mary Catholic Church', 'Journey Church',
  'Victorious Assembly', 'Believers Church of Christ', 'Liberty Baptist Church',
  'Trinity Methodist Church', 'Covenant Presbyterian Church', 'Prince of Peace Lutheran',
  'Miracle Pentecostal Church', 'St. Peter Episcopal Church', 'Sacred Heart of Jesus',
  'Destiny Church', 'Overflow Assembly', 'Living Word Church of Christ',
  'Greater Faith Baptist', 'Asbury Methodist Church', 'Westminster Presbyterian',
  'Christ Lutheran Church', 'Breakthrough Pentecostal', 'Good Shepherd Episcopal',
  'St. Anthony Catholic Church', 'Elevate Church', 'Champions Assembly',
  'New Testament Church of Christ', 'Mount Zion Baptist', 'John Wesley Methodist',
  'Calvin Presbyterian Church', 'Redeemer Lutheran Church', 'Holy Spirit Pentecostal'
];

const ministryTypes = [
  'Youth Ministry', 'Children\'s Ministry', 'Worship Ministry', 'Outreach Ministry',
  'Women\'s Ministry', 'Men\'s Ministry', 'Small Groups Ministry', 'Prayer Ministry',
  'Missions Ministry', 'Senior Ministry', 'Singles Ministry', 'Marriage Ministry',
  'Discipleship Ministry', 'Evangelism Ministry', 'Community Service Ministry',
  'Media Ministry', 'Music Ministry', 'Drama Ministry', 'Dance Ministry',
  'Bible Study Ministry', 'Sunday School Ministry', 'Vacation Bible School',
  'Food Pantry Ministry', 'Homeless Ministry', 'Prison Ministry',
  'Hospital Visitation Ministry', 'Grief Support Ministry', 'Recovery Ministry',
  'Financial Ministry', 'Counseling Ministry', 'Welcome Ministry', 'Ushers Ministry',
  'Security Ministry', 'Parking Ministry', 'Cleanup Ministry', 'Setup Ministry',
  'Kitchen Ministry', 'Nursery Ministry', 'Special Needs Ministry', 'Sports Ministry',
  'Arts & Crafts Ministry', 'Photography Ministry', 'Video Ministry', 'Sound Ministry',
  'Lighting Ministry', 'Translation Ministry', 'Sign Language Ministry', 'Technology Ministry',
  'Website Ministry', 'Social Media Ministry', 'Newsletter Ministry', 'Library Ministry'
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Dorothy', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Margaret',
  'Kenneth', 'Carol', 'Kevin', 'Ruth', 'Brian', 'Sharon', 'George', 'Michelle',
  'Timothy', 'Laura', 'Ronald', 'Sarah', 'Jason', 'Kimberly', 'Edward', 'Deborah',
  'Jeffrey', 'Dorothy', 'Ryan', 'Lisa', 'Jacob', 'Nancy', 'Gary', 'Karen',
  'Nicholas', 'Betty', 'Eric', 'Helen', 'Jonathan', 'Sandra', 'Stephen', 'Donna',
  'Larry', 'Carol', 'Justin', 'Ruth', 'Scott', 'Sharon', 'Brandon', 'Michelle',
  'Benjamin', 'Laura', 'Samuel', 'Emily', 'Gregory', 'Kimberly', 'Alexander', 'Deborah',
  'Patrick', 'Dorothy', 'Frank', 'Amy', 'Raymond', 'Angela', 'Jack', 'Ashley',
  'Dennis', 'Brenda', 'Jerry', 'Emma', 'Tyler', 'Olivia', 'Aaron', 'Cynthia'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
  'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales',
  'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson',
  'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
  'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza'
];

const cities = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
  'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
  'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
  'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
  'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
  'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
  'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA', 'Colorado Springs, CO',
  'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
  'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'New Orleans, LA', 'Wichita, KS'
];

const roles = [
  'Member', 'Volunteer', 'Ministry Leader', 'Assistant Pastor', 'Pastor',
  'Elder', 'Deacon', 'Board Member', 'Ministry Coordinator', 'Team Leader',
  'Social Media Manager', 'Communications Director', 'Worship Leader', 'Music Director',
  'Youth Pastor', 'Children\'s Pastor', 'Associate Pastor', 'Executive Pastor'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function generateDemoData() {
  console.log('🏗️ Starting demo data generation...');

  try {
    // Generate 100 churches
    console.log('📍 Creating 100 churches...');
    const churchData = [];
    for (let i = 0; i < 100; i++) {
      const denomination = denominations[i % denominations.length];
      const baseName = getRandomElement(churchNames);
      const city = getRandomElement(cities);
      
      churchData.push({
        name: `${baseName} - ${city.split(',')[0]}`,
        denomination,
        address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Main', 'Church', 'Oak', 'Maple', 'Pine', 'Cedar', 'Elm'])} Street`,
        city: city.split(',')[0],
        state: city.split(',')[1].trim(),
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `info@${baseName.toLowerCase().replace(/\s+/g, '').replace(/'/g, '')}${city.split(',')[0].toLowerCase().replace(/\s+/g, '')}.org`,
        website: `https://www.${baseName.toLowerCase().replace(/\s+/g, '').replace(/'/g, '')}${city.split(',')[0].toLowerCase().replace(/\s+/g, '')}.org`,
        description: `A vibrant ${denomination} church community serving ${city.split(',')[0]} with love, worship, and fellowship.`,
        serviceTime: getRandomElement(['8:30 AM', '9:00 AM', '10:00 AM', '10:30 AM', '11:00 AM', '6:00 PM']),
        capacity: Math.floor(Math.random() * 800) + 200,
        isActive: true
      });
    }

    const insertedChurches = await db.insert(churches).values(churchData).returning();
    console.log(`✅ Created ${insertedChurches.length} churches`);

    // First, let's get existing roles to assign to users
    console.log('📋 Fetching existing roles...');
    const existingRoles = await db.select().from(roles);
    if (existingRoles.length === 0) {
      console.log('⚠️ No roles found in database. Creating basic member role...');
      const [memberRole] = await db.insert(roles).values({
        name: 'member',
        displayName: 'Member',
        description: 'Church member with basic access',
        level: 5,
        scope: 'church',
        permissions: ['read_prayers', 'create_prayers', 'read_events'],
        isActive: true
      }).returning();
      existingRoles.push(memberRole);
    }
    console.log(`✅ Found ${existingRoles.length} roles`);

    // Generate 500 users
    console.log('👥 Creating 500 users...');
    const userData = [];
    for (let i = 0; i < 500; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
      
      userData.push({
        id: `demo-user-${i + 1}`,
        email,
        firstName,
        lastName,
        bio: `Faithful member dedicated to serving God and the church community.`,
        mobileNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 9999) + 1} ${getRandomElement(['Oak', 'Maple', 'Pine', 'Cedar', 'Elm', 'Main', 'Church'])} Street`,
        city: getRandomElement(cities).split(',')[0],
        state: getRandomElement(cities).split(',')[1].trim(),
        zipCode: String(Math.floor(Math.random() * 90000) + 10000),
        country: 'United States',
        denomination: getRandomElement(denominations),
        interests: getRandomElements(['worship', 'prayer', 'bible study', 'community service', 'missions', 'youth work', 'music', 'teaching'], Math.floor(Math.random() * 4) + 2),
        hasCompletedOnboarding: true,
        emailVerified: true,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000))
      });
    }

    const insertedUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ Created ${insertedUsers.length} users`);

    // Assign users to churches with roles
    console.log('🤝 Assigning users to churches with roles...');
    const userChurchData = [];
    const memberRole = existingRoles.find(r => r.name === 'member') || existingRoles[0];
    
    for (const user of insertedUsers) {
      // Each user gets 1-3 church memberships
      const churchCount = Math.floor(Math.random() * 3) + 1;
      const userChurches = getRandomElements(insertedChurches, churchCount);
      
      for (let i = 0; i < userChurches.length; i++) {
        const church = userChurches[i];
        let roleId = memberRole.id;
        let title = 'Member';
        
        // First church gets more significant role sometimes
        if (i === 0 && Math.random() > 0.7) {
          const leadershipRoles = ['Youth Leader', 'Worship Leader', 'Small Group Leader', 'Ministry Coordinator', 'Volunteer Coordinator'];
          title = getRandomElement(leadershipRoles);
        }
        
        userChurchData.push({
          userId: user.id,
          churchId: church.id,
          roleId,
          title,
          department: Math.random() > 0.5 ? getRandomElement(['Youth Ministry', 'Worship Ministry', 'Outreach Ministry', 'Children\'s Ministry']) : null,
          joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)),
          isActive: true
        });
      }
    }

    await db.insert(userChurches).values(userChurchData);
    console.log(`✅ Created ${userChurchData.length} church memberships`);

    // Create 500 ministry roles for users
    console.log('🎯 Creating 500 ministry role assignments...');
    const ministryRoleData = [];
    for (let i = 0; i < 500; i++) {
      const user = getRandomElement(insertedUsers);
      const ministryType = getRandomElement(ministryTypes);
      
      // Get user's churches to assign ministry role
      const userChurchIds = userChurchData
        .filter(uc => uc.userId === user.id)
        .map(uc => uc.churchId);
      
      if (userChurchIds.length > 0) {
        const churchId = getRandomElement(userChurchIds);
        const ministryRoles = ['leader', 'co_leader', 'member', 'volunteer'];
        const role = getRandomElement(ministryRoles);
        const startDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
        
        const responsibilities = [];
        if (role === 'leader' || role === 'co_leader') {
          responsibilities.push('Lead ministry activities', 'Coordinate volunteers', 'Plan events');
        } else {
          responsibilities.push('Participate in ministry activities', 'Support team initiatives');
        }
        
        ministryRoleData.push({
          userId: user.id,
          ministryName: ministryType,
          role,
          startDate,
          isActive: true,
          responsibilities,
          timeCommitment: getRandomElement(['2-4 hours/week', '4-6 hours/week', '1-2 hours/week', '6-10 hours/week']),
          churchId
        });
      }
    }

    await db.insert(ministryRoles).values(ministryRoleData);
    console.log(`✅ Created ${ministryRoleData.length} ministry role assignments`);

    console.log('🎉 Demo data generation completed successfully!');
    console.log(`📊 Summary:
    - ${insertedChurches.length} churches across ${denominations.length} denominations
    - ${insertedUsers.length} users
    - ${userChurchData.length} church memberships
    - ${ministryRoleData.length} ministry role assignments`);

  } catch (error) {
    console.error('❌ Error generating demo data:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDemoData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to generate demo data:', error);
      process.exit(1);
    });
}

export { generateDemoData };