import p5 from 'p5';
import { ConfidenceMetrics } from '../types';

export class ConfidenceVisualizer {
    private sketch: p5;
    private metrics: ConfidenceMetrics;
    private readonly CONFIDENCE_BAR_WIDTH = 10;
    private readonly CONFIDENCE_BAR_HEIGHT = 100;
    private readonly CONFIDENCE_BAR_MARGIN = 5;
    private readonly CONFIDENCE_COLORS = {
        high: '#4CAF50',    // Green
        medium: '#FFC107',  // Amber
        low: '#F44336'      // Red
    };
    
    constructor(sketch: p5) {
        this.sketch = sketch;
    }
    
    public setupVisualization(metrics: ConfidenceMetrics): void {
        this.metrics = metrics;
    }
    
    public updateConfidence(newMetrics: ConfidenceMetrics): void {
        this.metrics = newMetrics;
    }
    
    public drawConfidenceMetrics(p: p5, metrics: ConfidenceMetrics): void {
        const margin = 20;
        const x = -p.width/2 + margin;
        const y = -p.height/2 + margin;
        
        this.drawConfidenceBar(p, x, y, 'Time Accuracy', metrics.timeAccuracy);
        this.drawConfidenceBar(p, x + this.CONFIDENCE_BAR_WIDTH + this.CONFIDENCE_BAR_MARGIN, y, 
                             'Event Correlation', metrics.eventCorrelation);
        this.drawConfidenceBar(p, x + 2 * (this.CONFIDENCE_BAR_WIDTH + this.CONFIDENCE_BAR_MARGIN), y, 
                             'Pattern Strength', metrics.patternStrength);
    }
    
    private drawConfidenceBar(p: p5, x: number, y: number, label: string, value: number): void {
        // Draw background
        p.noStroke();
        p.fill(200);
        p.rect(x, y, this.CONFIDENCE_BAR_WIDTH, this.CONFIDENCE_BAR_HEIGHT);
        
        // Draw confidence level
        const height = this.CONFIDENCE_BAR_HEIGHT * (value / 100);
        p.fill(this.getConfidenceColor(value));
        p.rect(x, y + this.CONFIDENCE_BAR_HEIGHT - height, 
               this.CONFIDENCE_BAR_WIDTH, height);
        
        // Draw label
        p.push();
        p.translate(x + this.CONFIDENCE_BAR_WIDTH/2, y + this.CONFIDENCE_BAR_HEIGHT + 10);
        p.rotate(-Math.PI/2);
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(0);
        p.textSize(10);
        p.text(label, 0, 0);
        p.pop();
        
        // Draw value
        p.textAlign(p.CENTER, p.CENTER);
        p.fill(0);
        p.textSize(10);
        p.text(`${Math.round(value)}%`, x + this.CONFIDENCE_BAR_WIDTH/2, 
               y + this.CONFIDENCE_BAR_HEIGHT/2);
    }
    
    private getConfidenceColor(value: number): string {
        if (value >= 70) {
            return this.CONFIDENCE_COLORS.high;
        } else if (value >= 40) {
            return this.CONFIDENCE_COLORS.medium;
        } else {
            return this.CONFIDENCE_COLORS.low;
        }
    }
    
    public drawConfidenceTooltip(p: p5, x: number, y: number, metrics: ConfidenceMetrics): void {
        const tooltipWidth = 200;
        const tooltipHeight = 120;
        const padding = 10;
        
        // Draw tooltip background
        p.fill(255, 240);
        p.stroke(200);
        p.rect(x, y, tooltipWidth, tooltipHeight, 5);
        
        // Draw tooltip content
        p.noStroke();
        p.fill(0);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        
        let yOffset = y + padding;
        this.drawTooltipRow(p, x + padding, yOffset, 'Time Accuracy:', 
                           `${metrics.timeAccuracy}%`);
        
        yOffset += 25;
        this.drawTooltipRow(p, x + padding, yOffset, 'Event Correlation:', 
                           `${metrics.eventCorrelation}%`);
        
        yOffset += 25;
        this.drawTooltipRow(p, x + padding, yOffset, 'Pattern Strength:', 
                           `${metrics.patternStrength}%`);
        
        yOffset += 25;
        this.drawTooltipRow(p, x + padding, yOffset, 'Overall Confidence:', 
                           `${this.calculateOverallConfidence(metrics)}%`);
    }
    
    private drawTooltipRow(p: p5, x: number, y: number, label: string, value: string): void {
        p.text(label, x, y);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(value, x + 180, y);
    }
    
    private calculateOverallConfidence(metrics: ConfidenceMetrics): number {
        return Math.round(
            (metrics.timeAccuracy + metrics.eventCorrelation + metrics.patternStrength) / 3
        );
    }
} 