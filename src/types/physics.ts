/**
 * Physics Types and Interfaces for 3D Gravity & Orbital Mechanics Simulator
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  mass: number; // in kg
  radius: number; // in meters (m)
  color: string;
  textureType: 'earth' | 'moon' | 'mars' | 'jupiter' | 'sun' | 'blackhole' | 'custom' | 'mercury' | 'venus' | 'saturn' | 'uranus' | 'neptune';
  surfaceGravity: number; // m/s^2 (calculated or preset)
  surfaceEscapeVelocity: number; // m/s (calculated or preset)
  meanDensity: number; // kg/m^3
  description: string;
  isBlackHole?: boolean;
  schwarzschildRadius?: number; // meters
  rotationPeriodHours?: number;
  ringRadiusInner?: number;
  ringRadiusOuter?: number;
  // Custom body configurations
  surfaceType?: 'rocky' | 'ocean' | 'desert' | 'gas' | 'ice' | 'lava' | 'star' | 'blackhole';
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
  hasRings?: boolean;
}

export interface MultiBodyPull {
  bodyId: string;
  name: string;
  distance: number;
  accel: Vector3D;
  mag: number;
  forceMag: number;
  potentialEnergy: number;
  percentage: number;
  color: string;
}

export interface MultiBodyItem {
  id: string;
  name: string;
  mass: number;
  position: Vector3D;
  velocity?: Vector3D;
  radius: number;
  color: string;
  isFixed?: boolean;
}

export interface SpacecraftState {
  position: Vector3D; // relative to primary body center in meters
  velocity: Vector3D; // in m/s
  mass: number; // in kg (e.g. 1000 kg)
  history: Vector3D[]; // trajectory trail
}

export interface OrbitalParameters {
  r: number; // distance from center in m
  h: number; // altitude above surface in m
  v: number; // current speed in m/s
  vRadial: number; // radial velocity component in m/s
  vTangential: number; // tangential velocity component in m/s
  g: number; // gravitational acceleration in m/s^2
  F: number; // gravitational force in N
  vCircular: number; // circular orbital velocity at r in m/s
  vEscape: number; // escape velocity at r in m/s
  kineticEnergy: number; // J
  potentialEnergy: number; // J
  totalEnergy: number; // J
  eccentricity: number; // dimensionless
  semiMajorAxis: number; // meters
  periapsis: number; // meters
  apoapsis: number; // meters
  orbitalPeriod: number; // seconds
  trajectoryType: 'fall' | 'suborbital' | 'circular' | 'elliptical' | 'parabolic' | 'hyperbolic';
  isCollided: boolean;
}

export type SimulationMode = 'single' | 'solarsystem' | 'multibody' | 'experiments' | 'learn';

export interface ExperimentStep {
  id: string;
  title: string;
  question: string;
  description: string;
  bodyId: string;
  initialAltitudeKm: number;
  suggestedVelocityKmS?: number;
  taskPrompt: string;
  completed: boolean;
  recordedData?: { label: string; value: string }[];
}

export interface Experiment {
  id: string;
  title: string;
  subtitle: string;
  question: string;
  concept: string;
  setup: {
    bodyId: string;
    altitudeKm: number;
    initialVelocityKmS: number;
    launchAngleDeg: number;
  };
  steps: string[];
  keyTakeaways: string[];
}
