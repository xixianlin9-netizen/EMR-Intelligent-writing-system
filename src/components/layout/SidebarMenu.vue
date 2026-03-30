<!-- src/components/layout/SidebarMenu.vue -->
<template>
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      :collapse="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409eff"
      :unique-opened="true"
      :router="true"  
    >
      <div class="logo-container">
        <h3 class="logo-text">EMR智能书写系统</h3>
        <!-- <h8 class="logo-text">Electronic Medical Record Intelligent Writing System</h8> -->
      </div>
      
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
        <el-icon><DataLine /></el-icon>
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
  </template>
  
  <script setup>
  // 在现有的 import 后面添加这一行
  import { DocumentChecked } from '@element-plus/icons-vue'
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Odometer, User, Document, DataLine, Files } from '@element-plus/icons-vue'
  
  const route = useRoute()
  const activeMenu = computed(() => route.path)
  </script>
  
  <style scoped>
  .sidebar-menu {
    border-right: none;
    height: 100%;
  }
  
  .logo-container {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid #1f2d3d;
  }
  
  .logo-text {
    color: #fff;
    font-size: 18px;
    margin: 0;
    font-weight: 600;
  }
  
  :deep(.el-menu-item) {
    padding-left: 20px !important;
  }
  
  :deep(.el-menu-item.is-active) {
    background-color: #1f2d3d !important;
  }
  </style>