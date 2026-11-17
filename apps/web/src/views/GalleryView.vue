<template>
  <div class="gallery-container culture-chapter">
    <CultureChapterHeader kind="works" />


    <div class="main-content">
      <div class="community-sidebar" v-if="activeUsers.length || popularTags.length">
        <div class="sidebar-section active-users">
          <h3 class="sidebar-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            活跃创作者
          </h3>
          <div class="active-users-list">
            <div 
              class="active-user-item" 
              v-for="user in activeUsers" 
              :key="user.id"
              @click="viewUserProfile(user)"
            >
              <div class="user-avatar-wrapper" :class="{ online: user.isOnline }">
                <img :src="user.avatar" :alt="user.name" class="user-avatar">
                <span class="online-dot" v-if="user.isOnline"></span>
              </div>
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-works">{{ user.worksCount }} 作品</span>
              </div>
              <button 
                class="follow-btn" 
                :class="{ following: user.isFollowing }"
                @click.stop="toggleFollow(user)"
              >
                {{ user.isFollowing ? '已关注' : '关注' }}
              </button>
            </div>
          </div>
        </div>

        <div class="sidebar-section hot-tags">
          <h3 class="sidebar-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12L2 2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="7" cy="7" r="1" fill="currentColor"/>
            </svg>
            热门标签
          </h3>
          <div class="tag-cloud">
            <span 
              v-for="tag in popularTags" 
              :key="tag.name"
              class="tag-item"
              :class="{ active: selectedTags.includes(tag.name) }"
              @click="toggleTag(tag.name)"
            >
              #{{ tag.name }}
              <span class="tag-count">{{ tag.count }}</span>
            </span>
          </div>
        </div>
      </div>

      <div class="gallery-main">
        <div class="toolbar">
          <div class="search-section">
            <div class="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="搜索作品、作者或标签..." 
                @input="handleSearch"
              >
              <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-tabs">
              <button 
                v-for="category in categories" 
                :key="category.value"
                class="filter-tab"
                :class="{ active: selectedCategory === category.value }"
                @click="selectCategory(category.value)"
              >
                {{ category.label }}
              </button>
            </div>
            
            <div class="view-toggle">
              <button 
                class="toggle-btn" 
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button 
                class="toggle-btn" 
                :class="{ active: viewMode === 'waterfall' }"
                @click="viewMode = 'waterfall'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="5" height="8" stroke="currentColor" stroke-width="2"/>
                  <rect x="10" y="3" width="5" height="12" stroke="currentColor" stroke-width="2"/>
                  <rect x="17" y="3" width="5" height="6" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="13" width="5" height="8" stroke="currentColor" stroke-width="2"/>
                  <rect x="17" y="11" width="5" height="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="upload-section" v-if="isLoggedIn">
          <BrandButton class="chapter-upload" @click="showUploadDialog = true">上传作品</BrandButton>
        </div>

        <transition name="fade" mode="out-in">
          <div :key="filterKey" class="gallery-content" ref="galleryContent">
            <CulturePageState :loading="pageLoading" :error="loadError" :empty="!filteredWorks.length" @retry="loadWorks" @reset="clearGalleryFilters" />

            <div v-if="filteredWorks.length" :class="['works-grid', viewMode]">
              <div 
                v-for="(work, index) in displayedWorks" 
                :key="work.id"
                class="work-card" role="button" tabindex="0" @keydown.enter.self="openWorkDetail(work)" @keydown.space.self.prevent="openWorkDetail(work)"
                :style="{ animationDelay: `${index * 0.05}s` }"
                @click="openWorkDetail(work)"
              >
                <div class="work-image" :style="viewMode === 'waterfall' ? { height: work.imageHeight + 'px' } : {}">
                  <img 
                    :src="work.imageUrl" 
                    :alt="work.title" 
                    loading="lazy"
                    :data-src="work.imageUrl"
                    @error="handleImageError"
                    @load="handleImageLoad($event, work)"
                  >
                  <div class="image-overlay">
                    <div class="overlay-actions">
                      <button class="action-btn" @click.stop="likeWork(work)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" :fill="work.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <span>{{ work.likes }}</span>
                      </button>
                      <button class="action-btn" @click.stop="collectWork(work)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" :fill="work.isCollected ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </button>
                      <button class="action-btn" @click.stop="openCommentPanel(work)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span>{{ work.comments?.length || 0 }}</span>
                      </button>
                    </div>
                  </div>
                  <div class="work-category" v-if="work.category">{{ getCategoryLabel(work.category) }}</div>
                </div>
                <div class="work-info">
                  <h4 class="work-title">{{ work.title }}</h4>
                  <p class="work-desc" v-if="work.description">{{ work.description }}</p>
                  <div class="work-tags" v-if="work.tags && work.tags.length > 0">
                    <span class="work-tag" v-for="tag in work.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
                  </div>
                  <div class="work-meta">
                    <div class="author-info" @click.stop="viewUserProfile(work)">
                      <img :src="work.authorAvatar || defaultAvatar" :alt="work.author" class="author-avatar">
                      <div class="author-details">
                        <span class="author-name">{{ work.author }}</span>
                        <span class="upload-time">{{ formatTime(work.createTime) }}</span>
                      </div>
                    </div>
                    <div class="work-stats">
                      <span class="stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        {{ work.views }}
                      </span>
                      <span class="stat">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        {{ work.likes }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isLoadingMore" class="loading-more">
              <div class="loading-spinner"></div>
              <span>加载更多作品...</span>
            </div>

            <div v-if="!hasMore && filteredWorks.length > 0" class="no-more">
              <span>已经到底啦 ~</span>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <el-dialog
      v-model="showUploadDialog"
      title="上传作品"
      width="min(700px, calc(100vw - 32px))"
      class="upload-dialog"
      destroy-on-close
      @closed="resetUploadDialog"
    >
      <div class="upload-form">
        <div 
          class="upload-area" 
          :class="{ 'drag-over': isDragOver, 'has-files': uploadFiles.length > 0 }"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input 
            type="file" 
            ref="fileInput" 
            accept=".jpg,.jpeg,.png" 
            multiple
            hidden 
            @change="handleFileSelect"
          >
          <div v-if="uploadFiles.length === 0" class="upload-placeholder">
            <div class="upload-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="upload-title">点击或拖拽图片到此处上传</p>
            <p class="upload-hint">支持 JPG、JPEG、PNG 格式，单张不超过 5MB</p>
            <p class="upload-hint">可同时上传多张图片</p>
          </div>
          <div v-else class="preview-grid">
            <div 
              v-for="(file, index) in uploadFiles" 
              :key="index" 
              class="preview-item"
              :class="{ 'uploading': file.status === 'uploading', 'success': file.status === 'success', 'error': file.status === 'error' }"
            >
              <img :src="file.preview" :alt="file.name">
              <div class="preview-overlay">
                <div v-if="file.status === 'uploading'" class="progress-ring">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e5e5" stroke-width="3"/>
                    <circle 
                      cx="18" cy="18" r="16" 
                      fill="none" 
                      stroke="#FF6B35" 
                      stroke-width="3"
                      stroke-linecap="round"
                      :stroke-dasharray="`${file.progress}, 100`"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <span class="progress-text">{{ file.progress }}%</span>
                </div>
                <div v-else-if="file.status === 'success'" class="status-icon success">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div v-else-if="file.status === 'error'" class="status-icon error">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                  </svg>
                </div>
                <button class="remove-btn" @click.stop="removeFile(index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <div class="file-name">{{ file.name }}</div>
            </div>
            <div class="add-more-btn" @click.stop="triggerFileInput">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>添加更多</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>作品标题 <span class="required">*</span></label>
          <input type="text" v-model="uploadForm.title" placeholder="请输入作品标题" maxlength="50">
          <span class="char-count">{{ uploadForm.title.length }}/50</span>
        </div>

        <div class="form-group">
          <label>作品描述</label>
          <textarea v-model="uploadForm.description" placeholder="请输入作品描述..." maxlength="200" rows="3"></textarea>
          <span class="char-count">{{ uploadForm.description.length }}/200</span>
        </div>

        <div class="form-group">
          <label>作品分类 <span class="required">*</span></label>
          <select v-model="uploadForm.category">
            <option value="">请选择分类</option>
            <option v-for="cat in categories.slice(1)" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>标签</label>
          <div class="tags-input">
            <div class="tags-list">
              <span v-for="(tag, index) in uploadForm.tags" :key="index" class="tag">
                {{ tag }}
                <button @click="removeTag(index)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </span>
            </div>
            <input 
              type="text" 
              v-model="tagInput" 
              placeholder="输入标签后按回车添加"
              @keydown.enter.prevent="addTag"
              maxlength="20"
            >
          </div>
          <div class="suggested-tags">
            <span class="suggest-label">推荐标签：</span>
            <span 
              v-for="tag in suggestedTags" 
              :key="tag" 
              class="suggest-tag"
              @click="addSuggestedTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="form-group inline">
          <label class="checkbox-label">
            <input type="checkbox" v-model="uploadForm.isPublic">
            <span class="checkmark"></span>
            <span>公开显示（其他用户可见）</span>
          </label>
        </div>
      </div>

      <template #footer>
        <button class="cancel-btn" @click="closeUploadDialog">取消</button>
        <button class="submit-btn" @click="submitWorks" :disabled="!canSubmit || isUploading">
          <svg v-if="!isUploading" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M17 8L12 3L7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 3V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="btn-loading"></div>
          {{ isUploading ? '上传中...' : '发布作品' }}
        </button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showDetailDialog"
      :title="selectedWork?.title || '作品详情'"
      width="900px"
      class="detail-dialog"
      destroy-on-close
    >
      <div v-if="selectedWork" class="work-detail">
        <div class="detail-image">
          <img :src="selectedWork.imageUrl" :alt="selectedWork.title">
        </div>
        <div class="detail-info">
          <div class="detail-author">
            <img :src="selectedWork.authorAvatar || defaultAvatar" :alt="selectedWork.author">
            <div class="author-meta">
              <span class="author-name">{{ selectedWork.author }}</span>
              <span class="publish-time">{{ selectedWork.createTime }}</span>
            </div>
            <button 
              v-if="!isAuthor(selectedWork)" 
              class="follow-btn"
              :class="{ following: selectedWork.isFollowing }"
              @click="toggleFollowWork(selectedWork)"
            >
              {{ selectedWork.isFollowing ? '已关注' : '关注' }}
            </button>
          </div>
          <p class="detail-desc">{{ selectedWork.description || '暂无描述' }}</p>
          <div class="detail-tags" v-if="selectedWork.tags && selectedWork.tags.length > 0">
            <span class="detail-tag" v-for="tag in selectedWork.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="detail-stats">
            <div class="stat-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ selectedWork.views }} 浏览</span>
            </div>
            <div class="stat-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ selectedWork.likes }} 喜欢</span>
            </div>
            <div class="stat-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ selectedWork.collects }} 收藏</span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="action-btn primary" @click="likeWork(selectedWork)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" :fill="selectedWork.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ selectedWork.isLiked ? '已喜欢' : '喜欢' }}
            </button>
            <button class="action-btn" @click="collectWork(selectedWork)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" :fill="selectedWork.isCollected ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ selectedWork.isCollected ? '已收藏' : '收藏' }}
            </button>
            <button class="action-btn" @click="openCommentPanel(selectedWork)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              评论
            </button>
            <button class="action-btn" @click="downloadWork(selectedWork)" v-if="selectedWork.allowDownload">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              下载
            </button>
          </div>
          <div class="detail-manage" v-if="isAuthor(selectedWork)">
            <button class="manage-btn edit" @click="editWork(selectedWork)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              编辑
            </button>
            <button class="manage-btn delete" @click="deleteWork(selectedWork)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              删除
            </button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-drawer
      v-model="showCommentDrawer"
      title="评论"
      direction="rtl"
      size="400px"
      class="comment-drawer"
    >
      <div v-if="commentWork" class="comment-panel">
        <div class="comment-input-area">
          <img :src="currentUserAvatar" class="comment-avatar">
          <div class="comment-input-wrapper">
            <textarea 
              v-model="newComment" 
              placeholder="写下你的评论..."
              rows="3"
              maxlength="500"
            ></textarea>
            <button class="send-btn" @click="submitComment" :disabled="!newComment.trim()">
              发送
            </button>
          </div>
        </div>
        <div class="comments-list">
          <div 
            v-for="comment in commentWork.comments" 
            :key="comment.id" 
            class="comment-item"
          >
            <img :src="comment.userAvatar" class="comment-avatar">
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-username">{{ comment.userName }}</span>
                <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <button class="comment-action-btn" @click="likeComment(comment)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ comment.likes }}
                </button>
                <button class="comment-action-btn" @click="replyComment(comment)">
                  回复
                </button>
              </div>
            </div>
          </div>
          <div v-if="!commentWork.comments?.length" class="no-comments">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>暂无评论，来发表第一条评论吧！</p>
          </div>
        </div>
      </div>
    </el-drawer>

    <transition name="fade">
      <div class="back-to-top" v-show="showBackTop" @click="scrollToTop">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </transition>

    <transition name="success-fade">
      <div v-if="showSuccessAnimation" class="success-overlay">
        <div class="success-content">
          <div class="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="success-text">上传成功！</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import BrandButton from "@/components/BrandButton.vue"
import CultureChapterHeader from "@/components/CultureChapterHeader.vue"
import CulturePageState from "@/components/CulturePageState.vue"
import { ref, computed, onMounted, onUnmounted, h, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { del, get, post, upload } from '@/utils/api/request'

const titleChars = '江苏图库'.split('')
const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars/svg?seed=user'
const showBackTop = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedTags = ref([])
const viewMode = ref('grid')
const currentPage = ref(1)
const pageSize = 12
const displayCount = ref(pageSize)
const isLoadingMore = ref(false)

const showUploadDialog = ref(false)
const showDetailDialog = ref(false)
const showCommentDrawer = ref(false)
const selectedWork = ref(null)
const commentWork = ref(null)
const isDragOver = ref(false)
const tagInput = ref('')
const fileInput = ref(null)
const galleryContent = ref(null)
const showSuccessAnimation = ref(false)
const isUploading = ref(false)

const uploadFiles = ref([])
const newComment = ref('')

const isLoggedIn = computed(() => localStorage.getItem('isLogin') === 'true')
const currentUsername = computed(() => localStorage.getItem('username') || '游客')
const currentUserAvatar = computed(() => localStorage.getItem('avatar') || defaultAvatar)

const animatedStats = ref([0, 0, 0])

const statsData = [
  { value: 0, label: '公开作品', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
    h('circle', { cx: 8.5, cy: 8.5, r: 1.5, fill: 'currentColor' }),
    h('path', { d: 'M21 15L16 10L5 21', stroke: 'currentColor', 'stroke-width': 2 })
  ])},
  { value: 0, label: '创作者', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('path', { d: 'M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z', stroke: 'currentColor', 'stroke-width': 2 }),
    h('circle', { cx: 12, cy: 10, r: 3, stroke: 'currentColor', 'stroke-width': 2 })
  ])},
  { value: 0, label: '主题分类', icon: h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' }, [
    h('rect', { x: 3, y: 3, width: 7, height: 7, stroke: 'currentColor', 'stroke-width': 2 }),
    h('rect', { x: 14, y: 3, width: 7, height: 7, stroke: 'currentColor', 'stroke-width': 2 }),
    h('rect', { x: 3, y: 14, width: 7, height: 7, stroke: 'currentColor', 'stroke-width': 2 }),
    h('rect', { x: 14, y: 14, width: 7, height: 7, stroke: 'currentColor', 'stroke-width': 2 })
  ])}
]

const categories = [
  { value: '', label: '全部' },
  { value: 'landscape', label: '地理风貌' },
  { value: 'heritage', label: '名胜古迹' },
  { value: 'culture', label: '历史文化' },
  { value: 'modern', label: '现代发展' },
  { value: 'folk', label: '民俗风情' },
  { value: 'art', label: '艺术创作' },
  { value: 'food', label: '美食文化' }
]

const popularTags = computed(() => {
  const counts = new Map()
  for (const work of works.value) for (const tag of work.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }))
})

const suggestedTags = ['江苏风光', '江南水乡', '古典园林', '非遗文化', '南京', '苏州', '扬州', '无锡', '太湖', '大运河', '江苏美食']

const activeUsers = computed(() => {
  const users = new Map()
  for (const work of works.value) {
    const name = work.author
    const entry = users.get(name) || { id: name, name, avatar: work.authorAvatar, worksCount: 0, isOnline: false, isFollowing: false }
    entry.worksCount++
    users.set(name, entry)
  }
  return [...users.values()].sort((a, b) => b.worksCount - a.worksCount).slice(0, 5)
})

const uploadForm = ref({
  title: '',
  description: '',
  category: '',
  tags: [],
  isPublic: true,
  allowDownload: false
})

const works = ref([])
const pageLoading = ref(true)
const loadError = ref('')

async function loadWorks() {
  pageLoading.value = true
  loadError.value = ''
  const all = []
  for (let pageNum = 1; ; pageNum++) {
    const result = await get('/works/list', { pageNum, pageSize: 100 })
    if (result.code !== 200) { loadError.value = result.message || '图库加载失败'; pageLoading.value = false; return }
    all.push(...(result.data.records || []))
    if (pageNum >= result.data.pages) break
  }
  pageLoading.value = false
  works.value = all.map((work) => ({
    ...work,
    author: work.userNickname || '用户',
    authorAvatar: work.userAvatar || defaultAvatar,
    likes: work.likeCount || 0,
    views: work.viewCount || 0,
    collects: work.collectCount || 0,
    tags: Array.isArray(work.tags) ? work.tags : [],
    comments: [],
    isLiked: false,
    isCollected: false,
    isFollowing: false,
    imageHeight: 200,
  }))
  statsData[0].value = works.value.length
  statsData[1].value = new Set(works.value.map((work) => work.author)).size
  statsData[2].value = new Set(works.value.map((work) => work.category).filter(Boolean)).size
  animateStats()
}

function clearGalleryFilters() { searchQuery.value = ''; selectedCategory.value = ''; selectedTags.value = []; displayCount.value = pageSize }

const filterKey = computed(() => `${selectedCategory.value}-${selectedTags.value.join(',')}-${searchQuery.value}`)

const filteredWorks = computed(() => {
  let result = works.value.filter(w => w.isPublic)
  
  if (selectedCategory.value) {
    result = result.filter(w => w.category === selectedCategory.value)
  }
  
  if (selectedTags.value.length > 0) {
    result = result.filter(w => 
      selectedTags.value.some(tag => w.tags.includes(tag))
    )
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(w => 
      w.title.toLowerCase().includes(query) ||
      w.author.toLowerCase().includes(query) ||
      w.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  return result
})

const displayedWorks = computed(() => {
  return filteredWorks.value.slice(0, displayCount.value)
})

const hasMore = computed(() => displayCount.value < filteredWorks.value.length)

const canSubmit = computed(() => {
  return uploadForm.value.title && 
         uploadForm.value.category && 
         uploadFiles.value.length > 0 &&
         uploadFiles.value.every(f => f.status !== 'error')
})

function getCategoryLabel(value) {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}

function selectCategory(value) {
  selectedCategory.value = value
  displayCount.value = pageSize
}

function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  displayCount.value = pageSize
}

function handleSearch() {
  displayCount.value = pageSize
}

function clearSearch() {
  searchQuery.value = ''
  displayCount.value = pageSize
}

function openWorkDetail(work) {
  selectedWork.value = work
  showDetailDialog.value = true
}

async function likeWork(work) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  const result = await post(`/works/like/${work.id}`)
  if (result.code !== 200) { ElMessage.error(result.message || '点赞失败'); return }
  work.isLiked = result.data.liked
  work.likes = Math.max(0, work.likes + (work.isLiked ? 1 : -1))
  ElMessage.success(result.message)
}

async function collectWork(work) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  const result = await post('/collections/toggle', { targetType: 'work', targetId: work.id })
  if (result.code !== 200) { ElMessage.error(result.message || '收藏失败'); return }
  work.isCollected = result.data
  work.collects = Math.max(0, work.collects + (work.isCollected ? 1 : -1))
  ElMessage.success(result.message)
}

function downloadWork(work) {
  const link = document.createElement('a')
  link.href = work.imageUrl
  link.download = `${work.title}.jpg`
  link.click()
  ElMessage.success('开始下载')
}

function isAuthor(work) {
  return work.author === currentUsername.value
}

function editWork(work) {
  ElMessage.info('编辑功能开发中')
}

function deleteWork(work) {
  ElMessageBox.confirm('确定要删除这个作品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await del(`/works/${work.id}`)
    if (result.code !== 200) { ElMessage.error(result.message || '删除失败'); return }
    await loadWorks()
    showDetailDialog.value = false
    ElMessage.success('删除成功')
  }).catch(() => {})
}

function viewUserProfile(user) {
  ElMessage.info(`查看 ${user.name || user.author} 的主页`)
}

function toggleFollow(user) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  ElMessage.info('关注功能尚未开放')
}

function toggleFollowWork(work) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  ElMessage.info('关注功能尚未开放')
}

async function openCommentPanel(work) {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  commentWork.value = work
  showCommentDrawer.value = true
  const result = await get('/comments/list', { targetType: 'work', targetId: work.id, pageSize: 100 })
  if (result.code === 200) work.comments = (result.data.records || []).map((item) => ({ ...item, userName: item.userNickname, likes: item.likeCount || 0 }))
  else ElMessage.error(result.message || '评论加载失败')
}

async function submitComment() {
  if (!newComment.value.trim()) return
  const result = await post('/comments', { targetType: 'work', targetId: commentWork.value.id, content: newComment.value.trim() })
  if (result.code !== 200) { ElMessage.error(result.message || '评论失败'); return }
  newComment.value = ''
  const list = await get('/comments/list', { targetType: 'work', targetId: commentWork.value.id, pageSize: 100 })
  if (list.code === 200) commentWork.value.comments = (list.data.records || []).map((item) => ({ ...item, userName: item.userNickname, likes: item.likeCount || 0 }))
  ElMessage.success('评论成功')
}

async function likeComment(comment) {
  const result = await post(`/comments/like/${comment.id}`)
  if (result.code !== 200) { ElMessage.error(result.message || '点赞失败'); return }
  comment.likes = Math.max(0, comment.likes + (result.data.liked ? 1 : -1))
}

function replyComment(comment) {
  newComment.value = `@${comment.userName} `
}

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes <= 1 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`
  } else {
    return time
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleDragOver(e) {
  isDragOver.value = true
}

function handleDragLeave(e) {
  isDragOver.value = false
}

function handleDrop(event) {
  isDragOver.value = false
  const files = event.dataTransfer.files
  processFiles(files)
}

function handleFileSelect(event) {
  const files = event.target.files
  processFiles(files)
}

function processFiles(files) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  const maxSize = 5 * 1024 * 1024
  
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      ElMessage.error(`${file.name} 格式不支持，仅支持 JPG、JPEG、PNG 格式`)
      continue
    }
    
    if (file.size > maxSize) {
      ElMessage.error(`${file.name} 大小超过 5MB 限制`)
      continue
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadFiles.value.push({
        file: file,
        name: file.name,
        preview: e.target.result,
        status: 'pending',
        progress: 0
      })
    }
    reader.readAsDataURL(file)
  }
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function removeFile(index) {
  uploadFiles.value.splice(index, 1)
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !uploadForm.value.tags.includes(tag) && uploadForm.value.tags.length < 5) {
    uploadForm.value.tags.push(tag)
    tagInput.value = ''
  }
}

function addSuggestedTag(tag) {
  if (!uploadForm.value.tags.includes(tag) && uploadForm.value.tags.length < 5) {
    uploadForm.value.tags.push(tag)
  }
}

function removeTag(index) {
  uploadForm.value.tags.splice(index, 1)
}

function closeUploadDialog() {
  showUploadDialog.value = false
  resetUploadDialog()
}

function resetUploadDialog() {
  uploadForm.value = {
    title: '',
    description: '',
    category: '',
    tags: [],
    isPublic: true,
    allowDownload: false
  }
  uploadFiles.value = []
  tagInput.value = ''
}

async function submitWorks() {
  if (!canSubmit.value || isUploading.value) return
  isUploading.value = true
  let succeeded = 0
  try {
    for (const file of uploadFiles.value) {
      let path = ''
      try {
        file.status = 'uploading'
        const image = await upload('/works/upload', file.file)
        if (image.code !== 200) throw new Error(image.message || '图片上传失败')
        path = image.data.path
        const saved = await post('/works', {
          title: uploadForm.value.title,
          description: uploadForm.value.description,
          imagePath: path,
          category: uploadForm.value.category,
          tags: uploadForm.value.tags,
          isPublic: uploadForm.value.isPublic,
          allowDownload: uploadForm.value.allowDownload,
        })
        if (saved.code !== 200) throw new Error(saved.message || '作品保存失败')
        path = ''
        file.status = 'success'
        succeeded++
      } catch (error) {
        file.status = 'error'
        if (path) await del(`/works/upload?path=${encodeURIComponent(path)}`)
        ElMessage.error(`${file.name}：${error.message}`)
      }
    }
    if (succeeded) {
      await loadWorks()
      showUploadDialog.value = false
      resetUploadDialog()
      showSuccessAnimation.value = true
      setTimeout(() => { showSuccessAnimation.value = false }, 2000)
      ElMessage.success(`成功发布 ${succeeded} 个作品`)
    }
  } finally { isUploading.value = false }
}

function handleImageError(e) {
  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f5f5f5" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E'
}

function handleImageLoad(event, work) {
  const img = event.target
  if (viewMode.value === 'waterfall' && img.naturalHeight) {
    const aspectRatio = img.naturalHeight / img.naturalWidth
    work.imageHeight = Math.max(150, Math.min(300, 280 * aspectRatio))
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  showBackTop.value = window.scrollY > 300
  
  if (galleryContent.value) {
    const rect = galleryContent.value.getBoundingClientRect()
    const bottomDistance = window.innerHeight - rect.bottom
    
    if (bottomDistance > 200 && hasMore.value && !isLoadingMore.value) {
      loadMore()
    }
  }
}

function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  
  setTimeout(() => {
    displayCount.value += pageSize
    isLoadingMore.value = false
  }, 500)
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
  loadWorks()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.gallery-container {
  --primary-color: #2D3436;
  --accent-color: #FF6B35;
  --accent-light: #FF8C5A;
  --accent-gradient: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  --warm-bg: #FFF8F0;
  --card-bg: #FFFFFF;
  --text-color: #2D3436;
  --light-text: #636E72;
  --border-color: #FFE0D0;
  --sidebar-bg: #FFF5EE;
  --shadow-sm: 0 2px 8px rgba(255, 107, 53, 0.08);
  --shadow-md: 0 4px 16px rgba(255, 107, 53, 0.12);
  --shadow-lg: 0 8px 32px rgba(255, 107, 53, 0.16);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  min-height: 100vh;
  background-color: var(--warm-bg);
  font-family: 'Noto Serif SC', 'Source Han Serif SC', '微软雅黑', Arial, sans-serif;
  color: var(--text-color);
  padding-top: 70px;
  position: relative;
  overflow-x: hidden;
}

.page-header {
  background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 20%, #1E293B 40%, #172554 60%, #0C1929 80%, #0A1628 100%);
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
  background-image: url('/background5.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.3;
  box-sizing: content-box;
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
  display: flex;
  gap: 24px;
}

.community-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-section {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-color);
}

.sidebar-title svg {
  color: var(--accent-color);
}

.active-users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.active-user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.active-user-item:hover {
  background: var(--sidebar-bg);
}

.user-avatar-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #4CAF50;
  border-radius: 50%;
  border: 2px solid white;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-works {
  font-size: 12px;
  color: var(--light-text);
}

.follow-btn {
  padding: 6px 12px;
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.follow-btn:hover {
  transform: scale(1.05);
}

.follow-btn.following {
  background: var(--sidebar-bg);
  color: var(--light-text);
  border: 1px solid var(--border-color);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--sidebar-bg);
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background: #FFE8DC;
  color: var(--accent-color);
}

.tag-item.active {
  background: var(--accent-gradient);
  color: white;
}

.tag-count {
  font-size: 11px;
  opacity: 0.7;
}

.gallery-main {
  flex: 1;
  min-width: 0;
}

.toolbar {
  background: var(--card-bg);
  padding: 24px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.search-section {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--sidebar-bg);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  gap: 12px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  background: white;
  box-shadow: 0 0 0 2px var(--accent-color);
}

.search-box svg {
  color: var(--light-text);
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-color);
  outline: none;
}

.search-box input::placeholder {
  color: var(--light-text);
}

.clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--light-text);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  color: var(--accent-color);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 8px 16px;
  background: var(--sidebar-bg);
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: #FFE8DC;
  color: var(--accent-color);
}

.filter-tab.active {
  background: var(--accent-gradient);
  color: white;
}

.view-toggle {
  display: flex;
  gap: 4px;
  background: var(--sidebar-bg);
  padding: 4px;
  border-radius: var(--radius-sm);
}

.toggle-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--light-text);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: var(--accent-color);
}

.toggle-btn.active {
  background: white;
  color: var(--accent-color);
  box-shadow: var(--shadow-sm);
}

.upload-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.gallery-content {
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

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--light-text);
}

.empty-state svg {
  color: #ddd;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

.works-grid {
  display: grid;
  gap: 24px;
}

.works-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.works-grid.waterfall {
  column-count: 3;
  column-gap: 24px;
}

.work-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.works-grid.waterfall .work-card {
  break-inside: avoid;
  margin-bottom: 24px;
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

.work-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}

.work-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.work-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.work-card:hover .work-image img {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.work-card:hover .image-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 12px;
}

.overlay-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.overlay-actions .action-btn:hover {
  background: var(--accent-color);
  color: white;
}

.work-category {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  background: var(--accent-gradient);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
}

.work-info {
  padding: 16px;
}

.work-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--primary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--light-text);
  margin: 0 0 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.work-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.work-tag {
  padding: 2px 8px;
  background: var(--sidebar-bg);
  border-radius: 10px;
  font-size: 11px;
  color: var(--accent-color);
}

.work-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.author-info:hover .author-name {
  color: var(--accent-color);
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 13px;
  color: var(--text-color);
  transition: color 0.3s ease;
}

.upload-time {
  font-size: 11px;
  color: var(--light-text);
}

.work-stats {
  display: flex;
  gap: 12px;
}

.work-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--light-text);
}

.work-stats .stat svg {
  color: var(--light-text);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: var(--light-text);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.no-more {
  text-align: center;
  padding: 30px;
  color: var(--light-text);
  font-size: 14px;
}

.upload-dialog :deep(.el-dialog__header) {
  background: var(--accent-gradient);
  color: white;
  padding: 20px;
  margin-right: 0;
}

.upload-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.upload-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.upload-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.upload-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--sidebar-bg);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--accent-color);
  background: #FFF5EE;
}

.upload-area.has-files {
  padding: 20px;
}

.upload-placeholder {
  color: var(--light-text);
}

.upload-icon {
  margin-bottom: 16px;
}

.upload-icon svg {
  color: var(--accent-color);
}

.upload-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: var(--text-color);
}

.upload-hint {
  font-size: 13px;
  margin: 4px 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--sidebar-bg);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-item:hover .preview-overlay,
.preview-item.uploading .preview-overlay,
.preview-item.success .preview-overlay,
.preview-item.error .preview-overlay {
  opacity: 1;
}

.progress-ring {
  position: relative;
  width: 50px;
  height: 50px;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.success {
  background: #4CAF50;
  color: white;
}

.status-icon.error {
  background: #f56c6c;
  color: white;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-item:hover .remove-btn {
  opacity: 1;
}

.file-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-more-btn {
  aspect-ratio: 1;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--light-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-more-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.add-more-btn span {
  font-size: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.form-group label .required {
  color: var(--accent-color);
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: 12px;
  font-size: 12px;
  color: var(--light-text);
}

.form-group.inline {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent-color);
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  min-height: 44px;
  background: white;
}

.tags-input:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags-list .tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--accent-gradient);
  color: white;
  border-radius: 20px;
  font-size: 13px;
}

.tags-list .tag button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.tags-input input {
  flex: 1;
  min-width: 100px;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
  background: transparent;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.suggest-label {
  font-size: 13px;
  color: var(--light-text);
}

.suggest-tag {
  padding: 4px 10px;
  background: var(--sidebar-bg);
  border-radius: 20px;
  font-size: 12px;
  color: var(--light-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.suggest-tag:hover {
  background: #FFE8DC;
  color: var(--accent-color);
}

.cancel-btn {
  padding: 10px 20px;
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: var(--border-color);
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--accent-gradient);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

.work-detail {
  display: flex;
  flex-direction: column;
}

.detail-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  padding: 24px;
}

.detail-author {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-author img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border-color);
}

.author-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-meta .author-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
}

.publish-time {
  font-size: 12px;
  color: var(--light-text);
}

.detail-desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-color);
  margin: 0 0 16px 0;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-tag {
  padding: 4px 12px;
  background: var(--sidebar-bg);
  border-radius: 20px;
  font-size: 13px;
  color: var(--accent-color);
}

.detail-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.detail-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  padding: 0;
  color: var(--light-text);
}

.detail-stats .stat-item svg {
  color: var(--accent-color);
}

.detail-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.detail-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.detail-actions .action-btn:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.detail-actions .action-btn.primary {
  background: var(--accent-gradient);
  border: none;
  color: white;
}

.detail-actions .action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.detail-manage {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.manage-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.manage-btn.edit {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

.manage-btn.edit:hover {
  background: var(--accent-color);
  color: white;
}

.manage-btn.delete {
  color: #f56c6c;
  border-color: #f56c6c;
}

.manage-btn.delete:hover {
  background: #f56c6c;
  color: white;
}

.comment-drawer :deep(.el-drawer__header) {
  background: var(--accent-gradient);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.comment-drawer :deep(.el-drawer__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.comment-panel {
  padding: 20px;
}

.comment-input-area {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-input-wrapper textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.comment-input-wrapper textarea:focus {
  outline: none;
  border-color: var(--accent-color);
}

.send-btn {
  align-self: flex-end;
  padding: 8px 20px;
  background: var(--accent-gradient);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.comment-time {
  font-size: 12px;
  color: var(--light-text);
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--light-text);
  cursor: pointer;
  padding: 0;
}

.comment-action-btn:hover {
  color: var(--accent-color);
}

.no-comments {
  text-align: center;
  padding: 40px;
  color: var(--light-text);
}

.no-comments svg {
  color: #ddd;
  margin-bottom: 12px;
}

.no-comments p {
  margin: 0;
  font-size: 14px;
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

.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.success-content {
  background: white;
  padding: 40px 60px;
  border-radius: var(--radius-lg);
  text-align: center;
  animation: successPop 0.5s ease;
}

@keyframes successPop {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  color: #4CAF50;
  margin-bottom: 16px;
}

.success-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.success-fade-enter-active,
.success-fade-leave-active {
  transition: opacity 0.3s ease;
}

.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .community-sidebar {
    display: none;
  }
  
  .works-grid.waterfall {
    column-count: 2;
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
  
  .filter-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .works-grid.grid,
  .works-grid.waterfall {
    grid-template-columns: 1fr;
    column-count: 1;
  }
  
  .detail-actions {
    flex-wrap: wrap;
  }
  
  .detail-actions .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
  }
  
  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }
}
</style>

<style scoped src="@/styles/culture-chapters.css"></style>
