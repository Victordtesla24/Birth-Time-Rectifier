import type { Animation } from '../types/visualization';

export function updateAnimations(animation: Animation, currentTime: number): void {
    // Update overall progress
    if (animation.startTime === 0) {
        animation.startTime = currentTime;
    }
    
    const elapsed = currentTime - animation.startTime;
    animation.progress = Math.min(1, elapsed / animation.duration);
    
    // Update individual transitions
    animation.transitions.forEach((transition, key) => {
        if (transition.startTime === 0) {
            transition.startTime = currentTime;
        }
        
        const transitionElapsed = currentTime - transition.startTime;
        const progress = Math.min(1, transitionElapsed / animation.duration);
        const easedProgress = easeInOutCubic(progress);
        
        const currentValue = transition.start + (transition.end - transition.start) * easedProgress;
        
        // Store the current value back in the transition object
        transition.start = currentValue;
    });
}

export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function addTransition(
    animation: Animation,
    key: string,
    start: number,
    end: number,
    currentTime: number
): void {
    animation.transitions.set(key, {
        start,
        end,
        startTime: currentTime
    });
}

export function removeTransition(animation: Animation, key: string): void {
    animation.transitions.delete(key);
}

export function getCurrentValue(animation: Animation, key: string): number | null {
    const transition = animation.transitions.get(key);
    return transition ? transition.start : null;
}

export function isAnimating(animation: Animation): boolean {
    return animation.progress < 1 || animation.transitions.size > 0;
}

export function resetAnimation(animation: Animation): void {
    animation.progress = 0;
    animation.startTime = 0;
    animation.transitions.clear();
} 