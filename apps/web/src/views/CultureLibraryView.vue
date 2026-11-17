<template>
  <main class="culture-library-container">
    <header class="atlas-cover page-width">
      <div class="cover-copy">
        <p class="eyebrow"><span class="seal">苏</span> 江苏文化数字图鉴 <span class="edition">JIANGSU CULTURAL ATLAS</span></p>
        <h1>走进江苏<span class="title-stop">。</span></h1>
        <h2><span>一城一风物，</span><span>一卷阅江苏</span></h2>
        <p class="cover-intro">循着水巷与街巷，走近一方风土。<br>将山水、手艺与人间烟火，慢慢读进日常。</p>
        <BrandButton class="explore-button" @click="openCities">翻阅风物</BrandButton>
        <dl v-if="stats.some(item => item.value > 0)" class="cover-stats">
          <div v-for="stat in stats" :key="stat.label"><dt>{{ stat.label }}</dt><dd>{{ stat.value }}<small>{{ stat.unit }}</small></dd></div>
        </dl>
        <p v-else class="cover-footnote">山水有情 · 文脉有声 · 风物有味</p>
      </div>
      <figure class="cover-image">
        <img src="/background5.png" alt="暮色中的江南水巷、画舫与临水楼阁" fetchpriority="high">
        <span class="image-slip" aria-hidden="true">水巷深处<br>人间江南</span>
        <figcaption><span>风物序章 / 江南暮色</span><span>LAND · LIFE · CULTURE</span></figcaption>
      </figure>
    </header>

    <div class="page-width">
      <nav class="culture-paths" aria-label="江苏文化主题">
        <router-link v-for="(path, index) in paths" :key="path.to" :to="path.to" :aria-current="index === 0 ? 'page' : undefined" :class="{ active: index === 0 }">
          <span class="path-number">0{{ index + 1 }}</span><span><strong>{{ path.title }}</strong><small>{{ path.note }}</small></span><span class="path-arrow" aria-hidden="true">↗</span>
        </router-link>
      </nav>

      <section id="cities" class="city-index" aria-labelledby="city-index-title">
        <div class="index-label"><span class="eyebrow">地方志 · 索引</span><h2 id="city-index-title">择一城，细细读</h2></div>
        <div class="city-tabs" aria-label="选择城市">
          <button v-for="(city, index) in cities" :key="city" type="button" :aria-pressed="selectedCity === city" :class="{ active: selectedCity === city }" @click="selectCity(city)"><small>{{ String(index + 1).padStart(2, '0') }}</small>{{ city }}<span aria-hidden="true">{{ selectedCity === city ? '·' : '' }}</span></button>
        </div>
      </section>

      <section class="city-content" :aria-busy="loading" aria-labelledby="collection-title">
        <header class="collection-heading"><div><p class="eyebrow">城市文化图鉴 / {{ String(cities.indexOf(selectedCity) + 1).padStart(2, '0') }}</p><h2 id="collection-title">{{ selectedCity }}<span>风物志</span></h2></div><p>{{ cityLead || '从一处风景开始，读懂一座城。' }}</p></header>
        <CityMuseumLinks :city="selectedCity" />
        <div v-if="loading && !records.length" class="skeleton-grid" role="status" aria-label="正在加载城市资料"><div v-for="n in 3" :key="n" class="skeleton"><div></div><i></i><i></i></div><span class="sr-only">正在翻阅城市资料…</span></div>
        <div v-else-if="loadError" class="state-panel" role="status">
          <GardenLine /><div><p class="eyebrow">{{ records.length ? '更新暂缓' : '风物待启' }}</p><h3>这一页，暂时未能展开</h3><p>{{ records.length ? '仍为你保留上次加载的资料，稍后可以再次更新。' : '城市资料暂时连接不上，请稍后重试。你选择的城市会为你保留。' }}</p><button class="text-button" :disabled="loading" @click="loadFeatures">{{ loading ? '正在重新加载…' : '重新加载 ↗' }}</button></div>
        </div>
        <div v-else-if="!currentRecords.length && !loading" class="state-panel" role="status"><GardenLine /><div><p class="eyebrow">留白，待续</p><h3>{{ selectedCity }}的故事，正在整理</h3><p>这座城市的风物资料尚未发布，先去别处翻翻吧。</p><button class="text-button" @click="chooseAnotherCity">{{ availableOtherCity ? `翻阅${availableOtherCity}` : '返回城市目录' }} ↗</button></div></div>

        <section v-for="group in visibleGroups" :key="group.key" class="collection-group">
          <div class="group-heading"><h3><span>{{ group.number }}</span>{{ group.title }}</h3><p>{{ group.note }} <span class="record-count">/ {{ group.items.length }} 则</span></p></div>
          <div class="collection-grid" :class="{ 'has-feature': group.key === 'attraction' && group.items.length >= 3 }">
            <button v-for="(item, index) in group.items" :key="item.id" class="culture-card" :class="{ featured: group.key === 'attraction' && index === 0 && group.items.length >= 3 }" @click="openDetail(item)">
              <div class="card-image"><img v-if="item.imageUrl && !brokenImages[item.imageUrl]" :src="item.imageUrl" :alt="item.name" loading="lazy" @error="markBroken(item.imageUrl)"><div v-else class="image-missing"><GardenLine /><span>影像待补 · {{ item.name }}</span></div><span v-if="item.level" class="card-badge">{{ item.level }}</span><span v-if="item.imageUrl && !brokenImages[item.imageUrl]" class="image-action" aria-hidden="true">阅览 ↗</span></div>
              <div class="card-copy"><p class="card-kicker">{{ selectedCity }} / {{ group.title }} <span>{{ String(index + 1).padStart(2, '0') }}</span></p><h4>{{ item.name }}</h4><p class="card-description">{{ item.description || item.history }}</p><div v-if="item.highlights?.length" class="card-tags"><span v-for="tag in item.highlights.slice(0, 3)" :key="tag">{{ tag }}</span></div><p v-if="item.featureType === 'activity'" class="card-meta">{{ [item.crowd, item.season].filter(Boolean).join(' · ') }}</p><p v-if="item.featureType === 'food' && item.taste" class="card-meta">{{ item.taste }}</p></div>
            </button>
          </div>
        </section>
      </section>
      <aside class="further-reading"><div><p class="eyebrow">循着文脉，继续翻阅</p><h2>风景之外，还有故事。</h2></div><router-link to="/feiyi">寻一门手艺 <span>非遗技艺 ↗</span></router-link><router-link to="/gallery">看另一种江南 <span>影像作品 ↗</span></router-link></aside>
      <div class="endnote"><span>江苏文化数字图鉴</span><span>一方风土，值得慢慢看。</span></div>
    </div>
    <el-dialog v-model="showDetail" :title="selectedItem?.name || '风物详情'" width="min(760px, calc(100vw - 32px))" class="culture-detail-dialog" destroy-on-close>
      <article v-if="selectedItem" class="detail-body"><img v-if="selectedItem.imageUrl && !brokenImages[selectedItem.imageUrl]" class="detail-image" :src="selectedItem.imageUrl" :alt="selectedItem.name" @error="markBroken(selectedItem.imageUrl)"><p class="eyebrow">{{ selectedItem.city || selectedCity }}<span v-if="selectedItem.level"> · {{ selectedItem.level }}</span></p><p v-if="selectedItem.description">{{ selectedItem.description }}</p><div v-if="selectedItem.highlights?.length" class="card-tags"><span v-for="tag in selectedItem.highlights" :key="tag">{{ tag }}</span></div><section v-for="field in detailFields.filter(field => selectedItem[field.key])" :key="field.key"><h3>{{ field.label }}</h3><p>{{ selectedItem[field.key] }}</p></section></article>
    </el-dialog>
  </main>
</template>

<script setup>
import BrandButton from '@/components/BrandButton.vue'
import CityMuseumLinks from '@/components/CityMuseumLinks.vue'
function openCities() { window.location.hash = 'cities' }
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get } from '@/utils/api/request'

const GardenLine = () => h('svg', { viewBox: '0 0 180 110', fill: 'none', 'aria-hidden': 'true', class: 'garden-line' }, [h('path', { d: 'M12 90H168M23 88V45L58 26L94 45V88M18 46H99M32 44L58 31L85 44M43 88V62H73V88M50 62V88M66 62V88M103 88V58H156V88M98 58L130 42L162 58M110 88V70H149V88M14 98H72M95 98H165M122 30a12 12 0 1 0 0-24M25 53H34M82 53H91', stroke: 'currentColor', 'stroke-width': '1.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })])
const paths = [
  { title: '城市风物', note: '山水与日常', to: '/culture' },
  { title: '非遗技艺', note: '指尖的传承', to: '/feiyi' },
  { title: '历史人物', note: '岁月中的回响', to: '/celebrities' },
  { title: '传统艺术', note: '东方的审美', to: '/traditional-arts' },
  { title: '影像作品', note: '镜头里的江苏', to: '/gallery' }
]
const cities = ['南京', '苏州', '无锡', '扬州', '常州', '镇江', '南通', '徐州', '连云港', '淮安', '盐城', '泰州', '宿迁']
const route = useRoute()
const router = useRouter()
const selectedCity = computed(() => cities.includes(route.query.city) ? route.query.city : '南京')
const records = ref([])
const loading = ref(true)
const loadError = ref(false)
const brokenImages = ref({})
const showDetail = ref(false)
const selectedItem = ref(null)
let disposed = false
const currentRecords = computed(() => records.value.filter(item => item.city?.replace(/市$/, '') === selectedCity.value))
const cityLead = computed(() => currentRecords.value.filter(item => item.featureType === 'attraction').slice(0, 3).map(item => item.name).join(' · '))
const availableOtherCity = computed(() => cities.find(city => city !== selectedCity.value && records.value.some(item => item.city?.replace(/市$/, '') === city)))
const stats = computed(() => [
  { label: '已收录城市', value: new Set(records.value.map(item => item.city?.replace(/市$/, '')).filter(Boolean)).size, unit: '城' },
  { label: '精选景点', value: records.value.filter(item => item.featureType === 'attraction').length, unit: '处' },
  { label: '特色美食', value: records.value.filter(item => item.featureType === 'food').length, unit: '味' }
])
const groups = [
  { key: 'attraction', title: '山水胜迹', number: '壹', note: '在风景里，与一座城相遇' },
  { key: 'activity', title: '在地日常', number: '贰', note: '走入街巷，感受风土人情' },
  { key: 'food', title: '风味手记', number: '叁', note: '一方水土，一席滋味' }
]
const visibleGroups = computed(() => groups.map(group => ({ ...group, items: currentRecords.value.filter(item => item.featureType === group.key) })).filter(group => group.items.length))
const detailFields = [{ key: 'history', label: '历史背景' }, { key: 'taste', label: '口味特点' }, { key: 'restaurant', label: '推荐餐厅' }, { key: 'crowd', label: '适宜人群' }, { key: 'season', label: '适宜时节' }, { key: 'tips', label: '游览贴士' }]
function selectCity(city) { router.replace({ path: '/culture', query: { ...route.query, city }, hash: route.hash }) }
function chooseAnotherCity() { if (availableOtherCity.value) selectCity(availableOtherCity.value); else document.getElementById('cities')?.scrollIntoView({ behavior: 'smooth' }) }
function openDetail(item) { selectedItem.value = item; showDetail.value = true }
function markBroken(url) { brokenImages.value[url] = true }
async function loadFeatures() {
  loading.value = true
  loadError.value = false
  try {
    const all = []
    for (let pageNum = 1; ; pageNum++) {
      const result = await get('/city-features/list', { pageNum, pageSize: 100 })
      if (disposed) return
      if (result.code !== 200 || !Array.isArray(result.data?.records)) throw new Error('Unavailable')
      all.push(...result.data.records)
      if (pageNum >= (Number(result.data.pages) || 1)) break
    }
    // Publish only complete responses; a failed later page must not replace existing data.
    records.value = all.filter(item => groups.some(group => group.key === item.featureType))
  } catch { if (!disposed) loadError.value = true }
  finally { if (!disposed) loading.value = false }
}
onMounted(loadFeatures)
onUnmounted(() => { disposed = true })
</script>

<style scoped>
.culture-library-container{--paper:var(--brand-paper);--surface:var(--brand-surface);--ink:var(--brand-ink);--red:var(--brand-red);--line:var(--brand-line);--muted:var(--brand-muted);background:var(--paper);color:var(--ink);font-family:var(--brand-sans);padding-top:var(--brand-nav-height);min-height:100vh}
.culture-library-container *{box-sizing:border-box}.page-width{max-width:1440px;margin:0 auto;padding-left:var(--brand-gutter);padding-right:var(--brand-gutter)}button,a{-webkit-tap-highlight-color:transparent}button{font-family:inherit}a{color:inherit;text-decoration:none}button:focus-visible,a:focus-visible{outline:2px solid var(--red);outline-offset:5px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--red);margin:0 0 15px}.atlas-cover{display:grid;grid-template-columns:1fr 1.12fr;gap:54px;padding-top:38px;padding-bottom:35px;align-items:center}.cover-copy{min-width:0}.cover-copy>.eyebrow{display:flex;align-items:center;gap:12px;letter-spacing:1.5px}.seal{border:1px solid var(--red);padding:3px 5px;font:19px var(--brand-serif)}.edition{font:9px Georgia,serif;letter-spacing:1.4px;color:var(--muted);margin-left:auto}.cover-copy h1{font:clamp(48px,5.4vw,78px) var(--brand-display);letter-spacing:7px;margin:20px 0 15px;font-weight:400;white-space:nowrap}.title-stop{color:var(--red);letter-spacing:0}.cover-copy h2{font:22px var(--brand-serif);letter-spacing:3px;margin:0 0 18px}.cover-intro{font-size:13px;line-height:2;color:var(--muted);margin:0 0 20px}.explore-link{display:inline-flex;gap:36px;align-items:center;border-bottom:1px solid var(--red);padding:0 0 8px;font-size:13px;color:var(--red)}.explore-link span{font-size:22px}.cover-footnote{font-size:10px;letter-spacing:3px;color:var(--muted);border-top:1px solid var(--line);padding-top:20px;margin:25px 0 0}.cover-stats{display:flex;gap:30px;border-top:1px solid var(--line);padding-top:16px;margin:22px 0 0}.cover-stats>div{display:flex;flex-direction:column-reverse;gap:3px}.cover-stats dt{font-size:10px;color:var(--muted);letter-spacing:1px}.cover-stats dd{font:27px Georgia,serif;margin:0}.cover-stats small{font:10px var(--brand-sans);margin-left:7px;color:var(--muted)}.cover-image{position:relative;margin:0;padding:9px 9px 0;border:1px solid var(--line)}.cover-image>img{width:100%;height:340px;display:block;object-fit:cover;filter:none}.image-slip{position:absolute;right:28px;top:30px;writing-mode:vertical-rl;padding:15px 10px;background:var(--surface);color:var(--ink);font:19px var(--brand-serif);letter-spacing:4px;line-height:1.6;border:1px solid #b89967}.cover-image figcaption{display:flex;justify-content:space-between;gap:12px;padding:13px 2px;font-size:10px;color:var(--muted);letter-spacing:1px}.cover-image figcaption span:last-child{font:9px Georgia,serif}.culture-paths{display:grid;grid-template-columns:repeat(5,1fr);border-block:1px solid var(--line);padding:16px 0}.culture-paths a{position:relative;display:flex;align-items:center;gap:13px;padding:10px 22px;border-right:1px solid var(--line)}.culture-paths a:first-child{padding-left:0}.culture-paths a:last-child{border:0}.path-number{font:12px Georgia,serif;color:#a79986;align-self:flex-start;padding-top:5px}.culture-paths strong{font:20px var(--brand-serif);display:block;white-space:nowrap}.culture-paths small{display:block;color:var(--muted);font-size:10px;margin-top:7px;letter-spacing:1px}.path-arrow{margin-left:auto;font-size:17px;opacity:0}.culture-paths .active,.culture-paths a:hover{color:var(--red)}.culture-paths .active .path-arrow,.culture-paths a:hover .path-arrow{opacity:1}.culture-paths .active:after{content:'';position:absolute;bottom:-17px;left:0;width:34px;height:2px;background:var(--red)}.city-index{display:grid;grid-template-columns:210px 1fr;gap:28px;align-items:center;padding:30px 0;border-bottom:1px solid var(--line);scroll-margin-top:calc(var(--brand-nav-height) + 15px)}.index-label .eyebrow{font-size:10px;margin-bottom:10px}.index-label h2{font:21px var(--brand-serif);margin:0}.city-tabs{display:flex;flex-wrap:wrap;gap:8px 12px}.city-tabs button{display:flex;align-items:center;gap:10px;background:transparent;border:1px solid transparent;padding:8px 10px;min-height:40px;color:var(--ink);font:16px var(--brand-serif);cursor:pointer}.city-tabs small{font:10px Georgia,serif;color:var(--muted)}.city-tabs button>span{width:5px}.city-tabs button:hover{color:var(--red);background:var(--brand-jade)}.city-tabs button.active{border-color:#bc8a79;color:var(--red);background:var(--brand-jade)}.collection-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;padding:30px 0 24px}.collection-heading .eyebrow{font-size:10px;margin-bottom:10px}.collection-heading h2{font:34px var(--brand-serif);margin:0;letter-spacing:3px}.collection-heading h2 span{font-size:22px;margin-left:16px;color:var(--muted)}.collection-heading>p{font:13px var(--brand-serif);color:var(--muted);line-height:1.8;margin:0;max-width:45%}.collection-group{margin-bottom:35px}.group-heading{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--line);padding:16px 0}.group-heading h3{font:19px var(--brand-serif);margin:0}.group-heading h3>span{font-size:12px;color:var(--red);border:1px solid #b99a83;padding:3px;margin-right:12px}.group-heading p{font-size:11px;color:var(--muted);margin:0}.record-count{margin-left:15px}.collection-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:25px}.culture-card{padding:0;text-align:left;border:0;background:none;color:inherit;cursor:pointer;min-width:0}.card-image{position:relative;aspect-ratio:1.5;overflow:hidden;background:#ebe5d9}.card-image>img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .35s}.culture-card:hover .card-image>img{transform:scale(1.025)}.card-badge{position:absolute;left:12px;top:12px;padding:6px 9px;background:var(--surface);color:var(--red);font-size:11px}.image-action{position:absolute;right:12px;bottom:12px;background:var(--surface);padding:7px 12px;font-size:11px}.card-copy{padding:14px 0 17px;border-bottom:1px solid var(--line)}.card-kicker{display:flex;justify-content:space-between;font-size:10px;letter-spacing:1px;color:var(--muted);margin:0 0 9px}.card-kicker span{font-family:Georgia,serif}.card-copy h4{font:24px var(--brand-serif);margin:0 0 10px}.card-description{font-size:12px;line-height:1.9;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0}.card-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.card-tags span{color:#455c58;border:1px solid #c3ccc0;padding:3px 7px;font-size:10px}.card-meta{font-size:11px;color:#455c58;margin:10px 0 0}.has-feature{grid-template-columns:1.55fr 1fr 1fr;align-items:start}.has-feature .featured .card-image{aspect-ratio:1.1}.has-feature .featured h4{font-size:28px}.state-panel{display:flex;align-items:center;justify-content:center;gap:35px;padding:32px 25px;border-block:1px solid var(--line);background:var(--brand-surface)}.garden-line{width:145px;max-width:100%;height:auto;color:#8d988b;flex-shrink:0}.state-panel .eyebrow{font-size:10px;margin-bottom:10px}.state-panel h3{font:23px var(--brand-serif);margin:0 0 12px}.state-panel p:not(.eyebrow){font-size:12px;line-height:1.8;color:var(--muted);margin:0 0 15px}.text-button{border:0;border-bottom:1px solid var(--red);background:none;color:var(--red);font-size:12px;padding:5px 0;cursor:pointer}.text-button:disabled{opacity:.6;cursor:wait}.image-missing{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;color:var(--muted);font-size:11px}.skeleton-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}.skeleton>div{height:180px;background:#e7dfd1}.skeleton i{display:block;width:80%;height:12px;background:#e7dfd1;margin-top:15px}.skeleton i:last-child{width:50%}.skeleton{animation:breathe 1.5s ease-in-out infinite alternate}@keyframes breathe{to{opacity:.4}}.further-reading{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:32px;align-items:center;margin-top:40px;padding:28px 0;border-block:1px solid var(--line)}.further-reading .eyebrow{font-size:10px;margin-bottom:10px}.further-reading h2{font:23px var(--brand-serif);margin:0}.further-reading>a{border-left:1px solid var(--line);padding:8px 0 8px 25px;font:18px var(--brand-serif)}.further-reading>a:hover{color:var(--red)}.further-reading>a span{display:block;font:11px var(--brand-sans);color:var(--muted);margin-top:12px}.endnote{display:flex;justify-content:space-between;color:var(--muted);font-size:10px;letter-spacing:2px;padding:20px 0 30px}.detail-body{font-family:var(--brand-sans);color:var(--brand-ink);line-height:1.9}.detail-image{display:block;width:100%;max-height:390px;object-fit:contain;background:#eee7da;margin-bottom:20px}.detail-body h3{font:20px var(--brand-serif);margin:20px 0 8px}.detail-body p{font-size:14px;margin:8px 0}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
@media(min-width:1600px){.atlas-cover{padding-top:45px;padding-bottom:42px}.cover-image>img{height:360px}}
@media(max-width:1100px){.atlas-cover{gap:30px}.edition{display:none}.cover-copy h1{font-size:54px}.cover-copy h2{font-size:18px;letter-spacing:2px}.cover-image>img{height:330px}.culture-paths a{padding:10px 12px;gap:8px}.culture-paths strong{font-size:18px}.path-arrow{display:none}.city-index{grid-template-columns:165px 1fr;gap:18px}.city-tabs{gap:4px}.has-feature{grid-template-columns:1.4fr 1fr}.has-feature .featured{grid-row:span 2}.has-feature .featured .card-image{aspect-ratio:.85}.collection-grid:not(.has-feature){grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.atlas-cover{grid-template-columns:1fr;gap:23px;padding-top:25px;padding-bottom:24px}.cover-copy h1{font-size:52px;margin:16px 0 12px;letter-spacing:5px}.cover-copy h2{font-size:19px;margin-bottom:12px}.cover-intro{font-size:12px;margin-bottom:13px}.cover-copy>.eyebrow{font-size:10px;margin:0}.edition{display:block;font-size:7px;letter-spacing:.6px}.cover-image>img{height:210px}.cover-image figcaption{font-size:9px;padding:10px 0}.cover-image figcaption span:last-child{font-size:8px}.image-slip{top:23px;right:23px;font-size:16px;padding:9px 7px}.cover-footnote{margin-top:18px;padding-top:15px}.cover-stats{gap:35px;margin-top:18px;padding-top:13px}.culture-paths{overflow-x:auto;grid-template-columns:repeat(5,minmax(125px,1fr));padding:12px 0}.culture-paths a{padding:7px 15px}.culture-paths strong{font-size:17px}.culture-paths small{font-size:9px}.culture-paths .active:after{bottom:-13px}.city-index{display:block;padding:23px 0}.index-label{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.index-label .eyebrow{margin:0}.index-label h2{font-size:19px}.city-tabs{gap:4px 7px}.city-tabs button{gap:7px;padding:7px 8px;font-size:15px;min-height:38px}.city-tabs small{font-size:9px}.collection-heading{align-items:flex-start;flex-direction:column;gap:12px;padding:24px 0 20px}.collection-heading h2{font-size:30px}.collection-heading>p{max-width:100%;font-size:12px}.group-heading{align-items:flex-start;gap:12px}.group-heading h3{font-size:18px;white-space:nowrap}.group-heading p{font-size:10px;text-align:right;line-height:1.7}.record-count{margin-left:5px}.collection-grid,.collection-grid:not(.has-feature),.has-feature{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 14px}.has-feature .featured{grid-column:1/-1;grid-row:auto}.has-feature .featured .card-image{aspect-ratio:1.5}.card-image{aspect-ratio:1.15}.card-copy h4{font-size:20px;line-height:1.4}.card-description{font-size:11px}.card-kicker{font-size:9px;letter-spacing:0}.card-tags{gap:5px}.card-tags span{font-size:9px;padding:2px 4px}.image-action{font-size:10px;padding:5px 8px;bottom:8px;right:8px}.state-panel{gap:15px;padding:25px 15px}.state-panel>.garden-line{width:75px}.state-panel h3{font-size:20px;line-height:1.5}.state-panel p:not(.eyebrow){font-size:11px}.further-reading{grid-template-columns:1fr 1fr;gap:23px 15px;margin-top:26px;padding:24px 0}.further-reading>div{grid-column:1/-1}.further-reading>a{font-size:17px;padding-left:15px}.endnote{font-size:9px;letter-spacing:0}.skeleton-grid{gap:14px;grid-template-columns:repeat(2,1fr)}.skeleton:last-of-type{display:none}.skeleton>div{height:150px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
/* Shared Jiangsu brand layout. */
.atlas-cover{background:var(--brand-jade);border-bottom:1px solid var(--line)}
.cover-copy h1{color:var(--brand-red)}
.explore-button{height:46px;min-width:176px}
.cover-image{background:var(--surface);padding:8px 8px 0;border-color:#a6b39b}
.cover-image figcaption{background:#f2e6bb;margin:0 -8px;padding:12px;border-top:1px solid #c8bd96;color:#5a5138}
.cover-copy h2,.culture-paths strong,.collection-heading h2,.further-reading h2{font-family:var(--brand-display);font-weight:400}
.cover-copy h2{font-size:28px}.cover-copy h2 span{display:inline-block}
.culture-paths{background:var(--surface);margin-top:24px;padding:18px}
.culture-paths strong{font-size:25px}
.city-tabs button.active{border-color:var(--red);background:var(--brand-jade)}
.collection-heading h2{font-size:42px;color:var(--red)}
.group-heading{background:var(--brand-jade);padding:15px}
.culture-card{background:var(--surface);border:1px solid var(--line)}
.card-copy{padding:16px;border:0}
.card-copy h4{color:var(--brand-ink)}
.card-tags span{border-color:var(--brand-line);color:var(--brand-deep-green)}
.further-reading{padding:28px 20px;background:var(--brand-jade)}
.further-reading h2{font-size:28px}
@media(max-width:1100px){.culture-paths{overflow-x:auto;grid-template-columns:repeat(5,minmax(140px,1fr))}.cover-copy h2{font-size:24px}.further-reading{grid-template-columns:1.2fr 1fr 1fr}.further-reading h2{font-size:24px}}
@media(max-width:650px){.cover-copy h2{font-size:24px}.culture-paths{padding:14px}.culture-paths strong{font-size:22px}.card-copy{padding:12px}.collection-heading h2{font-size:34px}.further-reading{padding:22px 15px}}
</style>
<style>
.culture-detail-dialog.el-dialog{background:var(--brand-surface);border:1px solid var(--brand-line);border-radius:2px;padding:24px}.culture-detail-dialog .el-dialog__title{font-family:var(--brand-serif);color:var(--brand-ink)}
</style>

<style scoped>
.cover-copy h1{font-family:"Jiangnan Chapters",var(--brand-display);font-weight:400;transform:rotate(-1deg);color:#403428}.cover-copy h2,.index-label h2,.collection-heading h2,.group-heading h3,.further-reading h2{font-family:"Jiangnan Chapters",var(--brand-display)}.cover-copy h2{font-size:28px}.culture-paths strong{font-family:"Jiangnan Chapters",var(--brand-display);font-size:25px}.city-tabs button{font-family:"Jiangnan Chapters",var(--brand-display);font-size:21px}.image-slip{font-family:"Jiangnan Chapters",var(--brand-display);font-size:25px;border:3px double #8b7659;transform:rotate(3deg);background:#f8efd9}.cover-image{border:0;padding:12px;background:#eddfc3;transform:rotate(.5deg)}.cover-image figcaption{color:#65523c}.collection-heading h2{font-size:40px}.group-heading h3{font-size:25px}.index-label h2{font-size:26px}
@media(max-width:650px){.cover-copy h2{font-size:25px}.culture-paths strong{font-size:22px}.city-tabs button{font-size:19px}.collection-heading h2{font-size:34px}}
</style>
