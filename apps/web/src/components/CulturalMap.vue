<template>
  <div class="cultural-map">
    <div class="map-toolbar">
      <div><span class="map-kicker">JIANGSU · CULTURAL ATLAS</span><strong>循着城市，读懂江苏</strong></div>
      <div class="map-modes" aria-label="地图模式">
        <button :class="{ active: mode === 'atlas' }" @click="setMode('atlas')">文化星图</button>
        <button v-if="mapStyleUrl" :class="{ active: mode === 'street' }" @click="setMode('street')">地图漫游</button>
      </div>
    </div>
    <div ref="canvas" class="map-canvas" role="img" aria-label="江苏十三市文化探索图"></div>
    <div class="map-footer">
      <span>01—13 · 选择城市查看文化档案</span>
      <span>{{ mode === 'atlas' ? '概念星图 · 非行政区划图' : '可缩放地图 · 底图由配置的服务提供' }}</span>
    </div>
    <div class="city-index" aria-label="选择城市">
      <button v-for="city in cityList" :key="city.key" :class="{ active: city.key === selected }" @click="choose(city.key)">{{ city.name }}</button>
    </div>
    <p v-if="error" class="map-error-inline">{{ error }} <button @click="setMode('atlas')">返回文化星图</button></p>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { ScatterChart, EffectScatterChart, LinesChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, GraphicComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([ScatterChart, EffectScatterChart, LinesChart, GridComponent, TooltipComponent, GraphicComponent, CanvasRenderer])

const props = defineProps({ cities: { type: Object, required: true }, selected: { type: String, default: null } })
const emit = defineEmits(['select'])
const mapStyleUrl = import.meta.env.VITE_MAP_STYLE_URL?.trim()
const mode = ref('atlas')
const canvas = ref(null)
const error = ref('')
const cityList = computed(() => Object.entries(props.cities).map(([key, item]) => ({ key, ...item })))
let chart = null
let streetMap = null
let maplibre = null
let resizeObserver = null

function atlasOptions() {
  const selected = cityList.value.find((item) => item.key === props.selected)
  return {
    backgroundColor: 'transparent',
    animationDuration: 850,
    tooltip: { trigger: 'item', formatter: ({ data }) => data?.name || '' },
    grid: { left: '7%', right: '8%', top: '9%', bottom: '8%' },
    xAxis: { type: 'value', min: 116.6, max: 121.7, show: false },
    yAxis: { type: 'value', min: 30.8, max: 35.1, show: false },
    graphic: [
      { type: 'text', left: '9%', top: '11%', style: { text: 'J I A N G S U', fill: 'rgba(218,189,129,.13)', font: '700 46px Georgia' }, silent: true },
      { type: 'text', right: '8%', bottom: '12%', style: { text: '江 河 湖 海 · 文 脉 相 连', fill: 'rgba(226,208,166,.4)', font: '13px serif' }, silent: true },
    ],
    series: [
      { type: 'lines', coordinateSystem: 'cartesian2d', silent: true, z: 0,
        data: cityList.value.filter((city) => city.key !== 'nanjing').map((city) => ({ coords: [[118.796877, 32.060255], [city.lng, city.lat]] })),
        lineStyle: { color: '#c5a374', width: 1, opacity: 0.16, curveness: 0.18 },
        effect: { show: true, constantSpeed: 28, trailLength: 0.25, symbolSize: 3, color: '#e9d1a5' },
      },
      { type: 'scatter', symbolSize: 68, silent: true, data: cityList.value.map((city) => [city.lng, city.lat]), itemStyle: { color: 'rgba(211,170,104,.035)', borderColor: 'rgba(211,170,104,.12)', borderWidth: 1 } },
      { type: 'scatter', symbolSize: (value, params) => params.data.key === props.selected ? 25 : 13,
        data: cityList.value.map((city) => ({ name: city.name, key: city.key, value: [city.lng, city.lat] })),
        itemStyle: { color: (params) => params.data.key === props.selected ? '#f8dca2' : '#d8ad73', shadowBlur: 18, shadowColor: '#d0a56b', borderColor: '#fff4dc', borderWidth: 2 },
        label: { show: true, formatter: '{b}', position: 'right', distance: 12, color: '#f8eddb', fontSize: 13, fontWeight: 600 },
        emphasis: { scale: 1.5, label: { color: '#fff' } },
      },
      { type: 'effectScatter', silent: true, coordinateSystem: 'cartesian2d', symbolSize: 18, rippleEffect: { scale: 3, brushType: 'stroke' },
        data: selected ? [[selected.lng, selected.lat]] : [[118.796877, 32.060255]], itemStyle: { color: '#e9c58b' } },
    ],
  }
}

function renderAtlas() {
  chart = echarts.init(canvas.value)
  chart.setOption(atlasOptions())
  chart.on('click', (event) => { if (event.data?.key) choose(event.data.key) })
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(canvas.value)
}

async function renderStreet() {
  if (!mapStyleUrl) return setMode('atlas')
  try {
    maplibre = await import('maplibre-gl')
    await import('maplibre-gl/dist/maplibre-gl.css')
    streetMap = new maplibre.Map({ container: canvas.value, style: mapStyleUrl, center: [119.45, 32.8], zoom: 6.5 })
    streetMap.addControl(new maplibre.NavigationControl(), 'top-right')
    for (const city of cityList.value) {
      const marker = document.createElement('button')
      marker.className = 'cultural-map-pin'
      marker.textContent = city.name
      marker.type = 'button'
      marker.addEventListener('click', () => choose(city.key))
      new maplibre.Marker({ element: marker }).setLngLat([city.lng, city.lat]).addTo(streetMap)
    }
    streetMap.on('error', () => { error.value = '底图加载失败，请核对 VITE_MAP_STYLE_URL 与服务权限。' })
  } catch (cause) {
    error.value = `地图漫游初始化失败：${cause.message}`
  }
}

function dispose() {
  resizeObserver?.disconnect()
  resizeObserver = null
  chart?.dispose()
  chart = null
  streetMap?.remove()
  streetMap = null
  if (canvas.value) canvas.value.replaceChildren()
}

async function setMode(nextMode) {
  if (nextMode === mode.value && (chart || streetMap)) return
  dispose()
  error.value = ''
  mode.value = nextMode
  await nextTick()
  if (mode.value === 'street') await renderStreet()
  else renderAtlas()
}

function choose(key) {
  emit('select', key)
  const city = props.cities[key]
  if (mode.value === 'street' && city && streetMap) streetMap.flyTo({ center: [city.lng, city.lat], zoom: 9, duration: 1000 })
}

watch(() => props.selected, () => { if (chart) chart.setOption(atlasOptions()) })
onMounted(() => setMode('atlas'))
onUnmounted(dispose)
</script>

<style scoped>
.cultural-map { background: radial-gradient(circle at 62% 32%, #284551 0, #142832 42%, #102129 100%); border-radius: 24px; overflow: hidden; color: #f5ead6; box-shadow: 0 22px 65px #10212936; border: 1px solid #c8a97055; }
.map-toolbar,.map-footer { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:20px 26px; }
.map-toolbar { border-bottom:1px solid #d4bc8d27; }
.map-toolbar strong { display:block; margin-top:4px; font: 500 22px Georgia, 'Noto Serif SC', serif; letter-spacing:2px; }
.map-kicker { font: 10px Georgia,serif; letter-spacing:3px; color:#d2b582; }
.map-modes { display:flex; padding:4px; border:1px solid #d4bc8d55; border-radius:999px; }
.map-modes button,.city-index button { border:0; background:transparent; color:#d5c3a6; cursor:pointer; }
.map-modes button { padding:7px 13px; border-radius:999px; white-space:nowrap; }
.map-modes button.active { background:#d8b77d; color:#1b2a2e; }
.map-canvas { width:100%; height:500px; }
.map-footer { border-top:1px solid #d4bc8d27; font-size:11px; letter-spacing:1px; color:#c3ae8d; }
.city-index { display:flex; flex-wrap:wrap; gap:7px; padding:0 22px 20px; }
.city-index button { border:1px solid #d4bc8d55; border-radius:999px; padding:5px 11px; font-size:12px; }
.city-index button:hover,.city-index button.active { background:#d8b77d; color:#1b2a2e; }
.map-error-inline { padding:0 24px 18px; color:#ffd7ba; }
.map-error-inline button { margin-left:10px; color:inherit; background:none; border:0; text-decoration:underline; cursor:pointer; }
@media(max-width:700px) { .map-toolbar,.map-footer { padding:15px; } .map-toolbar { align-items:flex-start; flex-direction:column; } .map-canvas { height:420px; } .map-footer { flex-direction:column; align-items:flex-start; } }
:global(.cultural-map-pin) { border:1px solid #e8c88b; border-radius:999px; background:#172d35; color:#f8ead0; padding:5px 9px; cursor:pointer; box-shadow:0 3px 13px #0008; }
</style>
