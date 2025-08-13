import { pool } from '../server/db.ts';

async function fixPrayerWorshipPlan() {
  console.log('🎯 Fixing Prayer & Worship plan - enhancing devotional content and reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // First find the Prayer & Worship plan
    const planQuery = await client.query(`
      SELECT id FROM reading_plans 
      WHERE name LIKE '%Prayer%' AND name LIKE '%Worship%'
      ORDER BY id LIMIT 1
    `);
    
    if (planQuery.rows.length === 0) {
      console.log('❌ Prayer & Worship plan not found');
      return;
    }
    
    const planId = planQuery.rows[0].id;
    console.log(`📋 Found Prayer & Worship plan with ID: ${planId}`);
    
    // Get all days from the Prayer & Worship plan
    const planDays = await client.query(`
      SELECT id, day_number, title, scripture_reference, scripture_text, devotional_content, reflection_question
      FROM reading_plan_days 
      WHERE plan_id = $1
      ORDER BY day_number
    `, [planId]);
    
    console.log(`Found ${planDays.rows.length} days in Prayer & Worship plan`);
    
    let fixed = 0;
    for (const day of planDays.rows) {
      try {
        const improvements = createPrayerWorshipContent(day.day_number, day.title, day.scripture_reference, day.scripture_text);
        
        if (improvements) {
          await client.query(`
            UPDATE reading_plan_days 
            SET devotional_content = $1, reflection_question = $2
            WHERE id = $3
          `, [improvements.devotional, improvements.reflection, day.id]);
          
          console.log(`✅ Fixed Day ${day.day_number}: ${day.title}`);
          fixed++;
        }
        
      } catch (error) {
        console.log(`❌ Error fixing day ${day.id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Fixed ${fixed} days with prayer and worship-specific devotional content and meaningful reflection questions`);
  } finally {
    client.release();
  }
}

function createPrayerWorshipContent(dayNumber, title, scriptureRef, scriptureText) {
  // Create specific content based on prayer and worship themes
  const contentMap = {
    "The Lord's Prayer Model": {
      devotional: `Jesus' model prayer in Matthew 6 isn't a formula to recite but a framework for relationship. It begins with "Our Father" - establishing intimacy and family connection before making any requests. "Hallowed be your name" reminds us that worship precedes petition.

The prayer's structure reveals God's priorities: His glory and kingdom first, then our daily needs. "Your will be done" positions us as willing participants in God's purposes rather than demanding our own agenda be fulfilled.

This isn't just a prayer to pray but a pattern to live - approaching each day with reverence for God, surrender to His will, trust for provision, humility for forgiveness, and dependence for spiritual protection.`,
      reflection: `Jesus taught us to begin prayer with "Our Father in heaven, hallowed be your name" - worship before requests. How does starting with God's character and holiness change the tone and content of your prayers? What would happen if you spent more time in the "Your will be done" part of prayer rather than rushing to your personal requests? How might viewing daily bread, forgiveness, and spiritual protection as daily needs rather than occasional prayers transform your dependence on God?`
    },

    "Continuous Prayer": {
      devotional: `Paul's instruction to "pray continually" doesn't mean non-stop talking but maintaining constant awareness of God's presence. Like breathing, prayer becomes the natural rhythm of life - not confined to scheduled times but woven throughout every moment and circumstance.

"Rejoice always" seems impossible until linked with continuous prayer and thanksgiving. When prayer becomes our default response to every situation - joy, difficulty, confusion, celebration - we discover reasons for gratitude even in unexpected places.

This isn't performance-based spirituality but relationship-based living. Continuous prayer transforms mundane activities into opportunities for communion with God, making every moment sacred and every circumstance a chance to experience His presence.`,
      reflection: `Paul commands us to "pray continually" and "give thanks in all circumstances." What would change in your daily routine if you treated prayer as ongoing conversation rather than scheduled meetings with God? How does the connection between continuous prayer and finding reasons to "rejoice always" challenge your typical responses to difficult situations? What practical steps could help you maintain awareness of God's presence during ordinary activities like work, driving, or household tasks?`
    },

    "Drawing Near to God": {
      devotional: `James promises that drawing near to God results in God drawing near to us, revealing prayer as mutual pursuit rather than one-sided effort. This nearness isn't about physical proximity but spiritual intimacy - God responds to sincere hearts that seek genuine relationship over mere religious activity.

The context of James 4 addresses the heart attitudes that create distance from God - pride, worldliness, double-mindedness. Drawing near requires honest self-examination and humble submission, recognizing that barriers to intimacy often originate in our hearts rather than God's availability.

God's desire for closeness exceeds our own. Every step we take toward Him is met with His movement toward us, creating a divine dance of relationship where His presence becomes increasingly real and accessible.`,
      reflection: `James promises that if you "draw near to God, He will draw near to you." What barriers in your heart or habits might be creating distance between you and God that you need to honestly examine? How have you experienced God's responsiveness when you've made genuine efforts to seek Him through prayer and worship? What would it mean for God to "draw near" to your current circumstances and emotional state?`
    },

    "Worship in Spirit": {
      devotional: `Jesus' declaration that "God is spirit" redefines worship from external ritual to internal reality. Worship "in spirit and truth" isn't about location, music style, or ceremonial correctness, but about heart alignment with God's character and genuine expression of reverence and love.

The woman at the well's question about proper worship location becomes irrelevant when worship is understood as spiritual communion rather than physical performance. True worship engages our entire being - mind, heart, and will - in response to who God is rather than what we want from Him.

Spirit-and-truth worship is both deeply personal and completely God-centered. It springs from understanding God's nature and responding with authentic praise, surrender, and adoration regardless of external circumstances or settings.`,
      reflection: `Jesus told the Samaritan woman that true worshipers worship "in spirit and truth." How does understanding that worship is about heart attitude rather than external performance change your approach to both private and corporate worship? What truths about God's character most naturally inspire worship and praise in your heart? When you consider worshiping God "in spirit," what barriers (distractions, doubts, spiritual dryness) need to be addressed for your worship to become more authentic?`
    },

    "Persistent Prayer": {
      devotional: `Jesus' parable of the persistent widow doesn't suggest we must wear God down with repetition, but reveals His heart toward those who refuse to give up in prayer. The unjust judge grants the widow's request to avoid annoyance, but God grants our requests because of love and justice.

Persistence in prayer isn't about changing God's mind but aligning our hearts with His purposes and timing. Through continued prayer, we often discover what we really need, release control of outcomes, and develop trust in God's wisdom and character.

The question "when the Son of Man comes, will he find faith on earth?" connects persistent prayer with enduring faith. Those who continue praying when answers are delayed demonstrate the faith that pleases God and experiences His faithful response.`,
      reflection: `Jesus taught about persistent prayer through the parable of the widow who kept asking an unjust judge for justice. What situations in your life require the kind of persistent, patient prayer that doesn't give up when answers are delayed? How does knowing that God loves justice and cares about your concerns more than the unjust judge change your motivation for continuing to pray? What does it mean for you to maintain faith while praying persistently, especially when circumstances seem unchanged?`
    }
  };

  // Get content based on title, or create generic prayer/worship content
  let content;
  if (contentMap[title]) {
    content = contentMap[title];
  } else {
    // Create meaningful prayer and worship content for unmapped titles
    content = {
      devotional: `Prayer and worship form the foundation of vibrant spiritual life, creating space for intimate communion with God beyond religious routine. Through prayer, we bring our authentic selves - including doubts, fears, and celebrations - into conversation with the Creator who knows us completely and loves us unconditionally.

Worship shifts our focus from our circumstances to God's character, reminding us of His faithfulness, power, and love when life feels uncertain. This practice of redirecting attention from problems to God's nature transforms both our perspective and our capacity to trust Him with our concerns.

As you engage with today's scripture about prayer and worship, consider how these spiritual disciplines can become natural expressions of relationship rather than obligatory religious activities.`,
      
      reflection: `This passage addresses essential aspects of prayer and worship in the believer's life. How does this scripture challenge or encourage your current approach to communicating with God and expressing worship? What barriers (time, distraction, spiritual dryness) currently limit your experience of meaningful prayer and worship? How might incorporating the truth from today's passage transform your daily spiritual practices and your sense of connection with God?`
    };
  }

  return content;
}

fixPrayerWorshipPlan().catch(console.error);