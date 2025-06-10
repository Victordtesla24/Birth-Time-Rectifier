export class AccessibilityManager {
    constructor(container) {
        this.container = container;
        this.ariaLabels = new Map();
        this.ariaDescriptions = new Map();
        this.focusableElements = new Map();
        this.currentFocus = null;
        this.keyboardEnabled = false;
        
        this.setupKeyboardNavigation();
    }
    
    setupAccessibility() {
        // Set up container attributes
        this.container.setAttribute('role', 'application');
        this.container.setAttribute('aria-label', 'Vedic Astrology Chart');
        
        // Create hidden live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('class', 'sr-only');
        this.container.appendChild(this.liveRegion);
        
        // Add keyboard instructions
        this.addKeyboardInstructions();
    }
    
    setupKeyboardNavigation() {
        this.container.addEventListener('keydown', this.handleKeyPress.bind(this));
        this.container.addEventListener('focus', () => {
            this.keyboardEnabled = true;
            this.updateFocusIndicators();
        });
        this.container.addEventListener('blur', () => {
            this.keyboardEnabled = false;
            this.updateFocusIndicators();
        });
    }
    
    addKeyboardInstructions() {
        const instructions = document.createElement('div');
        instructions.setAttribute('class', 'sr-only');
        instructions.textContent = `
            Use arrow keys to navigate between planets and houses.
            Press Enter or Space to get detailed information.
            Press Tab to move between interactive elements.
            Press Escape to exit detailed view.
        `;
        this.container.appendChild(instructions);
    }
    
    registerFocusableElement(id, element, type) {
        this.focusableElements.set(id, {
            element,
            type,
            index: this.focusableElements.size
        });
        
        // Set up element attributes
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', this.getElementRole(type));
        
        // Add to navigation order
        this.updateNavigationOrder();
    }
    
    getElementRole(type) {
        switch (type) {
            case 'planet':
                return 'button';
            case 'house':
                return 'region';
            case 'aspect':
                return 'link';
            default:
                return 'generic';
        }
    }
    
    updateNavigationOrder() {
        const elements = Array.from(this.focusableElements.values());
        elements.sort((a, b) => a.index - b.index);
        
        elements.forEach((element, index) => {
            element.element.setAttribute('data-nav-index', index.toString());
        });
    }
    
    setAriaLabel(id, label) {
        this.ariaLabels.set(id, label);
        const element = this.focusableElements.get(id)?.element;
        if (element) {
            element.setAttribute('aria-label', label);
        }
    }
    
    setAriaDescription(id, description) {
        this.ariaDescriptions.set(id, description);
        const element = this.focusableElements.get(id)?.element;
        if (element) {
            element.setAttribute('aria-description', description);
        }
    }
    
    announce(message) {
        this.liveRegion.textContent = message;
    }
    
    handleKeyPress(event) {
        if (!this.keyboardEnabled) return;
        
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                this.focusNext();
                event.preventDefault();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                this.focusPrevious();
                event.preventDefault();
                break;
            case 'Enter':
            case ' ':
                this.activateCurrentElement();
                event.preventDefault();
                break;
            case 'Escape':
                this.exitDetailedView();
                event.preventDefault();
                break;
        }
    }
    
    focusNext() {
        const elements = Array.from(this.focusableElements.values());
        const currentIndex = this.currentFocus
            ? elements.findIndex(e => e.element === this.currentFocus)
            : -1;
        
        const nextIndex = (currentIndex + 1) % elements.length;
        this.setFocus(elements[nextIndex].element);
    }
    
    focusPrevious() {
        const elements = Array.from(this.focusableElements.values());
        const currentIndex = this.currentFocus
            ? elements.findIndex(e => e.element === this.currentFocus)
            : 0;
        
        const previousIndex = (currentIndex - 1 + elements.length) % elements.length;
        this.setFocus(elements[previousIndex].element);
    }
    
    setFocus(element) {
        if (this.currentFocus) {
            this.currentFocus.classList.remove('keyboard-focus');
        }
        
        this.currentFocus = element;
        element.focus();
        element.classList.add('keyboard-focus');
        
        // Announce element details
        const label = element.getAttribute('aria-label');
        if (label) {
            this.announce(label);
        }
    }
    
    activateCurrentElement() {
        if (this.currentFocus) {
            const id = this.currentFocus.getAttribute('data-element-id');
            const element = this.focusableElements.get(id);
            
            if (element) {
                const description = this.ariaDescriptions.get(id);
                if (description) {
                    this.announce(description);
                }
                
                // Trigger click event for interactive elements
                if (element.type === 'planet' || element.type === 'aspect') {
                    this.currentFocus.click();
                }
            }
        }
    }
    
    exitDetailedView() {
        // Implementation depends on your detailed view logic
        this.announce('Exiting detailed view');
    }
    
    updateFocusIndicators() {
        const elements = this.focusableElements.values();
        for (const element of elements) {
            if (this.keyboardEnabled) {
                element.element.classList.add('keyboard-navigation');
            } else {
                element.element.classList.remove('keyboard-navigation');
            }
        }
    }
    
    drawAccessibilityElements(p) {
        if (!this.keyboardEnabled) return;
        
        // Draw focus indicators
        this.focusableElements.forEach(element => {
            if (element.element === this.currentFocus) {
                this.drawFocusIndicator(p, element);
            }
        });
    }
    
    drawFocusIndicator(p, element) {
        // Draw focus ring around the current element
        p.push();
        p.noFill();
        p.stroke('#00A1FF');
        p.strokeWeight(2);
        
        switch (element.type) {
            case 'planet':
                this.drawPlanetFocus(p, element);
                break;
            case 'house':
                this.drawHouseFocus(p, element);
                break;
            case 'aspect':
                this.drawAspectFocus(p, element);
                break;
        }
        
        p.pop();
    }
    
    drawPlanetFocus(p, element) {
        // Draw focus ring around planet
        const pos = element.element.getBoundingClientRect();
        const radius = 25;
        p.circle(pos.x + pos.width/2, pos.y + pos.height/2, radius * 2);
    }
    
    drawHouseFocus(p, element) {
        // Draw focus outline around house
        const pos = element.element.getBoundingClientRect();
        p.rect(pos.x, pos.y, pos.width, pos.height, 5);
    }
    
    drawAspectFocus(p, element) {
        // Draw focus highlight on aspect line
        const pos = element.element.getBoundingClientRect();
        p.strokeWeight(4);
        p.line(pos.x, pos.y, pos.x + pos.width, pos.y + pos.height);
    }
} 