# 🌌 3D Gravity & Orbital Mechanics Simulator

An interactive, scientifically rigorous 3D educational physics laboratory and orbital flight simulator designed for students, educators, and space enthusiasts. Explore Newton's law of universal gravitation, Keplerian orbital dynamics, multi-body gravitational fields, escape trajectories, and energy conservation in real time.

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Physics & Mathematical Engine](#-physics--mathematical-engine)
- [Simulation Modes](#-simulation-modes)
- [User Guide & How to Use](#-user-guide--how-to-use)
  - [3D Viewport Controls](#3d-viewport-controls)
  - [Launching an Orbit](#launching-an-orbit)
  - [Achieving Escape Velocity](#achieving-escape-velocity)
  - [Using the Solar System Mode](#using-the-solar-system-mode)
  - [Multi-Body Gravitational Superposition](#multi-body-gravitational-superposition)
  - [Guided Experiments & Data Logging](#guided-experiments--data-logging)
- [Setup & Installation](#-setup--installation)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Production Build](#production-build)
  - [Available Scripts](#available-scripts)
- [Project Architecture](#-project-architecture)
- [Formulas & Reference Constants](#-formulas--reference-constants)
- [Browser Support & Performance](#-browser-support--performance)

---

## 🔭 Overview

The **3D Gravity & Orbital Mechanics Simulator** transforms abstract gravitational physics into an intuitive, visual, and highly responsive interactive 3D laboratory. Users can launch virtual satellites around real or custom celestial bodies, manipulate altitude, tangential velocity, and flight-path angle, and immediately observe:

1. **Instant Trajectory Prediction**: Real-time analytical calculation of the complete conic orbit (conic section type, apoapsis, periapsis, eccentricity, and collision alerts).
2. **Vector Visualization**: True-scale dynamic 3D vector arrows for tangential velocity ($\vec{v}$ in emerald), gravitational acceleration ($\vec{g}$ in amber), and gravitational force ($\vec{F}$ in rose).
3. **Mechanical Energy Conservation**: Live energy plots demonstrating kinetic energy ($K$), potential energy ($U$), and total specific orbital energy ($\mathcal{E}$) along eccentric trajectories.
4. **Curriculum Alignment**: Built-in Class 11 Physics laboratory modules covering Newton's Cannon, the inverse-square law, Kepler's laws, escape velocity, and relativistic black hole Schwarzschild event horizons.

---

## ✨ Key Features

### 🪐 1. High-Fidelity 3D Graphics (Three.js)
- **Procedural Planetary Textures**: High-resolution generated surface textures for Earth (with continental shelves, atmosphere, and cloud layers), the Moon (impact cratering), Mars (iron-oxide deserts and polar caps), Jupiter (turbulent atmospheric bands and the Great Red Spot), Saturn (ring system), the Sun (pulsing solar corona), and a supermassive Black Hole (photon sphere and relativistic accretion disk).
- **Deep Space Cosmos**: 3,500+ stars with realistic temperature-based spectral coloring (blue giants, amber dwarfs, white main-sequence stars).
- **Target Reticles & Visual Helpers**: Real-time planet selection indicators, equatorial reference grids, and distance measurement geometry indicators ($r = R + h$).

### 🚀 2. Realistic Orbital Mechanics Engine
- **Numerical Integration**: High-precision physics loop ensuring stability across extreme gravitational gradients.
- **Instant Conic Section Classifier**:
  - **Collision / Fall** ($r \le R$): Surface impact detection.
  - **Sub-Orbital** ($e < 1$, $r_p \le R$): Elliptical path intersecting the surface.
  - **Circular Orbit** ($e \approx 0$, $v \approx v_{\text{circ}}$): Perfectly balanced centripetal motion.
  - **Elliptical Orbit** ($0 < e < 1$, $r_p > R$): Stable bound Keplerian orbit.
  - **Parabolic Trajectory** ($e = 1$, $v = v_{\text{esc}}$): Marginal parabolic escape.
  - **Hyperbolic Trajectory** ($e > 1$, $v > v_{\text{esc}}$): Unbound open escape into interstellar space.

### 📊 3. Live Analytical Telemetry & Graphs
- **Telemetry HUD**: Real-time display of altitude ($h$), radial distance ($r$), instantaneous velocity ($v$), radial/tangential velocity components ($v_r, v_t$), gravitational field strength ($g$), gravitational force ($F$), escape velocity ($v_{\text{esc}}$), orbital period ($T$), eccentricity ($e$), apoapsis ($r_a$), and periapsis ($r_p$).
- **Interactive SVG Graphs**:
  - **$g$ vs $r$**: Theoretical inverse-square curve $g(r) = \frac{GM}{r^2}$ with a moving marker tracking current craft altitude.
  - **$v(t)$**: Velocity variation along eccentric orbits (fastest at periapsis, slowest at apoapsis).
  - **$r(t)$**: Radial distance oscillation over time.
  - **$E(t)$**: Live verification of mechanical energy conservation ($E = K + U = \text{constant}$).

### 🌞 4. Solar System Mode
- Full 8-planet planetary simulator (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune) orbiting the central Sun.
- **Dual Scale Modes**:
  - **Educational Mode**: Visually optimized spacing and scaled radii for clear observation of simultaneous planetary motion.
  - **Real Mode (1:1)**: True astronomical AU distances and orbital periods.
- **Interactive Planet Targeting**: Click or tap any planet in the 3D viewport to lock camera focus and open live Vis-Viva telemetry, solar distance, gravitational attraction, and Kepler's Third Law ratio ($T^2/a^3$).
- **Cross-Lab Integration**: 1-click button to load any selected solar planet directly into the Single-Body laboratory.

### 🌌 5. Multi-Body Gravitation Mode
- Simulates the superposition of gravitational fields:
  $$\vec{g}_{\text{net}} = \sum_{i=1}^{N} - \frac{G M_i}{|\vec{r} - \vec{r}_i|^3} (\vec{r} - \vec{r}_i)$$
- Toggle celestial influences (Earth, Moon, Fixed Space Station/Asteroids).
- Real-time gravitational pull breakdown displaying percentage contribution, distance, and individual vector magnitudes.

### 🛠️ 6. Custom Celestial Body Workshop
- Customize your own planet or star:
  - Adjust mass from $10^{18}\text{ kg}$ to $10^{32}\text{ kg}$.
  - Adjust radius from $100\text{ km}$ to $200,000\text{ km}$.
  - Select surface types: Rocky, Ocean, Desert, Gas Giant, Ice, Lava, Star, or Black Hole.
  - Configure atmospheric glow and planetary rings.
  - Live recalculation of surface gravity ($g_0$), escape velocity ($v_{\text{esc}, 0}$), and mean density ($\rho$).

---

## 📐 Physics & Mathematical Engine

The simulation is built on standard Newtonian gravitation and Keplerian orbital mechanics:

| Parameter | Formula | Description |
| :--- | :--- | :--- |
| **Gravitational Acceleration** | $g(r) = \frac{G M}{r^2}$ | Local gravitational field strength at distance $r = R + h$ |
| **Gravitational Force** | $F(r) = \frac{G M m}{r^2}$ | Force exerted on spacecraft mass $m$ |
| **Circular Velocity** | $v_{\text{circ}} = \sqrt{\frac{G M}{r}}$ | Velocity required for a circular orbit ($F_g = F_c$) |
| **Escape Velocity** | $v_{\text{esc}} = \sqrt{\frac{2 G M}{r}} = \sqrt{2} \cdot v_{\text{circ}}$ | Minimum velocity needed to overcome gravitational potential |
| **Vis-Viva Equation** | $v^2 = G M \left(\frac{2}{r} - \frac{1}{a}\right)$ | Relates instantaneous speed $v$, distance $r$, and semi-major axis $a$ |
| **Specific Orbital Energy** | $\mathcal{E} = \frac{v^2}{2} - \frac{G M}{r} = -\frac{G M}{2a}$ | Total specific mechanical energy (conserved in orbit) |
| **Orbital Eccentricity** | $e = \sqrt{1 + \frac{2 \mathcal{E} h_s^2}{(G M)^2}}$ | Shape of conic section ($h_s = |\vec{r} \times \vec{v}|$) |
| **Orbital Period (Kepler's 3rd)** | $T = 2\pi \sqrt{\frac{a^3}{G M}}$ | Period of revolution for closed elliptical orbit ($a > 0$) |
| **Schwarzschild Radius** | $r_s = \frac{2 G M}{c^2}$ | Event horizon radius for black holes |

*Universal Gravitational Constant:* $G = 6.67430 \times 10^{-11} \text{ m}^3 \text{ kg}^{-1} \text{ s}^{-2}$  
*Speed of Light:* $c = 2.99792 \times 10^8 \text{ m/s}$

---

## 🕹️ Simulation Modes

1. **Single-Body Laboratory**:
   - The primary playground. Place a craft at any altitude around Earth, Moon, Mars, Jupiter, the Sun, a Black Hole, or a Custom World.
   - Adjust tangential velocity and launch angle, visualize real-time trajectories, and step through time.
2. **Solar System Mode**:
   - Explore all 8 planets revolving around the Sun according to Keplerian velocity profiles.
   - Switch between Educational and Real scales, click any planet to view real-time orbital metrics.
3. **Multi-Body Gravitational Field**:
   - Observe a spacecraft navigating the overlapping gravitational fields of Earth, the Moon, and secondary masses.
   - Inspect vector superposition and relative pull percentages.
4. **Class 11 Guided Experiments**:
   - **Experiment 1**: Gravitational Acceleration vs. Altitude (validating the inverse-square law).
   - **Experiment 2**: Determining Stable Circular Orbital Velocity.
   - **Experiment 3**: Elliptical Orbits & Kepler's Laws (speed variation at periapsis vs. apoapsis).
   - **Experiment 4**: Escape Velocity & Kinetic Energy Threshold.
   - Integrated data recording table to log parameters and review findings.
5. **Learn Mode**:
   - Six interactive illustrated theory modules breaking down Newton's Cannon, free-fall mechanics, Keplerian geometry, escape velocity derivations, and black holes.

---

## 📖 User Guide & How to Use

### 3D Viewport Controls
- **Rotate / Orbit View**: Left-click and drag (or single-finger drag on mobile/touchscreens).
- **Pan View**: Right-click and drag (or two-finger drag on touchscreens).
- **Zoom In / Out**: Scroll mouse wheel (or pinch-to-zoom on touchscreens).
- **Quick Camera Presets**:
  - Click **Free Orbit** for standard 3D orbiting.
  - Click **Top-Down** to observe orbital planes perpendicular to the equator.
  - Click **Chase** to lock camera tracking behind the spacecraft.
  - Click **Equator** for edge-on inclination inspection.

### Launching an Orbit
1. In the **Left Sidebar**, select a celestial body (e.g., **Earth**).
2. Set the initial altitude slider (e.g., **$400\text{ km}$** for Low Earth Orbit).
3. In the **Right Telemetry Panel**, click **Auto: Set Circular Velocity ($v_{\text{circ}}$)**.
4. Set the Flight Path Angle to **$0^\circ$** (purely tangential horizontal velocity).
5. Click **Apply Velocity** (or **Launch / Reset Spacecraft**).
6. In the **Bottom Panel**, press **Play** ($\blacktriangleright$).
7. Observe the spacecraft orbit with constant radius, circular speed, and centripetal acceleration pointing directly toward the planet's center.

### Achieving Escape Velocity
1. With the spacecraft in orbit, increase velocity using the speed slider until $v \ge v_{\text{esc}}$ (for $400\text{ km}$ around Earth, $v_{\text{esc}} \approx 10.8\text{ km/s}$).
2. You can also click the quick preset **Set Escape Velocity ($v_{\text{esc}}$)**.
3. Notice the predicted trajectory turns green and opens into a **Hyperbolic Escape Trajectory**.
4. Press **Play** and watch the spacecraft permanently break free from the gravitational pull of the planet into deep space.

### Using the Solar System Mode
1. Click **Solar System** in the top navigation bar.
2. In the 3D viewport, click on any planet (e.g., **Jupiter** or **Mars**).
3. The selected planet is highlighted with an animated targeting reticle.
4. The **Solar System Telemetry Panel** displays:
   - Distance from Sun ($r$) in AU and kilometers.
   - Instantaneous Vis-Viva orbital speed ($v$) and escape velocity from the Sun.
   - Gravitational pull from the Sun ($F_{\odot}$ and $g_{\odot}$).
   - Kepler's Third Law constant ($T^2 / a^3$).
5. Click **Load into Single-Body Lab** to isolate that planet for high-detail satellite launching experiments.

### Multi-Body Gravitational Superposition
1. Click **Multi-Body** in the top navigation bar.
2. Toggle on the secondary bodies (e.g., **Moon** or **Space Station**).
3. The panel displays individual gravitational acceleration vectors ($\vec{g}_1, \vec{g}_2, \dots$) and the resulting net vector $\vec{g}_{\text{net}}$.
4. Observe the pull balance as the spacecraft approaches the gravitational neutral point between bodies.

### Guided Experiments & Data Logging
1. Click **Experiments** in the top navigation bar.
2. Select any of the 4 curriculum experiments.
3. Click **Load Experiment Setup** to automatically position the spacecraft with recommended initial conditions.
4. Observe the results and click **Record Current Data Point** to save the values to the experimental data table.
5. Export or compare data points against theoretical predictions.

---

## 💻 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) version **18.x** or higher (recommended: 20+).
- `npm` (comes with Node.js) or `yarn` / `pnpm`.

### Local Development

1. **Clone the repository or unpack the source directory:**
   ```bash
   git clone <repository-url>
   cd 3d-gravity-simulator
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) (the default configured port).

### Production Build

To build the optimized static assets for production deployment:

```bash
npm run build
```

This compiles TypeScript and bundles the application with Vite into the `dist/` directory.

To test and preview the production build locally:

```bash
npm run preview
```

### Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite --port=3000 --host=0.0.0.0` | Starts the Vite dev server with host binding on port 3000 |
| `npm run build` | `vite build` | Compiles and bundles production static assets into `dist/` |
| `npm run preview` | `vite preview` | Previews the production build locally |
| `npm run lint` | `tsc --noEmit` | Runs the TypeScript compiler check for type errors |
| `npm run clean` | `rm -rf dist server.js` | Cleans previous build artifacts |

---

## 🏛️ Project Architecture

```
├── index.html                           # HTML5 entry point with viewport & metadata
├── metadata.json                        # Applet capabilities & permissions
├── package.json                         # Project dependencies and npm scripts
├── vite.config.ts                       # Vite build configuration with Tailwind v4
├── tsconfig.json                        # TypeScript compiler options
├── src/
│   ├── main.tsx                         # React 19 application mount point & error guards
│   ├── App.tsx                          # Core application orchestrator, state & responsive layout
│   ├── index.css                        # Global Tailwind CSS imports
│   ├── types/
│   │   └── physics.ts                   # Comprehensive TypeScript interfaces & domain types
│   ├── physics/
│   │   ├── constants.ts                 # Astronomical constants (G, planets, unit formatters)
│   │   └── engine.ts                    # Keplerian solvers, Vis-Viva, multi-body gravitational engine
│   └── components/
│       ├── canvas/
│       │   ├── SpaceScene.tsx           # Three.js 3D viewport, camera controls, vectors & renderer
│       │   └── planetTextures.ts        # Procedural canvas texture generators for planets/stars
│       └── panels/
│           ├── LeftSidebar.tsx          # Celestial body selector, custom body editor & layer toggles
│           ├── RightTelemetry.tsx       # Live orbital parameters, velocity sliders & launch presets
│           ├── BottomGraphPanel.tsx     # Real-time SVG graphs (g vs r, v(t), E(t)) & time controls
│           ├── SolarSystemControls.tsx  # Solar System telemetry HUD, planet selector & scale toggles
│           ├── MultiBodyControls.tsx    # Multi-body gravitational field breakdown & vector metrics
│           ├── ExperimentModal.tsx      # Guided Class 11 physics experiments & data logging table
│           └── LearnModeModal.tsx       # Illustrated educational theory modules
```

---

## 🧮 Formulas & Reference Constants

### Celestial Presets
| Body | Mass ($M$) | Mean Radius ($R$) | Surface $g$ | Surface $v_{\text{esc}}$ |
| :--- | :--- | :--- | :--- | :--- |
| **Earth** | $5.972 \times 10^{24}\text{ kg}$ | $6,371\text{ km}$ | $9.82\text{ m/s}^2$ | $11.19\text{ km/s}$ |
| **Moon** | $7.348 \times 10^{22}\text{ kg}$ | $1,737\text{ km}$ | $1.62\text{ m/s}^2$ | $2.38\text{ km/s}$ |
| **Mars** | $6.417 \times 10^{23}\text{ kg}$ | $3,390\text{ km}$ | $3.73\text{ m/s}^2$ | $5.03\text{ km/s}$ |
| **Jupiter** | $1.898 \times 10^{27}\text{ kg}$ | $69,911\text{ km}$ | $25.92\text{ m/s}^2$ | $60.20\text{ km/s}$ |
| **Sun** | $1.989 \times 10^{30}\text{ kg}$ | $696,340\text{ km}$ | $274.0\text{ m/s}^2$ | $617.7\text{ km/s}$ |
| **Black Hole (10 $M_\odot$)** | $1.989 \times 10^{31}\text{ kg}$ | $29.53\text{ km}$ ($r_s$) | Relativistic | $c$ ($300,000\text{ km/s}$) |

---

## 🌐 Browser Support & Performance

- **Supported Browsers**: Chrome 90+, Edge 90+, Firefox 88+, Safari 15+, and mobile browsers on iOS/Android.
- **WebGL Acceleration**: Uses hardware-accelerated WebGL 2.0 with antialiasing and soft shadow mapping.
- **Adaptive Resolution**: Automatically caps device pixel ratio at `2.0` on high-DPI retina screens to sustain 60 FPS performance.
- **Responsive Layout**: Designed with responsive breakpoints supporting mobile devices, tablets, laptops, and ultra-wide desktop monitors. Mobile layouts include slide-out touch drawer headers and touch-target padding (min 44px).

---

## 📄 License

This project is built for educational and exploratory purposes. Free to use for teaching, learning, and academic physics simulations.
