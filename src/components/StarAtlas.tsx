import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Route, X, ZoomIn, ZoomOut } from 'lucide-react';
import { planets, centralStar } from '../data/planets';
import type { Planet } from '../data/planets';

interface StarAtlasProps {
  isActive: boolean;
  selectedPlanet: Planet | null;
  onSelectPlanet: (id: string | null) => void;
  onClose: () => void;
}

interface RoutePoint {
  from: string;
  to: string;
}

export function StarAtlas({ isActive, selectedPlanet, onSelectPlanet, onClose }: StarAtlasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [route, setRoute] = useState<RoutePoint | null>(null);
  const [routeStart, setRouteStart] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const handleSelectBody = useCallback((id: string) => {
    if (isRouting) {
      if (!routeStart) {
        setRouteStart(id);
      } else {
        setRoute({ from: routeStart, to: id });
        setIsRouting(false);
      }
    } else {
      onSelectPlanet(id === selectedPlanet?.id ? null : id);
    }
  }, [isRouting, routeStart, selectedPlanet, onSelectPlanet]);

  const handleStartRoute = useCallback(() => {
    setIsRouting(true);
    setRouteStart(null);
    setRoute(null);
  }, []);

  const handleClearRoute = useCallback(() => {
    setRoute(null);
    setRouteStart(null);
    setIsRouting(false);
  }, []);

  const getTravelDuration = useCallback((from: string, to: string) => {
    const fromBody = from === 'star' ? null : planets.find(p => p.id === from);
    const toBody = to === 'star' ? null : planets.find(p => p.id === to);
    if (!fromBody && !toBody) return 'N/A';
    
    const fromPos = from === 'star' ? { x: 50, y: 50 } : fromBody!.mapPosition;
    const toPos = to === 'star' ? { x: 50, y: 50 } : toBody!.mapPosition;
    const dist = Math.sqrt((fromPos.x - toPos.x) ** 2 + (fromPos.y - toPos.y) ** 2);
    const cycles = Math.round(dist * 12.7);
    return `${cycles} standard cycles`;
  }, []);

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'linear-gradient(180deg, #030010 0%, #050218 100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
        <div>
          <h2 className="text-xl sm:text-2xl font-light text-white tracking-wide">Star Atlas</h2>
          <p className="text-xs text-white/40 mt-1">Navigate the Aether System</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} className="text-white/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} className="text-white/70" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartRoute}
            className={`p-2 rounded-lg transition-colors ${isRouting ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-white/5 hover:bg-white/10'}`}
            aria-label="Plan route"
          >
            <Route size={16} className={isRouting ? 'text-cyan-400' : 'text-white/70'} />
          </motion.button>
          {route && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearRoute}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Clear route"
            >
              <X size={16} className="text-white/70" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Close star atlas"
          >
            <X size={16} className="text-white/70" />
          </motion.button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* SVG Map */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* Background grid */}
            <defs>
              <radialGradient id="starGlow">
                <stop offset="0%" stopColor="#aaccff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#aaccff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="bgGlow">
                <stop offset="0%" stopColor="#0a0530" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#030010" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Background glow */}
            <circle cx="50" cy="50" r="45" fill="url(#bgGlow)" />

            {/* Orbital paths */}
            {planets.map((planet) => {
              const orbitRadius = (planet.orbitRadius / 45) * 40;
              return (
                <circle
                  key={`orbit-${planet.id}`}
                  cx="50"
                  cy="50"
                  r={orbitRadius}
                  fill="none"
                  stroke={planet.atmosphereColor}
                  strokeWidth="0.1"
                  strokeOpacity="0.3"
                  strokeDasharray="0.5 0.5"
                />
              );
            })}

            {/* Route line */}
            {route && (() => {
              const fromPos = route.from === 'star' ? { x: 50, y: 50 } : planets.find(p => p.id === route.from)?.mapPosition;
              const toPos = route.to === 'star' ? { x: 50, y: 50 } : planets.find(p => p.id === route.to)?.mapPosition;
              if (!fromPos || !toPos) return null;
              return (
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="#00ddff"
                  strokeWidth="0.3"
                  strokeDasharray="1 0.5"
                  opacity="0.7"
                />
              );
            })()}

            {/* Central star */}
            <circle cx="50" cy="50" r="3" fill="url(#starGlow)" />
            <circle
              cx="50"
              cy="50"
              r="1.5"
              fill="#aaccff"
              className="cursor-pointer"
              onClick={() => handleSelectBody('star')}
            />

            {/* Planets */}
            {planets.map((planet) => (
              <g key={planet.id}>
                <circle
                  cx={planet.mapPosition.x}
                  cy={planet.mapPosition.y}
                  r={selectedPlanet?.id === planet.id ? 2.5 : 1.8}
                  fill={planet.color}
                  stroke={selectedPlanet?.id === planet.id ? planet.atmosphereColor : 'transparent'}
                  strokeWidth="0.3"
                  className="cursor-pointer transition-all"
                  onClick={() => handleSelectBody(planet.id)}
                />
                <circle
                  cx={planet.mapPosition.x}
                  cy={planet.mapPosition.y}
                  r={selectedPlanet?.id === planet.id ? 3.5 : 0}
                  fill="none"
                  stroke={planet.atmosphereColor}
                  strokeWidth="0.15"
                  opacity="0.5"
                />
                <text
                  x={planet.mapPosition.x}
                  y={planet.mapPosition.y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="1.8"
                  opacity={selectedPlanet?.id === planet.id ? 0.9 : 0.5}
                  className="pointer-events-none"
                >
                  {planet.name}
                </text>
              </g>
            ))}

            {/* Named regions */}
            <text x="15" y="15" fill="white" fontSize="1.5" opacity="0.2">Outer Reaches</text>
            <text x="75" y="85" fill="white" fontSize="1.5" opacity="0.2">Inner Boundary</text>
            <text x="50" y="8" fill="white" fontSize="1.2" opacity="0.15" textAnchor="middle">Aether Prime Heliosphere</text>
          </svg>
        </div>

        {/* Routing indicator */}
        <AnimatePresence>
          {isRouting && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-xl bg-black/80 border border-cyan-500/20 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Navigation size={14} className="text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">
                  {routeStart ? 'Select destination' : 'Select starting point'}
                </span>
              </div>
              {routeStart && (
                <p className="text-xs text-white/50">
                  From: {routeStart === 'star' ? centralStar.name : planets.find(p => p.id === routeStart)?.name}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Route info */}
        <AnimatePresence>
          {route && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 p-4 rounded-xl bg-black/80 border border-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <Route size={14} className="text-cyan-400" />
                <span className="text-xs text-white/70 font-medium">Planned Route</span>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-white/50">
                  From: <span className="text-white/80">{route.from === 'star' ? centralStar.name : planets.find(p => p.id === route.from)?.name}</span>
                </p>
                <p className="text-xs text-white/50">
                  To: <span className="text-white/80">{route.to === 'star' ? centralStar.name : planets.find(p => p.id === route.to)?.name}</span>
                </p>
                <p className="text-xs text-cyan-400 mt-2">
                  Est. travel: {getTravelDuration(route.from, route.to)}
                </p>
                <p className="text-[9px] text-white/20 mt-1 italic">
                  Based on fictional warp-speed calculation (distance × 12.7 cycles/unit)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Planet list sidebar */}
      <div className="p-4 border-t border-white/5 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <MapPin size={14} className="text-white/30 mt-1 shrink-0" />
          {planets.map((planet) => (
            <motion.button
              key={planet.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectBody(planet.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                selectedPlanet?.id === planet.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/[0.02] text-white/50 border border-white/5 hover:bg-white/5'
              }`}
              style={selectedPlanet?.id === planet.id ? { borderColor: planet.atmosphereColor + '40' } : {}}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: planet.color }} />
              {planet.name}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
