import '@testing-library/jest-dom';
import React, { PropsWithChildren, ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { createTheme } from '@mui/material';
import 'whatwg-fetch';
import { configure } from '@testing-library/react';
import { theme } from '@/theme';

// Configure testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Theme setup
const testTheme = createTheme();

// Test wrapper component
const AllTheProviders = ({ children }: PropsWithChildren<{}>) => {
  return (
    <MemoryRouter>
      <ThemeProvider theme={testTheme}>
        {children}
      </ThemeProvider>
    </MemoryRouter>
  );
};

// Custom render method
const customRender = (ui: ReactElement, options = {}) =>
  rtlRender(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Consolidated mock implementations
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
  onError: jest.fn()
};

export const mockEventBus = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn()
};

export const mockAnimationManager = {
  addAnimation: jest.fn(),
  removeAnimation: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  cleanup: jest.fn()
};

// Browser API Mocks
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

global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  
  constructor(private callback: IntersectionObserverCallback) {}
  
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  takeRecords = jest.fn(() => []);
}

global.IntersectionObserver = MockIntersectionObserver;

global.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id: number) => clearTimeout(id);

global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK'
  })
);

// Environment setup
process.env.NODE_ENV = 'test';
process.env.TEST_MODE = 'true'; 