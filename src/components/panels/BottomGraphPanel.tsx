/**
 * Bottom Graph Panel & Simulation Controls:
 * Interactive Real-Time Graphs (g vs r with moving marker, v(t), r(t), E(t)),
 * Simulation Time Controls (Play, Pause, Step, 1x-1000x), and Scale Toggles.
 */
import React, { useState, useRef } from 'react';
import { CelestialBody, OrbitalParameters } from '../../types/physics';
import { G } from '../../physics/constants';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  LineChart,
  Clock,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface BottomGraphPanelProps {
  body: CelestialBody;
  orbitalParams: OrbitalParameters;
  historyTimeData: Array<{ time: number; v: number; r: number; K: number; U: number; E: number }>;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onResetSimulation: () => void;
  timeScale: number;
  onSetTimeScale: (scale: number) => void;
  visualScale: number;
  onSetVisualScale: (scale: number) => void;
}

type GraphTab = 'gravity-distance' | 'velocity-time' | 'distance-time' | 'energy-time';

export const BottomGraphPanel: React.FC<BottomGraphPanelProps> = ({
  body,
  orbitalParams,
  historyTimeData,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onResetSimulation,
  timeScale,
  onSetTimeScale,
  visualScale,
  onSetVisualScale,
}) => {
  const [activeTab, setActiveTab] = useState<GraphTab>('gravity-distance');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const startHeightRef = useRef(220);

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    dragStartYRef.current = e.touches[0].clientY;
    startHeightRef.current = dragHeight || (isCollapsed ? 48 : isExpanded ? 320 : 200);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = dragStartYRef.current - e.touches[0].clientY;
    const newH = Math.max(48, Math.min(window.innerHeight * 0.85, startHeightRef.current + deltaY));
    setDragHeight(newH);
    if (newH <= 60) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
      setIsExpanded(newH > 270);
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    startHeightRef.current = dragHeight || (isCollapsed ? 48 : isExpanded ? 320 : 200);

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = dragStartYRef.current - ev.clientY;
      const newH = Math.max(48, Math.min(window.innerHeight * 0.85, startHeightRef.current + deltaY));
      setDragHeight(newH);
      if (newH <= 60) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setIsExpanded(newH > 270);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Graph dimensions
  const svgWidth = 650;
  const svgHeight = dragHeight ? Math.max(90, dragHeight - 70) : isExpanded ? 240 : 130;
  const margin = { top: 15, right: 30, bottom: 28, left: 55 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  // Data for g vs r curve: from R to 6 * R
  const rMin = body.radius;
  const rMax = body.radius * 6;
  const gMax = (G * body.mass) / (rMin * rMin);

  // Map r to X coordinate, g to Y coordinate
  const mapRToX = (r: number) => {
    const clampedR = Math.max(rMin, Math.min(rMax, r));
    return margin.left + ((clampedR - rMin) / (rMax - rMin)) * plotWidth;
  };

  const mapGToY = (g: number) => {
    const clampedG = Math.max(0, Math.min(gMax, g));
    return margin.top + plotHeight - (clampedG / gMax) * plotHeight;
  };

  // Generate points for theoretical g(r) curve
  const curvePoints: string[] = [];
  const numSteps = 50;
  for (let i = 0; i <= numSteps; i++) {
    const r = rMin + (i / numSteps) * (rMax - rMin);
    const g = (G * body.mass) / (r * r);
    const x = mapRToX(r);
    const y = mapGToY(g);
    curvePoints.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const curvePathD = curvePoints.join(' ');

  // Current spacecraft marker coordinates
  const currentMarkerX = mapRToX(orbitalParams.r);
  const currentMarkerY = mapGToY(orbitalParams.g);

  const containerHeightStyle = dragHeight !== null ? { height: `${dragHeight}px` } : undefined;

  return (
    <div
      style={containerHeightStyle}
      className={`w-full bg-slate-900/98 sm:bg-slate-900/95 border-t border-slate-800 flex flex-col select-none z-20 transition-all ${
        dragHeight === null
          ? isCollapsed
            ? 'h-12'
            : isExpanded
            ? 'h-80 sm:h-72'
            : 'h-56 sm:h-48'
          : ''
      }`}
    >
      {/* Draggable handle for touch and mouse resize */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className="w-full h-3 bg-slate-950 hover:bg-slate-800/80 cursor-row-resize flex items-center justify-center shrink-0 group transition"
        title="Drag up/down to adjust section height"
      >
        <div className="w-12 h-1 bg-slate-600 group-hover:bg-cyan-400 rounded-full transition-colors" />
      </div>

      {/* Panel Controls Header */}
      <div className="px-2 sm:px-4 py-1.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/95 gap-2 overflow-x-auto no-scrollbar">
        {/* Playback Controls (Section 20) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onTogglePlay}
            className={`px-2.5 py-1.5 min-h-[36px] rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-sm active:scale-[0.98] transition whitespace-nowrap ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Simulate'}</span>
          </button>

          <button
            onClick={onStepForward}
            disabled={isPlaying}
            className="px-2 py-1.5 min-h-[36px] rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-40 text-slate-200 text-xs font-medium flex items-center gap-1 transition whitespace-nowrap"
            title="Step simulation forward by 1 timestep"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Step</span>
          </button>

          <button
            onClick={onResetSimulation}
            className="px-2 py-1.5 min-h-[36px] rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 transition whitespace-nowrap"
            title="Reset trajectory time and histories"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Trace</span>
          </button>

          {/* Time Multipliers (Section 20) */}
          <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-mono shrink-0">
            <span className="text-[10px] text-slate-400 px-1 hidden md:flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Warp:
            </span>
            {[1, 10, 100, 1000].map((scale) => (
              <button
                key={scale}
                onClick={() => onSetTimeScale(scale)}
                className={`px-1.5 py-1 min-h-[32px] rounded transition ${
                  timeScale === scale
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ×{scale}
              </button>
            ))}
          </div>

          {/* Visual Scale Zoom (Section 21) - Visible on all devices */}
          <div className="flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-lg border border-cyan-900/60 text-xs font-mono shrink-0">
            <span className="text-[10px] text-cyan-400 px-1 hidden sm:inline">Zoom:</span>
            {[1, 10, 100, 1000].map((scale) => (
              <button
                key={scale}
                onClick={() => onSetVisualScale(scale)}
                className={`px-1.5 py-1 min-h-[32px] rounded transition ${
                  visualScale === scale
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title={`Set Zoom to ${scale}×`}
              >
                {scale}×
              </button>
            ))}
          </div>
        </div>

        {/* Graph Tabs (Section 7 & 26) */}
        <div className="flex items-center gap-1 shrink-0">
          {!isCollapsed && (
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs font-medium">
              <button
                onClick={() => setActiveTab('gravity-distance')}
                className={`px-2 py-1 min-h-[32px] rounded flex items-center gap-1 transition whitespace-nowrap ${
                  activeTab === 'gravity-distance'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LineChart className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">g(r) vs r</span>
                <span className="sm:hidden">g(r)</span>
              </button>
              <button
                onClick={() => setActiveTab('velocity-time')}
                className={`px-2 py-1 min-h-[32px] rounded flex items-center gap-1 transition whitespace-nowrap ${
                  activeTab === 'velocity-time'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>v(t)</span>
              </button>
              <button
                onClick={() => setActiveTab('distance-time')}
                className={`px-2 py-1 min-h-[32px] rounded flex items-center gap-1 transition whitespace-nowrap ${
                  activeTab === 'distance-time'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>r(t)</span>
              </button>
              <button
                onClick={() => setActiveTab('energy-time')}
                className={`px-2 py-1 min-h-[32px] rounded flex items-center gap-1 transition whitespace-nowrap ${
                  activeTab === 'energy-time'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>E(t)</span>
              </button>
            </div>
          )}

          {!isCollapsed && (
            <button
              onClick={() => {
                setDragHeight(null);
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 min-h-[36px] min-w-[36px] rounded text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition flex items-center justify-center"
              title={isExpanded ? 'Collapse Height' : 'Maximize Height'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => {
              setDragHeight(null);
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1.5 min-h-[36px] min-w-[36px] rounded text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition flex items-center justify-center"
            title={isCollapsed ? 'Show Full Graphs' : 'Hide Graphs'}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Graph Display Area */}
      {!isCollapsed && (
        <div className="flex-1 px-2.5 sm:px-4 py-1 sm:py-1.5 flex items-center justify-between gap-4 sm:gap-6 overflow-hidden">
          {/* Left Side: SVG Scientific Graph */}
          <div className="flex-1 h-full flex items-center overflow-hidden">
            {activeTab === 'gravity-distance' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full max-h-full overflow-visible font-mono text-[10px]"
                >
                  {/* Graph Background Grid */}
                  <rect
                    x={margin.left}
                    y={margin.top}
                    width={plotWidth}
                    height={plotHeight}
                    fill="#030712"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />

                  {/* Grid Lines Horizontal */}
                  {[0.25, 0.5, 0.75, 1.0].map((frac) => {
                    const y = margin.top + plotHeight - frac * plotHeight;
                    const gVal = frac * gMax;
                    return (
                      <g key={frac}>
                        <line
                          x1={margin.left}
                          y1={y}
                          x2={margin.left + plotWidth}
                          y2={y}
                          stroke="#1e293b"
                          strokeDasharray="3 3"
                        />
                        <text x={margin.left - 6} y={y + 3} fill="#64748b" textAnchor="end">
                          {gVal >= 10 ? gVal.toFixed(0) : gVal.toFixed(1)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Grid Lines Vertical */}
                  {[1, 2, 3, 4, 5, 6].map((mult) => {
                    const rVal = body.radius * mult;
                    const x = mapRToX(rVal);
                    return (
                      <g key={mult}>
                        <line
                          x1={x}
                          y1={margin.top}
                          x2={x}
                          y2={margin.top + plotHeight}
                          stroke="#1e293b"
                          strokeDasharray="3 3"
                        />
                        <text x={x} y={margin.top + plotHeight + 14} fill="#64748b" textAnchor="middle">
                          {mult}R
                        </text>
                      </g>
                    );
                  })}

                  {/* Y Axis Label */}
                  <text
                    x={12}
                    y={margin.top + plotHeight / 2}
                    fill="#94a3b8"
                    textAnchor="middle"
                    transform={`rotate(-90 12 ${margin.top + plotHeight / 2})`}
                    className="font-sans font-medium"
                  >
                    g (m/s²)
                  </text>

                  {/* X Axis Label */}
                  <text
                    x={margin.left + plotWidth / 2}
                    y={margin.top + plotHeight + 25}
                    fill="#94a3b8"
                    textAnchor="middle"
                    className="font-sans font-medium"
                  >
                    Distance from Center (r in units of R = {(body.radius / 1000).toFixed(0)} km)
                  </text>

                  {/* Theoretical g = GM / r^2 Inverse Square Curve */}
                  <path d={curvePathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

                  {/* Moving Current Spacecraft Marker (Section 7) */}
                  <g transform={`translate(${currentMarkerX}, ${currentMarkerY})`}>
                    {/* Outer pulsating ring */}
                    <circle r="7" fill="#f59e0b" fillOpacity="0.25" className="animate-ping" />
                    {/* Center solid indicator */}
                    <circle r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />

                    {/* Dynamic Marker Tooltip Callout */}
                    <g transform="translate(10, -10)">
                      <rect x="0" y="-14" width="135" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                      <text x="6" y="2" fill="#f8fafc" className="font-mono text-[9.5px]">
                        r: {(orbitalParams.r / 1000).toFixed(0)} km | g: {orbitalParams.g.toFixed(2)}
                      </text>
                    </g>
                  </g>
                </svg>
              </div>
            ) : (
              /* Time Series Graphs (v(t), r(t), E(t)) */
              <div className="w-full h-full flex flex-col justify-center text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span>
                    Telemetry Stream: {activeTab === 'velocity-time' ? 'Speed v(t)' : activeTab === 'distance-time' ? 'Distance r(t)' : 'Energy E(t)'}
                  </span>
                  <span>{historyTimeData.length} records recorded</span>
                </div>
                <div className="w-full h-24 bg-slate-950 rounded border border-slate-800 p-2 flex items-end gap-1 overflow-x-auto">
                  {historyTimeData.slice(-40).map((pt, i) => {
                    let heightPct = 50;
                    if (activeTab === 'velocity-time') {
                      heightPct = Math.min(100, (pt.v / (orbitalParams.vEscape * 1.4)) * 100);
                    } else if (activeTab === 'distance-time') {
                      heightPct = Math.min(100, (pt.r / (body.radius * 6)) * 100);
                    } else {
                      heightPct = Math.min(100, Math.max(10, 50 + (pt.E / Math.abs(pt.U || 1)) * 50));
                    }
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500 hover:bg-amber-400 transition-all rounded-t min-w-[4px]"
                        style={{ height: `${Math.max(4, heightPct)}%` }}
                        title={`t=${pt.time.toFixed(1)}s, val=${pt.v.toFixed(0)}`}
                      ></div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Educational Principle Recap (Hidden on mobile / tablet to allow full graph space) */}
          <div className="hidden xl:flex w-80 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] flex-col justify-between shrink-0">
            <div className="font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800/80 pb-1">
              <span>Class 11 Core Principle</span>
              <span className="text-amber-400 text-[10px] font-mono">g ∝ 1/r²</span>
            </div>

            <div className="py-1 text-slate-400 leading-relaxed space-y-1">
              <p>
                <strong className="text-slate-200">Inverse-Square Law:</strong> Gravitational acceleration decreases as the square of the distance from the center.
              </p>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-300 bg-slate-900 px-2 py-1 rounded">
                <span>At r = 1R (surface):</span>
                <span className="text-amber-400">g = {body.surfaceGravity.toFixed(2)} m/s²</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] text-slate-300 bg-slate-900 px-2 py-1 rounded">
                <span>At r = 2R (doubled):</span>
                <span className="text-amber-400">g = {(body.surfaceGravity / 4).toFixed(2)} m/s²</span>
              </div>
            </div>

            <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 border-t border-slate-800/60 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span>Blue line = Exact Newtonian g = GM/r²</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
