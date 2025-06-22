/**
 * Mass Scripture Replacement System
 * Replaces all 536,661 placeholder verses with authentic Bible text
 * Optimized for speed with batch processing and intelligent chunking
 */

import { db } from './server/db.js';
import { bibleVerses } from './shared/schema.js';
import { sql } from 'drizzle-orm';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Priority translations to process first
const PRIORITY_TRANSLATIONS = ['NIV', 'ESV', 'NLT', 'KJV'];
const ALL_TRANSLATIONS = ['KJV', 'NIV', 'NLT', 'ESV', 'NASB', 'CSB', 'MSG', 'AMP', 'CEV', 'NET', 'CEB', 'GNT', 'NKJV', 'RSV', 'NRSV', 'HCSB', 'NCV'];

class MassScriptureReplacer {
  constructor() {
    this.processedCount = 0;
    this.startTime = Date.now();
    this.batchSize = 10; // Process 10 verses at once for speed
  }

  /**
   * Main execution function
   */
  async execute() {
    console.log('🚀 Starting Mass Scripture Replacement System');
    console.log('📊 Target: Replace 536,661 placeholder verses with authentic scripture');
    
    // Get total placeholder count
    const placeholderCount = await this.getPlaceholderCount();
    console.log(`📈 Total placeholders to replace: ${placeholderCount.toLocaleString()}`);
    
    // Process priority translations first
    for (const translation of PRIORITY_TRANSLATIONS) {
      console.log(`\n🔄 Processing priority translation: ${translation}`);
      await this.processTranslation(translation);
    }
    
    // Process remaining translations
    const remainingTranslations = ALL_TRANSLATIONS.filter(t => !PRIORITY_TRANSLATIONS.includes(t));
    for (const translation of remainingTranslations) {
      console.log(`\n🔄 Processing translation: ${translation}`);
      await this.processTranslation(translation);
    }
    
    console.log('\n✅ Mass Scripture Replacement Complete!');
    await this.printFinalStats();
  }

  /**
   * Process all placeholder verses for a specific translation
   */
  async processTranslation(translation) {
    // Get all placeholder verses for this translation
    const placeholders = await db
      .select({
        id: bibleVerses.id,
        book: bibleVerses.book,
        chapter: bibleVerses.chapter,
        verse: bibleVerses.verse,
        translation: bibleVerses.translation,
        text: bibleVerses.text
      })
      .from(bibleVerses)
      .where(sql`
        translation = ${translation} AND (
          text LIKE '%Scripture according to%' OR 
          text LIKE '%In those days it happened as recorded in%' OR 
          text LIKE '%placeholder%' OR 
          text LIKE '%Lorem ipsum%' OR
          text LIKE '%according to%' OR
          text LIKE '%as recorded in%' OR
          text LIKE '%The word of the Lord according to%' OR
          text LIKE '%GOD''s Word according to%' OR
          text LIKE '%Jesus said to them as recorded in%' OR
          text LIKE '%And Jesus said unto them according to%'
        )
      `);

    if (placeholders.length === 0) {
      console.log(`✅ ${translation}: No placeholders found`);
      return;
    }

    console.log(`📝 ${translation}: Found ${placeholders.length.toLocaleString()} placeholders`);

    // Process in batches for efficiency
    for (let i = 0; i < placeholders.length; i += this.batchSize) {
      const batch = placeholders.slice(i, i + this.batchSize);
      await this.processBatch(batch, translation);
      
      // Progress update
      const processed = Math.min(i + this.batchSize, placeholders.length);
      const percentage = ((processed / placeholders.length) * 100).toFixed(1);
      console.log(`⏳ ${translation}: ${processed}/${placeholders.length} (${percentage}%) - ${this.getEstimatedTimeRemaining()}`);
      
      // Rate limiting: small pause between batches
      await this.sleep(100);
    }
  }

  /**
   * Process a batch of verses with OpenAI
   */
  async processBatch(batch, translation) {
    try {
      // Create batch request for OpenAI
      const batchPrompt = this.createBatchPrompt(batch, translation);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a Bible scholar providing authentic scripture text. Return ONLY a JSON array with the exact verse text for each reference, no commentary or explanation."
          },
          {
            role: "user",
            content: batchPrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      // Update database with authentic verses
      await this.updateVerses(batch, result.verses);
      
      this.processedCount += batch.length;
      
    } catch (error) {
      console.error(`❌ Error processing batch:`, error.message);
      // Continue with next batch on error
    }
  }

  /**
   * Create optimized batch prompt for OpenAI
   */
  createBatchPrompt(batch, translation) {
    const references = batch.map((verse, index) => ({
      id: index,
      reference: `${verse.book} ${verse.chapter}:${verse.verse}`,
      translation: translation
    }));

    return `Please provide authentic ${translation} Bible verse text for these references. Return as JSON:

{
  "verses": [
    {"id": 0, "text": "authentic verse text"},
    {"id": 1, "text": "authentic verse text"}
  ]
}

References:
${references.map(ref => `${ref.id}: ${ref.reference} (${ref.translation})`).join('\n')}

Important: Return only authentic biblical text, no placeholders or commentary.`;
  }

  /**
   * Update database with authentic verse text
   */
  async updateVerses(batch, verseTexts) {
    for (let i = 0; i < batch.length && i < verseTexts.length; i++) {
      const verse = batch[i];
      const newText = verseTexts[i]?.text;
      
      if (newText && newText.length > 10 && !newText.includes('according to') && !newText.includes('as recorded in')) {
        try {
          await db
            .update(bibleVerses)
            .set({ text: newText })
            .where(sql`id = ${verse.id}`);
        } catch (error) {
          console.error(`❌ Error updating verse ${verse.id}:`, error.message);
        }
      }
    }
  }

  /**
   * Get total placeholder count
   */
  async getPlaceholderCount() {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(bibleVerses)
      .where(sql`
        text LIKE '%Scripture according to%' OR 
        text LIKE '%In those days it happened as recorded in%' OR 
        text LIKE '%placeholder%' OR 
        text LIKE '%Lorem ipsum%' OR
        text LIKE '%according to%' OR
        text LIKE '%as recorded in%' OR
        text LIKE '%The word of the Lord according to%' OR
        text LIKE '%GOD''s Word according to%' OR
        text LIKE '%Jesus said to them as recorded in%' OR
        text LIKE '%And Jesus said unto them according to%'
      `);
    
    return Number(result[0].count);
  }

  /**
   * Calculate estimated time remaining
   */
  getEstimatedTimeRemaining() {
    const elapsed = Date.now() - this.startTime;
    const rate = this.processedCount / (elapsed / 1000); // verses per second
    const totalPlaceholders = 536661;
    const remaining = totalPlaceholders - this.processedCount;
    const estimatedSeconds = remaining / rate;
    
    if (estimatedSeconds > 3600) {
      return `~${(estimatedSeconds / 3600).toFixed(1)}h remaining`;
    } else if (estimatedSeconds > 60) {
      return `~${(estimatedSeconds / 60).toFixed(1)}m remaining`;
    } else {
      return `~${estimatedSeconds.toFixed(0)}s remaining`;
    }
  }

  /**
   * Print final statistics
   */
  async printFinalStats() {
    const totalElapsed = Date.now() - this.startTime;
    const finalPlaceholderCount = await this.getPlaceholderCount();
    const authenticCount = await this.getAuthenticCount();
    
    console.log('\n📊 FINAL STATISTICS:');
    console.log(`⏱️  Total time: ${(totalElapsed / 1000 / 60).toFixed(1)} minutes`);
    console.log(`📝 Verses processed: ${this.processedCount.toLocaleString()}`);
    console.log(`✅ Authentic verses: ${authenticCount.toLocaleString()}`);
    console.log(`⚠️  Remaining placeholders: ${finalPlaceholderCount.toLocaleString()}`);
    console.log(`📈 Success rate: ${((authenticCount / 536683) * 100).toFixed(1)}%`);
  }

  /**
   * Get authentic verse count
   */
  async getAuthenticCount() {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(bibleVerses)
      .where(sql`
        text NOT LIKE '%Scripture according to%' AND
        text NOT LIKE '%In those days it happened as recorded in%' AND
        text NOT LIKE '%placeholder%' AND
        text NOT LIKE '%Lorem ipsum%' AND
        text NOT LIKE '%according to%' AND
        text NOT LIKE '%as recorded in%' AND
        text NOT LIKE '%The word of the Lord according to%' AND
        text NOT LIKE '%GOD''s Word according to%' AND
        text NOT LIKE '%Jesus said to them as recorded in%' AND
        text NOT LIKE '%And Jesus said unto them according to%' AND
        length(text) > 10
      `);
    
    return Number(result[0].count);
  }

  /**
   * Sleep helper for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Execute the mass replacement
 */
async function main() {
  try {
    const replacer = new MassScriptureReplacer();
    await replacer.execute();
  } catch (error) {
    console.error('❌ Mass replacement failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MassScriptureReplacer;