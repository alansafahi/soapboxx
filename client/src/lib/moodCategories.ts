// Shared mood categories for both Check-In and SOAP systems
export const moodCategories = [
  {
    title: "Emotional & Spiritual Support",
    icon: "💙",
    moods: [
      { id: "anxious", label: "Anxious", icon: "😰", subtitle: "peace, comfort" },
      { id: "depressed", label: "Depressed", icon: "😞", subtitle: "hope, light" },
      { id: "lonely", label: "Lonely", icon: "😔", subtitle: "fellowship, connection" },
      { id: "grieving", label: "Grieving", icon: "💔", subtitle: "comfort, healing" },
      { id: "fearful", label: "Fearful", icon: "😨", subtitle: "courage, protection" },
      { id: "overwhelmed", label: "Overwhelmed", icon: "😵", subtitle: "rest, peace" },
      { id: "doubtful", label: "Doubtful", icon: "🤔", subtitle: "faith, assurance" },
      { id: "angry", label: "Angry", icon: "😠", subtitle: "patience, forgiveness" },
    ]
  },
  {
    title: "Growth & Transformation",
    icon: "🌱",
    moods: [
      { id: "seeking", label: "Seeking Direction", icon: "🧭", subtitle: "guidance, wisdom" },
      { id: "repentant", label: "Repentant", icon: "🙏", subtitle: "forgiveness, renewal" },
      { id: "motivated", label: "Motivated", icon: "🔥", subtitle: "purpose, strength" },
      { id: "curious", label: "Curious", icon: "🤓", subtitle: "knowledge, understanding" },
      { id: "determined", label: "Determined", icon: "💪", subtitle: "perseverance, victory" },
      { id: "reflective", label: "Reflective", icon: "🤲", subtitle: "wisdom, insight" },
      { id: "inspired", label: "Inspired", icon: "✨", subtitle: "creativity, vision" },
      { id: "focused", label: "Focused", icon: "🎯", subtitle: "clarity, purpose" },
    ]
  },
  {
    title: "Life Situations",
    icon: "🏠",
    moods: [
      { id: "celebrating", label: "Celebrating", icon: "🎉", subtitle: "gratitude, praise" },
      { id: "transitioning", label: "In Transition", icon: "🚪", subtitle: "guidance, stability" },
      { id: "healing", label: "Healing", icon: "🩹", subtitle: "restoration, wholeness" },
      { id: "parenting", label: "Parenting Challenges", icon: "👨‍👩‍👧‍👦", subtitle: "wisdom, patience" },
      { id: "working", label: "Work Stress", icon: "💼", subtitle: "balance, provision" },
      { id: "relationship", label: "Relationship Issues", icon: "💕", subtitle: "love, reconciliation" },
      { id: "financial", label: "Financial Concerns", icon: "💰", subtitle: "provision, trust" },
      { id: "health", label: "Health Concerns", icon: "🏥", subtitle: "healing, strength" },
    ]
  },
  {
    title: "Faith & Worship",
    icon: "⛪",
    moods: [
      { id: "grateful", label: "Grateful", icon: "🙌", subtitle: "thanksgiving, praise" },
      { id: "peaceful", label: "Peaceful", icon: "🕊️", subtitle: "rest, serenity" },
      { id: "joyful", label: "Joyful", icon: "😊", subtitle: "celebration, praise" },
      { id: "blessed", label: "Blessed", icon: "😇", subtitle: "gratitude, testimony" },
      { id: "prayerful", label: "Prayerful", icon: "🙏", subtitle: "communion, intercession" },
      { id: "worshipful", label: "Worshipful", icon: "🎵", subtitle: "adoration, praise" },
      { id: "hopeful", label: "Hopeful", icon: "🌅", subtitle: "faith, expectation" },
      { id: "content", label: "Content", icon: "😌", subtitle: "satisfaction, peace" },
    ]
  }
];

// Flatten all moods for easy lookup
export const allMoods = moodCategories.flatMap(category => 
  category.moods.map(mood => ({ ...mood, category: category.title }))
);

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