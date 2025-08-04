/**
 * Client-side Field Mapping Utilities
 * 
 * This module provides client-side field mapping utilities that mirror
 * the server-side mapping system for consistent data handling across
 * the frontend components.
 */

// ============================================================================
// CLIENT FIELD MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps server response data to frontend camelCase format
 * Handles both individual objects and arrays
 */
export function mapServerResponse<T>(data: T | T[]): any {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => mapServerResponse(item));
  }
  
  if (typeof data !== 'object') return data;
  
  const mapped: any = {};
  
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    mapped[camelKey] = value;
  }
  
  return mapped;
}

/**
 * Maps frontend data to server-expected format (snake_case)
 * Used when sending data to enhanced API endpoints
 */
export function mapClientRequest(data: Record<string, any>): Record<string, any> {
  if (!data) return data;
  
  const mapped: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    mapped[snakeKey] = value;
  }
  
  return mapped;
}

// ============================================================================
// SPECIALIZED MAPPERS FOR COMMON DATA TYPES
// ============================================================================

/**
 * Maps user data for consistent frontend usage
 */
export function mapUser(userData: any): any {
  if (!userData) return null;
  
  return {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName || userData.first_name,
    lastName: userData.lastName || userData.last_name,
    profileImage: userData.profileImage || userData.profile_image || userData.profileImageUrl || userData.profile_image_url,
    name: userData.name || `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}`.trim(),
    createdAt: userData.createdAt || userData.created_at,
    updatedAt: userData.updatedAt || userData.updated_at,
  };
}

/**
 * Maps discussion/post data for consistent frontend display
 */
export function mapDiscussion(discussionData: any): any {
  if (!discussionData) return null;
  
  return {
    id: discussionData.id,
    title: discussionData.title,
    content: discussionData.content,
    type: discussionData.type || 'discussion',
    author: mapUser(discussionData.author),
    authorId: discussionData.authorId || discussionData.author_id,
    isPublic: discussionData.isPublic ?? discussionData.is_public ?? true,
    likeCount: discussionData.likeCount || discussionData.like_count || 0,
    commentCount: discussionData.commentCount || discussionData.comment_count || 0,
    attachedMedia: discussionData.attachedMedia || discussionData.attached_media,
    tags: discussionData.tags,
    category: discussionData.category,
    createdAt: discussionData.createdAt || discussionData.created_at,
    updatedAt: discussionData.updatedAt || discussionData.updated_at,
  };
}

/**
 * Maps comment data for consistent frontend display
 */
export function mapComment(commentData: any): any {
  if (!commentData) return null;
  
  return {
    id: commentData.id,
    content: commentData.content,
    author: mapUser(commentData.author),
    authorId: commentData.authorId || commentData.author_id,
    discussionId: commentData.discussionId || commentData.discussion_id,
    parentId: commentData.parentId || commentData.parent_id,
    likeCount: commentData.likeCount || commentData.like_count || 0,
    isLiked: commentData.isLiked || commentData.is_liked || false,
    createdAt: commentData.createdAt || commentData.created_at,
    updatedAt: commentData.updatedAt || commentData.updated_at,
  };
}

// ============================================================================
// API REQUEST HELPERS
// ============================================================================

/**
 * Enhanced API request function that handles field mapping
 * Use this for new enhanced endpoints
 */
export async function apiRequestEnhanced(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<any> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  };
  
  // Map request data if provided
  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(mapClientRequest(data));
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  const responseData = await response.json();
  
  // Map response data to frontend format
  return mapServerResponse(responseData);
}

/**
 * Backward compatible API request that works with both old and new endpoints
 */
export async function apiRequestCompatible(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<any> {
  // Try enhanced endpoint first if available
  if (endpoint.includes('/discussions') && !endpoint.includes('-enhanced')) {
    try {
      const enhancedEndpoint = endpoint.replace('/discussions', '/discussions-enhanced');
      return await apiRequestEnhanced(method, enhancedEndpoint, data);
    } catch (error) {
      // Fall back to original endpoint

    }
  }
  
  // Use original request method
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    config.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return await response.json();
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates that mapped data has required fields
 */
export function validateMappedData(data: any, requiredFields: string[]): boolean {
  return requiredFields.every(field => {
    const hasField = data && data[field] !== undefined && data[field] !== null;
    // Remove console warning for cleaner production experience
    return hasField;
  });
}

/**
 * Debug helper for field mapping
 */
export function debugFieldMapping(data: any, operation: string): void {
  if (process.env.NODE_ENV === 'development') {

  }
}