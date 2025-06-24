/**
 * Populate Missing Bible Versions
 * Direct population of ASV and WEB versions using OpenAI API
 */

import { db } from './db.js';
import { bibleVerses } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// All 66 books of the Bible with their chapters
const BIBLE_BOOKS = [
  { name: 'Genesis', chapters: 50 },
  { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 },
  { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 },
  { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 },
  { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 },
  { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 },
  { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 },
  { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 },
  { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 },
  { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 },
  { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 },
  { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 },
  { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 },
  { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 },
  { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 },
  { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 },
  { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 },
  { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 },
  { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 },
  { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 },
  { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 },
  { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 },
  { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 },
  { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 },
  { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 },
  { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 },
  { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 },
  { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 },
  { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 },
  { name: 'Revelation', chapters: 22 }
];

// Verse counts for each chapter (approximate - will be dynamically handled)
const VERSE_COUNTS = {
  'Genesis': [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
  // Add more as needed - will use OpenAI to get accurate verse counts
};

export class BibleVersionPopulator {
  private versions = ['ASV', 'WEB'];
  
  async populateAllVersions(): Promise<void> {
    console.log('🚀 Starting comprehensive Bible version population...');
    
    for (const version of this.versions) {
      console.log(`📖 Populating ${version}...`);
      await this.populateVersion(version);
    }
    
    console.log('✅ All missing Bible versions populated successfully');
  }
  
  private async populateVersion(version: string): Promise<void> {
    const versionName = version === 'ASV' ? 'American Standard Version' : 'World English Bible';
    
    for (const book of BIBLE_BOOKS) {
      console.log(`  📚 Processing ${book.name} (${book.chapters} chapters)...`);
      
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        await this.populateChapter(version, versionName, book.name, chapter);
        
        // Add delay to respect OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  private async populateChapter(version: string, versionName: string, bookName: string, chapter: number): Promise<void> {
    try {
      // First, get the chapter text from OpenAI
      const prompt = `Please provide the complete text of ${bookName} chapter ${chapter} from the ${versionName}. 

Return ONLY a JSON object in this exact format:
{
  "verses": [
    {"verse": 1, "text": "verse text here"},
    {"verse": 2, "text": "verse text here"}
  ]
}

Include ALL verses in the chapter. Use authentic ${versionName} text exactly as published.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a precise Biblical text transcriber. Provide exact ${versionName} text with complete accuracy. Return only valid JSON.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      });

      const chapterData = JSON.parse(response.choices[0].message.content!);
      
      // Insert verses into database
      for (const verseData of chapterData.verses) {
        const reference = `${bookName} ${chapter}:${verseData.verse}`;
        const category = this.categorizeVerse(verseData.text);
        
        await db.insert(bibleVerses).values({
          reference,
          book: bookName,
          chapter,
          verse: verseData.verse.toString(),
          text: verseData.text,
          translation: version,
          category,
          popularityScore: 1,
          topicTags: [bookName.toLowerCase().replace(/\s+/g, '-')],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      
      console.log(`    ✓ ${bookName} ${chapter} - ${chapterData.verses.length} verses`);
      
    } catch (error) {
      console.error(`    ❌ Error processing ${bookName} ${chapter}:`, error);
      // Continue with next chapter
    }
  }
  
  private categorizeVerse(text: string): string {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('love') || lowercaseText.includes('beloved')) return 'Love';
    if (lowercaseText.includes('peace') || lowercaseText.includes('rest')) return 'Peace';
    if (lowercaseText.includes('hope') || lowercaseText.includes('future')) return 'Hope';
    if (lowercaseText.includes('strength') || lowercaseText.includes('strong')) return 'Strength';
    if (lowercaseText.includes('wisdom') || lowercaseText.includes('wise')) return 'Wisdom';
    if (lowercaseText.includes('comfort') || lowercaseText.includes('comforted')) return 'Comfort';
    if (lowercaseText.includes('forgive') || lowercaseText.includes('forgiveness')) return 'Forgiveness';
    if (lowercaseText.includes('joy') || lowercaseText.includes('rejoice')) return 'Joy';
    if (lowercaseText.includes('faith') || lowercaseText.includes('believe')) return 'Faith';
    if (lowercaseText.includes('grace') || lowercaseText.includes('mercy')) return 'Grace';
    
    return 'Core';
  }
  
  async checkProgress(): Promise<void> {
    for (const version of this.versions) {
      const count = await db
        .select()
        .from(bibleVerses)
        .where(eq(bibleVerses.translation, version));
      
      console.log(`${version}: ${count.length} verses imported`);
    }
  }
}

export const biblePopulator = new BibleVersionPopulator();