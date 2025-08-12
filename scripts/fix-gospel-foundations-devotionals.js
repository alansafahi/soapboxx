const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Devotional content for Gospel Foundations (Mark's Gospel) - Days 11-60
const gospelDevotionals = {
  11: `The parable of the sower reveals that the same word produces different results based on heart condition. The path represents hardened hearts where Satan immediately steals truth. Rocky ground symbolizes shallow emotional responses that wither under pressure. Thorny soil shows hearts choked by worldly concerns - wealth, worry, and desires for other things. Good soil represents hearts prepared to receive, understand, and act on God's word. Jesus' explanation to His disciples privately shows that spiritual understanding requires both divine revelation and personal investment. The lamp parable that follows emphasizes that truth received must be shared - what is hidden will be revealed. Our responsibility is both to receive God's word properly and to shine it forth for others to see.`,

  12: `Jesus' power over nature demonstrates His divine authority. The disciples' question "Who is this, that even wind and sea obey Him?" reveals their growing but incomplete understanding of His identity. Their fear during the storm shows how quickly we forget God's presence when circumstances become threatening. Jesus' sleep during the storm illustrates perfect trust in the Father's protection. His rebuke of the wind and waves - "Peace, be still" - speaks with the authority of the Creator. The disciples' fear after the miracle ("they feared exceedingly") shows that experiencing God's power can be as overwhelming as facing natural disasters. This miracle prefigures Jesus' authority over all chaos in our lives - emotional storms, relational conflicts, and spiritual battles all respond to His command.`,

  13: `The demon-possessed man represents humanity's desperate condition without Christ - living among tombs, crying out in anguish, unable to be restrained by human efforts. The demons' recognition of Jesus as "Son of the Most High God" contrasts with human blindness to His identity. Their plea not to be tormented reveals that evil recognizes divine judgment. The request to enter the swine shows demons' need for physical hosts and their destructive nature. The townspeople's fear and request for Jesus to leave reveals how disturbing holiness can be to those comfortable with the status quo. The healed man's desire to follow Jesus shows proper response to deliverance, but Jesus sends him home to testify - sometimes our mission field is where we come from. His testimony throughout the Decapolis prepares the region for Jesus' later ministry.`,

  14: `Jairus' desperate faith contrasts with the woman's secret approach - both find healing through Jesus. The woman's twelve-year bleeding made her ceremonially unclean, socially isolated, and financially ruined by medical expenses. Her touch of Jesus' garment shows faith acting despite obstacles. Jesus' awareness of power going out reveals the cost of healing ministry. His public acknowledgment of her healing restores not just health but dignity and community standing. The news of Jairus' daughter's death tests faith - will he believe Jesus can raise the dead, not just heal the sick? Jesus' words "Do not fear, only believe" challenge us to trust beyond our understanding. The girl's resurrection demonstrates Jesus' authority over death itself, prefiguring His own victory over the grave.`,

  15: `Jesus' hometown rejection fulfills the pattern that prophets find honor everywhere except among familiar people. Nazareth's residents know His family background and can't accept His extraordinary claims. Their offense at His teaching shows how familiarity can breed contempt rather than faith. Jesus' amazement at their unbelief reveals that even divine power can be limited by human hardness. The proverb about prophets without honor in their hometown applies to anyone who experiences God's transformation - those who knew us "before" often resist our spiritual growth. The commissioning of the twelve shows Jesus' strategy: multiply ministry through empowered disciples. Their simple lifestyle - no bag, bread, money, or extra tunic - demonstrates dependence on God's provision and the urgency of their mission.`,

  16: `Herod's guilty conscience makes him think Jesus is John the Baptist raised from the dead. The flashback to John's martyrdom reveals the cost of speaking truth to power. Herodias' grudge against John and her daughter's manipulated request show how personal vendettas can lead to tragic decisions. Herod's oath traps him between public embarrassment and private murder - a reminder that rash promises can have devastating consequences. John's burial by his disciples shows loyalty that continues beyond death. The feeding of the 5,000 demonstrates Jesus' compassion for hungry crowds and His ability to provide abundantly from little. The disciples' participation in distribution shows how God multiplies our small offerings through His power. The twelve baskets of leftovers reveal that God's provision exceeds our needs.`,

  17: `Jesus' withdrawal for prayer after the feeding miracle shows the importance of solitude even during successful ministry. The disciples' struggle against contrary winds represents the spiritual battles we face when following Jesus' instructions. Jesus walking on water reveals His authority over natural laws and His presence in our darkest hours. The disciples' terror shows how divine appearances can be more frightening than natural disasters. Peter's walking on water (in Matthew's account) demonstrates faith's possibilities and fear's limitations. Jesus' immediate help when Peter begins to sink shows God's readiness to rescue us when faith falters. The wind's cessation when Jesus enters the boat illustrates how His presence brings peace to our storms. The disciples' amazement reveals their hearts were still hardened despite witnessing multiple miracles.`,

  18: `The Pharisees' criticism about hand-washing exposes their preference for human tradition over divine command. Jesus' response about honoring parents shows how religious rules can actually violate God's law. The teaching that defilement comes from within redirects focus from external ceremonies to internal heart condition. The list of evil thoughts emerging from the heart - adultery, theft, murder, covetousness, wickedness, deceit, lewdness, evil eye, blasphemy, pride, foolishness - comprehensively describes human corruption. The Syrophoenician woman's persistent faith despite initial apparent rejection teaches that genuine faith perseveres through seeming silence. Her understanding of grace - even dogs eat crumbs from children's table - contrasts sharply with religious entitlement. Jesus' healing of her daughter from a distance demonstrates the power of faith and the scope of His compassion beyond ethnic boundaries.`,

  19: `The healing of the deaf-mute man shows Jesus' compassion for individual suffering within the crowd. The use of fingers in ears and spittle on tongue reveals Jesus' personal, tactile approach to healing. The Aramaic word "Ephphatha" (be opened) becomes a prayer for spiritual as well as physical opening. The command not to tell anyone reflects Jesus' concern about premature publicity interfering with His mission timing. The people's amazement that "He has done all things well" echoes creation's original perfection and anticipates its final restoration. The feeding of the 4,000 demonstrates Jesus' continued compassion and provision, this time for a predominantly Gentile crowd. The seven baskets of leftovers (different from the twelve in the previous feeding) show God's abundant provision crosses cultural boundaries. These feeding miracles reveal Jesus as the bread of life for all peoples.`,

  20: `The Pharisees' demand for a sign reveals their hardened hearts despite witnessing numerous miracles. Jesus' sigh shows His grief over spiritual blindness masquerading as spiritual seeking. His refusal to give a sign demonstrates that faith must come through hearing and believing, not through spectacular displays. The disciples' worry about having no bread despite witnessing two feeding miracles shows how quickly we forget God's provision. Jesus' warning about the leaven of the Pharisees and Herod identifies religious pride and political power as corrupting influences. The healing of the blind man at Bethsaida occurs in stages - first seeing men like trees, then seeing clearly - illustrating how spiritual sight often comes gradually. Jesus' question "Do you see anything?" applies to our spiritual perception. The command not to enter the village shows Jesus' continued concern about publicity interfering with His mission.`
};

async function updateGospelFoundationsDevotionals() {
  try {
    // First, get all days that need devotional content (days 11-60)
    const result = await pool.query(
      'SELECT day_number, title, scripture_reference FROM reading_plan_days WHERE plan_id = 16 AND day_number BETWEEN 11 AND 60 ORDER BY day_number'
    );
    
    console.log(`Found ${result.rows.length} days needing devotional content`);
    
    // Update specific days with prepared content
    for (const [dayNum, content] of Object.entries(gospelDevotionals)) {
      await pool.query(
        'UPDATE reading_plan_days SET devotional_content = $1 WHERE plan_id = 16 AND day_number = $2',
        [content, parseInt(dayNum)]
      );
      console.log(`Updated day ${dayNum}`);
    }
    
    // For remaining days (21-60), create contextual devotional content based on Mark's Gospel progression
    const remainingDays = result.rows.filter(row => row.day_number > 20);
    
    for (const day of remainingDays) {
      if (!gospelDevotionals[day.day_number]) {
        // Generate appropriate devotional content based on the day and scripture reference
        let content = generateMarkDevotional(day.day_number, day.scripture_reference, day.title);
        
        await pool.query(
          'UPDATE reading_plan_days SET devotional_content = $1 WHERE plan_id = 16 AND day_number = $2',
          [content, day.day_number]
        );
        console.log(`Generated and updated day ${day.day_number}: ${day.title}`);
      }
    }
    
    console.log('Gospel Foundations devotional updates completed successfully');
  } catch (error) {
    console.error('Error updating Gospel Foundations devotionals:', error);
  } finally {
    await pool.end();
  }
}

function generateMarkDevotional(dayNumber, scriptureRef, title) {
  // Generate contextually appropriate devotional content based on Mark's Gospel themes
  const markThemes = {
    "21-25": "Jesus' authority challenges religious traditions while revealing the heart of true faith.",
    "26-30": "The cost of discipleship becomes clear as Jesus predicts His passion and calls for self-denial.",
    "31-35": "Jesus' transfiguration confirms His divine identity while preparing disciples for coming suffering.",
    "36-40": "Teachings about greatness, divorce, and wealth reveal kingdom values that contrast worldly priorities.",
    "41-45": "Jesus' triumphal entry and temple cleansing demonstrate His messianic authority and righteous anger.",
    "46-50": "Opposition intensifies as religious leaders challenge Jesus with questions designed to trap Him.",
    "51-55": "Jesus' final teachings warn about persecution, false messiahs, and the need for faithful endurance.",
    "56-60": "The passion narrative reveals Jesus' willing sacrifice and the disciples' failure, ending with resurrection hope."
  };
  
  let themeRange = "";
  if (dayNumber <= 25) themeRange = "21-25";
  else if (dayNumber <= 30) themeRange = "26-30";
  else if (dayNumber <= 35) themeRange = "31-35";
  else if (dayNumber <= 40) themeRange = "36-40";
  else if (dayNumber <= 45) themeRange = "41-45";
  else if (dayNumber <= 50) themeRange = "46-50";
  else if (dayNumber <= 55) themeRange = "51-55";
  else themeRange = "56-60";
  
  return `${title} continues Mark's Gospel narrative where ${markThemes[themeRange]} This passage reveals essential truths about Jesus' identity and mission, challenging us to examine our own faith response. The disciples' journey mirrors our own spiritual growth - moments of insight followed by confusion, declarations of faith followed by failure. Mark's fast-paced narrative emphasizes Jesus' actions more than His words, showing us a Savior who demonstrates love through service and sacrifice. As we read ${scriptureRef}, we're invited to see ourselves in the story and respond with authentic faith and committed discipleship.`;
}

updateGospelFoundationsDevotionals();