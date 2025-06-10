import { renderHook, act } from '@testing-library/react';
import { useChartInteraction } from '@/hooks/useChartInteraction';

describe('useChartInteraction', () => {
  it('handles zoom interactions correctly', () => {
    const { result } = renderHook(() => useChartInteraction());

    act(() => {
      result.current.handleZoom({ deltaY: -100 });
    });

    expect(result.current.scale).toBeGreaterThan(1);
  });

  it('handles pan interactions correctly', () => {
    const { result } = renderHook(() => useChartInteraction());

    act(() => {
      result.current.handlePan({ movementX: 100, movementY: 50 });
    });

    expect(result.current.position.x).toBe(100);
    expect(result.current.position.y).toBe(50);
  });

  it('resets transformations correctly', () => {
    const { result } = renderHook(() => useChartInteraction());

    act(() => {
      result.current.handleZoom({ deltaY: -100 });
      result.current.handlePan({ movementX: 100, movementY: 50 });
      result.current.resetTransform();
    });

    expect(result.current.scale).toBe(1);
    expect(result.current.position).toEqual({ x: 0, y: 0 });
  });
}); 