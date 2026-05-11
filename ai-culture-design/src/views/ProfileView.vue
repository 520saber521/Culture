<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-grid">
        <aside class="profile-sidebar">
          <div class="profile-card user-card">
            <div class="user-card-header">
              <div class="avatar-container" @click="showAvatarModal = true">
                <el-avatar :src="avatar" :size="100" class="user-avatar" />
                <div class="avatar-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21429 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21429 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>
              <div class="user-info">
                <h1 class="user-name">{{ nickname }}</h1>
                <p class="user-username">@{{ username }}</p>
                <div class="user-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  <span>文化爱好者</span>
                </div>
              </div>
            </div>
            
            <div class="user-stats">
              <div class="stat-item">
                <span class="stat-value">{{ collections.length }}</span>
                <span class="stat-label">收藏</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalLikes }}</span>
                <span class="stat-label">点赞</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ works.length }}</span>
                <span class="stat-label">作品</span>
              </div>
            </div>

            <div class="user-bio">
              <div class="bio-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20H21M16.5 3.5C16.8978 3.10217 17.4374 2.87868 18 2.87868C18.2813 2.87868 18.5599 2.93403 18.8197 3.04154C19.0795 3.14904 19.3153 3.30656 19.513 3.50424C19.7107 3.70191 19.8666 3.93849 19.9724 4.19867C20.0782 4.45885 20.1319 4.73746 20.13 5.01824C20.1282 5.29902 20.0708 5.57687 19.9616 5.83564C19.8525 6.09442 19.6937 6.3289 19.4935 6.52424L7 19L3 20L4 16L16.5 3.5Z"/>
                </svg>
                <span>个性签名</span>
              </div>
              <el-input 
                type="textarea" 
                v-model="signature" 
                maxlength="100" 
                placeholder="写下你的个性签名..." 
                rows="2"
                @blur="saveSignature"
                class="bio-input"
              />
            </div>

            <button class="edit-profile-btn" @click="openEditProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"/>
                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.2813 1.87868 20.5599 1.93403 20.8197 2.04154C21.0795 2.14904 21.3153 2.30656 21.513 2.50424C21.7107 2.70191 21.8666 2.93849 21.9724 3.19867C22.0782 3.45885 22.1319 3.73746 22.13 4.01824C22.1282 4.29902 22.0708 4.57687 21.9616 4.83564C21.8525 5.09442 21.6937 5.3289 21.4935 5.52424L12 15L8 16L9 12L18.5 2.5Z"/>
              </svg>
              编辑资料
            </button>
          </div>

          <div class="profile-card quick-actions-card">
            <h3 class="card-title">快捷操作</h3>
            <div class="quick-actions">
              <button class="quick-action-btn" @click="router.push('/culture')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21L16.65 16.65"/>
                </svg>
                <span>探索文化库</span>
              </button>
              <button class="quick-action-btn" @click="router.push('/ai-design')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 19L19 12L22 15L15 22L12 19Z"/>
                  <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z"/>
                </svg>
                <span>AI创作</span>
              </button>
              <button class="quick-action-btn danger" @click="logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                  <path d="M16 17L21 12L16 7"/>
                  <path d="M21 12H9"/>
                </svg>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </aside>

        <main class="profile-main">
          <div class="tabs-container">
            <div class="tabs-header">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                class="tab-btn" 
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                <component :is="tab.icon" />
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <transition name="fade" mode="out-in">
              <div v-if="activeTab === 'collections'" key="collections" class="tab-content">
                <div class="content-header">
                  <h2>我的收藏</h2>
                  <span class="content-count">{{ collections.length }} 项</span>
                </div>
                <div class="content-grid" v-if="collections.length > 0">
                  <div 
                    v-for="item in collections" 
                    :key="item.id" 
                    class="content-card"
                    @click="viewCollection(item)"
                  >
                    <div class="card-image">
                      <img :src="item.image" :alt="item.name" loading="lazy" />
                      <div class="card-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                    </div>
                    <div class="card-body">
                      <h4>{{ item.name }}</h4>
                      <p>{{ item.category }}</p>
                      <div class="card-meta">
                        <span class="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39"/>
                          </svg>
                          {{ item.likes }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"/>
                  </svg>
                  <h4>暂无收藏</h4>
                  <p>去发现更多精彩内容吧</p>
                  <button class="primary-btn" @click="router.push('/culture')">浏览文化库</button>
                </div>
              </div>

              <div v-else-if="activeTab === 'works'" key="works" class="tab-content">
                <div class="content-header">
                  <h2>我的作品</h2>
                  <span class="content-count">{{ works.length }} 项</span>
                </div>
                <div class="content-grid" v-if="works.length > 0">
                  <div 
                    v-for="item in works" 
                    :key="item.id" 
                    class="content-card"
                    @click="viewWork(item)"
                  >
                    <div class="card-image">
                      <img :src="item.image" :alt="item.title" loading="lazy" />
                      <div class="card-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </div>
                    </div>
                    <div class="card-body">
                      <h4>{{ item.title }}</h4>
                      <p>{{ item.description }}</p>
                      <div class="card-meta">
                        <span class="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                          </svg>
                          {{ item.style }}
                        </span>
                        <span class="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6V12L16 14"/>
                          </svg>
                          {{ item.date }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15L16 10L5 21"/>
                  </svg>
                  <h4>暂无作品</h4>
                  <p>开始你的AI创作之旅</p>
                  <button class="primary-btn" @click="router.push('/ai-design')">开始创作</button>
                </div>
              </div>

              <div v-else-if="activeTab === 'settings'" key="settings" class="tab-content">
                <div class="content-header">
                  <h2>账户设置</h2>
                </div>
                <div class="settings-list">
                  <div class="settings-item" @click="openEditProfile">
                    <div class="settings-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="settings-info">
                      <h4>编辑资料</h4>
                      <p>修改昵称、头像、联系方式等信息</p>
                    </div>
                    <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18L15 12L9 6"/>
                    </svg>
                  </div>
                  
                  <div class="settings-item" @click="router.push('/ai-design')">
                    <div class="settings-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 19L19 12L22 15L15 22L12 19Z"/>
                        <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z"/>
                      </svg>
                    </div>
                    <div class="settings-info">
                      <h4>我的设计历史</h4>
                      <p>查看所有AI创作记录</p>
                    </div>
                    <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18L15 12L9 6"/>
                    </svg>
                  </div>
                  
                  <div class="settings-item">
                    <div class="settings-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                    </div>
                    <div class="settings-info">
                      <h4>隐私设置</h4>
                      <p>管理你的隐私偏好</p>
                    </div>
                    <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18L15 12L9 6"/>
                    </svg>
                  </div>
                  
                  <div class="settings-item">
                    <div class="settings-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"/>
                        <path d="M12 17H12.01"/>
                      </svg>
                    </div>
                    <div class="settings-info">
                      <h4>帮助与反馈</h4>
                      <p>获取帮助或提交反馈</p>
                    </div>
                    <svg class="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18L15 12L9 6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </main>
      </div>
    </div>

    <el-dialog 
      v-model="showEditProfile" 
      title="" 
      width="520px"
      :close-on-click-modal="false"
      class="edit-dialog"
      @close="resetForm"
    >
      <div class="edit-profile-content">
        <div class="edit-header">
          <h3>编辑个人资料</h3>
          <p>完善您的个人信息</p>
        </div>
        
        <el-form 
          ref="profileFormRef" 
          :model="profileForm" 
          :rules="profileRules" 
          label-position="top"
          class="profile-form"
        >
          <div class="avatar-upload-section">
            <div class="avatar-preview" @click="triggerAvatarUpload">
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
              accept="image/*" 
              hidden 
              @change="handleAvatarChange"
            />
            <div class="avatar-upload-tips">
              <span class="upload-btn" @click="triggerAvatarUpload">更换头像</span>
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
          <el-button class="cancel-btn" @click="handleCancel">取消</el-button>
          <el-button class="save-btn" type="primary" :loading="saving" @click="handleSave">
            <svg v-if="!saving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            保存修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi, userWorkApi, collectionApi, removeToken } from '@/utils/api'

const router = useRouter()

const username = ref('')
const nickname = ref('')
const avatar = ref('https://i.pravatar.cc/150')
const signature = ref('这家伙很懒，什么个性签名都没有留下。')
const activeTab = ref('collections')

const showEditProfile = ref(false)
const profileFormRef = ref(null)
const avatarInputRef = ref(null)
const saving = ref(false)

const profileForm = reactive({
  avatar: 'https://i.pravatar.cc/150',
  nickname: '',
  phone: '',
  email: '',
  bio: ''
})

const originalForm = reactive({
  avatar: '',
  nickname: '',
  phone: '',
  email: '',
  bio: ''
})

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

const tabs = [
  { 
    id: 'collections', 
    label: '我的收藏',
    icon: h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { d: 'M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z' })
    ])
  },
  { 
    id: 'works', 
    label: '我的作品',
    icon: h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
      h('circle', { cx: 8.5, cy: 8.5, r: 1.5, fill: 'currentColor' }),
      h('path', { d: 'M21 15L16 10L5 21' })
    ])
  },
  { 
    id: 'settings', 
    label: '账户设置',
    icon: h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('circle', { cx: 12, cy: 12, r: 3 }),
      h('path', { d: 'M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z' })
    ])
  }
]

const collections = ref([
  { id: 1, name: '南京云锦', category: '传统技艺', image: 'https://picsum.photos/400/300?random=1', likes: 128 },
  { id: 2, name: '苏州刺绣', category: '传统技艺', image: 'https://picsum.photos/400/300?random=2', likes: 256 },
  { id: 3, name: '宜兴紫砂', category: '传统技艺', image: 'https://picsum.photos/400/300?random=3', likes: 89 }
])

const totalLikes = ref(0)

const works = ref([
  { id: 1, title: '云锦纹样设计', description: '基于南京云锦传统纹样的现代设计', style: '传统风格', date: '2024-01-15', image: 'https://picsum.photos/400/300?random=4' },
  { id: 2, title: '苏绣花鸟图', description: '融合现代审美的苏绣花鸟图案', style: '现代风格', date: '2024-01-10', image: 'https://picsum.photos/400/300?random=5' },
  { id: 3, title: '紫砂壶造型', description: '传统紫砂壶的创新造型设计', style: '创新风格', date: '2024-01-05', image: 'https://picsum.photos/400/300?random=6' }
])

function checkLoginStatus() {
  const isLogin = localStorage.getItem('isLogin') === 'true'
  if (!isLogin) {
    router.push('/login')
  }
}

onMounted(() => {
  checkLoginStatus()
  username.value = localStorage.getItem('username') || '用户'
  nickname.value = localStorage.getItem('nickname') || username.value
  avatar.value = localStorage.getItem('avatar') || 'https://i.pravatar.cc/150'
  signature.value = localStorage.getItem('signature') || signature.value
  totalLikes.value = Math.floor(Math.random() * 1000)
})

function saveSignature() {
  localStorage.setItem('signature', signature.value)
  ElMessage.success('签名已保存')
}

function triggerAvatarUpload() {
  avatarInputRef.value?.click()
}

function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }
  
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    ElMessage.error('只支持 JPG、PNG 格式的图片')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result
  }
  reader.readAsDataURL(file)
}

function resetForm() {
  profileForm.avatar = originalForm.avatar
  profileForm.nickname = originalForm.nickname
  profileForm.phone = originalForm.phone
  profileForm.email = originalForm.email
  profileForm.bio = originalForm.bio
  profileFormRef.value?.clearValidate()
}

function handleCancel() {
  resetForm()
  showEditProfile.value = false
}

async function handleSave() {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    
    saving.value = true
    
    const response = await authApi.updateCurrentUser({
      nickname: profileForm.nickname,
      avatar: profileForm.avatar,
      phone: profileForm.phone || null,
      email: profileForm.email || null,
      bio: profileForm.bio || null
    })
    
    if (response.code === 200) {
      nickname.value = profileForm.nickname
      avatar.value = profileForm.avatar
      
      localStorage.setItem('nickname', profileForm.nickname)
      localStorage.setItem('avatar', profileForm.avatar)
      localStorage.setItem('phone', profileForm.phone || '')
      localStorage.setItem('email', profileForm.email || '')
      localStorage.setItem('bio', profileForm.bio || '')
      
      originalForm.avatar = profileForm.avatar
      originalForm.nickname = profileForm.nickname
      originalForm.phone = profileForm.phone
      originalForm.email = profileForm.email
      originalForm.bio = profileForm.bio
      
      showEditProfile.value = false
      ElMessage.success(response.message || '个人资料保存成功')
    } else {
      ElMessage.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.warning('请检查表单填写是否正确')
  } finally {
    saving.value = false
  }
}

function viewCollection(item) {
  ElMessage.info(`查看收藏: ${item.name}`)
}

function viewWork(item) {
  ElMessage.info(`查看作品: ${item.title}`)
}

async function logout() {
  try {
    await authApi.logout()
  } catch (error) {
    console.error('登出API调用失败:', error)
  }
  removeToken()
  localStorage.removeItem('savedUser')
  ElMessage.success('已退出登录')
  router.push('/login')
}

function openEditProfile() {
  profileForm.avatar = avatar.value
  profileForm.nickname = nickname.value
  profileForm.phone = localStorage.getItem('phone') || ''
  profileForm.email = localStorage.getItem('email') || ''
  profileForm.bio = localStorage.getItem('bio') || ''
  
  originalForm.avatar = profileForm.avatar
  originalForm.nickname = profileForm.nickname
  originalForm.phone = profileForm.phone
  originalForm.email = profileForm.email
  originalForm.bio = profileForm.bio
  
  showEditProfile.value = true
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --p-bg: #f7f4ef;
  --p-surface: rgba(255, 255, 255, 0.82);
  --p-text: #221e1a;
  --p-muted: #6d665d;
  --p-border: rgba(31, 24, 20, 0.08);
  --p-accent: #8b1538;
  --p-shadow: 0 18px 48px rgba(20, 16, 12, 0.08);
  --p-shadow-strong: 0 28px 72px rgba(20, 16, 12, 0.12);
  --radius-lg: 24px;
  --radius-md: 16px;
}

* { font-family: 'Inter', 'Source Han Serif SC', 'Noto Serif SC', sans-serif; }
.profile-page { min-height:100vh; padding:24px; background: radial-gradient(circle at top, rgba(201,169,98,.10), transparent 34%), linear-gradient(180deg, #fbfaf7 0%, var(--p-bg) 100%); color: var(--p-text); }
.profile-container { max-width:1240px; margin:0 auto; }
.profile-grid { display:grid; grid-template-columns:340px 1fr; gap:24px; }
.profile-sidebar { display:flex; flex-direction:column; gap:24px; }
.profile-card, .tabs-container, .edit-dialog :deep(.el-dialog) { background: var(--p-surface); backdrop-filter: blur(18px); border:1px solid rgba(139,21,56,.08); box-shadow: var(--p-shadow); }
.profile-card { border-radius: var(--radius-lg); padding:24px; transition: transform .35s ease, box-shadow .35s ease; }
.profile-card:hover { transform: translateY(-4px); box-shadow: var(--p-shadow-strong); }
.user-card-header { display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:24px; }
.avatar-container { position:relative; cursor:pointer; margin-bottom:16px; }
.user-avatar { border:4px solid rgba(255,255,255,.8); box-shadow: 0 18px 40px rgba(15,23,42,.16); transition: transform .35s ease; }
.avatar-container:hover .user-avatar { transform: scale(1.04); }
.avatar-overlay { position:absolute; inset:0; border-radius:50%; background: linear-gradient(135deg, rgba(139,21,56,.55), rgba(201,169,98,.25)); display:flex; align-items:center; justify-content:center; color:#fff; opacity:0; transition: opacity .3s ease; }
.avatar-container:hover .avatar-overlay { opacity:1; }
.user-name { font-size:24px; font-weight:800; margin:0 0 4px; }
.user-username { color: var(--p-muted); margin:0 0 12px; }
.user-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; background: linear-gradient(135deg, rgba(139,21,56,.10), rgba(201,169,98,.12)); color: var(--p-accent); font-size:12px; font-weight:700; }
.user-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; padding:20px 0; margin-bottom:20px; border-top:1px solid var(--p-border); border-bottom:1px solid var(--p-border); }
.stat-item { text-align:center; }
.stat-value { display:block; font-size:24px; font-weight:800; line-height:1.1; }
.stat-label { color: var(--p-muted); font-size:12px; margin-top:4px; }
.bio-header { display:flex; align-items:center; gap:8px; color: var(--p-muted); font-size:13px; font-weight:600; margin-bottom:10px; }
.bio-input :deep(.el-textarea__inner), .profile-form :deep(.el-input__wrapper), .profile-form :deep(.el-textarea__inner) { border-radius:14px; border:1px solid rgba(31,24,20,.10); box-shadow:none; transition: all .3s ease; }
.bio-input :deep(.el-textarea__inner:focus), .profile-form :deep(.el-input__wrapper.is-focus), .profile-form :deep(.el-textarea__inner:focus) { border-color: var(--p-accent); box-shadow:0 0 0 3px rgba(139,21,56,.10); }
.edit-profile-btn, .primary-btn, .save-btn { background: linear-gradient(135deg, var(--p-accent) 0%, #6f1632 100%); color:#fff; border:none; transition: transform .3s ease, box-shadow .3s ease; }
.edit-profile-btn:hover, .primary-btn:hover, .save-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 30px rgba(139,21,56,.22); }
.quick-action-btn { display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:14px; border:1px solid rgba(31,24,20,.06); background: rgba(255,255,255,.72); transition: all .3s ease; }
.quick-action-btn:hover { transform: translateX(6px); border-color: rgba(139,21,56,.16); color: var(--p-accent); }
.quick-action-btn.danger:hover { color:#b42318; background: rgba(239,68,68,.08); }
.tabs-container { border-radius: var(--radius-lg); overflow:hidden; }
.tabs-header { display:flex; gap:8px; padding:10px; background: rgba(248,244,238,.75); border-bottom:1px solid var(--p-border); }
.tab-btn { display:flex; align-items:center; gap:8px; padding:12px 18px; border:none; border-radius:14px; background:transparent; color: var(--p-muted); transition: all .3s ease; }
.tab-btn.active, .tab-btn:hover { background:#fff; color: var(--p-accent); box-shadow:0 8px 20px rgba(15,23,42,.06); }
.tab-content { padding:24px; }
.content-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
.content-count { padding:6px 12px; border-radius:999px; background: rgba(139,21,56,.08); color: var(--p-accent); }
.content-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:18px; }
.content-card { border-radius:18px; overflow:hidden; border:1px solid rgba(31,24,20,.06); background: rgba(255,255,255,.9); transition: all .35s ease; }
.content-card:hover { transform: translateY(-6px); box-shadow: 0 22px 44px rgba(15,23,42,.10); }
.card-image { position:relative; height:170px; overflow:hidden; }
.card-image img { width:100%; height:100%; object-fit:cover; transition: transform .8s ease; }
.content-card:hover .card-image img { transform: scale(1.08); }
.card-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, rgba(139,21,56,.78), rgba(201,169,98,.55)); opacity:0; transition: opacity .3s ease; color:#fff; }
.content-card:hover .card-overlay { opacity:1; }
.card-body { padding:16px; }
.card-body h4 { margin:0 0 4px; font-size:16px; font-weight:700; }
.card-body p { margin:0 0 12px; color: var(--p-muted); font-size:13px; line-height:1.7; }
.card-meta { display:flex; gap:12px; }
.meta-item { display:flex; align-items:center; gap:4px; color:#8b837a; font-size:12px; }
.empty-state { text-align:center; padding:62px 20px; }
.empty-state svg { color: rgba(139,21,56,.35); margin-bottom:16px; }
.empty-state h4 { margin:0 0 8px; font-size:18px; }
.empty-state p { margin:0 0 24px; color: var(--p-muted); }
.settings-list { display:flex; flex-direction:column; gap:10px; }
.settings-item { display:flex; align-items:center; gap:16px; padding:16px; border-radius:16px; background: rgba(255,255,255,.75); border:1px solid rgba(31,24,20,.06); transition: all .3s ease; }
.settings-item:hover { transform: translateX(6px); border-color: rgba(139,21,56,.16); box-shadow: 0 12px 26px rgba(15,23,42,.08); }
.settings-icon { width:44px; height:44px; border-radius:14px; display:flex; align-items:center; justify-content:center; background: linear-gradient(135deg, rgba(139,21,56,.10), rgba(201,169,98,.12)); color: var(--p-accent); }
.arrow-icon { transition: transform .3s ease; }
.settings-item:hover .arrow-icon { transform: translateX(4px); color: var(--p-accent); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity:0; }
.edit-dialog :deep(.el-dialog) { border-radius:24px; overflow:hidden; }
.edit-dialog :deep(.el-dialog__header), .edit-dialog :deep(.el-dialog__body), .edit-dialog :deep(.el-dialog__footer) { padding:0; }
.edit-profile-content { padding:24px; }
.edit-header { text-align:center; margin-bottom:24px; }
.edit-header h3 { font-size:22px; font-weight:800; margin:0 0 8px; }
.avatar-upload-section { display:flex; align-items:center; gap:20px; margin-bottom:24px; padding:18px; border-radius:18px; background: rgba(248,244,238,.85); }
.preview-avatar { border:3px solid rgba(255,255,255,.9); box-shadow:0 14px 32px rgba(15,23,42,.12); }
.avatar-upload-overlay { position:absolute; inset:0; border-radius:50%; background: linear-gradient(135deg, rgba(139,21,56,.55), rgba(201,169,98,.28)); opacity:0; display:flex; align-items:center; justify-content:center; color:#fff; transition: opacity .3s ease; }
.avatar-preview:hover .avatar-upload-overlay { opacity:1; }
.upload-btn { display:inline-flex; align-items:center; padding:8px 16px; border-radius:999px; background: linear-gradient(135deg, var(--p-accent), #6f1632); color:#fff; cursor:pointer; }
.dialog-footer { display:flex; gap:12px; justify-content:flex-end; padding:16px 24px 24px; }
.cancel-btn { border-radius:14px; }
@media (max-width:1024px) { .profile-grid { grid-template-columns:1fr; } }
@media (max-width:768px) { .profile-page { padding:16px; } .content-grid { grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); } .tab-btn span { display:none; } }
@media (max-width:480px) { .profile-page { padding:12px; } .profile-card { padding:16px; } .content-grid { grid-template-columns:1fr; } .dialog-footer { flex-direction:column-reverse; } .cancel-btn, .save-btn { width:100%; justify-content:center; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important; } }
</style>
