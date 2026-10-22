import { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Eye, Map, ArrowLeft, BookOpen, ChevronDown } from 'lucide-react';
import { Universe } from './components/Universe';
import { PlanetDetail } from './components/PlanetDetail';
import { Observatory } from './components/Observatory';
import { StarAtlas } from './components/StarAtlas';
import { planets } from './data/planets';
import type { Planet } from './data/planets';

type ViewMode = 'intro' | 'explore' | 'observatory' | 'atlas';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('intro');
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [visitedPlanets, setVisitedPlanets] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('aether-visited') || '[]');
    } catch {
      return [];
    }
  });
  const [showPlanetList, setShowPlanetList] = useState(false);
  const [isOverview, setIsOverview] = useState(true);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  // Save visited planets
  useEffect(() => {
    localStorage.setItem('aether-visited', JSON.stringify(visitedPlanets));
  }, [visitedPlanets]);

  // Track visited planets
  useEffect(() => {
    if (selectedPlanet && !visitedPlanets.includes(selectedPlanet.id)) {
      setVisitedPlanets(prev => [...prev, selectedPlanet.id]);
    }
  }, [selectedPlanet, visitedPlanets]);

  const handleSelectPlanet = useCallback((id: string | null) => {
    if (id === null) {
      setSelectedPlanet(null);
      setIsOverview(true);
    } else {
      const planet = planets.find(p => p.id === id) || null;
      setSelectedPlanet(planet);
      setIsOverview(false);
    }
  }, []);

  const handleEnterUniverse = useCallback(() => {
    setViewMode('explore');
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedPlanet(null);
    setIsOverview(true);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'observatory' || viewMode === 'atlas') {
          setViewMode('explore');
        } else if (selectedPlanet) {
          handleResetView();
        }
      }
      if (e.key === '1') handleSelectPlanet('vesper');
      if (e.key === '2') handleSelectPlanet('nyx');
      if (e.key === '3') handleSelectPlanet('elyra');
      if (e.key === '4') handleSelectPlanet('solune');
      if (e.key === '5') handleSelectPlanet('aureon');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedPlanet, handleSelectPlanet, handleResetView]);

  // Intro screen
  if (viewMode === 'intro') {
    return <IntroScreen onEnter={handleEnterUniverse} webGLSupported={webGLSupported} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#030010' }}>
      {/* 3D Universe - always rendered in background */}
      <div className="absolute inset-0">
        {webGLSupported ? (
          <Suspense fallback={<LoadingScreen />}>
            <Universe
              selectedPlanet={selectedPlanet}
              onSelectPlanet={handleSelectPlanet}
              isOverview={isOverview}
              controlsEnabled={viewMode === 'explore'}
            />
          </Suspense>
        ) : (
          <Fallback2D selectedPlanet={selectedPlanet} onSelectPlanet={handleSelectPlanet} />
        )}
      </div>

      {/* Observatory overlay */}
      <AnimatePresence>
        {viewMode === 'observatory' && (
          <Observatory isActive={true} />
        )}
      </AnimatePresence>

      {/* Star Atlas overlay */}
      <AnimatePresence>
        {viewMode === 'atlas' && (
          <StarAtlas
            isActive={true}
            selectedPlanet={selectedPlanet}
            onSelectPlanet={handleSelectPlanet}
            onClose={() => setViewMode('explore')}
          />
        )}
      </AnimatePresence>

      {/* Planet Detail Panel */}
      {viewMode === 'explore' && (
        <PlanetDetail planet={selectedPlanet} onClose={handleResetView} />
      )}

      {/* Navigation UI */}
      {viewMode === 'explore' && (
        <>
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed top-0 left-0 right-0 z-30 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-sm sm:text-base font-light tracking-[0.2em] text-white/80 uppercase">
                  Aether Cosmos
                </h1>
                {visitedPlanets.length > 0 && (
                  <span className="text-[10px] text-white/30 font-mono hidden sm:block">
                    {visitedPlanets.length}/{planets.length} discovered
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedPlanet && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetView}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs text-white/70"
                  >
                    <ArrowLeft size={12} />
                    <span className="hidden sm:inline">Overview</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bottom navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-30 p-4 sm:p-6"
          >
            <div className="flex items-end justify-between">
              {/* Planet list toggle (mobile) */}
              <div className="sm:hidden">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPlanetList(!showPlanetList)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <BookOpen size={14} className="text-white/70" />
                  <span className="text-xs text-white/70">Planets</span>
                  <ChevronDown size={12} className={`text-white/50 transition-transform ${showPlanetList ? 'rotate-180' : ''}`} />
                </motion.button>
              </div>

              {/* Desktop planet list */}
              <div className="hidden sm:flex items-center gap-2">
                {planets.map((planet) => (
                  <motion.button
                    key={planet.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectPlanet(planet.id)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      selectedPlanet?.id === planet.id
                        ? 'bg-white/10 border border-white/20'
                        : 'bg-white/[0.03] border border-white/5 hover:bg-white/5'
                    }`}
                    title={planet.name}
                  >
                    <div
                      className="w-3 h-3 rounded-full transition-transform group-hover:scale-110"
                      style={{
                        background: planet.color,
                        boxShadow: selectedPlanet?.id === planet.id ? `0 0 8px ${planet.atmosphereColor}` : 'none',
                      }}
                    />
                    <span className={`text-xs transition-colors ${
                      selectedPlanet?.id === planet.id ? 'text-white/90' : 'text-white/50'
                    }`}>
                      {planet.name}
                    </span>
                    {visitedPlanets.includes(planet.id) && (
                      <span className="text-[8px] text-cyan-400/50">✓</span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Mode switcher */}
              <div className="flex items-center gap-2">
                <NavButton
                  icon={<Eye size={16} />}
                  label="Observatory"
                  onClick={() => setViewMode('observatory')}
                  active={false}
                />
                <NavButton
                  icon={<Map size={16} />}
                  label="Star Atlas"
                  onClick={() => setViewMode('atlas')}
                  active={false}
                />
              </div>
            </div>

            {/* Mobile planet list dropdown */}
            <AnimatePresence>
              {showPlanetList && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="sm:hidden mt-3 overflow-hidden"
                >
                  <div className="p-3 rounded-xl bg-black/80 border border-white/10 backdrop-blur-sm space-y-1">
                    {planets.map((planet) => (
                      <button
                        key={planet.id}
                        onClick={() => {
                          handleSelectPlanet(planet.id);
                          setShowPlanetList(false);
                        }}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                          selectedPlanet?.id === planet.id ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: planet.color }}
                        />
                        <span className="text-xs text-white/70">{planet.name}</span>
                        <span className="text-[10px] text-white/30 ml-auto">{planet.classification}</span>
                        {visitedPlanets.includes(planet.id) && (
                          <span className="text-[8px] text-cyan-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Selected planet name overlay */}
          <AnimatePresence>
            {selectedPlanet && !showPlanetList && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed left-4 sm:left-6 bottom-20 sm:bottom-24 z-20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-8 rounded-full"
                    style={{ background: selectedPlanet.atmosphereColor }}
                  />
                  <div>
                    <h3 className="text-lg sm:text-xl font-light text-white/90 tracking-wide">
                      {selectedPlanet.name}
                    </h3>
                    <p className="text-[10px] text-white/40 font-mono tracking-wider">
                      {selectedPlanet.classification}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Discovery log indicator */}
          {visitedPlanets.length > 0 && visitedPlanets.length < planets.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed top-16 sm:top-20 right-4 sm:right-6 z-20"
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                <Compass size={10} className="text-cyan-400/60" />
                <span className="text-[10px] text-white/40 font-mono">
                  {visitedPlanets.length}/{planets.length}
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Back button for observatory/atlas */}
      {(viewMode === 'observatory' || viewMode === 'atlas') && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode('explore')}
          className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm transition-colors"
        >
          <ArrowLeft size={14} className="text-white/70" />
          <span className="text-xs text-white/70">Return</span>
        </motion.button>
      )}
    </div>
  );
}

// Intro Screen Component
function IntroScreen({ onEnter, webGLSupported }: { onEnter: () => void; webGLSupported: boolean }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: '#030010' }}>
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-950/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-900/5 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-violet-900/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Stars */}
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37.7) % 100}%`,
              top: `${(i * 23.3) % 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <p className="text-[10px] sm:text-xs text-white/30 uppercase tracking-[0.3em] mb-4 font-mono">
            A Journey Into the Unknown
          </p>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-[0.15em] text-white/90 mb-6">
            AETHER
            <br />
            <span className="text-blue-300/70">COSMOS</span>
          </h1>
          <p className="text-sm sm:text-base text-white/40 leading-relaxed mb-8 max-w-md mx-auto">
            Beyond the edge of known space lies an uncharted star system. 
            Five worlds await discovery, each holding secrets older than memory itself.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEnter}
            className="group relative px-8 py-3 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-sm text-white/80 tracking-wider">
              Enter the Universe
            </span>
          </motion.button>

          {!webGLSupported && (
            <p className="text-xs text-amber-400/60 mt-4">
              WebGL not available — 2D fallback mode will be used
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12"
        >
          <p className="text-[10px] text-white/20 font-mono">
            ✦ Fictional universe — all data is world-building ✦
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Loading Screen
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030010' }}>
      <div className="text-center">
        <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-white/40 tracking-wider">Initializing universe...</p>
      </div>
    </div>
  );
}

// 2D Fallback
function Fallback2D({ selectedPlanet, onSelectPlanet }: { selectedPlanet: Planet | null; onSelectPlanet: (id: string | null) => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full max-w-2xl aspect-square">
        {/* Central star */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-300/30 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-200/60" />
        
        {/* Planets */}
        {planets.map((planet, i) => {
          const angle = (i / planets.length) * Math.PI * 2;
          const radius = 25 + i * 12;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          
          return (
            <button
              key={planet.id}
              onClick={() => onSelectPlanet(planet.id)}
              className={`absolute w-6 h-6 rounded-full transition-all hover:scale-150 ${
                selectedPlanet?.id === planet.id ? 'ring-2 ring-offset-0 scale-125' : ''
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                background: planet.color,
                boxShadow: `0 0 10px ${planet.atmosphereColor}40`,
              }}
              title={planet.name}
              aria-label={`Select ${planet.name}`}
            />
          );
        })}
        
        <p className="absolute bottom-0 left-0 right-0 text-center text-xs text-white/30">
          2D Fallback Mode — WebGL not available
        </p>
      </div>
    </div>
  );
}

// Nav Button
function NavButton({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        active
          ? 'bg-white/10 border border-white/20 text-white/90'
          : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white/60'
      }`}
      title={label}
    >
      {icon}
      <span className="text-xs hidden sm:inline">{label}</span>
    </motion.button>
  );
}

export default App;
