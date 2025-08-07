# URGENT: Massive Naming Standard Violations Across SoapBox Platform

## EXECUTIVE SUMMARY
Your SoapBox Super App has **systematic naming violations** affecting hundreds of database operations. This is blocking authentication and violating development standards.

## SCALE OF VIOLATIONS

### Authentication System (CRITICAL - BLOCKING LOGIN)
❌ **server/storage.ts Lines 2661, 2673**: Raw SQL using `u.email_verified` instead of schema field
❌ **server/routes.ts Line 15202, 15227**: Direct column access to `email_verified`
✅ **server/routes.ts Line 2297**: Correct usage `phoneVerified: false`

### Systematic Issues Found:
- **578 TypeScript errors** across server files
- **Direct SQL column access** in server/storage.ts
- **Mixed naming patterns** throughout codebase
- **Authentication failure** due to field name confusion

## ROOT CAUSE ANALYSIS

### Problem Pattern:
```sql
-- WRONG: Direct database column access
u.email_verified, u.phone_verified, u.real_name_verified

-- CORRECT: Should use Drizzle schema fields  
user.emailVerified, user.phoneVerified, user.realNameVerified
```

### Why This Happened:
1. **Raw SQL queries** bypassing Drizzle ORM schema
2. **Legacy code** using direct column names
3. **No enforcement** of schema-only database access
4. **Mixed development patterns** across team

## IMMEDIATE ACTIONS REQUIRED

### Phase 1: Unblock Authentication (URGENT)
1. Fix server/storage.ts raw SQL queries
2. Fix server/routes.ts direct column access
3. Restart server and test login

### Phase 2: Systematic Cleanup (24-48 hours)
1. Audit all raw SQL queries for snake_case usage
2. Replace with proper Drizzle schema field access
3. Add linting rules to prevent future violations

### Phase 3: Standards Enforcement (Ongoing)
1. Update development standards document
2. Implement automated checks
3. Code review requirements for database access

## DEVELOPMENT STANDARDS IMPACT

This violates core SoapBox Development Standards:
- ❌ **Consistent Naming**: Mixed camelCase/snake_case
- ❌ **ORM Usage**: Raw SQL bypassing schema
- ❌ **Type Safety**: Direct column access losing TypeScript benefits

## ESTIMATED REMEDIATION

- **Immediate Fix**: 30 minutes (authentication unblock)
- **Complete Cleanup**: 4-6 hours (entire codebase)
- **Standards Implementation**: 2-3 hours (prevention measures)

---
**Status**: BLOCKING PRODUCTION - Authentication system down
**Priority**: P0 - Immediate action required
**Next Steps**: Begin Phase 1 fixes immediately