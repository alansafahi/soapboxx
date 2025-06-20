import { db } from './server/db.ts';
import { bibleVerses } from './shared/schema.ts';
import { eq, and } from 'drizzle-orm';

// Complete Bible version mapping with authentic texts
const COMPREHENSIVE_BIBLE_VERSES = {
  "Psalm 23:1": {
    KJV: "The LORD is my shepherd; I shall not want.",
    NIV: "The Lord is my shepherd, I lack nothing.",
    NLT: "The Lord is my shepherd; I have all that I need.",
    ESV: "The Lord is my shepherd; I shall not want.",
    NASB: "The Lord is my shepherd, I shall not want.",
    CSB: "The Lord is my shepherd; I lack nothing.",
    MSG: "God, my shepherd! I don't need a thing.",
    AMP: "The Lord is my Shepherd [to feed, to guide and to shield me], I shall not want.",
    CEV: "You, Lord, are my shepherd. I will never be in need.",
    NET: "The Lord is my shepherd; I lack nothing.",
    CEB: "The Lord is my shepherd. I lack nothing.",
    GNT: "The Lord is my shepherd; I have everything I need."
  },
  "Psalm 23:4": {
    KJV: "Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.",
    NIV: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
    NLT: "Even when I walk through the darkest valley, I will not be afraid, for you are close beside me. Your rod and your staff protect and comfort me.",
    ESV: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.",
    NASB: "Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me.",
    CSB: "Even when I go through the darkest valley, I fear no danger, for you are with me; your rod and your staff—they comfort me.",
    MSG: "Even when the way goes through Death Valley, I'm not afraid when you walk at my side. Your trusty shepherd's crook makes me feel secure.",
    AMP: "Even though I walk through the [sunless] valley of the shadow of death, I fear no evil, for You are with me; Your rod [to protect] and Your staff [to guide], they comfort and console me.",
    CEV: "I may walk through valleys as dark as death, but I won't be afraid. You are with me, and your shepherd's rod makes me feel safe.",
    NET: "Even when I must walk through the darkest valley, I fear no danger, for you are with me; your rod and your staff reassure me.",
    CEB: "Even when I walk through the darkest valley, I fear no danger because you are with me. Your rod and your staff—they protect me.",
    GNT: "Even if I go through the deepest darkness, I will not be afraid, Lord, for you are with me. Your shepherd's rod and staff protect me."
  },
  "John 3:16": {
    KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    NLT: "For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.",
    ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    NASB: "For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.",
    CSB: "For God loved the world in this way: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.",
    MSG: "This is how much God loved the world: He gave his Son, his one and only Son. And this is why: so that no one need be destroyed; by believing in him, anyone can have a whole and lasting life.",
    AMP: "For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life.",
    CEV: "God loved the people of this world so much that he gave his only Son, so that everyone who has faith in him will have eternal life and never really die.",
    NET: "For this is the way God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.",
    CEB: "God so loved the world that he gave his only Son, so that everyone who believes in him won't perish but will have eternal life.",
    GNT: "For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life."
  },
  "Romans 8:28": {
    KJV: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    NIV: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
    NLT: "And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.",
    ESV: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
    NASB: "And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.",
    CSB: "We know that all things work together for the good of those who love God, who are called according to his purpose.",
    MSG: "That's why we can be so sure that every detail in our lives of love for God is worked into something good.",
    AMP: "And we know [with great confidence] that God [who is deeply concerned about us] causes all things to work together [as a plan] for good for those who love God, to those who are called according to His plan and purpose.",
    CEV: "We know that God is always at work for the good of everyone who loves him. They are the ones God has chosen for his purpose.",
    NET: "And we know that all things work together for good for those who love God, who are called according to his purpose.",
    CEB: "We know that God works all things together for good for the ones who love God, for those who are called according to his purpose.",
    GNT: "We know that in all things God works for good with those who love him, those whom he has called according to his purpose."
  },
  "Philippians 4:13": {
    KJV: "I can do all things through Christ which strengtheneth me.",
    NIV: "I can do all this through him who gives me strength.",
    NLT: "For I can do everything through Christ, who gives me strength.",
    ESV: "I can do all things through him who strengthens me.",
    NASB: "I can do all things through Him who strengthens me.",
    CSB: "I am able to do all things through him who strengthens me.",
    MSG: "Whatever I have, wherever I am, I can make it through anything in the One who makes me who I am.",
    AMP: "I can do all things [which He has called me to do] through Him who strengthens and empowers me [to fulfill His purpose—I am self-sufficient in Christ's sufficiency; I am ready for anything and equal to anything through Him who infuses me with inner strength and confident peace.]",
    CEV: "Christ gives me the strength to face anything.",
    NET: "I am able to do all things through the one who strengthens me.",
    CEB: "I can endure all these things through the power of the one who gives me strength.",
    GNT: "I have the strength to face all conditions by the power that Christ gives me."
  },
  "Matthew 5:3": {
    KJV: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
    NIV: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
    NLT: "God blesses those who are poor and realize their need for him, for the Kingdom of Heaven is theirs.",
    ESV: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
    NASB: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.",
    CSB: "Blessed are the poor in spirit, for the kingdom of heaven is theirs.",
    MSG: "You're blessed when you're at the end of your rope. With less of you there is more of God and his rule.",
    AMP: "Blessed [spiritually prosperous, happy, to be admired] are the poor in spirit [those devoid of spiritual arrogance, those who regard themselves as insignificant], for theirs is the kingdom of heaven.",
    CEV: "God blesses those people who depend only on him. They belong to the kingdom of heaven!",
    NET: "Blessed are the poor in spirit, for the kingdom of heaven belongs to them.",
    CEB: "Happy are people who are hopeless, because the kingdom of heaven is theirs.",
    GNT: "Happy are those who know they are spiritually poor; the Kingdom of heaven belongs to them!"
  }
};

async function populateComprehensiveBibleVerses() {
  console.log('🔄 Populating comprehensive Bible verses with all 12 translations...');
  
  const allVersions = ['KJV', 'NIV', 'NLT', 'ESV', 'NASB', 'CSB', 'MSG', 'AMP', 'CEV', 'NET', 'CEB', 'GNT'];
  let totalInserted = 0;
  
  for (const [reference, versions] of Object.entries(COMPREHENSIVE_BIBLE_VERSES)) {
    console.log(`\n📖 Processing: ${reference}`);
    
    // Parse reference to get book, chapter, verse
    const [book, chapterVerse] = reference.split(' ');
    const [chapter, verse] = chapterVerse.split(':');
    
    for (const version of allVersions) {
      const text = versions[version as keyof typeof versions];
      if (!text) continue;
      
      try {
        // Check if this specific verse+translation combination already exists
        const existing = await db.select()
          .from(bibleVerses)
          .where(
            and(
              eq(bibleVerses.reference, reference),
              eq(bibleVerses.translation, version)
            )
          )
          .limit(1);
        
        if (existing.length === 0) {
          // Insert new verse record for this translation
          await db.insert(bibleVerses).values({
            reference: reference,
            book: book,
            chapter: parseInt(chapter),
            verse: verse,
            text: text,
            translation: version,
            category: 'core',
            popularityScore: 10,
            topicTags: ['faith', 'hope', 'strength'],
            isActive: true
          });
          
          console.log(`   ✅ Added ${version}: ${text.substring(0, 50)}...`);
          totalInserted++;
        } else {
          // Update existing verse with new text
          await db.update(bibleVerses)
            .set({
              text: text,
              updatedAt: new Date()
            })
            .where(
              and(
                eq(bibleVerses.reference, reference),
                eq(bibleVerses.translation, version)
              )
            );
          
          console.log(`   🔄 Updated ${version}: ${text.substring(0, 50)}...`);
          totalInserted++;
        }
      } catch (error) {
        console.log(`   ❌ Error with ${version}:`, error.message);
      }
    }
  }
  
  console.log(`\n✅ Successfully processed ${totalInserted} verse translations`);
  
  // Test retrieval
  console.log('\n🧪 Testing verse retrieval...');
  const testVerse = await db.select()
    .from(bibleVerses)
    .where(
      and(
        eq(bibleVerses.reference, 'John 3:16'),
        eq(bibleVerses.translation, 'MSG')
      )
    )
    .limit(1);
  
  if (testVerse.length > 0) {
    console.log('✅ Test successful - MSG John 3:16:', testVerse[0].text);
  } else {
    console.log('❌ Test failed - verse not found');
  }
}

populateComprehensiveBibleVerses().catch(console.error);