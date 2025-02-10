// Mock window and document if they don't exist
if (typeof window === 'undefined') {
    global.window = {
        innerWidth: 800,
        innerHeight: 600,
        dispatchEvent: jest.fn(),
        Event: class Event {
            constructor(type) {
                this.type = type;
            }
        }
    };
}

if (typeof document === 'undefined') {
    const mockElement = {
        setAttribute: jest.fn(),
        appendChild: jest.fn(),
        querySelector: jest.fn(() => mockElement),
        querySelectorAll: jest.fn(() => [mockElement]),
        getAttribute: jest.fn(() => '100%'),
        children: [mockElement],
        textContent: '',
        innerHTML: '',
        createElementNS: jest.fn(() => mockElement),
        getBoundingClientRect: jest.fn(() => ({
            width: 100,
            height: 100,
            top: 0,
            left: 0,
            right: 100,
            bottom: 100
        }))
    };

    global.document = {
        createElementNS: jest.fn(() => mockElement),
        createElement: jest.fn(() => mockElement),
        querySelector: jest.fn(() => mockElement),
        querySelectorAll: jest.fn(() => [mockElement]),
        body: {
            appendChild: jest.fn(),
            removeChild: jest.fn()
        }
    };
}

// Mock WebGL context
if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = function() {
        return {
            drawingBufferWidth: 800,
            drawingBufferHeight: 600,
            viewport: jest.fn(),
            clear: jest.fn(),
            useProgram: jest.fn(),
            bindBuffer: jest.fn(),
            bufferData: jest.fn(),
            getAttribLocation: jest.fn(),
            enableVertexAttribArray: jest.fn(),
            vertexAttribPointer: jest.fn(),
            drawArrays: jest.fn()
        };
    };
}
