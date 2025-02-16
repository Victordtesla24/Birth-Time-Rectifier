import axios from 'axios';
import { Planet, House, Aspect, ConfidenceMetrics, MLInsights } from '../types/shared';
import { config } from '../config';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export interface BirthTimeData {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

export interface ChartData {
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
    confidenceMetrics: ConfidenceMetrics;
    mlInsights: MLInsights;
}

export interface ApiResponse<T> {
    data: T | null;
    error?: string;
    status: number;
}

export class ApiClient {
    private baseUrl: string;
    
    constructor(baseUrl: string = config.api.baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options,
            });

            const data = await response.json();

            return {
                data,
                status: response.status,
            };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 500,
            };
        }
    }
    
    public async getBirthChart(data: {
        birthDateTime: Date;
        latitude: number;
        longitude: number;
    }): Promise<ApiResponse<ChartData>> {
        try {
            const response = await axios.post(`${this.baseUrl}/chart`, data);
            return {
                data: response.data,
                status: response.status,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    data: null,
                    error: error.response?.data?.message || 'Failed to get birth chart',
                    status: error.response?.status || 500,
                };
            }
            throw error;
        }
    }
    
    public async rectifyBirthTime(data: {
        name: string;
        birthDateTime: Date;
        birthPlace: string;
        latitude: number;
        longitude: number;
    }): Promise<ApiResponse<ChartData>> {
        try {
            const response = await axios.post(`${this.baseUrl}/rectify`, data);
            return {
                data: response.data,
                status: response.status,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    data: null,
                    error: error.response?.data?.message || 'Failed to rectify birth time',
                    status: error.response?.status || 500,
                };
            }
            throw error;
        }
    }
    
    public async getChartInsights(chartId: string): Promise<ApiResponse<MLInsights>> {
        try {
            const response = await axios.get(`${this.baseUrl}/chart/${chartId}/insights`);
            return {
                data: response.data,
                status: response.status,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    data: null,
                    error: error.response?.data?.message || 'Failed to get chart insights',
                    status: error.response?.status || 500,
                };
            }
            throw error;
        }
    }
    
    public async submitQuestionnaire(answers: Record<string, any>): Promise<ApiResponse<any>> {
        try {
            const response = await axios.post(`${this.baseUrl}/questionnaire`, answers);
            return {
                data: response.data,
                status: response.status,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    data: null,
                    error: error.response?.data?.message || 'Failed to submit questionnaire',
                    status: error.response?.status || 500,
                };
            }
            throw error;
        }
    }
    
    async calculateBirthTime(data: BirthTimeData): Promise<ApiResponse<ChartData>> {
        return this.request<ChartData>('/api/birth-time', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async getChartData(id: string): Promise<ApiResponse<ChartData>> {
        return this.request<ChartData>(`/api/chart/${id}`);
    }
    
    async updateChartData(id: string, data: Partial<ChartData>): Promise<ApiResponse<ChartData>> {
        return this.request<ChartData>(`/api/chart/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    
    async getConfidenceMetrics(id: string): Promise<ApiResponse<ConfidenceMetrics>> {
        return this.request<ConfidenceMetrics>(`/api/chart/${id}/confidence`);
    }
    
    async getMLInsights(id: string): Promise<ApiResponse<MLInsights>> {
        return this.request<MLInsights>(`/api/chart/${id}/insights`);
    }
}

export const apiClient = new ApiClient();
export default apiClient;