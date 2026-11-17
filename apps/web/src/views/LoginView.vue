<template>
  <main class="login-page">
    <div class="login-container">
      <div class="brand-section">
        <div class="brand-content">
          <p class="brand-eyebrow"><span>江苏文化 · 创意新生</span><span>JIANGSU STUDIO</span></p>
          <div class="brand-heading"><h1 class="brand-title">把江苏，<br><em>写进新意。</em></h1><span class="vertical-note">一方水土<br>万般灵感</span></div>
          <p class="brand-subtitle">拾起千年的文化灵感，写下属于你的新篇。</p>
          <figure class="garden-art">
            <img :src="baseUrl + 'jiangsu-login-tea-watercolor.png'" alt="水彩茶点雅集：折扇、茶饮、糕点与园林窗景相映" />
            <figcaption><span>以文化为底色 · 以创意续新章</span><span class="art-seal">江苏<br>新作</span></figcaption>
          </figure>
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

      <section class="form-section" aria-label="账号登录与注册">
        <div class="form-card">
          <div class="form-header">
            <p class="form-eyebrow"><span>灵感在此相逢</span><span class="form-number">江苏 · 雅集</span></p>
            <h2 class="form-title">{{ activeTab === 'login' ? '欢迎归来' : '开启新篇' }}</h2>
            <p class="form-subtitle">{{ activeTab === 'login' ? '登录您的账号继续探索' : '注册新账号开启创意之旅' }}</p>
          </div>

          <div class="tab-switcher" aria-label="选择登录或注册">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'login' }"
              :aria-pressed="activeTab === 'login'" :disabled="isLoading || isRegistering" @click="switchTab('login')"
            >
              登录
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'register' }"
              :aria-pressed="activeTab === 'register'" :disabled="isLoading || isRegistering" @click="switchTab('register')"
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
                    v-model="loginForm.username" aria-label="用户名"
                    placeholder="请输入用户名"
                    clearable
                    autocomplete="username"
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
                    v-model="loginForm.password" aria-label="密码" autocomplete="current-password"
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
                <button type="button" class="forgot-link" @click="forgotPassword">忘记密码？</button>
              </div>

              <el-form-item class="form-actions">
                <BrandButton type="submit" class="submit-btn" :loading="isLoading" @click.prevent="login">
                  {{ isLoading ? '登录中…' : '登录' }}
                </BrandButton>
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
                    v-model="registerForm.username" aria-label="用户名"
                    placeholder="请输入用户名"
                    clearable
                    autocomplete="username"
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
                    v-model="registerForm.password" aria-label="密码" autocomplete="new-password"
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
                    v-model="registerForm.confirmPassword" aria-label="确认密码" autocomplete="new-password"
                    placeholder="请确认密码"
                    type="password"
                    show-password
                  />
                </div>
              </el-form-item>

              <el-form-item class="form-actions">
                <BrandButton type="submit" class="submit-btn" :loading="isRegistering" @click.prevent="register">
                  {{ isRegistering ? '注册中…' : '注册' }}
                </BrandButton>
              </el-form-item>
            </el-form>
          </transition>

          <div class="form-footer">
            <div class="divider">
              <span>其他登录方式</span>
            </div>
            <div class="social-login">
              <button class="social-btn wechat" @click="thirdPartyLogin('微信')" title="微信登录">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                </svg><span>微信</span>
              </button>
              <button class="social-btn qq" @click="thirdPartyLogin('QQ')" title="QQ登录">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.212 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
                </svg><span>QQ</span>
              </button>
              <button class="social-btn weibo" @click="thirdPartyLogin('微博')" title="微博登录">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.194.573zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.405-.649.388-1.032.428-1.922.006-2.556-.786-1.18-2.936-1.115-5.381-.032 0 0-.77.337-.573-.274.377-1.217.32-2.237-.267-2.826-1.333-1.337-4.869.045-7.894 3.088C1.098 10.931 0 13.287 0 15.312c0 3.878 4.973 6.236 9.839 6.236 6.376 0 10.617-3.705 10.617-6.646 0-1.777-1.497-2.785-2.397-3.253zm1.937-5.722c-.849-.97-2.1-1.384-3.328-1.205l.003-.001c-.34.05-.568.36-.518.694.05.335.354.566.69.516.772-.113 1.55.143 2.082.754.531.61.714 1.418.498 2.17-.087.324.1.66.42.75.322.09.658-.098.748-.42.322-1.128.05-2.336-.595-3.058zm2.247-2.57c-1.416-1.614-3.498-2.303-5.545-1.995-.35.052-.59.376-.538.723.052.348.378.59.727.538 1.616-.243 3.259.299 4.377 1.576 1.118 1.278 1.503 2.98 1.062 4.554-.092.328.1.669.427.762.328.092.668-.1.76-.428.55-1.96.07-4.077-1.27-5.53z"/>
                </svg><span>微博</span>
              </button>
            </div>
          </div>
        </div>

        <div class="form-footer-links">
          <span>登录即表示您同意我们的</span>
          <button type="button" @click="showLegalNotice">服务条款</button>
          <span>和</span>
          <button type="button" @click="showLegalNotice">隐私政策</button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi, setToken } from '@/utils/api'
import BrandButton from '@/components/BrandButton.vue'

const baseUrl = import.meta.env.BASE_URL
const router = useRouter()
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

onMounted(() => {

    const savedUser = localStorage.getItem('savedUser')
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser)
            loginForm.value.username = user.username
            loginForm.value.rememberMe = true
        } catch (error) {
            console.error('解析保存的用户信息失败:', error)
        }
    }
})


async function login() {
    if (isLoading.value) return
    if (!await loginRef.value.validate().catch(() => false)) return
    try {

        isLoading.value = true

        const response = await authApi.login({
            username: loginForm.value.username,
            password: loginForm.value.password,
            rememberMe: loginForm.value.rememberMe
        })

        if (response.code === 200 && response.data) {
            setToken(response.data.token, response.data.refreshToken)

            const userInfo = response.data.userInfo || {}
            localStorage.setItem('isLogin', 'true')
            localStorage.setItem('username', userInfo.username || loginForm.value.username)
            localStorage.setItem('nickname', userInfo.nickname || loginForm.value.username)
            localStorage.setItem('avatar', userInfo.avatar || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + loginForm.value.username)

            if (loginForm.value.rememberMe) {
                localStorage.setItem('savedUser', JSON.stringify({
                    username: loginForm.value.username
                }))
            } else {
                localStorage.removeItem('savedUser')
            }

            ElMessage.success(response.message || '登录成功')
            router.push(router.currentRoute.value.query.redirect || '/profile')
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
    if (isRegistering.value) return
    if (!await registerRef.value.validate().catch(() => false)) return
    try {

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
function thirdPartyLogin(provider) {
    ElMessage.info(`${provider}登录尚未接入，请使用账号密码登录。`)
}
function showLegalNotice() {
    ElMessage.info('相关文档尚未发布，请联系平台管理员了解详情。')
}
</script>

<style scoped>
.login-page {
  box-sizing: border-box; min-height: 100svh;
  padding: calc(var(--brand-nav-height) + 40px) var(--brand-gutter) 40px;
  background: var(--brand-paper); color: var(--brand-ink); font-family: var(--brand-sans);
  --el-color-primary: var(--brand-red); --el-color-danger: var(--brand-red);
  --el-text-color-regular: var(--brand-ink);
}
.login-container { max-width: 1180px; margin: auto; display: grid; grid-template-columns: 1.15fr 1fr; background: var(--brand-surface); border: 1px solid var(--brand-line); }
.brand-section { padding: 28px 34px 26px; background: var(--brand-jade); border-right: 1px solid #bbc9b7; position: relative; }
.brand-section::before { content: ''; position: absolute; inset: 0; background: url('/paper-grain.svg'); opacity: .23; pointer-events: none; }
.brand-content { position: relative; }
.brand-eyebrow { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-bottom: 13px; border-bottom: 1px solid #9cac98; font-size: 11px; letter-spacing: 2px; color: var(--brand-deep-green); margin: 0 0 22px; }
.brand-eyebrow span:last-child { font: 9px Georgia, serif; letter-spacing: 2px; }
.brand-heading { display: flex; align-items: center; justify-content: space-between; }
.brand-title { font: 400 clamp(48px, 4.7vw, 66px)/1.06 var(--brand-display); letter-spacing: 1px; margin: 0 0 16px; }
.brand-title em { font-style: normal; color: var(--brand-red); }
.vertical-note { writing-mode: vertical-rl; font: 16px/1.8 var(--brand-serif); letter-spacing: 4px; border: 3px double #81917b; padding: 12px 8px; color: var(--brand-deep-green); margin-right: 8px; }
.brand-subtitle { font-size: 13px; color: #485648; margin: 0; letter-spacing: 1px; }
.garden-art { margin: 22px 0 20px; position: relative; }
.garden-art img { display: block; width: 100%; height: auto; aspect-ratio: 1672 / 941; object-fit: contain; border: 1px solid #9b9f88; }
.garden-art figcaption { display: flex; justify-content: space-between; align-items: center; background: #f2e6bb; padding: 9px 13px; border: 1px solid #b9ad85; border-top: 0; font: 12px var(--brand-serif); color: #5a5138; letter-spacing: 2px; }
.art-seal { font: 11px/1.2 var(--brand-serif); border: 1px solid var(--brand-red); padding: 3px; color: var(--brand-red); transform: rotate(-5deg); }
.brand-features { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid #9cac98; border-bottom: 1px solid #9cac98; padding: 14px 0; }
.feature-item { padding: 0 13px; border-right: 1px solid #a9b6a2; }
.feature-item:first-child { padding-left: 0; }.feature-item:last-child { border: 0; padding-right: 0; }
.feature-icon { display: none; }.feature-text h4 { font: 700 15px var(--brand-serif); margin: 0 0 7px; color: #3b493b; }.feature-text p { font-size: 11px; line-height: 1.7; color: #596653; margin: 0; }
.form-section { padding: 36px 52px 25px; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.form-card { width: 100%; max-width: 370px; margin: auto; }.form-header { margin-bottom: 25px; }
.form-eyebrow { display: flex; justify-content: space-between; align-items: center; color: var(--brand-red); font: 12px var(--brand-serif); letter-spacing: 2px; margin: 0 0 23px; }
.form-number { color: #76765e; border: 1px solid #d0c6a4; padding: 4px 6px; font-size: 10px; letter-spacing: 1px; }
.form-title { font: 400 42px var(--brand-display); letter-spacing: 2px; margin: 0 0 12px; }.form-subtitle { font-size: 13px; color: var(--brand-muted); margin: 0; }
.tab-switcher { display: flex; border-bottom: 1px solid var(--brand-line); margin-bottom: 25px; position: relative; }.tab-btn { flex: 1; padding: 12px; border: 0; background: none; color: var(--brand-muted); font: 15px var(--brand-sans); cursor: pointer; }.tab-btn.active { color: var(--brand-red); font-weight: 600; }.tab-indicator { position: absolute; bottom: -1px; left: 0; width: 50%; height: 2px; background: var(--brand-red); transition: transform .2s; }.tab-indicator.move-right { transform: translateX(100%); }
.input-wrapper { width: 100%; position: relative; display: flex; align-items: center; }.input-icon { position: absolute; left: 14px; z-index: 1; display: flex; color: #7c8275; pointer-events: none; }.input-icon svg { width: 18px; height: 18px; }
.auth-form :deep(.el-form-item) { margin-bottom: 22px; }.auth-form :deep(.el-input__wrapper) { height: 48px; box-sizing: border-box; padding: 0 12px 0 42px; background: #f8f9f5; border: 1px solid #d7dbcf; border-radius: 4px; box-shadow: none; }.auth-form :deep(.el-input__wrapper:hover) { border-color: #89937e; }.auth-form :deep(.el-input__wrapper.is-focus), .auth-form :deep(.is-error .el-input__wrapper) { border-color: var(--brand-red); box-shadow: none; }.auth-form :deep(.el-input__inner) { font-family: var(--brand-sans); font-size: 14px; color: var(--brand-ink); }.auth-form :deep(.el-input__inner::placeholder) { color: var(--brand-muted); }
.form-options { display: flex; justify-content: space-between; align-items: center; margin: 0 0 24px; font-size: 13px; }.remember-checkbox { display: flex; gap: 7px; align-items: center; color: var(--brand-muted); cursor: pointer; }.remember-checkbox input { accent-color: var(--brand-red); width: 15px; height: 15px; margin: 0; }.checkmark { display: none; }.forgot-link { border: 0; padding: 4px 0; background: none; color: var(--brand-red); font: inherit; cursor: pointer; }.submit-btn { width: 100%; height: 50px; padding: 0 21px; }
.submit-btn :deep(.brand-button__label) { padding-left: 32px; }
.form-footer { margin-top: 26px; }.divider { display: flex; gap: 16px; align-items: center; margin-bottom: 17px; color: var(--brand-muted); font-size: 11px; }.divider:before, .divider:after { content: ''; height: 1px; flex: 1; background: var(--brand-line); }.social-login { display: flex; gap: 10px; }.social-btn { flex: 1; display: flex; justify-content: center; align-items: center; gap: 8px; height: 40px; border: 1px solid var(--brand-line); border-radius: 4px; background: var(--brand-surface); color: #616a58; font-size: 12px; cursor: pointer; }.social-btn svg { width: 17px; height: 17px; }.social-btn:hover { border-color: var(--brand-red); color: var(--brand-red); }.form-footer-links { font-size: 11px; color: var(--brand-muted); text-align: center; margin-top: 28px; line-height: 1.8; }.form-footer-links button { border: 0; padding: 0 2px; background: none; color: var(--brand-red); font: inherit; cursor: pointer; }.tab-btn:focus-visible, .social-btn:focus-visible, .forgot-link:focus-visible, .form-footer-links button:focus-visible { outline: 2px solid var(--brand-red); outline-offset: 3px; }
@media(max-width:1000px) { .brand-section { padding: 28px 24px; }.form-section { padding: 32px 28px 25px; }.brand-title { font-size: 48px; }.vertical-note { font-size: 13px; padding: 8px 4px; margin-right: 0; }.brand-eyebrow span:last-child { display: none; }.feature-text h4 { font-size: 13px; }.feature-item { padding: 0 8px; }.feature-text p { font-size: 10px; }.garden-art img { height: auto; } }
@media(max-width:700px) { .login-page { padding: calc(var(--brand-nav-height) + 18px) 16px 28px; }.login-container { max-width: 480px; grid-template-columns: 1fr; }.brand-section { padding: 20px 24px; border-right: 0; border-bottom: 1px solid #bbc9b7; }.brand-eyebrow { font-size: 10px; margin-bottom: 14px; padding-bottom: 10px; }.brand-title { font-size: 39px; margin-bottom: 12px; line-height: 1.05; }.brand-title br { display: block; }.vertical-note { display: none; }.brand-subtitle { font-size: 11px; letter-spacing: 0; }.garden-art, .brand-features { display: none; }.form-section { padding: 25px 24px; }.form-title { font-size: 34px; }.form-header { margin-bottom: 18px; }.form-eyebrow { margin-bottom: 15px; }.form-number { font-size: 9px; }.form-footer-links { margin-top: 22px; } }
@media(max-width:360px) { .brand-title { font-size: 33px; }.brand-section, .form-section { padding-left: 18px; padding-right: 18px; }.brand-subtitle { font-size: 10px; } }
@media(prefers-reduced-motion:reduce) { .tab-indicator { transition: none; } }
</style>
