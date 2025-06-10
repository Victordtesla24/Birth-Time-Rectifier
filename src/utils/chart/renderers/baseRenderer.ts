import type p5 from 'p5';
import type { Colors } from '../types/visualization';

export function drawChartBase(sketch: p5, colors: Colors): void {
    // Draw chart background
    sketch.fill(colors.background);
    sketch.noStroke();
    sketch.rect(0, 0, sketch.width, sketch.height);
    
    // Draw chart grid
    sketch.stroke(colors.text);
    sketch.strokeWeight(0.5);
    sketch.noFill();
    
    const gridSize = 50;
    for (let x = 0; x < sketch.width; x += gridSize) {
        sketch.line(x, 0, x, sketch.height);
    }
    for (let y = 0; y < sketch.height; y += gridSize) {
        sketch.line(0, y, sketch.width, y);
    }
    
    // Draw chart border
    sketch.strokeWeight(2);
    sketch.rect(0, 0, sketch.width, sketch.height);
    
    // Draw chart title
    sketch.textSize(24);
    sketch.textAlign(sketch.CENTER, sketch.TOP);
    sketch.fill(colors.text);
    sketch.noStroke();
    sketch.text('Birth Chart Analysis', sketch.width / 2, 20);
    
    // Draw chart legend
    drawLegend(sketch, colors);
}

function drawLegend(sketch: p5, colors: Colors): void {
    const legendX = sketch.width - 150;
    const legendY = 50;
    const itemHeight = 25;
    
    sketch.textSize(14);
    sketch.textAlign(sketch.LEFT, sketch.CENTER);
    
    // High confidence
    sketch.fill(colors.high);
    sketch.rect(legendX, legendY, 20, 20);
    sketch.fill(colors.text);
    sketch.text('High Confidence', legendX + 30, legendY + 10);
    
    // Medium confidence
    sketch.fill(colors.medium);
    sketch.rect(legendX, legendY + itemHeight, 20, 20);
    sketch.fill(colors.text);
    sketch.text('Medium Confidence', legendX + 30, legendY + itemHeight + 10);
    
    // Low confidence
    sketch.fill(colors.low);
    sketch.rect(legendX, legendY + itemHeight * 2, 20, 20);
    sketch.fill(colors.text);
    sketch.text('Low Confidence', legendX + 30, legendY + itemHeight * 2 + 10);
    
    // Interactive elements
    sketch.fill(colors.interactive);
    sketch.rect(legendX, legendY + itemHeight * 3, 20, 20);
    sketch.fill(colors.text);
    sketch.text('Interactive', legendX + 30, legendY + itemHeight * 3 + 10);
} 