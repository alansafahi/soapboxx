/**
 * Performance Optimization Service
 * Implements caching, data pre-loading, and efficient queries
 * to reduce processing time and external API costs
 */

import { DatabaseStorage } from './storage';
import memoize from 'memoizee';

export class PerformanceOptimizer {
  private storage: DatabaseStorage;
  private verseCache: Map<string, any> = new Map();
  private popularVersesCache: any[] = [];
  private analyticsCache: Map<string, any> = new Map();
  private lastCacheUpdate: Date = new Date();

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
    this.initializeCache();
  }

  // Initialize performance caches on startup
  async initializeCache() {
    await this.preloadPopularVerses();
    await this.preloadFrequentAnalytics();
    console.log('Performance caches initialized');
  }

  // Pre-load 1000 most popular Bible verses to eliminate API calls
  async preloadPopularVerses() {
    try {
      const verses = await this.storage.getBibleVerses({
        limit: 1000,
        orderBy: 'popularity_score',
        direction: 'desc'
      });

      this.popularVersesCache = verses;
      
      // Create reference-based lookup for O(1) access
      verses.forEach(verse => {
        this.verseCache.set(verse.reference.toLowerCase(), verse);
        this.verseCache.set(`${verse.book} ${verse.chapter}:${verse.verse}`.toLowerCase(), verse);
      });

      console.log(`Cached ${verses.length} popular Bible verses for instant lookup`);
    } catch (error) {
      console.error('Failed to preload popular verses:', error);
    }
  }

  // Cached verse lookup - eliminates external API calls
  getCachedVerse(reference: string): any | null {
    const normalizedRef = reference.toLowerCase().trim();
    return this.verseCache.get(normalizedRef) || null;
  }

  // Get verses by topic from cache
  getCachedVersesByTopic(topic: string, limit: number = 10): any[] {
    return this.popularVersesCache
      .filter(verse => 
        verse.topicTags?.includes(topic.toLowerCase()) ||
        verse.category === topic.toLowerCase()
      )
      .slice(0, limit);
  }

  // Memoized analytics calculations to reduce database queries
  private calculateDonationAnalytics = memoize(
    async (churchId: number, timeframe: string) => {
      const cacheKey = `analytics_${churchId}_${timeframe}`;
      
      if (this.analyticsCache.has(cacheKey)) {
        const cached = this.analyticsCache.get(cacheKey);
        // Return cached data if less than 5 minutes old
        if (Date.now() - cached.timestamp < 300000) {
          return cached.data;
        }
      }

      // Calculate fresh analytics
      const donations = await this.storage.getDonationsByChurch(churchId, timeframe);
      
      const analytics = {
        totalAmount: donations.reduce((sum, d) => sum + Number(d.amount), 0),
        totalDonations: donations.length,
        uniqueDonors: new Set(donations.map(d => d.donorId || d.donorEmail)).size,
        averageDonation: donations.length > 0 ? 
          donations.reduce((sum, d) => sum + Number(d.amount), 0) / donations.length : 0,
        donorRetention: this.calculateRetentionRate(donations),
        givingFrequency: this.analyzeGivingFrequency(donations),
        seasonalTrends: this.analyzeSeasonalTrends(donations)
      };

      // Cache the results
      this.analyticsCache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    },
    { maxAge: 300000, max: 100 } // Cache for 5 minutes, max 100 entries
  );

  // Optimized donor retention calculation
  private calculateRetentionRate(donations: any[]): number {
    if (donations.length < 2) return 0;

    const donorGivingDates = new Map<string, Date[]>();
    
    donations.forEach(donation => {
      const donorId = donation.donorId || donation.donorEmail;
      if (!donorId) return;
      
      if (!donorGivingDates.has(donorId)) {
        donorGivingDates.set(donorId, []);
      }
      donorGivingDates.get(donorId)!.push(new Date(donation.donationDate));
    });

    let repeatDonors = 0;
    donorGivingDates.forEach(dates => {
      if (dates.length > 1) repeatDonors++;
    });

    return (repeatDonors / donorGivingDates.size) * 100;
  }

  // Efficient giving frequency analysis
  private analyzeGivingFrequency(donations: any[]): any {
    const frequencies = {
      weekly: 0,
      monthly: 0,
      quarterly: 0,
      annual: 0,
      oneTime: 0
    };

    const donorFrequencies = new Map<string, number>();
    
    donations.forEach(donation => {
      const donorId = donation.donorId || donation.donorEmail;
      if (!donorId) return;
      
      donorFrequencies.set(donorId, (donorFrequencies.get(donorId) || 0) + 1);
    });

    donorFrequencies.forEach(count => {
      if (count >= 52) frequencies.weekly++;
      else if (count >= 12) frequencies.monthly++;
      else if (count >= 4) frequencies.quarterly++;
      else if (count >= 2) frequencies.annual++;
      else frequencies.oneTime++;
    });

    return frequencies;
  }

  // Seasonal trends analysis with caching
  private analyzeSeasonalTrends(donations: any[]): any {
    const monthlyTotals = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);

    donations.forEach(donation => {
      const month = new Date(donation.donationDate).getMonth();
      monthlyTotals[month] += Number(donation.amount);
      monthlyCounts[month]++;
    });

    return {
      monthlyTotals,
      monthlyCounts,
      peakMonth: monthlyTotals.indexOf(Math.max(...monthlyTotals)),
      averageMonthlyAmount: monthlyTotals.reduce((a, b) => a + b, 0) / 12
    };
  }

  // Optimized SMS giving stats with aggregation
  async getOptimizedSMSStats(churchId: number): Promise<any> {
    const cacheKey = `sms_stats_${churchId}`;
    
    if (this.analyticsCache.has(cacheKey)) {
      const cached = this.analyticsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        return cached.data;
      }
    }

    // Use efficient aggregation query instead of fetching all records
    const stats = await this.storage.getAggregatedSMSStats(churchId);
    
    this.analyticsCache.set(cacheKey, {
      data: stats,
      timestamp: Date.now()
    });

    return stats;
  }

  // Batch operations for bulk data processing
  async batchProcessDonations(donations: any[]): Promise<void> {
    const batchSize = 100;
    
    for (let i = 0; i < donations.length; i += batchSize) {
      const batch = donations.slice(i, i + batchSize);
      await this.storage.insertDonationsBatch(batch);
    }
  }

  // Pre-computed AI responses for common queries
  private commonAIResponses = new Map([
    ['anxiety_verse', 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.'],
    ['peace_verse', 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.'],
    ['hope_verse', 'For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future.'],
    ['love_verse', 'And now these three remain: faith, hope and love. But the greatest of these is love.'],
    ['strength_verse', 'I can do all this through him who gives me strength.'],
    ['forgiveness_verse', 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.']
  ]);

  // Get pre-computed AI response or generate new one
  async getOptimizedAIResponse(topic: string, context?: string): Promise<string> {
    const cacheKey = `ai_${topic}_${context || 'default'}`;
    
    // Check pre-computed responses first
    if (this.commonAIResponses.has(topic)) {
      return this.commonAIResponses.get(topic)!;
    }

    // Check cache for custom responses
    if (this.analyticsCache.has(cacheKey)) {
      const cached = this.analyticsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }

    // Generate new response and cache it
    const response = await this.generateAIResponse(topic, context);
    
    this.analyticsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    return response;
  }

  private async generateAIResponse(topic: string, context?: string): Promise<string> {
    // This would call the actual AI service
    // For now, return contextual response based on topic
    const responses = {
      'sermon_outline': 'I. Introduction - Hook your audience\nII. Scripture Foundation\nIII. Main Points (3-4 key messages)\nIV. Application\nV. Conclusion with Call to Action',
      'prayer_request': 'Heavenly Father, we lift up this request to You, trusting in Your perfect will and timing.',
      'bible_study': 'Let\'s explore this passage by examining the historical context, original audience, and practical application for today.'
    };

    return responses[topic as keyof typeof responses] || 'Thank you for your request. Let me provide guidance based on Scripture.';
  }

  // Database query optimization with proper indexing
  async optimizeQueries(): Promise<void> {
    const optimizations = [
      // Create composite indexes for frequent queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_church_date ON donations(church_id, donation_date);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_method_status ON donations(method, status);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_verses_popularity ON bible_verses(popularity_score DESC, category);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_church_role ON users(current_church_id, current_role);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_church_date ON events(church_id, event_date);',
      
      // Partial indexes for active records
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_donations ON donations(church_id, created_at) WHERE status = \'completed\';',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_verses ON bible_verses(reference, book) WHERE is_active = true;',
      
      // JSON indexes for metadata queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donation_metadata ON donations USING GIN(metadata);',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences ON users USING GIN(preferences);'
    ];

    for (const query of optimizations) {
      try {
        await this.storage.executeRawQuery(query);
        console.log('Applied query optimization:', query.substring(0, 50) + '...');
      } catch (error) {
        console.log('Optimization already exists or failed:', error.message);
      }
    }
  }

  // Memory cleanup and cache management
  clearExpiredCaches(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    for (const [key, value] of this.analyticsCache.entries()) {
      if (now - value.timestamp > maxAge) {
        this.analyticsCache.delete(key);
      }
    }

    // Refresh popular verses cache daily
    if (now - this.lastCacheUpdate.getTime() > 86400000) {
      this.preloadPopularVerses();
      this.lastCacheUpdate = new Date();
    }
  }

  // Performance metrics tracking
  getPerformanceMetrics(): any {
    return {
      verseCacheSize: this.verseCache.size,
      popularVersesCount: this.popularVersesCache.length,
      analyticsCacheSize: this.analyticsCache.size,
      lastCacheUpdate: this.lastCacheUpdate,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer(new DatabaseStorage());