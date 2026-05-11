<template>
  <div class="intangible-heritage-container">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-bg-pattern">
        <!-- 动态光束 -->
        <div class="light-beam light-beam-1"></div>
        <div class="light-beam light-beam-2"></div>
        <div class="light-beam light-beam-3"></div>
        <!-- 装饰性圆环 -->
        <div class="deco-ring deco-ring-1"></div>
        <div class="deco-ring deco-ring-2"></div>
        <div class="deco-ring deco-ring-3"></div>
        <!-- 暗角遮罩 -->
        <div class="vignette-overlay"></div>
        <!-- 噪点纹理 -->
        <div class="noise-overlay"></div>
      </div>
      <div class="header-particles">
        <span v-for="n in 12" :key="n" class="particle" :style="{ '--delay': n * 0.3 + 's', '--x': (Math.random() * 100) + '%', '--duration': 8 + Math.random() * 10 + 's' }"></span>
      </div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="#FAFAFA"></path>
        </svg>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <span v-for="(char, index) in titleChars" :key="index" class="title-char" :style="{ animationDelay: index * 0.1 + 's' }">{{ char }}</span>
        </h1>
        <p class="page-subtitle">探索千年文化瑰宝，传承民族精神血脉</p>

        <div class="header-stats">
          <div class="stat-item" v-for="(stat, idx) in headerStats" :key="idx">
            <div class="stat-icon" v-html="stat.icon"></div>
            <div class="stat-info">
              <span class="stat-number"><span class="counter" :data-target="stat.value">{{ stat.value }}</span></span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>

        <div class="header-search">
          <div class="search-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"></circle>
              <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>
            <input type="text" placeholder="搜索非遗项目、传承人、地区..." class="search-input" v-model="searchKeyword" @keyup.enter="handleSearch">
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
          <div class="hot-tags">
            <span class="hot-label">热门：</span>
            <button v-for="tag in hotTags" :key="tag" class="hot-tag" @click="searchByTag(tag)">{{ tag }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 筛选区域 -->
      <section class="filter-section">
        <div class="filter-container">
          <h3 class="section-title">遗产分类</h3>
          <el-form :inline="true" class="filter-form">
            <el-form-item label="级别">
              <el-select v-model="filter.level" placeholder="选择级别">
                <el-option label="全部" value="" />
                <el-option label="国家级" value="国家级" />
                <el-option label="省级" value="省级" />
                <el-option label="市级" value="市级" />
              </el-select>
            </el-form-item>
            <el-form-item label="类别">
              <el-select v-model="filter.category" placeholder="选择类别">
                <el-option label="全部" value="" />
                <el-option label="传统技艺" value="传统技艺" />
                <el-option label="传统戏剧" value="传统戏剧" />
                <el-option label="传统音乐" value="传统音乐" />
                <el-option label="传统美术" value="传统美术" />
                <el-option label="传统曲艺" value="传统曲艺" />
                <el-option label="民间文学" value="民间文学" />
                <el-option label="传统舞蹈" value="传统舞蹈" />
                <el-option label="传统体育" value="传统体育" />
                <el-option label="传统医药" value="传统医药" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleFilter">筛选</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>

      <!-- 非遗项目列表 -->
      <section class="heritage-section">
        <h3 class="section-title">非遗项目</h3>
        <div class="heritage-grid">
          <div 
            v-for="heritage in filteredHeritages" 
            :key="heritage.id" 
            class="heritage-card"
            @click="showDetail(heritage)"
          >
            <div class="card-image">
              <img :src="heritage.imageUrl" :alt="heritage.name">
            </div>
            <div class="card-content">
              <h4 class="heritage-name">{{ heritage.name }}</h4>
              <div class="heritage-info">
                <span class="info-item">{{ heritage.level }}</span>
                <span class="info-item">{{ heritage.category }}</span>
                <span class="info-item">{{ heritage.region }}</span>
              </div>
              <p class="heritage-brief">{{ heritage.brief }}</p>
              <el-button type="text" class="detail-link">查看详情</el-button>
            </div>
          </div>
        </div>
      </section>

      <!-- 非遗项目详情弹窗 -->
      <el-dialog
        v-model="showDetailDialog"
        :title="selectedHeritage?.name || '非遗详情'"
        width="800px"
      >
        <div v-if="selectedHeritage" class="heritage-detail">
          <div class="detail-header">
            <div class="detail-image">
              <img :src="selectedHeritage.imageUrl" :alt="selectedHeritage.name">
            </div>
            <div class="detail-info">
              <h3>{{ selectedHeritage.name }}</h3>
              <p class="detail-level">{{ selectedHeritage.level }}</p>
              <p class="detail-category">{{ selectedHeritage.category }}</p>
              <p class="detail-region">{{ selectedHeritage.region }}</p>
              <p class="detail-year">{{ selectedHeritage.year }}</p>
            </div>
          </div>
          <div class="detail-content">
            <h4>项目简介</h4>
            <p>{{ selectedHeritage.description }}</p>
            <h4 v-if="selectedHeritage.history.length > 0">历史沿革</h4>
            <p v-if="selectedHeritage.history.length > 0">{{ selectedHeritage.history }}</p>
            <h4 v-if="selectedHeritage.features.length > 0">主要特色</h4>
            <ul v-if="selectedHeritage.features.length > 0">
              <li v-for="(feature, index) in selectedHeritage.features" :key="index">
                {{ feature }}
              </li>
            </ul>
            <h4 v-if="selectedHeritage.heirs.length > 0">代表性传承人</h4>
            <ul v-if="selectedHeritage.heirs.length > 0">
              <li v-for="(heir, index) in selectedHeritage.heirs" :key="index">
                {{ heir }}
              </li>
            </ul>
            <h4 v-if="selectedHeritage.protection.length > 0">保护现状</h4>
            <p v-if="selectedHeritage.protection.length > 0">{{ selectedHeritage.protection }}</p>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { heritageApi } from '@/utils/api/heritage'
import { ElMessage } from 'element-plus'

const filter = ref({ 
  level: '',
  category: '' 
})

const showDetailDialog = ref(false)
const selectedHeritage = ref(null)
const heritages = ref([])
const loading = ref(false)
const error = ref(null)
const searchKeyword = ref('')

const titleChars = '江苏非物质文化遗产'.split('')

const headerStats = [
  { value: 12, label: '非遗项目', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/></svg>' },
  { value: 9, label: '国家级', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/></svg>' },
  { value: 3, label: '省级', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/></svg>' }
]

const hotTags = ['苏州园林', '昆曲', '苏绣', '云锦', '紫砂']

function handleSearch() {
  if (searchKeyword.value.trim()) {
    ElMessage.info(`搜索: ${searchKeyword.value}`)
  }
}

function searchByTag(tag) {
  searchKeyword.value = tag
  ElMessage.info(`搜索标签: ${tag}`)
}

const defaultHeritages = [
  {
    id: 1,
    name: '昆曲',
    level: '国家级',
    category: '传统戏剧',
    region: '苏州昆山',
    year: '2001年',
    brief: '昆曲是中国最古老的剧种之一，被称为"百戏之祖"，2001年被联合国教科文组织列为"人类口述和非物质遗产代表作"',
    description: '昆曲，原名"昆山腔"或简称"昆腔"，是中国最古老的剧种之一，也是中国传统文化艺术中的珍品，被称为"百戏之祖"。昆曲起源于14世纪中国的苏州昆山，后经魏良辅等人的改良而走向全国，自明代中叶以来独领中国剧坛近300年。',
    history: '昆曲起源于元末明初的苏州昆山一带，最初是一种民间小调。明代嘉靖年间，魏良辅对昆山腔进行了改革，吸收了海盐腔、弋阳腔等南曲诸腔的优点，形成了新的昆山腔。清代乾隆年间，昆曲达到鼎盛，但随后逐渐衰落。2001年，昆曲被联合国教科文组织列为"人类口述和非物质遗产代表作"。',
    features: [
      '唱腔优美，委婉细腻',
      '表演程式化，注重手势、眼神等细节',
      '音乐伴奏以笛子为主，配以笙、琵琶等乐器',
      '剧本文学性强，多取材于古典文学名著',
      '服装、道具精美，注重传统美学'
    ],
    heirs: [
      '俞振飞（国家级传承人）',
      '张继青（国家级传承人）',
      '王芳（国家级传承人）',
      '石小梅（国家级传承人）'
    ],
    protection: '近年来，国家和地方政府采取了一系列措施保护昆曲，包括建立昆曲传习所、培养年轻演员、整理传统剧目、举办昆曲艺术节等。同时，昆曲也在不断创新，融合现代元素，吸引更多年轻人的关注和喜爱。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20traditional%20Chinese%20performance&image_size=portrait_4_3'
  },
  {
    id: 2,
    name: '古琴艺术',
    level: '国家级',
    category: '传统音乐',
    region: '苏州',
    year: '2003年',
    brief: '古琴是中国最古老的弹拨乐器之一，苏州古琴艺术历史悠久，风格独特',
    description: '古琴是中国最古老的弹拨乐器之一，有着3000多年的历史，被视为中国传统文化的象征。苏州古琴艺术历史悠久，风格独特，是中国古琴艺术的重要流派之一。',
    history: '苏州古琴艺术的历史可以追溯到春秋时期，当时的吴国就有古琴演奏的记载。唐代，苏州古琴艺术达到兴盛。明清时期，苏州成为全国古琴艺术的中心之一，出现了许多著名的琴人和琴谱。近现代以来，苏州古琴艺术不断传承和发展，涌现出一批优秀的琴人。',
    features: [
      '音色深沉、悠远、清越',
      '演奏技法丰富，包括散、按、泛三种基本音色',
      '曲目丰富，包括《高山流水》《广陵散》等经典曲目',
      '注重意境和韵味，追求"天人合一"的境界',
      '与诗词、书法、绘画等艺术形式密切相关'
    ],
    heirs: [
      '吴兆基（国家级传承人）',
      '龚一（国家级传承人）',
      '戴晓莲（国家级传承人）'
    ],
    protection: '近年来，国家和地方政府采取了一系列措施保护古琴艺术，包括建立古琴传习所、培养年轻琴人、整理传统琴谱、举办古琴艺术节等。同时，古琴艺术也在不断创新，融合现代元素，吸引更多年轻人的关注和喜爱。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Guqin%20traditional%20Chinese%20musical%20instrument%20performance&image_size=portrait_4_3'
  },
  {
    id: 3,
    name: '苏绣',
    level: '国家级',
    category: '传统美术',
    region: '苏州',
    year: '2006年',
    brief: '苏绣是中国四大名绣之一，以精细、雅洁著称，具有图案秀丽、构思巧妙等特点',
    description: '苏绣是苏州地区刺绣产品的总称，为中国四大名绣之一，国家级非物质文化遗产。苏绣起源于苏州吴县一带，历史悠久，最早可追溯到春秋时期。苏绣以精细、雅洁著称，具有图案秀丽、构思巧妙、绣工细致、针法活泼、色彩清雅的独特风格。',
    history: '苏绣的历史悠久，早在春秋时期就有记载。三国时期，苏绣已发展到较高水平。唐宋时期，苏绣成为宫廷贡品。明清时期，苏绣达到鼎盛，形成了独特的艺术风格。近现代以来，苏绣不断创新，融合现代元素，焕发出新的生命力。',
    features: [
      '针法多样，包括平针、套针、抢针、乱针等',
      '色彩清雅，注重明暗层次',
      '图案秀丽，构思巧妙',
      '绣工细致，表现力强',
      '题材广泛，包括人物、山水、花鸟等'
    ],
    heirs: [
      '沈寿（近代苏绣大师）',
      '顾文霞（国家级传承人）',
      '姚建萍（国家级传承人）',
      '张美芳（国家级传承人）'
    ],
    protection: '近年来，国家和地方政府采取了一系列措施保护苏绣，包括建立苏绣传习所、培养年轻绣工、整理传统针法、举办苏绣艺术节等。同时，苏绣也在不断创新，融合现代元素，开发出更多符合现代审美需求的产品。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20embroidery%20traditional%20Chinese%20art%20work&image_size=portrait_4_3'
  },
  {
    id: 4,
    name: '宜兴紫砂陶制作技艺',
    level: '国家级',
    category: '传统技艺',
    region: '宜兴',
    year: '2006年',
    brief: '宜兴紫砂陶制作技艺是中国特有的手工制造陶土工艺品技艺，以其独特的泥质、造型和功能闻名于世',
    description: '宜兴紫砂陶制作技艺是中国特有的手工制造陶土工艺品技艺，产于江苏宜兴，国家级非物质文化遗产。宜兴紫砂陶以其独特的泥质、造型和功能闻名于世，是中国陶瓷艺术的瑰宝。',
    history: '宜兴紫砂陶的历史可以追溯到宋代，明代中期开始兴盛，清代达到鼎盛。紫砂陶最初主要用于煮茶，后来逐渐发展成为观赏和收藏的艺术品。近现代以来，宜兴紫砂陶不断创新，融合现代设计元素，成为中国陶瓷艺术的重要代表。',
    features: [
      '泥质独特，透气性好',
      '造型多样，工艺精湛',
      '功能实用，适合泡茶',
      '色泽温润，越用越亮',
      '收藏价值高，具有投资潜力'
    ],
    heirs: [
      '顾景舟（现代紫砂大师）',
      '蒋蓉（国家级传承人）',
      '徐汉棠（国家级传承人）',
      '汪寅仙（国家级传承人）'
    ],
    protection: '近年来，国家和地方政府采取了一系列措施保护宜兴紫砂陶制作技艺，包括建立紫砂陶传习所、培养年轻艺人、整理传统技艺、举办紫砂陶艺术节等。同时，紫砂陶制作技艺也在不断创新，融合现代设计元素，开发出更多符合现代审美需求的产品。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yixing%20purple%20clay%20teapot%20traditional%20Chinese%20craft&image_size=portrait_4_3'
  },
  {
    id: 5,
    name: '南京云锦木机妆花手工织造技艺',
    level: '国家级',
    category: '传统技艺',
    region: '南京',
    year: '2006年',
    brief: '南京云锦是中国传统丝织工艺的珍品，木机妆花手工织造技艺是其核心技艺',
    description: '南京云锦是中国传统丝织工艺的珍品，产于江苏南京，国家级非物质文化遗产。南京云锦木机妆花手工织造技艺是云锦生产的核心技艺，以其复杂的工艺和精美的产品著称于世。',
    history: '南京云锦的历史可以追溯到三国时期，东晋时期开始兴盛，元代成为宫廷贡品，明清时期达到鼎盛。云锦最初主要用于宫廷服饰，后来逐渐发展成为观赏和收藏的艺术品。近现代以来，南京云锦不断创新，融合现代设计元素，焕发出新的生命力。',
    features: [
      '工艺复杂，需要两人配合操作大花楼木织机',
      '妆花技艺独特，能够织出色彩丰富、图案精美的织物',
      '用料考究，使用真丝、金线、银线等贵重材料',
      '图案精美，包括龙纹、花卉等传统图案',
      '具有很高的艺术价值和历史价值'
    ],
    heirs: [
      '朱枫（国家级传承人）',
      '金文（国家级传承人）'
    ],
    protection: '近年来，国家和地方政府采取了一系列措施保护南京云锦木机妆花手工织造技艺，包括建立云锦传习所、培养年轻艺人、整理传统技艺、举办云锦艺术节等。同时，云锦技艺也在不断创新，融合现代设计元素，开发出更多符合现代审美需求的产品。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20traditional%20Chinese%20silk%20fabric&image_size=portrait_4_3'
  },
  {
    id: 6,
    name: '扬州玉雕',
    level: '国家级',
    category: '传统美术',
    region: '扬州',
    year: '2006年',
    brief: '扬州玉雕是中国传统玉雕工艺的重要流派，以其精湛的技艺和独特的风格著称',
    description: '扬州玉雕是中国传统玉雕工艺的重要流派，产于江苏扬州，国家级非物质文化遗产。扬州玉雕历史悠久，工艺精湛，以其独特的风格和丰富的品种著称于世。',
    history: '扬州玉雕的历史可以追溯到新石器时代，当时的扬州地区就有玉石加工的记载。汉代，扬州玉雕达到兴盛。唐代，扬州成为全国玉雕工艺的中心之一。明清时期，扬州玉雕达到鼎盛，出现了许多著名的玉雕艺人和作品。近现代以来，扬州玉雕不断传承和发展，涌现出一批优秀的玉雕艺人。',
    features: [
      '工艺精湛，制作考究',
      '题材广泛，包括人物、山水、花鸟等',
      '造型优美，线条流畅',
      '琢磨精细，立体感强',
      '具有很高的艺术价值和收藏价值'
    ],
    heirs: [
      '顾永骏（国家级传承人）',
      '江春源（国家级传承人）',
      '高毅进（国家级传承人）'
    ],
    protection: '近年来，国家和地方政府采取了一系列措施保护扬州玉雕工艺，包括建立玉雕传习所、培养年轻艺人、整理传统技艺、举办玉雕艺术节等。同时，扬州玉雕工艺也在不断创新，融合现代设计元素，开发出更多符合现代审美需求的产品。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20jade%20carving%20traditional%20Chinese%20craft&image_size=portrait_4_3'
  }
]

// 筛选后的非遗列表
const filteredHeritages = computed(() => {
  let result = heritages.value
  
  if (filter.value.level) {
    result = result.filter(item => item.level.includes(filter.value.level))
  }
  
  if (filter.value.category) {
    result = result.filter(item => item.category.includes(filter.value.category))
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
    level: '',
    category: ''
  }
}

// 显示非遗详情
function showDetail(heritage) {
  selectedHeritage.value = heritage
  showDetailDialog.value = true
}

async function fetchHeritages() {
  loading.value = true
  error.value = null
  try {
    const response = await heritageApi.getList({ page: 1, size: 20 })
    if (response.code === 200 && response.data) {
      const records = response.data.records || response.data
      if (records && records.length > 0) {
        heritages.value = records.map(item => ({
          id: item.id,
          name: item.name,
          level: item.level || '省级',
          category: item.category || '传统技艺',
          region: item.city || '江苏',
          year: item.year || '',
          brief: item.description ? item.description.substring(0, 100) : '',
          description: item.description || item.content || '',
          history: item.history || '',
          features: item.features || [],
          heirs: item.heirs || [],
          protection: item.protection || '',
          imageUrl: item.coverImage || item.imageUrl || '/background.png'
        }))
      } else {
        heritages.value = defaultHeritages
      }
    }
  } catch (err) {
    console.error('获取非遗数据失败:', err)
    error.value = err.message
    heritages.value = defaultHeritages
    ElMessage.warning('使用本地数据展示')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchHeritages()
})
</script>

<style scoped>
/* 页面容器 */
.intangible-heritage-container {
  min-height: 100vh;
  background-color: #FAFAFA;
  font-family: -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #2c3e50;
}

/* ==================== 页面头部 - 视觉优化 ==================== */
.page-header {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0F172A 0%, #1E3A5F 20%, #1E293B 40%, #172554 60%, #0C1929 80%, #0A1628 100%);
  overflow: hidden;
  padding: 80px 20px 120px;
}

/* 背景纹理图案 - 多层视觉重设计 */
.header-bg-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 第一层: 基础渐变光晕网格 */
.header-bg-pattern::before {
  content: '';
  position: absolute;
  inset: -50%;
  background:
    radial-gradient(ellipse 80% 60% at 20% 100%, rgba(245, 166, 35, 0.18) 0%, transparent 55%),
    radial-gradient(ellipse 60% 50% at 85% 10%, rgba(251, 191, 36, 0.14) 0%, transparent 50%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(30, 58, 95, 0.30) 0%, transparent 60%),
    radial-gradient(ellipse 70% 55% at 75% 80%, rgba(23, 37, 84, 0.22) 0%, transparent 50%),
    radial-gradient(circle at 10% 20%, rgba(186, 230, 253, 0.08) 0%, transparent 35%);
  animation: bgGlowShift 12s ease-in-out infinite alternate;
}

@keyframes bgGlowShift {
  0% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(2%, 1%) rotate(0.5deg); }
  66% { transform: translate(-1.5%, 2%) rotate(-0.3deg); }
  100% { transform: translate(1%, -1%) rotate(0.2deg); }
}

/* 第二层: 中国传统云纹/回纹装饰纹理 */
.header-bg-pattern::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23F59E0B' stroke-opacity='0.055' stroke-width='1'%3E%3Cpath d='M30 20 Q45 5 60 20 T90 20'/%3E%3Cpath d='M30 40 Q45 25 60 40 T90 40'/%3E%3Cpath d='M30 60 Q45 45 60 60 T90 60'/%3E%3Cpath d='M30 80 Q45 65 60 80 T90 80'/%3E%3Cpath d='M30 100 Q45 85 60 100 T90 100'/%3E%3Ccircle cx='20' cy='30' r='4' fill='%23F59E0B' fill-opacity='0.05' stroke='none'/%3E%3Ccircle cx='100' cy='70' r='4' fill='%23F59E0B' fill-opacity='0.05' stroke='none'/%3E%3Ccircle cx='60' cy='110' r='3' fill='%23FBBF24' fill-opacity='0.04' stroke='none'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 120px 120px;
  animation: patternDrift 30s linear infinite;
  opacity: 0.85;
}

@keyframes patternDrift {
  0% { background-position: 0 0; }
  100% { background-position: 120px 120px; }
}

/* 第三层: 动态光束效果 */
.light-beam {
  position: absolute;
  width: 200%;
  height: 200%;
  transform-origin: center;
  pointer-events: none;
}

.light-beam-1 {
  top: -80%;
  left: -50%;
  background: conic-gradient(
    from 220deg at 50% 50%,
    transparent 0deg,
    transparent 30deg,
    rgba(245, 158, 11, 0.07) 35deg,
    rgba(245, 158, 11, 0.03) 45deg,
    transparent 50deg,
    transparent 100%
  );
  animation: beamRotate1 20s linear infinite;
}

.light-beam-2 {
  top: -60%;
  right: -70%;
  background: conic-gradient(
    from 40deg at 50% 50%,
    transparent 0deg,
    transparent 25deg,
    rgba(251, 191, 36, 0.06) 30deg,
    rgba(251, 191, 36, 0.025) 40deg,
    transparent 48deg,
    transparent 100%
  );
  animation: beamRotate2 25s linear infinite reverse;
}

.light-beam-3 {
  bottom: -100%;
  left: -30%;
  background: conic-gradient(
    from 140deg at 50% 50%,
    transparent 0deg,
    transparent 28deg,
    rgba(252, 211, 77, 0.05) 33deg,
    rgba(252, 211, 77, 0.02) 42deg,
    transparent 50deg,
    transparent 100%
  );
  animation: beamRotate3 18s linear infinite;
}

@keyframes beamRotate1 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes beamRotate2 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes beamRotate3 {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 第四层: 装饰性圆环 */
.deco-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(245, 158, 11, 0.10);
  pointer-events: none;
}

.deco-ring-1 {
  width: 400px;
  height: 400px;
  top: -120px;
  right: -100px;
  animation: ringPulse1 8s ease-in-out infinite;
}

.deco-ring-2 {
  width: 280px;
  height: 280px;
  bottom: -80px;
  left: -60px;
  border-color: rgba(251, 191, 36, 0.07);
  animation: ringPulse2 10s ease-in-out infinite 2s;
}

.deco-ring-3 {
  width: 180px;
  height: 180px;
  top: 40%;
  left: 10%;
  border-color: rgba(186, 230, 253, 0.08);
  border-style: dashed;
  animation: ringPulse3 12s ease-in-out infinite 4s;
}

@keyframes ringPulse1 {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.08); opacity: 1; }
}

@keyframes ringPulse2 {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
  50% { transform: scale(1.12) rotate(5deg); opacity: 0.9; }
}

@keyframes ringPulse3 {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.15) rotate(-8deg); opacity: 0.7; }
}

/* 第五层: 暗角遮罩 */
.vignette-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 60% at 50% 45%,
    transparent 0%,
    transparent 50%,
    rgba(15, 23, 42, 0.25) 85%,
    rgba(10, 15, 30, 0.45) 100%
  );
  pointer-events: none;
}

/* 第六层: 噪点纹理 */
.noise-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}

/* 浮动粒子 */
.header-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(251, 191, 36, 0.40);
  border-radius: 50%;
  left: var(--x);
  bottom: -10px;
  animation: floatUp var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-480px) scale(0.3); opacity: 0; }
}

/* 波浪分隔线 */
.header-wave {
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  line-height: 0;
  z-index: 2;
}

.header-wave svg {
  width: 100%;
  height: 70px;
}

/* 头部内容区 */
.header-content {
  position: relative;
  z-index: 3;
  max-width: 900px;
  text-align: center;
  color: white;
}

/* 标题动画 */
.page-title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  margin: 0 0 16px 0;
  letter-spacing: 8px;
  line-height: 1.3;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
}

.title-char {
  display: inline-block;
  opacity: 0;
  transform: translateY(30px) rotateX(-90deg);
  animation: charReveal 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  background: linear-gradient(180deg, #FFFFFF 0%, #BAE6FD 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

@keyframes charReveal {
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

.title-char:hover {
  transform: scale(1.2) translateY(-3px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 副标题 */
.page-subtitle {
  font-size: clamp(14px, 2vw, 18px);
  margin: 0 auto 36px;
  opacity: 0;
  animation: fadeInUp 0.8s ease 0.9s forwards;
  letter-spacing: 3px;
  max-width: 500px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.88);
  font-weight: 300;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 统计数据区域 */
.header-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 36px;
  opacity: 0;
  animation: fadeInUp 0.8s ease 1.1s forwards;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 14px 22px;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: default;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: rgba(245, 158, 11, 0.40);
}

.stat-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(251, 191, 36, 0.18));
  border-radius: 12px;
  color: #F59E0B;
  flex-shrink: 0;
}

.stat-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  color: #FFFFFF;
  font-variant-numeric: tabular-nums;
}

.counter {
  display: inline-block;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 400;
  letter-spacing: 1px;
  margin-top: 2px;
}

/* 搜索区域 */
.header-search {
  opacity: 0;
  animation: fadeInUp 0.8s ease 1.3s forwards;
}

.search-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50px;
  padding: 6px 6px 6px 22px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  max-width: 520px;
  margin: 0 auto;
}

.search-wrapper:focus-within {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(255, 215, 0, 0.3);
  transform: scale(1.02);
}

.search-icon {
  color: #999;
  flex-shrink: 0;
  transition: color 0.3s;
}

.search-wrapper:focus-within .search-icon {
  color: #F59E0B;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 14px;
  font-size: 15px;
  background: transparent;
  color: #333;
  min-width: 0;
}

.search-input::placeholder {
  color: #AAA;
}

.search-btn {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  border: none;
  padding: 11px 28px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  white-space: nowrap;
  letter-spacing: 1px;
}

.search-btn:hover {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.40);
}

.search-btn:active {
  transform: scale(0.97);
}

/* 热门标签 */
.hot-tags {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.hot-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.60);
  font-weight: 400;
}

.hot-tag {
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.85);
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-family: inherit;
}

.hot-tag:hover {
  background: rgba(245, 158, 11, 0.22);
  border-color: rgba(245, 158, 11, 0.50);
  color: #FCD34D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 24px 28px;
  border-radius: 16px;
  margin-bottom: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #1a1a2e;
  border-bottom: 2px solid #F59E0B;
  padding-bottom: 10px;
  display: inline-block;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

/* 非遗项目列表 */
.heritage-section {
  margin-bottom: 60px;
}

.heritage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 28px;
}

.heritage-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.heritage-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(245, 158, 11, 0.18);
}

.card-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  position: relative;
}

.card-image::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.1) 100%);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.heritage-card:hover .card-image img {
  transform: scale(1.08);
}

.card-content {
  padding: 22px 24px;
}

.heritage-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1a1a2e;
  letter-spacing: 0.5px;
}

.heritage-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 13px;
}

.info-item {
  padding: 4px 12px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border-radius: 20px;
  color: #D97706;
  font-weight: 500;
  font-size: 12px;
}

.heritage-brief {
  font-size: 14px;
  line-height: 1.7;
  color: #666;
  margin: 0 0 18px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.detail-link {
  align-self: flex-start;
  color: #D97706;
  font-weight: 600;
}

.detail-link:hover {
  color: #F59E0B;
}

/* 非遗详情 */
.heritage-detail {
  padding: 20px 0;
}

.detail-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding-bottom: 24px;
  border-bottom: 1px solid #EEE;
}

.detail-image {
  width: 220px;
  height: 280px;
  overflow: hidden;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1a1a2e;
}

.detail-level {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #F59E0B;
}

.detail-category,
.detail-region,
.detail-year {
  font-size: 14px;
  color: #666;
  margin: 0 0 6px 0;
}

.detail-content {
  line-height: 1.8;
}

.detail-content h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 22px 0 10px 0;
  color: #1a1a2e;
  padding-left: 12px;
  border-left: 3px solid #F59E0B;
}

.detail-content p {
  font-size: 14px;
  color: #444;
  margin: 0 0 16px 0;
}

.detail-content ul {
  font-size: 14px;
  color: #444;
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.detail-content li {
  margin-bottom: 6px;
}

/* 响应式设计 */
@media (max-width: 1199px) {
  .heritage-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 22px;
  }
}

@media (max-width: 991px) {
  .page-header {
    min-height: 440px;
    padding: 60px 20px 100px;
  }

  .header-stats {
    gap: 16px;
  }

  .stat-item {
    padding: 12px 18px;
  }

  .stat-number {
    font-size: 22px;
  }

  .deco-ring-1 { width: 280px; height: 280px; top: -80px; right: -60px; }
  .deco-ring-2 { width: 200px; height: 200px; bottom: -50px; left: -40px; }
  .deco-ring-3 { display: none; }
  .light-beam { opacity: 0.6; }
}

@media (max-width: 767px) {
  .page-header {
    min-height: auto;
    padding: 50px 16px 90px;
  }

  .page-title {
    letter-spacing: 4px;
  }

  .page-subtitle {
    letter-spacing: 2px;
    margin-bottom: 28px;
  }

  .header-stats {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .stat-item {
    width: 100%;
    max-width: 260px;
    justify-content: center;
    padding: 14px 20px;
  }

  .search-wrapper {
    max-width: 100%;
    border-radius: 16px;
    padding: 4px 4px 4px 18px;
  }

  .search-btn {
    padding: 10px 20px;
    font-size: 13px;
  }

  .hot-tags {
    gap: 6px;
  }

  .main-content {
    padding: 0 16px;
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

  .heritage-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .heritage-info {
    flex-direction: column;
    gap: 5px;
  }

  .detail-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .detail-image {
    width: 180px;
    height: 230px;
  }

  /* 移动端隐藏装饰元素以提升性能 */
  .deco-ring { display: none; }
  .light-beam { display: none; }
  .noise-overlay { opacity: 0.02; }
}

@media (max-width: 480px) {
  .page-title {
    letter-spacing: 2px;
    font-size: 24px;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .stat-number {
    font-size: 20px;
  }

  .header-wave svg {
    height: 50px;
  }
}
</style>