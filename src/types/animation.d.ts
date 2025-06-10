declare module '../../src/services/animationManager' {
    export interface Animation {
        id: string;
        duration: number;
        isPlaying: boolean;
        progress: number;
        onUpdate?: (progress: number) => void;
        onComplete?: () => void;
    }

    export interface PostProcessingEffect {
        type: string;
        enabled: boolean;
        params?: Record<string, any>;
    }

    export interface PostProcessing {
        enabled: boolean;
        effects: PostProcessingEffect[];
    }

    export class AnimationManager {
        animations: Map<string, Animation>;
        isPlaying: boolean;
        timeline: any | null;
        p5: any;
        effects: Map<string, any>;
        shaders: Map<string, any>;
        postProcessing: PostProcessing;

        constructor(p5Instance: any);
        
        addAnimation(animation: Animation): void;
        removeAnimation(id: string): void;
        play(id: string): void;
        pause(id: string): void;
        resume(id: string): void;
        stop(id: string): void;
        playAll(): void;
        pauseAll(): void;
        stopAll(): void;
        update(timestamp: number): void;
        cleanup(): void;

        // Enhanced visualization methods
        enablePostProcessing(): void;
        disablePostProcessing(): void;
        addPostProcessingEffect(effect: PostProcessingEffect): void;
        clearPostProcessingEffects(): void;
        addEffect(type: string): void;
        addShader(name: string, shader: any): void;
    }
}

declare module '../../src/services/animationManager.js' {
    export * from '../../src/services/animationManager';
} 