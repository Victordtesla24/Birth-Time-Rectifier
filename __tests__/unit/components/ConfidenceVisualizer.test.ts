import { ConfidenceVisualizer } from '../../../src/utils/chart/visualizers/ConfidenceVisualizer';
import type { ConfidenceData, MLInsight } from '../../../src/utils/chart/types/visualization';
import p5 from 'p5';

// Mock p5.js
jest.mock('p5');

describe('ConfidenceVisualizer', () => {
    let visualizer: ConfidenceVisualizer;
    let mockSketch: jest.Mocked<p5>;
    let mockConfidenceData: ConfidenceData;
    let mockMLInsights: MLInsight[];

    beforeEach(() => {
        // Setup mock p5 instance
        mockSketch = new p5(() => {}) as jest.Mocked<p5>;
        mockSketch.push = jest.fn();
        mockSketch.pop = jest.fn();
        mockSketch.translate = jest.fn();
        mockSketch.scale = jest.fn();
        mockSketch.fill = jest.fn();
        mockSketch.stroke = jest.fn();
        mockSketch.noStroke = jest.fn();
        mockSketch.rect = jest.fn();
        mockSketch.circle = jest.fn();
        mockSketch.text = jest.fn();
        mockSketch.textAlign = jest.fn();
        mockSketch.textSize = jest.fn();
        mockSketch.line = jest.fn();
        mockSketch.millis = jest.fn().mockReturnValue(0);

        // Initialize visualizer
        visualizer = new ConfidenceVisualizer(mockSketch);

        // Setup mock confidence data
        mockConfidenceData = {
            overall: 0.8,
            components: {
                physical_appearance: 0.75,
                event_correlations: 0.85,
                birth_time_accuracy: 0.8
            }
        };

        // Setup mock ML insights
        mockMLInsights = [{
            type: 'pattern',
            description: 'Test insight',
            confidence: 0.9,
            relatedElements: [
                { type: 'planet', id: 'sun', significance: 0.8 }
            ],
            visualCues: [
                {
                    type: 'highlight',
                    elements: ['sun'],
                    style: { color: '#2196F3', thickness: 2 }
                }
            ]
        }];
    });

    describe('draw', () => {
        it('should call all required drawing methods', () => {
            // Setup spies
            const updateAnimationsSpy = jest.spyOn(visualizer as any, 'updateAnimations');
            const drawConfidenceMetricsSpy = jest.spyOn(visualizer as any, 'drawConfidenceMetrics');
            const drawPlanetaryDetailsSpy = jest.spyOn(visualizer as any, 'drawPlanetaryDetails');
            const drawMLInsightsSpy = jest.spyOn(visualizer as any, 'drawMLInsights');
            const drawAccessibilityFeaturesSpy = jest.spyOn(visualizer as any, 'drawAccessibilityFeatures');

            // Call draw method
            visualizer.draw();

            // Verify all drawing methods were called
            expect(updateAnimationsSpy).toHaveBeenCalled();
            expect(drawConfidenceMetricsSpy).toHaveBeenCalled();
            expect(drawPlanetaryDetailsSpy).toHaveBeenCalled();
            expect(drawMLInsightsSpy).toHaveBeenCalled();
            expect(drawAccessibilityFeaturesSpy).toHaveBeenCalled();

            // Verify p5 transformations
            expect(mockSketch.push).toHaveBeenCalled();
            expect(mockSketch.translate).toHaveBeenCalled();
            expect(mockSketch.scale).toHaveBeenCalled();
            expect(mockSketch.pop).toHaveBeenCalled();
        });
    });

    describe('updateConfidence', () => {
        it('should update confidence data and add transitions', () => {
            // Setup spy for addTransition
            const addTransitionSpy = jest.spyOn(visualizer as any, 'addTransitions');

            // Update confidence
            visualizer.updateConfidence(mockConfidenceData);

            // Verify transitions were added
            expect(addTransitionSpy).toHaveBeenCalled();

            // Verify confidence data was updated
            expect((visualizer as any).confidence).toEqual(mockConfidenceData);
        });
    });

    describe('showPlanetaryInfo', () => {
        it('should update planetary info state correctly', () => {
            const planet = 'Sun';
            const details = { longitude: 120, house: 10 };
            const x = 100;
            const y = 100;

            visualizer.showPlanetaryInfo(planet, details, x, y);

            expect((visualizer as any).planetaryInfo).toEqual({
                isVisible: true,
                planet,
                details,
                position: { x, y }
            });
        });
    });

    describe('hidePlanetaryInfo', () => {
        it('should hide planetary info', () => {
            // First show planetary info
            visualizer.showPlanetaryInfo('Sun', {}, 0, 0);
            
            // Then hide it
            visualizer.hidePlanetaryInfo();

            expect((visualizer as any).planetaryInfo.isVisible).toBe(false);
        });
    });

    describe('updateMLInsights', () => {
        it('should update ML insights and initialize animations', () => {
            const now = 1000;
            mockSketch.millis.mockReturnValue(now);

            visualizer.updateMLInsights(mockMLInsights);

            // Verify insights were updated
            expect((visualizer as any).mlInsights).toEqual(mockMLInsights);

            // Verify animations were initialized
            const animations = (visualizer as any).insightAnimations;
            expect(animations.get('pattern')).toBeDefined();
            expect(animations.get('pattern').startTime).toBe(now);
        });
    });

    describe('setActiveInsight', () => {
        it('should update active insight and announce change', () => {
            const announceSpy = jest.spyOn(visualizer as any, 'announceA11y');
            
            visualizer.setActiveInsight(mockMLInsights[0]);

            expect((visualizer as any).activeInsight).toEqual(mockMLInsights[0]);
            expect(announceSpy).toHaveBeenCalledWith(
                'Activated insight: Test insight',
                'high'
            );
        });

        it('should handle null insight', () => {
            visualizer.setActiveInsight(null);
            expect((visualizer as any).activeInsight).toBeNull();
        });
    });
}); 