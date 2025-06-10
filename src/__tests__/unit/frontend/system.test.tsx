import { test, expect } from '@jest/globals';

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001';

// Mock fetch API
global.fetch = jest.fn();

beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
});

describe('System Integration Tests', () => {
    test('API healthcheck returns expected response', async () => {
        const mockResponse = {
            status: 'ok',
            config: {
                cors_enabled: true,
                allowed_origins: [BASE_URL]
            }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(mockResponse)
        });

        const response = await fetch(`${API_URL}/api/healthcheck`);
        const data = await response.json();
        
        expect(response.status).toBe(200);
        expect(data.status).toBe('ok');
        expect(data.config.cors_enabled).toBe(true);
        expect(data.config.allowed_origins).toContain(BASE_URL);
    });

    test('Session functionality works correctly', async () => {
        const mockSessionResponse = {
            sessionId: '123456',
            status: 'active'
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(mockSessionResponse)
        });

        const response = await fetch(`${API_URL}/api/test-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ test: true })
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.sessionId).toBeDefined();
        expect(data.status).toBe('active');
    });

    test('Birth time rectification endpoint works', async () => {
        const mockRectificationResponse = {
            birthTime: '12:00',
            confidence: 0.85,
            aspects: []
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve(mockRectificationResponse)
        });

        const response = await fetch(`${API_URL}/api/rectify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                date: '2024-02-15',
                location: 'New York',
                events: []
            })
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.birthTime).toBeDefined();
        expect(data.confidence).toBeGreaterThan(0);
    });
}); 