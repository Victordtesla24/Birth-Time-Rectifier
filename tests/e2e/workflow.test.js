import { ApiManager, Visualizer } from '../../js/modules.js';
import { WorkflowOrchestrator, WorkflowController } from '../../js/workflow.js';
import { EventBus } from '../../js/modules.js';
import { FormManager } from '../../js/form.js';

// Mock p5.js globals
global.noFill = jest.fn();
global.stroke = jest.fn();
global.strokeWeight = jest.fn();
global.push = jest.fn();
global.pop = jest.fn();
global.translate = jest.fn();
global.rotate = jest.fn();
global.circle = jest.fn();
global.line = jest.fn();
global.rect = jest.fn();
global.text = jest.fn();
global.fill = jest.fn();
global.frameCount = 0;

describe('End-to-End Workflow', () => {
    let formManager;
    let apiManager;
    let visualizer;
    let currentScreen;
    let testData;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        formManager = new FormManager();
        apiManager = new ApiManager();
        visualizer = new Visualizer();
        currentScreen = 'form';

        // Mock fetch
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'mocked data' })
        }));
        
        // Mock canvas properties
        global.width = 600;
        global.height = 600;

        // Setup test data
        testData = {
            get: jest.fn(key => {
                const data = {
                    birthDate: '2000-01-01',
                    approximateTime: '12:00',
                    birthPlace: 'New York, USA',
                    timeUncertainty: '30',
                };
                return data[key];
            }),
            getAll: jest.fn(key => {
                const data = {
                    'eventDate[]': ['2010-01-01', '2015-01-01'],
                    'eventType[]': ['major_life_event', 'career_change'],
                    'eventDescription[]': ['Event 1', 'Event 2']
                };
                return data[key] || [];
            })
        };
    });

    describe('Complete Birth Time Rectification Flow', () => {
        test('should process valid birth data through entire system', async () => {
            // Mock successful API response
            formManager.api.submitBirthData = jest.fn().mockResolvedValue({
                success: true,
                calculatedTime: '12:30',
                chartData: {
                    planets: [{ name: 'Sun', position: 0 }],
                    houses: [{ number: 1, position: 0 }]
                }
            });

            // Set initial visualizer state
            visualizer.loading = false;
            visualizer.chartData = null;

            // Submit form data
            const result = await formManager.submitForm(testData);
            expect(result).toBeDefined();
            expect(result.calculatedTime).toBe('12:30');

            // Update visualizer with result
            visualizer.setChartData(result.chartData);

            // Verify visualization update
            expect(visualizer.loading).toBe(false);
            expect(visualizer.chartData).toBeDefined();
        });

        test('should handle errors gracefully throughout workflow', async () => {
            // Mock API error
            global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Birth data submission failed')));

            try {
                await formManager.submitForm(testData);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).toBe('Birth data submission failed');
            }

            expect(visualizer.loading).toBe(true);
        });

        test('should handle invalid input gracefully', async () => {
            const invalidData = {
                get: jest.fn(() => undefined),
                getAll: jest.fn(() => [])
            };

            const errors = formManager.validate(invalidData);
            expect(errors).toBeDefined();
            expect(errors.length).toBeGreaterThan(0);
        });
    });

    describe('WorkflowOrchestrator', () => {
        let orchestrator;

        beforeEach(() => {
            orchestrator = new WorkflowOrchestrator();
            
            // Mock API methods
            orchestrator.api.geocodeLocation = jest.fn().mockResolvedValue({
                coordinates: { lat: 40.7128, lng: -74.0060 }
            });
            
            orchestrator.api.getAstronomicalData = jest.fn().mockResolvedValue({
                data: {
                    astronomicalData: {
                        planets: [{ name: 'Sun', position: 0 }],
                        houses: [{ number: 1, position: 0 }]
                    }
                }
            });
        });

        test('should initialize with default values', () => {
            expect(orchestrator.currentStep).toBe(1);
            expect(orchestrator.birthData).toBeNull();
            expect(orchestrator.astronomicalData).toBeNull();
            expect(orchestrator.questionnaire).toBeNull();
            expect(orchestrator.refinedTime).toBeNull();
        });

        test('should process birth data successfully', async () => {
            const birthData = {
                birthDate: '2000-01-01',
                approximateTime: '12:00',
                location: 'New York, USA',
                events: [
                    { date: '2010-01-01', type: 'major_life_event', description: 'Event 1' }
                ]
            };

            const result = await orchestrator.processBirthData(birthData);
            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.data.astronomicalData).toBeDefined();
            expect(result.data.astronomicalData.planets).toBeDefined();
        });

        test('should validate current step correctly', () => {
            // Test initial state (step 1)
            expect(orchestrator.validateCurrentStep()).toBe(false);

            // Test step 1 with valid data
            orchestrator.birthData = {
                birthDate: '2000-01-01',
                approximateTime: '12:00',
                location: 'New York, USA'
            };
            expect(orchestrator.validateCurrentStep()).toBe(true);

            // Move to step 2
            orchestrator.currentStep = 2;
            expect(orchestrator.validateCurrentStep()).toBe(false);

            // Add astronomical data for step 2
            orchestrator.astronomicalData = {
                planets: [{ name: 'Sun', position: 0 }]
            };
            expect(orchestrator.validateCurrentStep()).toBe(true);
        });

        test('should handle step navigation', () => {
            expect(orchestrator.currentStep).toBe(1);
            
            // Mock valid data for current step
            orchestrator.birthData = {
                birthDate: '2000-01-01',
                approximateTime: '12:00',
                location: 'New York, USA'
            };

            orchestrator.moveToNextStep();
            expect(orchestrator.currentStep).toBe(2);
            
            orchestrator.moveToPreviousStep();
            expect(orchestrator.currentStep).toBe(1);
        });

        test('should reset workflow state', () => {
            // Set some data
            orchestrator.birthData = { birthDate: '2000-01-01' };
            orchestrator.astronomicalData = { planets: [] };
            orchestrator.currentStep = 2;

            // Reset
            orchestrator.reset();

            // Verify reset state
            expect(orchestrator.currentStep).toBe(1);
            expect(orchestrator.birthData).toBeNull();
            expect(orchestrator.astronomicalData).toBeNull();
            expect(orchestrator.questionnaire).toBeNull();
            expect(orchestrator.refinedTime).toBeNull();
        });
    });

    describe('WorkflowController', () => {
        let controller;

        beforeEach(() => {
            controller = new WorkflowController();
        });

        test('should initialize with correct step arrays', () => {
            expect(controller.steps).toBeDefined();
            expect(controller.steps.length).toBeGreaterThan(0);
            expect(controller.currentStepIndex).toBe(0);
        });

        test('should process data through Agent 1', async () => {
            // Mock form data
            const formData = {
                get: jest.fn(key => {
                    const data = {
                        birthDate: '2000-01-01',
                        approximateTime: '12:00',
                        birthPlace: 'New York, USA',
                        timeUncertainty: '30'
                    };
                    return data[key];
                }),
                getAll: jest.fn(key => {
                    const data = {
                        'eventDate[]': ['2010-01-01'],
                        'eventType[]': ['major_life_event'],
                        'eventDescription[]': ['Test event']
                    };
                    return data[key] || [];
                })
            };

            const result = await controller.agent1Process(formData);
            expect(result).toBeDefined();
            expect(result.birthDate).toBe('2000-01-01');
            expect(result.birthTime).toBe('12:00');
            expect(result.birthPlace).toBe('New York, USA');
        });

        test('should process data through Agent 2', async () => {
            // Mock initial data
            const initialData = {
                birthDate: '2000-01-01',
                birthTime: '12:00',
                birthPlace: 'New York, USA',
                events: [{
                    date: '2010-01-01',
                    type: 'major_life_event',
                    description: 'Test event'
                }]
            };

            // Mock successful validation
            controller.validateResults = jest.fn().mockResolvedValue({ isValid: true });

            const result = await controller.agent2Process(initialData);
            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.refinedTime).toBeDefined();
        });

        test('should extract events from form data', () => {
            const formData = {
                getAll: jest.fn(key => {
                    const data = {
                        'eventDate[]': ['2010-01-01', '2015-01-01'],
                        'eventType[]': ['major_life_event', 'career_change'],
                        'eventDescription[]': ['Event 1', 'Event 2']
                    };
                    return data[key] || [];
                })
            };

            const events = controller.extractEvents(formData);
            expect(events).toHaveLength(2);
            expect(events[0]).toEqual({
                date: '2010-01-01',
                type: 'major_life_event',
                description: 'Event 1'
            });
        });

        test('should generate valid random time', () => {
            const time = controller.generateRandomTime();
            expect(time).toMatch(/^([01]\d|2[0-3]):([0-5]\d)$/);
        });

        test('should simulate processing with delay', async () => {
            const startTime = Date.now();
            await controller.simulateProcessing();
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            expect(processingTime).toBeGreaterThanOrEqual(500);
        });
    });
});
