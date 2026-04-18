<!-- src/components/layout/SidebarMenu.vue -->
<template>
  <div class="sidebar">
    <div class="logo-area">
      <div class="logo-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H15L19 8V20H4V4Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="rgba(255,255,255,0.1)"/>
          <path d="M15 4L19 8H15V4Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 10H16M8 13H14M8 16H12" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-title">EMR系统</span>
        <span class="logo-subtitle">智能电子病历</span>
      </div>
    </div>
    
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="false"
      background-color="#1f2d3d"
      text-color="#8ba3c4"
      active-text-color="#409eff"
      :unique-opened="true"
      :router="true"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <span>工作台</span>
      </el-menu-item>
      
      <el-menu-item index="/patients">
        <el-icon><User /></el-icon>
        <span>患者列表</span>
      </el-menu-item>
      
      <el-menu-item index="/emr-editor">
        <el-icon><Document /></el-icon>
        <span>病历书写</span>
      </el-menu-item>
      
      <el-menu-item index="/data-reference">
        <el-icon><DataAnalysis /></el-icon>
        <span>数据引用</span>
      </el-menu-item>
      
      <el-menu-item index="/template-library">
        <el-icon><Files /></el-icon>
        <span>模板库</span>
      </el-menu-item>
      
      <el-menu-item index="/quality">
        <el-icon><DocumentChecked /></el-icon>
        <span>病历质控</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Odometer, User, Document, DataAnalysis, Files, DocumentChecked } from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.sidebar {
  height: 100%;
  background: linear-gradient(180deg, #1f2d3d 0%, #16202c 100%);
  display: flex;
  flex-direction: column;
}

.logo-area {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 16px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff, #2b6cb0);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.logo-subtitle {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.5px;
}

.sidebar-menu {
  border-right: none;
  background: transparent !important;
  flex: 1;
}

.sidebar-menu .el-menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.25s ease;
}

.sidebar-menu .el-menu-item:hover {
  background: rgba(64, 158, 255, 0.12) !important;
  transform: translateX(4px);
}

.sidebar-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #409eff, #3a8ee6) !important;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.sidebar-menu .el-menu-item.is-active .el-icon {
  color: white;
}
</style>