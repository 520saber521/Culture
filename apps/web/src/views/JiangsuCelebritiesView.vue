<template>
  <div class="celebrities-container culture-chapter">
    <!-- 页面头部 -->
    <CultureChapterHeader kind="people" />


    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 筛选区域 -->
      <section class="filter-section">
        <div class="filter-container">
          <h3 class="section-title">人物分类</h3>
          <el-form :inline="true" class="filter-form">
            <el-form-item label="朝代">
              <el-select v-model="filter.dynasty" placeholder="选择朝代">
                <el-option label="全部" value="" />
                <el-option label="先秦" value="先秦" />
                <el-option label="秦汉" value="秦汉" />
                <el-option label="魏晋南北朝" value="魏晋南北朝" />
                <el-option label="隋唐" value="隋唐" />
                <el-option label="宋元" value="宋元" />
                <el-option label="明清" value="明清" />
                <el-option label="近现代" value="近现代" />
              </el-select>
            </el-form-item>
            <el-form-item label="领域">
              <el-select v-model="filter.field" placeholder="选择领域">
                <el-option label="全部" value="" />
                <el-option label="政治军事" value="政治军事" />
                <el-option label="文学艺术" value="文学艺术" />
                <el-option label="科学技术" value="科学技术" />
                <el-option label="思想学术" value="思想学术" />
                <el-option label="商业经济" value="商业经济" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleFilter">筛选</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 名人列表 -->
      <section class="celebrities-section">
        <h3 class="section-title">历史名人</h3>
        <CulturePageState :loading="pageLoading" :error="loadError" :empty="!filteredCelebrities.length" @retry="loadPage" @reset="resetFilter" />
        <div class="celebrities-grid">
          <div 
            v-for="celebrity in filteredCelebrities" 
            :key="celebrity.id" 
            class="celebrity-card" role="button" tabindex="0" @keydown.enter="showDetail(celebrity)" @keydown.space.prevent="showDetail(celebrity)"
            @click="showDetail(celebrity)"
          >
            <div class="card-image">
              <img :src="celebrity.imageUrl" :alt="celebrity.name">
            </div>
            <div class="card-content">
              <h4 class="celebrity-name">{{ celebrity.name }}</h4>
              <div class="celebrity-info">
                <span class="info-item">{{ celebrity.dynasty }}</span>
                <span class="info-item">{{ celebrity.field }}</span>
              </div>
              <p class="celebrity-brief">{{ celebrity.brief }}</p>
              <el-button type="text" class="detail-link">查看详情</el-button>
            </div>
          </div>
        </div>
      </section>

      <!-- 名人详情弹窗 -->
      <el-dialog
        v-model="showDetailDialog"
        :title="selectedCelebrity?.name || '名人详情'"
        width="min(800px, calc(100vw - 32px))"
      >
        <div v-if="selectedCelebrity" class="celebrity-detail">
          <div class="detail-header">
            <div class="detail-image">
              <img :src="selectedCelebrity.imageUrl" :alt="selectedCelebrity.name">
            </div>
            <div class="detail-info">
              <h3>{{ selectedCelebrity.name }}</h3>
              <p class="detail-dynasty">{{ selectedCelebrity.dynasty }}</p>
              <p class="detail-field">{{ selectedCelebrity.field }}</p>
              <p class="detail-years">{{ selectedCelebrity.years }}</p>
            </div>
          </div>
          <div class="detail-content">
            <h4>人物简介</h4>
            <p>{{ selectedCelebrity.description }}</p>
            <h4 v-if="selectedCelebrity.achievements.length > 0">主要成就</h4>
            <ul v-if="selectedCelebrity.achievements.length > 0">
              <li v-for="(achievement, index) in selectedCelebrity.achievements" :key="index">
                {{ achievement }}
              </li>
            </ul>
            <h4 v-if="selectedCelebrity.works.length > 0">代表作品</h4>
            <ul v-if="selectedCelebrity.works.length > 0">
              <li v-for="(work, index) in selectedCelebrity.works" :key="index">
                {{ work }}
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
  dynasty: '', 
  field: '' 
})

// 弹窗控制
const showDetailDialog = ref(false)
const selectedCelebrity = ref(null)

// 江苏历史名人数据
const celebrities = ref([])
const loadError = ref('')
const pageLoading = ref(true)
async function loadPage() {
  pageLoading.value = true
  loadError.value = ''
  const result = await get('/celebrities/list', { pageSize: 100 })
  pageLoading.value = false
  if (result.code !== 200) { loadError.value = result.message || '人物资料加载失败'; return }
  celebrities.value = (result.data.records || []).map((item) => ({
    ...item,
    field: item.field || item.title || '',
    years: [item.birthYear, item.deathYear].filter(Boolean).join('—'),
    brief: item.description || '',
    description: item.content || item.description || '',
    achievements: Array.isArray(item.achievements) ? item.achievements : [],
    works: Array.isArray(item.works) ? item.works : [],
    imageUrl: item.avatar || '',
  }))
}
onMounted(loadPage)

// 筛选后的名人列表
const filteredCelebrities = computed(() => {
  let result = celebrities.value
  
  if (filter.value.dynasty) {
    result = result.filter(item => (item.dynasty || "").includes(filter.value.dynasty))
  }
  
  if (filter.value.field) {
    result = result.filter(item => item.field.includes(filter.value.field))
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
    dynasty: '',
    field: ''
  }
}

// 显示名人详情
function showDetail(celebrity) {
  selectedCelebrity.value = celebrity
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
.celebrities-container {
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

/* 名人列表 */
.celebrities-section {
  margin-bottom: 60px;
}

.celebrities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 30px;
}

.celebrity-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.celebrity-card:hover {
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

.celebrity-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 20px;
}

.celebrity-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: var(--primary-color);
}

.celebrity-info {
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

.celebrity-brief {
  font-size: 14px;
  line-height: 1.5;
  color: var(--light-text);
  margin: 0 0 20px 0;
}

.detail-link {
  align-self: flex-start;
}

/* 名人详情 */
.celebrity-detail {
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

.detail-dynasty {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px 0;
  color: var(--accent-color);
}

.detail-field {
  font-size: 14px;
  color: var(--light-text);
  margin: 0 0 5px 0;
}

.detail-years {
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
  .celebrities-grid {
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
  
  .celebrities-grid {
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
