import p5 from 'p5';
import { ChartStyleManager } from '../../../../shared/managers/ChartStyleManager';
import { AccessibilityManager } from '../../../../shared/managers/AccessibilityManager';
import { InteractionManager } from '../../../../shared/managers/InteractionManager';

export abstract class BaseRenderer {
    protected sketch: p5;
    protected container: HTMLElement;
    protected styleManager: ChartStyleManager;
    protected accessibilityManager: AccessibilityManager;
    protected interactionManager: InteractionManager;
    
    constructor(container: HTMLElement) {
        this.container = container;
        this.initialize();
    }
    
    protected initialize(): void {
        this.sketch = new p5((p) => {
            p.setup = () => this.setup(p);
            p.draw = () => this.draw(p);
            p.mousePressed = () => this.interactionManager.handleMousePressed(p);
            p.mouseDragged = () => this.interactionManager.handleMouseDragged(p);
            p.mouseReleased = () => this.interactionManager.handleMouseReleased(p);
            p.mouseWheel = (event) => this.interactionManager.handleMouseWheel(event);
        }, this.container);
        
        this.styleManager = new ChartStyleManager(this.sketch);
        this.accessibilityManager = new AccessibilityManager(this.container);
        this.interactionManager = new InteractionManager(this.sketch);
    }
    
    protected setup(p: p5): void {
        const size = Math.min(p.windowWidth * 0.8, p.windowHeight * 0.8);
        p.createCanvas(size, size);
        p.angleMode(p.DEGREES);
        
        this.styleManager.initializeStyles();
        this.accessibilityManager.setupAccessibility();
        this.interactionManager.setupInteractions();
    }
    
    protected abstract draw(p: p5): void;
    
    public resize(): void {
        const size = Math.min(
            this.sketch.windowWidth * 0.8,
            this.sketch.windowHeight * 0.8
        );
        this.sketch.resizeCanvas(size, size);
    }
    
    public dispose(): void {
        if (this.sketch) {
            this.sketch.remove();
        }
    }
} 