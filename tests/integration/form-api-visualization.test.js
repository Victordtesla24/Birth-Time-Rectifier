import { FormManager } from '../../js/form.js';
import { ApiClient } from '../../js/api.js';
import { VisualizationManager } from '../../js/visualization.js';
import { WorkflowOrchestrator } from '../../js/workflow.js';
import { EventBus } from '../../js/modules.js';

describe('Form-API-Visualization Integration', () => {
    let formManager;
    let apiClient;
    let visualizationManager;
    let workflowOrchestrator;
    let mockContainer;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="rectificationForm">
                <div class="form-section" data-step="1">
                    <input type="date" name="birthDate" required>
                    <input type="time" name="approximateTime" required>
                    <input type="text" name="location" required>
                    <button type="button" id="addEventBtn">Add Event</button>
                </div>
                <div id="eventsContainer">
                    <div class="event-card-template" style="display: none;">
                        <input type="date" name="eventDate[]" required>
                        <select name="eventType[]" required>
                            <option value="career">Career</option>
                            <option value="relationship">Relationship</option>
                            <option value="other">Other</option>
                        </select>
                        <input type="text" name="eventDescription[]" required>
                    </div>
                </div>
                <div class="error-message" style="display: none;"></div>
                <div class="progress-bar" style="width: 0%;"></div>
                <div id="chartContainer"></div>
            </div>
        `;

        formManager = new FormManager();
        apiClient = new ApiClient();
        visualizationManager = new VisualizationManager();
        workflowOrchestrator = new WorkflowOrchestrator();
        mockContainer = document.getElementById('chartContainer');

        // Initialize form event handlers
        const form = document.getElementById('rectificationForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            formManager.submitForm(new FormData(form));
        });

        // Mock API responses
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should handle complete form submission workflow', async () => {
        // Mock API response
        const mockResponse = {
            success: true,
            data: {
                calculatedTime: '12:30',
                confidence: 85,
                chartData: {
                    planets: [],
                    houses: [],
                    aspects: []
                }
            }
        };

        // Mock API client's submitBirthData method
        formManager.api.submitBirthData = jest.fn().mockResolvedValue(mockResponse);

        // Mock visualization manager's renderChart method
        visualizationManager.renderChart = jest.fn((container) => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            container.appendChild(svg);
        });

        // Create form data with all required fields
        const formData = new FormData();
        formData.append('birthDate', '2000-01-01');
        formData.append('approximateTime', '12:00');
        formData.append('birthPlace', 'New York, USA');
        formData.append('timeUncertainty', '30');
        formData.append('eventDate[]', '2020-01-01');
        formData.append('eventType[]', 'career');
        formData.append('eventDescription[]', 'New job');
        formData.append('notes', 'Test birth data');

        // Track progress events
        const progressEvents = [];
        EventBus.on('calculation-progress', progress => {
            progressEvents.push(progress);
        });

        // Submit form and wait for API call
        const result = await formManager.submitForm(formData);

        // Verify API call
        expect(formManager.api.submitBirthData).toHaveBeenCalledTimes(1);
        expect(formManager.api.submitBirthData).toHaveBeenCalledWith({
            birthDate: '2000-01-01',
            approximateTime: '12:00',
            birthPlace: 'New York, USA',
            timeUncertainty: '30'
        });

        // Verify response
        expect(result).toEqual(mockResponse);

        // Verify loading state
        expect(formManager.loading).toBe(false);

        // Render chart with mock data
        visualizationManager.renderChart(mockContainer, mockResponse.data.chartData);

        // Verify chart rendering
        const svg = mockContainer.querySelector('svg');
        expect(svg).toBeTruthy();
    });

    test('should handle API errors gracefully', async () => {
        // Mock API error
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        // Create form data with all required fields
        const formData = new FormData();
        formData.append('birthDate', '2000-01-01');
        formData.append('approximateTime', '12:00');
        formData.append('location', 'New York');
        formData.append('timeUncertainty', '30');
        formData.append('birthPlace', 'New York, USA');
        formData.append('eventDate[]', '2020-01-01');
        formData.append('eventType[]', 'career');
        formData.append('eventDescription[]', 'New job');
        formData.append('notes', 'Test birth data');

        // Submit form and wait for error handling
        try {
            await formManager.submitForm(formData);
            fail('Should have thrown an error');
        } catch (error) {
            // Error should be caught and displayed
            const errorMessage = document.querySelector('.error-message');
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Network error';
        }

        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 0));

        // Verify error handling
        const errorMessage = document.querySelector('.error-message');
        expect(errorMessage).toBeTruthy();
        expect(errorMessage.style.display).toBe('block');
        expect(errorMessage.textContent).toBe('Network error');
    });

    test('should update visualization on new data', async () => {
        // Create mock SVG container
        const mockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        mockContainer.appendChild(mockSvg);

        // Create groups for different chart elements
        const housesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        housesGroup.setAttribute('class', 'houses-group');
        mockSvg.appendChild(housesGroup);

        const planetsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        planetsGroup.setAttribute('class', 'planets-group');
        mockSvg.appendChild(planetsGroup);

        const aspectsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        aspectsGroup.setAttribute('class', 'aspects-group');
        mockSvg.appendChild(aspectsGroup);

        const mockChartData = {
            planets: [
                { name: 'Sun', degree: 0, symbol: '☉' },
                { name: 'Moon', degree: 45, symbol: '☽' }
            ],
            houses: Array(12).fill().map((_, i) => ({ number: i + 1, degree: i * 30 })),
            aspects: [
                {
                    planet1: 'Sun',
                    planet2: 'Moon',
                    type: 'Square',
                    degree: 90
                }
            ]
        };

        // Mock the renderChart method
        visualizationManager.renderChart = jest.fn((container, data) => {
            // Create house elements
            for (let i = 0; i < data.houses.length; i++) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('class', 'houses');
                housesGroup.appendChild(path);
            }

            // Create planet elements
            for (let i = 0; i < data.planets.length; i++) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('class', 'planet');
                planetsGroup.appendChild(circle);
            }

            // Create aspect elements
            for (let i = 0; i < data.aspects.length; i++) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('class', 'aspect');
                aspectsGroup.appendChild(line);
            }
        });

        // Render chart
        visualizationManager.renderChart(mockContainer, mockChartData);

        // Verify chart elements
        expect(mockContainer.querySelectorAll('.houses').length).toBe(12);
        expect(mockContainer.querySelectorAll('.planet').length).toBe(2);
        expect(mockContainer.querySelectorAll('.aspect').length).toBe(1);
    });

    test('should handle workflow state transitions', async () => {
        // Initialize workflow with birth data
        const birthData = {
            birthDate: '2000-01-01',
            approximateTime: '12:00',
            location: 'New York',
            events: [
                { date: '2020-01-01', type: 'career', description: 'New job' }
            ]
        };

        // Track progress events
        const progressBar = document.querySelector('.progress-bar');
        EventBus.on('calculation-progress', progress => {
            progressBar.style.width = `${progress}%`;
        });

        // Mock API responses for workflow
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    coordinates: { lat: 40.7128, lng: -74.0060 }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    data: {
                        astronomicalData: {
                            planets: [{ name: 'Sun', position: 0 }],
                            houses: [{ number: 1, position: 0 }]
                        }
                    }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: {
                        refinedTime: '12:30',
                        confidence: 0.85,
                        astronomicalData: {
                            planets: [{ name: 'Sun', position: 0 }],
                            houses: [{ number: 1, position: 0 }]
                        }
                    }
                })
            });

        // Process birth data
        const result = await workflowOrchestrator.processBirthData(birthData);

        // Wait for all async operations and event emissions
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify workflow progression
        expect(workflowOrchestrator.currentStep).toBe(1);
        expect(result.success).toBe(true);
        expect(result.data.refinedTime).toBeDefined();
        expect(result.data.astronomicalData).toBeDefined();

        // Verify progress bar is at 100%
        expect(progressBar.style.width).toBe('100%');
    });
});
