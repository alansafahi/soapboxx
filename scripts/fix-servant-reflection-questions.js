#!/usr/bin/env node

// Script to fix generic reflection questions in Servant tier reading plans
// Focus on making each question scripture-specific, meaningful, and actionable (300+ characters)

import fs from 'fs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Enhanced reflection questions for Stewardship & Generosity Journey
const stewardshipReflections = {
  2: "David acknowledges that everything comes from God and we simply give back what belongs to Him. In what areas of your life do you struggle to remember God's ownership? How might recognizing that your time, talents, and treasures are gifts from God change how you approach decisions about career, relationships, and daily spending? What specific step could you take this week to honor God's ownership in your financial choices?",
  3: "God challenges His people to test Him through tithing, promising blessing and protection. What fears or doubts keep you from fully trusting God with your finances? Consider your current giving patterns - are they driven by obligation, guilt, or genuine gratitude and trust? How might stepping out in faithful giving, even when it feels risky, deepen your relationship with God and increase your trust in His provision?",
  4: "Paul teaches that God loves a cheerful giver, emphasizing the heart attitude behind our giving. Reflect on your last few acts of generosity - were they done grudgingly or joyfully? What would it look like to cultivate a genuinely cheerful heart toward giving? How might shifting from seeing giving as a loss to seeing it as a privilege and partnership with God transform both your attitude and your impact on others?",
  5: "Jesus promises that our generosity creates a cycle of blessing that extends far beyond the immediate recipient. Think about a time when someone's generosity toward you created ripple effects of good in your life. How are you currently positioned to be a conduit of God's blessing to others? What opportunities for giving (time, resources, encouragement) might God be placing before you that could multiply His kingdom impact?",
  6: "Jesus contrasts earthly treasures that decay with heavenly treasures that last forever. What earthly possessions or achievements are you most tempted to cling to as sources of security or identity? How might viewing your resources as tools for building God's kingdom rather than monuments to your success change your priorities? What would it look like to invest more intentionally in relationships and spiritual growth this week?",
  7: "Jesus teaches that faithfulness in small matters reveals our readiness for greater responsibilities. In what small areas of stewardship (time management, care for possessions, integrity in details) is God currently testing your faithfulness? How might your handling of everyday resources be preparing you for greater kingdom opportunities? What specific area of 'little things' could you surrender more fully to God's purposes?",
  8: "Paul instructs the wealthy to be rich in good deeds and generous in sharing, storing up treasure for the coming age. How does your current standard of living reflect your understanding of true wealth? What specific ways could you use your resources to impact eternity rather than just enhance your comfort? Consider someone in your community who needs encouragement or practical help - how might God be calling you to be rich toward them this week?",
  9: "Jesus' parable reveals that God expects us to multiply what He's entrusted to us according to our abilities. What unique gifts, resources, or opportunities has God placed in your hands that you might be burying out of fear or neglect? How could you take a calculated risk to use your talents more boldly for God's kingdom? What would faithful stewardship look like if you truly believed God would hold you accountable for how you invested His gifts?",
  10: "Paul quotes Jesus saying it is more blessed to give than receive, revealing God's upside-down kingdom values. Think about recent experiences of both giving and receiving - which brought deeper joy and satisfaction? How might embracing the truth that giving is actually receiving reshape your approach to relationships, work, and community involvement? What act of giving could you pursue this week simply for the joy of blessing someone else?"
};

// Enhanced reflection questions for The Armor of God Study
const armorReflections = {
  1: "Paul reminds us that our struggles are not against people but against spiritual forces of evil. Think about current conflicts or challenges you're facing - which ones might actually have spiritual warfare components disguised as relational tension, mental battles, or recurring temptations? How would recognizing the spiritual dimension change your strategy for dealing with these issues? What would it look like to pray specifically against spiritual opposition rather than just trying harder in your own strength?",
  2: "The belt of truth is the foundation piece that holds all other armor together. Where in your life are you most vulnerable to believing lies about God, yourself, or your circumstances? What truths from Scripture do you need to 'belt on' more securely through regular meditation and declaration? How might establishing daily truth-telling practices (journaling, Scripture memory, honest accountability) strengthen your spiritual foundation?",
  3: "The breastplate of righteousness protects our vital organs - heart, lungs, and spirit. In what areas are you most susceptible to guilt, shame, or condemnation attacks? How does remembering Christ's righteousness as your covering change your ability to stand confidently in spiritual battle? What lies about your worth or identity need to be replaced with the truth of who you are in Christ?",
  4: "Having your feet fitted with readiness to share the Gospel provides sure footing and mobility in spiritual battle. How prepared are you to share the hope you have in Christ when opportunities arise? What fears or insecurities hold you back from being a more active witness? How might growing in your readiness to share good news also strengthen your own spiritual stability and sense of purpose?",
  5: "The shield of faith extinguishes Satan's flaming arrows of doubt, fear, and accusation. What 'flaming arrows' are you currently facing - persistent doubts, overwhelming fears, or accusations about your faith? How has your faith in God's character and promises served as protection in past battles? What specific promises from God's Word do you need to raise as a shield against current attacks on your peace and confidence?",
  6: "The helmet of salvation protects our minds and thoughts from spiritual assault. What recurring negative thoughts or mental strongholds do you battle most frequently? How does remembering your secure salvation and identity in Christ serve as protection for your thought life? What would it look like to more actively guard your mind through worship, Scripture meditation, and conscious rejection of thoughts that don't align with God's truth about you?",
  7: "The sword of the Spirit is the Word of God - our only offensive weapon in spiritual warfare. How familiar are you with Scripture as a weapon against temptation and lies? Think about Jesus' example of using specific verses to counter Satan's temptations - what biblical truths do you need to have readily available for your most common spiritual battles? How might memorizing and meditating on relevant passages prepare you for future attacks?"
};

// Enhanced reflection questions for Faith Under Pressure
const faithPressureReflections = {
  1: "James presents trials as opportunities for joy and spiritual growth rather than obstacles to avoid. What current pressure in your life could God be using to develop perseverance and spiritual maturity? How might shifting your perspective from 'Why is this happening to me?' to 'What is God teaching me through this?' change how you approach your challenges? What evidence have you seen in the past that God can bring good from difficult circumstances?",
  2: "Job's initial response to devastating loss was worship rather than bitterness or blame. When facing overwhelming circumstances, what is your natural first response? How might practicing worship and gratitude in the midst of trials actually strengthen your faith rather than just being a religious duty? What aspects of God's character remain unchanged regardless of your current circumstances that you could choose to praise Him for?",
  3: "The Hebrew young men faced the choice between cultural conformity and faithful obedience, even unto death. What cultural pressures in your workplace, social circles, or community challenge your commitment to living faithfully? Where do you feel most tempted to compromise your values for acceptance or advancement? How might their example of trusting God with the outcome inspire you to take a stand for what's right, regardless of potential consequences?",
  4: "Daniel's commitment to prayer remained unchanged even when it became illegal and dangerous. What spiritual disciplines do you tend to abandon first when life gets busy or stressful? How might maintaining consistent prayer and Scripture reading during pressured seasons actually provide the strength you need to persevere? What would it look like to prioritize your relationship with God even when external circumstances demand compromise?",
  5: "Jesus' prayer in Gethsemane reveals the tension between human desire and divine will. What situations in your life are causing you to wrestle between what you want and what you sense God wants? How can Jesus' example of ultimately choosing surrender ('not my will, but yours') guide you in submitting your preferences to God's purposes? What would it look like to trust that God's plan is better than your own, even when you can't see how?",
  6: "Paul and Silas chose praise and worship while imprisoned unjustly, leading to miraculous deliverance. When facing unfair treatment or disappointing circumstances, how do you typically respond emotionally and spiritually? What would it look like to choose gratitude and worship as weapons against despair and bitterness? How might praise in your current difficult situation become a testimony to others about God's sustaining power?",
  7: "Abraham's willingness to sacrifice Isaac demonstrated ultimate trust in God's character and promises. What is God asking you to surrender that feels too precious or important to let go? How might your willingness to release control of something valuable actually demonstrate deeper faith in God's goodness and provision? What promises from God's Word give you confidence that He can be trusted with what matters most to you?"
};

async function updateReflectionQuestions() {
  const client = await pool.connect();
  
  try {
    console.log("🔥 Starting to fix generic reflection questions in Servant tier plans...");
    
    // Update Stewardship & Generosity Journey
    console.log("\n📚 Updating Stewardship & Generosity Journey plan...");
    for (const [dayNumber, reflection] of Object.entries(stewardshipReflections)) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1, updated_at = NOW()
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'Stewardship & Generosity Journey')
        AND day_number = $2
      `, [reflection, parseInt(dayNumber)]);
      
      console.log(`   ✅ Updated Day ${dayNumber} - ${reflection.substring(0, 80)}...`);
    }
    
    // Update remaining days 11-15 for Stewardship plan
    const stewardshipFinalDays = {
      11: "Jesus warns about the dangers of trusting in wealth rather than God. What areas of your life reveal that you might be placing more confidence in your bank account, possessions, or economic stability than in God's provision? How might the story of the rich young ruler challenge you to examine what you're unwilling to surrender for the sake of following Christ more fully? What would radical trust in God's provision look like in your current financial decisions?",
      12: "The widow's offering demonstrates that God values the heart behind giving more than the amount given. When you give or serve, are you more concerned with others' recognition or with God's approval? How might comparing your giving to others' contributions rob you of the joy and spiritual growth that comes from sacrificial generosity? What 'widow's mite' offering could you make this week that represents genuine sacrifice and trust in God's provision?",
      13: "Paul reminds us that doing good and sharing are sacrifices that please God. In what ways do you currently view acts of service and generosity - as burdens to fulfill or as worship offerings to God? How might reframing your giving and serving as spiritual sacrifices transform both your motivation and your joy in these activities? What specific act of service or generosity is God prompting you toward as an offering of worship?",
      14: "Jesus promises rewards for those who give in secret, revealing God's intimate awareness of our hidden acts of generosity. What motivates your giving - recognition from others or relationship with God? How might choosing to give or serve anonymously actually increase your spiritual growth and satisfaction? What opportunity for secret generosity could you pursue this week simply for the joy of blessing someone without any expectation of credit or thanks?",
      15: "Zacchaeus' transformation demonstrates how encountering Jesus leads to radical generosity and restitution. What relationships or situations in your life need the healing that comes through generous restitution or sacrificial giving? How has God's grace toward you motivated you to be more gracious and generous toward others? As you complete this study, what specific commitment will you make to live more generously as a response to God's abundant grace in your life?"
    };
    
    for (const [dayNumber, reflection] of Object.entries(stewardshipFinalDays)) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1, updated_at = NOW()
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'Stewardship & Generosity Journey')
        AND day_number = $2
      `, [reflection, parseInt(dayNumber)]);
      
      console.log(`   ✅ Updated Day ${dayNumber} - ${reflection.substring(0, 80)}...`);
    }
    
    // Update The Armor of God Study
    console.log("\n🛡️ Updating The Armor of God Study plan...");
    for (const [dayNumber, reflection] of Object.entries(armorReflections)) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1, updated_at = NOW()
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'The Armor of God Study')
        AND day_number = $2
      `, [reflection, parseInt(dayNumber)]);
      
      console.log(`   ✅ Updated Day ${dayNumber} - ${reflection.substring(0, 80)}...`);
    }
    
    // Add remaining days for Armor of God (8-14)
    const armorFinalDays = {
      8: "Paul emphasizes constant prayer and alertness in spiritual warfare. How consistent is your prayer life when facing spiritual battles versus when things are going smoothly? What would it look like to develop a warrior's mindset that stays alert to spiritual opposition and ready to pray at all times? How might intercessory prayer for others actually strengthen your own spiritual armor and readiness for battle?",
      9: "Paul asks for prayer that he would boldly proclaim the Gospel despite being in chains. What situations intimidate you from sharing your faith or standing up for truth? How does Paul's example of finding freedom in prison challenge your concept of what circumstances limit your effectiveness for God? What would bold faithfulness look like in your current sphere of influence, regardless of opposition or constraints?",
      10: "Ephesians concludes with a call to stand firm in the Lord's mighty power. Looking back over this armor study, which piece of armor do you most need to focus on strengthening? How has understanding spiritual warfare changed your approach to daily challenges and conflicts? What specific practices will you implement to maintain your spiritual readiness and continue standing firm in future battles?",
      11: "Jesus models spiritual warfare through His wilderness temptation, using Scripture to counter Satan's lies. Which of Satan's common strategies - pride, doubt, or compromise - do you find most challenging to resist? How has memorizing and meditating on God's Word prepared you for spiritual battles in the past? What scriptures do you need to have more readily available for your most frequent spiritual struggles?",
      12: "Paul teaches that our weapons are not worldly but divinely powerful for demolishing strongholds. What mental or spiritual strongholds - areas of persistent defeat or wrong thinking - need God's power to tear down in your life? How might focusing on God's power rather than your willpower change your strategy for overcoming stubborn sin patterns or negative thought cycles? What would it look like to invite God's supernatural intervention in your areas of greatest struggle?",
      13: "The book of Revelation reveals that Satan's accusations against believers are ultimately defeated by Jesus' blood and our testimony. What accusations or condemnation do you struggle with most frequently? How does understanding that Satan is a defeated foe change your response to guilt, shame, or feelings of inadequacy? What testimony of God's faithfulness could you share that would serve as both encouragement to others and spiritual warfare against lies?",
      14: "Revelation's conclusion shows Satan finally defeated and God's people reigning victorious. How does knowing the ultimate outcome of spiritual warfare affect your perseverance in current battles? What hope does the promise of final victory give you when facing ongoing spiritual struggles? As you complete this armor study, how will you continue to stand firm while looking forward to the day when all spiritual warfare ends in God's complete triumph?"
    };
    
    for (const [dayNumber, reflection] of Object.entries(armorFinalDays)) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1, updated_at = NOW()
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'The Armor of God Study')
        AND day_number = $2
      `, [reflection, parseInt(dayNumber)]);
      
      console.log(`   ✅ Updated Day ${dayNumber} - ${reflection.substring(0, 80)}...`);
    }
    
    // Update Faith Under Pressure plan
    console.log("\n💪 Updating Faith Under Pressure plan...");
    for (const [dayNumber, reflection] of Object.entries(faithPressureReflections)) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1, updated_at = NOW()
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'Faith Under Pressure')
        AND day_number = $2
      `, [reflection, parseInt(dayNumber)]);
      
      console.log(`   ✅ Updated Day ${dayNumber} - ${reflection.substring(0, 80)}...`);
    }
    
    // Add remaining days for Faith Under Pressure (8-14)
    const faithPressureFinalDays = {
      8: "Jesus warns that in this world we will have trouble but encourages us to take heart because He has overcome. What troubles are currently testing your faith, and how might Jesus' victory give you a different perspective on these challenges? How can remembering that Jesus has already overcome the world change your response to present difficulties? What would it look like to find peace in the midst of your current storms by focusing on Christ's ultimate triumph?",
      9: "Peter writes about rejoicing in trials because they prove the genuineness of our faith. What current test in your life might actually be revealing the authenticity and depth of your faith? How might viewing your struggles as a refining process rather than punishment change your attitude toward hardship? What evidence of genuine faith has emerged in your life through past seasons of pressure?",
      10: "Paul teaches that present sufferings are not worth comparing to future glory. When facing ongoing difficulties, how do you maintain hope for what lies ahead? What specific promises about God's future plans help you persevere through current pain or disappointment? How might focusing on eternal perspective rather than immediate relief change your prayers and expectations during trials?",
      11: "James encourages believers to persevere under trial because those who endure receive the crown of life. What would it look like to view your current challenges as training for spiritual endurance rather than obstacles to overcome? How has past perseverance through difficulty prepared you for present struggles? What crown of life promises motivate you to keep going when you feel like giving up?",
      12: "Habakkuk chooses to rejoice in God even when circumstances are completely contrary to hope. What aspects of your situation tempt you toward despair or loss of faith? How might Habakkuk's example of praising God for His character rather than His circumstances inspire your response to current trials? What reasons for joy remain available to you even when external conditions offer no cause for celebration?",
      13: "Paul describes being pressed but not crushed, perplexed but not in despair. What current pressures are testing your spiritual resilience, and how might God be using them to demonstrate His sustaining power? How has God proven faithful in past seasons when you felt overwhelmed but not defeated? What would it look like to find strength in weakness by relying on God's power rather than your own resources?",
      14: "Romans 8 promises that all things work together for good for those who love God. Looking back over this study on faith under pressure, what evidence do you see of God working good through difficult circumstances in your life? How has your understanding of God's purposes in trials changed through examining these biblical examples? What commitment will you make to trust God's goodness even when His ways don't make sense to you?"
    };
    
    for (const [dayNumber, reflection] of Object.entries(faithPressureFinalDays)) {
      await client.query(`
        UPDATE reading_plan_days 
        SET reflection_question = $1, updated_at = NOW()
        WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'Faith Under Pressure')
        AND day_number = $2
      `, [reflection, parseInt(dayNumber)]);
      
      console.log(`   ✅ Updated Day ${dayNumber} - ${reflection.substring(0, 80)}...`);
    }
    
    console.log("\n🎉 Successfully updated reflection questions for key Servant tier plans!");
    console.log("\n📊 Summary of updates:");
    console.log("   • Stewardship & Generosity Journey: 14 enhanced reflection questions");
    console.log("   • The Armor of God Study: 14 scripture-specific reflection questions"); 
    console.log("   • Faith Under Pressure: 14 meaningful reflection questions");
    console.log("   • All questions are 300+ characters with specific application prompts");
    console.log("   • Each question connects directly to the day's scripture passage");
    
  } catch (error) {
    console.error("❌ Error updating reflection questions:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the updates
updateReflectionQuestions()
  .then(() => {
    console.log("\n✨ Servant tier reflection questions enhancement complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to update reflection questions:", error);
    process.exit(1);
  });