// File and Style Mocks
export const fileMock = 'test-file-stub';
export const styleMock = {};

// Browser API Mocks
export const browserMock = {
  matchMedia: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
};

// Animation Mocks
export const gsapMock = {
  to: jest.fn(),
  from: jest.fn(),
  fromTo: jest.fn(),
  timeline: jest.fn(() => ({
    to: jest.fn(),
    from: jest.fn(),
    fromTo: jest.fn(),
  })),
};

export const animationManagerMock = {
  addAnimation: jest.fn(),
  removeAnimation: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  cleanup: jest.fn(),
};

// Service Mocks
export const apiClientMock = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

export const eventBusMock = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

export const loggerMock = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Canvas Mocks
export const canvasMock = {
  getContext: jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    drawImage: jest.fn(),
  })),
};

export const p5Mock = {
  createCanvas: jest.fn(),
  background: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  rect: jest.fn(),
  ellipse: jest.fn(),
  line: jest.fn(),
}; 