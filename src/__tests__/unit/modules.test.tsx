import { COLORS, CONFIG } from '../../src/services/modules';

describe('Modules Configuration', () => {
    test('COLORS should have the correct color values', () => {
        expect(COLORS.primary).toBe('#4A90E2');
        expect(COLORS.success).toBe('#2ECC71');
        expect(COLORS.error).toBe('#E74C3C');
    });

    test('CONFIG should have all required visualization settings', () => {
        expect(CONFIG.chartSize).toBe(600);
        expect(CONFIG.centerX).toBe(300);
        expect(CONFIG.centerY).toBe(300);
        expect(CONFIG.particleCount).toBe(100);
        expect(CONFIG.loadingSpeed).toBe(5);
        expect(CONFIG.starCount).toBe(2000);
        expect(CONFIG.nebulaCount).toBe(5);
        expect(CONFIG.planetCount).toBe(8);
        expect(CONFIG.maxStarDepth).toBe(1000);
        expect(CONFIG.minStarDepth).toBe(-1000);
        expect(CONFIG.starFieldSpeed).toBe(0.5);
        expect(CONFIG.starSize).toEqual({
            min: 1,
            max: 4
        });
        expect(CONFIG.rotationSpeed).toBe(0.001);
    });

    test('All required exports should be defined', () => {
        const modules = require('../../src/services/modules.js');
        expect(modules.COLORS).toBeDefined();
        expect(modules.CONFIG).toBeDefined();
        expect(modules.ApiManager).toBeDefined();
        expect(modules.ApiClient).toBeDefined();
        expect(modules.EventBus).toBeDefined();
        expect(modules.Visualizer).toBeDefined();
    });
});
