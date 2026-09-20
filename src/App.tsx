/**
 * 3D Gravity & Orbital Mechanics Simulator
 * Interactive space physics laboratory for Class 11 students.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CelestialBody, Vector3D, OrbitalParameters, SimulationMode } from './types/physics';
import { CELESTIAL_BODIES, G, calcSurfaceGravity, calcSurfaceEscapeVelocity, calcMeanDensity } from './physics/constants';
import {
  computeOrbitalParameters,
  stepVelocityVerlet,
  predictOrbitPath,
  calcMultiBodyAccelerations,
  v3Length,
} from './physics/engine';
import { SpaceScene } from './components/canvas/SpaceScene';
import { LeftSidebar } from './components/panels/LeftSidebar';
import { RightTelemetry } from './components/panels/RightTelemetry';
import { BottomGraphPanel } from './components/panels/BottomGraphPanel';
import { ExperimentModal } from './components/panels/ExperimentModal';
import { LearnModeModal } from './components/panels/LearnModeModal';
import { MultiBodyControls } from './components/panels/MultiBodyControls';
import { SolarSystemControls } from './components/panels/SolarSystemControls';
import { SOLAR_SYSTEM_BODIES } from './physics/constants';
import { Globe, Activity, Orbit } from 'lucide-react';

export default function App() {
  // Mobile drawers state
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState<boolean>(false);
  const [isMobileRightOpen, setIsMobileRightOpen] = useState<boolean>(false);

  // 1. Central Celestial Body State
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(CELESTIAL_BODIES.earth);

  // 2. Spacecraft Position and Velocity (in SI meters and m/s)
  // Default: Elliptical Keplerian orbit (e = 0.28) in the horizontal plane (moving sideways)
  const defaultAltitude = 600000; // 600 km
  const defaultR0 = CELESTIAL_BODIES.earth.radius + defaultAltitude;
  const defaultEccentricity = 0.28; // Textbook Class 11 elliptical orbit
  const defaultVElliptic = Math.sqrt((G * CELESTIAL_BODIES.earth.mass * (1 + defaultEccentricity)) / defaultR0);

  const [craftPos, setCraftPos] = useState<Vector3D>({ x: defaultR0, y: 0, z: 0 });
  const [craftVel, setCraftVel] = useState<Vector3D>({ x: 0, y: 0, z: defaultVElliptic });
  const [launchAngleDeg, setLaunchAngleDeg] = useState<number>(0);

  // High-performance physics refs to prevent 60Hz effect recreation & WebGL flickering
  const craftPosRef = useRef<Vector3D>({ x: defaultR0, y: 0, z: 0 });
  const craftVelRef = useRef<Vector3D>({ x: 0, y: 0, z: defaultVElliptic });
  const lastTrailRecordTimeRef = useRef<number>(0);
  const lastDataRecordTimeRef = useRef<number>(0);
  const lastPredictedCalcTimeRef = useRef<number>(0);

  // Trajectory History and Time Series
  const [historyTrail, setHistoryTrail] = useState<Vector3D[]>([{ x: defaultR0, y: 0, z: 0 }]);
  const [historyTimeData, setHistoryTimeData] = useState<
    Array<{ time: number; v: number; r: number; K: number; U: number; E: number }>
  >([]);
  const simTimeRef = useRef<number>(0);

  // 3. Simulation Controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeScale, setTimeScale] = useState<number>(10); // 10x time speed by default
  const [visualScale, setVisualScale] = useState<number>(1);
  const [cameraPreset, setCameraPreset] = useState<string>('reset');

  // 4. Display Toggles
  const [showVectors, setShowVectors] = useState({
    velocity: true,
    acceleration: true,
    force: false,
  });
  const [showMeasurements, setShowMeasurements] = useState({
    radius: true,
    distance: true,
    altitude: true,
  });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showPredictedOrbit, setShowPredictedOrbit] = useState<boolean>(true);

  // 5. Modes
  const [mode, setMode] = useState<SimulationMode>('single');
  const [solarScaleMode, setSolarScaleMode] = useState<'real' | 'educational'>('educational');
  const [selectedSolarPlanetId, setSelectedSolarPlanetId] = useState<string>('earth');

  // Multi-body states
  const multiBodies = [
    { id: 'earth', name: 'Earth', mass: 5.9722e24, position: { x: 0, y: 0, z: 0 }, radius: 6.371e6, color: '#3b82f6' },
    { id: 'moon', name: 'Moon', mass: 7.342e22, position: { x: 3.844e8 * 0.15, y: 0, z: 0 }, radius: 1.737e6, color: '#94a3b8' },
  ];

  // Derive Current Orbital Parameters
  const orbitalParams = computeOrbitalParameters(craftPos, craftVel, selectedBody);

  // Predicted Future Trajectory (throttled to avoid CPU spikes and memory pressure)
  const [predictedPath, setPredictedPath] = useState<Vector3D[]>(() =>
    predictOrbitPath({ x: defaultR0, y: 0, z: 0 }, { x: 0, y: 0, z: defaultVElliptic }, selectedBody, 160)
  );

  // Multi-body acceleration breakdown
  const multiBodyResult = calcMultiBodyAccelerations(craftPos, multiBodies);

  // Toggle Vector Visibility
  const handleToggleVector = (type: 'velocity' | 'acceleration' | 'force') => {
    setShowVectors((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Toggle Measurement Line Visibility
  const handleToggleMeasurement = (type: 'radius' | 'distance' | 'altitude') => {
    setShowMeasurements((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Helper to recompute predicted trajectory
  const updatePredictedTrajectory = (pos: Vector3D, vel: Vector3D, body: CelestialBody) => {
    const path = predictOrbitPath(pos, vel, body, 160);
    setPredictedPath(path);
  };

  // Reset spacecraft to Keplerian elliptical orbit at current altitude (moving sideways)
  const handleResetSpacecraft = useCallback(() => {
    const r = selectedBody.radius + defaultAltitude;
    const vElliptic = Math.sqrt((G * selectedBody.mass * (1 + defaultEccentricity)) / r);
    const newPos = { x: r, y: 0, z: 0 };
    const newVel = { x: 0, y: 0, z: vElliptic };
    craftPosRef.current = newPos;
    craftVelRef.current = newVel;
    setCraftPos(newPos);
    setCraftVel(newVel);
    setLaunchAngleDeg(0);
    setHistoryTrail([newPos]);
    setHistoryTimeData([]);
    simTimeRef.current = 0;
    updatePredictedTrajectory(newPos, newVel, selectedBody);
  }, [selectedBody, defaultAltitude]);

  // Handle celestial body selection
  const handleSelectBody = (body: CelestialBody) => {
    setSelectedBody(body);
    const r = body.radius + defaultAltitude;
    const vElliptic = Math.sqrt((G * body.mass * (1 + defaultEccentricity)) / r);
    const newPos = { x: r, y: 0, z: 0 };
    const newVel = { x: 0, y: 0, z: vElliptic };
    craftPosRef.current = newPos;
    craftVelRef.current = newVel;
    setCraftPos(newPos);
    setCraftVel(newVel);
    setLaunchAngleDeg(0);
    setHistoryTrail([newPos]);
    setHistoryTimeData([]);
    simTimeRef.current = 0;
    setCameraPreset('reset');
    updatePredictedTrajectory(newPos, newVel, body);
  };

  // Update Custom Celestial Body
  const handleUpdateCustomBody = (mass: number, radius: number, name: string) => {
    const updated: CelestialBody = {
      id: 'custom',
      name: name || 'Custom Body',
      mass,
      radius,
      color: '#06b6d4',
      textureType: 'custom',
      surfaceGravity: calcSurfaceGravity(mass, radius),
      surfaceEscapeVelocity: calcSurfaceEscapeVelocity(mass, radius),
      meanDensity: calcMeanDensity(mass, radius),
      description: `Custom body with mass ${(mass / 5.9722e24).toFixed(2)} M⊕ and radius ${(radius / 1000).toFixed(0)} km.`,
    };
    handleSelectBody(updated);
  };

  // Load a Solar System planet into Single-Body lab mode as central body
  const handleLoadPlanetIntoSingleMode = (planetId: string) => {
    const planet = SOLAR_SYSTEM_BODIES.find((p) => p.id === planetId);
    if (planet) {
      const celestial: CelestialBody = {
        id: planet.id,
        name: planet.name,
        mass: planet.mass,
        radius: planet.radius,
        color: planet.color,
        textureType: planet.textureType,
        surfaceGravity: calcSurfaceGravity(planet.mass, planet.radius),
        surfaceEscapeVelocity: calcSurfaceEscapeVelocity(planet.mass, planet.radius),
        meanDensity: calcMeanDensity(planet.mass, planet.radius),
        description: `${planet.name} loaded from the Solar System. Mass: ${planet.mass.toExponential(3)} kg, Radius: ${(planet.radius / 1000).toFixed(0)} km.`,
        rotationPeriodHours: 24,
      };
      setSelectedBody(celestial);
      const alt = Math.max(300000, planet.radius * 0.12);
      const r0 = planet.radius + alt;
      const vElliptic = Math.sqrt((G * planet.mass * (1 + defaultEccentricity)) / r0);
      const pos = { x: r0, y: 0, z: 0 };
      const vel = { x: 0, y: 0, z: vElliptic };
      craftPosRef.current = pos;
      craftVelRef.current = vel;
      setCraftPos(pos);
      setCraftVel(vel);
      setHistoryTrail([pos]);
      setHistoryTimeData([]);
      updatePredictedTrajectory(pos, vel, celestial);
      setMode('single');
    }
  };

  // Change Spacecraft Altitude (in horizontal plane)
  const handleSetAltitudeKm = (altitudeKm: number) => {
    const newR = selectedBody.radius + altitudeKm * 1000;
    const rH = Math.hypot(craftPosRef.current.x, craftPosRef.current.z) || 1;
    const dirX = craftPosRef.current.x / rH;
    const dirZ = craftPosRef.current.z / rH;
    const newPos = { x: dirX * newR, y: 0, z: dirZ * newR };

    // Reorient velocity vector tangentially in horizontal plane
    const vMag = v3Length(craftVelRef.current) || Math.sqrt((G * selectedBody.mass * 1.28) / newR);
    const tanDir = { x: -dirZ, y: 0, z: dirX };
    const newVel = { x: tanDir.x * vMag, y: 0, z: tanDir.z * vMag };

    craftPosRef.current = newPos;
    craftVelRef.current = newVel;
    setCraftPos(newPos);
    setCraftVel(newVel);
    setHistoryTrail([newPos]);
    updatePredictedTrajectory(newPos, newVel, selectedBody);
  };

  // Change Spacecraft Velocity (in horizontal plane with launch angle)
  const handleSetVelocityKmS = (speedKmS: number) => {
    const speedMS = speedKmS * 1000;
    const rH = Math.hypot(craftPosRef.current.x, craftPosRef.current.z) || 1;

    // Direction calculation in horizontal plane based on launchAngleDeg
    const radDirection = { x: craftPosRef.current.x / rH, y: 0, z: craftPosRef.current.z / rH };
    const tanDirection = { x: -radDirection.z, y: 0, z: radDirection.x };

    const angleRad = (launchAngleDeg * Math.PI) / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    const dirX = tanDirection.x * cosA + radDirection.x * sinA;
    const dirZ = tanDirection.z * cosA + radDirection.z * sinA;

    const newVel = { x: dirX * speedMS, y: 0, z: dirZ * speedMS };
    craftVelRef.current = newVel;
    setCraftVel(newVel);
    updatePredictedTrajectory(craftPosRef.current, newVel, selectedBody);
  };

  // Launch at Keplerian elliptical orbit velocity (e ≈ 0.28, moves sideways)
  const handleLaunchElliptical = () => {
    const rMag = v3Length(craftPosRef.current);
    const vCirc = Math.sqrt((G * selectedBody.mass) / rMag);
    const vElliptic = vCirc * Math.sqrt(1 + defaultEccentricity);
    const rH = Math.hypot(craftPosRef.current.x, craftPosRef.current.z) || 1;
    const tanDir = { x: -craftPosRef.current.z / rH, y: 0, z: craftPosRef.current.x / rH };

    const newVel = { x: tanDir.x * vElliptic, y: 0, z: tanDir.z * vElliptic };
    craftVelRef.current = newVel;
    setCraftVel(newVel);
    setLaunchAngleDeg(0);
    setHistoryTrail([craftPosRef.current]);
    updatePredictedTrajectory(craftPosRef.current, newVel, selectedBody);
  };

  // Launch at exact circular velocity (e ≈ 0, moves sideways)
  const handleLaunchCircular = () => {
    const rMag = v3Length(craftPosRef.current);
    const vCirc = Math.sqrt((G * selectedBody.mass) / rMag);
    const rH = Math.hypot(craftPosRef.current.x, craftPosRef.current.z) || 1;
    const tanDir = { x: -craftPosRef.current.z / rH, y: 0, z: craftPosRef.current.x / rH };

    const newVel = { x: tanDir.x * vCirc, y: 0, z: tanDir.z * vCirc };
    craftVelRef.current = newVel;
    setCraftVel(newVel);
    setLaunchAngleDeg(0);
    setHistoryTrail([craftPosRef.current]);
    updatePredictedTrajectory(craftPosRef.current, newVel, selectedBody);
  };

  // Launch at exact escape velocity (hyperbolic escape, moves sideways)
  const handleLaunchEscape = () => {
    const rMag = v3Length(craftPosRef.current);
    const vEsc = Math.sqrt((2 * G * selectedBody.mass) / rMag);
    const rH = Math.hypot(craftPosRef.current.x, craftPosRef.current.z) || 1;
    const tanDir = { x: -craftPosRef.current.z / rH, y: 0, z: craftPosRef.current.x / rH };

    const newVel = { x: tanDir.x * vEsc * 1.05, y: 0, z: tanDir.z * vEsc * 1.05 };
    craftVelRef.current = newVel;
    setCraftVel(newVel);
    setLaunchAngleDeg(0);
    setHistoryTrail([craftPosRef.current]);
    updatePredictedTrajectory(craftPosRef.current, newVel, selectedBody);
  };

  // Apply one of the 4 Scenarios from Section 9 (all moving sideways in horizontal plane)
  const handleApplyPresetScenario = (scenario: 'fall' | 'circular' | 'elliptical' | 'escape') => {
    const rMag = v3Length(craftPosRef.current);
    const vCirc = Math.sqrt((G * selectedBody.mass) / rMag);
    const vEsc = Math.sqrt((2 * G * selectedBody.mass) / rMag);
    const rH = Math.hypot(craftPosRef.current.x, craftPosRef.current.z) || 1;
    const tanDir = { x: -craftPosRef.current.z / rH, y: 0, z: craftPosRef.current.x / rH };

    let targetSpeed = vCirc * Math.sqrt(1 + defaultEccentricity);
    if (scenario === 'fall') {
      targetSpeed = vCirc * 0.55; // falls inward to surface
    } else if (scenario === 'elliptical') {
      targetSpeed = vCirc * Math.sqrt(1 + 0.35); // standard Keplerian ellipse (e = 0.35)
    } else if (scenario === 'circular') {
      targetSpeed = vCirc; // circular orbit (e = 0)
    } else if (scenario === 'escape') {
      targetSpeed = vEsc * 1.08; // hyperbolic escape
    }

    const newVel = { x: tanDir.x * targetSpeed, y: 0, z: tanDir.z * targetSpeed };
    craftVelRef.current = newVel;
    setCraftVel(newVel);
    setLaunchAngleDeg(0);
    setHistoryTrail([craftPosRef.current]);
    updatePredictedTrajectory(craftPosRef.current, newVel, selectedBody);
  };

  // Single step forward
  const handleStepForward = () => {
    const dt = 1.0; // 1 second
    const step = stepVelocityVerlet(craftPosRef.current, craftVelRef.current, selectedBody.mass, { x: 0, y: 0, z: 0 }, dt);
    craftPosRef.current = step.nextPos;
    craftVelRef.current = step.nextVel;
    setCraftPos(step.nextPos);
    setCraftVel(step.nextVel);
    setHistoryTrail((prev) => [...prev.slice(-300), step.nextPos]);
  };

  // Physics Simulation Loop: Decoupled via refs to guarantee seamless, non-flickering 60fps at 1000x
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const realDt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      // Adaptive symplectic substeps: ensures smooth, energy-conserving trajectory without flicker at 1000x
      const totalSimDt = realDt * timeScale;
      const subSteps = Math.max(8, Math.min(160, Math.ceil(timeScale / 7)));
      const dt = totalSimDt / subSteps;

      let p = craftPosRef.current;
      let v = craftVelRef.current;

      for (let i = 0; i < subSteps; i++) {
        const rCurrent = v3Length(p);
        if (rCurrent <= selectedBody.radius) {
          // Spacecraft has collided with surface
          v = { x: 0, y: 0, z: 0 };
          break;
        }

        const step = stepVelocityVerlet(p, v, selectedBody.mass, { x: 0, y: 0, z: 0 }, dt);
        p = step.nextPos;
        v = step.nextVel;
        simTimeRef.current += dt;
      }

      craftPosRef.current = p;
      craftVelRef.current = v;

      // Update React state for rendering
      setCraftPos(p);
      setCraftVel(v);

      // Throttled trail recording (every ~35ms) to prevent GC stutter and line flickering at 1000x
      if (now - lastTrailRecordTimeRef.current >= 35) {
        lastTrailRecordTimeRef.current = now;
        setHistoryTrail((prev) => {
          const last = prev[prev.length - 1];
          if (!last || Math.hypot(p.x - last.x, p.y - last.y, p.z - last.z) > selectedBody.radius * 0.03) {
            return [...prev.slice(-350), p];
          }
          return prev;
        });
      }

      // Throttled telemetry for bottom time-series (every ~100ms)
      if (now - lastDataRecordTimeRef.current >= 100) {
        lastDataRecordTimeRef.current = now;
        const params = computeOrbitalParameters(p, v, selectedBody);
        setHistoryTimeData((prev) => [
          ...prev.slice(-100),
          {
            time: simTimeRef.current,
            v: params.v,
            r: params.r,
            K: params.kineticEnergy,
            U: params.potentialEnergy,
            E: params.totalEnergy,
          },
        ]);
      }

      // Throttled predicted trajectory refresh (every ~200ms)
      if (now - lastPredictedCalcTimeRef.current >= 200) {
        lastPredictedCalcTimeRef.current = now;
        const path = predictOrbitPath(p, v, selectedBody, 160);
        setPredictedPath(path);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, timeScale, selectedBody]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080b12] text-slate-100 font-sans select-none relative">
      {/* 1. Desktop Left Sidebar */}
      <div className="hidden lg:flex shrink-0 h-full">
        <LeftSidebar
          selectedBody={selectedBody}
          onSelectBody={handleSelectBody}
          onUpdateCustomBody={handleUpdateCustomBody}
          currentMode={mode}
          onSelectMode={(m) => setMode(m)}
          showVectors={showVectors}
          onToggleVector={handleToggleVector}
          showMeasurements={showMeasurements}
          onToggleMeasurement={handleToggleMeasurement}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showPredictedOrbit={showPredictedOrbit}
          onTogglePredictedOrbit={() => setShowPredictedOrbit(!showPredictedOrbit)}
          cameraPreset={cameraPreset}
          onSelectCameraPreset={(p) => setCameraPreset(p)}
        />
      </div>

      {/* Mobile Left Sidebar Drawer */}
      {isMobileLeftOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileLeftOpen(false)}
          />
          <div className="relative w-[90vw] max-w-sm h-full z-10 shadow-2xl">
            <LeftSidebar
              selectedBody={selectedBody}
              onSelectBody={(b) => {
                handleSelectBody(b);
                setIsMobileLeftOpen(false);
              }}
              onUpdateCustomBody={handleUpdateCustomBody}
              currentMode={mode}
              onSelectMode={(m) => {
                setMode(m);
                setIsMobileLeftOpen(false);
              }}
              showVectors={showVectors}
              onToggleVector={handleToggleVector}
              showMeasurements={showMeasurements}
              onToggleMeasurement={handleToggleMeasurement}
              showGrid={showGrid}
              onToggleGrid={() => setShowGrid(!showGrid)}
              showPredictedOrbit={showPredictedOrbit}
              onTogglePredictedOrbit={() => setShowPredictedOrbit(!showPredictedOrbit)}
              cameraPreset={cameraPreset}
              onSelectCameraPreset={(p) => setCameraPreset(p)}
              onClose={() => setIsMobileLeftOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Center: 3D Space Laboratory Viewport */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-black min-w-0">
        {/* Mobile Floating Action Header (Section for Touch Screens) */}
        <div className="lg:hidden absolute top-3 inset-x-3 z-30 flex items-center justify-between pointer-events-none gap-2">
          <button
            onClick={() => {
              setIsMobileLeftOpen(true);
              setIsMobileRightOpen(false);
            }}
            className="pointer-events-auto min-h-[44px] px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/90 rounded-xl shadow-xl backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 active:scale-95 transition"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Bodies & Views</span>
          </button>

          <button
            onClick={() => {
              setIsMobileRightOpen(true);
              setIsMobileLeftOpen(false);
            }}
            className="pointer-events-auto min-h-[44px] px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 active:bg-slate-700 border border-slate-700/90 rounded-xl shadow-xl backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2 active:scale-95 transition"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Telemetry & Launch</span>
          </button>
        </div>

        {/* Top Control Bar with Solar System toggle if applicable */}
        {mode === 'solarsystem' && (
          <div className="absolute top-14 lg:top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 backdrop-blur rounded-lg p-1.5 z-30 flex items-center gap-2 text-xs font-mono shadow-xl max-w-[90vw] overflow-x-auto">
            <span className="text-slate-400 px-2 font-sans font-semibold shrink-0">Scale:</span>
            <button
              onClick={() => setSolarScaleMode('educational')}
              className={`px-3 py-1.5 min-h-[36px] rounded transition font-medium shrink-0 ${
                solarScaleMode === 'educational'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Educational
            </button>
            <button
              onClick={() => setSolarScaleMode('real')}
              className={`px-3 py-1.5 min-h-[36px] rounded transition font-medium shrink-0 ${
                solarScaleMode === 'real'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Real (1:1)
            </button>
          </div>
        )}

        {/* 3D Scene Viewport */}
        <div className="flex-1 w-full h-full min-h-0 min-w-0 relative overflow-hidden">
          <SpaceScene
            body={selectedBody}
            craftPos={craftPos}
            craftVel={craftVel}
            orbitalParams={orbitalParams}
            predictedPath={predictedPath}
            historyTrail={historyTrail}
            showVectors={showVectors}
            showMeasurements={showMeasurements}
            showGrid={showGrid}
            showPredictedOrbit={showPredictedOrbit}
            mode={mode}
            multiBodies={multiBodies}
            multiBodyAccels={multiBodyResult.individualAccels}
            netAccel={multiBodyResult.netAccel}
            solarScaleMode={solarScaleMode}
            cameraPreset={cameraPreset}
            selectedSolarPlanetId={selectedSolarPlanetId}
            onSelectSolarPlanet={(pId) => setSelectedSolarPlanetId(pId)}
          />
        </div>

        {/* 3. Bottom Interactive Graph & Time Controls */}
        <BottomGraphPanel
          body={selectedBody}
          orbitalParams={orbitalParams}
          historyTimeData={historyTimeData}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onStepForward={handleStepForward}
          onResetSimulation={() => {
            setHistoryTrail([craftPos]);
            setHistoryTimeData([]);
          }}
          timeScale={timeScale}
          onSetTimeScale={(s) => setTimeScale(s)}
          visualScale={visualScale}
          onSetVisualScale={(vs) => setVisualScale(vs)}
        />
      </main>

      {/* 4. Desktop Right Telemetry Panel */}
      <div className="hidden lg:flex shrink-0 h-full">
        <RightTelemetry
          body={selectedBody}
          craftPos={craftPos}
          craftVel={craftVel}
          orbitalParams={orbitalParams}
          onSetAltitudeKm={handleSetAltitudeKm}
          onSetVelocityKmS={handleSetVelocityKmS}
          onLaunchElliptical={handleLaunchElliptical}
          onLaunchCircular={handleLaunchCircular}
          onLaunchEscape={handleLaunchEscape}
          onApplyPresetScenario={handleApplyPresetScenario}
          onResetSpacecraft={handleResetSpacecraft}
          launchAngleDeg={launchAngleDeg}
          onSetLaunchAngleDeg={(deg) => {
            setLaunchAngleDeg(deg);
            handleSetVelocityKmS(orbitalParams.v / 1000);
          }}
        />
      </div>

      {/* Mobile Right Telemetry Drawer */}
      {isMobileRightOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileRightOpen(false)}
          />
          <div className="relative w-[92vw] max-w-md h-full z-10 shadow-2xl">
            <RightTelemetry
              body={selectedBody}
              craftPos={craftPos}
              craftVel={craftVel}
              orbitalParams={orbitalParams}
              onSetAltitudeKm={handleSetAltitudeKm}
              onSetVelocityKmS={handleSetVelocityKmS}
              onLaunchElliptical={() => {
                handleLaunchElliptical();
                setIsMobileRightOpen(false);
              }}
              onLaunchCircular={() => {
                handleLaunchCircular();
                setIsMobileRightOpen(false);
              }}
              onLaunchEscape={() => {
                handleLaunchEscape();
                setIsMobileRightOpen(false);
              }}
              onApplyPresetScenario={(sc) => {
                handleApplyPresetScenario(sc);
                setIsMobileRightOpen(false);
              }}
              onResetSpacecraft={handleResetSpacecraft}
              launchAngleDeg={launchAngleDeg}
              onSetLaunchAngleDeg={(deg) => {
                setLaunchAngleDeg(deg);
                handleSetVelocityKmS(orbitalParams.v / 1000);
              }}
              onClose={() => setIsMobileRightOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Multi-Body Gravity Superposition Overlay */}
      {mode === 'multibody' && (
        <MultiBodyControls
          onClose={() => setMode('single')}
          multiBodyResult={multiBodyResult}
        />
      )}

      {/* Solar System Telemetry & Controls Overlay */}
      {mode === 'solarsystem' && (
        <SolarSystemControls
          selectedPlanetId={selectedSolarPlanetId}
          onSelectPlanet={(pId) => setSelectedSolarPlanetId(pId)}
          scaleMode={solarScaleMode}
          onToggleScaleMode={(m) => setSolarScaleMode(m)}
          onClose={() => setMode('single')}
          onLoadIntoSingleMode={handleLoadPlanetIntoSingleMode}
          timeScale={timeScale}
        />
      )}

      {/* Experiments Modal Overlay */}
      {mode === 'experiments' && (
        <ExperimentModal
          onClose={() => setMode('single')}
          onApplyExperimentSetup={(b, altKm, velKmS, angleDeg) => {
            setSelectedBody(b);
            const r = b.radius + altKm * 1000;
            const pos = { x: r, y: 0, z: 0 };
            const speed = velKmS * 1000;
            const rad = (angleDeg * Math.PI) / 180;
            // Launch sideways in horizontal plane with launch angle
            const vel = { x: Math.sin(rad) * speed, y: 0, z: Math.cos(rad) * speed };
            craftPosRef.current = pos;
            craftVelRef.current = vel;
            setCraftPos(pos);
            setCraftVel(vel);
            setLaunchAngleDeg(angleDeg);
            setHistoryTrail([pos]);
            setHistoryTimeData([]);
            updatePredictedTrajectory(pos, vel, b);
            setMode('single');
            setIsPlaying(true);
          }}
          currentBody={selectedBody}
          currentOrbitalParams={orbitalParams}
        />
      )}

      {/* Learn Mode Modal Overlay */}
      {mode === 'learn' && (
        <LearnModeModal onClose={() => setMode('single')} />
      )}
    </div>
  );
}
