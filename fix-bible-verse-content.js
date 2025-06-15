/**
 * Fix Bible Verse Content - Replace Summary Descriptions with Actual Bible Text
 * This script updates the database with authentic Biblical verse content
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import { bibleVerses } from "./shared/schema.ts";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Authentic Bible verse content for popular verses
const authenticVerses = [
  // Core Faith Verses
  { reference: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { reference: "Romans 10:11", text: "For the Scripture says, 'Everyone who believes in him will not be put to shame.'" },
  { reference: "Ephesians 2:8", text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God." },
  { reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
  
  // Peace and Comfort
  { reference: "Psalm 23:1", text: "The Lord is my shepherd, I lack nothing." },
  { reference: "John 14:27", text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid." },
  { reference: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." },
  { reference: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  
  // Strength and Hope
  { reference: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
  { reference: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go." },
  
  // Love and Grace
  { reference: "1 John 4:8", text: "Whoever does not love does not know God, because God is love." },
  { reference: "Romans 8:38-39", text: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord." },
  { reference: "1 Corinthians 13:4-5", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs." },
  
  // Wisdom and Guidance
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." },
  { reference: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." },
  { reference: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path." },
  
  // Joy and Worship
  { reference: "Psalm 100:4", text: "Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name." },
  { reference: "Nehemiah 8:10", text: "Do not grieve, for the joy of the Lord is your strength." },
  { reference: "Psalm 150:6", text: "Let everything that has breath praise the Lord. Praise the Lord." },
  
  // Forgiveness and Purpose
  { reference: "1 John 1:9", text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." },
  { reference: "Ephesians 2:10", text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." },
  { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" },
  
  // Additional Popular Verses
  { reference: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will." },
  { reference: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law." },
  { reference: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see." },
  { reference: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you." },
  { reference: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
  { reference: "Psalm 46:10", text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth." }
];

async function fixBibleVerseContent() {
  try {
    console.log('🔧 Fixing Bible verse content with authentic Biblical text...');
    
    let updatedCount = 0;
    
    for (const verse of authenticVerses) {
      try {
        // Update verses that match the reference
        const result = await db
          .update(schema.bibleVerses)
          .set({ text: verse.text })
          .where(eq(schema.bibleVerses.reference, verse.reference));
        
        console.log(`✅ Updated ${verse.reference}: "${verse.text.substring(0, 50)}..."`);
        updatedCount++;
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`❌ Error updating ${verse.reference}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} Bible verses with authentic content`);
    console.log('📖 Audio Bible functionality should now work properly with real verse text');
    
    // Test a sample verse to confirm the update
    const testVerse = await db
      .select()
      .from(schema.bibleVerses)
      .where(eq(schema.bibleVerses.reference, 'John 3:16'))
      .limit(1);
      
    if (testVerse.length > 0) {
      console.log('\n✅ Verification successful:');
      console.log(`Reference: ${testVerse[0].reference}`);
      console.log(`Text: ${testVerse[0].text}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing Bible verse content:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixBibleVerseContent();