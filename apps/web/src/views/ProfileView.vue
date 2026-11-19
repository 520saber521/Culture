<template>
  <main class="profile-page">
    <div class="profile-container">
      <div class="page-overline"><span>江苏文创 <i>/</i> 我的空间</span><span class="archive-label">PERSONAL ARCHIVE</span></div>
      <header class="identity-header">
        <button class="identity-avatar" aria-label="编辑头像和资料" @click="openEditProfile"><el-avatar :src="avatar" :size="80">{{ nickname.slice(0,1) || '我' }}</el-avatar></button>
        <div class="identity-copy"><p class="username">@{{ username || '—' }}</p><h1>{{ nickname || '文化同好' }}<span>的文化小集</span></h1><p class="bio">{{ signature || '从一份喜欢开始，慢慢收集自己的江苏。' }}</p></div>
        <div class="identity-actions"><button class="outline-button" @click="openEditProfile">编辑资料 <span>↗</span></button><el-dropdown trigger="click" @command="handleAccountCommand"><button class="account-button" aria-label="账户设置">•••</button><template #dropdown><el-dropdown-menu><el-dropdown-item command="edit">个人资料与联系方式</el-dropdown-item><el-dropdown-item command="logout" :disabled="loggingOut">{{ loggingOut ? '正在退出…' : '退出登录' }}</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div>
        <div v-if="profileError" class="identity-error" role="status">个人资料暂未同步 <button class="text-link" @click="loadProfile">重试</button></div>
      </header>
      <div class="archive-index"><nav aria-label="个人内容目录"><a href="#my-exhibition">作品选页 <span>{{ worksReady ? works.length : '—' }}</span></a><a href="#my-collections">灵感收藏 <span>{{ collectionReady ? collections.length : '—' }}</span></a></nav><span class="like-count">作品获赞 <b>{{ worksReady ? totalLikes : '—' }}</b></span></div>

      <section id="my-exhibition" class="exhibition" aria-labelledby="works-title" :aria-busy="worksLoading">
        <header class="section-heading"><div><p class="eyebrow">01 / MADE BY ME</p><h2 id="works-title">我的作品<span class="title-dot">。</span></h2></div><div class="section-side"><p>从想法到作品，留下自己的表达。</p><router-link to="/works" class="text-link">管理作品 ↗</router-link></div></header>
        <div v-if="worksLoading" class="loading-shelf" role="status"><i></i><p>正在加载你的作品…</p></div>
        <div v-else-if="worksError" class="error-note" role="status">作品暂未加载成功。<button class="text-link" @click="loadWorks">重新加载作品 ↗</button></div>
        <template v-if="works.length && !worksLoading">
          <div class="exhibit-grid" :class="'exhibit-count-' + featuredWorks.length">
            <button v-for="(item,index) in featuredWorks" :key="item.key" class="exhibit-card" @click="selectedItem=item">
              <div class="exhibit-image"><img v-if="item.image && !brokenImages[item.image]" :src="item.image" :alt="item.title" @error="brokenImages[item.image]=true"><span v-else class="image-placeholder">暂未提供影像</span></div>
              <div class="exhibit-caption"><span class="exhibit-number">{{ String(index+1).padStart(2,'0') }}</span><div><p>{{ item.dateLabel || '我的创作' }}<span v-if="item.visibility"> · {{ item.visibility }}</span></p><h3>{{ item.title }}</h3><p v-if="index===0 && item.description" class="exhibit-description">{{ item.description }}</p></div><span class="open-mark" aria-hidden="true">↗</span></div>
            </button>
          </div>
          <div class="exhibition-foot"><span>近期作品 · 按创建时间排列</span><button v-if="works.length>3" class="text-link" :aria-expanded="showAllWorks" @click="showAllWorks=!showAllWorks">{{ showAllWorks ? '收起作品 −' : `查看其余 ${works.length-3} 件作品 +` }}</button><span v-else>{{ works.length }} 件创作，慢慢积累。</span></div>
          <div v-if="showAllWorks" class="work-list"><button v-for="item in sortedWorks.slice(3)" :key="item.key" @click="selectedItem=item"><span>{{ item.title }}</span><small>{{ item.dateLabel || '我的创作' }}</small><span>↗</span></button></div>
        </template>
        <div v-else-if="!worksLoading && !worksError" class="first-work"><div class="blank-folio" aria-hidden="true"><span>始</span><small>每一幅作品，都始于一个想法。</small></div><div><p class="eyebrow">你的第一件作品</p><h3>这一页，留给你的表达</h3><p>把喜欢的纹样、色彩与风物，<br>变成一件属于自己的创作。</p><BrandButton class="state-button" @click="router.push('/design')">开始创作</BrandButton><router-link to="/works" class="upload-link">已有作品？上传到这里 ↗</router-link></div></div>
      </section>

      <div class="collection-layout">
        <section id="my-collections" class="collection-section" aria-labelledby="collections-title" :aria-busy="collectionLoading">
          <header class="section-heading"><div><p class="eyebrow">02 / KEPT FOR INSPIRATION</p><h2 id="collections-title">我的灵感收藏</h2></div><router-link to="/culture" class="text-link">发现更多 ↗</router-link></header>
          <nav v-if="collections.length" class="collection-filters" aria-label="收藏类别"><button v-for="filter in collectionFilters" :key="filter.id" :aria-pressed="collectionFilter===filter.id" @click="setCollectionFilter(filter.id)">{{ filter.label }}<span>{{ filter.count }}</span></button></nav>
          <div v-if="collectionLoading" class="loading-shelf" role="status"><i></i><p>正在整理你的收藏…</p></div>
          <div v-else-if="collectionError" class="error-note" role="status">收藏暂未加载成功，已有内容会为你保留。<button class="text-link" @click="loadCollections">重新加载收藏 ↗</button></div>
          <div v-if="collections.length && !collectionLoading" class="collection-grid"><button v-for="item in visibleCollections" :key="item.key" class="collection-card" @click="selectedItem=item"><div class="collection-image"><img v-if="item.image && !brokenImages[item.image]" :src="item.image" :alt="item.title" loading="lazy" @error="brokenImages[item.image]=true"><span v-else class="image-placeholder">暂未提供影像</span></div><div><p class="card-category">{{ item.category }}</p><h3>{{ item.title }}</h3><p class="card-description">{{ item.description || '留住这一份喜欢，下次再来细读。' }}</p><span class="card-read">查看收藏 ↗</span></div></button></div>
          <div v-else-if="!collectionLoading && !collectionError" class="collection-empty"><span aria-hidden="true">藏</span><div><h3>遇见喜欢的，就留在这里</h3><p>收藏一门手艺、一幅作品，给下一次创作积攒灵感。</p><router-link to="/culture" class="text-link">去发现第一份灵感 ↗</router-link></div></div>
          <button v-if="filteredCollections.length>6" class="more-collections" :aria-expanded="showAllCollections" @click="showAllCollections=!showAllCollections">{{ showAllCollections ? '收起收藏 −' : `展开全部 ${filteredCollections.length} 则收藏 +` }}</button>
        </section>
        <aside class="studio-note" aria-labelledby="studio-title"><p class="eyebrow">留一点时间，给创作</p><h2 id="studio-title"><span>灵感未完</span><span>待你续写</span></h2><p>看见喜欢的，不妨试着<br>做一点自己的。</p><BrandButton class="studio-button" @click="router.push('/design')">开始创作</BrandButton><router-link to="/works">上传已有作品 <span>↗</span></router-link><div class="studio-foot"><span>JIANGSU</span><span>创作日常</span></div></aside>
      </div>
      <footer class="shelf-note"><span>江苏文创 / 我的空间</span><span>一份喜欢，一点自己的表达。</span></footer>
    </div>
    <el-dialog
      v-model="showEditProfile"
      title="编辑个人资料"
      width="min(560px, calc(100vw - 32px))"
      :close-on-click-modal="false"
      class="profile-edit-dialog"
      @closed="resetForm" :close-on-press-escape="!saving" :show-close="!saving"
    >
      <div class="edit-profile-content">
        <div class="edit-header" hidden>
          <h3>编辑个人资料</h3>
          <p>完善您的个人信息</p>
        </div>

        <el-form
          ref="profileFormRef"
          :model="profileForm" :disabled="saving"
          :rules="profileRules"
          label-position="top"
          class="profile-form"
        >
          <div class="avatar-upload-section">
            <div class="avatar-preview" role="button" tabindex="0" aria-label="更换头像" @keydown.enter="triggerAvatarUpload" @click="triggerAvatarUpload">
              <el-avatar :src="profileForm.avatar" :size="100" class="preview-avatar" />
              <div class="avatar-upload-overlay">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21429 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21429 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>
            <input
              ref="avatarInputRef"
              type="file"
              accept="image/jpeg,image/png"
              hidden
              @change="handleAvatarChange"
            />
            <div class="avatar-upload-tips">
              <button type="button" class="text-link" @click="triggerAvatarUpload">更换头像</button>
              <p>支持 JPG、PNG 格式，大小不超过 2MB</p>
            </div>
          </div>

          <el-form-item label="姓名" prop="nickname">
            <el-input
              v-model="profileForm.nickname"
              placeholder="请输入您的姓名"
              maxlength="20"
              show-word-limit
            >
              <template #prefix>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="联系方式" prop="phone">
            <el-input
              v-model="profileForm.phone"
              placeholder="请输入您的手机号码"
              maxlength="11"
            >
              <template #prefix>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="profileForm.email"
              placeholder="请输入您的邮箱地址"
            >
              <template #prefix>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="个人简介" prop="bio">
            <el-input
              v-model="profileForm.bio"
              type="textarea"
              placeholder="介绍一下自己吧..."
              :rows="4"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" :disabled="saving" @click="handleCancel">取消</el-button>
          <BrandButton class="save-btn" :loading="saving" @click="handleSave">{{ saving ? "保存中" : "保存修改" }}</BrandButton>
        </div>
      </template>
    </el-dialog>
<el-dialog :model-value="!!selectedItem" @update:model-value="selectedItem=null" :title="selectedItem?.title" width="min(760px, calc(100vw - 32px))" class="profile-read-dialog" destroy-on-close><article v-if="selectedItem" class="detail-article"><img v-if="selectedItem.image && !brokenImages[selectedItem.image]" :src="selectedItem.image" :alt="selectedItem.title" @error="brokenImages[selectedItem.image]=true"><p class="eyebrow">{{selectedItem.category}}</p><p>{{selectedItem.content || '这份内容暂未提供文字介绍。'}}</p></article></el-dialog>
</main></template>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BrandButton from '@/components/BrandButton.vue'
import { authApi, userWorkApi, collectionApi, removeToken } from '@/utils/api'
const router=useRouter()
const username=ref(''), nickname=ref(''), avatar=ref(''), signature=ref('')
const showEditProfile=ref(false), profileFormRef=ref(null), avatarInputRef=ref(null), saving=ref(false), loggingOut=ref(false)
const profileForm=reactive({avatar:'',nickname:'',phone:'',email:'',bio:''})
const originalForm=reactive({...profileForm})
const collections=ref([]), works=ref([]), selectedItem=ref(null), brokenImages=ref({})
const collectionReady=ref(false), worksReady=ref(false), collectionLoading=ref(true), worksLoading=ref(true), collectionError=ref(false), worksError=ref(false), profileError=ref(false)
const totalLikes=computed(()=>works.value.reduce((sum,item)=>sum+(Number(item.likes)||0),0))
const showAllWorks=ref(false), collectionFilter=ref('all'), showAllCollections=ref(false)
const categoryNames={heritage:'非遗技艺',art:'传统艺术',news:'文化资讯',work:'影像作品'}
const sortedWorks=computed(()=>[...works.value].sort((a,b)=>b.createdTime-a.createdTime))
const featuredWorks=computed(()=>sortedWorks.value.slice(0,3))
const collectionFilters=computed(()=>[{id:'all',label:'全部',count:collections.value.length},...Object.entries(categoryNames).map(([id,label])=>({id,label,count:collections.value.filter(item=>item.type===id).length})).filter(item=>item.count)])
const filteredCollections=computed(()=>collectionFilter.value==='all'?collections.value:collections.value.filter(item=>item.type===collectionFilter.value))
const visibleCollections=computed(()=>showAllCollections.value?filteredCollections.value:filteredCollections.value.slice(0,6))
function setCollectionFilter(id){collectionFilter.value=id;showAllCollections.value=false}
function handleAccountCommand(command){if(command==='edit')openEditProfile();else if(command==='logout')logout()}
async function allPages(fetcher){const items=[];for(let pageNum=1;;pageNum++){const result=await fetcher({pageNum,pageSize:100});if(result.code!==200||!Array.isArray(result.data?.records))throw new Error('load');items.push(...result.data.records);if(pageNum >= (Number(result.data.pages)||1))return items}}
function present(item,type){
  const parsedDate=new Date(item.createdAt || '')
  const hasDate=Number.isFinite(parsedDate.getTime())
  return {key:`${type}-${item.id}`,type,title:item.name||item.title||'未命名',image:item.imageUrl||item.coverImage||'',category:categoryNames[type],description:item.description||item.summary||'',content:item.content||item.description||item.summary||'',likes:item.likeCount||0,createdTime:hasDate?parsedDate.getTime():0,dateLabel:hasDate?parsedDate.toLocaleDateString('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}):'',visibility:item.isPublic===true||item.isPublic===1?'公开':item.isPublic===false||item.isPublic===0?'仅自己可见':''}
}
async function loadCollections(){if(collectionLoading.value&&collectionReady.value)return;collectionLoading.value=true;collectionError.value=false;try{const sources=[['heritage',collectionApi.getHeritageCollections],['art',collectionApi.getArtCollections],['news',collectionApi.getNewsCollections],['work',collectionApi.getWorkCollections]];const lists=await Promise.all(sources.map(async([type,fetcher])=>(await allPages(fetcher)).map(item=>present(item,type))));collections.value=lists.flat();collectionReady.value=true}catch{collectionError.value=true}finally{collectionLoading.value=false}}
async function loadWorks(){worksLoading.value=true;worksError.value=false;try{works.value=(await allPages(userWorkApi.getMyWorks)).map(item=>present(item,'work'));worksReady.value=true}catch{worksError.value=true}finally{worksLoading.value=false}}
async function loadProfile(){profileError.value=false;const result=await authApi.getCurrentUser();if(result.code!==200){profileError.value=true;return}const user=result.data;username.value=user.username||'';nickname.value=user.nickname||user.username||'';avatar.value=user.avatar||'';signature.value=user.bio||'';for(const key of ['nickname','avatar','phone','email','bio'])originalForm[key]=user[key]||'';originalForm.nickname=nickname.value;syncLocal()}
function syncLocal(){for(const [key,value] of Object.entries({username:username.value,nickname:nickname.value,avatar:avatar.value,phone:originalForm.phone,email:originalForm.email,bio:originalForm.bio}))localStorage.setItem(key,value||'');window.dispatchEvent(new Event('storage'))}
onMounted(()=>{username.value=localStorage.getItem('username')||'';nickname.value=localStorage.getItem('nickname')||username.value;avatar.value=localStorage.getItem('avatar')||'';signature.value=localStorage.getItem('bio')||localStorage.getItem('signature')||'';for(const key of Object.keys(originalForm))originalForm[key]=localStorage.getItem(key)||'';loadProfile();loadCollections();loadWorks()})
function openEditProfile(){Object.assign(profileForm,originalForm,{nickname:nickname.value,avatar:avatar.value,bio:signature.value});showEditProfile.value=true}
function resetForm(){Object.assign(profileForm,originalForm);profileFormRef.value?.clearValidate()}
function handleCancel(){if(saving.value)return;showEditProfile.value=false}
function triggerAvatarUpload(){if(!saving.value)avatarInputRef.value?.click()}
function handleAvatarChange(event){const file=event.target.files?.[0];if(!file)return;if(file.size>2*1024*1024){ElMessage.error('图片大小不能超过 2MB');return}if(!['image/jpeg','image/png'].includes(file.type)){ElMessage.error('只支持 JPG、PNG 格式的图片');return}const reader=new FileReader();reader.onload=()=>{if(showEditProfile.value&&!saving.value)profileForm.avatar=reader.result};reader.readAsDataURL(file)}
async function handleSave(){if(saving.value)return;try{await profileFormRef.value.validate()}catch{return}saving.value=true;try{const result=await authApi.updateCurrentUser({...profileForm,phone:profileForm.phone||null,email:profileForm.email||null,bio:profileForm.bio||null});if(result.code!==200){ElMessage.error(result.message||'保存失败，请重试');return}Object.assign(originalForm,profileForm);nickname.value=profileForm.nickname;avatar.value=profileForm.avatar;signature.value=profileForm.bio;syncLocal();showEditProfile.value=false;ElMessage.success('个人资料已保存')}catch{ElMessage.error('暂时无法保存，请稍后重试')}finally{saving.value=false}}
async function logout(){if(loggingOut.value)return;loggingOut.value=true;try{await authApi.logout()}finally{removeToken();for(const key of ['isLogin','username','nickname','avatar','savedUser','phone','email','bio','signature'])localStorage.removeItem(key);router.push('/login');loggingOut.value=false}}
const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的手机号码格式'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback()
    return
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱地址格式'))
  } else {
    callback()
  }
}

const profileRules = {
  nickname: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在 2 到 20 个字符之间', trigger: 'blur' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过 200 个字符', trigger: 'blur' }
  ]
}

</script>
<style scoped>
@font-face{font-family:'Profile Brush';src:url('/fonts/jiangsu-profile.woff2') format('woff2');font-display:swap}
.profile-page{--brush:'Profile Brush',var(--brand-display);--el-color-primary:var(--brand-red);--el-border-radius-base:3px;padding-top:var(--brand-nav-height);min-height:100vh;background:#fbfaf6;color:var(--brand-ink);font-family:var(--brand-sans)}
.profile-page *{box-sizing:border-box}.profile-container{max-width:1320px;margin:auto;padding:30px var(--brand-gutter) 38px}.profile-page button{font-family:inherit;cursor:pointer}.profile-page a{color:inherit;text-decoration:none}.profile-page button:focus-visible,.profile-page a:focus-visible{outline:2px solid var(--brand-red);outline-offset:5px}.page-overline{display:flex;justify-content:space-between;font-size:11px;color:var(--brand-muted);letter-spacing:1px}.page-overline i{font-style:normal;padding:0 12px;color:#b2b0a6}.archive-label{font:10px Georgia,serif;letter-spacing:2px}
.identity-header{display:grid;grid-template-columns:80px minmax(0,1fr) auto;align-items:center;gap:25px;padding:38px 0 30px}.identity-avatar{border:0;background:none;padding:0;align-self:start;margin-top:9px}.identity-avatar .el-avatar{background:#e1e7dc;color:var(--brand-deep-green);font:34px var(--brand-serif);outline:1px solid #d5dace;outline-offset:5px}.username{font-size:11px;color:var(--brand-muted);margin:0 0 8px;overflow-wrap:anywhere}.identity-copy h1{font:30px/1.4 var(--brand-serif);margin:0;overflow-wrap:anywhere}.identity-copy h1 span{font-size:17px;color:var(--brand-muted);display:inline-block;margin-left:12px}.bio{font-size:13px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;max-width:660px;color:var(--brand-muted);margin:10px 0 0}.identity-actions{display:flex;align-items:center;gap:10px;align-self:start;margin-top:15px}.outline-button{background:none;border:1px solid #c9cbbf;padding:10px 15px;font-size:12px;color:var(--brand-ink)}.outline-button span{margin-left:15px;color:var(--brand-muted)}.account-button{background:none;border:1px solid #c9cbbf;min-height:37px;padding:0 11px;letter-spacing:2px;color:var(--brand-ink)}.identity-error{grid-column:2/-1;font-size:12px;color:var(--brand-muted)}
.archive-index{display:flex;justify-content:space-between;border-block:1px solid #cbcfc1;align-items:center;font-size:12px}.archive-index nav{display:flex;gap:35px}.archive-index a{display:inline-flex;gap:12px;align-items:center;padding:16px 0}.archive-index a:hover{color:var(--brand-red)}.archive-index nav span{font:12px Georgia,serif;color:var(--brand-muted)}.like-count{color:var(--brand-muted);font-size:11px}.like-count b{font:17px Georgia,serif;color:var(--brand-ink);padding-left:10px}
.exhibition,.collection-section{scroll-margin-top:calc(var(--brand-nav-height) + 22px)}.section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin:37px 0 24px}.eyebrow{font:10px/1.6 var(--brand-sans);letter-spacing:1.8px;color:var(--brand-muted);margin:0 0 9px}.section-heading h2{font:38px/1.2 var(--brush);margin:0}.title-dot{color:var(--brand-red)}.section-side{display:flex;align-items:center;gap:28px}.section-side p{font-size:12px;color:var(--brand-muted);margin:0}.text-link{border:0;border-bottom:1px solid #b3a392;background:none;padding:3px 0;font-size:12px;color:var(--brand-red)!important;white-space:nowrap}.profile-page .text-link:hover{border-color:var(--brand-red)}
.exhibit-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:24px 34px}.exhibit-card{border:0;padding:0;background:none;text-align:left;min-width:0;color:inherit}.exhibit-card:first-child{grid-row:span 2;display:flex;flex-direction:column}.exhibit-image{height:140px;background:#eaece4;display:grid;place-items:center;overflow:hidden}.exhibit-image img{width:100%;height:100%;object-fit:contain;display:block}.exhibit-card:first-child .exhibit-image{height:340px;width:100%;padding:14px;background:#e5e9df}.exhibit-card:not(:first-child){display:grid;grid-template-columns:43% minmax(0,1fr);gap:20px;align-items:center;border-bottom:1px solid var(--brand-line);padding-bottom:24px}.exhibit-card:nth-child(3){padding-bottom:0;border:0}.exhibit-caption{display:flex;align-items:baseline;gap:16px;padding:17px 0 0;min-width:0;width:100%}.exhibit-caption>div{min-width:0;flex:1}.exhibit-number{font:16px Georgia,serif;color:#8c9583}.exhibit-caption p{font-size:10px;color:var(--brand-muted);margin:0 0 7px;line-height:1.6}.exhibit-caption h3{font:22px/1.45 var(--brand-serif);margin:0;overflow-wrap:anywhere}.exhibit-caption .exhibit-description{font-size:12px;margin:9px 0 0;line-height:1.8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.open-mark{color:var(--brand-red);font-size:21px;flex-shrink:0}.exhibit-card:not(:first-child) .exhibit-caption{padding:0;display:block}.exhibit-card:not(:first-child) .exhibit-number{display:block;font-size:12px;margin-bottom:16px}.exhibit-card:not(:first-child) h3{font-size:20px}.exhibit-card:not(:first-child) .open-mark{display:block;margin-top:12px}.exhibit-card:hover h3,.collection-card:hover h3{color:var(--brand-red)}.exhibit-count-1{grid-template-columns:1fr}.exhibit-count-1 .exhibit-card:first-child{display:grid;grid-template-columns:1.5fr 1fr;gap:34px;align-items:center}.exhibit-count-1 .exhibit-caption{padding:0}.exhibit-count-2{align-items:start}.exhibition-foot{display:flex;justify-content:space-between;align-items:center;gap:14px;color:var(--brand-muted);font-size:10px;margin-top:18px;padding-bottom:25px;border-bottom:1px solid var(--brand-line)}.work-list{border-bottom:1px solid var(--brand-line)}.work-list button{width:100%;display:flex;gap:18px;align-items:center;border:0;background:none;border-bottom:1px solid #e5e5dc;text-align:left;padding:16px 0;color:var(--brand-ink);font-size:14px}.work-list button>span:first-child{flex:1;min-width:0;overflow-wrap:anywhere}.work-list small{font-size:11px;color:var(--brand-muted)}
.first-work{display:grid;grid-template-columns:1.2fr 1fr;gap:55px;align-items:center;padding:30px;background:#f0f1e9;border:1px solid #dce0d3}.blank-folio{min-height:270px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#faf8f0 url('/paper-grain.svg');border:1px solid #d6d1c0;outline:1px solid #d6d1c0;outline-offset:-10px}.blank-folio>span{font:100px var(--brush);color:#7d8a70}.blank-folio small{font:12px var(--brand-serif);color:var(--brand-muted);margin-top:15px}.first-work h3{font:31px/1.4 var(--brush);margin:0 0 13px}.first-work p:not(.eyebrow){font-size:13px;line-height:1.9;color:var(--brand-muted);margin:0 0 20px}.state-button,.studio-button{height:44px}.profile-page :deep(.brand-button__label){font-family:var(--brush);font-size:23px}.upload-link{display:block;font-size:11px;color:var(--brand-muted)!important;margin-top:18px}
.collection-layout{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:56px;margin-top:12px}.collection-section{min-width:0}.collection-section .section-heading h2{font-size:33px}.collection-filters{display:flex;flex-wrap:wrap;gap:8px 22px;margin-bottom:26px;border-bottom:1px solid var(--brand-line)}.collection-filters button{background:none;border:0;border-bottom:2px solid transparent;padding:0 0 13px;color:var(--brand-muted);font-size:12px}.collection-filters button[aria-pressed=true]{color:var(--brand-red);border-bottom-color:var(--brand-red)}.collection-filters span{font:10px Georgia,serif;margin-left:7px}.collection-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px 24px}.collection-card{display:grid;grid-template-columns:100px minmax(0,1fr);gap:15px;border:0;border-bottom:1px solid #e2e2d8;background:none;padding:0 0 22px;min-width:0;text-align:left;color:inherit}.collection-image{height:124px;background:#eeeadd;display:grid;place-items:center;overflow:hidden}.collection-image img{height:100%;width:100%;object-fit:cover;display:block}.card-category{font-size:10px;color:#74826c;margin:0 0 8px}.collection-card h3{font:17px/1.5 var(--brand-serif);margin:0;overflow-wrap:anywhere}.card-description{font-size:11px;color:var(--brand-muted);line-height:1.8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:6px 0 10px}.card-read{font-size:10px;color:#8b6657}.image-placeholder{font:12px var(--brand-serif);color:var(--brand-muted);padding:15px;text-align:center}.more-collections{width:100%;padding:17px;background:none;border:0;border-bottom:1px solid var(--brand-line);font-size:12px;color:var(--brand-red)}
.studio-note{margin-top:39px;padding:28px 26px 18px;background:#f1e8cc;border-top:3px solid #8b7651;align-self:start}.studio-note h2{font:37px/1.35 var(--brush);margin:21px 0 16px;color:#544d3b}.studio-note h2 span{display:block;white-space:nowrap}.studio-note>p:not(.eyebrow){font-size:12px;line-height:1.9;color:#7a7059;margin:0 0 22px}.studio-note>a{display:flex;justify-content:space-between;font-size:11px;padding:22px 0;color:#70654e}.studio-foot{display:flex;justify-content:space-between;font-size:9px;border-top:1px solid #cfc3a3;padding-top:15px;letter-spacing:1px;color:#8b8067}.collection-empty{display:flex;gap:25px;align-items:center;padding:28px 0;border-block:1px solid var(--brand-line);min-height:195px}.collection-empty>span{font:55px var(--brush);color:#87977c}.collection-empty h3{font:23px/1.5 var(--brand-serif);margin:0 0 10px}.collection-empty p{font-size:12px;line-height:1.8;color:var(--brand-muted);margin:0 0 15px}.shelf-note{display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--brand-line);margin-top:52px;padding-top:22px;font-size:10px;color:var(--brand-muted)}.error-note{padding:25px 0;font-size:12px;color:var(--brand-muted);line-height:1.9}.error-note button{margin-left:15px}.loading-shelf{background:#efefe7;padding:30px;min-height:180px}.loading-shelf i{display:block;width:60%;height:70px;background:#e2e5d9}.loading-shelf p{font-size:12px;color:var(--brand-muted)}
@media(max-width:1050px){.identity-copy h1{font-size:27px}.identity-copy h1 span{display:block;margin:5px 0 0;font-size:15px}.section-side p{display:none}.exhibit-grid{gap:24px}.exhibit-card:first-child .exhibit-image{height:310px}.exhibit-card:not(:first-child){gap:15px}.exhibit-card:not(:first-child) h3{font-size:18px}.exhibit-image{height:140px}.collection-layout{grid-template-columns:minmax(0,1fr) 220px;gap:30px}.collection-grid{grid-template-columns:1fr}.collection-card{grid-template-columns:110px minmax(0,1fr)}.studio-note{padding:24px 20px}.studio-note h2{font-size:33px}.first-work{gap:30px}.first-work h3{font-size:27px}}
@media(max-width:650px){.profile-container{padding-top:23px}.archive-label{font-size:8px;letter-spacing:1px}.identity-header{grid-template-columns:60px minmax(0,1fr);gap:17px;padding:29px 0 22px}.identity-avatar .el-avatar{width:60px!important;height:60px!important;font-size:27px}.identity-copy h1{font-size:24px}.identity-copy h1 span{font-size:13px}.bio{font-size:12px;margin-top:12px}.identity-actions{grid-column:1/-1;justify-self:end;margin-top:0}.identity-error{grid-column:1/-1}.outline-button{padding:8px 13px}.account-button{min-height:34px}.archive-index nav{gap:23px}.archive-index{font-size:11px}.like-count{font-size:10px}.like-count b{font-size:14px;padding-left:5px}.section-heading{margin:29px 0 20px;gap:12px}.section-heading h2{font-size:34px}.section-side .text-link{font-size:11px}.exhibit-grid{grid-template-columns:1fr 1fr;gap:22px 17px}.exhibit-card:first-child{grid-column:1/-1;grid-row:auto}.exhibit-card:first-child .exhibit-image{height:270px;padding:12px}.exhibit-card:not(:first-child){display:block;border:0;padding:0}.exhibit-image{height:140px}.exhibit-card:not(:first-child) .exhibit-caption{padding-top:12px;position:relative}.exhibit-card:not(:first-child) .exhibit-number{display:none}.exhibit-card:not(:first-child) .open-mark{display:none}.exhibit-caption h3{font-size:22px}.exhibit-card:not(:first-child) h3{font-size:18px}.exhibit-count-1 .exhibit-card:first-child{display:flex;gap:0}.exhibit-count-1 .exhibit-caption{padding-top:17px}.exhibition-foot{align-items:flex-start;font-size:9px}.exhibition-foot .text-link{font-size:10px}.collection-layout{grid-template-columns:1fr;gap:0;margin-top:0}.collection-section .section-heading h2{font-size:30px}.collection-section .section-heading>.text-link{font-size:11px}.collection-filters{gap:8px 17px}.collection-filters button{font-size:11px}.collection-grid{gap:22px}.collection-card{grid-template-columns:100px minmax(0,1fr);gap:19px}.collection-image{height:120px}.collection-card h3{font-size:19px}.card-description{font-size:12px}.studio-note{margin-top:35px;padding:23px;display:block}.studio-note h2 span{display:inline-block;margin-right:12px}.studio-note .eyebrow{grid-column:1/-1}.studio-note h2{font-size:30px;grid-column:1;margin:7px 0 12px}.studio-note>p:not(.eyebrow){margin:0 0 18px;font-size:12px}.studio-button{grid-column:2;grid-row:2;align-self:center}.studio-note>a{padding:18px 0 0;font-size:11px}.studio-foot{grid-column:1/-1;margin-top:20px}.first-work{grid-template-columns:1fr;gap:24px;padding:22px}.blank-folio{min-height:180px}.blank-folio>span{font-size:72px}.blank-folio small{font-size:10px}.first-work h3{font-size:28px}.first-work p:not(.eyebrow){font-size:12px}.collection-empty{gap:18px}.collection-empty>span{font-size:44px}.collection-empty h3{font-size:20px}.shelf-note{font-size:9px;margin-top:35px}.error-note button{display:block;margin:10px 0 0}.avatar-upload-section{gap:16px}}
@media(max-width:360px){.identity-copy h1{font-size:22px}.archive-index nav{gap:14px}.archive-index a{gap:7px}.section-heading h2{font-size:31px}.collection-section .section-heading h2{font-size:27px}.exhibit-card:first-child .exhibit-image{height:230px}.studio-note{padding:20px 16px}.studio-note h2{font-size:28px}.studio-button{padding:0 12px}.profile-page :deep(.brand-button__label){font-size:21px}.collection-empty{align-items:flex-start}}
@media(prefers-reduced-motion:reduce){.profile-page *{transition:none!important;animation:none!important}}

.avatar-upload-section{display:flex;align-items:center;gap:24px;margin:10px 0 25px}.avatar-preview{position:relative;cursor:pointer}.avatar-upload-overlay{position:absolute;bottom:0;right:0;background:#fffcf5;color:var(--brand-red);padding:4px}.avatar-upload-tips p{font-size:12px;color:var(--brand-muted);line-height:1.7}.dialog-footer{display:flex;justify-content:flex-end;gap:12px;align-items:center}.save-btn{height:44px}.profile-form :deep(.el-input__wrapper),.profile-form :deep(.el-textarea__inner){box-shadow:0 0 0 1px var(--brand-line) inset;border-radius:3px;background:#fffdf8}.profile-form :deep(.el-input__wrapper.is-focus),.profile-form :deep(.el-textarea__inner:focus){box-shadow:0 0 0 1px var(--brand-red) inset}.detail-article{font:14px/1.9 var(--brand-sans);color:var(--brand-ink);white-space:pre-wrap;overflow-wrap:anywhere}.detail-article img{width:100%;max-height:420px;object-fit:contain;background:#ede9df}.detail-article .eyebrow{margin-top:20px}

</style>
<style>.profile-edit-dialog.el-dialog,.profile-read-dialog.el-dialog{border-radius:3px;background:#fffcf5;--el-color-primary:var(--brand-red)}.profile-edit-dialog .el-dialog__title,.profile-read-dialog .el-dialog__title{font-family:var(--brand-serif);color:var(--brand-ink)}.profile-edit-dialog .brand-button__label{font-family:'Profile Brush',var(--brand-display)}</style>
