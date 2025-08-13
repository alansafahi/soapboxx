import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, isNull } from 'drizzle-orm';

async function fixMissingDevotionals() {
  console.log('🔧 Fixing days with missing devotional content...');
  
  // Get days with missing devotional content
  const missingDays = await db
    .select()
    .from(readingPlanDays)
    .where(and(
      eq(readingPlanDays.planId, 23),
      isNull(readingPlanDays.devotionalContent)
    ))
    .orderBy(readingPlanDays.dayNumber);

  console.log(`📖 Found ${missingDays.length} days with missing devotional content`);

  const devotionalTemplates = {
    genesis: (chapter) => `In this foundational passage from Genesis ${chapter}, we witness the profound unfolding of God's eternal plan. Like seeds scattered on fertile ground, these ancient words take root in our modern hearts, revealing timeless truths about divine purpose and human calling.

The narrative before us is not merely historical record but living testimony - each verse a brushstroke in the grand masterpiece of redemption. As we read these words, we stand on holy ground where heaven touches earth, where the infinite speaks to the finite.

Consider how this passage reflects the paradox of divine sovereignty and human responsibility. God moves with purposeful intention, yet invites our participation in His cosmic story. We see patterns of grace emerging from chaos, hope arising from despair, beauty blooming from brokenness.

These ancient texts speak prophetically into our contemporary struggles. What seemed impossible to the original hearers becomes the very foundation of our faith today. In their weakness, we find strength; in their questions, we discover answers; in their journey, we trace our own path toward spiritual maturity.`,

    exodus: (chapter) => `The book of Exodus reveals the heart of God as Deliverer, and this passage from chapter ${chapter} pulses with divine passion for freedom. Like the burning bush that blazed but was not consumed, these words ignite our spirits without destroying our humanity.

Here we encounter the God who hears the cries of the oppressed and moves heaven and earth to secure their liberation. The imagery is rich with metaphor - each plague a proclamation, each miracle a love letter written in the language of divine power.

Notice how this narrative speaks to every generation trapped in their own Egypt. Our bondage may look different, but the Deliverer remains the same. What Pharaoh represents in this passage - stubbornness, pride, resistance to God's will - we recognize in our own hearts.

The journey toward freedom is never easy or straightforward. It requires faith to step into the unknown, courage to leave behind the familiar chains, and trust that the One who calls us out will also lead us home. In this ancient story, we find the blueprint for every spiritual exodus.`,

    leviticus: (chapter) => `In Leviticus ${chapter}, we encounter the sacred architecture of worship - not mere ritual, but the blueprint for approaching the Divine. These seemingly ancient customs reveal profound spiritual principles that transcend time and culture.

The meticulous details of sacrifice and ceremony point to deeper truths about holiness, purification, and the cost of communion with God. Every instruction carries weight, every requirement reveals something about the nature of divine relationship.

We must read these passages with eyes that see beyond the literal to the eternal. What appears as law becomes invitation; what seems like restriction reveals the path to freedom. The blood, the fire, the incense - all speak of realities that would one day be fulfilled in perfect sacrifice.

Consider how these ancient patterns prepare our hearts for grace. The very complexity of the system demonstrates human inability to achieve righteousness through works, pointing us forward to the simplicity of faith. In trying to keep the law, they discovered their need for a Savior.`,

    numbers: (chapter) => `The wilderness wanderings recorded in Numbers ${chapter} mirror our own spiritual journey through life's barren places. Here, between promise and fulfillment, between calling and arrival, we learn the most essential lessons of faith.

The desert is both punishment and preparation, both consequence and consecration. In this harsh landscape, God's people discover that divine provision doesn't always look like human expectation. Manna falls daily, water flows from rocks, and clothing doesn't wear out - grace appears in unexpected forms.

This passage reveals the tension between divine faithfulness and human faithlessness. God's promises remain sure while human hearts waver. The same people who witnessed incredible miracles struggle with basic trust. Their story is our story, their struggles our own.

Notice how the wilderness becomes a classroom where faith is tested and refined. Every complaint reveals a spiritual lesson, every rebellion an opportunity for mercy. The goal is not just reaching the promised land but becoming the kind of people worthy to inherit it.`,

    deuteronomy: (chapter) => `As Moses prepares to pass from the scene, his words in Deuteronomy ${chapter} carry the weight of a lifetime spent walking with God. These are not mere rules but the heart-cry of a leader who has seen both the glory and the cost of following the Almighty.

This farewell address pulses with urgency - remember, choose, obey, love. The repetition is not redundancy but emphasis, like a parent's final words to a child leaving home. Every instruction is wrapped in covenant love, every warning motivated by divine affection.

The passage before us bridges past and future, connecting ancient promises with contemporary challenges. What God did for previous generations, He will do again. What He required of them, He requires of us. The principles are eternal, even if the applications change.

Consider the profound responsibility placed on this new generation. They inherit both blessing and obligation, both promise and peril. Their choices will determine not only their own destiny but that of their children. This is the weight and wonder of covenant relationship.`
  };

  let fixed = 0;
  for (const day of missingDays) {
    const book = day.title.toLowerCase();
    const chapter = day.title.match(/(\d+)/)?.[1] || '1';
    
    let devotionalContent = '';
    
    if (book.includes('genesis')) {
      devotionalContent = devotionalTemplates.genesis(chapter);
    } else if (book.includes('exodus')) {
      devotionalContent = devotionalTemplates.exodus(chapter);
    } else if (book.includes('leviticus')) {
      devotionalContent = devotionalTemplates.leviticus(chapter);
    } else if (book.includes('numbers')) {
      devotionalContent = devotionalTemplates.numbers(chapter);
    } else if (book.includes('deuteronomy')) {
      devotionalContent = devotionalTemplates.deuteronomy(chapter);
    } else {
      // Generic template for other books
      devotionalContent = `This passage from ${day.title.replace(/Day \d+: /, '')} reveals the intricate tapestry of God's redemptive plan woven through human history. Each verse carries divine DNA, each story reflects eternal principles that transcend time and culture.

As we meditate on these ancient words, we discover that they are not merely historical records but living testimonies that speak directly into our contemporary experience. The characters we encounter become mirrors reflecting our own spiritual journey.

Notice the recurring themes of faith and doubt, obedience and rebellion, mercy and judgment. These patterns repeat throughout Scripture because they repeat throughout human experience. In their struggles, we recognize our own; in their victories, we find hope for our future.

The beauty of this passage lies not just in what it reveals about the past but in what it promises for the future. God's character remains constant, His love unwavering, His purposes unstoppable. What He began in these ancient days, He continues to accomplish in our lives today.`;
    }

    await db
      .update(readingPlanDays)
      .set({ devotionalContent })
      .where(eq(readingPlanDays.id, day.id));

    console.log(`✅ Fixed Day ${day.dayNumber}: ${day.title}`);
    fixed++;
  }

  console.log(`\n📊 Results: Fixed ${fixed} days with missing devotional content`);
}

fixMissingDevotionals().catch(console.error);