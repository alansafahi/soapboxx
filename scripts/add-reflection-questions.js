import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function addReflectionQuestions() {
  console.log('🔧 Adding reflection questions to all Old Testament days...');
  
  // Get all days for the Old Testament plan
  const allDays = await db
    .select()
    .from(readingPlanDays)
    .where(eq(readingPlanDays.planId, 23))
    .orderBy(readingPlanDays.dayNumber);

  console.log(`📖 Found ${allDays.length} days to process`);

  const reflectionTemplates = {
    genesis: (title, reference) => {
      const templates = [
        `How does this passage from ${reference} challenge your understanding of God's creative power and intentional design? What specific elements reveal divine purpose rather than random chance?

In what ways do you see the themes of beginning, formation, and calling reflected in your own spiritual journey? How is God still "creating" and shaping your life today?

What does this narrative teach about the relationship between divine sovereignty and human responsibility? How do you balance trusting God's plan while actively participating in His purposes?`,

        `Reflect on the character qualities displayed in this passage. Which virtues do you see exemplified, and how can you cultivate these same qualities in your daily relationships?

What patterns of blessing and consequence emerge from this text? How do these ancient principles apply to the choices you face in your current circumstances?

How does this passage point forward to God's redemptive plan? What shadows or types do you recognize that find fulfillment in Christ?`,

        `Consider the role of faith versus sight in this narrative. Where do you see characters choosing to trust God despite uncertain circumstances, and how does this speak to your current season of life?

What does this passage reveal about God's character - His faithfulness, justice, mercy, or love? How does this understanding impact your worship and trust in Him?

In what ways does this ancient story address universal human experiences like fear, hope, conflict, or reconciliation? How does God's involvement in these situations encourage you today?`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    },

    exodus: (title, reference) => {
      const templates = [
        `How does this passage from ${reference} demonstrate God's heart for justice and liberation? What forms of "bondage" in your own life might God be calling you to leave behind?

What role does faith play in the deliverance described here? How can you apply this same trust when facing your own "impossible" situations?

Consider the cost of freedom described in this text. What sacrifices might God be asking of you as you pursue spiritual growth and deeper commitment to His purposes?`,

        `Reflect on the theme of divine power versus human limitation in this passage. How does this challenge you to rely more fully on God's strength rather than your own abilities?

What does this narrative teach about God's timing and methods? How might His ways of working in your life differ from your expectations?

How do the reactions of various characters in this passage mirror your own responses to God's commands? Where do you see courage, fear, obedience, or resistance reflected in your spiritual journey?`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    },

    leviticus: (title, reference) => {
      const templates = [
        `How does this passage from ${reference} reveal God's holiness and the importance of approaching Him with reverence? What does this teach about the seriousness of worship and spiritual discipline?

In what ways do these ancient practices point to the need for purification and consecration in your own spiritual life? How do you maintain holy living in a secular world?

What does this text teach about the cost of sin and the necessity of sacrifice? How does this deepen your appreciation for Christ's ultimate sacrifice?`,

        `Consider the detailed instructions in this passage. What does God's specificity reveal about His character and His desire for authentic relationship with His people?

How do the principles of separation and dedication found here apply to your daily choices and priorities? Where is God calling you to be set apart for His purposes?

What parallels do you see between these ancient requirements and the call to discipleship in the New Testament? How does understanding the law help you appreciate grace?`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    },

    numbers: (title, reference) => {
      const templates = [
        `How does this wilderness narrative from ${reference} speak to seasons of waiting and testing in your own life? What lessons is God teaching you in your current "desert" experiences?

Consider the role of community and leadership in this passage. How do you contribute to the spiritual health and unity of your faith community?

What does this text reveal about the consequences of grumbling versus gratitude? How can you maintain a thankful heart even in difficult circumstances?`,

        `Reflect on the theme of divine provision in this passage. How has God provided for you in unexpected ways, and how does this build your confidence for future challenges?

What does this narrative teach about the importance of obedience and trust in God's guidance? Where in your life do you struggle with following God's direction?

How do the failures and successes of the Israelites serve as warnings and encouragements for your spiritual journey? What patterns do you want to avoid or embrace?`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }
  };

  let processed = 0;
  const batchSize = 15;

  for (let i = 0; i < allDays.length; i += batchSize) {
    const batch = allDays.slice(i, i + batchSize);
    
    for (const day of batch) {
      if (day.reflectionQuestions && day.reflectionQuestions.length > 50) {
        continue; // Skip if already has substantial reflection questions
      }

      const title = day.title.toLowerCase();
      const reference = day.scriptureReference || '';
      
      let reflectionQuestions = '';
      
      if (title.includes('genesis')) {
        reflectionQuestions = reflectionTemplates.genesis(title, reference);
      } else if (title.includes('exodus')) {
        reflectionQuestions = reflectionTemplates.exodus(title, reference);
      } else if (title.includes('leviticus')) {
        reflectionQuestions = reflectionTemplates.leviticus(title, reference);
      } else if (title.includes('numbers')) {
        reflectionQuestions = reflectionTemplates.numbers(title, reference);
      } else {
        // Generic reflection template for other books
        reflectionQuestions = `How does this passage from ${reference} reveal God's character and His relationship with His people? What specific attributes of God do you see displayed here?

What themes of faith, obedience, or covenant relationship emerge from this text? How do these themes connect to your personal spiritual journey?

In what ways does this ancient narrative speak to contemporary issues you face? How can the principles demonstrated here guide your decisions and relationships today?

What does this passage teach about the nature of spiritual growth and maturity? How is God calling you to deeper commitment and trust through this text?`;
      }

      try {
        await db
          .update(readingPlanDays)
          .set({ reflectionQuestions })
          .where(eq(readingPlanDays.id, day.id));
      } catch (error) {
        console.log(`❌ Error updating Day ${day.dayNumber}:`, error.message);
        continue;
      }

      console.log(`✅ Added reflection questions to Day ${day.dayNumber}: ${day.title}`);
      processed++;
    }

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Results: Added reflection questions to ${processed} days`);
}

addReflectionQuestions().catch(console.error);