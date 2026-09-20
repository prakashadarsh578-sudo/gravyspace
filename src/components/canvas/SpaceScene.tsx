/**
 * Interactive 3D Space Laboratory Scene (Three.js)
 * Implements realistic planet rendering, spacecraft, dynamic measurement lines,
 * vector arrows, orbit prediction curves, trajectory trails, and camera controls.
 */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CelestialBody, Vector3D, OrbitalParameters } from '../../types/physics';
import { getCelestialTexture } from './planetTextures';
import { SOLAR_SYSTEM_BODIES } from '../../physics/constants';

interface SpaceSceneProps {
  body: CelestialBody;
  craftPos: Vector3D; // SI meters
  craftVel: Vector3D; // SI m/s
  orbitalParams: OrbitalParameters;
  predictedPath: Vector3D[]; // SI meters
  historyTrail: Vector3D[]; // SI meters
  showVectors: {
    velocity: boolean;
    acceleration: boolean;
    force: boolean;
  };
  showMeasurements: {
    radius: boolean;
    distance: boolean;
    altitude: boolean;
  };
  showGrid: boolean;
  showPredictedOrbit: boolean;
  mode: 'single' | 'solarsystem' | 'multibody' | 'experiments' | 'learn';
  multiBodies?: Array<{ id: string; name: string; mass: number; position: Vector3D; radius: number; color: string }>;
  multiBodyAccels?: Array<{ bodyId: string; name: string; accel: Vector3D; mag: number }>;
  netAccel?: Vector3D;
  solarScaleMode?: 'real' | 'educational';
  cameraPreset?: string;
  selectedSolarPlanetId?: string;
  onSelectSolarPlanet?: (planetId: string) => void;
  onCraftPositionDrag?: (newPosMeters: Vector3D) => void;
}

export const SpaceScene: React.FC<SpaceSceneProps> = ({
  body,
  craftPos,
  craftVel,
  orbitalParams,
  predictedPath,
  historyTrail,
  showVectors,
  showMeasurements,
  showGrid,
  showPredictedOrbit,
  mode,
  multiBodies,
  multiBodyAccels,
  netAccel,
  solarScaleMode = 'educational',
  cameraPreset,
  selectedSolarPlanetId = 'earth',
  onSelectSolarPlanet,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Object references inside the 3D scene
  const planetMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh | null>(null);
  const ringsMeshRef = useRef<THREE.Mesh | null>(null);
  const accretionDiskRef = useRef<THREE.Mesh | null>(null);
  const sunCoronaRef = useRef<THREE.Mesh | null>(null);
  const craftGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.PolarGridHelper | null>(null);
  const selectedPlanetMarkerRef = useRef<THREE.Mesh | null>(null);

  // Measurement lines
  const radiusLineRef = useRef<THREE.Line | null>(null);
  const distanceLineRef = useRef<THREE.Line | null>(null);
  const altitudeLineRef = useRef<THREE.Line | null>(null);

  // Vector arrows
  const velArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const accelArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const forceArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const multiBodyArrowsRef = useRef<THREE.ArrowHelper[]>([]);
  const netAccelArrowRef = useRef<THREE.ArrowHelper | null>(null);

  // Orbits & Trails
  const predictedLineRef = useRef<THREE.Line | null>(null);
  const historyLineRef = useRef<THREE.Line | null>(null);

  // Solar system objects
  const solarPlanetsRef = useRef<Map<string, { mesh: THREE.Mesh; orbitLine: THREE.Line }>>(new Map());

  // Camera control state & interaction tracking
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const touchStartPos = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({ radius: 28, theta: Math.PI / 4, phi: Math.PI / 3 });
  const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Dynamic prop synchronization refs for stable animation loop & events
  const onSelectSolarPlanetRef = useRef(onSelectSolarPlanet);
  onSelectSolarPlanetRef.current = onSelectSolarPlanet;

  const selectedSolarPlanetIdRef = useRef(selectedSolarPlanetId);
  selectedSolarPlanetIdRef.current = selectedSolarPlanetId;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Scale factor: visual planet radius = 5 units
  const SCENE_PLANET_RADIUS = 5.0;
  const metersToScene = (m: number) => (m / Math.max(1, body.radius)) * SCENE_PLANET_RADIUS;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Starfield Background (Deep realistic cosmos)
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 400 + Math.random() * 500;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Star tinting (slight blue, white, amber variance)
      const colorType = Math.random();
      if (colorType > 0.8) {
        starColors[i * 3] = 0.8;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 1.0;
      } else if (colorType > 0.6) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 0.7;
      } else {
        starColors[i * 3] = 0.95;
        starColors[i * 3 + 1] = 0.95;
        starColors[i * 3 + 2] = 0.95;
      }
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMat = new THREE.PointsMaterial({ size: 1.6, vertexColors: true, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.55);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(40, 25, 40);
    scene.add(dirLight);

    const softFill = new THREE.DirectionalLight(0x60a5fa, 0.5);
    softFill.position.set(-40, -15, -40);
    scene.add(softFill);

    // 6. Coordinate Polar Grid
    const polarGrid = new THREE.PolarGridHelper(30, 16, 8, 64, 0x334155, 0x1e293b);
    polarGrid.rotation.x = 0;
    gridHelperRef.current = polarGrid;
    scene.add(polarGrid);

    // Selected planet marker ring indicator
    const markerGeo = new THREE.RingGeometry(1.6, 1.95, 32);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.rotation.x = Math.PI / 2;
    markerMesh.visible = false;
    scene.add(markerMesh);
    selectedPlanetMarkerRef.current = markerMesh;

    // 7. Spacecraft Model Group
    const craftGroup = new THREE.Group();
    // Central capsule
    const podGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.8, 16);
    const podMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const podMesh = new THREE.Mesh(podGeo, podMat);
    podMesh.rotation.z = Math.PI / 2;
    craftGroup.add(podMesh);

    // Solar panels
    const panelGeo = new THREE.BoxGeometry(0.04, 0.5, 1.4);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, metalness: 0.6, roughness: 0.3 });
    const panelMesh = new THREE.Mesh(panelGeo, panelMat);
    craftGroup.add(panelMesh);

    // Beacon light
    const beaconGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0.4, 0, 0);
    craftGroup.add(beacon);

    craftGroupRef.current = craftGroup;
    scene.add(craftGroup);

    // 8. Measurement Lines setup
    const rMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 }); // Radius: Emerald Green
    const rGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(5, 0, 0)]);
    const rLine = new THREE.Line(rGeo, rMat);
    radiusLineRef.current = rLine;
    scene.add(rLine);

    const dMat = new THREE.LineDashedMaterial({ color: 0x06b6d4, dashSize: 0.4, gapSize: 0.2 }); // Total distance r: Cyan dashed
    const dGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)]);
    const dLine = new THREE.Line(dGeo, dMat);
    dLine.computeLineDistances();
    distanceLineRef.current = dLine;
    scene.add(dLine);

    const altMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 }); // Altitude h: Amber solid
    const altGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(5, 0, 0), new THREE.Vector3(10, 0, 0)]);
    const altLine = new THREE.Line(altGeo, altMat);
    altitudeLineRef.current = altLine;
    scene.add(altLine);

    // 9. Predicted Orbit Path line
    const predMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
    const predGeo = new THREE.BufferGeometry();
    const predLine = new THREE.Line(predGeo, predMat);
    predictedLineRef.current = predLine;
    scene.add(predLine);

    // 10. History Trail Ribbon
    const histMat = new THREE.LineBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.6 });
    const histGeo = new THREE.BufferGeometry();
    const histLine = new THREE.Line(histGeo, histMat);
    historyLineRef.current = histLine;
    scene.add(histLine);

    // 11. Vector Arrows
    // Velocity: Emerald Green
    const vArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 2, 0x10b981, 0.5, 0.3);
    velArrowRef.current = vArrow;
    scene.add(vArrow);

    // Gravitational Acceleration: Amber/Orange
    const aArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), 2, 0xf97316, 0.5, 0.3);
    accelArrowRef.current = aArrow;
    scene.add(aArrow);

    // Gravitational Force: Rose/Red
    const fArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 0), 2, 0xf43f5e, 0.6, 0.35);
    forceArrowRef.current = fArrow;
    scene.add(fArrow);

    // Resize Handler with ResizeObserver support & frame debouncing
    let lastWidth = 0;
    let lastHeight = 0;
    let resizeRafId: number | null = null;

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      if (Math.abs(w - lastWidth) < 1 && Math.abs(h - lastHeight) < 1) return;
      lastWidth = w;
      lastHeight = h;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h, false);
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      resizeRafId = requestAnimationFrame(() => {
        handleResize();
      });
    });
    resizeObserver.observe(container);

    // Mouse Controls (Orbit, Zoom, Pan)
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      mouseDownPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      if (e.buttons === 1) {
        // Left click drag: Rotate camera
        cameraSpherical.current.theta -= deltaX * 0.007;
        cameraSpherical.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cameraSpherical.current.phi - deltaY * 0.007));
        updateCameraPosition();
      } else if (e.buttons === 2) {
        // Right click drag: Pan camera
        const panSpeed = 0.02 * (cameraSpherical.current.radius / 25);
        cameraTarget.current.x -= deltaX * panSpeed;
        cameraTarget.current.z += deltaY * panSpeed;
        updateCameraPosition();
      }

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      isDragging.current = false;
      const dist = Math.hypot(e.clientX - mouseDownPos.current.x, e.clientY - mouseDownPos.current.y);
      if (dist < 8 && modeRef.current === 'solarsystem' && cameraRef.current) {
        const rect = dom.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
        const meshes: THREE.Object3D[] = [];
        solarPlanetsRef.current.forEach((obj) => meshes.push(obj.mesh));
        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const planetId = hit.userData?.planetId;
          if (planetId && onSelectSolarPlanetRef.current) {
            onSelectSolarPlanetRef.current(planetId);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      cameraSpherical.current.radius = Math.max(7, Math.min(300, cameraSpherical.current.radius * zoomFactor));
      updateCameraPosition();
    };

    // Touch Controls for Mobile Devices (Single-finger orbit, Two-finger pinch zoom)
    let initialPinchDistance: number | null = null;
    let initialCameraRadius: number = cameraSpherical.current.radius;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPinchDistance = null;
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.hypot(dx, dy);
        initialCameraRadius = cameraSpherical.current.radius;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      // Prevent default page scrolling when interacting with 3D canvas
      if (e.cancelable) e.preventDefault();

      if (e.touches.length === 1 && isDragging.current) {
        const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

        cameraSpherical.current.theta -= deltaX * 0.009;
        cameraSpherical.current.phi = Math.max(0.05, Math.min(Math.PI - 0.05, cameraSpherical.current.phi - deltaY * 0.009));
        updateCameraPosition();

        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && initialPinchDistance !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentPinchDistance = Math.hypot(dx, dy);

        if (initialPinchDistance > 10) {
          const pinchScale = initialPinchDistance / Math.max(10, currentPinchDistance);
          cameraSpherical.current.radius = Math.max(7, Math.min(300, initialCameraRadius * pinchScale));
          updateCameraPosition();
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        isDragging.current = false;
        initialPinchDistance = null;
        const touch = e.changedTouches[0];
        if (touch && modeRef.current === 'solarsystem' && cameraRef.current) {
          const dist = Math.hypot(touch.clientX - touchStartPos.current.x, touch.clientY - touchStartPos.current.y);
          if (dist < 12) {
            const rect = dom.getBoundingClientRect();
            const mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
            const meshes: THREE.Object3D[] = [];
            solarPlanetsRef.current.forEach((obj) => meshes.push(obj.mesh));
            const intersects = raycaster.intersectObjects(meshes, false);
            if (intersects.length > 0) {
              const hit = intersects[0].object as THREE.Mesh;
              const planetId = hit.userData?.planetId;
              if (planetId && onSelectSolarPlanetRef.current) {
                onSelectSolarPlanetRef.current(planetId);
              }
            }
          }
        }
      } else if (e.touches.length === 1) {
        // Reset drag reference for single touch continuation
        isDragging.current = true;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        initialPinchDistance = null;
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Mobile touch listeners
    dom.addEventListener('touchstart', onTouchStart, { passive: false });
    dom.addEventListener('touchmove', onTouchMove, { passive: false });
    dom.addEventListener('touchend', onTouchEnd, { passive: false });
    dom.addEventListener('touchcancel', onTouchEnd, { passive: false });

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate planet slowly
      if (planetMeshRef.current) {
        planetMeshRef.current.rotation.y += 0.001;
      }
      if (atmosphereMeshRef.current) {
        atmosphereMeshRef.current.rotation.y += 0.0012;
      }
      if (accretionDiskRef.current) {
        accretionDiskRef.current.rotation.z += 0.015;
      }

      // Animate solar system planets along their Keplerian elliptical orbits
      if (solarPlanetsRef.current.size > 0) {
        const timeSec = performance.now() * 0.0003;
        const eccMap: Record<string, number> = {
          mercury: 0.206,
          venus: 0.04,
          earth: 0.12,
          mars: 0.18,
          jupiter: 0.10,
          saturn: 0.11,
          uranus: 0.08,
          neptune: 0.06,
        };
        SOLAR_SYSTEM_BODIES.forEach((p, idx) => {
          const pObj = solarPlanetsRef.current.get(p.id);
          if (pObj) {
            const distScene = solarScaleMode === 'educational'
              ? 12 + idx * 7
              : (p.orbitalDistanceM / 1.496e11) * 20;
            const e = eccMap[p.id] || 0.1;
            const a = distScene;
            const b = a * Math.sqrt(Math.max(0.1, 1 - e * e));
            const c = a * e;
            const orbitalSpeed = (365 / p.orbitalPeriodDays) * 0.8;
            const angle = timeSec * orbitalSpeed + idx * 0.7;
            // Elliptical coordinates with Sun at focal point (0, 0, 0)
            pObj.mesh.position.set(-c + a * Math.cos(angle), 0, b * Math.sin(angle));
            pObj.mesh.rotation.y += 0.008;
          }
        });

        // Update target reticle marker on selected planet
        if (selectedPlanetMarkerRef.current) {
          const selectedId = selectedSolarPlanetIdRef.current;
          const pObj = selectedId ? solarPlanetsRef.current.get(selectedId) : null;
          if (pObj && modeRef.current === 'solarsystem') {
            selectedPlanetMarkerRef.current.visible = true;
            selectedPlanetMarkerRef.current.position.copy(pObj.mesh.position);
            selectedPlanetMarkerRef.current.rotation.z += 0.025;
          } else {
            selectedPlanetMarkerRef.current.visible = false;
          }
        }
      } else if (selectedPlanetMarkerRef.current) {
        selectedPlanetMarkerRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeRafId !== null) {
        cancelAnimationFrame(resizeRafId);
      }
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      dom.removeEventListener('touchcancel', onTouchEnd);
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
      renderer.dispose();
    };
  }, []);

  // Update Camera based on spherical coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    const x = radius * Math.sin(phi) * Math.sin(theta) + cameraTarget.current.x;
    const y = radius * Math.cos(phi) + cameraTarget.current.y;
    const z = radius * Math.sin(phi) * Math.cos(theta) + cameraTarget.current.z;
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(cameraTarget.current);
  };

  // Handle camera presets
  useEffect(() => {
    if (!cameraPreset) return;
    if (cameraPreset === 'body') {
      cameraTarget.current.set(0, 0, 0);
      cameraSpherical.current = { radius: 25, theta: Math.PI / 4, phi: Math.PI / 3 };
    } else if (cameraPreset === 'spacecraft' && craftGroupRef.current) {
      cameraTarget.current.copy(craftGroupRef.current.position);
      cameraSpherical.current = { radius: 10, theta: Math.PI / 4, phi: Math.PI / 3 };
    } else if (cameraPreset === 'top') {
      cameraTarget.current.set(0, 0, 0);
      cameraSpherical.current = { radius: 35, theta: 0, phi: 0.01 };
    } else if (cameraPreset === 'iso') {
      cameraTarget.current.set(0, 0, 0);
      cameraSpherical.current = { radius: 32, theta: Math.PI / 4, phi: Math.PI / 4 };
    } else if (cameraPreset === 'reset') {
      cameraTarget.current.set(0, 0, 0);
      cameraSpherical.current = { radius: 28, theta: Math.PI / 4, phi: Math.PI / 3 };
    }
    updateCameraPosition();
  }, [cameraPreset]);

  // Build/Rebuild the Central Celestial Body (Sphere, textures, atmospheres, rings, black hole disk)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up old body meshes
    if (planetMeshRef.current) {
      scene.remove(planetMeshRef.current);
      planetMeshRef.current.geometry.dispose();
      planetMeshRef.current = null;
    }
    if (atmosphereMeshRef.current) {
      scene.remove(atmosphereMeshRef.current);
      atmosphereMeshRef.current.geometry.dispose();
      atmosphereMeshRef.current = null;
    }
    if (ringsMeshRef.current) {
      scene.remove(ringsMeshRef.current);
      ringsMeshRef.current.geometry.dispose();
      ringsMeshRef.current = null;
    }
    if (accretionDiskRef.current) {
      scene.remove(accretionDiskRef.current);
      accretionDiskRef.current.geometry.dispose();
      accretionDiskRef.current = null;
    }
    if (sunCoronaRef.current) {
      scene.remove(sunCoronaRef.current);
      sunCoronaRef.current = null;
    }

    // Radius in 3D visual scene units
    const radius = SCENE_PLANET_RADIUS;
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);
    const texture = getCelestialTexture(body.textureType);

    if (body.isBlackHole) {
      // Black hole event horizon (pitch black sphere with zero light reflection)
      const blackMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const bhMesh = new THREE.Mesh(sphereGeo, blackMat);
      bhMesh.position.set(0, 0, 0);
      scene.add(bhMesh);
      planetMeshRef.current = bhMesh;

      // Accretion disk (incandescent swirling disk with Doppler beaming)
      const diskGeo = new THREE.RingGeometry(radius * 1.3, radius * 3.8, 64);
      const diskCanvas = document.createElement('canvas');
      diskCanvas.width = 512;
      diskCanvas.height = 512;
      const dctx = diskCanvas.getContext('2d')!;
      const dgrad = dctx.createRadialGradient(256, 256, 120, 256, 256, 256);
      dgrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      dgrad.addColorStop(0.25, 'rgba(245, 158, 11, 0.85)');
      dgrad.addColorStop(0.65, 'rgba(220, 38, 38, 0.4)');
      dgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      dctx.fillStyle = dgrad;
      dctx.fillRect(0, 0, 512, 512);

      const diskTex = new THREE.CanvasTexture(diskCanvas);
      const diskMat = new THREE.MeshBasicMaterial({
        map: diskTex,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      const diskMesh = new THREE.Mesh(diskGeo, diskMat);
      diskMesh.rotation.x = Math.PI / 2.3;
      scene.add(diskMesh);
      accretionDiskRef.current = diskMesh;

      // Photon Sphere ring at r = 1.5 * r_s
      const photonRingGeo = new THREE.RingGeometry(radius * 1.48, radius * 1.52, 64);
      const photonRingMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const photonRing = new THREE.Mesh(photonRingGeo, photonRingMat);
      photonRing.rotation.x = Math.PI / 2;
      scene.add(photonRing);

    } else if (body.textureType === 'sun') {
      // Sun (Emissive with corona glow)
      const sunMat = new THREE.MeshBasicMaterial({ map: texture });
      const sunMesh = new THREE.Mesh(sphereGeo, sunMat);
      scene.add(sunMesh);
      planetMeshRef.current = sunMesh;

      // Sun Corona Halo
      const coronaGeo = new THREE.SphereGeometry(radius * 1.15, 32, 32);
      const coronaMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide,
      });
      const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
      scene.add(coronaMesh);
      atmosphereMeshRef.current = coronaMesh;

    } else {
      // Standard terrestrial or gas giant planet
      const planetMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1,
      });
      const planetMesh = new THREE.Mesh(sphereGeo, planetMat);
      planetMesh.castShadow = true;
      planetMesh.receiveShadow = true;
      scene.add(planetMesh);
      planetMeshRef.current = planetMesh;

      // Atmosphere glow for Earth
      if (body.textureType === 'earth') {
        const atmoGeo = new THREE.SphereGeometry(radius * 1.035, 64, 64);
        const atmoMat = new THREE.MeshStandardMaterial({
          color: 0x60a5fa,
          transparent: true,
          opacity: 0.22,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
        });
        const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
        scene.add(atmoMesh);
        atmosphereMeshRef.current = atmoMesh;
      }

      // Saturn Rings
      if (body.textureType === 'saturn') {
        const ringGeo = new THREE.RingGeometry(radius * 1.3, radius * 2.3, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xe2c792,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.2;
        scene.add(ringMesh);
        ringsMeshRef.current = ringMesh;
      }
    }

    // Set Radius Measurement Line (CENTER -> SURFACE)
    if (radiusLineRef.current) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(radius, 0, 0),
      ]);
      radiusLineRef.current.geometry.dispose();
      radiusLineRef.current.geometry = geo;
    }
  }, [body]);

  // Update Spacecraft Position, Measurements, Vectors, Orbits in 3D Scene
  useEffect(() => {
    // 1. Convert physical meters to scene units
    const craftSceneX = metersToScene(craftPos.x);
    const craftSceneY = metersToScene(craftPos.y);
    const craftSceneZ = metersToScene(craftPos.z);
    const craftScenePos = new THREE.Vector3(craftSceneX, craftSceneY, craftSceneZ);

    // Update craft position
    if (craftGroupRef.current) {
      craftGroupRef.current.position.copy(craftScenePos);
      // Orient craft along its velocity vector
      const vLen = Math.sqrt(craftVel.x * craftVel.x + craftVel.y * craftVel.y + craftVel.z * craftVel.z);
      if (vLen > 0.001) {
        craftGroupRef.current.quaternion.setFromUnitVectors(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(craftVel.x / vLen, craftVel.y / vLen, craftVel.z / vLen)
        );
      }
    }

    // 2. Update Measurement Lines
    // Radius Line (Center -> Surface)
    if (radiusLineRef.current) {
      radiusLineRef.current.visible = showMeasurements.radius;
    }

    // Total Distance Line (Center -> Spacecraft)
    if (distanceLineRef.current) {
      distanceLineRef.current.visible = showMeasurements.distance;
      const dPoints = [new THREE.Vector3(0, 0, 0), craftScenePos];
      distanceLineRef.current.geometry.setFromPoints(dPoints);
      distanceLineRef.current.computeLineDistances();
    }

    // Altitude Line (Surface -> Spacecraft along radius direction)
    if (altitudeLineRef.current) {
      altitudeLineRef.current.visible = showMeasurements.altitude;
      const surfacePos = craftScenePos.clone().normalize().multiplyScalar(SCENE_PLANET_RADIUS);
      const altPoints = [surfacePos, craftScenePos];
      altitudeLineRef.current.geometry.setFromPoints(altPoints);
    }

    // 3. Update Vector Arrows
    // Velocity Vector (tangent to trajectory)
    if (velArrowRef.current) {
      velArrowRef.current.visible = showVectors.velocity;
      const vMag = Math.sqrt(craftVel.x * craftVel.x + craftVel.y * craftVel.y + craftVel.z * craftVel.z);
      if (vMag > 0.01) {
        const vDir = new THREE.Vector3(craftVel.x, craftVel.y, craftVel.z).normalize();
        velArrowRef.current.setDirection(vDir);
        velArrowRef.current.position.copy(craftScenePos);
        // Visual arrow length scaled logarithmically or clamped for clean laboratory display
        const arrowLength = Math.min(8, Math.max(1.5, Math.log10(vMag + 1) * 1.8));
        velArrowRef.current.setLength(arrowLength, arrowLength * 0.25, arrowLength * 0.15);
      }
    }

    // Gravitational Acceleration Vector (pointing inward toward center)
    if (accelArrowRef.current) {
      accelArrowRef.current.visible = showVectors.acceleration;
      if (orbitalParams.g > 0.001) {
        const aDir = craftScenePos.clone().negate().normalize();
        accelArrowRef.current.setDirection(aDir);
        accelArrowRef.current.position.copy(craftScenePos);
        const aLen = Math.min(6, Math.max(1.2, Math.log10(orbitalParams.g + 1) * 2.2));
        accelArrowRef.current.setLength(aLen, aLen * 0.25, aLen * 0.15);
      }
    }

    // Gravitational Force Vector
    if (forceArrowRef.current) {
      forceArrowRef.current.visible = showVectors.force;
      if (orbitalParams.F > 0.001) {
        const fDir = craftScenePos.clone().negate().normalize();
        forceArrowRef.current.setDirection(fDir);
        forceArrowRef.current.position.copy(craftScenePos);
        const fLen = Math.min(7, Math.max(1.5, Math.log10(orbitalParams.F + 1) * 0.9));
        forceArrowRef.current.setLength(fLen, fLen * 0.25, fLen * 0.15);
      }
    }

    // 4. Update Predicted Orbit Line (without disposing to eliminate flickering)
    if (predictedLineRef.current) {
      predictedLineRef.current.visible = showPredictedOrbit && predictedPath.length > 1;
      if (showPredictedOrbit && predictedPath.length > 1) {
        const scenePts = predictedPath.map(
          (p) => new THREE.Vector3(metersToScene(p.x), metersToScene(p.y), metersToScene(p.z))
        );
        predictedLineRef.current.geometry.setFromPoints(scenePts);
      }
    }

    // 5. Update History Trail (without disposing to eliminate flickering)
    if (historyLineRef.current) {
      if (historyTrail.length > 1) {
        const histPts = historyTrail.map(
          (p) => new THREE.Vector3(metersToScene(p.x), metersToScene(p.y), metersToScene(p.z))
        );
        historyLineRef.current.geometry.setFromPoints(histPts);
      }
    }

    // 6. Grid visibility
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [craftPos, craftVel, orbitalParams, predictedPath, historyTrail, showVectors, showMeasurements, showGrid, showPredictedOrbit]);

  // Solar System Mode Setup
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (mode === 'solarsystem') {
      // Hide central body
      if (planetMeshRef.current) planetMeshRef.current.visible = false;
      if (radiusLineRef.current) radiusLineRef.current.visible = false;
      if (distanceLineRef.current) distanceLineRef.current.visible = false;
      if (altitudeLineRef.current) altitudeLineRef.current.visible = false;

      // Create Sun at center
      let sunMesh = scene.getObjectByName('solar_sun') as THREE.Mesh;
      if (!sunMesh) {
        const sunGeo = new THREE.SphereGeometry(6, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.name = 'solar_sun';
        scene.add(sunMesh);
      }

      // Add planets with orbits
      SOLAR_SYSTEM_BODIES.forEach((p, idx) => {
        let pObj = solarPlanetsRef.current.get(p.id);
        const distScene = solarScaleMode === 'educational'
          ? 12 + idx * 7 // Clear educational distribution
          : (p.orbitalDistanceM / 1.496e11) * 20; // Real scale

        const pRadius = solarScaleMode === 'educational'
          ? 0.8 + (p.radius / 6.99e7) * 2.2
          : (p.radius / 6.96e8) * 6;

        if (!pObj) {
          const pGeo = new THREE.SphereGeometry(Math.max(0.5, pRadius), 24, 24);
          const pMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.6 });
          const pMesh = new THREE.Mesh(pGeo, pMat);
          pMesh.userData = { planetId: p.id, planetName: p.name };

          // True Keplerian elliptical orbit curve with Sun at one focus
          const eccMap: Record<string, number> = {
            mercury: 0.206,
            venus: 0.04,
            earth: 0.12,
            mars: 0.18,
            jupiter: 0.10,
            saturn: 0.11,
            uranus: 0.08,
            neptune: 0.06,
          };
          const e = eccMap[p.id] || 0.1;
          const a = distScene;
          const b = a * Math.sqrt(Math.max(0.1, 1 - e * e));
          const c = a * e; // Focus offset from geometric center

          const orbitCurve = new THREE.EllipseCurve(-c, 0, a, b, 0, 2 * Math.PI, false, 0);
          const points = orbitCurve.getPoints(96);
          const orbitGeo = new THREE.BufferGeometry().setFromPoints(
            points.map((pt) => new THREE.Vector3(pt.x, 0, pt.y))
          );
          const orbitMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 });
          const orbitLine = new THREE.Line(orbitGeo, orbitMat);
          scene.add(orbitLine);

          scene.add(pMesh);
          pObj = { mesh: pMesh, orbitLine };
          solarPlanetsRef.current.set(p.id, pObj);
        }

        // Initial planet position along elliptical orbit
        const eccMap: Record<string, number> = {
          mercury: 0.206,
          venus: 0.04,
          earth: 0.12,
          mars: 0.18,
          jupiter: 0.10,
          saturn: 0.11,
          uranus: 0.08,
          neptune: 0.06,
        };
        const e = eccMap[p.id] || 0.1;
        const a = distScene;
        const b = a * Math.sqrt(Math.max(0.1, 1 - e * e));
        const c = a * e;
        const angle = idx * 0.7;
        pObj.mesh.position.set(-c + a * Math.cos(angle), 0, b * Math.sin(angle));
      });

    } else {
      // Remove solar system objects if leaving mode
      const sunMesh = scene.getObjectByName('solar_sun');
      if (sunMesh) scene.remove(sunMesh);

      solarPlanetsRef.current.forEach((obj) => {
        scene.remove(obj.mesh);
        scene.remove(obj.orbitLine);
      });
      solarPlanetsRef.current.clear();

      if (planetMeshRef.current) planetMeshRef.current.visible = true;
    }
  }, [mode, solarScaleMode]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden" ref={mountRef}>
      {/* 3D Dynamic On-Screen Measurement Badges */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-10">
        <div className="bg-slate-900/85 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs shadow-xl flex flex-col gap-1.5 font-mono">
          <div className="text-[10px] tracking-wider uppercase text-slate-400 font-semibold border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>Visual Distance Geometry</span>
            <span className="text-cyan-400">r = R + h</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Planet Radius (R):</span>
            <span className="text-emerald-400 font-bold ml-auto">
              {(body.radius / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-300">Altitude (h):</span>
            <span className="text-amber-400 font-bold ml-auto">
              {(orbitalParams.h / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
            </span>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-800/80 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
            <span className="text-slate-200 font-medium">Distance from Center (r):</span>
            <span className="text-cyan-400 font-bold ml-auto">
              {(orbitalParams.r / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })} km
            </span>
          </div>
        </div>

        {/* Dynamic Trajectory Alert Banner */}
        {orbitalParams.isCollided ? (
          <div className="bg-rose-950/90 border border-rose-600/80 text-rose-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 animate-pulse shadow-lg">
            <span>⚠️ CRASHED ON SURFACE (r ≤ R)</span>
          </div>
        ) : orbitalParams.v >= orbitalParams.vEscape ? (
          <div className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>ESCAPE TRAJECTORY (v ≥ v_esc) — Open Hyperbolic Path</span>
          </div>
        ) : orbitalParams.v >= orbitalParams.vEscape * 0.9 ? (
          <div className="bg-amber-950/90 border border-amber-500/80 text-amber-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span>⚡ APPROACHING ESCAPE VELOCITY (v ≈ v_esc)</span>
          </div>
        ) : orbitalParams.trajectoryType === 'circular' ? (
          <div className="bg-cyan-950/90 border border-cyan-500/80 text-cyan-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span>✨ CIRCULAR ORBIT (v ≈ v_circ, e ≈ 0)</span>
          </div>
        ) : orbitalParams.trajectoryType === 'suborbital' ? (
          <div className="bg-orange-950/90 border border-orange-500/80 text-orange-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span>⚠️ SUB-ORBITAL (Periapsis falls below planet surface)</span>
          </div>
        ) : (
          <div className="bg-indigo-950/90 border border-indigo-500/80 text-indigo-200 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 shadow-lg">
            <span>🪐 BOUND ELLIPTICAL ORBIT (e = {orbitalParams.eccentricity.toFixed(3)})</span>
          </div>
        )}
      </div>

      {/* Vector Color Legend */}
      <div className="absolute bottom-4 left-4 pointer-events-none z-10 flex gap-2">
        {showVectors.velocity && (
          <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800 text-[11px] flex items-center gap-1.5 text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Velocity (v) — Tangential</span>
          </div>
        )}
        {showVectors.acceleration && (
          <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800 text-[11px] flex items-center gap-1.5 text-amber-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Gravity (g) — Inward to Center</span>
          </div>
        )}
        {showVectors.force && (
          <div className="bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800 text-[11px] flex items-center gap-1.5 text-rose-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Force (F = mg)</span>
          </div>
        )}
      </div>

      {/* Camera Guidance Hint */}
      <div className="absolute bottom-4 right-4 pointer-events-none z-10 bg-slate-900/70 backdrop-blur px-3 py-1 rounded border border-slate-800/80 text-[11px] text-slate-400 font-mono">
        Left-Click Drag: Rotate • Right-Click: Pan • Scroll: Zoom
      </div>
    </div>
  );
};
