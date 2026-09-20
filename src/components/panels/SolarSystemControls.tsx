import React, { useState, useEffect } from 'react';
import { SOLAR_SYSTEM_BODIES, CELESTIAL_BODIES, G } from '../../physics/constants';
import { formatSI, formatDistance, formatVelocity } from '../../physics/engine';
import { Orbit, Sun, Compass, Zap, Gauge, ChevronDown, ChevronUp, X, Sparkles, ExternalLink, Move } from 'lucide-react';

interface SolarSystemControlsProps {
  selectedPlanetId: string;
  onSelectPlanet: (planetId: string) => void;
  scaleMode: 'real' | 'educational';
  onToggleScaleMode: (mode: 'real' | 'educational') => void;
  onClose?: () => void;
  onLoadIntoSingleMode?: (planetId: string) => void;
  timeScale: number;
}

export const SolarSystemControls: React.FC<SolarSystemControlsProps> = ({
  selectedPlanetId,
  onSelectPlanet,
  scaleMode,
  onToggleScaleMode,
  onClose,
  onLoadIntoSingleMode,
  timeScale,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'probe' | 'planets' | 'kepler'>('probe');

  // Real-time animation clock for live Vis-Viva dynamics
  const [liveAngle, setLiveAngle] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    const update = () => {
      const t = performance.now() * 0.0003;
      setLiveAngle(t);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const sun = CELESTIAL_BODIES.sun;
  const currentPlanet = SOLAR_SYSTEM_BODIES.find((p) => p.id === selectedPlanetId) || SOLAR_SYSTEM_BODIES[2]; // Default Earth

  // True Keplerian elliptical dynamics wrt Sun
  const a = currentPlanet.orbitalDistanceM; // semi-major axis (meters)
  const e = currentPlanet.eccentricity;
  const b = a * Math.sqrt(Math.max(0.01, 1 - e * e));
  const perihelion = a * (1 - e);
  const aphelion = a * (1 + e);

  // Mean motion & live true anomaly approximation
  const orbitalSpeedFactor = (365.25 / currentPlanet.orbitalPeriodDays) * 0.8;
  const planetIdx = SOLAR_SYSTEM_BODIES.findIndex((p) => p.id === currentPlanet.id);
  const theta = liveAngle * orbitalSpeedFactor + planetIdx * 0.7;

  // Instantaneous radial distance r(theta) from Sun
  const currentR = (a * (1 - e * e)) / (1 + e * Math.cos(theta));

  // Instantaneous orbital speed via Vis-Viva equation: v^2 = G * M_sun * (2/r - 1/a)
  const muSun = G * sun.mass;
  const vInstant = Math.sqrt(Math.max(0, muSun * (2 / currentR - 1 / a)));

  // Escape velocity from Sun at current distance: v_esc = sqrt(2 * G * M_sun / r)
  const vEscapeSun = Math.sqrt((2 * muSun) / currentR);

  // Solar gravitational acceleration: g_sun = G * M_sun / r^2
  const gSun = muSun / (currentR * currentR);

  // Total gravitational force between Sun and planet: F = G * M_sun * m_p / r^2
  const forceGravityN = (muSun * currentPlanet.mass) / (currentR * currentR);

  // Specific Orbital Energy: epsilon = -mu / (2a)
  const specificEnergy = -muSun / (2 * a);
  const specificKinetic = 0.5 * vInstant * vInstant;
  const specificPotential = -muSun / currentR;

  // Kepler's Third Law constant: T^2 / a^3 (SI: s^2 / m^3)
  const periodSec = currentPlanet.orbitalPeriodDays * 86400;
  const keplerConstant = (periodSec * periodSec) / Math.pow(a, 3);
  const theoreticalKepler = (4 * Math.PI * Math.PI) / muSun;

  // Astronomical Units (1 AU = 1.495978707e11 m)
  const AU_METERS = 1.495978707e11;
  const distAU = currentR / AU_METERS;

  return (
    <div
      id="solar-system-panel"
      className={`fixed z-40 transition-all duration-300 ${
        isMinimized
          ? 'bottom-20 right-4 w-72'
          : 'bottom-20 right-2 left-2 sm:left-auto sm:right-4 sm:w-[460px] max-h-[82vh]'
      } bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/40 text-slate-100 flex flex-col overflow-hidden`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-700/60 cursor-pointer select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sun className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs sm:text-sm text-slate-100">Solar System Telemetry</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                Probe wrt Sun
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Active: <span className="text-cyan-300 font-semibold">{currentPlanet.name}</span> orbiting Sun (1 M☉)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/50 transition-colors"
            title={isMinimized ? 'Expand panel' : 'Minimize panel'}
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/50 transition-colors"
              title="Close Solar System mode"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col flex-1 overflow-y-auto max-h-[70vh] p-3 space-y-3">
          {/* Planet Selector Carousel / Strip */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
              <span>Click Planet to Set as Probe wrt Sun:</span>
              <span className="text-[10px] text-cyan-400 font-mono">{SOLAR_SYSTEM_BODIES.length} Bodies</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {SOLAR_SYSTEM_BODIES.map((p) => {
                const isSelected = p.id === currentPlanet.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectPlanet(p.id)}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-900/50 scale-105'
                        : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full mb-1 shadow-sm"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-[10px] font-medium leading-tight truncate w-full text-center">
                      {p.name}
                    </span>
                    {isSelected && (
                      <span className="text-[8px] font-mono text-cyan-400 leading-none mt-0.5">PROBE</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('probe')}
              className={`flex-1 py-1.5 px-2 text-center font-medium transition-colors border-b-2 ${
                activeTab === 'probe'
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Real-Time Probe Telemetry
            </button>
            <button
              onClick={() => setActiveTab('kepler')}
              className={`flex-1 py-1.5 px-2 text-center font-medium transition-colors border-b-2 ${
                activeTab === 'kepler'
                  ? 'border-amber-400 text-amber-400 bg-amber-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Kepler's Laws & Vis-Viva
            </button>
            <button
              onClick={() => setActiveTab('planets')}
              className={`flex-1 py-1.5 px-2 text-center font-medium transition-colors border-b-2 ${
                activeTab === 'planets'
                  ? 'border-indigo-400 text-indigo-400 bg-indigo-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Scale & Solar Config
            </button>
          </div>

          {/* Tab 1: Real-Time Probe Telemetry wrt Sun */}
          {activeTab === 'probe' && (
            <div className="space-y-2.5">
              {/* Highlight Hero Card */}
              <div className="bg-gradient-to-br from-slate-850 to-slate-900 border border-cyan-500/40 rounded-lg p-2.5 shadow-inner">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-750 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
                    <span className="font-semibold text-slate-200">
                      {currentPlanet.name} acting as Probe wrt Sun
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300">
                    Live Anomaly: {(theta % (2 * Math.PI)).toFixed(2)} rad
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-800/80 rounded p-1.5 border border-slate-700/60">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Distance from Sun (r)</div>
                    <div className="text-sm font-mono font-bold text-cyan-300">
                      {distAU.toFixed(3)} <span className="text-[10px] font-normal text-slate-400">AU</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {(currentR / 1e9).toFixed(2)}M km
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded p-1.5 border border-slate-700/60">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Orbital Speed (v)</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">
                      {(vInstant / 1000).toFixed(2)} <span className="text-[10px] font-normal text-slate-400">km/s</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      {formatSI(vInstant, 1)} m/s
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded p-1.5 border border-slate-700/60 col-span-2 sm:col-span-1">
                    <div className="text-[9px] uppercase tracking-wider text-slate-400">Solar Escape Vel (v_esc)</div>
                    <div className="text-sm font-mono font-bold text-purple-400">
                      {(vEscapeSun / 1000).toFixed(2)} <span className="text-[10px] font-normal text-slate-400">km/s</span>
                    </div>
                    <div className="text-[9px] font-mono text-slate-400">
                      Ratio v/v_esc: {(vInstant / vEscapeSun).toFixed(3)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Physical Fields wrt Sun */}
              <div className="bg-slate-850/80 border border-slate-750 rounded-lg p-2.5 space-y-2 text-xs">
                <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                  <span>Sun's Gravitational Pull on {currentPlanet.name}</span>
                  <span className="text-[10px] font-mono text-amber-400">F = G·M☉·m / r²</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex flex-col bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Gravitational Force (F):</span>
                    <span className="font-mono font-bold text-amber-300">
                      {forceGravityN.toExponential(3)} N
                    </span>
                  </div>

                  <div className="flex flex-col bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Solar Acceleration (g☉):</span>
                    <span className="font-mono font-bold text-amber-300">
                      {(gSun * 1000).toFixed(3)} mm/s²
                    </span>
                  </div>

                  <div className="flex flex-col bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Perihelion (Closest):</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {(perihelion / AU_METERS).toFixed(3)} AU
                    </span>
                  </div>

                  <div className="flex flex-col bg-slate-900/60 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 text-[10px]">Aphelion (Farthest):</span>
                    <span className="font-mono font-bold text-rose-300">
                      {(aphelion / AU_METERS).toFixed(3)} AU
                    </span>
                  </div>
                </div>

                {/* Energy balance */}
                <div className="bg-slate-900/80 p-2 rounded border border-slate-800/90 text-[10px] space-y-1 font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>Specific Kinetic Energy (K = ½v²):</span>
                    <span className="text-emerald-400 font-bold">{(specificKinetic / 1e6).toFixed(1)} MJ/kg</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Specific Potential (U = -G·M☉/r):</span>
                    <span className="text-rose-400 font-bold">{(specificPotential / 1e6).toFixed(1)} MJ/kg</span>
                  </div>
                  <div className="flex justify-between text-slate-300 border-t border-slate-800 pt-1 font-semibold">
                    <span>Total Orbital Energy (E = K + U):</span>
                    <span className="text-cyan-300 font-bold">{(specificEnergy / 1e6).toFixed(1)} MJ/kg</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Load into Single-Body lab */}
              {onLoadIntoSingleMode && (
                <button
                  onClick={() => onLoadIntoSingleMode(currentPlanet.id)}
                  className="w-full py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open {currentPlanet.name} in Single-Body Orbital Lab</span>
                </button>
              )}
            </div>
          )}

          {/* Tab 2: Kepler's Laws Verification */}
          {activeTab === 'kepler' && (
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-850/90 border border-amber-500/30 rounded-lg p-2.5 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Kepler's 3rd Law Verification (T² ∝ a³)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  For all bodies orbiting the Sun, the ratio of the square of the orbital period to the cube of the semi-major axis is invariant:
                </p>
                <div className="bg-slate-900/90 p-2 rounded font-mono text-[11px] space-y-1 border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Orbital Period (T):</span>
                    <span className="text-amber-300 font-bold">
                      {currentPlanet.orbitalPeriodDays.toFixed(1)} days ({(currentPlanet.orbitalPeriodDays / 365.25).toFixed(2)} yr)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Semi-Major Axis (a):</span>
                    <span className="text-cyan-300 font-bold">{(a / AU_METERS).toFixed(3)} AU</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-emerald-400 font-bold">
                    <span>Observed T²/a³:</span>
                    <span>{keplerConstant.toExponential(4)} s²/m³</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Theoretical 4π²/(G·M☉):</span>
                    <span>{theoreticalKepler.toExponential(4)} s²/m³</span>
                  </div>
                  <div className="text-[10px] text-emerald-300 text-right pt-0.5">
                    Match Accuracy: {(100 - Math.abs((keplerConstant - theoreticalKepler) / theoreticalKepler) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Kepler's 1st & 2nd Laws Breakdown */}
              <div className="bg-slate-850/80 border border-slate-750 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                <div className="font-semibold text-slate-200">Kepler's 1st Law (Elliptical Orbits)</div>
                <p className="text-slate-400 text-[10px]">
                  The orbit of {currentPlanet.name} is an ellipse with eccentricity <strong className="text-cyan-300">e = {e}</strong>, with the Sun situated at one focal point.
                </p>

                <div className="font-semibold text-slate-200 pt-1">Kepler's 2nd Law (Equal Areas)</div>
                <p className="text-slate-400 text-[10px]">
                  The radius vector sweeps equal areas in equal intervals. Speed at perihelion ({( (Math.sqrt(muSun * (2 / perihelion - 1 / a))) / 1000 ).toFixed(1)} km/s) is faster than aphelion ({( (Math.sqrt(muSun * (2 / aphelion - 1 / a))) / 1000 ).toFixed(1)} km/s).
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Scale Mode & Solar Configuration */}
          {activeTab === 'planets' && (
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-850/80 border border-slate-750 rounded-lg p-2.5 space-y-2">
                <div className="font-semibold text-slate-200">3D Visualization Scale Mode</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onToggleScaleMode('educational')}
                    className={`p-2 rounded border text-left transition-all ${
                      scaleMode === 'educational'
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-bold text-xs">Educational View</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Spacing adjusted so all 8 planets and elliptical orbits fit comfortably on screen.
                    </div>
                  </button>

                  <button
                    onClick={() => onToggleScaleMode('real')}
                    className={`p-2 rounded border text-left transition-all ${
                      scaleMode === 'real'
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    <div className="font-bold text-xs">Real Astronomical Scale</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Semi-major axes scale accurately to AU. Zoom out to view gas giants!
                    </div>
                  </button>
                </div>
              </div>

              {/* Sun Reference Specs */}
              <div className="bg-slate-850/80 border border-slate-750 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Central Gravitational Attractor: Sun (Sol)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[10px]">
                  <div>Mass: 1.989 × 10³⁰ kg</div>
                  <div>Radius: 696,340 km</div>
                  <div>Surface Gravity: 274.0 m/s²</div>
                  <div>Escape Vel: 617.5 km/s</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
