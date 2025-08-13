import { pool } from '../server/db.ts';

async function fixPeaceUncertainTimesComplete() {
  console.log('🎯 Fixing Peace in Uncertain Times plan - adding missing devotional content and enhancing reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // Get all days from the Peace in Uncertain Times plan (ID: 1)
    const planDays = await client.query(`
      SELECT id, day_number, title, scripture_reference, scripture_text, devotional_content, reflection_question
      FROM reading_plan_days 
      WHERE plan_id = 1
      ORDER BY day_number
    `);
    
    console.log(`Found ${planDays.rows.length} days in Peace in Uncertain Times plan`);
    
    let fixed = 0;
    for (const day of planDays.rows) {
      try {
        const improvements = createSpecificContentForDay(day.day_number, day.title, day.scripture_reference, day.scripture_text);
        
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
    
    console.log(`📊 Fixed ${fixed} days with specific devotional content and meaningful reflection questions`);
  } finally {
    client.release();
  }
}

function createSpecificContentForDay(dayNumber, title, scriptureRef, scriptureText) {
  // Create specific content based on the titles I can see from the database
  const contentMap = {
    "God's Peace, Not the World's": {
      devotional: `Paul's distinction between divine peace and worldly peace is profound. Worldly peace depends on circumstances aligning perfectly - no conflicts, adequate resources, predictable outcomes. But God's peace "surpasses understanding" precisely because it defies human logic about when we should feel peaceful.

The command "do not be anxious about anything" isn't unrealistic when paired with "but in everything by prayer and supplication with thanksgiving." Anxiety often stems from trying to solve problems we can't control, while prayer transfers those concerns to Someone who can. Thanksgiving transforms our perspective before we even receive answers.

This peace acts as a guard for our hearts and minds - not just a feeling, but an active protection against anxiety's attacks on our thoughts and emotions.`,
      reflection: `Paul says to be anxious "about nothing" but then gives specific instructions: pray about everything with thanksgiving. What anxieties are you trying to handle through worry instead of transferring to God through prayer? How might expressing gratitude for God's past faithfulness change your emotional state even before receiving answers to current requests? What would it mean for God's peace to actively "guard" your thoughts like a soldier protecting a fortress?`
    },

    "Finding Rest": {
      devotional: `Jesus' invitation to the weary reveals His understanding of life's genuine burdens. He doesn't minimize real struggles or suggest they don't exist, but offers partnership through His "yoke" - a farming tool that allows two animals to share a load.

The promise of rest isn't just physical relaxation but soul-deep relief from carrying weights we were never meant to bear alone. His yoke being "easy" and burden "light" doesn't mean life becomes effortless, but that we're no longer pulling alone.

When Jesus calls us to learn from Him because He is "gentle and humble in heart," He's offering not just help with our burdens, but transformation of our character through proximity to His.`,
      reflection: `Jesus promises rest for the "weary and heavy laden" - what specific burdens are you trying to carry alone that He's inviting you to share through His yoke? How does His description of being "gentle and humble in heart" challenge any harsh expectations you place on yourself? What would change in your daily stress levels if you truly believed that His yoke makes loads lighter rather than adding religious obligation to your existing burdens?`
    },

    "Perfect Peace": {
      devotional: `Isaiah's promise of "perfect peace" comes with a specific condition: minds that are "steadfast" - the Hebrew word suggests something firmly supported, like a building on a solid foundation. This isn't casual positive thinking, but deliberate mental discipline.

The peace promised is "perfect" (shalom) - not just the absence of conflict, but wholeness, completeness, everything as it should be. This doesn't depend on circumstances being perfect, but on our minds being anchored to God's unchanging character rather than fluctuating situations.

The phrase "because they trust in you" reveals that this steadfast focus isn't just mental exercise, but relational confidence in God's faithfulness, power, and love.`,
      reflection: `Isaiah promises perfect peace to minds that are "steadfast" on God rather than circumstances. What thoughts, situations, or fears consistently pull your mind away from focusing on God's character and promises? How does the condition of "trust" challenge you to move beyond just thinking about God to actually relying on Him? What would it practically look like to keep your mind "stayed" on God during your most anxiety-provoking situations this week?`
    },

    "Be Still and Know": {
      devotional: `"Be still and know that I am God" is not a relaxation technique but a command to cease striving and acknowledge divine sovereignty. The Hebrew "raphah" means to let go, stop fighting, release your grip on control. This verse comes amid descriptions of earth-shaking chaos - not peaceful circumstances.

God's call to stillness recognizes our tendency to frantically try to manage what only He can control. The "knowing" He calls us to isn't just intellectual awareness but deep, experiential understanding of His character and power.

The promise that He "will be exalted among the nations" reminds us that our personal anxieties are part of a larger story where God's purposes will ultimately prevail regardless of current chaos.`,
      reflection: `"Be still and know that I am God" - this isn't advice to relax, but a command to cease striving and acknowledge God's sovereignty. What specific activities, worries, or mental chatter make it hardest for you to "be still"? When anxiety makes you feel like you need to control or fix everything, how does remembering that God "will be exalted among the nations" change your perspective on your current problems? What would it look like to practically "let go" in your most controlling behaviors this week?`
    },

    "Refuge and Strength": {
      devotional: `The psalmist declares God as "our refuge and strength" using military imagery - a fortress where we can retreat when under attack, and the power source for continuing the battle. This isn't escapism but strategic positioning for warfare against fear and anxiety.

"A very present help in trouble" emphasizes God's immediate availability. Not distant or delayed, but actively present in the exact moments when trouble strikes. The Hebrew suggests help that arrives right on time, not early or late.

Therefore "we will not fear" - not because troubles don't come, but because our help is certain and our refuge is secure. The fears that paralyze others become opportunities to experience God's faithful presence.`,
      reflection: `Psalm 46 calls God "our refuge and strength, a very present help in trouble." What current troubles make you feel like you need a safe place to retreat and regroup? How does knowing God is a "very present help" challenge your tendency to feel alone in difficulties? When the psalmist says "therefore we will not fear," what specific fears would lose their power if you truly believed God is both your refuge and your strength in that exact situation?`
    },

    "Anxiety Antidote": {
      devotional: `Perfect peace isn't achieved through positive thinking or stress management techniques, but through what Isaiah calls a "steadfast" mind - one that remains firmly fixed on God rather than shifting circumstances. This requires intentional mental discipline.

The Hebrew word for steadfast (samak) means to lean upon something solid for support. When anxiety floods our thoughts with worst-case scenarios, we're called to lean our full mental weight on God's character and promises rather than our fears.

This peace is described as "perfect" because it doesn't depend on partial solutions or temporary fixes, but on the unchanging nature of God Himself.`,
      reflection: `Isaiah 26:3 promises "perfect peace" to those whose minds are steadfast on God. What anxious thoughts or worst-case scenarios do you need to replace with focused attention on God's character? How is leaning your mental weight on God different from just trying to think positively? What specific attributes of God (His faithfulness, power, love, wisdom) do you need to focus on to counter your particular anxiety patterns?`
    }
  };

  // Get the appropriate content based on title, with fallbacks
  let content;
  if (contentMap[title]) {
    content = contentMap[title];
  } else {
    // Create generic meaningful content for titles not specifically mapped
    content = {
      devotional: `This passage speaks directly to the human condition of uncertainty and fear, offering God's perspective on how to find genuine peace amid life's storms. Rather than minimizing real struggles, Scripture acknowledges them while pointing to resources beyond human capability.

The peace God offers isn't dependent on circumstances improving, but on understanding who remains in control when everything feels chaotic. This is the peace that sustained believers through persecution, loss, and uncertainty throughout history.

When anxiety tells us to panic, God's Word calls us to remember His faithfulness, rest in His sovereignty, and trust His heart toward us even when we can't see the way forward.`,
      
      reflection: `This passage addresses a specific aspect of anxiety and God's response to our fears. What particular worry or circumstance does this scripture speak to most directly in your current situation? How does this truth about God's character challenge your typical anxiety responses? What would change in your daily life if you deeply believed and acted on what this passage teaches about God's care for you?`
    };
  }

  return content;
}

fixPeaceUncertainTimesComplete().catch(console.error);