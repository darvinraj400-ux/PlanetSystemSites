import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Sliders, Zap, Waves, Circle } from 'lucide-react';

type SimulationType = 'lensing' | 'pulsar' | 'nebula';

interface ObservatoryProps {
  isActive: boolean;
}

export function Observatory({ isActive }: ObservatoryProps) {
  const [activeSim, setActiveSim] = useState<SimulationType>('lensing');
  const [isPaused, setIsPaused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Simulation parameters
  const [params, setParams] = useState({
    intensity: 0.7,
    speed: 0.5,
    color1: '#4466ff',
    color2: '#ff44aa',
    density: 0.6,
  });

  const handleReset = useCallback(() => {
    setParams({ intensity: 0.7, speed: 0.5, color1: '#4466ff', color2: '#ff44aa', density: 0.6 });
    timeRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!isPaused) {
        timeRef.current += 0.016 * params.speed;
      }
      const t = timeRef.current;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      if (activeSim === 'lensing') {
        drawGravitationalLensing(ctx, w, h, t, params);
      } else if (activeSim === 'pulsar') {
        drawPulsar(ctx, w, h, t, params);
      } else {
        drawNebula(ctx, w, h, t, params);
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isActive, activeSim, isPaused, params]);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #030010 0%, #0a0520 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-white tracking-wide">The Observatory</h2>
          <p className="text-xs text-white/40 mt-1">Interactive cosmic phenomenon simulations</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}
          >
            {isPaused ? <Play size={16} className="text-white/70" /> : <Pause size={16} className="text-white/70" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Reset simulation"
          >
            <RotateCcw size={16} className="text-white/70" />
          </motion.button>
        </div>
      </div>

      {/* Simulation tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        <SimTab
          active={activeSim === 'lensing'}
          onClick={() => setActiveSim('lensing')}
          icon={<Circle size={14} />}
          label="Gravitational Lensing"
        />
        <SimTab
          active={activeSim === 'pulsar'}
          onClick={() => setActiveSim('pulsar')}
          icon={<Zap size={14} />}
          label="Pulsar"
        />
        <SimTab
          active={activeSim === 'nebula'}
          onClick={() => setActiveSim('nebula')}
          icon={<Waves size={14} />}
          label="Nebula"
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 relative mx-4 mb-4 rounded-xl overflow-hidden border border-white/5">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ minHeight: '300px' }}
        />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <p className="text-[10px] text-white/30 italic">
            {activeSim === 'lensing' && 'Artistic simulation of gravitational lensing — not to scale'}
            {activeSim === 'pulsar' && 'Simplified pulsar beam model — artistic interpretation'}
            {activeSim === 'nebula' && 'Procedural nebula visualization — not scientifically accurate'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <Sliders size={14} className="text-white/50" />
          <span className="text-xs text-white/50 uppercase tracking-wider">Parameters</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SliderControl
            label="Intensity"
            value={params.intensity}
            onChange={(v) => setParams(p => ({ ...p, intensity: v }))}
          />
          <SliderControl
            label="Speed"
            value={params.speed}
            onChange={(v) => setParams(p => ({ ...p, speed: v }))}
          />
          <SliderControl
            label="Density"
            value={params.density}
            onChange={(v) => setParams(p => ({ ...p, density: v }))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-white/40 uppercase tracking-wider">Primary</label>
            <input
              type="color"
              value={params.color1}
              onChange={(e) => setParams(p => ({ ...p, color1: e.target.value }))}
              className="w-full h-8 rounded bg-white/5 border border-white/10 cursor-pointer"
            />
          </div>
        </div>
        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSim}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
          >
            <p className="text-xs text-white/50 leading-relaxed">
              {activeSim === 'lensing' && 'Gravitational lensing occurs when massive objects bend spacetime, curving the path of light from background sources. This simulation shows how a massive body distorts the appearance of stars behind it, creating Einstein rings and multiple images.'}
              {activeSim === 'pulsar' && 'A pulsar is a rapidly rotating neutron star that emits beams of electromagnetic radiation from its magnetic poles. As it spins, these beams sweep across space like a lighthouse. This simplified model shows the rotating beam pattern and periodic pulse detection.'}
              {activeSim === 'nebula' && 'Nebulae are vast clouds of gas and dust in space, often illuminated by nearby stars or glowing from internal energy sources. This procedural simulation generates evolving color patterns inspired by emission nebulae, with adjustable density and color parameters.'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SimTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all ${
        active ? 'bg-white/10 text-white border border-white/20' : 'bg-white/[0.02] text-white/50 border border-white/5 hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function SliderControl({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-white/40 uppercase tracking-wider">{label}</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer"
      />
    </div>
  );
}

// Simulation renderers
function drawGravitationalLensing(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, params: typeof defaultParams) {
  const cx = w / 2;
  const cy = h / 2;
  const intensity = params.intensity;

  // Background stars
  const starCount = Math.floor(80 * params.density);
  for (let i = 0; i < starCount; i++) {
    const angle = (i / starCount) * Math.PI * 2 + t * 0.1;
    const dist = 50 + (i * 37) % (Math.min(w, h) * 0.4);
    const lensDistort = Math.exp(-dist / (100 * intensity)) * 40 * intensity;
    const x = cx + Math.cos(angle) * (dist + lensDistort);
    const y = cy + Math.sin(angle) * (dist + lensDistort * 0.5);
    const brightness = 0.3 + Math.sin(t + i) * 0.2;
    const size = 1 + Math.sin(t * 0.5 + i * 0.3) * 0.5;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${brightness})`;
    ctx.fill();
  }

  // Einstein ring
  const ringRadius = 60 + Math.sin(t * 0.3) * 10;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius + r * 8, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 - r * 0.08})`;
    ctx.lineWidth = 2 - r * 0.5;
    ctx.stroke();
  }

  // Central mass
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
  gradient.addColorStop(0, 'rgba(20, 10, 40, 0.9)');
  gradient.addColorStop(0.5, 'rgba(40, 20, 80, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.fill();

  // Light distortion arcs
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + t * 0.2;
    const arcLen = 0.3 + Math.sin(t + i) * 0.1;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius + 20 + Math.sin(t * 0.5 + i) * 5, angle, angle + arcLen);
    ctx.strokeStyle = params.color1 + '44';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawPulsar(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, params: typeof defaultParams) {
  const cx = w / 2;
  const cy = h / 2;
  const beamAngle = t * 3 * params.speed;

  // Background stars
  for (let i = 0; i < 60; i++) {
    const x = (i * 137.5) % w;
    const y = (i * 89.3) % h;
    const brightness = 0.2 + Math.sin(t + i) * 0.1;
    ctx.beginPath();
    ctx.arc(x, y, 0.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180, 200, 255, ${brightness})`;
    ctx.fill();
  }

  // Beam 1
  const beam1Angle = beamAngle;
  drawBeam(ctx, cx, cy, beam1Angle, w, params);

  // Beam 2 (opposite)
  drawBeam(ctx, cx, cy, beam1Angle + Math.PI, w, params);

  // Central neutron star
  const pulseSize = 8 + Math.sin(t * 8) * 2;
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseSize * 3);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, params.color1);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, pulseSize * 3, 0, Math.PI * 2);
  ctx.fill();

  // Core
  ctx.beginPath();
  ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Pulse wave
  const waveRadius = (t * 50 * params.speed) % (Math.min(w, h) * 0.5);
  ctx.beginPath();
  ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(100, 150, 255, ${0.3 * (1 - waveRadius / (Math.min(w, h) * 0.5))})`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBeam(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, w: number, params: typeof defaultParams) {
  const beamLength = w * 0.6;
  const beamWidth = 0.08 * params.intensity;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const gradient = ctx.createLinearGradient(0, 0, beamLength, 0);
  gradient.addColorStop(0, params.color1 + 'aa');
  gradient.addColorStop(0.3, params.color1 + '44');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(beamLength, -beamLength * beamWidth);
  ctx.lineTo(beamLength, beamLength * beamWidth);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
}

function drawNebula(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, params: typeof defaultParams) {
  // Dark background
  ctx.fillStyle = '#030010';
  ctx.fillRect(0, 0, w, h);

  // Stars
  for (let i = 0; i < 100; i++) {
    const x = (i * 97.3 + t * 2) % w;
    const y = (i * 61.7) % h;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + Math.sin(t + i) * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 220, 255, ${0.3 + Math.sin(t * 0.5 + i) * 0.2})`;
    ctx.fill();
  }

  // Nebula clouds
  const cloudCount = Math.floor(20 * params.density);
  for (let i = 0; i < cloudCount; i++) {
    const x = w * 0.5 + Math.sin(t * 0.1 + i * 1.7) * w * 0.3;
    const y = h * 0.5 + Math.cos(t * 0.15 + i * 2.3) * h * 0.3;
    const radius = 30 + Math.sin(t * 0.2 + i) * 20 + params.intensity * 40;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const color = i % 2 === 0 ? params.color1 : params.color2;
    gradient.addColorStop(0, color + '33');
    gradient.addColorStop(0.5, color + '11');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Bright core regions
  for (let i = 0; i < 5; i++) {
    const x = w * (0.3 + i * 0.1) + Math.sin(t * 0.3 + i) * 20;
    const y = h * (0.4 + Math.sin(i * 2) * 0.2) + Math.cos(t * 0.2 + i) * 15;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15 + params.intensity * 10);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(x, y, 15 + params.intensity * 10, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

const defaultParams = { intensity: 0.7, speed: 0.5, color1: '#4466ff', color2: '#ff44aa', density: 0.6 };
