import { gsap } from 'gsap';
import { VisualizationManager } from './visualization.js';
import { CONFIG } from './modules.js';

export class AnimationController {
    constructor(visualizer) {
        if (visualizer && !(visualizer instanceof VisualizationManager)) {
            throw new Error('AnimationController requires a VisualizationManager instance');
        }
        this.visualizer = visualizer;
        this.timeline = null;
        this.isPlaying = false;
        this.config = CONFIG;
        this.animations = new Map();
    }

    initialize() {
        this.timeline = gsap.timeline({
            paused: true,
            onComplete: () => {
                this.isPlaying = false;
            }
        });

        this.setupAnimations();
    }

    addAnimation(name, config) {
        if (!name || !config) {
            throw new Error('Animation name and config are required');
        }
        this.animations.set(name, {
            ...config,
            isPlaying: false
        });
    }

    removeAnimation(name) {
        if (!name) {
            throw new Error('Animation name is required');
        }
        this.animations.delete(name);
    }

    play(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.isPlaying = true;
            if (this.timeline) {
                this.timeline.play();
            }
        }
    }

    playAll() {
        this.animations.forEach(animation => {
            animation.isPlaying = true;
        });
        if (this.timeline) {
            this.timeline.play();
        }
    }

    pause(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.isPlaying = false;
            if (this.timeline) {
                this.timeline.pause();
            }
        }
    }

    pauseAll() {
        this.animations.forEach(animation => {
            animation.isPlaying = false;
        });
        if (this.timeline) {
            this.timeline.pause();
        }
    }

    stop(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.isPlaying = false;
            if (this.timeline) {
                this.timeline.pause();
                this.timeline.seek(0);
            }
        }
    }

    stopAll() {
        this.animations.forEach(animation => {
            animation.isPlaying = false;
        });
        if (this.timeline) {
            this.timeline.pause();
            this.timeline.seek(0);
        }
    }

    setupAnimations() {
        if (!this.timeline) return;

        // Reset any existing animations
        this.timeline.clear();

        // Add animation sequences
        this.timeline
            .to(this.visualizer?.config || {}, {
                duration: 2,
                starCount: this.config.starCount * 2,
                ease: 'power2.inOut'
            })
            .to(this.visualizer?.config || {}, {
                duration: 1.5,
                rotationSpeed: this.config.rotationSpeed * 2,
                ease: 'power1.inOut'
            })
            .to(this.visualizer?.config || {}, {
                duration: 2,
                starCount: this.config.starCount,
                rotationSpeed: this.config.rotationSpeed,
                ease: 'power2.inOut'
            });
    }

    update(deltaTime) {
        if (!this.isPlaying || !this.timeline) return;
        
        // Additional per-frame updates if needed
    }

    cleanup() {
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }
        this.isPlaying = false;
        this.animations.clear();
    }
}
