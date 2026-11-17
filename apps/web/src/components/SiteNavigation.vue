<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { removeToken } from '@/utils/api'
import BrandButton from './BrandButton.vue'
const router = useRouter()
const route = useRoute()
const homeSection = ref(0)
const scrolled = ref(false)
const transparent = computed(() => route.path === '/' && homeSection.value === 0 && !scrolled.value)
function handleScroll() { scrolled.value = window.scrollY > 10 }
function handleHomeSection(event) { homeSection.value = Number(event.detail?.index || 0) }
watch(() => route.path, () => { homeSection.value = 0; handleScroll() })
onMounted(() => { handleScroll(); window.addEventListener('scroll', handleScroll, { passive: true }); window.addEventListener('home-section-change', handleHomeSection) })
onUnmounted(() => { window.removeEventListener('scroll', handleScroll); window.removeEventListener('home-section-change', handleHomeSection) })
const menu = [
  { title: '首页', to: '/', paths: ['/'] },
  { title: '走进江苏', to: '/culture', paths: ['/culture', '/feiyi', '/intangible-heritage', '/celebrities', '/traditional-arts', '/gallery'] },
  { title: '参与创作', to: '/design', paths: ['/design'] }
]

function isMenuActive(item) {
  return item.paths.includes(route.path)
}

const isLogin = ref(false)
const username = ref('')
const avatar = ref('https://api.dicebear.com/9.x/avataaars/svg?seed=default')  // 默认头像
function updateUserInfo() {
  isLogin.value = localStorage.getItem('isLogin') === 'true';
  username.value = localStorage.getItem('username') || '';
  avatar.value = localStorage.getItem('avatar') || 'https://api.dicebear.com/9.x/avataaars/svg?seed=default';
}

function goLogin() {
  router.push('/login')
}

function logout() {
  removeToken()
  localStorage.removeItem('isLogin')
  localStorage.removeItem('username')
  localStorage.removeItem('nickname')
  localStorage.removeItem('avatar')
  isLogin.value = false
  ElMessage.success('已退出登录')
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}

function goWorks() {
  router.push('/works')
}

watch(() => route.fullPath, updateUserInfo)
onMounted(() => { updateUserInfo(); window.addEventListener('storage', updateUserInfo) })
onUnmounted(() => window.removeEventListener('storage', updateUserInfo))
</script>
<template>
  <nav class="navbar" :class="{ 'navbar-transparent': transparent }" aria-label="全站导航">
    <router-link to="/" class="brand-link" aria-label="江苏文创 · 首页"><span class="brand-seal">江<br>苏</span><span class="brand-wordmark">江苏文创<small>AI 文化设计平台</small></span></router-link>
    <div class="nav-menu">
      <div v-for="item in menu" :key="item.title" class="nav-item-container">
        <router-link :to="item.to" class="nav-item" :class="{ active: isMenuActive(item) }" :aria-current="isMenuActive(item) ? 'page' : undefined">
          {{ item.title }}
        </router-link>
      </div>
    </div>

    <div v-if="!isLogin" class="login-area">
      <BrandButton class="login-btn" @click="goLogin">登录</BrandButton>
    </div>

    <div v-else class="user-area">
      <el-dropdown trigger="click">
        <button class="user-dropdown" type="button" aria-label="用户菜单">
          <div class="user-avatar">
            <el-avatar :src="avatar" />
            <span class="online-status"></span>
          </div>
          <span class="user-name">{{ username }}</span>
          <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              个人主页
            </el-dropdown-item>
            <el-dropdown-item @click="goWorks">我的作品</el-dropdown-item>
            <el-dropdown-item divided @click="logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>
<style scoped>
.navbar{box-sizing:border-box;position:fixed;inset:0 0 auto;z-index:1000;height:var(--brand-nav-height);padding:0 var(--brand-gutter);display:flex;align-items:center;gap:48px;background:var(--brand-nav-paper, #fffcf5);border-bottom:1px solid var(--brand-line);font-family:var(--brand-sans);color:var(--brand-ink)}
.navbar-transparent{background:transparent;border-bottom-color:transparent}.navbar-transparent .nav-item,.navbar-transparent .brand-link{color:var(--brand-surface);text-shadow:0 1px 3px #302a2566}.navbar-transparent .brand-wordmark small{color:var(--brand-surface)}.navbar-transparent .nav-item.active,.navbar-transparent .nav-item:hover{color:var(--brand-surface)}.navbar-transparent .nav-item.active:after{background:var(--brand-surface)}
.brand-link{display:flex;align-items:center;gap:12px;color:var(--brand-ink);text-decoration:none;flex-shrink:0}.brand-seal{display:grid;place-items:center;width:34px;height:38px;background:var(--brand-red);color:var(--brand-surface);font:18px var(--brand-serif);line-height:1;letter-spacing:0;font-size:15px;text-align:center;border-radius:3px}.brand-wordmark{font:27px var(--brand-display);letter-spacing:2px}.brand-wordmark small{display:block;font:10px var(--brand-sans);letter-spacing:2px;margin-top:4px;color:var(--brand-muted)}
.nav-menu{display:flex;align-items:center;gap:32px;flex:1}.nav-item{position:relative;display:block;padding:24px 4px;color:var(--brand-ink);font-size:14px;text-decoration:none;white-space:nowrap;transition:color .2s}.nav-item:hover,.nav-item.active{color:var(--brand-red)}.nav-item.active:after{content:'';position:absolute;bottom:15px;left:50%;width:18px;height:1px;background:var(--brand-red);transform:translateX(-50%)}
.login-area,.user-area{margin-left:auto;flex-shrink:0}.login-btn{height:40px;min-width:104px;padding:0 14px 0 18px}.user-dropdown{display:flex;align-items:center;gap:8px;border:1px solid var(--brand-line);border-radius:4px;background:var(--brand-surface);padding:4px 10px;color:var(--brand-ink);cursor:pointer}.user-avatar{display:flex}.el-avatar{width:28px;height:28px}.user-name{max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.online-status{display:none}.nav-item:focus-visible,.brand-link:focus-visible,.user-dropdown:focus-visible{outline:2px solid var(--brand-red);outline-offset:3px}
@media(max-width:900px){.navbar{gap:28px}.nav-menu{gap:20px}.brand-wordmark{font-size:24px}}
@media(max-width:600px){.navbar{gap:12px}.brand-wordmark{display:none}.brand-seal{width:28px;height:34px;font-size:15px}.nav-menu{gap:12px;justify-content:center}.nav-item{font-size:12px;padding:22px 0}.login-btn{height:36px;min-width:72px;padding:0 9px 0 12px;gap:8px}.user-name{display:none}.user-dropdown{padding:3px}.dropdown-arrow{display:none}}
</style>
