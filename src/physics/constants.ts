/**
 * Astronomical and Physics Constants in SI Units
 */
import { CelestialBody } from '../types/physics';

export const G = 6.67430e-11; // Universal Gravitational Constant m^3 kg^-1 s^-2
export const SPEED_OF_LIGHT = 299792458; // m/s

/**
 * Calculates surface gravity g = GM / R^2
 */
export function calcSurfaceGravity(mass: number, radius: number): number {
  if (radius <= 0) return 0;
  return (G * mass) / (radius * radius);
}

/**
 * Calculates surface escape velocity v_esc = sqrt(2GM / R)
 */
export function calcSurfaceEscapeVelocity(mass: number, radius: number): number {
  if (radius <= 0) return 0;
  return Math.sqrt((2 * G * mass) / radius);
}

/**
 * Calculates mean density rho = M / (4/3 * pi * R^3)
 */
export function calcMeanDensity(mass: number, radius: number): number {
  if (radius <= 0) return 0;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  return mass / volume;
}

/**
 * Calculates Schwarzschild radius r_s = 2GM / c^2
 */
export function calcSchwarzschildRadius(mass: number): number {
  return (2 * G * mass) / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);
}

// Preset Celestial Bodies with exact SI values
export const CELESTIAL_BODIES: Record<string, CelestialBody> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    mass: 5.9722e24, // kg
    radius: 6.371e6, // meters (6,371 km)
    color: '#3b82f6',
    textureType: 'earth',
    surfaceGravity: 9.81, // m/s^2
    surfaceEscapeVelocity: 11186, // m/s (~11.2 km/s)
    meanDensity: 5515, // kg/m^3
    description: 'Our home planet. Standard reference for surface gravity g = 9.81 m/s² and escape velocity 11.2 km/s.',
    rotationPeriodHours: 24,
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    mass: 7.342e22,
    radius: 1.7374e6, // 1,737.4 km
    color: '#94a3b8',
    textureType: 'moon',
    surfaceGravity: 1.62,
    surfaceEscapeVelocity: 2380, // ~2.38 km/s
    meanDensity: 3344,
    description: 'Earth’s natural satellite. Surface gravity is ~1/6th of Earth (1.62 m/s²).',
    rotationPeriodHours: 655.7,
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    mass: 6.4171e23,
    radius: 3.3895e6, // 3,389.5 km
    color: '#ef4444',
    textureType: 'mars',
    surfaceGravity: 3.72,
    surfaceEscapeVelocity: 5030, // ~5.03 km/s
    meanDensity: 3934,
    description: 'The Red Planet. Has about 38% of Earth’s gravity and roughly half Earth’s diameter.',
    rotationPeriodHours: 24.6,
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    mass: 1.8982e27, // 317.8 Earth masses
    radius: 6.9911e7, // 69,911 km
    color: '#f59e0b',
    textureType: 'jupiter',
    surfaceGravity: 24.79,
    surfaceEscapeVelocity: 59500, // ~59.5 km/s
    meanDensity: 1326,
    description: 'The largest planet in our solar system. Enormous gravitational pull (24.79 m/s² at cloud tops).',
    rotationPeriodHours: 9.9,
  },
  sun: {
    id: 'sun',
    name: 'Sun',
    mass: 1.9885e30, // 333,000 Earth masses
    radius: 6.9634e8, // 696,340 km
    color: '#fbbf24',
    textureType: 'sun',
    surfaceGravity: 274.0,
    surfaceEscapeVelocity: 617500, // ~617.5 km/s
    meanDensity: 1408,
    description: 'Yellow dwarf star at the center of the Solar System. 27.9 times Earth’s surface gravity.',
    rotationPeriodHours: 600,
  },
  blackhole: {
    id: 'blackhole',
    name: 'Stellar Black Hole (10 M☉)',
    mass: 1.9885e31, // 10 solar masses
    radius: 29532, // Schwarzschild radius is ~29.5 km
    color: '#6366f1',
    textureType: 'blackhole',
    surfaceGravity: calcSurfaceGravity(1.9885e31, 29532),
    surfaceEscapeVelocity: SPEED_OF_LIGHT, // c at event horizon
    meanDensity: calcMeanDensity(1.9885e31, 29532),
    description: 'A 10-solar-mass collapsed star. Shows Schwarzschild radius rs = 2GM/c². Outside horizon, Newtonian gravity serves as a Class 11 educational model.',
    isBlackHole: true,
    schwarzschildRadius: 29532,
    rotationPeriodHours: 1,
  },
  custom: {
    id: 'custom',
    name: 'Custom Celestial Body',
    mass: 5.9722e24,
    radius: 6.371e6,
    color: '#06b6d4',
    textureType: 'custom',
    surfaceGravity: 9.81,
    surfaceEscapeVelocity: 11186,
    meanDensity: 5515,
    description: 'Adjust mass and radius to observe instant changes in surface gravity and escape velocity.',
    rotationPeriodHours: 24,
  }
};

// Solar System planetary bodies for Solar System mode
export const SOLAR_SYSTEM_BODIES: Array<{
  id: string;
  name: string;
  mass: number;
  radius: number;
  orbitalDistanceM: number; // semi-major axis from Sun
  orbitalPeriodDays: number;
  eccentricity: number;
  color: string;
  textureType: CelestialBody['textureType'];
  ring?: { inner: number; outer: number };
}> = [
  { id: 'mercury', name: 'Mercury', mass: 3.3011e23, radius: 2.4397e6, orbitalDistanceM: 5.791e10, orbitalPeriodDays: 87.97, eccentricity: 0.2056, color: '#a3a3a3', textureType: 'mercury' },
  { id: 'venus', name: 'Venus', mass: 4.8675e24, radius: 6.0518e6, orbitalDistanceM: 1.082e11, orbitalPeriodDays: 224.7, eccentricity: 0.0067, color: '#eab308', textureType: 'venus' },
  { id: 'earth', name: 'Earth', mass: 5.9722e24, radius: 6.371e6, orbitalDistanceM: 1.496e11, orbitalPeriodDays: 365.25, eccentricity: 0.0167, color: '#3b82f6', textureType: 'earth' },
  { id: 'mars', name: 'Mars', mass: 6.4171e23, radius: 3.3895e6, orbitalDistanceM: 2.279e11, orbitalPeriodDays: 686.98, eccentricity: 0.0934, color: '#ef4444', textureType: 'mars' },
  { id: 'jupiter', name: 'Jupiter', mass: 1.8982e27, radius: 6.9911e7, orbitalDistanceM: 7.785e11, orbitalPeriodDays: 4332.6, eccentricity: 0.0484, color: '#f59e0b', textureType: 'jupiter' },
  { id: 'saturn', name: 'Saturn', mass: 5.6834e26, radius: 5.8232e7, orbitalDistanceM: 1.434e12, orbitalPeriodDays: 10759, eccentricity: 0.0542, color: '#fcd34d', textureType: 'saturn', ring: { inner: 1.2, outer: 2.3 } },
  { id: 'uranus', name: 'Uranus', mass: 8.6810e25, radius: 2.5362e7, orbitalDistanceM: 2.871e12, orbitalPeriodDays: 30685, eccentricity: 0.0472, color: '#38bdf8', textureType: 'uranus' },
  { id: 'neptune', name: 'Neptune', mass: 1.02413e26, radius: 2.4622e7, orbitalDistanceM: 4.495e12, orbitalPeriodDays: 60190, eccentricity: 0.0086, color: '#6366f1', textureType: 'neptune' },
];

export { formatSI, formatDistance, formatVelocity } from './engine';
