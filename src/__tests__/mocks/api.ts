import { ApiResponse, ApiError } from '@/types/api';

export class MockApiClient {
    baseUrl: string;

    constructor() {
        this.baseUrl = 'http://mock-api.test';
    }

    async get<T>(url: string): Promise<ApiResponse<T>> {
        return Promise.resolve({ data: {} as T, status: 200 });
    }

    async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        return Promise.resolve({ data: {} as T, status: 201 });
    }

    async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        return Promise.resolve({ data: {} as T, status: 200 });
    }

    async delete(url: string): Promise<ApiResponse<void>> {
        return Promise.resolve({ status: 204 });
    }

    async request<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return Promise.resolve({ data: {} as T, status: 200 });
    }

    onError(callback: (error: ApiError) => void): void {
        // Mock error handler
    }
}

// Default mock instance
export const mockApiClient = new MockApiClient();

// Mock handlers for MSW
export const apiHandlers = [
    {
        path: '/api/birth-time',
        method: 'POST',
        response: () => ({
            birthTime: '12:00',
            confidence: 0.85,
            aspects: []
        })
    },
    {
        path: '/api/chart',
        method: 'GET',
        response: () => ({
            planets: [],
            houses: [],
            aspects: []
        })
    }
]; 