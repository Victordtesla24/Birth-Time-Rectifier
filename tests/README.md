# Birth Time Rectifier Tests

This directory contains comprehensive tests for the Birth Time Rectifier application, covering both frontend and backend components.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual components
│   ├── test_agent1.py   # Tests for Agent 1 (input collection & preprocessing)
│   ├── test_agent2.py   # Tests for Agent 2 (analysis & refinement)
│   ├── form.test.js     # Tests for form component
│   ├── api.test.js      # Tests for API layer
│   └── visualization.test.js  # Tests for visualization component
├── integration/         # Integration tests between components
│   └── form-api-visualization.test.js
├── e2e/                # End-to-end workflow tests
│   └── workflow.test.js
└── ui/                 # UI/UX specific tests
    └── visual-interaction.test.js
```

## Running Tests

### Prerequisites

1. Python 3.9+ with pip
2. Node.js 14+ with npm
3. Virtual environment tool (venv)

### Setup

1. Clone the repository and navigate to the project root:
   ```bash
   cd Birth-Time-Rectifier
   ```

2. Run the test suite:
   ```bash
   ./run_tests.sh
   ```

   This script will:
   - Create and activate a Python virtual environment
   - Install all Python and Node.js dependencies
   - Run all test suites
   - Generate test reports

### Running Individual Test Suites

#### JavaScript Tests

```bash
# Run all JavaScript tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:ui

# Run with coverage
npm run test:coverage
```

#### Python Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all Python tests
pytest

# Run specific test files
pytest tests/unit/test_agent1.py
pytest tests/unit/test_agent2.py

# Run with coverage
pytest --cov=.
```

### Test Reports

After running tests, reports are available in:
- `test-reports/jest-report.html` - JavaScript test results
- `test-reports/python-report.html` - Python test results
- `test-reports/integration-report.html` - Integration test results
- `test-reports/e2e-report.html` - End-to-end test results
- `test-reports/ui-report.html` - UI test results
- `test-reports/coverage/` - Combined coverage reports

## Test Categories

### Unit Tests
- **Agent 1**: Input validation, geocoding, timezone conversion, planetary calculations
- **Agent 2**: Data validation, aspect calculations, analysis functions
- **Form**: Input handling, validation, state management
- **API**: Data transformation, error handling
- **Visualization**: Chart rendering, interactive features

### Integration Tests
- Form → API → Agent communication
- Data flow between components
- State management
- Error propagation

### End-to-End Tests
- Complete birth time rectification workflow
- Error handling scenarios
- Edge cases

### UI Tests
- Component rendering
- Interactive elements
- Loading states
- Error displays
- Responsive design
- Accessibility

## Linting

JavaScript linting uses ESLint with custom rules focusing on functionality:
- Enabled: unused variables, undefined variables, debugger statements
- Disabled: style-related rules (indentation, quotes, etc.)

## Coverage Requirements

Minimum coverage requirements:
- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Adding New Tests

1. Create test files following the naming convention:
   - Python: `test_*.py` or `*_test.py`
   - JavaScript: `*.test.js` or `*.spec.js`

2. Use appropriate test markers:
   ```python
   @pytest.mark.unit
   @pytest.mark.integration
   @pytest.mark.e2e
   @pytest.mark.ui
   ```

3. Group related tests using describe blocks:
   ```javascript
   describe('Component Name', () => {
     describe('Feature', () => {
       test('should behave correctly', () => {
         // Test code
       });
     });
   });
   ```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   pip install -r requirements.txt
   npm install
   ```

2. **Test Environment**
   ```bash
   # Clear Python cache
   find . -type d -name "__pycache__" -exec rm -r {} +
   
   # Clear Node modules
   rm -rf node_modules
   npm install
   ```

3. **Test Reports**
   ```bash
   # Clear old reports
   rm -rf test-reports/
   ```

### Debug Mode

Add these flags for detailed output:
```bash
# Python tests
pytest -vv --showlocals

# JavaScript tests
npm test -- --verbose
