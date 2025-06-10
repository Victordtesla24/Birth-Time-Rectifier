import type p5 from 'p5';
import type { ChartVisualizer } from '../visualizers/ChartVisualizer';

export function setupEventListeners(visualizer: ChartVisualizer): void {
    const sketch = (visualizer as any).sketch as p5;
    
    sketch.mouseWheel((event: WheelEvent) => {
        if (!(visualizer as any).interactionEnabled) return;
        
        const zoomSpeed = 0.001;
        const delta = -event.deltaY * zoomSpeed;
        const zoom = (visualizer as any).zoom;
        
        zoom.target = Math.max(zoom.min, Math.min(zoom.max, zoom.level + delta));
    });
    
    sketch.mousePressed((event: MouseEvent) => {
        if (!(visualizer as any).interactionEnabled) return;
        
        const pan = (visualizer as any).pan;
        if (event.button === 0) { // Left click
            pan.isDragging = true;
            pan.lastX = sketch.mouseX;
            pan.lastY = sketch.mouseY;
            pan.momentum = { x: 0, y: 0 };
        }
    });
    
    sketch.mouseReleased(() => {
        if (!(visualizer as any).interactionEnabled) return;
        
        const pan = (visualizer as any).pan;
        pan.isDragging = false;
    });
    
    sketch.mouseMoved(() => {
        if (!(visualizer as any).interactionEnabled) return;
        
        const pan = (visualizer as any).pan;
        if (pan.isDragging) {
            const dx = sketch.mouseX - pan.lastX;
            const dy = sketch.mouseY - pan.lastY;
            
            pan.x += dx;
            pan.y += dy;
            
            pan.momentum = {
                x: dx * 0.8,
                y: dy * 0.8
            };
            
            pan.lastX = sketch.mouseX;
            pan.lastY = sketch.mouseY;
        }
    });
    
    sketch.mouseDragged(() => {
        if (!(visualizer as any).interactionEnabled) return;
        
        const pan = (visualizer as any).pan;
        if (pan.isDragging) {
            const dx = sketch.mouseX - pan.lastX;
            const dy = sketch.mouseY - pan.lastY;
            
            pan.x += dx;
            pan.y += dy;
            
            pan.momentum = {
                x: dx * 0.8,
                y: dy * 0.8
            };
            
            pan.lastX = sketch.mouseX;
            pan.lastY = sketch.mouseY;
        }
    });
    
    // Add keyboard navigation for accessibility
    sketch.keyPressed((event: KeyboardEvent) => {
        if (!(visualizer as any).interactionEnabled) return;
        
        const pan = (visualizer as any).pan;
        const panStep = 10;
        
        switch (event.key) {
            case 'ArrowLeft':
                pan.x += panStep;
                break;
            case 'ArrowRight':
                pan.x -= panStep;
                break;
            case 'ArrowUp':
                pan.y += panStep;
                break;
            case 'ArrowDown':
                pan.y -= panStep;
                break;
            case '+':
            case '=':
                const zoom = (visualizer as any).zoom;
                zoom.target = Math.min(zoom.max, zoom.level + 0.1);
                break;
            case '-':
            case '_':
                const zoomOut = (visualizer as any).zoom;
                zoomOut.target = Math.max(zoomOut.min, zoomOut.level - 0.1);
                break;
            case 'r':
            case 'R':
                visualizer.resetView();
                break;
        }
    });
} 