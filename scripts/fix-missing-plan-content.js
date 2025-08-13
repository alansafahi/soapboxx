import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Plan templates for missing content
const planTemplates = {
  "Journey to Deeper Waters": {
    duration: 90,
    testament: "both",
    type: "transformative",
    template: "deeper_waters"
  },
  "Stepping Stones of Faith": {
    duration: 60,
    testament: "both", 
    type: "foundational",
    template: "stepping_stones"
  },
  "Pathways of Peace: A Journey Through Faith and Growth": {
    duration: 40,
    testament: "both",
    type: "peace_growth",
    template: "pathways_peace"
  }
};

// Scripture sequences for different plan types
const scriptureSequences = {
  deeper_waters: [
    // Deep spiritual growth focused verses
    { day: 1, ref: "Psalm 42:7", passage: "Deep calls to deep at the roar of your waterfalls; all your breakers and your waves have gone over me." },
    { day: 2, ref: "Isaiah 55:10-11", passage: "For as the rain and the snow come down from heaven and do not return there but water the earth, making it bring forth and sprout, giving seed to the sower and bread to the eater, so shall my word be that goes out from my mouth; it shall not return to me empty, but it shall accomplish that which I purpose, and shall succeed in the thing for which I sent it." },
    { day: 3, ref: "John 7:37-38", passage: "On the last day of the feast, the great day, Jesus stood up and cried out, 'If anyone thirsts, let him come to me and drink. Whoever believes in me, as the Scripture has said, Out of his heart will flow rivers of living water.'" },
    { day: 4, ref: "Ephesians 3:17-19", passage: "So that Christ may dwell in your hearts through faith—that you, being rooted and grounded in love, may have strength to comprehend with all the saints what is the breadth and length and height and depth, and to know the love of Christ that surpasses knowledge, that you may be filled with all the fullness of God." },
    { day: 5, ref: "Psalm 1:1-3", passage: "Blessed is the man who walks not in the counsel of the wicked, nor stands in the way of sinners, nor sits in the seat of scoffers; but his delight is in the law of the Lord, and on his law he meditates day and night. He is like a tree planted by streams of water that yields its fruit in its season, and its leaf does not wither. In all that he does, he prospers." }
  ],
  stepping_stones: [
    // Foundational faith building verses
    { day: 1, ref: "Matthew 7:24-25", passage: "Everyone then who hears these words of mine and does them will be like a wise man who built his house on the rock. And the rain fell, and the floods came, and the winds blew and beat on that house, but it did not fall, because it had been founded on the rock." },
    { day: 2, ref: "1 Corinthians 3:11", passage: "For no one can lay a foundation other than that which is laid, which is Jesus Christ." },
    { day: 3, ref: "Ephesians 2:19-20", passage: "So then you are no longer strangers and aliens, but you are fellow citizens with the saints and members of the household of God, built on the foundation of the apostles and prophets, Christ Jesus himself being the cornerstone." },
    { day: 4, ref: "Hebrews 11:1", passage: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
    { day: 5, ref: "Romans 10:17", passage: "So faith comes from hearing, and hearing through the word of Christ." }
  ],
  pathways_peace: [
    // Peace and growth focused verses  
    { day: 1, ref: "Philippians 4:6-7", passage: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus." },
    { day: 2, ref: "Isaiah 26:3", passage: "You keep him in perfect peace whose mind is stayed on you, because he trusts in you." },
    { day: 3, ref: "John 14:27", passage: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid." },
    { day: 4, ref: "Romans 8:28", passage: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
    { day: 5, ref: "2 Corinthians 3:18", passage: "And we all, with unveiled face, beholding the glory of the Lord, are being transformed into the same image from one degree of glory to another. For this comes from the Lord who is the Spirit." }
  ]
};

// Generate devotional content based on plan type and day
function generateDevotionalContent(planType, dayNumber, scriptureRef, scriptureText) {
  const devotionals = {
    deeper_waters: [
      `Today we begin a transformative journey into the deeper waters of faith. Like the psalmist who cried "Deep calls to deep," we are invited to move beyond surface-level spirituality into the profound depths of God's love and truth. In these deeper waters, we discover not only who God is, but who we are called to become. The spiritual life is not about staying in the shallow end where we feel safe and in control. God calls us to launch out into the deep, where our faith is stretched, our trust is tested, and our hearts are enlarged. Consider the disciples who were comfortable fishing in familiar waters until Jesus called them to follow Him into uncharted territory. Today, ask yourself: What deeper waters is God calling you to explore in your relationship with Him?`,
      
      `God's Word is compared to rain and snow that accomplish His purposes on earth. Like water that penetrates the hardest ground, Scripture has the power to transform the most resistant heart. In our journey to deeper waters, we learn that God's promises are not merely comforting words but life-giving truth that reshapes our reality. The prophet Isaiah reminds us that God's Word never returns empty—it always accomplishes what He intends. This should fill us with incredible hope and confidence. When we feel dry or barren in our spiritual lives, we can trust that God's Word is working beneath the surface, preparing a harvest we cannot yet see. The seeds of transformation may be hidden from view, but they are growing with divine certainty. How has God's Word been working in the unseen places of your heart?`,
      
      `Jesus' invitation to "come and drink" reveals the heart of the Gospel—abundant life freely offered to all who thirst. In these deeper waters, we discover that spiritual satisfaction comes not from what we achieve but from what we receive. The living water Jesus offers becomes a wellspring within us, flowing out to bless others. This is the miracle of the spiritual life: as we are filled, we overflow. As we receive, we give. As we are loved, we love. The woman at the well thought she was having a conversation about physical water, but Jesus was offering her eternal life. Today, consider what thirsts in your life Jesus is inviting you to bring to Him. What empty places need His living water? Remember, those who drink from Jesus never thirst again—not because they never experience need, but because they discover an inexhaustible source of satisfaction in Him.`,
      
      `Paul's prayer for the Ephesians reveals the breathtaking dimensions of God's love—breadth, length, height, and depth beyond human comprehension. In deeper waters, we begin to grasp that we are not merely forgiven sinners but beloved children rooted and grounded in divine love. This is not sentimental emotion but the foundation of all reality. God's love is the soil in which we grow, the atmosphere we breathe, the ground upon which we stand. When we truly understand the scope of this love, it transforms how we see ourselves, others, and our circumstances. We are not struggling to earn God's approval; we are learning to live from His unconditional acceptance. We are not trying to make ourselves worthy; we are discovering our infinite worth in His eyes. Today, allow yourself to be overwhelmed by the measureless love that surrounds you. How might living from this love change your day?`,
      
      `The blessed person described in Psalm 1 is like a tree planted by streams of water—deeply rooted, consistently fruitful, and perpetually flourishing. This is the goal of our journey into deeper waters: to become so established in God's truth that we remain stable regardless of external circumstances. Notice that the tree doesn't struggle to produce fruit; it naturally yields its harvest because it is properly planted and nourished. Similarly, a life rooted in God's Word will naturally produce the fruit of righteousness, love, and wisdom. The key is not trying harder but going deeper—deeper into Scripture, deeper into prayer, deeper into community, deeper into trust. The person who meditates on God's law day and night is not legalistic but lovesick, not dutiful but delighted. Their prosperity is not material success but spiritual vitality. What would it look like for you to sink your roots deeper into the streams of God's grace today?`
    ],
    stepping_stones: [
      `Building on the rock requires wisdom to hear Jesus' words and courage to obey them. Like stepping stones across a river, each act of obedience becomes a foundation for the next step in our spiritual journey. The wise builder doesn't just admire the blueprint; they follow the instructions precisely. When the storms of life come—and they will come—our foundation determines whether we stand or fall. The difference between the wise and foolish builders wasn't the severity of the storm they faced, but the foundation they had laid beforehand. Today, consider what storms you might be facing or anticipating. Have you built your responses on the solid rock of Christ's teachings, or are you relying on shifting sand? Each small act of obedience becomes a stepping stone toward spiritual maturity and unshakeable faith.`,
      
      `Jesus Christ is the only foundation that can support the weight of our eternal destiny. Paul reminds us that all other foundations—success, relationships, achievements, even religious activity—will eventually crumble under pressure. But Christ remains steadfast through every season of life. Building on this foundation means aligning our thoughts, decisions, and priorities with His character and teachings. It means recognizing that our security comes not from what we build, but from what He has already established. Like skilled craftsmen, we must learn to build with materials that will endure—faith, hope, love, truth, and righteousness. Everything else is temporary scaffolding that will eventually be removed. What are you building your life upon today? Are your hopes and dreams founded on the unchanging character of Christ?`,
      
      `We are no longer spiritual orphans or wanderers but members of God's eternal household. This stepping stone of identity transforms everything. We belong to the family of God, built on the foundation of Scripture and the cornerstone of Christ Himself. Understanding our position changes our perspective on both struggles and successes. We are not alone in our spiritual journey; we are surrounded by a great cloud of witnesses and supported by the prayers of saints. Our identity is not based on our performance but on our position in Christ. We don't have to prove our worth; we can rest in our belonging. Today, let this truth settle deep into your heart: you are fully known, completely loved, and permanently secure in God's family. How does knowing you belong change the way you approach today's challenges?`,
      
      `Faith is both the foundation and the stepping stone to spiritual maturity. Hebrews defines faith as confident assurance about things we hope for and absolute conviction about realities we cannot see. This is not wishful thinking or blind optimism, but settled confidence in God's character and promises. Faith grows as we take steps of obedience even when we cannot see the complete path ahead. Like Abraham, who went out not knowing where he was going, we learn to trust God one step at a time. Each act of faith becomes a stepping stone to greater trust and deeper spiritual insight. Faith is not the absence of questions or doubts, but the decision to move forward based on what we do know about God rather than what we don't understand about our circumstances. What step of faith is God calling you to take today?`,
      
      `Faith comes through hearing God's Word, making Scripture reading an essential stepping stone in spiritual growth. This is not merely intellectual exercise but spiritual nourishment that feeds our faith and strengthens our resolve. As we consistently expose ourselves to God's truth, our capacity to trust Him grows naturally. The Word of God has inherent power to build faith because it reveals God's character, promises, and faithfulness throughout history. We see how He has been trustworthy in the past, giving us confidence for the future. Regular engagement with Scripture becomes like physical exercise—it strengthens our spiritual muscles and increases our endurance for life's challenges. Today, approach God's Word not as a duty but as a delight, not as homework but as hope. How can you create consistent rhythms of hearing and responding to God's Word?`
    ],
    pathways_peace: [
      `The pathway to peace begins with prayer—bringing our anxieties to God with thanksgiving rather than trying to manage them alone. Paul's prescription is simple but revolutionary: replace worry with worship, anxiety with gratitude, fear with faith-filled prayer. This is not about denying the reality of our concerns but about changing our perspective on them. When we present our requests to God with thanksgiving, we acknowledge His sovereignty over our circumstances and His goodness in the midst of our struggles. The peace that results is not the absence of conflict but the presence of God's comfort guarding our hearts and minds. This divine peace surpasses human understanding because it comes from a source beyond our circumstances. Today, practice this pathway by identifying one area of anxiety and deliberately choosing to pray about it with thanksgiving rather than worry about it with fear.`,
      
      `Perfect peace comes to those whose minds are stayed on God rather than on their circumstances. Isaiah reveals a profound truth: peace is not the result of perfect circumstances but of a focused mind. When our thoughts are anchored in God's character, promises, and presence, we experience stability regardless of external turbulence. This requires intentional mental discipline—choosing to meditate on truth rather than problems, on God's faithfulness rather than our fears. Like a ship anchored to the ocean floor remains steady despite surface storms, a mind anchored to God's truth experiences peace despite life's chaos. This pathway requires practice and patience as we train our thoughts to return to God again and again throughout the day. What thoughts dominate your mental landscape? How can you create pathways that lead your mind back to God's truth?`,
      
      `Jesus offers a peace fundamentally different from what the world provides. Worldly peace depends on favorable circumstances, but Christ's peace transcends circumstances. His peace is not the absence of trouble but the presence of His Spirit in the midst of trouble. This pathway to peace requires us to distinguish between temporary calm and eternal peace, between comfort and consolation, between relief and rest. Jesus spoke these words knowing He was about to face the cross—His peace was not based on avoiding difficulty but on trusting the Father's plan. When He says "Let not your hearts be troubled," He is not minimizing our struggles but offering divine resources to face them. Today, receive His peace not as escape from your challenges but as strength to face them with confidence in His presence and power.`,
      
      `God's sovereignty ensures that all things work together for good for those who love Him. This pathway to peace requires faith to see beyond immediate circumstances to eternal purposes. Paul doesn't promise that all things are good, but that God works all things together for our ultimate good and His glory. This truth becomes a foundation for peace because it means nothing in our lives is wasted, random, or meaningless. Even our struggles and setbacks can become stepping stones to greater spiritual maturity and deeper intimacy with God. This perspective transforms how we view difficulties—not as evidence of God's absence but as opportunities for His presence to be revealed. Today, consider one challenging situation you're facing. How might God be working even this together for your good and His glory?`,
      
      `Transformation is a process of growing spiritual maturity as we behold God's glory. This pathway to peace recognizes that we are not stuck in our current spiritual condition but are being changed from one degree of glory to another. Peace comes from knowing that God is actively working to conform us to the image of Christ, using every experience as a tool for transformation. We don't have to manufacture spiritual growth; we simply need to position ourselves to behold His glory through Scripture, prayer, worship, and community. As we see Him more clearly, we naturally become more like Him. This removes the pressure of self-improvement and replaces it with the joy of divine transformation. The Spirit of God is the agent of this change, ensuring that our growth is both genuine and sustainable. What areas of your life are currently being transformed as you behold Christ's glory?`
    ]
  };

  const baseDevotionals = devotionals[planType] || devotionals.deeper_waters;
  const dayIndex = (dayNumber - 1) % baseDevotionals.length;
  return baseDevotionals[dayIndex];
}

// Generate reflection questions based on plan type
function generateReflectionQuestion(planType, dayNumber, scriptureRef) {
  const questions = {
    deeper_waters: [
      "What deeper waters is God calling you to explore in your relationship with Him today? Consider areas where you've been content with surface-level faith but sense Him inviting you into greater depth, trust, and transformation.",
      
      "How has God's Word been working in the unseen places of your heart recently? Reflect on promises or truths from Scripture that have been taking root beneath the surface of your conscious awareness, preparing to bear fruit in unexpected ways.",
      
      "What thirsts in your life is Jesus inviting you to bring to Him today? Identify the empty places, unmet longings, or spiritual dryness that He wants to satisfy with His living water, and consider how receiving His fullness might overflow to bless others.",
      
      "How might living from the measureless love that surrounds you change your day? Consider specific relationships, decisions, or challenges that would be transformed if you truly grasped the breadth, length, height, and depth of God's love for you.",
      
      "What would it look like for you to sink your roots deeper into the streams of God's grace today? Think about practical ways to position yourself for spiritual nourishment that will produce natural fruit rather than forced effort."
    ],
    stepping_stones: [
      "What storms are you facing or anticipating that require you to examine your spiritual foundation? Consider whether your responses are built on the solid rock of Christ's teachings or the shifting sand of worldly wisdom.",
      
      "What are you building your life upon today that will endure beyond temporary circumstances? Reflect on whether your hopes, dreams, and security are founded on the unchanging character of Christ or on things that will eventually pass away.",
      
      "How does knowing you belong to God's family change the way you approach today's challenges? Consider how your identity as a beloved child of God affects your perspective on both struggles and successes.",
      
      "What step of faith is God calling you to take today, even when you cannot see the complete path ahead? Think about areas where you need to move forward based on what you know about God's character rather than what you understand about your circumstances.",
      
      "How can you create consistent rhythms of hearing and responding to God's Word that will naturally strengthen your faith? Consider practical ways to engage with Scripture as spiritual nourishment rather than religious duty."
    ],
    pathways_peace: [
      "What area of anxiety can you deliberately choose to pray about with thanksgiving rather than worry about with fear? Consider how changing your perspective through grateful prayer might bring God's peace to guard your heart and mind.",
      
      "What thoughts dominate your mental landscape, and how can you create pathways that lead your mind back to God's truth? Reflect on the difference between focusing on your problems versus focusing on God's character and faithfulness.",
      
      "How can you receive Christ's peace not as escape from your challenges but as strength to face them with confidence? Consider what it means to experience peace that transcends rather than depends on your circumstances.",
      
      "How might God be working even your current challenging situation together for your good and His glory? Reflect on how this eternal perspective could transform your view of difficulties from evidence of God's absence to opportunities for His presence to be revealed.",
      
      "What areas of your life are currently being transformed as you behold Christ's glory through Scripture, prayer, and worship? Consider how positioning yourself to see Him more clearly is naturally making you more like Him without forced effort."
    ]
  };

  const baseQuestions = questions[planType] || questions.deeper_waters;
  const dayIndex = (dayNumber - 1) % baseQuestions.length;
  return baseQuestions[dayIndex];
}

async function fixMissingPlanContent() {
  try {
    console.log('Starting to fix missing plan content...');

    // Get plans that need content
    const missingPlansQuery = `
      SELECT DISTINCT rp.id, rp.name, rp.subscription_tier
      FROM reading_plans rp
      LEFT JOIN reading_plan_days rpd ON rp.id = rpd.plan_id
      WHERE rp.is_active = true 
        AND rp.name IN ('Journey to Deeper Waters', 'Stepping Stones of Faith', 'Pathways of Peace: A Journey Through Faith and Growth')
      GROUP BY rp.id, rp.name, rp.subscription_tier
      HAVING COUNT(rpd.id) = 0 OR COUNT(CASE WHEN rpd.scripture_text IS NULL OR rpd.scripture_text = '' THEN 1 END) > 0
    `;

    const missingPlans = await pool.query(missingPlansQuery);
    
    for (const plan of missingPlans.rows) {
      const planName = plan.name;
      const planId = plan.id;
      
      console.log(`Fixing plan: ${planName} (ID: ${planId})`);
      
      if (!planTemplates[planName]) {
        console.log(`No template found for plan: ${planName}`);
        continue;
      }

      const template = planTemplates[planName];
      const scriptureSeq = scriptureSequences[template.template];
      
      // Delete existing incomplete days
      await pool.query('DELETE FROM reading_plan_days WHERE plan_id = $1', [planId]);
      
      // Create complete days for the plan
      for (let day = 1; day <= template.duration; day++) {
        const scriptureIndex = (day - 1) % scriptureSeq.length;
        const scripture = scriptureSeq[scriptureIndex];
        
        const devotionalContent = generateDevotionalContent(template.template, day, scripture.ref, scripture.passage);
        const reflectionQuestion = generateReflectionQuestion(template.template, day, scripture.ref);
        
        const insertQuery = `
          INSERT INTO reading_plan_days (
            plan_id, day_number, title, scripture_reference, scripture_text,
            devotional_content, reflection_question, prayer_prompt
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        
        const title = `Day ${day}: ${scripture.ref}`;
        const prayerPrompt = `Heavenly Father, as I reflect on ${scripture.ref}, help me to apply its truth to my life today. Grant me wisdom to understand Your Word and strength to live it out. In Jesus' name, Amen.`;
        
        await pool.query(insertQuery, [
          planId,
          day,
          title,
          scripture.ref,
          scripture.passage,
          devotionalContent,
          reflectionQuestion,
          prayerPrompt
        ]);
      }
      
      // Update the plan's duration_days if not set
      await pool.query(
        'UPDATE reading_plans SET duration_days = $1 WHERE id = $2 AND duration_days IS NULL',
        [template.duration, planId]
      );
      
      console.log(`✅ Fixed ${planName} with ${template.duration} days of content`);
    }

    console.log('✅ All missing plan content has been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing missing plan content:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
fixMissingPlanContent().catch(console.error);