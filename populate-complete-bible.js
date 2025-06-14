/**
 * Comprehensive Bible Verse Population Script
 * Adds verses from all 66 books of the Bible to provide complete coverage
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Comprehensive Bible verses organized by book
const completeBibleVerses = [
  // Old Testament - Genesis
  { reference: "Genesis 1:1", text: "In the beginning God created the heavens and the earth.", category: "faith", tags: ["creation", "beginning", "faith"] },
  { reference: "Genesis 1:27", text: "So God created mankind in his own image, in the image of God he created them; male and female he created them.", category: "purpose", tags: ["identity", "creation", "purpose"] },
  { reference: "Genesis 8:22", text: "As long as the earth endures, seedtime and harvest, cold and heat, summer and winter, day and night will never cease.", category: "hope", tags: ["seasons", "faithfulness", "hope"] },
  { reference: "Genesis 28:15", text: "I am with you and will watch over you wherever you go, and I will bring you back to this land. I will not leave you until I have done what I have promised you.", category: "peace", tags: ["presence", "protection", "promises"] },
  { reference: "Genesis 50:20", text: "You intended to harm me, but God intended it for good to accomplish what is now being done, the saving of many lives.", category: "hope", tags: ["redemption", "purpose", "hope"] },

  // Exodus
  { reference: "Exodus 14:14", text: "The Lord will fight for you; you need only to be still.", category: "peace", tags: ["stillness", "trust", "peace"] },
  { reference: "Exodus 15:2", text: "The Lord is my strength and my defense; he has given me victory. He is my God, and I will praise him, my father's God, and I will exalt him.", category: "strength", tags: ["victory", "praise", "strength"] },
  { reference: "Exodus 20:12", text: "Honor your father and your mother, so that you may live long in the land the Lord your God is giving you.", category: "love", tags: ["family", "honor", "commandments"] },
  { reference: "Exodus 33:14", text: "The Lord replied, 'My Presence will go with you, and I will give you rest.'", category: "peace", tags: ["presence", "rest", "peace"] },

  // Leviticus
  { reference: "Leviticus 26:6", text: "I will grant peace in the land, and you will lie down and no one will make you afraid.", category: "peace", tags: ["security", "rest", "peace"] },

  // Numbers
  { reference: "Numbers 6:24-26", text: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you; the Lord turn his face toward you and give you peace.", category: "peace", tags: ["blessing", "grace", "peace"] },
  { reference: "Numbers 23:19", text: "God is not human, that he should lie, not a human being, that he should change his mind. Does he speak and then not act? Does he promise and not fulfill?", category: "faith", tags: ["faithfulness", "promises", "truth"] },

  // Deuteronomy
  { reference: "Deuteronomy 31:6", text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.", category: "strength", tags: ["courage", "presence", "strength"] },
  { reference: "Deuteronomy 31:8", text: "The Lord himself goes before you and will be with you; he will never leave you nor forsake you. Do not be afraid; do not be discouraged.", category: "strength", tags: ["courage", "presence", "encouragement"] },
  { reference: "Deuteronomy 7:9", text: "Know therefore that the Lord your God is God; he is the faithful God, keeping his covenant of love to a thousand generations of those who love him and keep his commandments.", category: "love", tags: ["faithfulness", "covenant", "love"] },

  // Joshua
  { reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", category: "strength", tags: ["courage", "presence", "strength"] },
  { reference: "Joshua 24:15", text: "But as for me and my household, we will serve the Lord.", category: "faith", tags: ["commitment", "family", "service"] },

  // Judges
  { reference: "Judges 6:12", text: "When the angel of the Lord appeared to Gideon, he said, 'The Lord is with you, mighty warrior.'", category: "strength", tags: ["identity", "calling", "strength"] },

  // Ruth
  { reference: "Ruth 1:16", text: "But Ruth replied, 'Don't urge me to leave you or to turn back from you. Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.'", category: "love", tags: ["loyalty", "commitment", "love"] },

  // 1 Samuel
  { reference: "1 Samuel 16:7", text: "But the Lord said to Samuel, 'Do not consider his appearance or his height, for I have rejected him. The Lord does not look at the things people look at. People look at the outward appearance, but the Lord looks at the heart.'", category: "purpose", tags: ["identity", "heart", "character"] },
  { reference: "1 Samuel 17:47", text: "All those gathered here will know that it is not by sword or spear that the Lord saves; for the battle is the Lord's, and he will give all of you into our hands.", category: "strength", tags: ["victory", "battle", "trust"] },

  // 2 Samuel
  { reference: "2 Samuel 22:29", text: "You, Lord, are my lamp; the Lord turns my darkness into light.", category: "hope", tags: ["light", "guidance", "hope"] },

  // 1 Kings
  { reference: "1 Kings 8:56", text: "Praise be to the Lord, who has given rest to his people Israel just as he promised. Not one word has failed of all the good promises he gave through his servant Moses.", category: "peace", tags: ["promises", "faithfulness", "rest"] },

  // 2 Kings
  { reference: "2 Kings 6:16", text: "'Don't be afraid,' the prophet answered. 'Those who are with us are more than those who are with them.'", category: "strength", tags: ["courage", "protection", "faith"] },

  // 1 Chronicles
  { reference: "1 Chronicles 16:11", text: "Look to the Lord and his strength; seek his face always.", category: "strength", tags: ["seeking", "dependence", "strength"] },
  { reference: "1 Chronicles 29:11", text: "Yours, Lord, is the greatness and the power and the glory and the majesty and the splendor, for everything in heaven and earth is yours. Yours, Lord, is the kingdom; you are exalted as head over all.", category: "worship", tags: ["majesty", "sovereignty", "worship"] },

  // 2 Chronicles
  { reference: "2 Chronicles 7:14", text: "If my people, who are called by my name, will humble themselves and pray and seek my face and turn from their wicked ways, then I will hear from heaven, and I will forgive their sin and will heal their land.", category: "forgiveness", tags: ["repentance", "healing", "prayer"] },
  { reference: "2 Chronicles 20:15", text: "He said: 'Listen, King Jehoshaphat and all who live in Judah and Jerusalem! This is what the Lord says to you: Do not be afraid or discouraged because of this vast army. For the battle is not yours, but God's.'", category: "strength", tags: ["courage", "battle", "trust"] },

  // Ezra
  { reference: "Ezra 8:22", text: "The gracious hand of our God is on everyone who looks to him, but his great anger is against all who forsake him.", category: "grace", tags: ["favor", "protection", "grace"] },

  // Nehemiah
  { reference: "Nehemiah 8:10", text: "Nehemiah said, 'Go and enjoy choice food and sweet drinks, and send some to those who have nothing prepared. This day is holy to our Lord. Do not grieve, for the joy of the Lord is your strength.'", category: "joy", tags: ["strength", "celebration", "joy"] },

  // Esther
  { reference: "Esther 4:14", text: "For if you remain silent at this time, relief and deliverance for the Jews will arise from another place, but you and your father's family will perish. And who knows but that you have come to your royal position for such a time as this?", category: "purpose", tags: ["calling", "timing", "purpose"] },

  // Job
  { reference: "Job 19:25", text: "I know that my redeemer lives, and that in the end he will stand on the earth.", category: "hope", tags: ["redemption", "eternal", "hope"] },
  { reference: "Job 23:10", text: "But he knows the way that I take; when he has tested me, I will come forth as gold.", category: "strength", tags: ["refinement", "testing", "growth"] },
  { reference: "Job 42:2", text: "I know that you can do all things; no purpose of yours can be thwarted.", category: "faith", tags: ["sovereignty", "power", "purpose"] },

  // Psalms (Major Psalms)
  { reference: "Psalm 1:1-2", text: "Blessed is the one who does not walk in step with the wicked or stand in the way that sinners take or sit in the company of mockers, but whose delight is in the law of the Lord, and who meditates on his law day and night.", category: "wisdom", tags: ["blessing", "meditation", "righteousness"] },
  { reference: "Psalm 8:3-4", text: "When I consider your heavens, the work of your fingers, the moon and the stars, which you have set in place, what is mankind that you are mindful of them, human beings that you care for them?", category: "purpose", tags: ["creation", "identity", "wonder"] },
  { reference: "Psalm 16:11", text: "You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand.", category: "joy", tags: ["guidance", "presence", "eternal"] },
  { reference: "Psalm 19:1", text: "The heavens declare the glory of God; the skies proclaim the work of his hands.", category: "worship", tags: ["creation", "glory", "testimony"] },
  { reference: "Psalm 25:4-5", text: "Show me your ways, Lord, teach me your paths. Guide me in your truth and teach me, for you are God my Savior, and my hope is in you all day long.", category: "wisdom", tags: ["guidance", "truth", "hope"] },
  { reference: "Psalm 27:1", text: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?", category: "strength", tags: ["courage", "salvation", "protection"] },
  { reference: "Psalm 46:1", text: "God is our refuge and strength, an ever-present help in trouble.", category: "strength", tags: ["refuge", "help", "presence"] },
  { reference: "Psalm 46:10", text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.", category: "peace", tags: ["stillness", "sovereignty", "trust"] },
  { reference: "Psalm 51:10", text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", category: "forgiveness", tags: ["purity", "renewal", "transformation"] },
  { reference: "Psalm 62:5", text: "Yes, my soul, find rest in God; my hope comes from him.", category: "peace", tags: ["rest", "hope", "soul"] },
  { reference: "Psalm 84:11", text: "For the Lord God is a sun and shield; the Lord bestows favor and honor; no good thing does he withhold from those whose walk is blameless.", category: "grace", tags: ["protection", "favor", "blessing"] },
  { reference: "Psalm 90:12", text: "Teach us to number our days, that we may gain a heart of wisdom.", category: "wisdom", tags: ["time", "perspective", "wisdom"] },
  { reference: "Psalm 100:5", text: "For the Lord is good and his love endures forever; his faithfulness continues through all generations.", category: "love", tags: ["goodness", "eternal", "faithfulness"] },
  { reference: "Psalm 103:2-3", text: "Praise the Lord, my soul, and forget not all his benefits—who forgives all your sins and heals all your diseases.", category: "gratitude", tags: ["forgiveness", "healing", "benefits"] },
  { reference: "Psalm 119:105", text: "Your word is a lamp for my feet, a light on my path.", category: "wisdom", tags: ["guidance", "scripture", "direction"] },
  { reference: "Psalm 121:1-2", text: "I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.", category: "strength", tags: ["help", "creator", "trust"] },
  { reference: "Psalm 139:13-14", text: "For you created my inmost being; you knit me together in my mother's womb. I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.", category: "purpose", tags: ["identity", "creation", "worth"] },
  { reference: "Psalm 145:18", text: "The Lord is near to all who call on him, to all who call on him in truth.", category: "peace", tags: ["presence", "prayer", "nearness"] },
  { reference: "Psalm 147:3", text: "He heals the brokenhearted and binds up their wounds.", category: "comfort", tags: ["healing", "restoration", "care"] },

  // Proverbs
  { reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", category: "wisdom", tags: ["trust", "guidance", "surrender"] },
  { reference: "Proverbs 4:23", text: "Above all else, guard your heart, for everything you do flows from it.", category: "wisdom", tags: ["heart", "protection", "character"] },
  { reference: "Proverbs 16:9", text: "In their hearts humans plan their course, but the Lord establishes their steps.", category: "purpose", tags: ["planning", "sovereignty", "guidance"] },
  { reference: "Proverbs 18:10", text: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", category: "strength", tags: ["protection", "safety", "refuge"] },
  { reference: "Proverbs 31:25", text: "She is clothed with strength and dignity; she can laugh at the days to come.", category: "strength", tags: ["dignity", "future", "confidence"] },

  // Ecclesiastes
  { reference: "Ecclesiastes 3:1", text: "There is a time for everything, and a season for every activity under the heavens.", category: "wisdom", tags: ["timing", "seasons", "purpose"] },
  { reference: "Ecclesiastes 3:11", text: "He has made everything beautiful in its time. He has also set eternity in the human heart; yet no one can fathom what God has done from beginning to end.", category: "purpose", tags: ["beauty", "eternity", "mystery"] },

  // Song of Songs
  { reference: "Song of Songs 2:11-12", text: "See! The winter is past; the rains are over and gone. Flowers appear on the earth; the season of singing has come, the cooing of doves is heard in our land.", category: "joy", tags: ["renewal", "seasons", "beauty"] },

  // Isaiah
  { reference: "Isaiah 9:6", text: "For to us a child is born, to us a son is given, and the government will be on his shoulders. And he will be called Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.", category: "hope", tags: ["messiah", "peace", "prophecy"] },
  { reference: "Isaiah 26:3", text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you.", category: "peace", tags: ["trust", "mind", "steadfast"] },
  { reference: "Isaiah 40:8", text: "The grass withers and the flowers fall, but the word of our God endures forever.", category: "faith", tags: ["eternal", "word", "endurance"] },
  { reference: "Isaiah 40:28", text: "Do you not know? Have you not heard? The Lord is the everlasting God, the Creator of the ends of the earth. He will not grow tired or weary, and his understanding no one can fathom.", category: "strength", tags: ["eternal", "creator", "unfailing"] },
  { reference: "Isaiah 43:2", text: "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you. When you walk through the fire, you will not be burned; the flames will not set you ablaze.", category: "strength", tags: ["protection", "presence", "trials"] },
  { reference: "Isaiah 53:5", text: "But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.", category: "forgiveness", tags: ["sacrifice", "healing", "peace"] },
  { reference: "Isaiah 55:8-9", text: "For my thoughts are not your thoughts, neither are your ways my ways, declares the Lord. As the heavens are higher than the earth, so are my ways higher than your ways and my thoughts than your thoughts.", category: "wisdom", tags: ["sovereignty", "mystery", "trust"] },
  { reference: "Isaiah 55:11", text: "So is my word that goes out from my mouth: It will not return to me empty, but will accomplish what I desire and achieve the purpose for which I sent it.", category: "faith", tags: ["word", "purpose", "accomplishment"] },
  { reference: "Isaiah 61:1", text: "The Spirit of the Sovereign Lord is on me, because the Lord has anointed me to proclaim good news to the poor. He has sent me to bind up the brokenhearted, to proclaim freedom for the captives and release from darkness for the prisoners.", category: "hope", tags: ["anointing", "good news", "freedom"] },

  // Jeremiah
  { reference: "Jeremiah 1:5", text: "Before I formed you in the womb I knew you, before you were born I set you apart; I appointed you as a prophet to the nations.", category: "purpose", tags: ["calling", "identity", "destiny"] },
  { reference: "Jeremiah 17:7-8", text: "But blessed is the one who trusts in the Lord, whose confidence is in him. They will be like a tree planted by the water that sends out its roots by the stream.", category: "strength", tags: ["trust", "stability", "growth"] },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", category: "hope", tags: ["plans", "future", "prosperity"] },
  { reference: "Jeremiah 31:3", text: "The Lord appeared to us in the past, saying: 'I have loved you with an everlasting love; I have drawn you with unfailing kindness.'", category: "love", tags: ["eternal", "kindness", "unfailing"] },
  { reference: "Jeremiah 33:3", text: "Call to me and I will answer you and tell you great and unsearchable things you do not know.", category: "wisdom", tags: ["prayer", "revelation", "knowledge"] },

  // Lamentations
  { reference: "Lamentations 3:22-23", text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.", category: "hope", tags: ["mercy", "renewal", "faithfulness"] },

  // Ezekiel
  { reference: "Ezekiel 36:26", text: "I will give you a new heart and put a new spirit in you; I will remove from you your heart of stone and give you a heart of flesh.", category: "forgiveness", tags: ["transformation", "renewal", "heart"] },

  // Daniel
  { reference: "Daniel 3:17-18", text: "If we are thrown into the blazing furnace, the God we serve is able to deliver us from it, and he will deliver us from Your Majesty's hand. But even if he does not, we want you to know, Your Majesty, that we will not serve your gods or worship the image of gold you have set up.", category: "faith", tags: ["courage", "commitment", "trust"] },

  // Hosea
  { reference: "Hosea 6:3", text: "Let us acknowledge the Lord; let us press on to acknowledge him. As surely as the sun rises, he will appear; he will come to us like the winter rains, like the spring rains that water the earth.", category: "faith", tags: ["pursuit", "faithfulness", "renewal"] },

  // Joel
  { reference: "Joel 2:28", text: "And afterward, I will pour out my Spirit on all people. Your sons and daughters will prophesy, your old men will dream dreams, your young men will see visions.", category: "hope", tags: ["spirit", "prophecy", "outpouring"] },

  // Amos
  { reference: "Amos 5:24", text: "But let justice roll on like a river, righteousness like a never-failing stream!", category: "justice", tags: ["righteousness", "flow", "consistency"] },

  // Obadiah
  { reference: "Obadiah 1:15", text: "The day of the Lord is near for all nations. As you have done, it will be done to you; your deeds will return upon your own head.", category: "justice", tags: ["accountability", "judgment", "consequences"] },

  // Jonah
  { reference: "Jonah 2:7", text: "When my life was ebbing away, I remembered you, Lord, and my prayer rose to you, to your holy temple.", category: "prayer", tags: ["remembrance", "desperation", "reach"] },

  // Micah
  { reference: "Micah 6:8", text: "He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.", category: "wisdom", tags: ["justice", "mercy", "humility"] },

  // Nahum
  { reference: "Nahum 1:7", text: "The Lord is good, a refuge in times of trouble. He cares for those who trust in him.", category: "strength", tags: ["goodness", "refuge", "care"] },

  // Habakkuk
  { reference: "Habakkuk 3:17-18", text: "Though the fig tree does not bud and there are no grapes on the vines, though the olive crop fails and the fields produce no food, though there are no sheep in the pen and no cattle in the stalls, yet I will rejoice in the Lord, I will be joyful in God my Savior.", category: "joy", tags: ["perseverance", "rejoicing", "trust"] },

  // Zephaniah
  { reference: "Zephaniah 3:17", text: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in his love he will no longer rebuke you, but will rejoice over you with singing.", category: "love", tags: ["delight", "warrior", "singing"] },

  // Haggai
  { reference: "Haggai 2:4", text: "But now be strong, Zerubbabel,' declares the Lord. 'Be strong, Joshua son of Jozadak, the high priest. Be strong, all you people of the land,' declares the Lord, 'and work. For I am with you,' declares the Lord Almighty.", category: "strength", tags: ["encouragement", "work", "presence"] },

  // Zechariah
  { reference: "Zechariah 4:6", text: "So he said to me, 'This is the word of the Lord to Zerubbabel: Not by might nor by power, but by my Spirit,' says the Lord Almighty.", category: "strength", tags: ["spirit", "power", "dependence"] },

  // Malachi
  { reference: "Malachi 3:6", text: "I the Lord do not change. So you, the descendants of Jacob, are not destroyed.", category: "faith", tags: ["unchanging", "preservation", "consistency"] },

  // New Testament - Matthew
  { reference: "Matthew 5:3", text: "Blessed are the poor in spirit, for theirs is the kingdom of heaven.", category: "hope", tags: ["blessing", "kingdom", "humility"] },
  { reference: "Matthew 5:4", text: "Blessed are those who mourn, for they will be comforted.", category: "comfort", tags: ["mourning", "blessing", "comfort"] },
  { reference: "Matthew 5:6", text: "Blessed are those who hunger and thirst for righteousness, for they will be filled.", category: "purpose", tags: ["righteousness", "satisfaction", "seeking"] },
  { reference: "Matthew 5:8", text: "Blessed are the pure in heart, for they will see God.", category: "purity", tags: ["heart", "vision", "blessing"] },
  { reference: "Matthew 5:14", text: "You are the light of the world. A town built on a hill cannot be hidden.", category: "purpose", tags: ["identity", "light", "influence"] },
  { reference: "Matthew 5:16", text: "In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", category: "purpose", tags: ["witness", "deeds", "glory"] },
  { reference: "Matthew 6:9-11", text: "This, then, is how you should pray: 'Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread.'", category: "prayer", tags: ["model", "provision", "kingdom"] },
  { reference: "Matthew 6:26", text: "Look at the birds of the air; they do not sow or reap or store away in barns, and yet your heavenly Father feeds them. Are you not much more valuable than they?", category: "peace", tags: ["worry", "provision", "value"] },
  { reference: "Matthew 6:33", text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", category: "purpose", tags: ["priorities", "kingdom", "provision"] },
  { reference: "Matthew 7:7", text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you.", category: "prayer", tags: ["asking", "seeking", "persistence"] },
  { reference: "Matthew 11:28", text: "Come to me, all you who are weary and burdened, and I will give you rest.", category: "peace", tags: ["rest", "burden", "invitation"] },
  { reference: "Matthew 16:24", text: "Then Jesus said to his disciples, 'Whoever wants to be my disciple must deny themselves and take up their cross and follow me.'", category: "faith", tags: ["discipleship", "sacrifice", "following"] },
  { reference: "Matthew 18:3", text: "And he said: 'Truly I tell you, unless you change and become like little children, you will never enter the kingdom of heaven.'", category: "humility", tags: ["childlike", "kingdom", "change"] },
  { reference: "Matthew 19:26", text: "Jesus looked at them and said, 'With man this is impossible, but with God all things are possible.'", category: "faith", tags: ["impossible", "possibility", "God"] },
  { reference: "Matthew 22:37-39", text: "Jesus replied: 'Love the Lord your God with all your heart and with all your soul and with all your mind.' This is the first and greatest commandment. And the second is like it: 'Love your neighbor as yourself.'", category: "love", tags: ["commandment", "heart", "neighbor"] },
  { reference: "Matthew 28:19-20", text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age.", category: "purpose", tags: ["commission", "discipleship", "presence"] },

  // Mark
  { reference: "Mark 9:23", text: "Everything is possible for one who believes.", category: "faith", tags: ["possibility", "belief", "power"] },
  { reference: "Mark 10:27", text: "Jesus looked at them and said, 'With man this is impossible, but not with God; all things are possible with God.'", category: "faith", tags: ["impossible", "possibility", "God"] },
  { reference: "Mark 11:24", text: "Therefore I tell you, whatever you ask for in prayer, believe that you have received it, and it will be yours.", category: "prayer", tags: ["belief", "receiving", "faith"] },
  { reference: "Mark 12:30-31", text: "Love the Lord your God with all your heart and with all your soul and with all your mind and with all your strength. The second is this: 'Love your neighbor as yourself.' There is no commandment greater than these.", category: "love", tags: ["greatest", "heart", "neighbor"] },

  // Luke
  { reference: "Luke 1:37", text: "For no word from God will ever fail.", category: "faith", tags: ["word", "unfailing", "promise"] },
  { reference: "Luke 6:31", text: "Do to others as you would have them do to you.", category: "love", tags: ["golden rule", "treatment", "reciprocity"] },
  { reference: "Luke 6:35", text: "But love your enemies, do good to them, and lend to them without expecting to get anything back. Then your reward will be great, and you will be children of the Most High, because he is kind to the ungrateful and wicked.", category: "love", tags: ["enemies", "kindness", "reward"] },
  { reference: "Luke 12:32", text: "Do not be afraid, little flock, for your Father has been pleased to give you the kingdom.", category: "hope", tags: ["fear", "kingdom", "gift"] },
  { reference: "Luke 18:27", text: "Jesus replied, 'What is impossible with man is possible with God.'", category: "faith", tags: ["impossible", "possibility", "God"] },

  // John
  { reference: "John 1:12", text: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God.", category: "purpose", tags: ["receiving", "identity", "children"] },
  { reference: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", category: "love", tags: ["sacrifice", "eternal", "belief"] },
  { reference: "John 8:32", text: "Then you will know the truth, and the truth will set you free.", category: "freedom", tags: ["truth", "knowledge", "liberation"] },
  { reference: "John 10:10", text: "The thief comes only to steal and kill and destroy; I have come that they may have life, and have it abundantly.", category: "life", tags: ["abundance", "purpose", "fullness"] },
  { reference: "John 14:1", text: "Do not let your hearts be troubled. You believe in God; believe also in me.", category: "peace", tags: ["trouble", "belief", "heart"] },
  { reference: "John 14:6", text: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'", category: "truth", tags: ["way", "access", "exclusive"] },
  { reference: "John 14:27", text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", category: "peace", tags: ["gift", "difference", "fear"] },
  { reference: "John 15:5", text: "I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit; apart from me you can do nothing.", category: "purpose", tags: ["connection", "fruit", "dependence"] },
  { reference: "John 15:13", text: "Greater love has no one than this: to lay down one's life for one's friends.", category: "love", tags: ["sacrifice", "friendship", "greatest"] },
  { reference: "John 16:33", text: "I have told you these things, so that in me you may have peace. In this world you will have trouble. But take heart! I have overcome the world.", category: "peace", tags: ["trouble", "overcoming", "victory"] },

  // Acts
  { reference: "Acts 1:8", text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.", category: "purpose", tags: ["power", "witness", "global"] },
  { reference: "Acts 2:38", text: "Peter replied, 'Repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins. And you will receive the gift of the Holy Spirit.'", category: "forgiveness", tags: ["repentance", "baptism", "spirit"] },
  { reference: "Acts 4:12", text: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved.", category: "salvation", tags: ["exclusive", "name", "rescue"] },
  { reference: "Acts 20:24", text: "However, I consider my life worth nothing to me; my only aim is to finish the race and complete the task the Lord Jesus has given me—the task of testifying to the good news of God's grace.", category: "purpose", tags: ["mission", "grace", "completion"] },

  // Romans  
  { reference: "Romans 1:16", text: "For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes: first to the Jew, then to the Gentile.", category: "faith", tags: ["gospel", "power", "salvation"] },
  { reference: "Romans 3:23", text: "For all have sinned and fall short of the glory of God.", category: "forgiveness", tags: ["sin", "universal", "need"] },
  { reference: "Romans 5:8", text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us.", category: "love", tags: ["demonstration", "sacrifice", "timing"] },
  { reference: "Romans 6:23", text: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord.", category: "salvation", tags: ["wages", "gift", "eternal"] },
  { reference: "Romans 8:1", text: "Therefore, there is now no condemnation for those who are in Christ Jesus.", category: "forgiveness", tags: ["condemnation", "freedom", "position"] },
  { reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", category: "hope", tags: ["purpose", "good", "calling"] },
  { reference: "Romans 10:9", text: "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.", category: "salvation", tags: ["declaration", "belief", "resurrection"] },
  { reference: "Romans 12:2", text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind. Then you will be able to test and approve what God's will is—his good, pleasing and perfect will.", category: "wisdom", tags: ["transformation", "renewal", "will"] },
  { reference: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.", category: "hope", tags: ["overflow", "trust", "spirit"] },

  // 1 Corinthians
  { reference: "1 Corinthians 10:13", text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.", category: "strength", tags: ["temptation", "endurance", "escape"] },
  { reference: "1 Corinthians 13:4-7", text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonor others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs. Love does not delight in evil but rejoices with the truth. It always protects, always trusts, always hopes, always perseveres.", category: "love", tags: ["characteristics", "patience", "perseverance"] },
  { reference: "1 Corinthians 15:57", text: "But thanks be to God! He gives us the victory through our Lord Jesus Christ.", category: "strength", tags: ["victory", "thanksgiving", "triumph"] },
  { reference: "1 Corinthians 16:14", text: "Do everything in love.", category: "love", tags: ["everything", "motivation", "foundation"] },

  // 2 Corinthians
  { reference: "2 Corinthians 1:3-4", text: "Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort, who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God.", category: "comfort", tags: ["compassion", "troubles", "ministry"] },
  { reference: "2 Corinthians 4:16-17", text: "Therefore we do not lose heart. Though outwardly we are wasting away, yet inwardly we are being renewed day by day. For our light and momentary troubles are achieving for us an eternal glory that far outweighs them all.", category: "hope", tags: ["renewal", "eternal", "perspective"] },
  { reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!", category: "forgiveness", tags: ["new creation", "transformation", "identity"] },
  { reference: "2 Corinthians 9:8", text: "And God is able to bless you abundantly, so that in all things at all times, having all that you need, you will abound in every good work.", category: "grace", tags: ["abundance", "provision", "good works"] },
  { reference: "2 Corinthians 12:9", text: "But he said to me, 'My grace is sufficient for you, for my power is made perfect in weakness.' Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me.", category: "strength", tags: ["grace", "weakness", "power"] },

  // Galatians
  { reference: "Galatians 2:20", text: "I have been crucified with Christ and I no longer live, but Christ lives in me. The life I now live in the body, I live by faith in the Son of God, who loved me and gave himself for me.", category: "purpose", tags: ["crucified", "indwelling", "faith"] },
  { reference: "Galatians 5:22-23", text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.", category: "purpose", tags: ["fruit", "spirit", "character"] },
  { reference: "Galatians 6:9", text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", category: "strength", tags: ["perseverance", "harvest", "endurance"] },

  // Ephesians
  { reference: "Ephesians 1:3", text: "Praise be to the God and Father of our Lord Jesus Christ, who has blessed us in the heavenly realms with every spiritual blessing in Christ.", category: "gratitude", tags: ["blessing", "heavenly", "spiritual"] },
  { reference: "Ephesians 2:8-9", text: "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.", category: "grace", tags: ["salvation", "gift", "not works"] },
  { reference: "Ephesians 2:10", text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.", category: "purpose", tags: ["handiwork", "prepared", "good works"] },
  { reference: "Ephesians 3:20", text: "Now to him who is able to do immeasurably more than all we ask or imagine, according to his power that is at work within us.", category: "hope", tags: ["immeasurably", "power", "beyond"] },
  { reference: "Ephesians 4:32", text: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", category: "forgiveness", tags: ["kindness", "compassion", "modeling"] },
  { reference: "Ephesians 6:10", text: "Finally, be strong in the Lord and in his mighty power.", category: "strength", tags: ["mighty", "source", "dependence"] },

  // Philippians
  { reference: "Philippians 1:6", text: "Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.", category: "hope", tags: ["completion", "confidence", "ongoing"] },
  { reference: "Philippians 3:13-14", text: "Brothers and sisters, I do not consider myself yet to have taken hold of it. But one thing I do: Forgetting what is behind and straining toward what is ahead, I press on toward the goal to win the prize for which God has called me heavenward in Christ Jesus.", category: "purpose", tags: ["pressing on", "goal", "calling"] },
  { reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.", category: "peace", tags: ["anxiety", "prayer", "peace"] },
  { reference: "Philippians 4:8", text: "Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.", category: "wisdom", tags: ["thinking", "virtue", "focus"] },
  { reference: "Philippians 4:13", text: "I can do all this through him who gives me strength.", category: "strength", tags: ["ability", "source", "empowerment"] },
  { reference: "Philippians 4:19", text: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.", category: "peace", tags: ["provision", "needs", "riches"] },

  // Colossians
  { reference: "Colossians 1:16-17", text: "For in him all things were created: things in heaven and on earth, visible and invisible, whether thrones or powers or rulers or authorities; all things have been created through him and for him. He is before all things, and in him all things hold together.", category: "worship", tags: ["creation", "supremacy", "sustaining"] },
  { reference: "Colossians 3:2", text: "Set your minds on things above, not on earthly things.", category: "wisdom", tags: ["mindset", "heavenly", "focus"] },
  { reference: "Colossians 3:12", text: "Therefore, as God's chosen people, holy and dearly loved, clothe yourselves with compassion, kindness, humility, gentleness and patience.", category: "love", tags: ["chosen", "character", "clothing"] },
  { reference: "Colossians 3:23", text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", category: "purpose", tags: ["work", "heart", "audience"] },

  // 1 Thessalonians
  { reference: "1 Thessalonians 5:16-18", text: "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus.", category: "joy", tags: ["always", "continually", "circumstances"] },

  // 2 Thessalonians
  { reference: "2 Thessalonians 3:3", text: "But the Lord is faithful, and he will strengthen you and protect you from the evil one.", category: "strength", tags: ["faithfulness", "protection", "evil"] },

  // 1 Timothy
  { reference: "1 Timothy 4:12", text: "Don't let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity.", category: "purpose", tags: ["youth", "example", "believers"] },
  { reference: "1 Timothy 6:6", text: "But godliness with contentment is great gain.", category: "wisdom", tags: ["contentment", "godliness", "gain"] },

  // 2 Timothy
  { reference: "2 Timothy 1:7", text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", category: "strength", tags: ["spirit", "timid", "power"] },
  { reference: "2 Timothy 3:16-17", text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.", category: "wisdom", tags: ["scripture", "equipped", "training"] },

  // Titus
  { reference: "Titus 3:5", text: "He saved us through the washing of rebirth and renewal by the Holy Spirit.", category: "forgiveness", tags: ["salvation", "rebirth", "renewal"] },

  // Philemon
  { reference: "Philemon 1:6", text: "I pray that your partnership with us in the faith may be effective in deepening your understanding of every good thing we share for the sake of Christ.", category: "wisdom", tags: ["partnership", "understanding", "good"] },

  // Hebrews
  { reference: "Hebrews 4:12", text: "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart.", category: "wisdom", tags: ["word", "active", "penetrating"] },
  { reference: "Hebrews 10:24-25", text: "And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching.", category: "love", tags: ["spurring", "community", "encouragement"] },
  { reference: "Hebrews 11:1", text: "Now faith is confidence in what we hope for and assurance about what we do not see.", category: "faith", tags: ["confidence", "hope", "unseen"] },
  { reference: "Hebrews 12:1-2", text: "Therefore, since we are surrounded by such a great cloud of witnesses, let us throw off everything that hinders and the sin that so easily entangles. And let us run with perseverance the race marked out for us, fixing our eyes on Jesus, the pioneer and perfecter of faith.", category: "strength", tags: ["perseverance", "race", "fixing eyes"] },
  { reference: "Hebrews 13:5", text: "Keep your lives free from the love of money and be content with what you have, because God has said, 'Never will I leave you; never will I forsake you.'", category: "peace", tags: ["contentment", "presence", "money"] },
  { reference: "Hebrews 13:8", text: "Jesus Christ is the same yesterday and today and forever.", category: "faith", tags: ["unchanging", "eternal", "consistency"] },

  // James
  { reference: "James 1:2-3", text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.", category: "joy", tags: ["trials", "testing", "perseverance"] },
  { reference: "James 1:5", text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.", category: "wisdom", tags: ["asking", "generously", "fault"] },
  { reference: "James 1:17", text: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows.", category: "gratitude", tags: ["gifts", "above", "unchanging"] },
  { reference: "James 4:8", text: "Come near to God and he will come near to you. Wash your hands, you sinners, and purify your hearts, you double-minded.", category: "wisdom", tags: ["nearness", "purification", "hearts"] },

  // 1 Peter
  { reference: "1 Peter 1:3", text: "Praise be to the God and Father of our Lord Jesus Christ! In his great mercy he has given us new birth into a living hope through the resurrection of Jesus Christ from the dead.", category: "hope", tags: ["mercy", "new birth", "living hope"] },
  { reference: "1 Peter 2:9", text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession, that you may declare the praises of him who called you out of darkness into his wonderful light.", category: "purpose", tags: ["chosen", "priesthood", "light"] },
  { reference: "1 Peter 4:8", text: "Above all, love each other deeply, because love covers over a multitude of sins.", category: "love", tags: ["deeply", "covers", "multitude"] },
  { reference: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you.", category: "peace", tags: ["anxiety", "casting", "cares"] },

  // 2 Peter
  { reference: "2 Peter 1:3", text: "His divine power has given us everything we need for a godly life through our knowledge of him who called us by his own glory and goodness.", category: "strength", tags: ["divine power", "everything", "godly life"] },
  { reference: "2 Peter 3:8", text: "But do not forget this one thing, dear friends: With the Lord a day is like a thousand years, and a thousand years are like a day.", category: "wisdom", tags: ["time", "perspective", "eternal"] },

  // 1 John
  { reference: "1 John 1:9", text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.", category: "forgiveness", tags: ["confession", "faithful", "purification"] },
  { reference: "1 John 3:1", text: "See what great love the Father has lavished on us, that we should be called children of God! And that is what we are! The reason the world does not know us is that it did not know him.", category: "love", tags: ["lavished", "children", "identity"] },
  { reference: "1 John 4:7", text: "Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God.", category: "love", tags: ["source", "born", "knowing"] },
  { reference: "1 John 4:16", text: "And so we know and rely on the love God has for us. God is love. Whoever lives in love lives in God, and God in them.", category: "love", tags: ["rely", "essence", "dwelling"] },
  { reference: "1 John 4:18", text: "There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love.", category: "peace", tags: ["fear", "perfect love", "punishment"] },
  { reference: "1 John 5:4", text: "For everyone born of God overcomes the world. This is the victory that has overcome the world, even our faith.", category: "strength", tags: ["overcomes", "victory", "faith"] },

  // 2 John
  { reference: "2 John 1:6", text: "And this is love: that we walk in obedience to his commands. As you have heard from the beginning, his command is that you walk in love.", category: "love", tags: ["obedience", "commands", "walk"] },

  // 3 John
  { reference: "3 John 1:4", text: "I have no greater joy than to hear that my children are walking in the truth.", category: "joy", tags: ["greatest joy", "children", "truth"] },

  // Jude
  { reference: "Jude 1:24", text: "To him who is able to keep you from stumbling and to present you before his glorious presence without fault and with great joy.", category: "strength", tags: ["keep", "stumbling", "presence"] },

  // Revelation
  { reference: "Revelation 3:20", text: "Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in and eat with that person, and they with me.", category: "purpose", tags: ["invitation", "door", "fellowship"] },
  { reference: "Revelation 21:4", text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.", category: "hope", tags: ["tears", "no more", "new order"] },
  { reference: "Revelation 22:13", text: "I am the Alpha and the Omega, the First and the Last, the Beginning and the End.", category: "worship", tags: ["eternal", "beginning", "end"] }
];

async function populateCompleteBible() {
  try {
    console.log('🔄 Starting comprehensive Bible verse population...');
    
    // Clear existing verses (if requested)
    console.log('📊 Current verse count before population...');
    const currentCount = await sql`SELECT COUNT(*) as count FROM bible_verses`;
    console.log(`Current verses in database: ${currentCount[0].count}`);
    
    // Insert new verses in batches for better performance
    const batchSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < completeBibleVerses.length; i += batchSize) {
      const batch = completeBibleVerses.slice(i, i + batchSize);
      
      const insertPromises = batch.map(verse => {
        const book = verse.reference.split(' ')[0];
        const chapterVerse = verse.reference.split(' ').slice(1).join(' ');
        const chapter = chapterVerse.split(':')[0];
        const verseNum = chapterVerse.split(':')[1] || '1';
        
        return sql`
          INSERT INTO bible_verses (reference, book, chapter, verse, text, translation, category, topic_tags, ai_summary)
          VALUES (
            ${verse.reference}, 
            ${book},
            ${parseInt(chapter) || 1},
            ${verseNum},
            ${verse.text}, 
            'NIV',
            ${verse.category}, 
            ${verse.tags}, 
            ${`This ${verse.category} verse from ${verse.reference} provides ${verse.tags[0]} and spiritual guidance.`}
          )
          ON CONFLICT (reference, translation) DO NOTHING
        `;
      });
      
      await Promise.all(insertPromises);
      insertedCount += batch.length;
      console.log(`✅ Processed batch ${Math.ceil((i + batchSize) / batchSize)} - ${insertedCount}/${completeBibleVerses.length} verses`);
    }
    
    // Final count verification
    const finalCount = await sql`SELECT COUNT(*) as count FROM bible_verses`;
    console.log(`\n🎉 Bible verse population completed!`);
    console.log(`📈 Total verses in database: ${finalCount[0].count}`);
    console.log(`📚 Coverage: All 66 books of the Bible represented`);
    console.log(`🎯 Categories: faith, hope, love, peace, strength, wisdom, comfort, forgiveness, joy, purpose, gratitude`);
    
    // Show sample by book
    const sampleVerses = await sql`
      SELECT reference, category 
      FROM bible_verses 
      WHERE reference LIKE 'Genesis%' 
         OR reference LIKE 'Psalm%' 
         OR reference LIKE 'Matthew%' 
         OR reference LIKE 'John%'
         OR reference LIKE 'Romans%'
         OR reference LIKE 'Revelation%'
      ORDER BY reference 
      LIMIT 10
    `;
    
    console.log('\n📖 Sample verses from major books:');
    sampleVerses.forEach(verse => {
      console.log(`  • ${verse.reference} (${verse.category})`);
    });
    
    return {
      success: true,
      totalVerses: finalCount[0].count,
      newlyAdded: completeBibleVerses.length,
      coverage: "All 66 books"
    };
    
  } catch (error) {
    console.error('❌ Error populating Bible verses:', error);
    return { success: false, error: error.message };
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  populateCompleteBible()
    .then(result => {
      if (result.success) {
        console.log('\n✨ Complete Bible population successful!');
        process.exit(0);
      } else {
        console.error('\n💥 Population failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { populateCompleteBible };