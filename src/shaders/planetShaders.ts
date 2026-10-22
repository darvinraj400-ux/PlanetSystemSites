// Custom GLSL shaders for realistic planet rendering with proper lighting

export const planetVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    // World space normal (for lighting)
    vNormalWorld = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    
    // World and view positions
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewPosition = (viewMatrix * worldPos).xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const planetFragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform int uPlanetType;
  uniform float uEmissiveStrength;
  uniform vec3 uLightDir;
  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  
  varying vec2 vUv;
  varying vec3 vNormalWorld;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  // Simplex noise
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
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  vec3 oceanPlanet(vec3 pos) {
    float n = fbm(pos * 3.0 + vec3(0.0, uTime * 0.015, 0.0));
    float n2 = fbm(pos * 6.0 + vec3(uTime * 0.008));
    
    // Ocean depth variation
    float ocean = smoothstep(-0.3, 0.2, n);
    vec3 deepOcean = uColor1 * 0.4;
    vec3 shallowOcean = uColor1 * 1.1;
    
    vec3 color = mix(deepOcean, shallowOcean, ocean);
    
    // Cloud-like features
    float clouds = smoothstep(0.35, 0.6, n2);
    color = mix(color, vec3(0.85, 0.9, 0.95), clouds * 0.25);
    
    // Subtle surface detail
    float detail = snoise(pos * 12.0) * 0.1;
    color += detail;
    
    return color;
  }
  
  vec3 volcanicPlanet(vec3 pos) {
    float n = fbm(pos * 2.5);
    float n2 = fbm(pos * 5.0 + vec3(uTime * 0.02));
    
    // Dark rock base
    vec3 rock = vec3(0.06, 0.04, 0.02);
    vec3 darkRock = vec3(0.03, 0.02, 0.01);
    rock = mix(rock, darkRock, smoothstep(-0.2, 0.3, n));
    
    // Lava fissures - bright glowing cracks
    float fissure = smoothstep(0.35, 0.42, n2);
    vec3 lava = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.9, 0.2), smoothstep(0.3, 0.5, n));
    
    vec3 color = rock;
    color = mix(color, lava, fissure * 0.9);
    
    // Ash/smoke overlay
    float ash = smoothstep(0.1, 0.5, fbm(pos * 3.5 + vec3(0.0, uTime * 0.04, 0.0)));
    color = mix(color, vec3(0.12, 0.08, 0.05), ash * 0.5);
    
    // Emissive glow from lava (added in lighting pass)
    color += lava * fissure * uEmissiveStrength * 0.5;
    
    return color;
  }
  
  vec3 ringedPlanet(vec3 pos) {
    float n = fbm(pos * 2.0);
    float n2 = fbm(pos * 4.0);
    
    // Pale surface with subtle bands
    vec3 base = mix(uColor1 * 0.8, uColor1 * 1.1, smoothstep(-0.3, 0.3, n));
    
    // Ice crystal highlights
    float crystal = pow(max(snoise(pos * 10.0), 0.0), 3.0);
    base += vec3(0.15, 0.12, 0.08) * crystal;
    
    // Subtle atmospheric bands
    float bands = sin(pos.y * 6.0 + n * 2.0) * 0.5 + 0.5;
    base = mix(base, uColor2, bands * 0.15);
    
    return base;
  }
  
  vec3 crystalPlanet(vec3 pos) {
    float n = fbm(pos * 2.5);
    float n2 = snoise(pos * 12.0);
    
    // Icy base
    vec3 ice = mix(vec3(0.6, 0.75, 0.85), vec3(0.45, 0.6, 0.8), n);
    
    // Crystal facets
    float facet = pow(max(abs(n2), 0.0), 2.0);
    vec3 crystalColor = vec3(0.75, 0.85, 0.95);
    ice = mix(ice, crystalColor, facet * 0.4);
    
    // Prismatic refraction effect
    float prism = snoise(pos * 7.0 + vec3(uTime * 0.08));
    vec3 rainbow = vec3(
      sin(prism * 6.28) * 0.5 + 0.5,
      sin(prism * 6.28 + 2.09) * 0.5 + 0.5,
      sin(prism * 6.28 + 4.18) * 0.5 + 0.5
    );
    ice += rainbow * 0.06;
    
    // Sparkle
    float sparkle = pow(max(snoise(pos * 25.0 + uTime * 0.3), 0.0), 8.0);
    ice += vec3(0.8, 0.9, 1.0) * sparkle * 0.4;
    
    return ice;
  }
  
  vec3 gasGiant(vec3 pos) {
    // Atmospheric bands
    float bands = sin(pos.y * 7.0 + fbm(pos * 1.8) * 2.0) * 0.5 + 0.5;
    float bands2 = sin(pos.y * 12.0 + fbm(pos * 2.5 + vec3(uTime * 0.015)) * 1.5) * 0.5 + 0.5;
    
    vec3 band1 = uColor1;
    vec3 band2 = uColor2;
    vec3 band3 = uColor3;
    
    vec3 color = mix(band1, band2, bands);
    color = mix(color, band3, bands2 * 0.35);
    
    // Storm systems
    float storm = fbm(pos * 3.5 + vec3(uTime * 0.02, 0.0, uTime * 0.015));
    float stormMask = smoothstep(0.25, 0.45, storm);
    color = mix(color, uColor3 * 1.2, stormMask * 0.25);
    
    // Great vortex
    vec2 vortexCenter = vec2(0.3, 0.1);
    float vortexDist = length(pos.xz - vortexCenter);
    float vortex = smoothstep(0.35, 0.0, vortexDist);
    float vortexSpiral = sin(atan(pos.z - vortexCenter.y, pos.x - vortexCenter.x) * 3.0 + uTime * 0.4) * 0.5 + 0.5;
    color = mix(color, vec3(0.75, 0.25, 0.08), vortex * vortexSpiral * 0.45);
    
    return color;
  }
  
  void main() {
    vec3 normal = normalize(vNormalWorld);
    vec3 pos = vPosition;
    
    // Get surface color based on planet type
    vec3 surfaceColor;
    if (uPlanetType == 0) {
      surfaceColor = oceanPlanet(pos);
    } else if (uPlanetType == 1) {
      surfaceColor = volcanicPlanet(pos);
    } else if (uPlanetType == 2) {
      surfaceColor = ringedPlanet(pos);
    } else if (uPlanetType == 3) {
      surfaceColor = crystalPlanet(pos);
    } else {
      surfaceColor = gasGiant(pos);
    }
    
    // === LIGHTING ===
    vec3 lightDir = normalize(uLightDir);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    
    // Diffuse lighting (Lambertian)
    float NdotL = dot(normal, lightDir);
    float diffuse = max(NdotL, 0.0);
    
    // Soft terminator (day/night transition)
    float terminator = smoothstep(-0.15, 0.25, NdotL);
    
    // Specular highlight (Blinn-Phong)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
    
    // Ambient (very low - space is dark)
    float ambient = 0.04;
    
    // Night side subtle glow (city lights / volcanic glow)
    float nightSide = 1.0 - terminator;
    vec3 nightGlow = vec3(0.0);
    if (uPlanetType == 1) {
      // Volcanic planet glows on dark side
      nightGlow = surfaceColor * 0.3 * nightSide;
    }
    
    // Combine lighting
    vec3 litColor = surfaceColor * (diffuse * terminator * uLightIntensity + ambient);
    litColor += uLightColor * spec * 0.15 * terminator;
    litColor += nightGlow;
    
    // Rim lighting (atmosphere edge glow) - visible on both day and night
    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    rim = pow(rim, 3.0);
    litColor += uColor3 * rim * 0.25 * (diffuse * 0.7 + 0.3);
    
    // Slight blue fill on shadow side (scattered light)
    litColor += vec3(0.02, 0.03, 0.06) * nightSide * 0.5;
    
    gl_FragColor = vec4(litColor, 1.0);
  }
`;

export const atmosphereVertexShader = `
  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormalWorld = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 uAtmosphereColor;
  uniform float uIntensity;
  uniform vec3 uLightDir;
  
  varying vec3 vNormalWorld;
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 normal = normalize(vNormalWorld);
    vec3 lightDir = normalize(uLightDir);
    
    // Fresnel-based rim
    float rim = 1.0 - max(dot(normal, viewDir), 0.0);
    rim = pow(rim, 2.5);
    
    // Light-dependent atmosphere (brighter on sunlit side)
    float NdotL = dot(normal, lightDir);
    float lightFactor = smoothstep(-0.3, 0.5, NdotL);
    
    // Forward scattering (atmosphere glows when looking toward light)
    float VdotL = dot(viewDir, lightDir);
    float forwardScatter = smoothstep(-0.2, 0.8, VdotL) * 0.3;
    
    float alpha = rim * uIntensity * (lightFactor * 0.8 + 0.2 + forwardScatter);
    vec3 color = uAtmosphereColor * (1.0 + rim * 0.4);
    
    // Warmer color on lit side
    color = mix(color, color * vec3(1.2, 1.0, 0.8), lightFactor * 0.3);
    
    gl_FragColor = vec4(color, alpha * 0.7);
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
    float n1 = snoise(pos * 3.0 + vec3(uTime * 0.08, uTime * 0.04, uTime * 0.06));
    float n2 = snoise(pos * 6.0 + vec3(uTime * 0.12, 0.0, uTime * 0.08));
    float n3 = snoise(pos * 10.0 + vec3(0.0, uTime * 0.15, uTime * 0.04));
    
    float turbulence = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Core colors - blue giant star
    vec3 hotCore = vec3(0.95, 0.97, 1.0);
    vec3 midLayer = vec3(0.55, 0.7, 1.0);
    vec3 outerLayer = vec3(0.25, 0.35, 0.85);
    
    float t = turbulence * 0.5 + 0.5;
    vec3 color = mix(outerLayer, midLayer, smoothstep(0.2, 0.5, t));
    color = mix(color, hotCore, smoothstep(0.5, 0.8, t));
    
    // Solar flares / prominences
    float flare = pow(max(snoise(pos * 3.5 + vec3(uTime * 0.25)), 0.0), 4.0);
    color += vec3(0.4, 0.5, 0.9) * flare * 0.4;
    
    // Granulation
    float granulation = snoise(pos * 18.0 + vec3(uTime * 0.08)) * 0.08;
    color += granulation;
    
    // Limb darkening (realistic star effect)
    float viewDot = dot(vNormal, vec3(0.0, 0.0, 1.0));
    float limb = pow(max(viewDot, 0.0), 0.35);
    color *= mix(0.5, 1.0, limb);
    
    // Overall brightness
    color *= 1.4;
    
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
    float rays = pow(abs(sin(angle * 8.0 + uTime * 0.25)), 4.0);
    float rays2 = pow(abs(sin(angle * 12.0 - uTime * 0.18)), 6.0);
    
    // Noise-based corona structure
    float noise = snoise(vPosition * 2.0 + vec3(uTime * 0.08)) * 0.5 + 0.5;
    
    float corona = rim * (1.0 + rays * 0.5 + rays2 * 0.3) * noise;
    corona = pow(corona, 1.5) * uIntensity;
    
    vec3 innerColor = vec3(0.65, 0.75, 1.0);
    vec3 outerColor = vec3(0.15, 0.25, 0.7);
    vec3 color = mix(innerColor, outerColor, rim);
    
    float alpha = corona * 0.55;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Ring shader
export const ringVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormalWorld;
  
  void main() {
    vUv = uv;
    vNormalWorld = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const ringFragmentShader = `
  uniform vec3 uRingColor;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uTime;
  uniform vec3 uLightDir;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormalWorld;
  
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
    
    // Gaps in rings
    float gap1 = smoothstep(0.48, 0.50, dist) * (1.0 - smoothstep(0.52, 0.54, dist));
    float gap2 = smoothstep(0.68, 0.69, dist) * (1.0 - smoothstep(0.70, 0.71, dist));
    float gaps = 1.0 - (gap1 + gap2) * 0.8;
    
    // Fade at edges
    float innerFade = smoothstep(0.3, 0.4, dist);
    float outerFade = 1.0 - smoothstep(0.85, 0.95, dist);
    float edgeFade = innerFade * outerFade;
    
    // Particle density variation
    float density = hash(floor(dist * 200.0)) * 0.3 + 0.7;
    
    // Lighting on rings
    vec3 lightDir = normalize(uLightDir);
    float NdotL = abs(dot(normalize(vNormalWorld), lightDir));
    float lighting = NdotL * 0.7 + 0.3;
    
    float alpha = ringPattern * gaps * edgeFade * density * 0.65;
    
    vec3 color = uRingColor * (0.8 + ringPattern * 0.4) * lighting;
    color += vec3(0.08, 0.04, 0.0) * bands2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
