import { db } from './server/db.ts';
import { bibleVerses } from './shared/schema.ts';
import { eq } from 'drizzle-orm';

async function fixMatthew53() {
  const versionData = {
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
  };

  console.log('Updating Matthew 5:3 with version data...');
  
  const result = await db.update(bibleVerses)
    .set({
      versionData: JSON.stringify(versionData),
      updatedAt: new Date()
    })
    .where(eq(bibleVerses.id, 108));
    
  console.log('Update completed');
  
  // Verify the update
  const updated = await db.select().from(bibleVerses).where(eq(bibleVerses.id, 108));
  if (updated.length > 0 && updated[0].versionData) {
    const parsed = JSON.parse(updated[0].versionData);
    console.log('Available versions:', Object.keys(parsed));
    console.log('KJV:', parsed.KJV);
    console.log('MSG:', parsed.MSG);
    console.log('AMP:', parsed.AMP);
  }
}

fixMatthew53().catch(console.error);