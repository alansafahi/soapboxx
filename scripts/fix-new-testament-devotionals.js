const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Meaningful devotional content for specific Matthew chapters
const matthewDevotionals = {
  13: `Jesus' parables in Matthew 13 reveal kingdom mysteries through everyday images: seeds, soil, weeds, treasure, pearls, and nets. The parable of the sower shows that the same word produces different results based on heart condition. Hidden treasure and costly pearls illustrate the supreme value of God's kingdom - worth sacrificing everything else. Notice that Jesus explains parables privately to disciples but speaks in riddles to crowds. Understanding God's truth requires both divine revelation and personal investment. What kind of "soil" best describes your heart's current condition for receiving God's word?`,
  
  14: `The feeding of the 5,000 demonstrates Jesus' compassion and creative power, but the real miracle might be the disciples' participation. They distribute what seems inadequate until everyone is fed with leftovers to spare. Peter's water-walking reveals both faith's possibilities and fear's limitations - he succeeds until he focuses on circumstances rather than Jesus. John the Baptist's martyrdom reminds us that following God doesn't guarantee earthly safety, but it does guarantee eternal significance. How do you typically respond when God asks you to participate in something that seems impossible?`,
  
  15: `Jesus' conflict with Pharisees over tradition versus God's commands exposes how human rules can nullify divine intentions. His explanation that defilement comes from within, not from external factors, redirects focus from ceremonial cleanliness to heart purity. The Canaanite woman's persistent faith despite initial rejection teaches that genuine faith perseveres and ultimately receives Jesus' commendation. Her understanding of grace - even crumbs from the master's table satisfy - contrasts sharply with religious pride. What human traditions might be hindering your authentic relationship with God?`,
  
  16: `Peter's declaration "You are the Christ, the Son of the living God" represents the foundational confession upon which Jesus builds His church. Yet immediately after this revelation, Peter rebukes Jesus for predicting suffering, earning the sharp correction "Get behind me, Satan!" This shows how quickly spiritual insight can turn to spiritual blindness when we resist God's ways. Jesus' teaching about losing life to find it paradoxically reveals that self-preservation actually leads to self-destruction. What does it mean for you practically to "take up your cross daily"?`,
  
  17: `The Transfiguration provides a glimpse of Jesus' true glory, confirming His identity as God's beloved Son. Moses and Elijah's presence connects Jesus to both Law and Prophets, while the Father's voice commands "Listen to him!" Yet immediately after this mountaintop experience, they encounter a father desperate for his demon-possessed son's healing. The disciples' failure to help reveals that spiritual highs must translate into compassionate action. Faith the size of a mustard seed can move mountains, but it must be applied to real-world needs. How do you maintain spiritual momentum after powerful worship experiences?`,
  
  18: `Jesus' teaching about greatness through childlike humility challenges every human instinct for advancement and recognition. His parable about forgiveness - the servant forgiven millions who refuses to forgive pennies - exposes the absurdity of harboring grudges after receiving God's grace. The process for church discipline prioritizes relationship restoration over punishment, while the promise about gathering in Jesus' name reveals His presence in community conflicts. "How many times should I forgive? Seven times?" "No, seventy-seven times." What relationship requires you to practice this kind of relentless forgiveness?`,
  
  19: `Jesus' teaching on divorce and remarriage reveals God's original design for marriage as permanent covenant, not temporary contract. When rich young ruler asks about eternal life, Jesus exposes how wealth can become the functional god that prevents wholehearted devotion. The disciples' shock - "Who then can be saved?" - shows their assumptions about prosperity as God's blessing. Jesus' response about camels and needles isn't impossible with God, but it requires the kind of miracle that transforms human hearts. What possessions or positions might be hindering your complete surrender to Jesus?`,
  
  20: `The parable of vineyard workers receiving equal pay regardless of hours worked challenges human notions of fairness and merit. God's generosity operates by grace, not by human calculations of deserving. James and John's request for positions of honor prompts Jesus' teaching that greatness in God's kingdom means serving others, not being served. His own example - giving His life as ransom for many - provides the pattern for Christian leadership. Two blind men's persistent crying for mercy despite the crowd's rebuke demonstrates the faith that receives healing. How do you struggle with God's generous grace toward others?`
};

const lukeDevotionals = {
  1: `Luke's careful investigation promises an "orderly account" of Jesus' life, grounding faith in historical reality. The angel's announcements to Zechariah and Mary reveal God's pattern of choosing unlikely people for extraordinary purposes. Mary's song of praise celebrates God's reversal of human power structures - lifting up the humble and feeding the hungry. Zechariah's prophecy connects Jesus to centuries of divine promises, while John's desert calling to "prepare the way" echoes Isaiah's ancient words. How does Mary's response to impossible news - "Let it be according to your word" - challenge your trust in God's timing and methods?`,
  
  2: `The shepherds - society's outcasts - receive heaven's most important announcement, while powerful rulers remain ignorant. Simeon's long wait for "the consolation of Israel" finally ends when he holds baby Jesus, and Anna's decades of temple service prepare her to recognize the Messiah. Jesus' childhood episode in the temple reveals His early awareness of divine calling, even as He submits to parental authority. "Why were you looking for me? Did you not know I must be in my Father's house?" shows priority alignment that sometimes creates family tension. How do you balance honoring human relationships with following divine calling?`,
  
  3: `John's baptism of repentance creates space for Jesus' public ministry launch, marked by heaven opening and the Spirit's descent. Luke's genealogy traces Jesus back to Adam, emphasizing His connection to all humanity, not just Jewish lineage. The detailed family tree reminds us that God works through ordinary generations to accomplish extraordinary purposes. John's message about sharing coats and food with those who have none translates repentance into practical generosity. What specific changes in your daily life would demonstrate authentic repentance?`,
  
  4: `Jesus' wilderness temptation reveals Satan's strategy: twist Scripture to justify self-serving choices. Each response demonstrates Jesus' commitment to dependence on God rather than self-sufficiency. His hometown rejection in Nazareth fulfills the pattern that prophets find honor everywhere except among familiar people. The Isaiah passage He reads - proclaiming good news to the poor and freedom for prisoners - becomes His mission statement. His authority over demons and diseases confirms heaven's backing for earth's mission. How do you handle rejection when you're confident you're following God's direction?`
};

async function updateDevotionals() {
  try {
    // Update Matthew devotionals (days 6-20)
    for (const [chapter, content] of Object.entries(matthewDevotionals)) {
      const dayNumber = parseInt(chapter) - 7; // Matthew starts at day 6, so chapter 13 = day 6, etc.
      if (dayNumber >= 6 && dayNumber <= 20) {
        await pool.query(
          'UPDATE reading_plan_days SET devotional_content = $1 WHERE plan_id = 22 AND day_number = $2',
          [content, dayNumber]
        );
        console.log(`Updated day ${dayNumber} (Matthew ${chapter})`);
      }
    }

    // Update Luke devotionals (days start around 95+)
    let lukeStartDay = 95; // Approximate start of Luke in year-long plan
    for (const [chapter, content] of Object.entries(lukeDevotionals)) {
      const dayNumber = lukeStartDay + parseInt(chapter) - 1;
      await pool.query(
        'UPDATE reading_plan_days SET devotional_content = $1 WHERE plan_id = 22 AND day_number = $2',
        [content, dayNumber]
      );
      console.log(`Updated day ${dayNumber} (Luke ${chapter})`);
    }

    console.log('Devotional updates completed successfully');
  } catch (error) {
    console.error('Error updating devotionals:', error);
  } finally {
    await pool.end();
  }
}

updateDevotionals();