// Animation Controller for UI Transitions and Effects

import { CONFIG } from './config.js';

export class AnimationController {
    constructor() {
        this.duration = CONFIG.ANIMATION_DURATION;
        this.animations = new Map();
    }

    animateFormTransition(currentSection, nextSection, direction) {
        return new Promise(resolve => {
            // Hide current section
            currentSection.style.opacity = '0';
            currentSection.style.transform = direction === 'next' ? 
                'translateX(-100%)' : 'translateX(100%)';

            // After current section is hidden
            setTimeout(() => {
                currentSection.classList.add('hidden');
                nextSection.classList.remove('hidden');
                
                // Show next section
                nextSection.style.opacity = '0';
                nextSection.style.transform = direction === 'next' ? 
                    'translateX(100%)' : 'translateX(-100%)';
                
                requestAnimationFrame(() => {
                    nextSection.style.opacity = '1';
                    nextSection.style.transform = 'translateX(0)';
                });

                setTimeout(resolve, this.duration);
            }, this.duration);
        });
    }

    animateEventEntry(element) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = `all ${this.duration}ms ease`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    async animateEventRemoval(element) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all ${this.duration}ms ease`;
        
        await new Promise(resolve => setTimeout(resolve, this.duration));
        element.remove();
    }

    animateChart() {
        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;

        // Reset any existing animations
        this.animations.forEach(animation => animation.cancel());
        this.animations.clear();

        // Animate chart elements
        const elements = chartContainer.querySelectorAll('.chart-element');
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'scale(0.8)';
            
            const animation = element.animate([
                {
                    opacity: 0,
                    transform: 'scale(0.8)'
                },
                {
                    opacity: 1,
                    transform: 'scale(1)'
                }
            ], {
                duration: 500,
                delay: index * 100,
                easing: 'ease-out',
                fill: 'forwards'
            });
            
            this.animations.set(element, animation);
        });
    }

    // Add loading animation for processing steps
    addLoadingAnimation(overlay) {
        overlay.style.opacity = '0';
        overlay.style.display = 'flex';
        
        requestAnimationFrame(() => {
            overlay.style.transition = `opacity ${this.duration}ms ease`;
            overlay.style.opacity = '1';
        });
    }

    removeLoadingAnimation(overlay) {
        return new Promise(resolve => {
            overlay.style.transition = `opacity ${this.duration}ms ease`;
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                overlay.style.display = 'none';
                resolve();
            }, this.duration);
        });
    }

    // Progress bar animation
    animateProgress(progressBar, percentage) {
        progressBar.style.transition = `width ${this.duration}ms ease`;
        progressBar.style.width = `${percentage}%`;
    }

    // Transition animations
    animate(element, properties, duration = this.duration) {
        const animation = {
            element,
            properties,
            startTime: performance.now(),
            duration,
            initialValues: {}
        };

        // Store initial values
        for (const prop in properties) {
            animation.initialValues[prop] = parseFloat(getComputedStyle(element)[prop]) || 0;
        }

        this.animations.set(element, animation);
        this.startAnimation(element);
    }

    startAnimation(element) {
        const animation = this.animations.get(element);
        if (!animation) return;

        const animate = (currentTime) => {
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);

            // Apply easing
            const eased = this.easeInOutCubic(progress);

            // Update properties
            for (const prop in animation.properties) {
                const start = animation.initialValues[prop];
                const end = animation.properties[prop];
                const current = start + (end - start) * eased;
                animation.element.style[prop] = `${current}${typeof end === 'number' ? 'px' : ''}`;
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animations.delete(element);
            }
        };

        requestAnimationFrame(animate);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    fadeIn(element, duration = CONFIG.FADE_DURATION) {
        element.style.opacity = '0';
        element.style.display = 'block';
        this.animate(element, { opacity: 1 }, duration);
    }

    fadeOut(element, duration = CONFIG.FADE_DURATION) {
        this.animate(element, { opacity: 0 }, duration);
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    // Slide animations
    slideIn(element, direction = 'right', duration = CONFIG.TRANSITION_DURATION) {
        const start = direction === 'right' ? 100 : -100;
        element.style.transform = `translateX(${start}%)`;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        this.animate(element, {
            transform: 0,
            opacity: 1
        }, duration);
    }

    slideOut(element, direction = 'left', duration = CONFIG.TRANSITION_DURATION) {
        const end = direction === 'left' ? -100 : 100;
        
        this.animate(element, {
            transform: end,
            opacity: 0
        }, duration);

        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    bounce(element, scale = 1.1, duration = 300) {
        this.animations.set(element, {});
        const sequence = [
            { transform: `scale(1)`, duration: 0 },
            { transform: `scale(${scale})`, duration: duration * 0.4 },
            { transform: `scale(0.9)`, duration: duration * 0.3 },
            { transform: `scale(1)`, duration: duration * 0.3 }
        ];

        let currentTime = 0;
        sequence.forEach(step => {
            setTimeout(() => {
                this.animate(element, { transform: step.transform }, step.duration);
            }, currentTime);
            currentTime += step.duration;
        });
    }

    shake(element, intensity = 5, duration = 500) {
        this.animations.set(element, {});
        const sequence = [
            { transform: `translateX(0)`, duration: 0 },
            { transform: `translateX(${intensity}px)`, duration: duration * 0.2 },
            { transform: `translateX(-${intensity}px)`, duration: duration * 0.2 },
            { transform: `translateX(${intensity * 0.5}px)`, duration: duration * 0.2 },
            { transform: `translateX(-${intensity * 0.5}px)`, duration: duration * 0.2 },
            { transform: `translateX(0)`, duration: duration * 0.2 }
        ];

        let currentTime = 0;
        sequence.forEach(step => {
            setTimeout(() => {
                this.animate(element, { transform: step.transform }, step.duration);
            }, currentTime);
            currentTime += step.duration;
        });
    }

    pulse(element) {
        element.style.transform = 'scale(1)';
        element.style.transition = 'transform 200ms ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }, 200);
    }
}

// Create and export a singleton instance
export const animationController = new AnimationController();
