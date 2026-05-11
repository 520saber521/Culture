<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import '@surely-vue/table/dist/index.less';

const router = useRouter()
const footerRef = ref(null)

const menu = [
  { 
    title: '首页', 
    to: '/',
    children: []
  },
  { 
    title: '江苏非遗', 
    to: '/feiyi',
    children: [
      { title: '国家级项目', to: '/feiyi' },
      { title: '省级项目', to: '/feiyi' },
      { title: '项目分类', to: '/feiyi' }
    ]
  },
  { 
    title: '江苏文化库', 
    to: '/culture',
    children: [
      { title: '历史名人', to: '/celebrities' },
      { title: '传统艺术', to: '/traditional-arts' }
    ]
  },
  { 
    title: 'AI 设计', 
    to: '/design',
    children: []
  },
  { 
    title: '江苏图库', 
    to: '/gallery',
    children: []
  },
  { 
    title: '我的作品', 
    to: '/works',
    children: []
  }
]

const isLogin = ref(false)
const username = ref('')
const avatar = ref('https://i.pravatar.cc/150')  // 默认头像
const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 10
}

function updateUserInfo() {
  isLogin.value = localStorage.getItem('isLogin') === 'true';
  username.value = localStorage.getItem('username') || '';
  avatar.value = localStorage.getItem('avatar') || 'https://i.pravatar.cc/150';
}

// 波浪动画效果
function handleMouseMove(event) {
  if (!footerRef.value) return
  
  const footer = footerRef.value
  const rect = footer.getBoundingClientRect()
  
  // 检查鼠标是否在页脚区域内
  if (event.clientX < rect.left || event.clientX > rect.right || 
      event.clientY < rect.top || event.clientY > rect.bottom) {
    resetWaves()
    return
  }
  
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  // 计算鼠标与中心的距离比例
  const ratioX = (x - centerX) / centerX
  const ratioY = (y - centerY) / centerY
  
  // 获取波浪元素
  const waves = footer.querySelectorAll('.wave')
  waves.forEach((wave, index) => {
    // 不同波浪的振幅和延迟
    const amplitude = 10 + index * 5
    const delay = index * 0.1
    
    // 计算波浪的位移
    const offsetX = ratioX * amplitude
    const offsetY = ratioY * amplitude
    
    // 应用变换
    wave.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${ratioX * 5}deg)`
    wave.style.opacity = 0.3 + Math.abs(ratioX) * 0.5
  })
}

// 重置波浪位置
function resetWaves() {
  if (!footerRef.value) return
  
  const waves = footerRef.value.querySelectorAll('.wave')
  waves.forEach(wave => {
    wave.style.transform = 'translate(0, 0) rotate(0deg)'
    wave.style.opacity = 0.5
  })
}

onMounted(() => {
  updateUserInfo()
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseleave', resetWaves)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseleave', resetWaves)
})


function goLogin() {
  router.push('/login')
}

function logout() {
  localStorage.removeItem('isLogin')
  localStorage.removeItem('username')
  localStorage.removeItem('avatar')
  isLogin.value = false
  ElMessage.success('已退出登录')
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}
</script>

<template>
  <!-- 导航栏 -->
  <nav :class="['navbar', { 'navbar-scrolled': isScrolled }]">
    <div class="nav-menu">
      <div v-for="item in menu" :key="item.title" class="nav-item-container">
        <router-link v-if="item.children.length === 0" :to="item.to" class="nav-item" active-class="active">
          {{ item.title }}
        </router-link>
        <div v-else class="nav-item-with-dropdown">
          <router-link :to="item.to" class="nav-item" active-class="active">
            {{ item.title }}
            <i class="el-icon-arrow-down el-icon--right"></i>
          </router-link>
          <div class="dropdown-menu">
            <router-link 
              v-for="child in item.children" 
              :key="child.title" 
              :to="child.to" 
              class="dropdown-item"
            >
              {{ child.title }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!isLogin" class="login-area">
      <button class="login-btn" @click="goLogin">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>登录</span>
      </button>
    </div>

    <div v-else class="user-area">
      <el-dropdown trigger="click">
        <span class="user-dropdown">
          <div class="user-avatar">
            <el-avatar :src="avatar" />
            <span class="online-status"></span>
          </div>
          <span class="user-name">{{ username }}</span>
          <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              个人主页
            </el-dropdown-item>
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
  <!-- 页面切换过渡效果 -->
  <router-view v-slot="{ Component }">
    <transition name="page-transition" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>

  <!-- 全局页脚 -->
  <footer class="page-footer" ref="footerRef">
    <div class="wave-container">
      <div v-for="i in 3" :key="i" :class="`wave wave-${i}`"></div>
    </div>
    <div class="footer-content">
      <p class="copyright">© 2024 文化传承与创新平台 版权所有</p>
      <p class="contact">联系电话：010-12345678 | 邮箱：contact@culture.com</p>
      <p class="icp">京ICP备12345678号</p>
    </div>
  </footer>
</template>

<style scoped>
/* 导航栏 - 透明导航栏设计 */
.navbar {
  background-color: transparent;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20px 30px;
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  box-shadow: none;
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 更平滑的缓动函数 */
}

/* 滚动时的样式变化 */
.navbar-scrolled {
  background-color: white;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  padding: 16px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.nav-menu {
  display: flex;
  flex: 1;
  justify-content: flex-start;
  gap: 0;
}

.nav-item-container {
  position: relative;
}

.nav-item {
  color: white;
  font-family: '微软雅黑', Arial, sans-serif;
  font-weight: 400;
  font-size: 15px;
  cursor: pointer;
  padding: 10px 18px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 更平滑的缓动函数 */
  display: inline-block;
  text-decoration: none;
  border-radius: 2px;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5); /* 添加文字阴影，增强可读性 */
}

.nav-item:hover {
  color: #D32F2F;
  background-color: rgba(255, 255, 255, 0.1);
  text-shadow: none;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #D32F2F;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateX(-50%);
}

.nav-item:hover::after {
  width: 80%;
}

.router-link-active {
  color: #D32F2F !important;
  font-weight: 500;
  text-shadow: none;
}

.router-link-active::after {
  width: 80%;
}

/* 滚动时的导航项样式 */
.navbar-scrolled .nav-item {
  color: #333333;
  text-shadow: none;
}

.navbar-scrolled .nav-item:hover {
  background-color: rgba(211, 47, 47, 0.05);
}

.navbar-scrolled .router-link-active {
  background-color: rgba(211, 47, 47, 0.05);
}

/* 下拉菜单样式 - 参考中国非物质文化遗产网风格 */
.nav-item-with-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 170px;
  background-color: white;
  border: 1px solid #E8E8E8;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  margin-top: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 更平滑的缓动函数 */
  z-index: 1001;
  border-radius: 4px;
}

.nav-item-with-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: #333333;
  font-family: '微软雅黑', Arial, sans-serif;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 更平滑的缓动函数 */
  white-space: nowrap;
  text-decoration: none;
  border-radius: 2px;
  margin: 0 4px;
}

.dropdown-item:hover {
  color: #D32F2F;
  background-color: rgba(211, 47, 47, 0.05);
}

/* 登录和用户区域 */
.login-area {
  margin-left: auto;
}

/* 页面切换过渡效果 */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.login-area .el-button {
  font-size: 16px;
  padding: 10px 20px;
}

/* 登录按钮 - 高级感颜色方案设计 */
/* 
 * 色彩体系：
 * - 主色：深邃中国红 #8B1538 (传承红)
 * - 辅助色：奢华金 #C9A962 (点缀金)
 * - 高光：珍珠白渐变
 * - 阴影：深红到紫红过渡
 */
.login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: linear-gradient(145deg, 
    #A01D3E 0%, 
    #8B1538 35%,
    #6D0F2C 65%,
    #8B1538 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #FEFEFE;
  border: 1px solid rgba(201, 169, 98, 0.35);
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 
    0 4px 24px rgba(139, 21, 56, 0.35),
    0 2px 8px rgba(109, 15, 44, 0.25),
    0 0 0 1px rgba(201, 169, 98, 0.15) inset,
    0 1px 0 rgba(255, 255, 255, 0.15) inset;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(109, 15, 44, 0.5);
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(201, 169, 98, 0.3) 25%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(201, 169, 98, 0.3) 75%,
    transparent 100%);
  transition: left 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.login-btn::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: radial-gradient(ellipse at 30% 30%, 
    rgba(201, 169, 98, 0.15) 0%, 
    rgba(201, 169, 98, 0.08) 30%,
    transparent 60%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
}

/* 悬停状态 - 提升亮度与金色光晕 */
.login-btn:hover {
  transform: translateY(-3px) scale(1.02);
  background: linear-gradient(145deg, 
    #B8234A 0%, 
    #A01D3E 35%,
    #8B1538 65%,
    #A01D3E 100%);
  box-shadow: 
    0 8px 36px rgba(139, 21, 56, 0.45),
    0 4px 16px rgba(109, 15, 44, 0.3),
    0 0 0 1px rgba(201, 169, 98, 0.4) inset,
    0 1px 0 rgba(255, 255, 255, 0.25) inset,
    0 0 30px rgba(201, 169, 98, 0.15);
  border-color: rgba(201, 169, 98, 0.6);
  color: #FFFFFF;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover::after {
  opacity: 1;
}

/* 激活/按下状态 - 深色收缩反馈 */
.login-btn:active {
  transform: translateY(-1px) scale(0.98);
  background: linear-gradient(145deg, 
    #6D0F2C 0%, 
    #5A0C24 35%,
    #4A0A1E 65%,
    #5A0C24 100%);
  box-shadow: 
    0 2px 12px rgba(109, 15, 44, 0.4),
    0 1px 4px rgba(74, 10, 30, 0.3),
    0 0 0 1px rgba(201, 169, 98, 0.2) inset;
  border-color: rgba(201, 169, 98, 0.4);
}

/* 禁用状态 */
.login-btn:disabled {
  background: linear-gradient(145deg, 
    #9A9A9A 0%, 
    #7A7A7A 50%,
    #8A8A8A 100%);
  border-color: rgba(180, 180, 180, 0.3);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
}

.login-btn:disabled:hover {
  transform: none;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.login-btn svg {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  filter: drop-shadow(0 1px 2px rgba(74, 10, 30, 0.4));
  color: #FEFEFE;
}

.login-btn:hover svg {
  transform: translateX(2px);
  filter: drop-shadow(0 2px 4px rgba(201, 169, 98, 0.3));
}

.login-btn span {
  position: relative;
  z-index: 1;
}

/* 滚动时的登录按钮样式 - 白色背景适配 */
.navbar-scrolled .login-btn {
  background: linear-gradient(145deg, 
    #A01D3E 0%, 
    #8B1538 35%,
    #6D0F2C 65%,
    #8B1538 100%);
  border-color: rgba(139, 21, 56, 0.4);
  box-shadow: 
    0 4px 20px rgba(139, 21, 56, 0.25),
    0 2px 8px rgba(109, 15, 44, 0.15),
    0 0 0 1px rgba(201, 169, 98, 0.2) inset;
}

.navbar-scrolled .login-btn:hover {
  box-shadow: 
    0 8px 32px rgba(139, 21, 56, 0.35),
    0 4px 12px rgba(109, 15, 44, 0.2),
    0 0 0 1px rgba(201, 169, 98, 0.5) inset,
    0 0 24px rgba(201, 169, 98, 0.12);
  border-color: rgba(201, 169, 98, 0.7);
}

/* 焦点状态 - 无障碍设计 */
.login-btn:focus-visible {
  outline: none;
  box-shadow: 
    0 4px 24px rgba(139, 21, 56, 0.35),
    0 2px 8px rgba(109, 15, 44, 0.25),
    0 0 0 3px rgba(201, 169, 98, 0.5),
    0 0 0 1px rgba(201, 169, 98, 0.15) inset;
}

/* 用户区域 */
.user-area {
  margin-left: auto;
  display: flex;
  align-items: center;
}

/* 用户下拉链接 */
.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 6px 6px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  transition: all 0.3s ease;
}

.navbar-scrolled .user-dropdown {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.navbar-scrolled .user-dropdown:hover {
  background: rgba(0, 0, 0, 0.08);
  border-color: rgba(192, 12, 0, 0.3);
}

/* 用户头像容器 */
.user-avatar {
  position: relative;
}

.el-avatar {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.navbar-scrolled .el-avatar {
  border-color: rgba(192, 12, 0, 0.3);
}

.user-dropdown:hover .el-avatar {
  border-color: #C00C00;
}

/* 在线状态指示器 */
.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #22c55e;
  border: 2px solid white;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* 用户名 */
.user-name {
  font-weight: 500;
  color: white;
  font-size: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.navbar-scrolled .user-name {
  color: #333;
  text-shadow: none;
}

/* 下拉箭头 */
.dropdown-arrow {
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.3s ease;
}

.navbar-scrolled .dropdown-arrow {
  color: #666;
}

.user-dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
  color: #C00C00;
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  min-width: 160px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item svg) {
  color: #666;
  flex-shrink: 0;
}

:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(135deg, rgba(192, 12, 0, 0.08) 0%, rgba(192, 12, 0, 0.05) 100%);
  color: #C00C00;
}

:deep(.el-dropdown-menu__item:hover svg) {
  color: #C00C00;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

/* 滚动时的用户区域样式 - 保留兼容性 */
.navbar-scrolled .el-dropdown-link {
  color: #333333;
  text-shadow: none;
}

/* 响应式设计 */
@media (max-width: 1199px) {
  .nav-item {
    font-size: 13px;
    padding: 6px 12px;
  }
}

@media (max-width: 767px) {
  .navbar {
    padding: 10px 15px;
  }
  
  .nav-menu {
    flex-wrap: wrap;
  }
  
  .nav-item {
    font-size: 12px;
    padding: 4px 8px;
    margin-right: 8px;
  }
  
  .login-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .login-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .user-dropdown {
    padding: 4px 10px 4px 4px;
  }
  
  .el-avatar {
    width: 32px;
    height: 32px;
  }
  
  .user-name {
    font-size: 13px;
    max-width: 60px;
  }
  
  .online-status {
    width: 8px;
    height: 8px;
  }
  
  .dropdown-arrow {
    width: 14px;
    height: 14px;
  }
}

/* 页脚样式 */
.page-footer {
  background-color: #333333;
  color: white;
  padding: 40px 0;
  margin-top: 80px;
  position: relative;
  overflow: hidden;
}

/* 波浪动画容器 */
.wave-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  overflow: hidden;
}

/* 波浪元素 */
.wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
  transform-origin: center;
}

/* 不同波浪的样式 */
.wave-1 {
  top: 10px;
  z-index: 3;
}

.wave-2 {
  top: 15px;
  z-index: 2;
  width: 110%;
  left: -5%;
}

.wave-3 {
  top: 20px;
  z-index: 1;
  width: 120%;
  left: -10%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  position: relative;
  z-index: 10;
}

.copyright {
  font-size: 14px;
  margin: 0 0 10px 0;
}

.contact {
  font-size: 14px;
  margin: 0 0 10px 0;
  opacity: 0.8;
}

.icp {
  font-size: 12px;
  margin: 0;
  opacity: 0.6;
}

/* 页脚响应式设计 */
@media (max-width: 767px) {
  .page-footer {
    padding: 30px 0;
    margin-top: 60px;
  }
  
  .footer-content {
    padding: 0 15px;
  }
  
  .copyright {
    font-size: 13px;
  }
  
  .contact {
    font-size: 12px;
  }
  
  .icp {
    font-size: 11px;
  }
}


</style>
