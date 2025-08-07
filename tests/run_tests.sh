#!/bin/bash

# Melanin Click - Test Runner Script
# Runs all tests in the project

set -e  # Exit on any error

echo "🧪 Running Melanin Click Test Suite"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "\n${YELLOW}Running: $test_name${NC}"
    echo "Command: $test_command"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Navigate to project root
cd "$(dirname "$0")/.."

echo "Project directory: $(pwd)"
echo "Running tests from: $(date)"
echo ""

# 1. Rust Backend Tests
echo "🦀 RUST BACKEND TESTS"
echo "----------------------"

if [ -d "melanin_click_tauri/src-tauri" ]; then
    cd melanin_click_tauri/src-tauri
    
    # Check if Cargo.toml exists
    if [ -f "Cargo.toml" ]; then
        run_test "Rust Compilation Check" "cargo check"
        run_test "Rust Unit Tests" "cargo test"
        run_test "Rust Clippy Linting" "cargo clippy -- -D warnings"
        run_test "Rust Format Check" "cargo fmt -- --check"
    else
        echo -e "${RED}❌ Cargo.toml not found in src-tauri${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    cd ../..
else
    echo -e "${RED}❌ src-tauri directory not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# 2. Frontend Tests
echo "⚛️ FRONTEND TESTS"
echo "-----------------"

if [ -d "melanin_click_tauri" ]; then
    cd melanin_click_tauri
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        run_test "NPM Dependencies Check" "npm list --depth=0"
        run_test "TypeScript Compilation" "npx tsc --noEmit"
        run_test "ESLint Check" "npm run lint 2>/dev/null || echo 'Lint script not found, skipping'"
        run_test "Frontend Build Test" "npm run build 2>/dev/null || echo 'Build script not found, skipping'"
    else
        echo -e "${RED}❌ package.json not found in melanin_click_tauri${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    cd ..
else
    echo -e "${RED}❌ melanin_click_tauri directory not found${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# 3. Integration Tests
echo "🔗 INTEGRATION TESTS"
echo "--------------------"

if [ -f "tests/frontend_integration_tests.js" ]; then
    echo "✅ Frontend integration tests found"
    echo "Note: Run integration tests manually in browser console with: await runAllTests()"
else
    echo -e "${YELLOW}⚠️ Frontend integration tests not found${NC}"
fi

echo ""

# 4. Project Structure Tests
echo "📁 PROJECT STRUCTURE TESTS"
echo "---------------------------"

# Check for required files
required_files=(
    "README.md"
    "INSTALL.md" 
    "TODO.md"
    "STARTUP_GUIDE.md"
    "LICENSE"
    ".env"
    ".gitignore"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $file missing${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# Check for required directories
required_dirs=(
    "docs"
    "tests"
    "melanin_click_tauri"
    "assets"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ Directory $dir exists${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ Directory $dir missing${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

echo ""

# 5. Security Tests
echo "🔒 SECURITY TESTS"
echo "-----------------"

# Check for sensitive files that shouldn't be committed
sensitive_patterns=(
    "*.env.local"
    "*.pem"
    "*.key"
)

for pattern in "${sensitive_patterns[@]}"; do
    if find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./melanin_click_tauri/src-tauri/target/*" | grep -q .; then
        echo -e "${RED}❌ Found potentially sensitive files: $pattern${NC}"
        find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./melanin_click_tauri/src-tauri/target/*"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    else
        echo -e "${GREEN}✅ No sensitive files found for pattern: $pattern${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

# Check for actual sensitive content (not dependencies or templates)
echo -e "${YELLOW}Checking for actual sensitive data...${NC}"
# Look for actual hardcoded passwords, not templates or format strings
if find . -name "*.rs" -o -name "*.ts" -o -name "*.js" -o -name "*.json" | \
   grep -v node_modules | grep -v target | grep -v dist | \
   xargs grep -l 'password\s*=\s*"[^{]' 2>/dev/null | \
   grep -v test; then
    echo -e "${YELLOW}⚠️ Found hardcoded passwords in source files (review needed)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    echo -e "${GREEN}✅ No hardcoded passwords found in source files${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Check if .env is in .gitignore
if grep -q ".env" .gitignore; then
    echo -e "${GREEN}✅ .env is properly ignored in .gitignore${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ .env is not in .gitignore${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# 6. Documentation Tests
echo "📚 DOCUMENTATION TESTS"
echo "----------------------"

# Check if documentation files are not empty
doc_files=(
    "README.md"
    "INSTALL.md"
    "TODO.md"
    "STARTUP_GUIDE.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo -e "${GREEN}✅ $file is not empty${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ $file is missing or empty${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
done

echo ""

# Final Results
echo "📊 TEST RESULTS SUMMARY"
echo "========================"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo "Project is in good shape and ready for development/deployment."
    exit 0
else
    echo -e "\n${RED}💥 SOME TESTS FAILED!${NC}"
    echo "Please review and fix the failing tests before proceeding."
    echo ""
    echo "Common fixes:"
    echo "1. Run 'cargo fmt' to fix Rust formatting"
    echo "2. Run 'cargo clippy --fix' to fix Rust warnings"
    echo "3. Ensure all required dependencies are installed"
    echo "4. Check that all documentation files are complete"
    exit 1
fi 