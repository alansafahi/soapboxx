import { pool } from '../server/db.ts';

async function fixPeaceAnxietyDevotionals() {
  console.log('🎯 Creating specific devotional content for Peace in Anxiety Study Reflection section...');
  
  const client = await pool.connect();
  
  try {
    // Get all days from the Peace in Anxiety Study plan
    const anxietyDays = await client.query(`
      SELECT id, day_number, title, scripture_reference, scripture_text, devotional_content
      FROM reading_plan_days 
      WHERE plan_id = 32
      ORDER BY day_number
    `);
    
    console.log(`Found ${anxietyDays.rows.length} days in Peace in Anxiety Study plan`);
    
    let enhanced = 0;
    for (const day of anxietyDays.rows) {
      try {
        const specificDevotional = createSpecificDevotionalContent(day.day_number, day.scripture_reference, day.scripture_text);
        
        if (specificDevotional) {
          await client.query(`
            UPDATE reading_plan_days 
            SET devotional_content = $1
            WHERE id = $2
          `, [specificDevotional, day.id]);
          
          console.log(`✅ Enhanced Day ${day.day_number}: ${day.scripture_reference}`);
          enhanced++;
        }
        
      } catch (error) {
        console.log(`❌ Error enhancing day ${day.id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Enhanced ${enhanced} devotional content sections with specific, meaningful content`);
  } finally {
    client.release();
  }
}

function createSpecificDevotionalContent(dayNumber, scriptureRef, scriptureText) {
  switch (dayNumber) {
    case 1: // Isaiah 26:3
      return `Isaiah's promise of "perfect peace" comes with a condition: minds that are "steadfast" - firmly fixed and unwavering in focus on God. This isn't a casual suggestion to think positive thoughts, but a call to mental discipline in the midst of chaos.

The Hebrew word for "steadfast" (samak) means to lean upon, rely on, or be supported by something solid. When anxiety floods our minds with worst-case scenarios and endless "what-ifs," God calls us to lean our mental weight entirely upon His unchanging character and faithful promises.

Perfect peace isn't the absence of storms, but the presence of unshakeable trust that God remains sovereign even when circumstances feel out of control.`;
      
    case 2: // Matthew 6:25-26
      return `Jesus points to birds as teachers of trust - they don't plant crops or build barns, yet your heavenly Father feeds them daily. But notice Jesus doesn't say birds don't work; they actively search for food each day. The lesson isn't about passivity, but about working without worry.

The phrase "much more valuable" reveals how God sees you compared to His care for creation. If He attends to sparrows, how much more will He attend to you - His image-bearer, His beloved child, the one for whom Christ died?

Your anxiety about provision might actually be questioning God's assessment of your worth. When worry whispers "God has forgotten you," Jesus responds with the economics of divine love: you are infinitely more precious than anything else He feeds and clothes in creation.`;
      
    case 3: // John 14:27
      return `Jesus distinguishes His peace from worldly peace - His doesn't depend on favorable circumstances, secure finances, or predictable outcomes. Worldly peace is the absence of trouble; Christ's peace is the presence of His Spirit in the midst of trouble.

His words "Let not your hearts be troubled" suggest we have some agency in our emotional responses. While we can't control circumstances, we can choose where we anchor our hearts. This isn't positive thinking, but deliberate trust in Christ's promises and presence.

The peace Jesus gives is the same peace He experienced sleeping in a storm-tossed boat while experienced fishermen panicked around Him. It's the peace that comes from knowing your Father controls both the winds and the waves.`;
      
    case 4: // 1 Peter 5:7
      return `Peter's instruction to "cast all your anxiety on Him" uses a word meaning to throw or hurl something with force. This isn't gently mentioning your worries in prayer, but actively, forcefully throwing your mental burdens onto God like someone hurling luggage onto a cart.

The reason we can cast our cares on Him is because "He cares for you" - not just about your problems, but about YOU. Your anxiety matters to God not primarily because of what you're worried about, but because of how worry affects His beloved child.

Many believers struggle with repeatedly picking up anxieties they've supposedly given to God. The act of "casting" implies a deliberate choice to leave your burdens with Someone infinitely more capable of handling them than you are.`;
      
    case 5: // Psalm 23:1-6
      return `David's declaration "I shall not want" seems impossible when facing genuine needs and threats, yet it flows from understanding who his Shepherd is. The good shepherd doesn't just rescue sheep from danger - he leads them to green pastures and still waters even while valleys and enemies remain nearby.

The image of God preparing a table "in the presence of enemies" is striking - not after the enemies are defeated, but while they're still watching. God's provision doesn't wait for perfect circumstances; it comes in the midst of opposition and uncertainty.

David's confidence in goodness and mercy following him "all the days of my life" suggests that anxiety often stems from forgetting God's track record. When we remember how faithfully He has shepherded us through previous valleys, current fears lose their power to overwhelm.`;
      
    case 6: // Psalm 46:10
      return `"Be still and know that I am God" is not a suggestion for relaxation techniques, but a command to cease striving and acknowledge divine sovereignty. The Hebrew word for "be still" (raphah) means to let go, to stop fighting, to release your grip on control.

This verse comes in the context of earth-shaking chaos - mountains falling into the sea, nations raging, kingdoms tottering. God's call to stillness isn't because circumstances are peaceful, but because He remains unchanged and in control despite the chaos.

The promise that God "will be exalted among the nations" reminds us that our personal anxieties are part of a much larger story where God's glory will ultimately be displayed. Our stillness becomes an act of faith that God's purposes will prevail regardless of our current circumstances.`;
      
    case 7: // Philippians 4:6-7
      return `Paul's instruction to be anxious about "nothing" seems unrealistic until we see his alternative: specific prayer for everything. Rather than worrying about problems, we're called to present our requests to God with thanksgiving - acknowledging His past faithfulness while asking for present help.

The "peace that surpasses understanding" isn't peace that makes logical sense given your circumstances, but peace that transcends human logic entirely. It's the peace that guards your heart and mind like a sentinel, protecting your thoughts from anxiety's attacks.

Notice the progression: don't be anxious, do pray with thanksgiving, and God's peace will guard your heart. This isn't a formula for getting what you want, but a pathway to experiencing God's presence and peace regardless of the outcome of your requests.`;
      
    default:
      return `This passage addresses anxiety with specific truths about God's character and care. When fear and worry threaten to overwhelm, these words offer divine perspective that transforms how we view both our circumstances and our God.

The peace God offers isn't dependent on changing your situation, but on changing your understanding of who holds your situation. In a world filled with uncertainty, His promises remain unshakeable anchors for the anxious soul.`;
  }
}

fixPeaceAnxietyDevotionals().catch(console.error);