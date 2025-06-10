import { DailyVerse } from "@shared/schema";

// Journey type definitions and content
export interface JourneyType {
  type: string;
  name: string;
  description: string;
  series: JourneySeries[];
}

export interface JourneySeries {
  name: string;
  description: string;
  verses: DailyVerse[];
}

// Sample journey content with different verse types
export const journeyTypes: JourneyType[] = [
  {
    type: "reading",
    name: "Scripture Reading",
    description: "Daily verses with reflection questions",
    series: [
      {
        name: "Psalms of Peace",
        description: "Finding peace in God's promises",
        verses: [
          {
            id: 1,
            date: new Date(),
            verseReference: "Psalm 23:1",
            verseText: "The Lord is my shepherd, I lack nothing.",
            verseTextNiv: "The Lord is my shepherd, I lack nothing.",
            verseTextKjv: "The Lord is my shepherd; I shall not want.",
            verseTextEsv: "The Lord is my shepherd; I shall not want.",
            verseTextNlt: "The Lord is my shepherd; I have all that I need.",
            theme: "Divine Provision",
            reflectionPrompt: "How has God provided for you in unexpected ways?",
            guidedPrayer: "Lord, thank you for being my shepherd and provider. Help me trust in your care today.",
            journeyType: "reading",
            seriesName: "Psalms of Peace",
            seriesOrder: 1,
            difficulty: "beginner",
            estimatedMinutes: 5,
            tags: ["peace", "provision", "trust"],
            backgroundImageUrl: null,
            audioUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            date: new Date(),
            verseReference: "Psalm 46:10",
            verseText: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
            verseTextNiv: "Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.",
            verseTextKjv: "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.",
            verseTextEsv: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!",
            verseTextNlt: "Be still, and know that I am God! I will be honored by every nation. I will be honored throughout the world.",
            theme: "Stillness and Trust",
            reflectionPrompt: "What areas of your life need more stillness and surrender to God?",
            guidedPrayer: "God, help me be still and remember your sovereignty over all things.",
            journeyType: "reading",
            seriesName: "Psalms of Peace",
            seriesOrder: 2,
            difficulty: "beginner",
            estimatedMinutes: 5,
            tags: ["stillness", "sovereignty", "peace"],
            backgroundImageUrl: null,
            audioUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      }
    ]
  },
  {
    type: "audio",
    name: "Audio Journey",
    description: "Listen to narrated Bible passages",
    series: [
      {
        name: "Jesus' Parables",
        description: "Audio journey through Christ's teachings",
        verses: [
          {
            id: 3,
            date: new Date(),
            verseReference: "Matthew 13:3-8",
            verseText: "Then he told them many things in parables, saying: 'A farmer went out to sow his seed. As he was scattering the seed, some fell along the path, and the birds came and ate it up. Some fell on rocky places, where it did not have much soil. It sprang up quickly, because the soil was shallow. But when the sun came up, the plants were scorched, and they withered because they had no root. Other seed fell among thorns, which grew up and choked the plants. Still other seed fell on good soil, where it produced a crop—a hundred, sixty or thirty times what was sown.'",
            verseTextNiv: "Then he told them many things in parables, saying: 'A farmer went out to sow his seed. As he was scattering the seed, some fell along the path, and the birds came and ate it up. Some fell on rocky places, where it did not have much soil. It sprang up quickly, because the soil was shallow. But when the sun came up, the plants were scorched, and they withered because they had no root. Other seed fell among thorns, which grew up and choked the plants. Still other seed fell on good soil, where it produced a crop—a hundred, sixty or thirty times what was sown.'",
            theme: "Parable of the Sower",
            reflectionPrompt: "What kind of soil represents your heart today?",
            guidedPrayer: "Lord, prepare my heart to be good soil for your Word.",
            journeyType: "audio",
            seriesName: "Jesus' Parables",
            seriesOrder: 1,
            difficulty: "intermediate",
            estimatedMinutes: 8,
            tags: ["parables", "growth", "hearing"],
            backgroundImageUrl: null,
            audioUrl: "/audio/parable-sower.mp3",
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      }
    ]
  },
  {
    type: "meditation",
    name: "Meditative Study",
    description: "Guided meditation on God's Word",
    series: [
      {
        name: "Breath Prayers",
        description: "Scripture-based breathing meditations",
        verses: [
          {
            id: 4,
            date: new Date(),
            verseReference: "Psalm 139:14",
            verseText: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
            verseTextNiv: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.",
            theme: "Wonderfully Made",
            reflectionPrompt: "Breathe in: 'I am fearfully...' Breathe out: '...and wonderfully made.'",
            guidedPrayer: "Creator God, help me embrace how you've uniquely crafted me.",
            journeyType: "meditation",
            seriesName: "Breath Prayers",
            seriesOrder: 1,
            difficulty: "beginner",
            estimatedMinutes: 10,
            tags: ["identity", "creation", "breath"],
            backgroundImageUrl: null,
            audioUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      }
    ]
  },
  {
    type: "study",
    name: "Deep Study",
    description: "In-depth Bible study with commentary",
    series: [
      {
        name: "Romans Deep Dive",
        description: "Theological exploration of Paul's letter",
        verses: [
          {
            id: 5,
            date: new Date(),
            verseReference: "Romans 8:28",
            verseText: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
            verseTextNiv: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
            theme: "God's Sovereign Purpose",
            reflectionPrompt: "How does understanding God's sovereignty change your perspective on current challenges? Consider the Greek word 'synergo' (works together) - how might God be weaving your circumstances together for good?",
            guidedPrayer: "Sovereign Lord, help me trust your purpose even when I cannot see the full picture.",
            journeyType: "study",
            seriesName: "Romans Deep Dive",
            seriesOrder: 1,
            difficulty: "advanced",
            estimatedMinutes: 15,
            tags: ["sovereignty", "purpose", "theology"],
            backgroundImageUrl: null,
            audioUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]
      }
    ]
  }
];

export function getJourneyByType(journeyType: string): JourneyType | undefined {
  return journeyTypes.find(j => j.type === journeyType);
}

export function getVerseForJourney(journeyType: string, seriesName: string, seriesOrder: number): DailyVerse | undefined {
  const journey = getJourneyByType(journeyType);
  if (!journey) return undefined;
  
  const series = journey.series.find(s => s.name === seriesName);
  if (!series) return undefined;
  
  return series.verses.find(v => v.seriesOrder === seriesOrder);
}

export function getDailyVerseForUser(journeyType: string = "reading", currentProgress: number = 0): DailyVerse | undefined {
  const journey = getJourneyByType(journeyType);
  if (!journey || journey.series.length === 0) return undefined;
  
  // For now, use the first series
  const series = journey.series[0];
  const nextOrder = currentProgress + 1;
  
  return series.verses.find(v => v.seriesOrder === nextOrder) || series.verses[0];
}