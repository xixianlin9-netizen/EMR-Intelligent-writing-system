<!-- src/components/layout/DoctorLayout.vue -->
<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <SidebarMenu />
    </el-aside>
    <el-container>
      <el-header>
        <HeaderBar />
      </el-header>
      <el-main>
        <!-- 添加 :key="$route.fullPath" 强制重新渲染 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import SidebarMenu from './SidebarMenu.vue'
import HeaderBar from './HeaderBar.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100%;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
}

.el-aside {
  background-color: #304156;
  color: #fff;
  height: 100vh;
  overflow-y: auto;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>