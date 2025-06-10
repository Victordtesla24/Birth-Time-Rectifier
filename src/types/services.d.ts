declare module '../../src/services/form.js' {
    export class FormManager {
        submitForm(formData: FormData): Promise<any>;
        loading: boolean;
    }
}

declare module '../../src/services/api.js' {
    export class ApiClient {
        request(endpoint: string, options?: Record<string, any>): Promise<any>;
        calculateBirthTime(data: any): Promise<any>;
        generateQuestionnaire(data: any): Promise<any>;
        onError(callback: (error: Error) => void): void;
        static mockImplementation(fn: () => any): void;
    }
}

declare module '../../src/services/visualization.js' {
    export class VisualizationManager {
        renderChart(container: HTMLElement, data: any): void;
    }
}

declare module '../../src/services/workflow.js' {
    export class WorkflowService {
        processBirthData(data: any): Promise<any>;
    }
}

declare module '../../src/services/modules.js' {
    export class EventBus {
        emit(event: string, data?: any): void;
        on(event: string, callback: (data: any) => void): void;
    }
}

declare module '../../src/components/StepWizard' {
    import { FC } from 'react';
    export interface StepWizardProps {
        apiClient: any;
    }
    export const StepWizard: FC<StepWizardProps>;
}

declare module '../../src/components/BirthTimeRectifier' {
    import { FC } from 'react';
    export const BirthTimeRectifier: FC;
}

declare module '../../src/components/steps/DynamicQuestionnaire' {
    import { FC } from 'react';
    export interface DynamicQuestionnaireProps {
        onNext: (data: any) => void;
        previousData: any;
    }
    export const DynamicQuestionnaire: FC<DynamicQuestionnaireProps>;
}

declare module '../../src/theme' {
    export const theme: Record<string, any>;
} 