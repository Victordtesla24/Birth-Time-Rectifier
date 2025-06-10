import { logger } from '@/services/logger';

jest.mock('@/services/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}));

describe('Test Logging System', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('demonstrates logging functionality', () => {
        logger.info('unit', 'Running unit test example');
        expect(logger.info).toHaveBeenCalledWith('unit', 'Running unit test example');
    });

    test('handles error logging', () => {
        const error = new Error('Test error');
        logger.error('unit', 'Error in test', error);
        expect(logger.error).toHaveBeenCalledWith('unit', 'Error in test', error);
    });

    test('handles warning logging', () => {
        logger.warn('unit', 'Test warning');
        expect(logger.warn).toHaveBeenCalledWith('unit', 'Test warning');
    });

    test('handles debug logging', () => {
        logger.debug('unit', 'Debug message');
        expect(logger.debug).toHaveBeenCalledWith('unit', 'Debug message');
    });
}); 