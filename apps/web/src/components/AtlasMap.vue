<template>
  <div ref="host" class="atlas-map" tabindex="-1" aria-label="江苏文化地图" :class="{ 'map-ready': ready, 'map-fallback': fallback }">
    <canvas v-if="!fallback" ref="canvas" aria-hidden="true" @pointermove="pick" @pointerleave="clearHover" @pointercancel="clearHover" @click="pick($event, true)" />
    <button v-if="ready && !fallback && active && phase === 'overview' && !waterFocus" ref="launchControl"
      class="boat-launch" :class="{ 'boat-underway': boatLaunched }" type="button" data-atlas-scroll
      :aria-label="boatLaunched ? '收回小船' : '放小船入水，可拖到长江或点击启航'"
      @pointerdown.stop="prepareBoat" @pointermove.stop="dragBoat" @pointerup.stop="dropBoat"
      @pointercancel="cancelBoatDrag" @lostpointercapture="cancelBoatDrag" @click.stop="clickBoat"
      @pointerenter="highlightBoat(true)" @pointerleave="highlightBoat(false)"
      @focus="highlightBoat(true)" @blur="highlightBoat(false)"
      @keydown.space.stop @keydown.esc.stop.prevent="resetBoat">
      <span v-if="boatLaunched" aria-hidden="true">↶</span>
    </button>
    <svg v-if="fallback" class="flat-map" :viewBox="flatViewBox" aria-label="江苏十三市地图">
      <path v-if="!waterFocus" :d="oceanPath" class="flat-ocean" fill-rule="evenodd" />
      <path v-for="body in waterBodies.filter(b=>!b.detail)" :key="body.id" :d="waterPath(body.polygons)" class="flat-water" :style="{fill:waterStyle[body.seasonal?'seasonal':body.detail?'detail':body.kind]}" fill-rule="evenodd" />
      <path :d="waterPath(lakeIslands)" class="flat-islands" fill-rule="evenodd" />
      <path v-for="region in regions" :key="region.id" :d="waterPath(dryLand[region.id])" fill-rule="evenodd"
        class="flat-land"
        :class="{ highlighted: hover === region.id || selected === region.id, muted: counts && !counts[region.id] }"
        @pointerenter="emit('hover', region.id)" @pointerleave="emit('hover', null)" @click="choose(region.id,$event)" />
      <path v-for="body in waterBodies.filter(b=>b.detail)" :key="body.id" :d="waterPath(body.polygons)" class="flat-water" :style="{fill:waterStyle[body.seasonal?'seasonal':body.detail?'detail':body.kind]}" fill-rule="evenodd" />
      <g v-for="(families,city) in waterLines" :key="city" class="flat-channels"><path v-for="(lines,family) in families" :key="family" :d="linePath(lines)" :class="family" :style="{stroke:waterStyle[family==='seasonal'?'seasonal':'channel']}" /></g>
      <path v-for="(lines,city) in landEdges" :key="`boundary-${city}`" :d="linePath(lines)" class="flat-boundary" />
      <path v-for="region in regions" :key="`hit-${region.id}`" :d="region.path" class="flat-hit" @pointerenter="emit('hover',region.id)" @pointerleave="emit('hover',null)" @click="choose(region.id,$event)" />
      <path v-for="body in waterBodies.filter(b=>waterStories[b.id])" :key="`water-hit-${body.id}`" :d="waterPath(body.polygons)" class="flat-water-hit" fill-rule="evenodd" @pointermove="showWaterTip(body.id,$event)" @pointerleave="clearHover" @click.stop="emit('water-select',body.id)" />
    </svg>
    <div v-if="debugOcean && !fallback" v-show="active && phase === 'overview' && !waterFocus" ref="oceanPanel" class="ocean-panel" data-atlas-scroll />
    <span v-if="!ready" class="map-loading" role="status">正在展开江苏山水…</span>
    <span v-if="waterTip && active && phase === 'overview'" class="water-tip" :style="{left:`${tipPosition.x}px`,top:`${tipPosition.y}px`}" role="tooltip">{{ waterStories[waterTip].title }}<small>点击读水岸故事 ↗</small></span>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { waterStories } from '@/data/atlas/water-stories'
import { regions, bounds, mapViewBox } from '@/data/atlas/geometry'
import { createWater, makeShapes, waterBodies, dryLand, lakeIslands, waterPath, waterStyle, waterLines, linePath, landEdges, hasRelief, yangtzeFlow } from '@/data/atlas/water'
import oceanGeography from '@/data/atlas/ocean-geometry.json'
import { createAtlasBoat } from './atlas/atlas-boat'
const props = defineProps({ active: Boolean, selected: String, hover: String, phase: String, counts: Object, recent: String, reduced: Boolean, waterFocus: String })
const emit = defineEmits(['select', 'hover', 'ready', 'water-select'])
const waterTip=ref(null),tipPosition=ref({x:0,y:0})
const oceanPath = waterPath(oceanGeography.polygons)
const flatViewBox=computed(()=>{const f=waterStories[props.waterFocus];return f ? `${f.center[0]-f.span[0]/2} ${-f.center[1]-f.span[1]/2} ${f.span[0]} ${f.span[1]}` : mapViewBox})
function showWaterTip(id,event) {
  if(!props.active || props.phase!=='overview' || !waterStories[id]){waterTip.value=null;return}
  const rect=host.value.getBoundingClientRect()
  waterTip.value=id
  tipPosition.value={x:Math.max(8,Math.min(rect.width-166,event.clientX-rect.left+14)),y:Math.max(8,Math.min(rect.height-60,event.clientY-rect.top-60))}
}
const host = ref(null), canvas = ref(null), fallback = ref(false), ready = ref(false)
const debugOcean = import.meta.env.DEV && new URLSearchParams(window.location.search).get('waterDebug') === '1'
const oceanPanel = ref(null)
const launchControl = ref(null), boatLaunched = ref(false)
let T, renderer, scene, camera, observer, frame = 0, disposed = false, previous = 0, meshes = [], raycaster, pointer, target, started = false
let grainTexture = null
let water = null, elapsed = 0, lastDraw = 0, pickMeshes = [], landMeshes = [], scratchColor
let ocean, stage, unmountOceanControls, oceanOpacity = 1
let boat, boatDrag, boatPoint, boatPlane, boatDock, boatHighlighted = false, ignoreBoatClick = false
let width = 1, height = 1, homeX = 0, homeY = 0, viewHeight = 500, zoom = 1
const midX = (bounds.minX + bounds.maxX) / 2, midY = (bounds.minY + bounds.maxY) / 2
function choose(id,event) {
  if (props.phase !== 'overview' || !props.active || props.waterFocus) return
  const rect = host.value.getBoundingClientRect()
  emit('select', { id, x: event ? event.clientX-rect.left : width/2, y: event ? event.clientY-rect.top : height/2 })
}
function pointerRay(event) {
  const rect = canvas.value.getBoundingClientRect()
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
  raycaster.setFromCamera(pointer, camera)
}
function highlightBoat(value) { boatHighlighted = value; schedule() }
function prepareBoat(event) {
  ignoreBoatClick = false
  if (!boat || boatLaunched.value || !event.isPrimary || event.button !== 0) return
  boatDrag = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false, control: event.currentTarget }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function boatDropPoint(event) {
  pointerRay(event)
  boatPlane.constant = -waterStyle.level
  return raycaster.ray.intersectPlane(boatPlane, boatPoint)
}
function dragBoat(event) {
  if (boatDrag?.id !== event.pointerId) return
  if (!boatDrag.moved) {
    if (Math.hypot(event.clientX - boatDrag.x, event.clientY - boatDrag.y) < 6) return
    boatDrag.moved = true
    boat.beginDrag()
    clearHover()
  }
  const point = boatDropPoint(event)
  if (point) boat.drag(point, boat.snap(point, viewHeight / height / zoom * 13))
  schedule()
}
function launchBoat(start) {
  boat.launch(start, props.reduced)
  boatLaunched.value = true
  schedule()
}
function dropBoat(event) {
  if (boatDrag?.id !== event.pointerId) return
  const { moved, control } = boatDrag
  boatDrag = null
  if (control.hasPointerCapture(event.pointerId)) control.releasePointerCapture(event.pointerId)
  if (!moved) return
  ignoreBoatClick = true
  const point = boatDropPoint(event)
  const snapped = point && boat.snap(point, viewHeight / height / zoom * 13)
  if (snapped !== null) launchBoat(snapped)
  else resetBoat()
}
function cancelBoatDrag(event) {
  if (boatDrag && (!event || boatDrag.id === event.pointerId)) resetBoat()
}
function resetBoat() {
  const drag = boatDrag
  boatDrag = null
  if (drag?.control.hasPointerCapture(drag.id)) drag.control.releasePointerCapture(drag.id)
  boat?.reset()
  boatLaunched.value = false
  schedule()
}
function clickBoat(event) {
  if (!boat || (ignoreBoatClick && event.detail > 0)) return
  if (boatLaunched.value) resetBoat()
  else launchBoat(0)
}
function pick(event, click = false) {
  if (!renderer || props.phase !== 'overview' || !props.active) return
  pointerRay(event)
  const waterHit=raycaster.intersectObjects(water?.meshes || [])[0]
  const wantsOcean = click ? boat?.atSea : !props.reduced && (event.pointerType !== 'touch' || (boat?.atSea && event.buttons > 0))
  const oceanHit = wantsOcean && ocean?.mesh.visible && !props.waterFocus
    ? raycaster.intersectObject(ocean.mesh)[0] : null
  const landHit=waterHit || oceanHit ? raycaster.intersectObjects(landMeshes)[0] : null
  const onWater=waterHit && (!landHit || waterHit.distance<landHit.distance)
  const onOcean = oceanHit && !onWater && (!landHit || oceanHit.distance < landHit.distance)
  if (onOcean && click && boat.steer(oceanHit.point, props.reduced)) { schedule(); return }
  if (onOcean && !click) ocean.sample(oceanHit.point, elapsed)
  else if (!click) ocean?.clearPointer()
  water?.hover(onWater ? waterHit : null)
  if(onWater)showWaterTip(waterHit.object.userData.water,event)
  else waterTip.value=null
  const id = raycaster.intersectObjects(pickMeshes)[0]?.object.userData.id || null
  emit('hover', onWater || props.waterFocus ? null : id)
  schedule()
  if(click && onWater && waterStories[waterHit.object.userData.water]) { waterTip.value=null;emit('water-select',waterHit.object.userData.water) }
  else if (click && id) choose(id,event)
}
function clearHover() { waterTip.value=null;water?.hover(null);ocean?.clearPointer();emit('hover', null); schedule() }
function resize() {
  if (!host.value || disposed) return
  width = host.value.clientWidth; height = host.value.clientHeight
  if (!width || !height) return
  if (fallback.value) return
  if (!renderer) return
  viewHeight = Math.max((bounds.maxY-bounds.minY)/.87, (bounds.maxX-bounds.minX)/(width/height * (width < 720 ? .91 : .66)))
  homeX = midX - (width < 720 ? 0 : viewHeight * width/height * .12); homeY = midY
  camera.left = -viewHeight*width/height/2; camera.right = -camera.left
  camera.top = viewHeight/2; camera.bottom = -camera.top
  const dpr = Math.min(window.devicePixelRatio, width < 720 ? 1 : 1.5)
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height, false)
  stage?.resize(width, height, dpr)
  if (!started) { target.set(homeX, homeY, 0); started = true }
  camera.updateProjectionMatrix(); schedule()
}
function schedule() { if (!frame && renderer && props.active && !document.hidden && !disposed) frame = requestAnimationFrame(draw) }
function draw(now) {
  frame = 0
  if (disposed || !renderer || !props.active || document.hidden) return
  const waterVisible = !['city','item','closing-item'].includes(props.phase)
  const interval=1000/(width<720 ? waterStyle.mobileFps : waterStyle.desktopFps)
  if(!props.reduced && lastDraw && now-lastDraw<interval-1) { schedule(); return }
  const dt = previous ? Math.min((now-previous)/1000, .1) : 0; previous = now; lastDraw=now
  if(!props.reduced && waterVisible) elapsed+=dt
  water?.update(elapsed,dt,props.reduced,zoom)
  const focus=waterStories[props.waterFocus]
  const speed = props.reduced ? 1 : 1 - Math.exp(-dt * (focus ? 2.8 : 7))
  const oceanTarget = props.phase === 'overview' && !focus ? 1 : 0
  oceanOpacity += (oceanTarget - oceanOpacity) * speed
  const selected = regions.find(r => r.id === props.selected)
  const close = selected && ['focusing', 'entering', 'city', 'item', 'closing-item', 'leaving', 'switching'].includes(props.phase)
  const focusHeight=focus ? Math.max(focus.span[1],focus.span[0]/(width/height*(width<720?.88:.62))) : viewHeight
  const tx = close ? selected.center[0] : focus ? focus.center[0]-(width<720?0:focusHeight*width/height*.13) : homeX
  const ty = close ? selected.center[1] : focus ? focus.center[1] : homeY
  const tz = close ? 2.25 : focus ? viewHeight/focusHeight : 1
  target.x += (tx-target.x)*speed; target.y += (ty-target.y)*speed; zoom += (tz-zoom)*speed
  let moving = Math.abs(tx-target.x)+Math.abs(ty-target.y)+Math.abs(tz-zoom)+Math.abs(oceanTarget-oceanOpacity) > .01
  camera.position.set(target.x, target.y - 225, 750); camera.lookAt(target); camera.zoom = zoom; camera.updateProjectionMatrix(); camera.updateMatrixWorld()
  if (boat) {
    let dock = null
    if (launchControl.value && !boatLaunched.value && !boatDrag?.moved) {
      const control = launchControl.value
      pointer.set(control.offsetLeft / width * 2 - 1, 1 - control.offsetTop / height * 2)
      raycaster.setFromCamera(pointer, camera)
      boatPlane.constant = -18
      dock = raycaster.ray.intersectPlane(boatPlane, boatDock)
    }
    boat.update({ active: props.phase === 'overview' && !focus, dock, dt, time: elapsed,
      reduced: props.reduced, worldPerPixel: viewHeight / height / zoom, highlighted: boatHighlighted })
  }
  for (const m of meshes) {
    const elevated = m.id === props.hover || m.id === props.selected
    const z = elevated && props.phase !== 'retreating' ? 7 : 0, dimmed = (close && m.id !== props.selected) || (props.counts && !props.counts[m.id])
    m.group.position.z += (z-m.group.position.z)*speed
    const color = scratchColor.set(elevated ? '#9aaf91' : dimmed ? '#cecdbf' : m.color)
    if (Math.abs(z-m.group.position.z) > .01) moving = true
    // Color changes are interpolated along with spatial emphasis.
    const old = m.mesh.material[0].color
    if (Math.abs(old.r-color.r)+Math.abs(old.g-color.g)+Math.abs(old.b-color.b) > .003) moving = true
    old.lerp(color, speed)
    m.edge.material.opacity = elevated ? .9 : dimmed ? .12 : .32
  }
  if (!stage?.draw(now, elapsed, props.reduced, oceanOpacity)) {
    ocean?.update(elapsed, props.reduced, oceanOpacity, camera, scene.environment)
    renderer.render(scene, camera)
  }
  if (!ready.value) { ready.value = true; emit('ready') }
  if (moving || (waterVisible && !props.reduced)) schedule()
}
// Project the actual selected-region boundary into the exhibition viewport.
// The same captured contour is used in reverse when returning to the map.
function getPortal(id, panelRect) {
  const region=regions.find(r=>r.id===id)
  if(!region || !host.value)return null
  const ring=region.polygons.flatMap(p=>[p[0]]).sort((a,b)=>b.length-a.length)[0]
  const hostRect=host.value.getBoundingClientRect()
  const w=bounds.maxX-bounds.minX+16,h=bounds.maxY-bounds.minY+16
  const scale=Math.min(width/w,height/h)*.92
  const points=ring.filter((_,i)=>i%Math.max(1,Math.floor(ring.length/100))===0).map(([x,y])=>{
    if(renderer){const p=new T.Vector3(x,y,14).project(camera);return [(p.x+1)*width/2+hostRect.left-panelRect.left,(1-p.y)*height/2+hostRect.top-panelRect.top]}
    return [width/2+(x-midX)*scale+hostRect.left-panelRect.left,height/2-(y-midY)*scale+hostRect.top-panelRect.top]
  })
  // Morph the geographic outline onto a rectangular perimeter of equal vertex count.
  // Arc-length indexing preserves winding and prevents self-intersections at the end.
  const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1]},0)
  if(area<0)points.reverse()
  const top=points.reduce((best,p,i)=>p[1]<points[best][1]?i:best,0)
  const ordered=[...points.slice(top),...points.slice(0,top)]
  const W=panelRect.width,H=panelRect.height,P=2*(W+H)
  const perimeter=t=>{let d=(t*P+W/2)%P;if(d<W)return [d,0];d-=W;if(d<H)return [W,d];d-=H;if(d<W)return [W-d,H];return [0,H-(d-W)]}
  const css=pts=>`polygon(${pts.map(p=>`${p[0].toFixed(2)}px ${p[1].toFixed(2)}px`).join(',')})`
  return {closed:css(ordered),open:css(ordered.map((_,i)=>perimeter(i/ordered.length)))}
}
function focusCity(id){emit('hover',id);host.value?.focus({preventScroll:true});schedule()}
defineExpose({getPortal,focusCity})
function visibility() { previous=0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else schedule() }
function enableFallback() {
  cancelAnimationFrame(frame);frame=0;releaseScene()
  renderer?.dispose(); renderer = null; fallback.value = true; ready.value = true
  requestAnimationFrame(() => { if (!disposed) { emit('ready') } })
}
onMounted(async () => {
  observer = new ResizeObserver(resize); observer.observe(host.value)
  document.addEventListener('visibilitychange', visibility)
  try {
    const { THREE, createOcean } = await import('@/data/atlas/ocean')
    if (disposed) return
    T = THREE
    renderer = new T.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = T.SRGBColorSpace
    scene = new T.Scene(); camera = new T.OrthographicCamera(-300,300,250,-250,1,2000)
    camera.manual = true
    target = new T.Vector3(); raycaster = new T.Raycaster(); pointer = new T.Vector2()
    scratchColor=new T.Color()
    scene.add(new T.HemisphereLight(0xf3ebcc, 0x737569, 1.9))
    const light = new T.DirectionalLight(0xfff7e5, 2.1); light.position.set(-240,120,400); scene.add(light)
    // Deterministic fine mineral grain shared by all regions; no remote texture.
    const grain = new Uint8Array(128*128*4)
    for(let i=0;i<128*128;i++) { const shade=205+((i*73^(i>>3)*151)%37);grain.set([shade,shade,shade,255],i*4) }
    grainTexture=new T.DataTexture(grain,128,128,T.RGBAFormat)
    grainTexture.wrapS=grainTexture.wrapT=T.RepeatWrapping
    grainTexture.repeat.set(.065,.065);grainTexture.needsUpdate=true
    regions.forEach((r,i) => {
      const shapes = makeShapes(T,dryLand[r.id].filter(hasRelief))
      const geometry = new T.ExtrudeGeometry(shapes, { depth: 7, bevelEnabled: false, curveSegments: 1, steps: 1 })
      const color = ['#698977','#759582','#819d87','#8aa18a'][i%4]
      const materials = [new T.MeshStandardMaterial({ color, roughness: .91, metalness: .03, map:grainTexture, bumpMap:grainTexture, bumpScale:.12 }), new T.MeshStandardMaterial({ color: '#52695a', roughness: .8 })]
      const mesh = new T.Mesh(geometry, materials); mesh.userData.id = r.id
      const group = new T.Group(); group.add(mesh)
      const thin=dryLand[r.id].filter(p=>!hasRelief(p))
      if(thin.length) {
        const top=new T.Mesh(new T.ShapeGeometry(makeShapes(T,thin)),materials[0]);top.position.z=7;group.add(top);landMeshes.push(top)
      }
      // Original administrative hit surface preserves city picking over waterways.
      const hit=new T.Mesh(new T.ShapeGeometry(makeShapes(T,r.polygons)),new T.MeshBasicMaterial({visible:false}))
      hit.position.z=7;hit.userData.id=r.id;group.add(hit);pickMeshes.push(hit);landMeshes.push(mesh)
      const lineGeometry = new T.BufferGeometry(), vertices = []
      for (const ring of landEdges?.[r.id] || r.polygons.flat()) for (let j=1;j<ring.length;j++) vertices.push(...ring[j-1],7.15,...ring[j],7.15)
      lineGeometry.setAttribute('position', new T.Float32BufferAttribute(vertices,3))
      const edge = new T.LineSegments(lineGeometry, new T.LineBasicMaterial({ color: '#c9ad75', transparent: true, opacity: .48 })); group.add(edge)
      // Dark, offset lower silhouette gives the shallow relief a grounded edge.
      const base = new T.Mesh(new T.ShapeGeometry(shapes), new T.MeshBasicMaterial({ color: '#646650', transparent: true, opacity: .22 })); base.position.set(2,-4,-2); group.add(base)
      scene.add(group); meshes.push({ id:r.id, group, mesh, edge, color })
    })
    const islands=new T.Mesh(new T.ExtrudeGeometry(makeShapes(T,lakeIslands),{depth:7,bevelEnabled:false}),new T.MeshStandardMaterial({color:'#819d87',roughness:.91,map:grainTexture}))
    scene.add(islands);landMeshes.push(islands)
    water=createWater(T);scene.add(water.group)
    for(const city of meshes)water.attachCity(city.id,city.group)
    ocean = createOcean(schedule)
    scene.add(ocean.mesh)
    boat = createAtlasBoat(T, yangtzeFlow, waterStyle.level, ocean)
    boatPoint = new T.Vector3(); boatDock = new T.Vector3()
    boatPlane = new T.Plane(new T.Vector3(0, 0, 1))
    scene.add(boat.object)
    canvas.value.addEventListener('webglcontextlost', contextLost)
    resize()

    const { createAtlasStage } = await import('./atlas/atlas-stage')
    if (disposed || fallback.value) return
    stage = createAtlasStage(canvas.value)
    await stage.mount({ renderer, scene, camera, ocean, width, height, requestDraw: schedule })
    if (debugOcean && !disposed && !fallback.value) {
      const { mountOceanControls } = await import('./atlas/ocean-controls')
      if (!disposed && !fallback.value) unmountOceanControls = mountOceanControls(oceanPanel.value, ocean.settings, schedule)
    }
  } catch { if (!disposed) enableFallback() }
})
function contextLost(event) { event.preventDefault(); enableFallback() }
watch(launchControl, schedule)
watch(() => props.waterFocus, () => { cancelBoatDrag(); clearHover() })
watch(() => [props.active, props.selected, props.hover, props.phase, props.counts, props.reduced], () => {
  if(!props.active || props.phase!=='overview'){waterTip.value=null;cancelBoatDrag()}
  if (!props.active) { cancelAnimationFrame(frame); frame = 0; previous=0 }
  else schedule()
})
function releaseScene() {
  cancelBoatDrag()
  unmountOceanControls?.();unmountOceanControls=null
  stage?.dispose();stage=null
  ocean?.dispose();ocean=null
  const geometries=new Set(),materials=new Set()
  scene?.traverse(object => { if(object.geometry)geometries.add(object.geometry);if(object.material)for(const m of [].concat(object.material))materials.add(m) })
  for(const g of geometries)g.dispose()
  for(const m of materials)m.dispose()
  grainTexture?.dispose();grainTexture=null;scene=null;water=null;boat=null;meshes=[];pickMeshes=[];landMeshes=[]
}
onBeforeUnmount(() => {
  disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); document.removeEventListener('visibilitychange', visibility)
  canvas.value?.removeEventListener('webglcontextlost', contextLost)
  releaseScene()
  renderer?.dispose()
})
</script>

<style scoped>
.atlas-map{position:absolute;inset:80px 0 100px;isolation:isolate}
.atlas-map canvas{width:100%;height:100%;display:block;opacity:0;transition:opacity 1s}
.map-ready canvas{opacity:1}
.boat-launch{position:absolute;z-index:3;left:37%;top:45%;width:96px;height:72px;transform:translate(-50%,-50%);padding:0;border:0;background:none;color:#37594b;cursor:grab;touch-action:none}
.boat-launch:active{cursor:grabbing}
.boat-launch:focus-visible{outline:1px solid var(--brand-deep-green);outline-offset:-7px;border-radius:50%}
.boat-underway{width:35px;height:35px;display:grid;place-items:center;border:1px solid #78917a90;border-radius:50%;font:22px/1 var(--brand-serif);cursor:pointer;background:#e9eee680}
@media(max-width:720px){.boat-launch{left:13%;top:58%}.boat-launch:not(.boat-underway){width:72px;height:53px}}
.flat-ocean{fill:#88aeb1;pointer-events:none}
.ocean-panel{position:absolute;z-index:10;left:6%;top:62px;width:min(270px,88%)}
.flat-map{position:absolute;inset:4%;width:92%;height:92%;filter:drop-shadow(3px 6px 0 #66705d55)}
.flat-map path{fill:#8b9f87;stroke:#bfa575;stroke-width:.45;cursor:pointer;transition:fill .18s}
.flat-map path.highlighted{fill:#b2bea4}
.flat-map path.muted{fill:#c1c4b6}
.flat-map path.flat-water{stroke:none;cursor:default}
.flat-map path.flat-land{stroke:none}
.flat-map path.flat-boundary{fill:none;stroke-width:.25;pointer-events:none}
.flat-map .flat-channels path{fill:none;stroke-width:1;vector-effect:non-scaling-stroke;opacity:.36;pointer-events:none}
.flat-map .flat-channels path.major{opacity:.72}
.flat-map .flat-channels path.seasonal{opacity:.3}
.flat-map path.flat-islands{stroke-width:.15;cursor:default}
.flat-map path.flat-hit{fill:transparent;stroke:none;pointer-events:all}
.flat-map path.flat-water-hit{fill:transparent;stroke:none;pointer-events:fill;cursor:pointer}
.water-tip{position:absolute;z-index:4;pointer-events:none;background:var(--brand-surface);border:1px solid var(--brand-line);border-left:2px solid var(--brand-red);padding:9px 12px;font:16px var(--brand-serif);color:var(--brand-deep-green)}
.water-tip small{display:block;margin-top:4px;font:10px var(--brand-sans);color:var(--brand-muted)}
.map-loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#7f7157;letter-spacing:.2em;font-size:13px}
@media(max-width:720px){.atlas-map{inset:165px 0 168px}

}
@media(prefers-reduced-motion:reduce){.atlas-map canvas{transition:none!important}
}


@media(max-width:720px) and (max-height:780px){.atlas-map{inset:210px 0 275px}}
</style>
