import type p5 from 'p5';
import type { Colors, MLInsight } from '../types/visualization';

export function drawMLInsights(
    sketch: p5,
    insights: MLInsight[],
    activeInsight: MLInsight | null,
    colors: Colors
): void {
    // Draw insight indicators for all insights
    insights.forEach(insight => {
        drawInsightIndicator(sketch, insight, colors, insight === activeInsight);
    });
    
    // Draw detailed view for active insight
    if (activeInsight) {
        drawActiveInsightDetails(sketch, activeInsight, colors);
    }
}

function drawInsightIndicator(sketch: p5, insight: MLInsight, colors: Colors, isActive: boolean): void {
    const position = getInsightPosition(insight);
    
    sketch.push();
    
    // Draw indicator background
    const bgColor = getInsightTypeColor(insight.type, colors);
    sketch.fill(bgColor);
    sketch.stroke(isActive ? colors.highlight : colors.text);
    sketch.strokeWeight(isActive ? 2 : 1);
    sketch.circle(position.x, position.y, 20);
    
    // Draw type icon
    sketch.fill(colors.background);
    sketch.noStroke();
    drawInsightTypeIcon(sketch, insight.type, position.x, position.y);
    
    // Draw confidence indicator
    const confidenceColor = getConfidenceColor(insight.confidence, colors);
    sketch.noFill();
    sketch.stroke(confidenceColor);
    sketch.strokeWeight(2);
    sketch.arc(
        position.x,
        position.y,
        24,
        24,
        -sketch.PI / 2,
        -sketch.PI / 2 + (2 * sketch.PI * insight.confidence)
    );
    
    sketch.pop();
}

function drawActiveInsightDetails(sketch: p5, insight: MLInsight, colors: Colors): void {
    sketch.push();
    
    // Draw details panel
    const panelWidth = 300;
    const panelHeight = 400;
    const panelX = sketch.width - panelWidth - 20;
    const panelY = 20;
    
    sketch.fill(colors.background);
    sketch.stroke(colors.text);
    sketch.strokeWeight(1);
    sketch.rect(panelX, panelY, panelWidth, panelHeight, 10);
    
    // Draw header
    const headerColor = getInsightTypeColor(insight.type, colors);
    sketch.fill(headerColor);
    sketch.noStroke();
    sketch.rect(panelX, panelY, panelWidth, 40, 10, 10, 0, 0);
    
    sketch.fill(colors.background);
    sketch.textSize(16);
    sketch.textAlign(sketch.LEFT, sketch.CENTER);
    sketch.text(formatInsightType(insight.type), panelX + 20, panelY + 20);
    
    // Draw confidence indicator
    const confidenceColor = getConfidenceColor(insight.confidence, colors);
    sketch.fill(confidenceColor);
    sketch.textAlign(sketch.RIGHT, sketch.CENTER);
    sketch.text(
        `${Math.round(insight.confidence * 100)}% confidence`,
        panelX + panelWidth - 20,
        panelY + 20
    );
    
    // Draw description
    sketch.fill(colors.text);
    sketch.textSize(14);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.text(insight.description, panelX + 20, panelY + 60, panelWidth - 40);
    
    // Draw related elements
    const elementsY = panelY + 120;
    sketch.textSize(14);
    sketch.text('Related Elements:', panelX + 20, elementsY);
    
    insight.relatedElements.forEach((element, index) => {
        const y = elementsY + 30 + (index * 25);
        
        // Draw element type indicator
        sketch.fill(getElementTypeColor(element.type, colors));
        sketch.noStroke();
        sketch.circle(panelX + 30, y + 8, 8);
        
        // Draw element details
        sketch.fill(colors.text);
        sketch.text(
            `${element.id} (${Math.round(element.significance * 100)}% significance)`,
            panelX + 45,
            y
        );
    });
    
    // Draw visual cues
    insight.visualCues.forEach(cue => {
        switch (cue.type) {
            case 'highlight':
                drawHighlight(sketch, cue, colors);
                break;
            case 'connection':
                drawConnection(sketch, cue, colors);
                break;
            case 'annotation':
                drawAnnotation(sketch, cue, colors);
                break;
        }
    });
    
    sketch.pop();
}

function getInsightPosition(insight: MLInsight): { x: number; y: number } {
    // Implementation depends on your chart layout
    // This is a placeholder
    return {
        x: 50,
        y: 50
    };
}

function getInsightTypeColor(type: MLInsight['type'], colors: Colors): string {
    switch (type) {
        case 'pattern':
            return colors.high;
        case 'correlation':
            return colors.medium;
        case 'anomaly':
            return colors.low;
        case 'prediction':
            return colors.interactive;
    }
}

function getElementTypeColor(type: 'planet' | 'house' | 'aspect', colors: Colors): string {
    switch (type) {
        case 'planet':
            return colors.high;
        case 'house':
            return colors.medium;
        case 'aspect':
            return colors.interactive;
    }
}

function getConfidenceColor(confidence: number, colors: Colors): string {
    if (confidence >= 0.8) return colors.high;
    if (confidence >= 0.6) return colors.medium;
    return colors.low;
}

function formatInsightType(type: MLInsight['type']): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function drawInsightTypeIcon(sketch: p5, type: MLInsight['type'], x: number, y: number): void {
    sketch.push();
    sketch.translate(x, y);
    
    switch (type) {
        case 'pattern':
            // Draw pattern icon (grid)
            sketch.rect(-4, -4, 3, 3);
            sketch.rect(1, -4, 3, 3);
            sketch.rect(-4, 1, 3, 3);
            sketch.rect(1, 1, 3, 3);
            break;
            
        case 'correlation':
            // Draw correlation icon (diagonal line)
            sketch.line(-4, -4, 4, 4);
            sketch.circle(-4, -4, 2);
            sketch.circle(4, 4, 2);
            break;
            
        case 'anomaly':
            // Draw anomaly icon (exclamation mark)
            sketch.rect(-1, -4, 2, 6);
            sketch.rect(-1, 3, 2, 2);
            break;
            
        case 'prediction':
            // Draw prediction icon (arrow)
            sketch.triangle(0, -4, -4, 4, 4, 4);
            break;
    }
    
    sketch.pop();
}

function drawHighlight(sketch: p5, cue: MLInsight['visualCues'][0], colors: Colors): void {
    // Implementation depends on your chart layout
    // This is a placeholder
    sketch.push();
    sketch.noFill();
    sketch.stroke(cue.style.color || colors.highlight);
    sketch.strokeWeight(cue.style.thickness || 2);
    sketch.rect(100, 100, 100, 100);
    sketch.pop();
}

function drawConnection(sketch: p5, cue: MLInsight['visualCues'][0], colors: Colors): void {
    // Implementation depends on your chart layout
    // This is a placeholder
    sketch.push();
    sketch.stroke(cue.style.color || colors.interactive);
    sketch.strokeWeight(cue.style.thickness || 1);
    sketch.line(100, 100, 200, 200);
    sketch.pop();
}

function drawAnnotation(sketch: p5, cue: MLInsight['visualCues'][0], colors: Colors): void {
    // Implementation depends on your chart layout
    // This is a placeholder
    sketch.push();
    sketch.fill(colors.background);
    sketch.stroke(cue.style.color || colors.text);
    sketch.rect(100, 100, 100, 50);
    sketch.pop();
} 