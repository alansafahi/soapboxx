import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { Play, Square, Clock, Headphones, Pause, Book, Heart, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface AudioRoutine {
  id: number;
  name: string;
  description: string;
  totalDuration: number;
  category: string;
  autoAdvance: boolean;
  steps: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    duration: number;
    voiceSettings: {
      voice: string;
      speed: number;
      musicBed: string;
    };
  }>;
}

interface DevotionalRoutine {
  id: number;
  title: string;
  moodTag: string;
  duration: number;
  segments: {
    openingReflection: string;
    scriptureReading: {
      reference: string;
      text: string;
    };
    guidedPrayer: string;
    closingBlessing: string;
  };
}

export default function AudioRoutines() {
  const [playingRoutine, setPlayingRoutine] = useState<number | null>(null);
  const [playingDevotional, setPlayingDevotional] = useState<number | null>(null);
  const [devotionalAudio, setDevotionalAudio] = useState<HTMLAudioElement | null>(null);
  const [devotionalProgress, setDevotionalProgress] = useState(0);
  const [currentDevotionalSegment, setCurrentDevotionalSegment] = useState(0);
  const [currentAudioContext, setCurrentAudioContext] = useState<AudioContext | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [backgroundMusicType, setBackgroundMusicType] = useState('gentle-chords');
  const [isPaused, setIsPaused] = useState(false);
  const [autoPauseTimeout, setAutoPauseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isInSilencePeriod, setIsInSilencePeriod] = useState(false);
  const [expandedMoodCategories, setExpandedMoodCategories] = useState<Record<string, boolean>>({
    "Stress & Anxiety": true,
    "Gratitude & Joy": false,
    "Spiritual Growth": false,
    "Difficult Emotions": false,
    "Life Challenges": false
  });
  const { toast } = useToast();

  // Toggle function for mood categories
  const toggleMoodCategory = (category: string) => {
    setExpandedMoodCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Mood category definitions with emojis and descriptions
  const moodCategories = {
    "Stress & Anxiety": {
      emoji: "😰",
      description: "Find peace and calm in overwhelming moments",
      moods: ["Anxious", "Overwhelmed", "Stressed"]
    },
    "Gratitude & Joy": {
      emoji: "🙏",
      description: "Celebrate blessings and cultivate thankfulness",
      moods: ["Grateful", "Joyful", "Celebrating"]
    },
    "Spiritual Growth": {
      emoji: "🌱",
      description: "Deepen your faith and spiritual understanding",
      moods: ["Seeking Guidance", "Studying", "Growing"]
    },
    "Difficult Emotions": {
      emoji: "💔",
      description: "Process challenging feelings with grace",
      moods: ["Feeling Broken", "Guilty", "Angry", "Afraid"]
    },
    "Life Challenges": {
      emoji: "⏳",
      description: "Navigate life's transitions and challenges",
      moods: ["Waiting", "Lonely", "Discouraged"]
    }
  };

  // Function to categorize devotional routines by mood
  const categorizeDevotionalsByMood = () => {
    const categorized: Record<string, DevotionalRoutine[]> = {};
    
    Object.keys(moodCategories).forEach(category => {
      categorized[category] = devotionalRoutines.filter(routine => 
        moodCategories[category as keyof typeof moodCategories].moods.includes(routine.moodTag)
      );
    });
    
    return categorized;
  };

  // Comprehensive Devotional Routines covering all emotional and spiritual needs
  const devotionalRoutines: DevotionalRoutine[] = [
    {
      id: 1,
      title: "Peace in the Chaos",
      moodTag: "Anxious",
      duration: 300,
      segments: {
        openingReflection: "If your heart is racing or your mind is running in circles, pause with me for a moment. You're not alone. God invites us to bring our burdens to Him—not when we feel perfect, but especially when we're overwhelmed.",
        scriptureReading: {
          reference: "Philippians 4:6–7",
          text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God will guard your hearts and your minds in Christ Jesus."
        },
        guidedPrayer: "Lord, I give You the worries I can't fix, the outcomes I can't control, and the fears that weigh heavy on my heart. Replace my anxiety with Your peace. Help me breathe deeply, trust fully, and walk calmly through today. In Jesus' name, Amen.",
        closingBlessing: "You don't need all the answers today—just the next step. God walks with you, even now. Take this peace with you into whatever comes next."
      }
    },
    {
      id: 2,
      title: "The Gift of Right Now",
      moodTag: "Grateful",
      duration: 300,
      segments: {
        openingReflection: "Gratitude opens our eyes to how deeply we are loved. Let's take a moment to thank God—not just for what's perfect, but for what's present.",
        scriptureReading: {
          reference: "Psalm 107:1",
          text: "Give thanks to the Lord, for he is good; his love endures forever."
        },
        guidedPrayer: "Father, thank You—for breath in my lungs, for grace that meets me each morning, for people who love me, and even for the lessons hidden in difficulty. Teach me to live open-handed, in awe of Your goodness. Amen.",
        closingBlessing: "Gratitude is more than a feeling—it's a rhythm of the soul. Keep counting blessings today. You'll be surprised how many there are."
      }
    },
    {
      id: 3,
      title: "Be Still and Know",
      moodTag: "Seeking Guidance",
      duration: 300,
      segments: {
        openingReflection: "In a world that never stops moving, your soul is searching for stillness. Here, in this quiet moment, you can find the peace that your heart has been longing for.",
        scriptureReading: {
          reference: "Psalm 46:10",
          text: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth."
        },
        guidedPrayer: "God of peace, quiet the noise around me and within me. Help me rest in Your presence, knowing that You are in control. Fill this stillness with Your love and let Your peace settle deep in my soul. Amen.",
        closingBlessing: "Peace isn't the absence of storms—it's the presence of God in the midst of them. Carry this stillness with you wherever you go."
      }
    },
    {
      id: 4,
      title: "Strength for the Journey",
      moodTag: "Going Through Challenges",
      duration: 300,
      segments: {
        openingReflection: "Every mountain you're climbing, every valley you're walking through—God sees it all. You are not forgotten, and you are stronger than you know.",
        scriptureReading: {
          reference: "Isaiah 40:31",
          text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."
        },
        guidedPrayer: "Lord, when the path feels too steep and the burden too heavy, remind me that Your strength is made perfect in my weakness. Give me courage for today and hope for tomorrow. I trust You with every step. Amen.",
        closingBlessing: "You are braver than you believe and stronger than you feel. God's strength flows through you, especially in your weakest moments."
      }
    },
    {
      id: 5,
      title: "Overflowing Joy",
      moodTag: "Celebrating Joy",
      duration: 300,
      segments: {
        openingReflection: "Joy is bursting in your heart today, and that's something worth celebrating. This happiness isn't just a feeling—it's a gift from God to be treasured and shared.",
        scriptureReading: {
          reference: "Psalm 126:3",
          text: "The Lord has done great things for us, and we are filled with joy."
        },
        guidedPrayer: "Heavenly Father, thank You for this joy that fills my heart. Help me remember this feeling when darker days come, and show me how to share this light with others who need it. May my joy be a reflection of Your goodness. Amen.",
        closingBlessing: "Let this joy overflow into every corner of your life. When you share God's joy, it multiplies and touches everyone around you."
      }
    },
    {
      id: 6,
      title: "Light for the Path",
      moodTag: "Seeking Guidance",
      duration: 300,
      segments: {
        openingReflection: "When you don't know which way to turn, remember that God delights in guiding His children. Your uncertainty is not a sign of weakness—it's an invitation to trust.",
        scriptureReading: {
          reference: "Proverbs 3:5-6",
          text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."
        },
        guidedPrayer: "Father, I lay my confusion and questions before You. Show me the way forward, even if it's just the next small step. Help me trust Your timing and Your wisdom more than my own understanding. Lead me in Your truth. Amen.",
        closingBlessing: "God's guidance often comes not as a bright light in the distance, but as a gentle lamp for your next step. Trust Him with the journey."
      }
    },
    {
      id: 7,
      title: "Held in Love",
      moodTag: "Processing Loss",
      duration: 300,
      segments: {
        openingReflection: "Loss leaves a sacred space in our hearts—one that can never be filled by anything else. In this tender moment, know that your grief is held with the deepest compassion.",
        scriptureReading: {
          reference: "Psalm 34:18",
          text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
        },
        guidedPrayer: "God of all comfort, hold my broken heart gently in Your hands. Help me honor what I've lost while still choosing to hope. Be especially near to me in the darkest moments, and remind me that love never truly ends. Amen.",
        closingBlessing: "Your grief is a testament to how deeply you have loved. That love remains, and God holds both your sorrow and your precious memories with tender care."
      }
    },
    {
      id: 8,
      title: "Tomorrow's Promise",
      moodTag: "Looking Forward",
      duration: 300,
      segments: {
        openingReflection: "Hope is rising in your heart, and with it comes the beautiful possibility of new beginnings. God has good plans for you, and your future is bright with His promises.",
        scriptureReading: {
          reference: "Jeremiah 29:11",
          text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future."
        },
        guidedPrayer: "Lord, thank You for the hope You've placed in my heart. Help me step boldly into the future You have prepared for me, trusting that Your plans are always good. Guide my steps and give me courage for what lies ahead. Amen.",
        closingBlessing: "Your future is written in God's love and sealed with His promises. Walk forward with confidence—the best is yet to come."
      }
    },
    {
      id: 9,
      title: "Held in Sorrow",
      moodTag: "Sad",
      duration: 300,
      segments: {
        openingReflection: "Sadness is not your enemy—it's evidence of a heart that feels deeply. In this tender space, know that God grieves with you and holds every tear as precious.",
        scriptureReading: {
          reference: "Psalm 56:8",
          text: "You keep track of all my sorrows. You have collected all my tears in your bottle. You have recorded each one in your book."
        },
        guidedPrayer: "Compassionate God, sit with me in this sadness. Help me feel Your presence even when joy feels far away. Remind me that this heaviness won't last forever, and that You are working even in my sorrow. Amen.",
        closingBlessing: "Your tears are not wasted—they water the ground where new hope will grow. God sees every one and walks with you through this valley."
      }
    },
    {
      id: 10,
      title: "Rest for the Weary",
      moodTag: "Overwhelmed",
      duration: 300,
      segments: {
        openingReflection: "The weight you're carrying is too much for one person to bear alone. Come here, lay it all down, and let God remind you that you don't have to carry everything at once.",
        scriptureReading: {
          reference: "Matthew 11:28-30",
          text: "Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls."
        },
        guidedPrayer: "Jesus, I'm tired of trying to manage everything on my own. Take this overwhelming burden from my shoulders and show me how to live at Your pace. Teach me when to say yes and when to rest. Fill me with Your peace. Amen.",
        closingBlessing: "You don't have to have it all figured out today. Rest in God's gentle rhythm and trust Him with what you cannot control."
      }
    },
    {
      id: 11,
      title: "Never Alone",
      moodTag: "Lonely",
      duration: 300,
      segments: {
        openingReflection: "Loneliness whispers lies about being forgotten, but the truth is this: you are known, you are loved, and you are never truly alone. God's presence fills every empty space.",
        scriptureReading: {
          reference: "Deuteronomy 31:6",
          text: "Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you."
        },
        guidedPrayer: "God of companionship, fill this loneliness with the warmth of Your presence. Help me feel connected to You and open my heart to the community You have for me. Remind me that I am never forgotten by You. Amen.",
        closingBlessing: "You are surrounded by love that you cannot always see but can always trust. God's presence is your constant companion, and His love never leaves you."
      }
    },
    {
      id: 12,
      title: "Rising Hope",
      moodTag: "Hopeful",
      duration: 300,
      segments: {
        openingReflection: "Hope is stirring in your heart like the first light of dawn. This feeling of possibility and promise is a gift from God—nurture it and let it grow.",
        scriptureReading: {
          reference: "Romans 15:13",
          text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit."
        },
        guidedPrayer: "God of hope, thank You for this renewed sense of possibility. Strengthen this hope within me and help me share it with others who need encouragement. May Your Spirit fill me with unshakeable confidence in Your goodness. Amen.",
        closingBlessing: "Let this hope anchor your soul and lift your spirit. God is writing a beautiful story with your life, and hope is the thread that weaves it all together."
      }
    },
    {
      id: 13,
      title: "Renewed Strength",
      moodTag: "Discouraged",
      duration: 300,
      segments: {
        openingReflection: "Discouragement feels heavy, but it's not permanent. In this moment of weariness, God wants to remind you of who you are and how far you've already come.",
        scriptureReading: {
          reference: "Galatians 6:9",
          text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."
        },
        guidedPrayer: "Lord, lift my downcast spirit and remind me of Your faithfulness. Help me see beyond this temporary setback to the good work You're still doing in and through me. Give me strength to keep going. Amen.",
        closingBlessing: "This discouragement is not the end of your story—it's just a chapter. God is preparing you for a breakthrough that's worth the wait."
      }
    },
    {
      id: 14,
      title: "Clean and Free",
      moodTag: "Forgiven",
      duration: 300,
      segments: {
        openingReflection: "The weight of guilt has been lifted, and you stand clean before God. This forgiveness isn't something you earned—it's something you received. Breathe in this freedom.",
        scriptureReading: {
          reference: "1 John 1:9",
          text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness."
        },
        guidedPrayer: "Merciful Father, thank You for the gift of forgiveness that washes me clean. Help me receive this grace fully and extend the same mercy to others. Let this freedom transform how I live and love. Amen.",
        closingBlessing: "You are not defined by your past mistakes but by God's present grace. Walk in the freedom of being completely forgiven and deeply loved."
      }
    },
    {
      id: 15,
      title: "Patient Trust",
      moodTag: "Waiting on God",
      duration: 300,
      segments: {
        openingReflection: "Waiting is one of the hardest forms of faith, but it's also one of the most sacred. In this season of waiting, God is doing something beautiful that you cannot yet see.",
        scriptureReading: {
          reference: "Isaiah 40:31",
          text: "But those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary, they shall walk and not faint."
        },
        guidedPrayer: "Patient God, teach me to wait with grace and trust in Your perfect timing. Help me find peace in the pause and confidence in Your plan. Use this waiting to prepare my heart for what You have in store. Amen.",
        closingBlessing: "God's timing is never early, never late, but always perfect. What He's preparing for you in this season of waiting will be worth every moment of trust."
      }
    },
    {
      id: 16,
      title: "Deeply Cherished",
      moodTag: "Loved",
      duration: 300,
      segments: {
        openingReflection: "You are loved with a love so deep, so wide, so high that it surpasses all understanding. This isn't love you have to earn—it's love that simply is, because you are His beloved.",
        scriptureReading: {
          reference: "1 John 3:1",
          text: "See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!"
        },
        guidedPrayer: "Loving Father, help me truly believe and receive the depth of Your love for me. Let this love transform my heart, heal my wounds, and overflow into love for others. Thank You for choosing me as Your beloved child. Amen.",
        closingBlessing: "You are loved beyond measure, chosen with purpose, and treasured beyond compare. Let this truth be the foundation of everything you do today."
      }
    },
    {
      id: 17,
      title: "Grace Over Guilt",
      moodTag: "Guilty",
      duration: 300,
      segments: {
        openingReflection: "Guilt can feel overwhelming, but it doesn't have to have the final word. God's grace is bigger than your mistakes, and His love is stronger than your shame.",
        scriptureReading: {
          reference: "Romans 8:1",
          text: "Therefore, there is now no condemnation for those who are in Christ Jesus."
        },
        guidedPrayer: "Gracious God, I bring this guilt to You and ask for Your forgiveness. Help me learn from my mistakes without being defined by them. Replace my shame with Your grace and my regret with renewed purpose. Amen.",
        closingBlessing: "Your guilt is not your identity—you are God's beloved child, forgiven and free. Let grace be louder than guilt in your heart today."
      }
    },
    {
      id: 18,
      title: "Courage Over Fear",
      moodTag: "Afraid",
      duration: 300,
      segments: {
        openingReflection: "Fear tries to make itself bigger than it really is, but you have access to a courage that is stronger than any fear you face. God has not given you a spirit of fear, but of power, love, and sound mind.",
        scriptureReading: {
          reference: "Joshua 1:9",
          text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."
        },
        guidedPrayer: "God of courage, replace my fear with Your perfect love. Help me take the next brave step, knowing that You go before me and behind me. Give me strength to face what scares me with faith instead of fear. Amen.",
        closingBlessing: "Courage isn't the absence of fear—it's choosing to trust God in spite of it. You are braver than you know because God is with you."
      }
    },
    {
      id: 19,
      title: "Peace Over Anger",
      moodTag: "Angry",
      duration: 300,
      segments: {
        openingReflection: "Anger burns hot, but it doesn't have to consume you. In this moment, let God's peace cool the fire and help you process these intense feelings with wisdom and grace.",
        scriptureReading: {
          reference: "Ephesians 4:26-27",
          text: "In your anger do not sin: Do not let the sun go down while you are still angry, and do not give the devil a foothold."
        },
        guidedPrayer: "Prince of Peace, help me channel this anger in healthy ways. Show me what needs to be addressed and what needs to be released. Replace my rage with Your righteousness and my fury with Your peace. Amen.",
        closingBlessing: "Your anger can be transformed into energy for positive change. Let God's peace guide your actions and His wisdom direct your words."
      }
    },
    {
      id: 20,
      title: "Pure Joy",
      moodTag: "Joyful",
      duration: 300,
      segments: {
        openingReflection: "Joy is dancing in your heart today, and that's exactly how God intended it to be. This happiness isn't just a fleeting emotion—it's a reflection of the eternal joy that awaits us in His presence.",
        scriptureReading: {
          reference: "Nehemiah 8:10",
          text: "Do not grieve, for the joy of the Lord is your strength."
        },
        guidedPrayer: "Joyful God, thank You for this overwhelming sense of happiness and celebration. Help me remember that this joy comes from You and let it strengthen me through both good times and challenges. May my joy be contagious to others. Amen.",
        closingBlessing: "This joy is a glimpse of heaven on earth. Let it fill every corner of your life and spill over into the lives of everyone you meet today."
      }
    },
    {
      id: 21,
      title: "Healing the Broken",
      moodTag: "Feeling Broken",
      duration: 300,
      segments: {
        openingReflection: "When life has left you feeling shattered and beyond repair, know that brokenness is not your final destination. God specializes in taking broken things and making them beautiful again.",
        scriptureReading: {
          reference: "Psalm 147:3",
          text: "He heals the brokenhearted and binds up their wounds."
        },
        guidedPrayer: "Gentle Healer, I come to You with all my broken pieces, trusting that You can make something beautiful from this pain. Heal what feels irreparable and help me see that my scars can become sources of strength and compassion. Amen.",
        closingBlessing: "Your brokenness is not a sign of weakness—it's evidence of a life fully lived. God is already at work putting the pieces back together in ways more beautiful than before."
      }
    },
    {
      id: 22,
      title: "In the Waiting",
      moodTag: "Waiting",
      duration: 300,
      segments: {
        openingReflection: "Waiting can feel like being suspended between what was and what will be. But this sacred pause is not empty time—it's a space where God is preparing both you and the answer to your prayers.",
        scriptureReading: {
          reference: "Psalm 27:14",
          text: "Wait for the Lord; be strong and take heart and wait for the Lord."
        },
        guidedPrayer: "God of perfect timing, teach me to find peace in this season of waiting. Help me trust that You are working even when I cannot see progress. Use this time to prepare my heart for what You have planned. Amen.",
        closingBlessing: "What God is preparing for you in this season of waiting will be worth every moment of trust. His timing is never early, never late, but always perfect."
      }
    },
    {
      id: 23,
      title: "When Everything Feels Too Much",
      moodTag: "Overwhelmed",
      duration: 300,
      segments: {
        openingReflection: "When the demands of life feel like waves crashing over you, remember that you were never meant to carry everything alone. God invites you to cast your burdens on Him because He cares for you.",
        scriptureReading: {
          reference: "1 Peter 5:7",
          text: "Cast all your anxiety on him because he cares for you."
        },
        guidedPrayer: "Burden-bearing God, I release all that is overwhelming me into Your capable hands. Show me what is mine to carry and what I need to surrender. Give me wisdom to say yes to what matters and no to what doesn't. Amen.",
        closingBlessing: "You don't have to have it all figured out today. Take it one breath, one step, one moment at a time. God will provide the strength you need for each moment as it comes."
      }
    }
  ];

  // Meditation segments with their durations and pause points
  const meditationSegments = [
    { name: "Welcome & Breathing", duration: 120, pauseAfter: 5 }, // 2 min segment + 5s pause
    { name: "Body Awareness", duration: 90, pauseAfter: 8 }, // 1.5 min segment + 8s pause
    { name: "Mind Settling", duration: 100, pauseAfter: 10 }, // 1.67 min segment + 10s pause
    { name: "Heart Center", duration: 110, pauseAfter: 12 }, // 1.83 min segment + 12s pause
    { name: "Spiritual Connection", duration: 120, pauseAfter: 15 }, // 2 min segment + 15s pause
    { name: "Gratitude Practice", duration: 90, pauseAfter: 8 }, // 1.5 min segment + 8s pause
    { name: "Closing Blessing", duration: 70, pauseAfter: 0 }, // 1.17 min segment (no pause at end)
  ];

  // Calculate total session duration (15 minutes = 900 seconds)
  const totalSessionDuration = meditationSegments.reduce((total, segment) => 
    total + segment.duration + segment.pauseAfter, 0
  );



  // Background music options
  const backgroundMusicOptions = {
    'off': {
      name: 'No Background Music',
      description: 'Pure voice guidance without background sounds',
      icon: '🔇'
    },
    'gentle-chords': {
      name: 'Gentle Chords',
      description: 'Flowing chord progressions for peaceful meditation',
      icon: '🎵'
    },
    'nature-sounds': {
      name: 'Nature Sounds',
      description: 'Soft rain, gentle breeze, and natural ambience',
      icon: '🌿'
    },
    'ocean-waves': {
      name: 'Ocean Waves',
      description: 'Gentle rhythmic waves for deep relaxation',
      icon: '🌊'
    },
    'forest-rain': {
      name: 'Forest Rain',
      description: 'Peaceful raindrops on leaves with gentle nature ambience',
      icon: '🌧️'
    },
    'soft-piano': {
      name: 'Soft Piano',
      description: 'Delicate piano melodies for contemplation',
      icon: '🎹'
    },
    'ethereal-pads': {
      name: 'Ethereal Pads',
      description: 'Ambient soundscapes for spiritual focus',
      icon: '✨'
    },
    'tibetan-bowls': {
      name: 'Tibetan Bowls',
      description: 'Sacred singing bowls for meditation',
      icon: '🔔'
    },
    'gregorian-chant': {
      name: 'Gregorian Chant',
      description: 'Sacred monastic harmonies',
      icon: '⛪'
    },
    'christian-hymn': {
      name: 'Hymn Harmonies',
      description: 'Traditional Christian melodies',
      icon: '✝️'
    }
  };

  const { data: routines = [], isLoading, error } = useQuery({
    queryKey: ["/api/audio/routines"],
    retry: false,
  });

  // Background music generation functions
  const createGentleChords = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const chordProgression = [
      { freqs: [261.63, 329.63, 392.00], duration: 8 }, // C Major
      { freqs: [293.66, 369.99, 440.00], duration: 8 }, // D Minor
      { freqs: [246.94, 311.13, 369.99], duration: 8 }, // B Diminished
      { freqs: [220.00, 277.18, 329.63], duration: 8 }, // A Minor
    ];
    
    chordProgression.forEach((chord, chordIndex) => {
      chord.freqs.forEach((freq, noteIndex) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + (noteIndex * 200), audioContext.currentTime);
        filter.Q.setValueAtTime(0.5, audioContext.currentTime);
        
        const startTime = audioContext.currentTime + (chordIndex * chord.duration);
        const endTime = startTime + chord.duration;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15 - (noteIndex * 0.03), startTime + 2);
        gain.gain.linearRampToValueAtTime(0.1 - (noteIndex * 0.02), endTime - 2);
        gain.gain.linearRampToValueAtTime(0, endTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(endTime);
        oscillators.push(osc);
      });
    });
  };

  const createNatureSounds = (audioContext: AudioContext, masterGain: GainNode, audioSources: AudioBufferSourceNode[], duration: number) => {
    // Rain simulation with filtered noise
    const bufferSize = audioContext.sampleRate * 2;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    const rainFilter = audioContext.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(2000, audioContext.currentTime);
    rainFilter.Q.setValueAtTime(0.3, audioContext.currentTime);
    
    const rainGain = audioContext.createGain();
    rainGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    
    noiseSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(masterGain);
    
    noiseSource.start(audioContext.currentTime);
    noiseSource.stop(audioContext.currentTime + duration);
    audioSources.push(noiseSource);
  };

  const createOceanWaves = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    // Improved ocean waves with deeper, more realistic frequencies
    const waveFreqs = [35, 55, 75, 95]; // Lower frequencies for authentic ocean sounds
    
    waveFreqs.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180 + (i * 30), audioContext.currentTime);
      filter.Q.setValueAtTime(1.2, audioContext.currentTime);
      
      // Enhanced wave-like amplitude modulation for realistic ocean rhythm
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.setValueAtTime(0.08 + (i * 0.03), audioContext.currentTime); // Slower, more natural wave rhythm
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(0.06 - (i * 0.01), audioContext.currentTime);
      
      gain.gain.setValueAtTime(0.1 - (i * 0.02), audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
      lfo.start(audioContext.currentTime);
      lfo.stop(audioContext.currentTime + duration);
      
      oscillators.push(osc);
    });
  };

  const createForestRain = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    // Create continuous rain patterns with overlapping droplets
    const createRainLayer = (baseFreq: number, dropletCount: number, interval: number) => {
      for (let i = 0; i < Math.floor(duration / interval); i++) {
        const startTime = audioContext.currentTime + (i * interval) + (Math.random() * interval * 0.8);
        
        // Create multiple droplets at this time interval
        for (let j = 0; j < dropletCount; j++) {
          const dropletDelay = Math.random() * 0.5; // Spread droplets within 500ms
          const actualStartTime = startTime + dropletDelay;
          
          if (actualStartTime < audioContext.currentTime + duration) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            // Randomize frequency for natural variation
            const freq = baseFreq + (Math.random() * 400) - 200;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, actualStartTime);
            
            // High-pass filter for raindrop clarity
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(600 + (Math.random() * 200), actualStartTime);
            filter.Q.setValueAtTime(0.3, actualStartTime);
            
            // Sharp attack, quick decay for raindrop effect
            const volume = 0.008 + (Math.random() * 0.005);
            gain.gain.setValueAtTime(0, actualStartTime);
            gain.gain.linearRampToValueAtTime(volume, actualStartTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, actualStartTime + 0.15 + (Math.random() * 0.1));
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start(actualStartTime);
            osc.stop(actualStartTime + 0.3);
            oscillators.push(osc);
          }
        }
      }
    };
    
    // Create multiple rain layers for rich texture
    createRainLayer(1200, 3, 0.8); // Main rain layer - medium droplets
    createRainLayer(1800, 2, 1.2); // Higher frequency droplets
    createRainLayer(900, 2, 1.5);  // Lower frequency droplets
    
    // Add very subtle forest wind ambience (much quieter)
    const windFreq = 85;
    const windOsc = audioContext.createOscillator();
    const windGain = audioContext.createGain();
    const windFilter = audioContext.createBiquadFilter();
    
    windOsc.type = 'sawtooth';
    windOsc.frequency.setValueAtTime(windFreq, audioContext.currentTime);
    
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(150, audioContext.currentTime);
    windFilter.Q.setValueAtTime(0.3, audioContext.currentTime);
    
    // Very quiet wind - just a subtle background
    windGain.gain.setValueAtTime(0, audioContext.currentTime);
    windGain.gain.linearRampToValueAtTime(0.004, audioContext.currentTime + 8);
    windGain.gain.setValueAtTime(0.003, audioContext.currentTime + duration - 8);
    windGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    
    // Gentle wind modulation
    const windLfo = audioContext.createOscillator();
    const windLfoGain = audioContext.createGain();
    windLfo.frequency.setValueAtTime(0.1, audioContext.currentTime);
    windLfo.type = 'sine';
    windLfoGain.gain.setValueAtTime(8, audioContext.currentTime);
    
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    
    windOsc.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(masterGain);
    
    windOsc.start(audioContext.currentTime);
    windOsc.stop(audioContext.currentTime + duration);
    windLfo.start(audioContext.currentTime);
    windLfo.stop(audioContext.currentTime + duration);
    
    oscillators.push(windOsc);
  };

  const createSoftPiano = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const pianoNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
    
    for (let i = 0; i < 20; i++) {
      const noteIndex = Math.floor(Math.random() * pianoNotes.length);
      const freq = pianoNotes[noteIndex];
      const startTime = audioContext.currentTime + (Math.random() * duration * 0.8);
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Piano-like envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 3);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(startTime);
      osc.stop(startTime + 3);
      oscillators.push(osc);
    }
  };

  const createEtherealPads = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const etherealFreqs = [65.41, 82.41, 98.00, 123.47, 146.83]; // Low ethereal tones
    
    etherealFreqs.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + (index * 100), audioContext.currentTime);
      filter.Q.setValueAtTime(2, audioContext.currentTime);
      
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.06 - (index * 0.01), audioContext.currentTime + 10);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 10);
      
      // Add slow modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.frequency.setValueAtTime(0.1 + (index * 0.05), audioContext.currentTime);
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(20, audioContext.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + duration);
      lfo.start(audioContext.currentTime);
      lfo.stop(audioContext.currentTime + duration);
      
      oscillators.push(osc);
    });
  };

  const createTibetanBowls = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    const bowlFreqs = [256, 341.3, 426.7, 512]; // Traditional bowl frequencies
    
    for (let i = 0; i < 8; i++) {
      const freq = bowlFreqs[i % bowlFreqs.length];
      const startTime = audioContext.currentTime + (i * 30); // Spaced out strikes
      
      if (startTime < audioContext.currentTime + duration) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Bowl-like envelope with long decay
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 15);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + 15);
        oscillators.push(osc);
      }
    }
  };

  const createGregorianChant = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    // Gregorian chant uses modal scales and drone harmonics
    const baseFreq = 146.83; // D3 - traditional chant root
    const intervals = [1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8]; // Natural intervals
    
    // Create drone base
    const drone = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    const droneFilter = audioContext.createBiquadFilter();
    
    drone.type = 'sine';
    drone.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(400, audioContext.currentTime);
    droneFilter.Q.setValueAtTime(2, audioContext.currentTime);
    
    droneGain.gain.setValueAtTime(0.04, audioContext.currentTime);
    
    drone.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);
    
    drone.start(audioContext.currentTime);
    drone.stop(audioContext.currentTime + duration);
    oscillators.push(drone);
    
    // Add harmonic overtones at sacred intervals
    intervals.forEach((interval, index) => {
      if (index > 0) {
        const harmonic = audioContext.createOscillator();
        const harmonicGain = audioContext.createGain();
        const harmonicFilter = audioContext.createBiquadFilter();
        
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(baseFreq * interval, audioContext.currentTime);
        
        harmonicFilter.type = 'lowpass';
        harmonicFilter.frequency.setValueAtTime(600 + (index * 100), audioContext.currentTime);
        harmonicFilter.Q.setValueAtTime(1.5, audioContext.currentTime);
        
        // Subtle volume with breathing envelope
        const volume = 0.02 - (index * 0.003);
        harmonicGain.gain.setValueAtTime(0, audioContext.currentTime);
        harmonicGain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 4);
        harmonicGain.gain.linearRampToValueAtTime(volume * 0.7, audioContext.currentTime + duration - 4);
        harmonicGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        harmonic.connect(harmonicFilter);
        harmonicFilter.connect(harmonicGain);
        harmonicGain.connect(masterGain);
        
        harmonic.start(audioContext.currentTime);
        harmonic.stop(audioContext.currentTime + duration);
        oscillators.push(harmonic);
      }
    });
  };

  const createChristianHymn = (audioContext: AudioContext, masterGain: GainNode, oscillators: OscillatorNode[], duration: number) => {
    // Traditional hymn harmony using I-V-vi-IV progression in C Major
    const chordProgression = [
      { freqs: [261.63, 329.63, 392.00], duration: 12 }, // C Major (C-E-G)
      { freqs: [392.00, 493.88, 587.33], duration: 12 }, // G Major (G-B-D)
      { freqs: [220.00, 261.63, 329.63], duration: 12 }, // A Minor (A-C-E)
      { freqs: [349.23, 440.00, 523.25], duration: 12 }, // F Major (F-A-C)
    ];
    
    chordProgression.forEach((chord, chordIndex) => {
      chord.freqs.forEach((freq, noteIndex) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        
        osc.type = 'triangle'; // Warmer sound for hymns
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, audioContext.currentTime);
        filter.Q.setValueAtTime(0.8, audioContext.currentTime);
        
        const startTime = audioContext.currentTime + (chordIndex * chord.duration);
        const endTime = startTime + chord.duration;
        
        // Organ-like envelope
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08 - (noteIndex * 0.02), startTime + 1);
        gain.gain.setValueAtTime(0.06 - (noteIndex * 0.015), endTime - 1);
        gain.gain.linearRampToValueAtTime(0, endTime);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        
        osc.start(startTime);
        osc.stop(endTime);
        oscillators.push(osc);
      });
    });
  };

  // Sound preview functionality
  const previewSound = async (soundType: string) => {
    if (soundType === 'off') return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Force resume for mobile browsers
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      
      const oscillators: OscillatorNode[] = [];
      const audioSources: AudioBufferSourceNode[] = [];
      const previewDuration = 3; // 3 seconds preview
      
      
      switch (soundType) {
        case 'gentle-chords':
          createGentleChords(audioContext, masterGain, oscillators, previewDuration);
          break;
        case 'nature-sounds':
          createNatureSounds(audioContext, masterGain, audioSources, previewDuration);
          break;
        case 'ocean-waves':
          // Improved ocean waves for preview - more realistic wave sounds
          const waveFreqs = [40, 65, 90]; // Lower frequencies for deeper wave sounds
          waveFreqs.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200 + (index * 50), audioContext.currentTime);
            filter.Q.setValueAtTime(1, audioContext.currentTime);
            
            // Create wave-like envelope
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.08 - (index * 0.02), audioContext.currentTime + 1.5);
            gain.gain.linearRampToValueAtTime(0.04 - (index * 0.01), audioContext.currentTime + previewDuration - 1);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + previewDuration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + previewDuration);
            oscillators.push(osc);
          });
          break;
        case 'forest-rain':
          // Forest rain preview - gentle raindrops with nature ambience
          const rainFreqs = [800, 1200, 1600, 2000]; // Higher frequencies for raindrop sounds
          rainFreqs.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq + (Math.random() * 200), audioContext.currentTime);
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(600, audioContext.currentTime);
            filter.Q.setValueAtTime(0.5, audioContext.currentTime);
            
            // Create gentle raindrop envelope
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.03 - (index * 0.005), audioContext.currentTime + 0.5);
            gain.gain.setValueAtTime(0.02 - (index * 0.003), audioContext.currentTime + previewDuration - 0.5);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + previewDuration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + previewDuration);
            oscillators.push(osc);
          });
          break;
        case 'soft-piano':
          createSoftPiano(audioContext, masterGain, oscillators, previewDuration);
          break;
        case 'ethereal-pads':
          // Fixed ethereal pads for preview
          const frequencies = [220, 293.66, 369.99]; // A-D-F# triad
          frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, audioContext.currentTime);
            filter.Q.setValueAtTime(2, audioContext.currentTime);
            
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.05 - (index * 0.01), audioContext.currentTime + 1);
            gain.gain.setValueAtTime(0.03 - (index * 0.008), audioContext.currentTime + previewDuration - 1);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + previewDuration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + previewDuration);
            oscillators.push(osc);
          });
          break;
        case 'tibetan-bowls':
          createTibetanBowls(audioContext, masterGain, oscillators, previewDuration);
          break;
        case 'gregorian-chant':
          // Fixed Gregorian chant for preview
          const baseFreq = 146.83; // D3
          const intervals = [1, 5/4, 3/2]; // Simple sacred intervals
          
          intervals.forEach((interval, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * interval, audioContext.currentTime);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, audioContext.currentTime);
            filter.Q.setValueAtTime(1, audioContext.currentTime);
            
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.06 - (index * 0.02), audioContext.currentTime + 0.5);
            gain.gain.setValueAtTime(0.04 - (index * 0.015), audioContext.currentTime + previewDuration - 0.5);
            gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + previewDuration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterGain);
            
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + previewDuration);
            oscillators.push(osc);
          });
          break;
        case 'christian-hymn':
          createChristianHymn(audioContext, masterGain, oscillators, previewDuration);
          break;
      }
      
      // Auto-stop preview after 3 seconds
      setTimeout(() => {
        oscillators.forEach(osc => {
          try { osc.stop(); } catch (e) { /* Already stopped */ }
        });
        audioSources.forEach(source => {
          try { source.stop(); } catch (e) { /* Already stopped */ }
        });
        audioContext.close();
      }, previewDuration * 1000);
      
    } catch (error) {
    }
  };

  // Automatic pause detection function
  const setupAutoPauseDetection = (audio: HTMLAudioElement) => {
    const pausePatterns = [
      /pause for (\d+) seconds?/i,
      /pause for (\d+) minutes?/i,
      /take (\d+) seconds? to/i,
      /rest for (\d+) seconds?/i,
      /(\d+) seconds? of silence/i
    ];

    // Monitor audio for pause cues by tracking time and checking against meditation script
    const checkForPauseCues = () => {
      if (!audio || audio.paused) return;
      
      const currentTime = audio.currentTime;
      
      // Meditation timing markers for automatic pauses
      const pauseMarkers = [
        { time: 35, duration: 15 }, // "pause for 15 seconds"
        { time: 75, duration: 45 }, // "pause for 45 seconds"  
        { time: 140, duration: 90 }, // "pause for 90 seconds"
        { time: 250, duration: 120 }, // "pause for 2 minutes"
        { time: 390, duration: 180 }, // "pause for 3 minutes"
        { time: 590, duration: 30 } // "pause for 30 seconds"
      ];
      
      for (const marker of pauseMarkers) {
        if (Math.abs(currentTime - marker.time) < 2 && !isPaused) {
          // Trigger automatic pause
          audio.pause();
          setIsPaused(true);
          
          toast({
            title: "Automatic Pause",
            description: `Pausing for ${marker.duration} seconds as instructed`,
            duration: 3000,
          });
          
          // Auto-resume after specified duration
          const resumeTimeout = setTimeout(() => {
            if (audio && isPaused) {
              audio.play();
              setIsPaused(false);
              
              toast({
                title: "Resuming",
                description: "Continuing your meditation session",
                duration: 2000,
              });
            }
          }, marker.duration * 1000);
          
          setAutoPauseTimeout(resumeTimeout);
          break;
        }
      }
    };

    // Check for pause cues every 2 seconds
    const intervalId = setInterval(checkForPauseCues, 2000);
    
    // Clean up on audio end
    audio.addEventListener('ended', () => {
      clearInterval(intervalId);
    });
  };

  // Universal device detection for cross-platform support
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
  const isKindle = /kindle|silk/.test(userAgent);
  const isAppleWatch = /watchos/.test(userAgent);
  const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRoutine = (routine: AudioRoutine) => {
    if (playingRoutine === routine.id) {
      stopAudioRoutine();
      return;
    }
    startFullMeditationSession(routine);
  };

  const startFullMeditationSession = async (routine: AudioRoutine) => {
    try {
      // Clear any previous session termination flags
      (window as any).sessionTerminated = false;
      
      // Stop any existing meditation session first
      if (playingRoutine) {
        stopAudioRoutine();
        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Stop any existing devotional session
      if (playingDevotional) {
        stopDevotionalRoutine();
        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setPlayingRoutine(routine.id);
      
      // Create audio context for background music
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setCurrentAudioContext(audioContext);
      
      // Session duration in seconds (12-15 minutes)
      const sessionDuration = 900; // 15 minutes
      
      // Resume audio context if needed (for mobile browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      // Create background music based on selected type
      const masterGain = audioContext.createGain();
      masterGain.connect(audioContext.destination);
      masterGain.gain.setValueAtTime(backgroundMusicType === 'off' ? 0 : 0.12, audioContext.currentTime);
      
      const oscillators: OscillatorNode[] = [];
      const audioSources: AudioBufferSourceNode[] = [];
      
      if (backgroundMusicType !== 'off') {
        switch (backgroundMusicType) {
          case 'gentle-chords':
            createGentleChords(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'nature-sounds':
            createNatureSounds(audioContext, masterGain, audioSources, sessionDuration);
            break;
          case 'ocean-waves':
            createOceanWaves(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'forest-rain':
            createForestRain(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'soft-piano':
            createSoftPiano(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'ethereal-pads':
            createEtherealPads(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'tibetan-bowls':
            createTibetanBowls(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'gregorian-chant':
            createGregorianChant(audioContext, masterGain, oscillators, sessionDuration);
            break;
          case 'christian-hymn':
            createChristianHymn(audioContext, masterGain, oscillators, sessionDuration);
            break;
        }
      }
      
      const backgroundMusic = {
        stop: () => {
          oscillators.forEach(osc => {
            try { osc.stop(); } catch (e) { /* Already stopped */ }
          });
          audioSources.forEach(source => {
            try { source.stop(); } catch (e) { /* Already stopped */ }
          });
        }
      };
      
      // Create diverse meditation scripts based on routine type
      const getRoutineScript = (routineName: string) => {
        switch (routineName) {
          case 'Morning Peace':
            return [
              {
                text: `Good morning, and welcome to your Morning Peace meditation. As the dawn breaks and a new day begins, this is your sacred time to center yourself in God's presence before the world awakens around you. Find a comfortable seated position, perhaps near a window where you can sense the morning light. Place your feet flat on the floor and your hands gently resting on your lap. Close your eyes and take three deep, cleansing breaths, releasing yesterday's concerns and welcoming today's possibilities.`,
                pauseAfter: 10
              },
              {
                text: `Begin to notice your breath as it flows naturally in and out. With each inhale, imagine drawing in the fresh energy of this new morning. With each exhale, release any lingering sleepiness or anxiety about the day ahead. Feel your body awakening gently, like a flower opening to the morning sun. Starting from the crown of your head, send a warm wave of gratitude through your body - grateful for rest, grateful for this new day, grateful for the breath that sustains you.`,
                pauseAfter: 15
              },
              {
                text: `Now bring to mind your intentions for this day. Not your to-do list or your worries, but your deeper intentions. How do you want to show up in the world today? What qualities do you want to embody - perhaps patience, kindness, courage, or joy? Set these intentions like seeds in the fertile ground of your heart, trusting that they will grow and manifest throughout your day.`,
                pauseAfter: 30
              },
              {
                text: `Imagine yourself surrounded by a gentle, golden morning light. This light represents God's love and protection surrounding you. Feel this light filling you from within, giving you strength and clarity for the day ahead. Know that you carry this light with you wherever you go. When challenges arise today, you can return to this feeling of peace and centeredness.`,
                pauseAfter: 45
              },
              {
                text: `Take a moment now to offer a prayer of gratitude for this new day. Thank the Divine for the gift of life, for the people you love, for the opportunities that await you. Even if yesterday was difficult, today is a fresh start, a new chapter waiting to be written. You are exactly where you need to be in this moment.`,
                pauseAfter: 60
              },
              {
                text: `As we prepare to conclude this morning meditation, take three more deep breaths. With each breath, feel yourself becoming more alert and present, ready to meet the day with an open heart. When you're ready, gently wiggle your fingers and toes, roll your shoulders, and slowly open your eyes. Carry this morning peace with you as you step into your day, knowing that God's love goes before you and surrounds you always.`,
                pauseAfter: 0
              }
            ];
          
          case 'Evening Reflection':
            return [
              {
                text: `Welcome to this time of Evening Reflection, a sacred pause at the end of your day. As the sun sets and darkness gently embraces the earth, this is your invitation to turn inward and reflect on the journey of this day. Find a comfortable position where you can truly relax. Let your shoulders drop, soften your jaw, and allow your breath to deepen naturally. This is your time to release the day and prepare for restful sleep.`,
                pauseAfter: 10
              },
              {
                text: `Begin by taking a gentle inventory of your day, not with judgment, but with compassion. Recall the moments of joy - perhaps a kind word shared, a task completed, a moment of beauty you witnessed. Feel gratitude for these gifts, no matter how small they may seem. Allow appreciation to fill your heart for the experiences that brought you closer to love, to others, and to yourself.`,
                pauseAfter: 20
              },
              {
                text: `Now acknowledge the more challenging moments of today - times when you felt stressed, frustrated, or disconnected. Rather than criticizing yourself, offer these experiences the same gentle compassion you would give a dear friend. Every day contains both light and shadow, and both are part of your human journey. Breathe forgiveness into any mistakes you made, knowing that tomorrow offers new opportunities to love and grow.`,
                pauseAfter: 40
              },
              {
                text: `Release any conversations you need to have, any tasks left undone, any worries about tomorrow. Imagine placing all of these concerns in a beautiful basket and offering them to the Divine. You don't need to carry these burdens into your sleep. Trust that what needs to be handled will be, and what doesn't serve you can be released with love.`,
                pauseAfter: 60
              },
              {
                text: `Feel your body sinking deeper into relaxation with each breath. Starting from your toes and moving slowly upward, consciously relax each part of your body. Your legs, your hips, your abdomen, your chest, your arms, your neck, and finally your face. Let go completely, knowing you are held safely in God's love as you prepare for rest.`,
                pauseAfter: 45
              },
              {
                text: `As this day comes to a close, offer a prayer of gratitude for all you have experienced, learned, and received. You have grown today, even in ways you may not yet realize. Rest now in the peace that comes from knowing you are deeply loved, perfectly held, and beautifully human. May your sleep be filled with God's peace, and may you awaken refreshed and renewed. Sweet dreams, beloved soul.`,
                pauseAfter: 0
              }
            ];
          
          case 'Stress Relief':
            return [
              {
                text: `Welcome to this Stress Relief meditation. Right now, you are choosing to step away from the pressures and demands of life to find your center again. This is an act of self-care and wisdom. Find a position where you can be completely comfortable - sitting or lying down, whatever feels best for your body right now. Close your eyes and know that for the next few minutes, you have nowhere else to be and nothing else to do but care for your wellbeing.`,
                pauseAfter: 8
              },
              {
                text: `Begin by acknowledging the stress you're carrying without trying to fix or change it. Simply notice where you feel tension in your body. Is it in your shoulders? Your jaw? Your stomach? Breathe gently into these areas, sending them compassion rather than resistance. Say to yourself: "It's okay that I feel stressed. This is temporary, and I am capable of finding peace."`,
                pauseAfter: 15
              },
              {
                text: `Now we're going to practice a powerful breathing technique for stress relief. Inhale slowly through your nose for a count of four. Hold your breath gently for a count of four. Exhale completely through your mouth for a count of six. Let's do this together several times, allowing each exhale to release more tension from your body and mind.`,
                pauseAfter: 25
              },
              {
                text: `With each breath cycle, imagine that you're breathing in calm, peaceful energy, and breathing out stress and worry. Your nervous system is beginning to shift from fight-or-flight mode into rest and restoration. Feel your heart rate slowing, your muscles softening, your mind becoming clearer and more focused. You are returning to your natural state of balance and peace.`,
                pauseAfter: 35
              },
              {
                text: `Bring to mind something that always brings you comfort - perhaps a loved one's smile, a peaceful place in nature, or a cherished memory. Hold this image in your heart and let its warmth spread throughout your entire being. This comfort is always available to you. Even in the midst of life's storms, there is always a place of safety and peace within you.`,
                pauseAfter: 50
              },
              {
                text: `As we conclude this stress relief session, place one hand on your heart and one on your belly. Feel the steady rhythm of your heartbeat, the gentle rise and fall of your breath. Your body knows how to heal and restore itself when given the chance. Trust in your inner resilience and strength. When you return to your day, carry this calm centeredness with you. You can handle whatever comes with grace and wisdom.`,
                pauseAfter: 0
              }
            ];
          
          default:
            return [
              {
                text: `Welcome to this guided meditation session. This is your time to step away from the world and connect with your inner peace. Find a comfortable position and allow your eyes to close gently. Take a deep breath in, and as you exhale, let go of everything that brought you here today. This is your sacred time for rest and renewal.`,
                pauseAfter: 10
              },
              {
                text: `Focus on your breath, the most natural and life-giving rhythm in your body. With each inhale, feel yourself drawing in peace and calm. With each exhale, release any tension or stress you've been carrying. Allow your breathing to become slower and deeper with each cycle.`,
                pauseAfter: 20
              },
              {
                text: `Now bring your attention to your body, starting from the top of your head and slowly moving downward. Notice any areas of tension and breathe into them with kindness and compassion. Your body has carried you through this day and deserves your appreciation and care.`,
                pauseAfter: 40
              },
              {
                text: `In this quiet space, allow yourself to simply be. You don't need to fix anything, solve anything, or become anything other than what you are right now. Rest in the profound peace that comes from accepting this present moment exactly as it is.`,
                pauseAfter: 60
              },
              {
                text: `As we prepare to return to the world, take a moment to set an intention for how you want to carry this peace forward. Know that this calm centeredness is always available to you, just a few conscious breaths away.`,
                pauseAfter: 30
              },
              {
                text: `When you're ready, gently begin to move your fingers and toes, take a deep breath, and slowly open your eyes. Return to your day with renewed energy and clarity, carrying this inner peace with you.`,
                pauseAfter: 0
              }
            ];
        }
      };
      
      const meditationSegments = getRoutineScript(routine.name);

      // Generate complete meditation audio with proper segmentation
      
      let currentSegmentIndex = 0;
      let sessionStartTime = Date.now();
      let sessionRoutineId = routine.id;
      
      // Progress tracking
      const updateProgress = () => {
        const elapsed = (Date.now() - sessionStartTime) / 1000;
        const progress = Math.min((elapsed / totalSessionDuration) * 100, 100);
        setSessionProgress(progress);
        setCurrentSegment(currentSegmentIndex);
      };
      
      // Update progress every second
      const progressInterval = setInterval(updateProgress, 1000);
      
      // Store cleanup function
      const cleanup = () => {
        clearInterval(progressInterval);
        if ((window as any).currentPauseTimeout) {
          clearTimeout((window as any).currentPauseTimeout);
          (window as any).currentPauseTimeout = null;
        }
        setSessionProgress(0);
        setCurrentSegment(0);
        setIsInSilencePeriod(false);
      };
      
      const playNextSegment = async () => {
        if (currentSegmentIndex >= meditationSegments.length) {
          // Session complete
          masterGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 5);
          setTimeout(() => {
            backgroundMusic.stop();
            setPlayingRoutine(null);
            setCurrentAudioContext(null);
            toast({
              title: "Session Complete",
              description: "Your 15-minute meditation has finished. Carry this peace with you.",
              duration: 5000,
            });
          }, 6000);
          return;
        }
        
        const segment = meditationSegments[currentSegmentIndex];
        
        // Generate audio for this segment
        const response = await fetch('/api/meditation/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: segment.text,
            voice: selectedVoice,
            speed: 0.95
          }),
        });
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const segmentAudio = new Audio(audioUrl);
          setCurrentAudio(segmentAudio);
          
          // Cross-platform audio setup
          segmentAudio.preload = 'auto';
          segmentAudio.volume = isAppleWatch ? 1.0 : (isMobile ? 0.85 : 0.75);
          
          if (isMobile) {
            (segmentAudio as any).playsInline = true;
          }
          
          toast({
            title: `Meditation Segment ${currentSegmentIndex + 1}`,
            description: `${meditationSegments.length - currentSegmentIndex} segments remaining`,
            duration: 3000,
          });
          
          await segmentAudio.play();
          
          // When segment ends, pause for specified duration then play next
          segmentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentSegmentIndex++;
            
            if (segment.pauseAfter > 0) {
              // Show pause notification and update silence period state
              setIsInSilencePeriod(true);
              
              toast({
                title: "Brief Pause",
                description: `${segment.pauseAfter} seconds of peaceful silence`,
                duration: 2000,
              });
              
              // Wait for pause duration then continue
              const pauseTimeout = setTimeout(() => {
                // Check if session was terminated during pause
                if ((window as any).sessionTerminated) {
                  return;
                }
                setIsInSilencePeriod(false);
                playNextSegment();
              }, segment.pauseAfter * 1000);
              
              // Store timeout for cleanup if needed
              (window as any).currentPauseTimeout = pauseTimeout;
            } else {
              // No pause, continue immediately
              playNextSegment();
            }
          };
        } else {
          throw new Error('Failed to generate segment audio');
        }
      };
      
      // Start the segmented meditation
      await playNextSegment();
      
      // Store cleanup and session info for proper management
      (routine as any).cleanup = cleanup;
      (routine as any).sessionId = sessionRoutineId;
      
    } catch (error) {
      
      let errorMessage = "Please tap to enable audio for your meditation routine.";
      if (isIOS) {
        errorMessage = "Please enable audio in Safari settings for meditation.";
      } else if (isAndroid) {
        errorMessage = "Please allow audio permission for your meditation routine.";
      } else if (isKindle) {
        errorMessage = "Audio may be limited on Kindle. Please check volume settings.";
      } else if (isAppleWatch) {
        errorMessage = "Audio capabilities are limited on Apple Watch.";
      }
      
      toast({
        title: "Audio Setup Needed",
        description: errorMessage,
        duration: 4000,
      });
      setPlayingRoutine(null);
    }
  };

  const pauseAudioRoutine = () => {
    // Check if session was terminated
    if ((window as any).sessionTerminated) {
      return;
    }
    
    if (currentAudio && !isPaused) {
      currentAudio.pause();
      setIsPaused(true);
      
      // Pause any ongoing timeouts
      if ((window as any).currentPauseTimeout) {
        clearTimeout((window as any).currentPauseTimeout);
        (window as any).currentPauseTimeout = null;
      }
      
      toast({
        title: "Session Paused",
        description: "Meditation session paused. Click resume to continue.",
        duration: 2000,
      });
    }
  };

  const resumeAudioRoutine = () => {
    // Check if session was terminated
    if ((window as any).sessionTerminated) {
      setIsPaused(false);
      setPlayingRoutine(null);
      return;
    }
    
    if (currentAudio && isPaused) {
      currentAudio.play();
      setIsPaused(false);
      
      toast({
        title: "Session Resumed",
        description: "Continuing your meditation session",
        duration: 2000,
      });
    }
  };

  const playDevotionalRoutine = async (routine: DevotionalRoutine) => {
    try {
      // Check if session was terminated - don't start if so
      if ((window as any).sessionTerminated) {
        return;
      }
      
      // Stop any existing meditation session first
      if (playingRoutine) {
        stopAudioRoutine();
        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Stop any existing devotional session
      if (playingDevotional) {
        stopDevotionalRoutine();
        // Wait a moment for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setPlayingDevotional(routine.id);
      setCurrentDevotionalSegment(0);
      setDevotionalProgress(0);

      // Optimized script for faster generation
      const devotionalScript = `${routine.segments.openingReflection} From ${routine.segments.scriptureReading.reference}: ${routine.segments.scriptureReading.text} ${routine.segments.guidedPrayer} ${routine.segments.closingBlessing}`;

      // Show immediate feedback
      toast({
        title: "Preparing Devotional",
        description: "Premium AI narration loading...",
        duration: 2000,
      });
      
      // Generate audio using OpenAI TTS with optimized settings
      const response = await fetch('/api/audio/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: devotionalScript,
          voice: selectedVoice,
          speed: 1.0 // Faster speed for quicker loading
        }),
      });

      // Check if session was terminated during audio generation
      if ((window as any).sessionTerminated) {
        setPlayingDevotional(null);
        setDevotionalProgress(0);
        setCurrentDevotionalSegment(0);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to generate devotional audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Final check before creating audio element
      if ((window as any).sessionTerminated) {
        URL.revokeObjectURL(audioUrl);
        setPlayingDevotional(null);
        setDevotionalProgress(0);
        setCurrentDevotionalSegment(0);
        return;
      }
      
      // Create and play audio with preloading
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      setDevotionalAudio(audio);
      
      // Optimized progress tracking - less frequent updates
      const updateProgress = () => {
        // Check if session was terminated
        if ((window as any).sessionTerminated) {
          audio.pause();
          audio.currentTime = 0;
          setPlayingDevotional(null);
          setDevotionalProgress(0);
          setCurrentDevotionalSegment(0);
          return;
        }
        
        if (audio.duration > 0) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setDevotionalProgress(progress);
        }
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('loadeddata', () => {
        toast({
          title: "Ready to Play",
          description: `"${routine.title}" is ready`,
          duration: 1000,
        });
      });
      
      audio.addEventListener('ended', () => {
        setPlayingDevotional(null);
        setDevotionalProgress(0);
        setCurrentDevotionalSegment(0);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: "Devotional Complete",
          description: "May God's peace be with you today",
          duration: 3000,
        });
      });

      await audio.play();

    } catch (error) {
      setPlayingDevotional(null);
      
      toast({
        title: "Audio Setup Needed",
        description: "Please tap to enable audio for your devotional routine",
        duration: 4000,
      });
    }
  };

  const stopDevotionalRoutine = () => {
    
    // Immediate session termination flag
    (window as any).sessionTerminated = true;
    
    // Stop and cleanup devotional audio
    if (devotionalAudio) {
      devotionalAudio.pause();
      devotionalAudio.currentTime = 0;
      devotionalAudio.removeEventListener('timeupdate', () => {});
      devotionalAudio.removeEventListener('ended', () => {});
      devotionalAudio.removeEventListener('loadeddata', () => {});
      setDevotionalAudio(null);
    }
    
    // Reset all devotional states
    setPlayingDevotional(null);
    setDevotionalProgress(0);
    setCurrentDevotionalSegment(0);
    
    // Cancel any speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Small delay to ensure cleanup completes
    setTimeout(() => {
    }, 500);
    
    toast({
      title: "Devotional Stopped",
      description: "Audio routine ended",
      duration: 2000,
    });
  };

  const stopAudioRoutine = () => {
    
    // Immediate session termination flag
    (window as any).sessionTerminated = true;
    
    // Also stop any running devotional session
    if (playingDevotional) {
      if (devotionalAudio) {
        devotionalAudio.pause();
        devotionalAudio.currentTime = 0;
        setDevotionalAudio(null);
      }
      setPlayingDevotional(null);
      setDevotionalProgress(0);
      setCurrentDevotionalSegment(0);
    }
    
    // Clear all timeout references
    if (autoPauseTimeout) {
      clearTimeout(autoPauseTimeout);
      setAutoPauseTimeout(null);
    }
    
    if ((window as any).currentPauseTimeout) {
      clearTimeout((window as any).currentPauseTimeout);
      (window as any).currentPauseTimeout = null;
    }
    
    // Clear any progress intervals
    if ((window as any).progressInterval) {
      clearInterval((window as any).progressInterval);
      (window as any).progressInterval = null;
    }
    
    // Clear all global timeouts for meditation sessions
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      try {
        clearTimeout(i);
      } catch (e) { /* ignore */ }
    }
    
    // Stop and cleanup meditation audio
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = '';
        currentAudio.load(); // Force reset
        // Remove all event listeners
        const newAudio = currentAudio.cloneNode() as HTMLAudioElement;
        currentAudio.parentNode?.replaceChild(newAudio, currentAudio);
      } catch (e) {
      }
      setCurrentAudio(null);
    }
    
    // Force stop all Web Audio API contexts and nodes
    if (currentAudioContext) {
      try {
        // Stop all active audio nodes
        const context = currentAudioContext;
        
        // Disconnect and stop all nodes created in this context
        const destination = context.destination;
        if (destination) {
          try {
            destination.disconnect();
          } catch (e) { /* already disconnected */ }
        }
        
        // Suspend and close the audio context immediately
        context.suspend().then(() => {
          return context.close();
        }).then(() => {
        }).catch((e) => {
        });
        
      } catch (e) {
      }
      setCurrentAudioContext(null);
    }
    
    // Stop any browser speech synthesis
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
        speechSynthesis.pause();
      } catch (e) {
      }
    }
    
    // Force cleanup of any running routine
    const currentRoutineId = playingRoutine;
    if (currentRoutineId) {
      // Clear any routine-specific cleanup
      try {
        const routineElement = document.querySelector(`[data-routine-id="${currentRoutineId}"]`);
        if (routineElement && (routineElement as any).cleanup) {
          (routineElement as any).cleanup();
        }
      } catch (e) {
      }
    }
    
    // Reset all session state immediately
    setPlayingRoutine(null);
    setIsPaused(false);
    setSessionProgress(0);
    setCurrentSegment(0);
    setIsInSilencePeriod(false);
    
    // Clear session termination flag after cleanup
    setTimeout(() => {
      (window as any).sessionTerminated = false;
    }, 1000);
    
    toast({
      title: "Session Stopped",
      description: "Meditation session completely stopped",
      duration: 2000,
    });
    
  };

  const handleRoutineClick = (routine: AudioRoutine) => {
    handleStartRoutine(routine);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Audio Routines
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Loading peaceful meditation experiences...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Audio Routines
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome! Your audio meditation routines are being prepared.
          </p>
        </div>
      </div>
    );
  }

  // Default routines if none available
  const defaultRoutines: AudioRoutine[] = [
    {
      id: 1,
      name: "Morning Prayer & Meditation",
      description: "Start your day with peaceful reflection and spiritual connection",
      totalDuration: 900, // 15 minutes
      category: "Spiritual",
      autoAdvance: true,
      steps: []
    },
    {
      id: 2,
      name: "Evening Gratitude Session",
      description: "End your day with thankfulness and peaceful rest",
      totalDuration: 600, // 10 minutes
      category: "Gratitude",
      autoAdvance: true,
      steps: []
    },
    {
      id: 3,
      name: "Scripture Meditation",
      description: "Deep reflection on God's word with guided contemplation",
      totalDuration: 720, // 12 minutes
      category: "Scripture",
      autoAdvance: true,
      steps: []
    }
  ];

  const displayRoutines = (routines as AudioRoutine[]).length > 0 ? routines as AudioRoutine[] : defaultRoutines;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Headphones className="h-12 w-12 mx-auto mb-4 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Audio Routines
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Guided spiritual experiences with premium AI narration and peaceful background music
        </p>
      </div>

      <Tabs defaultValue="devotional" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-14">
          <TabsTrigger value="devotional" className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-purple-400">
            <Book className="h-5 w-5" />
            Devotional
          </TabsTrigger>
          <TabsTrigger value="meditation" className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-purple-400">
            <Heart className="h-5 w-5" />
            Meditation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devotional" className="space-y-6">
          <div className="space-y-4">
            {Object.entries(categorizeDevotionalsByMood()).map(([category, routines]) => (
              <Collapsible 
                key={category}
                open={expandedMoodCategories[category]}
                onOpenChange={() => toggleMoodCategory(category)}
              >
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{moodCategories[category as keyof typeof moodCategories].emoji}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {category}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {moodCategories[category as keyof typeof moodCategories].description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {routines.length} routines
                          </Badge>
                          {expandedMoodCategories[category] ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {routines.map((routine) => (
                      <Card key={routine.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-400">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{routine.title}</CardTitle>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                                  {routine.moodTag}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Clock className="h-4 w-4" />
                                  {Math.floor(routine.duration / 60)} min
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0 space-y-4">
                          <div className="space-y-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Opening Reflection</h4>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {routine.segments.openingReflection}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Scripture Reading</h4>
                              <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                                {routine.segments.scriptureReading.reference}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border-l-4 border-purple-400">
                                "{routine.segments.scriptureReading.text}"
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Guided Prayer</h4>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {routine.segments.guidedPrayer}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Closing Blessing</h4>
                              <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                {routine.segments.closingBlessing}
                              </p>
                            </div>
                          </div>
                          
                          {playingDevotional === routine.id ? (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                  <span>Playing devotional...</span>
                                  <span>{Math.round(devotionalProgress)}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${devotionalProgress}%` }}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={stopDevotionalRoutine}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Square className="h-4 w-4 mr-1" />
                                  Stop
                                </Button>
                                <span className="text-sm text-green-600">Premium AI narration active</span>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => playDevotionalRoutine(routine)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start Devotional
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="meditation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayRoutines.map((routine: AudioRoutine) => (
              <Card key={routine.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{routine.name}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {routine.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {routine.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {formatDuration(routine.totalDuration)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {playingRoutine === routine.id ? (
                    <div className="space-y-4">
                      {/* Progress Bar with Pause Points */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>{meditationSegments[currentSegment]?.name || "Preparing..."}</span>
                          <span>{Math.round(sessionProgress)}%</span>
                        </div>
                        
                        <div className="relative">
                          {/* Progress Bar Background */}
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {/* Progress Fill */}
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 ease-out"
                              style={{ width: `${sessionProgress}%` }}
                            />
                          </div>
                        </div>
                        
                        {isInSilencePeriod && (
                          <div className="text-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Silent Reflection Time
                          </div>
                        )}
                      </div>
                  
                  {/* Pause/Resume and Stop Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={isPaused ? resumeAudioRoutine : pauseAudioRoutine}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      {isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleRoutineClick(routine)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => handleRoutineClick(routine)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={playingRoutine !== null}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Meditation
                </Button>
              )}
              </CardContent>
              </Card>
            ))}
          </div>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Selection</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose your preferred narration voice for meditation sessions
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'nova', name: 'Nova', description: 'Warm & calming female voice' },
                  { id: 'shimmer', name: 'Shimmer', description: 'Gentle & soothing female voice' },
                  { id: 'alloy', name: 'Alloy', description: 'Peaceful & balanced neutral voice' },
                  { id: 'echo', name: 'Echo', description: 'Deep & contemplative male voice' },
                  { id: 'fable', name: 'Fable', description: 'Wise & nurturing male voice' },
                  { id: 'onyx', name: 'Onyx', description: 'Strong & grounding male voice' }
                ].map((voice) => (
                  <Button
                    key={voice.id}
                    variant={selectedVoice === voice.id ? "default" : "outline"}
                    className={`p-3 h-auto text-left flex-col items-start ${
                      selectedVoice === voice.id ? 'bg-purple-600 hover:bg-purple-700' : ''
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs opacity-75">{voice.description}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Background Music Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Background Music</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choose peaceful background sounds to accompany your meditation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(backgroundMusicOptions).map(([key, option]) => (
                  <Button
                    key={key}
                    variant={backgroundMusicType === key ? "default" : "outline"}
                    className={`p-3 h-auto text-left flex-col items-start ${
                      backgroundMusicType === key ? 'bg-purple-600 hover:bg-purple-700' : ''
                    }`}
                    onClick={() => {
                      setBackgroundMusicType(key);
                      previewSound(key);
                    }}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs opacity-75">{option.description}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}