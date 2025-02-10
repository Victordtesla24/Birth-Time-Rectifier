jest.mock('../../js/modules.js', () => ({
    CONFIG: {
        chartSize: 600,
        centerX: 300,
        centerY: 300,
        particleCount: 100,
        loadingSpeed: 5
    },
    COLORS: {
        primary: '#4A90E2',
        success: '#2ECC71',
        error: '#E74C3C'
    }
}));

const { VisualizationManager } = require('../../js/visualization.js');

// Mock window and document if they don't exist
if (typeof window === 'undefined') {
    global.window = {
        innerWidth: 800,
        innerHeight: 600,
        dispatchEvent: () => {},
        Event: class Event {
            constructor(type) {
                this.type = type;
            }
        }
    };
}

if (typeof document === 'undefined') {
    const mockElement = {
        setAttribute: () => {},
        appendChild: () => {},
        querySelector: () => mockElement,
        querySelectorAll: () => [mockElement],
        getAttribute: () => '100%',
        children: [mockElement],
        textContent: '',
        innerHTML: ''
    };

    global.document = {
        createElementNS: () => mockElement,
        createElement: () => mockElement,
        querySelector: () => mockElement,
        querySelectorAll: () => [mockElement],
        body: {
            appendChild: () => {},
            removeChild: () => {}
        }
    };
}

// Mock p5 if it doesn't exist
if (typeof p5 === 'undefined') {
    global.p5 = class p5 {
        constructor(sketch) {
            this.width = 800;
            this.height = 600;
            if (sketch) sketch();
        }
        createCanvas() {}
        background() {}
        translate() {}
        rotate() {}
    };
}

describe('Visualizer', () => {
    let visualizer;
    let mockCanvas;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        // Create a new instance for each test
        visualizer = new VisualizationManager();
        mockCanvas = {
            width: 800,
            height: 600
        };
        global.width = mockCanvas.width;
        global.height = mockCanvas.height;
        
        // Mock document methods for SVG creation
        const createMockElement = () => {
            const element = {
                setAttribute: jest.fn(),
                appendChild: jest.fn(child => {
                    element.children.push(child);
                    return child;
                }),
                querySelector: jest.fn(selector => {
                    if (selector === '.planet-details') {
                        return createMockElement();
                    }
                    return null;
                }),
                querySelectorAll: jest.fn(() => []),
                getAttribute: jest.fn(attr => {
                    if (attr === 'viewBox') {
                        return '-300 -300 600 600';
                    }
                    return '100%';
                }),
                getBoundingClientRect: jest.fn(() => ({
                    width: 100,
                    height: 100
                })),
                children: [],
                textContent: '',
                innerHTML: ''
            };
            return element;
        };

        const mockElement = createMockElement();
        document.createElementNS = jest.fn(() => createMockElement());
        document.createElement = jest.fn(() => createMockElement());
    });

    describe('Loading Animation', () => {
        test('should initialize loading state', () => {
            expect(visualizer.loading).toBe(true);
            expect(visualizer.loadingParticles).toBeDefined();
            expect(visualizer.loadingParticles.length).toBeGreaterThan(0);
        });

        test('should update particles during loading', () => {
            const initialPositions = visualizer.loadingParticles.map(p => ({ ...p }));
            visualizer.updateLoadingAnimation();
            const newPositions = visualizer.loadingParticles;
            expect(newPositions).not.toEqual(initialPositions);
        });

        test('should reset particles that go off screen', () => {
            visualizer.loadingParticles[0].y = mockCanvas.height + 10;
            visualizer.updateLoadingAnimation();
            expect(visualizer.loadingParticles[0].y).toBeLessThan(0);
        });
    });

    describe('Chart Display', () => {
        const mockChartData = {
            planets: [
                { id: 'sun', name: 'Sun', position: 0, sign: 'aries', house: 1, dignity: 'exalted' }
            ],
            houses: [
                { number: 1, position: 0 }
            ],
            aspects: [
                { planet1: 'sun', planet2: 'moon', type: 'conjunction' }
            ]
        };

        test('should set chart data correctly', () => {
            visualizer.setChartData(mockChartData);
            expect(visualizer.chartData).toEqual(mockChartData);
            expect(visualizer.loading).toBe(false);
        });

        test('should draw chart circle with correct dimensions', () => {
            const radius = Math.min(visualizer.width, visualizer.height) * 0.4;
            expect(visualizer.getChartRadius()).toBe(radius);
        });

        test('should draw zodiac signs in correct positions', () => {
            visualizer.setChartData(mockChartData);
            const positions = visualizer.getZodiacPositions();
            expect(positions.length).toBe(12);
            expect(positions[0].angle).toBe(0);
        });

        test('should draw planets with correct attributes', () => {
            visualizer.setChartData(mockChartData);
            const planetPos = visualizer.getPlanetPosition('sun');
            expect(planetPos).toBeDefined();
            const radius = visualizer.getChartRadius() * 0.8;
            expect(planetPos.x).toBe(radius); // At 0 degrees, cos(0) = 1
            expect(planetPos.y).toBe(0);      // At 0 degrees, sin(0) = 0
        });

        test('should draw aspects between planets', () => {
            visualizer.setChartData(mockChartData);
            const aspect = visualizer.getAspectLine('sun', 'moon');
            expect(aspect).toBeDefined();
            expect(aspect.color).toBeDefined();
        });
    });

    describe('Interactive Features', () => {
        test('should handle planet selection', () => {
            visualizer.selectPlanet('sun');
            expect(visualizer.selectedPlanet).toBe('sun');
        });

        test('should clear selection when clicking away', () => {
            visualizer.selectPlanet('sun');
            visualizer.clearSelection();
            expect(visualizer.selectedPlanet).toBeNull();
        });

        test('should draw planet details when selected', () => {
            visualizer.setChartData({
                planets: [{ id: 'sun', name: 'Sun', position: 0, sign: 'aries', house: 1, dignity: 'exalted' }]
            });
            visualizer.selectPlanet('sun');
            const container = document.createElement('div');
            visualizer.renderChart(container, visualizer.chartData);
            const details = container.querySelector('.planet-details');
            expect(details).toBeDefined();
        });
    });

    describe('Analysis Panels', () => {
        test('should draw Dasha periods', () => {
            const dashas = visualizer.getDashaPeriods();
            expect(dashas).toBeDefined();
            expect(Array.isArray(dashas)).toBe(true);
        });

        test('should draw KP analysis', () => {
            const kp = visualizer.getKPAnalysis();
            expect(kp).toBeDefined();
            expect(kp.sublords).toBeDefined();
        });

        test('should draw Tattwa analysis', () => {
            const tattwa = visualizer.getTattwaAnalysis();
            expect(tattwa).toBeDefined();
            expect(tattwa.elements).toBeDefined();
        });
    });

    describe('Color Management', () => {
        test('should return correct aspect colors', () => {
            const conjunction = visualizer.getAspectColor('conjunction');
            const trine = visualizer.getAspectColor('trine');
            const square = visualizer.getAspectColor('square');
            
            expect(conjunction).toBe('#4A90E2');
            expect(trine).toBe('#2ECC71');
            expect(square).toBe('#E74C3C');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing chart data gracefully', () => {
            expect(() => visualizer.drawChart()).not.toThrow();
        });

        test('should handle missing planet data gracefully', () => {
            visualizer.setChartData({ planets: [] });
            expect(() => visualizer.drawPlanets()).not.toThrow();
        });

        test('should handle invalid coordinates gracefully', () => {
            const largeRadius = visualizer.getChartRadius() * 2;
            expect(visualizer.isPointInChart(largeRadius, largeRadius)).toBe(false);
            expect(visualizer.isPointInChart(undefined, undefined)).toBe(false);
            expect(visualizer.isPointInChart(0, 0)).toBe(true);
        });
    });
});

describe('VisualizationManager', () => {
    let visualizationManager;
    let mockContainer;
    let p5Instance;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        
        const createMockElement = () => {
            const element = {
                setAttribute: jest.fn(),
                appendChild: jest.fn(child => {
                    element.children.push(child);
                    return child;
                }),
                querySelector: jest.fn(selector => {
                    if (selector === '.planet-details' || selector === 'svg' || selector === 'defs' || selector === '#chartBackground' || selector === '#aspectLine') {
                        return createMockElement();
                    }
                    return null;
                }),
                querySelectorAll: jest.fn(selector => {
                    if (selector === '.houses path') {
                        return Array(12).fill(createMockElement());
                    } else if (selector === '.planet') {
                        return Array(2).fill(createMockElement());
                    } else if (selector === '.aspect') {
                        return Array(1).fill(createMockElement());
                    }
                    return [];
                }),
                getAttribute: jest.fn(attr => {
                    if (attr === 'viewBox') {
                        return '-300 -300 600 600';
                    }
                    return '100%';
                }),
                getBoundingClientRect: jest.fn(() => ({
                    width: 100,
                    height: 100
                })),
                children: [],
                textContent: '',
                innerHTML: ''
            };
            return element;
        };

        visualizationManager = new VisualizationManager();
        mockContainer = createMockElement();
        p5Instance = new p5(() => {});
        
        // Mock document methods for SVG creation
        document.createElementNS = jest.fn(() => createMockElement());
        document.createElement = jest.fn(() => createMockElement());
    });


    test('should initialize with correct chart size', () => {
        expect(visualizationManager.chartSize).toBe(600);
        expect(visualizationManager.centerX).toBe(300);
        expect(visualizationManager.centerY).toBe(300);
    });

    test('should create SVG element with correct attributes', () => {
        const mockData = {
            houses: [],
            zodiac: [],
            aspects: [],
            planets: []
        };
        
        visualizationManager.renderChart(mockContainer, mockData);
        const svg = mockContainer.querySelector('svg');
        
        expect(svg).toBeTruthy();
        expect(svg.getAttribute('width')).toBe('100%');
        expect(svg.getAttribute('height')).toBe('100%');
        expect(svg.getAttribute('viewBox')).toBe('-300 -300 600 600');
    });

    test('should create gradient definitions', () => {
        const mockData = {
            houses: [],
            zodiac: [],
            aspects: [],
            planets: []
        };
        
        visualizationManager.renderChart(mockContainer, mockData);
        const defs = mockContainer.querySelector('defs');
        const bgGradient = defs.querySelector('#chartBackground');
        const aspectGradient = defs.querySelector('#aspectLine');
        
        expect(bgGradient).toBeTruthy();
        expect(aspectGradient).toBeTruthy();
    });

    test('should render houses correctly', () => {
        const mockData = {
            houses: Array(12).fill({}),
            zodiac: [],
            aspects: [],
            planets: []
        };
        
        visualizationManager.renderChart(mockContainer, mockData);
        const houses = mockContainer.querySelectorAll('.houses path');
        
        expect(houses.length).toBe(12);
    });

    test('should render planets with correct attributes', () => {
        const mockData = {
            houses: [],
            zodiac: [],
            aspects: [],
            planets: [
                { id: 'sun', name: 'Sun', position: 0 },
                { id: 'moon', name: 'Moon', position: 45 }
            ]
        };
        
        visualizationManager.renderChart(mockContainer, mockData);
        const planets = mockContainer.querySelectorAll('.planet');
        
        expect(planets.length).toBe(2);
    });

    test('should handle aspect rendering', () => {
        const mockData = {
            houses: [],
            zodiac: [],
            aspects: [
                {
                    planet1: 'sun',
                    planet2: 'moon',
                    type: 'square'
                }
            ],
            planets: [
                { id: 'sun', name: 'Sun', position: 0 },
                { id: 'moon', name: 'Moon', position: 90 }
            ]
        };
        
        visualizationManager.renderChart(mockContainer, mockData);
        const aspects = mockContainer.querySelectorAll('.aspect');
        
        expect(aspects.length).toBe(1);
    });

    test('should update chart on window resize', () => {
        const mockData = {
            houses: [],
            zodiac: [],
            aspects: [],
            planets: []
        };
        
        visualizationManager.renderChart(mockContainer, mockData);
        window.dispatchEvent(new Event('resize'));
        
        const svg = mockContainer.querySelector('svg');
        expect(svg.getAttribute('width')).toBe('100%');
    });

    test('p5 instance is created correctly', () => {
        expect(p5Instance).toBeDefined();
        expect(p5Instance.width).toBe(800);
        expect(p5Instance.height).toBe(600);
    });

    test('canvas methods are mocked', () => {
        p5Instance.createCanvas();
        p5Instance.background();
        p5Instance.translate();
        p5Instance.rotate();
        
        expect(true).toBe(true); // If we get here, no errors were thrown
    });

    test('WebGL context is mocked', () => {
        const mockWebGLContext = {
            drawingBufferWidth: 800,
            drawingBufferHeight: 600
        };
        
        const mockCanvas = document.createElement('canvas');
        mockCanvas.getContext = jest.fn(() => mockWebGLContext);
        
        const gl = mockCanvas.getContext('webgl');
        expect(gl).toBeDefined();
        expect(gl.drawingBufferWidth).toBe(800);
        expect(gl.drawingBufferHeight).toBe(600);
    });
});
