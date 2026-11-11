<template>
  <div class="celebrities-container">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-content">
        <h1 class="page-title">江苏历史名人</h1>
        <p class="page-subtitle">探索江苏历史上的杰出人物，感受深厚的文化底蕴</p>
      </div>
    </section>

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
        <div class="celebrities-grid">
          <div 
            v-for="celebrity in filteredCelebrities" 
            :key="celebrity.id" 
            class="celebrity-card"
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
        width="800px"
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
import { ref, computed } from 'vue'

// 筛选条件
const filter = ref({ 
  dynasty: '', 
  field: '' 
})

// 弹窗控制
const showDetailDialog = ref(false)
const selectedCelebrity = ref(null)

// 江苏历史名人数据
const celebrities = ref([
  {
    id: 1,
    name: '孙武',
    dynasty: '春秋',
    field: '军事',
    years: '约公元前545年-约公元前470年',
    brief: '春秋时期著名军事家，被尊称为兵圣，著有《孙子兵法》',
    description: '孙武，字长卿，春秋末期齐国乐安（今山东北部）人，后移居吴国。他是中国古代著名的军事家、政治家，被后世尊称为兵圣、孙子、孙武子。孙武所著的《孙子兵法》是世界上最早的军事著作之一，被誉为"兵学圣典"，对后世军事学产生了深远影响。',
    achievements: [
      '著有《孙子兵法》，被誉为兵学圣典',
      '辅佐吴王阖闾，帮助吴国成为春秋五霸之一',
      '提出"知己知彼，百战不殆"等军事思想',
      '其军事理论被后世广泛应用于军事、政治、商业等领域'
    ],
    works: [
      '《孙子兵法》十三篇'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20military%20strategist%20Sun%20Tzu%20portrait&image_size=portrait_4_3'
  },
  {
    id: 2,
    name: '刘邦',
    dynasty: '西汉',
    field: '政治',
    years: '公元前256年-公元前195年',
    brief: '西汉开国皇帝，沛县（今江苏徐州）人，史称汉高祖',
    description: '刘邦，字季，沛郡丰邑（今江苏丰县）人，西汉开国皇帝，史称汉高祖。他出身农家，秦末时聚众起义，推翻秦朝后与项羽进行楚汉战争，最终统一中国，建立汉朝。刘邦在位期间，采取休养生息政策，恢复社会经济，为汉朝的繁荣奠定了基础。',
    achievements: [
      '推翻秦朝统治',
      '击败项羽，统一中国',
      '建立汉朝，开创西汉王朝',
      '实行休养生息政策，恢复社会经济',
      '推行郡国并行制，巩固中央集权'
    ],
    works: [],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20emperor%20Liu%20Bang%20portrait&image_size=portrait_4_3'
  },
  {
    id: 3,
    name: '项羽',
    dynasty: '秦末',
    field: '军事',
    years: '公元前232年-公元前202年',
    brief: '秦末著名军事家，西楚霸王，下相（今江苏宿迁）人',
    description: '项羽，名籍，字羽，秦末下相（今江苏宿迁）人，楚国名将项燕之孙。他是秦末农民起义领袖，推翻秦朝后自封为西楚霸王，与刘邦进行楚汉战争，最终兵败自刎。项羽勇猛善战，被后世称为"西楚霸王"，是中国历史上著名的军事将领。',
    achievements: [
      '巨鹿之战破釜沉舟，击败秦军主力',
      '推翻秦朝统治',
      '自封西楚霸王，分封诸侯',
      '彭城之战以少胜多，大败刘邦'
    ],
    works: [],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20warrior%20Xiang%20Yu%20portrait&image_size=portrait_4_3'
  },
  {
    id: 4,
    name: '孙权',
    dynasty: '三国',
    field: '政治',
    years: '公元182年-公元252年',
    brief: '三国时期吴国开国皇帝，吴郡富春（今浙江富阳）人',
    description: '孙权，字仲谋，吴郡富春（今浙江富阳）人，三国时期吴国的开国皇帝。他继承父兄基业，与刘备、曹操三足鼎立，建立吴国。孙权在位期间，发展经济，开拓疆土，派卫温到达台湾，促进了两岸交流。',
    achievements: [
      '建立吴国，与魏、蜀三足鼎立',
      '派卫温到达台湾，促进两岸交流',
      '发展江南经济，促进文化繁荣',
      '重用人才，形成江东士族集团'
    ],
    works: [],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20emperor%20Sun%20Quan%20portrait&image_size=portrait_4_3'
  },
  {
    id: 5,
    name: '祖冲之',
    dynasty: '南北朝',
    field: '科学',
    years: '公元429年-公元500年',
    brief: '南北朝时期著名数学家、天文学家，范阳遒县（今河北涞水）人',
    description: '祖冲之，字文远，南北朝时期著名的数学家、天文学家和机械制造家。他在数学上首次将圆周率精确到小数点后第七位，在天文学上编制了《大明历》，在机械制造上发明了水碓磨、指南车等。祖冲之的科学成就对后世产生了深远影响。',
    achievements: [
      '将圆周率精确到小数点后第七位',
      '编制《大明历》，改进历法',
      '发明水碓磨、指南车等机械',
      '撰写《缀术》等数学著作'
    ],
    works: [
      '《缀术》',
      '《大明历》'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20scientist%20Zu%20Chongzhi%20portrait&image_size=portrait_4_3'
  },
  {
    id: 6,
    name: '李白',
    dynasty: '唐朝',
    field: '文学',
    years: '公元701年-公元762年',
    brief: '唐代伟大的浪漫主义诗人，被后人称为诗仙',
    description: '李白，字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。他的诗歌风格豪放飘逸，想象丰富，语言流转自然，音律和谐多变。李白一生游历名山大川，写下了许多脍炙人口的诗篇，对后世文学产生了深远影响。',
    achievements: [
      '创作大量优秀诗歌，被誉为诗仙',
      '开创浪漫主义诗歌流派',
      '与杜甫并称为李杜，成为唐诗的代表人物',
      '其诗歌被后人广泛传诵和研究'
    ],
    works: [
      '《将进酒》',
      '《望庐山瀑布》',
      '《蜀道难》',
      '《静夜思》'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20poet%20Li%20Bai%20portrait&image_size=portrait_4_3'
  },
  {
    id: 7,
    name: '白居易',
    dynasty: '唐朝',
    field: '文学',
    years: '公元772年-公元846年',
    brief: '唐代伟大的现实主义诗人，新乐府运动倡导者',
    description: '白居易，字乐天，号香山居士，唐代伟大的现实主义诗人。他主张"文章合为时而著，歌诗合为事而作"，倡导新乐府运动。白居易的诗歌语言通俗易懂，题材广泛，反映了当时的社会现实，对后世文学产生了深远影响。',
    achievements: [
      '倡导新乐府运动，推动诗歌革新',
      '创作大量反映社会现实的诗歌',
      '与李白、杜甫并称为唐代三大诗人',
      '其诗歌被后人广泛传诵和研究'
    ],
    works: [
      '《长恨歌》',
      '《琵琶行》',
      '《卖炭翁》',
      '《钱塘湖春行》'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20poet%20Bai%20Juyi%20portrait&image_size=portrait_4_3'
  },
  {
    id: 8,
    name: '范仲淹',
    dynasty: '北宋',
    field: '政治、文学',
    years: '公元989年-公元1052年',
    brief: '北宋著名政治家、文学家，苏州吴县（今江苏苏州）人',
    description: '范仲淹，字希文，北宋著名的政治家、文学家和军事家。他出身贫寒，通过科举考试进入仕途，曾任参知政事（副宰相）。范仲淹在政治上推行庆历新政，在文学上写下了"先天下之忧而忧，后天下之乐而乐"的名句，在军事上抵御西夏入侵，为北宋的稳定和发展做出了重要贡献。',
    achievements: [
      '推行庆历新政，改革政治',
      '抵御西夏入侵，保卫边疆',
      '创办苏州府学，发展教育',
      '写下"先天下之忧而忧，后天下之乐而乐"的名句'
    ],
    works: [
      '《岳阳楼记》',
      '《渔家傲·秋思》',
      '《苏幕遮·怀旧》'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20statesman%20Fan%20Zhongyan%20portrait&image_size=portrait_4_3'
  }
])

// 筛选后的名人列表
const filteredCelebrities = computed(() => {
  let result = celebrities.value
  
  if (filter.value.dynasty) {
    result = result.filter(item => item.dynasty.includes(filter.value.dynasty))
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