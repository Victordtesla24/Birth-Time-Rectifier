import type p5 from 'p5';
import type { Colors, A11y } from '../types/visualization';

export function drawAccessibilityFeatures(sketch: p5, a11y: A11y, colors: Colors): void {
    drawAnnouncementPanel(sketch, a11y, colors);
    drawFocusIndicator(sketch, a11y, colors);
    drawNavigationGuide(sketch, a11y, colors);
}

function drawAnnouncementPanel(sketch: p5, a11y: A11y, colors: Colors): void {
    const { announcements } = a11y;
    if (announcements.length === 0) return;
    
    sketch.push();
    
    // Draw panel background
    sketch.fill(colors.background);
    sketch.stroke(colors.text);
    sketch.strokeWeight(1);
    sketch.rect(10, sketch.height - 100, 300, 90, 5);
    
    // Draw announcements
    sketch.textSize(14);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    
    announcements
        .slice(-3) // Show last 3 announcements
        .forEach((announcement, index) => {
            const y = sketch.height - 90 + (index * 25);
            
            // Draw priority indicator
            const indicatorColor = getPriorityColor(announcement.priority, colors);
            sketch.fill(indicatorColor);
            sketch.noStroke();
            sketch.circle(25, y + 10, 8);
            
            // Draw message
            sketch.fill(colors.text);
            sketch.text(announcement.message, 40, y);
        });
    
    sketch.pop();
}

function drawFocusIndicator(sketch: p5, a11y: A11y, colors: Colors): void {
    const { focusedElement } = a11y;
    if (!focusedElement) return;
    
    sketch.push();
    
    // Get element bounds (implementation depends on your element structure)
    const bounds = getElementBounds(focusedElement);
    if (bounds) {
        // Draw focus outline
        sketch.noFill();
        sketch.stroke(colors.highlight);
        sketch.strokeWeight(2);
        sketch.rect(bounds.x, bounds.y, bounds.width, bounds.height, 5);
        
        // Draw focus label
        const label = a11y.ariaLabels.get(focusedElement) || focusedElement;
        sketch.fill(colors.background);
        sketch.stroke(colors.highlight);
        sketch.strokeWeight(1);
        sketch.rect(bounds.x, bounds.y - 25, sketch.textWidth(label) + 20, 20, 5);
        
        sketch.fill(colors.text);
        sketch.noStroke();
        sketch.textSize(12);
        sketch.textAlign(sketch.LEFT, sketch.CENTER);
        sketch.text(label, bounds.x + 10, bounds.y - 15);
    }
    
    sketch.pop();
}

function drawNavigationGuide(sketch: p5, a11y: A11y, colors: Colors): void {
    const { navigationMode } = a11y;
    
    sketch.push();
    
    // Draw navigation mode indicator
    sketch.fill(colors.background);
    sketch.stroke(colors.text);
    sketch.strokeWeight(1);
    sketch.rect(10, 10, 150, 30, 5);
    
    sketch.fill(colors.text);
    sketch.noStroke();
    sketch.textSize(14);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.text(`Mode: ${formatMode(navigationMode)}`, 85, 25);
    
    // Draw keyboard shortcuts
    const shortcuts = getNavigationShortcuts(navigationMode);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.textSize(12);
    
    shortcuts.forEach((shortcut, index) => {
        const y = 50 + (index * 20);
        sketch.text(shortcut, 10, y);
    });
    
    sketch.pop();
}

function getPriorityColor(priority: 'high' | 'medium' | 'low', colors: Colors): string {
    switch (priority) {
        case 'high':
            return colors.high;
        case 'medium':
            return colors.medium;
        case 'low':
            return colors.low;
    }
}

function formatMode(mode: string): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function getNavigationShortcuts(mode: string): string[] {
    switch (mode) {
        case 'chart':
            return [
                'Tab: Next element',
                'Shift+Tab: Previous element',
                'Enter: Select',
                'Space: Toggle details',
                'Arrow keys: Pan chart'
            ];
        case 'details':
            return [
                'Tab: Next detail',
                'Shift+Tab: Previous detail',
                'Esc: Return to chart',
                'Space: Toggle expanded view'
            ];
        case 'planets':
            return [
                'Tab: Next planet',
                'Shift+Tab: Previous planet',
                'Enter: Show details',
                'Esc: Return to chart'
            ];
        default:
            return [];
    }
}

function getElementBounds(elementId: string): { x: number; y: number; width: number; height: number; } | null {
    // Implementation depends on your element structure
    // This is a placeholder
    return {
        x: 100,
        y: 100,
        width: 100,
        height: 100
    };
} 