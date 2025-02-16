export const testLogger = jest.fn((type: string, message: string) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
}); 