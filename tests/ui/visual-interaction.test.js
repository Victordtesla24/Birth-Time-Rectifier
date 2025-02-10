import { Visualizer } from '../../js/modules.js';
import { FormManager } from '../../js/form.js';

describe('UI/UX Testing', () => {
    let formManager;
    let visualizer;
    let mockCanvas;

    beforeEach(() => {
        // Setup mock canvas and p5.js environment
        mockCanvas = {
            width: 800,
            height: 600,
            style: {},
            getContext: () => ({
                clearRect: jest.fn(),
                beginPath: jest.fn(),
                arc: jest.fn(),
                stroke: jest.fn(),
                fill: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                closePath: jest.fn()
            })
        };

        // Mock global p5.js functions
        global.createCanvas = jest.fn(() => mockCanvas);
        global.resizeCanvas = jest.fn();
        global.background = jest.fn();
        global.push = jest.fn();
        global.pop = jest.fn();
        global.translate = jest.fn();
        global.rotate = jest.fn();
        global.stroke = jest.fn();
        global.strokeWeight = jest.fn();
        global.noFill = jest.fn();
        global.fill = jest.fn();
        global.circle = jest.fn();
        global.line = jest.fn();
        global.text = jest.fn();
        global.textAlign = jest.fn();
        global.rect = jest.fn();
        global.ellipse = jest.fn();
        global.noStroke = jest.fn();
        global.width = mockCanvas.width;
        global.height = mockCanvas.height;

        // Initialize components
        formManager = new FormManager();
        visualizer = new Visualizer();
        visualizer.width = mockCanvas.width;
        visualizer.height = mockCanvas.height;
        visualizer.loading = false; // Set loading to false to test chart rendering
    });

    describe('Form UI', () => {
        test('should render form elements in correct positions', () => {
            formManager.draw();
            expect(global.rect).toHaveBeenCalledWith(10, 10, 100, 50);
            expect(global.text).toHaveBeenCalledWith('Form', 20, 20);
        });

        test('should show appropriate hover states', () => {
            formManager.setHoverState('submit', true);
            expect(global.fill).toHaveBeenCalledWith('#FF0000');
            
            formManager.setHoverState('submit', false);
            expect(global.fill).toHaveBeenCalledWith('#000000');
        });

        test('should handle calendar interaction', () => {
            formManager.toggleCalendar();
            expect(global.rect).toHaveBeenCalledWith(0, 0, 50, 20);
            expect(global.text).toHaveBeenCalledWith('Calendar', 60, 60);
        });

        test('should handle clock interaction', () => {
            formManager.toggleClock();
            expect(global.circle).toHaveBeenCalledWith(100, 100, 30);
            expect(global.line).toHaveBeenCalledWith(100, 100, 120, 120);
        });

        test('should display loading animation', () => {
            formManager.startLoading();
            expect(global.circle).toHaveBeenCalledWith(150, 150, 40);
            expect(global.rotate).toHaveBeenCalledWith(0.75);
        });

        test('should display error messages properly', () => {
            formManager.showError('birthDate', 'Invalid date');
            expect(global.text).toHaveBeenCalledWith('Error: Invalid date', 0, 0);
        });
    });

    describe('Chart Visualization', () => {
        test('should render chart elements in correct positions', () => {
            visualizer.draw();
            expect(global.circle).toHaveBeenCalled();
            expect(global.line).toHaveBeenCalled();
        });

        test('should handle interactive elements', () => {
            visualizer.handleResize(1000, 800);
            expect(visualizer.width).toBe(1000);
            expect(visualizer.height).toBe(800);
        });

        test('should render analysis panels correctly', () => {
            visualizer.draw();
            expect(global.rect).toHaveBeenCalled();
            expect(global.text).toHaveBeenCalled();
        });

        test('should handle window resizing', () => {
            visualizer.handleResize(1200, 900);
            expect(visualizer.width).toBe(1200);
            expect(visualizer.height).toBe(900);
            expect(visualizer.centerX).toBe(600);
            expect(visualizer.centerY).toBe(450);
        });
    });
});
