import { ApiManager } from '../../js/modules.js';
import { ApiClient } from '../../js/api.js';

// Added CONFIG definition for tests
const CONFIG = { API_BASE_URL: "https://api.birthtimerectifier.com" };

describe('ApiManager', () => {
    let apiManager;

    beforeEach(() => {
        apiManager = new ApiManager();
        // Reset fetch mock
        global.fetch = jest.fn();
    });

    describe('Agent 1 Processing', () => {
        test('should process birth data with Agent 1', async () => {
            const mockData = {
                date: '2000-01-01',
                time: '12:00',
                place: 'New York'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            const result = await apiManager.processWithAgent1(mockData);
            expect(result.success).toBe(true);
        });

        test('should handle Agent 1 errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(apiManager.processWithAgent1({})).rejects.toThrow();
        });
    });

    describe('Agent 2 Processing', () => {
        test('should process data with Agent 2', async () => {
            const mockData = { agent1Result: {} };
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            const result = await apiManager.processWithAgent2(mockData);
            expect(result.success).toBe(true);
        });

        test('should handle Agent 2 errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(apiManager.processWithAgent2({})).rejects.toThrow();
        });
    });

    describe('Chart Data Processing', () => {
        test('should process and format chart data', () => {
            const mockData = {
                planets: [],
                houses: [],
                aspects: []
            };
            const result = apiManager.formatChartData(mockData);
            expect(result).toHaveProperty('planets');
            expect(result).toHaveProperty('houses');
            expect(result).toHaveProperty('aspects');
        });

        test('should include all required chart components', () => {
            const mockData = {
                planets: [{ id: 'sun', position: 0 }],
                houses: [{ number: 1, position: 0 }],
                aspects: [{ planet1: 'sun', planet2: 'moon', type: 'conjunction' }]
            };
            const result = apiManager.formatChartData(mockData);
            expect(result.planets).toHaveLength(1);
            expect(result.houses).toHaveLength(1);
            expect(result.aspects).toHaveLength(1);
        });
    });

    describe('End-to-End Processing', () => {
        test('should process birth data through both agents', async () => {
            const mockData = {
                date: '2000-01-01',
                time: '12:00',
                place: 'New York'
            };

            global.fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: {} })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ success: true, chart: {} })
                });

            const result = await apiManager.processBirthData(mockData);
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('chart');
        });

        test('should handle processing pipeline errors', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Pipeline error'));
            await expect(apiManager.processBirthData({})).rejects.toThrow();
        });
    });
});

describe('ApiClient', () => {
    let apiClient;
    let mockFetch;
    let originalConsoleError;

    beforeEach(() => {
        apiClient = new ApiClient();
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        // Store original console.error
        originalConsoleError = console.error;
        // Mock console.error to silence expected error logs
        console.error = jest.fn();
    });

    afterEach(() => {
        // Restore original console.error
        console.error = originalConsoleError;
        jest.resetAllMocks();
    });

    test('should initialize with correct endpoint', () => {
        expect(apiClient.baseUrl).toBe(CONFIG.API_BASE_URL);
    });

    test('should handle geocoding request', async () => {
        const mockResponse = {
            coordinates: { lat: 40.7128, lng: -74.0060 },
            address: 'New York, NY, USA'
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.geocodeLocation('New York');
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/geocode`,
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({ location: 'New York' })
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle birth time calculation request', async () => {
        const mockData = {
            birthDate: '2000-01-01',
            approximateTime: '12:00',
            location: 'New York',
            events: []
        };

        const mockResponse = {
            calculatedTime: '12:30',
            confidence: 85,
            chartData: {}
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.calculateBirthTime(mockData);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/calculate`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockData)
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle astronomical data request', async () => {
        const mockData = {
            date: '2000-01-01',
            location: { lat: 40.7128, lng: -74.0060 }
        };

        const mockResponse = {
            planets: {},
            houses: {},
            aspects: {}
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.getAstronomicalData(
            mockData.date,
            mockData.location
        );
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/astronomical-data`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockData)
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle event validation request', async () => {
        const mockEvent = {
            type: 'career',
            date: '2020-01-01',
            description: 'New job'
        };

        const mockResponse = {
            valid: true,
            significance: 0.8
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.validateEvent(mockEvent);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/validate-event`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockEvent)
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle questionnaire generation request', async () => {
        const mockBirthData = {
            birthDate: '2000-01-01',
            approximateTime: '12:00',
            location: 'New York'
        };

        const mockResponse = {
            questions: [
                { id: 1, text: 'Question 1' },
                { id: 2, text: 'Question 2' }
            ]
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.generateQuestionnaire(mockBirthData);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/generate-questionnaire`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockBirthData)
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle time refinement request', async () => {
        const mockData = {
            initialTime: '12:00',
            events: [],
            questionnaire: {}
        };

        const mockResponse = {
            refinedTime: '12:15',
            confidence: 90
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.getRefinedTime(mockData);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/refine-time`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockData)
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle chart interpretation request', async () => {
        const mockChartData = {
            birthTime: '12:00',
            astronomicalData: {},
            events: []
        };

        const mockResponse = {
            interpretation: 'Chart interpretation text',
            confidence: 85,
            aspects: []
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await apiClient.getInterpretation(mockChartData);
        
        expect(mockFetch).toHaveBeenCalledWith(
            `${CONFIG.API_BASE_URL}/interpret`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockChartData)
            })
        );
        
        expect(result).toEqual(mockResponse);
    });

    test('should handle API errors', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        await expect(apiClient.geocodeLocation('New York'))
            .rejects
            .toThrow('Geocoding failed');
    });

    test('should handle geocoding errors gracefully', async () => {
        // Mock fetch to simulate a geocoding failure
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Geocoding failed'));

        await expect(apiClient.geocodeLocation('Invalid Location'))
            .rejects.toThrow('Geocoding failed');

        expect(console.error).toHaveBeenCalledWith(
            'Geocoding error:',
            expect.any(Error)
        );
    });

    test('should handle network errors during geocoding', async () => {
        // Mock fetch to simulate a network error
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

        await expect(apiClient.geocodeLocation('New York'))
            .rejects.toThrow('Network error');

        expect(console.error).toHaveBeenCalledWith(
            'Geocoding error:',
            expect.any(Error)
        );
    });
});
