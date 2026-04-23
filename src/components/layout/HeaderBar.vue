<!-- src/components/layout/HeaderBar.vue -->
<template>
    <div class="header-bar">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      
      <div class="header-right">
        <!-- 显示当前登录用户信息 -->
        <el-dropdown @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="32" :src="userAvatar" />
            <span class="username">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 退出按钮 -->
        <el-button 
          type="danger" 
          plain 
          size="small" 
          @click="handleLogout"
          class="logout-btn"
        >
          <el-icon><SwitchButton /></el-icon>
          退出
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ArrowDown, User, Setting, SwitchButton } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/stores/userStore'
  
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  
  // 从 store 获取用户名
const userName = computed(() => {
  // 优先从 store 获取
  if (userStore.userInfo?.name) {
    return userStore.userInfo.name
  }
  // 如果 store 中没有，从 localStorage 读取 emr_user
  const emrUser = JSON.parse(localStorage.getItem('emr_user') || '{}')
  return emrUser.name || '未知用户'
})
  
  const userAvatar = computed(() => {
    return userStore.userInfo?.avatar || 
           'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  })
  
  const currentRoute = computed(() => {
    const routeMap = {
      '/dashboard': '工作台',
      '/patients': '患者列表',
      '/emr-editor': '病历书写',
      '/data-reference': '数据引用',
      '/template-library': '模板库'
    }
    return routeMap[route.path] || ''
  })
  
  // 处理下拉菜单命令
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
  
  // 退出登录
  function handleLogout() {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 调用 store 的退出方法
      userStore.logout()
      
      // 跳转到登录页
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
  }
  
  .header-left {
    flex: 1;
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
    cursor: pointer;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    border-radius: 20px;
    transition: background-color 0.3s;
  }
  
  .user-info:hover {
    background-color: #f5f7fa;
  }
  
  .username {
    font-size: 14px;
    color: #333;
    font-weight: 500;
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .logout-btn {
    margin-left: 10px;
  }
  
  :deep(.el-dropdown-menu__item) {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  </style>