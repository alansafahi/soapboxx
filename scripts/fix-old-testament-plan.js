import { db } from '../server/db.js';
import { readingPlanDays } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';

// Fix Old Testament in a Year plan with authentic scripture
async function fixOldTestamentPlan() {
  console.log('Starting Old Testament plan scripture replacement...');
  
  const genesisUpdates = [
    {
      day: 1,
      reference: 'Genesis 1:1-31',
      scripture: 'In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters. And God said, "Let there be light," and there was light. God saw that the light was good, and he separated the light from the darkness. Then God said, "Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground." So God created mankind in his own image, in the image of God he created them; male and female he created them.',
      devotional: 'Genesis 1 establishes God as the sovereign Creator who brings order from chaos and beauty from emptiness. The phrase "And God said" appears repeatedly, demonstrating the power of divine speech to create reality. Humans are uniquely created "in God\'s image," distinguishing us from all other creation and giving us inherent dignity and purpose. The pattern of God seeing His creation as "good" reveals His delight in what He has made, including us. This chapter reminds us that we are not accidents but intentional creations of a loving God who desires relationship with us.'
    },
    {
      day: 2,
      reference: 'Genesis 2:4-25',
      scripture: 'This is the account of the heavens and the earth when they were created, when the Lord God made the earth and the heavens. Then the Lord God formed a man from the dust of the ground and breathed into his nostrils the breath of life, and the man became a living being. The Lord God said, "It is not good for the man to be alone. I will make a helper suitable for him." So the Lord God caused the man to fall into a deep sleep; and while he was sleeping, he took one of the man\'s ribs and then closed up the place with flesh. Then the Lord God made a woman from the rib he had taken out of the man, and he brought her to the man.',
      devotional: 'Genesis 2 provides an intimate portrayal of humanity\'s creation, showing God\'s personal involvement in forming Adam from dust and breathing life into him. The Garden of Eden represents God\'s perfect provision and design for human flourishing. God\'s declaration that "it is not good for the man to be alone" establishes the importance of human relationships and community. The creation of woman as a "helper suitable for him" doesn\'t imply inferiority but partnership and complementarity. This chapter reveals God\'s heart for intimate relationship with humanity and His desire for us to experience love, purpose, and belonging.'
    },
    {
      day: 3,
      reference: 'Genesis 3:1-24',
      scripture: 'Now the serpent was more crafty than any of the wild animals the Lord God had made. He said to the woman, "Did God really say, \'You must not eat from any tree in the garden\'?" When the woman saw that the fruit of the tree was good for food and pleasing to the eyes, and also desirable for gaining wisdom, she took some and ate it. She also gave some to her husband, who was with her, and he ate it. But the Lord God called to the man, "Where are you?" And I will put enmity between you and the woman, and between your offspring and hers; he will crush your head, and you will strike his heel.',
      devotional: 'Genesis 3 records humanity\'s tragic fall from innocence through disobedience to God\'s command. The serpent\'s temptation begins with questioning God\'s word ("Did God really say?"), a pattern that continues today. Adam and Eve\'s choice to eat the forbidden fruit represents humanity\'s desire to be autonomous from God and determine right and wrong for ourselves. However, even in judgment, God\'s mercy appears - He provides clothing for them and promises a future deliverer who will defeat evil. This chapter explains the origin of human suffering while pointing toward God\'s redemptive plan that culminates in Christ.'
    },
    {
      day: 4,
      reference: 'Genesis 4:1-26',
      scripture: 'Adam made love to his wife Eve, and she became pregnant and gave birth to Cain. Later she gave birth to his brother Abel. Now Abel kept flocks, and Cain worked the soil. In the course of time Cain brought some of the fruits of the soil as an offering to the Lord. And Abel also brought an offering—fat portions from some of the firstborn of his flock. The Lord looked with favor on Abel and his offering, but on Cain and his offering he did not look with favor. So Cain was very angry, and his face was downcast. Then the Lord said to Cain, "Why are you angry? Why is your face downcast? If you do what is right, will you not be accepted?"',
      devotional: 'The story of Cain and Abel illustrates how sin\'s consequences spread through human relationships. Both brothers bring offerings to God, but their hearts differ - Abel offers his best while Cain\'s offering lacks excellence or proper motivation. God\'s acceptance of Abel\'s offering reveals that He looks beyond external actions to internal attitudes. Cain\'s angry response leads to humanity\'s first murder, showing how unchecked jealousy and pride can result in devastating consequences. God\'s question "Where is your brother?" echoes His earlier question to Adam, showing His continued pursuit of relationship even with fallen humanity. This chapter reminds us that worship must flow from sincere hearts and that we are indeed our brother\'s keeper.'
    },
    {
      day: 5,
      reference: 'Genesis 5:1-32',
      scripture: 'This is the written account of Adam\'s family line. When God created mankind, he made them in the likeness of God. He created them male and female and blessed them. And he named them "Mankind" when they were created. When Adam had lived 130 years, he had a son in his own likeness, in his own image; and he named him Seth. By faith Enoch was taken from this life, so that he did not experience death: "He could not be found, because God had taken him away." For before he was taken, he was commended as one who pleased God.',
      devotional: 'Genesis 5 presents the genealogy from Adam to Noah, emphasizing both human mortality and God\'s faithfulness across generations. The repeated phrase "and then he died" underscores the reality of death as sin\'s consequence, yet God\'s image remains in humanity despite the fall. Enoch stands out as one who "walked faithfully with God" and was taken up without experiencing death, demonstrating that intimate relationship with God can transcend even death\'s power. The longevity of these early patriarchs reflects a world closer to original perfection. This chapter reminds us that while death is real, those who walk with God find eternal significance that outlasts earthly life.'
    }
  ];

  // Update the first 5 days
  for (const update of genesisUpdates) {
    await db
      .update(readingPlanDays)
      .set({
        scriptureReference: update.reference,
        scriptureText: update.scripture,
        devotionalContent: update.devotional
      })
      .where(and(
        eq(readingPlanDays.planId, 23),
        eq(readingPlanDays.dayNumber, update.day)
      ));
    
    console.log(`Updated Day ${update.day}: ${update.reference}`);
  }
  
  console.log('Genesis 1-5 completed successfully!');
}

fixOldTestamentPlan().catch(console.error);