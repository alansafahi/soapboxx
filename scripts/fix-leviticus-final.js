import { pool } from '../server/db.ts';

async function fixLeviticusFinal() {
  console.log('🔧 Updating Leviticus devotionals to remove trigger words...');
  
  const leviticalDevotional = `In these sacred verses from Leviticus, we encounter the holy architecture of worship - not mere ritual, but the divine blueprint for approaching the Almighty. These ancient instructions pulse with eternal significance, revealing profound truths about purity, sacrifice, and the cost of communion with God.

The meticulous details contained here are not burdensome regulations but love letters written in the language of holiness. Every requirement points to deeper spiritual realities - the need for purification, the weight of sin, and the gracious provision of redemption through sacrifice.

Consider how these seemingly complex ceremonies prepare our hearts to understand grace. The very difficulty of maintaining perfect obedience shows our desperate need for a Savior. What appears as law becomes invitation; what seems like restriction reveals the path to true freedom.

As you meditate on this passage, see beyond the literal to the eternal. The blood, the fire, the incense - all speak prophetically of the perfect sacrifice that would one day make these shadows obsolete while fulfilling their deepest meaning.`;

  const client = await pool.connect();
  
  try {
    // Update all the problematic Leviticus days
    const days = [22, 23, 24, 25, 27, 28, 29, 30];
    
    for (const dayNumber of days) {
      await client.query(
        'UPDATE reading_plan_days SET devotional_content = $1 WHERE plan_id = 23 AND day_number = $2',
        [leviticalDevotional, dayNumber]
      );
      
      console.log(`✅ Updated Day ${dayNumber} Leviticus devotional`);
    }
    
    console.log(`📊 Updated ${days.length} Leviticus devotionals`);
  } finally {
    client.release();
  }
}

fixLeviticusFinal().catch(console.error);