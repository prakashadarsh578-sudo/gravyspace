/**
 * Right Telemetry Panel: Real-time Physics Dashboard, Dynamic Equation Solver,
 * Velocity & Altitude Controls, Circular Orbit Launcher, and Energy Breakdown.
 */
import React from 'react';
import { CelestialBody, Vector3D, OrbitalParameters } from '../../types/physics';
import { formatSI, formatDistance, formatVelocity, G } from '../../physics/constants';
import {
  Activity,
  Zap,
  Gauge,
  Compass,
  ArrowUpRight,
  TrendingDown,
  RotateCw,
  Rocket,
  ShieldAlert,
  X,
  Plus,
  Minus,
} from 'lucide-react';

interface RightTelemetryProps {
  body: CelestialBody;
  craftPos: Vector3D;
  craftVel: Vector3D;
  orbitalParams: OrbitalParameters;
  onSetAltitudeKm: (altitudeKm: number) => void;
  onSetVelocityKmS: (velocityKmS: number) => void;
  onLaunchElliptical: () => void;
  onLaunchCircular: () => void;
  onLaunchEscape: () => void;
  onApplyPresetScenario: (scenario: 'fall' | 'circular' | 'elliptical' | 'escape') => void;
  onResetSpacecraft: () => void;
  launchAngleDeg: number;
  onSetLaunchAngleDeg: (deg: number) => void;
  onClose?: () => void;
}

export const RightTelemetry: React.FC<RightTelemetryProps> = ({
  body,
  craftPos,
  craftVel,
  orbitalParams,
  onSetAltitudeKm,
  onSetVelocityKmS,
  onLaunchElliptical,
  onLaunchCircular,
  onLaunchEscape,
  onApplyPresetScenario,
  onResetSpacecraft,
  launchAngleDeg,
  onSetLaunchAngleDeg,
  onClose,
}) => {
  const currentSpeedKmS = orbitalParams.v / 1000;
  const currentAltitudeKm = orbitalParams.h / 1000;
  const vCircKmS = orbitalParams.vCircular / 1000;
  const vEscKmS = orbitalParams.vEscape / 1000;

  // Percentage for comparison bars (max relative to 1.3 * v_esc)
  const maxRefSpeed = Math.max(vEscKmS * 1.35, currentSpeedKmS * 1.1, 1);
  const currentPct = Math.min(100, (currentSpeedKmS / maxRefSpeed) * 100);
  const circPct = Math.min(100, (vCircKmS / maxRefSpeed) * 100);
  const escPct = Math.min(100, (vEscKmS / maxRefSpeed) * 100);

  return (
    <aside className="w-full sm:w-96 lg:w-96 bg-slate-900/98 sm:bg-slate-900/95 border-l border-slate-800 flex flex-col h-full overflow-y-auto text-slate-200 text-sm select-none z-20">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="font-bold text-sm tracking-tight text-white font-display">Physics Telemetry</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetSpacecraft}
            className="px-2.5 py-1.5 min-h-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            title="Reset position and velocity to initial state"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reset Probe</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition"
              aria-label="Close telemetry panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {/* Distance Breakdown Card: r = R + h (Section 4 & 5) */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              Distance Geometry (r = R + h)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">Section 4 & 5</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="bg-slate-900/90 p-2 rounded border border-emerald-900/60">
              <span className="text-[10px] text-emerald-400 font-semibold block">Planet Radius (R)</span>
              <span className="text-xs font-bold text-emerald-300">
                {(body.radius / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded border border-amber-900/60">
              <span className="text-[10px] text-amber-400 font-semibold block">Altitude (h)</span>
              <span className="text-xs font-bold text-amber-300">
                {currentAltitudeKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded border border-cyan-900/60">
              <span className="text-[10px] text-cyan-400 font-semibold block">Distance (r)</span>
              <span className="text-xs font-bold text-cyan-300">
                {(orbitalParams.r / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
              </span>
            </div>
          </div>

          {/* Altitude Slider Control */}
          <div className="pt-1 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Adjust Spacecraft Altitude (h):</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                {currentAltitudeKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km
              </span>
            </div>
            <input
              type="range"
              min="100"
              max={Math.max(100000, (body.radius * 6) / 1000)}
              step="100"
              value={currentAltitudeKm}
              onChange={(e) => onSetAltitudeKm(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            {/* Quick Touch Steppers for Mobile */}
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <button
                onClick={() => onSetAltitudeKm(Math.max(100, currentAltitudeKm - 1000))}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1 active:bg-slate-700 transition"
              >
                <Minus className="w-3 h-3" /> 1k km
              </button>
              <button
                onClick={() => onSetAltitudeKm(currentAltitudeKm + 1000)}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1 active:bg-slate-700 transition"
              >
                <Plus className="w-3 h-3" /> 1k km
              </button>
              <button
                onClick={() => onSetAltitudeKm(400)}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-cyan-400 active:bg-slate-700 transition"
                title="Low Orbit (~400 km ISS altitude)"
              >
                400 km
              </button>
              <button
                onClick={() => onSetAltitudeKm(35786)}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-amber-400 active:bg-slate-700 transition"
                title="Geostationary Altitude (~35,786 km)"
              >
                GEO
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Low Orbit (100 km)</span>
              <span>Deep Space ({((body.radius * 6) / 1000).toLocaleString()} km)</span>
            </div>
          </div>
        </div>

        {/* Section 6 & 24: Real-time Equation Solver Panel */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Equation Calculations
            </span>
            <span className="text-[10px] font-mono text-amber-400">Class 11 Physics</span>
          </div>

          {/* Dynamic g = GM / r^2 */}
          <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 font-mono text-xs space-y-1">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Gravitational Acceleration:</span>
              <span className="text-amber-400 font-bold text-sm">
                g = {orbitalParams.g.toFixed(3)} m/s²
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              <span className="text-amber-300">g(r)</span> = GM / r²
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              = ({G.toExponential(4)} × {body.mass.toExponential(2)}) / ({orbitalParams.r.toExponential(2)})²
            </div>
            <p className="text-[10px] text-slate-400 font-sans italic pt-0.5">
              Inverse-square law: as distance r doubles, gravity drops to 1/4th.
            </p>
          </div>

          {/* Dynamic v_circ = sqrt(GM / r) */}
          <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 font-mono text-xs space-y-1">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Required Circular Velocity:</span>
              <span className="text-cyan-400 font-bold text-sm">
                v_circ = {formatVelocity(orbitalParams.vCircular)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              <span className="text-cyan-300">v_circ</span> = √(GM / r)
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              = √({G.toExponential(4)} × {body.mass.toExponential(2)} / {orbitalParams.r.toExponential(2)})
            </div>
          </div>

          {/* Dynamic v_escape = sqrt(2GM / r) */}
          <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 font-mono text-xs space-y-1">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Current Escape Velocity:</span>
              <span className="text-emerald-400 font-bold text-sm">
                v_esc = {formatVelocity(orbitalParams.vEscape)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              <span className="text-emerald-300">v_esc</span> = √(2GM / r) = √2 × v_circ
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              = √(2 × {G.toExponential(4)} × {body.mass.toExponential(2)} / {orbitalParams.r.toExponential(2)})
            </div>
          </div>
        </div>

        {/* Section 8 & 14: Velocity Comparison Experiment Bars */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              Velocity Comparison Bars (Section 14)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {currentSpeedKmS < vCircKmS * 0.98
                ? 'v < v_circ'
                : Math.abs(currentSpeedKmS - vCircKmS) <= 0.05
                ? 'v ≈ v_circ'
                : currentSpeedKmS < vEscKmS
                ? 'v_circ < v < v_esc'
                : 'v ≥ v_esc'}
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {/* Circular Velocity Bar */}
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-cyan-400">Circular Velocity (v_circ):</span>
                <span className="text-cyan-300 font-bold">{vCircKmS.toFixed(2)} km/s</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${circPct}%` }}
                ></div>
              </div>
            </div>

            {/* Current Spacecraft Velocity Bar */}
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-emerald-400 font-semibold">Current Speed (v):</span>
                <span className="text-emerald-300 font-bold">{currentSpeedKmS.toFixed(2)} km/s</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    currentSpeedKmS >= vEscKmS
                      ? 'bg-rose-500 animate-pulse'
                      : currentSpeedKmS >= vCircKmS * 0.98 && currentSpeedKmS <= vCircKmS * 1.02
                      ? 'bg-cyan-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${currentPct}%` }}
                ></div>
              </div>
            </div>

            {/* Escape Velocity Bar */}
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-amber-400">Escape Velocity (v_esc):</span>
                <span className="text-amber-300 font-bold">{vEscKmS.toFixed(2)} km/s</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${escPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Speed adjustment slider with Mobile Stepper Buttons */}
          <div className="pt-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Change Initial Speed (v):</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{currentSpeedKmS.toFixed(2)} km/s</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(25, vEscKmS * 1.6)}
              step="0.05"
              value={currentSpeedKmS}
              onChange={(e) => onSetVelocityKmS(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            {/* Quick Speed Stepper buttons for Mobile */}
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <button
                onClick={() => onSetVelocityKmS(Math.max(0, currentSpeedKmS - 0.5))}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1 active:bg-slate-700 transition"
              >
                <Minus className="w-3 h-3" /> 0.5
              </button>
              <button
                onClick={() => onSetVelocityKmS(currentSpeedKmS + 0.5)}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1 active:bg-slate-700 transition"
              >
                <Plus className="w-3 h-3" /> 0.5
              </button>
              <button
                onClick={() => onSetVelocityKmS(vCircKmS)}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-cyan-400 active:bg-slate-700 transition"
              >
                = v_circ
              </button>
              <button
                onClick={() => onSetVelocityKmS(vEscKmS)}
                className="py-1.5 px-2 min-h-[36px] bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[11px] font-mono text-amber-400 active:bg-slate-700 transition"
              >
                = v_esc
              </button>
            </div>
          </div>

          {/* Launch Angle Slider (Tangential vs Radial) */}
          <div className="pt-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Launch Angle from Tangent:</span>
              <span className="font-mono text-blue-400 font-bold">{launchAngleDeg}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={launchAngleDeg}
              onChange={(e) => onSetLaunchAngleDeg(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>-90° Inward</span>
              <span>0° Pure Tangential</span>
              <span>+90° Outward</span>
            </div>
          </div>
        </div>

        {/* Section 13 & 9: Circular Orbit & Quick Scenarios Launcher */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-blue-400" />
            Class 11 Orbital Scenarios (Section 9 & 13)
          </span>

          {/* Primary Quick Launch Buttons: Elliptical, Circular, Escape */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={onLaunchElliptical}
              className="p-2 min-h-[48px] rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs flex flex-col items-center justify-center gap-0.5 shadow-sm transition active:scale-[0.98] border border-indigo-400/40"
              title="Launch at elliptical orbit velocity (e ≈ 0.28, Keplerian orbit)"
            >
              <div className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-200" />
                <span>Elliptical</span>
              </div>
              <span className="text-[9px] opacity-90 font-mono font-normal">v &gt; v_circ</span>
            </button>

            <button
              onClick={onLaunchCircular}
              className="p-2 min-h-[48px] rounded-lg bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold text-xs flex flex-col items-center justify-center gap-0.5 shadow-sm transition active:scale-[0.98]"
              title="Launch at exact circular velocity (e = 0)"
            >
              <div className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5 text-cyan-200" />
                <span>Circular</span>
              </div>
              <span className="text-[9px] opacity-90 font-mono font-normal">v = √(GM/r)</span>
            </button>

            <button
              onClick={onLaunchEscape}
              className="p-2 min-h-[48px] rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs flex flex-col items-center justify-center gap-0.5 shadow-sm transition active:scale-[0.98]"
              title="Launch at escape velocity (hyperbolic escape)"
            >
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
                <span>Escape</span>
              </div>
              <span className="text-[9px] opacity-90 font-mono font-normal">v = √(2GM/r)</span>
            </button>
          </div>

          {/* 4 Scenarios described in Master Prompt Section 9 */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-medium">
            <button
              onClick={() => onApplyPresetScenario('fall')}
              className="p-2.5 min-h-[48px] rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-300 flex items-center gap-2 transition text-left active:scale-[0.98]"
            >
              <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-white">Scenario A</div>
                <div className="text-[10px] text-slate-400">Suborbital Fall</div>
              </div>
            </button>

            <button
              onClick={() => onApplyPresetScenario('elliptical')}
              className="p-2.5 min-h-[48px] rounded-lg border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/40 active:bg-indigo-900 text-slate-200 flex items-center gap-2 transition text-left active:scale-[0.98]"
            >
              <Compass className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-white">Scenario B</div>
                <div className="text-[10px] text-indigo-300">Elliptical (e=0.35)</div>
              </div>
            </button>

            <button
              onClick={() => onApplyPresetScenario('circular')}
              className="p-2.5 min-h-[48px] rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-300 flex items-center gap-2 transition text-left active:scale-[0.98]"
            >
              <RotateCw className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-white">Scenario C</div>
                <div className="text-[10px] text-slate-400">Circular (e=0)</div>
              </div>
            </button>

            <button
              onClick={() => onApplyPresetScenario('escape')}
              className="p-2.5 min-h-[48px] rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-slate-300 flex items-center gap-2 transition text-left active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-xs text-white">Scenario D</div>
                <div className="text-[10px] text-slate-400">Escape (v ≥ v_e)</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 11 & 18: Elliptical Orbit Parameters */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-400 font-sans font-semibold text-xs">Keplerian Orbital Elements</span>
            <span className="text-[10px] text-blue-400">Section 11</span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <span className="text-slate-400">Eccentricity (e):</span>
            <span className="text-right text-slate-200 font-bold">
              {orbitalParams.eccentricity.toFixed(4)}
            </span>

            <span className="text-slate-400">Semi-major axis (a):</span>
            <span className="text-right text-slate-200">
              {orbitalParams.semiMajorAxis > 0 ? formatDistance(orbitalParams.semiMajorAxis) : 'Hyperbolic'}
            </span>

            <span className="text-slate-400">Periapsis (r_p):</span>
            <span className="text-right text-emerald-400">
              {formatDistance(orbitalParams.periapsis)}
            </span>

            <span className="text-slate-400">Apoapsis (r_a):</span>
            <span className="text-right text-amber-400">
              {isFinite(orbitalParams.apoapsis) ? formatDistance(orbitalParams.apoapsis) : '∞ (Unbound)'}
            </span>

            <span className="text-slate-400">Orbital Period (T):</span>
            <span className="text-right text-slate-200">
              {orbitalParams.orbitalPeriod > 0
                ? orbitalParams.orbitalPeriod >= 3600
                  ? `${(orbitalParams.orbitalPeriod / 3600).toFixed(2)} hours`
                  : `${(orbitalParams.orbitalPeriod / 60).toFixed(1)} mins`
                : 'N/A (Open)'}
            </span>

            <span className="text-slate-400">Radial Vel (v_r):</span>
            <span className="text-right text-slate-300">{formatVelocity(orbitalParams.vRadial)}</span>

            <span className="text-slate-400">Tangential Vel (v_t):</span>
            <span className="text-right text-slate-300">{formatVelocity(orbitalParams.vTangential)}</span>
          </div>
        </div>

        {/* Section 19: Mechanical Energy Visualization */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-400 font-sans font-semibold text-xs">Mechanical Energy (E = K + U)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
              orbitalParams.totalEnergy < 0
                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {orbitalParams.totalEnergy < 0 ? 'Bound (E < 0)' : 'Escape (E ≥ 0)'}
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-emerald-400">Kinetic Energy (K = ½mv²):</span>
              <span className="text-slate-200">{formatSI(orbitalParams.kineticEnergy)} J</span>
            </div>
            <div className="flex justify-between">
              <span className="text-rose-400">Potential (U = -GMm/r):</span>
              <span className="text-slate-200">{formatSI(orbitalParams.potentialEnergy)} J</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1 font-bold">
              <span className={orbitalParams.totalEnergy < 0 ? 'text-blue-400' : 'text-emerald-400'}>
                Total Energy (E = K + U):
              </span>
              <span className={orbitalParams.totalEnergy < 0 ? 'text-blue-300' : 'text-emerald-300'}>
                {formatSI(orbitalParams.totalEnergy)} J
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-sans italic">
            {orbitalParams.totalEnergy < 0
              ? 'Negative total energy means the spacecraft is gravitationally trapped in orbit.'
              : 'Zero or positive total energy allows the spacecraft to escape to infinity.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
