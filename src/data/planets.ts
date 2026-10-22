export interface Moon {
  name: string;
  description: string;
  size: number;
}

export interface Planet {
  id: string;
  name: string;
  classification: string;
  description: string;
  surfaceConditions: string;
  composition: string;
  orbitalPeriod: string;
  relativeSize: string;
  color: string;
  emissiveColor: string;
  atmosphereColor: string;
  orbitRadius: number;
  size: number;
  rotationSpeed: number;
  orbitSpeed: number;
  hasRings: boolean;
  ringColor?: string;
  moons: Moon[];
  discoveryTimeline: { year: string; event: string }[];
  phenomenon: string;
  phenomenonDescription: string;
  mapPosition: { x: number; y: number };
}

export const planets: Planet[] = [
  {
    id: 'vesper',
    name: 'Vesper',
    classification: 'Class IV Ocean World',
    description: 'A luminous ocean planet shrouded in perpetual twilight. Its vast seas of liquid methane reflect the light of distant stars, creating an ethereal blue glow visible from orbit. The atmosphere scatters light in impossible ways, painting the sky in shifting hues of azure and violet.',
    surfaceConditions: 'Surface temperature: -142°C. Atmospheric pressure: 3.2 atm. Perpetual ocean coverage: 94%. Bioluminescent microorganisms detected in upper water columns.',
    composition: 'Water (heavy), methane, ammonia ice, silicate core. Upper atmosphere: nitrogen, argon, trace phosphorescent compounds.',
    orbitalPeriod: '847 standard cycles',
    relativeSize: '1.4× Sol Standard',
    color: '#1a5a9c',
    emissiveColor: '#0d3060',
    atmosphereColor: '#5ab8ff',
    orbitRadius: 13,
    size: 1.4,
    rotationSpeed: 0.003,
    orbitSpeed: 0.0006,
    hasRings: false,
    moons: [
      { name: 'Thalassa', description: 'Tidal companion generating massive subsurface currents', size: 0.3 },
      { name: 'Lumina', description: 'Ice-covered moon with reflective crystalline surface', size: 0.2 },
    ],
    discoveryTimeline: [
      { year: 'Cycle 2847', event: 'First detected as anomalous blue signal by deep-range array' },
      { year: 'Cycle 2851', event: 'Spectral analysis confirms ocean world classification' },
      { year: 'Cycle 2856', event: 'First probe deployment reveals bioluminescent life forms' },
      { year: 'Cycle 2863', event: 'Subsurface thermal vents mapped, potential habitability zone identified' },
    ],
    phenomenon: 'The Abyssal Choir',
    phenomenonDescription: 'Vesper\'s bioluminescent organisms synchronize their light emissions across entire ocean basins, creating vast patterns visible from space. These "songs of light" follow mathematical sequences that remain unexplained.',
    mapPosition: { x: 38, y: 58 },
  },
  {
    id: 'nyx',
    name: 'Nyx',
    classification: 'Class VII Volcanic World',
    description: 'A dark volcanic world where rivers of molten silicate carve luminous fissures across an obsidian surface. The planet radiates heat in infrared wavelengths, glowing like a dying ember against the void. Its thin atmosphere carries ash clouds that occasionally part to reveal the tortured landscape below.',
    surfaceConditions: 'Surface temperature: 890°C (average), 2400°C (fissure zones). Atmospheric pressure: 0.3 atm. Volcanic activity: continuous. Surface composition: 78% obsidian, 22% active magma flows.',
    composition: 'Iron-nickel core, silicate mantle in constant convective motion. Atmosphere: sulfur dioxide, carbon dioxide, metallic vapor particulates.',
    orbitalPeriod: '312 standard cycles',
    relativeSize: '0.9× Sol Standard',
    color: '#1a0d05',
    emissiveColor: '#cc3300',
    atmosphereColor: '#ff5522',
    orbitRadius: 7,
    size: 0.9,
    rotationSpeed: 0.002,
    orbitSpeed: 0.0015,
    hasRings: false,
    moons: [
      { name: 'Cinder', description: 'Captured asteroid slowly being consumed by tidal forces', size: 0.15 },
    ],
    discoveryTimeline: [
      { year: 'Cycle 2831', event: 'Infrared anomaly detected near system inner boundary' },
      { year: 'Cycle 2834', event: 'Confirmed as tidally-locked volcanic world' },
      { year: 'Cycle 2840', event: 'Heat-resistant probe survives 47 minutes on surface' },
      { year: 'Cycle 2852', event: 'Exotic mineral formations discovered in cooling zones' },
    ],
    phenomenon: 'The Ember Veil',
    phenomenonDescription: 'Nyx\'s ash clouds periodically align to create a translucent veil that refracts its own volcanic glow, producing aurora-like curtains of orange and crimson light that dance across the planet\'s night side.',
    mapPosition: { x: 58, y: 42 },
  },
  {
    id: 'elyra',
    name: 'Elyra',
    classification: 'Class II Ringed Terrestrial',
    description: 'A pale, elegant world encircled by crystalline rings that sing with electromagnetic resonance. The planet\'s surface is a patchwork of frozen plains and ancient geological formations, its thin atmosphere carrying prismatic ice crystals that create perpetual halos around its pale sun.',
    surfaceConditions: 'Surface temperature: -89°C. Atmospheric pressure: 0.7 atm. Surface coverage: 60% nitrogen ice plains, 25% silicate highlands, 15% frozen methane lakes.',
    composition: 'Silicate-ice hybrid crust, frozen ammonia mantle. Rings: water ice, silicate dust, frozen gases. Atmosphere: nitrogen, oxygen traces, prismatic ice suspensions.',
    orbitalPeriod: '1,247 standard cycles',
    relativeSize: '1.1× Sol Standard',
    color: '#d4c8b0',
    emissiveColor: '#3a3025',
    atmosphereColor: '#f0e8d8',
    orbitRadius: 21,
    size: 1.1,
    rotationSpeed: 0.004,
    orbitSpeed: 0.00035,
    hasRings: true,
    ringColor: '#d4c8b8',
    moons: [
      { name: 'Harmonia', description: 'Shepherd moon maintaining ring structure through gravitational resonance', size: 0.25 },
      { name: 'Cadence', description: 'Small moon whose orbit creates visible gaps in the rings', size: 0.12 },
      { name: 'Reverie', description: 'Distant irregular moon with highly eccentric orbit', size: 0.18 },
    ],
    discoveryTimeline: [
      { year: 'Cycle 2839', event: 'Ring system detected via stellar occultation' },
      { year: 'Cycle 2843', event: 'Spectral analysis reveals crystalline ring composition' },
      { year: 'Cycle 2848', event: 'Electromagnetic resonance from rings first recorded' },
      { year: 'Cycle 2855', event: 'Three moons confirmed, orbital mechanics mapped' },
      { year: 'Cycle 2861', event: 'Surface expedition discovers ancient geological structures' },
    ],
    phenomenon: 'The Crystal Chorus',
    phenomenonDescription: 'Elyra\'s rings vibrate at frequencies that create electromagnetic harmonics. When converted to audio, these vibrations produce haunting melodies that shift with the planet\'s seasons, as if the rings themselves are singing.',
    mapPosition: { x: 28, y: 32 },
  },
  {
    id: 'solune',
    name: 'Solune',
    classification: 'Class I Crystalline Moon',
    description: 'An icy moon of extraordinary beauty, its surface a cathedral of crystalline formations that refract and amplify starlight into prismatic displays. Beneath its transparent crust, liquid layers flow in patterns visible as shifting color gradients across the surface.',
    surfaceConditions: 'Surface temperature: -198°C. No significant atmosphere. Surface: 95% crystalline water-ammonia structures, 5% impact craters. Subsurface ocean confirmed at 12km depth.',
    composition: 'Crystalline water-ammonia crust, subsurface liquid layer, silicate-iron core. Surface crystals: hexagonal water-ice with trace ammonia and methane inclusions.',
    orbitalPeriod: '89 standard cycles (orbits Aureon)',
    relativeSize: '0.4× Sol Standard',
    color: '#b8e0f0',
    emissiveColor: '#1a4050',
    atmosphereColor: '#90d8ff',
    orbitRadius: 42,
    size: 0.6,
    rotationSpeed: 0.005,
    orbitSpeed: 0.00015,
    hasRings: false,
    moons: [],
    discoveryTimeline: [
      { year: 'Cycle 2844', event: 'Identified as moon of Aureon during gas giant survey' },
      { year: 'Cycle 2847', event: 'Crystalline surface structure confirmed via high-resolution imaging' },
      { year: 'Cycle 2853', event: 'Subsurface ocean detected through gravitational measurements' },
      { year: 'Cycle 2859', event: 'Prismatic light behavior documented, unique optical properties confirmed' },
    ],
    phenomenon: 'The Prism Storms',
    phenomenonDescription: 'When Solune\'s crystalline surface catches light from the system star at specific angles, it creates cascading prismatic storms—massive auroral displays that sweep across the moon\'s surface in waves of spectral color.',
    mapPosition: { x: 75, y: 68 },
  },
  {
    id: 'aureon',
    name: 'Aureon',
    classification: 'Class IX Gas Giant',
    description: 'A colossal gas giant whose layered atmospheric bands swirl in mesmerizing patterns of gold, amber, and deep crimson. Storm systems larger than terrestrial worlds rage within its depths, while its powerful magnetosphere creates auroral displays visible across the system.',
    surfaceConditions: 'No solid surface. Atmospheric layers: hydrogen-helium envelope extending 40,000km. Cloud tops: -110°C. Deep atmosphere: increasing temperature and pressure, metallic hydrogen layer at 20,000km depth.',
    composition: 'Upper atmosphere: hydrogen (89%), helium (10%), methane, ammonia traces. Deep interior: metallic hydrogen, possible rocky core. 87 confirmed moons.',
    orbitalPeriod: '4,200 standard cycles',
    relativeSize: '11.2× Sol Standard',
    color: '#d49030',
    emissiveColor: '#5a3010',
    atmosphereColor: '#ffbb55',
    orbitRadius: 32,
    size: 2.8,
    rotationSpeed: 0.006,
    orbitSpeed: 0.0002,
    hasRings: true,
    ringColor: '#8a6a3a',
    moons: [
      { name: 'Solune', description: 'Crystalline moon with prismatic surface (see separate entry)', size: 0.6 },
      { name: 'Tempest', description: 'Volcanically active moon generating plasma torus', size: 0.35 },
      { name: 'Umbra', description: 'Dark moon with carbon-rich surface, absorbs 97% of incident light', size: 0.28 },
    ],
    discoveryTimeline: [
      { year: 'Cycle 2823', event: 'First object in system catalogued, classified as gas giant' },
      { year: 'Cycle 2826', event: 'Atmospheric band structure mapped via spectroscopy' },
      { year: 'Cycle 2833', event: 'Great Crimson Vortex first observed, measured at 3× system standard diameter' },
      { year: 'Cycle 2844', event: 'Comprehensive moon survey begins, 87 satellites confirmed' },
      { year: 'Cycle 2858', event: 'Deep atmospheric probe reaches metallic hydrogen layer' },
    ],
    phenomenon: 'The Golden Tempest',
    phenomenonDescription: 'Aureon\'s Great Crimson Vortex periodically intensifies, sending shockwaves through the atmospheric bands that create cascading golden storms. These events produce electromagnetic pulses detectable across the entire star system.',
    mapPosition: { x: 22, y: 72 },
  },
];

export const centralStar = {
  name: 'Aether Prime',
  classification: 'Class B2 Blue Giant',
  description: 'The central star of the Aether system, burning with intense blue-white light. Its powerful stellar wind shapes the heliosphere and influences the atmospheric conditions of all orbiting bodies.',
  color: '#aaccff',
  emissiveColor: '#4466ff',
  size: 2.5,
};

export const systemInfo = {
  name: 'The Aether System',
  age: '4.7 billion standard cycles',
  distanceFromOrigin: '2,847 light-cycles',
  knownBodies: 94,
  exploredBodies: 12,
  status: 'Active Exploration Zone',
};
