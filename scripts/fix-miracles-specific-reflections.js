import { pool } from '../server/db.ts';

async function fixMiraclesSpecificReflections() {
  console.log('🎯 Creating deeply specific reflection questions for Jesus Miracles Journey...');
  
  const client = await pool.connect();
  
  try {
    // Get all days from the Jesus' Miracles Journey plan
    const miracleDays = await client.query(`
      SELECT id, day_number, title, scripture_reference, scripture_text
      FROM reading_plan_days 
      WHERE plan_id = 5
      ORDER BY day_number
    `);
    
    console.log(`Found ${miracleDays.rows.length} days in Jesus' Miracles Journey plan`);
    
    let enhanced = 0;
    for (const day of miracleDays.rows) {
      try {
        const specificReflection = createMiracleSpecificReflection(day.title, day.scripture_reference, day.scripture_text);
        
        if (specificReflection && specificReflection.length > 300) {
          await client.query(`
            UPDATE reading_plan_days 
            SET reflection_question = $1
            WHERE id = $2
          `, [specificReflection, day.id]);
          
          console.log(`✅ Enhanced Day ${day.day_number}: ${day.title}`);
          enhanced++;
        }
        
      } catch (error) {
        console.log(`❌ Error enhancing day ${day.id}: ${error.message}`);
      }
    }
    
    console.log(`📊 Enhanced ${enhanced} reflection questions with miracle-specific depth`);
  } finally {
    client.release();
  }
}

function createMiracleSpecificReflection(title, scriptureRef, scriptureText) {
  switch (title) {
    case 'Water to Wine':
      return `At a wedding celebration running out of wine, Jesus' mother simply told the servants, "Do whatever he tells you." The servants filled massive stone jars with water - not knowing what Jesus planned. What does Mary's confidence teach you about approaching Jesus with problems that seem unsolvable? When the servants obeyed without understanding the outcome, what did they discover about Jesus' power? What "stone jars" in your life need to be filled with ordinary obedience, trusting Jesus to create something extraordinary? How does this miracle challenge the idea that God only cares about "spiritual" matters and not ordinary human celebrations and relationships?`;
      
    case 'Healing the Officials Son':
    case 'Healing the Official\'s Son':
      return `A desperate father traveled miles to beg Jesus to heal his dying son. Jesus simply said, "Go, your son will live" - and the man believed without seeing any proof. What desperate situations in your life require this kind of faith that acts on Jesus' word alone? The father discovered his son was healed at the exact moment Jesus spoke - how does this reveal Jesus' power over time and distance? What obstacles to belief (social status, pride, doubt) did this royal official have to overcome that you might also face? When has God asked you to "go" in faith before you could see the results?`;
      
    case 'Catch of Fish':
      return `Professional fishermen had worked all night and caught nothing. When Jesus told them to try again in daylight (the worst time for fishing), Peter said, "At your word I will let down the nets." The catch was so large it broke their nets and nearly sank their boats. What areas of your life feel completely fruitless despite your best professional efforts and expertise? How does Peter's willingness to try Jesus' counterintuitive approach challenge your reliance on conventional wisdom? When the miracle happened, Peter's response was "Depart from me, for I am a sinful man" - what does this teach about encountering Jesus' power? What might Jesus be asking you to try again in His way rather than your way?`;
      
    case 'Healing the Paralytic':
      return `Four friends carried a paralyzed man to Jesus, but couldn't get through the crowd. So they climbed on the roof, tore it apart, and lowered their friend down on ropes. Jesus saw "their faith" - not just the paralyzed man's faith. Who in your life needs you to demonstrate this kind of persistent, creative, costly faith on their behalf? What "roofs" of social barriers, personal comfort, or conventional approaches might you need to "tear up" to bring someone to Jesus? When Jesus forgave the man's sins before healing his body, what does this teach about addressing root problems versus surface symptoms? How does this story challenge you to think about faith as both individual and community responsibility?`;
      
    case 'Calming the Storm':
      return `While experienced fishermen panicked in a life-threatening storm, Jesus was sleeping peacefully in the same boat facing the same waves. His question after calming the storm was, "Where is your faith?" What storms in your life reveal the difference between knowing about God's power and actually trusting in it? How does Jesus sleeping through the storm challenge your understanding of what peace looks like in crisis? The disciples asked, "What manner of man is this, that even the winds and sea obey him?" - what situations in your life need you to remember that the same Jesus who commands nature is present with you? What would it look like to have the kind of peace that sleeps through storms rather than being controlled by them?`;
      
    case 'Healing the Demoniac':
      return `The delivered man begged to follow Jesus everywhere, but Jesus told him, "Return to your own house and tell what great things God has done for you." The man became an evangelist to his entire region. How does this challenge the assumption that radical encounters with Jesus always mean leaving everything behind? What might God be asking you to do right where you are rather than somewhere else? The townspeople asked Jesus to leave because His power made them uncomfortable - how do you respond when God's work disrupts the status quo? Who in your everyday circles - family, neighbors, coworkers - needs to hear your testimony about what God has done in your life?`;
      
    case 'Feeding Five Thousand':
      return `When faced with thousands of hungry people, the disciples wanted to send everyone away. Jesus asked them to feed the crowd with just five loaves and two fish from a young boy's lunch. What "impossibly inadequate" resources do you hesitate to offer God because they seem too small for the need? How did the boy's willingness to give his entire lunch become the starting point for the miracle? Jesus still had the disciples gather twelve baskets of leftovers - what does this teach about God's abundance versus scarcity thinking? When you face overwhelming needs (in your family, community, or world), how does this miracle challenge you to start with what you have rather than focusing on what you lack?`;
      
    case 'Walking on Water':
      return `Peter walked on water as long as he kept his eyes on Jesus, but began to sink when he focused on the storm around him. What "impossible" things has God called you to that require keeping your focus on Him rather than your circumstances? How does Peter's experience mirror the pattern of faith and doubt in your own spiritual journey? When Peter began to sink, Jesus immediately reached out to catch him - what does this teach about God's response when our faith wavers? The other disciples stayed safely in the boat and missed the miracle - what opportunities to experience God's power might you be missing by playing it safe?`;
      
    case 'Healing the Blind Man':
      return `Jesus healed this man's blindness in stages - first he saw "men like trees walking," then clearly. What does this teach about God's timing in your own healing and spiritual growth? How might some of your current "partial sight" about God, yourself, or your circumstances need to develop gradually rather than instantly? The man's honest report of what he could and couldn't see at each stage led to complete healing - how does this challenge you to be honest about your current spiritual condition rather than pretending to see more clearly than you do? What are you beginning to see about God that was once completely unclear to you?`;
      
    case 'Healing the Boy with Demon':
      return `When the father cried, "I believe; help my unbelief!" he expressed the paradox many believers experience. What areas of your life reveal both genuine faith and honest doubt existing simultaneously in your heart? The disciples had failed to heal the boy, leading Jesus to say this kind requires prayer and fasting - what situations in your life might require deeper spiritual discipline rather than surface-level faith? How does the father's desperate honesty about his mixed faith encourage you to bring your doubts to Jesus rather than hiding them? When Jesus said "all things are possible to him who believes," what "impossible" situation in your life needs this kind of believing prayer?`;
      
    case 'Raising Lazarus':
      return `Even though Jesus knew He would raise Lazarus from the dead, He still wept when He saw Mary and Martha's grief. What does Christ's emotional response teach you about God's heart toward your losses and suffering? Martha said, "If you had been here, my brother would not have died" - how do you handle situations where God's timing doesn't match your expectations? When Jesus called Lazarus out of the tomb after four days, what "dead" dreams, relationships, or situations in your life seem too far gone for resurrection? How does this miracle address your fears about situations that feel "too late" for God's intervention?`;
      
    case 'Healing Ten Lepers':
      return `Ten lepers were healed, but only one (a despised Samaritan) returned to thank Jesus. What recent healings, provisions, or answered prayers have you failed to acknowledge with grateful worship? The nine who didn't return were physically healed but missed something deeper - how might ingratitude rob you of the fullest experience of God's blessing? How does the Samaritan's response challenge social or cultural barriers to openly worshipping Jesus? When Jesus asked, "Were not ten cleansed? Where are the nine?" what does this reveal about God's heart for thanksgiving and relationship, not just miracle-working power?`;
      
    case 'Healing Blind Bartimaeus':
      return `Blind Bartimaeus threw off his cloak and came running to Jesus despite the crowd's attempts to silence him. What "cloaks" of respectability, comfort, or security might you need to cast aside to pursue Jesus more desperately? His persistence in calling out "Son of David, have mercy on me!" despite opposition led to his healing - how does this challenge your approach to prayer when others suggest you should be less bold? After receiving sight, Bartimaeus immediately followed Jesus on the road - what would wholehearted discipleship look like in your life after experiencing Christ's healing power? How does his shameless desperation contrast with polite, socially acceptable approaches to faith?`;
      
    case 'The Greatest Miracle':
      return `The resurrection wasn't just Jesus' victory over death, but the vindication of everything He taught and promised throughout His ministry. How does the reality of the empty tomb transform your perspective on current "impossible" situations in your life? What fears lose their power when you truly believe in a risen Savior who conquered humanity's greatest enemy? The women at the tomb went from expecting to anoint a dead body to becoming the first witnesses of resurrection - how might God surprise you in situations where you expect endings instead of new beginnings? Since you serve a risen Christ, what should change about your daily priorities, eternal perspective, and confidence in God's promises?`;
      
    default:
      return `This miracle reveals Jesus' divine authority and compassion in action. How does witnessing Christ's power in this specific situation strengthen your faith for current challenges? What impossible circumstance in your life needs the same divine intervention Jesus demonstrated here?`;
  }
}

fixMiraclesSpecificReflections().catch(console.error);