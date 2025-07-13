# Data Expiration Privacy Feature - Implementation Plan

## Executive Summary

This document outlines the comprehensive implementation plan for adding data expiration functionality to SoapBox Super App's publicly shared content. This privacy-forward feature allows users to set automatic removal dates for Prayer Requests, S.O.A.P. Journals, and Discussion Posts, along with their associated interactions (comments, likes, reactions).

## Business Case & User Need

### Why This Feature Is Critical
- **Emotional Safety**: Prayer requests and spiritual journals are deeply personal and vulnerable
- **Privacy Over Time**: Users may regret oversharing spiritual struggles or want content to naturally fade
- **GDPR Compliance**: Aligns with global privacy expectations and "right to be forgotten" principles
- **Faith Community Trust**: Builds confidence in platform privacy for sensitive spiritual content

### Target User Pain Points
1. **Vulnerable Sharing**: Users share deep struggles but want privacy protection over time
2. **Spiritual Growth**: Past content may no longer reflect current spiritual state
3. **Reputation Management**: Concerns about permanent spiritual records visible to community
4. **Platform Trust**: Need for control over personal spiritual data visibility

## Current System Analysis

### Affected Data Structures

**Primary Content Tables (Publicly Shareable)**
```typescript
// Already supports public sharing via isPublic flag
discussions: {
  isPublic: boolean,
  audience: "public" | "church" | "private",
  createdAt: timestamp,
  // NEEDS: expiresAt field
}

prayerRequests: {
  isPublic: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  // NEEDS: expiresAt field
}

soapEntries: {
  isPublic: boolean,
  createdAt: timestamp,
  updatedAt: timestamp,
  // NEEDS: expiresAt field
}
```

**Associated Interaction Tables (Affected by Expiration)**
- `discussionComments` (comment interactions)
- `discussionLikes` (like interactions)  
- `prayerResponses` (prayer support comments)
- `soapComments` (SOAP entry comments)
- `soapLikes` (SOAP entry likes)
- `reactions` (spiritual emoji reactions: 🙏, ✝️, 🕊️)

### Current Public Sharing Mechanisms

**Social Feed Integration**: 
- SOAP entries shared to social feed when `isPublic: true`
- Prayer requests automatically create feed posts when public
- Discussion posts appear in community feed

**Data Flow Patterns**:
1. User creates content with privacy toggle
2. Content displays in public feeds if `isPublic: true`
3. Other users interact via comments/likes/reactions
4. Content persists indefinitely (CURRENT LIMITATION)

## Recommended Features for Expiration

| Content Type | Expiration Priority | Reasoning |
|-------------|-------------------|-----------|
| **Prayer Requests** | ⭐⭐⭐ HIGH | Most emotionally vulnerable, time-sensitive nature |
| **S.O.A.P. Journals** | ⭐⭐⭐ HIGH | Daily spiritual reflections users may want private over time |
| **Discussion Posts** | ⭐⭐ MEDIUM | General posts but may become irrelevant or embarrassing |
| **Comments/Reactions** | ⭐⭐ MEDIUM | Should hide with parent content for complete privacy |
| **Daily Check-ins** | ⭐ LOW | Optional: mood/spiritual state tracking |

## Implementation Plan

### Phase 1: Database Schema Enhancement

**Add Expiration Fields to Core Tables**
```sql
-- Add expiration support to primary content tables
ALTER TABLE prayer_requests ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE soap_entries ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL; 
ALTER TABLE discussions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add indexes for efficient expiration queries
CREATE INDEX idx_prayer_requests_expires_at ON prayer_requests(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_soap_entries_expires_at ON soap_entries(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_discussions_expires_at ON discussions(expires_at) WHERE expires_at IS NOT NULL;

-- Add soft deletion tracking (optional)
ALTER TABLE prayer_requests ADD COLUMN expired_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE soap_entries ADD COLUMN expired_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE discussions ADD COLUMN expired_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
```

**Update Schema TypeScript Definitions**
```typescript
// shared/schema.ts updates needed
prayerRequests: {
  // ... existing fields
  expiresAt: timestamp("expires_at"),
  expiredAt: timestamp("expired_at"), // Soft deletion timestamp
}

soapEntries: {
  // ... existing fields  
  expiresAt: timestamp("expires_at"),
  expiredAt: timestamp("expired_at"),
}

discussions: {
  // ... existing fields
  expiresAt: timestamp("expires_at"), 
  expiredAt: timestamp("expired_at"),
}
```

### Phase 2: UI/UX Implementation

**Content Creation Forms Enhancement**

Add expiration selector to:
- Prayer Wall submission form (`EnhancedPrayerWall.tsx`)
- S.O.A.P. Journal entry form (`soap-entry-form.tsx`)
- Social feed post composer (`social-feed.tsx`)

**Expiration Options UI**:
```typescript
const EXPIRATION_OPTIONS = [
  { label: "Never", value: null },
  { label: "1 Day", value: "1d" },
  { label: "1 Week", value: "1w" }, 
  { label: "1 Month", value: "1m" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
  { label: "Custom Date", value: "custom" }
];
```

**User Settings Default Preferences**:
```typescript
// Add to user preferences
userSettings: {
  defaultPrayerExpiration: string | null,
  defaultSoapExpiration: string | null,
  defaultPostExpiration: string | null,
}
```

### Phase 3: Backend Logic Implementation

**Content Filtering Queries**
```typescript
// server/storage.ts enhancements needed

// Update all public content queries to exclude expired content
async getPrayerRequests(churchId?: number): Promise<PrayerRequest[]> {
  return db.select()
    .from(prayerRequests)
    .where(and(
      eq(prayerRequests.isPublic, true),
      or(
        isNull(prayerRequests.expiresAt),
        gt(prayerRequests.expiresAt, new Date())
      ),
      churchId ? eq(prayerRequests.churchId, churchId) : undefined
    ))
    .orderBy(desc(prayerRequests.createdAt));
}

// Similar updates needed for:
// - getSoapEntries()  
// - getDiscussions()
// - getSocialFeed()
```

**Expiration Processing Service**
```typescript
// server/expirationService.ts (NEW FILE)
export class ContentExpirationService {
  // Soft delete expired content (preferred approach)
  async processExpiredContent(): Promise<void> {
    const now = new Date();
    
    // Mark expired prayer requests
    await db.update(prayerRequests)
      .set({ expiredAt: now })
      .where(and(
        isNull(prayerRequests.expiredAt),
        lte(prayerRequests.expiresAt, now)
      ));
      
    // Mark expired SOAP entries  
    await db.update(soapEntries)
      .set({ expiredAt: now })
      .where(and(
        isNull(soapEntries.expiredAt),
        lte(soapEntries.expiresAt, now)
      ));
      
    // Mark expired discussions
    await db.update(discussions)
      .set({ expiredAt: now })
      .where(and(
        isNull(discussions.expiredAt),
        lte(discussions.expiresAt, now)
      ));
  }
  
  // Optional: Hard deletion after grace period
  async cleanupExpiredContent(gracePeriodDays: number = 30): Promise<void> {
    const graceCutoff = new Date();
    graceCutoff.setDate(graceCutoff.getDate() - gracePeriodDays);
    
    // Hard delete content expired > 30 days ago
    // Implementation depends on retention policy
  }
}
```

### Phase 4: Frontend Integration

**Expired Content Handling**
```typescript
// client/src/components/ExpiredContentPlaceholder.tsx (NEW FILE)
export function ExpiredContentPlaceholder({ contentType }: { contentType: string }) {
  return (
    <Card className="border-dashed border-gray-300">
      <CardContent className="text-center py-6 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2" />
        <p>This {contentType} has expired and is no longer visible</p>
        <p className="text-sm">Content was automatically removed for privacy</p>
      </CardContent>
    </Card>
  );
}
```

**Author-Only Archive View**
```typescript
// Allow authors to view their own expired content
async getMyExpiredContent(userId: string): Promise<ExpiredContent[]> {
  // Query expired content where user is author
  // Show in separate "Archived Posts" section
}
```

### Phase 5: Admin & Moderation Tools

**Church Admin Override Capabilities**
```typescript
// server/routes.ts additions needed
app.post('/api/admin/content/:id/extend-expiration', isChurchAdmin, async (req, res) => {
  // Allow church admins to extend expiration for moderation purposes
  // Useful for problematic content that needs longer review
});

app.get('/api/admin/expired-content', isChurchAdmin, async (req, res) => {
  // View expired content for moderation review if needed
});
```

**Moderation Dashboard Integration**
- Add expired content review to Admin Portal
- Track expiration patterns for abuse detection
- Override expiration for policy violations

## Technical Implementation Details

### API Endpoints Required

**Content Creation (Enhancement)**
```typescript
// Existing endpoints need expiration parameter support
POST /api/prayers { content, isPublic, expiresAt? }
POST /api/soap { content, isPublic, expiresAt? }  
POST /api/discussions { content, isPublic, expiresAt? }
```

**Expiration Management (New)**
```typescript
PUT /api/prayers/:id/expiration { expiresAt }
PUT /api/soap/:id/expiration { expiresAt }
PUT /api/discussions/:id/expiration { expiresAt }

GET /api/user/expired-content // Author's archived content
POST /api/content/:id/republish { newExpiresAt? } // Restore expired content
```

**Admin Endpoints (New)**
```typescript
GET /api/admin/expiration-analytics
POST /api/admin/content/:id/override-expiration
GET /api/admin/expired-content-review
```

### Database Performance Considerations

**Indexing Strategy**
```sql
-- Composite indexes for efficient filtering
CREATE INDEX idx_prayers_public_unexpired ON prayer_requests(is_public, expires_at) 
  WHERE is_public = true AND (expires_at IS NULL OR expires_at > NOW());

CREATE INDEX idx_soap_public_unexpired ON soap_entries(is_public, expires_at)
  WHERE is_public = true AND (expires_at IS NULL OR expires_at > NOW());

CREATE INDEX idx_discussions_public_unexpired ON discussions(is_public, expires_at)
  WHERE is_public = true AND (expires_at IS NULL OR expires_at > NOW());
```

**Query Optimization**
- Use partial indexes for active content filtering
- Implement query caching for social feed performance
- Consider materialized views for heavy aggregation queries

### Background Processing

**Scheduled Tasks**
```typescript
// server/scheduledTasks.ts (NEW FILE)
import cron from 'node-cron';

// Run expiration processing every hour
cron.schedule('0 * * * *', async () => {
  await contentExpirationService.processExpiredContent();
});

// Weekly cleanup of old expired content  
cron.schedule('0 2 * * 0', async () => {
  await contentExpirationService.cleanupExpiredContent(30);
});
```

## Security & Privacy Considerations

### Data Protection
- **Soft Deletion**: Prefer marking content as expired rather than hard deletion
- **Grace Period**: 30-day retention for accidental expiration recovery
- **Admin Oversight**: Church admins can view/extend for moderation needs
- **Author Control**: Users can restore their own expired content

### Audit Trail
```typescript
// Track expiration events for compliance
contentExpirationLog: {
  contentType: string,
  contentId: number, 
  authorId: string,
  expiredAt: timestamp,
  reason: "user_set" | "auto_expired" | "admin_action",
  canRestore: boolean,
}
```

## Testing Strategy

### Unit Tests Required
- Expiration date parsing and validation
- Content filtering queries with expiration logic
- Background expiration processing
- User permission checks for expired content

### Integration Tests Required  
- End-to-end content creation with expiration
- Social feed filtering of expired content
- Admin override functionality
- Content restoration workflows

### User Acceptance Testing
- Prayer request expiration flow
- S.O.A.P. journal privacy over time
- Admin moderation with expired content
- Mobile UI for expiration selection

## Rollout Plan

### Phase 1: Foundation (Week 1-2)
- Database schema updates
- Basic expiration logic in storage layer
- Background processing service

### Phase 2: Core UI (Week 3-4)  
- Expiration selectors in content forms
- Frontend filtering of expired content
- User settings for default expiration

### Phase 3: Advanced Features (Week 5-6)
- Admin override capabilities
- Content restoration functionality
- Expiration analytics and reporting

### Phase 4: Polish & Launch (Week 7-8)
- Performance optimization
- Comprehensive testing
- User documentation and onboarding

## Success Metrics

### User Adoption
- % of new content created with expiration dates
- Distribution of expiration timeframes chosen
- User retention after feature launch

### Privacy Impact
- Reduction in content deletion requests
- User feedback on privacy confidence
- Church admin usage of override features  

### Technical Performance
- Query performance with expiration filtering
- Background processing efficiency
- Storage impact of soft deletion approach

## Risk Mitigation

### Potential Issues
1. **Performance Impact**: Heavy queries filtering expired content
   - *Mitigation*: Proper indexing and query optimization

2. **User Confusion**: Complex expiration options
   - *Mitigation*: Simple defaults and clear UI messaging

3. **Data Loss Concerns**: Accidental content expiration
   - *Mitigation*: Soft deletion with restoration capabilities

4. **Moderation Challenges**: Expired content review needs
   - *Mitigation*: Admin override and extended review periods

## Future Enhancements

### Advanced Privacy Features
- **Fade Out Mode**: Gradually reduce visibility instead of instant removal
- **Group Expiration**: Expire entire prayer circles or discussion threads
- **Smart Expiration**: AI-suggested expiration based on content sensitivity
- **Cascading Privacy**: Automatic expiration inheritance for related content

### Integration Opportunities
- **Calendar Integration**: Link expiration to liturgical seasons
- **Pastoral Care**: Alert pastors before sensitive content expires
- **Export Features**: Download personal spiritual content before expiration

## Conclusion

The data expiration privacy feature represents a significant step forward in building user trust and privacy confidence in SoapBox Super App. By giving users control over their spiritual content's lifecycle, we enable more vulnerable and authentic faith community sharing while respecting privacy concerns that naturally develop over time.

This implementation plan provides a comprehensive roadmap for delivering this privacy-forward feature while maintaining the platform's core value of connecting faith communities through authentic spiritual sharing.