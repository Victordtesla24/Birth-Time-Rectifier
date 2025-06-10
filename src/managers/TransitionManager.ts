import { ChartData, House, Planet } from '../types';

interface Transition {
    start: number;
    end: number;
    startTime: number;
    current: number;
}

type EasingFunction = (x: number) => number;

export class TransitionManager {
    private transitions: Map<string, Transition>;
    private duration: number;
    private easing: EasingFunction;
    
    constructor() {
        this.transitions = new Map();
        this.duration = 1000; // Default duration in milliseconds
        this.easing = this.easeInOutCubic;
    }
    
    public setupTransitions(data: ChartData): void {
        // Initialize transitions for houses
        if (data.houses) {
            data.houses.forEach((house: House, index: number) => {
                this.transitions.set(`house_${index}`, {
                    start: house.startAngle,
                    end: house.startAngle,
                    startTime: 0,
                    current: house.startAngle,
                });
            });
        }
        
        // Initialize transitions for planets
        if (data.planets) {
            data.planets.forEach((planet: Planet) => {
                this.transitions.set(`planet_${planet.name}`, {
                    start: planet.longitude,
                    end: planet.longitude,
                    startTime: 0,
                    current: planet.longitude,
                });
            });
        }
    }
    
    public initializeTransitions(oldData: ChartData, newData: ChartData): void {
        const currentTime = performance.now();
        
        // Update house transitions
        if (newData.houses) {
            newData.houses.forEach((house: House, index: number) => {
                const key = `house_${index}`;
                const current = this.transitions.get(key)?.current ?? house.startAngle;
                
                this.transitions.set(key, {
                    start: current,
                    end: house.startAngle,
                    startTime: currentTime,
                    current,
                });
            });
        }
        
        // Update planet transitions
        if (newData.planets) {
            newData.planets.forEach((planet: Planet) => {
                const key = `planet_${planet.name}`;
                const current = this.transitions.get(key)?.current ?? planet.longitude;
                
                // Handle 360-degree wrap-around
                let endValue = planet.longitude;
                const diff = endValue - current;
                
                if (Math.abs(diff) > 180) {
                    endValue += diff > 0 ? -360 : 360;
                }
                
                this.transitions.set(key, {
                    start: current,
                    end: endValue,
                    startTime: currentTime,
                    current,
                });
            });
        }
    }
    
    public updateTransitions(): void {
        const currentTime = performance.now();
        
        this.transitions.forEach((transition, key) => {
            const elapsed = currentTime - transition.startTime;
            const progress = Math.min(elapsed / this.duration, 1);
            
            if (progress < 1) {
                const easedProgress = this.easing(progress);
                transition.current = this.interpolate(
                    transition.start,
                    transition.end,
                    easedProgress
                );
            } else {
                transition.current = transition.end;
            }
        });
    }
    
    public getTransitionedValue(key: string, defaultValue: number): number {
        return this.transitions.get(key)?.current ?? defaultValue;
    }
    
    private interpolate(start: number, end: number, progress: number): number {
        const diff = end - start;
        if (Math.abs(diff) > 180) {
            return start + (diff + (diff > 0 ? -360 : 360)) * progress;
        }
        return start + diff * progress;
    }
    
    private easeInOutCubic(x: number): number {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }
    
    public setEasing(easingFunction: EasingFunction): void {
        this.easing = easingFunction;
    }
    
    public setDuration(duration: number): void {
        this.duration = duration;
    }
}