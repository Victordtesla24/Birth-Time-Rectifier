import { P5Instance } from 'p5';

export interface IVisualizationManager {
    p5Instance: P5Instance;
    gl: WebGLRenderingContext;
    state: {
        chartData: any;
        isLoading: boolean;
        depth: number;
    };
    timeline: any;
    setChartData(data: any): void;
    updateDepth(value: number): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    initialize(): void;
    destroy(): void;
}

export interface IAnimationManager {
    isPlaying: boolean;
    animations: Map<string, any>;
    
    addAnimation(animation: any): string;
    removeAnimation(id: string): void;
    play(id: string): void;
    pause(id: string): void;
    resume(id: string): void;
    update(timestamp: number): void;
    cleanup(): void;
}

export interface IEventBus {
    on(event: string, callback: (...args: any[]) => void): () => void;
    off(event: string, callback: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    clear(): void;
}

export interface IApiClient {
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    calculateBirthTime(data: any): Promise<{
        birthTime: string;
        confidence: number;
        aspects: any[];
    }>;
    onError(handler: (error: Error) => void): () => void;
}

export interface Planet {
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
    house: number;
}

export interface House {
    number: number;
    cusp: number;
    sign: string;
}

export interface ChartData {
    planets: Planet[];
    houses: House[];
    ascendant: number;
    midheaven: number;
} 