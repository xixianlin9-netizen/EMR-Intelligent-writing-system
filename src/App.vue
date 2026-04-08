<!-- src/App.vue -->
<template>
  <el-config-provider :locale="zhCn">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedViews">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { watch } from 'vue'
import { useRoute } from 'vue-router'


const route = useRoute()
const cachedViews = ['DashboardView', 'PatientListView', 'EMREditorView', 'DataReferenceView', 'TemplateLibraryView']

// 监听路由变化，处理特殊情况
watch(() => route.path, (newPath) => {
  console.log('路由变化:', newPath)
})
</script>