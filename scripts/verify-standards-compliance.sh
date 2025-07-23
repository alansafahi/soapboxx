#!/bin/bash

echo "🔒 SoapBox Development Standards v1.0 - Compliance Verification"
echo "=================================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track overall compliance status
COMPLIANCE_PASSED=true

echo "📋 Checking mandatory compliance requirements..."
echo ""

# 1. TypeScript Strict Mode Check
echo "⚡ TypeScript Strict Mode Compliance..."
if npx tsc --noEmit --strict; then
    echo -e "${GREEN}✅ TypeScript strict mode: PASSED${NC}"
else
    echo -e "${RED}❌ TypeScript strict mode: FAILED${NC}"
    COMPLIANCE_PASSED=false
fi
echo ""

# 2. ESLint Zero Warnings Policy
echo "⚡ ESLint Zero Warnings Policy..."
if npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0; then
    echo -e "${GREEN}✅ ESLint zero warnings: PASSED${NC}"
else
    echo -e "${RED}❌ ESLint violations detected: FAILED${NC}"
    COMPLIANCE_PASSED=false
fi
echo ""

# 3. Prettier Format Consistency
echo "⚡ Prettier Format Consistency..."
if npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}"; then
    echo -e "${GREEN}✅ Prettier formatting: PASSED${NC}"
else
    echo -e "${RED}❌ Formatting violations detected: FAILED${NC}"
    echo -e "${YELLOW}💡 Run 'npx prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"' to fix${NC}"
    COMPLIANCE_PASSED=false
fi
echo ""

# 4. API Naming Convention Check (kebab-case)
echo "⚡ API Naming Convention Check (kebab-case)..."
API_VIOLATIONS=$(grep -r "app\.\(get\|post\|put\|delete\)" server/ | grep -v "kebab-case" | grep -E "/[a-zA-Z]+[A-Z]" || true)
if [ -z "$API_VIOLATIONS" ]; then
    echo -e "${GREEN}✅ API naming conventions: PASSED${NC}"
else
    echo -e "${RED}❌ Non-kebab-case API endpoints detected:${NC}"
    echo "$API_VIOLATIONS"
    COMPLIANCE_PASSED=false
fi
echo ""

# 5. Database Schema Naming Check (snake_case)
echo "⚡ Database Schema Naming Check (snake_case)..."
SCHEMA_VIOLATIONS=$(grep -r "pgTable\|varchar\|text\|boolean" shared/schema.ts | grep -E "[a-z][A-Z]" | grep -v "([a-z_]+)" || true)
if [ -z "$SCHEMA_VIOLATIONS" ]; then
    echo -e "${GREEN}✅ Database naming conventions: PASSED${NC}"
else
    echo -e "${RED}❌ Non-snake_case database columns detected:${NC}"
    echo "$SCHEMA_VIOLATIONS"
    COMPLIANCE_PASSED=false
fi
echo ""

# 6. Legacy Endpoint Usage Check
echo "⚡ Legacy Endpoint Usage Check..."
LEGACY_ENDPOINTS=$(grep -r "/api/soap[^-]\|/api/users[^-]\|/api/checkIns" client/ server/ --exclude-dir=node_modules || true)
if [ -z "$LEGACY_ENDPOINTS" ]; then
    echo -e "${GREEN}✅ No legacy endpoint usage detected${NC}"
else
    echo -e "${YELLOW}⚠️ Legacy endpoints detected (must migrate before Sept 30, 2025):${NC}"
    echo "$LEGACY_ENDPOINTS"
fi
echo ""

# 7. Standards Documentation Check
echo "⚡ Standards Documentation Check..."
if [ -f "SOAPBOX_DEVELOPMENT_STANDARDS.md" ]; then
    echo -e "${GREEN}✅ SoapBox Development Standards document: PRESENT${NC}"
else
    echo -e "${RED}❌ SoapBox Development Standards document: MISSING${NC}"
    COMPLIANCE_PASSED=false
fi
echo ""

# 8. Enforcement Infrastructure Check
echo "⚡ Enforcement Infrastructure Check..."
MISSING_FILES=()

if [ ! -f ".github/workflows/standards-enforcement.yml" ]; then
    MISSING_FILES+=("CI Pipeline Enforcement")
fi

if [ ! -f ".husky/pre-commit" ]; then
    MISSING_FILES+=("Pre-commit Hooks")
fi

if [ ! -f ".eslintrc.js" ]; then
    MISSING_FILES+=("ESLint Configuration")
fi

if [ ! -f ".prettierrc" ]; then
    MISSING_FILES+=("Prettier Configuration")
fi

if [ ! -f "STANDARDS_COMPLIANCE_CHECKLIST.md" ]; then
    MISSING_FILES+=("Compliance Checklist")
fi

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All enforcement infrastructure: PRESENT${NC}"
else
    echo -e "${RED}❌ Missing enforcement infrastructure:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    COMPLIANCE_PASSED=false
fi
echo ""

# 9. Legacy Deprecation Timeline Check
echo "⚡ Legacy Deprecation Timeline Check..."
CURRENT_DATE=$(date +%Y-%m-%d)
DEPRECATION_DATE="2025-09-30"

if [[ "$CURRENT_DATE" > "$DEPRECATION_DATE" ]]; then
    echo -e "${RED}❌ CRITICAL: Legacy deprecation deadline exceeded${NC}"
    echo "All legacy endpoints must be removed immediately"
    COMPLIANCE_PASSED=false
else
    DAYS_REMAINING=$(( ($(date -d "$DEPRECATION_DATE" +%s) - $(date -d "$CURRENT_DATE" +%s)) / 86400 ))
    echo -e "${BLUE}📅 Legacy endpoints will be deprecated in $DAYS_REMAINING days ($DEPRECATION_DATE)${NC}"
    if [ $DAYS_REMAINING -lt 30 ]; then
        echo -e "${YELLOW}⚠️ WARNING: Less than 30 days remaining for legacy migration${NC}"
    fi
fi
echo ""

# 10. Quick Build Test
echo "⚡ Quick Build Test..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Production build: SUCCESSFUL${NC}"
else
    echo -e "${RED}❌ Production build: FAILED${NC}"
    COMPLIANCE_PASSED=false
fi
echo ""

# Final Compliance Report
echo "=================================================================="
if [ "$COMPLIANCE_PASSED" = true ]; then
    echo -e "${GREEN}🏆 COMPLIANCE STATUS: PASSED${NC}"
    echo -e "${GREEN}✅ All SoapBox Development Standards v1.0 requirements met${NC}"
    echo -e "${GREEN}🚀 Codebase ready for world-class development${NC}"
else
    echo -e "${RED}❌ COMPLIANCE STATUS: FAILED${NC}"
    echo -e "${RED}⚠️ Standards violations must be resolved before continuing${NC}"
    echo -e "${YELLOW}📖 Review SOAPBOX_DEVELOPMENT_STANDARDS.md for guidance${NC}"
fi
echo "=================================================================="

# Exit with appropriate code
if [ "$COMPLIANCE_PASSED" = true ]; then
    exit 0
else
    exit 1
fi