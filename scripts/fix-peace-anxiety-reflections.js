import { pool } from '../server/db.ts';

async function fixPeaceAnxietyReflections() {
  console.log('🎯 Creating highly specific reflection questions for Peace in Anxiety Study...');
  
  const client = await pool.connect();
  
  try {
    // Get all days from the Peace in Anxiety Study plan
    const anxietyDays = await client.query(`
      SELECT id, day_number, title, scripture_reference, scripture_text
      FROM reading_plan_days 
      WHERE plan_id = 32
      ORDER BY day_number
    `);
    
    console.log(`Found ${anxietyDays.rows.length} days in Peace in Anxiety Study plan`);
    
    let enhanced = 0;
    for (const day of anxietyDays.rows) {
      try {
        const specificReflection = createVerySpecificReflection(day.day_number, day.scripture_reference, day.scripture_text);
        
        if (specificReflection) {
          await client.query(`
            UPDATE reading_plan_days 
            SET reflection_question = $1
            WHERE id = $2
          `, [specificReflection, day.id]);
          
          console.log(`✅ Enhanced Day ${day.day_number}: ${day.scripture_reference}`);
          enhanced++;
        }
        
      } catch (error) {
        console.log(`❌ Error enhancing day ${day.id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Enhanced ${enhanced} reflection questions with highly specific content`);
  } finally {
    client.release();
  }
}

function createVerySpecificReflection(dayNumber, scriptureRef, scriptureText) {
  switch (dayNumber) {
    case 1: // Psalm 46:10
      return `"Be still and know that I am God" - this isn't just advice to relax, but a command to cease striving and acknowledge God's sovereignty. What specific activities, worries, or mental chatter make it hardest for you to "be still"? When you're anxious, how does remembering that God will "be exalted among the nations" change your perspective on your current problems? What would it look like to practically "be still" in your most anxiety-provoking situation this week?`;
      
    case 2: // Psalm 23:1-6  
      return `David declares "I shall not want" because the Lord is his shepherd, yet he acknowledges walking through "the valley of the shadow of death." How can you experience both contentment and fear simultaneously? What "valleys" are you currently walking through where you need to remember God's presence rather than just His provision? How does the image of God preparing a table "in the presence of enemies" speak to finding peace amid ongoing threats or stressors?`;
      
    case 3: // Philippians 4:6-7
      return `Paul says to be anxious "about nothing" but then gives specific instructions: prayer, petition, thanksgiving. What anxieties do you try to resolve through worry instead of bringing them to God in prayer? How might adding thanksgiving to your prayer requests change your emotional state before you even receive answers? What would it mean for God's peace to "guard" your heart and mind like a soldier standing watch?`;
      
    case 4: // Matthew 6:25-34
      return `Jesus points to birds and flowers as examples of God's care, yet humans are "much more valuable." What does this teach you about your worth to God when anxiety makes you feel forgotten or unimportant? How does Jesus' question "Who can add a single hour to their life by worrying?" challenge your belief that anxiety is somehow productive or protective? What would change if you truly lived as if tomorrow's troubles were sufficient for tomorrow?`;
      
    case 5: // 1 Peter 5:7
      return `Peter instructs us to "cast all your anxiety on Him" using a word that means to throw or hurl with force. What anxieties are you trying to manage yourself instead of literally throwing them onto God? How is "casting" different from just mentioning your worries in prayer? What specific worries do you keep picking back up after you've supposedly given them to God, and why do you think you do this?`;
      
    case 6: // Isaiah 26:3
      return `Perfect peace comes to minds that are "steadfast" - firmly fixed and unwavering in focus on God. What thoughts, media, or conversations consistently pull your mind away from focusing on God? How might your peace be connected to what you choose to dwell on rather than just your circumstances? When your mind wanders to worst-case scenarios, what specific truths about God could you redirect your thoughts toward?`;
      
    case 7: // John 14:27
      return `Jesus distinguishes His peace from worldly peace - His doesn't depend on favorable circumstances. What situations make you realize you've been seeking worldly peace (comfort, control, predictability) rather than Christ's peace? How does Jesus saying "Let not your hearts be troubled" suggest that we have some choice in our emotional responses? What would it mean to experience Christ's peace in the midst of unchanging difficult circumstances?`;
      
    default:
      return `This passage addresses a specific aspect of anxiety and God's response to our fears. What particular worry or fear does this scripture speak to most directly in your current situation? How does this truth about God's character challenge your typical anxiety responses? What would change in your daily life if you deeply believed what this passage teaches?`;
  }
}

fixPeaceAnxietyReflections().catch(console.error);