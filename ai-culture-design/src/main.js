import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// 引入 Element Plus（保留原有的）
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 引入图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 引入 Ant Design Vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

const app = createApp(App);

// 注册图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

app.use(router)
    .use(ElementPlus)  // 保留 Element Plus
    .use(Antd)         // 添加 Ant Design Vue
    .mount('#app');