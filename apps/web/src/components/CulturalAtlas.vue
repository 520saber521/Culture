<template>
  <div ref="root" class="cultural-atlas" :class="{ 'atlas-active': active, 'in-city': phase !== 'overview', 'water-closeup': !!waterFocus }" :style="[anchorStyle, city ? { '--city-accent': cityVisuals[city.id].ink } : {}]">
    <div class="atlas-orbit" aria-hidden="true"></div>
    <AtlasMap :water-focus="waterFocus" @water-select="openWater" ref="mapRef" :active="active" :selected="city?.id" :hover="hover || (discoveryFocused ? discoveryEntry.cityId : null)" :phase="phase" :recent="reading.recentCity" :counts="theme === 'all' ? null : counts" :reduced="reduced" @select="enterCity" @hover="hover = $event" />
    <div class="overview-ui" :inert="phase !== 'overview' || !active">
      <nav class="water-entries" aria-label="水系近景">
        <span>观水</span><button v-for="(story,id) in waterStories" :key="id" :ref="el=>waterButtons[id]=el" :aria-pressed="waterFocus===id" @click="openWater(id)">{{ story.name }}</button>
        <button v-if="waterFocus" class="water-return" @click="closeWater">← 返回全省</button>
      </nav>
      <section v-if="waterFocus" class="water-story" aria-labelledby="water-story-title" aria-live="polite">
        <span class="eyebrow">水岸手记 / {{ waterFocus==='taihu' ? 'TAIHU' : 'YANGTZE' }}</span>
        <h2 id="water-story-title">{{ waterStories[waterFocus].title }}</h2>
        <h3>{{ waterStories[waterFocus].subtitle }}</h3>
        <p>{{ waterStories[waterFocus].geography }}</p><p>{{ waterStories[waterFocus].culture }}</p>
        <a :href="waterStories[waterFocus].source" target="_blank" rel="noopener noreferrer">资料与延伸阅读 ↗</a>
        <a class="water-story-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">水系 © OpenStreetMap</a>
      </section>
      <header class="atlas-heading"><span class="eyebrow">JIANGSU / CULTURAL ATLAS</span><h2>江苏<br><em>文化地图</em><span class="title-seal">文脉</span></h2><p>循山水脉络，读十三城风雅。</p><div class="heading-rule"></div><span class="map-instruction">选择一座城，走进它的故事</span></header>
      <div class="atlas-compass" aria-hidden="true"><span>北</span><i></i><small>N</small></div>
      <aside v-if="theme === 'all'" class="discovery-card" aria-label="文化发现" @pointerenter="discoveryFocused = true" @pointerleave="discoveryFocused = false">
        <div class="discovery-heading"><span class="eyebrow">文化发现 / CULTURAL FIND</span><button @click="nextDiscovery" aria-label="换个文化发现">换个发现 ↻</button></div>
        <div class="discovery-story" :key="discoveryEntry.id">
          <button class="discovery-art" @click="openDiscovery" :aria-label="`阅读${discoveryEntry.title}`"><AtlasArtwork :city-id="discoveryEntry.cityId" :title="discoveryEntry.title" :src="discoveryEntry.image" :media-id="discoveryEntry.id" /></button>
          <div class="discovery-copy" aria-live="polite"><span>{{ discoveryCity.name }} · {{ discoveryEntry.category }}</span><h3>{{ discoveryEntry.title }}</h3><p>{{ discoveryEntry.summary }}</p></div>
        </div>
        <div class="discovery-actions"><button @click="openDiscovery">读这个故事 <span>↗</span></button><button @click="locateDiscovery">在地图上找它 ◎</button></div>
      </aside>
      <div v-if="theme !== 'all'" class="theme-stories" aria-label="主题代表文化" data-atlas-scroll><span class="eyebrow">{{ themeName }} · 城市之间的联系</span><div><button v-for="example in examples" :key="example.cityId" @click="enterCity({id:example.cityId})"><span>{{ example.cityName }}</span>{{ example.title }}<i>↗</i></button></div></div>
      <div class="roam-entry"><span>不知道从哪里开始？</span><BrandButton class="roam-button" @click="roam">随心漫游</BrandButton><small>{{ theme === 'all' ? '让一座城，带你发现江苏' : `在「${themeName}」之间相遇` }}</small></div>
      <div class="atlas-bottom"><div class="theme-row" aria-label="文化主题"><span class="theme-label">循文脉探索</span><button v-for="t in themes" :key="t.id" :aria-pressed="theme === t.id" :class="{active:theme === t.id}" @click="setTheme(t.id)">{{ t.name }}</button></div><div class="atlas-footer"><span aria-live="polite">{{ theme === 'all' ? '全部 13 座城市' : `涉及 ${matchedCities} 座城市` }} · {{ totalItems }} 个条目</span><button @click="indexOpen = !indexOpen" :aria-expanded="indexOpen">城市索引 {{ indexOpen ? '−' : '+' }}</button><a class="water-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">水系 © OpenStreetMap</a><span class="atlas-note">{{ reading.recentCity ? `刚刚浏览 · ${cities.find(c=>c.id===reading.recentCity)?.name}` : '江河湖海，共此青绿' }}</span></div></div>
      <div v-if="indexOpen" class="city-index-panel"><button v-for="c in cities" :key="c.id" @click="enterCity({id:c.id})">{{ c.name }}<small>{{ counts[c.id] }}</small></button></div>
    </div>
    <section v-if="city" ref="cityPanel" class="city-exhibition" :class="{ revealed: revealCity }" :inert="phase !== 'city' || !active" aria-label="城市文化展场" @scroll.passive="rememberCity" data-atlas-scroll>
      <div class="exhibition-top"><button ref="cityBack" @click="back">← 返回江苏地图</button><div class="exhibition-actions"><label class="city-switch">切换城市 <select :value="city.id" aria-label="切换城市" @change="switchCity($event.target.value)"><option v-for="c in cities" :key="c.id" :value="c.id">{{ c.name }}</option></select></label><button @click="share">分享此城 ↗</button></div></div>
      <header class="city-hero" :class="{ 'has-photo': heroPhotoReady }"><AtlasArtwork :city-id="city.id" :title="city.name" :src="city.image" priority @photo-state="heroPhotoReady = $event" /><div class="city-hero-copy"><span class="eyebrow">{{ city.id.toUpperCase() }} · CULTURAL PORTRAIT</span><h2>{{ city.name }}</h2><p>{{ city.tagline }}</p><div>{{ city.keywords.join(' · ') }}</div></div></header>
      <div class="city-editorial"><p class="city-intro">{{ city.intro }}</p><CityMuseumLinks :city="city.id" /><div class="collection-title"><div><span class="eyebrow">THE COLLECTION</span><h3>在细节里，遇见{{ city.name }}</h3></div><span>八件文化切片 / 01—08</span></div>
      <p v-if="theme !== 'all'" class="theme-notice">{{ counts[city.id] ? `已优先呈现「${themeName}」相关内容` : `本城暂无「${themeName}」条目，以下为全部文化内容` }}<button @click="setTheme('all')">查看全部文脉</button></p>
      <button v-if="featured" class="culture-entry featured-entry" :data-item-id="featured.id" @click="openItem(featured,$event)"><div class="featured-art"><AtlasArtwork :city-id="city.id" :title="featured.title" :src="featured.image" :media-id="featured.id" /></div><div class="featured-copy"><span class="eyebrow">01 / 从这里读懂{{ city.name }}</span><h3>{{ featured.title }}</h3><p>{{ featured.summary }}</p><ul><li v-for="point in featured.observations" :key="point">{{ point }}</li></ul><span class="featured-link">走近这项文化 <b>↗</b></span></div></button>
      <div class="collection-filters" aria-label="延伸内容分类"><span>七项延伸</span><button v-for="cat in ['全部',...categories]" :key="cat" :aria-pressed="category === cat" @click="setCategory(cat)">{{ cat }} <small>{{ cat === '全部' ? 7 : orderedItems.slice(1).filter(i=>i.category===cat).length }}</small></button></div>
      <p v-if="!extensionItems.length" class="category-empty">该分类已作为上方主角展出，可选择其他分类继续阅读。</p>
      <div class="collection-grid"><button v-for="(entry,i) in extensionItems" :key="entry.id" class="culture-entry" :data-item-id="entry.id" @click="openItem(entry,$event)"><div class="entry-art"><AtlasArtwork :city-id="city.id" :title="entry.title" :index="i" :src="entry.image" :media-id="entry.id"/><span class="entry-number">{{ String(orderedItems.findIndex(e=>e.id===entry.id)+1).padStart(2,'0') }}</span><span class="entry-arrow">↗</span></div><div class="entry-text"><span>{{ entry.category }}</span><h4>{{ entry.title }}</h4><p>{{ entry.summary }}</p></div></button></div></div>
    </section>
    <section v-if="item" ref="detailPanel" class="item-detail" role="dialog" aria-modal="true" :aria-label="item.title" @scroll.passive="rememberItem" data-atlas-scroll @keydown.tab="trapFocus">
      <div class="exhibition-top"><button ref="detailBack" @click="back">← 返回{{ city.name }}展场</button><span>{{ cities.find(c=>c.id===item.cityId)?.name }} / {{ item.category }}</span><button @click="share">分享条目 ↗</button></div>
      <div class="detail-layout"><div class="detail-art"><AtlasArtwork :city-id="item.cityId" :title="item.title" :src="item.image" :media-id="item.id" /></div><article><span class="eyebrow">CULTURAL CLOSE-UP</span><h2>{{ item.title }}</h2><p class="detail-lead">{{ item.summary }}</p><p v-for="paragraph in item.body" :key="paragraph">{{ paragraph }}</p><h3>值得细看的三个地方</h3><ol><li v-for="point in item.observations" :key="point">{{ point }}</li></ol><div class="sources"><h3>资料与延伸阅读</h3><a v-for="source in item.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.title }} {{ source.kind === 'directory' ? '（资料入口）' : '' }} ↗</a><small>文字为文化导读；地域纹样为原创示意图，不作为文物或实景照片。</small></div><h3>沿着文脉继续看</h3><div class="related"><button v-for="related in relatedItems(item)" :key="related.id" @click="showRelated(related)">{{ related.title }} <span>↗</span></button></div></article></div>
    </section>
    <div v-if="notice" class="atlas-notice" role="status">{{ notice }}</div>
    <div v-if="manualLink" class="share-fallback"><label>复制此链接<input readonly :value="manualLink" @focus="$event.target.select()" aria-label="分享链接" /></label><button @click="manualLink = ''">关闭</button></div>
  </div>
</template>
<script setup>
import BrandButton from './BrandButton.vue'
import { waterStories } from '@/data/atlas/water-stories'
import CityMuseumLinks from './CityMuseumLinks.vue'
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { readAtlasQuery, atlasQuery, loadReading, saveReading } from '@/data/atlas/navigation'
import AtlasMap from './AtlasMap.vue'
import AtlasArtwork from './AtlasArtwork.vue'
import { cityVisuals, exhibitionItems, themeExamples } from '@/data/atlas/visuals'
import { cities, categories, themes, themeCounts, relatedItems } from '@/data/atlas/content'
const route=useRoute(),router=useRouter()
let storage;try {storage=window.sessionStorage} catch {}
const reading=ref(loadReading(storage)),category=ref('全部'),notice=ref(''),manualLink=ref('')
let readingTimer=null,noticeTimer=null,navigationEpoch=0,restoring=false
const props = defineProps({ active: Boolean })
const emit = defineEmits(['navigation-lock'])
const heroPhotoReady=ref(false)
const mapRef=ref(null),root=ref(null),cityPanel=ref(null),detailPanel=ref(null),cityBack=ref(null),detailBack=ref(null)
const waterFocus=ref(null),waterButtons={}
function openWater(id){if(phase.value!=='overview'||!props.active||!waterStories[id])return;waterFocus.value=id;hover.value=null;discoveryFocused.value=false;indexOpen.value=false}
function closeWater(){const id=waterFocus.value;waterFocus.value=null;nextTick(()=>waterButtons[id]?.focus({preventScroll:true}))}
const theme=ref('all'),hover=ref(null),city=ref(null),item=ref(null),phase=ref('overview'),revealCity=ref(false),indexOpen=ref(false),reduced=ref(false)
const counts=computed(()=>themeCounts(theme.value)),themeName=computed(()=>themes.find(t=>t.id===theme.value).name)
const matchedCities=computed(()=>Object.values(counts.value).filter(n=>n>0).length)
const totalItems=computed(()=>Object.values(counts.value).reduce((a,b)=>a+b,0))
const extensionItems=computed(()=>orderedItems.value.slice(1).filter(i=>category.value==='全部'||i.category===category.value))
const hovered=computed(()=>cities.find(c=>c.id===hover.value))
const orderedItems=computed(()=>exhibitionItems(city.value,theme.value))
const featured=computed(()=>orderedItems.value[0])
const examples=computed(()=>themeExamples(cities,theme.value))
const discoveryIndex=ref(0),discoveryFocused=ref(false)
const discoveries=cities.map(c=>exhibitionItems(c)[0])
const discoveryEntry=computed(()=>hovered.value ? exhibitionItems(hovered.value)[0] : discoveries[discoveryIndex.value])
const discoveryCity=computed(()=>cities.find(c=>c.id===discoveryEntry.value.cityId))
let pendingDiscovery=null
const anchorStyle=ref({ '--anchor-x':'60%', '--anchor-y':'50%' })
let timers=new Set(),lastCityTrigger=null,lastItemTrigger=null,detailOrigin=null,animation=null,portalAnimation=null,portalFrames=null,mq,disposed=false
function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn()},reduced.value?30:ms);timers.add(id)}
watch(phase, value=>{emit('navigation-lock',value!=='overview');if(value!=='overview')waterFocus.value=null})
watch(()=>props.active,value=>{if(!value)waterFocus.value=null})
async function enterCity({id,x,y}){
  const epoch=navigationEpoch
  if(phase.value!=='overview')return
  heroPhotoReady.value=false
  lastCityTrigger=document.activeElement
  city.value=cities.find(c=>c.id===id);if(!city.value)return
  visitCity();commitRoute();
  phase.value='lifting';hover.value=null;indexOpen.value=false
  await nextTick()
  later(()=>phase.value='focusing',180)
  later(async()=>{
    phase.value='entering'
    revealCity.value=true
    await nextTick()
    if(disposed || epoch!==navigationEpoch)return
    const rect=cityPanel.value.getBoundingClientRect()
    portalFrames=mapRef.value?.getPortal(id,rect)
    cityPanel.value.style.clipPath='none'
    portalAnimation=cityPanel.value.animate(reduced.value || !portalFrames ? [{opacity:0},{opacity:1}] : [{clipPath:portalFrames.closed,opacity:.6},{clipPath:portalFrames.open,opacity:1}],{duration:reduced.value?80:560,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'})
    await portalAnimation.finished.catch(()=>{})
    if(disposed || epoch!==navigationEpoch)return
    phase.value='city';portalAnimation.cancel();await nextTick();restoreCity();cityBack.value?.focus({preventScroll:true})
    if(pendingDiscovery){const entry=pendingDiscovery;pendingDiscovery=null;await openItem(entry)}
  },600)
}
async function openItem(entry,event){
  const epoch=navigationEpoch
  if(phase.value!=='city')return
  rememberCity();lastItemTrigger=event?.currentTarget || null;detailOrigin=lastItemTrigger?.getBoundingClientRect() || {top:root.value.getBoundingClientRect().top+100,left:100,right:300,bottom:300}
  item.value=entry;phase.value='item';commitRoute();await nextTick();if(disposed||epoch!==navigationEpoch)return;restoreItem()
  const r=root.value.getBoundingClientRect(),b=detailOrigin
  const clip=`inset(${Math.max(0,b.top-r.top)}px ${Math.max(0,r.right-b.right)}px ${Math.max(0,r.bottom-b.bottom)}px ${Math.max(0,b.left-r.left)}px)`
  animation=detailPanel.value.animate([{clipPath:clip,opacity:.4},{clipPath:'inset(0px)',opacity:1}],{duration:reduced.value?80:400,easing:'cubic-bezier(.22,1,.36,1)'})
  detailBack.value?.focus({preventScroll:true})
}
async function showRelated(entry){rememberItem();item.value=entry;commitRoute();await nextTick();restoreItem();detailBack.value?.focus({preventScroll:true})}
async function back(){
  const epoch=navigationEpoch
  if(phase.value==='item'){
    if(animation?.playState==='running')return
    rememberItem();phase.value='closing-item'
    const r=root.value.getBoundingClientRect(),b=detailOrigin
    const clip=`inset(${Math.max(0,b.top-r.top)}px ${Math.max(0,r.right-b.right)}px ${Math.max(0,r.bottom-b.bottom)}px ${Math.max(0,b.left-r.left)}px)`
    animation=detailPanel.value.animate([{clipPath:'inset(0px)',opacity:1},{clipPath:clip,opacity:0}],{duration:reduced.value?80:350,fill:'forwards'})
    await animation.finished.catch(()=>{});if(disposed || epoch!==navigationEpoch)return
    item.value=null;phase.value='city';commitRoute();await nextTick();(lastItemTrigger?.isConnected ? lastItemTrigger : cityBack.value)?.focus({preventScroll:true});return
  }
  if(phase.value!=='city')return
  rememberCity();phase.value='leaving'
  const rect=cityPanel.value.getBoundingClientRect()
  portalFrames=mapRef.value?.getPortal(city.value.id,rect)
  portalAnimation=cityPanel.value.animate(reduced.value || !portalFrames ? [{opacity:1},{opacity:0}] : [{clipPath:portalFrames.open,opacity:1},{clipPath:portalFrames.closed,opacity:0}],{duration:reduced.value?80:460,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'})
  await portalAnimation.finished.catch(()=>{})
  if(disposed || epoch!==navigationEpoch)return
  revealCity.value=false;phase.value='retreating'
  later(async()=>{city.value=null;phase.value='overview';commitRoute();portalAnimation?.cancel();await nextTick();if(lastCityTrigger?.isConnected)lastCityTrigger.focus({preventScroll:true})},500)
}
function nextDiscovery(){
  const current=discoveries.findIndex(e=>e.id===discoveryEntry.value.id)
  hover.value=null;discoveryIndex.value=(current+1)%discoveries.length
}
function locateDiscovery(){mapRef.value?.focusCity(discoveryEntry.value.cityId)}
function openDiscovery(){
  if(phase.value!=='overview')return
  pendingDiscovery=discoveryEntry.value
  enterCity({id:pendingDiscovery.cityId})
}
function roam(){
  if(phase.value!=='overview')return
  let candidates=cities.filter(c=>counts.value[c.id]>0&&c.id!==reading.value.recentCity)
  if(!candidates.length)candidates=cities.filter(c=>counts.value[c.id]>0)
  const destination=candidates[Math.floor(Math.random()*candidates.length)]
  if(destination)enterCity({id:destination.id})
}
function positionKey(){return `city:${city.value?.id}:${theme.value}:${category.value}`}
function persist(){clearTimeout(readingTimer);readingTimer=setTimeout(()=>saveReading(storage,reading.value),180)}
function rememberCity(){if(!restoring&&city.value&&cityPanel.value){reading.value.positions[positionKey()]=cityPanel.value.scrollTop;persist()}}
function rememberItem(){if(!restoring&&item.value&&detailPanel.value){reading.value.positions[`item:${item.value.id}`]=detailPanel.value.scrollTop;persist()}}
function restoreCity(){if(cityPanel.value)cityPanel.value.scrollTop=reading.value.positions[positionKey()]||0}
function restoreItem(){if(detailPanel.value)detailPanel.value.scrollTop=reading.value.positions[`item:${item.value.id}`]||0}
function visitCity(){reading.value.recentCity=city.value.id;const saved=reading.value.categories[city.value.id];category.value=categories.includes(saved)?saved:'全部';persist()}
function announce(text){notice.value=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.value='',2400)}
async function setCategory(value){rememberCity();category.value=value;reading.value.categories[city.value.id]=value;persist();await nextTick()}
async function setTheme(value){rememberCity();theme.value=value;category.value='全部';commitRoute(true);await nextTick()}
function commitRoute(replace=false){router[replace?'replace':'push']({query:atlasQuery(route.query,{city:city.value,item:item.value,theme:theme.value})})}
async function switchCity(id){
  if(phase.value!=='city'||id===city.value.id)return
  const next=cities.find(c=>c.id===id);if(!next)return
  const epoch=navigationEpoch;rememberCity();phase.value='switching'
  portalAnimation=cityPanel.value.animate([{opacity:1,transform:'translateX(0)'},{opacity:0,transform:reduced.value?'none':'translateX(-18px)'}],{duration:reduced.value?60:180,fill:'both'})
  await portalAnimation.finished.catch(()=>{});if(disposed||epoch!==navigationEpoch)return
  restoring=true;heroPhotoReady.value=false;city.value=next;visitCity();await nextTick();restoreCity();restoring=false;commitRoute()
  portalAnimation.cancel();portalAnimation=cityPanel.value.animate([{opacity:0,transform:reduced.value?'none':'translateX(18px)'},{opacity:1,transform:'translateX(0)'}],{duration:reduced.value?60:240})
  await portalAnimation.finished.catch(()=>{});if(disposed||epoch!==navigationEpoch)return
  phase.value='city';await nextTick();root.value.querySelector('.city-switch select')?.focus({preventScroll:true})
}
async function share(){
  const query=atlasQuery({},{city:city.value,item:item.value,theme:theme.value})
  const url=new URL(router.resolve({path:'/',query}).href,location.origin).href
  try{await navigator.clipboard.writeText(url);announce('链接已复制，可分享当前内容')}catch{manualLink.value=url;await nextTick();root.value.querySelector('.share-fallback input')?.focus()}
}
async function applyRoute(){
  if(route.path!=='/'||!props.active)return
  const state=readAtlasQuery(route.query)
  if(state.city?.id===city.value?.id&&state.item?.id===item.value?.id&&state.theme===theme.value){
    const canonical=atlasQuery(route.query,state)
    if(JSON.stringify(canonical)!==JSON.stringify(route.query))router.replace({query:canonical})
    return
  }
  rememberCity();rememberItem();pendingDiscovery=null;discoveryFocused.value=false;navigationEpoch++;timers.forEach(clearTimeout);timers.clear();animation?.cancel();portalAnimation?.cancel()
  const epoch=navigationEpoch
  if(city.value?.id!==state.city?.id)heroPhotoReady.value=false
  restoring=true;theme.value=state.theme;city.value=state.city;item.value=state.item;indexOpen.value=false
  revealCity.value=!!state.city;phase.value=state.item?'item':state.city?'city':'overview'
  if(city.value)visitCity()
  await nextTick();if(disposed||epoch!==navigationEpoch)return
  if(cityPanel.value){cityPanel.value.style.clipPath='none';restoreCity()}
  if(item.value){detailOrigin={top:100,left:100,right:300,bottom:300};lastItemTrigger=null;restoreItem();detailBack.value?.focus({preventScroll:true})}
  else if(city.value)cityBack.value?.focus({preventScroll:true})
  restoring=false
  // Invalid IDs are dropped while preserving unrelated query parameters.
  const canonical=atlasQuery(route.query,{city:city.value,item:item.value,theme:theme.value})
  if(JSON.stringify(canonical)!==JSON.stringify(route.query))router.replace({query:canonical})
}
watch(()=>route.fullPath,applyRoute)
watch(()=>props.active,active=>{
  if(active){applyRoute();return}
  rememberCity();rememberItem();pendingDiscovery=null;discoveryFocused.value=false;navigationEpoch++;timers.forEach(clearTimeout);timers.clear()
  animation?.cancel();portalAnimation?.cancel();item.value=null;city.value=null;phase.value='overview';revealCity.value=false;restoring=false
})
function trapFocus(event){const nodes=[...detailPanel.value.querySelectorAll('button,a[href]')];const first=nodes[0],last=nodes.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}
function keydown(event){if(props.active&&event.key==='Escape'){event.preventDefault();if(waterFocus.value)closeWater();else back()}}
function motionChange(){reduced.value=mq.matches}
onMounted(()=>{mq=matchMedia('(prefers-reduced-motion: reduce)');motionChange();mq.addEventListener('change',motionChange);window.addEventListener('keydown',keydown);applyRoute()})
onBeforeUnmount(()=>{rememberCity();rememberItem();saveReading(storage,reading.value);clearTimeout(readingTimer);clearTimeout(noticeTimer);disposed=true;timers.forEach(clearTimeout);animation?.cancel();portalAnimation?.cancel();mq?.removeEventListener('change',motionChange);window.removeEventListener('keydown',keydown);emit('navigation-lock',false)})
</script>
<style scoped>

.cultural-atlas{position:relative;width:100%;height:100%;overflow:hidden;background:var(--brand-paper);color:var(--brand-ink);font-family:var(--brand-sans);--gold:var(--brand-deep-green);--serif:var(--brand-serif)}
.cultural-atlas button{font:inherit;cursor:pointer}
.cultural-atlas button:focus-visible,.cultural-atlas a:focus-visible{outline:2px solid var(--gold);outline-offset:5px}
.atlas-orbit{position:absolute;width:65vw;height:65vw;left:29%;top:50%;transform:translateY(-50%);border:1px solid #92784b18;border-radius:50%;pointer-events:none}
.atlas-orbit:after{content:'';position:absolute;inset:12%;border:1px solid #92784b12;border-radius:50%}
.overview-ui{transition:opacity .3s}
.in-city .overview-ui{opacity:0;pointer-events:none}
.eyebrow{font-family:Georgia,serif;letter-spacing:.2em;font-size:10px;color:var(--gold)}
.atlas-heading{position:absolute;top:17%;left:6%;pointer-events:none}
.atlas-heading h2{font:400 clamp(36px,4.3vw,70px)/1.2 var(--brand-display);letter-spacing:.12em;margin:25px 0 20px;position:relative}
.title-seal{display:inline-block;font:12px/1.4 var(--serif);writing-mode:vertical-rl;border:1px solid var(--brand-red);color:var(--brand-red);padding:5px 3px;letter-spacing:.2em;vertical-align:middle;margin-left:14px}
.atlas-heading p{font-size:13px;letter-spacing:.17em;color:#746c60}
.heading-rule{height:1px;width:48px;background:var(--gold);margin:30px 0 18px}
.map-instruction{font-size:11px;color:#766f63}
.atlas-compass{position:absolute;right:9%;top:17%;display:grid;justify-items:center;gap:8px;color:#776e5d;font-size:11px}
.atlas-compass i{width:1px;height:36px;background:linear-gradient(#dcc58a,transparent)}
.atlas-compass small{font-family:Georgia,serif}
.city-preview{position:absolute;left:6%;bottom:19%;max-width:25%}
.city-preview h3{font:normal 26px var(--serif);letter-spacing:.12em;margin:14px 0}
.city-preview p,.preview-picks{font-size:12px;color:#6c6d5d;line-height:1.8}
.preview-picks{font-size:11px;color:#92784b}
.atlas-bottom{position:absolute;bottom:0;left:6%;right:7%;padding-bottom:22px}
.theme-row{display:flex;gap:8px;align-items:center;border-bottom:1px solid #92784b2b;padding:0 0 20px}
.theme-label{font-size:11px;letter-spacing:.1em;color:#756d5f;margin-right:18px}
.theme-row button{background:none;border:1px solid transparent;color:#635d50;padding:8px 14px;font-size:12px;border-radius:2px}
.theme-row button.active{background:var(--brand-red);color:#fff9ed}
.theme-row button:hover{border-color:#92784b50}
.atlas-footer{display:flex;align-items:center;gap:28px;padding-top:17px;font-size:10px;color:#776f60;letter-spacing:.1em}
.atlas-footer .water-credit{color:var(--brand-muted);font-size:10px;text-underline-offset:3px}
.atlas-footer button{border:0;background:none;color:var(--brand-red);font-size:11px}
.atlas-note{margin-left:auto}
.city-index-panel{position:absolute;right:7%;bottom:130px;background:var(--brand-surface);border:1px solid #92784b50;padding:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;z-index:5}
.city-index-panel button{border:0;background:#ffffff08;color:#3e4539;padding:10px 18px;font-size:13px}
.city-index-panel small{margin-left:10px;color:#77745e}
.city-exhibition,.item-detail{position:absolute;inset:var(--brand-nav-height) 0 0;z-index:10;background:var(--brand-paper);color:#283e32;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#9dad98 transparent}
.city-exhibition{clip-path:circle(0% at var(--anchor-x) var(--anchor-y));opacity:0;transition:clip-path .7s cubic-bezier(.22,1,.36,1),opacity .5s}
.city-exhibition.revealed{clip-path:circle(150% at var(--anchor-x) var(--anchor-y));opacity:1}
.exhibition-top{height:58px;position:sticky;top:0;z-index:3;background:var(--brand-surface);border-bottom:1px solid #2d4e3020;display:flex;align-items:center;justify-content:space-between;padding:0 6%;font-size:11px;letter-spacing:.08em}
.exhibition-top button{color:#284b3b;border:0;background:none;padding:10px 0;font-size:12px}
.city-hero{position:relative;height:clamp(360px,42.9vw,640px);min-height:280px}
.city-hero:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#f4eee7ed,transparent 85%)}
.city-hero-copy{position:absolute;z-index:1;left:8%;top:20%;color:#35342c}
.city-hero-copy h2{font:normal clamp(54px,7vw,100px) var(--serif);letter-spacing:.16em;margin:15px 0}
.city-hero-copy p{font:20px var(--serif);letter-spacing:.12em}
.city-hero-copy>div{font-size:11px;color:#736857;margin-top:24px;letter-spacing:.12em}
.city-editorial{padding:45px 8% 100px}
.city-intro{font:20px/2 var(--serif);max-width:820px;margin:0 0 55px}
.collection-title{display:flex;justify-content:space-between;align-items:end;border-bottom:1px solid #21483130;padding-bottom:24px;margin-bottom:30px}
.collection-title .eyebrow,.item-detail .eyebrow{color:#8c7850}
.collection-title h3{font:normal 30px var(--serif);margin:12px 0 0}
.collection-title>span{font-size:11px;color:#6d7d70}
.theme-notice{font-size:12px;color:#6b7c70;margin-bottom:25px}
.theme-notice button{margin-left:12px;background:none;border:0;border-bottom:1px solid;color:#375b47;font-size:12px}
.collection-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:36px 22px}
.culture-entry{background:none;border:0;text-align:left;padding:0;color:inherit}
.entry-art{height:190px;position:relative;overflow:hidden}
.entry-art>div{transition:transform .6s}
.culture-entry:hover .entry-art>div{transform:scale(1.05)}
.entry-number{position:absolute;left:15px;top:12px;color:#63553e;font:12px Georgia,serif}
.entry-arrow{position:absolute;right:12px;top:8px;color:#63553e;font-size:22px}
.entry-text{padding:18px 0}
.entry-text>span{font-size:10px;letter-spacing:.15em;color:#8c7850}
.entry-text h4{font:normal 22px var(--serif);margin:12px 0}
.entry-text p{font-size:12px;line-height:1.9;color:#6b7c70;margin:0}
.item-detail{z-index:20}
.detail-layout{display:grid;grid-template-columns:42% 1fr;gap:7%;padding:50px 8% 90px}
.detail-art{height:65vh;position:sticky;top:100px}
.detail-layout article h2{font:normal 42px/1.4 var(--serif);margin:20px 0}
.detail-layout article p{font-size:14px;line-height:2.1;color:#536555}
.detail-layout article .detail-lead{font:21px/1.8 var(--serif);color:#284633;padding-bottom:22px;border-bottom:1px solid #21483125}
.detail-layout h3{font:normal 20px var(--serif);margin-top:35px}
.detail-layout li{font-size:13px;line-height:2.4;color:#536555}
.sources a{display:block;color:#536555;font-size:12px;margin:13px 0;line-height:1.7}
.sources small{display:block;font-size:11px;line-height:1.8;color:#7d897a}
.related button{width:100%;padding:15px 0;border:0;border-top:1px solid #21483125;background:none;text-align:left;color:#31513c;font-size:13px}
.related span{float:right}
@media(max-width:1100px){.collection-grid{grid-template-columns:repeat(2,1fr)}
.theme-row{gap:2px}
.theme-row button{padding:8px 10px}
.theme-label{display:none}
.city-preview{bottom:22%}
.atlas-heading h2{font-size:44px}
}
@media(max-width:720px){.atlas-heading{top:100px;left:7%}
.atlas-heading h2{font-size:30px;margin:12px 0}
.atlas-heading h2 br{display:none}
.atlas-heading p{font-size:11px;margin:8px 0}
.atlas-heading .eyebrow{font-size:8px}
.heading-rule,.map-instruction,.city-preview,.atlas-compass{display:none}
.atlas-bottom{left:6%;right:9%;padding-bottom:19px}
.theme-row{flex-wrap:wrap;gap:3px;padding-bottom:10px}
.theme-row button{font-size:11px;padding:6px 10px}
.atlas-footer{font-size:9px;gap:8px 12px;padding-top:12px;flex-wrap:wrap}.water-credit{flex-basis:100%}
.atlas-note{display:none}
.city-index-panel{left:6%;right:9%;bottom:150px;padding:12px;grid-template-columns:repeat(3,1fr)}
.city-index-panel button{padding:9px 8px}
.city-exhibition,.item-detail{inset:64px 0 0}
.exhibition-top{padding:0 7%;font-size:9px}
.exhibition-top>span:last-child{display:none}
.city-hero{height:340px}
.city-hero-copy{top:22%}
.city-hero-copy h2{font-size:65px}
.city-hero-copy p{font-size:17px}
.city-editorial{padding:30px 7% 60px}
.city-intro{font-size:17px;margin-bottom:36px}
.collection-title{display:block}
.collection-title h3{font-size:25px;margin-bottom:16px}
.collection-grid{grid-template-columns:1fr;gap:16px}
.entry-art{height:210px}
.detail-layout{display:block;padding:25px 7% 60px}
.detail-art{position:static;height:260px;margin-bottom:30px}
.detail-layout article h2{font-size:32px}
.theme-notice{line-height:1.9}
}
@media(prefers-reduced-motion:reduce){*{transition-duration:.08s!important;animation-duration:.08s!important}
}


.cultural-atlas:before{content:"";position:absolute;left:0;top:0;bottom:0;width:35%;background:var(--brand-jade);border-right:1px solid var(--brand-line);pointer-events:none}

.theme-stories{position:absolute;left:6%;bottom:20%;width:25%;max-height:27%;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}

.theme-stories>div{display:grid;gap:1px;margin-top:12px}
.theme-stories button{display:flex;align-items:center;gap:10px;width:100%;border:0;border-bottom:1px solid #92784b20;background:transparent;padding:10px 0;text-align:left;font-size:12px;color:#554e42}
.theme-stories button>span{font-size:10px;color:var(--brand-red);min-width:3em}
.theme-stories i{margin-left:auto;font-style:normal;color:#92784b}

.city-hero{border-bottom:1px solid #92784b25}
.city-hero-copy{transition:opacity .45s,transform .6s;transform:translateY(14px);opacity:0}
.revealed .city-hero-copy{transform:translateY(0);opacity:1;transition-delay:.2s}
.city-hero-copy .eyebrow{color:var(--city-accent)}

.city-hero.has-photo:after{background:linear-gradient(90deg,#161c21c9,transparent 85%)}
.city-hero.has-photo .city-hero-copy,.city-hero.has-photo .city-hero-copy>div,.city-hero.has-photo .eyebrow{color:#fff5df}

.featured-entry{display:grid;grid-template-columns:58% 1fr;gap:5%;width:100%;align-items:center;text-align:left;margin:0 0 45px;padding:0 0 40px;border-bottom:1px solid #92784b30}

.featured-art{height:350px;overflow:hidden}
.featured-art>div{transition:transform .7s}
.featured-entry:hover .featured-art>div{transform:scale(1.035)}
.featured-copy h3{font:normal 38px/1.4 var(--serif);margin:20px 0}
.featured-copy p{font-size:14px;line-height:2;color:#686b5b}
.featured-copy ul{list-style:none;padding:0;margin:20px 0;font-size:12px;line-height:2.2;color:#6c705f}
.featured-copy li:before{content:'—';margin-right:10px;color:var(--city-accent)}
.featured-link{display:block;margin-top:24px;font-size:12px;color:var(--brand-red)}
.featured-link b{margin-left:30px;font-size:20px;font-weight:400}

@media(max-width:1100px){.featured-art{height:300px}
.featured-copy h3{font-size:30px}
}

@media(max-width:720px){.theme-stories{left:6%;right:9%;width:auto;bottom:142px;max-height:65px}
.theme-stories>.eyebrow{display:none}
.theme-stories>div{display:flex;overflow-x:auto;gap:14px;margin:0}
.theme-stories button{width:auto;flex:none;font-size:10px;gap:6px;white-space:nowrap;padding:8px 0}
.theme-stories i{display:none}
.featured-entry{display:block;margin-bottom:30px;padding-bottom:28px}
.featured-art{height:240px}
.featured-copy{padding-top:24px}
.featured-copy h3{font-size:30px;margin:13px 0}
.featured-copy ul{display:none}
.featured-link{margin-top:16px}
}


.exhibition-actions{display:flex;gap:22px;align-items:center}.city-switch{display:flex;align-items:center;gap:8px;font-size:11px;color:#6b6558}.city-switch select{background:var(--brand-surface);border:1px solid #a796743d;border-radius:2px;padding:6px 24px 6px 9px;color:#383c30;font:inherit}.city-switch select:focus-visible{outline:2px solid var(--brand-red);outline-offset:3px}
.collection-filters{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:26px}.collection-filters>span{font:20px var(--serif);margin-right:auto}.collection-filters button{border:1px solid #8a7d6025;background:transparent;color:#655f50;padding:8px 12px;font-size:11px}.collection-filters button[aria-pressed=true]{background:var(--brand-red);color:#fff5df;border-color:var(--brand-red)}.collection-filters small{margin-left:5px;opacity:.75}.category-empty{font-size:13px;color:#716b5c;padding:20px 0}
.atlas-notice{position:absolute;z-index:40;bottom:25px;left:50%;transform:translateX(-50%);background:#383b30;color:#fff7e5;padding:12px 22px;font-size:12px;box-shadow:0 4px 20px #302f2920;max-width:85%;text-align:center}.share-fallback{position:absolute;z-index:45;left:10%;right:10%;bottom:25px;padding:20px;background:#fffaf0;box-shadow:0 5px 40px #302f2940;display:flex;gap:15px;align-items:center;font-size:12px}.share-fallback label{flex:1;min-width:0}.share-fallback input{display:block;width:100%;margin-top:8px;padding:8px;box-sizing:border-box}.share-fallback button{background:transparent;border:0;color:var(--brand-red)}
@media(max-width:720px){.exhibition-actions{gap:12px}.city-switch{font-size:0;gap:0}.city-switch select{font-size:12px;padding:6px 18px 6px 8px}.collection-filters{gap:7px}.collection-filters>span{flex-basis:100%;margin-bottom:5px}.collection-filters button{padding:7px 9px}.exhibition-top>span{display:none}.share-fallback{left:5%;right:5%}}

.discovery-card{position:absolute;left:6%;bottom:19%;width:27%;max-width:370px;padding:18px 0 0;border-top:1px solid #a1906d55}
.discovery-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.discovery-heading .eyebrow{font-size:9px;letter-spacing:.1em}.discovery-heading button{background:none;border:0;color:#73654e;font-size:10px;padding:4px 0}
.discovery-story{display:grid;grid-template-columns:92px 1fr;gap:18px;align-items:center;animation:discovery-in .35s ease both}.discovery-art{padding:0;border:0;height:120px;overflow:hidden;background:#e8dfce;text-align:left}.discovery-art :deep(.atlas-art){min-height:0}.discovery-art :deep(.art-caption){display:none}.discovery-art :deep(.art-word){font-size:21px}.discovery-art :deep(.art-motif){width:150%;right:-40%}.discovery-copy>span{font-size:10px;color:var(--brand-red);letter-spacing:.08em}.discovery-copy h3{font:normal 25px/1.4 var(--serif);margin:8px 0}.discovery-copy p{font-size:11px;line-height:1.9;color:#756c5c;margin:0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.discovery-actions{display:flex;justify-content:space-between;align-items:center;margin-top:16px;gap:12px}.discovery-actions button{border:0;background:none;font-size:11px;color:var(--brand-red);padding:5px 0}.discovery-actions button:last-child{color:#756c5c}.discovery-actions span{margin-left:14px}
.roam-entry{position:absolute;right:7.5%;top:20%;display:flex;flex-direction:column;align-items:flex-start;gap:10px;padding-left:16px;border-left:1px solid #a1906d55}.roam-entry>span{font-size:10px;color:#807762}.roam-entry b{font-size:17px;font-weight:normal;margin-left:14px}.roam-entry small{font-size:9px;color:#807762;letter-spacing:.04em}.atlas-compass{top:36%;right:7.5%}
@keyframes discovery-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@media(max-height:780px) and (min-width:721px){.discovery-card{bottom:18%;padding-top:12px}.discovery-art{height:85px}.discovery-story{grid-template-columns:70px 1fr;gap:12px}.discovery-copy h3{font-size:22px}.discovery-copy p{-webkit-line-clamp:2}.discovery-actions{margin-top:8px}.discovery-heading{margin-bottom:10px}.atlas-heading{top:15%}.atlas-heading h2{font-size:44px;margin:15px 0}.heading-rule{margin:20px 0 12px}}
@media(max-width:1100px) and (min-width:721px){.discovery-card{width:28%;left:5%}.roam-entry{right:5%;top:19%}.roam-entry small{display:none}.discovery-copy h3{font-size:21px}}
@media(max-width:720px){.discovery-card{left:6%;right:9%;bottom:139px;width:auto;max-width:none;border-top:0;padding:10px 12px;background:#fffaf0dc;box-shadow:0 3px 18px #615b3a0a}.discovery-heading{margin-bottom:5px}.discovery-story{grid-template-columns:42px 1fr;gap:10px}.discovery-art{height:43px}.discovery-copy h3{font-size:18px;margin:3px 0}.discovery-copy>span{font-size:9px}.discovery-copy p{display:none}.discovery-actions{margin-top:4px}.discovery-actions button{font-size:10px}.discovery-heading .eyebrow{font-size:8px}.roam-entry{top:210px;right:9%;border:0;padding:0}.roam-entry>span,.roam-entry small{display:none}.roam-entry b{font-size:12px;margin-left:8px}}
@media(prefers-reduced-motion:reduce){.discovery-story{animation:none}}
/* Shared Jiangsu brand: editorial side panel and restrained theme controls. */
.atlas-heading h2 em{font-style:normal;color:var(--brand-red)}
.atlas-heading .eyebrow{color:var(--brand-deep-green)}
.atlas-heading p,.map-instruction{color:var(--brand-deep-green)}
.roam-entry{border:0;padding:0}
.roam-button{height:44px;padding:0 16px}
.discovery-card{background:var(--brand-surface);padding:18px;border:1px solid var(--brand-line);max-width:370px;box-sizing:border-box}
.discovery-copy h3{color:var(--brand-ink)}
.discovery-heading{padding-bottom:10px;border-bottom:1px solid var(--brand-line)}
.theme-row{background:var(--brand-paper);border-color:var(--brand-line)}
.theme-row button.active{background:var(--brand-surface);color:var(--brand-red);border-color:var(--brand-red)}
.atlas-footer{color:var(--brand-muted)}
.city-hero-copy h2{font-family:var(--brand-display)}
.exhibition-top{background:var(--brand-surface)}
.city-intro{border-left:3px solid var(--brand-red);padding-left:22px}
.collection-title{background:var(--brand-jade);padding:22px}
.featured-copy{background:var(--brand-surface);padding:24px}
.collection-filters button[aria-pressed=true]{background:var(--brand-jade);color:var(--brand-red);border-color:var(--brand-red)}
@media(max-width:1100px) and (min-width:721px){.discovery-card{padding:12px}.roam-button{height:40px;padding:0 12px}}
@media(max-width:720px){.cultural-atlas:before{width:100%;height:205px;bottom:auto;border-right:0;border-bottom:1px solid var(--brand-line)}.atlas-heading h2{font-size:34px;letter-spacing:.03em}.roam-entry{top:210px}.roam-button{height:36px;padding:0 10px;gap:8px}.roam-button :deep(.brand-button__label){font-size:19px;letter-spacing:1px}.discovery-card{padding:10px 12px;box-shadow:none}.discovery-heading{padding-bottom:4px}.collection-title{padding:16px}.collection-title h3{font-size:23px}.featured-copy{padding:20px}.city-intro{font-size:17px}}
</style>

<style scoped>
.water-entries{position:absolute;top:96px;right:7%;display:flex;align-items:center;gap:16px;z-index:5;color:var(--brand-muted);font:12px var(--brand-serif);background:var(--brand-paper);padding:4px 12px;border-bottom:1px solid var(--brand-line)}
.water-entries button{border:0;border-bottom:1px solid transparent;background:transparent;color:var(--brand-deep-green);padding:8px 2px;cursor:pointer;font:16px var(--brand-serif)}
.water-entries button:hover,.water-entries button[aria-pressed=true]{color:var(--brand-red);border-bottom-color:var(--brand-red)}
.water-entries button:focus-visible{outline:1px solid var(--brand-red);outline-offset:4px}
.water-entries .water-return{font:12px var(--brand-sans);margin-left:10px}
.water-story{position:absolute;left:6%;top:25%;width:27%;max-width:340px;color:var(--brand-ink);border:1px solid var(--brand-line);padding:22px;box-sizing:border-box;background:var(--brand-surface)}
.water-story h2{font:36px var(--brand-serif);margin:18px 0 12px;color:var(--brand-deep-green)}
.water-story h3{font:16px var(--brand-serif);margin:0 0 22px;color:var(--brand-red)}
.water-story p{font:14px/1.9 var(--brand-sans);color:var(--brand-muted);margin:12px 0}
.water-story a{display:inline-block;color:var(--brand-red);font-size:11px;text-underline-offset:4px;margin-top:12px}
.water-story .water-story-credit{display:block;color:var(--brand-muted)}
.water-closeup .atlas-heading,.water-closeup .discovery-card,.water-closeup .roam-entry,.water-closeup .theme-stories,.water-closeup .atlas-compass,.water-closeup .atlas-bottom{display:none}
@media(max-width:720px){
 .water-entries{top:211px;left:6%;right:auto;gap:13px}.water-entries>span{display:none}.water-entries button{font-size:14px}
 .water-closeup .water-entries{top:84px;left:6%;right:6%}.water-entries .water-return{margin-left:auto}
 .water-closeup:before{display:none}
 .water-closeup :deep(.atlas-map){inset:125px 0 310px}
 .water-story{left:6%;right:6%;top:auto;bottom:22px;width:auto;max-width:none;padding:12px 0 0;border:0;border-top:1px solid var(--brand-line);background:var(--brand-paper)}
 .water-story h2{font-size:25px;margin:10px 0 7px}.water-story h3{font-size:14px;margin-bottom:10px}.water-story p{font-size:12px;line-height:1.65;margin:8px 0}
 .water-story .eyebrow{font-size:9px}.water-story a{margin-top:5px}.water-story .water-story-credit{display:inline-block;margin-left:16px;font-size:9px}
}
</style>
