import type p5 from 'p5';
import type { Colors, PlanetaryInfo } from '../types/visualization';

export function drawPlanetaryDetails(sketch: p5, info: PlanetaryInfo, colors: Colors): void {
    const { planet, details, position } = info;
    if (!planet) return;
    
    sketch.push();
    
    // Draw background panel
    sketch.fill(colors.background);
    sketch.stroke(colors.text);
    sketch.strokeWeight(1);
    sketch.rect(position.x, position.y, 300, 200, 10);
    
    // Draw planet name
    sketch.fill(colors.text);
    sketch.noStroke();
    sketch.textSize(18);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.text(planet, position.x + 15, position.y + 15);
    
    // Draw separator line
    sketch.stroke(colors.text);
    sketch.line(
        position.x + 15,
        position.y + 40,
        position.x + 285,
        position.y + 40
    );
    
    // Draw details
    sketch.textSize(14);
    let y = position.y + 60;
    Object.entries(details).forEach(([key, value]) => {
        sketch.fill(colors.text);
        sketch.noStroke();
        sketch.text(`${key}:`, position.x + 15, y);
        
        // Format value based on type
        let displayValue = value;
        if (typeof value === 'number') {
            displayValue = value.toFixed(2);
        } else if (typeof value === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
        }
        
        sketch.fill(colors.interactive);
        sketch.text(displayValue, position.x + 120, y);
        y += 25;
    });
    
    // Draw close button
    const closeX = position.x + 270;
    const closeY = position.y + 15;
    sketch.stroke(colors.text);
    sketch.strokeWeight(2);
    sketch.line(closeX, closeY, closeX + 15, closeY + 15);
    sketch.line(closeX + 15, closeY, closeX, closeY + 15);
    
    sketch.pop();
} 