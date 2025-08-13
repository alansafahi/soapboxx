import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Scripture-specific reflection questions for Minor Prophets
const enhancedReflectionQuestions = {
  1: "How does Hosea's experience with unfaithful Gomer mirror God's patient love for Israel? When have you experienced God's unwavering love despite your own unfaithfulness? What does this teach you about forgiveness in your relationships?",
  
  2: "Joel speaks of God's Spirit being poured out on all people. How do you see the Holy Spirit working in your life today? What spiritual gifts has God given you to serve others in your community?",
  
  3: "Amos calls for justice to 'roll down like waters.' What injustices in your community burden your heart? How can you be an agent of God's justice and righteousness in practical ways this week?",
  
  4: "Obadiah warns against pride that says 'Who will bring me down?' Examine your heart: Where might pride be blinding you to your need for God? How can humility transform your relationships?",
  
  5: "Jonah learned that God's compassion extends beyond his expectations. Who are the 'Ninevites' in your life - people you struggle to love? How is God calling you to extend mercy beyond your comfort zone?",
  
  6: "Micah summarizes what God requires: justice, mercy, and humble walking with God. Which of these three areas challenges you most? How can you grow in that area this week?",
  
  7: "Nahum reminds us that God is our stronghold in times of trouble. What current troubles are testing your faith? How can you find refuge in God's character rather than circumstances?",
  
  8: "Habakkuk struggled with unanswered questions but chose to trust God. What unanswered prayers or situations are testing your faith? How can you 'live by faith' while waiting for clarity?",
  
  9: "Zephaniah speaks of God rejoicing over you with singing. How does knowing God delights in you change your self-perception? What would change if you truly believed God sings over you?",
  
  10: "Haggai challenges priorities, asking 'Is it time for you to dwell in paneled houses?' What 'paneled houses' might be distracting you from God's priorities? How can you realign your focus?",
  
  11: "Zechariah prophesies of God's Spirit accomplishing what human strength cannot. Where are you relying too heavily on your own efforts instead of God's power? How can you 'not by might, nor by power, but by my Spirit'?",
  
  12: "Malachi confronts half-hearted worship and asks if we would offer blemished sacrifices to earthly rulers. What does wholehearted worship look like in your daily life? Where might you be giving God less than your best?",
  
  // Continue with remaining days (13-36) with varied, scripture-specific questions
  13: "What 'fortified cities' in your life need God's redemptive power? How can you surrender areas of resistance to allow God's transformative work?",
  
  14: "When facing overwhelming challenges, how do you remember and proclaim God's faithfulness? What testimony can you share of God's past provision?",
  
  15: "How does recognizing God as your 'portion' change your perspective on material security? What practical steps can you take to find contentment in God alone?",
  
  16: "In what ways do you see God's covenant love evident in difficult seasons? How can past experiences of God's faithfulness sustain your hope today?",
  
  17: "What does it mean to you that God 'delights' in your prosperity? How can you align your definition of blessing with God's heart for your flourishing?",
  
  18: "Where in your life do you need to apply Micah's call to 'act justly'? What specific actions can you take to reflect God's justice in your relationships?",
  
  19: "How does understanding God as your 'refuge' change how you handle stress and anxiety? What practical ways can you run to God instead of other comforts?",
  
  20: "What areas of your life require the kind of persistent faith Habakkuk demonstrated while waiting for God's answers? How can you cultivate patient trust?",
  
  21: "How does knowing that God 'sings over you' impact your self-worth and identity? What lies about yourself need to be replaced with this truth?",
  
  22: "What heart attitudes or life priorities need to be 'rebuilt' to honor God properly? Where has spiritual complacency crept into your routine?",
  
  23: "In what situations do you most need to remember that victory comes 'not by might, nor by power, but by my Spirit'? How can you rely more on God's strength?",
  
  24: "How can you demonstrate the same generous heart toward God that you'd expect others to show you? What offerings of time, resources, or energy is God asking for?",
  
  25: "What aspects of your character most need God's refining fire? How can you cooperate with the Holy Spirit's work of transformation in your life?",
  
  26: "How do you balance speaking prophetic truth with showing compassionate love? When is God calling you to be a voice for righteousness?",
  
  27: "What practical ways can you 'seek first the kingdom of God' in your daily decisions? How can you prioritize eternal values over temporary concerns?",
  
  28: "Where do you see evidence of God preparing you for greater service? How can you faithfully steward the gifts and opportunities He's given you?",
  
  29: "What promises of God anchor your hope when circumstances seem impossible? How can you build your life on the bedrock of God's unchanging character?",
  
  30: "How does understanding God's heart for restoration change your perspective on broken relationships or situations? Where is He calling you to participate in healing?",
  
  31: "What does wholehearted devotion to God look like in your current season of life? Where might you be holding back areas of surrender?",
  
  32: "How can you cultivate a heart that responds quickly to God's voice like the prophets did? What practices help you discern His leading?",
  
  33: "In what ways do you need to align your values with God's heart for justice and mercy? How can you be an advocate for the marginalized?",
  
  34: "What spiritual fruit is God wanting to produce in your life that requires patient cultivation? How can you cooperate with His transforming work?",
  
  35: "How does recognizing God as the ultimate authority change how you handle conflict and difficult relationships? What does biblical submission look like?",
  
  36: "As you conclude this journey through the Minor Prophets, what key themes will you carry forward? How has God's voice through these prophets shaped your understanding of His character and your calling?"
};

async function enhanceMinorProphetsReflectionQuestions() {
  console.log('🔄 Starting Minor Prophets reflection question enhancement...');
  
  try {
    // Get all days for The Minor Prophets in Order plan
    const daysResult = await pool.query(`
      SELECT rpd.id, rpd.day_number, rpd.title, rpd.scripture_reference
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rpd.plan_id = rp.id
      WHERE rp.name = 'The Minor Prophets in Order'
      ORDER BY rpd.day_number
    `);
    
    console.log(`📖 Found ${daysResult.rows.length} days to enhance`);
    
    let updatedCount = 0;
    
    for (const day of daysResult.rows) {
      const newReflectionQuestion = enhancedReflectionQuestions[day.day_number];
      
      if (newReflectionQuestion) {
        await pool.query(`
          UPDATE reading_plan_days 
          SET reflection_question = $1
          WHERE id = $2
        `, [newReflectionQuestion, day.id]);
        
        updatedCount++;
        console.log(`✅ Updated Day ${day.day_number}: ${day.title}`);
      }
    }
    
    console.log(`🎉 Enhancement complete! Updated ${updatedCount} reflection questions`);
    console.log('📊 Summary:');
    console.log(`   • Made questions scripture-specific and contextual`);
    console.log(`   • Eliminated repetitive templates`);
    console.log(`   • Added personal application elements`);
    console.log(`   • Varied question styles and approaches`);
    
  } catch (error) {
    console.error('❌ Error enhancing Minor Prophets reflection questions:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

enhanceMinorProphetsReflectionQuestions();