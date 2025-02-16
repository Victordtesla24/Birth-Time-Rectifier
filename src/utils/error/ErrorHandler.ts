import type { ValidationError } from '../validation/DataValidator';

export interface AppError extends Error {
    code: string;
    details?: Record<string, any>;
    severity: 'error' | 'warning' | 'info';
    timestamp: Date;
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: AppError[] = [];
    private errorCallbacks: ((error: AppError) => void)[] = [];
    
    private constructor() {}
    
    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    
    public handleError(
        error: Error | ValidationError | string,
        code = 'UNKNOWN_ERROR',
        details?: Record<string, any>,
        severity: 'error' | 'warning' | 'info' = 'error'
    ): AppError {
        const appError = this.createAppError(error, code, details, severity);
        this.logError(appError);
        this.notifyErrorCallbacks(appError);
        return appError;
    }
    
    public registerErrorCallback(callback: (error: AppError) => void): void {
        this.errorCallbacks.push(callback);
    }
    
    public unregisterErrorCallback(callback: (error: AppError) => void): void {
        const index = this.errorCallbacks.indexOf(callback);
        if (index !== -1) {
            this.errorCallbacks.splice(index, 1);
        }
    }
    
    public getErrorLog(): AppError[] {
        return [...this.errorLog];
    }
    
    public clearErrorLog(): void {
        this.errorLog = [];
    }
    
    private createAppError(
        error: Error | ValidationError | string,
        code: string,
        details?: Record<string, any>,
        severity: 'error' | 'warning' | 'info' = 'error'
    ): AppError {
        const message = typeof error === 'string' 
            ? error 
            : 'message' in error 
                ? error.message 
                : error.toString();
                
        return {
            name: 'AppError',
            message,
            code,
            details,
            severity,
            timestamp: new Date(),
            stack: error instanceof Error ? error.stack : undefined
        };
    }
    
    private logError(error: AppError): void {
        this.errorLog.push(error);
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            const logMethod = error.severity === 'error' 
                ? console.error 
                : error.severity === 'warning' 
                    ? console.warn 
                    : console.info;
                    
            logMethod(
                `[${error.code}] ${error.message}`,
                {
                    details: error.details,
                    timestamp: error.timestamp,
                    stack: error.stack
                }
            );
        }
    }
    
    private notifyErrorCallbacks(error: AppError): void {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });
    }
    
    // Utility methods for common error scenarios
    public handleValidationErrors(validationErrors: ValidationError[]): void {
        validationErrors.forEach(error => {
            this.handleError(
                error.message,
                error.code,
                { field: error.field },
                error.severity
            );
        });
    }
    
    public handleNetworkError(
        error: Error,
        endpoint?: string,
        requestData?: Record<string, any>
    ): AppError {
        return this.handleError(
            error,
            'NETWORK_ERROR',
            {
                endpoint,
                requestData,
                statusCode: 'response' in error ? (error as any).response?.status : undefined
            }
        );
    }
    
    public handleMLError(
        error: Error,
        modelName?: string,
        inputData?: Record<string, any>
    ): AppError {
        return this.handleError(
            error,
            'ML_ERROR',
            {
                modelName,
                inputData
            }
        );
    }
    
    public handleDataProcessingError(
        error: Error,
        dataType?: string,
        operation?: string
    ): AppError {
        return this.handleError(
            error,
            'DATA_PROCESSING_ERROR',
            {
                dataType,
                operation
            }
        );
    }
} 