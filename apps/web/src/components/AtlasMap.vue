<template>
  <div ref="host" class="atlas-map" :class="{ 'map-ready': ready, 'map-fallback': fallback }">
    <canvas v-if="!fallback" ref="canvas" aria-hidden="true" @pointermove="pick" @pointerleave="clearHover" @click="pick($event, true)" />
    <svg v-if="fallback" class="flat-map" :viewBox="flatViewBox" aria-label="江苏十三市地图">
      <path v-for="body in waterBodies" :key="body.id" :d="waterPath(body.polygons)" class="flat-water" :style="{fill:waterStyle[body.kind]}" fill-rule="evenodd" />
      <path :d="waterPath(lakeIslands)" class="flat-islands" fill-rule="evenodd" />
      <path v-for="region in regions" :key="region.id" :d="waterPath(dryLand[region.id])" fill-rule="evenodd"
        :class="{ highlighted: hover === region.id || selected === region.id, muted: counts && !counts[region.id] }"
        @pointerenter="emit('hover', region.id)" @pointerleave="emit('hover', null)" @click="choose(region.id)" />
      <path v-for="region in regions" :key="`hit-${region.id}`" :d="region.path" class="flat-hit" @pointerenter="emit('hover',region.id)" @pointerleave="emit('hover',null)" @click="choose(region.id)" />
      <path v-for="body in waterBodies" :key="`water-hit-${body.id}`" :d="waterPath(body.polygons)" class="flat-water-hit" fill-rule="evenodd" @pointermove="showWaterTip(body.id,$event)" @pointerleave="clearHover" @click.stop="emit('water-select',body.id)" />
    </svg>
    <div class="map-labels" :inert="phase !== 'overview' || !active || !!waterFocus">
      <button v-for="(region, index) in regions" :key="region.id" :ref="el => labels[region.id] = el"
        class="map-city" :class="{ highlighted: hover === region.id, recent: recent === region.id, muted: counts && !counts[region.id] }"
        :style="{ '--label-delay': `${index * 32}ms` }" :aria-label="`探索${region.name}文化`" :aria-description="recent === region.id ? '刚刚浏览过这座城市' : undefined"
        @pointerenter="emit('hover', region.id)" @pointerleave="emit('hover', null)"
        @focus="emit('hover', region.id)" @blur="emit('hover', null)" @click="choose(region.id)">
        <i></i><span>{{ region.name }}</span><small v-if="counts">{{ counts[region.id] || 0 }}</small>
      </button>
    </div>
    <span v-if="!ready" class="map-loading" role="status">正在展开江苏山水…</span>
    <span v-if="waterTip && active && phase === 'overview'" class="water-tip" :style="{left:`${tipPosition.x}px`,top:`${tipPosition.y}px`}" role="tooltip">{{ waterStories[waterTip].title }}<small>点击读水岸故事 ↗</small></span>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { waterStories } from '@/data/atlas/water-stories'
import { regions, bounds, mapViewBox } from '@/data/atlas/geometry'
import { createWater, makeShapes, waterBodies, dryLand, lakeIslands, waterPath, waterStyle } from '@/data/atlas/water'
const props = defineProps({ active: Boolean, selected: String, hover: String, phase: String, counts: Object, recent: String, reduced: Boolean, waterFocus: String })
const emit = defineEmits(['select', 'hover', 'ready', 'water-select'])
const waterTip=ref(null),tipPosition=ref({x:0,y:0})
const flatViewBox=computed(()=>{const f=waterStories[props.waterFocus];return f ? `${f.center[0]-f.span[0]/2} ${-f.center[1]-f.span[1]/2} ${f.span[0]} ${f.span[1]}` : mapViewBox})
function showWaterTip(id,event) {
  if(!props.active || props.phase!=='overview')return
  const rect=host.value.getBoundingClientRect()
  waterTip.value=id
  tipPosition.value={x:Math.max(8,Math.min(rect.width-166,event.clientX-rect.left+14)),y:Math.max(8,Math.min(rect.height-60,event.clientY-rect.top-60))}
}
const host = ref(null), canvas = ref(null), fallback = ref(false), ready = ref(false)
const labels = {}
let T, renderer, scene, camera, observer, frame = 0, disposed = false, previous = 0, meshes = [], raycaster, pointer, target, started = false
let grainTexture = null
let water = null, elapsed = 0, lastDraw = 0, pickMeshes = [], landMeshes = [], scratchColor, labelPoint
let width = 1, height = 1, homeX = 0, homeY = 0, viewHeight = 500, zoom = 1
const midX = (bounds.minX + bounds.maxX) / 2, midY = (bounds.minY + bounds.maxY) / 2
function choose(id) {
  if (props.phase !== 'overview' || !props.active || props.waterFocus) return
  const rect = host.value.getBoundingClientRect(), label = labels[id]?.getBoundingClientRect()
  emit('select', { id, x: label ? label.left + label.width/2 - rect.left : width/2, y: label ? label.top + label.height/2 - rect.top : height/2 })
}
function pick(event, click = false) {
  if (!renderer || props.phase !== 'overview' || !props.active) return
  const rect = canvas.value.getBoundingClientRect()
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
  raycaster.setFromCamera(pointer, camera)
  const waterHit=raycaster.intersectObjects(water?.meshes || [])[0]
  const landHit=raycaster.intersectObjects(landMeshes)[0]
  const onWater=waterHit && (!landHit || waterHit.distance<landHit.distance)
  water?.hover(onWater ? waterHit : null)
  if(onWater)showWaterTip(waterHit.object.userData.water,event)
  else waterTip.value=null
  const id = raycaster.intersectObjects(pickMeshes)[0]?.object.userData.id || null
  emit('hover', onWater || props.waterFocus ? null : id)
  schedule()
  if(click && onWater) { waterTip.value=null;emit('water-select',waterHit.object.userData.water) }
  else if (click && id) choose(id)
}
function clearHover() { waterTip.value=null;water?.hover(null); emit('hover', null); schedule() }
function flatLabels() {
  const w = bounds.maxX - bounds.minX + 16, h = bounds.maxY - bounds.minY + 16
  const scale = Math.min(width/w, height/h) * .92
  for (const r of regions) if (labels[r.id]) labels[r.id].style.transform = `translate(${width/2+(r.center[0]-midX)*scale}px,${height/2-(r.center[1]-midY)*scale}px) translate(-50%,-50%)`
}
function resize() {
  if (!host.value || disposed) return
  width = host.value.clientWidth; height = host.value.clientHeight
  if (!width || !height) return
  if (fallback.value) { flatLabels(); return }
  if (!renderer) return
  viewHeight = Math.max((bounds.maxY-bounds.minY)/.87, (bounds.maxX-bounds.minX)/(width/height * (width < 720 ? .91 : .66)))
  homeX = midX - (width < 720 ? 0 : viewHeight * width/height * .12); homeY = midY
  camera.left = -viewHeight*width/height/2; camera.right = -camera.left
  camera.top = viewHeight/2; camera.bottom = -camera.top
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 720 ? 1 : 1.5))
  renderer.setSize(width, height, false)
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
  water?.update(elapsed,dt,props.reduced)
  const focus=waterStories[props.waterFocus]
  const speed = props.reduced ? 1 : 1 - Math.exp(-dt * (focus ? 2.8 : 7))
  const selected = regions.find(r => r.id === props.selected)
  const close = selected && ['focusing', 'entering', 'city', 'item', 'closing-item', 'leaving', 'switching'].includes(props.phase)
  const focusHeight=focus ? Math.max(focus.span[1],focus.span[0]/(width/height*(width<720?.88:.62))) : viewHeight
  const tx = close ? selected.center[0] : focus ? focus.center[0]-(width<720?0:focusHeight*width/height*.13) : homeX
  const ty = close ? selected.center[1] : focus ? focus.center[1] : homeY
  const tz = close ? 2.25 : focus ? viewHeight/focusHeight : 1
  target.x += (tx-target.x)*speed; target.y += (ty-target.y)*speed; zoom += (tz-zoom)*speed
  let moving = Math.abs(tx-target.x)+Math.abs(ty-target.y)+Math.abs(tz-zoom) > .01
  camera.position.set(target.x, target.y - 225, 750); camera.lookAt(target); camera.zoom = zoom; camera.updateProjectionMatrix(); camera.updateMatrixWorld()
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
  renderer.render(scene, camera)
  for (const r of regions) {
    const p = labelPoint.set(r.center[0], r.center[1], 10).project(camera)
    if (labels[r.id]) labels[r.id].style.transform = `translate(${(p.x+1)*width/2}px,${(1-p.y)*height/2}px) translate(-50%,-50%)`
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
function focusCity(id){labels[id]?.focus({preventScroll:true})}
defineExpose({getPortal,focusCity})
function visibility() { previous=0; if (document.hidden) { cancelAnimationFrame(frame); frame = 0 } else schedule() }
function enableFallback() {
  cancelAnimationFrame(frame);frame=0;releaseScene()
  renderer?.dispose(); renderer = null; fallback.value = true; ready.value = true
  requestAnimationFrame(() => { if (!disposed) { flatLabels(); emit('ready') } })
}
onMounted(async () => {
  observer = new ResizeObserver(resize); observer.observe(host.value)
  document.addEventListener('visibilitychange', visibility)
  try {
    T = await import('three'); if (disposed) return
    renderer = new T.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = T.SRGBColorSpace
    scene = new T.Scene(); camera = new T.OrthographicCamera(-300,300,250,-250,1,2000)
    target = new T.Vector3(); raycaster = new T.Raycaster(); pointer = new T.Vector2()
    scratchColor=new T.Color();labelPoint=new T.Vector3()
    scene.add(new T.HemisphereLight(0xf3ebcc, 0x737569, 1.9))
    const light = new T.DirectionalLight(0xfff7e5, 2.1); light.position.set(-240,120,400); scene.add(light)
    // Deterministic fine mineral grain shared by all regions; no remote texture.
    const grain = new Uint8Array(128*128*4)
    for(let i=0;i<128*128;i++) { const shade=205+((i*73^(i>>3)*151)%37);grain.set([shade,shade,shade,255],i*4) }
    grainTexture=new T.DataTexture(grain,128,128,T.RGBAFormat)
    grainTexture.wrapS=grainTexture.wrapT=T.RepeatWrapping
    grainTexture.repeat.set(.065,.065);grainTexture.needsUpdate=true
    regions.forEach((r,i) => {
      const shapes = makeShapes(T,dryLand[r.id])
      const geometry = new T.ExtrudeGeometry(shapes, { depth: 7, bevelEnabled: false, curveSegments: 1, steps: 1 })
      const color = ['#698977','#759582','#819d87','#8aa18a'][i%4]
      const materials = [new T.MeshStandardMaterial({ color, roughness: .91, metalness: .03, map:grainTexture, bumpMap:grainTexture, bumpScale:.12 }), new T.MeshStandardMaterial({ color: '#52695a', roughness: .8 })]
      const mesh = new T.Mesh(geometry, materials); mesh.userData.id = r.id
      const group = new T.Group(); group.add(mesh)
      // Original administrative hit surface preserves city picking over waterways.
      const hit=new T.Mesh(new T.ShapeGeometry(makeShapes(T,r.polygons)),new T.MeshBasicMaterial({visible:false}))
      hit.position.z=7;hit.userData.id=r.id;group.add(hit);pickMeshes.push(hit);landMeshes.push(mesh)
      const lineGeometry = new T.BufferGeometry(), vertices = []
      for (const polygon of dryLand[r.id]) for (const ring of polygon) for (let j=1;j<ring.length;j++) vertices.push(...ring[j-1],7.15,...ring[j],7.15)
      lineGeometry.setAttribute('position', new T.Float32BufferAttribute(vertices,3))
      const edge = new T.LineSegments(lineGeometry, new T.LineBasicMaterial({ color: '#c9ad75', transparent: true, opacity: .48 })); group.add(edge)
      // Dark, offset lower silhouette gives the shallow relief a grounded edge.
      const base = new T.Mesh(new T.ShapeGeometry(shapes), new T.MeshBasicMaterial({ color: '#646650', transparent: true, opacity: .22 })); base.position.set(2,-4,-2); group.add(base)
      scene.add(group); meshes.push({ id:r.id, group, mesh, edge, color })
    })
    const islands=new T.Mesh(new T.ExtrudeGeometry(makeShapes(T,lakeIslands),{depth:7,bevelEnabled:false}),new T.MeshStandardMaterial({color:'#819d87',roughness:.91,map:grainTexture}))
    scene.add(islands);landMeshes.push(islands)
    water=createWater(T);scene.add(water.group)
    canvas.value.addEventListener('webglcontextlost', contextLost)
    resize()
  } catch { if (!disposed) enableFallback() }
})
function contextLost(event) { event.preventDefault(); enableFallback() }
watch(() => props.waterFocus,()=>{clearHover();if(fallback.value)flatLabels()})
watch(() => [props.active, props.selected, props.hover, props.phase, props.counts, props.reduced], () => {
  if(!props.active || props.phase!=='overview')waterTip.value=null
  if (!props.active) { cancelAnimationFrame(frame); frame = 0; previous=0 }
  else schedule()
})
function releaseScene() {
  const geometries=new Set(),materials=new Set()
  scene?.traverse(object => { if(object.geometry)geometries.add(object.geometry);if(object.material)for(const m of [].concat(object.material))materials.add(m) })
  for(const g of geometries)g.dispose()
  for(const m of materials)m.dispose()
  grainTexture?.dispose();grainTexture=null;scene=null;water=null;meshes=[];pickMeshes=[];landMeshes=[]
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
.atlas-map canvas{width:100%;height:100%;display:block;filter:drop-shadow(0 22px 18px #4c513626);opacity:0;transition:opacity 1s}
.map-ready canvas{opacity:1}
.flat-map{position:absolute;inset:4%;width:92%;height:92%;filter:drop-shadow(3px 6px 0 #66705d55)}
.flat-map path{fill:#8b9f87;stroke:#bfa575;stroke-width:.45;cursor:pointer;transition:fill .18s}
.flat-map path.highlighted{fill:#b2bea4}
.flat-map path.muted{fill:#c1c4b6}
.flat-map path.flat-water{stroke:none;cursor:default}
.flat-map path.flat-islands{stroke-width:.15;cursor:default}
.flat-map path.flat-hit{fill:transparent;stroke:none;pointer-events:all}
.flat-map path.flat-water-hit{fill:transparent;stroke:none;pointer-events:fill;cursor:pointer}
.water-tip{position:absolute;z-index:4;pointer-events:none;background:var(--brand-surface);border:1px solid var(--brand-line);border-left:2px solid var(--brand-red);padding:9px 12px;font:16px var(--brand-serif);color:var(--brand-deep-green)}
.water-tip small{display:block;margin-top:4px;font:10px var(--brand-sans);color:var(--brand-muted)}
.map-labels{position:absolute;inset:0;pointer-events:none;transition:opacity .3s}
.map-labels[inert]{opacity:0}
.map-city{position:absolute;left:0;top:0;pointer-events:auto;border:0;color:#384638;background:var(--brand-surface);border-radius:3px;padding:5px 8px;font-size:13px;letter-spacing:.12em;display:flex;align-items:center;gap:6px;white-space:nowrap;cursor:pointer;opacity:0;transition:background .18s,opacity .35s}
.map-ready .map-city{opacity:1;transition-delay:var(--label-delay)}
.map-city i{width:4px;height:4px;border-radius:50%;background:var(--brand-red);box-shadow:0 0 0 3px #ad244010}
.map-city.highlighted,.map-city:focus-visible{background:var(--brand-red);color:#fff7e8;outline:1px solid var(--brand-red);outline-offset:4px}
.map-city.muted{opacity:.48}
.map-city small{color:inherit;font-size:10px}
.map-loading{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#7f7157;letter-spacing:.2em;font-size:13px}
@media(max-width:720px){.atlas-map{inset:165px 0 168px}
.map-city{font-size:11px;padding:4px 5px;gap:4px;letter-spacing:0}
}
@media(prefers-reduced-motion:reduce){.atlas-map canvas,.map-city{transition:none!important}
}

.map-city.recent{box-shadow:inset 0 -2px var(--brand-red)}.map-city.recent i{width:5px;height:5px;box-shadow:0 0 0 2px #ad244025}
@media(max-width:720px) and (max-height:780px){.atlas-map{inset:210px 0 275px}.map-city{font-size:10px;padding:3px 4px;gap:3px}}
</style>
