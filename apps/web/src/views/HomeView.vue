<template>
  <div class="home-container fullpage-mode" ref="homeContainerRef" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <div class="fullpage-track" :style="fullpageTrackStyle">
    <!-- 轮播图 -->
    <section class="carousel-section home-page" ref="carouselSectionRef" :class="{ 'page-active': activeSection === 0 }" :aria-hidden="activeSection !== 0" :inert="activeSection !== 0">
      <el-carousel 
        ref="carouselRef"
        :interval="5000" :autoplay="activeSection === 0"
        height="100vh" 
        arrow="always"
        :pause-on-hover="true"
        @change="handleCarouselChange"
      >
        <template #prev>
          <div class="carousel-arrow prev">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
        <template #next>
          <div class="carousel-arrow next">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </template>
        <!-- 轮播项 -->
        <el-carousel-item v-for="(item, index) in carouselItems" :key="index">
          <div class="carousel-bg">
            <!-- 视频背景 -->
            <div v-if="item.type === 'video'" class="carousel-bg-video-container">
              <video 
                class="carousel-bg-video" 
                autoplay 
                muted 
                loop 
                playsinline 
                preload="auto"
              >
                <source :src="item.src" type="video/mp4">
                您的浏览器不支持视频播放。
              </video>
            </div>
            <!-- 图片背景 -->
            <div v-else-if="item.type === 'image'" class="carousel-bg-image-container">
              <img 
                class="carousel-bg-image" 
                :src="item.src" 
                :alt="item.title"
              >
            </div>
          </div>
          <!-- 渐变遮罩 -->
          <div class="carousel-overlay"></div>
          <!-- 轮播图内容 -->
          <div class="carousel-content">
            <h2 class="carousel-title">{{ item.title }}</h2>
            <p class="carousel-description">{{ item.description }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
      <!-- 自定义指示器 -->
      <div class="carousel-custom-indicators">
        <button 
          v-for="(item, index) in carouselItems" 
          :key="index"
          class="custom-indicator"
          :class="{ 'active': currentSlide === index }"
          @click="goToSlide(index)"
          :aria-label="`切换到第${index + 1}张幻灯片`"
        >
          <span class="indicator-dot"></span>
          <span class="indicator-line"></span>
        </button>
      </div>
    </section>



    <section class="atlas-page home-page" :aria-hidden="activeSection !== 1" :inert="activeSection !== 1">
      <CulturalAtlas v-if="featuresVisible" :active="activeSection === 1" @navigation-lock="atlasLocked = $event" />
    </section>
    </div>

    <nav class="fullpage-nav" aria-label="首页模块导航">
      <button
        v-for="(section, index) in homeSections"
        :key="section.id"
        type="button"
        class="fullpage-nav-item"
        :class="{ active: activeSection === index }"
        :aria-current="activeSection === index ? 'page' : undefined"
        :aria-label="`切换到${section.label}`"
        :disabled="atlasLocked"
        @click="goToSection(index)"
      >
        <span class="fullpage-nav-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="fullpage-nav-dot"></span>
        <span class="fullpage-nav-label">{{ section.label }}</span>
      </button>
    </nav>

    <div class="fullpage-progress" aria-hidden="true">
      <span :style="{ height: `${((activeSection + 1) / homeSections.length) * 100}%` }"></span>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted, computed, defineAsyncComponent, watch, nextTick } from 'vue'


const route=useRoute(),router=useRouter()
const isAtlasRoute=()=>route.query.atlas==='1'||!!route.query.city||!!route.query.item
const CulturalAtlas = defineAsyncComponent(() => import('@/components/CulturalAtlas.vue'))
const atlasLocked = ref(false)
const homeContainerRef = ref(null)
const carouselSectionRef = ref(null)
const featuresSectionRef = ref(null)


const homeSections = [
  { id: 'hero', label: '首页影像' },
  { id: 'atlas', label: '文化地图' }
]
const activeSection = ref(isAtlasRoute()?1:0)
const fullpageTrackStyle = computed(() => ({
  transform: `translate3d(0, -${activeSection.value * 100}dvh, 0)`
}))
let sectionLocked = false
let sectionUnlockTimer = null
let touchStartY = 0
let touchedPage = null

// 轮播图相关
const currentSlide = ref(0)
const carouselRef = ref(null)

function handleCarouselChange(index) {
  currentSlide.value = index
}

function goToSlide(index) {
  currentSlide.value = index
  if (carouselRef.value) {
    carouselRef.value.setActiveItem(index)
  }
}

// 内容区域的动画状态
const featuresVisible = ref(isAtlasRoute())


function notifyHomeSectionChange(index) {
  window.dispatchEvent(new CustomEvent('home-section-change', {
    detail: { index, id: homeSections[index].id }
  }))
}

function goToSection(index) {
  const nextIndex = Math.max(0, Math.min(homeSections.length - 1, index))
  if (nextIndex === activeSection.value || sectionLocked || atlasLocked.value) return

  const query={...route.query}
  if(nextIndex===1)query.atlas='1'
  else for(const key of ['atlas','city','item','theme'])delete query[key]
  router.replace({query})
  activeSection.value = nextIndex
  featuresVisible.value ||= nextIndex === 1
  notifyHomeSectionChange(nextIndex)

  sectionLocked = true
  window.clearTimeout(sectionUnlockTimer)
  sectionUnlockTimer = window.setTimeout(() => {
    sectionLocked = false
  }, 900)
}

watch(()=>route.fullPath,()=>{
  if(route.path!=='/')return
  const next=isAtlasRoute()?1:0
  activeSection.value=next;featuresVisible.value ||= next===1
  notifyHomeSectionChange(next)
})

function handleSectionWheel(event) {
  if (atlasLocked.value || event.target.closest?.('[data-atlas-scroll]')) return
  if (Math.abs(event.deltaY) < 8) return
  if (sectionLocked) {
    event.preventDefault()
    return
  }

  const direction = event.deltaY > 0 ? 1 : -1
  const nextIndex = activeSection.value + direction
  if (nextIndex < 0 || nextIndex >= homeSections.length) return

  event.preventDefault()
  goToSection(nextIndex)
}

function handleSectionKeydown(event) {
  if (atlasLocked.value || event.repeat) return
  const target = event.target
  if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(target.tagName))) return

  let nextIndex = activeSection.value
  if (event.key === 'ArrowDown' || event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) nextIndex += 1
  if (event.key === 'ArrowUp' || event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) nextIndex -= 1
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = homeSections.length - 1

  nextIndex = Math.max(0, Math.min(homeSections.length - 1, nextIndex))
  if (nextIndex === activeSection.value) return
  event.preventDefault()
  goToSection(nextIndex)
}

function handleTouchStart(event) {
  touchStartY = event.changedTouches[0]?.clientY ?? 0
  touchedPage = event.target instanceof Element ? event.target.closest('.home-page') : null
}

function handleTouchEnd(event) {
  if (atlasLocked.value || event.target.closest?.('[data-atlas-scroll]')) return
  const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY
  const deltaY = touchEndY - touchStartY
  if (Math.abs(deltaY) < 48 || sectionLocked) return

  const direction = deltaY < 0 ? 1 : -1
  if (touchedPage && touchedPage.scrollHeight > touchedPage.clientHeight) {
    const canScrollDown = touchedPage.scrollTop + touchedPage.clientHeight < touchedPage.scrollHeight - 2
    const canScrollUp = touchedPage.scrollTop > 2
    if ((direction > 0 && canScrollDown) || (direction < 0 && canScrollUp)) return
  }

  goToSection(activeSection.value + direction)
}

// 轮播图数据
const baseUrl = import.meta.env.BASE_URL
const carouselItems = ref([
  {
    type: 'video',
    src: `${baseUrl}Homepagebackgroundvideo1.mp4`,
    title: '江苏文化传承与创新',
    description: '探索江苏丰富的文化遗产，感受传统文化与现代科技的完美融合'
  },
  {
    type: 'video',
    src: `${baseUrl}backgroundvideo3.mp4`,
    title: '江苏非物质文化遗产',
    description: '品味江苏独特的非遗文化，体验传统工艺的魅力'
  },
  {
    type: 'video',
    src: `${baseUrl}backgroundvideo2.mp4`,
    title: '江苏文化地图',
    description: '跟随地图探索江苏各地的文化特色，感受地域文化的多样性'
  },
  {
    type: 'video',
    src: `${baseUrl}backgroundvideo4.mp4`,
    title: 'AI 助力文化创新',
    description: '利用人工智能技术，为传统文化注入新的活力'
  }
])



// 波浪动画效果 - 暂时禁用，因为footerRef在模板中未定义
function handleMouseMove(event) {
  if (!carouselSectionRef.value) return

  const section = carouselSectionRef.value
  const rect = section.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  section.style.setProperty('--hero-parallax-x', `${x * 8}px`)
  section.style.setProperty('--hero-parallax-y', `${y * 8}px`)
}

// 重置波浪位置 - 暂时禁用，因为footerRef在模板中未定义
function resetWaves() {
  if (!carouselSectionRef.value) return

  carouselSectionRef.value.style.setProperty('--hero-parallax-x', '0px')
  carouselSectionRef.value.style.setProperty('--hero-parallax-y', '0px')
}

function syncHeroVideos() {
  const videos = homeContainerRef.value?.querySelectorAll('video') || []
  videos.forEach((video, index) => {
    if (activeSection.value === 0 && index === currentSlide.value && !document.hidden) video.play().catch(() => {})
    else video.pause()
  })
}
watch([activeSection, currentSlide], async () => { await nextTick(); syncHeroVideos() })
// 生命周期钩子
onMounted(() => {
  document.body.classList.add('atlas-home-open')
  document.addEventListener('visibilitychange', syncHeroVideos)
  syncHeroVideos()
  window.scrollTo(0, 0)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', resetWaves)
  window.addEventListener('keydown', handleSectionKeydown)
  homeContainerRef.value?.addEventListener('wheel', handleSectionWheel, { passive: false })
  notifyHomeSectionChange(activeSection.value)
})

onUnmounted(() => {
  document.body.classList.remove('atlas-home-open')
  document.removeEventListener('visibilitychange', syncHeroVideos)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', resetWaves)
  window.removeEventListener('keydown', handleSectionKeydown)
  homeContainerRef.value?.removeEventListener('wheel', handleSectionWheel)
  window.clearTimeout(sectionUnlockTimer)
  window.dispatchEvent(new CustomEvent('home-section-change', { detail: { index: 0, id: 'leave' } }))
})
</script>

<style scoped>
/* 全局样式 */
:root {
  --primary-color: #151515;
  --accent-color: #8b1538;
  --accent-secondary: #c9a962;
  --background-color: #f7f4ef;
  --surface-color: rgba(255, 255, 255, 0.78);
  --text-color: #23201c;
  --light-text: #6f6961;
  --border-color: rgba(31, 24, 20, 0.08);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --shadow-sm: 0 8px 24px rgba(20, 16, 12, 0.05);
  --shadow-md: 0 16px 48px rgba(20, 16, 12, 0.08);
  --shadow-lg: 0 24px 72px rgba(20, 16, 12, 0.12);
  --sidebar-bg: #f8f9fa;
}

/* 页面容器 */
.home-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(201, 169, 98, 0.08), transparent 34%),
    linear-gradient(180deg, #fbfaf7 0%, #f6f2eb 100%);
  color: var(--text-color);
  font-family: 'Source Han Serif SC', 'Noto Serif SC', '思源宋体', '微软雅黑', serif;
}

/* 轮播图样式 - 参考中国非物质文化遗产网风格 */
.carousel-section {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 更平滑的缓动函数 */
  will-change: transform, opacity;
  --hero-parallax-x: 0px;
  --hero-parallax-y: 0px;
}

/* 确保轮播图容器正确显示 */
.el-carousel {
  width: 100%;
  height: 100%;
}

/* 确保轮播项正确显示 */
.el-carousel__item {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* 轮播图背景 */
.carousel-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

/* 视频背景容器 */
.carousel-bg-video-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

/* 视频背景 */
.carousel-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 图片背景容器 */
.carousel-bg-image-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}

/* 图片背景 */
.carousel-bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 8s ease-out;
}

.el-carousel__item:hover .carousel-bg-image {
  transform: scale(1.05);
}

/* 视频悬停效果 */
.el-carousel__item:hover .carousel-bg-video {
  transform: scale(1.05);
}

.carousel-bg-video {
  transition: transform 8s ease-out;
}

/* 渐变遮罩 */
.carousel-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(20, 12, 14, 0.06) 0%, rgba(20, 12, 14, 0.14) 55%, rgba(20, 12, 14, 0.34) 100%),
    radial-gradient(circle at top, rgba(201, 169, 98, 0.04), transparent 44%);
  z-index: 2;
}

/* 轮播图箭头样式 */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 10;
  color: white;
}

.carousel-arrow:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.carousel-arrow.prev {
  left: 40px;
}

.carousel-arrow.next {
  right: 40px;
}

/* 轮播图默认指示器样式修改 */
:deep(.el-carousel__indicators) {
  display: none;
}

/* 自定义指示器 */
.carousel-custom-indicators {
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 10;
  padding: 10px 18px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 50%;
}

.custom-indicator::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s ease;
}

.custom-indicator:hover::before {
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.custom-indicator.active::before {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

/* 指示器圆点 */
.indicator-dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transition: all 0.4s ease;
}

.custom-indicator:hover .indicator-dot {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.2);
}

.custom-indicator.active .indicator-dot {
  background: white;
  width: 10px;
  height: 10px;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
}

/* 指示器线条 */
.indicator-line {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, white, transparent);
  border-radius: 1px;
  transition: width 0.4s ease;
}

.custom-indicator.active .indicator-line {
  width: 20px;
  animation: lineGlow 5s ease-in-out infinite;
}

@keyframes lineGlow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 激活状态的外圈动画 */
.custom-indicator.active::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ringPulse 2s ease-out infinite;
}

@keyframes ringPulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* 轮播内容 */
.carousel-content {
  text-align: center;
  padding: 80px 20px;
  max-width: 760px;
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.carousel-content::before {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(700px, calc(100vw - 56px));
  height: 240px;
  transform: translate(-50%, -50%) translate3d(var(--hero-parallax-x), var(--hero-parallax-y), 0);
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
  pointer-events: none;
}

.carousel-content > * {
  position: relative;
  z-index: 1;
}

.carousel-title {
  font-size: 56px;
  font-weight: 650;
  margin: 0 0 18px 0;
  color: white;
  text-align: center;
  letter-spacing: 0.8px;
  line-height: 1.12;
  text-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  animation: fadeInUp 0.8s ease 0.1s forwards;
  opacity: 0;
}

.carousel-description {
  font-size: 16px;
  margin: 0;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
  max-width: 560px;
  letter-spacing: 0.1px;
  animation: fadeInUp 0.8s ease 0.2s forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 767px) {
  .carousel-title {
    font-size: 28px;
    letter-spacing: 2px;
  }
  
  .carousel-description {
    font-size: 15px;
  }
  
  .carousel-custom-indicators {
    bottom: 30px;
    padding: 10px 20px;
    gap: 12px;
  }
  
  .custom-indicator {
    width: 40px;
    height: 40px;
  }
  
  .indicator-dot {
    width: 6px;
    height: 6px;
  }
  
  .custom-indicator.active .indicator-dot {
    width: 8px;
    height: 8px;
  }
  
  .indicator-line {
    bottom: 6px;
  }
  
  .custom-indicator.active .indicator-line {
    width: 16px;
  }
  
  .el-carousel {
    height: 300px !important;
  }
}

/* 首页横幅 */
.hero-section {
  background-color: var(--primary-color);
  color: white;
  padding: 120px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  transform-origin: bottom center;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/Homepagebackground2.png');
    background-size: cover;
    background-position: center top;
    opacity: 0.1;
    z-index: 1;
  }

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 24px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 特色板块 */
.features-section {
  padding: 100px 0;
  transform-origin: top center;
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(50px);
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #faf8f5 0%, #fff 50%, #faf8f5 100%);
}

.features-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
}

/* 装饰背景 */
.section-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.03;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: #C00C00;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: #8B0000;
  bottom: 100px;
  left: -150px;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: #C00C00;
  bottom: -50px;
  right: 20%;
}

/* 标题区域 */
.section-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: linear-gradient(135deg, rgba(139, 21, 56, 0.10) 0%, rgba(201, 169, 98, 0.10) 100%);
  border: 1px solid rgba(139, 21, 56, 0.16);
  border-radius: 999px;
  color: #8b1538;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 20px;
}

.section-title {
  position: relative;
  display: inline-block;
  margin: 0 0 16px 0;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -12px;
  width: 72px;
  height: 3px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, #8b1538, #c9a962, #8b1538, transparent);
}

.title-text {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(135deg, #171717 0%, #5a4a2e 55%, #8b1538 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.title-line {
  display: block;
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #C00C00, #ff4444, #C00C00);
  margin: 16px auto 0;
  border-radius: 2px;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  letter-spacing: 1px;
}

/* 江苏地图样式 */
.jiangsu-map-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 30px;
}

.map-wrapper {
  width: 100%;
  position: relative;
}

.amap-container {
  width: 100%;
  height: 550px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 10px 30px -5px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 248, 245, 0.98) 100%);
  z-index: 200;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 56px;
  height: 56px;
  border: 4px solid rgba(192, 12, 0, 0.1);
  border-top-color: #C00C00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.map-loading p {
  margin-top: 20px;
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.loading-hint {
  margin-top: 8px;
  color: #999;
  font-size: 13px;
  font-weight: 400;
}

.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(250, 248, 245, 0.99) 100%);
  z-index: 200;
}

.map-error p {
  margin-top: 16px;
  color: #666;
  font-size: 14px;
  text-align: center;
  max-width: 280px;
}

.map-error .error-title {
  color: #C00C00;
  font-weight: 600;
  font-size: 18px;
  margin-top: 16px;
}

.map-error .error-detail {
  color: #666;
  font-size: 14px;
  margin-top: 8px;
}

.map-error .error-hint {
  color: #888;
  font-size: 12px;
  margin-top: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f8f8f8 0%, #f0f0f0 100%);
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.retry-btn {
  margin-top: 24px;
  padding: 12px 28px;
  background: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(192, 12, 0, 0.3);
}

.retry-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(192, 12, 0, 0.4);
}

.map-legend-amap {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.legend-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #333;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.legend-items {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.legend-dot.capital {
  background: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  box-shadow: 0 0 10px rgba(192, 12, 0, 0.4);
}

.legend-dot.city {
  background: #C00C00;
}

.map-hint {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  font-size: 13px;
  color: #666;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
  animation: hintPulse 2s ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.map-hint svg {
  color: #C00C00;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.capital {
  background: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  box-shadow: 0 0 8px rgba(192, 12, 0, 0.5);
}

.legend-dot.city {
  background: #C00C00;
}

/* 高德地图自定义标记样式 */
.custom-marker {
  cursor: pointer;
}

.amap-custom-marker {
  filter: drop-shadow(0 8px 16px rgba(139, 21, 56, 0.08));
}

.marker-dot {
  position: relative;
}

.marker-dot::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 220%;
  height: 220%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(192, 12, 0, 0.14) 0%, transparent 65%);
  z-index: -1;
}

.marker-label {
  font-family: 'Source Han Serif SC', 'Noto Serif SC', '微软雅黑', Arial, sans-serif;
}

.marker-badge {
  pointer-events: none;
}

@keyframes markerPulse {
  0%, 100% {
    transform: scale(0.96);
    opacity: 0.78;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

/* 城市信息面板 */
.city-info-panel {
  flex: 1 1 100%;
  width: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 244, 238, 0.98));
  border-radius: 28px;
  box-shadow:
    0 20px 56px rgba(15, 23, 42, 0.12),
    0 1px 0 rgba(255, 255, 255, 0.8) inset,
    0 0 0 1px rgba(139, 21, 56, 0.05);
  overflow: hidden;
  max-height: 650px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.city-info-panel:hover {
  box-shadow: 
    0 24px 66px rgba(15, 23, 42, 0.14),
    0 0 0 1px rgba(139, 21, 56, 0.08);
}

.panel-header {
  position: relative;
  padding: 0;
  min-height: 190px;
  display: block;
  overflow: hidden;
  background: linear-gradient(135deg, #1e0f14 0%, #8B0000 48%, #C00C00 100%);
}

.city-banner {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #2a171f 0%, #8B0000 48%, #C00C00 100%);
}

.city-banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transform: scale(1.03);
  display: block;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(20, 12, 14, 0.18) 0%, rgba(20, 12, 14, 0.42) 58%, rgba(139, 21, 56, 0.9) 100%),
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.14), transparent 40%);
}

.city-banner-content {
  position: relative;
  z-index: 1;
  padding: 28px 28px 26px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 190px;
  color: #fff;
}

.city-banner-content::after {
  content: '';
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 18px;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.24), transparent);
}

.banner-kicker {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-size: 11px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
  backdrop-filter: blur(10px);
}

.city-banner-content h3 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 1.5px;
  line-height: 1.1;
}

.city-banner-content p {
  margin: 0;
  max-width: 420px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.86);
}

.city-icon {
  position: absolute;
  top: 22px;
  right: 22px;
  width: 54px;
  height: 54px;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.city-header-text {
  display: none;
}

.close-btn {
  position: absolute;
  top: 22px;
  left: 22px;
  width: 42px;
  height: 42px;
  border: none;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.25s ease;
  z-index: 2;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.12);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px) rotate(90deg);
}

.panel-body {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  background:
    radial-gradient(circle at top right, rgba(201, 169, 98, 0.06), transparent 32%),
    linear-gradient(180deg, rgba(250, 247, 242, 0.92), rgba(255, 255, 255, 0.98));
}

.panel-intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.city-highlight-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(139, 21, 56, 0.08) 0%, rgba(201, 169, 98, 0.12) 100%);
  border: 1px solid rgba(139, 21, 56, 0.08);
  border-radius: 16px;
  font-size: 14px;
  color: #7a4a12;
  font-weight: 600;
}

.city-highlight-banner svg {
  filter: drop-shadow(0 2px 6px rgba(251, 191, 36, 0.25));
}

.city-description {
  font-size: 14px;
  line-height: 1.95;
  color: #4d4741;
  margin: 0;
  text-align: justify;
}

.stats-card {
  padding: 4px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 244, 238, 0.92));
  border: 1px solid rgba(139, 21, 56, 0.06);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.city-stats {
  padding: 4px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(248, 244, 238, 0.92));
  border: 1px solid rgba(139, 21, 56, 0.06);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.city-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.panel-tags {
  display: grid;
  gap: 18px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  background: white;
}

.stat-card .stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card .stat-icon.heritage {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  color: #C00C00;
}

.stat-card .stat-icon.attraction {
  background: linear-gradient(135deg, #f0f7e6 0%, #e6f3d4 100%);
  color: #4CAF50;
}

.stat-card .stat-icon.food {
  background: linear-gradient(135deg, #fff8e6 0%, #ffefcc 100%);
  color: #FF9800;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: 11px;
  color: var(--light-text);
  margin-top: 2px;
}

.panel-tags {
  display: grid;
  gap: 16px;
}

.culture-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 12px 0;
}

.culture-section h4 svg {
  color: var(--accent-color);
}

.culture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.culture-tag {
  display: inline-block;
  padding: 6px 14px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.culture-tag:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.highlight-section {
  margin-bottom: 0;
}

.highlight-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 10px 0;
}

.highlight-section h4 svg {
  color: var(--accent-color);
}

.highlight-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.highlight-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: linear-gradient(135deg, #f0f7e6 0%, #e6f3d4 100%);
  border-radius: 16px;
  font-size: 12px;
  color: #4CAF50;
  transition: all 0.3s ease;
}

.highlight-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.highlight-item.food {
  background: linear-gradient(135deg, #fff8e6 0%, #ffefcc 100%);
  color: #FF9800;
}

.famous-section {
  margin-bottom: 0;
}

.famous-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.famous-section h4 svg {
  color: #6366f1;
}

.famous-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.famous-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: #4f46e5;
  font-weight: 500;
  transition: all 0.3s ease;
}

.famous-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
}

.famous-item::before {
  content: '';
  width: 6px;
  height: 6px;
  background: #6366f1;
  border-radius: 50%;
}

.action-buttons {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.explore-btn,
.design-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.explore-btn {
  background: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  color: white;
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 12, 0, 0.3);
}

.design-btn {
  background: linear-gradient(135deg, #2d8a4e 0%, #1a5c32 100%);
  color: white;
}

.design-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 138, 78, 0.3);
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.4s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 区域标题 */
.section-header {
  text-align: center;
  margin-bottom: 20px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--light-text);
  margin: 8px 0 0 0;
}

/* 专题报道 */
.special-reports {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.report-item {
  padding: 10px;
  background-color: #F5F5F5;
  border-radius: 4px;
  text-align: center;
}

.report-date {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}

/* 非遗地图 */
.heritage-map {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.map-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.map-btn {
  padding: 6px 12px;
  background-color: #F5F5F5;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.map-btn:hover {
  background-color: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.map-note {
  font-size: 12px;
  color: var(--light-text);
  text-align: center;
  margin-top: 10px;
}

/* 首页横幅调整 */
.hero-links {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.hero-count {
  font-size: 18px;
  font-weight: bold;
  color: white;
  background-color: var(--accent-color);
  padding: 10px 20px;
  border-radius: 4px;
}

.hero-content {
  text-align: center;
}

.hero-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 30px 0;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 20px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 767px) {
  .hero-links {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .map-nav {
    justify-content: center;
  }
  
  /* 优化地图响应式显示 */
  .amap-container {
    height: 400px;
    border-radius: 16px;
  }
  
  .city-info-panel {
    border-radius: 18px;
  }
  
  .panel-header {
    min-height: 170px;
  }
  
  .city-banner-content {
    padding: 22px 20px 20px;
    min-height: 170px;
  }
  
  .city-banner-content h3 {
    font-size: 24px;
  }
  
  .city-banner-content p {
    font-size: 13px;
  }
  
  .city-banner-image {
    transform: scale(1.01);
  }
  
  .city-icon,
  .close-btn {
    top: 16px;
  }
  
  .city-icon {
    right: 16px;
    width: 46px;
    height: 46px;
    border-radius: 14px;
  }
  
  .close-btn {
    left: 16px;
    width: 38px;
    height: 38px;
  }
  
  .panel-body {
    padding: 18px;
    gap: 14px;
  }
  
  .panel-intro,
  .panel-tags {
    gap: 10px;
  }
  
  .city-highlight-banner {
    padding: 12px 14px;
    border-radius: 14px;
  }
  
  .stats-card {
    padding: 0;
  }
  
  .city-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .map-legend-amap {
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    font-size: 12px;
    border-radius: 10px;
  }
  
  .legend-header {
    font-size: 12px;
    margin-bottom: 8px;
    padding-bottom: 8px;
  }
  
  .map-loading p,
  .map-error p {
    font-size: 13px;
  }
  
  .loading-spinner {
    width: 44px;
    height: 44px;
  }
  
  .section-title .title-text {
    font-size: 32px;
  }
  
  .section-subtitle {
    font-size: 14px;
  }
  
  .map-hint {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .decoration-circle {
    display: none;
  }
}

@media (max-width: 480px) {
  .features-section {
    padding: 60px 0;
  }
  
  .amap-container {
    height: 320px;
    border-radius: 12px;
  }
  
  .map-legend-amap {
    bottom: 10px;
    right: 10px;
    padding: 10px 14px;
    border-radius: 8px;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 8px;
  }
  
  .legend-item {
    font-size: 11px;
  }
  
  .legend-dot {
    width: 10px;
    height: 10px;
  }
  
  .section-title .title-text {
    font-size: 26px;
    letter-spacing: 2px;
  }
  
  .header-badge {
    font-size: 11px;
    padding: 6px 14px;
  }
  
  .city-stats {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .map-hint {
    left: 10px;
    bottom: 10px;
    padding: 6px 10px;
    font-size: 11px;
  }
}

/* 最新动态 */
.news-section {
  padding: 100px 0;
  background: linear-gradient(180deg, #ffffff 0%, #faf8f5 50%, #ffffff 100%);
  transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform, opacity;
  opacity: 0;
  transform: translateY(50px);
  position: relative;
  overflow: hidden;
}

.news-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(192, 12, 0, 0.2), transparent);
}

.news-section.visible {
  opacity: 1;
  transform: translateY(0);
}

.news-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 标题区域 */
.news-header {
  text-align: center;
  margin-bottom: 60px;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #C00C00, transparent);
}

.news-section-title {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  letter-spacing: 4px;
}

.news-section-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  letter-spacing: 1px;
}

.news-hero-strip {
  margin-top: 28px;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 18px;
  align-items: stretch;
}

.news-hero-card,
.featured-side-copy {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(139, 21, 56, 0.08);
  border-radius: 22px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(16px);
}

.news-hero-card {
  padding: 22px 24px;
  text-align: left;
}

.hero-card-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(139, 21, 56, 0.12), rgba(201, 169, 98, 0.12));
  color: #8b1538;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.news-hero-card strong {
  display: block;
  font-size: 22px;
  line-height: 1.4;
  color: #171717;
  margin-bottom: 10px;
}

.news-hero-card p,
.featured-side-copy p {
  margin: 0;
  font-size: 14px;
  line-height: 1.9;
  color: #5f5a54;
}

.news-hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-item {
  padding: 18px 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(250, 247, 242, 0.9));
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 18px;
  text-align: center;
}

.metric-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  color: #8b1538;
}

.metric-label {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #6f6961;
}

.news-featured-block {
  margin: 34px 0 28px;
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  gap: 20px;
}

.featured-card {
  min-height: 320px;
  border-radius: 26px;
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  box-shadow: 0 22px 60px rgba(15, 23, 42, 0.14);
}

.featured-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.18), rgba(139, 21, 56, 0.72));
}

.featured-content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: #fff;
}

.featured-tag {
  align-self: flex-start;
  margin-bottom: 14px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 12px;
  letter-spacing: 1px;
}

.featured-content h3 {
  margin: 0 0 12px;
  font-size: 30px;
  line-height: 1.25;
}

.featured-content p {
  color: rgba(255, 255, 255, 0.86);
  max-width: 620px;
}

.featured-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.84);
}

.featured-meta span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.featured-side-copy {
  padding: 26px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-side-copy h4 {
  margin: 0 0 12px;
  font-size: 22px;
  line-height: 1.35;
  color: #171717;
}

.featured-side-copy ul {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.featured-side-copy li {
  position: relative;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.7;
  color: #5f5a54;
}

.featured-side-copy li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b1538, #c9a962);
}

/* 新闻网格 - Bento Grid 风格 */
.news-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap, 1.5rem);
  --grid-gap: 1.5rem;
  --card-radius: 20px;
  --card-padding: 1.75rem;
}

/* 新闻卡片 - 优化版 */
.news-item {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border-radius: var(--card-radius);
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  grid-column: span 4;
  cursor: pointer;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.03);
}

/* 第一张卡片放大显示 - Bento 特色 */
.news-item:nth-child(1) {
  grid-column: span 6;
  grid-row: span 2;
}

.news-item:nth-child(1) .news-image {
  height: 280px;
}

.news-item:nth-child(1) .news-title {
  font-size: 22px;
}

.news-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #C00C00, #ff4444, #C00C00);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.news-item:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 12px 28px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(192, 12, 0, 0.08);
  border-color: rgba(192, 12, 0, 0.15);
}

.news-item:hover::before {
  opacity: 1;
}

/* Focus 状态 - 可访问性 */
.news-item:focus-visible {
  outline: 3px solid rgba(192, 12, 0, 0.5);
  outline-offset: 2px;
}

/* 图片区域 */
.news-image-wrapper {
  position: relative;
  overflow: hidden;
}

.news-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.news-image::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
  pointer-events: none;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.news-item:hover .news-image img {
  transform: scale(1.06);
}

.news-category {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  font-size: 12px;
  color: #C00C00;
  font-weight: 600;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  letter-spacing: 0.5px;
}

.news-item:hover .news-category {
  background: #C00C00;
  color: white;
  transform: translateY(-2px);
}

/* 内容区域 */
.news-content {
  padding: var(--card-padding, 1.75rem);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.news-date,
.news-views,
.news-author,
.news-source {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  transition: color 0.2s ease;
}

.news-date svg,
.news-views svg,
.news-author svg,
.news-source svg {
  color: #9ca3af;
  transition: color 0.2s ease;
}

.news-item:hover .news-date,
.news-item:hover .news-views,
.news-item:hover .news-author,
.news-item:hover .news-source {
  color: #4b5563;
}

.news-item:hover .news-date svg,
.news-item:hover .news-views svg,
.news-item:hover .news-author svg,
.news-item:hover .news-source svg {
  color: #6b7280;
}

.news-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 14px 0;
  color: #111827;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;
  letter-spacing: 0.3px;
}

.news-item:hover .news-title {
  color: #C00C00;
}

.news-summary {
  font-size: 14px;
  line-height: 1.8;
  color: #6b7280;
  margin: 0 0 12px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 视频样式 */
.news-video {
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.news-video-player {
  width: 100%;
  height: auto;
  aspect-ratio: 16/9;
  border: none;
}

/* 图片画廊样式 */
.news-gallery {
  margin: 16px 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 8px;
}

.gallery-item {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.gallery-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.news-points {
  margin: 0 0 16px 0;
  padding: 0 0 0 18px;
  display: grid;
  gap: 8px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.news-points li::marker {
  color: #C00C00;
}

/* 底部区域 */
.news-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.news-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  background: none;
  border: none;
  font-size: 14px;
  color: #C00C00;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.news-link::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #C00C00, #ff4444);
  transition: width 0.2s ease;
}

.news-link:hover {
  gap: 12px;
  color: #8B0000;
}

.news-link:hover::after {
  width: 100%;
}

.news-link:focus-visible {
  outline: 2px solid rgba(192, 12, 0, 0.5);
  outline-offset: 4px;
  border-radius: 4px;
}

.news-link svg {
  transition: transform 0.2s ease;
}

.news-link:hover svg {
  transform: translateX(4px);
}

/* 查看更多 */
.news-more {
  text-align: center;
  margin-top: 60px;
}

.more-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 36px;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border: 2px solid #C00C00;
  border-radius: 32px;
  font-size: 15px;
  color: #C00C00;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
}

.more-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  z-index: 0;
}

.more-btn span,
.more-btn svg {
  position: relative;
  z-index: 1;
}

.more-btn:hover {
  color: white;
  transform: translateY(-4px);
  box-shadow: 
    0 12px 28px rgba(192, 12, 0, 0.25),
    0 4px 12px rgba(192, 12, 0, 0.15);
  border-color: transparent;
}

.more-btn:hover::before {
  opacity: 1;
}

.more-btn:focus-visible {
  outline: 3px solid rgba(192, 12, 0, 0.5);
  outline-offset: 3px;
}

.more-btn:hover svg {
  transform: translateY(3px);
}

.more-btn svg {
  transition: transform 0.25s ease;
}

/* 页脚 */
.page-footer {
  background-color: var(--primary-color);
  color: white;
  padding: 40px 0;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.copyright {
  font-size: 14px;
  margin: 0 0 10px 0;
}

.contact {
  font-size: 14px;
  margin: 0 0 10px 0;
  opacity: 0.8;
}

.icp {
  font-size: 12px;
  margin: 0;
  opacity: 0.6;
}

/* 波浪动画样式 */
.wave-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  overflow: hidden;
}

.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
  transform-origin: center;
}

.wave-1 {
  top: 10px;
  z-index: 3;
}

.wave-2 {
  top: 15px;
  z-index: 2;
  width: 110%;
  left: -5%;
}

.wave-3 {
  top: 20px;
  z-index: 1;
  width: 120%;
  left: -10%;
}

/* 响应式设计 */
@media (max-width: 1199px) {
  .hero-title {
    font-size: 40px;
  }
  
  .hero-subtitle {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 32px;
  }
}

@media (max-width: 767px) {
  .hero-section {
    padding: 80px 0;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .features-section {
    padding: 60px 0;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 1024px) {
  .news-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .news-item {
    grid-column: span 3;
  }
  
  .news-item:nth-child(1) {
    grid-column: span 6;
    grid-row: span 1;
  }
  
  .news-item:nth-child(1) .news-image {
    height: 220px;
  }
}

@media (max-width: 767px) {
  .news-section {
    padding: 60px 0;
  }
  
  .news-section-title {
    font-size: 28px;
    letter-spacing: 2px;
  }
  
  .news-section-subtitle {
    font-size: 14px;
  }
  
  .news-header {
    margin-bottom: 32px;
  }
  
  .news-hero-strip,
  .news-featured-block {
    grid-template-columns: 1fr;
  }
  
  .news-hero-card,
  .featured-side-copy {
    padding: 18px;
    border-radius: 18px;
  }
  
  .news-hero-card strong,
  .featured-side-copy h4 {
    font-size: 18px;
  }
  
  .news-hero-metrics {
    grid-template-columns: 1fr;
  }
  
  .featured-card {
    min-height: 260px;
    border-radius: 20px;
  }
  
  .featured-content {
    padding: 22px;
  }
  
  .featured-content h3 {
    font-size: 22px;
  }
  
  .decoration-line {
    width: 40px;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    --grid-gap: 1.25rem;
    --card-radius: 16px;
    --card-padding: 1.25rem;
  }
  
  .news-item,
  .news-item:nth-child(1) {
    grid-column: span 1;
    grid-row: span 1;
  }
  
  .news-image,
  .news-item:nth-child(1) .news-image {
    height: 180px;
  }
  
  .news-title,
  .news-item:nth-child(1) .news-title {
    font-size: 16px;
  }
  
  .news-content {
    padding: 1.25rem;
  }
  
  .news-more {
    margin-top: 40px;
  }
  
  .more-btn {
    padding: 14px 28px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .news-section-title {
    font-size: 24px;
  }
  
  .news-image,
  .news-item:nth-child(1) .news-image {
    height: 160px;
  }
  
  .news-meta {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .news-category {
    padding: 6px 12px;
    font-size: 11px;
  }
}

/* 文化概览部分样式 */
.culture-overview-section {
  background: #fcfcfc;
  padding: 80px 0 100px;
  position: relative;
  overflow: hidden;
}

.culture-overview-section .overview-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

/* 文化数据统计 */
.culture-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin: 60px 0;
}

.culture-stats .stat-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.culture-stats .stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.culture-stats .stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.culture-stats .stat-icon.heritage {
  background: linear-gradient(135deg, #1E3A5F 0%, #0F172A 100%);
  color: white;
}

.culture-stats .stat-icon.attraction {
  background: linear-gradient(135deg, #164E63 0%, #0F172A 100%);
  color: white;
}

.culture-stats .stat-icon.food {
  background: linear-gradient(135deg, #7E22CE 0%, #4C1D95 100%);
  color: white;
}

.culture-stats .stat-icon.famous {
  background: linear-gradient(135deg, #92400E 0%, #78350F 100%);
  color: white;
}

.culture-stats .stat-content {
  flex: 1;
}

.culture-stats .stat-value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 4px;
}

.culture-stats .stat-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.culture-stats .stat-description {
  display: block;
  font-size: 14px;
  color: #64748B;
  line-height: 1.5;
}

/* 特色文化推荐 */
.culture-highlights {
  margin-top: 80px;
}

.culture-highlights .highlights-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.culture-highlights .highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.culture-highlights .highlight-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.culture-highlights .highlight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.culture-highlights .highlight-image {
  height: 180px;
  overflow: hidden;
}

.culture-highlights .highlight-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.culture-highlights .highlight-card:hover .highlight-image img {
  transform: scale(1.05);
}

.culture-highlights .highlight-content {
  padding: 24px;
}

.culture-highlights .highlight-content h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 12px;
}

.culture-highlights .highlight-content p {
  font-size: 14px;
  color: #64748B;
  line-height: 1.6;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .culture-stats {
    grid-template-columns: 1fr;
  }
  
  .culture-highlights .highlights-grid {
    grid-template-columns: 1fr;
  }
  
  .culture-overview-section {
    padding: 60px 0 80px;
  }
}

/* 首页整屏翻页 */
.home-container.fullpage-mode {
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  position: relative;
  overscroll-behavior: contain;
}

.fullpage-track {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.88s cubic-bezier(0.76, 0, 0.24, 1);
  will-change: transform;
}

.home-page {
  flex: 0 0 100vh;
  flex-basis: 100dvh;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;
  isolation: isolate;
}

.fullpage-nav {
  position: absolute;
  top: 50%;
  right: clamp(18px, 2.4vw, 42px);
  z-index: 40;
  display: grid;
  gap: 8px;
  transform: translateY(-50%);
}

.fullpage-nav-item {
  position: relative;
  width: 46px;
  height: 42px;
  padding: 0;
  border: 0;
  background: transparent;
  color: rgba(37, 29, 24, 0.46);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  transition: color 0.28s ease;
}

.fullpage-nav-number {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 10px;
  letter-spacing: 0.08em;
  opacity: 0;
  transform: translateX(6px);
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.fullpage-nav-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
  transition: width 0.28s ease, height 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
}

.fullpage-nav-label {
  position: absolute;
  right: 28px;
  top: 50%;
  transform: translate(8px, -50%);
  white-space: nowrap;
  padding: 7px 11px;
  border-radius: 999px;
  color: #fff;
  background: rgba(30, 22, 20, 0.82);
  backdrop-filter: blur(10px);
  font-size: 12px;
  letter-spacing: 0.08em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.fullpage-nav-item:hover .fullpage-nav-label,
.fullpage-nav-item:focus-visible .fullpage-nav-label {
  opacity: 1;
  transform: translate(0, -50%);
}

.fullpage-nav-item:hover .fullpage-nav-number,
.fullpage-nav-item.active .fullpage-nav-number {
  opacity: 1;
  transform: translateX(0);
}

.fullpage-nav-item.active {
  color: #8b1538;
}

.fullpage-nav-item.active .fullpage-nav-dot {
  width: 11px;
  height: 11px;
  background: #8b1538;
  box-shadow: 0 0 0 5px rgba(139, 21, 56, 0.13);
}

.fullpage-nav-item:focus-visible {
  outline: 2px solid rgba(139, 21, 56, 0.42);
  outline-offset: 2px;
  border-radius: 999px;
}

.fullpage-progress {
  position: absolute;
  top: 28%;
  right: clamp(10px, 1.25vw, 22px);
  z-index: 39;
  width: 1px;
  height: 44%;
  background: rgba(45, 35, 28, 0.12);
  overflow: hidden;
}

.fullpage-progress span {
  display: block;
  width: 100%;
  background: linear-gradient(180deg, #8b1538, #c9a962);
  transition: height 0.88s cubic-bezier(0.76, 0, 0.24, 1);
}

.fullpage-mode .carousel-section ~ .home-page {
  padding: clamp(74px, 9vh, 94px) 0 clamp(22px, 3.6vh, 40px);
}

.fullpage-mode .section-header,
.fullpage-mode .news-header {
  margin-bottom: clamp(12px, 2vh, 22px);
}

.fullpage-mode .header-badge {
  padding: 5px 14px;
  margin-bottom: 8px;
}

.fullpage-mode .title-text,
.fullpage-mode .news-section-title {
  font-size: clamp(28px, 3.2vw, 38px);
}

.fullpage-mode .title-line {
  height: 3px;
  margin-top: 10px;
}

.fullpage-mode .culture-stats {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: clamp(14px, 2.2vh, 24px) 0;
}

.fullpage-mode .culture-stats .stat-card {
  min-width: 0;
  padding: clamp(13px, 1.8vh, 18px) 14px;
  gap: 12px;
  border-radius: 14px;
}

.fullpage-mode .culture-stats .stat-icon {
  width: 44px;
  height: 44px;
}

.fullpage-mode .culture-stats .stat-value {
  font-size: 24px;
}

.fullpage-mode .culture-stats .stat-label {
  font-size: 14px;
  margin-bottom: 4px;
}

.fullpage-mode .culture-stats .stat-description {
  font-size: 11px;
}

.fullpage-mode .culture-highlights {
  margin-top: clamp(14px, 2.3vh, 26px);
}

.fullpage-mode .culture-highlights .highlights-title {
  margin-bottom: 14px;
  font-size: 19px;
}

.fullpage-mode .culture-highlights .highlights-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.fullpage-mode .culture-highlights .highlight-image {
  height: clamp(76px, 11vh, 118px);
}

.fullpage-mode .culture-highlights .highlight-content {
  padding: 13px 14px 14px;
}

.fullpage-mode .culture-highlights .highlight-content h4 {
  margin-bottom: 6px;
  font-size: 16px;
}

.fullpage-mode .culture-highlights .highlight-content p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
}

.fullpage-mode .features-container,
.fullpage-mode .news-container {
  height: 100%;
}

.fullpage-mode .features-container {
  display: flex;
  flex-direction: column;
}

.fullpage-mode .jiangsu-map-container {
  position: relative;
  min-height: 0;
  flex: 1;
  gap: 12px;
  margin-top: 8px;
}

.fullpage-mode .features-section :deep(.map-canvas) {
  height: clamp(350px, 56vh, 515px);
}

.fullpage-mode .features-section .city-info-panel {
  position: absolute;
  inset: 0;
  z-index: 25;
  max-height: none;
}

.fullpage-mode .news-header {
  margin-bottom: 14px;
}

.fullpage-mode .news-hero-strip {
  margin-top: 16px;
}

.fullpage-mode .news-hero-card {
  padding: 15px 18px;
}

.fullpage-mode .metric-item {
  padding: 13px 10px;
}

.fullpage-mode .news-featured-block {
  margin: 18px 0 14px;
}

.fullpage-mode .featured-card {
  min-height: clamp(230px, 34vh, 320px);
}

.fullpage-mode .news-grid {
  display: none;
}

.fullpage-mode .news-more {
  margin-top: 12px;
}

.fullpage-mode .more-btn {
  padding: 11px 26px;
}

@media (max-height: 760px) and (min-width: 769px) {
  .fullpage-mode .carousel-section ~ .home-page {
    padding-top: 96px;
    padding-bottom: 16px;
  }

  .fullpage-mode .section-subtitle,
  .fullpage-mode .news-section-subtitle,
  .fullpage-mode .culture-stats .stat-description,
  .fullpage-mode .featured-side-copy p,
  .fullpage-mode .featured-side-copy ul {
    display: none;
  }

  .fullpage-mode .features-section :deep(.map-canvas) {
    height: 330px;
  }

  .fullpage-mode .featured-card {
    min-height: 250px;
  }
}

@media (max-width: 768px) {
  .fullpage-nav {
    right: 8px;
  }

  .fullpage-nav-item {
    width: 32px;
  }

  .fullpage-nav-number,
  .fullpage-nav-label,
  .fullpage-progress {
    display: none;
  }

  .home-page:not(.carousel-section) {
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .fullpage-mode .carousel-section ~ .home-page {
    padding: 78px 34px 30px 0;
  }

  .fullpage-mode .culture-stats,
  .fullpage-mode .culture-highlights .highlights-grid {
    grid-template-columns: 1fr;
  }

  .fullpage-mode .features-section :deep(.map-canvas) {
    height: 420px;
  }

  .fullpage-mode .features-section .city-info-panel {
    position: relative;
    inset: auto;
    max-height: 70vh;
  }

  .fullpage-mode .news-hero-strip,
  .fullpage-mode .news-featured-block {
    grid-template-columns: 1fr;
  }

  .fullpage-mode .news-grid {
    display: grid;
  }
}

@media (prefers-reduced-motion: reduce) {
  .fullpage-track,
  .fullpage-progress span {
    transition-duration: 0.01ms;
  }
}

</style>

<style>
body.atlas-home-open { overflow: hidden; }
body.atlas-home-open .page-footer { display: none; }
</style>
<style scoped>
.home-container.fullpage-mode .atlas-page { padding: 0; overflow: hidden; position: relative; }
.fullpage-nav-item:disabled { opacity: .22; cursor: default; }
</style>
