import { gsap } from 'gsap';

export class AnimationManager {
    constructor(p5Instance) {
        this.p5 = p5Instance;
        this.animations = new Map();
        this.isPlaying = false;
        this.currentTime = 0;
        this.timeline = null;
    }

    addAnimation(animation) {
        if (!animation.id) {
            throw new Error('Animation must have an id');
        }
        this.animations.set(animation.id, {
            ...animation,
            isPlaying: false,
            progress: 0,
            startTime: 0
        });
    }

    removeAnimation(id) {
        this.animations.delete(id);
    }

    play(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.isPlaying = true;
            animation.startTime = this.currentTime;
            this.isPlaying = true;
        }
    }

    playAll() {
        this.animations.forEach(animation => {
            animation.isPlaying = true;
            animation.startTime = this.currentTime;
        });
        this.isPlaying = true;
    }

    pause(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.isPlaying = false;
            // Check if any animations are still playing
            this.isPlaying = Array.from(this.animations.values()).some(a => a.isPlaying);
        }
    }

    pauseAll() {
        this.animations.forEach(animation => {
            animation.isPlaying = false;
        });
        this.isPlaying = false;
    }

    resume(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.isPlaying = true;
            animation.startTime = this.currentTime - (animation.progress * animation.duration);
            this.isPlaying = true;
        }
    }

    update(timestamp) {
        this.currentTime = timestamp;
        this.animations.forEach((animation, id) => {
            if (animation.isPlaying) {
                const elapsed = this.currentTime - animation.startTime;
                animation.progress = Math.min(elapsed / animation.duration, 1);

                let value;
                if (animation.easing === 'easeInOutQuad') {
                    value = this.easeInOutQuad(animation.progress);
                } else {
                    value = animation.progress;
                }

                const currentValue = animation.startValue + (animation.endValue - animation.startValue) * value;
                animation.onUpdate(currentValue);

                if (animation.progress >= 1) {
                    animation.isPlaying = false;
                    if (animation.onComplete) {
                        animation.onComplete();
                    }
                    // Check if any animations are still playing
                    this.isPlaying = Array.from(this.animations.values()).some(a => a.isPlaying);
                }
            }
        });
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    initialize() {
        if (!this.timeline) {
            this.timeline = gsap.timeline();
        }
        return this;
    }

    stop(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.isPlaying = false;
            animation.progress = 0;
            animation.startTime = 0;
            // Check if any animations are still playing
            this.isPlaying = Array.from(this.animations.values()).some(a => a.isPlaying);
        }
    }

    stopAll() {
        this.animations.forEach(animation => {
            animation.isPlaying = false;
            animation.progress = 0;
            animation.startTime = 0;
        });
        this.isPlaying = false;
    }

    cleanup() {
        if (this.timeline) {
            this.timeline.kill();
            this.timeline = null;
        }
        this.animations.clear();
        this.isPlaying = false;
    }
}
