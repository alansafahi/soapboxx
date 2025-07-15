// Shared mood categories for both Check-In and SOAP systems
// Note: Labels use translation keys, actual translations are provided via useLanguage hook
export const getMoodCategories = (t: (key: string) => string) => [
  {
    title: t('moodCategories.emotionalSupport'),
    icon: "💙",
    moods: [
      { id: "anxious", label: t('moods.anxious'), icon: "😰", subtitle: t('moods.anxious.tooltip') },
      { id: "depressed", label: t('moods.depressed'), icon: "😞", subtitle: t('moods.depressed.tooltip') },
      { id: "lonely", label: t('moods.lonely'), icon: "😔", subtitle: t('moods.lonely.tooltip') },
      { id: "grieving", label: t('moods.grieving'), icon: "💔", subtitle: t('moods.grieving.tooltip') },
      { id: "fearful", label: t('moods.fearful'), icon: "😨", subtitle: t('moods.fearful.tooltip') },
      { id: "overwhelmed", label: t('moods.overwhelmed'), icon: "😵", subtitle: t('moods.overwhelmed.tooltip') },
      { id: "doubtful", label: t('moods.doubtful'), icon: "🤔", subtitle: t('moods.doubtful.tooltip') },
      { id: "angry", label: t('moods.angry'), icon: "😠", subtitle: t('moods.angry.tooltip') },
    ]
  },
  {
    title: t('moodCategories.growthTransformation'),
    icon: "🌱",
    moods: [
      { id: "seeking", label: t('moods.seeking'), icon: "🧭", subtitle: t('moods.seeking.tooltip') },
      { id: "repentant", label: t('moods.repentant'), icon: "🙏", subtitle: t('moods.repentant.tooltip') },
      { id: "motivated", label: t('moods.motivated'), icon: "🔥", subtitle: t('moods.motivated.tooltip') },
      { id: "curious", label: t('moods.curious'), icon: "🤓", subtitle: t('moods.curious.tooltip') },
      { id: "determined", label: t('moods.determined'), icon: "💪", subtitle: t('moods.determined.tooltip') },
      { id: "reflective", label: t('moods.reflective'), icon: "🤲", subtitle: t('moods.reflective.tooltip') },
      { id: "inspired", label: t('moods.inspired'), icon: "✨", subtitle: t('moods.inspired.tooltip') },
      { id: "focused", label: t('moods.focused'), icon: "🎯", subtitle: t('moods.focused.tooltip') },
    ]
  },
  {
    title: t('moodCategories.lifeSituations'),
    icon: "🏠",
    moods: [
      { id: "celebrating", label: t('moods.celebrating'), icon: "🎉", subtitle: t('moods.celebrating.tooltip') },
      { id: "transitioning", label: t('moods.transitioning'), icon: "🚪", subtitle: t('moods.transitioning.tooltip') },
      { id: "healing", label: t('moods.healing'), icon: "🩹", subtitle: t('moods.healing.tooltip') },
      { id: "parenting", label: t('moods.parenting'), icon: "👨‍👩‍👧‍👦", subtitle: t('moods.parenting.tooltip') },
      { id: "working", label: t('moods.working'), icon: "💼", subtitle: t('moods.working.tooltip') },
      { id: "relationship", label: t('moods.relationship'), icon: "💕", subtitle: t('moods.relationship.tooltip') },
      { id: "financial", label: t('moods.financial'), icon: "💰", subtitle: t('moods.financial.tooltip') },
      { id: "health", label: t('moods.health'), icon: "🏥", subtitle: t('moods.health.tooltip') },
    ]
  },
  {
    title: t('moodCategories.faithWorship'),
    icon: "⛪",
    moods: [
      { id: "grateful", label: t('moods.grateful'), icon: "🙌", subtitle: t('moods.grateful.tooltip') },
      { id: "peaceful", label: t('moods.peaceful'), icon: "🕊️", subtitle: t('moods.peaceful.tooltip') },
      { id: "joyful", label: t('moods.joyful'), icon: "😊", subtitle: t('moods.joyful.tooltip') },
      { id: "blessed", label: t('moods.blessed'), icon: "😇", subtitle: t('moods.blessed.tooltip') },
      { id: "prayerful", label: t('moods.praying'), icon: "🙏", subtitle: t('moods.prayerful.tooltip') },
      { id: "worshipful", label: t('moods.worshipful'), icon: "🎵", subtitle: t('moods.worshipful.tooltip') },
      { id: "hopeful", label: t('moods.hopeful'), icon: "🌅", subtitle: t('moods.hopeful.tooltip') },
      { id: "content", label: t('moods.content'), icon: "😌", subtitle: t('moods.content.tooltip') },
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