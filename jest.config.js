/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/testSetup.tsx'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/mocks/utils/styleMock',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/src/__tests__/mocks/utils/fileMock',
    '^@mui/(.*)$': '<rootDir>/src/__tests__/mocks/mui',
    '^@tests/(.*)$': '<rootDir>/src/__tests__/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@mocks/(.*)$': '<rootDir>/src/__tests__/mocks/$1',
    '^@theme$': '<rootDir>/src/theme',
    '^@api/(.*)$': '<rootDir>/src/services/api/$1'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/e2e/',
    '\\.e2e\\.ts$',
    '\\.e2e\\.tsx$',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleDirectories: ['node_modules', 'src'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/e2e/**/*',
    '!src/__tests__/**/*',
  ],
  setupFiles: ['react-app-polyfill/jsdom'],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
};

module.exports = config;
