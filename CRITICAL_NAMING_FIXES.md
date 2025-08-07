# Critical Naming Consistency Fixes Required

## IMMEDIATE ACTION REQUIRED

Your SoapBox Super App has **MASSIVE** naming inconsistencies that violate development standards:

### Scale of the Problem:
- **280+ timestamp fields** using snake_case (created_at, updated_at, expires_at)
- **17+ URL fields** using snake_case (profile_image_url, logo_url, media_url) 
- **200+ foreign key ID fields** using snake_case (user_id, community_id, prayer_id)
- **Verification fields** causing authentication failures

### Root Cause:
The Drizzle ORM schema correctly maps camelCase → snake_case, but application code directly accesses database column names instead of using schema field names.

### Critical Authentication Fix:
✅ `emailVerified` vs `email_verified` - FIXED (blocking login)
🔧 `phoneVerified` vs `phone_verified` - NEEDS FIX
🔧 `realNameVerified` vs `real_name_verified` - NEEDS FIX

### Systemic Issues:
1. **Direct Column Access**: Code accessing `user.created_at` instead of `user.createdAt`
2. **Inconsistent Query Patterns**: Some queries use schema fields, others use columns
3. **No Enforcement**: No linting rules to prevent snake_case leakage

### Required Actions:
1. **IMMEDIATE**: Fix remaining verification fields blocking features
2. **PHASE 1**: Audit all direct column access in codebase  
3. **PHASE 2**: Update all database access to use schema field names only
4. **PHASE 3**: Implement linting rules to prevent future violations

This violates core development standards and creates maintenance nightmares.

---
**Priority**: CRITICAL - Authentication and core features affected
**Estimate**: 4-6 hours to fully remediate across entire platform