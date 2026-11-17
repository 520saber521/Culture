<template>
  <div class="traditional-arts-container culture-chapter">
    <!-- 页面头部 -->
    <CultureChapterHeader kind="arts" />


    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 筛选区域 -->
      <section class="filter-section">
        <div class="filter-container">
          <h3 class="section-title">艺术分类</h3>
          <el-form :inline="true" class="filter-form">
            <el-form-item label="艺术类型">
              <el-select v-model="filter.type" placeholder="选择艺术类型">
                <el-option label="全部" value="" />
                <el-option label="传统工艺" value="传统工艺" />
                <el-option label="传统戏剧" value="传统戏剧" />
                <el-option label="传统音乐" value="传统音乐" />
                <el-option label="传统美术" value="传统美术" />
                <el-option label="传统曲艺" value="传统曲艺" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleFilter">筛选</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 艺术形式列表 -->
      <section class="arts-section">
        <h3 class="section-title">传统艺术形式</h3>
        <CulturePageState :loading="pageLoading" :error="loadError" :empty="!filteredArts.length" @retry="loadPage" @reset="resetFilter" />
        <div class="arts-grid">
          <div 
            v-for="art in filteredArts" 
            :key="art.id" 
            class="art-card" role="button" tabindex="0" @keydown.enter="showDetail(art)" @keydown.space.prevent="showDetail(art)"
            @click="showDetail(art)"
          >
            <div class="card-image">
              <img :src="art.imageUrl" :alt="art.name">
            </div>
            <div class="card-content">
              <h4 class="art-name">{{ art.name }}</h4>
              <div class="art-info">
                <span class="info-item">{{ art.type }}</span>
                <span class="info-item">{{ art.level }}</span>
              </div>
              <p class="art-brief">{{ art.brief }}</p>
              <el-button type="text" class="detail-link">查看详情</el-button>
            </div>
          </div>
        </div>
      </section>

      <!-- 艺术形式详情弹窗 -->
      <el-dialog
        v-model="showDetailDialog"
        :title="selectedArt?.name || '艺术详情'"
        width="min(800px, calc(100vw - 32px))"
      >
        <div v-if="selectedArt" class="art-detail">
          <div class="detail-header">
            <div class="detail-image">
              <img :src="selectedArt.imageUrl" :alt="selectedArt.name">
            </div>
            <div class="detail-info">
              <h3>{{ selectedArt.name }}</h3>
              <p class="detail-type">{{ selectedArt.type }}</p>
              <p class="detail-level">{{ selectedArt.level }}</p>
              <p class="detail-region">{{ selectedArt.region }}</p>
            </div>
          </div>
          <div class="detail-content">
            <h4>艺术简介</h4>
            <p>{{ selectedArt.description }}</p>
            <h4 v-if="selectedArt.history.length > 0">历史沿革</h4>
            <p v-if="selectedArt.history.length > 0">{{ selectedArt.history }}</p>
            <h4 v-if="selectedArt.features.length > 0">艺术特色</h4>
            <ul v-if="selectedArt.features.length > 0">
              <li v-for="(feature, index) in selectedArt.features" :key="index">
                {{ feature }}
              </li>
            </ul>
            <h4 v-if="selectedArt.representatives.length > 0">代表作品/人物</h4>
            <ul v-if="selectedArt.representatives.length > 0">
              <li v-for="(representative, index) in selectedArt.representatives" :key="index">
                {{ representative }}
              </li>
            </ul>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import CultureChapterHeader from "@/components/CultureChapterHeader.vue"
import CulturePageState from "@/components/CulturePageState.vue"
import { ref, computed, onMounted } from 'vue'
import { get } from '@/utils/api/request'

// 筛选条件
const filter = ref({ 
  type: '' 
})

// 弹窗控制
const showDetailDialog = ref(false)
const selectedArt = ref(null)

// 江苏传统艺术数据
const arts = ref([])
const loadError = ref('')
const pageLoading = ref(true)
async function loadPage() {
  pageLoading.value = true
  loadError.value = ''
  const result = await get('/arts/list', { pageSize: 100 })
  pageLoading.value = false
  if (result.code !== 200) { loadError.value = result.message || '传统艺术加载失败'; return }
  arts.value = (result.data.records || []).map((item) => ({
    ...item,
    type: item.artForm || item.category || '',
    level: item.levelLabel || '',
    region: item.city || '',
    brief: item.description || '',
    description: item.content || item.description || '',
    history: item.history || '',
    features: Array.isArray(item.features) ? item.features : [],
    representatives: Array.isArray(item.representatives) ? item.representatives : [],
    imageUrl: item.coverImage || '',
  }))
}
onMounted(loadPage)

// 筛选后的艺术列表
const filteredArts = computed(() => {
  let result = arts.value
  
  if (filter.value.type) {
    result = result.filter(item => item.type.includes(filter.value.type))
  }
  
  return result
})

// 处理筛选
function handleFilter() {
  // 筛选逻辑已在computed中实现
}

// 重置筛选
function resetFilter() {
  filter.value = {
    type: ''
  }
}

// 显示艺术详情
function showDetail(art) {
  selectedArt.value = art
  showDetailDialog.value = true
}
</script>

<style scoped>
/* 全局样式 */
:root {
  --primary-color: #333333; /* 主色调 */
  --accent-color: #C00C00; /* 文化红 */
  --background-color: #FFFFFF; /* 白色背景 */
  --text-color: #333333;
  --light-text: #666666;
  --border-color: #E0E0E0;
  --card-bg: #F5F5F5; /* 卡片背景色 */
}

/* 页面容器 */
.traditional-arts-container {
  min-height: 100vh;
  background-color: var(--background-color);
  font-family: '思源宋体', '微软雅黑', Arial, sans-serif;
  color: var(--text-color);
}

/* 页面头部 */
.page-header {
  background-color: var(--accent-color);
  color: white;
  padding: 60px 0;
  margin-bottom: 40px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 15px 0;
}

.page-subtitle {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选区域 */
.filter-section {
  background-color: var(--card-bg);
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 40px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: var(--primary-color);
  border-bottom: 2px solid var(--accent-color);
  padding-bottom: 10px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

/* 艺术列表 */
.arts-section {
  margin-bottom: 60px;
}

.arts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 30px;
}

.art-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.art-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.art-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 20px;
}

.art-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: var(--primary-color);
}

.art-info {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 14px;
  color: var(--light-text);
}

.info-item {
  padding: 2px 8px;
  background-color: #E0E0E0;
  border-radius: 10px;
}

.art-brief {
  font-size: 14px;
  line-height: 1.5;
  color: var(--light-text);
  margin: 0 0 20px 0;
}

.detail-link {
  align-self: flex-start;
}

/* 艺术详情 */
.art-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.detail-image {
  width: 200px;
  height: 250px;
  overflow: hidden;
  border-radius: 8px;
}

.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-info {
  flex: 1;
}

.detail-info h3 {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: var(--primary-color);
}

.detail-type {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px 0;
  color: var(--accent-color);
}

.detail-level {
  font-size: 14px;
  color: var(--light-text);
  margin: 0 0 5px 0;
}

.detail-region {
  font-size: 14px;
  color: var(--light-text);
  margin: 0;
}

.detail-content {
  line-height: 1.6;
}

.detail-content h4 {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 10px 0;
  color: var(--primary-color);
}

.detail-content p {
  font-size: 14px;
  color: var(--text-color);
  margin: 0 0 15px 0;
}

.detail-content ul {
  font-size: 14px;
  color: var(--text-color);
  margin: 0 0 15px 0;
  padding-left: 20px;
}

.detail-content li {
  margin-bottom: 5px;
}

/* 响应式设计 */
@media (max-width: 1199px) {
  .arts-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 767px) {
  .page-header {
    padding: 40px 0;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .page-subtitle {
    font-size: 16px;
  }
  
  .main-content {
    padding: 0 15px;
  }
  
  .filter-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .el-form-item:last-child {
    display: flex;
    gap: 10px;
  }
  
  .arts-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .detail-image {
    width: 150px;
    height: 200px;
  }
}
</style>

<style scoped src="@/styles/culture-chapters.css"></style>
