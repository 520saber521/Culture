<script setup>
import BrandButton from '@/components/BrandButton.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { post, getToken } from '@/utils/api/request'

const router = useRouter()
const sessions = ref([])
const activeId = ref('')
const prompt = ref('')
const attachment = ref('')
const attachmentName = ref('')
const busy = ref(false)
const error = ref('')
const preview = ref('')
const sidebarOpen = ref(false)
const fileInput = ref(null)
const composerInput = ref(null)
const stream = ref(null)
const dbName = 'jiangnan-atelier-v1'
const ideas = [
  { no: '壹', title: '古画新生', subtitle: '旧画里的新故事', prompt: '请以这张图片为基础，保留主体构图，用细腻的水墨设色与旧书页质感重新演绎，增加江南春日的气息。' },
  { no: '贰', title: '江南入梦', subtitle: '把诗意画成风景', prompt: '创作一幅江南雨巷主题画作：青石板、粉墙黛瓦、远处乌篷船，采用手绘线描和低饱和水墨设色，画面有安静的叙事感。' },
  { no: '叁', title: '国风人物', subtitle: '一人一景一段事', prompt: '创作一位漫步江南园林的古风人物，衣纹与花木细节精致，结合民国商业美术的构图和传统工笔设色。' },
  { no: '肆', title: '万象造物', subtitle: '给想象一个形状', prompt: '设计一幅江南文化主题的原创插画，融合亭台、花鸟与云纹，线条手绘感明显，配色以宣纸白、朱砂红、石青和豆绿为主。' },
]
const active = computed(() => sessions.value.find(item => item.id === activeId.value))
const turns = computed(() => active.value?.turns || [])
const latestArtwork = computed(() => [...turns.value].reverse().find(item => item.status === 'done' && item.output)?.output || '')
const canSend = computed(() => !!prompt.value.trim() && !busy.value)

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('state')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
async function readState() {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('state', 'readonly')
    const request = tx.objectStore('state').get('workspace')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
  })
}
async function persist() {
  try {
    const db = await openDb()
    const state = JSON.parse(JSON.stringify({ sessions: sessions.value, activeId: activeId.value }))
    await new Promise((resolve, reject) => {
      const tx = db.transaction('state', 'readwrite')
      tx.objectStore('state').put(state, 'workspace')
      tx.oncomplete = resolve
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    error.value = '本地画稿保存失败，请及时下载作品。'
  }
}
function newSession(shouldFocus = true) {
  const item = { id: crypto.randomUUID(), title: '未题画稿', updatedAt: Date.now(), turns: [] }
  sessions.value.unshift(item)
  activeId.value = item.id
  prompt.value = ''
  attachment.value = ''
  attachmentName.value = ''
  error.value = ''
  sidebarOpen.value = false
  persist()
  if (shouldFocus) nextTick(() => composerInput.value?.focus())
}
function selectSession(id) {
  activeId.value = id
  prompt.value = ''
  attachment.value = ''
  error.value = ''
  sidebarOpen.value = false
  persist()
  scrollBottom()
}
function renameSession(item) {
  const title = window.prompt('为这册画稿题名', item.title)
  if (title == null) return
  const clean = title.trim().slice(0, 32)
  if (!clean) return
  item.title = clean
  item.updatedAt = Date.now()
  persist()
}
function deleteSession(item) {
  if (!window.confirm('确定删除「' + item.title + '」及其中的创作记录吗？')) return
  sessions.value = sessions.value.filter(session => session.id !== item.id)
  if (activeId.value === item.id) activeId.value = sessions.value[0]?.id || ''
  if (!sessions.value.length) newSession()
  else persist()
}
function chooseIdea(idea) {
  prompt.value = idea.prompt
  nextTick(() => composerInput.value?.focus())
}
function scrollBottom() {
  nextTick(() => { if (stream.value) stream.value.scrollTop = stream.value.scrollHeight })
}
function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault()
    send()
  }
}
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
async function handleFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    error.value = '请选择 10 MB 以内的 JPG、PNG 或 WebP 图片。'
    event.target.value = ''
    return
  }
  attachment.value = await loadImage(file)
  attachmentName.value = file.name
  error.value = ''
  event.target.value = ''
}
function handleDrop(event) {
  const file = event.dataTransfer.files?.[0]
  if (file) handleFile({ target: { files: [file], value: '' } })
}
function removeAttachment() {
  attachment.value = ''
  attachmentName.value = ''
}
async function generate(turn) {
  const session = active.value
  busy.value = true
  turn.status = 'loading'
  turn.error = ''
  persist()
  scrollBottom()
  try {
    if (!getToken()) {
      turn.status = 'error'
      turn.error = '登录后即可开始生成图片。'
      return
    }
    const result = await post('/ai/image/generate', { prompt: turn.prompt, image: turn.source || undefined })
    if (result.code !== 200 || !result.data?.url) throw new Error(result.message || '图片生成失败')
    turn.output = result.data.url
    turn.status = 'done'
    session.updatedAt = Date.now()
    sessions.value.sort((a, b) => b.updatedAt - a.updatedAt)
  } catch (cause) {
    turn.status = 'error'
    turn.error = cause.message || '生成失败，请重试。'
  } finally {
    busy.value = false
    persist()
    scrollBottom()
  }
}
function send() {
  if (!canSend.value) return
  if (!active.value) newSession(false)
  const value = prompt.value.trim()
  const source = attachment.value || latestArtwork.value
  const turn = { id: crypto.randomUUID(), prompt: value, source, sourceName: attachmentName.value, output: '', status: 'loading', error: '', createdAt: Date.now() }
  active.value.turns.push(turn)
  if (active.value.title === '未题画稿') active.value.title = value.slice(0, 18)
  prompt.value = ''
  removeAttachment()
  generate(turn)
}
function retry(turn) {
  if (!busy.value) generate(turn)
}
function continueFrom(turn) {
  attachment.value = turn.output
  attachmentName.value = '上一轮作品'
  prompt.value = '请基于这张图片继续修改：'
  nextTick(() => composerInput.value?.focus())
}
async function download(turn) {
  try {
    const response = await fetch(turn.output)
    if (!response.ok) throw new Error()
    const blob = await response.blob()
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = '江苏造物手帖-' + new Date(turn.createdAt).toISOString().slice(0, 10) + '.png'
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
  } catch {
    window.open(turn.output, '_blank', 'noopener,noreferrer')
    error.value = '图片源限制了直接下载，已为你打开原图。'
  }
}
function dateLabel(time) {
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(time)
}
onMounted(async () => {
  try {
    const saved = await readState()
    sessions.value = Array.isArray(saved?.sessions) ? saved.sessions : []
    activeId.value = saved?.activeId || sessions.value[0]?.id || ''
  } catch { /* Browsing without IndexedDB still supports the current session. */ }
  if (!active.value) newSession(false)
})
</script>

<template>
  <div class="atelier">
    <div v-if="sidebarOpen" class="side-scrim" @click="sidebarOpen = false"></div>
    <aside class="atelier-sidebar" :class="{ 'is-open': sidebarOpen }">
      <div class="brand-block">
        <div class="brand-seal" aria-hidden="true">造<br>物</div>
        <div><span class="brand-en">JIANGSU ATELIER</span><strong>江苏造物手帖</strong><small>AI IMAGE STUDIO · 画稿间</small></div>
      </div>
      <BrandButton class="new-creation" @click="newSession()">新建画稿</BrandButton>
      <div class="sidebar-label"><span>创作档案</span><span>{{ sessions.length.toString().padStart(2, '0') }} 册</span></div>
      <div class="session-list">
        <div v-for="item in sessions" :key="item.id" class="session" :class="{ selected: activeId === item.id }">
          <button class="session-main" @click="selectSession(item.id)"><span class="session-dash">—</span><span class="session-copy"><strong>{{ item.title }}</strong><small>{{ dateLabel(item.updatedAt) }} · {{ item.turns.length }} 次创作</small></span></button>
          <div class="session-actions">
            <button :aria-label="'重命名' + item.title" title="重命名" @click="renameSession(item)">✎</button>
            <button :aria-label="'删除' + item.title" title="删除" @click="deleteSession(item)">×</button>
          </div>
        </div>
      </div>
      <div class="sidebar-bottom"><span class="sidebar-line"></span><span>灵感落纸 · 万物有形</span><span class="tiny-seal">江苏</span></div>
    </aside>

    <main class="atelier-main">
      <header class="studio-header">
        <button class="mobile-menu" aria-label="打开创作档案" @click="sidebarOpen = true">☰</button>
        <div><span class="header-kicker">江苏造物 / 创作中</span><h1>{{ turns.length ? active?.title : '一纸灵感，万象新生' }}</h1></div>
        <div class="header-right"><span class="ink-dot"></span><span>AI 图片创作台</span><span class="header-index">{{ String(turns.length).padStart(2, '0') }}</span></div>
      </header>

      <div ref="stream" class="studio-stream">
        <div v-if="!turns.length" class="welcome">
          <div class="welcome-art"><img src="/jiangnan-atelier-hero.png" alt="江南画案与园林水乡的原创手绘插画"><span class="art-stamp">灵感<br>入画</span></div>
          <div class="welcome-copy"><div class="eyebrow"><span></span> 以画为笺，与 AI 共作</div><h2>以一纸灵感，<br><em>绘万象新意。</em></h2><p>上传一张旧图，或从一句想象开始。每一次对话，都是画面生长的新一笔。</p></div>
          <div class="ideas-heading"><span>灵感题签</span><span>选一题落笔，或在下方自由描述</span></div>
          <div class="ideas">
            <button v-for="idea in ideas" :key="idea.no" class="idea" @click="chooseIdea(idea)"><span class="idea-no">{{ idea.no }}</span><span><strong>{{ idea.title }}</strong><small>{{ idea.subtitle }}</small></span><span class="idea-arrow">↗</span></button>
          </div>
        </div>
        <div v-else class="turns">
          <div class="process-intro"><span>创作过程</span><span>每一轮修改，都有迹可循</span></div>
          <article v-for="(turn, index) in turns" :key="turn.id" class="turn">
            <div class="turn-rail"><span>{{ String(index + 1).padStart(2, '0') }}</span><i></i></div>
            <div class="turn-body">
              <div class="turn-label">我的创作指令 <span>· {{ dateLabel(turn.createdAt) }}</span></div>
              <div class="request-card"><p>{{ turn.prompt }}</p><button v-if="turn.source" class="source-image" @click="preview = turn.source"><img :src="turn.source" alt="本轮参考图片"><span>参考画稿 ↗</span></button></div>
              <div class="reply-label"><span class="reply-seal">造</span><span>造物手帖</span><span class="reply-sub">· 本轮作品</span></div>
              <div v-if="turn.status === 'loading'" class="generating"><span class="ink-loader"></span><div><strong>正在研墨作画</strong><small>画面生成中，请稍候片刻…</small></div></div>
              <div v-else-if="turn.status === 'error'" class="generation-error"><strong>此笔未成</strong><span>{{ turn.error }}</span><button v-if="getToken()" @click="retry(turn)">重新生成 ↗</button><button v-else @click="router.push('/login?redirect=/design')">前往登录 ↗</button></div>
              <div v-else class="artwork-card"><button class="artwork-image" @click="preview = turn.output"><img :src="turn.output" :alt="'第' + (index + 1) + '轮生成作品'"><span>查看大图 ↗</span></button><div class="artwork-footer"><div><span class="artwork-number">作品 {{ String(index + 1).padStart(2, '0') }}</span><strong>画意已成</strong></div><div class="artwork-actions"><button @click="preview = turn.output">查看大图</button><button @click="download(turn)">下载</button><button :disabled="busy" @click="retry(turn)">重新生成</button><button class="continue-button" @click="continueFrom(turn)">继续修改 ↗</button></div></div></div>
            </div>
          </article>
        </div>
      </div>

      <div class="composer-wrap" @dragover.prevent @drop.prevent="handleDrop">
        <div v-if="error" class="composer-error" role="alert">{{ error }} <button aria-label="关闭提示" @click="error = ''">×</button></div>
        <div class="composer">
          <div v-if="attachment" class="attachment"><button class="attachment-preview" @click="preview = attachment"><img :src="attachment" alt="待创作的参考图"></button><span>{{ attachmentName || '参考图片' }}</span><button class="remove-attachment" aria-label="移除图片" @click="removeAttachment">×</button></div>
          <textarea ref="composerInput" v-model="prompt" rows="2" placeholder="写下你的画面想法，或上传图片后描述想修改的地方…" :disabled="busy" @keydown="handleKeydown"></textarea>
          <div class="composer-toolbar"><div><input ref="fileInput" class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" @change="handleFile"><button class="upload-button" :disabled="busy" @click="fileInput?.click()"><span>＋</span> 上传原图</button><span class="composer-hint">支持 JPG、PNG、WebP · Enter 发送</span></div><BrandButton class="send-button" :disabled="!canSend" :loading="busy" @click="send">{{ busy ? '创作中' : '开始创作' }}</BrandButton></div>
        </div>
        <p class="composer-note">创作由 AI 完成，请留意生成结果中的细节。</p>
      </div>
    </main>

    <div v-if="preview" class="preview-modal" role="dialog" aria-modal="true" aria-label="查看作品大图" @click.self="preview = ''"><button class="preview-close" aria-label="关闭大图" @click="preview = ''">×</button><img :src="preview" alt="作品大图"></div>
  </div>
</template>

<style scoped>
.atelier{--paper:var(--brand-paper);--cream:var(--brand-surface);--ink:var(--brand-ink);--muted:var(--brand-muted);--red:var(--brand-red);--line:var(--brand-line);display:grid;grid-template-columns:262px minmax(0,1fr);height:calc(100dvh - var(--brand-nav-height));min-height:600px;margin-top:var(--brand-nav-height);background:var(--paper);color:var(--ink);font-family:var(--brand-sans)}
button{font:inherit;cursor:pointer}button:disabled{cursor:not-allowed;opacity:.5}.atelier-sidebar{display:flex;flex-direction:column;background:var(--brand-jade);border-right:1px solid #cfc5b1;min-height:0;position:relative}.atelier-sidebar:after{content:"";position:absolute;top:0;bottom:0;right:4px;width:1px;background:#ddd5c5;pointer-events:none}.brand-block{display:flex;align-items:center;gap:13px;padding:32px 22px 26px}.brand-seal,.reply-seal{display:grid;place-items:center;background:var(--red);color:#fff4df;font-family:var(--brand-serif)}.brand-seal{width:42px;height:48px;line-height:1.15;font-size:17px;letter-spacing:2px;border-radius:2px}.brand-block strong,.brand-block small,.brand-en{display:block}.brand-block strong{font-family:var(--brand-serif);font-size:18px;letter-spacing:2px;white-space:nowrap}.brand-en{font-size:9px;letter-spacing:1.7px;color:#a65345;margin-bottom:4px}.brand-block small{color:#9a8f7c;font-size:9px;letter-spacing:1.2px;margin-top:4px}.plus{font-size:24px;line-height:1}.sidebar-label{margin:0 21px 12px;padding-bottom:11px;border-bottom:1px solid #c7bda9;display:flex;justify-content:space-between;color:#796d5e;font-family:var(--brand-serif);font-size:13px;letter-spacing:2px}.sidebar-label span:last-child{font-family:Georgia,serif;font-size:11px;letter-spacing:1px}.session-list{flex:1;overflow:auto;padding:0 11px}.session{display:flex;align-items:center;min-height:68px;margin:3px 0;border-left:3px solid transparent;transition:background .2s}.session.selected{background:#faf7ed;border-left-color:var(--red)}.session:hover{background:#f8f5eb}.session-main{flex:1;min-width:0;display:flex;text-align:left;align-items:flex-start;gap:8px;padding:10px 5px 10px 10px;border:0;background:none;color:var(--ink)}.session-dash{color:var(--red);font-family:Georgia,serif}.session-copy{min-width:0}.session-copy strong,.session-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.session-copy strong{font-weight:500;font-size:13px}.session-copy small{color:#9d9485;font-size:10px;margin-top:5px}.session-actions{display:flex;margin-right:7px;opacity:0}.session:hover .session-actions,.session.selected .session-actions{opacity:1}.session-actions button{border:0;background:none;color:#8b7b6a;padding:3px;font-size:16px}.session-actions button:hover{color:var(--red)}.sidebar-bottom{padding:18px 23px 23px;display:flex;align-items:center;gap:8px;color:#9d917b;font-family:var(--brand-serif);font-size:10px;letter-spacing:2px}.sidebar-line{width:19px;height:1px;background:#a99c88}.tiny-seal{margin-left:auto;color:var(--red);border:1px solid var(--red);padding:3px;letter-spacing:0;font-size:9px}
.atelier-main{min-width:0;min-height:0;display:flex;flex-direction:column;background:var(--brand-paper)}.studio-header{height:74px;min-height:74px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 43px;background:var(--brand-surface)}.header-kicker{font-size:10px;letter-spacing:2px;color:#aa6e59}.studio-header h1{font-family:var(--brand-serif);font-size:18px;margin:4px 0 0;letter-spacing:2px;font-weight:600}.header-right{display:flex;align-items:center;gap:10px;color:#7b7468;font-size:11px;letter-spacing:1px}.ink-dot{width:6px;height:6px;border-radius:50%;background:#788276}.header-index{margin-left:17px;font-family:Georgia,serif;color:#ac9c81;border-left:1px solid #cfc6b4;padding-left:14px;font-size:18px}.mobile-menu{display:none}.studio-stream{flex:1;overflow:auto;min-height:0;scroll-behavior:smooth}.welcome{max-width:1060px;margin:auto;padding:26px 48px 30px;display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.9fr);gap:0 46px;align-items:center}.welcome-art{position:relative;grid-column:1;grid-row:1 / 3;aspect-ratio:1.7;overflow:hidden;border:1px solid #d5cab5;background:#e9e1cd;box-shadow:none}.welcome-art img{width:100%;height:100%;object-fit:cover;object-position:center}.art-stamp{position:absolute;right:20px;bottom:18px;width:51px;height:51px;border:2px solid #a93631;color:#a93631;display:grid;place-items:center;line-height:1.1;font-family:var(--brand-serif);font-size:15px;background:#f9f1dfcc;transform:rotate(-9deg)}.welcome-copy{padding:20px 0}.eyebrow{color:#9f5844;letter-spacing:3px;font-size:11px}.eyebrow span{display:inline-block;width:24px;border-top:1px solid #9f5844;vertical-align:middle;margin-right:8px}.welcome-copy h2{font-family:var(--brand-serif);font-size:clamp(30px,3.4vw,49px);line-height:1.45;letter-spacing:3px;font-weight:600;margin:19px 0 13px}.welcome-copy h2 em{font-style:normal;color:var(--red)}.welcome-copy p{max-width:360px;font-size:13px;line-height:2;color:#756e62}.ideas-heading{grid-column:1/-1;border-bottom:1px solid #bfb49f;padding:12px 0 10px;margin-top:15px;display:flex;align-items:baseline;justify-content:space-between}.ideas-heading span:first-child{font-family:var(--brand-serif);font-size:16px;letter-spacing:2px}.ideas-heading span:last-child{font-size:11px;color:#a09888}.ideas{grid-column:1/-1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}.idea{display:flex;align-items:center;text-align:left;gap:13px;min-height:76px;background:#fffcf5;border:1px solid #dfd4c0;padding:13px;transition:transform .2s,border-color .2s,box-shadow .2s}.idea:hover{border-color:#a8453b;box-shadow:none}.idea-no{align-self:flex-start;color:#af433b;font-family:var(--brand-serif);font-size:12px;border:1px solid #d4ad9f;padding:3px 5px}.idea strong,.idea small{display:block}.idea strong{font-family:var(--brand-serif);font-size:15px;letter-spacing:1px;white-space:nowrap}.idea small{font-size:10px;color:#918577;margin-top:5px;white-space:nowrap}.idea-arrow{margin-left:auto;color:#a94539;align-self:flex-end}
.turns{max-width:860px;margin:auto;padding:28px 35px 50px}.process-intro{border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:end;padding-bottom:11px;color:#8f8170;font-size:11px;letter-spacing:1px}.process-intro span:first-child{font-family:var(--brand-serif);color:#453e34;font-size:16px;letter-spacing:3px}.turn{display:flex;gap:19px;padding-top:27px}.turn-rail{display:flex;flex-direction:column;align-items:center;color:var(--red);font:16px Georgia,serif;min-width:26px}.turn-rail i{display:block;flex:1;border-left:1px solid #d9c5ae;margin-top:12px}.turn:last-child .turn-rail i{display:none}.turn-body{min-width:0;flex:1;padding-bottom:29px}.turn-label,.reply-label{font-size:11px;color:#8e7968;letter-spacing:1px;display:flex;align-items:center;gap:5px}.turn-label span,.reply-sub{color:#aa9d8b}.request-card{margin:10px 0 24px;background:#fffdf7;border:1px solid #ded4c2;border-left:3px solid #a56e55;padding:18px 20px;box-shadow:none}.request-card p{margin:0;font-size:14px;line-height:1.85;white-space:pre-wrap}.source-image{position:relative;margin-top:13px;border:0;padding:0;background:none;text-align:left}.source-image img{width:74px;height:74px;object-fit:cover;border:1px solid #d8cdbb}.source-image span{display:block;font-size:10px;color:#a05242;margin-top:2px}.reply-seal{height:22px;width:22px;font-size:13px}.reply-label{margin-bottom:11px}.generating,.generation-error{min-height:135px;background:#fffcf5;border:1px solid #ded3bf;display:flex;align-items:center;gap:20px;padding:24px}.ink-loader{width:48px;height:48px;border-radius:45% 55% 50% 45%;background:#4b5147;animation:ink 2s ease-in-out infinite}.generating strong,.generating small{display:block}.generating strong{font-family:var(--brand-serif);font-size:16px}.generating small{color:#9b8b78;margin-top:7px;font-size:11px}.generation-error{color:#a33931;flex-wrap:wrap;min-height:85px}.generation-error span{font-size:12px;color:#795e54}.generation-error button{margin-left:auto;background:none;color:#a33931;border:0;text-decoration:underline}.artwork-card{background:#fffcf5;border:1px solid #d9cfbe;box-shadow:none}.artwork-image{display:block;width:100%;height:min(42vh,410px);border:0;padding:13px;background:#eee8db;position:relative}.artwork-image img{width:100%;height:100%;object-fit:contain}.artwork-image span{position:absolute;right:20px;bottom:20px;background:#2c2a26d9;color:#fff;padding:6px 10px;font-size:10px;letter-spacing:1px;opacity:0;transition:opacity .2s}.artwork-image:hover span{opacity:1}.artwork-footer{padding:13px 17px;display:flex;align-items:center;justify-content:space-between;gap:10px}.artwork-footer>div:first-child{display:flex;align-items:center;gap:11px;white-space:nowrap}.artwork-number{font:12px Georgia,serif;color:var(--red);letter-spacing:1px;border-right:1px solid #cfbca7;padding-right:11px}.artwork-footer strong{font-family:var(--brand-serif);font-weight:500;font-size:13px}.artwork-actions{display:flex;gap:3px}.artwork-actions button{border:0;background:transparent;color:#6f6458;font-size:11px;padding:8px;white-space:nowrap}.artwork-actions button:hover{color:var(--red)}.artwork-actions .continue-button{color:var(--red);border:1px solid #cbaa9b;margin-left:5px}
.composer-wrap{padding:13px clamp(25px,5vw,80px) 10px;border-top:1px solid #d9cfbd;background:var(--brand-jade);position:relative}.composer{max-width:900px;margin:auto;background:#fffdf8;border:1px solid #cfc3ae;box-shadow:none}.composer:focus-within{border-color:#b15b48}.composer textarea{width:100%;resize:none;border:0;outline:none;background:transparent;padding:15px 18px 8px;color:var(--ink);font:13px/1.8 "Noto Sans SC","Microsoft YaHei",sans-serif;min-height:68px;box-sizing:border-box}.composer textarea::placeholder{color:#a69b8d}.composer-toolbar{display:flex;justify-content:space-between;align-items:center;padding:0 9px 8px 15px}.composer-toolbar>div{display:flex;align-items:center;gap:15px}.upload-button{border:0;background:transparent;color:#a33731;font-size:12px;padding:7px 4px}.upload-button span{font-size:21px;vertical-align:-2px;margin-right:4px}.composer-hint{font-size:10px;color:#a79c8c}.composer-note{text-align:center;font-size:10px;color:#a59a8a;margin:7px 0 0}.attachment{display:flex;align-items:center;gap:10px;border-bottom:1px solid #e5d9c7;padding:8px 14px;font-size:11px;color:#746b5f}.attachment-preview{padding:0;border:0;background:none}.attachment-preview img{width:42px;height:42px;object-fit:cover}.remove-attachment{border:0;background:#eee6d9;color:#9f3c35;width:21px;height:21px;border-radius:50%;font-size:17px;margin-left:auto}.composer-error{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);width:min(90%,900px);background:#fff4ed;border:1px solid #d4aaa0;color:#9e342e;padding:8px 12px;font-size:12px;display:flex;justify-content:space-between}.composer-error button{border:0;background:none;color:inherit;font-size:18px}.visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.preview-modal{position:fixed;inset:0;z-index:10000;background:#171813ee;display:grid;place-items:center;padding:50px}.preview-modal img{max-width:100%;max-height:100%;object-fit:contain}.preview-close{position:absolute;right:25px;top:18px;border:1px solid #ffffff77;background:none;color:#fff;font-size:25px;width:38px;height:38px}.side-scrim{display:none}@keyframes ink{50%{transform:scale(1.15) rotate(14deg);border-radius:60% 40% 55% 45%;opacity:.53}}
@media(max-width:1100px){.welcome{gap:0 26px;padding:28px}.ideas{grid-template-columns:repeat(2,1fr)}.atelier{grid-template-columns:225px minmax(0,1fr)}.brand-block{padding-left:14px}}
@media(max-width:760px){.atelier{display:block;height:calc(100dvh - var(--brand-nav-height));margin-top:var(--brand-nav-height);min-height:0}.atelier-sidebar{position:fixed;z-index:2000;top:0;bottom:0;left:0;width:270px;transform:translateX(-105%);transition:transform .25s;box-shadow:none}.atelier-sidebar.is-open{transform:none}.side-scrim{display:block;position:fixed;inset:0;background:#1c1c1c66;z-index:1999}.atelier-main{height:100%}.studio-header{height:62px;min-height:62px;padding:0 17px;justify-content:flex-start;gap:14px}.studio-header h1{font-size:15px}.header-kicker{font-size:8px}.header-right{margin-left:auto}.header-right>span:not(.header-index){display:none}.mobile-menu{display:block;background:none;border:0;font-size:20px;color:var(--ink);padding:0}.welcome{display:block;padding:19px 18px 26px}.welcome-art{aspect-ratio:1.7;box-shadow:none}.welcome-copy{padding:22px 3px 4px}.welcome-copy h2{font-size:30px;margin:10px 0}.welcome-copy p{font-size:11px;line-height:1.7}.ideas-heading{margin-top:10px}.ideas-heading span:last-child{font-size:9px}.ideas{grid-template-columns:repeat(2,1fr);gap:7px}.idea{padding:9px;gap:7px;min-height:70px}.idea strong{font-size:13px}.idea small{font-size:9px}.idea-arrow{display:none}.turns{padding:17px 13px 30px}.turn{gap:7px}.turn-rail{font-size:12px;min-width:20px}.request-card{padding:12px}.artwork-image{height:270px}.artwork-footer{display:block}.artwork-actions{flex-wrap:wrap;margin-top:6px}.artwork-actions button{padding:6px}.composer-wrap{padding:8px 10px 6px}.composer textarea{min-height:60px;font-size:12px;padding:10px}.composer-hint{display:none}.composer-note{font-size:9px}}

@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
/* Shared Jiangsu brand; archive and generation behavior are unchanged. */
.brand-block strong{font-family:var(--brand-display);font-size:27px;font-weight:400;letter-spacing:1px}
.brand-en,.header-kicker,.eyebrow{color:var(--brand-red)}
.new-creation{margin:0 19px 28px;height:46px}
.send-button{height:44px;min-width:160px;padding:0 14px}
.session.selected{background:var(--brand-surface);border-left-color:var(--brand-red)}
.session:hover{background:var(--brand-surface)}
.studio-header{border-color:var(--brand-line)}
.welcome{padding-top:28px;padding-bottom:30px}
.welcome-art{box-shadow:none;background:var(--brand-jade);border:1px solid #9caa94}
.welcome-copy h2{font-family:var(--brand-display);font-weight:400;font-size:clamp(34px,3.5vw,52px);letter-spacing:1px}
.welcome-copy{border-top:1px solid var(--brand-line)}
.ideas-heading{background:var(--brand-jade);padding:14px 16px;border-color:var(--brand-line)}
.ideas-heading span:first-child{font-family:var(--brand-display);font-size:24px}
.idea{background:var(--brand-surface);border-color:var(--brand-line);box-shadow:none}
.idea strong{font-family:var(--brand-display);font-size:22px;font-weight:400}
.idea:hover{border-color:var(--brand-red);transform:none;box-shadow:none}
.idea-no{background:#f2e6bb;color:var(--brand-red);border-color:#c8bd96}
.composer{background:var(--brand-surface);border-color:var(--brand-line);box-shadow:none;border-radius:4px}
.composer:focus-within{border-color:var(--brand-red)}
.composer textarea{font-family:var(--brand-sans);font-size:14px}
.upload-button{color:var(--brand-red)}
.request-card,.artwork-card{background:var(--brand-surface);box-shadow:none;border-color:var(--brand-line)}
.request-card{border-left-color:var(--brand-red)}
.artwork-image{background:var(--brand-paper)}
@media(max-width:1000px) and (min-width:761px){.atelier{grid-template-columns:225px minmax(0,1fr)}.brand-block{padding-left:16px;padding-right:12px;gap:8px}.brand-block strong{font-size:23px}.welcome{padding:24px;gap:24px;grid-template-columns:1fr}.welcome-art{grid-row:auto;grid-column:auto;aspect-ratio:2}.welcome-copy{padding:18px 0}.ideas{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.welcome-copy h2{font-size:38px}.welcome-copy{margin-top:22px}.idea strong{font-size:20px}.send-button{height:40px;min-width:136px;padding:0 12px}.send-button :deep(.brand-button__label){font-size:20px;letter-spacing:1px}.studio-header h1{max-width:60vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.atelier-sidebar{border-right:1px solid var(--brand-line)}}
/* The atelier uses warm paper as its field; jade stays within the artwork. */
.atelier{--brand-paper:#f8f5ee;--brand-surface:#fffdf8;--brand-jade:#f0ebe1;--brand-line:#d9cdbb}
.atelier-sidebar{background:#f0ebe1;border-right-color:#d4c7b5}
.atelier-sidebar:after{background:#e1d7c9}
.composer-wrap{background:#eee8dc;border-top-color:#d5c8b7}
.ideas-heading{background:#f1e8d9}
.welcome-art{background:#eee7dc;border-color:#c6b9a7}
.ink-dot{background:var(--brand-red)}
</style>
