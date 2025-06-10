import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { gsap, animationManager } from '@tests/mocks/animation';
import { AnimationManager } from '../../services/animationManager';
import { P5Instance } from 'p5';

// Mock GSAP
jest.mock('gsap', () => gsap);

// Mock animation manager
jest.mock('@/services/animationManager', () => ({
    AnimationManager: jest.fn().mockImplementation(() => animationManager)
}));

jest.mock('@/services/logger');

describe('AnimationManager', () => {
    let animationManager: AnimationManager;
    let mockP5: P5Instance;

    beforeEach(() => {
        mockP5 = {
            createCanvas: jest.fn(),
            background: jest.fn(),
            draw: jest.fn(),
        } as unknown as P5Instance;

        animationManager = new AnimationManager(mockP5);
    });

    afterEach(() => {
        jest.clearAllMocks();
        animationManager.cleanup();
    });

    it('should initialize with default values', () => {
        expect(animationManager.isPlaying).toBe(false);
        expect(animationManager.animations.size).toBe(0);
    });

    it('should add animation and return id', () => {
        const mockAnimation = {
            frames: [1, 2, 3],
            loop: true
        };

        const id = animationManager.addAnimation(mockAnimation);
        expect(id).toBeDefined();
        expect(animationManager.animations.size).toBe(1);
        
        const storedAnimation = animationManager.animations.get(id);
        expect(storedAnimation).toMatchObject({
            ...mockAnimation,
            isPlaying: false,
            currentFrame: 0
        });
    });

    it('should remove animation', () => {
        const mockAnimation = {
            frames: [1, 2, 3],
            loop: true
        };

        const id = animationManager.addAnimation(mockAnimation);
        expect(animationManager.animations.size).toBe(1);

        animationManager.removeAnimation(id);
        expect(animationManager.animations.size).toBe(0);
    });

    it('should play and pause animation', () => {
        const mockAnimation = {
            frames: [1, 2, 3],
            loop: true
        };

        const id = animationManager.addAnimation(mockAnimation);
        
        animationManager.play(id);
        expect(animationManager.isPlaying).toBe(true);
        expect(animationManager.animations.get(id)?.isPlaying).toBe(true);

        animationManager.pause(id);
        expect(animationManager.isPlaying).toBe(false);
        expect(animationManager.animations.get(id)?.isPlaying).toBe(false);
    });

    it('should update animation frames', () => {
        const mockAnimation = {
            frames: [1, 2, 3],
            loop: true
        };

        const id = animationManager.addAnimation(mockAnimation);
        animationManager.play(id);

        // Update should increment currentFrame
        animationManager.update(0);
        expect(animationManager.animations.get(id)?.currentFrame).toBe(1);

        // Update should loop back to 0 when reaching end of frames
        animationManager.update(0);
        animationManager.update(0);
        expect(animationManager.animations.get(id)?.currentFrame).toBe(0);
    });

    it('should cleanup all animations', () => {
        const mockAnimation1 = {
            frames: [1, 2, 3],
            loop: true
        };
        const mockAnimation2 = {
            frames: [4, 5, 6],
            loop: false
        };

        animationManager.addAnimation(mockAnimation1);
        animationManager.addAnimation(mockAnimation2);
        expect(animationManager.animations.size).toBe(2);

        animationManager.cleanup();
        expect(animationManager.animations.size).toBe(0);
        expect(animationManager.isPlaying).toBe(false);
    });
});
