import { pool } from '../server/db.ts';

async function createScriptureSpecificReflections() {
  console.log('🎯 Creating in-depth, scripture-specific reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // Get all days that have generic reflection questions
    const genericDays = await client.query(`
      SELECT id, plan_id, day_number, title, scripture_reference, reflection_question
      FROM reading_plan_days 
      WHERE (
        reflection_question ILIKE '%Today''s scripture passage offers profound insights%'
        OR reflection_question ILIKE '%What does this passage reveal about God''s character%'
        OR reflection_question ILIKE '%What areas of your life require moving from intellectual knowledge%'
        OR LENGTH(reflection_question) < 200
      )
      AND plan_id IN (3, 4, 5, 6, 32)
      ORDER BY plan_id, day_number
    `);
    
    console.log(`Found ${genericDays.rows.length} days needing enhanced reflection questions`);
    
    let enhanced = 0;
    for (const day of genericDays.rows) {
      try {
        const newReflection = createDeepReflectionQuestion(day.title, day.scripture_reference, day.plan_id);
        
        if (newReflection && newReflection.length > 250) {
          await client.query(`
            UPDATE reading_plan_days 
            SET reflection_question = $1
            WHERE id = $2
          `, [newReflection, day.id]);
          
          console.log(`✅ Enhanced Plan ${day.plan_id}, Day ${day.day_number}: ${day.title}`);
          enhanced++;
        }
        
      } catch (error) {
        console.log(`❌ Error enhancing day ${day.id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Enhanced ${enhanced} reflection questions with deep, specific content`);
  } finally {
    client.release();
  }
}

function createDeepReflectionQuestion(title, scriptureRef, planId) {
  // Jesus' Miracles Journey (Plan 5)
  if (planId === 5) {
    switch (title) {
      case 'Water to Wine':
        return `Jesus' first miracle wasn't healing or deliverance, but enhancing a celebration. What does this reveal about God's heart for human joy and community? How does Jesus transforming ordinary water into extraordinary wine speak to His desire to transform the ordinary moments of your life? In what areas are you settling for "water" when Jesus offers "wine"?`;
        
      case 'Healing the Officials Son':
      case 'Healing the Official\'s Son':
        return `The royal official believed Jesus could heal from a distance, without seeing proof. What obstacles to faith do you face that this father didn't? How does his willingness to take Jesus at His word challenge your approach to prayer and trust? What would change in your life if you truly believed Jesus' word alone is sufficient?`;
        
      case 'Catch of Fish':
        return `After fishing all night with nothing, Peter obeys Jesus' instruction and catches more fish than his nets can hold. What areas of your life feel fruitless despite your best efforts? How might Jesus be inviting you to try His way rather than your expertise? What would "letting down your nets" in obedience look like in your current struggles?`;
        
      case 'Healing the Paralytic':
        return `Four friends literally tore apart a roof to bring their paralyzed friend to Jesus. Who in your life needs this kind of persistent, creative faith demonstrated on their behalf? What "roofs" of obstacles, excuses, or social barriers might you need to break through to bring others to Jesus? How does their friend's healing challenge your understanding of community responsibility?`;
        
      case 'Calming the Storm':
        return `While the disciples panicked, Jesus slept peacefully in the same storm. What storms in your life are you trying to weather through anxiety rather than trust? How does Jesus' question "Where is your faith?" apply to your current fears? What would it look like to have the kind of peace that sleeps through storms?`;
        
      case 'Healing the Demoniac':
        return `The delivered man begged to follow Jesus, but was told to go home and testify instead. How does this challenge the idea that dramatic spiritual experiences always lead to dramatic lifestyle changes? What might God be asking you to do right where you are rather than somewhere else? Who in your everyday circles needs to hear your testimony?`;
        
      case 'Feeding Five Thousand':
        return `Jesus used a boy's small lunch to feed thousands, but still gathered the leftovers. What "small" resources do you hesitate to offer God because they seem inadequate? How does the miracle beginning with someone's willingness to share challenge your understanding of God's provision? What would it look like to trust God with your limitations rather than your abundance?`;
        
      case 'Walking on Water':
        return `Peter walked on water until he focused on the wind instead of Jesus. What "storms" are currently distracting you from fixing your eyes on Christ? How does Peter's brief success followed by sinking mirror your own faith journey? In what areas of life is Jesus calling you to step out of the boat despite impossible circumstances?`;
        
      case 'Healing the Blind Man':
        return `Jesus healed this man's blindness gradually, in stages. What does this teach about God's timing in your own healing and growth? How might some of your spiritual "blindness" need to be addressed progressively rather than instantly? What are you beginning to see clearly about God or yourself that was once completely dark?`;
        
      case 'Healing the Boy with Demon':
        return `The father cried, "I believe; help my unbelief!" How does this paradox reflect your own faith struggles? What areas of your life reveal both belief and doubt existing simultaneously? How might Jesus be inviting you to bring your honest doubts to Him rather than pretending stronger faith than you actually possess?`;
        
      case 'Raising Lazarus':
        return `Jesus wept even though He knew He would raise Lazarus. What does Christ's emotional response teach about God's heart toward your losses and grief? How does this miracle address your fears about situations that seem "too late" for God's intervention? What "dead" areas of your life need Jesus to speak life over them?`;
        
      case 'Healing Ten Lepers':
        return `Only one of the ten healed lepers returned to thank Jesus. What recent blessings or answered prayers have you failed to acknowledge with gratitude? How does the Samaritan's response challenge cultural or social barriers to worship? What healing in your life deserves a return journey of thanksgiving?`;
        
      case 'Healing Blind Bartimaeus':
        return `Bartimaeus threw off his cloak and came to Jesus despite the crowd's rebuke. What "cloaks" of comfort, reputation, or security might you need to cast aside to pursue Jesus more fervently? How does his persistence despite opposition challenge your approach to prayer? What would shameless desperation for Jesus look like in your current circumstances?`;
        
      case 'The Greatest Miracle':
        return `Jesus' resurrection wasn't just victory over death, but vindication of everything He taught and promised. How does the reality of the empty tomb change your perspective on current impossibilities? What fears lose their power when you truly believe in resurrection? How should living with a risen Savior transform your daily priorities and eternal perspective?`;
        
      default:
        return `This miracle reveals Jesus' divine authority over [specific domain]. How does witnessing Christ's power in this area strengthen your faith for current challenges? What impossible situation in your life needs the same divine intervention demonstrated here?`;
    }
  }
  
  // Peace in Anxiety (Plan 3)
  if (planId === 3) {
    switch (title) {
      case 'Do Not Be Anxious':
        return `Jesus commands us not to worry about basic needs, yet anxiety about provision feels so natural. What specific worries about your future are you struggling to surrender to God's care? How does knowing that your heavenly Father feeds the birds and clothes the flowers challenge your anxiety patterns? What would your daily life look like if you truly trusted God's provision?`;
        
      case 'Cast All Your Anxiety':
        return `Peter instructs us to "cast all" our anxiety on God - not just the spiritual concerns, but every worry. What anxieties do you hesitate to bring to God because they seem too small or too worldly? How might actively "casting" your cares be different from just mentioning them in prayer? What would it mean to leave your worries with God rather than picking them back up?`;
        
      case 'Peace That Guards':
        return `Paul describes a peace that "surpasses understanding" and "guards" our hearts and minds. When have you experienced peace that made no logical sense given your circumstances? What thoughts need to be "guarded" by God's peace right now? How might thanksgiving and prayer work together to create this supernatural peace?`;
        
      case 'Fear Not':
        return `Scripture contains 365 "fear not" commands - one for every day. What specific fears has God already proven unfounded in your past? How does remembering God's faithfulness in previous fearful seasons strengthen you for current anxieties? What would courage look like in your present circumstances?`;
        
      case 'Trust in the Lord':
        return `Proverbs calls us to trust the Lord with all our heart and not lean on our own understanding. Where are you trying to figure out God's plan instead of trusting His character? What situations require you to trust God's goodness even when His ways don't make sense? How might your need to understand everything be hindering your peace?`;
        
      case 'Perfect Love Drives Out Fear':
        return `John teaches that perfect love eliminates fear because fear involves punishment. What fears in your life stem from believing God might be angry or disappointed with you? How does understanding God's perfect love for you in Christ change your approach to uncertain outcomes? What would change if you truly believed God's heart toward you is always love?`;
        
      case 'Present Help in Trouble':
        return `The psalmist declares God as our "present help" - not past or future, but present. How does anxiety often rob you of experiencing God's help available right now? What would it look like to seek God's presence in your current trouble rather than focusing on potential future problems? How might God already be helping in ways you haven't recognized?`;
        
      default:
        return `This passage addresses anxiety with a specific aspect of God's character or promises. What worry in your life needs to encounter this particular truth about who God is? How would believing this truth change your emotional response to current stresses?`;
    }
  }
  
  // Finding Your Purpose (Plan 4)
  if (planId === 4) {
    switch (title) {
      case 'Created for Good Works':
        return `Paul says we are God's workmanship, created for good works He prepared beforehand. What does it mean to you that your good works were planned before you existed? How does knowing you're God's "workmanship" change how you view your current season or struggles? What good works might God be preparing you for through your present circumstances?`;
        
      case 'Called According to Purpose':
        return `God works all things together for good for those called according to His purpose. What circumstances in your life currently feel like obstacles to God's plan rather than part of it? How might your present challenges actually be forming you for your calling? What would change if you viewed your current season as purposeful rather than just something to endure?`;
        
      case 'Before You Were Born':
        return `Jeremiah learned God knew him before he was formed in the womb. How does this truth about God's intimate knowledge of you from conception affect your sense of identity and worth? What insecurities or identity questions need to be answered by God's intentional design of who you are? How might God have been preparing you for current opportunities through your entire life story?`;
        
      default:
        return `This passage reveals something significant about God's intentional design for your life and calling. How does this truth challenge any sense of randomness or meaninglessness you might feel? What next step in fulfilling your purpose does this passage point toward?`;
    }
  }
  
  // Learning to SOAP (Plan 6) 
  if (planId === 6) {
    switch (title) {
      case 'Learning to SOAP: Scripture':
        return `Isaiah 26:3 promises "perfect peace" for minds that are "steadfast" on God. What specific thoughts or worries keep pulling your mind away from focusing on God? How might the discipline of studying Scripture help train your mind to be more steadfast? What would it look like practically to keep your mind fixed on God rather than on changing circumstances?`;
        
      case 'SOAP Method: Observation':
        return `The "O" in SOAP calls us to carefully observe what the text actually says before jumping to application. What assumptions about familiar Bible passages might you need to set aside to truly observe what's written? How does slowing down to observe details change your understanding of Scripture? What observation skills from other areas of life could help you read the Bible more carefully?`;
        
      case 'SOAP Practice: Application':
        return `Application asks "How does this apply to me?" but requires honest self-assessment. What areas of your life do you tend to shield from Scripture's application? How might God be using His word to address attitudes or behaviors you haven't been willing to examine? What would humble, teachable application look like in your current circumstances?`;
        
      case 'SOAP Discipline: Prayer':
        return `The "P" in SOAP transforms Bible study from information gathering into conversation with God. How might praying through Scripture passages change your relationship with God's word? What would it look like to let the Bible shape your prayers rather than just inform them? How could this practice deepen your sense of God's personal involvement in your daily life?`;
        
      default:
        return `This aspect of the SOAP method invites deeper engagement with Scripture. What resistance do you notice in yourself to this more intentional approach to Bible study? How might this practice transform your spiritual growth and relationship with God?`;
    }
  }
  
  // Peace in Anxiety Study (Plan 32)
  if (planId === 32) {
    return `This passage specifically addresses anxiety and fear with a divine perspective. What anxious thoughts are occupying your mind that need to be replaced with truth from God's word? How does this scripture challenge your typical responses to stressful situations? What would it look like to practically apply this truth when anxiety rises?`;
  }
  
  return null;
}

createScriptureSpecificReflections().catch(console.error);