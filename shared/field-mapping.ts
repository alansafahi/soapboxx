/**
 * Field Mapping Utilities for Naming Convention Standardization
 * 
 * This utility layer provides safe mapping between different naming conventions
 * across the SoapBox Super App codebase:
 * - Database: snake_case (user_id, author_id, created_at)
 * - Frontend: camelCase (userId, authorId, createdAt) 
 * - API: kebab-case URLs (/api/users/user-profile)
 */

// ============================================================================
// CORE MAPPING FUNCTIONS
// ============================================================================

/**
 * Converts camelCase to snake_case for database operations
 */
export function toSnakeCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  
  return result;
}

/**
 * Converts snake_case to camelCase for frontend consumption
 */
export function toCamelCase(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  
  return result;
}

/**
 * Converts camelCase to kebab-case for API URLs
 */
export function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

// ============================================================================
// STANDARDIZED FIELD MAPPINGS
// ============================================================================

/**
 * Master mapping of frontend field names to database column names
 * This serves as the single source of truth for field mappings
 */
export const FIELD_MAPPINGS = {
  // User-related fields
  userId: 'user_id',
  authorId: 'author_id', 
  recipientId: 'recipient_id',
  createdBy: 'created_by',
  updatedBy: 'updated_by',
  ownerId: 'owner_id',
  moderatorId: 'moderator_id',
  
  // Content-related fields  
  discussionId: 'discussion_id',
  commentId: 'comment_id',
  postId: 'post_id',
  prayerId: 'prayer_id',
  soapId: 'soap_id',
  eventId: 'event_id',
  churchId: 'church_id',
  
  // Timestamps
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  publishedAt: 'published_at',
  expiredAt: 'expired_at',
  
  // Status and metadata
  isPublic: 'is_public',
  isApproved: 'is_approved',
  isDeleted: 'is_deleted',
  isFeatured: 'is_featured',
  
  // Content fields
  titleText: 'title_text',
  bodyText: 'body_text',
  contentType: 'content_type',
  metaData: 'meta_data',
  
  // Profile fields
  firstName: 'first_name',
  lastName: 'last_name', 
  profileImage: 'profile_image',
  profileImageUrl: 'profile_image_url',
  
  // Activity tracking
  likeCount: 'like_count',
  commentCount: 'comment_count',
  viewCount: 'view_count',
  shareCount: 'share_count',
  
} as const;

/**
 * Reverse mapping from database to frontend field names
 */
export const REVERSE_FIELD_MAPPINGS = Object.fromEntries(
  Object.entries(FIELD_MAPPINGS).map(([frontend, database]) => [database, frontend])
);

// ============================================================================
// SAFE TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Safely transforms frontend data for database operations
 * Uses the master field mapping to ensure consistency
 */
export function toDatabase<T extends Record<string, any>>(frontendData: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(frontendData)) {
    // Use explicit mapping if available, otherwise convert to snake_case
    const dbKey = FIELD_MAPPINGS[key as keyof typeof FIELD_MAPPINGS] || 
                  key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[dbKey] = value;
  }
  
  return result;
}

/**
 * Safely transforms database data for frontend consumption  
 * Uses reverse mapping to ensure consistency
 */
export function fromDatabase<T extends Record<string, any>>(databaseData: T): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(databaseData)) {
    // Use explicit reverse mapping if available, otherwise convert to camelCase
    const frontendKey = REVERSE_FIELD_MAPPINGS[key] || 
                       key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[frontendKey] = value;
  }
  
  return result;
}

// ============================================================================
// SPECIALIZED MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps user-related fields for consistent user object structure
 */
export function mapUserFields(userData: any): any {
  if (!userData || (!userData.id && !userData.email)) {
    return null; // Return null for completely invalid user data
  }
  
  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.first_name || userData.firstName || '',
    lastName: userData.last_name || userData.lastName || '',
    profileImage: userData.profile_image || userData.profileImage || userData.profile_image_url || userData.profileImageUrl || null,
    name: userData.name || `${userData.first_name || userData.firstName || ''} ${userData.last_name || userData.lastName || ''}`.trim() || 'Anonymous',
    createdAt: userData.created_at || userData.createdAt,
    updatedAt: userData.updated_at || userData.updatedAt,
  };
}

/**
 * Maps post/content fields for consistent feed display
 */
export function mapContentFields(contentData: any): any {
  // Handle author data properly
  const authorData = contentData.author || {};
  if (!authorData.id && contentData.author_id) {
    // Construct author object from flattened fields
    authorData.id = contentData.author_id;
    authorData.email = contentData.author_email;
    authorData.first_name = contentData.author_first_name;
    authorData.last_name = contentData.author_last_name;
    authorData.profile_image = contentData.author_profile_image;
    authorData.name = contentData.author_name;
  }
  
  return {
    id: contentData.id,
    title: contentData.title || contentData.title_text,
    content: contentData.content || contentData.body_text || contentData.text,
    author: mapUserFields(authorData),
    authorId: contentData.author_id || contentData.authorId,
    userId: contentData.user_id || contentData.userId,
    type: contentData.type || contentData.content_type,
    isPublic: contentData.is_public ?? contentData.isPublic ?? true,
    likeCount: contentData.like_count || contentData.likeCount || 0,
    commentCount: contentData.comment_count || contentData.commentCount || 0,
    createdAt: contentData.created_at || contentData.createdAt,
    updatedAt: contentData.updated_at || contentData.updatedAt,
  };
}

// ============================================================================
// VALIDATION FUNCTIONS  
// ============================================================================

/**
 * Validates that required fields are present after mapping
 */
export function validateMappedData(data: any, requiredFields: string[]): boolean {
  return requiredFields.every(field => {
    const hasField = data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null;
    // Remove console warning for cleaner production experience
    return hasField;
  });
}

/**
 * Type-safe mapping with validation
 */
export function safeMappingWithValidation<T>(
  data: any,
  mappingFn: (data: any) => T,
  requiredFields: string[] = []
): T | null {
  try {
    const mapped = mappingFn(data);
    
    if (requiredFields.length > 0 && !validateMappedData(mapped, requiredFields)) {
      // Remove console error for cleaner production experience
      return null;
    }
    
    return mapped;
  } catch (error) {
    // Remove console error for cleaner production experience
    return null;
  }
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Gradually migrate API endpoints to use consistent naming
 * Supports both old and new field names during transition period
 */
export function createBackwardCompatibleMapping(newData: any, legacyFieldMap: Record<string, string>): any {
  const result = { ...newData };
  
  // Add legacy field names for backward compatibility
  for (const [legacyField, newField] of Object.entries(legacyFieldMap)) {
    if (result[newField] !== undefined) {
      result[legacyField] = result[newField];
    }
  }
  
  return result;
}

/**
 * Helper for debugging field mapping issues
 */
export function debugFieldMapping(data: any, operation: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔍 Field Mapping Debug - ${operation}`);
    console.log('Original data:', data);
    console.log('Database mapping:', toDatabase(data));
    console.log('Frontend mapping:', fromDatabase(data));
    console.groupEnd();
  }
}