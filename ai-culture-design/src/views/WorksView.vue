<template>
    <div class="works-view">
        <!-- 未登录时弹窗提示，已登录时展示作品列表 -->
        <el-dialog v-model="showDialog" title="温馨提示" width="300px" :close-on-click-modal="false" :show-close="false">
            <p>请先登录后再查看你的作品！</p>
            <div style="text-align: right; margin-top: 16px;">
                <el-button type="primary" @click="toLogin">去登录</el-button>
            </div>
        </el-dialog>

        <div v-if="isLogin">
            <el-input v-model="search" placeholder="搜索作品标题..." style="width:300px;margin-bottom:20px;" clearable />

            <el-row :gutter="16">
                <el-col v-for="work in pagedWorks" :key="work.id" :span="8">
                    <el-card class="work-card">
                        <img :src="work.image || defaultImg" class="work-img" />
                        <h3>{{ work.title }}</h3>
                        <p>{{ work.description }}</p>
                    </el-card>
                </el-col>
            </el-row>

            <div style="text-align:center;margin-top:30px;">
                <el-pagination background layout="prev, pager, next" :total="filteredWorks.length" :page-size="pageSize"
                    v-model:current-page="page" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const works = ref([])
const search = ref('')
const page = ref(1)
const pageSize = ref(6)
const defaultImg = 'https://via.placeholder.com/200x120?text=作品预览'

const isLogin = ref(false)
const showDialog = ref(false)

onMounted(() => {
    // 检查登录状态
    isLogin.value = localStorage.getItem('isLogin') === 'true'
    if (!isLogin.value) {
        showDialog.value = true
    } else {
        username.value = localStorage.getItem('username') || '用户'
        works.value = JSON.parse(localStorage.getItem('userWorks_' + username.value) || '[]')
    }
})

// 登录按钮事件
function toLogin() {
    router.push('/login')
}

const filteredWorks = computed(() =>
    works.value.filter(
        w => w.title.includes(search.value) || w.description.includes(search.value)
    )
)
const pagedWorks = computed(() =>
    filteredWorks.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value)
)
</script>

<style scoped>
.works-view {
    max-width: 1000px;
    margin: auto;
    padding: 24px 10px;
}

.work-card {
    margin-bottom: 16px;
    min-height: 180px;
    position: relative;
    text-align: center;
}

.work-img {
    max-width: 100%;
    height: 120px;
    object-fit: cover;
    margin: 0 auto 10px auto;
}
</style>
