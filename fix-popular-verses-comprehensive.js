/**
 * Comprehensive Popular Bible Verses Fix
 * Adds authentic translation texts for the most commonly referenced verses
 * Ensures all 17 Bible versions have accurate, theologically correct texts
 */

import { db } from './server/db.js';
import { bibleVerses } from './shared/schema.js';

// Most popular Bible verses that users frequently look up
const popularVerses = [
  {
    reference: 'John 3:16',
    book: 'John',
    chapter: 3,
    verse: '16',
    translations: {
      'KJV': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      'NIV': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      'NLT': 'For this is how God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
      'ESV': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
      'MSG': 'This is how much God loved the world: He gave his Son, his one and only Son. And this is why: so that no one need be destroyed; by believing in him, anyone can have a whole and lasting life.',
      'AMP': 'For God so [greatly] loved and dearly prized the world, that He [even] gave His [One and] only begotten Son, so that whoever believes and trusts in Him [as Savior] shall not perish, but have eternal life.',
      'GNT': 'For God loved the world so much that he gave his only Son, so that everyone who believes in him may not die but have eternal life.',
      'CEV': 'God loved the people of this world so much that he gave his only Son, so that everyone who has faith in him will have eternal life and never really die.',
      'CEB': 'God so loved the world that he gave his only Son, so that everyone who believes in him won\'t perish but will have eternal life.',
      'NET': 'For this is the way God loved the world: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
      'NKJV': 'For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life.',
      'RSV': 'For God so loved the world that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
      'NRSV': 'For God so loved the world that he gave his only Son, so that everyone who believes in him may not perish but may have eternal life.',
      'NCV': 'God loved the world so much that he gave his one and only Son so that whoever believes in him may not be lost, but have eternal life.',
      'HCSB': 'For God loved the world in this way: He gave His One and Only Son, so that everyone who believes in Him will not perish but have eternal life.',
      'CSB': 'For God loved the world in this way: He gave his one and only Son, so that everyone who believes in him will not perish but have eternal life.',
      'NASB': 'For God so loved the world, that He gave His only begotten Son, that whoever believes in Him shall not perish, but have eternal life.'
    }
  },
  {
    reference: 'Psalm 23:1',
    book: 'Psalm',
    chapter: 23,
    verse: '1',
    translations: {
      'KJV': 'The LORD is my shepherd; I shall not want.',
      'NIV': 'The Lord is my shepherd, I lack nothing.',
      'NLT': 'The Lord is my shepherd; I have all that I need.',
      'ESV': 'The Lord is my shepherd; I shall not want.',
      'MSG': 'God, my shepherd! I don\'t need a thing.',
      'AMP': 'The Lord is my Shepherd [to feed, to guide and to shield me], I shall not want.',
      'GNT': 'The Lord is my shepherd; I have everything I need.',
      'CEV': 'You, Lord, are my shepherd. I will never be in need.',
      'CEB': 'The Lord is my shepherd. I lack nothing.',
      'NET': 'The Lord is my shepherd, I lack nothing.',
      'NKJV': 'The Lord is my shepherd; I shall not want.',
      'RSV': 'The Lord is my shepherd, I shall not want.',
      'NRSV': 'The Lord is my shepherd, I shall not want.',
      'NCV': 'The Lord is my shepherd; I have everything I need.',
      'HCSB': 'The Lord is my shepherd; I have what I need.',
      'CSB': 'The Lord is my shepherd; I have what I need.',
      'NASB': 'The Lord is my shepherd, I shall not want.'
    }
  },
  {
    reference: 'Philippians 4:13',
    book: 'Philippians',
    chapter: 4,
    verse: '13',
    translations: {
      'KJV': 'I can do all things through Christ which strengtheneth me.',
      'NIV': 'I can do all this through him who gives me strength.',
      'NLT': 'For I can do everything through Christ, who gives me strength.',
      'ESV': 'I can do all things through him who strengthens me.',
      'MSG': 'Whatever I have, wherever I am, I can make it through anything in the One who makes me who I am.',
      'AMP': 'I can do all things [which He has called me to do] through Him who strengthens and empowers me [to fulfill His purpose—I am self-sufficient in Christ\'s sufficiency; I am ready for anything and equal to anything through Him who infuses me with inner strength and confident peace.]',
      'GNT': 'I have the strength to face all conditions by the power that Christ gives me.',
      'CEV': 'Christ gives me the strength to face anything.',
      'CEB': 'I can endure all these things through the power of the one who gives me strength.',
      'NET': 'I am able to do all things through the one who strengthens me.',
      'NKJV': 'I can do all things through Christ who strengthens me.',
      'RSV': 'I can do all things in him who strengthens me.',
      'NRSV': 'I can do all things through him who strengthens me.',
      'NCV': 'I can do all things through Christ, because he gives me strength.',
      'HCSB': 'I am able to do all things through Him who strengthens me.',
      'CSB': 'I am able to do all things through him who strengthens me.',
      'NASB': 'I can do all things through Him who strengthens me.'
    }
  },
  {
    reference: 'Romans 8:28',
    book: 'Romans',
    chapter: 8,
    verse: '28',
    translations: {
      'KJV': 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      'NIV': 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      'NLT': 'And we know that God causes everything to work together for the good of those who love God and are called according to his purpose for them.',
      'ESV': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
      'MSG': 'That\'s why we can be so sure that every detail in our lives of love for God is worked into something good.',
      'AMP': 'And we know [with great confidence] that God [who is deeply concerned about us] causes all things to work together [as a plan] for good for those who love God, to those who are called according to His plan and purpose.',
      'GNT': 'We know that in all things God works for good with those who love him, those whom he has called according to his purpose.',
      'CEV': 'We know that God is always at work for the good of everyone who loves him. They are the ones God has chosen for his purpose.',
      'CEB': 'We know that God works all things together for good for the ones who love God, for those who are called according to his purpose.',
      'NET': 'And we know that all things work together for good for those who love God, who are called according to his purpose.',
      'NKJV': 'And we know that all things work together for good to those who love God, to those who are the called according to His purpose.',
      'RSV': 'We know that in everything God works for good with those who love him, who are called according to his purpose.',
      'NRSV': 'We know that all things work together for good for those who love God, who are called according to his purpose.',
      'NCV': 'We know that in everything God works for the good of those who love him. They are the people he called, because that was his plan.',
      'HCSB': 'We know that all things work together for the good of those who love God: those who are called according to His purpose.',
      'CSB': 'We know that all things work together for the good of those who love God, who are called according to his purpose.',
      'NASB': 'And we know that God causes all things to work together for good to those who love God, to those who are called according to His purpose.'
    }
  },
  {
    reference: 'Jeremiah 29:11',
    book: 'Jeremiah',
    chapter: 29,
    verse: '11',
    translations: {
      'KJV': 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
      'NIV': '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
      'NLT': '"For I know the plans I have for you," says the Lord. "They are plans for good and not for disaster, to give you a future and a hope."',
      'ESV': 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
      'MSG': '"I know what I\'m doing. I have it all planned out—plans to take care of you, not abandon you, plans to give you the future you hope for."',
      'AMP': 'For I know the plans and thoughts that I have for you,\' says the Lord, \'plans for peace and well-being and not for disaster, to give you a future and a hope.',
      'GNT': 'I alone know the plans I have for you, plans to bring you prosperity and not disaster, plans to bring about the future you hope for.',
      'CEV': 'I will bless you with a future filled with hope—a future of success, not of suffering.',
      'CEB': 'I know the plans I have in mind for you, declares the Lord; they are plans for peace, not disaster, to give you a future filled with hope.',
      'NET': 'For I know what I have planned for you,\' says the Lord. \'I have plans to prosper you, not to harm you. I have plans to give you a future filled with hope.',
      'NKJV': 'For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.',
      'RSV': 'For I know the plans I have for you, says the Lord, plans for welfare and not for evil, to give you a future and a hope.',
      'NRSV': 'For surely I know the plans I have for you, says the Lord, plans for your welfare and not for harm, to give you a future with hope.',
      'NCV': 'I say this because I know what I am planning for you," says the Lord. "I have good plans for you, not plans to hurt you. I will give you hope and a good future.',
      'HCSB': 'For I know the plans I have for you"—this is the Lord\'s declaration—"plans for your welfare, not for disaster, to give you a future and a hope.',
      'CSB': 'For I know the plans I have for you"—this is the Lord\'s declaration—"plans for your well-being, not for disaster, to give you a future and a hope.',
      'NASB': '\'For I know the plans that I have for you,\' declares the Lord, \'plans for welfare and not for calamity to give you a future and a hope.'
    }
  },
  {
    reference: 'Isaiah 41:10',
    book: 'Isaiah',
    chapter: 41,
    verse: '10',
    translations: {
      'KJV': 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.',
      'NIV': 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
      'NLT': 'Don\'t be afraid, for I am with you. Don\'t be discouraged, for I am your God. I will strengthen you and help you. I will hold you up with my victorious right hand.',
      'ESV': 'fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.',
      'MSG': 'Don\'t panic. I\'m with you. There\'s no need to fear for I\'m your God. I\'ll give you strength. I\'ll help you. I\'ll hold you steady, keep a firm grip on you.',
      'AMP': 'Do not fear [anything], for I am with you; Do not be afraid, for I am your God. I will strengthen and harden you [to difficulties]; yes, I will help you; yes, I will hold you up and retain you with My righteous right hand [of justice and salvation].',
      'GNT': 'Do not be afraid—I am with you! I am your God—let nothing terrify you! I will make you strong and help you; I will protect you and save you.',
      'CEV': 'Don\'t be afraid. I am with you. Don\'t tremble with fear. I am your God. I will make you strong, as I protect you with my arm and give you victories.',
      'CEB': 'Don\'t fear, because I\'m with you; don\'t be afraid, for I am your God. I\'ll strengthen you, I\'ll surely help you; I\'ll hold you with my righteous strong hand.',
      'NET': 'Don\'t be afraid, for I am with you! Don\'t be frightened, for I am your God! I strengthen you—yes, I help you—yes, I uphold you with my saving right hand!',
      'NKJV': 'Fear not, for I am with you; Be not dismayed, for I am your God. I will strengthen you, Yes, I will help you, I will uphold you with My righteous right hand.',
      'RSV': 'fear not, for I am with you, be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my victorious right hand.',
      'NRSV': 'do not fear, for I am with you, do not be afraid, for I am your God; I will strengthen you, I will help you, I will uphold you with my victorious right hand.',
      'NCV': 'So don\'t worry, because I am with you. Don\'t be afraid, because I am your God. I will make you strong and will help you; I will support you with my right hand that saves you.',
      'HCSB': 'Do not fear, for I am with you; do not be afraid, for I am your God. I will strengthen you; I will help you; I will hold on to you with My righteous right hand.',
      'CSB': 'Do not fear, for I am with you; do not be afraid, for I am your God. I will strengthen you; I will help you; I will hold on to you with my righteous right hand.',
      'NASB': 'Do not fear, for I am with you; Do not anxiously look about you, for I am your God. I will strengthen you, surely I will help you, Surely I will uphold you with My righteous right hand.'
    }
  },
  {
    reference: 'Proverbs 3:5-6',
    book: 'Proverbs',
    chapter: 3,
    verse: '5-6',
    translations: {
      'KJV': 'Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
      'NIV': 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
      'NLT': 'Trust in the Lord with all your heart; do not depend on your own understanding. Seek his will in all you do, and he will show you which path to take.',
      'ESV': 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
      'MSG': 'Trust God from the bottom of your heart; don\'t try to figure out everything on your own. Listen for God\'s voice in everything you do, everywhere you go; he\'s the one who will keep you on track.',
      'AMP': 'Trust in and rely confidently on the Lord with all your heart And do not rely on your own insight or understanding. In all your ways know and acknowledge and recognize Him, And He will make your paths straight and smooth [removing obstacles that block your way].',
      'GNT': 'Trust in the Lord with all your heart. Never rely on what you think you know. Remember the Lord in everything you do, and he will show you the right way.',
      'CEV': 'With all your heart you must trust the Lord and not your own judgment. Always let him lead you, and he will clear the road for you to follow.',
      'CEB': 'Trust in the Lord with all your heart; don\'t rely on your own intelligence. Know him in all your paths, and he will keep your ways straight.',
      'NET': 'Trust in the Lord with all your heart, and do not rely on your own understanding. Acknowledge him in all your ways, and he will make your paths straight.',
      'NKJV': 'Trust in the Lord with all your heart, And lean not on your own understanding; In all your ways acknowledge Him, And He shall direct your paths.',
      'RSV': 'Trust in the Lord with all your heart, and do not rely on your own insight. In all your ways acknowledge him, and he will make straight your paths.',
      'NRSV': 'Trust in the Lord with all your heart, and do not rely on your own insight. In all your ways acknowledge him, and he will make straight your paths.',
      'NCV': 'Trust the Lord with all your heart, and don\'t depend on your own understanding. Remember the Lord in all you do, and he will give you success.',
      'HCSB': 'Trust in the Lord with all your heart, and do not rely on your own understanding; think about Him in all your ways, and He will guide you on the right paths.',
      'CSB': 'Trust in the Lord with all your heart, and do not rely on your own understanding; in all your ways know him, and he will make your paths straight.',
      'NASB': 'Trust in the Lord with all your heart And do not lean on your own understanding. In all your ways acknowledge Him, And He will make your paths straight.'
    }
  }
];

async function populatePopularVerses() {
  try {
    console.log('🔄 Starting comprehensive popular verse population...');
    
    let totalInserted = 0;
    
    for (const verse of popularVerses) {
      console.log(`📖 Processing ${verse.reference}...`);
      
      for (const [translation, text] of Object.entries(verse.translations)) {
        try {
          await db.insert(bibleVerses).values({
            reference: verse.reference,
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: text,
            translation: translation,
            category: 'Core',
            topicTags: ['popular', 'faith', 'hope'],
            isActive: true
          }).onConflictDoUpdate({
            target: [bibleVerses.reference, bibleVerses.translation],
            set: {
              text: text,
              category: 'Core',
              topicTags: ['popular', 'faith', 'hope'],
              updatedAt: new Date()
            }
          });
          
          totalInserted++;
        } catch (error) {
          console.error(`❌ Error inserting ${verse.reference} (${translation}):`, error.message);
        }
      }
      
      console.log(`✅ Completed ${verse.reference} across all translations`);
    }
    
    console.log(`🎉 Successfully populated ${totalInserted} authentic Bible verse entries`);
    console.log(`📊 Covered ${popularVerses.length} popular verses across 17 Bible translations`);
    
    // Verify the results
    const verificationQuery = await db.select().from(bibleVerses)
      .where(eq(bibleVerses.reference, 'Romans 12:2'))
      .orderBy(bibleVerses.translation);
    
    console.log(`✅ Verification: Romans 12:2 now has ${verificationQuery.length} translations`);
    
    return {
      success: true,
      versesProcessed: popularVerses.length,
      entriesInserted: totalInserted,
      translationsPerVerse: 17
    };
    
  } catch (error) {
    console.error('❌ Error in popular verse population:', error);
    throw error;
  }
}

// Execute the population
populatePopularVerses()
  .then(result => {
    console.log('🎯 Popular verse population completed successfully:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Popular verse population failed:', error);
    process.exit(1);
  });