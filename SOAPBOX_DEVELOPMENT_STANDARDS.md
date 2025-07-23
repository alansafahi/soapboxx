# SoapBox Development Standards Document

**Version:** 1.0  
**Effective Date:** July 23, 2025  
**Authority:** Technical Governance Board  
**Scope:** All SoapBox Super App Development  

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Naming Conventions](#naming-conventions)
3. [Code Quality Standards](#code-quality-standards)
4. [API Design Standards](#api-design-standards)
5. [Database Standards](#database-standards)
6. [Component Standards](#component-standards)
7. [File Organization](#file-organization)
8. [Security Standards](#security-standards)
9. [Performance Guidelines](#performance-guidelines)
10. [Enforcement Methods](#enforcement-methods)

---

## Core Principles

### 1. Consistency Over Convention
- **Single way to do things** - Eliminate choice paralysis and reduce cognitive load
- **Predictable patterns** - New developers should be able to guess file locations and naming
- **Standardized approaches** - Use the same pattern across similar problems

### 2. Type Safety First
- **TypeScript strict mode** required for all new code
- **Interface-driven development** - Define types before implementation
- **Runtime validation** where TypeScript cannot guarantee safety

### 3. Performance Awareness
- **Bundle size consciousness** - Monitor and optimize build output
- **Database query efficiency** - Use ORM patterns and avoid N+1 queries
- **User experience priority** - Fast loading, responsive interfaces

### 4. Developer Experience
- **Clear error messages** - Help developers understand and fix issues quickly
- **Comprehensive documentation** - Code should be self-documenting with clear comments
- **Consistent tooling** - Same linting, formatting, and build processes

---

## Naming Conventions

### URLs and API Endpoints
```typescript
// REQUIRED: kebab-case for all multi-word URLs
✅ /api/prayer-requests
✅ /api/discussion-comments
✅ /api/user-profiles
✅ /api/content-moderation
✅ /api/church-management

// FORBIDDEN: Mixed patterns
❌ /api/prayerRequests
❌ /api/prayer_requests
❌ /api/PrayerRequests
```

### Database Schema
```sql
-- REQUIRED: snake_case for PostgreSQL
-- Tables
✅ prayer_requests
✅ discussion_comments
✅ user_badge_progress

-- Columns
✅ user_id, created_at, is_public
✅ prayer_request_id, author_id
✅ background_check_level

-- FORBIDDEN: Other cases in database
❌ userId, createdAt, isPublic
❌ PrayerRequests, UserProfiles
```

### Frontend Code
```typescript
// REQUIRED: camelCase for variables, functions, props
✅ const userId = session.userId;
✅ const handleSubmit = () => {};
✅ const isAuthenticated = checkAuth();

// REQUIRED: PascalCase for components, interfaces, types
✅ interface CommentDialogProps {}
✅ type UserProfile = {};
✅ export function CommentDialog() {}

// REQUIRED: SCREAMING_SNAKE_CASE for constants
✅ const MAX_COMMENT_LENGTH = 500;
✅ const API_BASE_URL = process.env.API_URL;
```

### File and Directory Names
```
// REQUIRED: Component files
✅ CommentDialog.tsx
✅ SocialFeed.tsx
✅ UserProfile.tsx

// REQUIRED: Utility files
✅ api-client.ts
✅ field-mapping.ts
✅ query-client.ts

// REQUIRED: Directory structure
✅ content-moderation/
✅ user-management/
✅ communication-hub/

// FORBIDDEN: Inconsistent patterns
❌ commentdialog.tsx
❌ social_feed.tsx
❌ UserProfile.js
```

---

## Code Quality Standards

### TypeScript Configuration
```json
// tsconfig.json - REQUIRED settings
{
  "compilerOptions": {
    "strict": true,                    // Mandatory
    "noUnusedLocals": true,           // Catch unused variables
    "noUnusedParameters": true,       // Catch unused parameters
    "exactOptionalPropertyTypes": true, // Strict optional properties
    "noUncheckedIndexedAccess": true  // Safe array/object access
  }
}
```

### ESLint Configuration (REQUIRED)
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### Prettier Configuration (REQUIRED)
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Import Organization
```typescript
// REQUIRED: Import order
// 1. React/External libraries
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// 2. Internal utilities and hooks
import { apiRequest } from '@/lib/query-client';
import { useAuth } from '@/hooks/use-auth';

// 3. UI components
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

// 4. Local components
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

// 5. Types and interfaces
import type { Comment, CommentDialogProps } from './types';
```

---

## API Design Standards

### RESTful URL Structure
```typescript
// REQUIRED: Resource-based URLs
✅ GET    /api/discussions                    # List all
✅ POST   /api/discussions                    # Create new
✅ GET    /api/discussions/{id}               # Get specific
✅ PUT    /api/discussions/{id}               # Update specific
✅ DELETE /api/discussions/{id}               # Delete specific

// REQUIRED: Nested resources
✅ GET    /api/discussions/{id}/comments      # Comments for discussion
✅ POST   /api/discussions/{id}/comments      # Add comment to discussion
✅ GET    /api/users/{id}/prayer-requests     # User's prayer requests

// FORBIDDEN: Non-RESTful patterns
❌ GET    /api/getDiscussions
❌ POST   /api/createComment
❌ GET    /api/discussion_comments_by_user
```

### Request/Response Format
```typescript
// REQUIRED: Consistent response structure
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// SUCCESS Response Example
{
  "success": true,
  "data": {
    "userId": "123",
    "createdAt": "2025-07-23T10:00:00Z",
    "isPublic": true
  },
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}

// ERROR Response Example
{
  "success": false,
  "error": "Invalid request parameters",
  "message": "The 'userId' field is required"
}
```

### Authentication Headers
```typescript
// REQUIRED: Session-based authentication
// Cookie: connect.sid=s%3A...

// REQUIRED: Error responses for auth
401 Unauthorized: { "success": false, "error": "Authentication required" }
403 Forbidden:    { "success": false, "error": "Insufficient permissions" }
```

### Field Mapping Standards
```typescript
// REQUIRED: Use centralized field mapping
import { mapUserToApi, mapUserFromApi } from '@/lib/field-mapping';

// API receives camelCase, converts to snake_case for database
const apiData = { userId: '123', isPublic: true };
const dbData = mapUserFromApi(apiData);
// → { user_id: '123', is_public: true }

// Database returns snake_case, converts to camelCase for API
const dbResult = { user_id: '123', is_public: true };
const apiResult = mapUserToApi(dbResult);
// → { userId: '123', isPublic: true }
```

---

## Database Standards

### Schema Design Principles
```sql
-- REQUIRED: Descriptive table names
✅ prayer_requests
✅ discussion_comments
✅ user_badge_progress

-- REQUIRED: Foreign key naming
✅ user_id REFERENCES users(id)
✅ prayer_request_id REFERENCES prayer_requests(id)
✅ discussion_id REFERENCES discussions(id)

-- REQUIRED: Standard columns
✅ id SERIAL PRIMARY KEY
✅ created_at TIMESTAMP DEFAULT NOW()
✅ updated_at TIMESTAMP DEFAULT NOW()

-- FORBIDDEN: Abbreviated names
❌ usr_id, req_id, disc_id
❌ cr_at, up_at
```

### ORM Usage Standards
```typescript
// REQUIRED: Use Drizzle ORM for type safety
import { eq, desc, and } from 'drizzle-orm';
import { discussions, users } from '@/shared/schema';

// PREFERRED: ORM queries
const userDiscussions = await db
  .select()
  .from(discussions)
  .where(and(
    eq(discussions.authorId, userId),
    eq(discussions.isPublic, true)
  ))
  .orderBy(desc(discussions.createdAt));

// AVOID: Raw SQL (only when ORM insufficient)
const result = await db.execute(sql`
  SELECT * FROM discussions 
  WHERE author_id = ${userId} 
  AND is_public = true
  ORDER BY created_at DESC
`);
```

### Migration Standards
```typescript
// REQUIRED: Use drizzle-kit for schema changes
npm run db:push  // Push schema changes to database

// REQUIRED: Document schema changes in commit messages
git commit -m "feat(schema): add parent_id to discussion_comments for threading"
```

---

## Component Standards

### Component Structure
```typescript
// REQUIRED: Component file structure
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Props interface REQUIRED
interface CommentDialogProps {
  postId: number;
  postType: 'discussion' | 'soap' | 'prayer';
  isOpen: boolean;
  onClose: () => void;
}

// REQUIRED: Named export
export function CommentDialog({ postId, postType, isOpen, onClose }: CommentDialogProps) {
  // 1. State hooks
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2. React Query hooks
  const { data: comments, isLoading } = useQuery({
    queryKey: [`/api/${postType}s/${postId}/comments`],
    enabled: isOpen
  });
  
  // 3. Computed values
  const sortedComments = useMemo(() => 
    comments?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [comments]
  );
  
  // 4. Event handlers
  const handleSubmit = useCallback(async () => {
    // Implementation
  }, [commentText, postId]);
  
  // 5. Effects
  useEffect(() => {
    if (!isOpen) {
      setCommentText('');
    }
  }, [isOpen]);
  
  // 6. Render
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Component content */}
    </Dialog>
  );
}
```

### Props Interface Standards
```typescript
// REQUIRED: Descriptive prop names
interface ComponentProps {
  // ✅ Clear and descriptive
  userId: string;
  isLoading: boolean;
  onCommentSubmit: (comment: string) => void;
  maxCommentLength: number;
  
  // ❌ Avoid generic or unclear names
  data: any;
  handler: () => void;
  flag: boolean;
}

// REQUIRED: Optional props marked clearly
interface OptionalProps {
  title: string;                    // Required
  subtitle?: string;               // Optional
  onClose?: () => void;           // Optional callback
  className?: string;             // Optional styling
}
```

### State Management
```typescript
// REQUIRED: React Query for server state
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/discussions', { churchId, isPublic: true }],
  queryFn: () => apiRequest('GET', '/api/discussions', { churchId, isPublic: true }),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// REQUIRED: useState for local component state
const [isExpanded, setIsExpanded] = useState(false);
const [searchTerm, setSearchTerm] = useState('');

// REQUIRED: Mutations with cache invalidation
const createCommentMutation = useMutation({
  mutationFn: (data: { content: string; parentId?: number }) =>
    apiRequest('POST', `/api/discussions/${postId}/comments`, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [`/api/discussions/${postId}/comments`] });
    setCommentText('');
  },
});
```

---

## File Organization

### Directory Structure (REQUIRED)
```
client/src/
├── components/           # Reusable UI components
│   ├── ui/              # ShadCN/UI base components
│   ├── communication/   # Communication feature components
│   ├── content-moderation/ # Moderation feature components
│   └── shared/          # Shared business components
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and configurations
├── pages/               # Route components
├── contexts/            # React contexts
└── types/               # Shared TypeScript types

server/
├── routes/              # API route handlers
├── middleware/          # Express middleware
├── services/            # Business logic services
├── utils/               # Server utility functions
└── types/               # Server-side types

shared/
├── schema.ts           # Database schema definitions
├── types.ts            # Shared type definitions
└── constants.ts        # Shared constants
```

### Import Path Standards
```typescript
// REQUIRED: Use path aliases
import { Button } from '@/components/ui/button';      // ✅
import { useAuth } from '@/hooks/use-auth';           // ✅
import { apiRequest } from '@/lib/query-client';      // ✅
import type { User } from '@shared/types';            // ✅

// FORBIDDEN: Relative imports for shared code
import { Button } from '../../../components/ui/button';  // ❌
import { useAuth } from '../../hooks/use-auth';           // ❌
```

---

## Security Standards

### Authentication
```typescript
// REQUIRED: Session-based authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  next();
};

// REQUIRED: Role-based authorization
const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.session?.userRole;
  if (!roles.includes(userRole)) {
    return res.status(403).json({ 
      success: false, 
      error: 'Insufficient permissions' 
    });
  }
  next();
};
```

### Input Validation
```typescript
// REQUIRED: Zod validation for all API inputs
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  parentId: z.number().optional(),
  discussionId: z.number().positive(),
});

// REQUIRED: Validate before processing
app.post('/api/discussions/:id/comments', isAuthenticated, async (req, res) => {
  try {
    const validatedData = createCommentSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid request data',
      details: error.errors 
    });
  }
});
```

### Data Sanitization
```typescript
// REQUIRED: Sanitize user inputs
import DOMPurify from 'dompurify';

const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};
```

---

## Performance Guidelines

### Bundle Size Management
```typescript
// REQUIRED: Lazy loading for routes
const LazyHomePage = React.lazy(() => import('@/pages/HomePage'));
const LazyDashboard = React.lazy(() => import('@/pages/Dashboard'));

// REQUIRED: Code splitting for large features
const LazySermonStudio = React.lazy(() => 
  import('@/components/sermon-studio/SermonStudio')
);
```

### Database Query Optimization
```typescript
// REQUIRED: Use select() to limit columns
const users = await db
  .select({
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    profileImageUrl: users.profileImageUrl,
  })
  .from(users)
  .where(eq(users.churchId, churchId));

// REQUIRED: Use indexes for frequently queried columns
// In schema.ts
export const discussions = pgTable("discussions", {
  // ... columns
}, (table) => ({
  churchIdIdx: index().on(table.churchId),      // ✅
  authorIdIdx: index().on(table.authorId),      // ✅
  createdAtIdx: index().on(table.createdAt),    // ✅
}));
```

### React Query Optimization
```typescript
// REQUIRED: Appropriate stale times
const { data } = useQuery({
  queryKey: ['/api/discussions'],
  queryFn: fetchDiscussions,
  staleTime: 5 * 60 * 1000,        // 5 minutes for discussions
  cacheTime: 10 * 60 * 1000,       // 10 minutes cache
});

// REQUIRED: Query key arrays for cache invalidation
const queryKey = ['/api/discussions', { churchId, isPublic }];
```

---

## Enforcement Methods

### Pre-commit Hooks (RECOMMENDED)
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ]
  }
}
```

### VS Code Settings (TEAM STANDARD)
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### CI/CD Checks (REQUIRED)
```yaml
# .github/workflows/quality-check.yml
name: Code Quality Check
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: TypeScript check
        run: npm run check
      - name: ESLint check
        run: npx eslint . --ext .ts,.tsx
      - name: Prettier check
        run: npx prettier --check .
```

### Code Review Checklist
- [ ] Follows naming conventions (kebab-case URLs, camelCase frontend, snake_case DB)
- [ ] Uses TypeScript interfaces for all props and data structures
- [ ] Includes appropriate error handling and loading states
- [ ] Uses React Query for server state management
- [ ] Follows component structure standards
- [ ] Includes necessary tests for business logic
- [ ] Performance considerations addressed (lazy loading, query optimization)
- [ ] Security validation in place (input sanitization, auth checks)

---

## Documentation Requirements

### Component Documentation
```typescript
/**
 * CommentDialog - Displays and manages comments for posts
 * 
 * Features:
 * - Threaded comment display with nested replies
 * - Real-time like/unlike functionality  
 * - Keyboard shortcuts (Cmd+Enter to submit)
 * - Sort by newest or most liked
 * 
 * @param postId - ID of the post to show comments for
 * @param postType - Type of post (discussion, soap, prayer)
 * @param isOpen - Controls dialog visibility
 * @param onClose - Callback when dialog should close
 */
export function CommentDialog({ postId, postType, isOpen, onClose }: CommentDialogProps) {
```

### API Endpoint Documentation
```typescript
/**
 * POST /api/discussions/:id/comments
 * 
 * Creates a new comment on a discussion post
 * 
 * Auth: Required (session-based)
 * 
 * Parameters:
 * - id: Discussion ID (path parameter)
 * 
 * Body:
 * - content: string (1-500 characters)
 * - parentId?: number (optional, for replies)
 * 
 * Returns:
 * - 201: Comment created successfully
 * - 400: Invalid input data
 * - 401: Authentication required
 * - 404: Discussion not found
 */
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | July 23, 2025 | Initial standards document |

---

## Approval and Adoption

**Approved by:** Technical Lead  
**Effective Date:** July 23, 2025  
**Review Schedule:** Quarterly  
**Next Review:** October 23, 2025  

All team members are required to follow these standards for new development. Legacy code should be updated to meet these standards during maintenance cycles.

---

**Contact:** Technical Governance Board  
**Questions:** Submit via GitHub Issues with `standards` label