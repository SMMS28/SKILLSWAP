module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/setupTests.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
