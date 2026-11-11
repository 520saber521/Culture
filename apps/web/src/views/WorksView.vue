<template>
  <main class="works-page">
    <header><p>JIANGSU · CREATIVE ARCHIVE</p><h1>我的文化作品</h1><span>把一份灵感，留在江苏文化的长卷里。</span></header>
    <section v-if="!loggedIn" class="notice"><h2>登录后开始收藏你的创作</h2><button @click="router.push('/login?redirect=/works')">前往登录</button></section>
    <template v-else>
      <section class="create">
        <div><small>01 / 新建作品</small><h2>上传一幅作品</h2><p>支持 JPG、PNG、WebP，单张不超过 5 MB。作品将保存到你的账户。</p></div>
        <form @submit.prevent="saveWork">
          <label>作品名称<input v-model.trim="form.title" maxlength="200" required placeholder="例如：云锦中的江南" /></label>
          <label>创作说明<textarea v-model.trim="form.description" maxlength="1000" rows="3" placeholder="说说你使用的文化元素与创作想法" /></label>
          <label>作品图片<input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" required @change="onFileChange" /></label>
          <img v-if="preview" :src="preview" alt="作品预览" class="preview" />
          <div class="actions"><span>{{ message }}</span><button type="submit" :disabled="busy">{{ busy ? '正在保存…' : '发布作品' }}</button></div>
        </form>
      </section>
      <section class="gallery"><div class="gallery-heading"><h2>已保存的作品</h2><input v-model="search" placeholder="搜索作品名称" aria-label="搜索作品名称" /></div>
        <p v-if="loading">正在加载作品…</p><p v-else-if="!filteredWorks.length">暂无作品，上传第一幅创作吧。</p>
        <div v-else class="work-grid"><article v-for="work in filteredWorks" :key="work.id" class="work-card"><img :src="work.imageUrl" :alt="work.title" /><div><h3>{{ work.title }}</h3><p>{{ work.description }}</p></div></article></div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { get, getToken, post, upload } from '@/utils/api/request'

const router = useRouter()
const loggedIn = ref(Boolean(getToken()))
const loading = ref(false)
const busy = ref(false)
const message = ref('')
const works = ref([])
const search = ref('')
const form = reactive({ title: '', description: '' })
const file = ref(null)
const fileInput = ref(null)
const preview = ref('')
const filteredWorks = computed(() => works.value.filter((work) => work.title?.includes(search.value)))

function onFileChange(event) {
  if (preview.value) URL.revokeObjectURL(preview.value)
  file.value = event.target.files?.[0] || null
  preview.value = file.value ? URL.createObjectURL(file.value) : ''
}
async function loadWorks() {
  loading.value = true
  const result = await get('/works/my', { pageSize: 100 })
  works.value = result.code === 200 ? result.data.records || [] : []
  if (result.code !== 200) message.value = result.message || '作品加载失败'
  loading.value = false
}
async function saveWork() {
  if (!file.value) return
  if (file.value.size > 5 * 1024 * 1024) { message.value = '图片不能超过 5 MB'; return }
  busy.value = true
  message.value = ''
  try {
    const image = await upload('/works/upload', file.value)
    if (image.code !== 200) throw new Error(image.message || '上传失败')
    const saved = await post('/works', { title: form.title, description: form.description, imageUrl: image.data.url, isPublic: true })
    if (saved.code !== 200) throw new Error(saved.message || '作品保存失败')
    form.title = ''
    form.description = ''
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
    if (preview.value) URL.revokeObjectURL(preview.value)
    preview.value = ''
    message.value = '作品已保存'
    await loadWorks()
  } catch (error) { message.value = error.message }
  finally { busy.value = false }
}
onMounted(() => { if (loggedIn.value) loadWorks() })
onBeforeUnmount(() => { if (preview.value) URL.revokeObjectURL(preview.value) })
</script>

<style scoped>
.works-page { min-height:100vh; padding:100px max(24px,calc((100vw - 1160px)/2)) 90px; background:#f7f3eb; color:#27352f; }
header { border-bottom:1px solid #b9a77e; padding-bottom:35px; margin-bottom:36px; } header>p,small { color:#94653b; letter-spacing:3px; font-size:12px; }
h1,h2,h3 { font-family:Georgia,'Noto Serif SC',serif; font-weight:500; } h1 { font-size:clamp(36px,5vw,64px); margin:13px 0; } header>span { color:#667068; }
.create { display:grid; grid-template-columns:minmax(220px,1fr) minmax(300px,1.5fr); gap:50px; padding:35px; background:#fffdf8; border:1px solid #e6dcc9; border-radius:18px; }
.create h2 { font-size:32px; }.create p { line-height:1.8; color:#73776c; } form { display:grid; gap:18px; } label { display:grid; gap:8px; font-size:13px; color:#546056; }
input,textarea { font:inherit; width:100%; box-sizing:border-box; border:1px solid #d8d2c5; border-radius:8px; background:white; padding:11px 13px; }.preview { max-width:100%; max-height:240px; object-fit:contain; border-radius:8px; }
.actions { display:flex; align-items:center; justify-content:space-between; gap:15px; color:#9a4a3d; font-size:13px; } button { background:#7e313c; color:white; border:0; border-radius:999px; padding:11px 23px; cursor:pointer; } button:disabled { opacity:.55; cursor:wait; }
.gallery { margin-top:58px; }.gallery-heading { display:flex; align-items:center; justify-content:space-between; gap:20px; }.gallery-heading input { max-width:260px; }.work-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:20px; }
.work-card { overflow:hidden; background:white; border-radius:14px; box-shadow:0 8px 25px #32221811; }.work-card img { width:100%; height:210px; object-fit:cover; }.work-card div { padding:15px; }.work-card p { color:#6c746d; line-height:1.6; }.notice { padding:60px 20px; text-align:center; background:white; border-radius:18px; }
@media(max-width:760px) { .create { grid-template-columns:1fr; padding:22px; gap:10px; }.work-grid { grid-template-columns:1fr; }.gallery-heading { align-items:flex-start; flex-direction:column; } }
</style>
