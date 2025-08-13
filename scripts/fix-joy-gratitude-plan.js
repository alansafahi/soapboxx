import { pool } from '../server/db.ts';

async function fixJoyGratitudePlan() {
  console.log('🔧 Fixing Joy in Gratitude plan reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // Get the Joy in Gratitude plan ID first
    const planResult = await client.query(`
      SELECT id FROM reading_plans WHERE name LIKE '%Joy in Gratitude%'
    `);
    
    if (planResult.rows.length === 0) {
      console.log('❌ Joy in Gratitude plan not found');
      return;
    }
    
    const planId = planResult.rows[0].id;
    console.log(`📖 Found Joy in Gratitude plan: ID ${planId}`);
    
    // Get all days from this plan
    const daysResult = await client.query(`
      SELECT id, day_number, title, scripture_reference
      FROM reading_plan_days 
      WHERE plan_id = $1
      ORDER BY day_number
    `, [planId]);
    
    console.log(`Found ${daysResult.rows.length} days to fix`);
    
    const specificReflections = {
      1: `Nehemiah's declaration "the joy of the Lord is your strength" transforms our understanding of spiritual resilience. When you face overwhelming circumstances, how might drawing on God's joy - rather than your own optimism - provide a different kind of strength?

This verse comes in the context of God's people rediscovering His Word after years of neglect. What role does Scripture play in cultivating joy that sustains you through difficulty? How is biblical joy different from temporary happiness?

Notice that this joy is specifically "of the Lord" - it belongs to Him and flows from His character. What aspects of God's nature, promises, or works consistently bring you joy even when external circumstances are challenging?

The people were initially weeping when they heard God's Word, but Nehemiah redirects them toward celebration. How might guilt or regret be robbing you of the joy God intends? What would it look like to receive His grace with celebration rather than shame?`,
      
      2: `This verse connects continuous praise with God's will for believers. What does "in all circumstances" reveal about the scope of gratitude God desires? Which specific circumstances in your life feel most challenging to approach with thanksgiving?

Paul links rejoicing, prayer, and gratitude as God's will "in Christ Jesus." How does your union with Christ change what you have to be grateful for, even in difficult seasons? What does it mean to give thanks from a position of being "in Christ"?

The command to "pray continually" suggests that gratitude and prayer are interconnected spiritual disciplines. How might viewing your daily struggles as opportunities for both prayer and thanksgiving transform your perspective on stress or worry?

Notice this isn't a suggestion but God's will for your life. What resistance do you feel toward continuous gratitude, and what might God want to heal or transform in your heart to make such thanksgiving possible?`,
      
      3: `David declares God as the source of daily joy and gladness. In a culture that often seeks joy through achievements, relationships, or circumstances, how does finding joy in God's presence offer more stability and fulfillment?

The phrase "This is the day the Lord has made" suggests each day is a deliberate gift from God's hands. How might viewing today as God's specific provision for you change your attitude toward ordinary moments, mundane tasks, or unexpected challenges?

The decision to "rejoice and be glad" is presented as a choice rather than a feeling. When your emotions don't naturally align with gratitude, what practices or truths help you choose joy as an act of faith and obedience?

This psalm of celebration followed times of great difficulty and waiting. How do seasons of struggle often prepare our hearts to recognize and appreciate God's goodness more deeply? What current difficulties might God be using to increase your capacity for gratitude?`,
      
      4: `David's confidence in God's deliverance comes from remembering past faithfulness. What specific ways has God proven Himself faithful in your story? How does rehearsing His past goodness strengthen your trust in current uncertainties?

The psalmist moves from crying out in distress to peaceful sleep, trusting God's protection. What worries are currently disrupting your peace or sleep? How might surrendering these concerns to God's care affect your ability to rest?

David faces "many foes" but focuses on the Lord as his shield and glory. When surrounded by opposition, criticism, or spiritual attack, how does remembering God as your protector change your response to those who oppose you?

The psalm emphasizes that deliverance comes from the Lord alone, not human strength or strategy. In what areas are you trying to solve problems through your own efforts rather than trusting God's intervention? What would dependency on Him look like practically?`,
      
      5: `Jesus calls His followers the "salt of the earth," implying both preservation and flavor. In what specific relationships or environments is God calling you to be a preserving influence against moral decay? How does your presence bring "flavor" to otherwise mundane interactions?

Light cannot be hidden - it naturally dispels darkness by its very presence. What areas of your life might be dimming your spiritual light through compromise, fear, or conformity? How can you shine more brightly without becoming prideful or judgmental?

The purpose of good works isn't personal recognition but to bring glory to "your Father in heaven." How does this shift your motivation for serving others, showing kindness, or living ethically? What changes when glory goes to God rather than yourself?

Jesus assumes His followers will be salt and light, not just encourages them to try. What does this reveal about your identity in Christ? How might believing this truth about yourself change the way you approach daily interactions and decisions?`,
      
      6: `This verse connects continuous praise with God's will for believers. What does "in all circumstances" reveal about the scope of gratitude God desires? Which specific circumstances in your life feel most challenging to approach with thanksgiving?

Paul links rejoicing, prayer, and gratitude as God's will "in Christ Jesus." How does your union with Christ change what you have to be grateful for, even in difficult seasons? What does it mean to give thanks from a position of being "in Christ"?

The command to "pray continually" suggests that gratitude and prayer are interconnected spiritual disciplines. How might viewing your daily struggles as opportunities for both prayer and thanksgiving transform your perspective on stress or worry?

Notice this isn't a suggestion but God's will for your life. What resistance do you feel toward continuous gratitude, and what might God want to heal or transform in your heart to make such thanksgiving possible?`,
      
      7: `Nehemiah's declaration "the joy of the Lord is your strength" transforms our understanding of spiritual resilience. When you face overwhelming circumstances, how might drawing on God's joy - rather than your own optimism - provide a different kind of strength?

This verse comes in the context of God's people rediscovering His Word after years of neglect. What role does Scripture play in cultivating joy that sustains you through difficulty? How is biblical joy different from temporary happiness?

Notice that this joy is specifically "of the Lord" - it belongs to Him and flows from His character. What aspects of God's nature, promises, or works consistently bring you joy even when external circumstances are challenging?

The people were initially weeping when they heard God's Word, but Nehemiah redirects them toward celebration. How might guilt or regret be robbing you of the joy God intends? What would it look like to receive His grace with celebration rather than shame?`
    };
    
    let fixed = 0;
    for (const day of daysResult.rows) {
      const reflection = specificReflections[day.day_number] || createContextualGratitudeReflection(day);
      
      try {
        await client.query(
          'UPDATE reading_plan_days SET reflection_question = $1 WHERE id = $2',
          [reflection, day.id]
        );
        
        console.log(`✅ Fixed Day ${day.day_number}: ${day.title}`);
        fixed++;
      } catch (error) {
        console.log(`❌ Error fixing Day ${day.day_number}: ${error.message}`);
      }
    }
    
    console.log(`📊 Fixed ${fixed} days in Joy in Gratitude plan`);
  } finally {
    client.release();
  }
}

function createContextualGratitudeReflection(day) {
  return `This passage speaks to the heart of gratitude and joy in the believer's life. What specific truth about God's character or provision in this text gives you reason for thanksgiving, even in difficult circumstances?

Consider how the people or situation described here demonstrate either gratitude or ingratitude toward God. What can you learn from their example about maintaining a heart of thanksgiving in your own journey?

Gratitude often requires a shift in perspective from what we lack to what God has provided. How does this passage challenge you to see your current circumstances through the lens of God's goodness and faithfulness?

Joy and gratitude are not merely emotions but choices and spiritual disciplines. What specific practice or response does this passage call you toward in cultivating a more thankful heart in your daily life?`;
}

fixJoyGratitudePlan().catch(console.error);