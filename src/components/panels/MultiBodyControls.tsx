/**
 * Multi-Body Gravity Overlay (Section 17)
 * Visualizes combined gravitational fields (e.g. Earth + Moon, Binary Stars, Lagrange L1),
 * displaying individual gravitational acceleration vectors, gravitational forces,
 * net resultant acceleration, and system potential energy.
 */
import React, { useState } from 'react';
import { Vector3D, MultiBodyPull } from '../../types/physics';
import { formatSI, formatDistance } from '../../physics/constants';
import {
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Compass,
  Gauge,
  Zap,
  Target,
  X,
} from 'lucide-react';

interface MultiBodyControlsProps {
  onClose: () => void;
  multiBodyResult: {
    netAccel: Vector3D;
    netMag: number;
    netForceMag: number;
    netPotentialEnergy: number;
    escapeVelocity: number;
    individualAccels: MultiBodyPull[];
  };
  craftMass?: number;
  onSetCraftMass?: (mass: number) => void;
  currentPreset?: string;
  onSelectPreset?: (preset: 'earth-moon' | 'lagrange-l1' | 'binary-stars' | 'sun-earth-moon') => void;
  onSetCraftPosition?: (pos: Vector3D) => void;
}

export const MultiBodyControls: React.FC<MultiBodyControlsProps> = ({
  onClose,
  multiBodyResult,
  craftMass = 1000,
  onSetCraftMass,
  currentPreset = 'earth-moon',
  onSelectPreset,
  onSetCraftPosition,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'forces' | 'vectors' | 'presets'>('forces');

  const { netAccel, netMag, netForceMag, netPotentialEnergy, escapeVelocity, individualAccels } = multiBodyResult;

  return (
    <div
      className={`fixed sm:absolute top-16 sm:top-4 right-2 sm:right-4 max-w-[calc(100vw-1rem)] w-96 bg-slate-900/98 sm:bg-slate-900/95 border border-cyan-800/70 rounded-xl shadow-2xl z-40 font-mono text-xs select-none transition-all duration-200 ${
        isMinimized ? 'h-14 overflow-hidden' : 'max-h-[85vh] flex flex-col'
      }`}
    >
      {/* Header with Minimize & Close */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold font-sans">
          <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Multi-Body Gravity Field</span>
            <span className="text-[10px] text-cyan-400 font-normal">Superposition Principle</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title={isMinimized ? 'Expand Multi-Body Panel' : 'Minimize Multi-Body Panel'}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 space-y-3 overflow-y-auto">
          {/* Preset System Selector */}
          {onSelectPreset && (
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 font-sans block mb-1">
                Multi-Body System Scenarios:
              </span>
              <div className="grid grid-cols-2 gap-1 font-sans text-[11px]">
                <button
                  onClick={() => onSelectPreset('earth-moon')}
                  className={`py-1.5 px-2 rounded border text-left transition ${
                    currentPreset === 'earth-moon'
                      ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  🌍 Earth + Moon
                </button>
                <button
                  onClick={() => onSelectPreset('lagrange-l1')}
                  className={`py-1.5 px-2 rounded border text-left transition ${
                    currentPreset === 'lagrange-l1'
                      ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ⚖️ Earth-Moon L₁ Saddle
                </button>
                <button
                  onClick={() => onSelectPreset('binary-stars')}
                  className={`py-1.5 px-2 rounded border text-left transition ${
                    currentPreset === 'binary-stars'
                      ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ⭐ Binary Star System
                </button>
                <button
                  onClick={() => onSelectPreset('sun-earth-moon')}
                  className={`py-1.5 px-2 rounded border text-left transition ${
                    currentPreset === 'sun-earth-moon'
                      ? 'bg-cyan-950 border-cyan-500 text-white font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  ☀️ 3-Body (Sun+Earth+Moon)
                </button>
              </div>
            </div>
          )}

          {/* Superposition Formula Card */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-sans block mb-1">
              Superposition Law: Sum of Gravitational Field Vectors
            </span>
            <div className="text-amber-400 font-bold text-xs">
              g⃗_net = ∑ (G · M_i / r_i³) · r⃗_i
            </div>
          </div>

          {/* Net Resultant Telemetry Card */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 p-3 rounded-lg border border-cyan-800/80 space-y-1.5">
            <div className="flex justify-between items-center border-b border-cyan-900/60 pb-1">
              <span className="text-xs font-bold text-cyan-300 font-sans flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Net Resultant On Spacecraft
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">m = {craftMass.toLocaleString()} kg</span>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <span className="text-slate-400">Net Acceleration:</span>
              <span className="text-right text-emerald-400 font-bold">
                {netMag >= 1e-4 ? netMag.toFixed(4) : netMag.toExponential(3)} m/s²
              </span>

              <span className="text-slate-400">Net Gravitational Force:</span>
              <span className="text-right text-amber-400 font-bold">
                {formatSI(netForceMag)} N
              </span>

              <span className="text-slate-400">System Potential Energy:</span>
              <span className="text-right text-cyan-300">
                {formatSI(netPotentialEnergy)} J
              </span>

              <span className="text-slate-400">Multi-Body v_esc:</span>
              <span className="text-right text-purple-300 font-bold">
                {(escapeVelocity / 1000).toFixed(2)} km/s
              </span>
            </div>

            {/* Vector Components */}
            <div className="pt-1.5 border-t border-cyan-900/40 text-[10px] text-slate-300 flex justify-between font-mono">
              <span>a_x: {netAccel.x >= 0 ? '+' : ''}{netAccel.x.toFixed(3)}</span>
              <span>a_y: {netAccel.y >= 0 ? '+' : ''}{netAccel.y.toFixed(3)}</span>
              <span>a_z: {netAccel.z >= 0 ? '+' : ''}{netAccel.z.toFixed(3)}</span>
            </div>
          </div>

          {/* Individual Body Gravitational Contributions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider font-semibold">
                Individual Body Contributions:
              </span>
              <span className="text-[10px] text-cyan-400">
                {individualAccels.length} Active Sources
              </span>
            </div>

            {individualAccels.map((b) => (
              <div
                key={b.bodyId}
                className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="text-slate-200 font-bold font-sans text-xs">{b.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    d = {formatDistance(b.distance)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 text-[11px]">
                  <span className="text-slate-400">Gravitational Pull:</span>
                  <span className="text-right text-cyan-400 font-bold">
                    {b.mag >= 1e-4 ? b.mag.toFixed(4) : b.mag.toExponential(3)} m/s²
                  </span>

                  <span className="text-slate-400">Exerted Force:</span>
                  <span className="text-right text-amber-300 font-mono">
                    {formatSI(b.forceMag)} N
                  </span>
                </div>

                {/* Contribution bar */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Field Share</span>
                    <span className="font-bold text-slate-200">{b.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(2, b.percentage))}%`,
                        backgroundColor: b.color || '#38bdf8',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Spacecraft Mass Configurator */}
          {onSetCraftMass && (
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-sans">Spacecraft Mass:</span>
                <span className="font-bold text-cyan-400">{craftMass.toLocaleString()} kg</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {[100, 1000, 15000, 420000].map((m) => (
                  <button
                    key={m}
                    onClick={() => onSetCraftMass(m)}
                    className={`py-1 rounded border transition ${
                      craftMass === m
                        ? 'bg-cyan-600 border-cyan-400 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m >= 1000 ? `${m / 1000}t` : `${m}kg`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Position Repositioning Buttons */}
          {onSetCraftPosition && (
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block font-semibold">
                Quick Probe Placement:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-sans">
                <button
                  onClick={() => onSetCraftPosition({ x: 7e6, y: 0, z: 0 })}
                  className="py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 active:scale-95 transition"
                >
                  Low Earth Orbit (7,000 km)
                </button>
                <button
                  onClick={() => onSetCraftPosition({ x: 3.26e8, y: 0, z: 0 })}
                  className="py-1 px-2 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 active:scale-95 transition"
                >
                  L₁ Equilibrium (326,000 km)
                </button>
                <button
                  onClick={() => onSetCraftPosition({ x: 3.82e8, y: 0, z: 0 })}
                  className="py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 active:scale-95 transition"
                >
                  Lunar Proximity (382,000 km)
                </button>
                <button
                  onClick={() => onSetCraftPosition({ x: 1.92e8, y: 0, z: 0 })}
                  className="py-1 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 active:scale-95 transition"
                >
                  Earth-Moon Midpoint
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
