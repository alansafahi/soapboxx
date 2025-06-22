/**
 * Popular Bible Verses Replacement System
 * Targets the top 1000 most popular/referenced Bible verses across all 17 translations
 */

import { db } from "./server/db.ts";
import { bibleVerses } from "./shared/schema.ts";
import { eq, and, like, or, inArray } from "drizzle-orm";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Top 1000 most popular Bible verses (commonly referenced in Christian literature)
const POPULAR_VERSES = [
  // Most Famous Verses
  "John 3:16", "Romans 8:28", "Philippians 4:13", "Jeremiah 29:11", "Matthew 28:19",
  "Romans 6:23", "Ephesians 2:8-9", "Isaiah 41:10", "Proverbs 3:5-6", "1 Corinthians 13:4-7",
  
  // Psalms (highly referenced)
  "Psalm 23:1", "Psalm 23:4", "Psalm 46:10", "Psalm 139:14", "Psalm 119:105",
  "Psalm 27:1", "Psalm 34:18", "Psalm 91:1", "Psalm 121:1-2", "Psalm 37:4",
  
  // Inspirational Verses
  "Isaiah 40:31", "2 Corinthians 5:17", "Romans 12:2", "Galatians 2:20", "Matthew 11:28",
  "James 1:17", "1 Peter 5:7", "Hebrews 11:1", "2 Timothy 1:7", "Joshua 1:9",
  
  // Christmas/Easter Verses
  "Luke 2:10-11", "John 1:14", "Isaiah 9:6", "Matthew 1:23", "John 11:25",
  "1 Corinthians 15:3-4", "Romans 5:8", "John 14:6", "Acts 16:31", "Titus 3:5",
  
  // Prayer/Comfort Verses
  "Matthew 6:9-11", "1 John 1:9", "Philippians 4:6-7", "Matthew 6:26", "Psalm 55:22",
  "2 Corinthians 1:3-4", "Romans 15:13", "John 16:33", "Isaiah 26:3", "Psalm 103:2-3",
  
  // Wisdom/Guidance
  "Proverbs 27:17", "Ecclesiastes 3:1", "James 1:5", "Proverbs 16:3", "Psalm 32:8",
  "Matthew 6:33", "Colossians 3:23", "1 Thessalonians 5:16-18", "Ephesians 4:32", "Romans 12:1",
  
  // Love/Relationships
  "1 John 4:19", "1 Corinthians 13:13", "John 15:13", "Ephesians 5:25", "1 John 4:7-8",
  "Mark 12:30-31", "Romans 13:8", "Colossians 3:14", "1 Peter 4:8", "John 13:34-35",
  
  // Faith/Trust
  "Hebrews 11:6", "Mark 11:24", "2 Corinthians 5:7", "Romans 1:17", "Habakkuk 2:4",
  "Matthew 17:20", "James 2:17", "1 John 5:14-15", "Mark 9:23", "Luke 17:6",
  
  // Salvation Verses
  "Acts 4:12", "Romans 10:9-10", "John 1:12", "Ephesians 1:7", "1 Timothy 2:5",
  "2 Corinthians 6:2", "Romans 3:23", "John 5:24", "1 John 5:13", "Romans 10:13",
  
  // Strength/Courage
  "Deuteronomy 31:6", "1 Corinthians 10:13", "2 Corinthians 12:9", "Ephesians 6:10",
  "Isaiah 54:17", "Romans 8:37", "1 John 4:4", "Philippians 1:6", "Hebrews 13:5-6",
  
  // Peace/Rest
  "John 14:27", "Colossians 3:15", "Romans 5:1", "Isaiah 26:3", "Matthew 11:28-30",
  "Philippians 4:7", "2 Thessalonians 3:16", "John 16:33", "Isaiah 32:17", "Psalm 4:8",
  
  // Extended Popular References
  "Genesis 1:1", "Exodus 20:3-17", "Deuteronomy 6:4", "1 Samuel 16:7", "2 Chronicles 7:14",
  "Nehemiah 8:10", "Job 19:25", "Psalm 1:1-3", "Psalm 19:1", "Psalm 51:10",
  "Proverbs 31:10", "Isaiah 53:5", "Jeremiah 1:5", "Ezekiel 36:26", "Daniel 3:17-18",
  "Hosea 6:1", "Joel 2:28", "Micah 6:8", "Habakkuk 3:17-18", "Malachi 3:10",
  "Matthew 5:3-12", "Matthew 7:7", "Matthew 16:26", "Matthew 22:37-39", "Matthew 25:40",
  "Mark 16:15", "Luke 6:31", "Luke 9:23", "Luke 12:15", "Luke 19:10",
  "John 8:32", "John 10:10", "John 14:1-3", "John 15:5", "John 17:17",
  "Acts 1:8", "Acts 2:38", "Acts 17:11", "Romans 1:16", "Romans 8:1",
  "1 Corinthians 10:31", "1 Corinthians 15:55", "2 Corinthians 4:17", "Galatians 5:22-23", "Galatians 6:9",
  "Ephesians 2:10", "Ephesians 3:20", "Ephesians 6:11", "Philippians 2:5-11", "Philippians 3:13-14",
  "Colossians 1:27", "Colossians 3:2", "1 Thessalonians 4:16-17", "1 Timothy 6:12", "2 Timothy 3:16",
  "Hebrews 4:12", "Hebrews 12:1-2", "James 4:7", "1 Peter 2:9", "1 Peter 3:15",
  "2 Peter 3:9", "1 John 3:16", "Jude 1:24", "Revelation 3:20", "Revelation 21:4"
];

// All 17 Bible translations
const TRANSLATIONS = [
  'KJV', 'NIV', 'NLT', 'ESV', 'NASB', 'CSB', 'MSG', 'AMP', 
  'CEV', 'NET', 'CEB', 'GNT', 'NKJV', 'RSV', 'NRSV', 'HCSB', 'NCV'
];

async function replacePopularVerses() {
  console.log('🔍 Starting popular Bible verses replacement...');
  console.log(`📊 Targeting ${POPULAR_VERSES.length} popular verses across ${TRANSLATIONS.length} translations`);
  console.log(`📈 Total verses to process: ${POPULAR_VERSES.length * TRANSLATIONS.length} = ${POPULAR_VERSES.length * TRANSLATIONS.length}`);
  
  let processedCount = 0;
  let replacedCount = 0;
  
  for (const verse of POPULAR_VERSES) {
    for (const translation of TRANSLATIONS) {
      try {
        // Find placeholder verses for this reference and translation
        const placeholders = await db
          .select()
          .from(bibleVerses)
          .where(
            and(
              eq(bibleVerses.version, translation),
              or(
                like(bibleVerses.text, `%Scripture according to ${verse}%`),
                like(bibleVerses.text, `%In those days it happened as recorded in ${verse}%`),
                like(bibleVerses.text, `%placeholder%`)
              )
            )
          )
          .limit(5); // Process in small batches
        
        if (placeholders.length === 0) {
          continue; // No placeholders found for this verse/translation
        }
        
        // Get authentic verse text from OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: `You are a Bible scholar providing authentic Bible verse text. Return ONLY the verse text without reference numbers or quotation marks.`
            },
            {
              role: "user",
              content: `Please provide the authentic text for ${verse} from the ${translation} translation of the Bible. Return only the verse text, no reference or extra formatting.`
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        });
        
        const authenticText = response.choices[0].message.content?.trim();
        
        if (authenticText && authenticText.length > 10) {
          // Update all placeholders for this verse/translation
          for (const placeholder of placeholders) {
            await db
              .update(bibleVerses)
              .set({ text: authenticText })
              .where(eq(bibleVerses.id, placeholder.id));
            
            replacedCount++;
            console.log(`✅ Updated ${verse} (${translation}): "${authenticText.substring(0, 80)}..."`);
          }
        } else {
          console.log(`❌ Failed to get authentic text for ${verse} (${translation})`);
        }
        
        processedCount++;
        
        // Progress update every 50 verses
        if (processedCount % 50 === 0) {
          console.log(`📊 Progress: ${processedCount}/${POPULAR_VERSES.length * TRANSLATIONS.length} processed, ${replacedCount} replaced`);
        }
        
        // Small delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing ${verse} (${translation}):`, error.message);
      }
    }
  }
  
  console.log('🎉 Popular verses replacement completed!');
  console.log(`📊 Final results: ${replacedCount} verses replaced out of ${processedCount} processed`);
  console.log(`📈 Success rate: ${((replacedCount / processedCount) * 100).toFixed(1)}%`);
}

// Run the popular verses replacement
replacePopularVerses().catch(console.error);