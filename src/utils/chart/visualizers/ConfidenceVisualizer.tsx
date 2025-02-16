import type p5 from 'p5';
import { ChartVisualizer } from './ChartVisualizer';
import type { ConfidenceData, Tooltips, PlanetaryInfo, A11y, ComparisonView, MLInsight } from '../types/visualization';
import { drawPlanetaryDetails } from '../renderers/planetaryRenderer';
import { drawConfidenceMetrics } from '../renderers/confidenceRenderer';
import { drawAccessibilityFeatures } from '../renderers/accessibilityRenderer';
import { drawMLInsights } from '../renderers/mlRenderer';
import { addTransition, getCurrentValue, isAnimating } from '../animations/animationUtils';

export class ConfidenceVisualizer extends ChartVisualizer {
    private confidence: ConfidenceData;
    private tooltips: Tooltips;
    private planetaryInfo: PlanetaryInfo;
    private a11y: A11y;
    private comparison: ComparisonView;
    private mlInsights: MLInsight[];
    private activeInsight: MLInsight | null;
    private insightAnimations: Map<string, {
        progress: number;
        startTime: number;
    }>;
    
    constructor(sketch: p5) {
        super(sketch);
        
        this.confidence = {
            overall: 0,
            components: {}
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
        
        this.initializeA11yLabels();
    }
    
    private initializeA11yLabels(): void {
        this.a11y.ariaLabels.set('chart', 'Birth chart visualization with confidence metrics');
        this.a11y.ariaLabels.set('zoom-in', 'Zoom in to see more details');
        this.a11y.ariaLabels.set('zoom-out', 'Zoom out to see the full chart');
        this.a11y.ariaLabels.set('reset', 'Reset chart view to default');
        this.a11y.ariaLabels.set('comparison', 'Toggle chart comparison view');
    }
    
    public setupVisualization(confidence: ConfidenceData): void {
        this.confidence = confidence;
        
        // Initialize transitions for smooth updates
        Object.entries(confidence.components).forEach(([key, value]) => {
            addTransition(
                this.animation,
                `confidence-${key}`,
                0,
                value,
                this.sketch.millis()
            );
        });
        
        this.announceA11y('Chart visualization initialized', 'high');
    }
    
    public updateConfidence(newConfidence: ConfidenceData): void {
        // Add transitions for smooth updates
        Object.entries(newConfidence.components).forEach(([key, value]) => {
            const currentValue = getCurrentValue(this.animation, `confidence-${key}`);
            if (currentValue !== null) {
                addTransition(
                    this.animation,
                    `confidence-${key}`,
                    currentValue,
                    value,
                    this.sketch.millis()
                );
            }
        });
        
        this.confidence = newConfidence;
        this.announceA11y('Confidence metrics updated', 'medium');
    }
    
    public draw(): void {
        super.draw();
        
        if (isAnimating(this.animation)) {
            this.sketch.redraw();
        }
        
        this.sketch.push();
        this.sketch.translate(this.pan.x, this.pan.y);
        this.sketch.scale(this.zoom.level);
        
        // Draw main visualization components
        drawConfidenceMetrics(this.sketch, this.confidence, this.colors);
        if (this.planetaryInfo.isVisible) {
            drawPlanetaryDetails(this.sketch, this.planetaryInfo, this.colors);
        }
        
        // Draw comparison charts if active
        if (this.comparison.charts.length > 0) {
            this.drawComparisonCharts();
        }
        
        // Draw ML insights
        if (this.mlInsights.length > 0) {
            drawMLInsights(this.sketch, this.mlInsights, this.activeInsight, this.colors);
        }
        
        // Draw accessibility features
        drawAccessibilityFeatures(this.sketch, this.a11y, this.colors);
        
        this.sketch.pop();
        
        // Draw overlays (tooltips, etc.)
        this.drawOverlays();
    }
    
    private drawOverlays(): void {
        if (this.tooltips.isVisible) {
            this.drawTooltip();
        }
    }
    
    private drawTooltip(): void {
        const { content, position, fadeIn } = this.tooltips;
        
        this.sketch.push();
        this.sketch.fill(this.colors.background);
        this.sketch.stroke(this.colors.text);
        this.sketch.strokeWeight(1);
        this.sketch.rect(position.x, position.y, 200, 100, 5);
        
        this.sketch.fill(this.colors.text);
        this.sketch.noStroke();
        this.sketch.textSize(14);
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.TOP);
        this.sketch.text(content, position.x + 10, position.y + 10, 180, 80);
        this.sketch.pop();
    }
    
    public showPlanetaryInfo(planet: string, details: Record<string, any>, x: number, y: number): void {
        this.planetaryInfo = {
            isVisible: true,
            planet,
            details,
            position: { x, y }
        };
        this.announceA11y(`Showing details for ${planet}`, 'medium');
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
    
    private announceA11y(message: string, priority: 'high' | 'medium' | 'low' = 'medium'): void {
        this.a11y.announcements.push({
            message,
            timestamp: Date.now(),
            priority
        });
        
        // Clean up old announcements
        const maxAge = 5000; // 5 seconds
        this.a11y.announcements = this.a11y.announcements.filter(
            a => Date.now() - a.timestamp < maxAge
        );
    }
    
    public addComparisonChart(id: string, data: ConfidenceData): void {
        this.comparison.charts.push({
            id,
            data,
            position: { x: 0, y: 0 },
            scale: 0.5,
            isActive: false
        });
        this._updateChartLayout();
    }
    
    public removeComparisonChart(id: string): void {
        this.comparison.charts = this.comparison.charts.filter(c => c.id !== id);
        this._updateChartLayout();
    }
    
    private _updateChartLayout(): void {
        const { charts, layout, spacing } = this.comparison;
        const totalCharts = charts.length;
        
        if (totalCharts === 0) return;
        
        const baseWidth = this.sketch.width / 2;
        const baseHeight = this.sketch.height / 2;
        
        switch (layout) {
            case 'horizontal':
                charts.forEach((chart, index) => {
                    chart.position.x = index * (baseWidth + spacing);
                    chart.position.y = 0;
                    chart.scale = 0.5;
                });
                break;
                
            case 'vertical':
                charts.forEach((chart, index) => {
                    chart.position.x = 0;
                    chart.position.y = index * (baseHeight + spacing);
                    chart.scale = 0.5;
                });
                break;
                
            case 'grid':
                const cols = Math.ceil(Math.sqrt(totalCharts));
                const rows = Math.ceil(totalCharts / cols);
                charts.forEach((chart, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    chart.position.x = col * (baseWidth + spacing);
                    chart.position.y = row * (baseHeight + spacing);
                    chart.scale = 0.5;
                });
                break;
        }
    }
    
    public updateMLInsights(insights: MLInsight[]): void {
        this.mlInsights = insights;
        
        // Initialize animations for new insights
        insights.forEach(insight => {
            if (!this.insightAnimations.has(insight.type)) {
                this.insightAnimations.set(insight.type, {
                    progress: 0,
                    startTime: this.sketch.millis()
                });
            }
        });
    }
    
    public setActiveInsight(insight: MLInsight | null): void {
        this.activeInsight = insight;
        if (insight) {
            this.announceA11y(`Activated insight: ${insight.description}`, 'high');
        }
    }
} 