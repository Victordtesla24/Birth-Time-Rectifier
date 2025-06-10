import { AnimationManager } from '../../services/animationManager';
import type { P5Instance } from 'p5';

interface Animation {
    id: string;
    isPlaying: boolean;
    currentFrame: number;
    duration: number;
    update: (time: number) => void;
    play: () => void;
    pause: () => void;
}

describe('AnimationManager', () => {
    let animationManager: AnimationManager;
    let mockP5: P5Instance;

    beforeEach(() => {
        mockP5 = {
            createCanvas: jest.fn(),
            background: jest.fn(),
            // Add other required p5 methods
        } as unknown as P5Instance;
        
        animationManager = new AnimationManager(mockP5);
    });

    afterEach(() => {
        if (animationManager) {
            animationManager.cleanup();
        }
    });

    it('should initialize with correct default values', () => {
        expect(animationManager.isPlaying).toBe(false);
        expect(animationManager.animations.size).toBe(0);
        expect(animationManager.p5).toBe(mockP5);
    });

    test('should add and remove animations', () => {
        const animation = {
            id: 'test',
            duration: 1000,
            startValue: 0,
            endValue: 100,
            onUpdate: jest.fn()
        };

        animationManager.addAnimation(animation);
        expect(animationManager.animations.size).toBe(1);
        expect(animationManager.animations.get('test')).toBeDefined();

        animationManager.removeAnimation('test');
        expect(animationManager.animations.size).toBe(0);
    });

    test('should update animations', () => {
        const onUpdate = jest.fn();
        const animation = {
            id: 'test',
            duration: 1000,
            startValue: 0,
            endValue: 100,
            onUpdate
        };

        animationManager.addAnimation(animation);
        animationManager.play('test');

        // Simulate frame updates
        for (let i = 0; i < 10; i++) {
            animationManager.update(i * 100);
        }

        expect(onUpdate).toHaveBeenCalled();
        expect(onUpdate.mock.calls[0][0]).toBeGreaterThanOrEqual(0);
        expect(onUpdate.mock.calls[0][0]).toBeLessThanOrEqual(100);
    });

    test('should handle easing functions', () => {
        const onUpdate = jest.fn();
        const animation = {
            id: 'test',
            duration: 1000,
            startValue: 0,
            endValue: 100,
            easing: 'easeInOutQuad',
            onUpdate
        };

        animationManager.addAnimation(animation);
        animationManager.play('test');
        animationManager.update(500); // 50% through animation

        expect(onUpdate).toHaveBeenCalled();
        const value = onUpdate.mock.calls[0][0];
        // easeInOutQuad at 50% should be around 50
        expect(value).toBeCloseTo(50, 1);
    });

    test('should handle animation completion', () => {
        const onComplete = jest.fn();
        const animation = {
            id: 'test',
            duration: 1000,
            startValue: 0,
            endValue: 100,
            onUpdate: jest.fn(),
            onComplete
        };

        animationManager.addAnimation(animation);
        animationManager.play('test');
        animationManager.update(1000); // Complete animation

        expect(onComplete).toHaveBeenCalled();
        expect(animationManager.isPlaying).toBe(false);
    });

    test('should pause and resume animations', () => {
        const animation = {
            id: 'test',
            duration: 1000,
            startValue: 0,
            endValue: 100,
            onUpdate: jest.fn()
        };

        animationManager.addAnimation(animation);
        animationManager.play('test');
        expect(animationManager.isPlaying).toBe(true);

        animationManager.pause('test');
        expect(animationManager.isPlaying).toBe(false);

        animationManager.resume('test');
        expect(animationManager.isPlaying).toBe(true);
    });

    test('should handle multiple animations', () => {
        const animations = [
            {
                id: 'test1',
                duration: 1000,
                startValue: 0,
                endValue: 100,
                onUpdate: jest.fn()
            },
            {
                id: 'test2',
                duration: 2000,
                startValue: 0,
                endValue: 200,
                onUpdate: jest.fn()
            }
        ];

        animations.forEach(animation => animationManager.addAnimation(animation));
        expect(animationManager.animations.size).toBe(2);

        animationManager.playAll();
        expect(Array.from(animationManager.animations.values()).every(a => a.isPlaying)).toBe(true);

        animationManager.pauseAll();
        expect(Array.from(animationManager.animations.values()).every(a => !a.isPlaying)).toBe(true);
    });
});
