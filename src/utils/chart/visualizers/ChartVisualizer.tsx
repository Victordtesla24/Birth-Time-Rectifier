import type p5 from 'p5';
import { Colors, Zoom, Pan, Animation } from '../types/visualization';
import { setupEventListeners } from '../interactions/eventHandlers';
import { drawChartBase } from '../renderers/baseRenderer';
import { updateAnimations, easeInOutCubic } from '../animations/animationUtils';

export class ChartVisualizer {
    protected sketch: p5;
    protected colors: Colors;
    protected animation: Animation;
    protected zoom: Zoom;
    protected pan: Pan;
    protected interactionEnabled: boolean;
    protected lastFrameTime: number;
    protected frameRate: number;

    constructor(sketch: p5) {
        this.sketch = sketch;
        this.colors = {
            high: '#4CAF50',
            medium: '#FFC107',
            low: '#F44336',
            background: '#FFFFFF',
            highlight: '#2196F3',
            text: '#000000',
            interactive: '#3F51B5'
        };
        
        this.zoom = {
            level: 1,
            min: 0.5,
            max: 2,
            target: 1,
            smoothing: 0.1
        };
        
        this.pan = {
            x: 0,
            y: 0,
            isDragging: false,
            lastX: 0,
            lastY: 0,
            momentum: { x: 0, y: 0 }
        };
        
        this.animation = {
            progress: 0,
            duration: 500,
            startTime: 0,
            transitions: new Map()
        };
        
        this.interactionEnabled = true;
        this.lastFrameTime = 0;
        this.frameRate = 0;
        
        this.setupEventListeners();
    }
    
    protected setupEventListeners(): void {
        setupEventListeners(this);
    }
    
    public draw(): void {
        const currentTime = this.sketch.millis();
        this.frameRate = 1000 / (currentTime - this.lastFrameTime);
        this.lastFrameTime = currentTime;
        
        // Update animations
        updateAnimations(this.animation, currentTime);
        
        // Clear background
        this.sketch.background(this.colors.background);
        
        // Apply zoom and pan transformations
        this.sketch.push();
        this.sketch.translate(this.pan.x, this.pan.y);
        this.sketch.scale(this.zoom.level);
        
        // Draw chart base
        drawChartBase(this.sketch, this.colors);
        
        this.sketch.pop();
    }
    
    public setInteractionEnabled(enabled: boolean): void {
        this.interactionEnabled = enabled;
    }
    
    public resetView(): void {
        this.zoom.level = 1;
        this.zoom.target = 1;
        this.pan.x = 0;
        this.pan.y = 0;
        this.pan.momentum = { x: 0, y: 0 };
    }
    
    protected easeInOutCubic(t: number): number {
        return easeInOutCubic(t);
    }
} 