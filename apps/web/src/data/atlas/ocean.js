import * as THREE from 'three'
import geography from './ocean-geometry.json'
import distanceUrl from './ocean-distance.png?url'
import { makeShapes } from './water'

export { THREE }

const wakeCount = 20
const sampleSpacing = 3.5
const [left, bottom, right, top] = geography.distanceBounds

export const oceanDefaults = {
  wind: 1, wake: 1.15, speed: 19, decay: 1.65, reflection: 1, bloom: .08,
}

const vertexShader = /* glsl */`
  varying vec2 vMap;
  varying float vVertical;
  void main() {
    vMap = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vVertical = gl_Position.y / gl_Position.w;
  }
`

const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uMotion;
  uniform float uWind;
  uniform float uWake;
  uniform float uSpeed;
  uniform float uDecay;
  uniform float uReflection;
  uniform float uHasDistance;
  uniform float uHasSky;
  uniform float uOpacity;
  uniform sampler2D uDistance;
  uniform sampler2D uSky;
  uniform vec4 uDistanceBounds;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uPaper;
  uniform vec3 uView;
  uniform vec4 uDisturbances[${wakeCount}];
  uniform vec2 uDirections[${wakeCount}];
  varying vec2 vMap;
  varying float vVertical;

  vec3 wave(vec2 p, vec2 k, float phase, float amplitude) {
    float angle = dot(p, k) + phase;
    return amplitude * vec3(sin(angle), cos(angle) * k);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    vec4 seeds = dot(i, vec2(127.1, 311.7)) + vec4(0.0, 127.1, 311.7, 438.8);
    vec4 n = fract(sin(seeds) * 43758.5453);
    return mix(mix(n.x, n.y, f.x), mix(n.z, n.w, f.x), f.y);
  }

  vec3 wake(vec2 p) {
    vec3 waves = vec3(0.0);
    for (int i = 0; i < ${wakeCount}; i++) {
      vec4 source = uDisturbances[i];
      float age = uTime - source.z;
      if (source.w <= 0.0 || age < 0.0 || age >= uDecay) continue;
      vec2 direction = uDirections[i];
      vec2 lateral = vec2(-direction.y, direction.x);
      vec2 offset = p - source.xy;
      vec2 scaled = vec2(dot(offset, direction) * 0.92, dot(offset, lateral) * 1.13);
      float radius = length(scaled);
      float band = radius - age * uSpeed - 1.6;
      if (abs(band) > 10.0) continue;
      float trailing = mix(0.22, 1.0, 1.0 - smoothstep(-0.55, 0.85, scaled.x / max(radius, 0.25)));
      float fade = (1.0 - smoothstep(0.05, uDecay, age)) * smoothstep(0.0, 0.09, age);
      float envelope = exp(-band * band * 0.038) * trailing * fade * source.w;
      vec2 gradient = (direction * scaled.x * 0.92 + lateral * scaled.y * 1.13) / max(radius, 0.25);
      float angle = band * 0.83;
      float slope = 0.83 * cos(angle) - 0.076 * band * sin(angle);
      waves += envelope * vec3(sin(angle), slope * gradient);
    }
    return waves / (1.0 + abs(waves.x) * 0.55);
  }

  void main() {
    vec2 p = vMap;
    vec2 depthUv = (p - uDistanceBounds.xy) / uDistanceBounds.zw;
    float distance = mix(48.0, texture2D(uDistance, depthUv).r * ${geography.distanceRange.toFixed(1)}, uHasDistance);
    float depth = smoothstep(1.0, 120.0, distance);
    float shoaling = smoothstep(1.0, 13.0, distance);
    // Change the phase and strength across the water to break up periodic crests.
    float bend = noise(p * .048 + vec2(-uTime * .055, uTime * .013)) - .5;
    float crosswind = noise(p * .092 + vec2(.0, uTime * .025)) - .5;
    float gust = noise(p * .031 - vec2(uTime * .025, .0));
    vec3 wind = wave(p, vec2(.31, .17), -uTime * 1.37 + bend * 5.5, .17);
    wind += wave(p, vec2(.12, -.29), -uTime * 1.65 + crosswind * 3.7, .085);
    wind += wave(p, vec2(.59, .34), -uTime * 2.08 + bend * 6.8 + crosswind * 3.1, .044);
    wind += wave(p, vec2(-.38, .53), -uTime * 2.38 + crosswind * 5.2, .028);
    wind += wave(p, vec2(.96, -.62), uTime * 2.71 + bend * 5.1, .017);
    float pixel = max(length(dFdx(p)), length(dFdy(p)));
    wind *= uWind * mix(.58, 1.34, gust) * mix(0.5, 1.0, shoaling) * (1.0 - 0.6 * smoothstep(2.0, 7.0, pixel));
    vec3 pulse = uMotion > 0.5 ? wake(p) * uWake * shoaling : vec3(0.0);
    vec3 surface = wind + pulse;
    vec3 normal = normalize(vec3(-surface.yz, 1.0));
    vec3 reflected = reflect(-uView, normal);
    float facing = clamp(dot(uView, normal), 0.0, 1.0);
    float fresnel = .025 + .975 * pow(1.0 - facing, 5.0);
    vec3 sky = vec3(.45, .63, .68);
    if (uHasSky > 0.5) {
      vec3 skyRay = vec3(reflected.x, reflected.z, -reflected.y);
      vec2 skyUv = vec2(atan(skyRay.z, skyRay.x) * 0.15915494 + 0.5,
                        asin(clamp(skyRay.y, -1.0, 1.0)) * 0.31830989 + 0.5);
      vec3 hdr = texture2D(uSky, skyUv).rgb;
      sky = mix(sky, hdr / (1.0 + hdr), 0.50);
    }
    vec3 sun = normalize(vec3(-0.22, -0.04, 1.0));
    float glint = pow(max(dot(normal, normalize(sun + uView)), 0.0), 155.0);
    float sheen = pow(max(dot(normal, normalize(sun + uView)), 0.0), 34.0);
    float currents = noise(p * vec2(.012, .034) - vec2(uTime * .023, .0)) - .5;
    vec3 color = mix(uShallow, uDeep, depth) * (1.0 + currents * .22 + surface.x * .17);
    color = mix(color, sky, (0.085 + fresnel * 2.5) * clamp(uReflection, 0.0, 1.5));
    color += vec3(.64, .78, .76) * (sheen * .067 + glint * .18) * uReflection;
    color += vec3(.88, .96, 1.0) * pow(glint, 8.0) * .70 * uReflection;
    float shore = smoothstep(.7, 2.5, distance) * (1.0 - smoothstep(3.0, 12.0, distance));
    float foam = smoothstep(.46, .95, sin(distance * .76 - uTime * 1.45 + bend * 1.5));
    color += vec3(.31, .38, .32) * shore * foam * .35;
    float paperFade = smoothstep(-1.0, -.68, vVertical) * (1.0 - smoothstep(.67, 1.0, vVertical));
    // Feather into the atlas background in linear color before the HDR pass.
    color = mix(uPaper, color, paperFade * uOpacity);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function createOcean(requestDraw) {
  const settings = { ...oceanDefaults }
  const disturbances = Array.from({ length: wakeCount }, () => new THREE.Vector4())
  const directions = Array.from({ length: wakeCount }, () => new THREE.Vector2())
  const fallbackMap = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
  fallbackMap.needsUpdate = true
  const uniforms = {
    uTime: { value: 0 }, uMotion: { value: 1 }, uOpacity: { value: 1 },
    uWind: { value: settings.wind }, uWake: { value: settings.wake },
    uSpeed: { value: settings.speed }, uDecay: { value: settings.decay },
    uReflection: { value: settings.reflection }, uView: { value: new THREE.Vector3() },
    uHasDistance: { value: 0 }, uHasSky: { value: 0 },
    uDistance: { value: fallbackMap }, uSky: { value: fallbackMap },
    uDistanceBounds: { value: new THREE.Vector4(left, bottom, right - left, top - bottom) },
    uShallow: { value: new THREE.Color('#8eb2ae') }, uDeep: { value: new THREE.Color('#467c88') },
    uPaper: { value: new THREE.Color('#e8ede5') },
    uDisturbances: { value: disturbances }, uDirections: { value: directions },
  }
  const geometry = new THREE.ShapeGeometry(makeShapes(THREE, geography.polygons))
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader, depthWrite: false, toneMapped: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.z = -1
  // The raised terrain draws over the ocean in the shared depth buffer.
  mesh.renderOrder = -1

  let depthPixels = null
  const distanceMap = new THREE.TextureLoader().load(distanceUrl, texture => {
    if (disposed) return
    uniforms.uDistance.value = texture
    uniforms.uHasDistance.value = 1
    const raster = document.createElement('canvas')
    raster.width = texture.image.width
    raster.height = texture.image.height
    const ctx = raster.getContext('2d')
    if (ctx) {
      ctx.drawImage(texture.image, 0, 0)
      depthPixels = ctx.getImageData(0, 0, raster.width, raster.height)
    }
    requestDraw()
  })
  distanceMap.generateMipmaps = false
  distanceMap.minFilter = THREE.LinearFilter
  distanceMap.magFilter = THREE.LinearFilter

  let disposed = false
  let next = 0
  let lastX = 0
  let lastY = 0
  let lastTime = 0
  let lastDisturbance = -Infinity
  let lastInput = null

  return {
    mesh, settings,
    clearance(x, y) {
      if (!depthPixels || x < left || x >= right || y <= bottom || y > top) return 0
      const col = Math.floor((x - left) / (right - left) * depthPixels.width)
      const row = Math.floor((top - y) / (top - bottom) * depthPixels.height)
      return depthPixels.data[(row * depthPixels.width + col) * 4] * geography.distanceRange / 255
    },
    wakeAt(x, y, time, out) {
      let height = 0, slopeX = 0, slopeY = 0
      for (let i = 0; i < wakeCount; i++) {
        const source = disturbances[i]
        const age = time - source.z
        if (!source.w || age < 0 || age >= settings.decay) continue
        const dir = directions[i]
        const dx = x - source.x, dy = y - source.y
        const along = (dx * dir.x + dy * dir.y) * .92
        const side = (-dx * dir.y + dy * dir.x) * 1.13
        const radius = Math.hypot(along, side)
        const band = radius - age * settings.speed - 1.6
        if (Math.abs(band) > 10) continue
        const distance = Math.max(radius, .25)
        const trailing = 1 - .78 * THREE.MathUtils.smoothstep(along / distance, -.55, .85)
        const fade = (1 - THREE.MathUtils.smoothstep(age, .05, settings.decay)) * THREE.MathUtils.smoothstep(age, 0, .09)
        const envelope = Math.exp(-band * band * .038) * trailing * fade * source.w
        const angle = band * .83
        const sin = Math.sin(angle)
        const slope = envelope * (.83 * Math.cos(angle) - .076 * band * sin) / distance
        height += envelope * sin
        slopeX += slope * (dir.x * along * .92 - dir.y * side * 1.13)
        slopeY += slope * (dir.y * along * .92 + dir.x * side * 1.13)
      }
      return out.set(height, slopeX, slopeY).multiplyScalar(settings.wake / (1 + Math.abs(height) * .55))
    },
    clearPointer() { lastInput = null },
    sample(point, time) {
      if (!lastInput) {
        lastX = point.x
        lastY = point.y
        lastTime = time
        lastInput = time || Number.EPSILON
        return
      }
      if (time - lastInput > .24 || Math.hypot(point.x - lastX, point.y - lastY) > 64) {
        lastX = point.x
        lastY = point.y
        lastTime = time
      }
      lastInput = time || Number.EPSILON
      const dx = point.x - lastX
      const dy = point.y - lastY
      const length = Math.hypot(dx, dy)
      if (length < sampleSpacing) return
      const stepX = dx / length
      const stepY = dy / length
      const strength = THREE.MathUtils.clamp(length / Math.max(time - lastTime, .016) / 440, .11, .42)
      for (let traveled = sampleSpacing; traveled <= length; traveled += sampleSpacing) {
        lastX += stepX * sampleSpacing
        lastY += stepY * sampleSpacing
        disturbances[next].set(lastX, lastY, time, strength)
        directions[next].set(stepX, stepY)
        next = (next + 1) % wakeCount
      }
      lastTime = time
      lastDisturbance = time
    },
    update(time, reduced, opacity, camera, environment) {
      mesh.visible = opacity > .003
      uniforms.uTime.value = reduced ? 0 : time
      uniforms.uMotion.value = !reduced && time - lastDisturbance < settings.decay ? 1 : 0
      uniforms.uOpacity.value = opacity
      uniforms.uView.value.set(0, 0, 1).applyQuaternion(camera.quaternion)
      uniforms.uWind.value = reduced ? .68 : settings.wind
      uniforms.uWake.value = settings.wake
      uniforms.uSpeed.value = settings.speed
      uniforms.uDecay.value = settings.decay
      uniforms.uReflection.value = settings.reflection
      const sky = environment?.mapping === THREE.EquirectangularReflectionMapping ? environment : null
      uniforms.uSky.value = sky || fallbackMap
      uniforms.uHasSky.value = sky ? 1 : 0
    },
    dispose() {
      disposed = true
      mesh.removeFromParent()
      geometry.dispose()
      material.dispose()
      distanceMap.dispose()
      fallbackMap.dispose()
    },
  }
}
