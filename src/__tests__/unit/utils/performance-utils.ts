import { act } from '@testing-library/react';

export async function measureRenderTime(renderCallback: () => void): Promise<number> {
  const start = performance.now();
  await act(async () => {
    await renderCallback();
  });
  return performance.now() - start;
}

export function measureMemoryUsage(): number | null {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return null;
}

export async function measureFrameRate(duration: number = 1000): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    const start = performance.now();

    function countFrame() {
      frames++;
      if (performance.now() - start < duration) {
        requestAnimationFrame(countFrame);
      } else {
        resolve((frames * 1000) / duration);
      }
    }

    requestAnimationFrame(countFrame);
  });
}

export async function measureInteractionTime(
  interactionCallback: () => void
): Promise<number> {
  const start = performance.now();
  await act(async () => {
    await interactionCallback();
  });
  return performance.now() - start;
}

export function createPerformanceReport(measurements: {
  renderTime?: number;
  memoryUsage?: number | null;
  frameRate?: number;
  interactionTime?: number;
}): string {
  const report = ['Performance Test Report:'];

  if (measurements.renderTime !== undefined) {
    report.push(`Render Time: ${measurements.renderTime.toFixed(2)}ms`);
  }

  if (measurements.memoryUsage !== undefined && measurements.memoryUsage !== null) {
    report.push(`Memory Usage: ${(measurements.memoryUsage / 1048576).toFixed(2)}MB`);
  }

  if (measurements.frameRate !== undefined) {
    report.push(`Frame Rate: ${measurements.frameRate.toFixed(2)}fps`);
  }

  if (measurements.interactionTime !== undefined) {
    report.push(`Interaction Time: ${measurements.interactionTime.toFixed(2)}ms`);
  }

  return report.join('\n');
} 