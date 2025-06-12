// Automated Bible verse generator to reach 1000 verses efficiently
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { bibleVerses } from './shared/schema.js';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { bibleVerses } });

// Complete Bible verse database - organized by books for systematic coverage
const comprehensiveVerseData = {
  genesis: [
    { ref: "Genesis 1:1", text: "In the beginning God created the heavens and the earth.", tags: ["creation", "beginning", "God"], cat: "core", score: 98 },
    { ref: "Genesis 1:27", text: "So God created mankind in his own image, in the image of God he created them; male and female he created them.", tags: ["image of God", "creation", "mankind"], cat: "identity", score: 95 },
    { ref: "Genesis 8:22", text: "As long as the earth endures, seedtime and harvest, cold and heat, summer and winter, day and night will never cease.", tags: ["seasons", "faithfulness", "promise"], cat: "provision", score: 82 }
  ],
  
  exodus: [
    { ref: "Exodus 14:14", text: "The Lord will fight for you; you need only to be still.", tags: ["fight", "still", "Lord"], cat: "strength", score: 89 },
    { ref: "Exodus 20:12", text: "Honor your father and your mother, so that you may live long in the land the Lord your God is giving you.", tags: ["honor", "parents", "commandment"], cat: "family", score: 85 },
    { ref: "Exodus 33:14", text: "The Lord replied, 'My Presence will go with you, and I will give you rest.'", tags: ["presence", "rest", "Lord"], cat: "peace", score: 87 }
  ],

  deuteronomy: [
    { ref: "Deuteronomy 31:6", text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.", tags: ["courage", "fear", "never leave"], cat: "strength", score: 92 },
    { ref: "Deuteronomy 6:5", text: "Love the Lord your God with all your heart and with all your soul and with all your strength.", tags: ["love God", "heart", "soul", "strength"], cat: "love", score: 96 },
    { ref: "Deuteronomy 8:3", text: "He humbled you, causing you to hunger and then feeding you with manna, which neither you nor your ancestors had known, to teach you that man does not live on bread alone but on every word that comes from the mouth of the Lord.", tags: ["word of Lord", "bread", "humble"], cat: "provision", score: 84 }
  ],

  joshua: [
    { ref: "Joshua 24:15", text: "But as for me and my household, we will serve the Lord.", tags: ["serve", "household", "choice"], cat: "commitment", score: 88 },
    { ref: "Joshua 1:8", text: "Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful.", tags: ["law", "meditate", "prosperous"], cat: "wisdom", score: 85 }
  ],

  nehemiah: [
    { ref: "Nehemiah 8:10", text: "Do not grieve, for the joy of the Lord is your strength.", tags: ["joy", "strength", "grieve"], cat: "joy", score: 89 }
  ],

  job: [
    { ref: "Job 19:25", text: "I know that my redeemer lives, and that in the end he will stand on the earth.", tags: ["redeemer", "lives", "hope"], cat: "hope", score: 87 },
    { ref: "Job 23:10", text: "But he knows the way that I take; when he has tested me, I will come forth as gold.", tags: ["tested", "gold", "refined"], cat: "trials", score: 83 }
  ],

  ecclesiastes: [
    { ref: "Ecclesiastes 3:1", text: "There is a time for everything, and a season for every activity under the heavens:", tags: ["time", "season", "everything"], cat: "wisdom", score: 91 },
    { ref: "Ecclesiastes 12:13", text: "Now all has been heard; here is the conclusion of the matter: Fear God and keep his commandments, for this is the duty of all mankind.", tags: ["fear God", "commandments", "duty"], cat: "wisdom", score: 86 }
  ],

  isaiah: [
    { ref: "Isaiah 9:6", text: "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.", tags: ["child born", "Prince of Peace", "Mighty God"], cat: "prophecy", score: 97 },
    { ref: "Isaiah 43:2", text: "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze.", tags: ["waters", "fire", "protection"], cat: "protection", score: 90 },
    { ref: "Isaiah 53:5", text: "But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.", tags: ["pierced", "healed", "peace"], cat: "salvation", score: 95 },
    { ref: "Isaiah 55:8-9", text: "'For my thoughts are not your thoughts, neither are your ways my ways,' declares the Lord. 'As the heavens are higher than the earth, so are my ways higher than your ways and my thoughts than your thoughts.'", tags: ["thoughts", "ways", "higher"], cat: "mystery", score: 88 },
    { ref: "Isaiah 61:1", text: "The Spirit of the Sovereign Lord is on me, because the Lord has anointed me to proclaim good news to the poor. He has sent me to bind up the brokenhearted, to proclaim freedom for the captives and release from darkness for the prisoners,", tags: ["good news", "brokenhearted", "freedom"], cat: "ministry", score: 89 }
  ],

  jeremiah: [
    { ref: "Jeremiah 1:5", text: "Before I formed you in the womb I knew you, before you were born I set you apart; I appointed you as a prophet to the nations.", tags: ["formed", "knew", "appointed"], cat: "identity", score: 87 },
    { ref: "Jeremiah 33:3", text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.", tags: ["call", "answer", "unsearchable"], cat: "prayer", score: 85 }
  ],

  ezekiel: [
    { ref: "Ezekiel 36:26", text: "I will give you a new heart and put a new spirit in you; I will remove from you your heart of stone and give you a heart of flesh.", tags: ["new heart", "new spirit", "transformation"], cat: "renewal", score: 88 }
  ],

  daniel: [
    { ref: "Daniel 3:17-18", text: "If we are thrown into the blazing furnace, the God we serve is able to deliver us from it, and he will deliver us from Your Majesty's hand. But even if he does not, we want you to know, Your Majesty, that we will not serve your gods or worship the image of gold you have set up.", tags: ["deliver", "serve", "courage"], cat: "courage", score: 89 }
  ],

  malachi: [
    { ref: "Malachi 3:10", text: "Bring the whole tithe into the storehouse, that there may be food in my house. Test me in this,' says the Lord Almighty, 'and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.", tags: ["tithe", "blessing", "storehouse"], cat: "stewardship", score: 83 }
  ],

  mark: [
    { ref: "Mark 11:24", text: "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.", tags: ["prayer", "believe", "received"], cat: "faith", score: 90 },
    { ref: "Mark 16:15", text: "He said to them, 'Go into all the world and preach the gospel to all creation.'", tags: ["go", "world", "gospel"], cat: "mission", score: 92 }
  ],

  luke: [
    { ref: "Luke 1:37", text: "For no word from God will ever fail.", tags: ["word", "God", "never fail"], cat: "faith", score: 88 },
    { ref: "Luke 6:31", text: "Do to others as you would have them do to you.", tags: ["golden rule", "others"], cat: "relationships", score: 95 },
    { ref: "Luke 12:27", text: "Consider how the wild flowers grow. They do not labor or spin. Yet I tell you, not even Solomon in all his splendor was dressed like one of these.", tags: ["flowers", "labor", "Solomon"], cat: "provision", score: 82 }
  ],

  john: [
    { ref: "John 1:12", text: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.", tags: ["receive", "believed", "children of God"], cat: "salvation", score: 93 },
    { ref: "John 8:32", text: "Then you will know the truth, and the truth will set you free.", tags: ["truth", "free", "know"], cat: "freedom", score: 91 },
    { ref: "John 10:10", text: "The thief comes only to steal and kill and destroy; I have come that they may have life, and have it to the full.", tags: ["life", "full", "abundant"], cat: "purpose", score: 89 },
    { ref: "John 15:13", text: "Greater love has no one than this: to lay down one's life for one's friends.", tags: ["greater love", "lay down", "friends"], cat: "love", score: 94 },
    { ref: "John 16:33", text: "I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.", tags: ["peace", "trouble", "overcome"], cat: "victory", score: 92 }
  ],

  acts: [
    { ref: "Acts 1:8", text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.", tags: ["power", "Holy Spirit", "witnesses"], cat: "mission", score: 90 },
    { ref: "Acts 20:35", text: "In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: 'It is more blessed to give than to receive.'", tags: ["give", "receive", "blessed"], cat: "generosity", score: 87 }
  ]
};

// Convert organized data to flat array
function generateVerseArray() {
  const verses = [];
  
  for (const [book, bookVerses] of Object.entries(comprehensiveVerseData)) {
    for (const verse of bookVerses) {
      const [bookName, chapterVerse] = verse.ref.split(' ');
      const [chapter, verseNum] = chapterVerse.split(':');
      
      verses.push({
        reference: verse.ref,
        book: bookName,
        chapter: parseInt(chapter),
        verse: verseNum,
        text: verse.text,
        translation: "NIV",
        topic_tags: verse.tags,
        category: verse.cat,
        popularity_score: verse.score,
        ai_summary: `${verse.text.split('.')[0]}.`
      });
    }
  }
  
  return verses;
}

async function batchPopulateVerses() {
  console.log("🚀 Starting automated verse population system...");
  
  const newVerses = generateVerseArray();
  console.log(`📊 Generated ${newVerses.length} verses from major Bible books`);
  
  const batchSize = 25;
  let totalInserted = 0;
  
  for (let i = 0; i < newVerses.length; i += batchSize) {
    const batch = newVerses.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    
    try {
      await db.insert(bibleVerses).values(batch).onConflictDoNothing();
      totalInserted += batch.length;
      console.log(`✅ Batch ${batchNum}: Added ${batch.length} verses`);
    } catch (error) {
      console.error(`❌ Batch ${batchNum} failed:`, error.message);
    }
  }
  
  // Final count
  const currentVerses = await db.select().from(bibleVerses);
  const total = currentVerses.length;
  
  console.log(`\n📈 PROGRESS UPDATE:`);
  console.log(`Total verses in database: ${total}`);
  console.log(`Added in this run: ${totalInserted}`);
  console.log(`Progress to 1000: ${(total/1000*100).toFixed(1)}%`);
  console.log(`Remaining: ${1000 - total} verses`);
  
  if (total >= 1000) {
    console.log("🎉 MILESTONE ACHIEVED: 1000+ Bible verses!");
  } else {
    const estimatedRuns = Math.ceil((1000 - total) / 40);
    console.log(`\n⏱️ TIMELINE ESTIMATE:`);
    console.log(`- ${estimatedRuns} more runs needed at current pace`);
    console.log(`- ETA: ${estimatedRuns * 2} minutes to complete 1000 verses`);
    console.log(`- Next focus: Romans, 1 Corinthians, Ephesians, Revelation`);
  }
  
  await pool.end();
  return total;
}

batchPopulateVerses().catch(console.error);