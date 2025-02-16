// GSAP Mocks
export const gsap = {
  to: jest.fn(),
  from: jest.fn(),
  fromTo: jest.fn(),
  set: jest.fn(),
  timeline: jest.fn(() => ({
    to: jest.fn(),
    from: jest.fn(),
    fromTo: jest.fn(),
    add: jest.fn(),
    set: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    progress: jest.fn(),
    kill: jest.fn(),
  })),
  registerPlugin: jest.fn(),
  getProperty: jest.fn(),
  getTweensOf: jest.fn(),
  killTweensOf: jest.fn(),
};

// Animation Manager Mock
export const animationManager = {
  addAnimation: jest.fn(),
  removeAnimation: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  cleanup: jest.fn(),
  getActiveAnimations: jest.fn(() => []),
  hasAnimation: jest.fn(() => false),
  clear: jest.fn(),
};

// Canvas Animation Mocks
export const canvasManager = {
  getContext: jest.fn(() => ({
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    fill: jest.fn(),
    arc: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
  })),
  width: 800,
  height: 600,
  style: {},
  getBoundingClientRect: jest.fn(() => ({
    width: 800,
    height: 600,
    top: 0,
    left: 0,
    right: 800,
    bottom: 600,
  })),
};

// P5.js Mock
export const p5Mock = {
  createCanvas: jest.fn(),
  background: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  rect: jest.fn(),
  ellipse: jest.fn(),
  line: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  frameRate: jest.fn(),
  noFill: jest.fn(),
  noStroke: jest.fn(),
}; 