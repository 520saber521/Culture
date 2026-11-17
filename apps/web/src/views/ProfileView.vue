<template>
  <main class="profile-page">
    <div class="profile-container">
      <header class="profile-cover">
        <div class="cover-copy"><p class="eyebrow">江苏文创 / 我的文化生活</p><h1>我的风物手帖<span>。</span></h1><p class="cover-motto"><span>把喜欢的珍藏，</span><span>让灵感慢慢生长。</span></p><p class="cover-note">一页收藏，一页创作。<br>在这里，留下与你有关的江苏故事。</p></div>
        <figure class="cover-art"><img src="/jiangnan-atelier-hero.png" alt="窗边笔墨、花枝与江南水巷的手绘插画"><figcaption>拾 趣 <span>私人手帖 · 随心记</span></figcaption></figure>
      </header>
      <div class="profile-layout">
        <aside class="identity-panel">
          <p class="eyebrow">手帖主人 / PROFILE</p>
          <button class="identity-avatar" aria-label="编辑头像和资料" @click="openEditProfile"><el-avatar :src="avatar" :size="76">{{ nickname.slice(0,1) || '我' }}</el-avatar><span>编辑 ↗</span></button>
          <h2>{{ nickname || '文化同好' }}</h2><p class="username">@{{ username || '—' }}</p><span class="identity-label">文化爱好者</span>
          <p class="bio">{{ signature || '还没有写下简介，添几句关于自己的故事吧。' }}</p>
          <BrandButton class="edit-button" @click="openEditProfile">编辑资料</BrandButton>
          <div v-if="profileError" class="identity-error" role="status">个人资料暂未同步 <button class="text-link" @click="loadProfile">重试</button></div>
          <dl class="personal-counts"><div><dd>{{ collectionReady ? collections.length : '—' }}</dd><dt>珍藏</dt></div><div><dd>{{ worksReady ? works.length : '—' }}</dd><dt>作品</dt></div><div><dd>{{ worksReady ? totalLikes : '—' }}</dd><dt>作品获赞</dt></div></dl>
          <nav class="personal-links" aria-label="探索与账户"><router-link to="/culture">去读一城风物 <span>↗</span></router-link><router-link to="/design">去写新的灵感 <span>↗</span></router-link><button @click="logout" :disabled="loggingOut">{{ loggingOut ? '正在退出…' : '退出登录' }} <span>↗</span></button></nav>
        </aside>
        <section class="profile-content" aria-label="个人内容">
          <nav class="profile-tabs" aria-label="手帖栏目"><button v-for="(tab,index) in tabs" :key="tab.id" :aria-pressed="activeTab===tab.id" :class="{active:activeTab===tab.id}" @click="activeTab=tab.id"><small>0{{index+1}}</small>{{tab.label}}</button></nav>
          <header class="content-heading"><div><p class="eyebrow">{{ activeTab==='collections'?'所爱，皆可珍藏':activeTab==='works'?'所想，皆可成章':'照料你的文化空间' }}</p><h2>{{ activeTab==='collections'?'我的珍藏':activeTab==='works'?'创作留痕':'个人资料' }}</h2></div><span v-if="activeTab!=='settings' && currentReady">{{ currentItems.length }} 则{{activeTab==='collections'?'珍藏':'作品'}}</span></header>
          <template v-if="activeTab!=='settings'">
            <div v-if="currentLoading" class="loading-shelf" role="status" aria-label="正在加载个人内容"><div v-for="n in 3" :key="n"><i></i><b></b></div><p>正在翻阅你的手帖…</p></div>
            <div v-else-if="currentError" class="personal-state" role="status"><span class="state-seal">候</span><h3>这一页，稍后再读</h3><p>暂时未能获取{{activeTab==='collections'?'收藏':'作品'}}，已有内容会为你保留。</p><button class="text-link" @click="reloadCurrent">重新加载 ↗</button></div>
            <div v-else-if="!currentItems.length" class="personal-state"><span class="state-seal">藏</span><h3>{{activeTab==='collections'?'留一页，给心动的风物':'下一页，写你的灵感'}}</h3><p>{{activeTab==='collections'?'遇见喜欢的文化与作品，收藏后便能在这里重逢。':'从一处风物、一门手艺出发，开始你的第一份创作。'}}</p><BrandButton class="state-button" @click="router.push(activeTab==='collections'?'/culture':'/design')">{{activeTab==='collections'?'发现风物':'开始创作'}}</BrandButton></div>
            <div v-if="currentItems.length && !currentLoading" class="content-grid"><button v-for="(item,index) in currentItems" :key="item.key" class="content-card" @click="selectedItem=item"><div class="card-image"><img v-if="item.image && !brokenImages[item.image]" :src="item.image" :alt="item.title" loading="lazy" @error="brokenImages[item.image]=true"><span v-else class="image-placeholder">影像待补</span><span class="card-number">{{String(index+1).padStart(2,'0')}}</span></div><p class="card-category">{{item.category}}</p><h3>{{item.title}}</h3><p class="card-description">{{item.description}}</p><span class="card-read">翻阅此页 ↗</span></button></div>
          </template>
          <div v-else class="settings-list"><button @click="openEditProfile"><span><strong>编辑个人资料</strong><small>头像、昵称、联系方式与简介</small></span><b>↗</b></button><router-link to="/works"><span><strong>管理我的作品</strong><small>回顾创作，整理自己的作品集</small></span><b>↗</b></router-link><router-link to="/design"><span><strong>继续创作</strong><small>让新的想法在创作工作台里成形</small></span><b>↗</b></router-link><div class="privacy-note">联系方式仅在资料编辑窗口中显示，不在主页公开展示。</div></div>
          <footer class="shelf-note"><span>江苏文创 · 个人手帖</span><span>收藏此刻，续写新意。</span></footer>
        </section>
      </div>
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
const activeTab=ref('collections'), showEditProfile=ref(false), profileFormRef=ref(null), avatarInputRef=ref(null), saving=ref(false), loggingOut=ref(false)
const profileForm=reactive({avatar:'',nickname:'',phone:'',email:'',bio:''})
const originalForm=reactive({...profileForm})
const tabs=[{id:'collections',label:'我的收藏'},{id:'works',label:'我的作品'},{id:'settings',label:'账户设置'}]
const collections=ref([]), works=ref([]), selectedItem=ref(null), brokenImages=ref({})
const collectionReady=ref(false), worksReady=ref(false), collectionLoading=ref(true), worksLoading=ref(true), collectionError=ref(false), worksError=ref(false), profileError=ref(false)
const totalLikes=computed(()=>works.value.reduce((sum,item)=>sum+(Number(item.likes)||0),0))
const currentItems=computed(()=>activeTab.value==='collections'?collections.value:works.value)
const currentReady=computed(()=>activeTab.value==='collections'?collectionReady.value:worksReady.value)
const currentLoading=computed(()=>activeTab.value==='collections'?collectionLoading.value:worksLoading.value)
const currentError=computed(()=>activeTab.value==='collections'?collectionError.value:worksError.value)
async function allPages(fetcher){const items=[];for(let pageNum=1;;pageNum++){const result=await fetcher({pageNum,pageSize:100});if(result.code!==200||!Array.isArray(result.data?.records))throw new Error('load');items.push(...result.data.records);if(pageNum >= (Number(result.data.pages)||1))return items}}
function present(item,type){return {key:`${type}-${item.id}`,title:item.name||item.title||'未命名',image:item.imageUrl||item.coverImage||'',category:({heritage:'非遗技艺',art:'传统艺术',news:'文化资讯',work:'影像作品'})[type],description:item.description||item.summary||'',content:item.content||item.description||item.summary||'',likes:item.likeCount||0}}
async function loadCollections(){if(collectionLoading.value&&collectionReady.value)return;collectionLoading.value=true;collectionError.value=false;try{const sources=[['heritage',collectionApi.getHeritageCollections],['art',collectionApi.getArtCollections],['news',collectionApi.getNewsCollections],['work',collectionApi.getWorkCollections]];const lists=await Promise.all(sources.map(async([type,fetcher])=>(await allPages(fetcher)).map(item=>present(item,type))));collections.value=lists.flat();collectionReady.value=true}catch{collectionError.value=true}finally{collectionLoading.value=false}}
async function loadWorks(){worksLoading.value=true;worksError.value=false;try{works.value=(await allPages(userWorkApi.getMyWorks)).map(item=>present(item,'work'));worksReady.value=true}catch{worksError.value=true}finally{worksLoading.value=false}}
function reloadCurrent(){if(activeTab.value==='collections')loadCollections();else loadWorks()}
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
.profile-page{--brush:'Profile Brush',var(--brand-display);--el-color-primary:var(--brand-red);--el-border-radius-base:3px;padding-top:var(--brand-nav-height);min-height:100vh;background:var(--brand-paper);color:var(--brand-ink);font-family:var(--brand-sans)}.profile-page *{box-sizing:border-box}.profile-container{max-width:1440px;margin:auto;padding:32px var(--brand-gutter) 50px}.profile-page button{font-family:inherit;cursor:pointer}.profile-page a{color:inherit;text-decoration:none}.profile-page button:focus-visible,.profile-page a:focus-visible{outline:2px solid var(--brand-red);outline-offset:4px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--brand-red);margin:0 0 16px}.profile-cover{display:grid;grid-template-columns:1.2fr 1fr;background:var(--brand-jade);border:1px solid #c8d2bd;min-height:285px}.cover-copy{padding:32px 38px;background-image:url('/paper-grain.svg')}.cover-copy h1{font:56px/1.2 var(--brush);color:#403a2e;margin:0 0 14px;letter-spacing:2px}.cover-copy h1 span{color:var(--brand-red)}.cover-motto{font:24px/1.5 var(--brush);margin:0 0 14px;color:#485d4c}.cover-motto span{display:inline-block;white-space:nowrap}.cover-note{font:13px/1.9 var(--brand-sans);color:#656c5e;margin:0}.cover-art{margin:0;position:relative;min-width:0}.cover-art img{width:100%;height:100%;object-fit:cover;display:block;max-height:310px}.cover-art figcaption{position:absolute;right:26px;bottom:22px;background:#fbefd8ed;border:3px double #8f795b;transform:rotate(3deg);padding:12px 15px;font:32px var(--brush);color:#514534}.cover-art figcaption span{display:block;font:10px var(--brand-serif);letter-spacing:2px;margin-top:5px}.profile-layout{display:grid;grid-template-columns:265px minmax(0,1fr);gap:38px;margin-top:34px}.identity-panel{border-right:1px solid var(--brand-line);padding-right:28px}.identity-avatar{position:relative;display:block;border:0;background:none;padding:0;margin-bottom:18px}.identity-avatar .el-avatar{border-radius:50%;border:3px solid #fff8e9;outline:1px solid #bec6b6;background:#d9e2d1;color:#485d4c;font:30px var(--brand-serif)}.identity-avatar>span{display:block;text-align:center;font-size:10px;color:var(--brand-muted);margin-top:8px}.identity-panel h2{font:24px/1.5 var(--brand-serif);margin:0;overflow-wrap:anywhere}.username{font-size:12px;color:var(--brand-muted);margin:3px 0 14px;overflow-wrap:anywhere}.identity-label{font:11px var(--brand-serif);padding:4px 8px;border:1px solid #b7c3ad;color:var(--brand-deep-green)}.bio{font-size:13px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;color:var(--brand-muted);margin:20px 0}.edit-button,.state-button{height:44px}.profile-page :deep(.brand-button__label){font-family:var(--brush);font-size:23px}.personal-counts{display:grid;grid-template-columns:repeat(3,1fr);border-block:1px solid var(--brand-line);padding:18px 0;margin:26px 0 12px}.personal-counts>div{text-align:center;border-right:1px solid var(--brand-line)}.personal-counts>div:last-child{border:0}.personal-counts dd{font:26px Georgia,serif;margin:0 0 7px}.personal-counts dt{font-size:10px;color:var(--brand-muted)}.personal-links{display:grid}.personal-links a,.personal-links button{display:flex;justify-content:space-between;padding:13px 0;font-size:12px;background:none;border:0;color:var(--brand-muted)}.personal-links a:hover,.personal-links button:hover{color:var(--brand-red)}.profile-content{min-width:0}.profile-tabs{display:flex;border-block:1px solid var(--brand-line);background:#fffcf5}.profile-tabs button{position:relative;flex:1;border:0;background:none;color:var(--brand-ink);font:24px var(--brush);padding:20px 12px;white-space:nowrap}.profile-tabs small{font:10px Georgia,serif;color:var(--brand-muted);margin-right:12px}.profile-tabs button.active{color:var(--brand-red)}.profile-tabs button.active:after{content:'';position:absolute;width:26px;height:4px;bottom:8px;left:48%;border-radius:50%;background:var(--brand-red);transform:rotate(-8deg)}.content-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:15px;padding:28px 0 22px}.content-heading .eyebrow{font-size:10px;margin-bottom:9px}.content-heading h2{font:31px var(--brush);margin:0}.content-heading>span{font-size:11px;color:var(--brand-muted)}.personal-state{background:#fffdf7;border-block:1px solid var(--brand-line);padding:38px 24px;text-align:center}.state-seal{display:inline-block;border:1px solid #abb79c;outline:1px solid #abb79c;outline-offset:3px;color:#71816a;font:33px var(--brush);padding:7px 10px;margin-bottom:18px}.personal-state h3{font:26px var(--brush);margin:0 0 12px}.personal-state p{font-size:13px;line-height:1.8;color:var(--brand-muted);margin:0 0 20px}.text-link{border:0;border-bottom:1px solid var(--brand-red);color:var(--brand-red);padding:4px 0;background:none;font-size:12px}.content-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:25px 20px}.content-card{display:block;text-align:left;border:0;border-bottom:1px solid var(--brand-line);background:none;color:var(--brand-ink);padding:0 0 17px;min-width:0}.card-image{aspect-ratio:1.25;position:relative;background:#e9e5d8;overflow:hidden}.card-image img{width:100%;height:100%;object-fit:cover;transition:transform .2s}.content-card:hover .card-image img{transform:scale(1.025)}.card-number{position:absolute;bottom:10px;left:10px;padding:5px 8px;background:#fffcf5;font:12px Georgia,serif}.card-category{font-size:10px;color:var(--brand-deep-green);margin:15px 0 7px}.content-card h3{font:21px/1.5 var(--brand-serif);margin:0 0 9px;overflow-wrap:anywhere}.card-description{font-size:12px;color:var(--brand-muted);line-height:1.8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0 0 12px}.card-read{font-size:11px;color:var(--brand-red)}.image-placeholder{height:100%;display:grid;place-items:center;color:var(--brand-muted);font:20px var(--brand-serif)}.shelf-note{display:flex;justify-content:space-between;gap:10px;border-top:1px solid var(--brand-line);padding:20px 0;margin-top:30px;font-size:10px;color:var(--brand-muted);letter-spacing:1px}.settings-list{border-top:1px solid var(--brand-line)}.settings-list>button,.settings-list>a{display:flex;align-items:center;justify-content:space-between;width:100%;padding:22px 8px;border:0;border-bottom:1px solid var(--brand-line);background:transparent;text-align:left;color:inherit}.settings-list strong{font:20px var(--brand-serif)}.settings-list small{display:block;font-size:12px;color:var(--brand-muted);margin-top:8px}.settings-list b{font-weight:400;color:var(--brand-red)}.privacy-note{font-size:12px;color:var(--brand-muted);line-height:1.8;padding:18px 8px}.identity-error{font-size:11px;color:var(--brand-muted);margin-top:15px}.loading-shelf{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.loading-shelf i{display:block;height:150px;background:#e4e7dc}.loading-shelf b{display:block;height:14px;width:65%;margin-top:15px;background:#e4e7dc}.loading-shelf p{grid-column:1/-1;font-size:12px;color:var(--brand-muted)}.avatar-upload-section{display:flex;align-items:center;gap:24px;margin:10px 0 25px}.avatar-preview{position:relative;cursor:pointer}.avatar-upload-overlay{position:absolute;bottom:0;right:0;background:#fffcf5;color:var(--brand-red);padding:4px}.avatar-upload-tips p{font-size:12px;color:var(--brand-muted);line-height:1.7}.dialog-footer{display:flex;justify-content:flex-end;gap:12px;align-items:center}.save-btn{height:44px}.profile-form :deep(.el-input__wrapper),.profile-form :deep(.el-textarea__inner){box-shadow:0 0 0 1px var(--brand-line) inset;border-radius:3px;background:#fffdf8}.profile-form :deep(.el-input__wrapper.is-focus),.profile-form :deep(.el-textarea__inner:focus){box-shadow:0 0 0 1px var(--brand-red) inset}.detail-article{font:14px/1.9 var(--brand-sans);color:var(--brand-ink);white-space:pre-wrap;overflow-wrap:anywhere}.detail-article img{width:100%;max-height:420px;object-fit:contain;background:#ede9df}.detail-article .eyebrow{margin-top:20px}
@media(max-width:1050px){.cover-copy{padding:28px}.cover-copy h1{font-size:43px}.cover-motto{font-size:22px}.profile-layout{grid-template-columns:230px minmax(0,1fr);gap:25px}.identity-panel{padding-right:20px}.content-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:650px){.profile-container{padding-top:20px}.profile-cover{grid-template-columns:1fr}.cover-copy{padding:23px 20px}.cover-copy h1{font-size:40px;letter-spacing:0}.cover-motto{font-size:22px}.cover-note{font-size:12px}.cover-art{height:175px}.cover-art img{object-position:center 65%}.cover-art figcaption{font-size:25px;padding:7px 12px;bottom:15px;right:20px}.profile-layout{grid-template-columns:1fr;margin-top:24px;gap:25px}.identity-panel{border-right:0;padding:0;display:grid;grid-template-columns:85px minmax(0,1fr);column-gap:18px}.identity-panel>.eyebrow{grid-column:1/-1}.identity-avatar{grid-column:1;grid-row:2/5;margin:0}.identity-panel h2{grid-column:2;font-size:22px}.username{grid-column:2;margin:2px 0 10px}.identity-label{grid-column:2;justify-self:start}.bio{grid-column:1/-1;margin:18px 0 13px}.edit-button{grid-column:1/-1;justify-self:start}.identity-error,.personal-counts,.personal-links{grid-column:1/-1}.personal-counts{margin:20px 0 0;padding:15px 0}.personal-links{grid-template-columns:1fr 1fr 1fr;gap:15px}.personal-links a,.personal-links button{font-size:11px;gap:6px}.profile-tabs button{font-size:21px;padding:18px 4px}.profile-tabs small{margin-right:6px;font-size:9px}.content-heading{padding:23px 0 18px}.content-heading h2{font-size:28px}.personal-state{padding:30px 15px}.personal-state h3{font-size:24px}.personal-state p{font-size:12px}.content-grid{gap:20px 14px}.content-card h3{font-size:19px}.shelf-note{font-size:9px;letter-spacing:0}.avatar-upload-section{gap:16px}.profile-page :deep(.brand-button__label){font-size:22px}.loading-shelf{grid-template-columns:1fr 1fr}.loading-shelf>div:nth-child(3){display:none}}
@media(max-width:360px){.profile-tabs button{font-size:20px;min-width:0}.profile-tabs small{display:none}.cover-copy h1{font-size:35px}}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>
<style>.profile-edit-dialog.el-dialog,.profile-read-dialog.el-dialog{border-radius:3px;background:#fffcf5;--el-color-primary:var(--brand-red)}.profile-edit-dialog .el-dialog__title,.profile-read-dialog .el-dialog__title{font-family:var(--brand-serif);color:var(--brand-ink)}.profile-edit-dialog .brand-button__label{font-family:'Profile Brush',var(--brand-display)}</style>
