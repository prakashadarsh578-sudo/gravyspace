/**
 * Class 11 Physics Experiments Guided Modal (Section 23)
 * Provides interactive guided steps, data logging, theoretical questions,
 * and automated setup for the 4 curriculum experiments.
 */
import React, { useState } from 'react';
import { CelestialBody, OrbitalParameters } from '../../types/physics';
import { CELESTIAL_BODIES, formatDistance, formatVelocity } from '../../physics/constants';
import { Sparkles, CheckCircle2, ChevronRight, X, Play, RotateCcw, Award } from 'lucide-react';

interface ExperimentModalProps {
  onClose: () => void;
  onApplyExperimentSetup: (body: CelestialBody, altitudeKm: number, velocityKmS: number, angleDeg: number) => void;
  currentBody: CelestialBody;
  currentOrbitalParams: OrbitalParameters;
}

interface ExperimentDataRow {
  altitudeKm: number;
  rKm: number;
  gravity: number;
  velocityKmS: number;
  state: string;
}

export const ExperimentModal: React.FC<ExperimentModalProps> = ({
  onClose,
  onApplyExperimentSetup,
  currentBody,
  currentOrbitalParams,
}) => {
  const [activeExpId, setActiveExpId] = useState<number>(1);
  const [recordedRows, setRecordedRows] = useState<ExperimentDataRow[]>([]);

  // 4 Predefined Experiments from Master Prompt Section 23
  const experiments = [
    {
      id: 1,
      title: 'Experiment 1: Gravity and Height',
      question: 'How does gravitational acceleration change as altitude increases?',
      description: 'Investigate Newton’s inverse-square law g(r) = GM / r² by testing gravitational acceleration at Earth’s surface, low orbit, GPS orbit, and deep space.',
      body: CELESTIAL_BODIES.earth,
      setup: { altitudeKm: 400, velocityKmS: 7.67, angleDeg: 0 },
      steps: [
        'Place the spacecraft at Low Earth Orbit (h = 400 km). Record g.',
        'Double the distance from Earth’s center (h ≈ 6,371 km). Notice how g drops by a factor of 4!',
        'Move to high altitude (h = 20,000 km) and observe the steep falloff of gravitational pull.',
      ],
      theory: 'Because g = GM / r² where r = R + h, doubling r reduces g to 1/4th (25%) of its surface value.',
    },
    {
      id: 2,
      title: 'Experiment 2: Circular Orbital Velocity',
      question: 'What velocity is required for a stable circular orbit?',
      description: 'Calculate and verify the exact tangential speed needed for centripetal acceleration to equal gravitational acceleration: v_circ = √(GM / r).',
      body: CELESTIAL_BODIES.earth,
      setup: { altitudeKm: 1000, velocityKmS: 7.35, angleDeg: 0 },
      steps: [
        'Select an altitude (e.g. h = 1,000 km).',
        'Observe the calculated circular speed: v_circ = 7.35 km/s.',
        'Launch at this exact velocity and inspect the eccentricity (e ≈ 0.000).',
        'Notice how the altitude remains nearly constant as the spacecraft circles Earth.',
      ],
      theory: 'For circular motion, centripetal force mv²/r = GMm/r², which simplifies to v = √(GM/r).',
    },
    {
      id: 3,
      title: 'Experiment 3: Escape Velocity Threshold',
      question: 'How fast must the spacecraft travel to escape Earth’s gravitational well?',
      description: 'Gradually increase launch speed from circular velocity up to and beyond escape velocity v_esc = √(2GM / r) to observe the transition from closed ellipse to open hyperbola.',
      body: CELESTIAL_BODIES.earth,
      setup: { altitudeKm: 500, velocityKmS: 10.9, angleDeg: 0 },
      steps: [
        'Observe current circular velocity (~7.6 km/s) and escape velocity (~10.9 km/s).',
        'Launch at 9.0 km/s: notice an elongated elliptical orbit (bound, E < 0).',
        'Launch at 10.9 km/s: notice parabolic escape trajectory with total energy E ≈ 0.',
        'Launch at 13.0 km/s: notice hyperbolic escape with positive excess velocity at infinity.',
      ],
      theory: 'Escape velocity is derived from energy conservation: ½mv² - GMm/r = 0, giving v_esc = √(2GM/r).',
    },
    {
      id: 4,
      title: 'Experiment 4: Planetary Gravitational Comparison',
      question: 'How do planetary mass and radius govern surface gravity and escape speed?',
      description: 'Compare Earth, Moon, Mars, Jupiter, and Sun to see how astronomical mass and compactness dictate gravitational fields.',
      body: CELESTIAL_BODIES.jupiter,
      setup: { altitudeKm: 5000, velocityKmS: 42.0, angleDeg: 0 },
      steps: [
        'Compare Earth (g = 9.8 m/s²) to the Moon (g = 1.6 m/s²). Notice why astronauts could leap easily on the lunar surface.',
        'Switch to Mars (g = 3.7 m/s²): escape velocity is only 5.0 km/s compared to Earth’s 11.2 km/s.',
        'Switch to Jupiter: massive mass produces 24.8 m/s² surface gravity and 59.5 km/s escape speed!',
      ],
      theory: 'Surface gravity depends directly on M and inversely on R²: g = GM / R².',
    },
    {
      id: 5,
      title: 'Experiment 5: Kepler’s Laws (Elliptical Orbits & Equal Areas)',
      question: 'Why are orbits elliptical rather than circular, and how does velocity change between periapsis and apoapsis?',
      description: 'Investigate Kepler’s 1st and 2nd Laws by setting an initial tangential speed between circular and escape velocity to trace an eccentric ellipse with the central body at one focus.',
      body: CELESTIAL_BODIES.earth,
      setup: { altitudeKm: 600, velocityKmS: 8.75, angleDeg: 0 },
      steps: [
        'Launch with v = 8.75 km/s (greater than circular speed 7.56 km/s, but below escape speed 10.69 km/s).',
        'Observe Kepler’s 1st Law: the spacecraft traces an ellipse with Earth located at one focus (eccentricity e ≈ 0.35).',
        'Watch Kepler’s 2nd Law in action: the probe accelerates as it swings through periapsis (closest point) and slows down toward apoapsis (farthest point).',
        'Inspect conservation of angular momentum L = m r v_tangent.',
      ],
      theory: 'Kepler’s 1st Law states that all planets move in elliptical orbits with the central body at one focus. By Kepler’s 2nd Law (areal velocity is constant), r_p · v_p = r_a · v_a.',
    },
  ];

  const currentExp = experiments.find((e) => e.id === activeExpId)!;

  const handleRecordCurrentData = () => {
    const newRow: ExperimentDataRow = {
      altitudeKm: currentOrbitalParams.h / 1000,
      rKm: currentOrbitalParams.r / 1000,
      gravity: currentOrbitalParams.g,
      velocityKmS: currentOrbitalParams.v / 1000,
      state: currentOrbitalParams.trajectoryType,
    };
    setRecordedRows((prev) => [...prev, newRow]);
  };

  const handleApplySetup = () => {
    onApplyExperimentSetup(
      currentExp.body,
      currentExp.setup.altitudeKm,
      currentExp.setup.velocityKmS,
      currentExp.setup.angleDeg
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Class 11 Physics Laboratory Experiments</h2>
              <p className="text-xs text-slate-400">Guided inquiry with data recording and theoretical synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/50 text-xs font-semibold">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                setActiveExpId(exp.id);
                setRecordedRows([]);
              }}
              className={`py-2.5 sm:py-3 px-2 sm:px-3 border-b-2 text-left transition flex items-center gap-2 min-h-[44px] ${
                activeExpId === exp.id
                  ? 'border-purple-500 bg-slate-900 text-purple-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] shrink-0">
                {exp.id}
              </span>
              <span className="truncate text-[11px] sm:text-xs">{exp.title.split(':')[1] || exp.title}</span>
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Question Banner */}
          <div className="bg-purple-950/40 border border-purple-800/50 p-3.5 rounded-lg">
            <span className="text-[11px] uppercase tracking-wider text-purple-400 font-semibold block">Core Question</span>
            <p className="text-sm font-bold text-white mt-0.5">{currentExp.question}</p>
            <p className="text-xs text-slate-300 mt-1">{currentExp.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guided Steps */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Experimental Protocol
              </span>
              <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                {currentExp.steps.map((step, idx) => (
                  <li key={idx} className="pl-1">
                    <span className="text-slate-200">{step}</span>
                  </li>
                ))}
              </ol>

              {/* Action Button: Load setup into 3D simulator */}
              <button
                onClick={handleApplySetup}
                className="w-full mt-2 py-2.5 px-3 min-h-[44px] rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Configure Simulator for this Experiment</span>
              </button>
            </div>

            {/* Theory & Physics Explanation */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Theoretical Derivation
              </span>
              <p className="text-slate-300 leading-relaxed">{currentExp.theory}</p>

              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 space-y-1">
                <div>Primary Body: {currentExp.body.name}</div>
                <div>Default Test Altitude: {currentExp.setup.altitudeKm} km</div>
                <div>Default Test Speed: {currentExp.setup.velocityKmS} km/s</div>
              </div>
            </div>
          </div>

          {/* Real-time Data Logger Table */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Live Measurement Data Log
                </span>
                <p className="text-[11px] text-slate-400">Record values from the active 3D simulator to test hypotheses</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRecordCurrentData}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log Current Probe State</span>
                </button>
                <button
                  onClick={() => setRecordedRows([])}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs font-mono text-left">
                <thead className="bg-slate-900 text-slate-400 text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Altitude (h)</th>
                    <th className="p-2">Distance (r = R + h)</th>
                    <th className="p-2">Gravity g(r)</th>
                    <th className="p-2">Velocity (v)</th>
                    <th className="p-2">Observed Trajectory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {recordedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 font-sans italic">
                        No telemetry points recorded yet. Click "Log Current Probe State" to add data.
                      </td>
                    </tr>
                  ) : (
                    recordedRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-900/50">
                        <td className="p-2 text-slate-500">{i + 1}</td>
                        <td className="p-2 text-amber-400">{row.altitudeKm.toFixed(0)} km</td>
                        <td className="p-2 text-cyan-400">{row.rKm.toFixed(0)} km</td>
                        <td className="p-2 font-bold text-slate-200">{row.gravity.toFixed(3)} m/s²</td>
                        <td className="p-2 text-emerald-400">{row.velocityKmS.toFixed(2)} km/s</td>
                        <td className="p-2 uppercase text-[10px] text-purple-300 font-semibold">{row.state}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Class 11 CBSE / ISC Physics Curriculum — Gravitation Chapter</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Return to 3D Space Lab
          </button>
        </div>
      </div>
    </div>
  );
};
