import data from './water-geometry.json'

// All coordinates are in the same local map space as geometry.js.
export const waterBodies = data.water
export const yangtzeFlow = data.flow.slice(0, 2)
export const dryLand = data.land
export const lakeIslands = data.islands
export const waterLines = data.waterLines || {}
export const landEdges = data.landEdges
// Subpixel shoreline remnants retain their exact top faces, without tall,
// needle-like side walls in lake close-ups. No geographic polygon is removed.
export function hasRelief(rings) {
  const ring=rings[0];let area=0,perimeter=0
  for(let i=1;i<ring.length;i++) {const a=ring[i-1],b=ring[i];area+=a[0]*b[1]-b[0]*a[1];perimeter+=Math.hypot(b[0]-a[0],b[1]-a[1])}
  return Math.abs(area)/2/Math.max(perimeter,.00001)>.04
}
const pathCache=new WeakMap()
export function linePath(lines) {
  if(!pathCache.has(lines))pathCache.set(lines,lines.map(line => line.map(([x,y],i) => `${i?'L':'M'}${x},${-y}`).join(' ')).join(' '))
  return pathCache.get(lines)
}
export function waterPath(polygons) {
  if(!pathCache.has(polygons))pathCache.set(polygons,polygons.map(p => p.map(r => r.map(([x,y],i) => `${i ? 'L' : 'M'}${x},${-y}`).join(' ')+'Z').join(' ')).join(' '))
  return pathCache.get(polygons)
}
export const waterStyle = Object.freeze({
  level: 6.85, river: '#789994', lake: '#86a6a0', seasonal: '#8b9e91', detail: '#86a6a0', channel: '#789994',
  light: '#e5e8d3', speed: .48, reflection: .065,
  desktopFps: 40, mobileFps: 24,
})

export function makeShapes(T, polygons) {
  return polygons.map(rings => {
    const shape = new T.Shape(rings[0].map(p => new T.Vector2(...p)))
    shape.holes = rings.slice(1).map(ring => new T.Path(ring.map(p => new T.Vector2(...p))))
    return shape
  })
}

// Chainage is tied to the surveyed OSM main/side channels, not screen X.
// Branch endpoints share the main channel's chainage, so flow is continuous at joins.
const segments = data.flow.flatMap(line => line.slice(1).map((b,i) => {
  const a=line[i], dx=b[0]-a[0],dy=b[1]-a[1], length=Math.hypot(dx,dy)
  return { a,b,dx,dy,length, length2:length*length }
})).filter(s => s.length > 0)
// Spatial bins keep province-wide flow sampling local (rather than scanning
// every stream per vertex). Unknown flow stays calm; it never borrows Yangtze UVs.
const flowGrid=new Map(), cell=8, radius=2
for(const line of data.networkFlow || []) for(let i=1;i<line.length;i++) {
  const a=line[i-1],b=line[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy)
  if(!length)continue
  const s={a,b,dx,dy,length,length2:length*length}
  for(let x=Math.floor((Math.min(a[0],b[0])-radius)/cell);x<=Math.floor((Math.max(a[0],b[0])+radius)/cell);x++)
    for(let y=Math.floor((Math.min(a[1],b[1])-radius)/cell);y<=Math.floor((Math.max(a[1],b[1])+radius)/cell);y++) {
      const key=`${x},${y}`;if(!flowGrid.has(key))flowGrid.set(key,[]);flowGrid.get(key).push(s)
    }
}
export function flowAt(x,y,network=false) {
  let nearest=network?radius*radius:Infinity, result=network?[0,0,0,0]:[0,0,1,0]
  const candidates=network?(flowGrid.get(`${Math.floor(x/cell)},${Math.floor(y/cell)}`)||[]):segments
  for(const s of candidates) {
    const t=Math.max(0,Math.min(1,((x-s.a[0])*s.dx+(y-s.a[1])*s.dy)/s.length2))
    const dx=x-s.a[0]-t*s.dx,dy=y-s.a[1]-t*s.dy, distance=dx*dx+dy*dy
    if(distance<nearest) {
      nearest=distance
      result=[s.a[2]+t*(s.b[2]-s.a[2]),(s.dx*dy-s.dy*dx)/s.length,s.dx/s.length,s.dy/s.length]
    }
  }
  return result
}

const vertexShader = /* glsl */`
  attribute vec4 flow;
  varying vec2 vMap;
  varying vec4 vFlow;
  void main() {
    vMap = position.xy;
    vFlow = flow;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const fragmentShader = /* glsl */`
  uniform float uTime;
  uniform float uLake;
  uniform float uSpeed;
  uniform float uReflection;
  uniform float uHover;
  uniform vec2 uPointer;
  uniform vec3 uColor;
  uniform vec3 uLight;
  varying vec2 vMap;
  varying vec4 vFlow;
  float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float river(vec2 p) {
    // Fastest near the thalweg; gentle lateral shear and nonparallel phase warping.
    float speed=uSpeed*(0.8+0.2*exp(-p.y*p.y*0.08));
    float s=p.x-uTime*speed;
    float bend=1.3*noise(vec2(s*0.12,p.y*0.32))+0.28*sin(p.y*1.6+s*0.24);
    return sin(s*1.6+bend+p.y*0.32)*0.047
      +sin(s*2.81-p.y*0.83+bend*1.7-uTime*0.08)*0.022
      +(noise(vec2(s*0.44,p.y*0.72))-0.5)*0.08;
  }
  float lake(vec2 p) {
    // Crossing long wind waves, with no radial pulse, swirl or net river-like drift.
    float t=uTime;
    return sin(dot(p,vec2(0.61,0.46))-t*0.53+noise(p*0.11))*0.046
      +sin(dot(p,vec2(-0.37,0.79))+t*0.39)*0.032
      +sin(dot(p,vec2(1.18,-0.27))-t*0.67+noise(p*0.19)*1.4)*0.015;
  }
  bool calm() { return uLake>0.5 || dot(vFlow.zw,vFlow.zw)<0.25; }
  float surface(vec2 p) { return calm() ? lake(p) : river(p); }
  void main() {
    vec2 p=calm() ? vMap : vFlow.xy;
    float h=surface(p);
    vec2 slope=vec2(surface(p+vec2(0.12,0))-surface(p-vec2(0.12,0)),
                    surface(p+vec2(0,0.12))-surface(p-vec2(0,0.12)))/0.24;
    if(!calm()) {
      vec2 tangent=normalize(vFlow.zw);
      slope=tangent*slope.x+vec2(-tangent.y,tangent.x)*slope.y;
    }
    vec3 normal=normalize(vec3(-slope*1.6,1.0));
    vec3 light=normalize(vec3(-240.0,120.0,400.0));
    vec3 view=normalize(vec3(0.0,-225.0,750.0));
    float sheen=pow(max(dot(normal,normalize(light+view)),0.0),24.0);
    float diffuse=dot(normal,light);
    float cloud=noise(vMap*0.055)*0.035;
    float touch=exp(-dot(vMap-uPointer,vMap-uPointer)*0.035)*uHover;
    vec3 color=uColor*(0.94+diffuse*0.10+h*0.44+cloud);
    color+=uLight*sheen*(uReflection+touch*0.028);
    gl_FragColor=vec4(color,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

// Split long triangles without moving their boundary. This keeps the interpolated
// flow frame local through river bends, including broad reaches and island channels.
function refineRiver(T, geometry) {
  const source=geometry.toNonIndexed(), p=source.getAttribute('position'), vertices=[]
  const split=(a,b,c,depth=0) => {
    const ab=Math.hypot(a[0]-b[0],a[1]-b[1]),bc=Math.hypot(b[0]-c[0],b[1]-c[1]),ca=Math.hypot(c[0]-a[0],c[1]-a[1])
    if(Math.max(ab,bc,ca)<=4 || depth>=12) { vertices.push(...a,...b,...c); return }
    if(bc>ab && bc>=ca) [a,b,c]=[b,c,a]
    else if(ca>ab && ca>bc) [a,b,c]=[c,a,b]
    const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2,0]
    split(a,mid,c,depth+1);split(mid,b,c,depth+1)
  }
  for(let i=0;i<p.count;i+=3) split([p.getX(i),p.getY(i),0],[p.getX(i+1),p.getY(i+1),0],[p.getX(i+2),p.getY(i+2),0])
  source.dispose();geometry.dispose()
  const result=new T.BufferGeometry()
  result.setAttribute('position',new T.Float32BufferAttribute(vertices,3))
  return result
}

export function createWater(T, options={}) {
  const config={...waterStyle,...options}, group=new T.Group(), meshes=[], cityLayers=[], lineMaterials=[]
  for(const body of waterBodies) {
    let geometry=new T.ShapeGeometry(makeShapes(T,body.polygons))
    if(body.kind==='river') geometry=refineRiver(T,geometry)
    const pos=geometry.getAttribute('position'), flow=new Float32Array(pos.count*4)
    for(let i=0;i<pos.count;i++) flow.set(body.kind==='river' ? flowAt(pos.getX(i),pos.getY(i),body.network) : [0,0,1,0],i*4)
    geometry.setAttribute('flow',new T.BufferAttribute(flow,4))
    const material=new T.ShaderMaterial({ vertexShader,fragmentShader,uniforms:{
      uTime:{value:0},uLake:{value:body.kind==='lake'?1:0},uSpeed:{value:config.speed},
      uReflection:{value:body.seasonal?0:config.reflection},uColor:{value:new T.Color(config[body.seasonal?'seasonal':body.detail?'detail':body.kind])},
      uLight:{value:new T.Color(config.light)},uHover:{value:0},uPointer:{value:new T.Vector2(-1000,-1000)},
    } })
    const mesh=new T.Mesh(geometry,material);mesh.position.z=body.detail?7.025:config.level
    mesh.userData.water=body.id;mesh.userData.seasonal=body.seasonal;group.add(mesh);meshes.push(mesh)
    if(body.city)cityLayers.push({city:body.city,object:mesh})
  }
  // Centreline-only records remain thin survey paths: no invented river width.
  // Shared materials and merged city geometry keep tens of thousands of paths
  // to at most three draw calls per city. Seasonal channels remain static/muted.
  for(const family of ['major','minor','seasonal']) {
    const material=new T.LineBasicMaterial({color:config[family==='seasonal'?'seasonal':'channel'],transparent:true,opacity:family==='major'?.72:.36,depthWrite:false})
    lineMaterials.push({family,material})
    for(const [city,families] of Object.entries(waterLines)) {
      const vertices=[]
      for(const line of families[family] || [])for(let i=1;i<line.length;i++)vertices.push(...line[i-1],7.04,...line[i],7.04)
      if(!vertices.length)continue
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3))
      const object=new T.LineSegments(geometry,material);group.add(object);cityLayers.push({city,object})
    }
  }
  let hovered=null
  // Only the two existing story surfaces participate in pointer raycasts. The
  // dense province network remains visual; city hit surfaces still work beneath it.
  return { group,meshes:meshes.filter(mesh=>['yangtze','taihu'].includes(mesh.userData.water)),
    attachCity(city,parent) { for(const layer of cityLayers)if(layer.city===city)parent.add(layer.object) },
    hover(hit) {
      hovered=hit?.object || null
      if(hit) hovered.material.uniforms.uPointer.value.copy(hit.point)
    },
    update(time,dt,reduced,zoom=1) {
      for(const {family,material} of lineMaterials)material.opacity=family==='major'?.72:family==='seasonal'?.3:Math.min(.6,.36+(zoom-1)*.06)
      for(const mesh of meshes) {
        const u=mesh.material.uniforms
        u.uTime.value=mesh.userData.seasonal?0:time
        const amount=!reduced && mesh===hovered ? 1 : 0
        u.uHover.value+=(amount-u.uHover.value)*(1-Math.exp(-dt*5))
      }
    },
  }
}
