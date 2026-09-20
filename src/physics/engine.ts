/**
 * Physics Engine: Velocity Verlet numerical integrator, orbital state derivation,
 * and live equation substitutions.
 */
import { G } from './constants';
import { Vector3D, OrbitalParameters, CelestialBody } from '../types/physics';

/**
 * Vector 3D basic operations
 */
export function v3Length(v: Vector3D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function v3Distance(a: Vector3D, b: Vector3D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

export function v3Add(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function v3Sub(a: Vector3D, b: Vector3D): Vector3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function v3Scale(v: Vector3D, s: number): Vector3D {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function v3Dot(a: Vector3D, b: Vector3D): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function v3Cross(a: Vector3D, b: Vector3D): Vector3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function v3Normalize(v: Vector3D): Vector3D {
  const len = v3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

/**
 * Gravitational acceleration: a = - (G * M / r^3) * r_vec
 */
export function calcGravitationalAcceleration(
  pos: Vector3D,
  centerPos: Vector3D,
  mass: number
): Vector3D {
  const rVec = v3Sub(pos, centerPos);
  const r = v3Length(rVec);
  if (r <= 1) return { x: 0, y: 0, z: 0 };
  const aMag = (G * mass) / (r * r);
  return v3Scale(rVec, -aMag / r);
}

/**
 * Velocity Verlet Step
 * Integrates position and velocity with high symplectic stability
 */
export function stepVelocityVerlet(
  pos: Vector3D,
  vel: Vector3D,
  mass: number,
  bodyPos: Vector3D,
  dt: number
): { nextPos: Vector3D; nextVel: Vector3D; accel: Vector3D } {
  // Current acceleration
  const aCurrent = calcGravitationalAcceleration(pos, bodyPos, mass);

  // Position update: r(t + dt) = r(t) + v(t)*dt + 0.5*a(t)*dt^2
  const nextPos = {
    x: pos.x + vel.x * dt + 0.5 * aCurrent.x * dt * dt,
    y: pos.y + vel.y * dt + 0.5 * aCurrent.y * dt * dt,
    z: pos.z + vel.z * dt + 0.5 * aCurrent.z * dt * dt,
  };

  // New acceleration: a(t + dt)
  const aNext = calcGravitationalAcceleration(nextPos, bodyPos, mass);

  // Velocity update: v(t + dt) = v(t) + 0.5*(a(t) + a(t+dt))*dt
  const nextVel = {
    x: vel.x + 0.5 * (aCurrent.x + aNext.x) * dt,
    y: vel.y + 0.5 * (aCurrent.y + aNext.y) * dt,
    z: vel.z + 0.5 * (aCurrent.z + aNext.z) * dt,
  };

  return { nextPos, nextVel, accel: aNext };
}

/**
 * Computes all orbital and physics parameters
 */
export function computeOrbitalParameters(
  pos: Vector3D,
  vel: Vector3D,
  body: CelestialBody,
  craftMass: number = 1000
): OrbitalParameters {
  const r = v3Length(pos);
  const v = v3Length(vel);
  const h = Math.max(0, r - body.radius);
  const M = body.mass;
  const mu = G * M;

  // Acceleration & force
  const g = r > 0 ? mu / (r * r) : 0;
  const F = g * craftMass;

  // Circular and escape speeds at r
  const vCircular = r > 0 ? Math.sqrt(mu / r) : 0;
  const vEscape = r > 0 ? Math.sqrt((2 * mu) / r) : 0;

  // Radial and tangential velocity
  const vRadial = r > 0 ? v3Dot(pos, vel) / r : 0;
  const vTangential = Math.sqrt(Math.max(0, v * v - vRadial * vRadial));

  // Energies
  const kineticEnergy = 0.5 * craftMass * v * v;
  const potentialEnergy = r > 0 ? - (mu * craftMass) / r : 0;
  const totalEnergy = kineticEnergy + potentialEnergy;

  // Specific mechanical energy eps = v^2/2 - mu/r
  const eps = r > 0 ? (v * v) / 2 - mu / r : 0;

  // Specific angular momentum h_vec = r x v
  const hVec = v3Cross(pos, vel);
  const hMag = v3Length(hVec);

  // Eccentricity vector e_vec = (v x h_vec)/mu - r_vec/r
  let eccentricity = 0;
  let semiMajorAxis = 0;
  let periapsis = r;
  let apoapsis = r;
  let orbitalPeriod = 0;

  if (r > 0 && mu > 0) {
    const vCrossH = v3Cross(vel, hVec);
    const eVec = {
      x: vCrossH.x / mu - pos.x / r,
      y: vCrossH.y / mu - pos.y / r,
      z: vCrossH.z / mu - pos.z / r,
    };
    eccentricity = v3Length(eVec);

    if (Math.abs(eps) > 1e-9) {
      semiMajorAxis = -mu / (2 * eps);
    }

    if (eccentricity < 1 && semiMajorAxis > 0) {
      periapsis = semiMajorAxis * (1 - eccentricity);
      apoapsis = semiMajorAxis * (1 + eccentricity);
      orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / mu);
    } else {
      // Unbound or parabolic
      periapsis = hMag * hMag > 0 ? (hMag * hMag) / (mu * (1 + eccentricity)) : r;
      apoapsis = Infinity;
    }
  }

  // Trajectory classification
  let trajectoryType: OrbitalParameters['trajectoryType'] = 'elliptical';
  const isCollided = r <= body.radius;

  if (isCollided) {
    trajectoryType = 'fall';
  } else if (v < 0.05 * vCircular) {
    trajectoryType = 'fall';
  } else if (periapsis < body.radius) {
    trajectoryType = 'suborbital';
  } else if (eccentricity < 0.03) {
    trajectoryType = 'circular';
  } else if (eccentricity < 0.99) {
    trajectoryType = 'elliptical';
  } else if (Math.abs(eccentricity - 1) <= 0.05 || (v >= vEscape * 0.99 && v <= vEscape * 1.01)) {
    trajectoryType = 'parabolic';
  } else {
    trajectoryType = 'hyperbolic';
  }

  return {
    r,
    h,
    v,
    vRadial,
    vTangential,
    g,
    F,
    vCircular,
    vEscape,
    kineticEnergy,
    potentialEnergy,
    totalEnergy,
    eccentricity,
    semiMajorAxis,
    periapsis,
    apoapsis,
    orbitalPeriod,
    trajectoryType,
    isCollided,
  };
}

/**
 * Predicts the orbital trajectory curve for 3D visualization.
 * Returns an array of Vector3D points representing the future path.
 */
export function predictOrbitPath(
  startPos: Vector3D,
  startVel: Vector3D,
  body: CelestialBody,
  numPoints: number = 180
): Vector3D[] {
  const points: Vector3D[] = [];
  const mu = G * body.mass;
  const r0 = v3Length(startPos);
  const v0 = v3Length(startVel);
  if (r0 <= body.radius || mu <= 0) return points;

  // Run a high-speed numerical forward prediction for stability across any eccentricity
  const vCirc = Math.sqrt(mu / r0);
  const baseT = 2 * Math.PI * Math.sqrt(Math.pow(r0, 3) / mu);
  const totalPredictTime = v0 >= Math.sqrt((2 * mu) / r0) ? baseT * 0.8 : baseT * 1.2;
  const dt = totalPredictTime / numPoints;

  let currentPos = { ...startPos };
  let currentVel = { ...startVel };
  points.push({ ...currentPos });

  for (let i = 0; i < numPoints; i++) {
    const step = stepVelocityVerlet(currentPos, currentVel, body.mass, { x: 0, y: 0, z: 0 }, dt);
    currentPos = step.nextPos;
    currentVel = step.nextVel;

    const r = v3Length(currentPos);
    points.push({ ...currentPos });

    // Stop if collided with planet or escaped very far
    if (r <= body.radius || r > r0 * 15) {
      break;
    }
  }

  return points;
}

/**
 * Multi-body acceleration calculation: a_net = sum(a_i)
 */
export function calcMultiBodyAccelerations(
  craftPos: Vector3D,
  bodies: Array<{ id: string; name: string; mass: number; position: Vector3D; color?: string }>,
  craftMass: number = 1000
): {
  netAccel: Vector3D;
  netMag: number;
  netForceMag: number;
  netPotentialEnergy: number;
  escapeVelocity: number;
  individualAccels: Array<{
    bodyId: string;
    name: string;
    distance: number;
    accel: Vector3D;
    mag: number;
    forceMag: number;
    potentialEnergy: number;
    percentage: number;
    color: string;
  }>;
} {
  let netAccel: Vector3D = { x: 0, y: 0, z: 0 };
  let netPotentialEnergy = 0;
  let escSum = 0;
  let totalMagSum = 0;

  const rawPulls = bodies.map((b) => {
    const dist = Math.max(1, v3Distance(craftPos, b.position));
    const a = calcGravitationalAcceleration(craftPos, b.position, b.mass);
    const mag = v3Length(a);
    const forceMag = mag * craftMass;
    const pot = dist > 0 ? - (G * b.mass * craftMass) / dist : 0;
    escSum += dist > 0 ? (2 * G * b.mass) / dist : 0;
    totalMagSum += mag;
    netAccel = v3Add(netAccel, a);
    netPotentialEnergy += pot;

    return {
      bodyId: b.id,
      name: b.name,
      distance: dist,
      accel: a,
      mag,
      forceMag,
      potentialEnergy: pot,
      color: b.color || '#38bdf8',
    };
  });

  const netMag = v3Length(netAccel);
  const netForceMag = netMag * craftMass;
  const escapeVelocity = Math.sqrt(Math.max(0, escSum));

  const individualAccels = rawPulls.map((p) => ({
    ...p,
    percentage: totalMagSum > 0 ? (p.mag / totalMagSum) * 100 : 0,
  }));

  return {
    netAccel,
    netMag,
    netForceMag,
    netPotentialEnergy,
    escapeVelocity,
    individualAccels,
  };
}

/**
 * Step Multi-Body Velocity Verlet
 */
export function stepMultiBodyVerlet(
  pos: Vector3D,
  vel: Vector3D,
  bodies: Array<{ id: string; name: string; mass: number; position: Vector3D }>,
  dt: number
): { nextPos: Vector3D; nextVel: Vector3D; netAccel: Vector3D } {
  let aCurrent: Vector3D = { x: 0, y: 0, z: 0 };
  for (const b of bodies) {
    const a = calcGravitationalAcceleration(pos, b.position, b.mass);
    aCurrent = v3Add(aCurrent, a);
  }

  const nextPos: Vector3D = {
    x: pos.x + vel.x * dt + 0.5 * aCurrent.x * dt * dt,
    y: pos.y + vel.y * dt + 0.5 * aCurrent.y * dt * dt,
    z: pos.z + vel.z * dt + 0.5 * aCurrent.z * dt * dt,
  };

  let aNext: Vector3D = { x: 0, y: 0, z: 0 };
  for (const b of bodies) {
    const a = calcGravitationalAcceleration(nextPos, b.position, b.mass);
    aNext = v3Add(aNext, a);
  }

  const nextVel: Vector3D = {
    x: vel.x + 0.5 * (aCurrent.x + aNext.x) * dt,
    y: vel.y + 0.5 * (aCurrent.y + aNext.y) * dt,
    z: vel.z + 0.5 * (aCurrent.z + aNext.z) * dt,
  };

  return { nextPos, nextVel, netAccel: aNext };
}

/**
 * Formats a number to readable scientific or decimal notation
 */
export function formatSI(val: number, decimals: number = 2): string {
  if (!isFinite(val)) return '∞';
  const abs = Math.abs(val);
  if (abs === 0) return '0';
  if (abs >= 1e6 || abs < 1e-3) {
    return val.toExponential(decimals).replace('e+', ' × 10^').replace('e-', ' × 10^-');
  }
  return val.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
}

/**
 * Formats distance (meters to km or Mm or AU)
 */
export function formatDistance(meters: number): string {
  if (meters >= 1.496e11) {
    return `${(meters / 1.496e11).toFixed(2)} AU`;
  }
  if (meters >= 1e7) {
    return `${(meters / 1e6).toFixed(2)} Mm (${(meters / 1e3).toLocaleString(undefined, { maximumFractionDigits: 0 })} km)`;
  }
  if (meters >= 1e3) {
    return `${(meters / 1e3).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
  }
  return `${meters.toFixed(1)} m`;
}

/**
 * Formats velocity (m/s to km/s)
 */
export function formatVelocity(mPerS: number): string {
  if (mPerS >= 1000) {
    return `${(mPerS / 1000).toFixed(2)} km/s`;
  }
  return `${mPerS.toFixed(1)} m/s`;
}
