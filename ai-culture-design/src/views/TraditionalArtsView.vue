<template>
  <div class="traditional-arts-container">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-content">
        <h1 class="page-title">江苏传统艺术</h1>
        <p class="page-subtitle">探索江苏丰富的传统艺术形式，感受千年文化的魅力</p>
      </div>
    </section>

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
        <div class="arts-grid">
          <div 
            v-for="art in filteredArts" 
            :key="art.id" 
            class="art-card"
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
        width="800px"
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
import { ref, computed } from 'vue'

// 筛选条件
const filter = ref({ 
  type: '' 
})

// 弹窗控制
const showDetailDialog = ref(false)
const selectedArt = ref(null)

// 江苏传统艺术数据
const arts = ref([
  {
    id: 1,
    name: '苏绣',
    type: '传统美术',
    level: '国家级',
    region: '苏州',
    brief: '苏州刺绣是中国四大名绣之一，以精细、雅洁著称，具有图案秀丽、构思巧妙等特点',
    description: '苏绣是苏州地区刺绣产品的总称，为中国四大名绣之一，国家级非物质文化遗产。苏绣起源于苏州吴县一带，历史悠久，最早可追溯到春秋时期。苏绣以精细、雅洁著称，具有图案秀丽、构思巧妙、绣工细致、针法活泼、色彩清雅的独特风格。',
    history: '苏绣的历史悠久，早在春秋时期就有记载。三国时期，苏绣已发展到较高水平。唐宋时期，苏绣成为宫廷贡品。明清时期，苏绣达到鼎盛，形成了独特的艺术风格。近现代以来，苏绣不断创新，融合现代元素，焕发出新的生命力。',
    features: [
      '针法多样，包括平针、套针、抢针、乱针等',
      '色彩清雅，注重明暗层次',
      '图案秀丽，构思巧妙',
      '绣工细致，表现力强',
      '题材广泛，包括人物、山水、花鸟等'
    ],
    representatives: [
      '《百鸟朝凤》',
      '《清明上河图》',
      '沈寿（苏绣大师）',
      '顾文霞（苏绣大师）'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20embroidery%20traditional%20Chinese%20art%20work&image_size=portrait_4_3'
  },
  {
    id: 2,
    name: '昆曲',
    type: '传统戏剧',
    level: '国家级',
    region: '苏州昆山',
    brief: '昆曲是中国最古老的剧种之一，被称为"百戏之祖"，以委婉细腻的表演风格和优美的唱腔著称',
    description: '昆曲，原名"昆山腔"或简称"昆腔"，是中国最古老的剧种之一，也是中国传统文化艺术中的珍品，被称为"百戏之祖"。昆曲起源于14世纪中国的苏州昆山，后经魏良辅等人的改良而走向全国，自明代中叶以来独领中国剧坛近300年。',
    history: '昆曲起源于元末明初的苏州昆山一带，最初是一种民间小调。明代嘉靖年间，魏良辅对昆山腔进行了改革，吸收了海盐腔、弋阳腔等南曲诸腔的优点，形成了新的昆山腔。清代乾隆年间，昆曲达到鼎盛，但随后逐渐衰落。2001年，昆曲被联合国教科文组织列为"人类口述和非物质遗产代表作"。',
    features: [
      '唱腔优美，委婉细腻',
      '表演程式化，注重手势、眼神等细节',
      '音乐伴奏以笛子为主，配以笙、琵琶等乐器',
      '剧本文学性强，多取材于古典文学名著',
      '服装、道具精美，注重传统美学'
    ],
    representatives: [
      '《牡丹亭》',
      '《长生殿》',
      '《桃花扇》',
      '魏良辅（昆曲改革家）',
      '俞振飞（昆曲表演艺术家）'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20traditional%20Chinese%20performance&image_size=portrait_4_3'
  },
  {
    id: 3,
    name: '宜兴紫砂',
    type: '传统工艺',
    level: '国家级',
    region: '宜兴',
    brief: '宜兴紫砂器是中国特有的手工制造陶土工艺品，以其独特的泥质、造型和功能闻名于世',
    description: '宜兴紫砂器是中国特有的手工制造陶土工艺品，产于江苏宜兴，国家级非物质文化遗产。宜兴紫砂器以其独特的泥质、造型和功能闻名于世，是中国陶瓷艺术的瑰宝。紫砂器的制作工艺复杂，需要经过选料、练泥、成型、烧制等多个环节。',
    history: '宜兴紫砂器的历史可以追溯到宋代，明代中期开始兴盛，清代达到鼎盛。紫砂器最初主要用于煮茶，后来逐渐发展成为观赏和收藏的艺术品。近现代以来，宜兴紫砂器不断创新，融合现代设计元素，成为中国陶瓷艺术的重要代表。',
    features: [
      '泥质独特，透气性好',
      '造型多样，工艺精湛',
      '功能实用，适合泡茶',
      '色泽温润，越用越亮',
      '收藏价值高，具有投资潜力'
    ],
    representatives: [
      '供春壶（明代）',
      '时大彬壶（明代）',
      '陈鸣远壶（清代）',
      '顾景舟（现代紫砂大师）',
      '蒋蓉（现代紫砂大师）'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yixing%20purple%20clay%20teapot%20traditional%20Chinese%20craft&image_size=portrait_4_3'
  },
  {
    id: 4,
    name: '扬州漆器',
    type: '传统工艺',
    level: '国家级',
    region: '扬州',
    brief: '扬州漆器是中国传统漆器工艺的重要流派，以其精湛的技艺和独特的风格著称',
    description: '扬州漆器是中国传统漆器工艺的重要流派，产于江苏扬州，国家级非物质文化遗产。扬州漆器历史悠久，工艺精湛，以其独特的风格和丰富的品种著称于世。扬州漆器的制作工艺复杂，需要经过选料、设计、髹漆、装饰等多个环节。',
    history: '扬州漆器的历史可以追溯到战国时期，汉代达到兴盛，唐代成为宫廷贡品，明清时期达到鼎盛。扬州漆器的装饰技法多样，包括彩绘、雕漆、镶嵌等。近现代以来，扬州漆器不断创新，融合现代设计元素，成为中国漆器艺术的重要代表。',
    features: [
      '工艺精湛，制作考究',
      '装饰技法多样，包括彩绘、雕漆、镶嵌等',
      '色彩艳丽，图案精美',
      '品种丰富，包括屏风、家具、器皿等',
      '具有很高的艺术价值和收藏价值'
    ],
    representatives: [
      '彩绘漆器',
      '雕漆漆器',
      '镶嵌漆器',
      '卢葵生（清代漆器大师）',
      '王国治（现代漆器大师）'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20lacquerware%20traditional%20Chinese%20craft&image_size=portrait_4_3'
  },
  {
    id: 5,
    name: '南京云锦',
    type: '传统工艺',
    level: '国家级',
    region: '南京',
    brief: '南京云锦是中国传统丝织工艺的珍品，以其色彩艳丽、图案精美、工艺精湛著称',
    description: '南京云锦是中国传统丝织工艺的珍品，产于江苏南京，国家级非物质文化遗产。南京云锦历史悠久，工艺精湛，以其色彩艳丽、图案精美、工艺精湛著称于世，是中国丝织艺术的瑰宝。云锦的制作工艺复杂，需要经过选料、设计、织造等多个环节。',
    history: '南京云锦的历史可以追溯到三国时期，东晋时期开始兴盛，元代成为宫廷贡品，明清时期达到鼎盛。云锦最初主要用于宫廷服饰，后来逐渐发展成为观赏和收藏的艺术品。近现代以来，南京云锦不断创新，融合现代设计元素，焕发出新的生命力。',
    features: [
      '色彩艳丽，图案精美',
      '工艺精湛，织造复杂',
      '质地厚重，手感柔软',
      '题材广泛，包括龙纹、花卉等',
      '具有很高的艺术价值和历史价值'
    ],
    representatives: [
      '妆花缎',
      '库锦',
      '库缎',
      '挑花结本技艺',
      '木机妆花织造技艺'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20traditional%20Chinese%20silk%20fabric&image_size=portrait_4_3'
  },
  {
    id: 6,
    name: '评弹',
    type: '传统曲艺',
    level: '国家级',
    region: '苏州',
    brief: '苏州评弹是苏州评话和苏州弹词的总称，是中国江南地区最具代表性的曲艺形式之一',
    description: '苏州评弹是苏州评话和苏州弹词的总称，是中国江南地区最具代表性的曲艺形式之一，国家级非物质文化遗产。苏州评弹起源于苏州，流行于江苏、上海、浙江等地，以其优美的唱腔、生动的表演和丰富的内容深受观众喜爱。',
    history: '苏州评弹的历史可以追溯到宋代，明代开始兴盛，清代达到鼎盛。评话以说为主，弹词则说唱结合。近现代以来，苏州评弹不断创新，融合现代元素，焕发出新的生命力。',
    features: [
      '说唱结合，以苏州方言表演',
      '唱腔优美，委婉动听',
      '表演生动，富有感染力',
      '内容丰富，包括历史故事、民间传说等',
      '伴奏以三弦、琵琶为主'
    ],
    representatives: [
      '《三笑》',
      '《珍珠塔》',
      '《玉蜻蜓》',
      '严雪亭（评弹表演艺术家）',
      '蒋月泉（评弹表演艺术家）'
    ],
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20pingtan%20traditional%20Chinese%20storytelling%20performance&image_size=portrait_4_3'
  }
])

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