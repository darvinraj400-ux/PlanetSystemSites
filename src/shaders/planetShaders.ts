// Custom GLSL shaders for realistic planet rendering

export const planetVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const planetFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform int uPlanetType; // 0=ocean, 1=volcanic, 2=ringed, 3=crystal, 4=gas
  uniform float uEmissiveStrength;
  uniform vec3 uLightDir;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 6; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  vec3 oceanPlanet(vec3 pos, vec3 norm) {
    float n = fbm(pos * 3.0 + vec3(0.0, uTime * 0.02, 0.0));
    float n2 = fbm(pos * 8.0 + vec3(uTime * 0.01));
    
    // Ocean depth variation
    float ocean = smoothstep(-0.2, 0.3, n);
    vec3 deepOcean = uColor1 * 0.3;
    vec3 shallowOcean = uColor1;
    vec3 land = uColor2;
    
    vec3 color = mix(deepOcean, shallowOcean, ocean);
    
    // Cloud-like white caps
    float clouds = smoothstep(0.4, 0.7, n2);
    color = mix(color, vec3(0.9, 0.95, 1.0), clouds * 0.3);
    
    // Specular-like highlight
    float spec = pow(max(dot(reflect(-uLightDir, norm), normalize(-vWorldPosition)), 0.0), 32.0);
    color += vec3(0.3, 0.5, 0.8) * spec * 0.5;
    
    return color;
  }
  
  vec3 volcanicPlanet(vec3 pos, vec3 norm) {
    float n = fbm(pos * 2.5);
    float n2 = fbm(pos * 6.0 + vec3(uTime * 0.03));
    
    // Dark rock base
    vec3 rock = vec3(0.08, 0.05, 0.03);
    
    // Lava fissures
    float fissure = smoothstep(0.3, 0.35, n2);
    vec3 lava = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 0.8, 0.0), n);
    
    vec3 color = mix(rock, lava, fissure * 0.8);
    
    // Ash/smoke overlay
    float ash = smoothstep(0.2, 0.6, fbm(pos * 4.0 + vec3(0.0, uTime * 0.05, 0.0)));
    color = mix(color, vec3(0.15, 0.1, 0.08), ash * 0.4);
    
    // Emissive glow from lava
    color += lava * fissure * uEmissiveStrength;
    
    return color;
  }
  
  vec3 ringedPlanet(vec3 pos, vec3 norm) {
    float n = fbm(pos * 2.0);
    float n2 = fbm(pos * 5.0);
    
    // Pale surface with subtle bands
    vec3 base = mix(uColor1, uColor2, smoothstep(-0.3, 0.3, n));
    
    // Ice crystal highlights
    float crystal = pow(max(snoise(pos * 12.0), 0.0), 3.0);
    base += vec3(0.2, 0.15, 0.1) * crystal;
    
    // Subtle atmospheric haze
    float haze = smoothstep(0.0, 1.0, norm.y * 0.5 + 0.5);
    base = mix(base, uColor3, haze * 0.2);
    
    return base;
  }
  
  vec3 crystalPlanet(vec3 pos, vec3 norm) {
    float n = fbm(pos * 3.0);
    float n2 = snoise(pos * 15.0);
    
    // Icy base
    vec3 ice = mix(vec3(0.7, 0.85, 0.95), vec3(0.5, 0.7, 0.9), n);
    
    // Crystal facets
    float facet = pow(max(abs(n2), 0.0), 2.0);
    vec3 crystalColor = vec3(0.8, 0.9, 1.0);
    ice = mix(ice, crystalColor, facet * 0.5);
    
    // Prismatic refraction effect
    float prism = snoise(pos * 8.0 + vec3(uTime * 0.1));
    vec3 rainbow = vec3(
      sin(prism * 6.28) * 0.5 + 0.5,
      sin(prism * 6.28 + 2.09) * 0.5 + 0.5,
      sin(prism * 6.28 + 4.18) * 0.5 + 0.5
    );
    ice += rainbow * 0.08;
    
    // Sparkle
    float sparkle = pow(max(snoise(pos * 30.0 + uTime * 0.5), 0.0), 8.0);
    ice += vec3(1.0) * sparkle * 0.5;
    
    return ice;
  }
  
  vec3 gasGiant(vec3 pos, vec3 norm) {
    // Atmospheric bands
    float bands = sin(pos.y * 8.0 + fbm(pos * 2.0) * 2.0) * 0.5 + 0.5;
    float bands2 = sin(pos.y * 15.0 + fbm(pos * 3.0 + vec3(uTime * 0.02)) * 1.5) * 0.5 + 0.5;
    
    vec3 band1 = uColor1;
    vec3 band2 = uColor2;
    vec3 band3 = uColor3;
    
    vec3 color = mix(band1, band2, bands);
    color = mix(color, band3, bands2 * 0.4);
    
    // Storm systems
    float storm = fbm(pos * 4.0 + vec3(uTime * 0.03, 0.0, uTime * 0.02));
    float stormMask = smoothstep(0.3, 0.5, storm);
    color = mix(color, uColor3 * 1.3, stormMask * 0.3);
    
    // Great vortex
    vec2 vortexCenter = vec2(0.3, 0.1);
    float vortexDist = length(pos.xz - vortexCenter);
    float vortex = smoothstep(0.4, 0.0, vortexDist);
    float vortexSpiral = sin(atan(pos.z - vortexCenter.y, pos.x - vortexCenter.x) * 3.0 + uTime * 0.5) * 0.5 + 0.5;
    color = mix(color, vec3(0.8, 0.3, 0.1), vortex * vortexSpiral * 0.5);
    
    return color;
  }
  
  void main() {
    vec3 norm = normalize(vNormal);
    vec3 pos = vPosition;
    
    vec3 surfaceColor;
    
    if (uPlanetType == 0) {
      surfaceColor = oceanPlanet(pos, norm);
    } else if (uPlanetType == 1) {
      surfaceColor = volcanicPlanet(pos, norm);
    } else if (uPlanetType == 2) {
      surfaceColor = ringedPlanet(pos, norm);
    } else if (uPlanetType == 3) {
      surfaceColor = crystalPlanet(pos, norm);
    } else {
      surfaceColor = gasGiant(pos, norm);
    }
    
    // Lighting
    float diffuse = max(dot(norm, uLightDir), 0.0);
    float ambient = 0.08;
    vec3 lit = surfaceColor * (diffuse * 0.9 + ambient);
    
    // Rim lighting (atmosphere edge glow)
    float rim = 1.0 - max(dot(norm, normalize(-vWorldPosition)), 0.0);
    rim = pow(rim, 3.0);
    lit += uColor3 * rim * 0.3;
    
    // Terminator softening
    float terminator = smoothstep(-0.1, 0.2, diffuse);
    lit *= mix(0.3, 1.0, terminator);
    
    gl_FragColor = vec4(lit, 1.0);
  }
`;

export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 uAtmosphereColor;
  uniform float uIntensity;
  uniform vec3 uLightDir;
  
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    rim = pow(rim, 2.5);
    
    // Light-dependent atmosphere
    float lightFactor = max(dot(vNormal, uLightDir), 0.0) * 0.5 + 0.5;
    
    float alpha = rim * uIntensity * lightFactor;
    vec3 color = uAtmosphereColor * (1.0 + rim * 0.5);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const starVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const starFragmentShader = `
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec3 pos = vPosition;
    
    // Turbulent surface
    float n1 = snoise(pos * 3.0 + vec3(uTime * 0.1, uTime * 0.05, uTime * 0.08));
    float n2 = snoise(pos * 6.0 + vec3(uTime * 0.15, 0.0, uTime * 0.1));
    float n3 = snoise(pos * 12.0 + vec3(0.0, uTime * 0.2, uTime * 0.05));
    
    float turbulence = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Core colors - blue giant star
    vec3 hotCore = vec3(0.95, 0.97, 1.0);
    vec3 midLayer = vec3(0.6, 0.75, 1.0);
    vec3 outerLayer = vec3(0.3, 0.4, 0.9);
    
    float t = turbulence * 0.5 + 0.5;
    vec3 color = mix(outerLayer, midLayer, smoothstep(0.2, 0.5, t));
    color = mix(color, hotCore, smoothstep(0.5, 0.8, t));
    
    // Solar flares / prominences
    float flare = pow(max(snoise(pos * 4.0 + vec3(uTime * 0.3)), 0.0), 4.0);
    color += vec3(0.5, 0.6, 1.0) * flare * 0.5;
    
    // Granulation
    float granulation = snoise(pos * 20.0 + vec3(uTime * 0.1)) * 0.1;
    color += granulation;
    
    // Limb darkening
    float limb = dot(vNormal, vec3(0.0, 0.0, 1.0));
    limb = pow(max(limb, 0.0), 0.4);
    color *= mix(0.6, 1.0, limb);
    
    // Overall brightness boost
    color *= 1.3;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export const coronaVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const coronaFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float rim = 1.0 - max(dot(vNormal, viewDir), 0.0);
    
    // Corona rays
    float angle = atan(vPosition.y, vPosition.x);
    float rays = pow(abs(sin(angle * 8.0 + uTime * 0.3)), 4.0);
    float rays2 = pow(abs(sin(angle * 12.0 - uTime * 0.2)), 6.0);
    
    // Noise-based corona structure
    float noise = snoise(vPosition * 2.0 + vec3(uTime * 0.1)) * 0.5 + 0.5;
    
    float corona = rim * (1.0 + rays * 0.5 + rays2 * 0.3) * noise;
    corona = pow(corona, 1.5) * uIntensity;
    
    vec3 innerColor = vec3(0.7, 0.8, 1.0);
    vec3 outerColor = vec3(0.2, 0.3, 0.8);
    vec3 color = mix(innerColor, outerColor, rim);
    
    float alpha = corona * 0.6;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Ring shader for planets with rings
export const ringVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragmentShader = `
  uniform vec3 uRingColor;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  
  void main() {
    // Distance from center in ring plane
    vec2 center = vec2(0.5);
    float dist = length(vUv - center) * 2.0;
    
    // Ring bands
    float bands = sin(dist * 40.0) * 0.5 + 0.5;
    float bands2 = sin(dist * 80.0 + 1.5) * 0.5 + 0.5;
    float bands3 = sin(dist * 120.0 + 3.0) * 0.5 + 0.5;
    
    float ringPattern = bands * 0.5 + bands2 * 0.3 + bands3 * 0.2;
    
    // Gaps in rings (Cassini-like division)
    float gap1 = smoothstep(0.48, 0.50, dist) * (1.0 - smoothstep(0.52, 0.54, dist));
    float gap2 = smoothstep(0.68, 0.69, dist) * (1.0 - smoothstep(0.70, 0.71, dist));
    float gaps = 1.0 - (gap1 + gap2) * 0.8;
    
    // Fade at edges
    float innerFade = smoothstep(0.3, 0.4, dist);
    float outerFade = 1.0 - smoothstep(0.85, 0.95, dist);
    float edgeFade = innerFade * outerFade;
    
    // Particle density variation
    float density = hash(floor(dist * 200.0)) * 0.3 + 0.7;
    
    float alpha = ringPattern * gaps * edgeFade * density * 0.7;
    
    vec3 color = uRingColor * (0.8 + ringPattern * 0.4);
    
    // Subtle color variation
    color += vec3(0.1, 0.05, 0.0) * bands2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
