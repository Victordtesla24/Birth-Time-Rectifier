import type p5 from 'p5';
import type { Colors, ConfidenceData } from '../types/visualization';

export function drawConfidenceMetrics(sketch: p5, confidence: ConfidenceData, colors: Colors): void {
    const { overall, components } = confidence;
    
    sketch.push();
    
    // Draw overall confidence meter
    drawOverallConfidence(sketch, overall, colors);
    
    // Draw component breakdown
    drawComponentBreakdown(sketch, components, colors);
    
    // Draw detailed metrics if available
    if (confidence.details) {
        drawDetailedMetrics(sketch, confidence.details, colors);
    }
    
    sketch.pop();
}

function drawOverallConfidence(sketch: p5, overall: number, colors: Colors): void {
    const centerX = sketch.width / 2;
    const centerY = 100;
    const radius = 80;
    
    // Draw background circle
    sketch.fill(colors.background);
    sketch.stroke(colors.text);
    sketch.strokeWeight(2);
    sketch.circle(centerX, centerY, radius * 2);
    
    // Draw confidence arc
    const startAngle = -sketch.PI / 2;
    const endAngle = startAngle + (2 * sketch.PI * overall);
    
    sketch.noFill();
    sketch.stroke(getConfidenceColor(overall, colors));
    sketch.strokeWeight(8);
    sketch.arc(centerX, centerY, radius * 2, radius * 2, startAngle, endAngle);
    
    // Draw confidence percentage
    sketch.fill(colors.text);
    sketch.noStroke();
    sketch.textSize(32);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.text(`${Math.round(overall * 100)}%`, centerX, centerY);
    
    sketch.textSize(16);
    sketch.text('Overall Confidence', centerX, centerY + 30);
}

function drawComponentBreakdown(sketch: p5, components: Record<string, number>, colors: Colors): void {
    const startY = 200;
    const barHeight = 30;
    const barWidth = sketch.width - 200;
    const spacing = 40;
    
    sketch.textSize(14);
    sketch.textAlign(sketch.RIGHT, sketch.CENTER);
    
    Object.entries(components).forEach(([key, value], index) => {
        const y = startY + (index * spacing);
        
        // Draw label
        sketch.fill(colors.text);
        sketch.noStroke();
        sketch.text(formatComponentName(key), 90, y + barHeight / 2);
        
        // Draw bar background
        sketch.fill(colors.background);
        sketch.stroke(colors.text);
        sketch.strokeWeight(1);
        sketch.rect(100, y, barWidth, barHeight, 5);
        
        // Draw confidence bar
        sketch.fill(getConfidenceColor(value, colors));
        sketch.noStroke();
        sketch.rect(100, y, barWidth * value, barHeight, 5);
        
        // Draw percentage
        sketch.fill(colors.text);
        sketch.textAlign(sketch.LEFT, sketch.CENTER);
        sketch.text(`${Math.round(value * 100)}%`, barWidth + 110, y + barHeight / 2);
    });
}

function drawDetailedMetrics(sketch: p5, details: Record<string, any>, colors: Colors): void {
    const startY = 400;
    const startX = 100;
    const spacing = 25;
    
    sketch.textSize(14);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    
    let y = startY;
    Object.entries(details).forEach(([key, value]) => {
        // Draw metric name
        sketch.fill(colors.text);
        sketch.noStroke();
        sketch.text(formatComponentName(key), startX, y);
        
        // Draw metric value
        let displayValue = value;
        if (typeof value === 'number') {
            displayValue = value.toFixed(2);
        }
        sketch.text(displayValue, startX + 200, y);
        
        y += spacing;
    });
}

function getConfidenceColor(value: number, colors: Colors): string {
    if (value >= 0.8) return colors.high;
    if (value >= 0.6) return colors.medium;
    return colors.low;
}

function formatComponentName(name: string): string {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
} 