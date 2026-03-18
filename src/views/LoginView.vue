<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-1"></div>
      <div class="decoration-2"></div>
      <div class="decoration-3"></div>
    </div>
    
    <el-card class="login-card" :body-style="{ padding: 0 }" shadow="xl">
      <div class="card-content">
        <!-- Logo区域 - 修改了图标为文件图标 -->
        <div class="logo-area">
          <div class="logo-icon">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- 文件主体 -->
              <path d="M4 4H15L19 8V20H4V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- 文件折角 -->
              <path d="M15 4L19 8H15V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <!-- 文件上的文字横线（代表病历内容） -->
              <path d="M8 10H16M8 13H14M8 16H12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <h1 class="title">电子病历智能书写系统</h1>
          <p class="subtitle">Electronic Medical Record System</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          @submit.prevent="handleLogin"
          class="login-form"
        >
          <el-form-item prop="username">
            <template #label>
              <span class="field-label">用户名</span>
            </template>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入医生账号"
              :prefix-icon="User"
              size="large"
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <template #label>
              <span class="field-label">密码</span>
            </template>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-button"
              size="large"
              native-type="submit"
              :disabled="loading"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部信息 - 移除 Shield 图标 -->
        <div class="footer-info">
          <el-divider>
            <el-icon><Lock /></el-icon>
          </el-divider>
          <p class="footer-text">医院电子病历系统前端模拟环境</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'  // 只导入存在的图标
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

async function handleLogin() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 保存用户信息
        const userData = {
          name: loginForm.username,
          username: loginForm.username
        }
        localStorage.setItem('emr_user', JSON.stringify(userData))
        localStorage.setItem('isLoggedIn', 'true')
        
        // 更新 store
        userStore.setUserInfo(userData)
        
        ElMessage.success(`欢迎回来，${loginForm.username}`)
        router.push('/dashboard')
      } catch (error) {
        ElMessage.error('登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.decoration-1 {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(64, 158, 255, 0.05) 100%);
}

.decoration-2 {
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 384px;
  height: 384px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0.05) 100%);
}

.decoration-3 {
  position: absolute;
  top: 33.33%;
  left: 25%;
  width: 256px;
  height: 256px;
  border-radius: 50%;
  background: rgba(144, 147, 153, 0.03);
}

.login-card {
  width: 100%;
  max-width: 420px;
  margin: 0 16px;
  border: none;
  border-radius: 16px;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.card-content {
  padding: 40px 32px 32px;
}

/* Logo区域 */
.logo-area {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(64, 158, 255, 0.1);
  margin-bottom: 16px;
  color: #409eff;
}

.logo-icon .icon {
  width: 32px;
  height: 32px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.subtitle {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

/* 登录表单 */
.login-form {
  margin-bottom: 24px;
}

.field-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 4px;
  display: block;
}

.custom-input :deep(.el-input__wrapper) {
  height: 44px;
  border-radius: 8px;
}

.custom-input :deep(.el-input__inner) {
  height: 44px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  border-radius: 8px;
}

/* 底部信息 */
.footer-info {
  margin-top: 20px;
}

.footer-info :deep(.el-divider) {
  margin: 20px 0 16px;
}

.footer-info :deep(.el-divider__text) {
  padding: 0 12px;
  background-color: transparent;
  color: #909399;
}

.footer-text {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
</style>