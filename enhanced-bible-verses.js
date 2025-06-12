// Background automated Bible verse population to reach 1000 verses
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { bibleVerses } from './shared/schema.js';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { bibleVerses } });

// Massive verse collection organized for systematic population
const verseCollections = [
  // HEBREWS - Faith and perseverance
  { ref: "Hebrews 4:12", text: "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.", tags: ["word of God", "active", "sharp"], cat: "scripture", score: 91 },
  { ref: "Hebrews 4:16", text: "Let us then approach God's throne of grace with confidence, so that we may receive mercy and find grace to help us in our time of need.", tags: ["throne of grace", "confidence", "mercy"], cat: "prayer", score: 89 },
  { ref: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see.", tags: ["faith", "confidence", "hope"], cat: "faith", score: 94 },
  { ref: "Hebrews 11:6", text: "And without faith it is impossible to please God, because anyone who comes to him must believe that he exists and that he rewards those who earnestly seek him.", tags: ["faith", "please God", "seek"], cat: "faith", score: 88 },
  { ref: "Hebrews 12:1", text: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us,", tags: ["witnesses", "perseverance", "race"], cat: "perseverance", score: 87 },
  { ref: "Hebrews 12:2", text: "fixing our eyes on Jesus, the pioneer and perfecter of faith. For the joy set before him he endured the cross, scorning its shame, and sat down at the right hand of the throne of God.", tags: ["fixing eyes", "Jesus", "endured"], cat: "focus", score: 90 },
  { ref: "Hebrews 13:5", text: "Keep your lives free from the love of money and be content with what you have, because God has said, 'Never will I leave you; never will I forsake you.'", tags: ["content", "never leave", "forsake"], cat: "contentment", score: 89 },
  { ref: "Hebrews 13:8", text: "Jesus Christ is the same yesterday and today and forever.", tags: ["same", "yesterday", "forever"], cat: "unchanging", score: 86 },

  // JAMES - Practical faith
  { ref: "James 1:2-3", text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.", tags: ["pure joy", "trials", "perseverance"], cat: "trials", score: 88 },
  { ref: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.", tags: ["wisdom", "ask God", "generously"], cat: "wisdom", score: 91 },
  { ref: "James 1:12", text: "Blessed is the one who perseveres under trial because, having stood the test, they will receive the crown of life that the Lord has promised to those who love him.", tags: ["perseveres", "trial", "crown of life"], cat: "perseverance", score: 85 },
  { ref: "James 1:17", text: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows.", tags: ["good gift", "from above", "not change"], cat: "gifts", score: 87 },
  { ref: "James 1:19", text: "My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry,", tags: ["quick to listen", "slow to speak", "slow to anger"], cat: "communication", score: 89 },
  { ref: "James 1:22", text: "Do not merely listen to the word, and so deceive yourselves. Do what it says.", tags: ["do not merely listen", "do what it says"], cat: "action", score: 86 },
  { ref: "James 4:7", text: "Submit yourselves, then, to God. Resist the devil, and he will flee from you.", tags: ["submit", "resist devil", "flee"], cat: "spiritual warfare", score: 88 },
  { ref: "James 4:8", text: "Come near to God and he will come near to you. Wash your hands, you sinners, and purify your hearts, you double-minded.", tags: ["come near", "purify hearts"], cat: "relationship", score: 87 },
  { ref: "James 4:10", text: "Humble yourselves before the Lord, and he will lift you up.", tags: ["humble", "lift up"], cat: "humility", score: 85 },
  { ref: "James 5:16", text: "Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.", tags: ["confess", "pray", "powerful"], cat: "prayer", score: 90 },

  // 1 PETER - Hope in suffering
  { ref: "1 Peter 1:3", text: "Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead,", tags: ["new birth", "living hope", "resurrection"], cat: "hope", score: 89 },
  { ref: "1 Peter 1:6-7", text: "In all this you greatly rejoice, though now for a little while you may have had to suffer grief in all kinds of trials. These have come so that the proven genuineness of your faith—of greater worth than gold, which perishes even though refined by fire—may result in praise, glory and honor when Jesus Christ is revealed.", tags: ["rejoice", "trials", "proven faith"], cat: "trials", score: 86 },
  { ref: "1 Peter 2:9", text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.", tags: ["chosen people", "royal priesthood", "wonderful light"], cat: "identity", score: 92 },
  { ref: "1 Peter 3:15", text: "But in your hearts revere Christ as Lord. Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have. But do this with gentleness and respect,", tags: ["revere Christ", "give answer", "hope"], cat: "witness", score: 88 },
  { ref: "1 Peter 4:8", text: "Above all, love each other deeply, because love covers over a multitude of sins.", tags: ["love deeply", "covers sins"], cat: "love", score: 87 },
  { ref: "1 Peter 5:6-7", text: "Humble yourselves, therefore, under God's mighty hand, that he may lift you up in due time. Cast all your anxiety on him because he cares for you.", tags: ["humble", "cast anxiety", "cares"], cat: "anxiety", score: 93 },

  // 2 PETER
  { ref: "2 Peter 1:3", text: "His divine power has given us everything we need for a godly life through our knowledge of him who called us by his own glory and goodness.", tags: ["divine power", "everything we need", "godly life"], cat: "provision", score: 85 },
  { ref: "2 Peter 3:9", text: "The Lord is not slow in keeping his promise, as some understand slowness. Instead he is patient with you, not wanting anyone to perish, but everyone to come to repentance.", tags: ["not slow", "patient", "repentance"], cat: "patience", score: 87 },

  // 1 JOHN - Love and assurance
  { ref: "1 John 1:7", text: "But if we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus, his Son, purifies us from all sin.", tags: ["walk in light", "fellowship", "purifies"], cat: "fellowship", score: 86 },
  { ref: "1 John 1:9", text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.", tags: ["confess", "faithful", "forgive"], cat: "forgiveness", score: 92 },
  { ref: "1 John 2:15", text: "Do not love the world or anything in the world. If anyone loves the world, love for the Father is not in them.", tags: ["not love world", "love for Father"], cat: "worldliness", score: 82 },
  { ref: "1 John 3:1", text: "See what great love the Father has lavished on us, that we should be called children of God! And that is what we are! The reason the world does not know us is that it did not know him.", tags: ["great love", "children of God"], cat: "identity", score: 90 },
  { ref: "1 John 3:16", text: "This is how we know what love is: Jesus Christ laid down his life for us. And we ought to lay down our lives for our brothers and sisters.", tags: ["know love", "laid down life"], cat: "love", score: 89 },
  { ref: "1 John 3:18", text: "Dear children, let us not love with words or speech but with actions and in truth.", tags: ["not words", "actions", "truth"], cat: "action", score: 88 },
  { ref: "1 John 4:8", text: "Whoever does not love does not know God, because God is love.", tags: ["God is love", "know God"], cat: "love", score: 94 },
  { ref: "1 John 4:10", text: "This is love: not that we loved God, but that he loved us and sent his Son as an atoning sacrifice for our sins.", tags: ["this is love", "atoning sacrifice"], cat: "love", score: 91 },
  { ref: "1 John 4:18", text: "There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love.", tags: ["no fear", "perfect love", "drives out"], cat: "fear", score: 89 },
  { ref: "1 John 4:20", text: "Whoever claims to love God yet hates a brother or sister is a liar. For whoever does not love their brother and sister, whom they have seen, cannot love God, whom they have not seen.", tags: ["claims to love", "hates brother", "liar"], cat: "love", score: 85 },
  { ref: "1 John 5:4", text: "for everyone born of God overcomes the world. This is the victory that has overcome the world, even our faith.", tags: ["born of God", "overcomes world", "victory"], cat: "victory", score: 88 },
  { ref: "1 John 5:14-15", text: "This is the confidence we have in approaching God: that if we ask anything according to his will, he hears us. And if we know that he hears us—whatever we ask—we know that we have what we asked of him.", tags: ["confidence", "according to will", "hears us"], cat: "prayer", score: 87 },

  // REVELATION - Hope and victory
  { ref: "Revelation 1:8", text: "'I am the Alpha and the Omega,' says the Lord God, 'who is, and who was, and who is to come, the Almighty.'", tags: ["Alpha Omega", "who is", "Almighty"], cat: "identity", score: 88 },
  { ref: "Revelation 3:20", text: "Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with that person, and they with me.", tags: ["stand at door", "knock", "come in"], cat: "invitation", score: 91 },
  { ref: "Revelation 21:4", text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.", tags: ["wipe tears", "no more death", "passed away"], cat: "comfort", score: 93 },
  { ref: "Revelation 22:13", text: "I am the Alpha and the Omega, the First and the Last, the Beginning and the End.", tags: ["Alpha Omega", "First Last", "Beginning End"], cat: "eternal", score: 86 }
];

async function populateEnhancedVerses() {
  console.log("🔄 Background verse population starting...");
  
  // Convert to proper format
  const formattedVerses = verseCollections.map(v => {
    const parts = v.ref.split(' ');
    const bookName = parts.slice(0, -1).join(' ');
    const chapterVerse = parts[parts.length - 1];
    const [chapter, verseNum] = chapterVerse.includes(':') ? chapterVerse.split(':') : [chapterVerse, '1'];
    
    return {
      reference: v.ref,
      book: bookName,
      chapter: parseInt(chapter) || 1,
      verse: verseNum || '1',
      text: v.text,
      translation: "NIV",
      topic_tags: v.tags,
      category: v.cat,
      popularity_score: v.score,
      ai_summary: v.text.split('.')[0] + '.'
    };
  });

  const batchSize = 25;
  let inserted = 0;
  
  for (let i = 0; i < formattedVerses.length; i += batchSize) {
    const batch = formattedVerses.slice(i, i + batchSize);
    try {
      await db.insert(bibleVerses).values(batch).onConflictDoNothing();
      inserted += batch.length;
      console.log(`⚡ Background: Added ${batch.length} verses (batch ${Math.floor(i/batchSize) + 1})`);
    } catch (error) {
      console.error(`❌ Background batch failed:`, error.message);
    }
  }
  
  const total = (await db.select().from(bibleVerses)).length;
  console.log(`\n📊 BACKGROUND POPULATION COMPLETE:`);
  console.log(`Added: ${inserted} verses`);
  console.log(`Database total: ${total} verses`);
  console.log(`Progress: ${(total/1000*100).toFixed(1)}%`);
  console.log(`Remaining: ${1000 - total} verses`);
  
  if (total >= 1000) {
    console.log("🎉 TARGET ACHIEVED: 1000+ Bible verses!");
  } else {
    console.log(`📅 Continue running this script to reach 1000 verses`);
  }
  
  await pool.end();
  return total;
}

// Self-executing background process
if (import.meta.url === `file://${process.argv[1]}`) {
  populateEnhancedVerses().catch(console.error);
}