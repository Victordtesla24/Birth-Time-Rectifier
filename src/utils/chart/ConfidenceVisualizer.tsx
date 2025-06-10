import type p5 from 'p5';

interface ConfidenceData {
    overall: number;
    components: Record<string, number>;
    details?: Record<string, any>;
}

interface Colors {
    high: string;
    medium: string;
    low: string;
    background: string;
    highlight: string;
    text: string;
    interactive: string;
}

interface Animation {
    progress: number;
    duration: number;
    startTime: number;
    transitions: Map<string, {
        start: number;
        end: number;
        startTime: number;
    }>;
}

interface Zoom {
    level: number;
    min: number;
    max: number;
    target: number;
    smoothing: number;
}

interface Pan {
    x: number;
    y: number;
    isDragging: boolean;
    lastX: number;
    lastY: number;
    momentum: { x: number; y: number };
}

interface Tooltips {
    active: string | null;
    fadeIn: number;
    content: string;
    position: { x: number; y: number };
    isVisible: boolean;
}

interface PlanetaryInfo {
    isVisible: boolean;
    planet: string | null;
    details: Record<string, any>;
    position: { x: number; y: number };
}

interface A11y {
    announcements: Array<{
        message: string;
        timestamp: number;
        priority: 'high' | 'medium' | 'low';
    }>;
    lastUpdate: number;
    focusedElement: string | null;
    navigationMode: 'chart' | 'details' | 'planets';
    ariaLabels: Map<string, string>;
}

interface ComparisonView {
    charts: Array<{
        id: string;
        data: ConfidenceData;
        position: { x: number; y: number };
        scale: number;
        isActive: boolean;
    }>;
    layout: 'horizontal' | 'vertical' | 'grid';
    spacing: number;
    syncZoom: boolean;
    syncPan: boolean;
}

interface MLInsight {
    type: 'pattern' | 'correlation' | 'anomaly' | 'prediction';
    description: string;
    confidence: number;
    relatedElements: Array<{
        type: 'planet' | 'house' | 'aspect';
        id: string;
        significance: number;
    }>;
    visualCues: Array<{
        type: 'highlight' | 'connection' | 'annotation';
        elements: string[];
        style: {
            color?: string;
            opacity?: number;
            lineStyle?: 'solid' | 'dashed' | 'dotted';
            thickness?: number;
        };
    }>;
}

export class ConfidenceVisualizer {
    private sketch: p5;
    private confidence: ConfidenceData;
    private colors: Colors;
    private animation: Animation;
    private zoom: Zoom;
    private pan: Pan;
    private tooltips: Tooltips;
    private planetaryInfo: PlanetaryInfo;
    private a11y: A11y;
    private interactionEnabled: boolean;
    private lastFrameTime: number;
    private frameRate: number;
    private comparison: ComparisonView;
    private mlInsights: MLInsight[];
    private activeInsight: MLInsight | null;
    private insightAnimations: Map<string, {
        progress: number;
        startTime: number;
    }>;
    
    constructor(sketch: p5) {
        this.sketch = sketch;
        this.confidence = { overall: 0, components: {} };
        this.colors = {
            high: '#4CAF50',
            medium: '#FFC107',
            low: '#F44336',
            background: '#1E1E1E',
            highlight: '#2196F3',
            text: '#FFFFFF',
            interactive: '#64B5F6'
        };
        this.animation = {
            progress: 0,
            duration: 1000,
            startTime: 0,
            transitions: new Map()
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
        this.tooltips = {
            active: null,
            fadeIn: 0,
            content: '',
            position: { x: 0, y: 0 },
            isVisible: false
        };
        this.planetaryInfo = {
            isVisible: false,
            planet: null,
            details: {},
            position: { x: 0, y: 0 }
        };
        this.a11y = {
            announcements: [],
            lastUpdate: 0,
            focusedElement: null,
            navigationMode: 'chart',
            ariaLabels: new Map()
        };
        this.interactionEnabled = true;
        this.lastFrameTime = 0;
        this.frameRate = 0;
        
        this.comparison = {
            charts: [],
            layout: 'horizontal',
            spacing: 20,
            syncZoom: true,
            syncPan: true
        };
        
        this.mlInsights = [];
        this.activeInsight = null;
        this.insightAnimations = new Map();
        
        this.setupEventListeners();
        this.initializeA11yLabels();
    }
    
    private setupEventListeners(): void {
        this.sketch.mouseWheel((event: WheelEvent) => {
            if (!this.interactionEnabled) return;
            
            const zoomSpeed = 0.1;
            const delta = -Math.sign(event.deltaY) * zoomSpeed;
            this.zoom.target = Math.max(this.zoom.min, 
                                      Math.min(this.zoom.max, 
                                             this.zoom.target + delta));
            
            event.preventDefault();
        });
        
        this.sketch.mousePressed(() => {
            if (!this.interactionEnabled) return;
            
            // Check if clicking on a comparison chart
            const clickedChart = this._findClickedChart(
                this.sketch.mouseX,
                this.sketch.mouseY
            );
            
            if (clickedChart) {
                this.comparison.charts.forEach(c => {
                    c.isActive = c.id === clickedChart.id;
                });
                this.announceA11y(`Activated chart ${clickedChart.id}`, 'low');
            }
            
            this.pan.isDragging = true;
            this.pan.lastX = this.sketch.mouseX;
            this.pan.lastY = this.sketch.mouseY;
            this.pan.momentum = { x: 0, y: 0 };
        });
        
        this.sketch.mouseReleased(() => {
            if (!this.interactionEnabled) return;
            
            this.pan.isDragging = false;
            
            // Calculate momentum
            const dx = this.sketch.mouseX - this.pan.lastX;
            const dy = this.sketch.mouseY - this.pan.lastY;
            this.pan.momentum = {
                x: dx * 0.1,
                y: dy * 0.1
            };
        });
    }
    
    private initializeA11yLabels(): void {
        this.a11y.ariaLabels.set('chart', 'Interactive birth chart visualization');
        this.a11y.ariaLabels.set('confidence', 'Overall confidence score');
        this.a11y.ariaLabels.set('components', 'Confidence components breakdown');
        this.a11y.ariaLabels.set('planets', 'Planetary positions and details');
        this.a11y.ariaLabels.set('zoom', 'Zoom controls');
        this.a11y.ariaLabels.set('pan', 'Pan controls');
    }
    
    public setupVisualization(confidence: ConfidenceData): void {
        this.confidence = confidence;
        this.animation.startTime = this.sketch.millis();
        this.resetView();
        
        // Initialize transitions for smooth animations
        Object.entries(confidence.components).forEach(([key, value]) => {
            this.animation.transitions.set(key, {
                start: 0,
                end: value,
                startTime: this.sketch.millis()
            });
        });
        
        this.announceA11y(`Chart initialized with confidence score of ${Math.round(confidence.overall * 100)}%`);
    }
    
    public updateConfidence(newConfidence: ConfidenceData): void {
        // Store previous values for transitions
        Object.entries(newConfidence.components).forEach(([key, value]) => {
            const currentValue = this.confidence.components[key] || 0;
            this.animation.transitions.set(key, {
                start: currentValue,
                end: value,
                startTime: this.sketch.millis()
            });
        });
        
        this.confidence = newConfidence;
        this.animation.startTime = this.sketch.millis();
        
        this.announceA11y(`Confidence updated to ${Math.round(newConfidence.overall * 100)}%`);
    }
    
    private updateAnimations(): void {
        const currentTime = this.sketch.millis();
        const deltaTime = currentTime - this.lastFrameTime;
        this.frameRate = 1000 / deltaTime;
        this.lastFrameTime = currentTime;
        
        // Update zoom
        this.zoom.level += (this.zoom.target - this.zoom.level) * this.zoom.smoothing;
        
        // Update pan with momentum
        if (!this.pan.isDragging) {
            this.pan.x += this.pan.momentum.x;
            this.pan.y += this.pan.momentum.y;
            this.pan.momentum.x *= 0.95;
            this.pan.momentum.y *= 0.95;
        }
        
        // Update transitions
        this.animation.transitions.forEach((transition, key) => {
            const elapsed = currentTime - transition.startTime;
            const progress = Math.min(1, elapsed / this.animation.duration);
            const easedProgress = this.easeInOutCubic(progress);
            
            this.confidence.components[key] = 
                transition.start + (transition.end - transition.start) * easedProgress;
        });
    }
    
    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    public draw(): void {
        this.updateAnimations();
        
        // Draw comparison charts if any
        if (this.comparison.charts.length > 0) {
            this.drawComparisonCharts();
        } else {
            // Draw single chart as before
            this.sketch.push();
            this.sketch.translate(
                this.sketch.width / 2 + this.pan.x,
                this.sketch.height / 2 + this.pan.y
            );
            this.sketch.scale(this.zoom.level);
            
            this.drawConfidenceMetrics();
            this.drawPlanetaryDetails();
            this.drawInteractiveElements();
            this.drawAccessibilityFeatures();
            
            this.sketch.pop();
            this.drawOverlays();
        }
        
        // Draw ML insights
        this.drawMLInsights();
    }
    
    private drawConfidenceMetrics(): void {
        // Implementation of confidence metrics visualization
        // ... existing code ...
    }
    
    private drawPlanetaryDetails(): void {
        if (!this.planetaryInfo.isVisible) return;
        
        const p = this.sketch;
        const details = this.planetaryInfo.details;
        
        p.push();
        p.fill(this.colors.background);
        p.stroke(this.colors.interactive);
        p.rect(this.planetaryInfo.position.x, 
               this.planetaryInfo.position.y, 
               200, 150);
               
        p.fill(this.colors.text);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        
        let y = this.planetaryInfo.position.y + 10;
        Object.entries(details).forEach(([key, value]) => {
            p.text(`${key}: ${value}`, 
                   this.planetaryInfo.position.x + 10, y);
            y += 20;
        });
        
        p.pop();
    }
    
    private drawInteractiveElements(): void {
        const p = this.sketch;
        
        // Draw zoom controls
        p.push();
        p.fill(this.colors.interactive);
        p.noStroke();
        
        // Zoom in button
        if (this.isHoveringZoomIn()) {
            p.fill(this.colors.highlight);
        }
        p.rect(-30, -100, 20, 20);
        p.fill(this.colors.text);
        p.text('+', -25, -90);
        
        // Zoom out button
        p.fill(this.colors.interactive);
        if (this.isHoveringZoomOut()) {
            p.fill(this.colors.highlight);
        }
        p.rect(-30, -70, 20, 20);
        p.fill(this.colors.text);
        p.text('-', -25, -60);
        
        p.pop();
    }
    
    private drawOverlays(): void {
        if (this.tooltips.isVisible) {
            this.drawTooltip();
        }
        
        this.drawFrameRate();
    }
    
    private drawTooltip(): void {
        const p = this.sketch;
        
        p.push();
        p.fill(this.colors.background);
        p.stroke(this.colors.interactive);
        p.rect(this.tooltips.position.x, 
               this.tooltips.position.y, 
               150, 30);
               
        p.fill(this.colors.text);
        p.noStroke();
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(12);
        p.text(this.tooltips.content, 
               this.tooltips.position.x + 5, 
               this.tooltips.position.y + 15);
        
        p.pop();
    }
    
    private drawFrameRate(): void {
        if (!this.interactionEnabled) return;
        
        const p = this.sketch;
        
        p.push();
        p.fill(this.colors.text);
        p.noStroke();
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(10);
        p.text(`FPS: ${Math.round(this.frameRate)}`, 10, 10);
        p.pop();
    }
    
    private isHoveringZoomIn(): boolean {
        const mx = this.sketch.mouseX - this.sketch.width / 2 - this.pan.x;
        const my = this.sketch.mouseY - this.sketch.height / 2 - this.pan.y;
        return mx >= -30 && mx <= -10 && my >= -100 && my <= -80;
    }
    
    private isHoveringZoomOut(): boolean {
        const mx = this.sketch.mouseX - this.sketch.width / 2 - this.pan.x;
        const my = this.sketch.mouseY - this.sketch.height / 2 - this.pan.y;
        return mx >= -30 && mx <= -10 && my >= -70 && my <= -50;
    }
    
    public showPlanetaryInfo(planet: string, details: Record<string, any>, x: number, y: number): void {
        this.planetaryInfo = {
            isVisible: true,
            planet,
            details,
            position: { x, y }
        };
        
        this.announceA11y(`Showing details for ${planet}`);
    }
    
    public hidePlanetaryInfo(): void {
        this.planetaryInfo.isVisible = false;
    }
    
    public showTooltip(content: string, x: number, y: number): void {
        this.tooltips = {
            active: content,
            fadeIn: 0,
            content,
            position: { x, y },
            isVisible: true
        };
    }
    
    public hideTooltip(): void {
        this.tooltips.isVisible = false;
    }
    
    public setInteractionEnabled(enabled: boolean): void {
        this.interactionEnabled = enabled;
    }
    
    private announceA11y(message: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
        this.a11y.announcements.push({
            message,
            timestamp: Date.now(),
            priority
        });
        
        // Clean up old announcements
        const MAX_AGE = 5000; // 5 seconds
        this.a11y.announcements = this.a11y.announcements.filter(
            a => Date.now() - a.timestamp < MAX_AGE
        );
        
        // Update ARIA live region
        const liveRegion = document.getElementById('chart-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }
    
    public resetView(): void {
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
        
        this.announceA11y('View reset to default', 'low');
    }
    
    private drawAccessibilityFeatures(): void {
        const p = this.sketch;
        
        // Draw focus indicators
        if (this.a11y.focusedElement) {
            p.push();
            p.noFill();
            p.stroke(this.colors.highlight);
            p.strokeWeight(2);
            
            switch (this.a11y.focusedElement) {
                case 'chart':
                    p.rect(-p.width/4, -p.height/4, p.width/2, p.height/2);
                    break;
                case 'zoom':
                    p.rect(-35, -105, 30, 60);
                    break;
                case 'planets':
                    if (this.planetaryInfo.isVisible) {
                        p.rect(
                            this.planetaryInfo.position.x - 5,
                            this.planetaryInfo.position.y - 5,
                            210,
                            160
                        );
                    }
                    break;
            }
            
            p.pop();
        }
        
        // Update ARIA labels
        const container = document.getElementById('chart-container');
        if (container) {
            container.setAttribute('role', 'application');
            container.setAttribute('aria-label', this.a11y.ariaLabels.get('chart') || '');
            
            // Ensure live region exists
            let liveRegion = document.getElementById('chart-live-region');
            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = 'chart-live-region';
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.style.position = 'absolute';
                liveRegion.style.width = '1px';
                liveRegion.style.height = '1px';
                liveRegion.style.overflow = 'hidden';
                liveRegion.style.clip = 'rect(1px, 1px, 1px, 1px)';
                container.appendChild(liveRegion);
            }
        }
    }
    
    public addComparisonChart(id: string, data: ConfidenceData): void {
        const chart = {
            id,
            data,
            position: { x: 0, y: 0 },
            scale: 1,
            isActive: false
        };
        
        this.comparison.charts.push(chart);
        this._updateChartLayout();
        
        this.announceA11y(`Added comparison chart ${id}`, 'low');
    }
    
    public removeComparisonChart(id: string): void {
        this.comparison.charts = this.comparison.charts.filter(c => c.id !== id);
        this._updateChartLayout();
        
        this.announceA11y(`Removed comparison chart ${id}`, 'low');
    }
    
    public setComparisonLayout(layout: 'horizontal' | 'vertical' | 'grid'): void {
        this.comparison.layout = layout;
        this._updateChartLayout();
        
        this.announceA11y(`Changed comparison layout to ${layout}`, 'low');
    }
    
    public setSyncSettings(syncZoom: boolean, syncPan: boolean): void {
        this.comparison.syncZoom = syncZoom;
        this.comparison.syncPan = syncPan;
        
        this.announceA11y(
            `${syncZoom ? 'Enabled' : 'Disabled'} zoom sync, ` +
            `${syncPan ? 'enabled' : 'disabled'} pan sync`,
            'low'
        );
    }
    
    private _updateChartLayout(): void {
        const { charts, layout, spacing } = this.comparison;
        const totalCharts = charts.length;
        
        if (totalCharts === 0) return;
        
        const containerWidth = this.sketch.width;
        const containerHeight = this.sketch.height;
        
        if (layout === 'horizontal') {
            const chartWidth = (containerWidth - (spacing * (totalCharts + 1))) / totalCharts;
            charts.forEach((chart, index) => {
                chart.position = {
                    x: spacing + (chartWidth + spacing) * index,
                    y: spacing
                };
                chart.scale = chartWidth / containerWidth;
            });
        } else if (layout === 'vertical') {
            const chartHeight = (containerHeight - (spacing * (totalCharts + 1))) / totalCharts;
            charts.forEach((chart, index) => {
                chart.position = {
                    x: spacing,
                    y: spacing + (chartHeight + spacing) * index
                };
                chart.scale = chartHeight / containerHeight;
            });
        } else { // grid
            const cols = Math.ceil(Math.sqrt(totalCharts));
            const rows = Math.ceil(totalCharts / cols);
            const chartWidth = (containerWidth - (spacing * (cols + 1))) / cols;
            const chartHeight = (containerHeight - (spacing * (rows + 1))) / rows;
            
            charts.forEach((chart, index) => {
                const col = index % cols;
                const row = Math.floor(index / cols);
                chart.position = {
                    x: spacing + (chartWidth + spacing) * col,
                    y: spacing + (chartHeight + spacing) * row
                };
                chart.scale = Math.min(chartWidth / containerWidth, chartHeight / containerHeight);
            });
        }
    }
    
    private drawComparisonCharts(): void {
        const { charts, syncZoom, syncPan } = this.comparison;
        
        charts.forEach(chart => {
            this.sketch.push();
            
            // Apply chart-specific transformations
            this.sketch.translate(
                chart.position.x + (syncPan ? this.pan.x : 0),
                chart.position.y + (syncPan ? this.pan.y : 0)
            );
            this.sketch.scale(chart.scale * (syncZoom ? this.zoom.level : 1));
            
            // Set active chart data
            const currentConfidence = this.confidence;
            this.confidence = chart.data;
            
            // Draw chart components
            this.drawConfidenceMetrics();
            this.drawPlanetaryDetails();
            this.drawInteractiveElements();
            this.drawAccessibilityFeatures();
            
            // Restore original data
            this.confidence = currentConfidence;
            
            this.sketch.pop();
            
            // Draw chart border and label
            this.sketch.push();
            this.sketch.stroke(chart.isActive ? this.colors.highlight : this.colors.interactive);
            this.sketch.noFill();
            this.sketch.rect(
                chart.position.x - 2,
                chart.position.y - 2,
                this.sketch.width * chart.scale + 4,
                this.sketch.height * chart.scale + 4
            );
            
            // Draw chart label
            this.sketch.fill(this.colors.text);
            this.sketch.noStroke();
            this.sketch.textAlign(this.sketch.LEFT, this.sketch.TOP);
            this.sketch.textSize(12);
            this.sketch.text(
                chart.id,
                chart.position.x,
                chart.position.y - 20
            );
            
            this.sketch.pop();
        });
        
        // Draw comparison overlays
        this.drawComparisonOverlays();
    }
    
    private drawComparisonOverlays(): void {
        // Draw sync status indicators
        this.sketch.push();
        this.sketch.fill(this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.TOP);
        this.sketch.textSize(10);
        
        const syncText = [
            `Zoom Sync: ${this.comparison.syncZoom ? 'On' : 'Off'}`,
            `Pan Sync: ${this.comparison.syncPan ? 'On' : 'Off'}`
        ].join(' | ');
        
        this.sketch.text(syncText, 10, 10);
        
        this.sketch.pop();
    }
    
    private _findClickedChart(x: number, y: number): typeof this.comparison.charts[0] | null {
        return this.comparison.charts.find(chart => {
            const bounds = {
                left: chart.position.x,
                right: chart.position.x + this.sketch.width * chart.scale,
                top: chart.position.y,
                bottom: chart.position.y + this.sketch.height * chart.scale
            };
            
            return (
                x >= bounds.left && x <= bounds.right &&
                y >= bounds.top && y <= bounds.bottom
            );
        }) || null;
    }
    
    public updateMLInsights(insights: MLInsight[]): void {
        this.mlInsights = insights;
        this.activeInsight = null;
        this.insightAnimations.clear();
        
        // Initialize animations for new insights
        insights.forEach(insight => {
            this.insightAnimations.set(insight.description, {
                progress: 0,
                startTime: this.sketch.millis()
            });
        });
        
        this.announceA11y(`Updated ML insights: ${insights.length} new insights available`, 'medium');
    }
    
    public setActiveInsight(insight: MLInsight | null): void {
        this.activeInsight = insight;
        if (insight) {
            this.announceA11y(`Activated insight: ${insight.description}`, 'high');
        }
    }
    
    private drawMLInsights(): void {
        // Draw insight indicators
        this.mlInsights.forEach(insight => {
            this.drawInsightIndicator(insight);
        });
        
        // Draw active insight details
        if (this.activeInsight) {
            this.drawActiveInsightDetails();
        }
    }
    
    private drawInsightIndicator(insight: MLInsight): void {
        const animation = this.insightAnimations.get(insight.description);
        if (!animation) return;
        
        // Update animation progress
        const elapsed = this.sketch.millis() - animation.startTime;
        animation.progress = Math.min(1, elapsed / 1000); // 1-second animation
        
        // Draw indicator based on insight type
        this.sketch.push();
        
        const isActive = this.activeInsight === insight;
        const alpha = this.easeInOutCubic(animation.progress) * 255;
        
        this.sketch.stroke(this.colors.highlight);
        this.sketch.strokeWeight(isActive ? 2 : 1);
        this.sketch.fill(this.colors.highlight, alpha * 0.3);
        
        // Draw visual cues
        insight.visualCues.forEach(cue => {
            switch (cue.type) {
                case 'highlight':
                    this.drawHighlight(cue);
                    break;
                case 'connection':
                    this.drawConnection(cue);
                    break;
                case 'annotation':
                    this.drawAnnotation(cue);
                    break;
            }
        });
        
        this.sketch.pop();
    }
    
    private drawHighlight(cue: MLInsight['visualCues'][0]): void {
        const style = cue.style;
        this.sketch.push();
        
        if (style.color) {
            this.sketch.stroke(style.color);
        }
        this.sketch.strokeWeight(style.thickness || 2);
        this.sketch.noFill();
        
        // Draw highlight around elements
        cue.elements.forEach(elementId => {
            const bounds = this.getElementBounds(elementId);
            if (bounds) {
                this.sketch.rect(
                    bounds.x - 5,
                    bounds.y - 5,
                    bounds.width + 10,
                    bounds.height + 10,
                    5
                );
            }
        });
        
        this.sketch.pop();
    }
    
    private drawConnection(cue: MLInsight['visualCues'][0]): void {
        const style = cue.style;
        this.sketch.push();
        
        if (style.color) {
            this.sketch.stroke(style.color);
        }
        this.sketch.strokeWeight(style.thickness || 1);
        
        // Set line style
        if (style.lineStyle === 'dashed') {
            this.sketch.drawingContext.setLineDash([5, 5]);
        } else if (style.lineStyle === 'dotted') {
            this.sketch.drawingContext.setLineDash([2, 2]);
        }
        
        // Draw connections between elements
        for (let i = 0; i < cue.elements.length - 1; i++) {
            const start = this.getElementCenter(cue.elements[i]);
            const end = this.getElementCenter(cue.elements[i + 1]);
            
            if (start && end) {
                this.sketch.line(start.x, start.y, end.x, end.y);
            }
        }
        
        this.sketch.pop();
    }
    
    private drawAnnotation(cue: MLInsight['visualCues'][0]): void {
        const style = cue.style;
        this.sketch.push();
        
        this.sketch.fill(style.color || this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.textSize(10);
        
        // Draw annotations near elements
        cue.elements.forEach(elementId => {
            const center = this.getElementCenter(elementId);
            if (center) {
                this.sketch.text(
                    elementId,
                    center.x,
                    center.y + 20
                );
            }
        });
        
        this.sketch.pop();
    }
    
    private drawActiveInsightDetails(): void {
        if (!this.activeInsight) return;
        
        this.sketch.push();
        
        // Draw insight panel
        const panelWidth = 250;
        const panelHeight = 150;
        const padding = 10;
        
        this.sketch.fill(this.colors.background);
        this.sketch.stroke(this.colors.highlight);
        this.sketch.rect(
            this.sketch.width - panelWidth - padding,
            padding,
            panelWidth,
            panelHeight
        );
        
        // Draw insight content
        this.sketch.fill(this.colors.text);
        this.sketch.noStroke();
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.TOP);
        this.sketch.textSize(12);
        
        let y = padding * 2;
        
        // Draw type badge
        this.sketch.fill(this.getInsightTypeColor(this.activeInsight.type));
        this.sketch.rect(
            this.sketch.width - panelWidth,
            y,
            60,
            20,
            5
        );
        
        this.sketch.fill(this.colors.text);
        this.sketch.text(
            this.activeInsight.type.toUpperCase(),
            this.sketch.width - panelWidth + 5,
            y + 5
        );
        
        y += 30;
        
        // Draw description
        this.sketch.text(
            this.activeInsight.description,
            this.sketch.width - panelWidth,
            y,
            panelWidth - padding * 2
        );
        
        y += 40;
        
        // Draw confidence bar
        this.sketch.fill(this.colors.interactive);
        this.sketch.rect(
            this.sketch.width - panelWidth,
            y,
            panelWidth * this.activeInsight.confidence,
            10
        );
        
        this.sketch.text(
            `Confidence: ${Math.round(this.activeInsight.confidence * 100)}%`,
            this.sketch.width - panelWidth,
            y + 20
        );
        
        this.sketch.pop();
    }
    
    private getInsightTypeColor(type: MLInsight['type']): p5.Color {
        switch (type) {
            case 'pattern':
                return this.sketch.color(76, 175, 80);  // #4CAF50
            case 'correlation':
                return this.sketch.color(33, 150, 243); // #2196F3
            case 'anomaly':
                return this.sketch.color(244, 67, 54);  // #F44336
            case 'prediction':
                return this.sketch.color(255, 193, 7);  // #FFC107
            default:
                return this.colors.interactive;
        }
    }
    
    private getElementBounds(elementId: string): { x: number; y: number; width: number; height: number; } | null {
        // Implementation to get element bounds based on ID
        // This would need to be customized based on your chart's structure
        return null;
    }
    
    private getElementCenter(elementId: string): { x: number; y: number; } | null {
        const bounds = this.getElementBounds(elementId);
        if (!bounds) return null;
        
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2
        };
    }
} 