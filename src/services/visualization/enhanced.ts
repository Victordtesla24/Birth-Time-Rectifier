import { VisualizationManager } from '../visualization';
import { CONFIG } from '../modules';
import { Effect, Shader, PostProcessingEffect } from '../../types/visualization';

export class EnhancedVisualizationManager extends VisualizationManager {
    private effects: Set<string>;
    private shaders: Map<string, Shader>;
    private postProcessing: {
        enabled: boolean;
        effects: PostProcessingEffect[];
    };

    constructor(container: HTMLElement, width: number, height: number) {
        super(container, width, height);
        this.effects = new Set();
        this.shaders = new Map();
        this.postProcessing = {
            enabled: false,
            effects: []
        };
    }

    public addEffect(effectName: string): void {
        this.effects.add(effectName);
    }

    public removeEffect(effectName: string): void {
        this.effects.delete(effectName);
    }

    public addShader(name: string, shader: Shader): void {
        this.shaders.set(name, shader);
    }

    public enablePostProcessing(): void {
        this.postProcessing.enabled = true;
    }

    public disablePostProcessing(): void {
        this.postProcessing.enabled = false;
    }

    public addPostProcessingEffect(effect: PostProcessingEffect): void {
        this.postProcessing.effects.push(effect);
    }

    public clearPostProcessingEffects(): void {
        this.postProcessing.effects = [];
    }

    public setupScene(p: any): void {
        super.setupScene(p);
        this.setupShaders(p);
        this.setupPostProcessing(p);
    }

    private setupShaders(p: any): void {
        for (const [name, shader] of this.shaders) {
            p.shader(shader);
        }
    }

    private setupPostProcessing(p: any): void {
        if (!this.postProcessing.enabled) return;
        
        for (const effect of this.postProcessing.effects) {
            effect.setup(p);
        }
    }

    public render(p: any): void {
        if (this.postProcessing.enabled) {
            this.renderWithPostProcessing(p);
        } else {
            super.render(p);
        }
    }

    private renderWithPostProcessing(p: any): void {
        p.push();
        super.render(p);
        
        for (const effect of this.postProcessing.effects) {
            effect.apply(p);
        }
        
        p.pop();
    }

    public cleanup(): void {
        super.cleanup();
        this.effects.clear();
        this.shaders.clear();
        this.postProcessing.effects = [];
    }
}

export const createEnhancedVisualizationManager = (
    container: HTMLElement,
    width: number,
    height: number
) => {
    return new EnhancedVisualizationManager(container, width, height);
}; 