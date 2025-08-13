import { pool } from '../server/db.ts';

async function fixMajorPlans() {
  console.log('🔧 Fixing reflection questions for major reading plans...');
  
  const client = await pool.connect();
  
  try {
    // Priority plans to fix
    const majorPlans = [22, 24, 44]; // New Testament, Daily Psalms, Psalms & Proverbs
    
    for (const planId of majorPlans) {
      console.log(`\n📖 Fixing Plan ${planId}...`);
      
      // Get plan info
      const planInfo = await client.query(`
        SELECT name, description FROM reading_plans WHERE id = $1
      `, [planId]);
      
      console.log(`Plan: ${planInfo.rows[0]?.name}`);
      
      // Get days needing fixes (placeholder patterns or short reflections)
      const daysNeedingFix = await client.query(`
        SELECT id, day_number, title, scripture_reference, 
               LEFT(reflection_question, 50) as current_reflection
        FROM reading_plan_days 
        WHERE plan_id = $1 AND (
          reflection_question LIKE '%How is%word a lamp%' OR
          reflection_question LIKE '%What does this%reveal%' OR
          reflection_question LIKE '%How does%connect%' OR
          LENGTH(reflection_question) < 100
        )
        ORDER BY day_number
        LIMIT 100
      `, [planId]);
      
      console.log(`Found ${daysNeedingFix.rows.length} days to fix...`);
      
      let fixed = 0;
      for (const day of daysNeedingFix.rows) {
        const reflection = createPlanSpecificReflection(planId, day);
        
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
      
      console.log(`📊 Fixed ${fixed} days for Plan ${planId}`);
    }
    
  } finally {
    client.release();
  }
}

function createPlanSpecificReflection(planId, day) {
  const { day_number, title, scripture_reference } = day;
  
  if (planId === 22) { // New Testament in a Year
    if (scripture_reference.includes('Matthew')) {
      return `Matthew's Gospel presents Jesus as the promised Messiah and King. How does this passage reveal Jesus' authority, compassion, or divine nature? What aspect of His character challenges or comforts you today?

Consider how this text connects to Old Testament prophecies and promises about the Messiah. What does this reveal about God's faithfulness in keeping His promises across generations? How does this strengthen your trust in His promises to you?

Notice the responses of people who encountered Jesus in this passage - faith, doubt, worship, rejection. Which response most closely mirrors your heart toward Jesus right now? What draws you closer to Him or creates distance?

How does this passage call you to live differently as a follower of Christ? What specific truth about Jesus' identity or mission should shape your decisions, relationships, or priorities this week?`;
    }
    
    if (scripture_reference.includes('Acts')) {
      return `The book of Acts shows the early church living in the power of the Holy Spirit. What does this passage reveal about how the Spirit works in and through believers? How does this encourage or challenge your own spiritual life?

Consider the boldness, unity, or sacrificial love displayed by early Christians in this text. What obstacles to gospel living do you see them overcoming? What similar obstacles do you face in your context?

Acts demonstrates how the gospel spreads across cultural and geographical boundaries. How does this passage show God's heart for all people? What role might He be calling you to play in sharing His love with others?

Notice how persecution, opposition, or difficulty in this passage actually advances God's purposes. How might God be using current challenges in your life to accomplish His greater plans? What would trusting Him in difficulty look like?`;
    }
    
    if (scripture_reference.includes('Romans')) {
      return `Romans systematically explains the gospel and its implications for life. What fundamental truth about God's character, human nature, or salvation does this passage establish? How does this deepen your understanding of the gospel?

Consider how this text addresses the relationship between law and grace, works and faith, or justice and mercy. What misconceptions about Christianity does this passage correct? How does this truth free you from religious performance?

Paul's arguments in Romans are both theological and practical. How does the doctrinal truth presented here translate into everyday living? What specific behaviors, attitudes, or priorities should change based on these verses?

This passage likely addresses humanity's universal need for God or the sufficiency of Christ's work. How does this truth humble your pride while also giving you confidence? What would it look like to live in the freedom this passage describes?`;
    }
    
    // Default for other NT books
    return `This New Testament passage reveals important truths about life in God's kingdom. What does this text teach about God's character, Christ's work, or the Christian life that speaks to your current circumstances?

Consider the original audience and context of these words. What challenges or encouragements did they face that mirror your own experience? How does understanding their situation deepen the passage's meaning for you?

Notice any commands, promises, or warnings in this text. Which ones stand out as most relevant to your spiritual growth right now? What would obedience to these truths look like in your daily life?

How does this passage connect to the larger story of redemption and God's love for humanity? What does it reveal about His purposes that should give you hope, challenge your priorities, or deepen your worship?`;
  }
  
  if (planId === 24) { // Daily Psalms
    return `The Psalms give us language for honest communication with God in every season of life. What emotions, struggles, or celebrations in this psalm resonate with your current experience? How does the psalmist's example encourage authentic prayer?

Notice how this psalm balances human experience with divine truth - personal feelings with eternal perspectives. How does the psalmist move from complaint to confidence, or from fear to faith? What can you learn about processing difficult emotions through worship?

Consider the attributes of God highlighted in this psalm - His faithfulness, power, love, justice, or presence. Which divine characteristic do you most need to remember today? How does this truth about God's nature address your specific circumstances?

The Psalms were meant to be sung and memorized, becoming the soundtrack of faith. What phrase or truth from this psalm could become your personal declaration when facing similar situations? How might these ancient words shape your prayers and perspective?`;
  }
  
  if (planId === 44) { // Psalms & Proverbs in 90 Days
    if (title.includes('Psalm')) {
      return `This psalm expresses deep human emotion while ultimately pointing to God's character and faithfulness. What specific feeling or situation in your life does this psalm address? How does the psalmist's example encourage you in honest communication with God?

Notice the progression in the psalm - how does the writer move from struggle to trust, complaint to praise, or fear to confidence? What steps in this spiritual journey can you apply when facing your own challenges?

Consider the view of God presented in this psalm - His sovereignty, love, justice, or presence. How does this picture of God's character challenge wrong thinking or bring comfort to your heart? What truth about Him do you need to embrace more fully?

The psalms were the prayer book and hymnal of God's people. What line or truth from this psalm could become your personal prayer or declaration? How might these ancient words give you language for your relationship with God?`;
    } else {
      return `This proverb offers practical wisdom for righteous living. What area of your life - relationships, work, finances, character - does this wisdom directly address? How does God's perspective challenge worldly thinking about this topic?

Consider the contrast often presented in Proverbs between wisdom and foolishness, righteousness and wickedness. Which path does this verse call you toward? What specific behaviors or attitudes need to change to align with God's wisdom?

Notice how Proverbs connects actions with consequences - both immediate and long-term. How does this truth about sowing and reaping apply to decisions you're currently facing? What choices could you make today that honor God and benefit others?

Proverbs emphasizes that true wisdom begins with fearing the Lord. How does this verse point you toward deeper reverence for God? What would it look like to apply this wisdom in your relationships, work, or daily decisions?`;
    }
  }
  
  // Default reflection for any other cases
  return `This passage contains important spiritual truths for believers. What does this text reveal about God's character, His purposes, or His desires for your life? How does this truth speak to your current circumstances or spiritual needs?

Consider both the immediate context and the broader biblical message. How does this passage fit into God's larger story of redemption and relationship with humanity? What does it teach you about His faithfulness across time and cultures?

Notice any specific commands, promises, or principles presented in this text. Which ones challenge your current thinking or lifestyle? What would obedience to these truths look like in your daily relationships, decisions, and priorities?

How might God want to use this passage to transform your heart, renew your mind, or guide your actions? What specific step could you take this week to live out the truth revealed in these verses?`;
}

fixMajorPlans().catch(console.error);