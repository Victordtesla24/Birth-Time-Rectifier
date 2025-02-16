import { ApiClient } from '../../src/services/api';
import { EventBus } from '../../src/services/modules';
import { MockApiClient, MockEventBus } from '../../types/test-utils';

jest.mock('../../src/services/api');
jest.mock('../../src/services/modules');

describe('ApiClient', () => {
    let apiClient: MockApiClient;
    let mockEventBus: MockEventBus;
    let mockFetch: jest.Mock;

    beforeEach(() => {
        mockEventBus = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn()
        };

        mockFetch = jest.fn().mockImplementation(async function(endpoint: string, options = {}) {
            if (this.eventBus) {
                this.eventBus.emit('loading:start');
            }

            try {
                const response = await Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: 'test' }),
                    text: () => Promise.resolve('test'),
                    blob: () => Promise.resolve(new Blob()),
                    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
                    formData: () => Promise.resolve(new FormData()),
                    clone: () => ({ ...this }),
                    headers: new Headers(),
                    redirected: false,
                    status: 200,
                    statusText: 'OK',
                    type: 'basic',
                    url: endpoint
                });

                if (!response.ok) {
                    const error = new Error('API Error');
                    this.errorHandlers.forEach((handler: (error: Error) => void) => handler(error));
                    throw error;
                }

                return response;
            } finally {
                if (this.eventBus) {
                    this.eventBus.emit('loading:end');
                }
            }
        });

        global.fetch = mockFetch;

        apiClient = new ApiClient() as unknown as MockApiClient;
        apiClient.setEventBus(mockEventBus);
    });

    afterEach(() => {
        jest.clearAllMocks();
        delete global.fetch;
    });

    it('should make successful API requests', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ data: 'test' })
        });

        const result = await apiClient.request('/test');

        expect(result).toEqual({ data: 'test' });
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:start');
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:end');
        expect(mockFetch).toHaveBeenCalledWith(
            '/test',
            expect.objectContaining({
                method: 'GET',
                headers: expect.any(Object)
            })
        );
    });

    it('should handle API errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400
        });

        await expect(apiClient.request('/error')).rejects.toThrow('API Error');
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:start');
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:end');
    });

    it('should handle network errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network Error'));

        await expect(apiClient.request('/error')).rejects.toThrow();
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:start');
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:end');
    });

    it('should handle error callbacks', async () => {
        const mockCallback = jest.fn();
        apiClient.onError(mockCallback);

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400
        });

        await expect(apiClient.request('/error')).rejects.toThrow('API Error');

        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:start');
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:end');
        expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle multiple error callbacks', async () => {
        const mockCallback1 = jest.fn();
        const mockCallback2 = jest.fn();

        apiClient.onError(mockCallback1);
        apiClient.onError(mockCallback2);

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400
        });

        await expect(apiClient.request('/error')).rejects.toThrow('API Error');

        expect(mockCallback1).toHaveBeenCalledWith(expect.any(Error));
        expect(mockCallback2).toHaveBeenCalledWith(expect.any(Error));
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:start');
        expect(mockEventBus.emit).toHaveBeenCalledWith('loading:end');
    });
});
