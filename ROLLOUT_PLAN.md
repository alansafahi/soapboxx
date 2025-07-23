# SoapBox Development Standards - Rollout Plan

**Project:** SoapBox Development Standards Implementation  
**Timeline:** 4 weeks (July 23 - August 20, 2025)  
**Owner:** Technical Lead (Alan Safahi)  
**Status:** APPROVED - Ready for Implementation  

---

## Executive Summary

This rollout plan implements the approved SoapBox Development Standards across the entire development organization. The plan ensures smooth adoption through comprehensive team onboarding, automated enforcement tools, and accessible reference materials while maintaining development velocity.

**Success Criteria:**
- 100% team adoption of new standards within 4 weeks
- Zero development disruption during rollout
- 90%+ automated compliance enforcement
- Comprehensive reference materials available

---

## Rollout Timeline Overview

| Week | Focus | Activities | Owner | Deliverables |
|------|-------|------------|-------|--------------|
| **Week 1** | Foundation Setup | Tool installation, basic training | Alan Safahi | CI enforcement, team orientation |
| **Week 2** | Standards Migration | Phase 2 implementation, advanced training | Dev Team | API standardization, deep-dive sessions |
| **Week 3** | Component Integration | Phase 3 implementation, practice sessions | Dev Team | Component migration, hands-on workshops |
| **Week 4** | Enforcement & Docs | Phase 4 implementation, documentation | All Teams | Full enforcement, reference materials |

---

## Week 1: Foundation Setup

### Team Onboarding Program

#### Day 1-2: Standards Introduction & Tool Setup

**Morning Session (2 hours): Standards Overview**
- **Attendees:** All developers, QA team, Technical Lead
- **Format:** Interactive presentation + Q&A
- **Materials:** SoapBox Development Standards document
- **Key Topics:**
  - Why we're implementing standards (30% bug reduction goal)
  - Naming convention unification (kebab-case URLs, camelCase frontend, snake_case DB)
  - Code quality improvements (ESLint, Prettier, TypeScript strict mode)
  - API design consistency (RESTful patterns, field mapping)

**Afternoon Session (2 hours): Development Environment Setup**
- **Individual workstations setup**
- **Tools installation and configuration**
- **VS Code workspace configuration**
- **Git hooks installation**

#### Development Environment Setup Checklist
```bash
# Each developer completes this checklist
□ Clone latest SoapBox repository
□ Install ESLint and Prettier extensions in VS Code
□ Configure .vscode/settings.json with team standards
□ Run setup script: npm run setup:standards
□ Verify linting works: npm run lint
□ Verify formatting works: npm run format
□ Test pre-commit hooks with sample change
□ Complete "Hello Standards" practice exercise
```

#### Setup Script Implementation
```bash
#!/bin/bash
# setup-standards.sh - Run once per developer workstation

echo "🚀 Setting up SoapBox Development Standards..."

# Install development dependencies
npm install --save-dev eslint prettier husky lint-staged
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks

# Copy configuration files
cp .eslintrc.template.json .eslintrc.json
cp .prettierrc.template .prettierrc
cp .vscode/settings.template.json .vscode/settings.json

# Initialize git hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# Run initial validation
echo "🧪 Running validation..."
npm run lint
npm run format:check
npm run check

echo "✅ SoapBox Development Standards setup complete!"
echo "📚 Next: Review the Standards Quick Reference Guide"
```

### Day 3-4: CI Enforcement Implementation

#### Automated CI Pipeline Setup
```yaml
# .github/workflows/standards-enforcement.yml
name: SoapBox Standards Enforcement
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  standards-check:
    name: Development Standards Validation
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: 🔧 TypeScript check
        run: npm run check
        
      - name: 🧹 ESLint validation
        run: npm run lint
        
      - name: 🎨 Prettier check
        run: npm run format:check
        
      - name: 🏗️ Build verification
        run: npm run build
        
      - name: 📊 Generate compliance report
        run: npm run standards:report
        
      - name: 💬 PR Comment with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('standards-report.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: report
            });
```

#### Branch Protection Rules
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Development Standards Validation",
      "standards-check"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null
}
```

### Day 5: Team Assessment & Certification

#### Standards Knowledge Assessment
**Format:** 30-minute online quiz  
**Passing Score:** 85%  
**Retakes:** Unlimited with additional training  

**Sample Questions:**
1. What naming convention should API endpoints use?
   - a) camelCase b) snake_case c) kebab-case ✓ d) PascalCase

2. Where should manual field mapping logic be placed?
   - a) Components b) API routes c) Centralized mapping service ✓ d) Database queries

3. What's the preferred export pattern for React components?
   - a) Default exports b) Named exports ✓ c) Namespace exports d) No preference

#### Hands-on Coding Exercise
**Duration:** 45 minutes  
**Task:** Create a simple component following all SoapBox standards  
**Requirements:**
- Use kebab-case API endpoint
- Implement proper TypeScript interfaces
- Use centralized field mapping
- Follow component structure guidelines
- Pass all linting and formatting checks

---

## Week 2: Standards Migration (Phase 2)

### API Endpoint Standardization

#### Phase 2 Implementation Schedule
| Day | Task | Owner | Files Modified | Hours |
|-----|------|-------|----------------|-------|
| Mon | Server route URL updates | Senior Dev | server/routes.ts + 5 route files | 3 |
| Tue | Frontend API call updates | Frontend Dev | 20 component files | 2 |
| Wed | React Query key migration | Frontend Dev | 15 query files | 1 |
| Thu | Testing & validation | QA Team | All endpoints | 2 |
| Fri | Deployment & monitoring | DevOps + Alan | Production deployment | 1 |

#### Daily Implementation Tasks

**Monday: Server Route Updates**
```typescript
// BEFORE (legacy patterns)
app.get('/api/soap/save', handler);
app.post('/api/checkIns', handler);
app.get('/api/users/:id', handler);

// AFTER (standardized kebab-case)
app.get('/api/soap-entries/save', handler);
app.post('/api/check-ins', handler);
app.get('/api/user-profiles/:id', handler);

// MAINTAIN BACKWARD COMPATIBILITY
app.get('/api/soap/save', deprecationWarning, legacyHandler);
```

**Tuesday-Wednesday: Frontend Migration**
```typescript
// Update all API calls to use new endpoints
// OLD
queryKey: ['/api/soap/:id']
// NEW  
queryKey: ['/api/soap-entries/:id']

// Batch update using VS Code find/replace
// Pattern: '/api/([^/]+)/([^']+)'
// Replace: '/api/$1-$2' (manual review required)
```

**Thursday: Integration Testing**
- All new endpoints return correct data
- Legacy endpoints still functional with deprecation warnings
- React Query caching works with new keys
- No broken API calls in production

**Friday: Production Deployment**
- Deploy with feature flags for gradual rollout
- Monitor API response times and error rates
- Verify backward compatibility
- Update API documentation

### Advanced Training Sessions

#### Session 1: API Design Deep Dive (2 hours)
**Topics:**
- RESTful API patterns and SoapBox conventions
- Field mapping service usage and benefits
- Error handling and response formatting
- Authentication and authorization patterns

**Hands-on:** Build a complete CRUD API following standards

#### Session 2: Component Architecture (2 hours)
**Topics:**
- React component structure guidelines
- TypeScript interface design
- Props naming and typing conventions
- State management with React Query

**Hands-on:** Refactor existing component to meet standards

#### Session 3: Database Patterns (1.5 hours)
**Topics:**
- Drizzle ORM best practices
- Query optimization and indexing
- Schema design principles
- Migration strategies

**Hands-on:** Convert raw SQL to ORM patterns

---

## Week 3: Component Integration (Phase 3)

### Component Migration Strategy

#### Priority Component List
```typescript
// High Priority (Week 3, Days 1-2)
const highPriorityComponents = [
  'SocialFeed.tsx',           // Core user interaction
  'CommentDialog.tsx',        // Recently updated threading
  'UserProfile.tsx',          // High traffic component
  'PrayerWall.tsx',          // Business critical
];

// Medium Priority (Week 3, Days 3-4)
const mediumPriorityComponents = [
  'HomePage.tsx',
  'Dashboard.tsx', 
  'SOAPJournal.tsx',
  'EventsList.tsx',
];

// Low Priority (Week 3, Day 5)
const lowPriorityComponents = [
  'AdminPanel.tsx',
  'SettingsPage.tsx',
  'HelpDocs.tsx',
];
```

#### Component Migration Checklist
```typescript
// For each component, verify:
□ Uses named exports (not default)
□ Has proper TypeScript interface for props
□ Uses enhanced API endpoints with field mapping
□ Follows component structure guidelines:
  // 1. Imports
  // 2. Props interface  
  // 3. Component function
  // 4. Hooks (useState, useQuery, etc.)
  // 5. Computed values (useMemo)
  // 6. Event handlers (useCallback)
  // 7. Effects (useEffect)
  // 8. Render
□ Passes ESLint validation
□ Passes Prettier formatting
□ All tests pass
```

### Hands-on Workshops

#### Workshop 1: Component Refactoring (3 hours)
**Format:** Mob programming session  
**Participants:** All frontend developers  
**Goal:** Refactor 2-3 components together following standards  

**Structure:**
- Hour 1: Live refactoring with discussion
- Hour 2: Pair programming in teams of 2
- Hour 3: Code review and feedback session

#### Workshop 2: Field Mapping Mastery (2 hours)
**Format:** Interactive coding session  
**Focus:** Proper usage of centralized field mapping  

**Exercises:**
- Convert manual field mapping to centralized service
- Handle edge cases and error scenarios
- Performance optimization techniques
- Testing field mapping logic

#### Workshop 3: Testing Standards (2 hours)
**Format:** Test-driven development session  
**Topics:**
- Writing tests for standardized components
- Testing API integration with field mapping
- Mock strategies for enhanced endpoints
- Performance testing for standards compliance

---

## Week 4: Enforcement & Documentation

### Full Enforcement Implementation

#### Phase 4: Complete Tool Integration
```json
// package.json - Final scripts configuration
{
  "scripts": {
    "dev": "npm run validate && NODE_ENV=development tsx server/index.ts",
    "build": "npm run validate && vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "validate": "npm run lint && npm run format:check && npm run check && npm run test",
    "lint": "eslint . --ext .ts,.tsx --cache --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "check": "tsc --noEmit",
    "test": "vitest run",
    "standards:scan": "node scripts/legacy-scanner.js",
    "standards:report": "node scripts/compliance-report.js"
  }
}
```

#### Enforcement Levels
```typescript
// Immediate Enforcement (Week 4, Day 1)
const immediateRules = [
  'TypeScript strict mode errors',
  'ESLint errors (not warnings)',
  'Prettier formatting violations',
  'Build failures'
];

// Warning Level (Week 4, Day 3)  
const warningRules = [
  'Legacy API endpoint usage',
  'Manual field mapping patterns',
  'Missing prop interfaces',
  'Non-kebab-case new endpoints'
];

// Advisory Level (Week 4, Day 5)
const advisoryRules = [
  'Performance optimization suggestions',
  'Code complexity warnings',
  'Documentation completeness',
  'Test coverage recommendations'
];
```

### Quick Reference Materials

#### SoapBox Standards Quick Reference Card
```markdown
# SoapBox Standards Quick Reference

## Naming Conventions ✨
- **URLs:** kebab-case (`/api/prayer-requests`)
- **Frontend:** camelCase (`userId`, `isPublic`)  
- **Database:** snake_case (`user_id`, `is_public`)
- **Components:** PascalCase (`CommentDialog.tsx`)
- **Files:** Match content type

## Required Tools 🔧
- **ESLint:** `npm run lint`
- **Prettier:** `npm run format`
- **TypeScript:** `npm run check`
- **Build:** `npm run build`

## Component Structure 📋
```typescript
// 1. Imports
import React, { useState } from 'react';

// 2. Props interface
interface ComponentProps {
  userId: string;
  onAction: () => void;
}

// 3. Component
export function ComponentName({ userId, onAction }: ComponentProps) {
  // 4. Hooks
  // 5. Computed values  
  // 6. Event handlers
  // 7. Effects
  // 8. Render
}
```

## API Patterns 🌐
- **REST:** `/api/resource` (GET, POST, PUT, DELETE)
- **Response:** `{ success: boolean, data?: T, error?: string }`
- **Auth:** Session-based with `isAuthenticated` middleware
- **Validation:** Zod schemas for all inputs

## Field Mapping 🔄
```typescript
import { mapUserToApi } from '@/lib/field-mapping';
const apiData = mapUserToApi(dbData);
```

## Getting Help 💬
- **Slack:** #standards-help
- **Documentation:** /standards-wiki
- **Office Hours:** Tuesdays 2-3pm
```

#### Interactive Standards Wiki

**Wiki Structure:**
```
/standards-wiki/
├── index.md                 # Overview and navigation
├── naming-conventions/      # Detailed naming rules
│   ├── api-endpoints.md
│   ├── frontend-code.md
│   └── database-schema.md
├── code-quality/           # ESLint, Prettier, TypeScript
│   ├── eslint-rules.md
│   ├── prettier-config.md
│   └── typescript-strict.md
├── patterns/               # Common patterns and examples
│   ├── component-structure.md
│   ├── api-design.md
│   └── field-mapping.md
├── tools/                  # Tool configuration and usage
│   ├── vscode-setup.md
│   ├── git-hooks.md
│   └── ci-integration.md
├── examples/               # Real code examples
│   ├── good-components/
│   ├── bad-components/
│   └── refactoring-guides/
└── faq.md                  # Frequently asked questions
```

**Wiki Features:**
- **Searchable:** Full-text search across all content
- **Interactive:** Live code examples with syntax highlighting  
- **Versioned:** Track changes and updates over time
- **Community:** Comments and suggestions from team
- **Mobile-friendly:** Accessible on all devices

#### Standards Cheat Sheet (Printable)
```
┌─────────────────────────────────────────────────────────────┐
│                 SOAPBOX STANDARDS CHEAT SHEET              │
├─────────────────────────────────────────────────────────────┤
│ NAMING CONVENTIONS                                          │
│  URLs: /api/prayer-requests (kebab-case)                   │
│  Frontend: userId, isPublic (camelCase)                    │
│  Database: user_id, is_public (snake_case)                 │
│  Components: CommentDialog.tsx (PascalCase)                │
├─────────────────────────────────────────────────────────────┤
│ BEFORE EVERY COMMIT                                         │
│  ✓ npm run lint        (fix code issues)                   │
│  ✓ npm run format      (fix formatting)                    │
│  ✓ npm run check       (TypeScript errors)                 │
│  ✓ npm run test        (run test suite)                    │
├─────────────────────────────────────────────────────────────┤
│ COMPONENT TEMPLATE                                          │
│  interface Props { /* type props */ }                      │
│  export function Name(props: Props) {                      │
│    // hooks, computed, handlers, effects, render           │
│  }                                                          │
├─────────────────────────────────────────────────────────────┤
│ NEED HELP?                                                  │
│  Slack: #standards-help                                    │
│  Wiki: /standards-wiki                                     │
│  Office Hours: Tuesdays 2-3pm                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Success Metrics and Monitoring

### Week-by-Week Success Criteria

#### Week 1 Success Metrics
- [ ] 100% of developers complete environment setup
- [ ] 100% pass standards knowledge assessment  
- [ ] CI enforcement pipeline operational
- [ ] Zero build failures due to standards violations
- [ ] All developers can run `npm run validate` successfully

#### Week 2 Success Metrics  
- [ ] All API endpoints migrated to kebab-case
- [ ] Zero broken API calls in production
- [ ] Backend compatibility maintained for legacy endpoints
- [ ] React Query caching works with new endpoint patterns
- [ ] API response times within 5% of baseline

#### Week 3 Success Metrics
- [ ] 80% of high-priority components migrated
- [ ] All components pass ESLint validation
- [ ] No default exports in component files
- [ ] All props properly typed with TypeScript interfaces
- [ ] Component structure follows guidelines

#### Week 4 Success Metrics
- [ ] 100% automated enforcement operational
- [ ] Legacy code scan shows <5 critical violations
- [ ] Wiki documentation complete and accessible
- [ ] Team satisfaction score >8/10 for standards adoption
- [ ] Development velocity maintained (within 10% of baseline)

### Continuous Monitoring Dashboard

#### Real-time Compliance Tracking
```typescript
interface ComplianceMetrics {
  overallScore: number;           // 0-100%
  eslintCompliance: number;       // % files passing ESLint
  prettierCompliance: number;     // % files properly formatted  
  typescriptCompliance: number;   // % strict TypeScript coverage
  namingCompliance: number;       // % following naming conventions
  
  violationTrends: {
    thisWeek: number;
    lastWeek: number;
    improvement: number;          // percentage change
  };
  
  teamAdoption: {
    developersCompliant: number;  // out of total team
    averageCompetencyScore: number; // assessment scores
    trainingCompletion: number;   // % completed training
  };
}
```

#### Daily Standup Integration
```markdown
## Daily Standards Check
*Include in every standup*

### Yesterday's Compliance
- Overall Score: 94% (↑2% from previous day)
- New Violations: 3 (all resolved)
- Standards Training: 85% team completion

### Today's Focus
- Complete Week 2 API migration
- Address 2 remaining ESLint warnings
- Finish component refactoring for UserProfile

### Blockers/Questions
- Need clarification on edge case for field mapping
- Request additional training session on advanced TypeScript patterns
```

---

## Risk Management and Contingencies

### Potential Risks and Mitigation

#### Risk 1: Developer Resistance to New Standards
**Probability:** Medium  
**Impact:** High  
**Mitigation:**
- Emphasize benefits (bug reduction, faster development)
- Provide comprehensive training and support
- Gradual enforcement with warnings before errors
- Regular feedback sessions and adjustment periods

#### Risk 2: Development Velocity Slowdown
**Probability:** Medium  
**Impact:** Medium  
**Mitigation:**
- Automated tooling reduces manual effort
- Training front-loads learning curve
- Parallel development tracks for urgent features
- Temporary standards exemptions for critical bug fixes

#### Risk 3: Tool Configuration Issues
**Probability:** Low  
**Impact:** High  
**Mitigation:**
- Tested setup scripts for all common environments
- Dedicated #standards-help Slack channel
- Office hours for immediate support
- Fallback manual configuration procedures

#### Risk 4: Legacy Code Migration Delays
**Probability:** Medium  
**Impact:** Low  
**Mitigation:**
- Prioritized migration based on business impact
- Automated legacy detection and tracking
- Parallel development on new features using standards
- Extended timeline for non-critical legacy code

### Rollback Procedures

#### Emergency Rollback Plan
```bash
# If critical issues arise during rollout
# 1. Disable enforcement (1 minute)
git revert [standards-enforcement-commit]
npm run deploy:emergency

# 2. Restore legacy patterns (5 minutes)  
git checkout legacy-backup-branch
npm run build:legacy
npm run deploy:rollback

# 3. Communicate to team (immediate)
# Slack message template:
"🚨 STANDARDS ROLLBACK: Temporarily reverted to legacy patterns due to [issue]. Normal development continues. Investigation in progress."
```

#### Partial Rollback Options
- **Tool-level:** Disable specific ESLint rules or Prettier enforcement
- **Component-level:** Revert specific component changes while keeping others
- **API-level:** Re-enable legacy endpoints exclusively
- **Team-level:** Exemptions for specific developers while others continue

---

## Communication and Support

### Communication Channels

#### Primary Channels
- **#standards-general:** Announcements, updates, general discussion
- **#standards-help:** Technical questions, troubleshooting, quick help  
- **#standards-feedback:** Suggestions, complaints, improvement ideas
- **Email Updates:** Weekly progress reports to stakeholders

#### Communication Schedule
- **Daily:** Compliance metrics in team standups
- **Weekly:** Progress reports and metrics summary
- **Bi-weekly:** Team feedback sessions and adjustment meetings
- **Monthly:** Standards review and process improvement

### Support Infrastructure

#### Office Hours Schedule
- **Tuesdays 2-3pm:** General standards questions and guidance
- **Thursdays 4-5pm:** Advanced topics and complex scenarios  
- **On-demand:** Slack #standards-help for immediate assistance
- **Emergency:** Direct escalation to Alan Safahi for blocking issues

#### Peer Support Network
- **Standards Champions:** 2-3 experienced developers per team
- **Buddy System:** Pair new developers with standards mentors
- **Code Review Partners:** Cross-team review for standards compliance
- **Monthly Lunch & Learn:** Share experiences and best practices

#### External Resources
- **Vendor Support:** ESLint, Prettier, TypeScript documentation links
- **Community Resources:** React, Node.js, PostgreSQL best practices
- **Training Providers:** External courses for advanced TypeScript, testing
- **Conference Talks:** Curated list of relevant development standards presentations

---

## Post-Rollout Maintenance

### Ongoing Responsibilities

#### Technical Lead (Alan Safahi)
- Weekly compliance review and metrics analysis
- Monthly standards updates and refinements
- Quarterly team feedback sessions and process improvements
- Annual comprehensive standards review and upgrade

#### Development Team
- Daily adherence to standards in all new code
- Weekly legacy code migration contributions
- Monthly peer code reviews focused on standards
- Continuous feedback and improvement suggestions

#### QA Team
- Standards compliance testing in all feature reviews
- Automated test coverage for standards enforcement
- Documentation accuracy verification
- User experience impact assessment

### Continuous Improvement Process

#### Monthly Standards Review
```markdown
## Monthly Standards Review Template

### Compliance Metrics
- Overall Score: X% (target: >90%)
- Improvement Areas: [List top 3]
- Success Stories: [Highlight achievements]

### Tool Performance
- ESLint: [Effectiveness, issues, updates needed]
- Prettier: [Configuration adjustments]
- TypeScript: [New strict rules consideration]

### Team Feedback Summary
- Common Questions: [FAQ updates needed]
- Training Gaps: [Additional sessions required]
- Process Pain Points: [Improvements to implement]

### Next Month Focus
- Priority Improvements: [Specific action items]
- New Tools/Rules: [Evaluation and testing]
- Training Updates: [Content refreshers needed]
```

#### Quarterly Major Reviews
- **Standards Evolution:** Assess industry trends and update practices
- **Tool Upgrades:** Evaluate new versions of ESLint, Prettier, TypeScript
- **Performance Impact:** Measure development velocity and code quality improvements
- **Team Satisfaction:** Survey and address adoption concerns
- **ROI Assessment:** Quantify bug reduction and productivity gains

---

## Conclusion

This comprehensive rollout plan ensures successful adoption of SoapBox Development Standards while maintaining team productivity and system stability. The combination of thorough training, automated enforcement, comprehensive documentation, and continuous support creates a sustainable foundation for world-class development practices.

**Key Success Factors:**
1. **Gradual Implementation:** 4-week phased approach minimizes disruption
2. **Comprehensive Training:** Multi-format learning accommodates different styles  
3. **Automated Enforcement:** Tools do the heavy lifting, reducing manual overhead
4. **Continuous Support:** Multiple channels ensure developers never get stuck
5. **Measurable Progress:** Clear metrics track success and identify improvement areas

**Expected Outcomes:**
- **30% reduction** in integration bugs within 90 days
- **50% faster** new developer onboarding
- **90%+ automated** standards compliance
- **World-class** development practices established
- **Sustainable** long-term code quality improvement

**Next Steps:**
1. Alan Safahi approval and final review
2. Week 1 kickoff with team announcement
3. Begin foundation setup and training
4. Monitor progress and adjust as needed

---

**Document Status:** READY FOR IMPLEMENTATION  
**Approval Required:** Technical Lead (Alan Safahi)  
**Implementation Start:** Upon approval  
**First Milestone:** Week 1 foundation complete