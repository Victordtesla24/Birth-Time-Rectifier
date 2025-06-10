import { EnhancedVisualizationManager } from '@/services/enhancedVisualization';
import { CONFIG } from '@/services/modules';
import { canvasManager, p5Mock } from '@tests/mocks/animation';

// Mock p5.js
jest.mock('p5', () => {
    return jest.fn().mockImplementation(() => p5Mock);
});

describe('EnhancedVisualizationManager', () => {
    let visualManager;
    let mockContainer;

    beforeEach(() => {
        // Setup DOM elements
        mockContainer = document.createElement('div');
        mockContainer.id = 'test-container';
        document.body.appendChild(mockContainer);

        // Initialize manager
        visualManager = new EnhancedVisualizationManager('test-container');
    });

    afterEach(() => {
        // Cleanup
        document.body.innerHTML = ''; // Clear all containers
        if (visualManager) {
            visualManager.destroy();
        }
        jest.clearAllMocks();
        
        // Reset p5 mock methods
        const p5Mock = window.p5.prototype;
        Object.keys(p5Mock).forEach(key => {
            if (typeof p5Mock[key] === 'function' && p5Mock[key].mockClear) {
                p5Mock[key].mockClear();
            }
        });
    });

    test('should initialize with effects disabled', () => {
        expect(visualManager.effects.size).toBe(0);
        expect(visualManager.postProcessing.enabled).toBe(false);
        expect(visualManager.postProcessing.effects).toHaveLength(0);
    });

    test('should add and remove effects', () => {
        visualManager.addEffect('bloom');
        expect(visualManager.effects.has('bloom')).toBe(true);
        
        visualManager.removeEffect('bloom');
        expect(visualManager.effects.has('bloom')).toBe(false);
    });

    test('should manage shaders', () => {
        const mockShader = { id: 'test-shader' };
        visualManager.addShader('test', mockShader);
        expect(visualManager.shaders.get('test')).toBe(mockShader);
    });

    test('should handle post-processing state', () => {
        visualManager.enablePostProcessing();
        expect(visualManager.postProcessing.enabled).toBe(true);
        
        visualManager.disablePostProcessing();
        expect(visualManager.postProcessing.enabled).toBe(false);
    });

    test('should manage post-processing effects', () => {
        const effect = { id: 'test-effect' };
        visualManager.addPostProcessingEffect(effect);
        expect(visualManager.postProcessing.effects).toContain(effect);
        
        visualManager.clearPostProcessingEffects();
        expect(visualManager.postProcessing.effects).toHaveLength(0);
    });

    test('should cleanup all resources', () => {
        visualManager.addEffect('bloom');
        visualManager.addShader('test', {});
        visualManager.addPostProcessingEffect({});
        
        visualManager.cleanup();
        
        expect(visualManager.effects.size).toBe(0);
        expect(visualManager.shaders.size).toBe(0);
        expect(visualManager.postProcessing.effects).toHaveLength(0);
    });
});
