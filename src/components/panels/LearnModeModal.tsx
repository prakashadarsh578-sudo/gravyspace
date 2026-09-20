/**
 * Class 11 Learn Mode Modal (Section 22)
 * Intuitive conceptual breakdowns for Class 11 Physics students:
 * - Newton's Cannon and "Falling Around Earth"
 * - The Inverse-Square Law: g = GM / r²
 * - Why satellites don't fall down: Gravity changes DIRECTION, not just speed
 * - Escape Velocity: Kinetic Energy vs Gravitational Potential Energy
 * - Kepler's Laws: Circular vs Elliptical vs Hyperbolic Orbits
 * - Black Holes: Event Horizon and Schwarzschild Radius
 */
import React, { useState } from 'react';
import { BookOpen, X, Lightbulb, Compass, Orbit, ArrowRight, ShieldCheck } from 'lucide-react';

interface LearnModeModalProps {
  onClose: () => void;
}

export const LearnModeModal: React.FC<LearnModeModalProps> = ({ onClose }) => {
  const [selectedTopic, setSelectedTopic] = useState<number>(0);

  const topics = [
    {
      title: '1. Why Doesn’t an Orbiting Satellite Fall Down?',
      subtitle: 'The Secret of "Falling Around Earth"',
      icon: Orbit,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p className="text-sm font-semibold text-white">
            "The spacecraft is moving forward because of its velocity, but Earth’s gravity continuously pulls it toward Earth."
          </p>
          <p>
            Imagine standing on top of a very tall mountain and firing a cannon horizontally:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-200">
            <li>If fired at low speed, gravity pulls it down and it crashes into the ground.</li>
            <li>If fired faster, it travels farther before hitting the ground.</li>
            <li>
              Because the Earth is round (curved), if the cannonball travels fast enough (~7.9 km/s at surface),
              the surface of the Earth curves away beneath it at the exact same rate that gravity pulls it downward!
            </li>
          </ul>
          <div className="bg-blue-950/60 border border-blue-800/80 p-3 rounded-lg text-blue-200">
            <strong className="block text-white mb-1">Key Class 11 Insight:</strong>
            An orbiting spacecraft is actually in perpetual free-fall! It doesn't stay up because gravity is zero;
            gravity is very strong in low orbit (~8.7 m/s²). It stays up because its forward sideways velocity is so fast that it keeps missing the planet.
          </div>
        </div>
      ),
    },
    {
      title: '2. The Inverse-Square Law of Gravity',
      subtitle: 'g = GM / r² and r = R + h',
      icon: Lightbulb,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p className="text-sm font-semibold text-white">
            Newton’s Law of Universal Gravitation: F = GMm / r²
          </p>
          <p>
            Dividing by the spacecraft mass <span className="font-mono text-cyan-300">m</span> yields the gravitational acceleration:
          </p>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-center text-amber-400 text-sm">
            g(r) = GM / r²
          </div>
          <p>
            Crucial distinction: <strong className="text-white">r is measured from the center of mass</strong>, NOT from the surface!
          </p>
          <div className="bg-slate-900/80 p-3 rounded border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <div>r = R + h</div>
            <div className="text-[11px] text-slate-400">R = Planet radius, h = altitude above surface</div>
          </div>
          <p>
            If you move to twice the distance from Earth’s center (r = 2R, so altitude h = 6,371 km):
          </p>
          <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded text-amber-200">
            g = GM / (2R)² = (GM / R²) / 4 = g_surface / 4 ≈ 9.81 / 4 = <strong>2.45 m/s²</strong>
          </div>
        </div>
      ),
    },
    {
      title: '3. What Determines the Shape of an Orbit?',
      subtitle: 'Circular, Elliptical, Parabolic, Hyperbolic',
      icon: Compass,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p className="text-sm font-semibold text-white">
            The trajectory depends purely on the velocity at a given distance:
          </p>
          <div className="space-y-2">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-rose-400">v &lt; v_circular: Suborbital Fall</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Gravity pulls the spacecraft inward faster than its forward speed can sustain. The trajectory strikes the planet surface.
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-cyan-400">v = v_circular = √(GM / r): Circular Orbit (e ≈ 0)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Centripetal acceleration exactly matches gravity. Distance r and speed v remain constant.
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-blue-400">v_circular &lt; v &lt; v_escape: Bound Elliptical Orbit (0 &lt; e &lt; 1)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kepler's First Law! The spacecraft swings outward to apoapsis (slowing down), then falls back to periapsis (speeding up).
              </p>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <span className="font-bold text-emerald-400">v ≥ v_escape = √(2GM / r): Escape Trajectory (e ≥ 1)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                The spacecraft has sufficient kinetic energy to overcome the gravitational potential well completely and never return.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '4. Energy Conservation in Orbits',
      subtitle: 'Why Bound Orbits Have Negative Total Energy',
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-300">
          <p className="text-sm font-semibold text-white">
            Total Mechanical Energy: E = K + U
          </p>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-center text-xs space-y-1">
            <div className="text-emerald-400">Kinetic Energy: K = ½ m v² &gt; 0</div>
            <div className="text-rose-400">Potential Energy: U = - GMm / r &lt; 0 (zero at infinity)</div>
            <div className="text-blue-400 font-bold border-t border-slate-800 pt-1">Total Energy: E = ½mv² - GMm/r</div>
          </div>
          <p>
            Gravitational potential energy is defined as zero at infinite distance. Because gravity is attractive, potential energy close to a planet is <strong className="text-rose-400">negative</strong>.
          </p>
          <div className="bg-indigo-950/40 border border-indigo-800/60 p-3 rounded-lg text-indigo-200">
            <p>
              If <strong className="text-white">E &lt; 0</strong>: The spacecraft is in a <strong>bound orbit</strong>. It cannot escape to infinity because that would require positive energy.
            </p>
            <p className="mt-1">
              If <strong className="text-white">E ≥ 0</strong>: Kinetic energy equals or exceeds the potential debt. The spacecraft achieves <strong>escape velocity</strong>!
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-display">Class 11 Physics: Gravitation Core Concepts</h2>
              <p className="text-xs text-slate-400">Intuitive explanations designed for NCERT / CBSE Class 11</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Topic Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-800 bg-slate-950/60 text-xs font-semibold">
          {topics.map((t, idx) => {
            const Icon = t.icon;
            const isActive = selectedTopic === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedTopic(idx)}
                className={`py-2.5 sm:py-3 px-2 sm:px-3 border-b-2 text-left transition flex items-center gap-2 min-h-[44px] ${
                  isActive
                    ? 'border-emerald-500 bg-slate-900 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-[11px] sm:text-xs">{t.title.split('.')[1] || t.title}</span>
              </button>
            );
          })}
        </div>

        {/* Topic Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white font-display">{topics[selectedTopic].title}</h3>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">{topics[selectedTopic].subtitle}</p>
          </div>
          {topics[selectedTopic].content}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs">
          <span className="text-slate-400 text-center sm:text-left text-[11px]">Interact with the 3D controls to test these exact principles.</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 min-h-[44px] rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition active:scale-[0.98]"
          >
            Got it, Return to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
