import { boatCourse } from './boat-course'

function boatModel(T) {
  const model = new T.Group()
  const wood = new T.MeshStandardMaterial({ color: '#694331', roughness: .82 })
  const deck = new T.MeshStandardMaterial({ color: '#bb8a58', roughness: .9 })
  const trim = new T.MeshStandardMaterial({ color: '#deae70', roughness: .78 })
  const awning = new T.MeshStandardMaterial({ color: '#466161', roughness: .92, side: T.DoubleSide })
  const rib = new T.MeshStandardMaterial({ color: '#87968a', roughness: .9 })
  const hull = new T.Shape()
  hull.moveTo(1.43, 0)
  hull.quadraticCurveTo(.92, .42, .26, .46)
  hull.quadraticCurveTo(-.91, .47, -1.13, .28)
  hull.lineTo(-1.24, 0)
  hull.lineTo(-1.13, -.28)
  hull.quadraticCurveTo(-.91, -.47, .26, -.46)
  hull.quadraticCurveTo(.92, -.42, 1.43, 0)
  const body = new T.Mesh(new T.ExtrudeGeometry(hull, {
    depth: .19, bevelEnabled: true, bevelThickness: .07, bevelSize: .04, bevelSegments: 1, curveSegments: 10,
  }), wood)
  body.position.z = -.13
  model.add(body)
  const floor = new T.Mesh(new T.ShapeGeometry(hull, 10), deck)
  floor.scale.set(.91, .87, 1)
  floor.position.z = .14
  model.add(floor)

  function plank(length, width, height, x, y, z, material) {
    const mesh = new T.Mesh(new T.BoxGeometry(length, width, height), material)
    mesh.position.set(x, y, z)
    model.add(mesh)
    return mesh
  }
  for (const side of [-1, 1]) plank(1.30, .035, .035, -.18, side * .40, .14, trim)
  for (const x of [-1.01, -.88, .54, .69, .84]) {
    plank(.018, x > .7 || x < -.95 ? .43 : .60, .013, x, 0, .148, wood)
  }
  const roof = new T.PlaneGeometry(.96, Math.PI * .36, 2, 12)
  const positions = roof.getAttribute('position')
  for (let i = 0; i < positions.count; i++) {
    const angle = positions.getY(i) / .36
    positions.setXYZ(i, positions.getX(i) - .13, .36 * Math.sin(angle), .19 + .39 * Math.cos(angle))
  }
  roof.computeVertexNormals()
  model.add(new T.Mesh(roof, awning))
  for (const x of [-.60, -.37, -.13, .11, .34]) {
    const arc = new T.Curve()
    arc.getPoint = (t, point = new T.Vector3()) => {
      const angle = Math.PI * (t - .5)
      return point.set(x, .366 * Math.sin(angle), .196 + .395 * Math.cos(angle))
    }
    model.add(new T.Mesh(new T.TubeGeometry(arc, 12, .017, 5, false), rib))
  }
  const oar = plank(.81, .036, .032, -1.03, -.23, .20, trim)
  oar.rotation.z = .42
  return model
}

export function createAtlasBoat(T, flow, waterLevel, ocean) {
  const route = boatCourse(flow)
  const group = new T.Group()
  const pivot = new T.Group()
  const model = boatModel(T)
  group.add(pivot)
  pivot.add(model)

  const routePoints = []
  const sample = new T.Vector2()
  for (let d = 0; d < route.mouthEnd; d += 1) {
    route.pointAt(d, sample)
    routePoints.push(new T.Vector3(sample.x, sample.y, waterLevel + .25))
  }
  const guide = new T.Line(new T.BufferGeometry().setFromPoints(routePoints),
    new T.LineBasicMaterial({ color: '#fff0b9', transparent: true, opacity: .82, depthWrite: false }))
  const splash = new T.Mesh(new T.RingGeometry(.84, 1, 40),
    new T.MeshBasicMaterial({ color: '#f9f4d9', transparent: true, depthWrite: false }))

  const trailCount = 18
  const trailGeometry = new T.BufferGeometry()
  const trailPositions = new T.BufferAttribute(new Float32Array((trailCount-1)*4*3), 3).setUsage(T.DynamicDrawUsage)
  const trailAlpha = new T.BufferAttribute(new Float32Array((trailCount-1)*4), 1).setUsage(T.DynamicDrawUsage)
  trailGeometry.setAttribute('position', trailPositions)
  trailGeometry.setAttribute('strength', trailAlpha)
  const trail = new T.LineSegments(trailGeometry, new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: `attribute float strength; varying float vStrength;
      void main() { vStrength = strength; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying float vStrength;
      void main() { gl_FragColor = vec4(.82, .88, .79, vStrength);
        #include <colorspace_fragment>
      }`,
  }))
  trail.frustumCulled = false
  const sceneObject = new T.Group()
  sceneObject.add(group, guide, splash, trail)
  guide.visible = splash.visible = trail.visible = false

  const position = new T.Vector2(), ahead = new T.Vector2(), anchor = new T.Vector2()
  const destination = new T.Vector2(), direction = new T.Vector2(), candidate = new T.Vector2()
  const wave = new T.Vector3()
  const trailSamples = []
  let mode = 'dock', distance = 0, heading = -.17, height = waterLevel
  let voyageTime = 0, launchAt = -Infinity, lastTrail = -Infinity, oceanTime = 0, steering = false
  let speed = 0

  function setCourse(d, instant = false) {
    route.pointAt(d, position)
    route.pointAt(d + 5, ahead)
    if (instant && ahead.distanceToSquared(position) > .01) heading = Math.atan2(ahead.y-position.y, ahead.x-position.x)
    height = T.MathUtils.lerp(waterLevel, ocean.mesh.position.z,
      T.MathUtils.smoothstep(d, route.mouthStart, route.mouthEnd))
  }

  function enterSea() {
    mode = 'sea'
    setCourse(route.length)
    anchor.copy(position)
    destination.copy(position)
    oceanTime = 0
    steering = false
    speed = 0
  }

  function updateTrail(scale, moving) {
    if (moving && voyageTime - lastTrail >= .09) {
      trailSamples.unshift({ x: position.x, y: position.y, z: height, heading, time: voyageTime })
      if (trailSamples.length > trailCount) trailSamples.pop()
      lastTrail = voyageTime
    }
    let index = 0
    for (let i = 1; i < trailSamples.length; i++) {
      const newer = trailSamples[i-1], older = trailSamples[i]
      if (voyageTime - older.time >= 1.45) break
      for (const side of [-1, 1]) {
        for (const point of [newer, older]) {
          const age = voyageTime - point.time
          const spread = side * scale * (.23 + age * .39)
          const aft = scale * .89
          const sin = Math.sin(point.heading), cos = Math.cos(point.heading)
          trailPositions.setXYZ(index, point.x - cos*aft - sin*spread, point.y - sin*aft + cos*spread, point.z + .32)
          trailAlpha.setX(index, .68 * (1 - age / 1.45) ** 1.5)
          index++
        }
      }
    }
    trail.visible = index > 0
    trailPositions.needsUpdate = trailAlpha.needsUpdate = index > 0
    trailGeometry.setDrawRange(0, index)
  }

  return {
    object: sceneObject,
    get atSea() { return mode === 'sea' },
    beginDrag() { mode = 'drag'; guide.visible = true },
    snap(point, reach) { return route.nearestRiver(point.x, point.y, reach) },
    drag(point, snapped) {
      if (snapped !== null) {
        setCourse(snapped, true)
        group.position.set(position.x, position.y, height + 9)
        group.rotation.z = heading
      } else {
        group.position.copy(point).z += 9
        group.rotation.z = -.12
      }
    },
    launch(start, reduced) {
      guide.visible = false
      distance = start
      setCourse(distance, true)
      if (reduced) { enterSea(); return }
      mode = 'river'
      voyageTime = 0
      launchAt = voyageTime
      lastTrail = -Infinity
      speed = 0
      splash.position.set(position.x, position.y, height + .35)
      splash.visible = true
    },
    steer(point, reduced) {
      if (mode !== 'sea' || ocean.clearance(point.x, point.y) < 6) return false
      direction.set(point.x-position.x, point.y-position.y)
      const span = direction.length()
      if (span < 2) return true
      direction.divideScalar(span)
      destination.copy(position)
      for (let d = Math.min(3, span); ; d = Math.min(d + 3, span)) {
        candidate.copy(position).addScaledVector(direction, d)
        if (ocean.clearance(candidate.x, candidate.y) < 6) break
        destination.copy(candidate)
        if (d === span) break
      }
      anchor.copy(destination)
      oceanTime = 0
      if (reduced) position.copy(destination)
      steering = !reduced && destination.distanceToSquared(position) > 4
      return true
    },
    reset() {
      mode = 'dock'
      guide.visible = splash.visible = trail.visible = false
      trailSamples.length = 0
      speed = 0
    },
    update({ active, dock, dt, time, reduced, worldPerPixel, highlighted }) {
      sceneObject.visible = active
      if (!active) return
      const scale = worldPerPixel * (mode === 'dock' ? 25 : mode === 'drag' ? 16 : 11.4)
      group.scale.setScalar(scale)
      if (mode === 'dock') {
        group.visible = !!dock
        if (dock) group.position.copy(dock)
        group.rotation.z = -.27 + (highlighted && !reduced ? .09 : 0)
        pivot.rotation.set(.18, -.20, 0)
        return
      }
      group.visible = true
      if (mode === 'drag') { pivot.rotation.set(.10, -.07, 0); return }
      if (reduced && mode === 'river') enterSea()

      voyageTime += dt
      let moving = false
      let yaw = heading
      let bob = 0, roll = 0, pitch = 0
      if (mode === 'river') {
        const age = voyageTime-launchAt
        speed = T.MathUtils.lerp(speed, 46, 1-Math.exp(-dt * 3))
        distance = Math.min(route.length, distance + speed * dt)
        setCourse(distance)
        if (ahead.distanceToSquared(position) > .01) yaw = Math.atan2(ahead.y-position.y, ahead.x-position.x)
        const immersion = Math.exp(-age * 4.6)
        bob = (.16 - .32 * Math.sin(age * 14)) * immersion
        roll = .11 * Math.sin(age * 12) * immersion
        splash.visible = age < .66
        splash.scale.setScalar(scale * (.5 + age * 2.3))
        splash.material.opacity = .58 * Math.max(0, 1-age/.66)
        moving = true
        if (distance >= route.length) enterSea()
      } else if (!reduced) {
        oceanTime += dt
        if (steering) {
          direction.copy(destination).sub(position)
          const remaining = direction.length()
          if (remaining > .3) {
            direction.divideScalar(remaining)
            yaw = Math.atan2(direction.y, direction.x)
            speed = T.MathUtils.lerp(speed, Math.min(32, remaining * 2.7), 1 - Math.exp(-dt * 4))
            // Follow the current heading for a short turning arc if it stays in open water.
            const step = Math.min(remaining, speed * dt)
            candidate.set(Math.cos(heading), Math.sin(heading)).multiplyScalar(step).add(position)
            if (ocean.clearance(candidate.x, candidate.y) < 6 || candidate.distanceToSquared(destination) >= remaining*remaining) {
              candidate.copy(position).addScaledVector(direction, step)
            }
            if (ocean.clearance(candidate.x, candidate.y) >= 6) {
              position.copy(candidate)
              moving = speed > 4
            } else { steering = false; anchor.copy(position); speed = 0 }
          } else { steering = false; oceanTime = 0; anchor.copy(position); speed = 0 }
        } else {
          candidate.set(anchor.x + Math.sin(oceanTime * .39) * 3.6, anchor.y + Math.sin(oceanTime * .27) * 2.4)
          if (ocean.clearance(candidate.x, candidate.y) >= 6) position.lerp(candidate, 1 - Math.exp(-dt * 2))
        }
        ocean.wakeAt(position.x, position.y, time, wave)
        const sin = Math.sin(heading), cos = Math.cos(heading)
        bob = .037 * Math.sin(time * 2.1) + T.MathUtils.clamp(wave.x, -.20, .20) * .55
        roll = .024 * Math.sin(time * 2.5) + T.MathUtils.clamp((-wave.y * sin + wave.z * cos) * 1.4, -.29, .29)
        pitch = -.018 * Math.cos(time * 1.8) - T.MathUtils.clamp((wave.y * cos + wave.z * sin) * .75, -.17, .17)
      }
      const angle = Math.atan2(Math.sin(yaw - heading), Math.cos(yaw - heading))
      heading += angle * (1 - Math.exp(-dt * 7))
      group.rotation.z = heading
      group.position.set(position.x, position.y, height + scale * (.11 + bob))
      const balance = reduced ? 1 : 1 - Math.exp(-dt * 12)
      pivot.rotation.x = T.MathUtils.lerp(pivot.rotation.x, roll, balance)
      pivot.rotation.y = T.MathUtils.lerp(pivot.rotation.y, pitch, balance)
      updateTrail(scale, moving && !reduced)
    },
  }
}
