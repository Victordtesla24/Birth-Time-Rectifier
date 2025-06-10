import type { ApiClient, ApiResponse } from './ApiClient';
import type { BirthData } from '../backend/models/birth_data';
import { ErrorHandler } from '../utils/error/ErrorHandler';

export interface IntegrationConfig {
    service: string;
    credentials?: Record<string, string>;
    options?: Record<string, any>;
}

export interface IntegrationResult {
    success: boolean;
    data?: Record<string, any>;
    error?: Error;
    timestamp: Date;
}

export class IntegrationService {
    private static instance: IntegrationService;
    private readonly apiClient: ApiClient;
    private readonly errorHandler: ErrorHandler;
    private activeIntegrations: Map<string, IntegrationConfig> = new Map();
    
    private constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
        this.errorHandler = ErrorHandler.getInstance();
    }
    
    public static getInstance(apiClient: ApiClient): IntegrationService {
        if (!IntegrationService.instance) {
            IntegrationService.instance = new IntegrationService(apiClient);
        }
        return IntegrationService.instance;
    }
    
    public async registerIntegration(config: IntegrationConfig): Promise<boolean> {
        try {
            // Validate integration configuration
            this.validateIntegrationConfig(config);
            
            // Check if integration already exists
            if (this.activeIntegrations.has(config.service)) {
                throw new Error(`Integration for ${config.service} already exists`);
            }
            
            // Store integration configuration
            this.activeIntegrations.set(config.service, config);
            
            return true;
        } catch (error) {
            this.errorHandler.handleError(
                error as Error,
                'INTEGRATION_REGISTRATION_ERROR',
                { service: config.service }
            );
            return false;
        }
    }
    
    public async unregisterIntegration(service: string): Promise<boolean> {
        try {
            if (!this.activeIntegrations.has(service)) {
                throw new Error(`Integration for ${service} not found`);
            }
            
            this.activeIntegrations.delete(service);
            return true;
        } catch (error) {
            this.errorHandler.handleError(
                error as Error,
                'INTEGRATION_UNREGISTRATION_ERROR',
                { service }
            );
            return false;
        }
    }
    
    public async syncData(
        service: string,
        data: BirthData
    ): Promise<IntegrationResult> {
        try {
            const config = this.activeIntegrations.get(service);
            if (!config) {
                throw new Error(`Integration for ${service} not found`);
            }
            
            // Start sync process
            const syncResponse = await this.apiClient.syncWithExternalService(
                service,
                {
                    data,
                    credentials: config.credentials,
                    options: config.options
                }
            );
            
            if (syncResponse.error) {
                throw syncResponse.error;
            }
            
            // Monitor sync status
            const syncResult = await this.monitorSyncStatus(
                service,
                syncResponse.data!.syncId
            );
            
            return {
                success: syncResult.status === 'completed',
                data: syncResult.details,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                success: false,
                error: error as Error,
                timestamp: new Date()
            };
        }
    }
    
    public getActiveIntegrations(): string[] {
        return Array.from(this.activeIntegrations.keys());
    }
    
    public getIntegrationConfig(service: string): IntegrationConfig | undefined {
        return this.activeIntegrations.get(service);
    }
    
    private validateIntegrationConfig(config: IntegrationConfig): void {
        if (!config.service) {
            throw new Error('Integration service name is required');
        }
        
        // Add additional validation based on service requirements
        switch (config.service) {
            case 'astrological_service':
                this.validateAstrologicalServiceConfig(config);
                break;
            case 'birth_records_service':
                this.validateBirthRecordsServiceConfig(config);
                break;
            case 'ml_service':
                this.validateMLServiceConfig(config);
                break;
            default:
                // Generic validation for unknown services
                if (config.credentials) {
                    this.validateCredentials(config.credentials);
                }
        }
    }
    
    private validateAstrologicalServiceConfig(config: IntegrationConfig): void {
        const required = ['apiKey', 'endpoint'];
        this.validateRequiredCredentials(config, required);
    }
    
    private validateBirthRecordsServiceConfig(config: IntegrationConfig): void {
        const required = ['accessToken', 'region'];
        this.validateRequiredCredentials(config, required);
    }
    
    private validateMLServiceConfig(config: IntegrationConfig): void {
        const required = ['modelId', 'apiKey'];
        this.validateRequiredCredentials(config, required);
    }
    
    private validateRequiredCredentials(
        config: IntegrationConfig,
        required: string[]
    ): void {
        if (!config.credentials) {
            throw new Error('Credentials are required for this integration');
        }
        
        for (const field of required) {
            if (!config.credentials[field]) {
                throw new Error(`Missing required credential: ${field}`);
            }
        }
    }
    
    private validateCredentials(credentials: Record<string, string>): void {
        // Generic credential validation
        for (const [key, value] of Object.entries(credentials)) {
            if (!value || typeof value !== 'string') {
                throw new Error(`Invalid credential value for ${key}`);
            }
        }
    }
    
    private async monitorSyncStatus(
        service: string,
        syncId: string
    ): Promise<{
        status: 'pending' | 'completed' | 'failed';
        progress: number;
        details: Record<string, any>;
    }> {
        const maxAttempts = 10;
        const pollingInterval = 2000; // 2 seconds
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const statusResponse = await this.apiClient.getIntegrationStatus(
                service,
                syncId
            );
            
            if (statusResponse.error) {
                throw statusResponse.error;
            }
            
            const status = statusResponse.data!;
            
            if (status.status === 'completed' || status.status === 'failed') {
                return status;
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, pollingInterval));
        }
        
        throw new Error('Sync status monitoring timed out');
    }
} 