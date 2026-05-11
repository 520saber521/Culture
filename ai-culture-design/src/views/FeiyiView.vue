<template>
  <div class="feiyi-container" ref="containerRef">
    <div class="floating-particles" ref="particlesRef">
      <div v-for="i in 20" :key="i" class="particle" :style="getParticleStyle(i)"></div>
    </div>

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
        <p class="page-subtitle">探索千年文化瑰宝，传承民族精神血脉</p>
        
        <div class="header-stats">
          <div class="stat-item" v-for="(stat, index) in statsData" :key="index">
            <div class="stat-icon">
              <component :is="stat.icon" />
            </div>
            <div class="stat-info">
              <span class="stat-number">
                <span class="counter" :data-target="stat.value">{{ animatedStats[index] }}</span>
              </span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <div class="header-search">
          <div class="search-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input 
              type="text" 
              v-model="searchKeyword" 
              placeholder="搜索非遗项目、传承人、地区..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              <span>搜索</span>
            </button>
          </div>
          <div class="hot-tags">
            <span class="hot-label">热门：</span>
            <button 
              v-for="tag in hotTags" 
              :key="tag" 
              class="hot-tag"
              @click="quickSearch(tag)"
            >{{ tag }}</button>
          </div>
        </div>
      </div>
    </section>

    <div class="main-content">
      <div class="left-content">
        <section class="category-section">
          <div class="category-header">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
              </svg>
              项目分类
            </h3>
          </div>
          <div class="category-grid">
            <button 
              v-for="cat in categories" 
              :key="cat.value"
              class="category-card"
              :class="{ active: filter.category === cat.value }"
              @click="selectCategory(cat.value)"
            >
              <div class="cat-icon" v-html="cat.icon"></div>
              <span class="cat-name">{{ cat.label }}</span>
              <span class="cat-count">{{ getCategoryCount(cat.value) }}</span>
            </button>
          </div>
        </section>

        <section class="filter-section">
          <div class="filter-header">
            <div class="filter-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 21V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M4 10V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 21V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 8V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M20 21V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M20 12V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M1 14H7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M9 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M17 16H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3 class="section-title">高级筛选</h3>
          </div>
          <el-form :inline="true" class="filter-form">
            <el-form-item label="非遗级别">
              <el-select v-model="filter.level" placeholder="选择级别" class="custom-select">
                <el-option label="全部级别" value=""/>
                <el-option label="国家级" value="国家级"/>
                <el-option label="省级" value="省级"/>
              </el-select>
            </el-form-item>
            <el-form-item label="所在地区">
              <el-select v-model="filter.region" placeholder="选择地区" class="custom-select">
                <el-option label="全部地区" value=""/>
                <el-option v-for="region in regions" :key="region" :label="region" :value="region"/>
              </el-select>
            </el-form-item>
            <el-form-item class="filter-buttons">
              <el-button type="primary" @click="handleFilter" class="filter-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                筛选
              </el-button>
              <el-button @click="resetFilter" class="reset-btn">重置</el-button>
            </el-form-item>
          </el-form>
        </section>

        <section class="projects-section">
          <div class="section-header">
            <h3 class="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" stroke-width="2"/>
                <path d="M3 9H21" stroke="currentColor" stroke-width="2"/>
                <path d="M9 21V9" stroke="currentColor" stroke-width="2"/>
              </svg>
              非遗项目列表
            </h3>
            <div class="view-controls">
              <span class="result-count">共 <strong>{{ filteredItems.length }}</strong> 项结果</span>
              <div class="view-modes">
                <button 
                  class="view-mode-btn" 
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                  title="网格视图"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button 
                  class="view-mode-btn" 
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="列表视图"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M8 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="4" cy="6" r="1" fill="currentColor"/>
                    <circle cx="4" cy="12" r="1" fill="currentColor"/>
                    <circle cx="4" cy="18" r="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <TransitionGroup 
            :name="viewMode === 'grid' ? 'grid-fade' : 'list-fade'" 
            tag="div" 
            :class="['projects-container', viewMode === 'grid' ? 'projects-grid' : 'projects-list']"
          >
            <div 
              v-for="(item, index) in paginatedItems" 
              :key="item.id" 
              class="project-card"
              :style="{ animationDelay: `${index * 0.08}s` }"
              @click="goToDetail(item)"
              @mouseenter="hoveredItem = item.id"
              @mouseleave="hoveredItem = null"
            >
              <div class="card-image">
                <img :src="item.imageUrl" :alt="item.name" loading="lazy" @error="handleImageError">
                <div class="image-overlay">
                  <div class="overlay-actions">
                    <button class="overlay-btn" @click.stop="toggleFavorite(item)" :title="item.isFavorite ? '取消收藏' : '收藏'">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39" 
                          :fill="item.isFavorite ? '#C00C00' : 'none'"
                          :stroke="item.isFavorite ? '#C00C00' : 'currentColor'"
                          stroke-width="2"/>
                      </svg>
                    </button>
                    <button class="overlay-btn" @click.stop="shareItem(item)" title="分享">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
                        <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
                        <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" stroke-width="2"/>
                        <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="card-level-badge" :class="getLevelClass(item.level)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                  </svg>
                  {{ item.level }}
                </div>
                <div class="card-category-tag">{{ item.category }}</div>
              </div>
              <div class="card-content">
                <h4 class="project-title">{{ item.name }}</h4>
                <div class="project-meta">
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    {{ item.region }}
                  </span>
                  <span class="meta-item" v-if="item.inheritor">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    {{ item.inheritor }}
                  </span>
                </div>
                <p class="project-description">{{ item.description }}</p>
                <div class="card-footer">
                  <div class="card-tags">
                    <span v-for="tag in (item.tags || []).slice(0, 3)" :key="tag" class="card-tag">{{ tag }}</span>
                  </div>
                  <span class="view-detail">
                    查看详情
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <div class="pagination-section" v-if="filteredItems.length > pageSize">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[6, 12, 24]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredItems.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              background
            />
          </div>

          <div v-if="filteredItems.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 2"/>
                <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <h4>暂无符合条件的非遗项目</h4>
            <p>尝试调整筛选条件或搜索其他关键词</p>
            <el-button type="primary" @click="resetFilter" class="reset-empty-btn">清除筛选条件</el-button>
          </div>
        </section>
      </div>

      <div class="right-sidebar">
        <div class="sidebar-content">
          <section class="featured-section sidebar-card">
            <div class="sidebar-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3 class="sidebar-title">精选推荐</h3>
            </div>
            <div class="featured-list">
              <div 
                v-for="(item, index) in featuredItems" 
                :key="item.id"
                class="featured-item"
                @click="goToDetail(item)"
              >
                <span class="featured-rank" :class="'rank-' + (index + 1)">{{ index + 1 }}</span>
                <div class="featured-image">
                  <img :src="item.imageUrl" :alt="item.name">
                </div>
                <div class="featured-info">
                  <h5 class="featured-title">{{ item.name }}</h5>
                  <span class="featured-level" :class="getLevelClass(item.level)">{{ item.level }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="news-section sidebar-card">
            <div class="sidebar-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20Z" stroke="currentColor" stroke-width="2"/>
                <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                <path d="M7 15H7.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M11 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3 class="sidebar-title">新闻动态</h3>
              <a href="#" class="more-link">更多</a>
            </div>
            <ul class="news-list">
              <li v-for="(news, index) in newsList" :key="index" class="news-item">
                <span class="news-dot"></span>
                <div class="news-content">
                  <a href="#" class="news-link">{{ news.title }}</a>
                  <span class="news-date">{{ news.date }}</span>
                </div>
              </li>
            </ul>
          </section>

          <section class="tag-cloud-section sidebar-card">
            <div class="sidebar-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 7H7.01M7 3H7.01M7 11H7.01M7 15H7.01M7 19H7.01M11 3H11.01M11 7H11.01M11 11H11.01M11 15H11.01M11 19H11.01M15 3H15.01M15 7H15.01M15 11H15.01M15 15H15.01M15 19H15.01M19 3H19.01M19 7H19.01M19 11H19.01M19 15H19.01M19 19H19.01M3 3H3.01M3 7H3.01M3 11H3.01M3 15H3.01M3 19H3.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <h3 class="sidebar-title">热门标签</h3>
            </div>
            <div class="tag-cloud">
              <button 
                v-for="(tag, index) in cloudTags" 
                :key="tag.name"
                class="cloud-tag"
                :style="{ 
                  fontSize: tag.size + 'px',
                  animationDelay: `${index * 0.05}s`
                }"
                @click="quickSearch(tag.name)"
              >{{ tag.name }}</button>
            </div>
          </section>

          <section class="map-section sidebar-card">
            <div class="sidebar-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3 class="sidebar-title">非遗地图</h3>
            </div>
            <div class="map-container">
              <div class="map-visual">
                <svg viewBox="0 0 200 160" class="jiangsu-map">
                  <defs>
                    <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style="stop-color:#fff5f5"/>
                      <stop offset="100%" style="stop-color:#ffe8e8"/>
                    </linearGradient>
                  </defs>
                  <path class="map-outline" d="M100 10 L180 50 L180 130 L100 150 L20 130 L20 50 Z" fill="url(#mapGradient)" stroke="#C00C00" stroke-width="2"/>
                  <g class="map-points">
                    <circle cx="100" cy="40" r="6" fill="#C00C00" class="map-point point-suzhou">
                      <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="80" cy="70" r="5" fill="#C00C00" opacity="0.8" class="map-point"/>
                    <circle cx="130" cy="60" r="5" fill="#C00C00" opacity="0.8" class="map-point"/>
                    <circle cx="60" cy="100" r="4" fill="#C00C00" opacity="0.6" class="map-point"/>
                    <circle cx="140" cy="90" r="4" fill="#C00C00" opacity="0.6" class="map-point"/>
                    <circle cx="100" cy="110" r="4" fill="#C00C00" opacity="0.6" class="map-point"/>
                  </g>
                  <g class="map-labels">
                    <text x="100" y="30" text-anchor="middle" fill="#333" font-size="8">苏州</text>
                    <text x="80" y="60" text-anchor="middle" fill="#333" font-size="7">南京</text>
                    <text x="130" y="50" text-anchor="middle" fill="#333" font-size="7">无锡</text>
                  </g>
                </svg>
              </div>
              <div class="map-legend">
                <div class="legend-item">
                  <span class="legend-dot national"></span>
                  <span>国家级非遗</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot provincial"></span>
                  <span>省级非遗</span>
                </div>
              </div>
            </div>
          </section>

          <section class="forum-section sidebar-card">
            <div class="sidebar-header">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3 class="sidebar-title">学术论坛</h3>
            </div>
            <ul class="forum-list">
              <li v-for="(topic, index) in forumTopics" :key="index" class="forum-item">
                <span class="forum-dot"></span>
                <div class="forum-content">
                  <a href="#" class="forum-link">{{ topic.title }}</a>
                  <span class="forum-date">{{ topic.date }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showDetailDialog"
      :title="selectedItem?.name || '项目详情'"
      width="800px"
      class="detail-dialog"
      destroy-on-close
    >
      <div v-if="selectedItem" class="detail-content">
        <div class="detail-header">
          <div class="detail-image">
            <img :src="selectedItem.imageUrl" :alt="selectedItem.name">
            <span class="detail-level" :class="getLevelClass(selectedItem.level)">
              {{ selectedItem.level }}
            </span>
          </div>
          <div class="detail-info">
            <h3>{{ selectedItem.name }}</h3>
            <div class="detail-meta">
              <span class="meta-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2"/>
                  <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ selectedItem.category }}
              </span>
              <span class="meta-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ selectedItem.region }}
              </span>
              <span class="meta-tag" v-if="selectedItem.inheritor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ selectedItem.inheritor }}
              </span>
            </div>
            <div class="detail-tags" v-if="selectedItem.tags && selectedItem.tags.length">
              <span v-for="tag in selectedItem.tags" :key="tag" class="detail-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
        <div class="detail-body">
          <div class="detail-section">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2"/>
              </svg>
              项目简介
            </h4>
            <p>{{ selectedItem.description }}</p>
          </div>
          <div class="detail-section" v-if="selectedItem.history">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              历史渊源
            </h4>
            <p>{{ selectedItem.history }}</p>
          </div>
          <div class="detail-section" v-if="selectedItem.features && selectedItem.features.length">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              主要特征
            </h4>
            <ul class="feature-list">
              <li v-for="(feature, index) in selectedItem.features" :key="index">
                <span class="feature-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                {{ feature }}
              </li>
            </ul>
          </div>
        </div>
        <div class="detail-actions">
          <button class="action-btn primary" @click="toggleFavorite(selectedItem)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39" 
                :fill="selectedItem.isFavorite ? '#C00C00' : 'none'"
                :stroke="selectedItem.isFavorite ? '#C00C00' : 'currentColor'"
                stroke-width="2"/>
            </svg>
            {{ selectedItem.isFavorite ? '已收藏' : '收藏项目' }}
          </button>
          <button class="action-btn" @click="shareItem(selectedItem)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" stroke-width="2"/>
              <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" stroke-width="2"/>
            </svg>
            分享
          </button>
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
const containerRef = ref(null)
const particlesRef = ref(null)

const filter = ref({
  level: '',
  category: '',
  region: ''
})

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(6)
const viewMode = ref('grid')
const showDetailDialog = ref(false)
const selectedItem = ref(null)
const hoveredItem = ref(null)
const showBackTop = ref(false)

const titleChars = '江苏非物质文化遗产'.split('')

const statsData = [
  { value: 12, label: '非遗项目', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M12 2L2 7L12 12L22 7L12 2Z', stroke: 'currentColor', 'stroke-width': 2 }),
    h('path', { d: 'M2 17L12 22L22 17', stroke: 'currentColor', 'stroke-width': 2 }),
    h('path', { d: 'M2 12L12 17L22 12', stroke: 'currentColor', 'stroke-width': 2 })
  ])},
  { value: 9, label: '国家级', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z', stroke: 'currentColor', 'stroke-width': 2 })
  ])},
  { value: 3, label: '省级', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('circle', { cx: 12, cy: 12, r: 10, stroke: 'currentColor', 'stroke-width': 2 }),
    h('path', { d: 'M12 6V12L16 14', stroke: 'currentColor', 'stroke-width': 2 })
  ])}
]

const animatedStats = ref([0, 0, 0])

const hotTags = ['苏州园林', '昆曲', '苏绣', '云锦', '紫砂']

const categories = [
  { value: '', label: '全部', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9H21M9 21V9" stroke="currentColor" stroke-width="2"/></svg>' },
  { value: '传统技艺', label: '传统技艺', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3C14.5168 6.48693 14.4142 6.73825 14.4142 7C14.4142 7.26175 14.5168 7.51307 14.7 7.7L16.3 9.3C16.4869 9.48324 16.7382 9.58583 17 9.58583C17.2618 9.58583 17.5131 9.48324 17.7 9.3L21.47 5.53C21.9728 6.57119 22.1251 7.74079 21.9065 8.87157C21.6878 10.0024 21.1087 11.0345 20.2571 11.8172C19.4055 12.5999 18.3286 13.0908 17.1821 13.2149C16.0357 13.3389 14.8803 13.0894 13.88 12.5L6.59 19.79C6.2109 20.1691 5.6931 20.3824 5.1525 20.3824C4.6119 20.3824 4.0941 20.1691 3.715 19.79C3.3359 19.4109 3.12261 18.8931 3.12261 18.3525C3.12261 17.8119 3.3359 17.2941 3.715 16.915L11 9.63C10.4106 8.62968 10.1611 7.47434 10.2851 6.32789C10.4092 5.18144 10.9001 4.10452 11.6828 3.25292C12.4655 2.40133 13.4976 1.82216 14.6284 1.60353C15.7592 1.3849 16.9288 1.53718 17.97 2.04L14.2 5.81C14.0132 5.99626 13.9077 6.24766 13.9077 6.51C13.9077 6.77234 14.0132 7.02374 14.2 7.21L14.7 6.3Z" stroke="currentColor" stroke-width="2"/></svg>' },
  { value: '传统美术', label: '传统美术', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 19L19 12L22 15L15 22L12 19Z" stroke="currentColor" stroke-width="2"/><path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke="currentColor" stroke-width="2"/><path d="M2 2L9.586 9.586" stroke="currentColor" stroke-width="2"/><circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2"/></svg>' },
  { value: '传统戏剧', label: '传统戏剧', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>' },
  { value: '曲艺', label: '曲艺', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18V5L21 3V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/></svg>' },
  { value: '传统音乐', label: '传统音乐', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 18V5L21 3V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2"/></svg>' }
]

const regions = ['苏州', '南京', '无锡', '扬州', '宜兴', '常州', '南通', '徐州', '连云港', '苏州昆山']

const cloudTags = [
  { name: '昆曲', size: 16 },
  { name: '苏绣', size: 14 },
  { name: '云锦', size: 15 },
  { name: '紫砂', size: 13 },
  { name: '园林', size: 14 },
  { name: '评弹', size: 12 },
  { name: '剪纸', size: 11 },
  { name: '漆器', size: 12 },
  { name: '泥人', size: 11 },
  { name: '蓝印花布', size: 13 }
]

const heritageItems = ref([
  {
    id: 1,
    name: '苏州园林营造技艺',
    level: '国家级',
    category: '传统技艺',
    region: '苏州',
    inheritor: '香山帮匠人',
    description: '苏州园林营造技艺是中国传统园林建筑的杰出代表，以其精巧的设计和精湛的工艺闻名于世。苏州园林以"虽由人作，宛自天开"为造园理念，融建筑、山水、花木、雕刻、书画于一体。',
    history: '苏州园林历史悠久，可追溯至春秋时期。明清时期达到鼎盛，形成了独特的江南园林风格。',
    features: ['借景造园，移步换景', '山水相依，曲径通幽', '建筑精美，雕梁画栋', '植物配置，四季有景'],
    tags: ['园林', '建筑', '世界遗产', '江南'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20classical%20garden%20traditional%20Chinese%20architecture&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 2,
    name: '南京云锦织造技艺',
    level: '国家级',
    category: '传统技艺',
    region: '南京',
    inheritor: '周双喜',
    description: '南京云锦织造技艺是中国传统丝织工艺的杰出代表，以其绚丽的色彩和精湛的工艺著称，被誉为"东方瑰宝"、"中华一绝"。',
    history: '南京云锦始于元代，盛于明清，是元、明、清三朝皇家御用贡品。',
    features: ['妆花工艺，色彩绚丽', '通经断纬，技艺精湛', '金线银线，华贵典雅', '图案丰富，寓意吉祥'],
    tags: ['云锦', '织造', '丝绸', '皇家贡品'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20traditional%20Chinese%20silk&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 3,
    name: '苏州评弹',
    level: '国家级',
    category: '曲艺',
    region: '苏州',
    inheritor: '邢晏春',
    description: '苏州评弹是苏州地区的传统曲艺形式，包括评话和弹词两种艺术形式，以其优美的唱腔和生动的表演深受观众喜爱。',
    history: '苏州评弹起源于明代，清代达到鼎盛，是江南地区最具代表性的曲艺形式之一。',
    features: ['吴侬软语，韵味悠长', '说噱弹唱，四艺俱全', '三弦琵琶，伴奏悠扬', '故事生动，雅俗共赏'],
    tags: ['评弹', '曲艺', '吴语', '三弦'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20Pingtan%20traditional%20Chinese%20storytelling&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 4,
    name: '扬州漆器髹饰技艺',
    level: '国家级',
    category: '传统技艺',
    region: '扬州',
    description: '扬州漆器髹饰技艺是中国传统漆器工艺的重要流派，以其精湛的髹饰技艺和独特的艺术风格著称，历史悠久，工艺精湛。',
    history: '扬州漆器始于战国，兴于汉唐，盛于明清，是中国漆器艺术的重要代表。',
    features: ['点螺工艺，精巧细腻', '雕漆嵌玉，富丽堂皇', '百宝镶嵌，华美绝伦', '漆画艺术，意境深远'],
    tags: ['漆器', '髹饰', '点螺', '镶嵌'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20lacquerware%20traditional%20Chinese%20craft&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 5,
    name: '宜兴紫砂陶制作技艺',
    level: '国家级',
    category: '传统技艺',
    region: '宜兴',
    inheritor: '徐秀棠',
    description: '宜兴紫砂陶制作技艺是江苏宜兴地区的传统制陶工艺，以其独特的泥料和精湛的成型技艺闻名于世，是中国陶瓷艺术的瑰宝。',
    history: '宜兴紫砂始于北宋，盛于明清，是文人雅士钟爱的茶具之选。',
    features: ['紫砂泥料，透气性好', '手工成型，造型丰富', '泡茶留香，越用越润', '名家作品，收藏价值高'],
    tags: ['紫砂', '陶艺', '茶具', '宜兴'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yixing%20purple%20clay%20teapot%20traditional%20Chinese%20ceramic&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 6,
    name: '昆曲',
    level: '国家级',
    category: '传统戏剧',
    region: '苏州昆山',
    inheritor: '张继青',
    description: '昆曲是中国最古老的戏曲剧种之一，发源于江苏昆山，以其优美的唱腔和细腻的表演著称，被誉为"百戏之祖"。',
    history: '昆曲起源于元末明初，明代嘉靖年间经魏良辅改良后风行全国，2001年入选联合国教科文组织"人类口述和非物质遗产代表作"。',
    features: ['水磨腔调，婉转悠扬', '载歌载舞，身段优美', '文词典雅，意境深远', '生旦净丑，行当齐全'],
    tags: ['昆曲', '戏曲', '百戏之祖', '世界遗产'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20traditional%20Chinese%20theater%20performance&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 7,
    name: '惠山泥人',
    level: '国家级',
    category: '传统美术',
    region: '无锡',
    description: '惠山泥人是江苏无锡惠山地区的传统民间美术，以其造型生动、色彩鲜艳的特点深受人们喜爱，是江南民间艺术的代表。',
    history: '惠山泥人始于南北朝，盛于明清，以"手捏戏文"和"大阿福"最为著名。',
    features: ['造型夸张，神态生动', '色彩艳丽，对比强烈', '线条流畅，装饰性强', '题材丰富，寓意吉祥'],
    tags: ['泥人', '民间艺术', '大阿福', '无锡'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Huishan%20clay%20figurine%20traditional%20Chinese%20folk%20art&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 8,
    name: '常州梳篦制作技艺',
    level: '省级',
    category: '传统技艺',
    region: '常州',
    description: '常州梳篦制作技艺是江苏常州地区的传统手工艺，以其精湛的制作工艺和精美的造型著称，有"宫梳名篦"之美誉。',
    history: '常州梳篦始于魏晋，盛于明清，曾是宫廷贡品。',
    features: ['选材考究，质地坚韧', '工艺精细，齿尖圆润', '雕刻精美，图案丰富', '实用美观，养生保健'],
    tags: ['梳篦', '手工艺', '宫廷贡品', '常州'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Changzhou%20comb%20traditional%20Chinese%20handicraft&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 9,
    name: '苏绣',
    level: '国家级',
    category: '传统美术',
    region: '苏州',
    inheritor: '姚建萍',
    description: '苏绣是苏州地区的传统刺绣工艺，以其精细的针法和精美的图案著称，是中国四大名绣之一。',
    history: '苏绣历史悠久，三国时期已有记载，明清时期达到鼎盛，形成了独特的艺术风格。',
    features: ['针法精细，丝理圆转', '色彩雅致，层次分明', '题材广泛，意境深远', '双面绣技，巧夺天工'],
    tags: ['苏绣', '刺绣', '四大名绣', '双面绣'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20embroidery%20traditional%20Chinese%20art&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 10,
    name: '南通蓝印花布印染技艺',
    level: '国家级',
    category: '传统技艺',
    region: '南通',
    description: '南通蓝印花布印染技艺是江苏南通地区的传统印染工艺，以其独特的蓝白图案和精湛的印染技艺著称，是江南民间纺织艺术的代表。',
    history: '南通蓝印花布始于宋代，盛于明清，是民间日常生活的必需品。',
    features: ['蓝白相间，清新素雅', '图案丰富，寓意吉祥', '手工印染，自然环保', '质地柔软，经久耐用'],
    tags: ['蓝印花布', '印染', '民间艺术', '南通'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nantong%20blue%20calico%20traditional%20Chinese%20textile&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 11,
    name: '徐州剪纸',
    level: '省级',
    category: '传统美术',
    region: '徐州',
    description: '徐州剪纸是江苏徐州地区的传统民间艺术，以其粗犷的风格和生动的造型著称，是苏北民间艺术的代表。',
    history: '徐州剪纸历史悠久，具有浓郁的北方民间艺术特色。',
    features: ['线条粗犷，风格豪放', '造型夸张，神态生动', '题材广泛，寓意深刻', '刀法利落，一气呵成'],
    tags: ['剪纸', '民间艺术', '苏北', '徐州'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20paper%20cutting%20traditional%20Chinese%20folk%20art&image_size=landscape_16_9',
    isFavorite: false
  },
  {
    id: 12,
    name: '海州五大宫调',
    level: '国家级',
    category: '传统音乐',
    region: '连云港',
    description: '海州五大宫调是江苏连云港海州地区的传统音乐形式，以其优美的旋律和丰富的曲目著称，是明清俗曲的活化石。',
    history: '海州五大宫调源于明清时期，是古代宫廷音乐与民间音乐的融合。',
    features: ['曲调优美，婉转动听', '唱腔丰富，表现力强', '曲目众多，内容广泛', '伴奏简单，易于传唱'],
    tags: ['宫调', '传统音乐', '连云港', '明清俗曲'],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20music%20performance%20instrument&image_size=landscape_16_9',
    isFavorite: false
  }
])

const newsList = ref([
  { title: '2026年全国非遗文化展示活动在京举行', date: '2026.01.15' },
  { title: '中国非物质文化遗产保护工作会议召开', date: '2026.01.13' },
  { title: '国家级非物质文化遗产代表性项目名录更新', date: '2026.01.13' },
  { title: '非物质文化遗产数字化保护成果展', date: '2026.01.07' }
])

const forumTopics = ref([
  { title: '标准化工作是非物质文化遗产保护措施规范有序开展的软性工具', date: '2025.08.05' },
  { title: '《非物质文化遗产数字化保护数字资源采集和著录》行业标准发布', date: '2025.08.01' },
  { title: '中国非物质文化遗产传承人研修培训计划实施十年经验与成果', date: '2025.06.04' }
])

const featuredItems = computed(() => {
  return heritageItems.value
    .filter(item => item.level === '国家级')
    .slice(0, 4)
})

const nationalCount = computed(() => heritageItems.value.filter(item => item.level === '国家级').length)
const provincialCount = computed(() => heritageItems.value.filter(item => item.level === '省级').length)

const filteredItems = computed(() => {
  let result = heritageItems.value
  if (filter.value.level) {
    result = result.filter(item => item.level === filter.value.level)
  }
  if (filter.value.category) {
    result = result.filter(item => item.category === filter.value.category)
  }
  if (filter.value.region) {
    result = result.filter(item => item.region === filter.value.region)
  }
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword) ||
      item.region.toLowerCase().includes(keyword) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(keyword)))
    )
  }
  return result
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

function getParticleStyle(index) {
  const size = Math.random() * 6 + 2
  return {
    width: size + 'px',
    height: size + 'px',
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 10 + 's',
    animationDuration: (Math.random() * 20 + 15) + 's'
  }
}

function getCategoryCount(category) {
  if (!category) return heritageItems.value.length
  return heritageItems.value.filter(item => item.category === category).length
}

function selectCategory(category) {
  filter.value.category = filter.value.category === category ? '' : category
  currentPage.value = 1
}

function handleSearch() {
  currentPage.value = 1
  if (searchKeyword.value) {
    ElMessage.success(`搜索"${searchKeyword.value}"，找到 ${filteredItems.value.length} 个结果`)
  }
}

function quickSearch(tag) {
  searchKeyword.value = tag
  handleSearch()
}

function handleFilter() {
  currentPage.value = 1
  ElMessage.success(`找到 ${filteredItems.value.length} 个符合条件的项目`)
}

function resetFilter() {
  filter.value = { level: '', category: '', region: '' }
  searchKeyword.value = ''
  currentPage.value = 1
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
}

function handleCurrentChange(current) {
  currentPage.value = current
  scrollToTop()
}

function getLevelClass(level) {
  return level === '国家级' ? 'level-national' : 'level-provincial'
}

function goToDetail(item) {
  selectedItem.value = item
  showDetailDialog.value = true
}

function toggleFavorite(item) {
  item.isFavorite = !item.isFavorite
  ElMessage.success(item.isFavorite ? '已添加到收藏' : '已取消收藏')
}

function shareItem(item) {
  if (navigator.share) {
    navigator.share({
      title: item.name,
      text: item.description,
      url: window.location.href
    })
  } else {
    ElMessage.success('链接已复制到剪贴板')
  }
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"%3E%3Crect fill="%23f5f5f5" width="400" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E'
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

function handleScroll() {
  showBackTop.value = window.scrollY > 300
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
.feiyi-container {
  --primary-color: #1a1a1a;
  --accent-color: #C00C00;
  --accent-light: #ff4d4d;
  --accent-gradient: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  --background-color: #FAFAFA;
  --card-bg: #FFFFFF;
  --text-color: #333333;
  --light-text: #666666;
  --border-color: #E8E8E8;
  --sidebar-bg: #F5F5F5;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  min-height: 100vh;
  background-color: var(--background-color);
  font-family: 'Noto Serif SC', 'Source Han Serif SC', '微软雅黑', Arial, sans-serif;
  color: var(--text-color);
  padding-top: 70px;
  position: relative;
  overflow-x: hidden;
}

.floating-particles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  background: var(--accent-color);
  border-radius: 50%;
  opacity: 0.1;
  animation: floatParticle 20s infinite linear;
}

@keyframes floatParticle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.1;
  }
  90% {
    opacity: 0.1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.page-header {
  background-image: url('/background4.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 80px 0 100px;
  position: relative;
  overflow: hidden;
}

.header-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%);
  z-index: 0;
  pointer-events: none;
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
  z-index: 2;
}

.page-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 4px;
  color: white;
  position: relative;
  z-index: 2;
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
  color: white;
  position: relative;
  z-index: 2;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
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

.header-search {
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.search-wrapper {
  display: flex;
  background: white;
  border-radius: 50px;
  padding: 6px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.search-icon {
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-text);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 12px 0;
  color: var(--text-color);
  background: transparent;
}

.search-input::placeholder {
  color: #aaa;
}

.search-btn {
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(192, 12, 0, 0.4);
}

.hot-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.hot-label {
  font-size: 14px;
  opacity: 0.8;
}

.hot-tag {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hot-tag:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: flex;
  gap: 30px;
  position: relative;
  z-index: 1;
}

.left-content {
  flex: 1;
  min-width: 0;
}

.right-sidebar {
  width: 340px;
  flex-shrink: 0;
}

.category-section {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.category-header {
  margin-bottom: 20px;
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: var(--sidebar-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: #fff5f5;
  border-color: rgba(192, 12, 0, 0.3);
}

.category-card.active {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-color: var(--accent-color);
}

.cat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  margin-bottom: 8px;
}

.cat-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 4px;
}

.cat-count {
  font-size: 12px;
  color: var(--light-text);
}

.filter-section {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
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

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-color);
}

.custom-select :deep(.el-input__wrapper) {
  border-radius: var(--radius-sm);
  box-shadow: none;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.custom-select :deep(.el-input__wrapper:hover) {
  border-color: var(--accent-color);
}

.custom-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(192, 12, 0, 0.1);
}

.filter-buttons {
  margin-left: auto;
}

.filter-btn {
  background: var(--accent-gradient);
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 24px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 12, 0, 0.3);
}

.reset-btn {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.reset-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.projects-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--accent-color);
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.result-count {
  font-size: 14px;
  color: var(--light-text);
}

.result-count strong {
  color: var(--accent-color);
  font-size: 18px;
}

.view-modes {
  display: flex;
  gap: 4px;
  background: var(--sidebar-bg);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.view-mode-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--light-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-mode-btn:hover {
  color: var(--accent-color);
}

.view-mode-btn.active {
  background: white;
  color: var(--accent-color);
  box-shadow: var(--shadow-sm);
}

.projects-container {
  min-height: 400px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.projects-list .project-card {
  display: flex;
  flex-direction: row;
}

.projects-list .card-image {
  width: 200px;
  height: 160px;
  flex-shrink: 0;
}

.projects-list .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.projects-list .project-description {
  flex: 1;
}

.project-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
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

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
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

.project-card:hover .card-image img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 20px;
}

.project-card:hover .image-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 12px;
}

.overlay-btn {
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateY(20px);
  opacity: 0;
}

.project-card:hover .overlay-btn {
  transform: translateY(0);
  opacity: 1;
}

.project-card:hover .overlay-btn:nth-child(2) {
  transition-delay: 0.1s;
}

.overlay-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.card-level-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
}

.level-national {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.level-provincial {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.card-category-tag {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

.card-content {
  padding: 20px;
}

.project-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--primary-color);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--light-text);
}

.meta-item svg {
  opacity: 0.6;
}

.project-description {
  font-size: 14px;
  line-height: 1.7;
  color: var(--light-text);
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.card-tag {
  padding: 2px 8px;
  background: var(--sidebar-bg);
  border-radius: 4px;
  font-size: 11px;
  color: var(--light-text);
}

.view-detail {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--accent-color);
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-detail svg {
  transition: transform 0.3s ease;
}

.project-card:hover .view-detail svg {
  transform: translateX(4px);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.pagination-section :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--accent-color);
}

.pagination-section :deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: var(--accent-color);
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--light-text);
}

.empty-icon {
  margin-bottom: 24px;
  color: #ddd;
}

.empty-state h4 {
  font-size: 18px;
  color: var(--text-color);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  margin-bottom: 24px;
}

.reset-empty-btn {
  background: var(--accent-gradient);
  border: none;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  --sidebar-line-height: 1.85;
  --sidebar-letter-spacing: 0.5px;
  --sidebar-transition: 0.25s ease;
}

.sidebar-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: box-shadow var(--sidebar-transition), transform var(--sidebar-transition);
}

.sidebar-card:hover {
  box-shadow: 0 8px 24px rgba(192, 12, 0, 0.08);
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-header svg {
  color: var(--accent-color);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  color: var(--primary-color);
  flex: 1;
  letter-spacing: var(--sidebar-letter-spacing);
  line-height: 1.5;
}

.more-link {
  font-size: 13px;
  color: var(--accent-color);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--sidebar-transition);
  padding: 4px 8px;
  border-radius: 4px;
  letter-spacing: 0.3px;
}

.more-link:hover {
  text-decoration: none;
  background: rgba(192, 12, 0, 0.08);
}

.more-link:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.featured-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.featured-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: var(--sidebar-bg);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--sidebar-transition);
  border: 1px solid transparent;
}

.featured-item:hover {
  background: #fff5f5;
  transform: translateX(4px);
  border-color: rgba(192, 12, 0, 0.15);
  box-shadow: 0 4px 12px rgba(192, 12, 0, 0.06);
}

.featured-item:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.featured-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #B87333);
}

.rank-4 {
  background: linear-gradient(135deg, #87CEEB, #6BB3D9);
}

.featured-image {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-info {
  flex: 1;
  min-width: 0;
}

.featured-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 6px 0;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: var(--sidebar-line-height);
  letter-spacing: var(--sidebar-letter-spacing);
}

.featured-level {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 12px;
  color: white;
  letter-spacing: 0.3px;
}

.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.news-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border-color);
}

.news-item:last-child {
  border-bottom: none;
}

.news-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-color);
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}

.news-content {
  flex: 1;
  min-width: 0;
}

.news-link {
  font-size: 14px;
  color: var(--text-color);
  text-decoration: none;
  display: block;
  margin-bottom: 6px;
  line-height: var(--sidebar-line-height);
  letter-spacing: var(--sidebar-letter-spacing);
  transition: color var(--sidebar-transition);
  cursor: pointer;
}

.news-link:hover {
  color: var(--accent-color);
}

.news-link:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: 2px;
}

.news-date {
  font-size: 12px;
  color: var(--light-text);
  letter-spacing: 0.3px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cloud-tag {
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--sidebar-transition);
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
  letter-spacing: var(--sidebar-letter-spacing);
}

.cloud-tag:hover {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 12, 0, 0.2);
}

.cloud-tag:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.map-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.map-visual {
  background: var(--sidebar-bg);
  border-radius: var(--radius-sm);
  padding: 12px;
}

.jiangsu-map {
  width: 100%;
  height: auto;
}

.map-outline {
  transition: all var(--sidebar-transition);
}

.map-point {
  cursor: pointer;
  transition: all var(--sidebar-transition);
}

.map-point:hover {
  transform: scale(1.5);
}

.map-point:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.map-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--light-text);
  letter-spacing: 0.3px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.national {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.legend-dot.provincial {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.forum-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.forum-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border-color);
}

.forum-item:last-child {
  border-bottom: none;
}

.forum-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-color);
  border-radius: 50%;
  margin-top: 8px;
  flex-shrink: 0;
}

.forum-content {
  flex: 1;
  min-width: 0;
}

.forum-link {
  font-size: 14px;
  color: var(--text-color);
  text-decoration: none;
  display: block;
  margin-bottom: 6px;
  line-height: var(--sidebar-line-height);
  letter-spacing: var(--sidebar-letter-spacing);
  transition: color var(--sidebar-transition);
  cursor: pointer;
}

.forum-link:hover {
  color: var(--accent-color);
}

.forum-link:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: 2px;
}

.forum-date {
  font-size: 12px;
  color: var(--light-text);
  letter-spacing: 0.3px;
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

.detail-content {
  padding: 24px;
}

.detail-header {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border-color);
}

.detail-image {
  width: 200px;
  height: 150px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-level {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.detail-info {
  flex: 1;
}

.detail-info h3 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--primary-color);
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--sidebar-bg);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-color);
}

.meta-tag svg {
  color: var(--accent-color);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  padding: 4px 12px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border: 1px solid rgba(192, 12, 0, 0.2);
  border-radius: 20px;
  font-size: 12px;
  color: var(--accent-color);
}

.detail-body {
  margin-bottom: 24px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--primary-color);
}

.detail-section h4 svg {
  color: var(--accent-color);
}

.detail-section p {
  font-size: 14px;
  line-height: 1.8;
  color: var(--light-text);
  margin: 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  color: var(--light-text);
}

.feature-icon {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  color: var(--accent-color);
}

.detail-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
}

.action-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.action-btn.primary {
  background: var(--accent-gradient);
  border: none;
  color: white;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(192, 12, 0, 0.3);
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
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.grid-fade-enter-active,
.grid-fade-leave-active {
  transition: all 0.4s ease;
}

.grid-fade-enter-from,
.grid-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.list-fade-enter-active,
.list-fade-leave-active {
  transition: all 0.4s ease;
}

.list-fade-enter-from,
.list-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .right-sidebar {
    width: 100%;
  }
  
  .sidebar-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .sidebar-card {
    padding: 20px;
  }
  
  .sidebar-title {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 60px 0 80px;
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
  
  .search-wrapper {
    flex-direction: column;
    border-radius: var(--radius-md);
  }
  
  .search-btn {
    margin-top: 8px;
    border-radius: var(--radius-sm);
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-form {
    flex-direction: column;
  }
  
  .filter-buttons {
    margin-left: 0;
    width: 100%;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-list .project-card {
    flex-direction: column;
  }
  
  .projects-list .card-image {
    width: 100%;
    height: 180px;
  }
  
  .sidebar-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .sidebar-card {
    padding: 18px;
  }
  
  .sidebar-title {
    font-size: 15px;
  }
  
  .featured-title,
  .news-link,
  .forum-link {
    font-size: 13px;
    line-height: 1.75;
  }
  
  .cloud-tag {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .detail-header {
    flex-direction: column;
  }
  
  .detail-image {
    width: 100%;
    height: 200px;
  }
  
  .detail-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>