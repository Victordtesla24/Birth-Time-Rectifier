export interface Planet {
    name: string;
    longitude: number;
    latitude: number;
    speed: number;
    house: number;
    sign: number;
    isRetrograde: boolean;
    strength: number;
    dignity: string;
}

export interface House {
    number: number;
    longitude: number;
    sign: number;
    planets: Planet[];
}

export interface Aspect {
    planet1: string;
    planet2: string;
    type: AspectType;
    angle: number;
    orb: number;
    strength: number;
    description: string;
}

export type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square';

export interface GeoLocation {
    latitude: number;
    longitude: number;
}

export interface ElementalBalance {
    fire: number;
    earth: number;
    air: number;
    water: number;
}

export interface Dignity {
    type: 'exaltation' | 'domicile' | 'detriment' | 'fall' | 'neutral';
    strength: number;
    description: string;
} 