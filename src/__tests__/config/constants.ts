export const TEST_TIMEOUT = {
  ANIMATION: 300,
  API_CALL: 5000,
  RENDER: 1000,
  TRANSITION: 500,
};

export const TEST_IDS = {
  BIRTH_CHART: 'birth-chart',
  BIRTH_DATE_INPUT: 'birth-date-input',
  BIRTH_LOCATION_INPUT: 'birth-location-input',
  BIRTH_TIME_RANGE_START: 'birth-time-range-start',
  BIRTH_TIME_RANGE_END: 'birth-time-range-end',
  CALCULATE_BUTTON: 'calculate-button',
  CONFIDENCE_SCORE: 'confidence-score',
  GENERATE_REPORT: 'generate-report',
  NEXT_QUESTION: 'next-question',
  PLANET_SUN: 'planet-sun',
  PLANET_MOON: 'planet-moon',
  QUESTION_ITEM: 'question-item',
  RESULT_CHART: 'result-chart',
  START_QUESTIONNAIRE: 'start-questionnaire',
};

export const TEST_ROUTES = {
  HOME: '/',
  CALCULATION: '/calculation',
  RESULTS: '/results',
  REPORT: '/report',
};

export const TEST_API_ENDPOINTS = {
  CALCULATE: '/api/calculate',
  CHART_DATA: '/api/chart-data',
  HEALTH: '/api/health',
};

export const TEST_ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_TIME: 'Please enter a valid time',
  INVALID_LOCATION: 'Please enter a valid location',
  SERVER_ERROR: 'An error occurred. Please try again.',
};

export const TEST_MOCK_DATA = {
  VALID_DATE: '1990-01-01',
  VALID_LOCATION: 'New York, USA',
  VALID_TIME_START: '12:00',
  VALID_TIME_END: '14:00',
  INVALID_DATE: 'invalid-date',
  BIRTH_TIME: '12:00:00',
  CONFIDENCE_SCORE: 0.85,
}; 