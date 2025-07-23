/**
 * Mapping Service for SoapBox Super App
 * 
 * This service provides a safe integration layer between the existing codebase
 * and the new field mapping utilities. It acts as middleware to gradually
 * standardize naming conventions without breaking existing functionality.
 */

import { 
  toDatabase, 
  fromDatabase, 
  mapUserFields, 
  mapContentFields,
  FIELD_MAPPINGS,
  REVERSE_FIELD_MAPPINGS,
  safeMappingWithValidation,
  createBackwardCompatibleMapping,
  debugFieldMapping
} from "../shared/field-mapping";

export class MappingService {
  
  // ============================================================================
  // USER DATA MAPPING
  // ============================================================================
  
  /**
   * Standardizes user data structure across the application
   * Handles both database and frontend user objects
   */
  static mapUser(userData: any): any {
    if (!userData) return null;
    
    return safeMappingWithValidation(
      userData,
      mapUserFields,
      ['id'] // Only require ID as essential field
    );
  }

  /**
   * Prepares user data for database operations
   * Converts frontend camelCase to database snake_case
   */
  static prepareUserForDatabase(userData: any): any {
    const mapped = toDatabase(userData);
    
    // Ensure critical user fields are properly mapped
    return {
      ...mapped,
      // Handle special cases for user table
      id: userData.id,
      email: userData.email,
      first_name: userData.firstName || userData.first_name,
      last_name: userData.lastName || userData.last_name,
      profile_image: userData.profileImage || userData.profile_image || userData.profileImageUrl || userData.profile_image_url,
      created_at: userData.createdAt || userData.created_at,
      updated_at: userData.updatedAt || userData.updated_at,
    };
  }

  // ============================================================================
  // CONTENT DATA MAPPING
  // ============================================================================

  /**
   * Standardizes content/post data structure
   * Works with discussions, SOAP entries, prayer requests, etc.
   */
  static mapContent(contentData: any): any {
    if (!contentData) return null;

    return safeMappingWithValidation(
      contentData,
      mapContentFields,
      ['id'] // Only require ID as essential field
    );
  }

  /**
   * Prepares content data for database operations
   */
  static prepareContentForDatabase(contentData: any): any {
    const mapped = toDatabase(contentData);
    
    // Handle special content field mappings
    return {
      ...mapped,
      // Ensure critical fields are mapped correctly
      author_id: contentData.authorId || contentData.author_id,
      user_id: contentData.userId || contentData.user_id,
      is_public: contentData.isPublic ?? contentData.is_public ?? true,
      content_type: contentData.type || contentData.contentType || contentData.content_type,
      created_at: contentData.createdAt || contentData.created_at,
      updated_at: contentData.updatedAt || contentData.updated_at,
    };
  }

  // ============================================================================
  // COMMENT DATA MAPPING
  // ============================================================================

  /**
   * Maps comment data for consistent structure
   */
  static mapComment(commentData: any): any {
    if (!commentData) return null;

    return {
      id: commentData.id,
      content: commentData.content || commentData.text,
      author: this.mapUser(commentData.author),
      authorId: commentData.author_id || commentData.authorId,
      userId: commentData.user_id || commentData.userId,
      discussionId: commentData.discussion_id || commentData.discussionId,
      postId: commentData.post_id || commentData.postId,
      parentId: commentData.parent_id || commentData.parentId,
      likeCount: commentData.like_count || commentData.likeCount || 0,
      isLiked: commentData.isLiked || false,
      createdAt: commentData.created_at || commentData.createdAt,
      updatedAt: commentData.updated_at || commentData.updatedAt,
    };
  }

  /**
   * Prepares comment data for database operations
   */
  static prepareCommentForDatabase(commentData: any): any {
    return {
      content: commentData.content,
      author_id: commentData.authorId || commentData.author_id,
      user_id: commentData.userId || commentData.user_id,
      discussion_id: commentData.discussionId || commentData.discussion_id,
      post_id: commentData.postId || commentData.post_id,
      parent_id: commentData.parentId || commentData.parent_id,
      created_at: commentData.createdAt || commentData.created_at || new Date(),
      updated_at: commentData.updatedAt || commentData.updated_at || new Date(),
    };
  }

  // ============================================================================
  // SAFE MIGRATION HELPERS
  // ============================================================================

  /**
   * Safely transforms database results for frontend consumption
   * Handles arrays of objects and single objects
   */
  static safeFromDatabase<T>(databaseResult: T | T[]): any {
    if (!databaseResult) return null;

    if (Array.isArray(databaseResult)) {
      return databaseResult.map(item => fromDatabase(item));
    }

    return fromDatabase(databaseResult);
  }

  /**
   * Safely transforms frontend data for database operations
   * Handles arrays of objects and single objects
   */
  static safeToDatabase<T>(frontendData: T | T[]): any {
    if (!frontendData) return null;

    if (Array.isArray(frontendData)) {
      return frontendData.map(item => toDatabase(item));
    }

    return toDatabase(frontendData);
  }

  // ============================================================================
  // SPECIALIZED MAPPERS FOR MAJOR DATA TYPES
  // ============================================================================

  /**
   * Maps discussion/post data with full author information
   */
  static mapDiscussion(discussionData: any): any {
    if (!discussionData) return null;

    const baseMapping = this.mapContent(discussionData);
    
    return {
      ...baseMapping,
      // Discussion-specific fields
      discussionId: discussionData.discussion_id || discussionData.discussionId || discussionData.id,
      title: discussionData.title,
      content: discussionData.content || discussionData.text,
      attachedMedia: discussionData.attached_media || discussionData.attachedMedia,
      tags: discussionData.tags,
      category: discussionData.category,
      // Ensure proper author mapping
      author: this.mapUser(discussionData.author || {
        id: discussionData.author_id || discussionData.authorId,
        email: discussionData.author_email,
        firstName: discussionData.author_first_name,
        lastName: discussionData.author_last_name,
        profileImage: discussionData.author_profile_image,
        name: discussionData.author_name
      }),
    };
  }

  /**
   * Maps SOAP entry data for consistent display
   */
  static mapSoapEntry(soapData: any): any {
    if (!soapData) return null;

    const baseMapping = this.mapContent(soapData);
    
    return {
      ...baseMapping,
      // SOAP-specific fields
      soapId: soapData.soap_id || soapData.soapId || soapData.id,
      scripture: soapData.scripture,
      observation: soapData.observation,
      application: soapData.application,
      prayer: soapData.prayer,
      moodTag: soapData.mood_tag || soapData.moodTag,
      devotionalDate: soapData.devotional_date || soapData.devotionalDate,
      // Author mapping
      author: this.mapUser(soapData.author || {
        id: soapData.user_id || soapData.userId,
        email: soapData.user_email,
        firstName: soapData.user_first_name,
        lastName: soapData.user_last_name,
        profileImage: soapData.user_profile_image,
        name: soapData.user_name
      }),
    };
  }

  /**
   * Maps prayer request data for consistent display
   */
  static mapPrayerRequest(prayerData: any): any {
    if (!prayerData) return null;

    const baseMapping = this.mapContent(prayerData);
    
    return {
      ...baseMapping,
      // Prayer-specific fields
      prayerId: prayerData.prayer_id || prayerData.prayerId || prayerData.id,
      title: prayerData.title,
      content: prayerData.content || prayerData.description,
      category: prayerData.category,
      urgency: prayerData.urgency,
      isAnonymous: prayerData.is_anonymous || prayerData.isAnonymous,
      status: prayerData.status,
      expiresAt: prayerData.expires_at || prayerData.expiresAt,
      // Prayer-specific counts
      prayCount: prayerData.pray_count || prayerData.prayCount || 0,
      responseCount: prayerData.response_count || prayerData.responseCount || 0,
      // Author mapping
      author: this.mapUser(prayerData.author || {
        id: prayerData.user_id || prayerData.userId,
        email: prayerData.user_email,
        firstName: prayerData.user_first_name,
        lastName: prayerData.user_last_name,
        profileImage: prayerData.user_profile_image,
        name: prayerData.user_name
      }),
    };
  }

  // ============================================================================
  // BACKWARD COMPATIBILITY LAYER
  // ============================================================================

  /**
   * Creates backward-compatible response for gradual migration
   * Includes both old and new field names during transition
   */
  static createCompatibleResponse(data: any): any {
    if (!data) return null;

    if (Array.isArray(data)) {
      return data.map(item => this.createCompatibleResponse(item));
    }

    // Create response with both naming conventions
    const compatibleData = fromDatabase(data);
    
    // Add legacy field names for backward compatibility
    const legacyMappings = {
      // Old field names that might still be used in frontend
      user_id: compatibleData.userId,
      author_id: compatibleData.authorId,
      created_at: compatibleData.createdAt,
      updated_at: compatibleData.updatedAt,
      is_public: compatibleData.isPublic,
      like_count: compatibleData.likeCount,
      comment_count: compatibleData.commentCount,
    };

    return createBackwardCompatibleMapping(compatibleData, legacyMappings);
  }

  // ============================================================================
  // DEBUGGING AND VALIDATION
  // ============================================================================

  /**
   * Validates that mapped data has required fields
   */
  static validateMappedData(data: any, type: 'user' | 'content' | 'comment'): boolean {
    const requiredFields = {
      user: ['id'],
      content: ['id'],
      comment: ['id', 'content']
    };

    const required = requiredFields[type] || [];
    return required.every(field => data && data[field] !== undefined && data[field] !== null);
  }

  /**
   * Debug helper for development
   */
  static debugMapping(data: any, operation: string): void {
    if (process.env.NODE_ENV === 'development') {
      debugFieldMapping(data, operation);
    }
  }
}

// Export mapping service as default
export default MappingService;