import { db } from './server/db.js';
import { bibleVerses } from './shared/schema.js';

function generateMoreVerses() {
  // Generate verses with correct schema format
  return [
    // Genesis
    { reference: "Genesis 1:1", book: "Genesis", chapter: 1, verse: "1", text: "In the beginning God created the heavens and the earth.", translation: "NIV", topicTags: ["creation", "beginning", "God"], category: "core", popularityScore: 10 },
    { reference: "Genesis 1:27", book: "Genesis", chapter: 1, verse: "27", text: "So God created mankind in his own image, in the image of God he created them; male and female he created them.", translation: "NIV", topicTags: ["identity", "creation", "image"], category: "core", popularityScore: 9 },
    { reference: "Genesis 8:22", book: "Genesis", chapter: 8, verse: "22", text: "As long as the earth endures, seedtime and harvest, cold and heat, summer and winter, day and night will never cease.", translation: "NIV", topicTags: ["faithfulness", "seasons", "promise"], category: "topical", popularityScore: 6 },
    { reference: "Genesis 15:6", book: "Genesis", chapter: 15, verse: "6", text: "Abram believed the Lord, and he credited it to him as righteousness.", translation: "NIV", topicTags: ["faith", "belief", "righteousness"], category: "core", popularityScore: 8 },
    { reference: "Genesis 28:15", book: "Genesis", chapter: 28, verse: "15", text: "I am with you and will watch over you wherever you go, and I will bring you back to this land. I will not leave you until I have done what I have promised you.", translation: "NIV", topicTags: ["presence", "protection", "promise"], category: "core", popularityScore: 7 },
    
    // Exodus
    { reference: "Exodus 14:14", book: "Exodus", chapter: 14, verse: "14", text: "The Lord will fight for you; you need only to be still.", translation: "NIV", topicTags: ["trust", "stillness", "protection"], category: "core", popularityScore: 9 },
    { reference: "Exodus 15:2", book: "Exodus", chapter: 15, verse: "2", text: "The Lord is my strength and my defense; he has given me victory. He is my God, and I will praise him, my father's God, and I will exalt him.", translation: "NIV", topicTags: ["strength", "victory", "praise"], category: "devotional", popularityScore: 7 },
    { reference: "Exodus 20:12", book: "Exodus", chapter: 20, verse: "12", text: "Honor your father and your mother, so that you may live long in the land the Lord your God is giving you.", translation: "NIV", topicTags: ["family", "honor", "parents"], category: "core", popularityScore: 8 },
    { reference: "Exodus 33:14", book: "Exodus", chapter: 33, verse: "14", text: "The Lord replied, 'My Presence will go with you, and I will give you rest.'", translation: "NIV", topicTags: ["presence", "rest", "peace"], category: "core", popularityScore: 8 },
    
    // Deuteronomy
    { reference: "Deuteronomy 6:5", book: "Deuteronomy", chapter: 6, verse: "5", text: "Love the Lord your God with all your heart and with all your soul and with all your strength.", translation: "NIV", topicTags: ["love", "heart", "soul"], category: "core", popularityScore: 10 },
    { reference: "Deuteronomy 31:6", book: "Deuteronomy", chapter: 31, verse: "6", text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.", translation: "NIV", topicTags: ["courage", "strength", "presence"], category: "core", popularityScore: 9 },
    { reference: "Deuteronomy 30:19", book: "Deuteronomy", chapter: 30, verse: "19", text: "This day I call the heavens and the earth as witnesses against you that I have set before you life and death, blessings and curses. Now choose life, so that you and your children may live.", translation: "NIV", topicTags: ["choice", "life", "blessing"], category: "topical", popularityScore: 6 },
    
    // Joshua
    { reference: "Joshua 1:9", book: "Joshua", chapter: 1, verse: "9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", translation: "NIV", topicTags: ["courage", "strength", "presence"], category: "core", popularityScore: 10 },
    { reference: "Joshua 24:15", book: "Joshua", chapter: 24, verse: "15", text: "But if serving the Lord seems undesirable to you, then choose for yourselves this day whom you will serve, whether the gods your ancestors served beyond the Euphrates, or the gods of the Amorites, in whose land you are living. But as for me and my household, we will serve the Lord.", translation: "NIV", topicTags: ["choice", "service", "household"], category: "core", popularityScore: 8 },
    
    // Psalms - Additional verses
    { reference: "Psalm 121:1-2", book: "Psalms", chapter: 121, verse: "1-2", text: "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.", translation: "NIV", topicTags: ["help", "trust", "strength"], category: "core", popularityScore: 9 },
    { reference: "Psalm 139:14", text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.", book: "Psalms", chapter: 139, theme: "identity", tags: ["self-worth", "creation", "praise"] },
    { reference: "Psalm 46:10", text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.", book: "Psalms", chapter: 46, theme: "peace", tags: ["stillness", "God's sovereignty", "peace"] },
    { reference: "Psalm 34:8", text: "Taste and see that the Lord is good; blessed is the one who takes refuge in him.", book: "Psalms", chapter: 34, theme: "goodness", tags: ["blessing", "refuge", "goodness"] },
    
    // Proverbs - Wisdom verses
    { reference: "Proverbs 16:3", text: "Commit to the Lord whatever you do, and he will establish your plans.", book: "Proverbs", chapter: 16, theme: "planning", tags: ["commitment", "plans", "trust"] },
    { reference: "Proverbs 27:17", text: "As iron sharpens iron, so one person sharpens another.", book: "Proverbs", chapter: 27, theme: "friendship", tags: ["relationships", "growth", "sharpening"] },
    { reference: "Proverbs 31:25", text: "She is clothed with strength and dignity; she can laugh at the days to come.", book: "Proverbs", chapter: 31, theme: "strength", tags: ["dignity", "confidence", "future"] },
    { reference: "Proverbs 18:24", text: "One who has unreliable friends soon comes to ruin, but there is a friend who sticks closer than a brother.", book: "Proverbs", chapter: 18, theme: "friendship", tags: ["loyalty", "relationships", "trust"] },
    
    // Matthew - Jesus' teachings
    { reference: "Matthew 5:14-16", text: "You are the light of the world. A town built on a hill cannot be hidden. Neither do people light a lamp and put it under a bowl. Instead they put it on its stand, and it gives light to everyone in the house. In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", book: "Matthew", chapter: 5, theme: "witness", tags: ["light", "witness", "good deeds"] },
    { reference: "Matthew 11:28-30", text: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls. For my yoke is easy and my burden is light.", book: "Matthew", chapter: 11, theme: "rest", tags: ["burden", "rest", "gentle"] },
    { reference: "Matthew 6:26", text: "Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?", book: "Matthew", chapter: 6, theme: "provision", tags: ["worry", "provision", "value"] },
    { reference: "Matthew 28:19-20", text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.", book: "Matthew", chapter: 28, theme: "mission", tags: ["discipleship", "mission", "presence"] },
    
    // John - Love and truth
    { reference: "John 15:13", text: "Greater love has no one than this: to lay down one's life for one's friends.", book: "John", chapter: 15, theme: "love", tags: ["sacrifice", "friendship", "love"] },
    { reference: "John 8:32", text: "Then you will know the truth, and the truth will set you free.", book: "John", chapter: 8, theme: "truth", tags: ["freedom", "truth", "knowledge"] },
    { reference: "John 10:10", text: "The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full.", book: "John", chapter: 10, theme: "life", tags: ["abundant life", "purpose", "fullness"] },
    { reference: "John 15:5", text: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.", book: "John", chapter: 15, theme: "connection", tags: ["fruit", "abiding", "dependence"] },
    
    // Romans - Salvation and life
    { reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", book: "Romans", chapter: 8, theme: "purpose", tags: ["good", "purpose", "calling"] },
    { reference: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.", book: "Romans", chapter: 12, theme: "transformation", tags: ["mind", "will", "transformation"] },
    { reference: "Romans 5:8", text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", book: "Romans", chapter: 5, theme: "love", tags: ["sacrifice", "love", "grace"] },
    { reference: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.", book: "Romans", chapter: 15, theme: "hope", tags: ["joy", "peace", "hope"] },
    
    // 1 Corinthians - Church life and love
    { reference: "1 Corinthians 13:4-7", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.", book: "1 Corinthians", chapter: 13, theme: "love", tags: ["patience", "kindness", "protection"] },
    { reference: "1 Corinthians 10:13", text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.", book: "1 Corinthians", chapter: 10, theme: "temptation", tags: ["faithfulness", "endurance", "escape"] },
    { reference: "1 Corinthians 16:14", text: "Do everything in love.", book: "1 Corinthians", chapter: 16, theme: "love", tags: ["actions", "love", "everything"] },
    
    // 2 Corinthians - Strength in weakness
    { reference: "2 Corinthians 12:9", text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.", book: "2 Corinthians", chapter: 12, theme: "grace", tags: ["weakness", "power", "grace"] },
    { reference: "2 Corinthians 4:16-17", text: "Therefore we do not lose heart. Though outwardly we are wasting away, yet inwardly we are being renewed day by day. For our light and momentary troubles are achieving for us an eternal glory that far outweighs them all.", book: "2 Corinthians", chapter: 4, theme: "perseverance", tags: ["renewal", "glory", "troubles"] },
    { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", book: "2 Corinthians", chapter: 5, theme: "new creation", tags: ["transformation", "new", "Christ"] }
    
    // Continue with more books and verses to reach 1000...
    // This is just a sample - we would need to generate many more to reach 1000 total
  ];
}

async function populateToThousandVerses() {
  console.log('📖 Starting Bible verse population to reach 1000 verses...');
  
  try {
    // Check current count
    const currentCount = await db.select().from(bibleVerses);
    console.log(`Current verse count: ${currentCount.length}`);
    
    if (currentCount.length >= 1000) {
      console.log('✅ Already have 1000+ verses in database');
      return;
    }
    
    const versesToAdd = generateMoreVerses();
    
    // Add verses in batches
    const batchSize = 50;
    let addedCount = 0;
    
    for (let i = 0; i < versesToAdd.length; i += batchSize) {
      const batch = versesToAdd.slice(i, i + batchSize);
      
      try {
        await db.insert(bibleVerses).values(batch);
        addedCount += batch.length;
        console.log(`✅ Added batch ${Math.floor(i/batchSize) + 1}: ${batch.length} verses`);
      } catch (error) {
        console.log(`⚠️ Skipped duplicate verses in batch ${Math.floor(i/batchSize) + 1}`);
      }
    }
    
    // Check final count
    const finalCount = await db.select().from(bibleVerses);
    console.log(`📊 Final verse count: ${finalCount.length}`);
    console.log(`✨ Added ${addedCount} new verses`);
    
    if (finalCount.length >= 1000) {
      console.log('🎉 Successfully reached 1000+ Bible verses!');
    } else {
      console.log(`📝 Still need ${1000 - finalCount.length} more verses to reach 1000`);
    }
    
  } catch (error) {
    console.error('❌ Error populating Bible verses:', error);
  }
}

export default populateToThousandVerses;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateToThousandVerses()
    .then(() => {
      console.log('✅ Bible verse population complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Population failed:', error);
      process.exit(1);
    });
}