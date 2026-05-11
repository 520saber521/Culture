<script setup>
const baseUrl = import.meta.env.BASE_URL
</script>

<template>
  <div 
    class="login-page" 
    ref="loginPageRef"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <!-- 动态背景层 -->
    <div class="dynamic-background">
      <!-- 鼠标跟随光晕 -->
      <div 
        class="mouse-glow" 
        :style="{ 
          left: mouseGlow.x + 'px', 
          top: mouseGlow.y + 'px',
          opacity: mouseGlow.opacity
        }"
      ></div>
      
      <!-- 粒子效果 -->
      <div class="particles-container">
        <div 
          v-for="(particle, index) in particles" 
          :key="index"
          class="particle"
          :class="particle.class"
          :style="{
            left: particle.x + '%',
            top: particle.y + '%',
            width: particle.size + 'px',
            height: particle.size + 'px',
            animationDelay: particle.delay + 's',
            animationDuration: particle.duration + 's'
          }"
        ></div>
      </div>
      
      <!-- 波纹效果容器 -->
      <div class="ripples-container">
        <div 
          v-for="(ripple, index) in ripples" 
          :key="ripple.id"
          class="ripple"
          :style="{
            left: ripple.x + 'px',
            top: ripple.y + 'px'
          }"
          @animationend="removeRipple(index)"
        ></div>
      </div>
      
      <!-- 渐变背景动画 -->
      <div class="gradient-bg" :style="{ backgroundPosition: gradientPosition }"></div>
      
      <!-- 网格背景 -->
      <div class="grid-bg"></div>
    </div>

    <div class="login-container" :class="{ 'hover-active': isContainerHovered }">
      <div class="brand-section">
        <div class="brand-bg-pattern"></div>
        <div class="brand-content">
          <div class="brand-logo-wrapper">
            <img :src="baseUrl + 'logo1.png'" alt="logo" class="brand-logo" />
          </div>
          <h1 class="brand-title">AI文化设计平台</h1>
          <p class="brand-subtitle">传承文化精髓 · 创意无限可能</p>
          
          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="feature-text">
                <h4>海量文化素材</h4>
                <p>汇聚江苏非遗文化精髓</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 2L9.586 9.586" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="feature-text">
                <h4>AI智能设计</h4>
                <p>一键生成创意文化作品</p>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="feature-text">
                <h4>社区分享</h4>
                <p>与创意爱好者共同成长</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
        class="form-section"
        @mouseenter="isContainerHovered = true"
        @mouseleave="isContainerHovered = false"
      >
        <div class="form-card" :class="{ 'card-hover': isContainerHovered }">
          <div class="form-header">
            <div class="mobile-logo">
              <img :src="baseUrl + 'logo1.png'" alt="logo" class="mobile-brand-logo" />
            </div>
            <h2 class="form-title">{{ activeTab === 'login' ? '欢迎回来' : '创建账号' }}</h2>
            <p class="form-subtitle">{{ activeTab === 'login' ? '登录您的账号继续探索' : '注册新账号开启创意之旅' }}</p>
          </div>

          <div class="tab-switcher">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'login' }"
              @click="switchTab('login')"
            >
              登录
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'register' }"
              @click="switchTab('register')"
            >
              注册
            </button>
            <div class="tab-indicator" :class="{ 'move-right': activeTab === 'register' }"></div>
          </div>

          <transition name="fade-slide" mode="out-in">
            <el-form 
              v-if="activeTab === 'login'"
              key="login"
              ref="loginRef" 
              :model="loginForm" 
              :rules="loginRules" 
              class="auth-form"
              @submit.prevent="login"
            >
              <el-form-item prop="username">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <el-input 
                    v-model="loginForm.username" 
                    placeholder="请输入用户名" 
                    clearable
                    autocomplete="off"
                  />
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <el-input 
                    v-model="loginForm.password" 
                    placeholder="请输入密码" 
                    type="password" 
                    show-password
                  />
                </div>
              </el-form-item>

              <div class="form-options">
                <label class="remember-checkbox">
                  <input type="checkbox" v-model="loginForm.rememberMe">
                  <span class="checkmark"></span>
                  <span class="label-text">记住我</span>
                </label>
                <a class="forgot-link" @click="forgotPassword">忘记密码？</a>
              </div>

              <el-form-item class="form-actions">
                <button 
                  type="submit" 
                  class="submit-btn" 
                  :class="{ loading: isLoading }"
                  :disabled="isLoading"
                  @click.prevent="login"
                  @mouseenter="handleButtonHover"
                >
                  <span class="btn-text">{{ isLoading ? '登录中...' : '登录' }}</span>
                  <span class="btn-loader" v-if="isLoading"></span>
                </button>
              </el-form-item>
            </el-form>

            <el-form 
              v-else
              key="register"
              ref="registerRef" 
              :model="registerForm" 
              :rules="registerRules" 
              class="auth-form"
              @submit.prevent="register"
            >
              <el-form-item prop="username">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <el-input 
                    v-model="registerForm.username" 
                    placeholder="请输入用户名" 
                    clearable
                    autocomplete="off"
                  />
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <el-input 
                    v-model="registerForm.password" 
                    placeholder="请输入密码" 
                    type="password" 
                    show-password
                  />
                </div>
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <div class="input-wrapper">
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <el-input 
                    v-model="registerForm.confirmPassword" 
                    placeholder="请确认密码" 
                    type="password" 
                    show-password
                  />
                </div>
              </el-form-item>

              <el-form-item class="form-actions">
                <button 
                  type="submit" 
                  class="submit-btn register-btn" 
                  :class="{ loading: isRegistering }"
                  :disabled="isRegistering"
                  @click.prevent="register"
                  @mouseenter="handleButtonHover"
                >
                  <span class="btn-text">{{ isRegistering ? '注册中...' : '注册' }}</span>
                  <span class="btn-loader" v-if="isRegistering"></span>
                </button>
              </el-form-item>
            </el-form>
          </transition>

          <div class="form-footer">
            <div class="divider">
              <span>或</span>
            </div>
            <div class="social-login">
              <button class="social-btn wechat" title="微信登录" @mouseenter="handleButtonHover">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg>
              </button>
              <button class="social-btn qq" title="QQ登录" @mouseenter="handleButtonHover">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.212 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
                </svg>
              </button>
              <button class="social-btn weibo" title="微博登录" @mouseenter="handleButtonHover">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.388-1.032.428-1.922.006-2.556-.786-1.18-2.936-1.115-5.381-.032 0 0-.77.337-.573-.274.377-1.217.32-2.237-.267-2.826-1.333-1.337-4.869.045-7.894 3.088C1.098 10.931 0 13.287 0 15.312c0 3.878 4.973 6.236 9.839 6.236 6.376 0 10.617-3.705 10.617-6.646 0-1.777-1.497-2.785-2.397-3.253zm1.937-5.722c-.849-.97-2.1-1.384-3.328-1.205l.003-.001c-.34.05-.568.36-.518.694.05.335.354.566.69.516.772-.113 1.55.143 2.082.754.531.61.714 1.418.498 2.17-.087.324.1.66.42.75.322.09.658-.098.748-.42.322-1.128.05-2.336-.595-3.058zm2.247-2.57c-1.416-1.614-3.498-2.303-5.545-1.995-.35.052-.59.376-.538.723.052.348.378.59.727.538 1.616-.243 3.259.299 4.377 1.576 1.118 1.278 1.503 2.98 1.062 4.554-.092.328.1.669.427.762.328.092.668-.1.76-.428.55-1.96.07-4.077-1.27-5.53z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="form-footer-links">
          <span>登录即表示您同意我们的</span>
          <a href="#">服务条款</a>
          <span>和</span>
          <a href="#">隐私政策</a>
        </div>
      </div>
    </div>

    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi, setToken, getToken } from '@/utils/api'

const router = useRouter()
const loginPageRef = ref(null)
const activeTab = ref('login')
const isLoading = ref(false)

const loginForm = ref({ 
    username: '', 
    password: '',
    rememberMe: false
})
const loginRef = ref()
const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名至少3位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' }
    ]
}

const mouseGlow = reactive({
  x: 0,
  y: 0,
  opacity: 0
})

const gradientPosition = ref('0% 0%')
const isContainerHovered = ref(false)

const particles = ref([])
const ripples = ref([])
let rippleId = 0

function initParticles() {
  const particleCount = 30
  for (let i = 0; i < particleCount; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
      class: `particle-${i % 4}`
    })
  }
}

function handleMouseMove(event) {
  if (!loginPageRef.value) return
  
  const rect = loginPageRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  mouseGlow.x = x
  mouseGlow.y = y
  mouseGlow.opacity = 1
  
  const percentX = (x / rect.width) * 100
  const percentY = (y / rect.height) * 100
  gradientPosition.value = `${percentX}% ${percentY}%`
}

function handleMouseLeave() {
  mouseGlow.opacity = 0
}

function handleButtonHover(event) {
  if (!loginPageRef.value) return
  
  const rect = loginPageRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  ripples.value.push({
    id: rippleId++,
    x,
    y
  })
}

function removeRipple(index) {
  ripples.value.splice(index, 1)
}

onMounted(() => {
    initParticles()
    
    const savedUser = localStorage.getItem('savedUser')
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser)
            loginForm.value.username = user.username
            loginForm.value.password = user.password
            loginForm.value.rememberMe = true
        } catch (error) {
            console.error('解析保存的用户信息失败:', error)
        }
    }
})

onUnmounted(() => {
  particles.value = []
  ripples.value = []
})

async function login() {
    try {
        await loginRef.value.validate()
        
        isLoading.value = true
        
        const response = await authApi.login({
            username: loginForm.value.username,
            password: loginForm.value.password,
            rememberMe: loginForm.value.rememberMe
        })
        
        console.log('登录响应:', response)
        
        if (response.code === 200 && response.data) {
            setToken(response.data.token)
            
            const userInfo = response.data.userInfo || {}
            localStorage.setItem('username', userInfo.username || loginForm.value.username)
            localStorage.setItem('nickname', userInfo.nickname || loginForm.value.username)
            localStorage.setItem('avatar', userInfo.avatar || 'https://i.pravatar.cc/150?u=' + loginForm.value.username)
            
            if (loginForm.value.rememberMe) {
                localStorage.setItem('savedUser', JSON.stringify({
                    username: loginForm.value.username,
                    password: loginForm.value.password
                }))
            } else {
                localStorage.removeItem('savedUser')
            }
            
            ElMessage.success(response.message || '登录成功')
            router.push('/profile')
        } else {
            ElMessage.error(response.message || '用户名或密码错误')
        }
    } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录过程中发生错误，请重试')
    } finally {
        isLoading.value = false
    }
}

const isRegistering = ref(false)
const registerForm = ref({ 
    username: '', 
    password: '',
    confirmPassword: ''
})
const registerRef = ref()
const registerRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名至少3位', trigger: 'blur' },
        { max: 20, message: '用户名最多20位', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码至少6位', trigger: 'blur' },
        { max: 20, message: '密码最多20位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== registerForm.value.password) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

async function register() {
    try {
        await registerRef.value.validate()
        
        isRegistering.value = true
        
        const response = await authApi.register({
            username: registerForm.value.username,
            password: registerForm.value.password,
            confirmPassword: registerForm.value.confirmPassword
        })
        
        if (response.code === 200) {
            ElMessage.success(response.message || '注册成功，请登录')
            
            registerForm.value.username = ''
            registerForm.value.password = ''
            registerForm.value.confirmPassword = ''
            
            activeTab.value = 'login'
        } else {
            ElMessage.error(response.message || '注册失败')
        }
    } catch (error) {
        console.error('注册失败:', error)
        if (error.message) {
            ElMessage.error(error.message)
        } else {
            ElMessage.error('注册过程中发生错误，请重试')
        }
    } finally {
        isRegistering.value = false
    }
}

function switchTab(tab) {
    activeTab.value = tab
}

function forgotPassword() {
    ElMessage.info('请联系管理员重置密码。')
}
</script>

<style scoped>
:root {
  --primary-color: #1a1a1a;
  --accent-color: #C00C00;
  --accent-light: #ff4d4d;
  --accent-gradient: linear-gradient(135deg, #C00C00 0%, #8B0000 100%);
  --text-color: #333333;
  --light-text: #666666;
  --border-color: #E8E8E8;
  --card-bg: #FFFFFF;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.dynamic-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

.gradient-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
    rgba(192, 12, 0, 0.08) 0%, 
    rgba(245, 247, 250, 1) 30%, 
    rgba(228, 232, 236, 1) 100%);
  background-size: 200% 200%;
  transition: background-position 0.3s ease-out;
}

.grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(192, 12, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(192, 12, 0, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.mouse-glow {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(192, 12, 0, 0.15) 0%, 
    rgba(192, 12, 0, 0.05) 40%, 
    transparent 70%);
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: opacity 0.3s ease;
  filter: blur(20px);
  will-change: transform, left, top;
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(192, 12, 0, 0.2);
  animation: particleFloat linear infinite;
  will-change: transform;
}

.particle-0 { background: rgba(192, 12, 0, 0.15); }
.particle-1 { background: rgba(139, 0, 0, 0.12); }
.particle-2 { background: rgba(192, 12, 0, 0.1); }
.particle-3 { background: rgba(139, 0, 0, 0.08); }

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translate(30px, -30px) rotate(90deg);
    opacity: 0.6;
  }
  50% {
    transform: translate(-20px, -60px) rotate(180deg);
    opacity: 0.4;
  }
  75% {
    transform: translate(10px, -30px) rotate(270deg);
    opacity: 0.5;
  }
}

.ripples-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.ripple {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(192, 12, 0, 0.3);
  transform: translate(-50%, -50%);
  animation: rippleEffect 0.8s ease-out forwards;
}

@keyframes rippleEffect {
  0% {
    width: 20px;
    height: 20px;
    opacity: 0.5;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 1000px;
  min-height: 600px;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-container.hover-active {
  transform: scale(1.005);
  box-shadow: 0 12px 40px rgba(192, 12, 0, 0.15);
}

.brand-section {
  flex: 1;
  background: var(--accent-gradient);
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
  animation: patternMove 30s linear infinite;
}

@keyframes patternMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(60px, 60px);
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  color: #000000;
}

.brand-logo-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, background 0.3s ease;
}

.brand-logo-wrapper:hover {
  transform: scale(1.1) rotate(5deg);
  background: rgba(255, 255, 255, 0.25);
}

.brand-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.brand-subtitle {
  font-size: 16px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  letter-spacing: 1px;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateX(10px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  transition: background 0.3s ease, transform 0.3s ease;
}

.feature-item:hover .feature-icon {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.1);
}

.feature-text h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.feature-text p {
  font-size: 13px;
  margin: 0;
  opacity: 0.85;
}

.form-section {
  flex: 1;
  padding: 50px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: background 0.3s ease;
}

.mobile-logo {
  display: none;
  text-align: center;
  margin-bottom: 24px;
}

.mobile-brand-logo {
  width: 60px;
  height: 60px;
}

.form-card {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.form-card.card-hover {
  transform: scale(1.02);
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: var(--light-text);
  margin: 0;
}

.tab-switcher {
  display: flex;
  position: relative;
  background: #f5f5f5;
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 32px;
  transition: box-shadow 0.3s ease;
}

.tab-switcher:hover {
  box-shadow: 0 2px 8px rgba(192, 12, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: var(--light-text);
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
}

.tab-btn.active {
  color: var(--primary-color);
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 10px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.tab-indicator.move-right {
  transform: translateX(100%);
}

.auth-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.input-wrapper:focus-within {
  transform: scale(1.01);
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text);
  z-index: 2;
  transition: color 0.3s ease, transform 0.3s ease;
}

.input-wrapper:focus-within .input-icon {
  color: var(--accent-color);
  transform: translateY(-50%) scale(1.1);
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.auth-form :deep(.el-input__wrapper) {
  padding-left: 48px;
  border-radius: var(--radius-md);
  box-shadow: none;
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
  height: 52px;
}

.auth-form :deep(.el-input__wrapper:hover) {
  border-color: #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(192, 12, 0, 0.1);
}

.auth-form :deep(.el-input__inner) {
  font-size: 15px;
}

.auth-form :deep(.el-form-item__error) {
  padding-top: 6px;
  font-size: 12px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--light-text);
  transition: color 0.3s ease;
}

.remember-checkbox:hover {
  color: var(--accent-color);
}

.remember-checkbox input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.remember-checkbox:hover .checkmark {
  border-color: var(--accent-color);
}

.remember-checkbox input:checked + .checkmark {
  background: var(--accent-color);
  border-color: var(--accent-color);
}

.remember-checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link {
  font-size: 14px;
  color: var(--accent-color);
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.forgot-link:hover {
  opacity: 0.8;
}

.form-actions {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  height: 52px;
  background: var(--accent-gradient);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-btn:hover::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(192, 12, 0, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn.register-btn {
  background: linear-gradient(135deg, #2d8a4e 0%, #1a5c32 100%);
}

.submit-btn.register-btn:hover:not(:disabled) {
  box-shadow: 0 8px 20px rgba(45, 138, 78, 0.3);
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.submit-btn.loading .btn-text {
  visibility: hidden;
}

.form-footer {
  margin-top: 32px;
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  font-size: 13px;
  color: var(--light-text);
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-btn {
  width: 48px;
  height: 48px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.social-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.social-btn:hover::before {
  width: 100%;
  height: 100%;
  opacity: 0.1;
}

.social-btn.wechat:hover {
  border-color: #07c160;
  color: #07c160;
}

.social-btn.wechat:hover::before {
  background: #07c160;
}

.social-btn.qq:hover {
  border-color: #12b7f5;
  color: #12b7f5;
}

.social-btn.qq:hover::before {
  background: #12b7f5;
}

.social-btn.weibo:hover {
  border-color: #e6162d;
  color: #e6162d;
}

.social-btn.weibo:hover::before {
  background: #e6162d;
}

.form-footer-links {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: var(--light-text);
}

.form-footer-links a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.form-footer-links a:hover {
  text-decoration: underline;
  color: var(--accent-light);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: var(--accent-color);
  top: -100px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: var(--accent-color);
  bottom: -50px;
  left: -50px;
  animation: float 15s ease-in-out infinite reverse;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: var(--accent-color);
  top: 50%;
  left: 10%;
  animation: float 18s ease-in-out infinite;
}

.shape-4 {
  width: 100px;
  height: 100px;
  background: var(--accent-color);
  top: 30%;
  right: 15%;
  animation: float 12s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -20px) rotate(5deg);
  }
  50% {
    transform: translate(-10px, 20px) rotate(-5deg);
  }
  75% {
    transform: translate(-20px, -10px) rotate(3deg);
  }
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    max-width: 450px;
  }

  .brand-section {
    display: none;
  }

  .mobile-logo {
    display: block;
  }

  .form-section {
    padding: 40px 30px;
  }
  
  .mouse-glow {
    width: 250px;
    height: 250px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }

  .form-section {
    padding: 30px 20px;
  }

  .form-title {
    font-size: 24px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 14px;
  }

  .auth-form :deep(.el-input__wrapper) {
    height: 48px;
  }

  .submit-btn {
    height: 48px;
    font-size: 15px;
  }

  .social-btn {
    width: 44px;
    height: 44px;
  }
  
  .mouse-glow {
    width: 200px;
    height: 200px;
  }
  
  .particles-container {
    display: none;
  }
}
</style>
