export interface DateTimeInput {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second?: number;
    timezone: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

export interface Pagination {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface TimeRange {
    start: string;
    end: string;
} 