export const measureRenderTime = async (callback: () => Promise<void> | void): Promise<number> => {
  const start = performance.now();
  await callback();
  return performance.now() - start;
};

export const measureMemoryUsage = async (): Promise<number | null> => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize;
  }
  return null;
};

export const measureFrameRate = (duration: number = 1000): Promise<number> => {
  return new Promise(resolve => {
    let frames = 0;
    let lastTime = performance.now();
    
    const countFrame = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= duration) {
        resolve(frames * (1000 / duration)); // Convert to FPS
      } else {
        requestAnimationFrame(countFrame);
      }
    };
    
    requestAnimationFrame(countFrame);
  });
};

export const measureInteractionTime = async (
  interaction: () => Promise<void> | void
): Promise<number> => {
  const start = performance.now();
  await interaction();
  return performance.now() - start;
};

export const createPerformanceReport = async (
  measurements: Record<string, number>
): Promise<{
  metrics: Record<string, number>;
  summary: string;
  timestamp: string;
}> => {
  return {
    metrics: measurements,
    summary: Object.entries(measurements)
      .map(([key, value]) => `${key}: ${value.toFixed(2)}ms`)
      .join('\n'),
    timestamp: new Date().toISOString()
  };
}; 