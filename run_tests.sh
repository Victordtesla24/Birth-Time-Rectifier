#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting test suite for Birth Time Rectifier...${NC}\n"

# Create test results directory
mkdir -p test-results

# Run unit tests
echo -e "${BLUE}Running unit tests...${NC}"
npm test -- --coverage --json --outputFile=test-results/unit.json

# Run integration tests
echo -e "\n${BLUE}Running integration tests...${NC}"
npm test -- tests/integration --json --outputFile=test-results/integration.json

# Run E2E tests
echo -e "\n${BLUE}Running E2E tests...${NC}"
npm test -- tests/e2e --json --outputFile=test-results/e2e.json

# Generate test report
echo -e "\n${BLUE}Generating test report...${NC}"

# Combine test results
node -e "
const fs = require('fs');
const unit = require('./test-results/unit.json');
const integration = require('./test-results/integration.json');
const e2e = require('./test-results/e2e.json');

const report = {
    timestamp: new Date().toISOString(),
    summary: {
        total: unit.numTotalTests + integration.numTotalTests + e2e.numTotalTests,
        passed: unit.numPassedTests + integration.numPassedTests + e2e.numPassedTests,
        failed: unit.numFailedTests + integration.numFailedTests + e2e.numFailedTests,
        coverage: unit.coverageMap ? Math.round(unit.coverageMap.total.lines.pct) : 'N/A'
    },
    details: {
        unit: {
            total: unit.numTotalTests,
            passed: unit.numPassedTests,
            failed: unit.numFailedTests,
            coverage: unit.coverageMap ? Math.round(unit.coverageMap.total.lines.pct) : 'N/A'
        },
        integration: {
            total: integration.numTotalTests,
            passed: integration.numPassedTests,
            failed: integration.numFailedTests
        },
        e2e: {
            total: e2e.numTotalTests,
            passed: e2e.numPassedTests,
            failed: e2e.numFailedTests
        }
    }
};

fs.writeFileSync('test-results/report.json', JSON.stringify(report, null, 2));

// Print report
console.log('\n=== Test Report ===');
console.log(\`Total Tests: \${report.summary.total}\`);
console.log(\`Passed: \${report.summary.passed}\`);
console.log(\`Failed: \${report.summary.failed}\`);
console.log(\`Coverage: \${report.summary.coverage}%\`);
console.log('\nUnit Tests:');
console.log(\`  Total: \${report.details.unit.total}\`);
console.log(\`  Passed: \${report.details.unit.passed}\`);
console.log(\`  Failed: \${report.details.unit.failed}\`);
console.log(\`  Coverage: \${report.details.unit.coverage}%\`);
console.log('\nIntegration Tests:');
console.log(\`  Total: \${report.details.integration.total}\`);
console.log(\`  Passed: \${report.details.integration.passed}\`);
console.log(\`  Failed: \${report.details.integration.failed}\`);
console.log('\nE2E Tests:');
console.log(\`  Total: \${report.details.e2e.total}\`);
console.log(\`  Passed: \${report.details.e2e.passed}\`);
console.log(\`  Failed: \${report.details.e2e.failed}\`);
"

# Check if any tests failed
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}All tests completed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Check the report for details.${NC}"
    exit 1
fi
