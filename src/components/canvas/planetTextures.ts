/**
 * Procedural Texture Generator for Photorealistic 3D Celestial Bodies
 * Generates Canvas-backed textures for Three.js with zero external image dependencies.
 */
import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getCelestialTexture(
  type: string,
  color?: string,
  surfaceType?: 'rocky' | 'ocean' | 'desert' | 'gas' | 'ice' | 'lava' | 'star' | 'blackhole'
): THREE.CanvasTexture {
  const cacheKey = type === 'custom' ? `custom_${color || 'default'}_${surfaceType || 'rocky'}` : type;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  switch (type) {
    case 'earth':
      generateEarthTexture(ctx, canvas.width, canvas.height);
      break;
    case 'moon':
      generateMoonTexture(ctx, canvas.width, canvas.height);
      break;
    case 'mars':
      generateMarsTexture(ctx, canvas.width, canvas.height);
      break;
    case 'jupiter':
      generateJupiterTexture(ctx, canvas.width, canvas.height);
      break;
    case 'sun':
      generateSunTexture(ctx, canvas.width, canvas.height);
      break;
    case 'blackhole':
      generateBlackHoleTexture(ctx, canvas.width, canvas.height);
      break;
    case 'saturn':
      generateSaturnTexture(ctx, canvas.width, canvas.height);
      break;
    case 'mercury':
      generateMercuryTexture(ctx, canvas.width, canvas.height);
      break;
    case 'venus':
      generateVenusTexture(ctx, canvas.width, canvas.height);
      break;
    case 'uranus':
      generateUranusTexture(ctx, canvas.width, canvas.height);
      break;
    case 'neptune':
      generateNeptuneTexture(ctx, canvas.width, canvas.height);
      break;
    case 'custom':
    default:
      generateCustomTexture(ctx, canvas.width, canvas.height, color, surfaceType);
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

function generateEarthTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Deep oceanic blue
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, '#0a2342');
  oceanGrad.addColorStop(0.5, '#0c356a');
  oceanGrad.addColorStop(1, '#0a2342');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, w, h);

  // Continents (procedural organic shapes)
  ctx.fillStyle = '#2d6a4f';
  for (let i = 0; i < 45; i++) {
    const cx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
    const cy = (Math.cos(i * 33) * 0.4 + 0.5) * h;
    const rad = 50 + (i % 6) * 35;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fill();

    // Mountain/desert highlights
    ctx.fillStyle = '#b7791f';
    ctx.beginPath();
    ctx.arc(cx + 15, cy - 10, rad * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d6a4f';
  }

  // Polar ice caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, w, h * 0.08);
  ctx.fillRect(0, h * 0.92, w, h * 0.08);

  // Atmospheric cloud bands (translucent white wisps)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  for (let j = 0; j < 30; j++) {
    ctx.beginPath();
    const y = ((j * 37) % h);
    ctx.ellipse(w * 0.5, y, w * 0.6, 12 + (j % 4) * 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function generateMoonTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#83878f';
  ctx.fillRect(0, 0, w, h);

  // Dark basalt maria
  ctx.fillStyle = '#4b5563';
  for (let i = 0; i < 20; i++) {
    const cx = (Math.sin(i * 12.3) * 0.5 + 0.5) * w;
    const cy = (Math.cos(i * 7.7) * 0.5 + 0.5) * h;
    ctx.beginPath();
    ctx.arc(cx, cy, 60 + (i % 5) * 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Impact craters
  for (let c = 0; c < 120; c++) {
    const cx = (Math.sin(c * 43.1) * 0.5 + 0.5) * w;
    const cy = (Math.cos(c * 19.3) * 0.5 + 0.5) * h;
    const rad = 4 + (c % 8) * 4;

    // Rim highlight
    ctx.strokeStyle = 'rgba(240, 240, 240, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.stroke();

    // Crater interior shadow
    ctx.fillStyle = 'rgba(30, 30, 35, 0.6)';
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, rad * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
}

function generateMarsTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#7f1d1d');
  grad.addColorStop(0.5, '#c2410c');
  grad.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Dark volcanic basalt regions (Syrtis Major)
  ctx.fillStyle = '#451a03';
  for (let i = 0; i < 25; i++) {
    const cx = (Math.sin(i * 15.3) * 0.5 + 0.5) * w;
    const cy = (Math.cos(i * 11.2) * 0.4 + 0.5) * h;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 70 + (i % 4) * 40, 35 + (i % 3) * 20, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Polar ice caps (CO2/water frost)
  ctx.fillStyle = '#fef2f2';
  ctx.fillRect(0, 0, w, h * 0.05);
  ctx.fillRect(0, h * 0.95, w, h * 0.05);
}

function generateJupiterTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Alternating atmospheric belts and zones
  const bands = 36;
  const bandHeight = h / bands;
  const colors = ['#fde68a', '#d97706', '#b45309', '#fef3c7', '#92400e', '#fed7aa'];

  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(0, i * bandHeight, w, bandHeight);

    // Turbulent swirl streaks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect((i * 70) % w, i * bandHeight, w * 0.4, bandHeight * 0.5);
  }

  // The Great Red Spot
  const grsX = w * 0.65;
  const grsY = h * 0.68;
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.ellipse(grsX, grsY, 55, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function generateSunTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, '#fef08a');
  grad.addColorStop(0.7, '#f59e0b');
  grad.addColorStop(1, '#ea580c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Solar granulation and flares
  for (let i = 0; i < 250; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const rad = 2 + Math.random() * 8;
    ctx.fillStyle = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(180, 83, 9, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
}

function generateBlackHoleTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Pure pitch black event horizon
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);
}

function generateSaturnTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bands = 28;
  const bandHeight = h / bands;
  const colors = ['#fef3c7', '#fde68a', '#fbbf24', '#fef08a', '#d97706'];

  for (let i = 0; i < bands; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(0, i * bandHeight, w, bandHeight);
  }
}

function generateMercuryTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = 'rgba(209, 213, 219, 0.2)';
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

function generateVenusTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.5, '#eab308');
  grad.addColorStop(1, '#ca8a04');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function generateUranusTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#7dd3fc');
  grad.addColorStop(0.5, '#38bdf8');
  grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function generateNeptuneTexture(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.5, '#2563eb');
  grad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Neptune dark storm spot
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(w * 0.4, h * 0.5, 45, 22, 0, 0, Math.PI * 2);
  ctx.fill();
}

function generateCustomTexture(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  baseColor: string = '#06b6d4',
  surfaceType: string = 'rocky'
) {
  const base = baseColor || '#06b6d4';

  if (surfaceType === 'ocean') {
    // Deep Ocean with continents and cloud swirls
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Continents
    ctx.fillStyle = '#10b981';
    for (let i = 0; i < 35; i++) {
      const cx = (Math.sin(i * 47) * 0.5 + 0.5) * w;
      const cy = (Math.cos(i * 29) * 0.4 + 0.5) * h;
      const rad = 40 + (i % 5) * 30;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    // Atmospheric swirls
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let j = 0; j < 20; j++) {
      const y = (j / 20) * h;
      ctx.fillRect(0, y, w, 6 + (j % 4) * 3);
    }
  } else if (surfaceType === 'gas') {
    // Banded Gas Giant
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, base);
    grad.addColorStop(0.25, '#ffffff');
    grad.addColorStop(0.5, base);
    grad.addColorStop(0.75, '#1e293b');
    grad.addColorStop(1, base);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Turbulent cloud bands
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
      const y = (i / 40) * h + (Math.sin(i) * 5);
      ctx.fillRect(0, y, w, h / 40);
    }
    // Great Storm oval
    ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.beginPath();
    ctx.ellipse(w * 0.65, h * 0.6, 50, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (surfaceType === 'desert') {
    // Desert / Dunes
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, '#78350f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#b45309';
    for (let i = 0; i < 40; i++) {
      const cx = (Math.sin(i * 61) * 0.5 + 0.5) * w;
      const cy = (Math.cos(i * 37) * 0.4 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(cx, cy, 30 + (i % 4) * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (surfaceType === 'lava') {
    // Volcanic / Molten Lava
    ctx.fillStyle = '#0f0f12';
    ctx.fillRect(0, 0, w, h);

    // Glowing magma rivers
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i / 15) * h);
      ctx.bezierCurveTo(w * 0.3, (i / 15) * h + 40, w * 0.7, (i / 15) * h - 40, w, (i / 15) * h);
      ctx.stroke();
    }
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i / 15) * h);
      ctx.bezierCurveTo(w * 0.3, (i / 15) * h + 40, w * 0.7, (i / 15) * h - 40, w, (i / 15) * h);
      ctx.stroke();
    }
  } else if (surfaceType === 'ice') {
    // Ice World
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glacial rift cracks
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let i = 0; i < 25; i++) {
      const x = (i / 25) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.sin(i * 12) * 50), h);
      ctx.stroke();
    }
  } else if (surfaceType === 'star') {
    // Glowing Star
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, '#f97316');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Solar granules
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 50; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + Math.random() * 20, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Default: Rocky cratered world
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.5, base);
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Craters
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
      const cx = (Math.sin(i * 89) * 0.5 + 0.5) * w;
      const cy = (Math.cos(i * 53) * 0.45 + 0.5) * h;
      const r = 12 + (i % 6) * 12;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}
