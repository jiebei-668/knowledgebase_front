import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import '@arco-design/web-vue/dist/arco.css';
import router from './router'
import pinia from '@/stores'
// 额外引入图标库
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import '@arco-design/web-vue/dist/arco.css';

// 导入全局scss主文件
import '@/styles/index.scss'

const app = createApp(App);
app.use(ArcoVue)
// 路由
app.use(router)
// 状态管理
app.use(pinia)
// 额外引入arcodesign 图标库
app.use(ArcoVueIcon);
app.mount('#app');
