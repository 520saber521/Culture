<template>
  <div class="culture-library-container">
    <section class="page-header">
      <div class="header-bg-pattern"></div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="#FAFAFA"/>
        </svg>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-char" v-for="(char, index) in titleChars" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">{{ char }}</span>
        </h1>
        <p class="page-subtitle">探索江苏风土人情，品味江南文化韵味</p>
        
        <div class="header-stats">
          <div class="stat-item" v-for="(stat, index) in statsData" :key="index">
            <div class="stat-icon">
              <component :is="stat.icon" />
            </div>
            <div class="stat-info">
              <span class="stat-number">{{ animatedStats[index] }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="main-content">
      <section class="city-filter-section">
        <div class="filter-header">
          <div class="filter-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3 class="section-title">选择城市</h3>
        </div>
        <div class="city-tabs">
          <button 
            v-for="city in cities" 
            :key="city.name"
            class="city-tab"
            :class="{ active: selectedCity === city.name }"
            @click="selectCity(city.name)"
          >
            <span class="city-icon" v-html="city.icon"></span>
            <span class="city-name">{{ city.name }}</span>
          </button>
        </div>
      </section>

      <transition name="fade" mode="out-in">
        <div :key="selectedCity" class="city-content">
          <section class="attractions-section">
            <div class="section-header">
              <h3 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 21V15H15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 9H9.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M15 9H15.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                热门景点
              </h3>
              <span class="section-desc">探索{{ selectedCity }}最具代表性的旅游胜地</span>
            </div>
            <div class="attractions-grid">
              <div 
                v-for="(attraction, index) in currentCityData.attractions" 
                :key="attraction.id"
                class="attraction-card"
                :style="{ animationDelay: `${index * 0.1}s` }"
                @click="openAttractionDetail(attraction)"
              >
                <div class="card-image">
                  <img :src="attraction.imageUrl" :alt="attraction.name" loading="lazy" @error="handleImageError">
                  <div class="image-overlay">
                    <span class="view-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                        <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      查看详情
                    </span>
                  </div>
                  <div class="card-badge" v-if="attraction.level">{{ attraction.level }}</div>
                </div>
                <div class="card-content">
                  <h4 class="attraction-name">{{ attraction.name }}</h4>
                  <p class="attraction-desc">{{ attraction.description }}</p>
                  <div class="attraction-highlights">
                    <span class="highlight-tag" v-for="(highlight, idx) in attraction.highlights?.slice(0, 3)" :key="idx">
                      {{ highlight }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="activities-section">
            <div class="section-header">
              <h3 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <circle cx="9" cy="9" r="1" fill="currentColor"/>
                  <circle cx="15" cy="9" r="1" fill="currentColor"/>
                </svg>
                玩乐推荐
              </h3>
              <span class="section-desc">体验{{ selectedCity }}特色活动，感受当地风情</span>
            </div>
            <div class="activities-list">
              <div 
                v-for="(activity, index) in currentCityData.activities" 
                :key="activity.id"
                class="activity-card"
                :style="{ animationDelay: `${index * 0.1}s` }"
              >
                <div class="activity-image">
                  <img :src="activity.imageUrl" :alt="activity.name" loading="lazy" @error="handleImageError">
                </div>
                <div class="activity-content">
                  <h4 class="activity-name">{{ activity.name }}</h4>
                  <p class="activity-desc">{{ activity.description }}</p>
                  <div class="activity-meta">
                    <div class="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <span>{{ activity.crowd }}</span>
                    </div>
                    <div class="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                      <span>{{ activity.season }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="food-section">
            <div class="section-header">
              <h3 class="section-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6 1V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M10 1V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M14 1V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                特色美食
              </h3>
              <span class="section-desc">品尝{{ selectedCity }}地道风味，舌尖上的江南</span>
            </div>
            <div class="food-grid">
              <div 
                v-for="(food, index) in currentCityData.foods" 
                :key="food.id"
                class="food-card"
                :style="{ animationDelay: `${index * 0.1}s` }"
                @click="openFoodDetail(food)"
              >
                <div class="food-image">
                  <img :src="food.imageUrl" :alt="food.name" loading="lazy" @error="handleImageError">
                  <div class="food-overlay">
                    <span class="zoom-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 21H3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 3L14 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 21L10 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
                <div class="food-content">
                  <h4 class="food-name">{{ food.name }}</h4>
                  <p class="food-history">{{ food.history }}</p>
                  <div class="food-taste">
                    <span class="taste-label">口味特点：</span>
                    <span class="taste-value">{{ food.taste }}</span>
                  </div>
                  <div class="food-restaurant">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <span>{{ food.restaurant }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </transition>
    </div>

    <el-dialog
      v-model="showAttractionDialog"
      :title="selectedAttraction?.name || '景点详情'"
      width="700px"
      class="detail-dialog"
      destroy-on-close
    >
      <div v-if="selectedAttraction" class="attraction-detail">
        <div class="detail-image">
          <img :src="selectedAttraction.imageUrl" :alt="selectedAttraction.name">
        </div>
        <div class="detail-info">
          <div class="detail-badge" v-if="selectedAttraction.level">{{ selectedAttraction.level }}</div>
          <p class="detail-desc">{{ selectedAttraction.description }}</p>
          <div class="detail-highlights">
            <h4>特色亮点</h4>
            <div class="highlights-list">
              <span v-for="(highlight, idx) in selectedAttraction.highlights" :key="idx" class="highlight-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ highlight }}
              </span>
            </div>
          </div>
          <div class="detail-tips" v-if="selectedAttraction.tips">
            <h4>游览贴士</h4>
            <p>{{ selectedAttraction.tips }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showFoodDialog"
      :title="selectedFood?.name || '美食详情'"
      width="600px"
      class="detail-dialog food-dialog"
      destroy-on-close
    >
      <div v-if="selectedFood" class="food-detail">
        <div class="food-detail-image">
          <img :src="selectedFood.imageUrl" :alt="selectedFood.name">
        </div>
        <div class="food-detail-info">
          <div class="info-section">
            <h4>历史背景</h4>
            <p>{{ selectedFood.history }}</p>
          </div>
          <div class="info-section">
            <h4>口味特点</h4>
            <p>{{ selectedFood.taste }}</p>
          </div>
          <div class="info-section">
            <h4>推荐餐厅</h4>
            <p>{{ selectedFood.restaurant }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <transition name="fade">
      <div class="back-to-top" v-show="showBackTop" @click="scrollToTop">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const selectedCity = ref('南京')
const showAttractionDialog = ref(false)
const selectedAttraction = ref(null)
const showFoodDialog = ref(false)
const selectedFood = ref(null)
const showBackTop = ref(false)

const titleChars = '江苏旅游文化'.split('')

const animatedStats = ref([0, 0, 0])

const statsData = [
  { value: 13, label: '热门城市', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z', stroke: 'currentColor', 'stroke-width': 2 }),
    h('circle', { cx: 12, cy: 10, r: 3, stroke: 'currentColor', 'stroke-width': 2 })
  ])},
  { value: 48, label: '精选景点', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M3 21H21', stroke: 'currentColor', 'stroke-width': 2 }),
    h('path', { d: 'M5 21V7L12 3L19 7V21', stroke: 'currentColor', 'stroke-width': 2 }),
    h('path', { d: 'M9 21V15H15V21', stroke: 'currentColor', 'stroke-width': 2 })
  ])},
  { value: 40, label: '特色美食', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18', stroke: 'currentColor', 'stroke-width': 2 }),
    h('path', { d: 'M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z', stroke: 'currentColor', 'stroke-width': 2 })
  ])}
]

const cities = [
  { 
    name: '南京', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V15H15V21" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '苏州', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '无锡', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '扬州', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/><path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '常州', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9H21M9 21V9" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '镇江', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3C14.5168 6.48693 14.4142 6.73825 14.4142 7C14.4142 7.26175 14.5168 7.51307 14.7 7.7L16.3 9.3C16.4869 9.48324 16.7382 9.58583 17 9.58583C17.2618 9.58583 17.5131 9.48324 17.7 9.3L21.47 5.53" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '南通', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21 16V8C20.9996 7.6493 20.9071 7.3048 20.7315 7.00115C20.556 6.69751 20.3037 6.44279 20 6.26L13 2.26C12.696 2.07719 12.3511 1.98125 12 1.98125C11.6489 1.98125 11.304 2.07719 11 2.26L4 6.26C3.69626 6.44279 3.44398 6.69751 3.26846 7.00115C3.09294 7.3048 3.00036 7.6493 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5572 4 17.74L11 21.74C11.304 21.9228 11.6489 22.0187 12 22.0187C12.3511 22.0187 12.696 21.9228 13 21.74L20 17.74C20.3037 17.5572 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '徐州', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '连云港', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17.5 19H9C7.89543 19 7 18.1046 7 17V7C7 5.89543 7.89543 5 9 5H14.5L17.5 8V19Z" stroke="currentColor" stroke-width="2"/><path d="M14 5V8H17.5" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '淮安', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '盐城', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '泰州', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2"/></svg>'
  },
  { 
    name: '宿迁', 
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3L4 9V21H20V9L12 3Z" stroke="currentColor" stroke-width="2"/><path d="M9 21V12H15V21" stroke="currentColor" stroke-width="2"/></svg>'
  }
]

const cityData = {
  '南京': {
    attractions: [
      {
        id: 1,
        name: '中山陵',
        description: '中山陵是中国近代民主革命先行者孙中山先生的陵寝，位于南京市玄武区紫金山南麓。陵寝建筑依山而建，气势宏伟，从空中俯瞰呈"自由钟"形。整个建筑群融合了中国古代与西方建筑特色，被誉为"中国近代建筑史上第一陵"。',
        highlights: ['紫金山风景区', '392级台阶', '孙中山纪念馆', '音乐台'],
        level: '国家5A级景区',
        tips: '建议清晨或傍晚前往，避开人流高峰。从下往上攀登约需30分钟，请穿着舒适的鞋子。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sun%20Yat-sen%20Mausoleum%20Nanjing%20grand%20stairs%20Chinese%20architecture&image_size=landscape_16_9'
      },
      {
        id: 2,
        name: '夫子庙秦淮河',
        description: '夫子庙秦淮河风光带是南京历史文化荟萃之地，以夫子庙为中心，秦淮河为纽带，包括瞻园、夫子庙、白鹭洲、中华门等景点。夜晚的秦淮河灯火璀璨，游船穿梭，再现了"烟笼寒水月笼沙"的江南水乡风情。',
        highlights: ['秦淮画舫夜游', '江南贡院', '乌衣巷', '秦淮灯会'],
        level: '国家5A级景区',
        tips: '夜晚是最佳游览时间，可乘坐画舫欣赏两岸风光。春节期间的秦淮灯会尤为精彩。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qinhuai%20River%20Nanjing%20night%20lanterns%20traditional%20Chinese%20architecture&image_size=landscape_16_9'
      },
      {
        id: 3,
        name: '明孝陵',
        description: '明孝陵是明朝开国皇帝朱元璋和皇后马氏的合葬陵墓，位于紫金山南麓。陵寝规模宏大，神道两侧石兽、石人雕刻精美，是中国现存最大的帝王陵寝之一，2003年被列入世界文化遗产名录。',
        highlights: ['石象路神道', '梅花山', '明楼', '世界文化遗产'],
        level: '世界文化遗产',
        tips: '春季梅花盛开时最美，建议从下马坊开始，沿神道步行游览。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ming%20Xiaoling%20Tomb%20Nanjing%20stone%20elephant%20road%20imperial&image_size=landscape_16_9'
      },
      {
        id: 4,
        name: '南京总统府',
        description: '南京总统府是中国近代史的重要见证地，曾是太平天国天王府、两江总督署、民国总统府所在地。建筑群既有中国传统园林风格，又融入了西式建筑元素，是了解中国近代历史的绝佳去处。',
        highlights: ['中西合璧建筑', '煦园', '民国史料陈列', '太平天国遗址'],
        level: '国家4A级景区',
        tips: '建议请导游讲解，了解更多历史故事。周一闭馆，请提前规划行程。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Presidential%20Palace%20Chinese%20western%20architecture%20historical&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 1,
        name: '秦淮河夜游',
        description: '乘坐古色古香的画舫，沿秦淮河缓缓前行，欣赏两岸灯火辉煌的古建筑群，聆听江南丝竹，感受"桨声灯影里的秦淮河"的浪漫意境。',
        crowd: '情侣、家庭游客',
        season: '四季皆宜，夏季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qinhuai%20River%20night%20boat%20tour%20lanterns%20romantic&image_size=landscape_16_9'
      },
      {
        id: 2,
        name: '紫金山徒步',
        description: '紫金山是南京的"绿肺"，山峦起伏，林木葱郁。徒步登山可欣赏自然风光，沿途经过中山陵、明孝陵等名胜古迹，是户外运动爱好者的理想选择。',
        crowd: '户外运动爱好者',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Purple%20Mountain%20Nanjing%20hiking%20trail%20nature%20forest&image_size=landscape_16_9'
      },
      {
        id: 3,
        name: '南京博物院文化之旅',
        description: '南京博物院是中国三大博物馆之一，馆藏丰富，涵盖历史、艺术、民俗等多个领域。可深入了解江苏地区的历史文化演变，感受中华文明的博大精深。',
        crowd: '文化爱好者、学生团体',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Museum%20interior%20exhibition%20Chinese%20artifacts&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 1,
        name: '盐水鸭',
        history: '盐水鸭是南京最著名的特产，已有两千五百多年历史。相传在春秋时期，南京地区就开始腌制鸭肉。明清时期，盐水鸭成为宫廷贡品，名声大振。',
        taste: '皮白肉嫩，肥而不腻，咸鲜适中，清香可口',
        restaurant: '推荐：韩复兴、金陵饭店、章云板鸭',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20salted%20duck%20Chinese%20cuisine%20delicious&image_size=landscape_16_9'
      },
      {
        id: 2,
        name: '鸭血粉丝汤',
        history: '鸭血粉丝汤是南京的传统名吃，起源于清末民初。以鸭血、鸭胗、鸭肠、鸭肝等为主料，配以粉丝，是南京人最喜爱的早餐之一。',
        taste: '汤鲜味美，鸭血嫩滑，粉丝爽口，营养丰富',
        restaurant: '推荐：回味鸭血粉丝汤、鸭得堡、小潘记',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Duck%20blood%20vermicelli%20soup%20Nanjing%20street%20food&image_size=landscape_16_9'
      },
      {
        id: 3,
        name: '南京小笼包',
        history: '南京小笼包源于清代，以皮薄馅大、汤汁鲜美著称。与上海小笼包不同，南京小笼包的汤汁更为浓郁，馅料也更为丰富。',
        taste: '皮薄透亮，汤汁鲜美，肉馅鲜嫩，蘸醋更佳',
        restaurant: '推荐：尹氏鸡汁汤包、鸡鸣汤包、刘长兴',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20xiaolongbao%20soup%20dumplings%20steaming%20bamboo&image_size=landscape_16_9'
      },
      {
        id: 4,
        name: '梅花糕',
        history: '梅花糕是南京的传统糕点，因形似梅花而得名。起源于明朝，是江南地区著名的风味小吃，深受老南京人喜爱。',
        taste: '外酥里嫩，甜而不腻，豆沙馅香浓，桂花点缀',
        restaurant: '推荐：左师傅梅花糕、陆氏梅花糕',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Plum%20flower%20cake%20Nanjing%20sweet%20pastry%20traditional&image_size=landscape_16_9'
      }
    ]
  },
  '苏州': {
    attractions: [
      {
        id: 5,
        name: '拙政园',
        description: '拙政园是苏州古典园林的代表作品，被誉为"中国园林之母"。园内以水为中心，山水萦绕，厅榭精美，花木繁茂，具有浓郁的江南水乡特色。1997年被列入世界文化遗产名录。',
        highlights: ['远香堂', '小飞虹', '香洲', '世界文化遗产'],
        level: '世界文化遗产',
        tips: '建议请导游讲解，了解园林设计理念。春秋两季花开时节最美。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Humble%20Administrator%20Garden%20Suzhou%20classical%20Chinese%20garden%20pond&image_size=landscape_16_9'
      },
      {
        id: 6,
        name: '留园',
        description: '留园以建筑艺术精湛著称，园内建筑数量在苏州诸园中居首。园中太湖石"冠云峰"为北宋花石纲遗物，是江南园林中最大的太湖石独峰，极具观赏价值。',
        highlights: ['冠云峰', '五峰仙馆', '涵碧山房', '建筑精品'],
        level: '世界文化遗产',
        tips: '园内建筑精美，建议细细品味每个厅堂的设计巧思。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lingering%20Garden%20Suzhou%20Taihu%20rock%20Chinese%20architecture&image_size=landscape_16_9'
      },
      {
        id: 7,
        name: '虎丘',
        description: '虎丘有"吴中第一名胜"之称，相传春秋时吴王夫差葬其父阖闾于此。虎丘塔是世界第二斜塔，已有千年历史。苏轼曾言"到苏州不游虎丘，乃憾事也"。',
        highlights: ['虎丘塔', '剑池', '千人石', '吴王阖闾墓'],
        level: '国家4A级景区',
        tips: '建议从山门步行上山，沿途欣赏古建筑和摩崖石刻。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tiger%20Hill%20Suzhou%20leaning%20pagoda%20ancient%20Chinese&image_size=landscape_16_9'
      },
      {
        id: 8,
        name: '周庄古镇',
        description: '周庄是江南六大古镇之一，有"中国第一水乡"之美誉。古镇依河成街，桥街相连，深宅大院，重脊高檐，河埠廊坊，过街骑楼，一派古朴幽静的水乡风情。',
        highlights: ['双桥', '沈厅', '张厅', '富安桥'],
        level: '国家5A级景区',
        tips: '建议清晨或傍晚游览，避开人流高峰。可乘坐摇橹船体验水乡风情。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhouzhuang%20water%20town%20canals%20bridges%20traditional&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 4,
        name: '平江路漫步',
        description: '平江路是苏州保存最完整的古街区，沿河而建，青石板路、白墙黛瓦、小桥流水。漫步其间，可感受原汁原味的苏州老城风貌，品尝地道小吃。',
        crowd: '文艺青年、摄影爱好者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pingjiang%20Road%20Suzhou%20ancient%20street%20canal&image_size=landscape_16_9'
      },
      {
        id: 5,
        name: '苏绣体验',
        description: '苏绣是中国四大名绣之一，以精细雅洁著称。在苏州刺绣研究所或古镇绣坊，可亲手体验苏绣技艺，感受针尖上的艺术魅力。',
        crowd: '手工爱好者、文化体验者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20embroidery%20experience%20needle%20work%20traditional&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 5,
        name: '松鼠桂鱼',
        history: '松鼠桂鱼是苏州传统名菜，因形似松鼠而得名。选用太湖桂鱼，经精细刀工处理后油炸，浇上糖醋汁，外酥里嫩，酸甜可口。',
        taste: '外酥里嫩，酸甜可口，形似松鼠，色泽红亮',
        restaurant: '推荐：得月楼、松鹤楼、同得兴',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Squirrel%20mandarin%20fish%20Suzhou%20cuisine%20sweet%20sour&image_size=landscape_16_9'
      },
      {
        id: 6,
        name: '阳澄湖大闸蟹',
        history: '阳澄湖大闸蟹是苏州最著名的水产，以青背、白肚、金爪、黄毛著称。每年秋季，食蟹成为苏州人的重要仪式，"秋风起，蟹脚痒"。',
        taste: '蟹黄肥美，蟹肉鲜甜，膏脂丰腴，回味无穷',
        restaurant: '推荐：阳澄湖莲花岛、巴城蟹庄',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangcheng%20Lake%20hairy%20crab%20steamed%20delicious&image_size=landscape_16_9'
      },
      {
        id: 7,
        name: '苏式月饼',
        history: '苏式月饼是中国月饼的两大流派之一，以酥皮著称。相传起源于唐宋时期，是苏州人中秋佳节必备的传统糕点。',
        taste: '酥皮层次分明，馅料香甜，咸甜皆宜',
        restaurant: '推荐：稻香村、采芝斋、叶受和',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20style%20mooncake%20flaky%20pastry%20traditional&image_size=landscape_16_9'
      }
    ]
  },
  '无锡': {
    attractions: [
      {
        id: 9,
        name: '鼋头渚',
        description: '鼋头渚是太湖风景的精华所在，因巨石突入湖中形状酷似神龟昂首而得名。这里是观赏太湖风光的最佳地点，每年春季樱花盛开，更是美不胜收。',
        highlights: ['太湖仙岛', '樱花谷', '长春桥', '三山映碧'],
        level: '国家5A级景区',
        tips: '春季樱花季是最佳游览时间，建议乘坐游船欣赏太湖全景。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yuantouzhu%20Wuxi%20Taihu%20Lake%20cherry%20blossom&image_size=landscape_16_9'
      },
      {
        id: 10,
        name: '灵山大佛',
        description: '灵山大佛是世界上最高的释迦牟尼青铜立像，高达88米。大佛背靠灵山，面朝太湖，气势恢宏。景区内还有梵宫、五印坛城等佛教建筑，是佛教文化圣地。',
        highlights: ['88米大佛', '梵宫', '九龙灌浴', '五印坛城'],
        level: '国家5A级景区',
        tips: '建议上午前往，可观看九龙灌浴表演。梵宫内部装饰极为精美，不容错过。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lingshan%20Grand%20Buddha%20Wuxi%20giant%20bronze%20statue&image_size=landscape_16_9'
      },
      {
        id: 11,
        name: '惠山古镇',
        description: '惠山古镇是无锡历史文化的重要载体，保存了大量明清古建筑。古镇以惠山泥人、惠山油酥等特产闻名，祠堂群更是中国祠堂文化的集中展示地。',
        highlights: ['惠山泥人博物馆', '寄畅园', '天下第二泉', '祠堂群'],
        level: '国家4A级景区',
        tips: '可品尝惠山油酥，购买惠山泥人作为纪念品。寄畅园是江南名园，值得细细品味。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huishan%20Ancient%20Town%20Wuxi%20traditional%20architecture&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 6,
        name: '太湖游船',
        description: '乘坐游船畅游太湖，欣赏湖光山色，感受"太湖美，美就美在太湖水"的诗意。可远眺鼋头渚、三山仙岛，体验江南水乡的独特魅力。',
        crowd: '家庭游客、摄影爱好者',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Taihu%20Lake%20boat%20tour%20Wuxi%20scenic%20view&image_size=landscape_16_9'
      },
      {
        id: 7,
        name: '惠山泥人制作体验',
        description: '惠山泥人是无锡的国家级非物质文化遗产，以"手捏戏文"和"大阿福"最为著名。在惠山古镇可亲手体验泥人制作，感受传统民间艺术的魅力。',
        crowd: '亲子家庭、手工爱好者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huishan%20clay%20figurine%20making%20Wuxi%20traditional%20craft&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 8,
        name: '无锡排骨',
        history: '无锡排骨是无锡最著名的传统名菜，以三凤桥肉庄最为有名。选用猪肋排，经特殊工艺烹制，色泽酱红，肉质酥烂，甜中带咸。',
        taste: '色泽酱红，肉质酥烂，甜中带咸，回味悠长',
        restaurant: '推荐：三凤桥肉庄、王兴记',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wuxi%20spare%20ribs%20sweet%20sour%20Chinese%20cuisine&image_size=landscape_16_9'
      },
      {
        id: 9,
        name: '无锡小笼包',
        history: '无锡小笼包以皮薄卤多著称，是无锡的传统名点。与上海小笼包不同，无锡小笼包的汤汁更为丰盈，口味偏甜，体现了无锡菜"咸出头，甜收口"的特点。',
        taste: '皮薄卤多，汤汁鲜美，甜而不腻',
        restaurant: '推荐：王兴记、熙盛源、超王记',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wuxi%20xiaolongbao%20soup%20dumplings%20steaming&image_size=landscape_16_9'
      },
      {
        id: 10,
        name: '太湖三白',
        history: '太湖三白指白鱼、白虾、银鱼三种太湖特产，是无锡最具代表性的湖鲜。这三种水产肉质鲜嫩，营养丰富，是品尝太湖风味的必选。',
        taste: '肉质鲜嫩，原汁原味，清淡鲜美',
        restaurant: '推荐：太湖边农家乐、湖滨饭店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Taihu%20three%20whites%20fish%20shrimp%20fresh%20seafood&image_size=landscape_16_9'
      }
    ]
  },
  '扬州': {
    attractions: [
      {
        id: 12,
        name: '瘦西湖',
        description: '瘦西湖是扬州的城市名片，因湖面瘦长而得名。景区内有五亭桥、二十四桥、白塔等著名景点，融南方之秀与北方之雄于一体，是扬州园林的代表。',
        highlights: ['五亭桥', '二十四桥', '白塔', '钓鱼台'],
        level: '国家5A级景区',
        tips: '春季是最佳游览时间，"烟花三月下扬州"名不虚传。建议乘坐游船游览。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Slender%20West%20Lake%20Yangzhou%20five%20pavilion%20bridge&image_size=landscape_16_9'
      },
      {
        id: 13,
        name: '个园',
        description: '个园是扬州最负盛名的园林之一，以竹石为主景。园名取"竹"字半边，园内四季假山各具特色，是中国园林叠山艺术的典范之作。',
        highlights: ['四季假山', '万竹园', '宜雨轩', '抱山楼'],
        level: '全国重点文物保护单位',
        tips: '四季假山是园中精华，建议按春、夏、秋、冬顺序游览，感受四季变化。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ge%20Garden%20Yangzhou%20bamboo%20rock%20garden%20Chinese&image_size=landscape_16_9'
      },
      {
        id: 14,
        name: '大明寺',
        description: '大明寺始建于南朝，因唐代高僧鉴真曾在此任住持而闻名。寺内有鉴真纪念堂、栖灵塔、平山堂等景点，是集佛教文化、历史人文于一体的名胜。',
        highlights: ['鉴真纪念堂', '栖灵塔', '平山堂', '天下第五泉'],
        level: '全国重点文物保护单位',
        tips: '登栖灵塔可俯瞰扬州城全景，平山堂是欧阳修任扬州太守时所建。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Daming%20Temple%20Yangzhou%20ancient%20Buddhist%20temple%20pagoda&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 8,
        name: '扬州早茶体验',
        description: '扬州早茶是扬州文化的重要组成部分，"早上皮包水"说的就是扬州人吃早茶的习惯。在百年老店品尝蟹黄汤包、翡翠烧卖、千层油糕等经典点心，感受扬州慢生活。',
        crowd: '美食爱好者、文化体验者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20morning%20tea%20dim%20sum%20traditional%20breakfast&image_size=landscape_16_9'
      },
      {
        id: 9,
        name: '古运河夜游',
        description: '扬州古运河是京杭大运河的重要组成部分，夜游古运河可欣赏两岸灯火璀璨的古建筑，感受"运河之都"的历史韵味。',
        crowd: '情侣、家庭游客',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20ancient%20canal%20night%20tour%20illuminated&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 11,
        name: '扬州炒饭',
        history: '扬州炒饭又名扬州蛋炒饭，是扬州最著名的传统美食。相传起源于隋朝，后经不断改良，成为享誉海内外的经典中式炒饭。',
        taste: '米粒分明，配料丰富，色彩缤纷，鲜香可口',
        restaurant: '推荐：扬州迎宾馆、富春茶社',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20fried%20rice%20colorful%20eggs%20shrimp%20Chinese&image_size=landscape_16_9'
      },
      {
        id: 12,
        name: '蟹黄汤包',
        history: '蟹黄汤包是扬州早茶的招牌点心，以皮薄汤多著称。选用阳澄湖大闸蟹的蟹黄蟹肉为馅，汤汁鲜美，是秋季扬州必尝美食。',
        taste: '皮薄如纸，汤汁丰盈，蟹黄鲜美，入口即化',
        restaurant: '推荐：冶春茶社、富春茶社、锦春',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Crab%20roe%20soup%20dumpling%20Yangzhou%20steaming%20delicious&image_size=landscape_16_9'
      },
      {
        id: 13,
        name: '狮子头',
        history: '狮子头是扬州传统名菜，因形似狮头而得名。相传始于隋朝，是淮扬菜的代表菜品之一。选用肥瘦相间的猪肉，手工斩剁，口感细嫩。',
        taste: '肉质细嫩，肥而不腻，入口即化，汤汁鲜美',
        restaurant: '推荐：扬州迎宾馆、富春茶社',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lion%27s%20head%20meatball%20Yangzhou%20braised%20pork&image_size=landscape_16_9'
      }
    ]
  },
  '常州': {
    attractions: [
      {
        id: 15,
        name: '中华恐龙园',
        description: '中华恐龙园是集科普、游乐、演艺于一体的主题公园，被誉为"东方侏罗纪"。园内有各类恐龙化石、机械恐龙，以及刺激的游乐设施，是亲子游的理想目的地。',
        highlights: ['恐龙博物馆', '穿越侏罗纪', '鲁布拉湾', '梦幻庄园'],
        level: '国家5A级景区',
        tips: '建议安排一整天时间，提前查看表演时间表，错峰游玩热门项目。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=China%20Dinosaur%20Park%20Changzhou%20theme%20park%20T-Rex&image_size=landscape_16_9'
      },
      {
        id: 16,
        name: '天目湖',
        description: '天目湖是常州溧阳的著名风景区，湖水清澈，群山环抱。景区内有山水园、南山竹海等景点，是休闲度假的好去处。天目湖砂锅鱼头更是远近闻名。',
        highlights: ['山水园', '南山竹海', '御水温泉', '砂锅鱼头'],
        level: '国家5A级景区',
        tips: '建议住一晚，体验御水温泉。品尝天目湖砂锅鱼头不可错过。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tianmu%20Lake%20Changzhou%20scenic%20lake%20mountains&image_size=landscape_16_9'
      },
      {
        id: 17,
        name: '淹城春秋乐园',
        description: '淹城春秋乐园是以春秋时期淹城遗址为核心建设的主题公园。淹城遗址是中国保存最完整的春秋时期地面城池遗址，三城三河相套的建筑形制世界罕见。',
        highlights: ['淹城遗址', '春秋王宫', '诸子百家', '编钟乐舞'],
        level: '国家4A级景区',
        tips: '可观看大型实景演出《淹城春秋》，了解春秋历史文化。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yancheng%20Spring%20Autumn%20Park%20Changzhou%20ancient%20city&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 10,
        name: '南山竹海徒步',
        description: '南山竹海位于天目湖畔，拥有3.5万亩翠竹，是华东地区最大的竹海之一。漫步竹林间，感受"竹径通幽处"的禅意，呼吸清新的空气，是放松身心的绝佳选择。',
        crowd: '户外爱好者、养生人群',
        season: '四季皆宜，夏季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanshan%20Bamboo%20Sea%20Changzhou%20hiking%20trail%20green&image_size=landscape_16_9'
      },
      {
        id: 11,
        name: '御水温泉体验',
        description: '御水温泉位于南山竹海景区内，是华东地区最具特色的竹海温泉。温泉水取自地下千米，富含多种矿物质，在竹林间泡汤，感受天人合一的美妙。',
        crowd: '养生人群、情侣',
        season: '秋冬季节最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yushui%20Hot%20Spring%20bamboo%20forest%20spa%20relaxing&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 14,
        name: '天目湖砂锅鱼头',
        history: '天目湖砂锅鱼头是常州溧阳的招牌美食，选用天目湖野生大花鲢鱼头，配以天目湖水炖煮而成。汤色乳白，鱼肉鲜嫩，是江苏省非物质文化遗产。',
        taste: '汤色乳白，鱼肉鲜嫩，汤鲜味美，营养丰富',
        restaurant: '推荐：天目湖宾馆、砂锅鱼头大酒店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tianmu%20Lake%20fish%20head%20soup%20clay%20pot%20white&image_size=landscape_16_9'
      },
      {
        id: 15,
        name: '常州大麻糕',
        history: '常州大麻糕是常州的传统名点，已有150多年历史。以面粉、芝麻、白糖为原料，经烘烤而成，外皮酥脆，内馅香甜，是常州人喜爱的早餐点心。',
        taste: '外皮酥脆，芝麻香浓，内馅甜软，回味悠长',
        restaurant: '推荐：常州糕团店、马复兴',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Changzhou%20sesame%20cake%20pastry%20traditional%20breakfast&image_size=landscape_16_9'
      },
      {
        id: 16,
        name: '加蟹小笼包',
        history: '加蟹小笼包是常州的传统名点，在普通小笼包的基础上加入蟹黄蟹肉，味道更加鲜美。皮薄汁多，蟹香四溢，是常州早茶的必点点心。',
        taste: '皮薄汁多，蟹黄鲜美，肉馅细嫩，蘸醋更佳',
        restaurant: '推荐：迎桂馒头店、常州糕团店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Changzhou%20crab%20xiaolongbao%20soup%20dumpling%20steaming&image_size=landscape_16_9'
      }
    ]
  },
  '镇江': {
    attractions: [
      {
        id: 18,
        name: '金山寺',
        description: '金山寺是镇江最著名的佛教寺庙，因《白蛇传》中"水漫金山"的故事而闻名遐迩。寺庙依山而建，殿宇层叠，金碧辉煌，是江南佛教圣地之一。',
        highlights: ['慈寿塔', '法海洞', '白龙洞', '江天禅寺'],
        level: '国家4A级景区',
        tips: '可登慈寿塔俯瞰长江，了解白蛇传说与金山寺的渊源。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jinshan%20Temple%20Zhenjiang%20Buddhist%20temple%20Yangtze&image_size=landscape_16_9'
      },
      {
        id: 19,
        name: '北固山',
        description: '北固山是镇江三山之一，以险峻著称。山上有甘露寺、多景楼等古迹，是三国时期刘备招亲故事的发生地。登临北固楼，可俯瞰长江壮阔景色。',
        highlights: ['甘露寺', '北固楼', '多景楼', '试剑石'],
        level: '国家4A级景区',
        tips: '北固楼是观赏长江日落的最佳地点，辛弃疾曾在此写下千古名句。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beigu%20Mountain%20Zhenjiang%20Yangtze%20River%20view%20ancient&image_size=landscape_16_9'
      },
      {
        id: 20,
        name: '西津渡古街',
        description: '西津渡是镇江保存最完好的古街区，有着千年历史。古街依山而建，青石板路蜿蜒而上，两侧是明清风格的建筑，是感受镇江历史文化的绝佳去处。',
        highlights: ['昭关石塔', '英国领事馆旧址', '蒜山', '救生会'],
        level: '国家4A级景区',
        tips: '可品尝锅盖面、蟹黄汤包等镇江美食，购买镇江香醋作为伴手礼。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xijindu%20Ancient%20Street%20Zhenjiang%20stone%20steps%20traditional&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 12,
        name: '镇江三山联游',
        description: '镇江三山指金山、焦山、北固山，各有特色。金山以佛教文化著称，焦山以碑林闻名，北固山以三国故事吸引游客。三山联游可全面了解镇江的历史文化。',
        crowd: '历史文化爱好者',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20three%20mountains%20Yangtze%20River%20scenic%20view&image_size=landscape_16_9'
      },
      {
        id: 13,
        name: '醋文化博物馆参观',
        description: '镇江是中国醋都，镇江香醋是国家地理标志产品。在醋文化博物馆可了解香醋的酿造工艺，品尝不同年份的香醋，感受醋文化的独特魅力。',
        crowd: '文化体验者、美食爱好者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20vinegar%20museum%20traditional%20brewing%20culture&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 17,
        name: '锅盖面',
        history: '锅盖面是镇江的传统面食，因煮面时将小锅盖漂在大锅里而得名。面条筋道，汤汁鲜美，配料丰富，是镇江最具代表性的早餐。',
        taste: '面条筋道，汤汁鲜美，配料丰富，回味无穷',
        restaurant: '推荐：宴春酒楼、大华面馆',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20pot%20lid%20noodles%20broth%20toppings%20traditional&image_size=landscape_16_9'
      },
      {
        id: 18,
        name: '镇江肴肉',
        history: '镇江肴肉又名水晶肉蹄，是镇江的传统名菜。选用猪蹄膀，经腌制、炖煮、冷却而成，肉质晶莹剔透，肥而不腻，配以镇江香醋食用更佳。',
        taste: '晶莹剔透，肥而不腻，肉质细嫩，蘸醋更香',
        restaurant: '推荐：宴春酒楼、镇江大酒店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20crystal%20pork%20trotter%20jelly%20meat&image_size=landscape_16_9'
      },
      {
        id: 19,
        name: '蟹黄汤包',
        history: '镇江蟹黄汤包与扬州蟹黄汤包齐名，是镇江的传统名点。选用长江蟹的蟹黄蟹肉为馅，皮薄汤多，蟹香四溢，是秋季必尝美食。',
        taste: '皮薄汤多，蟹黄鲜美，汤汁丰盈，入口即化',
        restaurant: '推荐：宴春酒楼、毕士荣',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20crab%20soup%20dumpling%20steaming%20bamboo&image_size=landscape_16_9'
      }
    ]
  },
  '南通': {
    attractions: [
      {
        id: 21,
        name: '濠河风景区',
        description: '濠河是国内仅存的四条古护城河之一，环绕南通老城区，全长10公里。河水清澈，两岸绿树成荫，古迹众多。夜游濠河可欣赏两岸灯火璀璨的古建筑，感受"城在水中坐，人在画中游"的诗意。',
        highlights: ['千年护城河', '夜游濠河', '濠河博物馆', '珠算博物馆'],
        level: '国家5A级景区',
        tips: '夜晚是最佳游览时间，可乘坐游船环城游览，全程约1小时。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Haohe%20River%20Nantong%20night%20scenery%20ancient%20city&image_size=landscape_16_9'
      },
      {
        id: 22,
        name: '狼山风景区',
        description: '狼山是佛教八小名山之首，海拔109米，虽不高峻，却因佛教文化而闻名。山上有广教寺、支云塔等古迹，登顶可俯瞰长江入海口，是南通的城市名片。',
        highlights: ['广教寺', '支云塔', '长江入海口', '佛教名山'],
        level: '国家4A级景区',
        tips: '建议清晨登山，可欣赏长江日出。每年农历七月三十的庙会最为热闹。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Langshan%20Mountain%20Nantong%20Buddhist%20temple%20Yangtze&image_size=landscape_16_9'
      },
      {
        id: 23,
        name: '南通博物苑',
        description: '南通博物苑是中国第一座公共博物馆，由近代著名实业家张謇于1905年创办。馆藏文物丰富，包括历史文物、自然标本等，是了解南通历史文化的最佳去处。',
        highlights: ['中国第一座博物馆', '张謇创办', '历史文物', '自然标本'],
        level: '全国重点文物保护单位',
        tips: '建议请导游讲解，了解张謇的实业救国故事。周一闭馆。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nantong%20Museum%20first%20public%20museum%20China%20historic&image_size=landscape_16_9'
      },
      {
        id: 24,
        name: '如皋水绘园',
        description: '水绘园是明末清初江南才子冒辟疆与秦淮八艳董小宛栖隐之处，被誉为"天下名园"。园内水景如画，建筑精巧，是研究明清园林艺术的重要实物。',
        highlights: ['冒辟疆董小宛故居', '明清园林', '水景如画', '才子佳人'],
        level: '全国重点文物保护单位',
        tips: '可了解冒辟疆与董小宛的爱情故事，园内的昆曲表演值得一看。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shuihui%20Garden%20Rugao%20Chinese%20garden%20water&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 14,
        name: '濠河夜游',
        description: '乘坐画舫夜游濠河，欣赏两岸灯火璀璨的古建筑，聆听南通地方戏曲，感受千年护城河的独特魅力。游船全程约10公里，途经多座古桥和历史遗迹。',
        crowd: '情侣、家庭游客',
        season: '四季皆宜，夏季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Haohe%20River%20night%20boat%20tour%20Nantong%20illuminated&image_size=landscape_16_9'
      },
      {
        id: 15,
        name: '蓝印花布体验',
        description: '南通是中国蓝印花布之乡，在二甲镇蓝印花布博物馆可亲手体验蓝印花布的制作过程，感受这项国家级非物质文化遗产的独特魅力。',
        crowd: '手工爱好者、亲子家庭',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Blue%20calico%20printing%20Nantong%20traditional%20craft&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 20,
        name: '南通跳面',
        history: '南通跳面又称曹公面，是南通的传统面食。因制作时面团需反复摔打跳跃而得名。面条筋道爽滑，配以鲜美的浇头，是南通人最爱的早餐。',
        taste: '面条筋道，汤鲜味美，浇头丰富，回味悠长',
        restaurant: '推荐：四宜糕团店、南通大饭店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nantong%20jumping%20noodles%20traditional%20breakfast%20delicious&image_size=landscape_16_9'
      },
      {
        id: 21,
        name: '如皋火腿',
        history: '如皋火腿与金华火腿、宣威火腿并称中国三大火腿，已有千年历史。选用当地优质猪后腿，经传统工艺腌制而成，色泽红润，香气浓郁。',
        taste: '色泽红润，香气浓郁，肉质细嫩，咸鲜适口',
        restaurant: '推荐：如皋火腿厂直销店、当地特产店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Rugao%20ham%20Chinese%20cured%20meat%20traditional&image_size=landscape_16_9'
      },
      {
        id: 22,
        name: '西亭脆饼',
        history: '西亭脆饼是南通通州区的传统名点，已有百年历史。以面粉、芝麻、白糖为原料，经十八道工序制成，层次分明，酥脆香甜。',
        taste: '层次分明，酥脆可口，芝麻香浓，甜而不腻',
        restaurant: '推荐：西亭脆饼厂、南通特产店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiting%20crisp%20cake%20Nantong%20sesame%20pastry&image_size=landscape_16_9'
      }
    ]
  },
  '徐州': {
    attractions: [
      {
        id: 25,
        name: '云龙湖风景区',
        description: '云龙湖是徐州的城市名片，三面环山，一面临城。湖面开阔，波光粼粼，沿湖有云龙山、汉画像石艺术馆、苏轼纪念馆等景点，是徐州最美的风景名胜区。',
        highlights: ['云龙山', '汉画像石艺术馆', '苏轼纪念馆', '水上运动'],
        level: '国家5A级景区',
        tips: '可乘船游湖，也可登山远眺。春季湖边樱花盛开，景色宜人。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yunlong%20Lake%20Xuzhou%20scenic%20mountain%20water&image_size=landscape_16_9'
      },
      {
        id: 26,
        name: '汉文化景区',
        description: '徐州是汉高祖刘邦的故乡，汉文化景区以狮子山楚王陵为核心，包括汉兵马俑、汉画像石等汉代遗迹。这里是了解汉代历史文化的绝佳去处，被誉为"两汉文化看徐州"。',
        highlights: ['楚王陵', '汉兵马俑', '汉画像石', '汉代历史'],
        level: '国家4A级景区',
        tips: '建议请导游讲解，了解汉代历史。楚王陵地宫值得一看。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Han%20Culture%20Scenic%20Area%20Xuzhou%20terracotta%20warriors&image_size=landscape_16_9'
      },
      {
        id: 27,
        name: '徐州博物馆',
        description: '徐州博物馆是了解徐州历史文化的最佳去处，馆藏文物丰富，尤以汉代文物著称。馆内陈列的金缕玉衣、汉兵马俑等珍贵文物，展现了徐州作为两汉文化发源地的深厚底蕴。',
        highlights: ['金缕玉衣', '汉兵马俑', '汉代玉器', '历史陈列'],
        level: '国家一级博物馆',
        tips: '周一闭馆，建议预留2-3小时参观时间。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20Museum%20Han%20dynasty%20artifacts%20jade%20suit&image_size=landscape_16_9'
      },
      {
        id: 28,
        name: '彭祖园',
        description: '彭祖园是为纪念彭祖而建的公园，彭祖是中国传说中的长寿始祖，相传活了八百岁。园内有彭祖祠、彭祖井等遗迹，是徐州重要的历史文化景点。',
        highlights: ['彭祖祠', '彭祖井', '长寿文化', '园林景观'],
        level: '国家4A级景区',
        tips: '可了解彭祖养生文化，园内还有动物园和游乐设施。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pengzu%20Park%20Xuzhou%20longevity%20culture%20Chinese%20garden&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 16,
        name: '汉文化体验',
        description: '在汉文化景区可体验穿汉服、学汉礼、写汉隶等活动，深入了解汉代文化。还可观看汉代歌舞表演，感受大汉雄风。',
        crowd: '文化爱好者、学生团体',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Han%20culture%20experience%20Xuzhou%20Hanfu%20costume&image_size=landscape_16_9'
      },
      {
        id: 17,
        name: '云龙山登山',
        description: '云龙山是徐州的城市绿肺，山上有大士岩、放鹤亭等古迹。登山可俯瞰云龙湖全景，是市民休闲健身的好去处。',
        crowd: '户外运动爱好者',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yunlong%20Mountain%20hiking%20Xuzhou%20temple%20view&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 23,
        name: '徐州地锅鸡',
        history: '地锅鸡是徐州的传统名菜，起源于微山湖地区渔民的家常菜。以土鸡为主料，配以面饼同锅烹制，鸡肉鲜嫩，面饼吸满汤汁，风味独特。',
        taste: '鸡肉鲜嫩，汤汁浓郁，面饼劲道，香辣可口',
        restaurant: '推荐：老徐州地锅鸡、地锅居',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20clay%20pot%20chicken%20traditional%20Chinese%20cuisine&image_size=landscape_16_9'
      },
      {
        id: 24,
        name: '徐州把子肉',
        history: '把子肉是徐州的传统名菜，选用五花肉切成大块，用草绳捆扎，经长时间炖煮而成。肉质酥烂，肥而不腻，是徐州人最爱的家常菜。',
        taste: '肉质酥烂，肥而不腻，酱香浓郁，入口即化',
        restaurant: '推荐：老街把子肉、徐州大饭店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20bazi%20meat%20braised%20pork%20belly%20traditional&image_size=landscape_16_9'
      },
      {
        id: 25,
        name: '饣它汤',
        history: '饣它汤是徐州的传统早餐，相传起源于彭祖时代。以老母鸡、猪骨等熬制汤底，加入麦仁、面筋等，汤汁浓郁，营养丰富。',
        taste: '汤汁浓郁，营养丰富，鲜香可口，暖胃养身',
        restaurant: '推荐：马市街饣它汤、老徐州早餐店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20Sha%20soup%20traditional%20breakfast%20noodles&image_size=landscape_16_9'
      }
    ]
  },
  '连云港': {
    attractions: [
      {
        id: 29,
        name: '花果山',
        description: '花果山是《西游记》中孙悟空的老家，是连云港最著名的景点。山上有水帘洞、三元宫、玉女峰等景点，处处可见与《西游记》相关的文化元素，是感受西游文化的最佳去处。',
        highlights: ['水帘洞', '玉女峰', '三元宫', '西游文化'],
        level: '国家5A级景区',
        tips: '建议乘坐景区观光车上山，步行下山。山顶可俯瞰黄海。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huaguo%20Mountain%20Lianyungang%20Waterfall%20Cave%20Monkey&image_size=landscape_16_9'
      },
      {
        id: 30,
        name: '连岛海滨浴场',
        description: '连岛是江苏省最大的海岛，通过跨海大桥与大陆相连。岛上沙滩细软，海水清澈，是江苏最佳的海滨度假胜地。夏季可游泳、沙滩排球，冬季可观海听涛。',
        highlights: ['细软沙滩', '清澈海水', '海上日出', '海鲜美食'],
        level: '国家4A级景区',
        tips: '夏季是最佳游玩季节，注意防晒。可品尝新鲜海鲜。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Liandao%20Island%20beach%20Lianyungang%20Yellow%20Sea&image_size=landscape_16_9'
      },
      {
        id: 31,
        name: '渔湾风景区',
        description: '渔湾以瀑布、潭水著称，被誉为"江苏的九寨沟"。景区内瀑布众多，潭水清澈，峡谷幽深，是夏季避暑戏水的绝佳去处。',
        highlights: ['龙王瀑布', '三龙潭', '峡谷风光', '避暑胜地'],
        level: '国家4A级景区',
        tips: '夏季最佳，可戏水消暑。穿防滑鞋，注意安全。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yuwan%20Waterfall%20Lianyungang%20canyon%20scenic&image_size=landscape_16_9'
      },
      {
        id: 32,
        name: '孔望山',
        description: '孔望山因孔子登临望海而得名，山上有东汉摩崖造像，是中国最早的佛教造像之一，比敦煌莫高窟还早200多年，具有重要的历史艺术价值。',
        highlights: ['东汉摩崖造像', '孔子望海处', '佛教艺术', '历史遗迹'],
        level: '全国重点文物保护单位',
        tips: '摩崖造像是重点，建议请导游讲解其历史价值。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kongwang%20Mountain%20Lianyungang%20Buddhist%20carvings&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 18,
        name: '海滨度假',
        description: '连岛海滨浴场是江苏最佳的海滨度假地，可游泳、沙滩排球、海上摩托艇等。清晨可观海上日出，傍晚可漫步沙滩，感受海风拂面。',
        crowd: '家庭游客、情侣',
        season: '夏季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Liandao%20beach%20vacation%20summer%20activities%20sea&image_size=landscape_16_9'
      },
      {
        id: 19,
        name: '西游文化体验',
        description: '在花果山可体验西游文化，参观水帘洞、三元宫等景点，观看猴群嬉戏，感受《西游记》的神奇魅力。景区内还有西游主题表演。',
        crowd: '亲子家庭、文化爱好者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Journey%20to%20the%20West%20culture%20Huaguo%20Mountain%20monkeys&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 26,
        name: '连云港海鲜',
        history: '连云港濒临黄海，海鲜资源丰富。梭子蟹、对虾、鲍鱼、海参等海鲜应有尽有，以新鲜著称。在连岛海鲜大排档可品尝最地道的海鲜。',
        taste: '新鲜肥美，原汁原味，种类丰富，鲜甜可口',
        restaurant: '推荐：连岛海鲜大排档、墟沟海鲜市场',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lianyungang%20seafood%20crab%20shrimp%20fresh&image_size=landscape_16_9'
      },
      {
        id: 27,
        name: '花果山风鹅',
        history: '花果山风鹅是连云港的传统特产，选用当地优质鹅，经传统工艺腌制风干而成。肉质紧实，香味浓郁，是馈赠亲友的佳品。',
        taste: '肉质紧实，香味浓郁，咸鲜适口，回味悠长',
        restaurant: '推荐：花果山特产店、当地超市',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huaguo%20Mountain%20dried%20goose%20Lianyungang%20specialty&image_size=landscape_16_9'
      },
      {
        id: 28,
        name: '板浦凉粉',
        history: '板浦凉粉是连云港板浦镇的传统小吃，以绿豆淀粉为原料制成，晶莹剔透，爽滑可口，是夏季消暑佳品。',
        taste: '晶莹剔透，爽滑可口，清凉解暑，调料丰富',
        restaurant: '推荐：板浦镇老街、连云港小吃街',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Banpu%20jelly%20noodles%20Lianyungang%20cold%20dish&image_size=landscape_16_9'
      }
    ]
  },
  '淮安': {
    attractions: [
      {
        id: 33,
        name: '周恩来故里',
        description: '周恩来故里包括周恩来纪念馆、周恩来故居等景点，是缅怀一代伟人的圣地。纪念馆展示了周恩来总理波澜壮阔的一生，故居保留了总理童年生活的场景。',
        highlights: ['周恩来纪念馆', '周恩来故居', '驸马巷', '伟人故里'],
        level: '国家5A级景区',
        tips: '建议预留半天时间参观，周一闭馆。可深入了解周总理的生平事迹。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhou%20Enlai%20Memorial%20Huaian%20former%20residence&image_size=landscape_16_9'
      },
      {
        id: 34,
        name: '河下古镇',
        description: '河下古镇是淮安历史文化的重要载体，有2500多年历史，是明清时期漕运重镇。古镇保存了大量明清建筑，是《西游记》作者吴承恩的故乡。',
        highlights: ['吴承恩故居', '明清古街', '漕运文化', '古镇风貌'],
        level: '国家4A级景区',
        tips: '可参观吴承恩故居，了解《西游记》创作背景。古镇小吃值得品尝。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Hexia%20Ancient%20Town%20Huaian%20traditional%20street&image_size=landscape_16_9'
      },
      {
        id: 35,
        name: '淮安府署',
        description: '淮安府署是中国现存规模最大的古代府级官衙，始建于明代，是了解古代官衙文化的绝佳去处。府署建筑宏伟，布局严谨，展现了明清时期的建筑艺术。',
        highlights: ['古代官衙', '明代建筑', '府衙文化', '历史陈列'],
        level: '全国重点文物保护单位',
        tips: '可了解古代官衙的运作方式，建筑保存完好。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huaian%20Prefecture%20Office%20ancient%20government%20building&image_size=landscape_16_9'
      },
      {
        id: 36,
        name: '洪泽湖',
        description: '洪泽湖是中国第四大淡水湖，湖面辽阔，烟波浩渺。湖边有洪泽湖大堤，是世界上最长最古老的人工大堤，有"水上长城"之称。',
        highlights: ['洪泽湖大堤', '水上长城', '湖鲜美食', '湿地风光'],
        level: '国家4A级景区',
        tips: '可品尝洪泽湖大闸蟹，秋季最佳。大堤骑行是不错的体验。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Hongze%20Lake%20Huaian%20wetland%20scenic%20water&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 20,
        name: '运河文化之旅',
        description: '淮安是京杭大运河的重要节点，可乘船游览古运河，参观清江浦、里运河等运河遗迹，感受千年运河文化的独特魅力。',
        crowd: '历史文化爱好者',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Grand%20Canal%20Huaian%20boat%20tour%20ancient%20waterway&image_size=landscape_16_9'
      },
      {
        id: 21,
        name: '淮扬菜体验',
        description: '淮安是淮扬菜的发源地之一，可在当地餐馆学习制作软兜长鱼、平桥豆腐等经典淮扬菜，感受中国四大菜系之一的独特魅力。',
        crowd: '美食爱好者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huaiyang%20cuisine%20cooking%20class%20Huaian%20food&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 29,
        name: '软兜长鱼',
        history: '软兜长鱼是淮扬菜的经典名菜，选用淮安特产长鱼（黄鳝），经精细烹制而成。因鳝鱼形似腰带，故称"软兜"，是国宴名菜。',
        taste: '鳝鱼鲜嫩，汤汁浓郁，软糯可口，回味悠长',
        restaurant: '推荐：淮安宾馆、老淮安饭店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ruandou%20eel%20Huaian%20Huaiyang%20cuisine%20delicious&image_size=landscape_16_9'
      },
      {
        id: 30,
        name: '平桥豆腐',
        history: '平桥豆腐是淮扬菜的代表菜品之一，起源于淮安平桥镇。以嫩豆腐为主料，配以鸡肉、火腿、香菇等，汤汁鲜美，豆腐嫩滑。',
        taste: '豆腐嫩滑，汤汁鲜美，配料丰富，入口即化',
        restaurant: '推荐：平桥豆腐馆、淮安宾馆',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pingqiao%20tofu%20Huaian%20soup%20Huaiyang%20cuisine&image_size=landscape_16_9'
      },
      {
        id: 31,
        name: '淮安茶馓',
        history: '淮安茶馓是淮安的传统名点，已有百年历史。以面粉为原料，经油炸而成，形似金条，酥脆可口，是馈赠亲友的佳品。',
        taste: '酥脆可口，香气浓郁，形似金条，入口即化',
        restaurant: '推荐：淮安特产店、老街茶馓店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huaian%20tea%20san%20fried%20dough%20traditional%20snack&image_size=landscape_16_9'
      }
    ]
  },
  '盐城': {
    attractions: [
      {
        id: 37,
        name: '中华麋鹿园',
        description: '中华麋鹿园是世界上最大的麋鹿自然保护区，拥有世界上最多的麋鹿种群。这里可近距离观赏麋鹿，了解这一珍稀物种的保护历程。',
        highlights: ['麋鹿观赏', '湿地生态', '自然保护区', '科普教育'],
        level: '国家5A级景区',
        tips: '建议乘坐观光车游览，可近距离观赏麋鹿。春秋两季最佳。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20Milu%20Deer%20Park%20Yancheng%20wildlife%20nature&image_size=landscape_16_9'
      },
      {
        id: 38,
        name: '丹顶鹤湿地',
        description: '盐城丹顶鹤湿地是世界上最大的丹顶鹤越冬地，每年冬季有上千只丹顶鹤在此栖息。湿地风光优美，是观鸟和生态旅游的绝佳去处。',
        highlights: ['丹顶鹤观赏', '湿地风光', '生态旅游', '观鸟胜地'],
        level: '世界自然遗产',
        tips: '冬季是观鸟最佳季节，建议携带望远镜。注意保护生态环境。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Red%20crowned%20crane%20wetland%20Yancheng%20birds%20nature&image_size=landscape_16_9'
      },
      {
        id: 39,
        name: '大纵湖',
        description: '大纵湖是苏北里下河地区最大的湖泊，湖水清澈，芦苇荡漾。景区内有水上迷宫、芦苇荡漂流等项目，是休闲度假的好去处。',
        highlights: ['水上迷宫', '芦苇荡', '湖鲜美食', '水上运动'],
        level: '国家4A级景区',
        tips: '夏季可体验芦苇荡漂流，品尝湖鲜美食。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dazong%20Lake%20Yancheng%20reed%20marshes%20water&image_size=landscape_16_9'
      },
      {
        id: 40,
        name: '荷兰花海',
        description: '荷兰花海是以郁金香为主题的花卉景区，种植了数百万株郁金香。每年春季花海盛开，五彩缤纷，是江苏最美的赏花胜地之一。',
        highlights: ['郁金香花海', '四季花展', '婚纱摄影', '亲子乐园'],
        level: '国家4A级景区',
        tips: '春季是最佳观赏季节，建议周末前往，人流量较大。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dutch%20Flower%20Sea%20Yancheng%20tulips%20colorful%20garden&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 22,
        name: '湿地观鸟',
        description: '盐城拥有太平洋西海岸最大的滨海湿地，是观鸟爱好者的天堂。每年冬季可观赏丹顶鹤、东方白鹳等珍稀鸟类，感受大自然的神奇魅力。',
        crowd: '摄影爱好者、自然爱好者',
        season: '冬季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wetland%20bird%20watching%20Yancheng%20cranes%20nature&image_size=landscape_16_9'
      },
      {
        id: 23,
        name: '麋鹿亲近体验',
        description: '在中华麋鹿园可乘坐观光车进入麋鹿散养区，近距离观赏麋鹿的生活状态，了解这一"四不像"动物的神奇故事。',
        crowd: '亲子家庭、动物爱好者',
        season: '春秋两季最佳',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Milu%20deer%20safari%20Yancheng%20wildlife%20experience&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 32,
        name: '盐城八大碗',
        history: '盐城八大碗是盐城传统宴席的代表，包括红烧肉、红烧鱼、炖蛋等八道菜。是盐城人婚丧嫁娶、逢年过节的必备菜肴，体现了盐城人的热情好客。',
        taste: '菜式丰富，口味地道，分量十足，乡土风味',
        restaurant: '推荐：盐城八大碗饭店、当地农家乐',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yancheng%20eight%20bowls%20traditional%20feast%20Chinese%20cuisine&image_size=landscape_16_9'
      },
      {
        id: 33,
        name: '东台鱼汤面',
        history: '东台鱼汤面是盐城东台的传统名吃，以鲜鱼熬制汤底，面条筋道，汤汁鲜美，是盐城人最爱的早餐之一。',
        taste: '汤汁乳白，鲜美可口，面条筋道，营养丰富',
        restaurant: '推荐：东台老街鱼汤面、东台宾馆',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dongtai%20fish%20soup%20noodles%20Yancheng%20breakfast&image_size=landscape_16_9'
      },
      {
        id: 34,
        name: '阜宁大糕',
        history: '阜宁大糕是盐城阜宁的传统名点，已有数百年历史。以糯米粉、白糖为原料，经多道工序制成，口感绵软，是春节馈赠亲友的佳品。',
        taste: '口感绵软，甜而不腻，层次分明，入口即化',
        restaurant: '推荐：阜宁大糕厂、盐城特产店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt/Funing%20rice%20cake%20Yancheng%20traditional%20pastry&image_size=landscape_16_9'
      }
    ]
  },
  '泰州': {
    attractions: [
      {
        id: 41,
        name: '溱潼古镇',
        description: '溱潼古镇是泰州著名的水乡古镇，有"苏中第一小镇"之称。古镇保存了大量明清建筑，以溱潼会船节闻名，每年清明时节的会船表演是国家级非物质文化遗产。',
        highlights: ['溱潼会船节', '明清古街', '山茶花王', '水乡风情'],
        level: '国家4A级景区',
        tips: '清明节期间可观看会船表演，场面壮观。古镇小吃值得品尝。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qintong%20Ancient%20Town%20Taizhou%20water%20town%20traditional&image_size=landscape_16_9'
      },
      {
        id: 42,
        name: '凤城河风景区',
        description: '凤城河是泰州的护城河，环绕老城区，沿河有望海楼、桃园、梅园等景点。夜游凤城河可欣赏两岸灯火璀璨的古建筑，感受泰州的历史韵味。',
        highlights: ['望海楼', '桃园', '梅园', '夜游凤城河'],
        level: '国家4A级景区',
        tips: '夜晚是最佳游览时间，可乘坐画舫欣赏两岸风光。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Fengcheng%20River%20Taizhou%20night%20scenery%20ancient&image_size=landscape_16_9'
      },
      {
        id: 43,
        name: '梅兰芳纪念馆',
        description: '梅兰芳纪念馆是为纪念京剧大师梅兰芳而建，展示了梅兰芳的艺术生涯和爱国情怀。馆内陈列了大量珍贵照片和实物，是了解京剧文化的好去处。',
        highlights: ['京剧大师', '艺术生涯', '珍贵照片', '京剧文化'],
        level: '全国重点文物保护单位',
        tips: '可了解梅兰芳的艺术成就和爱国故事，周一闭馆。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Mei%20Lanfang%20Memorial%20Taizhou%20Peking%20Opera%20museum&image_size=landscape_16_9'
      },
      {
        id: 44,
        name: '溱湖湿地公园',
        description: '溱湖湿地公园是江苏著名的湿地公园，湖泊、河流、沼泽交织，生态环境优越。公园内有麋鹿、丹顶鹤等珍稀动物，是生态旅游的好去处。',
        highlights: ['湿地生态', '麋鹿观赏', '水上森林', '生态旅游'],
        level: '国家5A级景区',
        tips: '可乘坐游船游览湿地，观赏麋鹿和鸟类。春秋两季最佳。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qinhu%20Wetland%20Park%20Taizhou%20nature%20water&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 24,
        name: '溱潼会船节',
        description: '溱潼会船节是国家级非物质文化遗产，每年清明节期间举行。数百艘船只汇聚溱湖，进行会船表演，场面壮观，是体验泰州民俗文化的最佳时机。',
        crowd: '文化爱好者、摄影爱好者',
        season: '清明节期间',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Qintong%20boat%20festival%20Taizhou%20traditional%20performance&image_size=landscape_16_9'
      },
      {
        id: 25,
        name: '泰州早茶体验',
        description: '泰州早茶是泰州文化的重要组成部分，"早上皮包水"是泰州人的生活方式。在老街茶社品尝鱼汤面、蟹黄汤包、烫干丝等经典点心，感受泰州慢生活。',
        crowd: '美食爱好者、文化体验者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Taizhou%20morning%20tea%20dim%20sum%20traditional%20breakfast&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 35,
        name: '泰州早茶',
        history: '泰州早茶是泰州独特的饮食文化，与扬州早茶齐名。包括鱼汤面、蟹黄汤包、烫干丝等多种点心，是泰州人社交休闲的重要方式。',
        taste: '品种丰富，口味鲜美，精致细腻，回味悠长',
        restaurant: '推荐：古月楼、会宾楼、泰州老街',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Taizhou%20morning%20tea%20fish%20soup%20noodles%20dumplings&image_size=landscape_16_9'
      },
      {
        id: 36,
        name: '靖江蟹黄汤包',
        history: '靖江蟹黄汤包是泰州靖江的传统名点，以皮薄汤多著称。选用长江蟹的蟹黄蟹肉为馅，汤汁鲜美，是秋季必尝美食。',
        taste: '皮薄如纸，汤汁丰盈，蟹黄鲜美，入口即化',
        restaurant: '推荐：南园宾馆、靖江蟹黄汤包店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jingjiang%20crab%20soup%20dumpling%20Taizhou%20delicious&image_size=landscape_16_9'
      },
      {
        id: 37,
        name: '黄桥烧饼',
        history: '黄桥烧饼是泰兴黄桥镇的特产，因黄桥决战而闻名。烧饼外酥里嫩，层次分明，是泰州的传统名点。',
        taste: '外酥里嫩，层次分明，香气浓郁，咸甜皆宜',
        restaurant: '推荐：黄桥烧饼店、泰州特产店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huangqiao%20sesame%20cake%20Taizhou%20traditional%20pastry&image_size=landscape_16_9'
      }
    ]
  },
  '宿迁': {
    attractions: [
      {
        id: 45,
        name: '项王故里',
        description: '项王故里是西楚霸王项羽的出生地，是中国最大的楚汉文化景区。景区内有项羽雕像、霸王鼎、虞姬园等景点，展现了楚汉争霸的历史风云。',
        highlights: ['项羽雕像', '霸王鼎', '虞姬园', '楚汉文化'],
        level: '国家4A级景区',
        tips: '可观看楚汉文化表演，了解项羽的传奇一生。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiang%20Wang%20Gu%20Li%20Suqian%20Xiang%20Yu%20statue%20Chu%20culture&image_size=landscape_16_9'
      },
      {
        id: 46,
        name: '洪泽湖湿地',
        description: '洪泽湖湿地是宿迁的生态名片，湖泊、河流、芦苇荡交织，生态环境优越。可乘船游览湿地，观赏候鸟，品尝湖鲜。',
        highlights: ['湿地生态', '候鸟观赏', '芦苇荡', '湖鲜美食'],
        level: '国家4A级景区',
        tips: '秋季是观鸟最佳季节，可品尝洪泽湖大闸蟹。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Hongze%20Lake%20wetland%20Suqian%20reed%20marshes&image_size=landscape_16_9'
      },
      {
        id: 47,
        name: '三台山国家森林公园',
        description: '三台山国家森林公园是宿迁的城市绿肺，森林覆盖率高达98%。公园内有衲田花海、天和塔、镜湖等景点，是休闲度假的好去处。',
        highlights: ['衲田花海', '天和塔', '镜湖', '森林氧吧'],
        level: '国家4A级景区',
        tips: '春季花海盛开最美，可登塔俯瞰全景。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Santai%20Mountain%20Suqian%20flower%20field%20forest%20park&image_size=landscape_16_9'
      },
      {
        id: 48,
        name: '洋河酒厂',
        description: '洋河酒厂是中国著名的白酒生产企业，洋河大曲是江苏名酒。可参观酒厂，了解白酒酿造工艺，品尝洋河美酒。',
        highlights: ['白酒酿造', '洋河大曲', '酒文化', '品酒体验'],
        level: '工业旅游示范点',
        tips: '可购买正宗洋河酒，了解白酒酿造工艺。',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yanghe%20Distillery%20Suqian%20Chinese%20liquor%20factory&image_size=landscape_16_9'
      }
    ],
    activities: [
      {
        id: 26,
        name: '楚汉文化体验',
        description: '在项王故里可穿楚服、学楚礼、观看楚汉争霸表演，深入了解楚汉文化，感受项羽的英雄气概。',
        crowd: '文化爱好者、学生团体',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chu%20Han%20culture%20experience%20Suqian%20costume%20performance&image_size=landscape_16_9'
      },
      {
        id: 27,
        name: '洋河酒文化之旅',
        description: '参观洋河酒厂，了解白酒酿造的传统工艺，品尝不同年份的洋河美酒，感受中国酒文化的独特魅力。',
        crowd: '酒文化爱好者',
        season: '四季皆宜',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yanghe%20wine%20culture%20tour%20Suqian%20tasting%20liquor&image_size=landscape_16_9'
      }
    ],
    foods: [
      {
        id: 38,
        name: '宿迁膘鸡',
        history: '宿迁膘鸡是宿迁的传统名菜，选用当地土鸡，经特殊工艺烹制而成。鸡肉鲜嫩，汤汁浓郁，是宿迁人逢年过节的必备菜肴。',
        taste: '鸡肉鲜嫩，汤汁浓郁，香气扑鼻，回味悠长',
        restaurant: '推荐：宿迁宾馆、当地农家乐',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suqian%20chicken%20traditional%20dish%20Chinese%20cuisine&image_size=landscape_16_9'
      },
      {
        id: 39,
        name: '黄狗猪头肉',
        history: '黄狗猪头肉是宿迁泗阳的传统名吃，因创始人绰号"黄狗"而得名。选用新鲜猪头，经传统工艺卤制，肉质酥烂，香味浓郁。',
        taste: '肉质酥烂，香味浓郁，肥而不腻，入口即化',
        restaurant: '推荐：泗阳黄狗猪头肉店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suqian%20braised%20pork%20head%20traditional%20meat&image_size=landscape_16_9'
      },
      {
        id: 40,
        name: '车轮饼',
        history: '车轮饼是宿迁的传统糕点，因形似车轮而得名。以面粉、芝麻、白糖为原料，外酥里嫩，甜而不腻，是宿迁人喜爱的点心。',
        taste: '外酥里嫩，甜而不腻，芝麻香浓，层次分明',
        restaurant: '推荐：宿迁老街、当地糕点店',
        imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suqian%20wheel%20cake%20traditional%20pastry%20sesame&image_size=landscape_16_9'
      }
    ]
  }
}

const currentCityData = computed(() => {
  return cityData[selectedCity.value] || cityData['南京']
})

function selectCity(city) {
  selectedCity.value = city
}

function openAttractionDetail(attraction) {
  selectedAttraction.value = attraction
  showAttractionDialog.value = true
}

function openFoodDetail(food) {
  selectedFood.value = food
  showFoodDialog.value = true
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23f5f5f5" width="400" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  showBackTop.value = window.scrollY > 300
}

function animateStats() {
  statsData.forEach((stat, index) => {
    const target = stat.value
    const duration = 2000
    const startTime = Date.now()
    
    function update() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      animatedStats.value[index] = Math.floor(target * easeOut)
      
      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }
    
    update()
  })
}

onMounted(() => {
  animateStats()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
:root {
  --primary-color: #221e1a;
  --accent-color: #8b1538;
  --accent-light: #c9a962;
  --accent-gradient: linear-gradient(135deg, #8b1538 0%, #6f1632 100%);
  --background-color: #f7f4ef;
  --card-bg: rgba(255, 255, 255, 0.84);
  --text-color: #23201c;
  --light-text: #6f6961;
  --border-color: rgba(31, 24, 20, 0.08);
  --sidebar-bg: rgba(255, 255, 255, 0.72);
  --shadow-sm: 0 8px 24px rgba(20, 16, 12, 0.05);
  --shadow-md: 0 16px 48px rgba(20, 16, 12, 0.08);
  --shadow-lg: 0 24px 72px rgba(20, 16, 12, 0.12);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
}

.culture-library-container {
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba(201, 169, 98, 0.10), transparent 34%),
    linear-gradient(180deg, #fbfaf7 0%, var(--background-color) 100%);
  font-family: 'Noto Serif SC', 'Source Han Serif SC', '微软雅黑', Arial, sans-serif;
  color: var(--text-color);
  padding-top: 70px;
  position: relative;
  overflow-x: hidden;
}

.page-header {
  background: var(--accent-gradient);
  color: white;
  padding: 88px 0 110px;
  position: relative;
  overflow: hidden;
}

.page-header::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(20, 12, 14, 0.12), rgba(20, 12, 14, 0.28));
}

.header-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/background5.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.header-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 0;
}

.header-wave svg {
  width: 100%;
  height: 80px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.header-icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 24px;
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: rippleOut 2.8s ease-out infinite;
  will-change: transform, opacity;
}

.ring-1 {
  width: 100px;
  height: 100px;
  animation-delay: 0s;
  border-width: 2px;
}

.ring-2 {
  width: 130px;
  height: 130px;
  animation-delay: 0.9s;
  border-width: 1.5px;
}

.ring-3 {
  width: 160px;
  height: 160px;
  animation-delay: 1.8s;
  border-width: 1px;
}

@keyframes rippleOut {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .icon-ring {
    animation: none;
    opacity: 0.3;
  }
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(12px);
  position: relative;
  z-index: 2;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.header-icon svg {
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 4px;
}

.title-char {
  display: inline-block;
  animation: charFadeIn 0.6s ease forwards;
  opacity: 0;
}

@keyframes charFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  letter-spacing: 2px;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, background 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.city-filter-section {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-lg);
  margin-bottom: 30px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(14px);
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--accent-color);
}

.filter-icon {
  width: 36px;
  height: 36px;
  background: var(--accent-gradient);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--primary-color);
}

.section-title svg {
  color: var(--accent-color);
}

.city-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.city-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--sidebar-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  color: var(--text-color);
}

.city-tab:hover {
  background: #fff5f5;
  border-color: rgba(192, 12, 0, 0.3);
}

.city-tab.active {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.city-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.city-icon :deep(svg) {
  color: currentColor;
}

.city-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.attractions-section,
.activities-section,
.food-section {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-md);
  margin-bottom: 30px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.section-desc {
  font-size: 14px;
  color: var(--light-text);
}

.attractions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.attraction-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  border: 1px solid rgba(30, 58, 95, 0.1);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.attraction-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  border-color: rgba(201, 169, 98, 0.3);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.attraction-card:hover .card-image img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(192, 12, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.attraction-card:hover .image-overlay {
  opacity: 1;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-size: 14px;
  padding: 10px 20px;
  border: 2px solid white;
  border-radius: 30px;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: white;
  color: var(--accent-color);
}

.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #C9A962, #FFD700);
  color: #0F172A;
  font-size: 12px;
  font-weight: 600;
  border-radius: 20px;
  z-index: 1;
}

.card-content {
  padding: 20px;
}

.attraction-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1E293B;
}

.attraction-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #64748B;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.attraction-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.highlight-tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #1E3A5F;
  font-size: 12px;
  border-radius: 20px;
  border: 1px solid rgba(30, 58, 95, 0.1);
}

.activities-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.activity-card {
  display: flex;
  gap: 16px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  border: 1px solid rgba(30, 58, 95, 0.1);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}

.activity-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12);
  border-color: rgba(201, 169, 98, 0.3);
}

.activity-image {
  width: 140px;
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 12px;
  margin: 12px;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.activity-card:hover .activity-image img {
  transform: scale(1.1);
}

.activity-content {
  flex: 1;
  padding: 16px 16px 16px 0;
  display: flex;
  flex-direction: column;
}

.activity-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #1E293B;
}

.activity-desc {
  font-size: 13px;
  line-height: 1.5;
  color: #64748B;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.activity-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.activity-meta .meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748B;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid rgba(30, 58, 95, 0.1);
}

.activity-meta .meta-item svg {
  color: #C9A962;
  opacity: 0.8;
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.food-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  border: 1px solid rgba(30, 58, 95, 0.1);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
}

.food-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  border-color: rgba(201, 169, 98, 0.3);
}

.food-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.food-card:hover .food-image img {
  transform: scale(1.1);
}

.food-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 58, 95, 0.4) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.food-card:hover .food-overlay {
  opacity: 1;
}

.zoom-icon {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E3A5F;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.food-card:hover .zoom-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.food-content {
  padding: 20px;
}

.food-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1E293B;
}

.food-history {
  font-size: 13px;
  line-height: 1.5;
  color: #64748B;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.food-taste {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
}

.taste-label {
  font-size: 12px;
  color: #64748B;
  font-weight: 500;
}

.taste-value {
  font-size: 12px;
  color: #1E3A5F;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid rgba(30, 58, 95, 0.1);
}

.food-restaurant {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748B;
  background: #f1f5f9;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid rgba(30, 58, 95, 0.1);
}

.food-restaurant svg {
  color: #C9A962;
  flex-shrink: 0;
}

.detail-dialog :deep(.el-dialog__header) {
  background: var(--accent-gradient);
  color: white;
  padding: 20px;
  margin-right: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.detail-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.attraction-detail {
  padding: 24px;
}

.detail-image {
  width: 100%;
  height: 300px;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 20px;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  padding: 0;
}

.detail-badge {
  display: inline-block;
  padding: 6px 16px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 16px;
}

.detail-desc {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text-color);
  margin: 0 0 20px 0;
}

.detail-highlights h4,
.detail-tips h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--primary-color);
}

.highlights-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  color: var(--accent-color);
  font-size: 13px;
  border-radius: 20px;
}

.highlight-item svg {
  flex-shrink: 0;
}

.detail-tips {
  background: var(--sidebar-bg);
  padding: 16px;
  border-radius: var(--radius-sm);
}

.detail-tips p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--light-text);
  margin: 0;
}

.food-detail {
  padding: 24px;
}

.food-detail-image {
  width: 100%;
  height: 250px;
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 20px;
}

.food-detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-detail-info .info-section {
  margin-bottom: 16px;
}

.food-detail-info .info-section:last-child {
  margin-bottom: 0;
}

.food-detail-info h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--accent-color);
}

.food-detail-info p {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  margin: 0;
}

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: var(--accent-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  z-index: 100;
  border: 1px solid rgba(255,255,255,.18);
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1200px) {
  .attractions-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .activities-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 60px 0 82px;
  }
  
  .page-title {
    font-size: 28px;
    letter-spacing: 2px;
  }
  
  .page-subtitle {
    font-size: 14px;
  }
  
  .header-stats {
    flex-direction: column;
    gap: 16px;
  }
  
  .stat-item {
    width: 100%;
    justify-content: center;
  }
  
  .city-tabs {
    justify-content: center;
  }
  
  .city-tab {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .attractions-grid,
  .food-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-card {
    flex-direction: column;
  }
  
  .activity-image {
    width: 100%;
    height: 150px;
  }
  
  .activity-content {
    padding: 16px;
  }
  
  .detail-image,
  .food-detail-image {
    height: 200px;
  }
  
  .back-to-top {
    bottom: 20px;
    right: 20px;
  }
}
</style>
