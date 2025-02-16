import { expect } from '@jest/globals';

expect.extend({
  toHaveValidPlanetaryPosition(received: any) {
    const isValid = 
      typeof received.longitude === 'number' &&
      received.longitude >= 0 &&
      received.longitude < 360 &&
      typeof received.latitude === 'number' &&
      received.latitude >= -90 &&
      received.latitude <= 90;

    return {
      message: () =>
        `expected ${JSON.stringify(received)} to have valid planetary position`,
      pass: isValid,
    };
  },

  toBeValidHouseCusp(received: number) {
    const isValid = typeof received === 'number' && received >= 0 && received < 360;

    return {
      message: () =>
        `expected ${received} to be a valid house cusp (0-360 degrees)`,
      pass: isValid,
    };
  },

  toBeValidAspect(received: any) {
    const isValid =
      typeof received.orb === 'number' &&
      received.orb >= 0 &&
      received.orb <= 10 &&
      ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(
        received.type
      );

    return {
      message: () => `expected ${JSON.stringify(received)} to be a valid aspect`,
      pass: isValid,
    };
  },

  toBeValidConfidenceScore(received: number) {
    const isValid = typeof received === 'number' && received >= 0 && received <= 1;

    return {
      message: () =>
        `expected ${received} to be a valid confidence score (0-1)`,
      pass: isValid,
    };
  },

  toBeValidTimeFormat(received: string) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    const isValid = timeRegex.test(received);

    return {
      message: () =>
        `expected ${received} to be a valid time format (HH:MM or HH:MM:SS)`,
      pass: isValid,
    };
  },

  toBeValidDateFormat(received: string) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const isValid = dateRegex.test(received);

    return {
      message: () =>
        `expected ${received} to be a valid date format (YYYY-MM-DD)`,
      pass: isValid,
    };
  },

  toBeValidCoordinate(received: { latitude: number; longitude: number }) {
    const isValid =
      typeof received.latitude === 'number' &&
      received.latitude >= -90 &&
      received.latitude <= 90 &&
      typeof received.longitude === 'number' &&
      received.longitude >= -180 &&
      received.longitude <= 180;

    return {
      message: () =>
        `expected ${JSON.stringify(received)} to be valid coordinates`,
      pass: isValid,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidPlanetaryPosition(): R;
      toBeValidHouseCusp(expected: number): R;
      toBeValidAspect(): R;
      toBeValidConfidenceScore(): R;
      toBeValidTimeFormat(): R;
      toBeValidDateFormat(): R;
      toBeValidCoordinate(): R;
    }
  }
} 