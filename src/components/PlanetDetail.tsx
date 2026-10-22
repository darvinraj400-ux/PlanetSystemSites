import { motion, AnimatePresence } from 'framer-motion';
import { X, Orbit, Thermometer, FlaskConical, Calendar, Sparkles, Moon, ChevronRight } from 'lucide-react';
import type { Planet } from '../data/planets';

interface PlanetDetailProps {
  planet: Planet | null;
  onClose: () => void;
}

export function PlanetDetail({ planet, onClose }: PlanetDetailProps) {
  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] lg:w-[480px] z-40 overflow-y-auto"
          style={{
            background: 'linear-gradient(135deg, rgba(3,0,16,0.95) 0%, rgba(10,5,40,0.92) 100%)',
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid ${planet.atmosphereColor}22`,
          }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close planet details"
            >
              <X size={18} className="text-white/70" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-mono tracking-wider mb-3"
                style={{
                  background: `${planet.atmosphereColor}15`,
                  color: planet.atmosphereColor,
                  border: `1px solid ${planet.atmosphereColor}30`,
                }}
              >
                {planet.classification}
              </div>
              <h2 className="text-3xl sm:text-4xl font-light tracking-wide text-white mb-2">
                {planet.name}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {planet.description}
              </p>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-6 pb-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Orbit size={14} />}
                label="Orbital Period"
                value={planet.orbitalPeriod}
                color={planet.atmosphereColor}
              />
              <StatCard
                icon={<Thermometer size={14} />}
                label="Relative Size"
                value={planet.relativeSize}
                color={planet.atmosphereColor}
              />
            </div>
          </motion.div>

          {/* Surface & Composition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="px-6 pb-4"
          >
            <InfoSection title="Surface Conditions" color={planet.atmosphereColor}>
              <p className="text-xs text-white/60 leading-relaxed">{planet.surfaceConditions}</p>
            </InfoSection>
            <InfoSection title="Composition" color={planet.atmosphereColor}>
              <p className="text-xs text-white/60 leading-relaxed">{planet.composition}</p>
            </InfoSection>
          </motion.div>

          {/* Phenomenon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-6 pb-4"
          >
            <div
              className="p-4 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${planet.atmosphereColor}08, ${planet.atmosphereColor}03)`,
                border: `1px solid ${planet.atmosphereColor}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} style={{ color: planet.atmosphereColor }} />
                <h4 className="text-sm font-medium text-white/90">{planet.phenomenon}</h4>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{planet.phenomenonDescription}</p>
            </div>
          </motion.div>

          {/* Moons */}
          {planet.moons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="px-6 pb-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Moon size={14} className="text-white/50" />
                <h4 className="text-sm font-medium text-white/70">Known Moons ({planet.moons.length})</h4>
              </div>
              <div className="space-y-2">
                {planet.moons.map((moon) => (
                  <div key={moon.name} className="flex items-start gap-3 p-2 rounded-lg bg-white/[0.02]">
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                      style={{ background: planet.atmosphereColor }}
                    />
                    <div>
                      <span className="text-xs font-medium text-white/80">{moon.name}</span>
                      <p className="text-xs text-white/40 mt-0.5">{moon.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Discovery Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-6 pb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-white/50" />
              <h4 className="text-sm font-medium text-white/70">Discovery Timeline</h4>
            </div>
            <div className="space-y-0">
              {planet.discoveryTimeline.map((item, i) => (
                <div key={i} className="flex gap-3 pb-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: planet.atmosphereColor }}
                    />
                    {i < planet.discoveryTimeline.length - 1 && (
                      <div className="w-px h-full bg-white/10 mt-1" />
                    )}
                  </div>
                  <div className="pb-1">
                    <span className="text-xs font-mono" style={{ color: planet.atmosphereColor }}>
                      {item.year}
                    </span>
                    <p className="text-xs text-white/50 mt-0.5">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fictional disclaimer */}
          <div className="px-6 pb-6">
            <p className="text-[10px] text-white/20 text-center italic">
              ✦ All data is fictional world-building for the Aether Cosmos experience ✦
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        background: `${color}08`,
        border: `1px solid ${color}15`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1" style={{ color }}>
        {icon}
        <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm text-white/90 font-medium">{value}</span>
      </div>
    </div>
  );
}

function InfoSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <ChevronRight size={12} style={{ color }} />
        <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider">{title}</h4>
      </div>
      <div className="pl-5">{children}</div>
    </div>
  );
}
