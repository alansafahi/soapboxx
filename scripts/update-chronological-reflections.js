// Script to update Chronological Bible Order reading plan reflections with contextual questions
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { readingPlanDays, readingPlans } from "../shared/schema.js";
import { eq, and } from "drizzle-orm";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
const db = drizzle(client);

// Function to generate contextual reflection questions based on scripture reference
function generateContextualReflection(scriptureRef, dayNumber) {
  const reflections = {
    // Peace & Anxiety themed
    "Isaiah 26:3": "What areas of your life need God's perfect peace? How can you keep your mind 'steadfast' on Him during challenging times?",
    "Matthew 6:25-26": "What worries are consuming your thoughts today? How does knowing God cares for the birds encourage you about His care for you?",
    "John 14:27": "How is Jesus' peace different from what the world offers? What would it look like to let His peace guard your heart today?",
    "1 Peter 5:7": "What specific anxieties can you 'cast' on God right now? How does knowing He cares for you change how you handle stress?",
    "Philippians 4:6-7": "What anxieties can you bring to God in prayer with thanksgiving today? How has God's peace guarded your heart in the past?",
    
    // Faith & Trust
    "Psalm 23:1-6": "In what 'valley' are you walking right now? How have you experienced God as your Shepherd in difficult times?",
    "Psalm 46:10": "What makes it hard for you to 'be still' before God? How can you create space today to simply know that He is God?",
    "Hebrews 11:1": "What is God asking you to have faith for that you cannot yet see? How does this definition of faith challenge your perspective?",
    "Proverbs 3:5-6": "In what areas are you tempted to lean on your own understanding? How can you practically acknowledge God in all your ways?",
    "Romans 10:17": "How has hearing God's Word strengthened your faith recently? What steps can you take to hear from Him more regularly?",
    
    // Prayer & Communication with God
    "Mark 11:22-24": "What do you need to believe God for today? How does Jesus' teaching on prayer challenge your expectations?",
    "Matthew 6:9-13": "Which part of the Lord's Prayer do you struggle with most? How can you make this prayer more personal and meaningful in your daily life?",
    "1 John 5:14-15": "What are you praying for that aligns with God's will? How does confidence in prayer change when you know you're asking according to His will?",
    
    // Joy & Gratitude
    "1 Thessalonians 5:16-18": "What makes it difficult to 'rejoice always' and 'give thanks in all circumstances'? How can you practice this mindset today?",
    "Psalm 118:24": "What would change if you truly saw today as a gift from the Lord? How can you choose to rejoice in this specific day?",
    "Nehemiah 8:10": "Where do you need God's strength most right now? How does 'the joy of the Lord' serve as strength in your life?",
    "Philippians 4:4": "What makes it hard to rejoice when facing difficulties? How can you find reasons to celebrate God even in tough times?",
    
    // Perseverance & Growth
    "James 1:2-4": "What trials are you facing that could develop perseverance in you? How does viewing trials as 'pure joy' change your perspective?",
    "Romans 5:3-5": "What suffering in your life has developed perseverance, character, or hope? How does viewing suffering this way change your perspective?",
    "Isaiah 40:31": "Where do you feel weary and need renewed strength? How can you 'wait on the Lord' in practical ways today?",
    
    // Purpose & Calling
    "Ephesians 2:10": "What 'good works' do you sense God has prepared specifically for you to walk in? How does knowing you are His 'workmanship' change how you see yourself?",
    "Jeremiah 29:11": "What fears about the future are you holding onto? How can trusting God's 'plans to prosper you' bring hope to your current situation?",
    "Romans 8:28": "What difficult situation are you facing that's hard to see as 'working together for good'? How does God's love provide the foundation for this promise?",
    "Psalm 139:13-16": "How does knowing God 'knit you together' in your mother's womb impact how you see your unique design and purpose?",
    
    // Love & Relationships
    "1 Corinthians 13:4-7": "Which aspect of love (patient, kind, not envious, etc.) do you most need to grow in? How can you practice this kind of love today?",
    "John 3:16": "How does the depth of God's love demonstrated in giving His Son affect your understanding of your own worth and His love for you?",
    "1 John 4:19": "How has experiencing God's love first changed your ability to love others? Who in your life needs to experience God's love through you?",
    "Romans 8:38-39": "What circumstances make you question God's love? How does this list of things that cannot separate you from Christ's love bring assurance?",
    
    // Wisdom & Understanding
    "Proverbs 1:7": "What does it mean to 'fear the Lord' in practical terms? How does this reverence for God lead to true wisdom in daily decisions?",
    "James 1:5": "What specific area of your life needs God's wisdom right now? How can you ask God for wisdom 'without doubting'?",
    "Proverbs 27:17": "Who in your life 'sharpens' you spiritually? How can you be an 'iron' that sharpens someone else today?",
    "Ecclesiastes 3:1": "What 'season' are you in right now? How can you embrace this time instead of wishing you were in a different season?",
    
    // Service & Leadership
    "1 Peter 5:2-3": "How can you serve others with eagerness rather than compulsion? What does it look like to lead by example rather than lording over others?",
    "Philippians 2:3-4": "In what relationships do you struggle with selfish ambition? How can you look to others' interests alongside your own?",
    "Matthew 20:26-28": "Where do you seek to be served rather than to serve? How can you follow Jesus' example of serving others today?",
    
    // Provision & Trust
    "Philippians 4:19": "What needs are you worried about God providing? How has God met your needs in the past in unexpected ways?",
    
    // Suffering & Perseverance
    "Job 1:20-22": "How do you typically respond when faced with loss or disappointment? What can you learn from Job's response of worship in suffering?",
    "Job 13:15": "What would it look like to trust God even when you don't understand His ways? How can you maintain hope when circumstances seem hopeless?",
    
    // Scripture & Guidance
    "2 Timothy 3:16-17": "How has Scripture trained you in righteousness or corrected you recently? What area of your life needs God's Word to equip you?",
    "Joshua 1:9": "What situation requires courage from you today? How does knowing God is always with you strengthen you to be bold?",
    "Psalm 119:105": "What decision or situation do you need God's Word to illuminate? How can you practically let Scripture guide your steps?",
    
    // Character & Transformation
    "Galatians 5:22-23": "Which fruit of the Spirit do you most need to cultivate? How can you allow God's Spirit to develop this quality in you?",
    "Matthew 5:3-12": "Which beatitude speaks most to your current life situation? How does Jesus' teaching challenge your understanding of blessing?"
  };
  
  // Return specific reflection if available, otherwise generate a contextual one
  if (reflections[scriptureRef]) {
    return reflections[scriptureRef];
  }
  
  // Generate contextual questions for common themes in other verses
  if (scriptureRef.includes("Psalm")) {
    return `How does this Psalm speak to your current situation? What aspect of God's character does this passage reveal that you need to remember today?`;
  } else if (scriptureRef.includes("Proverbs")) {
    return `What practical wisdom does this proverb offer for your daily life? How can you apply this truth to a specific situation you're facing?`;
  } else if (scriptureRef.includes("Matthew") || scriptureRef.includes("Mark") || scriptureRef.includes("Luke") || scriptureRef.includes("John")) {
    return `How does Jesus' teaching or example in this passage challenge you? What would it look like to follow His example in your current circumstances?`;
  } else if (scriptureRef.includes("Romans") || scriptureRef.includes("Ephesians") || scriptureRef.includes("Philippians")) {
    return `What does this passage teach about your identity in Christ? How can this truth transform how you think about yourself and your relationships?`;
  } else if (scriptureRef.includes("Genesis") || scriptureRef.includes("Exodus")) {
    return `What does this passage reveal about God's character and His relationship with His people? How do you see God's faithfulness displayed here?`;
  } else if (scriptureRef.includes("Isaiah") || scriptureRef.includes("Jeremiah")) {
    return `What hope or challenge does this prophetic word offer? How does God's message through the prophet apply to your life today?`;
  } else {
    return `What does this passage reveal about God's character? How can you apply this truth to strengthen your relationship with Him and others today?`;
  }
}

// Get the Chronological Bible Order plan
const chronologicalPlan = await db
  .select()
  .from(readingPlans)
  .where(eq(readingPlans.name, "Chronological Bible Order"))
  .limit(1);

if (chronologicalPlan.length === 0) {
  console.log("Chronological Bible Order plan not found");
  process.exit(1);
}

const planId = chronologicalPlan[0].id;

// Get all days for this plan
const allDays = await db
  .select()
  .from(readingPlanDays)
  .where(eq(readingPlanDays.planId, planId))
  .orderBy(readingPlanDays.dayNumber);

console.log(`Found ${allDays.length} days to update`);

// Update each day with a contextual reflection
let updatedCount = 0;
for (const day of allDays) {
  const newReflection = generateContextualReflection(day.scriptureReference, day.dayNumber);
  
  // Only update if the reflection is different from the current generic one
  if (day.reflectionQuestion !== newReflection && 
      (day.reflectionQuestion === "How do today's passages fit into God's overall plan? What do you learn about His character?" || 
       day.reflectionQuestion === null || 
       day.reflectionQuestion === "")) {
    
    await db
      .update(readingPlanDays)
      .set({ reflectionQuestion: newReflection })
      .where(eq(readingPlanDays.id, day.id));
    
    updatedCount++;
    console.log(`Updated Day ${day.dayNumber}: ${day.scriptureReference}`);
  }
}

console.log(`Successfully updated ${updatedCount} reflection questions`);

await client.end();