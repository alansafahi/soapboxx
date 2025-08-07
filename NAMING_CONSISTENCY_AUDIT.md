# SoapBox Super App - Naming Consistency Audit Report

## Overview
This audit identifies critical naming inconsistencies across the platform that violate our SoapBox Development Standards v1.0. The core issue is mixed use of camelCase and snake_case conventions.

## Critical Issues Found

### 1. Email Verification Field Inconsistency (HIGH PRIORITY)
- **Schema Field**: `emailVerified` (camelCase)
- **Database Column**: `email_verified` (snake_case)
- **Impact**: Authentication system failure preventing user login
- **Status**: ❌ BLOCKING PRODUCTION

### 2. Phone Verification Field Inconsistency
- **Schema Field**: `phoneVerified` (camelCase)  
- **Database Column**: `phone_verified` (snake_case)
- **Impact**: SMS verification system may fail

### 3. Real Name Verification Field Inconsistency
- **Schema Field**: `realNameVerified` (camelCase)
- **Database Column**: `real_name_verified` (snake_case)
- **Impact**: Profile verification system inconsistency

### 4. Massive Timestamp Field Inconsistencies
ALL timestamp fields use snake_case in database but likely camelCase in schema:
- `created_at` vs `createdAt` (205+ instances)
- `updated_at` vs `updatedAt` (76+ instances)  
- `expires_at` vs `expiresAt` (15+ instances)
- `verified_at` vs `verifiedAt` (1+ instance)

### 5. URL Field Inconsistencies  
ALL URL fields use snake_case in database:
- `profile_image_url`, `cover_photo_url`, `logo_url`, `media_url`, `video_url`, `thumbnail_url`, `action_url`, `attachment_url`, `image_url`, `background_image_url`, `audio_url`, `public_url`
- Schema likely uses camelCase: `profileImageUrl`, `coverPhotoUrl`, `logoUrl`, etc.

### 6. Foreign Key ID Field Inconsistencies
ALL foreign key fields use snake_case: `user_id`, `community_id`, `prayer_id`, etc. (200+ instances)
- Schema may use camelCase mapping but inconsistent application code access

## Systematic Database Column Analysis

### Timestamp Fields (_at suffix)
Based on database analysis, these fields use snake_case in DB but may have camelCase in schema:
- `created_at`, `updated_at`, `verified_at`, `last_login_at`
- `email_verification_sent_at`, `two_factor_setup_at`
- `sms_verification_expires`, `password_reset_expires`

### URL Fields
- `profile_image_url`, `cover_photo_url`, `logo_url` (snake_case in DB)
- Schema likely defines as `profileImageUrl`, `coverPhotoUrl`, `logoUrl` (camelCase)

### ID Fields
All foreign key fields use snake_case in database:
- `user_id`, `community_id`, `prayer_id`, etc.
- Schema needs verification for consistency

## Root Cause Analysis

### Database Schema Mismatch
The Drizzle ORM schema in `shared/schema.ts` uses camelCase field names but maps to snake_case database columns using the column mapping syntax:
```typescript
emailVerified: boolean("email_verified").default(false)
```

### Authentication System Impact
The authentication code incorrectly assumes the TypeScript field name matches the database column name, causing:
1. Login failures
2. User verification errors  
3. Profile update issues

## Recommended Resolution Strategy

### Phase 1: Immediate Fixes (Authentication Critical)
1. ✅ Fix `emailVerified`/`email_verified` in auth system
2. Fix `phoneVerified`/`phone_verified` in SMS verification
3. Fix `realNameVerified`/`real_name_verified` in profile verification

### Phase 2: Comprehensive Schema Audit
1. Review all field mappings in `shared/schema.ts`
2. Ensure consistent camelCase → snake_case mapping
3. Update all database access code to use TypeScript field names

### Phase 3: Code Standardization
1. Update all database queries to use schema field names
2. Remove direct database column references
3. Implement linting rules to prevent future inconsistencies

## Compliance with SoapBox Development Standards

Our platform must maintain:
- **Consistent Naming**: All TypeScript code uses camelCase
- **Proper ORM Usage**: Database access only through schema field names
- **No Direct Column References**: Prevent snake_case leakage into application code

## Next Steps
1. Immediate authentication fix (in progress)
2. Comprehensive field mapping audit
3. Update development standards to include ORM field mapping guidelines
4. Implement automated consistency checks

---
*Generated: $(date) - Critical Priority Audit*