import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and } from 'drizzle-orm';

async function fixInvalidRuthReferences() {
  console.log('🔧 Fixing invalid Ruth chapter references...');
  
  // Ruth only has 4 chapters, so Ruth 5 and Ruth 6 are invalid
  // Let's update these to valid references and proper content
  
  const invalidDays = await db
    .select()
    .from(readingPlanDays)
    .where(and(
      eq(readingPlanDays.planId, 23),
      eq(readingPlanDays.dayNumber, 75) // Ruth 5
    ));

  if (invalidDays.length > 0) {
    await db
      .update(readingPlanDays)
      .set({ 
        scriptureReference: '1 Samuel 1:1-28',
        scriptureText: 'There was a certain man from Ramathaim, a Zuphite from the hill country of Ephraim, whose name was Elkanah son of Jeroham, the son of Elihu, the son of Tohu, the son of Zuph, an Ephraimite. He had two wives; one was called Hannah and the other Peninnah. Peninnah had children, but Hannah had none. Year after year this man went up from his town to worship and sacrifice to the LORD Almighty at Shiloh, where Hophni and Phinehas, the two sons of Eli, were priests of the LORD. Whenever the day came for Elkanah to sacrifice, he would give portions of the meat to his wife Peninnah and to all her sons and daughters. But to Hannah he gave a double portion because he loved her, and the LORD had closed her womb.',
        title: 'Day 75: 1 Samuel 1'
      })
      .where(eq(readingPlanDays.id, invalidDays[0].id));
    
    console.log('✅ Fixed Day 75: Changed Ruth 5 to 1 Samuel 1');
  }

  const invalidDays2 = await db
    .select()
    .from(readingPlanDays)
    .where(and(
      eq(readingPlanDays.planId, 23),
      eq(readingPlanDays.dayNumber, 76) // Ruth 6
    ));

  if (invalidDays2.length > 0) {
    await db
      .update(readingPlanDays)
      .set({ 
        scriptureReference: '1 Samuel 2:1-36',
        scriptureText: 'Then Hannah prayed and said: "My heart rejoices in the LORD; in the LORD my horn is lifted high. My mouth boasts over my enemies, for I delight in your deliverance. There is no one holy like the LORD; there is no one besides you; there is no Rock like our God. Do not keep talking so proudly or let your mouth speak such arrogance, for the LORD is a God who knows, and by him deeds are weighed. The bows of the warriors are broken, but those who stumbled are armed with strength. Those who were full hire themselves out for food, but those who were hungry are hungry no more. She who was barren has borne seven children, but she who has had many sons pines away."',
        title: 'Day 76: 1 Samuel 2'
      })
      .where(eq(readingPlanDays.id, invalidDays2[0].id));
    
    console.log('✅ Fixed Day 76: Changed Ruth 6 to 1 Samuel 2');
  }

  console.log('📊 Fixed invalid Ruth chapter references');
}

fixInvalidRuthReferences().catch(console.error);