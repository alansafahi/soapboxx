
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

// Define the Bible verses data with authentic scripture
const authenticBibleContent = {
  // 30-Day Psalms Journey
  15: [
    { day: 1, title: 'Finding Peace in God', reference: 'Psalm 23:1-6', text: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He leads me in paths of righteousness for his name's sake.', devotional: 'In times of uncertainty, we find our greatest comfort in knowing that God is our shepherd. Just as a shepherd cares for his flock, God watches over us with infinite love and protection.' },
    { day: 2, title: 'Trusting in God's Strength', reference: 'Psalm 46:1-3', text: 'God is our refuge and strength, a very present help in trouble. Therefore we will not fear though the earth gives way, though the mountains be moved into the heart of the sea, though its waters roar and foam, though the mountains tremble at its swelling.', devotional: 'When life feels overwhelming, we can anchor our souls in the unchanging strength of God. He is not a distant deity but a present help in every moment of need.' }
  ],
  
  // Gospel Foundations
  16: [
    { day: 1, title: 'The Birth of Hope', reference: 'Luke 2:8-14', text: 'And in the same region there were shepherds out in the field, keeping watch over their flock by night. And an angel of the Lord appeared to them, and the glory of the Lord shone around them, and they were filled with great fear. And the angel said to them, "Fear not, for behold, I bring you good news of great joy that will be for all the people."', devotional: 'The birth of Jesus represents God's ultimate gift to humanity. In the humblest of settings, the Light of the World entered our darkness, bringing hope to all who would receive Him.' },
    { day: 2, title: 'Jesus Calls His Disciples', reference: 'Matthew 4:18-20', text: 'While walking by the Sea of Galilee, he saw two brothers, Simon (who is called Peter) and Andrew his brother, casting a net into the sea, for they were fishermen. And he said to them, "Follow me, and I will make you fishers of men." Immediately they left their nets and followed him.', devotional: 'Jesus's call to discipleship is both simple and profound. He meets us where we are and invites us to leave behind our old ways to follow Him into a life of greater purpose.' }
  ],
  
  // Prayer & Worship
  17: [
    { day: 1, title: 'The Lord's Prayer Model', reference: 'Matthew 6:9-13', text: 'Pray then like this: "Our Father in heaven, hallowed be your name. Your kingdom come, your will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from evil."', devotional: 'Jesus gave us the perfect template for prayer - starting with worship, seeking God's will, asking for provision, requesting forgiveness, and seeking protection from evil.' },
    { day: 2, title: 'Persistent Prayer', reference: 'Luke 18:1-8', text: 'And he told them a parable to the effect that they ought always to pray and not lose heart. He said, "In a certain city there was a judge who neither feared God nor respected man. And there was a widow in that city who kept coming to him and saying, 'Give me justice against my adversary.'"', devotional: 'God encourages us to be persistent in prayer, not because He is reluctant to answer, but because persistent prayer transforms our hearts and aligns us with His purposes.' }
  ]
};

async function populateAllPlansWithRealScripture() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL not found');
    return;
  }
  
  const sql = postgres(connectionString);
  const db = drizzle(sql);
  
  try {
    console.log('Starting scripture population...');
    
    // Get all plans that need content
    const plans = await sql`SELECT id, name, duration FROM reading_plans ORDER BY id`;
    console.log(`Found ${plans.length} plans to populate`);
    
    for (const plan of plans) {
      console.log(`Populating plan: ${plan.name} (ID: ${plan.id})`);
      
      // Check if plan already has content
      const existingDays = await sql`
        SELECT COUNT(*) as count 
        FROM reading_plan_days 
        WHERE plan_id = ${plan.id} 
        AND scripture_text NOT LIKE '%[Devotional scripture text would be inserted here]%'
        AND scripture_text NOT LIKE '%placeholder%'
      `;
      
      if (existingDays[0].count > 0) {
        console.log(`Plan ${plan.id} already has authentic content, skipping...`);
        continue;
      }
      
      // Get authentic content for this plan or use default content
      const planContent = authenticBibleContent[plan.id] || generateDefaultContent(plan);
      
      // Update existing days with authentic scripture
      const days = await sql`SELECT * FROM reading_plan_days WHERE plan_id = ${plan.id} ORDER BY day_number`;
      
      for (let i = 0; i < days.length && i < planContent.length; i++) {
        const day = days[i];
        const content = planContent[i % planContent.length]; // Cycle through content if needed
        
        await sql`
          UPDATE reading_plan_days 
          SET 
            title = ${content.title},
            scripture_reference = ${content.reference},
            scripture_text = ${content.text},
            devotional_content = ${content.devotional}
          WHERE id = ${day.id}
        `;
      }
      
      console.log(`Updated ${Math.min(days.length, planContent.length)} days for plan ${plan.id}`);
    }
    
    console.log('Scripture population completed successfully!');
  } catch (error) {
    console.error('Error populating scripture:', error);
  } finally {
    await sql.end();
  }
}

function generateDefaultContent(plan) {
  const defaultVerses = [
    {
      title: 'Walking in Faith',
      reference: 'Hebrews 11:1',
      text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.',
      devotional: 'Faith is the foundation of our spiritual journey. It calls us to trust in God's promises even when we cannot see the path ahead.'
    },
    {
      title: 'God's Perfect Love',
      reference: '1 John 4:16',
      text: 'So we have come to know and to believe the love that God has for us. God is love, and whoever abides in love abides in God, and God abides in him.',
      devotional: 'God's love is not just an attribute - it is His very essence. When we abide in love, we abide in God Himself.'
    },
    {
      title: 'Strength in Weakness',
      reference: '2 Corinthians 12:9',
      text: 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.',
      devotional: 'Our weaknesses are not obstacles to God's power but opportunities for His strength to be displayed in our lives.'
    },
    {
      title: 'God's Faithful Promises',
      reference: '2 Corinthians 1:20',
      text: 'For all the promises of God find their Yes in him. That is why it is through him that we utter our Amen to God for his glory.',
      devotional: 'Every promise God has made finds its fulfillment in Christ. We can trust completely in His faithfulness to us.'
    },
    {
      title: 'Peace Beyond Understanding',
      reference: 'Philippians 4:7',
      text: 'And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.',
      devotional: 'God's peace is not dependent on our circumstances but flows from our relationship with Him through Christ.'
    }
  ];
  
  return defaultVerses;
}

populateAllPlansWithRealScripture();
