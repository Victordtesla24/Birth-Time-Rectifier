import { ChartData, Planet, House, Aspect } from '../../types/shared';

export const mockPlanets: Planet[] = [
  {
    id: 'sun',
    name: 'Sun',
    symbol: '☉',
    longitude: 45.5,
    latitude: 0,
    speed: 0.98,
    house: 1
  },
  {
    id: 'moon',
    name: 'Moon',
    symbol: '☽',
    longitude: 120.3,
    latitude: -3.2,
    speed: 12.5,
    house: 4
  },
  {
    id: 'mercury',
    name: 'Mercury',
    symbol: '☿',
    longitude: 50.8,
    latitude: 1.2,
    speed: -0.5,
    house: 1
  }
];

export const mockHouses: House[] = [
  {
    id: 'house1',
    number: 1,
    startDegree: 0,
    endDegree: 30,
    cusp: 15.5,
    sign: 'Aries'
  },
  {
    id: 'house2',
    number: 2,
    startDegree: 30,
    endDegree: 60,
    cusp: 45.8,
    sign: 'Taurus'
  },
  {
    id: 'house3',
    number: 3,
    startDegree: 60,
    endDegree: 90,
    cusp: 75.2,
    sign: 'Gemini'
  }
];

export const mockAspects: Aspect[] = [
  {
    id: 'aspect1',
    planet1: 'sun',
    planet2: 'mercury',
    type: 'conjunction',
    angle: 5.3,
    orb: 5.3,
    strength: 0.9
  },
  {
    id: 'aspect2',
    planet1: 'sun',
    planet2: 'moon',
    type: 'trine',
    angle: 120.8,
    orb: 0.8,
    strength: 0.85
  }
];

export const mockChartData: ChartData = {
  planets: mockPlanets,
  houses: mockHouses,
  aspects: mockAspects,
  ascendant: 15.5,
  midheaven: 285.3,
  confidence: 0.85
}; 