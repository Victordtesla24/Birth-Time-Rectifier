import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom/extend-expect';

// Extend Jest's expect
expect.extend(toHaveNoViolations);

export const checkAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
};

export const getAriaLabel = (element: HTMLElement): string | null => {
  return element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
};

export const getAriaRole = (element: HTMLElement): string | null => {
  return element.getAttribute('role');
};

export const simulateKeyboardNavigation = async (
  elements: HTMLElement[],
  keySequence: string[]
): Promise<void> => {
  for (let i = 0; i < keySequence.length; i++) {
    const event = new KeyboardEvent('keydown', {
      key: keySequence[i],
      bubbles: true
    });
    elements[i % elements.length].dispatchEvent(event);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

export const checkKeyboardFocus = async (
  elements: HTMLElement[]
): Promise<boolean> => {
  let focusOrder = [];
  for (const element of elements) {
    element.focus();
    focusOrder.push(document.activeElement === element);
  }
  return focusOrder.every(focused => focused);
};

export const checkScreenReaderAnnouncements = (
  element: HTMLElement
): { hasLiveRegion: boolean; announcement: string | null } => {
  const hasLiveRegion = element.getAttribute('aria-live') !== null;
  const announcement = element.getAttribute('aria-label') || 
                      element.textContent || 
                      null;
  return { hasLiveRegion, announcement };
};

export const createAccessibilityReport = async (
  container: HTMLElement
): Promise<{
  violations: any[];
  passes: any[];
  timestamp: string;
  summary: string;
}> => {
  const results = await axe(container);
  return {
    violations: results.violations,
    passes: results.passes,
    timestamp: new Date().toISOString(),
    summary: `
      Violations: ${results.violations.length}
      Passes: ${results.passes.length}
      Total: ${results.violations.length + results.passes.length}
    `.trim()
  };
}; 