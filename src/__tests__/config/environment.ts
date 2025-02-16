// Set test environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api';
process.env.NEXT_PUBLIC_ENVIRONMENT = 'test';
process.env.NEXT_PUBLIC_MOCK_API = 'true';

// Configure timezone for consistent date handling
process.env.TZ = 'UTC';

// Configure test timeouts
process.env.DEFAULT_TIMEOUT = '5000';
process.env.EXTENDED_TIMEOUT = '30000';

// Configure test retries
process.env.TEST_RETRIES = '2';

// Configure test parallelization
process.env.TEST_WORKERS = '4';

// Configure test reporting
process.env.TEST_REPORT_DIR = 'test-results';
process.env.TEST_REPORT_PORTAL = 'false';

// Configure test coverage thresholds
process.env.COVERAGE_THRESHOLD_STATEMENTS = '80';
process.env.COVERAGE_THRESHOLD_BRANCHES = '70';
process.env.COVERAGE_THRESHOLD_FUNCTIONS = '80';
process.env.COVERAGE_THRESHOLD_LINES = '80'; 