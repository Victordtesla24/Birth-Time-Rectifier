import { gsap } from 'gsap';
import { CONFIG } from './modules';
import { P5Instance } from 'p5';
import { IAnimationManager } from './types';
import { logger } from './logger';

export interface AnimationState {
    isPlaying: boolean;
    isPaused: boolean;
    currentTime: number;
    duration: number;
}

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

export class AnimationManager implements IAnimationManager {
    private timeline: gsap.core.Timeline;
    private state: AnimationState;
    private onStateChange: (state: AnimationState) => void;
    isPlaying: boolean;
    animations: Map<string, gsap.core.Animation>;
    p5: P5Instance;
    effects: Map<string, any>;
    shaders: Map<string, any>;
    postProcessing: PostProcessing;

    constructor(onStateChange?: (state: AnimationState) => void) {
        this.timeline = gsap.timeline();
        this.state = {
            isPlaying: false,
            isPaused: false,
            currentTime: 0,
            duration: 0
        };
        this.onStateChange = onStateChange || (() => {});
        this.isPlaying = false;
        this.animations = new Map();
        this.p5 = null;
        this.effects = new Map();
        this.shaders = new Map();
        this.postProcessing = {
            enabled: false,
            effects: []
        };
    }
    
    private updateState(updates: Partial<AnimationState>) {
        this.state = { ...this.state, ...updates };
        this.onStateChange(this.state);
    }
    
    addAnimation(config: { target: string; frames: number[]; duration?: number }) {
        const animation = gsap.to(config.target, {
            duration: config.duration || 1,
            frames: config.frames,
            paused: true,
        });
        this.animations.set(config.target, animation);
    }
    
    removeAnimation(target: string) {
        const animation = this.animations.get(target);
        if (animation) {
            animation.kill();
            this.animations.delete(target);
        }
    }
    
    play() {
        this.animations.forEach(animation => animation.play());
        this.updateState({ isPlaying: true, isPaused: false });
        return this;
    }
    
    pause() {
        this.animations.forEach(animation => animation.pause());
        this.updateState({ isPlaying: false, isPaused: true });
        return this;
    }
    
    resume() {
        this.animations.forEach(animation => animation.resume());
        this.updateState({ isPlaying: true, isPaused: false });
        return this;
    }
    
    reverse() {
        this.timeline.reverse();
        this.updateState({ isPlaying: true, isPaused: false });
        return this;
    }
    
    restart() {
        this.timeline.restart();
        this.updateState({ isPlaying: true, isPaused: false });
        return this;
    }
    
    seek(time: number) {
        this.timeline.seek(time);
        this.updateState({ currentTime: time });
        return this;
    }
    
    setSpeed(speed: number) {
        this.timeline.timeScale(speed);
        return this;
    }
    
    clear() {
        this.timeline.clear();
        this.updateState({
            isPlaying: false,
            isPaused: false,
            currentTime: 0,
            duration: 0
        });
        return this;
    }
    
    getState(): AnimationState {
        return { ...this.state };
    }

    addAnimation(animation: any) {
        try {
            const id = `animation_${this.animations.size}`;
            this.animations.set(id, {
                ...animation,
                isPlaying: false,
                currentFrame: 0
            });
            return id;
        } catch (error) {
            logger.error('animation', 'Failed to add animation', error as Error);
            throw error;
        }
    }

    removeAnimation(id: string) {
        try {
            if (this.animations.has(id)) {
                this.animations.delete(id);
            }
        } catch (error) {
            logger.error('animation', 'Failed to remove animation', error as Error);
            throw error;
        }
    }

    playAll(): void {
        this.animations.forEach(animation => {
            animation.isPlaying = true;
        });
        this.isPlaying = true;
    }

    pauseAll(): void {
        this.animations.forEach(animation => {
            animation.isPlaying = false;
        });
        this.isPlaying = false;
    }

    stopAll(): void {
        this.animations.forEach(animation => {
            animation.isPlaying = false;
            animation.progress = 0;
        });
        this.isPlaying = false;
    }

    update(timestamp: number) {
        try {
            this.animations.forEach((animation, id) => {
                if (animation.isPlaying) {
                    animation.currentFrame++;
                    if (animation.currentFrame >= animation.frames.length) {
                        if (animation.loop) {
                            animation.currentFrame = 0;
                        } else {
                            this.pause(id);
                        }
                    }
                }
            });
        } catch (error) {
            logger.error('animation', 'Failed to update animations', error as Error);
            throw error;
        }
    }

    cleanup() {
        try {
            this.animations.forEach(animation => animation.kill());
            this.animations.clear();
            this.effects.clear();
            this.shaders.clear();
            this.postProcessing.effects = [];
            this.isPlaying = false;
            this.timeline.clear();
            this.updateState({
                isPlaying: false,
                isPaused: false,
                currentTime: 0,
                duration: 0
            });
        } catch (error) {
            logger.error('animation', 'Failed to cleanup animations', error as Error);
            throw error;
        }
    }

    // Enhanced visualization methods
    enablePostProcessing(): void {
        this.postProcessing.enabled = true;
    }

    disablePostProcessing(): void {
        this.postProcessing.enabled = false;
    }

    addPostProcessingEffect(effect: PostProcessingEffect): void {
        this.postProcessing.effects.push(effect);
    }

    clearPostProcessingEffects(): void {
        this.postProcessing.effects = [];
    }

    addEffect(type: string): void {
        this.effects.set(type, {
            type,
            enabled: true
        });
    }

    addShader(name: string, shader: any): void {
        this.shaders.set(name, shader);
    }
}

export const createAnimationManager = (onStateChange?: (state: AnimationState) => void) => {
    return new AnimationManager(onStateChange);
}; 