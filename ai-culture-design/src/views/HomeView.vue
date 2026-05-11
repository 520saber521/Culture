<template>
  <div class="home-container">
    <!-- 轮播图 -->
    <section class="carousel-section" ref="carouselSectionRef">
      <el-carousel 
        ref="carouselRef"
        :interval="5000" 
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



    <!-- 江苏文化概览 -->
    <section class="culture-overview-section">
      <div class="overview-container">
        <!-- 装饰背景 -->
        <div class="section-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
        
        <!-- 标题区域 -->
        <div class="section-header">
          <div class="header-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>文化概览</span>
          </div>
          <h2 class="section-title">
            <span class="title-text">江苏文化瑰宝</span>
            <span class="title-line"></span>
          </h2>
          <p class="section-subtitle">江苏，这片人杰地灵的土地，孕育了璀璨的文化遗产和深厚的历史底蕴</p>
        </div>
        
        <!-- 文化数据统计 -->
        <div class="culture-stats">
          <div class="stat-card">
            <div class="stat-icon heritage">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">1200+</span>
              <span class="stat-label">非遗项目</span>
              <span class="stat-description">包括国家级、省级和市级非遗项目</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon attraction">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">400+</span>
              <span class="stat-label">文化景点</span>
              <span class="stat-description">涵盖历史古迹、文化场馆和自然景观</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon food">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18" stroke="currentColor" stroke-width="2"/>
                <path d="M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">200+</span>
              <span class="stat-label">特色美食</span>
              <span class="stat-description">传承千年的饮食文化精髓</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon famous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="stat-content">
              <span class="stat-value">300+</span>
              <span class="stat-label">历史名人</span>
              <span class="stat-description">在历史长河中留下璀璨印记的杰出人物</span>
            </div>
          </div>
        </div>
        
        <!-- 特色文化推荐 -->
        <div class="culture-highlights">
          <h3 class="highlights-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/>
            </svg>
            江苏文化精粹
          </h3>
          <div class="highlights-grid">
            <div class="highlight-card">
              <div class="highlight-image">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20classical%20garden%20traditional%20Chinese%20architecture&image_size=landscape_16_9" alt="苏州园林">
              </div>
              <div class="highlight-content">
                <h4>苏州园林</h4>
                <p>中国古典园林的杰出代表，以其精巧的设计和深厚的文化内涵闻名于世</p>
              </div>
            </div>
            <div class="highlight-card">
              <div class="highlight-image">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20traditional%20Chinese%20silk%20weaving&image_size=landscape_16_9" alt="南京云锦">
              </div>
              <div class="highlight-content">
                <h4>南京云锦</h4>
                <p>中国四大名锦之一，以其精湛的工艺和华丽的图案著称</p>
              </div>
            </div>
            <div class="highlight-card">
              <div class="highlight-image">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20traditional%20Chinese%20performance&image_size=landscape_16_9" alt="昆曲">
              </div>
              <div class="highlight-content">
                <h4>昆曲</h4>
                <p>中国最古老的戏曲剧种之一，被誉为"百戏之祖"</p>
              </div>
            </div>
            <div class="highlight-card">
              <div class="highlight-image">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20lacquerware%20traditional%20Chinese%20craft&image_size=landscape_16_9" alt="扬州漆器">
              </div>
              <div class="highlight-content">
                <h4>扬州漆器</h4>
                <p>中国传统工艺的瑰宝，以其精湛的髹漆技艺和华丽的装饰图案闻名</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 江苏地图 - 高德地图 -->
    <section class="features-section" ref="featuresSectionRef" :class="{ 'visible': featuresVisible }">
      <div class="features-container">
        <!-- 装饰背景 -->
        <div class="section-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
        
        <!-- 标题区域 -->
        <div class="section-header">
          <div class="header-badge">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>互动探索</span>
          </div>
          <h2 class="section-title">
            <span class="title-text">江苏文化地图</span>
            <span class="title-line"></span>
          </h2>
          <p class="section-subtitle">点击城市标记，探索十三市丰富的文化遗产与历史底蕴</p>
        </div>
        
        <!-- 地图主体 -->
        <div class="jiangsu-map-container">
          <div class="map-wrapper">
            <!-- 地图容器 -->
            <div class="amap-container" ref="amapContainerRef">
              <!-- 地图加载状态 -->
              <div class="map-loading" v-if="mapLoading">
                <div class="loading-content">
                  <div class="loading-spinner"></div>
                  <p>地图加载中...</p>
                  <p class="loading-hint">正在连接高德地图服务</p>
                </div>
              </div>
              <!-- 地图加载错误 -->
              <div class="map-error" v-if="mapError">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="#C00C00"/>
                </svg>
                <p class="error-title">地图加载失败</p>
                <p class="error-detail">{{ mapError }}</p>
                <p class="error-hint" v-if="mapError.includes('USERKEY') || mapError.includes('平台')">
                  请确保API密钥服务平台已选择"Web端(JS API)"
                </p>
                <button class="retry-btn" @click="retryLoadMap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  重新加载
                </button>
              </div>
            </div>
            
            <!-- 地图图例 -->
            <div class="map-legend-amap" v-if="mapInitialized">
              <div class="legend-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>图例</span>
              </div>
              <div class="legend-items">
                <div class="legend-item">
                  <span class="legend-dot capital"></span>
                  <span>省会城市</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot city"></span>
                  <span>地级市</span>
                </div>
              </div>
            </div>
            
            <!-- 地图提示 -->
            <div class="map-hint" v-if="mapInitialized && !selectedCity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>点击城市标记查看详情</span>
            </div>
          </div>
          
          <!-- 城市信息面板 -->
          <transition name="slide-fade">
            <div class="city-info-panel" v-if="selectedCity">
              <div class="panel-header">
                <div class="city-banner">
                  <img
                    class="city-banner-image"
                    :src="getCityBannerImage(selectedCity)"
                    :alt="cityInfo[selectedCity].name"
                    @error="handleCityBannerError(selectedCity)"
                  >
                  <div class="banner-overlay"></div>
                  <div class="city-banner-content">
                    <span class="banner-kicker">Jiangsu Cultural Atlas</span>
                    <h3>{{ cityInfo[selectedCity].name }}</h3>
                    <p>{{ cityInfo[selectedCity].highlight }}</p>
                  </div>
                </div>
                <div class="city-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="url(#cityGradient)"/>
                    <circle cx="12" cy="9" r="2.5" fill="white"/>
                  </svg>
                </div>
                <div class="city-header-text">
                  <h3>{{ cityInfo[selectedCity].name }}</h3>
                  <div class="city-tags-row">
                    <span class="city-tag capital-tag" v-if="selectedCity === 'nanjing'">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                      </svg>
                      省会城市
                    </span>
                    <span class="city-tag location-tag">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ cityInfo[selectedCity].location }}
                    </span>
                  </div>
                </div>
                <button class="close-btn" @click="selectedCity = null">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              
              <div class="panel-body">
                <div class="panel-intro">
                  <div class="city-highlight-banner" v-if="cityInfo[selectedCity].highlight">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FFD700"/>
                    </svg>
                    <span>{{ cityInfo[selectedCity].highlight }}</span>
                  </div>
                  <p class="city-description">{{ cityInfo[selectedCity].description }}</p>
                </div>

                <div class="stats-card">
                  <div class="city-stats">
                    <div class="stat-card">
                      <div class="stat-icon heritage">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                      <div class="stat-content">
                        <span class="stat-value">{{ cityInfo[selectedCity].stats.heritage }}</span>
                        <span class="stat-label">非遗项目</span>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon attraction">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                          <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                      <div class="stat-content">
                        <span class="stat-value">{{ cityInfo[selectedCity].stats.attractions }}</span>
                        <span class="stat-label">热门景点</span>
                      </div>
                    </div>
                    <div class="stat-card">
                      <div class="stat-icon food">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18" stroke="currentColor" stroke-width="2"/>
                          <path d="M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                      <div class="stat-content">
                        <span class="stat-value">{{ cityInfo[selectedCity].stats.food }}</span>
                        <span class="stat-label">特色美食</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="panel-tags">
                  <div class="culture-section">
                    <h4>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      特色文化
                    </h4>
                    <div class="culture-tags">
                      <span class="culture-tag" v-for="(item, index) in cityInfo[selectedCity].culture" :key="index">{{ item }}</span>
                    </div>
                  </div>

                  <div class="highlight-section">
                    <h4>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      热门景点
                    </h4>
                    <div class="highlight-list">
                      <span class="highlight-item" v-for="(item, index) in cityInfo[selectedCity].topAttractions" :key="index">{{ item }}</span>
                    </div>
                  </div>

                  <div class="highlight-section food-section">
                    <h4>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M18 8H19C20.0609 8 21.0783 8.42143 21.8284 9.17157C22.5786 9.92172 23 10.9391 23 12C23 13.0609 22.5786 14.0783 21.8284 14.8284C21.0783 15.5786 20.0609 16 19 16H18" stroke="currentColor" stroke-width="2"/>
                        <path d="M2 8H18V17C18 18.0609 17.5786 19.0783 16.8284 19.8284C16.0783 20.5786 15.0609 21 14 21H6C4.93913 21 3.92172 20.5786 3.17157 19.8284C2.42143 19.0783 2 18.0609 2 17V8Z" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      特色美食
                    </h4>
                    <div class="highlight-list">
                      <span class="highlight-item food" v-for="(item, index) in cityInfo[selectedCity].topFood" :key="index">{{ item }}</span>
                    </div>
                  </div>

                  <div class="famous-section" v-if="cityInfo[selectedCity].famousPeople">
                    <h4>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      历史名人
                    </h4>
                    <div class="famous-list">
                      <span class="famous-item" v-for="(person, index) in cityInfo[selectedCity].famousPeople" :key="index">{{ person }}</span>
                    </div>
                  </div>
                </div>

                <div class="action-buttons">
                  <button class="explore-btn" @click="goToCulture">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    探索文化元素
                  </button>
                  <button class="design-btn" @click="goToDesign">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 22V12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    AI创意设计
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- 最新动态 -->
    <section class="news-section" ref="newsSectionRef" :class="{ 'visible': newsVisible }">
      <div class="news-container">
        <!-- 标题区域 -->
        <div class="news-header">
          <div class="header-decoration">
            <span class="decoration-line"></span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#C00C00"/>
            </svg>
            <span class="decoration-line"></span>
          </div>
          <h2 class="news-section-title">文化动态</h2>
          <p class="news-section-subtitle">洞察江苏文化脉动，连接遗产保护、学术研究与当代生活方式的前沿现场</p>

          <div class="news-hero-strip">
            <div class="news-hero-card">
              <span class="hero-card-label">年度焦点</span>
              <strong>非遗展示、城市更新、国际传播</strong>
              <p>从展陈现场到公共空间，文化叙事正在以更精致的方式抵达公众视野。</p>
            </div>
            <div class="news-hero-metrics">
              <div class="metric-item">
                <span class="metric-value">13</span>
                <span class="metric-label">设区市联动</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">80+</span>
                <span class="metric-label">重点活动追踪</span>
              </div>
              <div class="metric-item">
                <span class="metric-value">365</span>
                <span class="metric-label">全年持续更新</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="news-featured-block" v-if="newsList.length">
          <div class="featured-card" :style="{ backgroundImage: `url(${newsList[0].image || '/background.png'})` }">
            <div class="featured-overlay"></div>
            <div class="featured-content">
              <span class="featured-tag">深度推荐</span>
              <h3>{{ newsList[0].title }}</h3>
              <p>{{ newsList[0].summary }}</p>
              <div class="featured-meta">
                <span>{{ newsList[0].category || '文化资讯' }}</span>
                <span>{{ newsList[0].date }}</span>
                <span v-if="newsList[0].views">{{ newsList[0].views }}</span>
              </div>
            </div>
          </div>
          <div class="featured-side-copy">
            <h4>以更高标准呈现文化价值</h4>
            <p>
              我们将新闻资讯从“信息展示”升级为“内容体验”——通过更克制的版式、更有质感的层次、
              更具编辑感的语言，强化文化传播的专业性与品牌辨识度。
            </p>
            <ul>
              <li>聚焦重大活动、展览发布与学术观察</li>
              <li>突出时间、热度与文化类型的多维信息</li>
              <li>以简洁而深刻的表达建立高级阅读节奏</li>
            </ul>
          </div>
        </div>
        
        <!-- 新闻网格 -->
        <div class="news-grid">
          <article class="news-item" v-for="(news, index) in newsList" :key="index">
            <div class="news-image-wrapper">
              <div class="news-image">
                <img :src="news.image || '/background.png'" :alt="news.title">
              </div>
              <div class="news-category">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 9H21" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 21V9" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ news.category || '文化资讯' }}
              </div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <span class="news-date">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ news.date }}
                </span>
                <span class="news-views" v-if="news.views">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12S4 4 12 4S23 12 23 12S20 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ news.views }}
                </span>
                <span class="news-author" v-if="news.author">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  {{ news.author }}
                </span>
                <span class="news-source" v-if="news.source">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 7H17" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 12H17" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 17H13" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ news.source }}
                </span>
              </div>
              <h3 class="news-title">{{ news.title }}</h3>
              <p class="news-summary">{{ news.summary }}</p>
              <div class="news-video" v-if="news.video">
                <video controls :src="news.video" class="news-video-player">
                  您的浏览器不支持视频播放。
                </video>
              </div>
              <div class="news-gallery" v-if="news.gallery && news.gallery.length">
                <div class="gallery-grid">
                  <img v-for="(img, gIndex) in news.gallery" :key="gIndex" :src="img" :alt="news.title + ' 图片 ' + (gIndex + 1)" class="gallery-item">
                </div>
              </div>
              <ul class="news-points" v-if="news.points && news.points.length">
                <li v-for="(point, pIndex) in news.points" :key="pIndex">{{ point }}</li>
              </ul>
              <div class="news-footer">
                <button class="news-link">
                  <span>阅读全文</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </article>
        </div>
        
        <!-- 查看更多按钮 -->
        <div class="news-more">
          <button class="more-btn">
            <span>查看更多资讯</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onUpdated, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { initMap, createLabelMarker, createMarkerLayer, destroyMap, isMapLoaded } from '@/utils/amap'
import { newsApi } from '@/utils/api/news'
import { heritageApi } from '@/utils/api/heritage'

const router = useRouter()
const footerRef = ref(null)
const carouselSectionRef = ref(null)
const featuresSectionRef = ref(null)
const newsSectionRef = ref(null)
const amapContainerRef = ref(null)
const amapInstance = ref(null)
const amapRef = ref(null)
const cityMarkers = ref([])
const mapLoading = ref(false)
const mapError = ref(null)
const mapInitialized = ref(false)

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

// 视频背景HTML
const videoBackgroundHtml = ref(`<video class="carousel-bg-video" autoplay muted loop playsinline><source src="${import.meta.env.BASE_URL}Homepagebackgroundvideo1.mp4" type="video/mp4">您的浏览器不支持视频播放。</video>`)

// 内容区域的动画状态
const featuresVisible = ref(false)
const newsVisible = ref(false)

// 地图相关
const selectedCity = ref(null)
const hoverCity = ref(null)

const cityCoordinates = {
  nanjing: { lng: 118.796877, lat: 32.060255, isCapital: true },
  suzhou: { lng: 120.585316, lat: 31.299379, isCapital: false },
  wuxi: { lng: 120.31191, lat: 31.49117, isCapital: false },
  changzhou: { lng: 119.97413, lat: 31.811226, isCapital: false },
  zhenjiang: { lng: 119.425736, lat: 32.187849, isCapital: false },
  yangzhou: { lng: 119.421003, lat: 32.393159, isCapital: false },
  taizhou: { lng: 119.915176, lat: 32.484882, isCapital: false },
  nantong: { lng: 120.894291, lat: 31.980171, isCapital: false },
  lianyungang: { lng: 119.221611, lat: 34.596653, isCapital: false },
  huaian: { lng: 119.113185, lat: 33.551052, isCapital: false },
  suqian: { lng: 118.275162, lat: 33.963008, isCapital: false },
  xuzhou: { lng: 117.284124, lat: 34.204568, isCapital: false },
  yancheng: { lng: 120.163561, lat: 33.347382, isCapital: false }
}

const cityInfo = ref({
  nanjing: {
    name: '南京',
    location: '江苏省西南部',
    highlight: '六朝古都，天下文枢',
    description: '南京是江苏省省会，历史悠久，文化底蕴深厚，是中国四大古都之一。六朝古都的深厚历史积淀，孕育了丰富的文化遗产。',
    culture: ['南京云锦', '南京剪纸', '南京白局', '秦淮灯会', '南京金箔', '金陵刻经'],
    stats: {
      heritage: 145,
      attractions: 48,
      food: 32
    },
    topAttractions: ['中山陵', '夫子庙', '明孝陵', '总统府'],
    topFood: ['盐水鸭', '鸭血粉丝汤', '小笼包', '梅花糕'],
    famousPeople: ['王羲之', '曹雪芹', '李白', '朱元璋'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20city%20skyline%20ancient%20architecture&image_size=landscape_16_9'
  },
  suzhou: {
    name: '苏州',
    location: '江苏省东南部',
    highlight: '人间天堂，园林之城',
    description: '苏州是江南水乡的代表城市，以园林艺术和丝绸产业闻名于世。"上有天堂，下有苏杭"的美誉流传千年。',
    culture: ['苏州园林', '苏州评弹', '苏绣', '昆曲', '桃花坞木版年画', '苏州缂丝'],
    stats: {
      heritage: 178,
      attractions: 52,
      food: 28
    },
    topAttractions: ['拙政园', '留园', '虎丘', '周庄古镇'],
    topFood: ['松鼠桂鱼', '阳澄湖大闸蟹', '苏式月饼', '碧螺春'],
    famousPeople: ['唐伯虎', '文征明', '范仲淹', '顾炎武'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20classical%20garden%20water%20town&image_size=landscape_16_9'
  },
  wuxi: {
    name: '无锡',
    location: '江苏省南部',
    highlight: '太湖明珠，鱼米之乡',
    description: '无锡是太湖之滨的城市，工商业发达，文化遗产丰富。素有"太湖明珠"之称。',
    culture: ['惠山泥人', '无锡精微绣', '无锡道教音乐', '锡剧', '宜兴紫砂', '无锡留青竹刻'],
    stats: {
      heritage: 98,
      attractions: 35,
      food: 24
    },
    topAttractions: ['鼋头渚', '灵山大佛', '惠山古镇', '拈花湾'],
    topFood: ['无锡排骨', '小笼包', '太湖三白', '酱排骨'],
    famousPeople: ['顾恺之', '徐霞客', '钱钟书', '阿炳'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wuxi%20Taihu%20Lake%20scenery&image_size=landscape_16_9'
  },
  changzhou: {
    name: '常州',
    location: '江苏省南部',
    highlight: '龙城古韵，创新之都',
    description: '常州是长江三角洲中心城市之一，历史文化悠久，是吴文化的重要发源地之一。',
    culture: ['常州梳篦', '常州留青竹刻', '常州吟诵', '常州乱针绣', '金坛刻纸', '常州萝卜干'],
    stats: {
      heritage: 76,
      attractions: 28,
      food: 18
    },
    topAttractions: ['中华恐龙园', '天目湖', '淹城春秋乐园', '南山竹海'],
    topFood: ['天目湖砂锅鱼头', '大麻糕', '加蟹小笼包', '萝卜干'],
    famousPeople: ['瞿秋白', '恽代英', '赵元任', '刘海粟'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Changzhou%20dinosaur%20park%20theme&image_size=landscape_16_9'
  },
  zhenjiang: {
    name: '镇江',
    location: '江苏省西南部',
    highlight: '天下第一江山',
    description: '镇江位于长江和京杭大运河交汇处，是历史文化名城，素有"天下第一江山"之美誉。',
    culture: ['镇江香醋酿制技艺', '金山寺佛教音乐', '镇江剪纸', '镇江竹编', '恒顺香醋', '镇江肴肉'],
    stats: {
      heritage: 68,
      attractions: 24,
      food: 16
    },
    topAttractions: ['金山寺', '北固山', '西津渡', '茅山'],
    topFood: ['肴肉', '锅盖面', '蟹黄汤包', '香醋'],
    famousPeople: ['沈括', '刘勰', '葛洪', '米芾'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20Jinshan%20Temple%20Yangtze&image_size=landscape_16_9'
  },
  yangzhou: {
    name: '扬州',
    location: '江苏省中部',
    highlight: '烟花三月下扬州',
    description: '扬州是历史文化名城，以园林、美食和传统工艺闻名。"烟花三月下扬州"的诗句传颂千年。',
    culture: ['扬州漆器', '扬州剪纸', '扬州评话', '扬州清曲', '扬州雕版印刷', '扬州玉雕'],
    stats: {
      heritage: 112,
      attractions: 38,
      food: 26
    },
    topAttractions: ['瘦西湖', '个园', '大明寺', '东关街'],
    topFood: ['扬州炒饭', '蟹黄汤包', '狮子头', '千层油糕'],
    famousPeople: ['郑板桥', '朱自清', '鉴真', '秦观'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20Slender%20West%20Lake%20garden&image_size=landscape_16_9'
  },
  taizhou: {
    name: '泰州',
    location: '江苏省中部',
    highlight: '汉唐古郡，祥泰之州',
    description: '泰州是国家历史文化名城，有2100多年的建城史，是京剧大师梅兰芳的故乡。',
    culture: ['泰州盆景', '溱潼会船', '泰州木雕', '靖江宝卷', '泰兴花鼓', '兴化锣鼓'],
    stats: {
      heritage: 58,
      attractions: 22,
      food: 20
    },
    topAttractions: ['溱湖湿地', '凤城河', '梅兰芳纪念馆', '溱潼古镇'],
    topFood: ['泰州干丝', '蟹黄汤包', '黄桥烧饼', '鱼汤面'],
    famousPeople: ['梅兰芳', '施耐庵', '郑板桥', '柳敬亭'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Taizhou%20ancient%20water%20town&image_size=landscape_16_9'
  },
  nantong: {
    name: '南通',
    location: '江苏省东南部',
    highlight: '中国近代第一城',
    description: '南通是中国首批对外开放的14个沿海城市之一，被誉为"中国近代第一城"。',
    culture: ['南通蓝印花布', '南通板鹞风筝', '海门山歌', '如皋盆景', '南通仿真绣', '如东跳马夫'],
    stats: {
      heritage: 62,
      attractions: 26,
      food: 18
    },
    topAttractions: ['濠河风景区', '狼山', '南通博物苑', '水绘园'],
    topFood: ['南通跳面', '蟹黄包', '西亭脆饼', '如皋火腿'],
    famousPeople: ['张謇', '赵丹', '范曾', '李昌钰'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nantong%20Haohe%20River%20scenery&image_size=landscape_16_9'
  },
  lianyungang: {
    name: '连云港',
    location: '江苏省东北部',
    highlight: '东海第一胜境',
    description: '连云港是新亚欧大陆桥东方桥头堡，是《西游记》文化发源地，花果山所在地。',
    culture: ['东海水晶雕刻', '海州五大宫调', '淮海戏', '连云港贝雕', '东海水晶', '灌云豆丹'],
    stats: {
      heritage: 54,
      attractions: 24,
      food: 16
    },
    topAttractions: ['花果山', '连岛', '渔湾', '孔望山'],
    topFood: ['花果山风鹅', '对虾', '梭子蟹', '豆丹'],
    famousPeople: ['吴承恩', '李汝珍', '徐福', '陶澍'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Lianyungang%20Huaguoshan%20Mountain&image_size=landscape_16_9'
  },
  huaian: {
    name: '淮安',
    location: '江苏省北部',
    highlight: '运河之都，伟人故里',
    description: '淮安是周恩来总理故乡，中国四大菜系之一淮扬菜的发源地，历史文化底蕴深厚。',
    culture: ['淮扬菜烹饪技艺', '淮海戏', '淮安茶馓', '楚州十番锣鼓', '洪泽湖渔鼓', '金湖秧歌'],
    stats: {
      heritage: 72,
      attractions: 30,
      food: 28
    },
    topAttractions: ['周恩来故里', '河下古镇', '洪泽湖', '淮安府署'],
    topFood: ['软兜长鱼', '平桥豆腐', '淮安茶馓', '钦工肉圆'],
    famousPeople: ['周恩来', '韩信', '吴承恩', '梁红玉'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huai%20an%20ancient%20canal%20city&image_size=landscape_16_9'
  },
  suqian: {
    name: '宿迁',
    location: '江苏省北部',
    highlight: '项王故里，酒都花乡',
    description: '宿迁是西楚霸王项羽的故乡，是中国酒都，洋河蓝色经典的产地。',
    culture: ['洋河酒酿造技艺', '苏北琴书', '泗州戏', '宿迁柳编', '虞姬传说', '项王传说'],
    stats: {
      heritage: 42,
      attractions: 20,
      food: 14
    },
    topAttractions: ['项王故里', '三台山', '洪泽湖湿地', '洋河酒厂'],
    topFood: ['霸王别姬', '车轮饼', '黄狗猪头肉', '水晶山楂糕'],
    famousPeople: ['项羽', '虞姬', '刘强东', '陈光标'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suqian%20Xiangwang%20hometown&image_size=landscape_16_9'
  },
  xuzhou: {
    name: '徐州',
    location: '江苏省西北部',
    highlight: '两汉文化发源地',
    description: '徐州是两汉文化发源地，有"千古龙飞地，一代帝王乡"之誉，是刘邦故里。',
    culture: ['徐州梆子', '徐州琴书', '邳州剪纸', '徐州香包', '徐州柳琴', '沛县武术'],
    stats: {
      heritage: 86,
      attractions: 32,
      food: 22
    },
    topAttractions: ['云龙湖', '汉文化景区', '龟山汉墓', '彭祖园'],
    topFood: ['地锅鸡', '把子肉', '羊肉汤', '蜜三刀'],
    famousPeople: ['刘邦', '项羽', '李可染', '马可'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20Han%20culture%20ancient%20city&image_size=landscape_16_9'
  },
  yancheng: {
    name: '盐城',
    location: '江苏省东部沿海',
    highlight: '东方湿地之都',
    description: '盐城拥有太平洋西海岸最大的湿地，是丹顶鹤和麋鹿的故乡，生态资源丰富。',
    culture: ['淮剧', '建湖杂技', '东台发绣', '大丰瓷刻', '盐城老虎鞋', '阜宁大糕'],
    stats: {
      heritage: 48,
      attractions: 28,
      food: 18
    },
    topAttractions: ['丹顶鹤保护区', '中华麋鹿园', '大纵湖', '荷兰花海'],
    topFood: ['阜宁大糕', '东台鱼汤面', '盐城八大碗', '藕粉圆子'],
    famousPeople: ['陆秀夫', '范仲淹', '乔冠华', '胡乔木'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yancheng%20wetland%20red%20crowned%20crane&image_size=landscape_16_9'
  }
})

// 显示城市信息
function showCityInfo(city) {
  selectedCity.value = city
}

const cityFallbackImages = {
  nanjing: createCityFallbackSvg('南京', '六朝古都', ['#2b1630', '#6f2754', '#c9a962']),
  suzhou: createCityFallbackSvg('苏州', '园林之城', ['#163239', '#2d6a73', '#a8d8c9']),
  wuxi: createCityFallbackSvg('无锡', '太湖明珠', ['#1f2f44', '#3e6b8a', '#9ccbd9']),
  changzhou: createCityFallbackSvg('常州', '龙城古韵', ['#241b4a', '#5740a6', '#d9c7ff']),
  zhenjiang: createCityFallbackSvg('镇江', '江山相映', ['#2b1f16', '#8a5a44', '#e2c08d']),
  yangzhou: createCityFallbackSvg('扬州', '烟花三月', ['#2e1d2c', '#8d4468', '#f0c7d9']),
  taizhou: createCityFallbackSvg('泰州', '祥泰之州', ['#1b2d33', '#4f7b86', '#c8e7ea']),
  nantong: createCityFallbackSvg('南通', '江海门户', ['#102a43', '#2f5d8a', '#a5d8ff']),
  lianyungang: createCityFallbackSvg('连云港', '海上山城', ['#10253d', '#33658a', '#86b3d1']),
  huaian: createCityFallbackSvg('淮安', '运河之都', ['#2d2417', '#8b6b3d', '#ead8ad']),
  suqian: createCityFallbackSvg('宿迁', '酒都花乡', ['#2b1832', '#7d3c6c', '#e9b7d0']),
  xuzhou: createCityFallbackSvg('徐州', '两汉风骨', ['#241c16', '#7a4e2d', '#d9b08c']),
  yancheng: createCityFallbackSvg('盐城', '东方湿地', ['#163338', '#4f8f93', '#bfe7e3'])
}

function createCityFallbackSvg(name, subtitle, colors) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}"/>
          <stop offset="55%" stop-color="${colors[1]}"/>
          <stop offset="100%" stop-color="${colors[2]}"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.24)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
      </defs>
      <rect width="1280" height="720" fill="url(#bg)"/>
      <circle cx="980" cy="120" r="220" fill="url(#glow)"/>
      <circle cx="240" cy="600" r="160" fill="rgba(255,255,255,0.08)"/>
      <path d="M0 560 C 180 500, 290 620, 480 560 S 790 520, 980 585 S 1180 630, 1280 575 L 1280 720 L 0 720 Z" fill="rgba(255,255,255,0.08)"/>
      <path d="M0 610 C 220 560, 380 690, 620 620 S 980 560, 1280 640" stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="none"/>
      <text x="80" y="210" fill="rgba(255,255,255,0.88)" font-size="30" letter-spacing="4">${subtitle.toUpperCase()}</text>
      <text x="80" y="320" fill="#fff" font-size="84" font-weight="700" letter-spacing="8">${name}</text>
      <text x="80" y="385" fill="rgba(255,255,255,0.84)" font-size="26" letter-spacing="2">江苏文化地图默认图</text>
      <g transform="translate(920 210)" opacity="0.9">
        <rect x="0" y="0" width="220" height="220" rx="34" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.22)"/>
        <circle cx="110" cy="88" r="36" fill="rgba(255,255,255,0.28)"/>
        <path d="M54 170 Q110 120 166 170" stroke="rgba(255,255,255,0.72)" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M70 180 L150 180" stroke="rgba(255,255,255,0.5)" stroke-width="4" stroke-linecap="round"/>
      </g>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getCityBannerImage(cityKey) {
  const city = cityInfo.value[cityKey]
  return city?.image || cityFallbackImages[cityKey] || cityFallbackImages.nanjing
}

function handleCityBannerError(cityKey) {
  if (!cityInfo.value[cityKey]) return
  cityInfo.value[cityKey].image = cityFallbackImages[cityKey] || cityFallbackImages.nanjing
}


// 新闻数据
const newsList = ref([])
const newsLoading = ref(false)
const newsError = ref(null)

async function fetchNews() {
  newsLoading.value = true
  newsError.value = null
  try {
    const response = await newsApi.getList({ page: 1, size: 5 })
    if (response.code === 200 && response.data) {
      const records = response.data.records || response.data
      if (records && records.length > 0) {
        newsList.value = records.map(item => ({
          id: item.id,
          title: item.title,
          date: formatDate(item.publishTime || item.createTime),
          category: item.category || '文化资讯',
          views: formatViewCount(item.viewCount),
          summary: item.summary || (item.content ? item.content.substring(0, 100) + '...' : ''),
          points: item.highlights || item.keyPoints || [],
          image: item.coverImage || '/background.png'
        }))
      } else {
        newsList.value = getDefaultNews()
      }
    } else {
      newsList.value = getDefaultNews()
    }
  } catch (error) {
    console.error('获取新闻列表失败:', error)
    newsError.value = error.message
    newsList.value = getDefaultNews()
  } finally {
    newsLoading.value = false
  }
}

function getDefaultNews() {
  return [
    {
      title: '2025年全国非遗文化展示活动在京举行',
      date: '2025.03.18',
      category: '展会活动',
      views: '2.3万',
      author: '文化和旅游部',
      source: '中国文化报',
      summary: '本次活动展示了来自全国各地的非物质文化遗产项目，包括传统技艺、民间文学、传统音乐等多种类型，吸引了众多观众前来参观。活动期间，来自江苏的昆曲、云锦、苏州园林营造技艺等多个非遗项目精彩亮相，获得了广泛关注。',
      points: ['百余项国家级非遗集中亮相', '设有沉浸式互动展区与传承人现场演示', '面向公众开放文化讲座与体验工坊', '江苏代表团获得"最佳展示奖"', '推出"非遗+科技"互动体验项目'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20intangible%20cultural%20heritage%20exhibition%20colorful%20traditional%20artifacts&image_size=landscape_16_9',
      video: 'https://example.com/非遗展示活动.mp4',
      gallery: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20crafts%20exhibition%20booth&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Master%20craftsman%20demonstrating%20traditional%20skill&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Interactive%20cultural%20heritage%20exhibition&image_size=square'
      ]
    },
    {
      title: '苏州园林入选世界文化遗产30周年纪念活动',
      date: '2026.03.15',
      category: '文化遗产',
      views: '3.2万',
      author: '苏州市文化广电和旅游局',
      source: '苏州日报',
      summary: '苏州园林作为中国古典园林的杰出代表，于1997年被列入世界文化遗产名录。30周年纪念活动将举办系列文化展览和学术研讨会，包括拙政园、留园、网师园等经典园林的特别开放活动，以及园林文化国际论坛。',
      points: ['围绕园林建筑、造景美学和文人生活展开专题展陈', '联动高校、博物馆与研究机构推出学术对谈', '同步上线数字导览与线上互动页面', '举办"园林与生活"主题摄影展', '发布《苏州园林保护与传承白皮书》'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20classical%20garden%20world%20heritage%20anniversary%20celebration&image_size=landscape_16_9',
      gallery: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20garden%20autumn%20scenery&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20garden%20architecture&image_size=square'
      ]
    },
    {
      title: '南京云锦亮相巴黎时装周 展现东方美学',
      date: '2026.03.10',
      category: '国际交流',
      views: '2.8万',
      author: '南京市非物质文化遗产保护中心',
      source: '国际时尚周刊',
      summary: '南京云锦作为中国传统的丝织工艺瑰宝，首次亮相巴黎时装周，以独特的东方美学惊艳国际时尚舞台，展现中华传统文化的魅力。此次展示的云锦作品融合了传统技艺与现代设计，获得了国际时尚界的高度评价。',
      points: ['以传统纹样和现代剪裁结合设计成服饰系列', '通过国际秀场向海外观众传递中国丝织工艺价值', '同步推出中英双语传播内容', '与国际知名设计师合作推出联名系列', '举办"云锦与现代时尚"主题论坛'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20Paris%20fashion%20week%20runway%20show&image_size=landscape_16_9',
      video: 'https://example.com/云锦巴黎时装周.mp4'
    },
    {
      title: 'AI 技术助力传统文化创新发展',
      date: '2026.01.15',
      category: '科技创新',
      views: '1.8万',
      author: '江苏省文化科技研究所',
      source: '科技日报',
      summary: '通过人工智能技术，传统文化元素得到了新的诠释和应用，为文化传承与创新注入了新的活力。江苏多家文化机构联合科技企业，开展了"AI+非遗"创新项目，取得了显著成果。',
      points: ['AI用于纹样重构、影像修复与内容生成', '传统文化在数字传播中获得更强可视化表达', '探索"内容生产+公众参与"的新模式', '开发非遗数字孪生系统', '推出AI辅助的传统工艺设计工具'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20technology%20traditional%20culture%20innovation%20digital%20art&image_size=landscape_16_9',
      gallery: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20generated%20traditional%20Chinese%20patterns&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Digital%20heritage%20preservation%20technology&image_size=square'
      ]
    },
    {
      title: '江苏昆曲入选联合国非物质文化遗产名录',
      date: '2026.01.13',
      category: '非遗传承',
      views: '3.5万',
      author: '江苏省文化和旅游厅',
      source: '人民日报',
      summary: '昆曲是中国最古老的戏曲剧种之一，发源于江苏昆山，以其优美的唱腔和细腻的表演著称，此次入选联合国非物质文化遗产名录，是对其文化价值的高度认可。江苏省将以此为契机，进一步加强昆曲的保护与传承。',
      points: ['"水磨腔"与"身段美学"同步纳入专题阐释', '开展青年传承人驻场演出与导赏', '推动经典剧目数字化保存与二次传播', '建立昆曲传承与创新发展基金', '推出"昆曲进校园"系列活动'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20Chinese%20traditional%20performance%20costume&image_size=landscape_16_9',
      video: 'https://example.com/昆曲表演片段.mp4'
    },
    {
      title: '扬州漆器艺术展在国博开幕',
      date: '2026.01.10',
      category: '艺术展览',
      views: '1.5万',
      author: '扬州市文化广电和旅游局',
      source: '中国艺术报',
      summary: '扬州漆器是中国传统工艺的杰出代表，本次展览汇集了明清以来的珍贵漆器作品，展现了中国漆艺的精湛技艺和独特魅力。展览分为历史传承、工艺创新、当代应用三个板块，全面展示了扬州漆器的发展历程。',
      points: ['精选明清漆器与当代创新作品同台展示', '通过工艺流程图解提升观众理解度', '组织匠人对谈与现场髹饰演示', '推出漆器文创产品展示区', '举办"漆艺与现代生活"设计大赛'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20lacquerware%20art%20exhibition%20museum%20display&image_size=landscape_16_9',
      gallery: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20lacquerware%20craftsmanship&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20lacquer%20art%20design&image_size=square'
      ]
    },
    {
      title: '国家级非物质文化遗产代表性项目名录更新',
      date: '2026.01.13',
      category: '政策法规',
      views: '1.2万',
      author: '国家文化和旅游部',
      source: '中国政府网',
      summary: '国家文化和旅游部公布了最新的国家级非物质文化遗产代表性项目名录，江苏多个项目入选。此次更新共新增项目186项，其中江苏占23项，涵盖传统技艺、民间文学、传统音乐等多个类别。',
      points: ['江苏多个项目进入扩展保护与重点支持名单', '强化非遗资源库、名录库与展示平台联动', '推动政策信息与公共传播同步更新', '建立非遗项目动态管理机制', '加大对传承人的扶持力度'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20heritage%20document%20announcement%20official%20ceremony&image_size=landscape_16_9'
    },
    {
      title: '非遗传承人群研修培训计划成果展',
      date: '2026.01.07',
      category: '培训教育',
      views: '8562',
      author: '江苏省非物质文化遗产保护中心',
      source: '江苏文化网',
      summary: '展示了江苏非遗传承人群研修培训计划的最新成果，包括传统技艺创新作品和传承经验分享。本次展览共展出作品200余件，涵盖了云锦、苏绣、紫砂等多个非遗项目，展现了传承人们的创新能力和艺术才华。',
      points: ['聚焦青年传承人与学院派共创成果', '呈现课程、作品、案例三类成果模块', '推动培训成果向社会转化与产业落地', '建立传承人与企业对接平台', '发布《非遗传承人群能力建设报告》'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20craft%20training%20workshop%20China%20exhibition&image_size=landscape_16_9',
      gallery: [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Master%20craftsman%20teaching%20apprentice&image_size=square',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20craft%20innovation%20exhibition&image_size=square'
      ]
    },
    {
      title: '江苏传统工艺振兴计划启动',
      date: '2026.02.28',
      category: '政策举措',
      views: '1.9万',
      author: '江苏省文化和旅游厅',
      source: '新华日报',
      summary: '江苏省正式启动传统工艺振兴计划，旨在推动传统工艺的传承、创新与发展。计划包括建立传统工艺振兴目录、培育传统工艺大师工作室、打造传统工艺产业集群等多项举措，预计到2030年，江苏传统工艺产业规模将达到500亿元。',
      points: ['建立传统工艺振兴目录与数据库', '培育100个传统工艺大师工作室', '打造5个传统工艺产业集群', '推出"传统工艺+旅游"融合项目', '建立传统工艺人才培养体系'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20crafts%20revival%20plan%20ceremony&image_size=landscape_16_9'
    },
    {
      title: '江苏文化遗产数字化保护项目启动',
      date: '2026.02.20',
      category: '数字保护',
      views: '1.6万',
      author: '江苏省文物局',
      source: '科技日报',
      summary: '江苏省启动文化遗产数字化保护项目，运用3D扫描、虚拟现实等技术，对全省重点文化遗产进行数字化记录和保护。该项目将为文化遗产的研究、展示和传承提供新的手段，同时为公众提供更加丰富的文化体验。',
      points: ['对100处重点文化遗产进行3D扫描', '建立江苏省文化遗产数字资源库', '开发文化遗产VR/AR体验项目', '推出文化遗产数字展览平台', '培养文化遗产数字化专业人才'],
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Digital%20heritage%20preservation%203D%20scanning%20technology&image_size=landscape_16_9',
      video: 'https://example.com/文化遗产数字化项目.mp4'
    }
  ]
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function formatViewCount(count) {
  if (!count) return '0'
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

// 论坛数据
const forumList = ref([
  {
    title: '标准化工作是非物质文化遗产保护措施规范有序开展的软性工具',
    author: '文化和旅游部非遗司',
    date: '2026.03.18',
    views: '1.2万'
  },
  {
    title: '《非物质文化遗产数字化保护数字资源采集和著录》行业标准发布',
    author: '中国非遗保护中心',
    date: '2026.03.15',
    views: '8562'
  },
  {
    title: '中国非物质文化遗产传承人研修培训计划实施十年经验与成果',
    author: '南京艺术学院',
    date: '2026.03.10',
    views: '6234'
  },
  {
    title: '非遗进校园：传统文化传承的创新实践与路径探索',
    author: '江苏省教育厅',
    date: '2026.03.08',
    views: '5421'
  },
  {
    title: '数字化时代非物质文化遗产的保护与传播策略研究',
    author: '南京大学文化研究院',
    date: '2026.03.05',
    views: '4892'
  }
])

// 专题报道数据
const reportList = ref([
  {
    title: '江苏非遗保护工作年度报告发布',
    date: '2026.03.15',
    category: '年度报告',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20heritage%20annual%20report%20document&image_size=landscape_16_9'
  },
  {
    title: '昆曲艺术传承人口述史项目启动',
    date: '2026.03.12',
    category: '重点项目',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20master%20oral%20history%20project&image_size=landscape_16_9'
  },
  {
    title: '江苏传统工艺振兴目录公示',
    date: '2026.03.08',
    category: '政策公示',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20craft%20revival%20catalog%20announcement&image_size=landscape_16_9'
  },
  {
    title: '非遗传承人技艺展示活动预告',
    date: '2026.03.05',
    category: '活动预告',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Heritage%20master%20craft%20demonstration%20event&image_size=landscape_16_9'
  }
])

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
    type: 'image',
    src: `${baseUrl}Homepagebackground2.png`,
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
    type: 'image',
    src: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiangsu%20cultural%20heritage%20traditional%20architecture&image_size=landscape_16_9',
    title: 'AI 助力文化创新',
    description: '利用人工智能技术，为传统文化注入新的活力'
  }
])



// 跳转到非遗文化页面
function goToFeiyi() {
  router.push('/feiyi')
}

// 跳转到 AI 设计页面
function goToDesign() {
  router.push('/design')
}

// 跳转到文化库页面
function goToCulture() {
  router.push('/culture')
}

// 处理轮播图指示器点击
function handleIndicatorClick(index) {
  goToSlide(index)
}

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

// 检测元素是否在视口中
function isElementInViewport(element) {
  if (!element) return false
  
  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  
  // 元素顶部进入视口底部10%或元素底部进入视口顶部10%时触发
  return (
    rect.top <= windowHeight * 0.9 &&
    rect.bottom >= windowHeight * 0.1 &&
    rect.left <= windowWidth * 0.9 &&
    rect.right >= windowWidth * 0.1
  )
}

// 滚动翻页效果 - 参考中国非物质文化遗产网风格
function handleScroll() {
  // 检测内容区域是否在视口中，触发渐入动画
  if (featuresSectionRef.value && isElementInViewport(featuresSectionRef.value)) {
    featuresVisible.value = true
  }
  
  if (newsSectionRef.value && isElementInViewport(newsSectionRef.value)) {
    newsVisible.value = true
  }
  
  // 只有当两个引用都存在时才执行滚动效果
  if (!carouselSectionRef.value || !featuresSectionRef.value) return
  
  try {
    const carouselSection = carouselSectionRef.value
    const featuresSection = featuresSectionRef.value
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const carouselHeight = carouselSection.getBoundingClientRect().height
    const start = Math.max(0, carouselHeight * 0.25)
    const end = Math.max(start + 1, carouselHeight * 0.85)
    const rawRatio = (scrollTop - start) / (end - start)
    const scrollRatio = Math.max(0, Math.min(1, rawRatio))
    
    // 更克制的缓动效果，突出“静”和“高级”
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
    const easedRatio = easeOutCubic(scrollRatio)
    
    // 更轻的视差位移，减少“晃动感”
    const carouselTranslateY = easedRatio * -42
    const carouselOpacity = 1 - easedRatio * 0.28
    
    carouselSection.style.transform = `translate3d(0, ${carouselTranslateY}px, 0)`
    carouselSection.style.opacity = carouselOpacity
    
    // 内容区轻微浮入
    const featuresTranslateY = (1 - easedRatio) * 24
    const featuresOpacity = 0.72 + easedRatio * 0.28
    
    featuresSection.style.transform = `translate3d(0, ${featuresTranslateY}px, 0)`
    featuresSection.style.opacity = featuresOpacity
    featuresSection.style.marginTop = `${-easedRatio * 12}px`
  } catch (error) {
    console.error('Error in handleScroll:', error)
  }
}

function initAMap() {
  if (mapInitialized.value || mapLoading.value) return
  if (!amapContainerRef.value) {
    console.warn('地图容器未准备好')
    return
  }
  
  mapLoading.value = true
  mapError.value = null
  
  initMap(amapContainerRef.value, {
    zoom: 7,
    center: [119.5, 32.9],
    mapStyle: 'amap://styles/normal',
    viewMode: '2D',
    features: ['bg', 'road', 'building', 'point'],
    showLabel: true,
    resizeEnable: true,
  })
    .then(({ map, AMap }) => {
      amapInstance.value = map
      amapRef.value = AMap
      mapInitialized.value = true
      mapLoading.value = false
      
      addCityMarkers()
      console.log('高德地图加载完成')
    })
    .catch(error => {
      mapLoading.value = false
      mapError.value = error.message || '地图加载失败'
      console.error('高德地图初始化失败:', error)
    })
}

function addCityMarkers() {
  if (!amapInstance.value || !amapRef.value) return
  
  const markers = []
  Object.keys(cityCoordinates).forEach(cityKey => {
    const city = cityCoordinates[cityKey]
    const info = cityInfo.value[cityKey]
    
    const marker = createLabelMarker(amapRef.value, {
      position: [city.lng, city.lat],
      name: info.name,
      isCapital: city.isCapital,
      onClick: () => {
        showCityInfo(cityKey)
      }
    })
    
    marker.on('mouseover', () => {
      hoverCity.value = cityKey
    })
    
    marker.on('mouseout', () => {
      hoverCity.value = null
    })
    
    markers.push(marker)
    cityMarkers.value.push(marker)
  })
  
  amapInstance.value.add(markers)
}

function retryLoadMap() {
  mapError.value = null
  mapInitialized.value = false
  initAMap()
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', resetWaves)
  window.addEventListener('scroll', handleScroll)
  
  fetchNews()
  
  nextTick(() => {
    handleScroll()
    if (isElementInViewport(featuresSectionRef.value)) {
      initAMap()
    }
  })
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !mapInitialized.value && !mapLoading.value) {
        initAMap()
      }
    })
  }, { threshold: 0.1 })
  
  if (featuresSectionRef.value) {
    observer.observe(featuresSectionRef.value)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', resetWaves)
  window.removeEventListener('scroll', handleScroll)
  
  cityMarkers.value.forEach(marker => {
    if (marker && marker.setMap) {
      marker.setMap(null)
    }
  })
  cityMarkers.value = []
  
  if (amapInstance.value) {
    amapInstance.value.clearMap()
    destroyMap(amapInstance.value)
    amapInstance.value = null
  }
  
  amapRef.value = null
  mapInitialized.value = false
})

onUpdated(() => {
  // 组件更新后重新计算
  handleScroll()
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
  position: relative;
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
    background-image: url('/Homepagebackground1.png');
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

</style>