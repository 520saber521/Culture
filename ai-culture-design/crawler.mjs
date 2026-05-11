import fetch from 'node-fetch'
import { createHash } from 'crypto'
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PUBLIC_DIR = join(__dirname, 'public')
const GALLERY_DIR = join(PUBLIC_DIR, 'gallery')
const HASH_FILE = join(GALLERY_DIR, '.hashes.json')
const PROGRESS_FILE = join(GALLERY_DIR, '.progress.json')

const MIN_WIDTH = 1920
const MIN_HEIGHT = 1080
const MAX_CONCURRENT = 3
const REQUEST_DELAY = 1500
const TIMEOUT = 30000
const MAX_RETRIES = 3

const JIANGSU_SCENIC_SPOTS = [
  { name: '苏州拙政园', nameEn: 'Suzhou Humble Administrator Garden', category: 'heritage', tags: ['古典园林', '苏州', '世界遗产'] },
  { name: '南京中山陵', nameEn: 'Nanjing Sun Yat-sen Mausoleum', category: 'heritage', tags: ['南京', '中山陵', '历史遗迹'] },
  { name: '太湖风光', nameEn: 'Taihu Lake scenery', category: 'landscape', tags: ['太湖', '无锡', '自然风光'] },
  { name: '扬州瘦西湖', nameEn: 'Yangzhou Slender West Lake', category: 'heritage', tags: ['扬州', '瘦西湖', '江南水乡'] },
  { name: '周庄古镇', nameEn: 'Zhouzhuang water town', category: 'heritage', tags: ['周庄', '古镇', '江南水乡'] },
  { name: '南京夫子庙秦淮河', nameEn: 'Nanjing Confucius Temple Qinhuai River', category: 'heritage', tags: ['南京', '夫子庙', '秦淮河'] },
  { name: '连云港花果山', nameEn: 'Lianyungang Huaguo Mountain', category: 'landscape', tags: ['连云港', '花果山', '自然风光'] },
  { name: '南京长江大桥', nameEn: 'Nanjing Yangtze River Bridge', category: 'heritage', tags: ['南京', '长江大桥', '现代建筑'] },
  { name: '苏州博物馆', nameEn: 'Suzhou Museum I.M.Pei', category: 'heritage', tags: ['苏州', '博物馆', '现代建筑'] },
  { name: '南京明孝陵', nameEn: 'Nanjing Ming Xiaoling Tomb', category: 'heritage', tags: ['南京', '明孝陵', '世界遗产'] },
  { name: '南通濠河夜景', nameEn: 'Nantong Haohe River night view', category: 'landscape', tags: ['南通', '濠河', '夜景'] },
  { name: '镇江金山寺', nameEn: 'Zhenjiang Jinshan Temple', category: 'heritage', tags: ['镇江', '金山寺', '佛教文化'] },
  { name: '盐城丹顶鹤湿地', nameEn: 'Yancheng red crowned crane wetland', category: 'landscape', tags: ['盐城', '湿地', '自然风光'] },
  { name: '无锡鼋头渚', nameEn: 'Wuxi Yuantouzhu Turtle Head Isle', category: 'landscape', tags: ['无锡', '鼋头渚', '太湖'] },
  { name: '苏州虎丘塔', nameEn: 'Suzhou Huqiu Tiger Hill Pagoda', category: 'heritage', tags: ['苏州', '虎丘', '历史遗迹'] },
  { name: '南京玄武湖', nameEn: 'Nanjing Xuanwu Lake', category: 'landscape', tags: ['南京', '玄武湖', '城市公园'] },
  { name: '常州天目湖', nameEn: 'Changzhou Tianmu Lake', category: 'landscape', tags: ['常州', '天目湖', '自然风光'] },
  { name: '徐州云龙湖', nameEn: 'Xuzhou Yunlong Lake', category: 'landscape', tags: ['徐州', '云龙湖', '城市风光'] },
  { name: '苏州同里古镇', nameEn: 'Suzhou Tongli water town', category: 'heritage', tags: ['同里', '古镇', '江南水乡'] },
  { name: '南京栖霞山', nameEn: 'Nanjing Qixia Mountain autumn', category: 'landscape', tags: ['南京', '栖霞山', '红叶'] }
]

const IMAGE_SOURCES = [
  {
    name: 'Unsplash',
    baseUrl: 'https://api.unsplash.com/search/photos',
    needsAuth: true,
    buildUrl: (spot, page = 1) => {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY || ''
      if (!accessKey) return null
      return `${spot.baseUrl}?query=${encodeURIComponent(spot.nameEn + ' Jiangsu China')}&per_page=5&page=${page}&orientation=landscape&client_id=${accessKey}`
    },
    parseResponse: (data) => {
      if (!data.results) return []
      return data.results
        .filter(r => r.width >= MIN_WIDTH && r.height >= MIN_HEIGHT)
        .map(r => ({
          url: r.urls?.raw ? `${r.urls.raw}&w=1920&q=85` : r.urls?.regular,
          width: r.width,
          height: r.height,
          source: 'unsplash',
          sourceUrl: r.links?.html,
          author: r.user?.name,
          authorUrl: r.user?.links?.html
        }))
    }
  },
  {
    name: 'Pexels',
    baseUrl: 'https://api.pexels.com/v1/search',
    needsAuth: true,
    buildUrl: (spot, page = 1) => {
      const apiKey = process.env.PEXELS_API_KEY || ''
      if (!apiKey) return null
      return `${spot.baseUrl}?query=${encodeURIComponent(spot.nameEn + ' Jiangsu China')}&per_page=5&page=${page}&orientation=landscape`,
      headers: { Authorization: apiKey }
    },
    parseResponse: (data) => {
      if (!data.photos) return []
      return data.photos
        .filter(p => p.width >= MIN_WIDTH && p.height >= MIN_HEIGHT)
        .map(p => ({
          url: p.src?.landscape || p.src?.original,
          width: p.width,
          height: p.height,
          source: 'pexels',
          sourceUrl: p.url,
          author: p.photographer,
          authorUrl: p.photographer_url
        }))
    }
  },
  {
    name: 'Pixabay',
    baseUrl: 'https://pixabay.com/api/',
    needsAuth: true,
    buildUrl: (spot, page = 1) => {
      const apiKey = process.env.PIXABAY_API_KEY || ''
      if (!apiKey) return null
      return `${spot.baseUrl}?key=${apiKey}&q=${encodeURIComponent(spot.nameEn + ' Jiangsu China')}&image_type=photo&orientation=horizontal&min_width=${MIN_WIDTH}&min_height=${MIN_HEIGHT}&per_page=5&page=${page}&safesearch=true`
    },
    parseResponse: (data) => {
      if (!data.hits) return []
      return data.hits.map(h => ({
        url: h.largeImageURL || h.webformatURL?.replace('_640', '_1280'),
        width: h.imageWidth,
        height: h.imageHeight,
        source: 'pixabay',
        sourceUrl: h.pageURL,
        author: h.user,
        authorUrl: `https://pixabay.com/users/${h.user}-${h.user_id}/`
      }))
    }
  }
]

class JiangsuImageCrawler {
  constructor() {
    this.downloadedHashes = this.loadHashes()
    this.progress = this.loadProgress()
    this.stats = { total: 0, downloaded: 0, skipped: 0, failed: 0 }
  }

  loadHashes() {
    try {
      if (existsSync(HASH_FILE)) {
        return JSON.parse(readFileSync(HASH_FILE, 'utf-8'))
      }
    } catch (e) {
      console.log('⚠️  无法加载哈希记录，将创建新记录')
    }
    return {}
  }

  saveHashes() {
    writeFileSync(HASH_FILE, JSON.stringify(this.downloadedHashes, null, 2))
  }

  loadProgress() {
    try {
      if (existsSync(PROGRESS_FILE)) {
        return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
      }
    } catch (e) {}
    return { completed: [], lastSpotIndex: 0 }
  }

  saveProgress() {
    writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2))
  }

  async calculateHash(buffer) {
    return createHash('md5').update(buffer).digest('hex')
  }

  isDuplicate(hash) {
    return !!this.downloadedHashes[hash]
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  printProgress(spot, current, total) {
    const percent = Math.round((current / total) * 100)
    const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2))
    process.stdout.write(`\r📋 进度: [${bar}] ${percent}% | ${current}/${total} | 当前: ${spot.name} | ✅${this.stats.downloaded} ⏭️${this.stats.skipped} ❌${this.stats.failed}`)
  }

  async fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)
        const response = await fetch(url, { ...options, signal: controller.signal })
        clearTimeout(timeoutId)
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        return response
      } catch (error) {
        if (i === retries - 1) throw error
        console.log(`\n🔄 重试 (${i + 1}/${retries}): ${error.message}`)
        await this.delay(2000 * (i + 1))
      }
    }
  }

  async searchImages(spot) {
    const results = []
    for (const source of IMAGE_SOURCES) {
      try {
        const url = source.buildUrl(spot)
        if (!url) continue
        const headers = source.buildUrl.headers || {}
        const response = await this.fetchWithRetry(url, { headers })
        const data = await response.json()
        const parsed = source.parseResponse(data)
        results.push(...parsed)
        await this.delay(REQUEST_DELAY)
      } catch (error) {
        console.log(`\n⚠️  ${source.name} 搜索失败 (${spot.name}): ${error.message}`)
      }
    }
    return results
  }

  async downloadImage(imageInfo, spot) {
    try {
      const response = await this.fetchWithRetry(imageInfo.url)
      const buffer = Buffer.from(await response.arrayBuffer())
      const hash = await this.calculateHash(buffer)

      if (this.isDuplicate(hash)) {
        this.stats.skipped++
        return null
      }

      const fileName = `jiangsu_${spot.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}.jpg`
      const filePath = join(GALLERY_DIR, fileName)

      const writeStream = createWriteStream(filePath)
      writeStream.write(buffer)
      writeStream.end()

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve)
        writeStream.on('error', reject)
      })

      this.downloadedHashes[hash] = {
        fileName,
        spot: spot.name,
        source: imageInfo.source,
        author: imageInfo.author,
        downloadedAt: new Date().toISOString()
      }
      this.saveHashes()

      this.stats.downloaded++
      return {
        fileName,
        spot,
        imageInfo,
        hash
      }
    } catch (error) {
      this.stats.failed++
      console.log(`\n❌ 下载失败: ${error.message}`)
      return null
    }
  }

  async crawl() {
    console.log('🚀 江苏风景图片爬虫启动')
    console.log(`📁 图片保存目录: ${GALLERY_DIR}`)
    console.log(`📐 最低分辨率要求: ${MIN_WIDTH}×${MIN_HEIGHT}`)
    console.log(`🏞️  目标景点数量: ${JIANGSU_SCENIC_SPOTS.length}`)
    console.log('─'.repeat(60))

    if (!existsSync(GALLERY_DIR)) {
      mkdirSync(GALLERY_DIR, { recursive: true })
    }

    const results = []
    const totalSpots = JIANGSU_SCENIC_SPOTS.length

    for (let i = 0; i < totalSpots; i++) {
      const spot = JIANGSU_SCENIC_SPOTS[i]
      this.printProgress(spot, i + 1, totalSpots)

      if (this.progress.completed.includes(spot.name)) {
        this.stats.skipped++
        continue
      }

      try {
        const images = await this.searchImages(spot)
        this.stats.total += images.length

        if (images.length > 0) {
          const bestImage = images.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0]
          const result = await this.downloadImage(bestImage, spot)
          if (result) {
            results.push(result)
          }
        } else {
          console.log(`\n⚠️  未找到 ${spot.name} 的高清图片`)
        }

        this.progress.completed.push(spot.name)
        this.saveProgress()
      } catch (error) {
        console.log(`\n❌ 处理 ${spot.name} 时出错: ${error.message}`)
      }

      await this.delay(REQUEST_DELAY)
    }

    console.log('\n\n' + '═'.repeat(60))
    console.log('📊 爬取结果统计:')
    console.log(`   总搜索图片: ${this.stats.total}`)
    console.log(`   成功下载: ${this.stats.downloaded}`)
    console.log(`   跳过(重复): ${this.stats.skipped}`)
    console.log(`   失败: ${this.stats.failed}`)
    console.log('═'.repeat(60))

    this.generateGalleryData(results)
    return results
  }

  generateGalleryData(results) {
    const galleryData = results.map((result, index) => {
      const spot = result.spot
      const imageInfo = result.imageInfo
      return {
        id: index + 1,
        title: spot.name,
        description: `${spot.name}是江苏省著名景点，展现了江苏独特的自然风光和人文魅力。`,
        imageUrl: `/gallery/${result.fileName}`,
        author: imageInfo.author || '江苏风光',
        authorAvatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
        category: spot.category,
        tags: spot.tags,
        likes: Math.floor(Math.random() * 300) + 50,
        views: Math.floor(Math.random() * 5000) + 500,
        collects: Math.floor(Math.random() * 100) + 10,
        isLiked: false,
        isCollected: false,
        isFollowing: false,
        isPublic: true,
        allowDownload: true,
        createTime: new Date().toISOString().split('T')[0],
        imageHeight: 180 + Math.floor(Math.random() * 100),
        comments: [],
        source: imageInfo.source,
        sourceUrl: imageInfo.sourceUrl,
        photoAuthor: imageInfo.author,
        photoAuthorUrl: imageInfo.authorUrl
      }
    })

    const dataFilePath = join(GALLERY_DIR, 'gallery-data.json')
    writeFileSync(dataFilePath, JSON.stringify(galleryData, null, 2))
    console.log(`\n📄 画廊数据已生成: ${dataFilePath}`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'clean') {
    console.log('🧹 清理已下载的图片和记录...')
    if (existsSync(GALLERY_DIR)) {
      const { rmSync } = await import('fs')
      rmSync(GALLERY_DIR, { recursive: true, force: true })
      console.log('✅ 清理完成')
    }
    return
  }

  if (command === 'status') {
    console.log('📊 当前爬取状态:')
    if (existsSync(HASH_FILE)) {
      const hashes = JSON.parse(readFileSync(HASH_FILE, 'utf-8'))
      console.log(`   已下载图片: ${Object.keys(hashes).length}`)
      Object.values(hashes).forEach(h => {
        console.log(`   - ${h.spot} (${h.fileName}) [来源: ${h.source}]`)
      })
    } else {
      console.log('   尚未下载任何图片')
    }
    if (existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
      console.log(`   已完成景点: ${progress.completed.length}/${JIANGSU_SCENIC_SPOTS.length}`)
    }
    return
  }

  const crawler = new JiangsuImageCrawler()
  await crawler.crawl()
}

main().catch(console.error)
