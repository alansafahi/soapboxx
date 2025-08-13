import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, or, like } from 'drizzle-orm';

async function findGenericDevotionals() {
  try {
    console.log('🔍 Finding days with generic devotional content...');
    
    // Find days with shorter, generic devotional content patterns
    const genericDays = await db
      .select({
        id: readingPlanDays.id,
        dayNumber: readingPlanDays.dayNumber,
        title: readingPlanDays.title,
        contentLength: readingPlanDays.devotionalContent
      })
      .from(readingPlanDays)
      .where(
        and(
          eq(readingPlanDays.planId, 23),
          or(
            like(readingPlanDays.devotionalContent, '%establishes%'),
            like(readingPlanDays.devotionalContent, '%demonstrates%'),
            like(readingPlanDays.devotionalContent, '%reveals%'),
            like(readingPlanDays.devotionalContent, '%highlights%'),
            like(readingPlanDays.devotionalContent, '%showcases%'),
            like(readingPlanDays.devotionalContent, '%displays%')
          )
        )
      )
      .orderBy(readingPlanDays.dayNumber);
    
    console.log(`📖 Found ${genericDays.length} days with generic devotional patterns`);
    
    // Group by content length to prioritize shorter content
    const shortContent = genericDays.filter(day => day.contentLength && day.contentLength.length < 800);
    const mediumContent = genericDays.filter(day => day.contentLength && day.contentLength.length >= 800 && day.contentLength.length < 1500);
    
    console.log(`📏 Content analysis:`);
    console.log(`   📝 Short content (< 800 chars): ${shortContent.length} days`);
    console.log(`   📄 Medium content (800-1500 chars): ${mediumContent.length} days`);
    
    console.log(`\n📋 Next 20 days to enhance (shortest first):`);
    const toEnhance = [...shortContent, ...mediumContent].slice(0, 20);
    
    toEnhance.forEach((day, index) => {
      const contentPreview = day.contentLength ? day.contentLength.substring(0, 60) + '...' : 'No content';
      console.log(`   ${index + 1}. Day ${day.dayNumber}: ${day.title} (${day.contentLength?.length || 0} chars)`);
      console.log(`      Preview: ${contentPreview}`);
    });
    
  } catch (error) {
    console.error('💥 Search failed:', error);
  }
}

// Run the search
findGenericDevotionals().then(() => {
  console.log('\n🏁 Generic devotional search completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});