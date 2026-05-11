// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// 1. 导入页面组件
import HomeView from '../views/HomeView.vue';
import CultureLibraryView from '../views/CultureLibraryView.vue';
import AiDesignView from '../views/AiDesignView.vue';
import WorksView from '../views/WorksView.vue';
import LoginView from '../views/LoginView.vue';
import ProfileView from '../views/ProfileView.vue';
import FeiyiView from '../views/FeiyiView.vue';
import JiangsuCelebritiesView from '../views/JiangsuCelebritiesView.vue';
import TraditionalArtsView from '../views/TraditionalArtsView.vue';
import IntangibleHeritageView from '../views/IntangibleHeritageView.vue';
import GalleryView from '../views/GalleryView.vue';

// 2. 定义路由规则
const routes = [
    { path: '/', component: HomeView }, // 访问根路径时，显示 HomeView
    { path: '/feiyi', component: FeiyiView }, // 非遗文化页面
    { path: '/culture', component: CultureLibraryView },
    { path: '/design', component: AiDesignView },
    { path: '/works', component: WorksView },
    { path: '/login', component: LoginView }, // 登录页面路由
    {
        path: '/profile',
        component: ProfileView,
        meta: { requiresAuth: true } // 需要登录才能访问
    },
    { path: '/celebrities', component: JiangsuCelebritiesView }, // 江苏历史名人页面
    { path: '/traditional-arts', component: TraditionalArtsView }, // 江苏传统艺术页面
    { path: '/intangible-heritage', component: IntangibleHeritageView }, // 江苏非物质文化遗产页面
    { path: '/gallery', component: GalleryView } // 公共图库页面
];

// 3. 创建并导出路由实例
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

// 4. 添加路由守卫
router.beforeEach((to, from, next) => {
    // 检查是否需要登录
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // 检查是否已登录
        const isLogin = localStorage.getItem('isLogin') === 'true';
        if (!isLogin) {
            // 未登录，重定向到登录页面
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
        } else {
            // 已登录，继续访问
            next();
        }
    } else {
        // 不需要登录的页面，直接访问
        next();
    }
});

export default router;
