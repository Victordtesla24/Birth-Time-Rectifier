import '@testing-library/jest-dom';

// Configure test environment
beforeAll(() => {
    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    // Restore console error after tests
    jest.restoreAllMocks();
}); 