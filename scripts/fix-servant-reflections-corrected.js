#!/usr/bin/env node

// Script to fix generic reflection questions in Servant tier reading plans
// Focus on making each question scripture-specific, meaningful, and actionable (300+ characters)

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Enhanced reflection questions for Stewardship & Generosity Journey
const stewardshipUpdates = [
  {
    day: 2,
    question: "David acknowledges that everything comes from God and we simply give back what belongs to Him. In what areas of your life do you struggle to remember God's ownership? How might recognizing that your time, talents, and treasures are gifts from God change how you approach decisions about career, relationships, and daily spending? What specific step could you take this week to honor God's ownership in your financial choices?"
  },
  {
    day: 3, 
    question: "God challenges His people to test Him through tithing, promising blessing and protection. What fears or doubts keep you from fully trusting God with your finances? Consider your current giving patterns - are they driven by obligation, guilt, or genuine gratitude and trust? How might stepping out in faithful giving, even when it feels risky, deepen your relationship with God and increase your trust in His provision?"
  },
  {
    day: 4,
    question: "Paul teaches that God loves a cheerful giver, emphasizing the heart attitude behind our giving. Reflect on your last few acts of generosity - were they done grudgingly or joyfully? What would it look like to cultivate a genuinely cheerful heart toward giving? How might shifting from seeing giving as a loss to seeing it as a privilege and partnership with God transform both your attitude and your impact on others?"
  },
  {
    day: 5,
    question: "Jesus promises that our generosity creates a cycle of blessing that extends far beyond the immediate recipient. Think about a time when someone's generosity toward you created ripple effects of good in your life. How are you currently positioned to be a conduit of God's blessing to others? What opportunities for giving (time, resources, encouragement) might God be placing before you that could multiply His kingdom impact?"
  }
];

async function updateReflectionQuestions() {
  const client = await pool.connect();
  
  try {
    console.log("Starting to fix generic reflection questions in Servant tier plans...");
    
    // Update Stewardship & Generosity Journey
    console.log("\nUpdating Stewardship & Generosity Journey plan...");
    
    for (const update of stewardshipUpdates) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'Stewardship & Generosity Journey')
        AND day_number = $2
      `, [update.question, update.day]);
      
      console.log(`   ✅ Updated Day ${update.day}`);
    }
    
    console.log("\nSuccessfully updated reflection questions for Stewardship & Generosity Journey!");
    
  } catch (error) {
    console.error("Error updating reflection questions:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the updates
updateReflectionQuestions()
  .then(() => {
    console.log("\nServant tier reflection questions enhancement complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to update reflection questions:", error);
    process.exit(1);
  });