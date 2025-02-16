import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Configure testing-library
import { configure } from '@testing-library/react';
configure({ testIdAttribute: 'data-testid' });

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

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

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id: number) => clearTimeout(id);

// Mock ResizeObserver
class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
global.ResizeObserver = MockResizeObserver;

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    // Store options if needed
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn().mockReturnValue([]);
}
global.IntersectionObserver = MockIntersectionObserver;

// Mock Material-UI
jest.mock('@mui/material', () => require('./__tests__/__mocks__/mui'));
jest.mock('@mui/icons-material', () => require('./__tests__/__mocks__/mui-icons'));
jest.mock('@mui/lab', () => require('./__tests__/__mocks__/mui-lab'));
jest.mock('@mui/x-date-pickers', () => require('./__tests__/__mocks__/mui-lab'));

// Mock GSAP
jest.mock('gsap', () => require('./__tests__/__mocks__/gsap'));

// Mock D3
jest.mock('d3', () => require('./__tests__/__mocks__/d3'));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
    redirected: false,
    type: 'basic' as ResponseType,
    url: 'http://localhost',
    clone: function() { return Object.assign({}, this) },
  } as Response)
) as jest.Mock;
