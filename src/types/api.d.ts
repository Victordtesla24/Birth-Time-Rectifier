declare module '../../src/services/api' {
    export interface RequestOptions {
        method?: string;
        headers?: Record<string, string>;
        body?: any;
    }

    export interface IApiClient {
        eventBus: any;
        errorHandlers: ((error: Error) => void)[];

        setEventBus(eventBus: any): void;
        request(endpoint: string, options?: RequestOptions): Promise<any>;
        onError(callback: (error: Error) => void): void;
        calculateBirthTime(data: {
            birthDate: string;
            birthTime: string;
            location: string;
            answers?: Record<string, any>;
        }): Promise<any>;
        generateQuestionnaire(previousData?: any): Promise<any>;
    }
}

declare module '../../src/services/modules' {
    export class EventBus {
        listeners: Map<string, Set<(data?: any) => void>>;

        constructor();
        on(event: string, callback: (data?: any) => void): void;
        off(event: string, callback: (data?: any) => void): void;
        emit(event: string, data?: any): void;
    }
}

export interface IEventBus {
    on: (event: string, callback: (data?: any) => void) => void;
    off: (event: string, callback: (data?: any) => void) => void;
    emit: (event: string, data?: any) => void;
}

export interface ApiClient {
    eventBus: IEventBus | null;
    loading: boolean;
    errorHandlers: ((error: Error) => void)[];
    calculateBirthTime: (data: any) => Promise<any>;
    handleError: (error: Error) => void;
}

export interface FormManager {
    currentStep: number;
    totalSteps: number;
    formData: Record<string, any>;
    eventBus: IEventBus | null;
    loading: boolean;
    validateInputs: () => boolean;
    navigate: (direction: 'next' | 'prev') => void;
    addEvent: () => void;
    removeEvent: (event: Event) => void;
    submitForm: (formData: FormData) => Promise<any>;
    getProgress: () => number;
}

export interface BirthData {
    source: 'birth_certificate' | 'hospital_record' | 'family_memory' | 'approximate';
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone: string;
    certainty: number;
    physical_characteristics?: {
        height?: number;
        build?: string;
        complexion?: string;
        [key: string]: any;
    };
    life_events?: Array<{
        type: string;
        date: string;
        description: string;
        confidence: number;
        impact: 'high' | 'medium' | 'low';
    }>;
    verification_scores?: {
        physical_match?: number;
        event_accuracy?: number;
        overall_confidence?: number;
    };
}

export interface BirthTimeRectifierProps {
    apiClient: ApiClient;
}

export interface WorkflowService {
    processBirthData: (birthData: BirthData) => Promise<any>;
} 