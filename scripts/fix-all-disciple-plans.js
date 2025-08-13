import { pool } from '../server/db.ts';

async function fixAllDisciplePlans() {
  console.log('🔧 Fixing reflection questions for all Disciple-tier plans...');
  
  const client = await pool.connect();
  
  try {
    // Get all beginner (Disciple) plans that need fixing
    const plansToFix = [3, 4, 5, 6]; // Based on screenshots
    
    const planSpecificReflections = {
      // Plan 3: Overcoming Anxiety
      3: {
        1: `When Jesus tells us not to worry about basic needs like food and clothing, what does this reveal about His understanding of human anxiety? How does knowing that your heavenly Father feeds the birds challenge you to trust His provision in your specific worries?

Consider the phrase "do not worry about your life" - what areas of your life do you find hardest to surrender to God's care? How might anxiety actually be a form of trying to control what belongs to God's sovereign care?

Jesus asks, "Are you not much more valuable than birds?" How does understanding your immense value to God transform your perspective on current anxieties? What would change if you truly believed God treasures you above all creation?

The passage implies that worry is ultimately about misplaced focus - on temporal needs rather than eternal provision. What spiritual disciplines or practices might help redirect your anxious thoughts toward God's faithfulness when worry overwhelms you?`,
        
        2: `Peter instructs us to "cast all your anxiety on Him because He cares for you." What does it look like practically to "cast" your worries rather than carrying them? How is this different from simply ignoring problems?

The word "all" suggests no anxiety is too small or too large for God's concern. What specific anxieties have you been hesitant to bring to God, thinking they're either too trivial or too overwhelming? How does His care invite complete transparency?

Notice that casting anxiety is based on the truth that "He cares for you." How does knowing God's personal care for you - not just humanity in general - change your willingness to trust Him with your deepest concerns?

This passage comes in the context of suffering and persecution. How does this expand your understanding of the types of anxiety God wants to carry? What might it mean to cast anxiety about circumstances beyond your control onto the One who orchestrates all things for good?`
      },
      
      // Plan 4: Discover Your Purpose  
      4: {
        1: `Paul describes believers as God's "workmanship," using the Greek word "poiema" - a masterpiece or work of art. How does seeing yourself as God's carefully crafted masterpiece challenge any feelings of insignificance or purposelessness in your life?

The text says you were "created in Christ Jesus to do good works, which God prepared in advance." What does it mean that God prepared specific good works for you before you were even born? How might this change your approach to discovering your calling?

Notice that good works are the result of being God's workmanship, not the means to earn His favor. How does this distinction free you from performance-based living while still motivating you toward purposeful action?

Consider that your identity as God's masterpiece comes first, then your mission follows. In what ways have you been seeking purpose through achievements rather than resting in your identity in Christ? How might this reordering transform your daily decisions?`,
        
        2: `Romans 8:28 promises that "in all things God works for the good of those who love him, who have been called according to his purpose." How do both pleasant and difficult experiences in your life contribute to God's good purposes for you?

The phrase "called according to his purpose" suggests your life has divine intentionality. What patterns of passion, gifting, or opportunity do you see in your story that might reflect God's unique calling on your life?

Notice that God's working "for good" is specifically for those who love Him and are called according to His purpose. How does your love relationship with God become the foundation for discovering and living out your purpose?

The text implies that nothing in your life - successes, failures, relationships, challenges - is wasted in God's economy. How might this truth change your perspective on past experiences you've considered setbacks or mistakes?`
      },
      
      // Plan 5: Miracles of Jesus
      5: {
        1: `Jesus' first miracle at Cana reveals His heart for celebration and provision in ordinary life, not just spiritual crises. What does this teach you about God's care for human joy and relationships? How might this expand your understanding of what God considers important?

Notice that Jesus initially hesitates, saying "My hour has not yet come," but then acts out of compassion for the wedding family. What does this reveal about how God responds to our needs even when His timing might be different from ours?

The miracle transforms water used for ceremonial washing into the finest wine. How might God want to transform the ordinary, religious routines in your life into something rich and meaningful? What areas need His transforming touch?

Only the servants knew the source of the wine - the guests were unaware a miracle had occurred. How does this challenge our expectations that God's work in our lives should always be dramatic and visible to others?`,
        
        2: `The royal official travels from Capernaum to Cana, demonstrating desperate faith in Jesus' ability to heal his dying son from a distance. What seemingly impossible situation in your life requires this kind of radical trust in Jesus' power?

Jesus challenges the man's faith by saying "Unless you people see signs and wonders, you will never believe." How does this speak to our tendency to demand proof before trusting? What would faith look like without requiring miraculous evidence?

The official believes Jesus' word alone - "Your son will live" - and begins his journey home without visible confirmation. What promises of God do you need to believe and act upon before seeing the outcome?

The miracle occurs at the exact moment Jesus spoke, though it's confirmed later. How does this demonstrate that God's work often happens in ways we cannot immediately see or understand? What might God be doing in your circumstances that you haven't yet recognized?`
      },
      
      // Plan 6: Learning to SOAP
      6: {
        1: `Isaiah 26:3 promises "perfect peace" for those whose minds are "steadfast" on God. In our age of distraction and anxiety, what would it look like practically to keep your mind steadfast on God rather than on changing circumstances?

The peace described here is conditional on trust - "because they trust in you." How is trust different from mere belief? What specific areas of your life require moving from intellectual knowledge about God to active, daily trust in His character?

The Hebrew word for "steadfast" suggests being firmly established or secure. What mental habits, spiritual practices, or life rhythms might help establish your mind more firmly on God's faithfulness rather than on your fears?

This verse suggests that peace is not the absence of problems but the presence of a steadfast focus on God. How might this truth change your approach to finding peace during difficult seasons? What would it mean to pursue God Himself rather than pursuing peace as an end goal?`,
        
        2: `Jesus uses birds as an example of carefree trust in God's provision - they don't worry about tomorrow's food yet are fed daily. What can you learn from nature about trusting God's timing and provision rather than anxiously trying to secure your own future?

The passage suggests that worry often stems from misplaced values - focusing on physical needs rather than recognizing life's deeper purpose. How might your current anxieties reflect confusion about what truly matters in God's kingdom?

Jesus points out that worry doesn't add a single hour to life - it's ultimately powerless to change outcomes. If worry is powerless, what God-honoring actions could you take instead when facing uncertain circumstances?

Notice that Jesus doesn't minimize real needs (food, clothing) but rather places them in the context of God's fatherly care. How does understanding God as your caring Father change your approach to practical concerns and daily provision?`
      }
    };
    
    let totalFixed = 0;
    
    for (const planId of plansToFix) {
      console.log(`\n📖 Fixing Plan ${planId}...`);
      
      // Get all days for this plan
      const daysResult = await client.query(`
        SELECT id, day_number, title
        FROM reading_plan_days 
        WHERE plan_id = $1
        ORDER BY day_number
      `, [planId]);
      
      for (const day of daysResult.rows) {
        const dayNum = day.day_number;
        let reflection;
        
        // Use specific reflection if available, otherwise create contextual one
        if (planSpecificReflections[planId] && planSpecificReflections[planId][dayNum]) {
          reflection = planSpecificReflections[planId][dayNum];
        } else {
          // Default meaningful reflection for other days
          reflection = createDefaultReflection(planId, day.title);
        }
        
        try {
          await client.query(
            'UPDATE reading_plan_days SET reflection_question = $1 WHERE id = $2',
            [reflection, day.id]
          );
          
          console.log(`✅ Fixed Plan ${planId}, Day ${dayNum}: ${day.title}`);
          totalFixed++;
        } catch (error) {
          console.log(`❌ Error updating Plan ${planId}, Day ${dayNum}: ${error.message}`);
        }
      }
    }
    
    console.log(`📊 Fixed ${totalFixed} total reflection questions across all Disciple plans`);
  } finally {
    client.release();
  }
}

function createDefaultReflection(planId, title) {
  // Plan-specific default templates
  if (planId === 3) { // Anxiety plan
    return `This passage addresses anxiety and worry directly. What specific anxieties in your life does this text speak to? How does God's character revealed here challenge your fearful thoughts?

Consider the practical steps or commands given in this passage about handling worry. Which of these feels most challenging for you to implement, and why? What would obedience look like in your current circumstances?

How does this text reveal God's heart for your emotional well-being? What does it teach you about His desire to carry your burdens rather than having you carry them alone?

The passage likely offers both comfort and challenge regarding worry. What truth from this text could become your "go-to" reminder when anxiety begins to overwhelm your thoughts and peace?`;
  }
  
  if (planId === 4) { // Purpose plan
    return `This passage speaks to God's intention and design for your life. What does this text reveal about how God views you and your role in His kingdom? How does this challenge or affirm your understanding of your worth and calling?

Consider the specific ways this passage describes your identity or purpose. Which aspect feels most difficult for you to fully believe or embrace? What barriers prevent you from walking confidently in this truth?

How does this text connect your personal purpose to God's larger story and kingdom work? What does it suggest about the significance of your everyday actions and decisions?

What specific step could you take this week to align your life more closely with the purpose and identity described in this passage? How might living out this truth transform your relationships and daily priorities?`;
  }
  
  if (planId === 5) { // Miracles plan
    return `This miracle reveals specific aspects of Jesus' character, power, and compassion. What does His response to this situation teach you about His heart for human need and suffering?

Consider the faith displayed by the people in this account. What can you learn from their approach to Jesus? How does their example challenge or encourage your own faith in difficult circumstances?

Miracles often reveal spiritual truths through physical healing or provision. What deeper spiritual reality might this miracle point to? How does it speak to areas where you need God's transforming power?

How does witnessing Jesus' miraculous power through this account affect your trust in His ability to work in your current challenges? What would it look like to bring your needs to Him with the same confidence displayed in this story?`;
  }
  
  if (planId === 6) { // SOAP plan
    return `As you practice the SOAP method with this passage, what specific truth about God's character stands out most clearly? How does this attribute of God speak to your current life situation?

What observations from this text challenge your current thinking or lifestyle? Which phrase or command feels most convicting or encouraging as you examine your heart honestly?

How does this passage call you to respond practically? What specific application or change is God inviting you to make based on these verses? How will you implement this truth in the coming days?

Consider how this text connects to the larger story of God's relationship with His people. What does it reveal about His faithfulness, love, or purposes that deepens your trust in Him?`;
  }
  
  // Default reflection for any other plans
  return `What specific aspect of God's character does this passage highlight that speaks to your current circumstances? How does this revelation of who God is change your perspective on challenges you're facing?

This text likely contains both encouragement and challenge for Christian living. What truth here brings you comfort, and what aspect calls you to grow or change in your faith journey?

Consider how this passage connects to the broader themes of the gospel. How does it point to God's love, grace, or transformative power in ways that deepen your appreciation for what Christ has done?

What specific action or change in thinking is this passage calling you toward? How can you carry the truth from these verses into your relationships, decisions, and daily walk with God this week?`;
}

fixAllDisciplePlans().catch(console.error);