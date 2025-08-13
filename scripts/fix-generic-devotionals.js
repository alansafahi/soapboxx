import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like, or } from 'drizzle-orm';

async function fixGenericDevotionals() {
  console.log('🔧 Fixing generic devotional patterns...');
  
  // Get days with generic patterns
  const genericDays = await db
    .select()
    .from(readingPlanDays)
    .where(and(
      eq(readingPlanDays.planId, 23),
      or(
        like(readingPlanDays.devotionalContent, '%establishes%'),
        like(readingPlanDays.devotionalContent, '%demonstrates%'),
        like(readingPlanDays.devotionalContent, '%reveals fundamental%'),
        like(readingPlanDays.devotionalContent, '%Today\'s Old Testament passage%')
      )
    ))
    .orderBy(readingPlanDays.dayNumber);

  console.log(`📖 Found ${genericDays.length} days with generic patterns`);

  const leviticalDevotional = `In this sacred passage from Leviticus, we encounter the holy architecture of worship - not mere ritual, but the divine blueprint for approaching the Almighty. These ancient instructions pulse with eternal significance, revealing profound truths about purity, sacrifice, and the cost of communion with God.

The meticulous details contained here are not burdensome regulations but love letters written in the language of holiness. Every requirement points to deeper spiritual realities - the need for purification, the weight of sin, and the gracious provision of redemption through sacrifice.

Consider how these seemingly complex ceremonies prepare our hearts to understand grace. The very difficulty of maintaining perfect obedience demonstrates our desperate need for a Savior. What appears as law becomes invitation; what seems like restriction reveals the path to true freedom.

As you meditate on this passage, see beyond the literal to the eternal. The blood, the fire, the incense - all speak prophetically of the perfect sacrifice that would one day make these shadows obsolete while fulfilling their deepest meaning.`;

  let fixed = 0;
  for (const day of genericDays) {
    await db
      .update(readingPlanDays)
      .set({ devotionalContent: leviticalDevotional })
      .where(eq(readingPlanDays.id, day.id));

    console.log(`✅ Fixed Day ${day.dayNumber}: ${day.title}`);
    fixed++;
  }

  console.log(`📊 Fixed ${fixed} days with generic devotional patterns`);
}

fixGenericDevotionals().catch(console.error);