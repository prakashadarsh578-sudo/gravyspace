/**
 * Left Sidebar: Object Selection, Custom Planet Editor, Mode Switcher, and Display Toggles.
 */
import React, { useState } from 'react';
import { CelestialBody, SimulationMode } from '../../types/physics';
import { CELESTIAL_BODIES, G, calcSurfaceGravity, calcSurfaceEscapeVelocity, calcMeanDensity, calcSchwarzschildRadius, formatSI, formatDistance } from '../../physics/constants';
import { Globe, Orbit, Compass, Sparkles, BookOpen, Layers, Sliders, Eye, RefreshCw, X } from 'lucide-react';

interface LeftSidebarProps {
  selectedBody: CelestialBody;
  onSelectBody: (body: CelestialBody) => void;
  onUpdateCustomBody: (
    mass: number,
    radius: number,
    name: string,
    options?: {
      surfaceType?: 'rocky' | 'ocean' | 'desert' | 'gas' | 'ice' | 'lava' | 'star' | 'blackhole';
      color?: string;
      hasAtmosphere?: boolean;
      hasRings?: boolean;
    }
  ) => void;
  currentMode: SimulationMode;
  onSelectMode: (mode: SimulationMode) => void;
  showVectors: {
    velocity: boolean;
    acceleration: boolean;
    force: boolean;
  };
  onToggleVector: (type: 'velocity' | 'acceleration' | 'force') => void;
  showMeasurements: {
    radius: boolean;
    distance: boolean;
    altitude: boolean;
  };
  onToggleMeasurement: (type: 'radius' | 'distance' | 'altitude') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showPredictedOrbit: boolean;
  onTogglePredictedOrbit: () => void;
  cameraPreset: string;
  onSelectCameraPreset: (preset: string) => void;
  onClose?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedBody,
  onSelectBody,
  onUpdateCustomBody,
  currentMode,
  onSelectMode,
  showVectors,
  onToggleVector,
  showMeasurements,
  onToggleMeasurement,
  showGrid,
  onToggleGrid,
  showPredictedOrbit,
  onTogglePredictedOrbit,
  cameraPreset,
  onSelectCameraPreset,
  onClose,
}) => {
  // Custom body inputs
  const [customMass, setCustomMass] = useState(selectedBody.mass);
  const [customRadiusKm, setCustomRadiusKm] = useState(selectedBody.radius / 1000);
  const [customName, setCustomName] = useState('Kepler-452b');
  const [customSurfaceType, setCustomSurfaceType] = useState<
    'rocky' | 'ocean' | 'desert' | 'gas' | 'ice' | 'lava' | 'star' | 'blackhole'
  >('rocky');
  const [customColor, setCustomColor] = useState('#06b6d4');
  const [customHasAtmosphere, setCustomHasAtmosphere] = useState(true);
  const [customHasRings, setCustomHasRings] = useState(false);

  // Collapsible section state for minimizing/maximizing cards
  const [openSections, setOpenSections] = useState({
    modes: true,
    presets: true,
    physicalData: true,
    customConfig: true,
    measurements: true,
    vectors: true,
    display: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCustomApply = () => {
    onUpdateCustomBody(customMass, customRadiusKm * 1000, customName, {
      surfaceType: customSurfaceType,
      color: customColor,
      hasAtmosphere: customHasAtmosphere,
      hasRings: customHasRings,
    });
  };

  // Quick preset apply
  const applyCustomPreset = (
    presetName: string,
    earthMassMult: number,
    radiusKm: number,
    surfType: 'rocky' | 'ocean' | 'desert' | 'gas' | 'ice' | 'lava' | 'star' | 'blackhole',
    color: string,
    atmo: boolean,
    rings: boolean
  ) => {
    const mass = earthMassMult * 5.9722e24;
    setCustomName(presetName);
    setCustomMass(mass);
    setCustomRadiusKm(radiusKm);
    setCustomSurfaceType(surfType);
    setCustomColor(color);
    setCustomHasAtmosphere(atmo);
    setCustomHasRings(rings);
    onUpdateCustomBody(mass, radiusKm * 1000, presetName, {
      surfaceType: surfType,
      color,
      hasAtmosphere: atmo,
      hasRings: rings,
    });
  };

  // Derived live physics for custom body
  const customG = (G * customMass) / Math.pow(customRadiusKm * 1000, 2);
  const customVesc = Math.sqrt((2 * G * customMass) / (customRadiusKm * 1000));
  const customDensity = customMass / ((4 / 3) * Math.PI * Math.pow(customRadiusKm * 1000, 3));

  return (
    <aside className="w-full sm:w-80 lg:w-80 bg-slate-900/98 sm:bg-slate-900/95 border-r border-slate-800 flex flex-col h-full overflow-y-auto text-slate-200 text-sm select-none z-20">
      {/* App Header / Lab Badge */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Orbit className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-display">
                AstroLab 3D
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Class 11
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Gravity & Orbital Mechanics</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close celestial body drawer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 mt-3 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-medium">
          <button
            onClick={() => onSelectMode('single')}
            className={`py-2 px-2 min-h-[40px] rounded flex items-center justify-center gap-1 transition ${
              currentMode === 'single'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Single Primary Celestial Body"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Primary</span>
          </button>
          <button
            onClick={() => onSelectMode('solarsystem')}
            className={`py-2 px-2 min-h-[40px] rounded flex items-center justify-center gap-1 transition ${
              currentMode === 'solarsystem'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Solar System Scale"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Solar Sys</span>
          </button>
          <button
            onClick={() => onSelectMode('multibody')}
            className={`py-2 px-2 min-h-[40px] rounded flex items-center justify-center gap-1 transition ${
              currentMode === 'multibody'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Combined Multi-Body Gravity"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Body</span>
          </button>
        </div>

        {/* Experiments & Learn Mode Quick Links */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          <button
            onClick={() => onSelectMode('experiments')}
            className={`py-2 px-2.5 min-h-[42px] rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              currentMode === 'experiments'
                ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                : 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Class 11 Labs</span>
          </button>
          <button
            onClick={() => onSelectMode('learn')}
            className={`py-2 px-2.5 min-h-[42px] rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
              currentMode === 'learn'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Learn Mode</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Section 3: Celestial Body Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Celestial Body
            </span>
            <span className="text-[11px] font-mono text-slate-500">{selectedBody.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(CELESTIAL_BODIES).map((b) => {
              const isActive = selectedBody.id === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBody(b)}
                  className={`p-2.5 min-h-[50px] rounded-lg border text-left flex flex-col justify-between transition active:scale-[0.98] ${
                    isActive
                      ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500/40'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: b.color }}
                    ></span>
                    <span className="font-semibold text-xs truncate">{b.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">
                    g = {b.surfaceGravity.toFixed(1)} m/s²
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Body Telemetry Card */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-400 font-sans text-xs font-semibold">{selectedBody.name} Physical Data</span>
            <span className="text-[10px] text-blue-400">SI Constants</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <span className="text-slate-400">Mass (M):</span>
            <span className="text-right text-slate-200">{formatSI(selectedBody.mass)} kg</span>

            <span className="text-slate-400">Radius (R):</span>
            <span className="text-right text-slate-200">
              {(selectedBody.radius / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
            </span>

            <span className="text-slate-400">Surface g:</span>
            <span className="text-right text-amber-400 font-bold">{selectedBody.surfaceGravity.toFixed(2)} m/s²</span>

            <span className="text-slate-400">Escape Vel (v_e):</span>
            <span className="text-right text-emerald-400 font-bold">
              {(selectedBody.surfaceEscapeVelocity / 1000).toFixed(2)} km/s
            </span>

            <span className="text-slate-400">Mean Density:</span>
            <span className="text-right text-slate-300">
              {selectedBody.meanDensity.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg/m³
            </span>

            {selectedBody.isBlackHole && (
              <>
                <span className="text-purple-400 font-semibold">Schwarzschild:</span>
                <span className="text-right text-purple-300 font-bold">
                  {selectedBody.schwarzschildRadius ? (selectedBody.schwarzschildRadius / 1000).toFixed(1) : 0} km
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-sans italic border-t border-slate-800/60 pt-1.5 leading-relaxed">
            {selectedBody.description}
          </p>
        </div>

        {/* Custom Body Parameter Editor (Section 3) - Comprehensive Configurable Options */}
        {selectedBody.id === 'custom' && (
          <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>Custom Body Architect</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Live Physics
              </span>
            </div>

            {/* Quick Archetype Preset Chips */}
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block mb-1.5">
                Quick Archetypes:
              </span>
              <div className="grid grid-cols-3 gap-1 text-[11px] font-medium">
                <button
                  onClick={() => applyCustomPreset('Luna-like', 0.0123, 1737, 'rocky', '#94a3b8', false, false)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 active:scale-95 transition truncate text-center"
                  title="Moon-like minor body (0.012 M⊕, 1,737 km)"
                >
                  🌕 Moon
                </button>
                <button
                  onClick={() => applyCustomPreset('Super-Earth', 3.5, 9200, 'ocean', '#06b6d4', true, false)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-cyan-900/60 text-cyan-300 active:scale-95 transition truncate text-center"
                  title="Super-Earth with deep oceans (3.5 M⊕, 9,200 km)"
                >
                  🌊 Ocean
                </button>
                <button
                  onClick={() => applyCustomPreset('Dune World', 0.65, 4800, 'desert', '#f59e0b', true, false)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-amber-900/60 text-amber-300 active:scale-95 transition truncate text-center"
                  title="Arid Desert World (0.65 M⊕, 4,800 km)"
                >
                  🏜️ Desert
                </button>
                <button
                  onClick={() => applyCustomPreset('Cryo Planet', 1.2, 7100, 'ice', '#38bdf8', true, false)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-sky-900/60 text-sky-300 active:scale-95 transition truncate text-center"
                  title="Glacial Ice World (1.2 M⊕, 7,100 km)"
                >
                  ❄️ Ice World
                </button>
                <button
                  onClick={() => applyCustomPreset('Jovian Prime', 280, 68000, 'gas', '#fbbf24', true, true)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-yellow-900/60 text-yellow-300 active:scale-95 transition truncate text-center"
                  title="Banded Gas Giant with Rings (280 M⊕, 68,000 km)"
                >
                  🪐 Ring Giant
                </button>
                <button
                  onClick={() => applyCustomPreset('Magma Core', 4.8, 8500, 'lava', '#ef4444', true, false)}
                  className="py-1 px-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-red-900/60 text-red-300 active:scale-95 transition truncate text-center"
                  title="Volcanic Molten World (4.8 M⊕, 8,500 km)"
                >
                  🌋 Molten
                </button>
              </div>
            </div>

            {/* Custom Name Input */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-medium">Celestial Name:</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Kepler-452b, Exoplanet 1"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            {/* Surface Type Archetype */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-medium">Surface Archetype:</label>
              <div className="grid grid-cols-4 gap-1">
                {(['rocky', 'ocean', 'desert', 'gas', 'ice', 'lava', 'star', 'blackhole'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCustomSurfaceType(type)}
                    className={`py-1 px-1 rounded text-[10px] font-medium capitalize border transition ${
                      customSurfaceType === type
                        ? 'bg-cyan-600 text-white border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Color Palette */}
            <div>
              <label className="text-[11px] text-slate-300 block mb-1 font-medium">Base Color Hue:</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#94a3b8'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCustomColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      customColor === c ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Mass Multiplier Input & Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>Mass:</span>
                <span className="font-mono text-cyan-400 font-bold text-xs">
                  {(customMass / 5.9722e24).toFixed(2)} M⊕ ({customMass.toExponential(2)} kg)
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="500"
                step="0.05"
                value={customMass / 5.9722e24}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) * 5.9722e24;
                  setCustomMass(val);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0.01 M⊕ (Moon)</span>
                <span>1.0 M⊕ (Earth)</span>
                <span>500 M⊕ (Super-Jupiter)</span>
              </div>
            </div>

            {/* Radius Input & Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span>Radius:</span>
                <span className="font-mono text-cyan-400 font-bold text-xs">
                  {customRadiusKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km ({(customRadiusKm / 6371).toFixed(2)} R⊕)
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="120000"
                step="500"
                value={customRadiusKm}
                onChange={(e) => setCustomRadiusKm(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>500 km</span>
                <span>6,371 km</span>
                <span>120,000 km</span>
              </div>
            </div>

            {/* Atmospheric & Rings Feature Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
              <label className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={customHasAtmosphere}
                  onChange={(e) => setCustomHasAtmosphere(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Atmosphere Halo</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded bg-slate-900 border border-slate-800 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={customHasRings}
                  onChange={(e) => setCustomHasRings(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Planetary Rings</span>
              </label>
            </div>

            {/* Live Calculated Physics Telemetry Preview Card */}
            <div className="bg-slate-900/90 p-2.5 rounded border border-cyan-900/40 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-semibold">
                <span>Calculated Property</span>
                <span>Value</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Surface Gravity g:</span>
                <span className="text-amber-400 font-bold">{customG.toFixed(2)} m/s²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Escape Velocity v_e:</span>
                <span className="text-emerald-400 font-bold">{(customVesc / 1000).toFixed(2)} km/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mean Density ρ:</span>
                <span className="text-slate-200">{customDensity.toFixed(0)} kg/m³</span>
              </div>
            </div>

            <button
              onClick={handleCustomApply}
              className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Apply Custom Body to Simulation</span>
            </button>
          </div>
        )}

        {/* Section 4 & 5: Measurement Lines Toggles */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            3D Distance Measurements
          </span>
          <div className="space-y-1 text-xs">
            <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                Planet Radius (R) [Center → Surface]
              </span>
              <input
                type="checkbox"
                checked={showMeasurements.radius}
                onChange={() => onToggleMeasurement('radius')}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                Altitude (h) [Surface → Spacecraft]
              </span>
              <input
                type="checkbox"
                checked={showMeasurements.altitude}
                onChange={() => onToggleMeasurement('altitude')}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0"></span>
                Total Distance (r) [Center → Spacecraft]
              </span>
              <input
                type="checkbox"
                checked={showMeasurements.distance}
                onChange={() => onToggleMeasurement('distance')}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Section 12: Visual Vectors Toggles */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            Physics Vector Arrows
          </span>
          <div className="space-y-1 text-xs">
            <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                Velocity Vector (v) [Tangent]
              </span>
              <input
                type="checkbox"
                checked={showVectors.velocity}
                onChange={() => onToggleVector('velocity')}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
                Gravitational Accel (g) [Inward]
              </span>
              <input
                type="checkbox"
                checked={showVectors.acceleration}
                onChange={() => onToggleVector('acceleration')}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-orange-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                Force Vector (F = mg)
              </span>
              <input
                type="checkbox"
                checked={showVectors.force}
                onChange={() => onToggleVector('force')}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Scene Environment Toggles */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scene Options</span>
          <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
            <span>Show Equatorial Grid</span>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={onToggleGrid}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-2 min-h-[44px] rounded-lg hover:bg-slate-900/80 cursor-pointer active:bg-slate-800 transition">
            <span>Predict Future Orbit</span>
            <input
              type="checkbox"
              checked={showPredictedOrbit}
              onChange={onTogglePredictedOrbit}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
            />
          </label>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Camera Presets</span>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
            <button
              onClick={() => onSelectCameraPreset('body')}
              className={`p-2.5 min-h-[44px] rounded-lg border transition active:scale-[0.98] ${
                cameraPreset === 'body'
                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Planet
            </button>
            <button
              onClick={() => onSelectCameraPreset('spacecraft')}
              className={`p-2.5 min-h-[44px] rounded-lg border transition active:scale-[0.98] ${
                cameraPreset === 'spacecraft'
                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Craft
            </button>
            <button
              onClick={() => onSelectCameraPreset('top')}
              className={`p-2.5 min-h-[44px] rounded-lg border transition active:scale-[0.98] ${
                cameraPreset === 'top'
                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Top-Down
            </button>
            <button
              onClick={() => onSelectCameraPreset('iso')}
              className={`p-2.5 min-h-[44px] rounded-lg border transition active:scale-[0.98] ${
                cameraPreset === 'iso'
                  ? 'bg-blue-600 border-blue-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Iso 3D
            </button>
            <button
              onClick={() => onSelectCameraPreset('reset')}
              className="col-span-2 p-2.5 min-h-[44px] rounded-lg border bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 active:scale-[0.98] transition font-medium"
            >
              Reset View
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
