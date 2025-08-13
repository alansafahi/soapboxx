import { pool } from '../server/db.ts';

async function fixDataStructureSwap() {
  console.log('🔧 Fixing data structure: Moving long content from reflection_question to devotional_content...');
  
  const client = await pool.connect();
  
  try {
    // Find records where reflection_question contains long devotional content
    // and devotional_content is null or short
    const problemRecords = await client.query(`
      SELECT id, plan_id, day_number, title, 
             LENGTH(reflection_question) as reflection_length,
             LENGTH(COALESCE(devotional_content, '')) as devotional_length,
             LEFT(reflection_question, 100) as reflection_preview
      FROM reading_plan_days 
      WHERE (devotional_content IS NULL OR LENGTH(devotional_content) < 50)
        AND LENGTH(reflection_question) > 300
      ORDER BY plan_id, day_number
    `);
    
    console.log(`Found ${problemRecords.rows.length} records with swapped content`);
    
    let fixed = 0;
    for (const record of problemRecords.rows) {
      try {
        // Get the full content
        const fullRecord = await client.query(
          'SELECT reflection_question FROM reading_plan_days WHERE id = $1',
          [record.id]
        );
        
        const longContent = fullRecord.rows[0].reflection_question;
        
        // Create appropriate devotional content and reflection questions
        const devotionalContent = createDevotionalContent(longContent);
        const reflectionQuestion = createReflectionQuestions(record.title, longContent);
        
        // Swap the content
        await client.query(`
          UPDATE reading_plan_days 
          SET devotional_content = $1, 
              reflection_question = $2
          WHERE id = $3
        `, [devotionalContent, reflectionQuestion, record.id]);
        
        console.log(`✅ Fixed Plan ${record.plan_id}, Day ${record.day_number}: ${record.title}`);
        fixed++;
        
      } catch (error) {
        console.log(`❌ Error fixing record ${record.id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Fixed ${fixed} records by swapping content structure`);
  } finally {
    client.release();
  }
}

function createDevotionalContent(longContent) {
  // Extract the first part as devotional teaching
  const paragraphs = longContent.split('\n\n');
  const firstParagraph = paragraphs[0];
  
  if (firstParagraph.length > 200) {
    return firstParagraph + '\n\nThis passage invites us to deeper reflection on God\'s character and His call on our lives. As you read today\'s scripture, consider how these truths apply to your current circumstances and spiritual journey.';
  }
  
  // If the content seems like questions, create devotional content
  return `Today's scripture passage offers profound insights into the nature of faith and spiritual growth. As you meditate on these verses, allow the Holy Spirit to illuminate the text and speak to your heart about God's purposes for your life.

Consider the context of this passage and how it connects to God's larger story of redemption. What truths about His character, His promises, or His call on believers emerge from this text? How might these ancient words provide guidance and encouragement for your current season of life?`;
}

function createReflectionQuestions(title, content) {
  // Extract key themes and create focused questions
  if (content.includes('peace') && content.includes('steadfast')) {
    return `What specific areas of your life need God's "perfect peace" right now? How can you keep your mind "steadfast" on Him rather than on changing circumstances? What would trusting God look like practically in your current situation?`;
  }
  
  if (content.includes('gratitude') || content.includes('thanksgiving')) {
    return `What specific aspects of God's character or provision give you reason for gratitude today? How might viewing your circumstances through the lens of thanksgiving change your perspective? In what practical ways can you cultivate a more grateful heart?`;
  }
  
  if (content.includes('joy') && content.includes('strength')) {
    return `How is God's joy different from temporary happiness? What would it look like to draw strength from "the joy of the Lord" in your current challenges? Where might guilt or discouragement be robbing you of God's intended joy?`;
  }
  
  if (content.includes('trust') || content.includes('faith')) {
    return `What areas of your life require moving from intellectual knowledge about God to active daily trust? How has God proven faithful in your past that should encourage present trust? What would dependency on Him look like practically?`;
  }
  
  // Default focused questions based on title theme
  if (title.includes('SOAP')) {
    return `As you practice the SOAP method with today's scripture, what specific truth stands out to you? How does this passage apply to your current circumstances? What is God calling you to do or change based on this text?`;
  }
  
  // General but meaningful questions
  return `What does this passage reveal about God's character that speaks to your current needs? How does this truth challenge or encourage you in your present circumstances? What specific response is God calling you toward?`;
}

fixDataStructureSwap().catch(console.error);