import { generateContentForSpecificPlan, bulkGenerateContentForEmptyPlans } from './utils/contentGeneration.js';

console.log('🚀 Testing content generation...');

// Start by generating content for plan ID 49 ("A Plan for New Believers")
generateContentForSpecificPlan(49)
  .then(result => {
    console.log(`✅ Successfully generated ${result.length} days for "A Plan for New Believers"`);
    console.log('🎉 Content generation is working! Starting bulk generation...');
    
    // Now start bulk generation for all empty plans
    return bulkGenerateContentForEmptyPlans();
  })
  .then(() => {
    console.log('🎊 All empty plans have been populated with content!');
  })
  .catch(error => {
    console.error('❌ Content generation failed:', error.message);
  });