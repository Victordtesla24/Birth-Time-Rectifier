import 'jest-canvas-mock';
import '@testing-library/jest-dom';

// Mock window.alert
global.alert = jest.fn();

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: {},
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock DOM Element class
class MockElement {
    constructor() {
        this.children = [];
        this.style = {};
        this.eventListeners = {};
        this.tagName = '';
        this.id = '';
    }

    appendChild(child) {
        if (child) {
            this.children.push(child);
            if (typeof child === 'object') {
                child.parentElement = this;
            }
        }
        return child;
    }

    getAttribute(name) {
        return this[name];
    }

    setAttribute(name, value) {
        this[name] = value;
    }

    getElementsByTagName(tagName) {
        const results = [];
        const tagNameLower = tagName.toLowerCase();
        
        // Check if current element matches
        if (this.tagName.toLowerCase() === tagNameLower) {
            results.push(this);
        }
        
        // Check children recursively
        for (const child of this.children) {
            if (child.tagName && child.tagName.toLowerCase() === tagNameLower) {
                results.push(child);
            }
            if (child.getElementsByTagName) {
                results.push(...child.getElementsByTagName(tagName));
            }
        }
        
        return results;
    }

    addEventListener(type, listener, options = false) {
        if (!this.eventListeners[type]) {
            this.eventListeners[type] = [];
        }
        this.eventListeners[type].push({ listener, options });
    }

    removeEventListener(type, listener, options = false) {
        if (this.eventListeners[type]) {
            this.eventListeners[type] = this.eventListeners[type].filter(
                l => l.listener !== listener
            );
        }
    }

    dispatchEvent(event) {
        if (typeof event === 'object' && !(event instanceof MockEvent)) {
            event = new MockEvent(event.type, event);
        }
        
        const listeners = this.eventListeners[event.type] || [];
        let prevented = false;

        for (const { listener } of listeners) {
            if (event._stopImmediatePropagationFlag) {
                break;
            }
            if (typeof listener === 'function') {
                listener.call(this, event);
            } else if (listener && typeof listener.handleEvent === 'function') {
                listener.handleEvent(event);
            }
        }

        return !event.defaultPrevented;
    }
}

// Mock Event class with proper inheritance
class MockEvent {
    constructor(type, eventInitDict = {}) {
        this.type = type;
        this.defaultPrevented = false;
        this.bubbles = eventInitDict.bubbles || false;
        this.cancelable = eventInitDict.cancelable || false;
        this.composed = eventInitDict.composed || false;
        this.timeStamp = Date.now();
        this.isTrusted = false;
    }

    preventDefault() {
        if (this.cancelable) {
            this.defaultPrevented = true;
        }
    }

    stopPropagation() {
        this._stopPropagationFlag = true;
    }

    stopImmediatePropagation() {
        this._stopImmediatePropagationFlag = true;
        this._stopPropagationFlag = true;
    }
}

// Mock WebGL functionality
class MockWebGLRenderingContext {
  constructor() {
    this.DEPTH_TEST = 'DEPTH_TEST';
    this.BLEND = 'BLEND';
    this.POINTS = 'POINTS';
    this.LINES = 'LINES';
    this.TRIANGLES = 'TRIANGLES';
    this.TEXTURE_2D = 'TEXTURE_2D';
    this.COLOR_BUFFER_BIT = 'COLOR_BUFFER_BIT';
    this.DEPTH_BUFFER_BIT = 'DEPTH_BUFFER_BIT';
    this.ARRAY_BUFFER = 'ARRAY_BUFFER';
    this.ELEMENT_ARRAY_BUFFER = 'ELEMENT_ARRAY_BUFFER';
    this.FLOAT = 'FLOAT';
    this.STATIC_DRAW = 'STATIC_DRAW';
    this.DYNAMIC_DRAW = 'DYNAMIC_DRAW';
    this.VERTEX_SHADER = 'VERTEX_SHADER';
    this.FRAGMENT_SHADER = 'FRAGMENT_SHADER';
    this.COMPILE_STATUS = 'COMPILE_STATUS';
    this.LINK_STATUS = 'LINK_STATUS';
  }

  enable(cap) {}
  disable(cap) {}
  clear(mask) {}
  useProgram(program) {}
  getShaderPrecisionFormat() {
    return { precision: 'mediump' };
  }
  getExtension(name) {
    return null;
  }
  getParameter(pname) {
    return 0;
  }
  createBuffer() {
    return {};
  }
  bindBuffer(target, buffer) {}
  bufferData(target, data, usage) {}
  viewport(x, y, width, height) {}
  createShader(type) {
    return {};
  }
  shaderSource(shader, source) {}
  compileShader(shader) {}
  getShaderParameter(shader, pname) {
    return true;
  }
  getShaderInfoLog(shader) {
    return '';
  }
  createProgram() {
    return {};
  }
  attachShader(program, shader) {}
  linkProgram(program) {}
  getProgramParameter(program, pname) {
    return true;
  }
  getProgramInfoLog(program) {
    return '';
  }
  getUniformLocation() {
    return {};
  }
  getAttribLocation() {
    return 0;
  }
  uniform1f() {}
  uniform2f() {}
  uniform3f() {}
  uniform4f() {}
  uniform1i() {}
  uniformMatrix4fv() {}
  vertexAttribPointer() {}
  enableVertexAttribArray() {}
  drawArrays() {}
  drawElements() {}
}

// Mock 2D Canvas Context
const mock2DContext = {
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn((x, y, w, h) => ({
    data: new Array(w * h * 4)
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  rect: jest.fn(),
  arc: jest.fn()
};

// Mock Canvas class
class MockCanvas extends MockElement {
  constructor() {
    super();
    this.width = 800;
    this.height = 600;
    this.tagName = 'canvas';
  }
  
  getContext(type) {
    if (type === 'webgl' || type === 'experimental-webgl') {
      return new MockWebGLRenderingContext();
    }
    return mock2DContext;
  }

  parent(container) {
    if (typeof container === 'string') {
      const parentElement = document.getElementById(container);
      if (parentElement) {
        parentElement.appendChild(this);
      }
    } else if (container instanceof MockElement || container instanceof Element) {
      container.appendChild(this);
    }
    return this;
  }
}

// Update document.getElementById to store elements
const elements = new Map();
document.getElementById = jest.fn((id) => {
    if (!elements.has(id)) {
        const element = new MockElement();
        element.id = id;
        elements.set(id, element);
    }
    return elements.get(id);
});

document.createElement = jest.fn((tagName) => {
    if (tagName.toLowerCase() === 'canvas') {
        return new MockCanvas();
    }
    return new MockElement();
});

// Add to global
global.document = document;
global.Element = class {};
global.MockCanvas = MockCanvas;
global.MockElement = MockElement;
global.Event = MockEvent;
global.CustomEvent = class CustomEvent extends MockEvent {
    constructor(type, eventInitDict = {}) {
        super(type, eventInitDict);
        this.detail = eventInitDict.detail || null;
    }
};

// Mock p5.js instance methods
global.p5 = class {
  constructor() {
    this.WEBGL = 'webgl';
    this.P2D = 'p2d';
    this.PI = Math.PI;
    this.HALF_PI = Math.PI / 2;
    this.QUARTER_PI = Math.PI / 4;
    this.TWO_PI = Math.PI * 2;
    this.mouseX = 0;
    this.mouseY = 0;
    this.width = 800;
    this.height = 600;
    this.frameCount = 0;
    this._renderer = {
      GL: new MockWebGLRenderingContext(),
      drawingContext: new MockWebGLRenderingContext()
    };
  }
  
  createCanvas(w, h, renderer) {
    this.width = w;
    this.height = h;
    const canvas = new MockCanvas();
    canvas.width = w;
    canvas.height = h;
    if (renderer === this.WEBGL) {
      canvas.getContext = () => new MockWebGLRenderingContext();
    }
    return canvas;
  }
  
  resizeCanvas(w, h) {
    this.width = w;
    this.height = h;
  }
  
  background() {}
  push() {}
  pop() {}
  translate() {}
  rotate() {}
  scale() {}
  fill() {}
  noFill() {}
  stroke() {}
  noStroke() {}
  ellipse() {}
  rect() {}
  triangle() {}
  line() {}
  point() {}
  colorMode() {}
  perspective() {}
  ambientLight() {}
  pointLight() {}
  directionalLight() {}
  specularMaterial() {}
  shininess() {}
  sphere() {}
  rotateX() {}
  rotateY() {}
  rotateZ() {}
  
  color() { return {}; }
  random(min = 0, max = 1) { 
    if (typeof max !== 'undefined') {
      return min + Math.random() * (max - min);
    }
    return Math.random() * min;
  }
  noise() { return Math.random(); }
  map(value, start1, stop1, start2, stop2) {
    return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  }
  createVector(x, y, z) {
    return { x: x || 0, y: y || 0, z: z || 0 };
  }
  smooth() {}
  frameRate() {}
  
  // Add WebGL specific methods
  beginShape() {}
  endShape() {}
  vertex() {}
  texture() {}
  textureMode() {}
  shader() {}
  normalMaterial() {}
  camera() {}
  ortho() {}
  
  // Add event handling
  mousePressed() {}
  mouseReleased() {}
  mouseMoved() {}
  mouseWheel() {}
};

// Mock window properties
Object.defineProperty(window, 'innerWidth', { value: 1024 });
Object.defineProperty(window, 'innerHeight', { value: 768 });

// Mock WebGL context
const mockWebGLContext = {
  enable: jest.fn(),
  disable: jest.fn(),
  clear: jest.fn(),
  viewport: jest.fn(),
  getExtension: jest.fn(() => null),
  createBuffer: jest.fn(() => ({})),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createShader: jest.fn(() => ({})),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(() => ({})),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn()
};

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = function(contextType) {
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return mockWebGLContext;
  }
  return new MockCanvas().getContext('2d');
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Tweakpane
jest.mock('tweakpane', () => ({
  Pane: jest.fn().mockImplementation(() => ({
    addInput: jest.fn(),
    dispose: jest.fn()
  }))
}));

// Mock GSAP
jest.mock('gsap', () => ({
  to: jest.fn(),
  from: jest.fn(),
  timeline: jest.fn()
}));

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Mock FormData
class MockFormData {
    constructor(form) {
        this.data = new Map();
    }

    append(key, value) {
        this.data.set(key, value);
    }

    get(key) {
        return this.data.get(key);
    }

    has(key) {
        return this.data.has(key);
    }
}

// Add to global
global.FormData = MockFormData;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    li: 'li',
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock d3
jest.mock('d3', () => ({
  select: jest.fn(),
  range: jest.fn(),
  scaleLinear: jest.fn(),
  line: jest.fn(),
  arc: jest.fn(),
  pie: jest.fn(),
}));
