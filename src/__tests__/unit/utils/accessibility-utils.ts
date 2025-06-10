import { axe, toHaveNoViolations } from 'jest-axe';
import { fireEvent } from '@testing-library/react';

expect.extend(toHaveNoViolations);

export async function checkAccessibility(container: HTMLElement) {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
}

export function getAriaLabel(element: HTMLElement): string | null {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    null
  );
}

export function getAriaRole(element: HTMLElement): string | null {
  return element.getAttribute('role') || null;
}

export function simulateKeyboardNavigation(
  container: HTMLElement,
  sequence: ('Tab' | 'Enter' | 'Space' | 'Escape' | 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight')[]
): void {
  sequence.forEach(key => {
    fireEvent.keyDown(container, { key });
  });
}

export function checkKeyboardFocus(elements: HTMLElement[]): boolean {
  let currentFocus = document.activeElement;
  
  for (const element of elements) {
    if (currentFocus !== element) {
      return false;
    }
    fireEvent.keyDown(element, { key: 'Tab' });
    currentFocus = document.activeElement;
  }
  
  return true;
}

export function checkScreenReaderAnnouncements(element: HTMLElement): {
  ariaLive?: string;
  ariaAtomic?: string;
  ariaRelevant?: string;
} {
  return {
    ariaLive: element.getAttribute('aria-live') || undefined,
    ariaAtomic: element.getAttribute('aria-atomic') || undefined,
    ariaRelevant: element.getAttribute('aria-relevant') || undefined,
  };
}

export function createAccessibilityReport(results: any): string {
  const report = ['Accessibility Test Report:'];
  
  if (results.violations?.length > 0) {
    report.push('\nViolations:');
    results.violations.forEach((violation: any) => {
      report.push(`- ${violation.description} (impact: ${violation.impact})`);
      report.push(`  Help: ${violation.help}`);
      report.push(`  WCAG: ${violation.tags.filter((tag: string) => tag.startsWith('wcag')).join(', ')}`);
    });
  }
  
  if (results.passes?.length > 0) {
    report.push('\nPasses:');
    report.push(`Total passing tests: ${results.passes.length}`);
  }
  
  return report.join('\n');
} 