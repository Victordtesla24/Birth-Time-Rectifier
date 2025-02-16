import { useState, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface ChartInteraction {
  scale: number;
  position: Position;
  handleZoom: (event: { deltaY: number }) => void;
  handlePan: (event: { movementX: number; movementY: number }) => void;
  resetTransform: () => void;
}

export const useChartInteraction = (
  minScale = 0.5,
  maxScale = 3,
  initialScale = 1
): ChartInteraction => {
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const handleZoom = useCallback(
    (event: { deltaY: number }) => {
      const delta = -event.deltaY * 0.01;
      setScale((prevScale) => {
        const newScale = prevScale + delta;
        return Math.min(Math.max(newScale, minScale), maxScale);
      });
    },
    [minScale, maxScale]
  );

  const handlePan = useCallback((event: { movementX: number; movementY: number }) => {
    setPosition((prev) => ({
      x: prev.x + event.movementX,
      y: prev.y + event.movementY,
    }));
  }, []);

  const resetTransform = useCallback(() => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  }, [initialScale]);

  return {
    scale,
    position,
    handleZoom,
    handlePan,
    resetTransform,
  };
}; 