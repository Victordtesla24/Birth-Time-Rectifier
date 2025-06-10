const fs = require('fs');
const path = require('path');

const TEST_RESULTS_DIR = 'test-results';
const OUTPUT_FILE = path.join(TEST_RESULTS_DIR, 'aggregate-report.json');

// Ensure test results directory exists
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

// Read and parse test results
const readJsonFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}:`, error.message);
    return null;
  }
};

// Aggregate test results
const aggregateResults = () => {
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0
    },
    coverage: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    },
    performance: {
      averageRenderTime: 0,
      averageFrameRate: 0,
      memoryUsage: {
        average: 0,
        peak: 0
      }
    },
    accessibility: {
      violations: 0,
      passes: 0,
      incomplete: 0
    },
    visualRegression: {
      total: 0,
      passed: 0,
      failed: 0
    },
    details: {
      jest: null,
      playwright: null,
      performance: null,
      accessibility: null,
      visual: null
    }
  };

  // Read Jest results
  const jestResults = readJsonFile(path.join(TEST_RESULTS_DIR, 'jest/junit.xml'));
  if (jestResults) {
    results.details.jest = jestResults;
    // Update summary with Jest results
    results.summary.total += jestResults.numTotalTests || 0;
    results.summary.passed += jestResults.numPassedTests || 0;
    results.summary.failed += jestResults.numFailedTests || 0;
    results.summary.skipped += jestResults.numPendingTests || 0;
    results.summary.duration += jestResults.testResults?.reduce((acc, result) => acc + result.endTime - result.startTime, 0) || 0;
  }

  // Read coverage results
  const coverage = readJsonFile(path.join('coverage', 'coverage-final.json'));
  if (coverage) {
    const coverageResults = Object.values(coverage).reduce((acc, file) => ({
      statements: acc.statements + (file.statementMap ? Object.keys(file.statementMap).length : 0),
      branches: acc.branches + (file.branchMap ? Object.keys(file.branchMap).length : 0),
      functions: acc.functions + (file.fnMap ? Object.keys(file.fnMap).length : 0),
      lines: acc.lines + (file.lineMap ? Object.keys(file.lineMap).length : 0)
    }), { statements: 0, branches: 0, functions: 0, lines: 0 });

    results.coverage = coverageResults;
  }

  // Read Playwright results
  const playwrightResults = readJsonFile(path.join(TEST_RESULTS_DIR, 'playwright-report.json'));
  if (playwrightResults) {
    results.details.playwright = playwrightResults;
    // Update summary with Playwright results
    const playwrightSummary = playwrightResults.suites?.reduce((acc, suite) => ({
      total: acc.total + suite.specs.length,
      passed: acc.passed + suite.specs.filter(spec => spec.ok).length,
      failed: acc.failed + suite.specs.filter(spec => !spec.ok).length,
      duration: acc.duration + suite.duration
    }), { total: 0, passed: 0, failed: 0, duration: 0 });

    if (playwrightSummary) {
      results.summary.total += playwrightSummary.total;
      results.summary.passed += playwrightSummary.passed;
      results.summary.failed += playwrightSummary.failed;
      results.summary.duration += playwrightSummary.duration;
    }
  }

  // Read performance results
  const performanceResults = readJsonFile(path.join(TEST_RESULTS_DIR, 'performance-results/summary.json'));
  if (performanceResults) {
    results.details.performance = performanceResults;
    results.performance = {
      averageRenderTime: performanceResults.averageRenderTime,
      averageFrameRate: performanceResults.averageFrameRate,
      memoryUsage: performanceResults.memoryUsage
    };
  }

  // Read accessibility results
  const accessibilityResults = readJsonFile(path.join(TEST_RESULTS_DIR, 'accessibility-results/summary.json'));
  if (accessibilityResults) {
    results.details.accessibility = accessibilityResults;
    results.accessibility = {
      violations: accessibilityResults.violations?.length || 0,
      passes: accessibilityResults.passes?.length || 0,
      incomplete: accessibilityResults.incomplete?.length || 0
    };
  }

  // Read visual regression results
  const visualResults = readJsonFile(path.join(TEST_RESULTS_DIR, 'visual-regression-results/summary.json'));
  if (visualResults) {
    results.details.visual = visualResults;
    results.visualRegression = {
      total: visualResults.total || 0,
      passed: visualResults.passed || 0,
      failed: visualResults.failed || 0
    };
  }

  return results;
};

// Write aggregated results
const results = aggregateResults();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

console.log('Test results aggregated successfully!');
console.log(`Results written to ${OUTPUT_FILE}`);

// Print summary
console.log('\nTest Summary:');
console.log('--------------');
console.log(`Total Tests: ${results.summary.total}`);
console.log(`Passed: ${results.summary.passed}`);
console.log(`Failed: ${results.summary.failed}`);
console.log(`Skipped: ${results.summary.skipped}`);
console.log(`Duration: ${results.summary.duration}ms`);

console.log('\nCoverage Summary:');
console.log('-----------------');
console.log(`Statements: ${results.coverage.statements}%`);
console.log(`Branches: ${results.coverage.branches}%`);
console.log(`Functions: ${results.coverage.functions}%`);
console.log(`Lines: ${results.coverage.lines}%`);

console.log('\nPerformance Summary:');
console.log('-------------------');
console.log(`Average Render Time: ${results.performance.averageRenderTime}ms`);
console.log(`Average Frame Rate: ${results.performance.averageFrameRate}fps`);
console.log(`Average Memory Usage: ${results.performance.memoryUsage.average}MB`);
console.log(`Peak Memory Usage: ${results.performance.memoryUsage.peak}MB`);

console.log('\nAccessibility Summary:');
console.log('---------------------');
console.log(`Violations: ${results.accessibility.violations}`);
console.log(`Passes: ${results.accessibility.passes}`);
console.log(`Incomplete: ${results.accessibility.incomplete}`);

console.log('\nVisual Regression Summary:');
console.log('-------------------------');
console.log(`Total: ${results.visualRegression.total}`);
console.log(`Passed: ${results.visualRegression.passed}`);
console.log(`Failed: ${results.visualRegression.failed}`); 