import { db } from "./db";
import { translations } from "../shared/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * Translation Optimizer: Manages core UI translations and AI fallback
 * Hybrid approach to reduce technical debt while maintaining performance
 */

// Core UI translation keys that should always be in database (fast access)
export const CORE_TRANSLATION_KEYS = [
  // Navigation essentials
  'nav.home', 'nav.messages', 'nav.contacts', 'nav.churches', 'nav.events',
  'nav.profile', 'nav.settings', 'nav.signOut', 'nav.donation', 'nav.discussions',
  'nav.todaysReading', 'nav.prayerWall', 'nav.engagementBoard', 'nav.soapJournal',
  'nav.audioBible', 'nav.audioRoutines', 'nav.videoLibrary', 'nav.imageGallery',
  'nav.memberDirectory', 'nav.qrCodeManagement', 'nav.donationAnalytics',
  'nav.communicationHub', 'nav.sermonStudio', 'nav.engagementAnalytics',
  'nav.churchManagement', 'nav.aiTranslationAdmin',
  
  // Buttons and actions
  'buttons.cancel', 'buttons.save', 'buttons.edit', 'buttons.delete', 
  'buttons.submit', 'buttons.back', 'buttons.next', 'buttons.send',
  'buttons.postComment', 'buttons.posting',
  
  // Common UI elements
  'common.loading', 'common.error', 'common.success', 'common.viewAll',
  'common.viewAllMessages', 'common.search', 'common.filter',
  
  // Notifications
  'notifications.noNewNotifications', 'notifications.markAllRead',
  
  // Comments system
  'comments.shareThoughts', 'comments.noCommentsYet', 'comments.viewAllComments',
  'comments.viewAllCount', 'comments.title',
  
  // Settings core
  'settings.title', 'settings.description', 'language.label', 'theme.label',
  
  // Section headers
  'sections.community', 'sections.spiritualTools', 'sections.mediaContents',
  'sections.adminPortal', 'sections.account', 'sections.soapboxPortal',
  
  // Bible/spiritual core
  'bible.title', 'bible.share', 'bible.reflect', 'bible.loading',
  
  // Check-ins
  'checkin.dailyCheckIn', 'checkin.howAreYouFeeling', 'checkin.shareJourney', 'checkin.buildStreak',
  'moodCheckin.aiMoodCheckIn', 'posts.recentCheckIns', 'posts.noRecentCheckIns',
  
  // Home page
  'home.dailySpiritualRhythm', 'home.latestPosts', 'home.topCommunityMembers', 'home.upcomingEvents',
  
  // Page titles
  'pages.messages', 'pages.conversations', 'pages.connectWithFaith',
  
  // Messages system
  'messages.searchConversations', 'messages.title', 'messages.conversations', 
  'messages.searchPlaceholder', 'messages.newMessage',
  
  // Events
  'events.upcomingEvents', 'events.viewAllEvents', 'events.createEvent',
  
  // Posts
  'posts.whatsOnYourHeart', 'posts.shareThoughts',
  
  // Audio/Media
  'audioBible.title', 'audioRoutines.title', 'imageGallery.title',
  
  // SOAP entries
  'soap.title', 'soap.newEntry', 'soap.sharedEntries',
  
  // Prayer wall
  'prayerWall.title', 'prayerWall.addRequest'
];

export class TranslationOptimizer {
  
  /**
   * Get core translations for all languages (database stored)
   */
  async getCoreTranslations(language: string): Promise<Record<string, string>> {
    const coreTranslations = await db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.language, language),
          inArray(translations.translationKey, CORE_TRANSLATION_KEYS)
        )
      );
    
    const translationMap: Record<string, string> = {};
    coreTranslations.forEach(t => {
      translationMap[t.translationKey] = t.value;
    });
    
    return translationMap;
  }

  /**
   * Get statistics about current translation usage
   */
  async getTranslationStats() {
    try {
      const stats = await db
        .select({
          language: translations.language,
          totalKeys: sql<number>`COUNT(*)`.as('total_keys'),
          coreKeys: sql<number>`COUNT(CASE WHEN ${translations.translationKey} = ANY(${CORE_TRANSLATION_KEYS}) THEN 1 END)`.as('core_keys')
        })
        .from(translations)
        .groupBy(translations.language);
      
      return stats;
    } catch (error) {
      console.error('Error getting translation stats:', error);
      return [];
    }
  }

  /**
   * Clean up unused translations (keep only core + frequently used)
   */
  async optimizeDatabase() {
    // Get frequently used translation keys across all components
    const frequentlyUsedKeys = await this.getFrequentlyUsedKeys();
    
    const keysToKeep = [...CORE_TRANSLATION_KEYS, ...frequentlyUsedKeys];
    
    // Remove translations not in the keep list
    const deletedCount = await db
      .delete(translations)
      .where(
        inArray(translations.translationKey, keysToKeep.map(k => `NOT_${k}`))
      );
    
    return {
      coreKeysKept: CORE_TRANSLATION_KEYS.length,
      frequentKeysKept: frequentlyUsedKeys.length,
      totalKeysKept: keysToKeep.length,
      deletedCount
    };
  }

  /**
   * Identify frequently used translation keys from component analysis
   */
  private async getFrequentlyUsedKeys(): Promise<string[]> {
    // This would analyze component usage patterns
    // For now, return commonly used patterns
    return [
      'ai.title', 'ai.description',
      'moodCheckin.howAreYouFeeling',
      'pages.communityEvents', 'pages.memberDirectory',
      'general.optional', 'general.selected', 'general.characters',
      'mood.categories.emotional', 'mood.categories.growth',
      'forms.required', 'forms.optional', 'forms.placeholder'
    ];
  }

  /**
   * Backup all translations before optimization
   */
  async createBackup(): Promise<any[]> {
    const allTranslations = await db
      .select()
      .from(translations);
    
    return allTranslations;
  }

  /**
   * Restore from backup if needed
   */
  async restoreFromBackup(backup: any[]) {
    // Clear current translations
    await db.delete(translations);
    
    // Restore from backup
    await db.insert(translations).values(backup);
    
    return { restored: backup.length };
  }
}

export const translationOptimizer = new TranslationOptimizer();