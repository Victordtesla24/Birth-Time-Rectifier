import type { P5InstanceExtensions } from 'p5';

export interface P5Instance extends P5InstanceExtensions {
    WEBGL: string;
    createCanvas: (width: number, height: number, renderer?: string) => any;
    background: (color: string | number) => void;
    strokeWeight: (weight: number) => void;
    redraw: () => void;
}

export interface VisualizationState {
    isLoading: boolean;
    chartData: any;
    depth: number;
}

export interface VisualizationConfig {
    width: number;
    height: number;
    containerId: string;
}

export interface Planet {
    id: string;
    name: string;
    degree: number;
    retrograde?: boolean;
}

export interface House {
    id: string;
    number: number;
    degree: number;
}

export interface Aspect {
    id: string;
    planet1: string;
    planet2: string;
    type: string;
    degree: number;
}

export interface ChartData {
    planets: Planet[];
    houses: House[];
    aspects: Aspect[];
}

export interface VisualizationManager {
    containerId: string;
    state: VisualizationState;
    config: VisualizationConfig;
    canvas: HTMLCanvasElement;
    p5Instance: P5Instance;
    gl: WebGLRenderingContext;
    timeline: any;
    setChartData: (data: ChartData) => void;
    updateDepth: (delta: number) => void;
    pauseAnimation: () => void;
    resumeAnimation: () => void;
    initialize: () => Promise<void>;
    destroy: () => void;
}

export interface AnimationManager {
    isPlaying: boolean;
    animations: Map<string, Animation>;
    p5: P5Instance;
    play: () => void;
    pause: () => void;
    resume: () => void;
    cleanup: () => void;
}

export interface Animation {
    id: string;
    isPlaying: boolean;
    currentFrame: number;
    duration: number;
    update: (time: number) => void;
    play: () => void;
    pause: () => void;
}

export interface EnhancedVisualizationManager {
    effects: Map<string, any>;
    shaders: Map<string, any>;
    postProcessing: {
        enabled: boolean;
        effects: any[];
    };
    addEffect: (name: string) => void;
    removeEffect: (name: string) => void;
    addShader: (name: string, shader: any) => void;
    enablePostProcessing: () => void;
    disablePostProcessing: () => void;
    addPostProcessingEffect: (effect: any) => void;
    clearPostProcessingEffects: () => void;
    cleanup: () => void;
} 