<template>
  <main class="editor-page">
    <header><p>EDITORIAL DESK · JIANGSU</p><h1>文化动态编辑台</h1><span>仅管理员可保存。这里编辑现有新闻的标题、摘要与正文。</span></header>
    <div class="editor-layout">
      <aside><h2>选择文章</h2><p v-if="loading">正在加载…</p><button v-for="item in articles" :key="item.id" :class="{ active: item.id === selectedId }" @click="openArticle(item.id)">{{ item.title }}</button></aside>
      <section v-if="selectedId" class="editor-sheet">
        <label>标题<input v-model.trim="title" maxlength="200" /></label>
        <label>摘要<textarea v-model.trim="summary" maxlength="500" rows="3" /></label>
        <span class="body-label">正文</span>
        <div v-if="editor" class="editor-toolbar">
          <button type="button" :class="{ active: editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">加粗</button>
          <button type="button" :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">小标题</button>
          <button type="button" :class="{ active: editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()">列表</button>
        </div>
        <EditorContent :editor="editor" class="editor-content" />
        <div class="editor-actions"><span role="status">{{ message }}</span><button :disabled="saving || !title" @click="save">{{ saving ? '保存中…' : '保存文章' }}</button></div>
      </section>
      <section v-else class="empty-sheet">选择左侧文章开始编辑。若列表为空，请先在 Supabase 中导入新闻数据。</section>
    </div>
  </main>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { get, put } from '@/utils/api/request'

const articles = ref([])
const selectedId = ref(null)
const title = ref('')
const summary = ref('')
const message = ref('')
const loading = ref(false)
const saving = ref(false)
const editor = ref(null)

async function openArticle(id) {
  message.value = ''
  const result = await get(`/news/detail/${id}`)
  if (result.code !== 200) { message.value = result.message || '文章读取失败'; return }
  selectedId.value = id
  title.value = result.data.title || ''
  summary.value = result.data.summary || ''
  editor.value?.commands.setContent(result.data.content || '')
}
async function save() {
  saving.value = true
  const result = await put(`/admin/news/${selectedId.value}`, { title: title.value, summary: summary.value, content: editor.value?.getHTML() || '' })
  message.value = result.code === 200 ? '已保存' : result.message || '保存失败'
  if (result.code === 200) {
    const item = articles.value.find((article) => article.id === selectedId.value)
    if (item) item.title = title.value
  }
  saving.value = false
}
onMounted(async () => {
  editor.value = new Editor({ extensions: [StarterKit], content: '' })
  loading.value = true
  const result = await get('/news/list', { pageSize: 100 })
  articles.value = result.code === 200 ? result.data.records || [] : []
  if (result.code !== 200) message.value = result.message || '新闻加载失败'
  loading.value = false
})
onBeforeUnmount(() => editor.value?.destroy())
</script>

<style scoped>
.editor-page { min-height:100vh; background:#f6f3ec; color:#303c35; padding:100px max(20px,calc((100vw - 1180px)/2)); }
header { border-bottom:1px solid #b7a785; padding-bottom:25px; margin-bottom:30px; } header p { letter-spacing:3px; color:#a4794a; font-size:12px; } h1,h2 { font-family:Georgia,'Noto Serif SC',serif; font-weight:500; } h1 { font-size:48px; margin:10px 0; } header span { color:#747a71; }
.editor-layout { display:grid; grid-template-columns:280px 1fr; gap:25px; } aside,.editor-sheet,.empty-sheet { background:#fffef9; border:1px solid #e6ddcc; border-radius:14px; padding:25px; }
aside button { display:block; width:100%; padding:12px; margin:7px 0; text-align:left; background:none; color:#445047; border:0; border-radius:7px; cursor:pointer; } aside button.active,aside button:hover { background:#eee7d7; }
label { display:grid; gap:8px; margin-bottom:20px; font-size:13px; } input,textarea { padding:12px; font:inherit; border:1px solid #d9d0bd; border-radius:7px; }.body-label { font-size:13px; }
.editor-toolbar { display:flex; gap:8px; margin-top:10px; padding:8px; border:1px solid #d9d0bd; border-bottom:0; border-radius:7px 7px 0 0; }.editor-toolbar button { border:0; background:#f1ece1; padding:7px 12px; border-radius:5px; cursor:pointer; }.editor-toolbar button.active { background:#6d2d3a; color:white; }
.editor-content { min-height:300px; padding:16px; border:1px solid #d9d0bd; border-radius:0 0 7px 7px; line-height:1.8; }.editor-content :deep(.ProseMirror) { min-height:280px; outline:none; }
.editor-actions { display:flex; justify-content:space-between; align-items:center; margin-top:22px; color:#8c423e; }.editor-actions button { border:0; border-radius:999px; background:#7e313c; color:white; padding:11px 25px; cursor:pointer; }.editor-actions button:disabled { opacity:.5; }
@media(max-width:760px) { .editor-layout { grid-template-columns:1fr; } h1 { font-size:34px; } }
</style>
