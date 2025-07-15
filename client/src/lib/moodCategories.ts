// Shared mood categories for both Check-In and SOAP systems
// Note: Labels use translation keys, actual translations are provided via useLanguage hook
export const getMoodCategories = (t: (key: string) => string) => [
  {
    title: t('moodCategories.emotionalSupport'),
    icon: "💙",
    moods: [
      { id: "anxious", label: t('moods.anxious'), icon: "😰", subtitle: "peace, comfort" },
      { id: "depressed", label: t('moods.depressed'), icon: "😞", subtitle: "hope, light" },
      { id: "lonely", label: t('moods.lonely'), icon: "😔", subtitle: "fellowship, connection" },
      { id: "grieving", label: t('moods.grieving'), icon: "💔", subtitle: "comfort, healing" },
      { id: "fearful", label: t('moods.fearful'), icon: "😨", subtitle: "courage, protection" },
      { id: "overwhelmed", label: t('moods.overwhelmed'), icon: "😵", subtitle: "rest, peace" },
      { id: "doubtful", label: t('moods.doubtful'), icon: "🤔", subtitle: "faith, assurance" },
      { id: "angry", label: t('moods.angry'), icon: "😠", subtitle: "patience, forgiveness" },
    ]
  },
  {
    title: t('moodCategories.growthTransformation'),
    icon: "🌱",
    moods: [
      { id: "seeking", label: t('moods.seeking'), icon: "🧭", subtitle: "guidance, wisdom" },
      { id: "repentant", label: t('moods.repentant'), icon: "🙏", subtitle: "forgiveness, renewal" },
      { id: "motivated", label: t('moods.motivated'), icon: "🔥", subtitle: "purpose, strength" },
      { id: "curious", label: t('moods.curious'), icon: "🤓", subtitle: "knowledge, understanding" },
      { id: "determined", label: t('moods.determined'), icon: "💪", subtitle: "perseverance, victory" },
      { id: "reflective", label: t('moods.reflective'), icon: "🤲", subtitle: "wisdom, insight" },
      { id: "inspired", label: t('moods.inspired'), icon: "✨", subtitle: "creativity, vision" },
      { id: "focused", label: t('moods.focused'), icon: "🎯", subtitle: "clarity, purpose" },
    ]
  },
  {
    title: t('moodCategories.lifeSituations'),
    icon: "🏠",
    moods: [
      { id: "celebrating", label: t('moods.celebrating'), icon: "🎉", subtitle: "gratitude, praise" },
      { id: "transitioning", label: t('moods.transitioning'), icon: "🚪", subtitle: "guidance, stability" },
      { id: "healing", label: t('moods.healing'), icon: "🩹", subtitle: "restoration, wholeness" },
      { id: "parenting", label: t('moods.parenting'), icon: "👨‍👩‍👧‍👦", subtitle: "wisdom, patience" },
      { id: "working", label: t('moods.working'), icon: "💼", subtitle: "balance, provision" },
      { id: "relationship", label: t('moods.relationship'), icon: "💕", subtitle: "love, reconciliation" },
      { id: "financial", label: t('moods.financial'), icon: "💰", subtitle: "provision, trust" },
      { id: "health", label: t('moods.health'), icon: "🏥", subtitle: "healing, strength" },
    ]
  },
  {
    title: t('moodCategories.faithWorship'),
    icon: "⛪",
    moods: [
      { id: "grateful", label: t('moods.grateful'), icon: "🙌", subtitle: "thanksgiving, praise" },
      { id: "peaceful", label: t('moods.peaceful'), icon: "🕊️", subtitle: "rest, serenity" },
      { id: "joyful", label: t('moods.joyful'), icon: "😊", subtitle: "celebration, praise" },
      { id: "blessed", label: t('moods.blessed'), icon: "😇", subtitle: "gratitude, testimony" },
      { id: "prayerful", label: t('moods.praying'), icon: "🙏", subtitle: "communion, intercession" },
      { id: "worshipful", label: t('moods.worshipful'), icon: "🎵", subtitle: "adoration, praise" },
      { id: "hopeful", label: t('moods.hopeful'), icon: "🌅", subtitle: "faith, expectation" },
      { id: "content", label: t('moods.content'), icon: "😌", subtitle: "satisfaction, peace" },
    ]
  }
];

// Legacy export for backward compatibility - components should update to use getMoodCategories(t) 
export const moodCategories = getMoodCategories((key: string) => key);

// Flatten all moods for easy lookup
export const getAllMoods = (t: (key: string) => string) => {
  return getMoodCategories(t).flatMap(category => 
    category.moods.map(mood => ({ ...mood, category: category.title }))
  );
};

// Legacy backward compatibility
export const allMoods = getAllMoods((key: string) => key);

// Get mood by ID
export const getMoodById = (id: string) => {
  return allMoods.find(mood => mood.id === id);
};

// Get mood data for multiple IDs
export const getMoodsByIds = (ids: string[]) => {
  return allMoods.filter(mood => ids.includes(mood.id));
};

// Convert mood IDs to display string
export const formatMoodsForDisplay = (moodIds: string[]) => {
  const moods = getMoodsByIds(moodIds);
  return moods.map(mood => mood.label).join(", ");
};