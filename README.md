# AETHER COSMOS

An immersive 3D space exploration website built with React, Three.js, and TypeScript. Travel through a fictional star system, discover planets, explore celestial phenomena, and uncover the story of an unknown universe.

## Features

- **Immersive 3D Universe**: Explore a star system with 5 unique fictional planets using React Three Fiber
- **Planet Discovery**: Detailed information panels with fictional world-building for each celestial body
- **The Observatory**: Interactive simulations of cosmic phenomena (gravitational lensing, pulsars, nebulae)
- **Star Atlas**: 2D navigable map of the star system with route planning
- **Responsive Design**: Mobile-first experience supporting 320px to ultra-wide displays
- **Accessibility**: Keyboard navigation, screen reader support, reduced motion support
- **Performance**: Optimized rendering with adaptive quality and 2D fallback for non-WebGL devices

## Technology Stack

- **React 18** with TypeScript
- **React Three Fiber** (Three.js renderer for React)
- **@react-three/drei** (3D helpers and abstractions)
- **Framer Motion** (animation and transitions)
- **Tailwind CSS** (styling)
- **Lucide React** (icons)
- **Vite** (build tool)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Architecture

### Directory Structure

```
src/
├── App.tsx                    # Main application with view management
├── data/
│   └── planets.ts            # Central planet data model
├── components/
│   ├── Universe.tsx          # 3D scene container with Canvas
│   ├── PlanetMesh.tsx        # Individual planet 3D components
│   ├── StarField.tsx         # Background stars, nebula, cosmic dust
│   ├── CameraController.tsx  # Camera animation and transitions
│   ├── PlanetDetail.tsx      # Planet information panel
│   ├── Observatory.tsx       # Cosmic phenomena simulations
│   └── StarAtlas.tsx         # 2D interactive star map
├── index.css                 # Global styles and Tailwind
└── main.tsx                  # Entry point
```

### Rendering Architecture

- **3D Scene**: Uses React Three Fiber with a Canvas component containing:
  - Procedural star field (instanced points for performance)
  - Central star with volumetric glow effects
  - 5 planets with orbital motion, atmospheric effects, and selection states
  - Orbit path visualization using drei's Line component
  - Fog for depth perception
  - Adaptive DPR (device pixel ratio) for performance

- **Camera System**: Custom camera controller that smoothly interpolates between:
  - Overview position (system-wide view)
  - Planet-focused positions (close-up with context)
  - OrbitControls for free exploration when in overview mode

- **2D Simulations**: Canvas 2D API for Observatory effects:
  - Gravitational lensing with Einstein ring visualization
  - Pulsar beam rotation with periodic pulse waves
  - Procedural nebula with animated color clouds

### Data Model

All planetary data is centralized in `src/data/planets.ts`, ensuring consistency across:
- 3D scene rendering (colors, sizes, orbits)
- Information panels (descriptions, stats, timelines)
- Star Atlas map positions
- Discovery log tracking

## User Journeys

### Primary Exploration Flow
1. Enter the universe from the intro screen
2. View the star system in overview mode
3. Click a planet to focus camera and view details
4. Read planet information in the side panel
5. Return to overview or select another planet
6. Visit the Observatory for interactive simulations
7. Use Star Atlas for map-based navigation

### Keyboard Controls
- `1-5`: Select planets (Vesper, Nyx, Elyra, Solune, Aureon)
- `Escape`: Return to overview / close panels
- Mouse/touch: Orbit, zoom, and pan in 3D view

### Mobile Experience
- Touch to select planets
- Pinch to zoom
- Swipe to orbit
- Bottom sheet for planet list
- Compact info panels

## Accessibility

- All planets are selectable via keyboard
- Screen reader-friendly labels and descriptions
- `prefers-reduced-motion` support (disables non-essential animations)
- Visible focus states on all interactive elements
- 2D fallback for non-WebGL devices
- High contrast text on dark backgrounds
- ARIA labels on all buttons

## Performance Considerations

- Star field uses point instancing (2500 stars as single draw call)
- DPR limited to 1.5 maximum
- Fog culls distant objects
- Canvas simulations use requestAnimationFrame
- Observatory pauses when not active
- Suspense boundary for 3D loading
- Reduced particle counts on mobile (via DPR scaling)

## Fictional Content Disclaimer

All planetary data, star system information, discovery timelines, and cosmic phenomena are entirely fictional and created for the AETHER COSMOS experience. This is a creative world-building project and does not represent real astronomical data or scientific observations.

## Testing Checklist

- [ ] Intro screen displays correctly on all viewports
- [ ] "Enter the Universe" transitions smoothly to 3D view
- [ ] All 5 planets are visible and clickable in 3D
- [ ] Planet selection moves camera smoothly
- [ ] Planet detail panel shows correct information
- [ ] Return to overview works from detail view
- [ ] Observatory simulations respond to parameter changes
- [ ] Observatory pause/resume/reset work correctly
- [ ] Star Atlas shows all planets at correct positions
- [ ] Route planning in Star Atlas works
- [ ] Discovery log tracks visited planets
- [ ] Mobile touch controls work (orbit, zoom, select)
- [ ] Keyboard navigation works (1-5, Escape)
- [ ] Reduced motion preference is respected
- [ ] 2D fallback shows when WebGL unavailable
- [ ] No layout overflow at 320px width
- [ ] Safe area insets handled on mobile

## License

This is a creative project for demonstration purposes.
