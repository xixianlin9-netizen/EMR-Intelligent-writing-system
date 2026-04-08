// src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 导入所有 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import storageService from './services/storageService'
import './styles.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化本地存储数据，完成后挂载应用
storageService.initializeData().then(async () => {
    console.log('本地存储数据初始化完成')
    
    // 初始化 referenceStore 数据
    const { useReferenceStore } = await import('@/stores/referenceStore')
    const referenceStore = useReferenceStore()
    referenceStore.loadMockData()
    
    app.mount('#app')
}).catch(err => {
    console.error('数据初始化失败:', err)
    app.mount('#app')
})