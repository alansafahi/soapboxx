import { pool } from '../server/db.ts';

async function fixNewTestamentRemaining() {
  console.log('🔧 Fixing remaining New Testament in a Year reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // Get New Testament plan (ID 22)
    const planId = 22;
    
    // Get days with generic reflection patterns (100 at a time)
    const daysResult = await client.query(`
      SELECT id, day_number, title, scripture_reference, 
             LEFT(reflection_question, 100) as current_reflection
      FROM reading_plan_days 
      WHERE plan_id = $1 AND (
        reflection_question LIKE '%Today''s New Testament reading from%' OR
        reflection_question LIKE '%illuminates the%' OR
        reflection_question LIKE '%reveals how%' OR
        LENGTH(reflection_question) < 150
      )
      ORDER BY day_number
      LIMIT 100
    `, [planId]);
    
    console.log(`Found ${daysResult.rows.length} days with generic reflections to fix`);
    
    let fixed = 0;
    for (const day of daysResult.rows) {
      const reflection = createBookSpecificReflection(day.scripture_reference, day.title, day.day_number);
      
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
    
    console.log(`📊 Fixed ${fixed} days in New Testament plan`);
  } finally {
    client.release();
  }
}

function createBookSpecificReflection(scriptureRef, title, dayNumber) {
  // Extract the book name from scripture reference
  const book = scriptureRef.split(' ')[0].toLowerCase();
  
  if (book.includes('ephesians')) {
    return `Ephesians reveals the incredible spiritual wealth believers possess in Christ. What specific blessing or truth about your identity "in Christ" from this passage do you need to believe more deeply? How does understanding your spiritual riches change your daily perspective?

Paul emphasizes the unity of the church and the diversity of gifts within the body. How does this passage challenge individualistic approaches to faith? What role is God calling you to play in building up the body of Christ through your unique gifts and calling?

This letter addresses both doctrinal truth and practical living. How does the theological foundation presented here translate into specific changes in your relationships, work, or daily decisions? What gap exists between what you believe and how you live?

Ephesians frequently mentions God's power at work in believers. What situation in your life needs the same power that raised Christ from the dead? How does this passage encourage you to depend on God's strength rather than your own efforts?`;
  }
  
  if (book.includes('philippians')) {
    return `Philippians is Paul's letter of joy written from prison, demonstrating that circumstances don't determine spiritual contentment. What situation in your life is challenging your ability to "rejoice in the Lord"? How does Paul's example encourage a different response to difficulty?

Paul emphasizes having the "mind of Christ" and putting others before yourself. In what specific relationships or situations is God calling you to demonstrate Christ-like humility? How does Jesus' example of selfless love challenge your natural tendencies?

This letter addresses anxiety with the promise of God's peace through prayer and thanksgiving. What worries are you currently carrying that you need to surrender to God? How might practicing gratitude in the midst of concern change your emotional state?

Paul speaks of being content in all circumstances and finding strength in Christ. What external things - success, approval, comfort - are you depending on for satisfaction? How does contentment in Christ free you from the roller coaster of changing circumstances?`;
  }
  
  if (book.includes('colossians')) {
    return `Colossians emphasizes Christ's supremacy over all creation and spiritual forces. How does this passage present Jesus' authority over the specific areas where you're struggling - fear, temptation, confusion, or spiritual opposition?

Paul warns against being taken captive by human philosophy and traditions that contradict Christ. What cultural ideas, popular wisdom, or even religious traditions might be undermining your confidence in Christ alone for salvation and spiritual growth?

This letter emphasizes believers are complete in Christ and have died to their old nature. What aspects of your former way of thinking or living is God calling you to "put off" like old clothes? How does your new identity in Christ motivate these changes?

Paul speaks of Christ dwelling richly within believers through His word. How is Scripture currently shaping your thoughts, decisions, and relationships? What would it look like for God's word to have even greater influence in your daily life?`;
  }
  
  if (book.includes('thessalonians')) {
    return `Paul commends the Thessalonians for their faith, hope, and love that became an example to other believers. Which of these three virtues - faith, hope, or love - do you most need to grow in? How might strengthening this area impact your witness to others?

This letter addresses Christ's return and living in light of that reality. How does the promise of Jesus' second coming affect your priorities, relationships, and daily decisions? What changes when you truly believe He could return at any time?

Paul emphasizes living to please God rather than seeking human approval. In what areas of your life are you more concerned with what others think than what God thinks? How does focusing on His approval free you from people-pleasing or fear of man?

The letter encourages believers to encourage one another and build each other up. Who in your life needs the specific encouragement or building up that you could provide? How is God calling you to use your words to strengthen fellow believers?`;
  }
  
  if (book.includes('timothy')) {
    return `Paul's letters to Timothy provide guidance for faithful ministry and Christian living. What specific instruction or encouragement in this passage applies to your current season of serving God, whether in formal ministry or daily witness?

These letters emphasize the importance of sound doctrine and guarding against false teaching. How does this passage equip you to discern truth from error in contemporary culture? What biblical truths do you need to hold more firmly?

Paul encourages Timothy despite his youth and apparent timidity. How does this passage speak to insecurities, fears, or feelings of inadequacy you face in serving God? What gifts or calling is God asking you to exercise more boldly?

The letters emphasize perseverance through suffering and opposition. What difficulties in your faith journey - whether external opposition or internal struggles - does this passage address? How does Paul's example encourage endurance?`;
  }
  
  if (book.includes('titus')) {
    return `Paul's letter to Titus emphasizes the connection between sound doctrine and godly living. How does this passage demonstrate that what we believe must impact how we behave? Where do you see gaps between your theology and your lifestyle?

This letter addresses the importance of good works as evidence of salvation, not as a means of earning it. How does this passage motivate good deeds while keeping grace as the foundation? What specific works is God calling you toward?

Paul emphasizes the need for mature believers to teach and mentor others. Whether formally or informally, how is God calling you to pass on what you've learned to those who are younger in the faith? What wisdom or experience could benefit others?

The letter addresses living as citizens of both earthly kingdoms and God's kingdom. How does this passage guide your interaction with government, society, and culture while maintaining distinctly Christian values and priorities?`;
  }
  
  // Default for other books or unspecified
  return `This New Testament passage reveals important truths about life in God's kingdom. What does this text teach about God's character, Christ's work, or the Christian life that speaks directly to your current circumstances and spiritual needs?

Consider the original audience and their challenges, which often mirror our own struggles with faith, community, and living for God in a hostile world. How does understanding their context help you apply these ancient words to modern situations?

Notice any specific commands, promises, or principles presented in this text. Which ones challenge your current thinking or lifestyle? What would wholehearted obedience to these truths look like in your relationships, work, and daily priorities?

How does this passage connect to the larger story of God's redemption through Christ? What does it reveal about His purposes for your life that should give you hope, challenge your priorities, or deepen your worship and commitment?`;
}

fixNewTestamentRemaining().catch(console.error);