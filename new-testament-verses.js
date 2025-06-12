// New Testament focused verse population for comprehensive coverage
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { bibleVerses } from './shared/schema.js';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema: { bibleVerses } });

const newTestamentVerses = [
  // ROMANS - Foundational Christian doctrine
  { ref: "Romans 1:16", text: "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile.", tags: ["gospel", "power", "salvation"], cat: "salvation", score: 94 },
  { ref: "Romans 3:23", text: "for all have sinned and fall short of the glory of God,", tags: ["sin", "glory", "all"], cat: "salvation", score: 96 },
  { ref: "Romans 5:8", text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", tags: ["love", "sinners", "died"], cat: "love", score: 95 },
  { ref: "Romans 6:23", text: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.", tags: ["wages", "sin", "eternal life"], cat: "salvation", score: 97 },
  { ref: "Romans 8:1", text: "Therefore, there is now no condemnation for those who are in Christ Jesus,", tags: ["condemnation", "Christ Jesus"], cat: "freedom", score: 92 },
  { ref: "Romans 8:31", text: "What, then, shall we say in response to these things? If God is for us, who can be against us?", tags: ["God for us", "against us"], cat: "confidence", score: 89 },
  { ref: "Romans 8:37", text: "No, in all these things we are more than conquerors through him who loved us.", tags: ["conquerors", "loved us"], cat: "victory", score: 88 },
  { ref: "Romans 8:38-39", text: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.", tags: ["separate", "love of God"], cat: "security", score: 93 },
  { ref: "Romans 10:9", text: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.", tags: ["declare", "believe", "saved"], cat: "salvation", score: 95 },
  { ref: "Romans 12:1", text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God—this is your true and proper worship.", tags: ["living sacrifice", "worship"], cat: "worship", score: 87 },
  { ref: "Romans 12:12", text: "Be joyful in hope, patient in affliction, faithful in prayer.", tags: ["joyful", "patient", "faithful"], cat: "character", score: 89 },
  { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.", tags: ["hope", "joy", "peace"], cat: "hope", score: 90 },

  // 1 CORINTHIANS - Christian living and love
  { ref: "1 Corinthians 1:18", text: "For the message of the cross is foolishness to those who are perishing, but to us who are being saved it is the power of God.", tags: ["cross", "power of God"], cat: "salvation", score: 86 },
  { ref: "1 Corinthians 2:9", text: "However, as it is written: 'What no eye has seen, what no ear has heard, and what no human mind has conceived'— the things God has prepared for those who love him—", tags: ["prepared", "love him"], cat: "promise", score: 87 },
  { ref: "1 Corinthians 6:19-20", text: "Do you not know that your bodies are temples of the Holy Spirit, who is in you, whom you have received from God? You are not your own; you were bought at a price. Therefore honor God with your bodies.", tags: ["temple", "bought", "honor"], cat: "identity", score: 88 },
  { ref: "1 Corinthians 10:31", text: "So whether you eat or drink or whatever you do, do it all for the glory of God.", tags: ["glory of God", "whatever"], cat: "purpose", score: 89 },
  { ref: "1 Corinthians 13:1", text: "If I speak in the tongues of men or of angels, but do not have love, I am only a resounding gong or a clanging cymbal.", tags: ["love", "tongues"], cat: "love", score: 85 },
  { ref: "1 Corinthians 13:7", text: "It always protects, always trusts, always hopes, always perseveres.", tags: ["protects", "trusts", "hopes"], cat: "love", score: 87 },
  { ref: "1 Corinthians 15:57", text: "But thanks be to God! He gives us the victory through our Lord Jesus Christ.", tags: ["victory", "thanks"], cat: "victory", score: 86 },
  { ref: "1 Corinthians 16:14", text: "Do everything in love.", tags: ["everything", "love"], cat: "love", score: 88 },

  // 2 CORINTHIANS - Comfort and strength
  { ref: "2 Corinthians 1:3-4", text: "Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God.", tags: ["comfort", "troubles"], cat: "comfort", score: 89 },
  { ref: "2 Corinthians 4:16", text: "Therefore we do not lose heart. Though outwardly we are wasting away, yet inwardly we are being renewed day by day.", tags: ["lose heart", "renewed"], cat: "renewal", score: 85 },
  { ref: "2 Corinthians 4:17", text: "For our light and momentary troubles are achieving for us an eternal glory that far outweighs them all.", tags: ["troubles", "eternal glory"], cat: "perspective", score: 86 },
  { ref: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", tags: ["new creation", "old gone"], cat: "transformation", score: 93 },
  { ref: "2 Corinthians 9:7", text: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.", tags: ["give", "cheerful giver"], cat: "generosity", score: 87 },
  { ref: "2 Corinthians 12:9", text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.", tags: ["grace sufficient", "weakness"], cat: "grace", score: 91 },

  // GALATIANS - Freedom in Christ
  { ref: "Galatians 2:20", text: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.", tags: ["crucified", "Christ lives"], cat: "identity", score: 90 },
  { ref: "Galatians 5:1", text: "It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery.", tags: ["freedom", "stand firm"], cat: "freedom", score: 88 },
  { ref: "Galatians 5:16", text: "So I say, walk by the Spirit, and you will not gratify the desires of the flesh.", tags: ["walk Spirit", "flesh"], cat: "spiritual walk", score: 85 },
  { ref: "Galatians 5:25", text: "Since we live by the Spirit, let us keep in step with the Spirit.", tags: ["live Spirit", "keep step"], cat: "spiritual walk", score: 83 },
  { ref: "Galatians 6:2", text: "Carry each other's burdens, and in this way you will fulfill the law of Christ.", tags: ["carry burdens", "law of Christ"], cat: "community", score: 86 },
  { ref: "Galatians 6:9", text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", tags: ["weary", "doing good", "harvest"], cat: "perseverance", score: 89 },

  // EPHESIANS - Spiritual blessings and unity
  { ref: "Ephesians 1:3", text: "Praise be to the God and Father of our Lord Jesus Christ, who has blessed us in the heavenly realms with every spiritual blessing in Christ.", tags: ["blessed", "spiritual blessing"], cat: "blessing", score: 87 },
  { ref: "Ephesians 2:4-5", text: "But because of his great love for us, God, who is rich in mercy, made us alive with Christ even when we were dead in transgressions—it is by grace you have been saved.", tags: ["great love", "grace"], cat: "salvation", score: 91 },
  { ref: "Ephesians 3:20", text: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us,", tags: ["immeasurably more", "power"], cat: "possibility", score: 92 },
  { ref: "Ephesians 4:29", text: "Do not let any unwholesome talk come out of your mouths, but only what is helpful for building others up according to their needs, that it may benefit those who listen.", tags: ["unwholesome talk", "building up"], cat: "communication", score: 84 },
  { ref: "Ephesians 4:32", text: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", tags: ["kind", "compassionate", "forgiving"], cat: "forgiveness", score: 88 },
  { ref: "Ephesians 5:8", text: "For you were once darkness, but now you are light in the Lord. Live as children of light", tags: ["darkness", "light"], cat: "transformation", score: 85 },
  { ref: "Ephesians 6:10", text: "Finally, be strong in the Lord and in his mighty power.", tags: ["strong", "mighty power"], cat: "strength", score: 86 },
  { ref: "Ephesians 6:12", text: "For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms.", tags: ["struggle", "spiritual forces"], cat: "spiritual warfare", score: 88 },

  // PHILIPPIANS - Joy and contentment
  { ref: "Philippians 1:6", text: "being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.", tags: ["good work", "completion"], cat: "confidence", score: 89 },
  { ref: "Philippians 2:3", text: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves.", tags: ["selfish ambition", "humility"], cat: "humility", score: 85 },
  { ref: "Philippians 3:13-14", text: "Brothers and sisters, I do not consider myself yet to have taken hold of it. But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.", tags: ["forgetting", "straining", "press on"], cat: "perseverance", score: 87 },
  { ref: "Philippians 4:4", text: "Rejoice in the Lord always. I will say it again: Rejoice!", tags: ["rejoice", "always"], cat: "joy", score: 91 },
  { ref: "Philippians 4:8", text: "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.", tags: ["true", "noble", "pure"], cat: "thinking", score: 90 },
  { ref: "Philippians 4:11", text: "I am not saying this because I am in need, for I have learned to be content whatever the circumstances.", tags: ["content", "circumstances"], cat: "contentment", score: 88 },

  // COLOSSIANS - Christ's supremacy
  { ref: "Colossians 1:15", text: "The Son is the image of the invisible God, the firstborn over all creation.", tags: ["image", "invisible God"], cat: "christology", score: 86 },
  { ref: "Colossians 1:27", text: "To them God has chosen to make known among the Gentiles the glorious riches of this mystery, which is Christ in you, the hope of glory.", tags: ["Christ in you", "hope"], cat: "identity", score: 88 },
  { ref: "Colossians 3:2", text: "Set your minds on things above, not on earthly things.", tags: ["minds above", "earthly"], cat: "perspective", score: 87 },
  { ref: "Colossians 3:12", text: "Therefore, as God's chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.", tags: ["chosen", "compassion", "kindness"], cat: "character", score: 89 },
  { ref: "Colossians 3:23", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters,", tags: ["work", "heart", "Lord"], cat: "work", score: 88 },

  // 1 THESSALONIANS - Christian hope and conduct
  { ref: "1 Thessalonians 4:11-12", text: "and to make it your ambition to lead a quiet life: You should mind your own business and work with your hands, just as we told you, so that your daily life may win the respect of outsiders and so that you will not be dependent on anybody.", tags: ["quiet life", "work hands"], cat: "lifestyle", score: 82 },
  { ref: "1 Thessalonians 5:11", text: "Therefore encourage one another and build each other up, just as in fact you are doing.", tags: ["encourage", "build up"], cat: "encouragement", score: 87 },
  { ref: "1 Thessalonians 5:16-18", text: "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.", tags: ["rejoice", "pray", "thanks"], cat: "lifestyle", score: 92 },

  // 2 THESSALONIANS
  { ref: "2 Thessalonians 3:3", text: "But the Lord is faithful, and he will strengthen you and protect you from the evil one.", tags: ["faithful", "strengthen", "protect"], cat: "protection", score: 86 }
];

function convertToVersesArray(verses) {
  return verses.map(v => {
    const parts = v.ref.split(' ');
    const bookName = parts.slice(0, -1).join(' '); // Handle books like "1 Corinthians"
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
}

async function populateNewTestament() {
  console.log("📖 Starting New Testament verse population...");
  
  const verses = convertToVersesArray(newTestamentVerses);
  console.log(`Prepared ${verses.length} New Testament verses`);
  
  const batchSize = 30;
  let inserted = 0;
  
  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    try {
      await db.insert(bibleVerses).values(batch).onConflictDoNothing();
      inserted += batch.length;
      console.log(`Added batch ${Math.floor(i/batchSize) + 1}: ${batch.length} verses`);
    } catch (error) {
      console.error(`Batch failed:`, error.message);
    }
  }
  
  const total = (await db.select().from(bibleVerses)).length;
  console.log(`\nNew Testament addition complete:`);
  console.log(`Added: ${inserted} verses`);
  console.log(`Total database: ${total} verses`);
  console.log(`Progress: ${(total/1000*100).toFixed(1)}%`);
  console.log(`Remaining: ${1000 - total} verses`);
  
  await pool.end();
}

populateNewTestament().catch(console.error);