import { PropsWithChildren } from 'react';
import { Theme } from '@mui/material/styles';

export interface TestWrapperProps extends PropsWithChildren<{}> {
    theme?: Theme;
}

export interface MockP5 {
    createCanvas: jest.Mock;
    background: jest.Mock;
    strokeWeight: jest.Mock;
    redraw: jest.Mock;
    WEBGL: string;
}

export interface MockShader {
    setUniform: jest.Mock;
    bind: jest.Mock;
    unbind: jest.Mock;
}

export interface MockTimeline {
    to: jest.Mock;
    pause: jest.Mock;
    resume: jest.Mock;
    kill: jest.Mock;
}

export interface MockEventBus {
    on: jest.Mock;
    off: jest.Mock;
    emit: jest.Mock;
}

export interface MockApiClient {
    calculateBirthTime: jest.Mock;
    handleError: jest.Mock;
    eventBus: MockEventBus;
    loading: boolean;
}

export interface MockFormManager {
    submitForm: jest.Mock;
    loading: boolean;
    currentStep: number;
    totalSteps: number;
    formData: Record<string, any>;
    eventBus: MockEventBus;
}

export interface MockVisualizationManager {
    renderChart: jest.Mock;
    cleanup: jest.Mock;
}

export interface MockWorkflowService {
    processBirthData: jest.Mock;
} 