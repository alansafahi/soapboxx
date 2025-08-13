import { pool } from '../server/db.ts';

async function createScriptureSpecificReflections() {
  console.log('🔧 Creating scripture-specific, profound reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // Get days that are using our generic template
    const result = await client.query(`
      SELECT id, day_number, title, scripture_reference, LEFT(devotional_content, 500) as devotional_preview
      FROM reading_plan_days 
      WHERE plan_id = 23 AND 
        reflection_question = 'How does this passage reveal God''s character and His relationship with His people? What specific attributes of God do you see displayed in this ancient narrative?

What themes of faith, obedience, or covenant relationship emerge from this text? How do these timeless themes connect to your personal spiritual journey and contemporary challenges?

In what ways does this passage speak to modern struggles you face? How can the principles and truths demonstrated here guide your decisions, relationships, and spiritual growth?

What does this text teach about the nature of spiritual maturity and transformation? How is God calling you to deeper commitment and trust through these sacred words that have shaped believers for millennia?'
      ORDER BY day_number 
      LIMIT 100
    `);
    
    console.log(`📖 Creating specific reflections for ${result.rows.length} days...`);
    
    // Create scripture-specific reflections based on the passage
    const scriptureReflections = {
      1: `When you consider that God spoke the universe into existence with mere words, what does this reveal about the power of His voice in your life today? How might listening more intently to His Word transform your perspective on the struggles you face?

Genesis 1 shows God creating order from chaos through His spoken word. In what areas of your life do you need God to speak order into chaos? What would it look like to trust His creative power over your circumstances?

Notice how God saw that His creation was "good" at each stage. How does knowing you are made in God's image - declared "very good" by your Creator - challenge the negative voices in your head or the world around you?

The text shows God resting on the seventh day, not from exhaustion but as a model for us. How does this challenge our culture's obsession with constant productivity? What would it look like to embrace God's rhythm of work and rest in your daily life?`,

      2: `God declares it is "not good" for man to be alone before sin ever entered the world. What does this teach you about God's design for human relationships and community? How might this challenge individualistic approaches to faith?

Adam names the animals but finds no suitable companion among them. What does this reveal about the unique nature of human relationships and your need for deep, spiritual connection with others who bear God's image?

Eve is described as Adam's "helper" - the same Hebrew word used to describe God as our helper. How does this elevate your understanding of partnership, whether in marriage, friendship, or ministry? What does it mean to be someone's helper in the truest sense?

The passage shows perfect intimacy without shame before the Fall. What barriers to authentic, vulnerable relationship exist in your life? How might God's design for transparent community challenge the masks you wear?`,

      3: `The serpent's first tactic is to question God's word: "Has God really said...?" How do you see this same strategy playing out in contemporary culture and in your own thought life? What specific truths of God are being challenged in your heart?

Notice that Eve saw the fruit was "good for food, pleasing to the eyes, and desirable for gaining wisdom" - three categories that encompass most human temptation. Which of these areas represents your greatest vulnerability, and how can you prepare for spiritual battle?

After sinning, Adam and Eve hide from God and make coverings for themselves. In what ways do you still try to hide from God or cover your shame through your own efforts rather than receiving His forgiveness and righteousness?

God's first question after the Fall is "Where are you?" - not because He didn't know, but to invite confession. How is God asking "Where are you?" in your current season? What areas of your life need to be brought into His light?`
    };

    let updated = 0;
    
    for (const row of result.rows) {
      const dayNumber = row.day_number;
      let reflection;
      
      if (scriptureReflections[dayNumber]) {
        reflection = scriptureReflections[dayNumber];
      } else {
        // Create a contextual reflection based on the scripture reference
        const book = row.scripture_reference.split(' ')[0];
        reflection = createContextualReflection(book, row.title, row.scripture_reference);
      }
      
      try {
        await client.query(
          'UPDATE reading_plan_days SET reflection_question = $1 WHERE id = $2',
          [reflection, row.id]
        );
        
        console.log(`✅ Created specific reflection for Day ${row.day_number}: ${row.title}`);
        updated++;
      } catch (error) {
        console.log(`❌ Error updating Day ${row.day_number}: ${error.message}`);
      }
    }
    
    console.log(`📊 Created ${updated} scripture-specific reflection questions`);
  } finally {
    client.release();
  }
}

function createContextualReflection(book, title, scriptureRef) {
  // Genesis reflections
  if (book === 'Genesis') {
    return `What foundational truths about God's character are established in this Genesis passage that remain unchanging throughout Scripture? How do these ancient revelations speak to questions you're wrestling with today?

This early narrative reveals patterns of human nature that persist across all generations. What behaviors, motivations, or struggles do you recognize in yourself from these ancient characters?

Genesis is called the "book of beginnings." What new beginning might God be calling you toward through this passage? How does this text challenge you to see your current circumstances as part of God's larger story of redemption?

Consider how this passage sets the stage for God's redemptive plan that culminates in Christ. What glimpses of the gospel can you detect even in these Old Testament verses, and how does this deepen your appreciation for God's eternal purposes?`;
  }
  
  // Exodus reflections
  if (book === 'Exodus') {
    return `The Exodus represents God's power to deliver His people from bondage. What forms of spiritual, emotional, or relational "Egypt" might God be calling you to leave behind? What would true freedom look like in your life?

Moses' encounter with God transformed him from a reluctant leader to a bold deliverer. How is God preparing you through your current circumstances to serve Him more fully? What fears or inadequacies need to be surrendered to His strength?

The plagues demonstrate God's supremacy over false gods and earthly powers. What "gods" in your life - success, security, approval - need to be dethroned by your allegiance to the one true God?

The Israelites often longed to return to Egypt despite their oppression. What aspects of your old life or former patterns do you find yourself missing, even though they weren't God's best for you? How can you cultivate gratitude for God's deliverance?`;
  }
  
  // Default profound reflection
  return `What attributes of God's character shine through this passage that challenge or comfort your heart today? How do these divine qualities invite you to trust Him more deeply in your current circumstances?

The people in this ancient text faced real struggles, doubts, and decisions that mirror your own human experience. What specific wisdom or warning does their story offer for the challenges you're navigating?

Consider how this passage reveals both human frailty and divine grace. What does this teach you about your need for God's strength, forgiveness, or guidance in areas where you've been trying to manage on your own?

How might God be using the truths in this text to prepare you for greater faith, service, or intimacy with Him? What specific step of obedience or trust is He inviting you to take in response to His Word?`;
}

createScriptureSpecificReflections().catch(console.error);