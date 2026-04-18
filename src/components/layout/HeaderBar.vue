<template>
  <div class="header-bar">
    <div class="header-left">
      <div class="breadcrumb-wrapper">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>
    
    <div class="header-right">
      <!-- 模式切换器 -->
      <ModeSwitcher />
      
      <!-- 消息通知 -->
      <el-badge :value="notificationCount" :hidden="notificationCount === 0" class="notification-badge">
        <el-button circle :icon="Bell" class="icon-btn" />
      </el-badge>
      
      <!-- 用户信息 -->
      <el-dropdown @command="handleCommand" class="user-dropdown">
        <div class="user-info">
          <el-avatar :size="36" :src="userAvatar" class="user-avatar" />
          <div class="user-details">
            <span class="username">{{ userName }}</span>
            <span class="user-role">主治医师</span>
          </div>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon> 个人资料
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <el-icon><Setting /></el-icon> 系统设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, User, Setting, SwitchButton, HomeFilled, Bell } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/userStore'
import { useSystemModeStore } from '@/stores/systemModeStore'
import ModeSwitcher from '@/components/common/ModeSwitcher.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const notificationCount = ref(3)
const userName = computed(() => userStore.userInfo?.name || '张医生')
const userAvatar = computed(() => 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const currentRoute = computed(() => {
  const routeMap = {
    '/dashboard': '工作台',
    '/patients': '患者列表',
    '/emr-editor': '病历书写',
    '/data-reference': '数据引用',
    '/template-library': '模板库',
    '/quality': '病历质控'
  }
  return routeMap[route.path] || ''
})

function handleCommand(command) {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料开发中')
      break
    case 'settings':
      ElMessage.info('设置开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}
</script>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0 24px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  flex: 1;
}

.breadcrumb-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-wrapper :deep(.el-breadcrumb) {
  font-size: 14px;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.breadcrumb-wrapper :deep(.el-breadcrumb__inner .el-icon) {
  font-size: 16px;
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  background: #f5f7fa;
  border: none;
  transition: all 0.25s ease;
}

.icon-btn:hover {
  background: #ecf5ff;
  color: #409eff;
  transform: scale(1.05);
}

.notification-badge :deep(.el-badge__content) {
  border: none;
  background: linear-gradient(135deg, #f56c6c, #e85d5d);
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 40px;
  transition: all 0.25s ease;
  background: #f5f7fa;
}

.user-info:hover {
  background: #ecf5ff;
  transform: translateY(-1px);
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.user-role {
  font-size: 11px;
  color: #909399;
}

.arrow-icon {
  font-size: 14px;
  color: #909399;
  transition: transform 0.25s ease;
}

.user-info:hover .arrow-icon {
  transform: rotate(180deg);
}
</style>