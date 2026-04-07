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
        <!-- Logo区域 -->
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

        <!-- 标签页切换（登录/注册） -->
        <el-tabs v-model="activeTab" class="auth-tabs" stretch>
          <el-tab-pane label="登录" name="login">
            <template #label>
              <span class="tab-label">
                <el-icon><User /></el-icon>
                登录
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <template #label>
              <span class="tab-label">
                <el-icon><Edit /></el-icon>
                注册
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>

        <!-- 登录表单 -->
        <el-form
          v-if="activeTab === 'login'"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          @submit.prevent="handleLogin"
          class="auth-form"
        >
          <el-form-item prop="username">
            <span class="field-label">用户名</span>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入医生账号"
              :prefix-icon="User"
              size="large"
              class="custom-input"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <span class="field-label">密码</span>
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
          
          <!-- 辅助功能区域：重置密码 -->
          <div class="form-helper">
            <span></span>
            <el-button 
              type="primary" 
              link 
              class="helper-link"
              @click="showResetDialog = true"
            >
              <el-icon><Key /></el-icon>
              重置密码
            </el-button>
          </div>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="auth-button"
              size="large"
              native-type="submit"
              :disabled="loading"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-if="activeTab === 'register'"
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          @submit.prevent="handleRegister"
          class="auth-form"
        >
          <el-form-item prop="username">
            <span class="field-label">用户名</span>
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名（2-20个字符）"
              :prefix-icon="User"
              size="large"
              class="custom-input"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="realName">
            <span class="field-label">真实姓名</span>
            <el-input
              v-model="registerForm.realName"
              placeholder="请输入真实姓名"
              :prefix-icon="UserFilled"
              size="large"
              class="custom-input"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="department">
            <span class="field-label">科室</span>
            <el-select
              v-model="registerForm.department"
              placeholder="请选择科室"
              size="large"
              class="custom-select"
              clearable
            >
              <el-option label="呼吸内科" value="呼吸内科" />
              <el-option label="心血管内科" value="心血管内科" />
              <el-option label="消化内科" value="消化内科" />
              <el-option label="神经内科" value="神经内科" />
              <el-option label="内分泌科" value="内分泌科" />
              <el-option label="骨科" value="骨科" />
              <el-option label="普外科" value="普外科" />
              <el-option label="妇产科" value="妇产科" />
              <el-option label="儿科" value="儿科" />
              <el-option label="急诊科" value="急诊科" />
            </el-select>
          </el-form-item>
          
          <el-form-item prop="password">
            <span class="field-label">密码</span>
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（6-20个字符）"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <span class="field-label">确认密码</span>
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="custom-input"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              :loading="registering"
              class="auth-button"
              size="large"
              native-type="submit"
              :disabled="registering"
            >
              {{ registering ? '注册中...' : '注 册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 底部信息 -->
        <div class="footer-info">
          <el-divider>
            <el-icon><Lock /></el-icon>
          </el-divider>
          <p class="footer-text">医院电子病历系统前端模拟环境</p>
          <p class="footer-tip">演示账号：张医生  密码：123456</p>
        </div>
      </div>
    </el-card>

    <!-- 重置密码对话框 -->
    <el-dialog 
      v-model="showResetDialog" 
      title="重置密码" 
      width="420px"
      :close-on-click-modal="false"
      class="reset-dialog"
    >
      <div class="dialog-content">
        <div class="demo-hint">
          <el-alert 
            title="演示环境提示" 
            type="info" 
            :closable="false"
            show-icon
          >
            <template #default>
              <p>本系统为毕业设计演示环境，暂无后端服务支持。</p>
              <p>重置密码功能仅作前端模拟演示，不会实际修改密码。</p>
              <p>演示版统一登录密码为：<strong>123456</strong></p>
            </template>
          </el-alert>
        </div>
        
        <el-form :model="resetForm" label-width="80px" class="reset-form">
          <el-form-item label="用户名" required>
            <el-input 
              v-model="resetForm.username" 
              placeholder="请输入要重置密码的用户名"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item label="新密码" required>
            <el-input 
              v-model="resetForm.newPassword" 
              type="password" 
              placeholder="请输入新密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" required>
            <el-input 
              v-model="resetForm.confirmPassword" 
              type="password" 
              placeholder="请再次输入新密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showResetDialog = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Edit, Key, UserFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 标签页状态
const activeTab = ref('login')

// 表单引用
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 加载状态
const loading = ref(false)
const registering = ref(false)
const showResetDialog = ref(false)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  username: '',
  realName: '',
  department: '',
  password: '',
  confirmPassword: ''
})

// 重置密码表单
const resetForm = reactive({
  username: '',
  newPassword: '',
  confirmPassword: ''
})

// 从 localStorage 加载已注册用户列表
const getRegisteredUsers = () => {
  const users = localStorage.getItem('registeredUsers')
  return users ? JSON.parse(users) : []
}

// 保存注册用户到 localStorage
const saveRegisteredUser = (user) => {
  const users = getRegisteredUsers()
  // 检查用户名是否已存在
  if (users.find(u => u.username === user.username)) {
    return false
  }
  users.push(user)
  localStorage.setItem('registeredUsers', JSON.stringify(users))
  return true
}

// 验证用户登录
const validateUser = (username, password) => {
  // 先检查注册用户
  const users = getRegisteredUsers()
  const registeredUser = users.find(u => u.username === username && u.password === password)
  if (registeredUser) {
    return registeredUser
  }
  
  // 演示账号支持（任意用户名 + 123456）
  if (password === '123456') {
    return {
      username: username,
      name: username,
      role: 'doctor',
      department: '演示科室'
    }
  }
  
  return null
}

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2-20个字符之间', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const users = getRegisteredUsers()
        if (users.find(u => u.username === value)) {
          callback(new Error('用户名已存在，请使用其他用户名'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2-10个字符之间', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 登录处理
async function handleLogin() {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 验证用户
        const userData = validateUser(loginForm.username, loginForm.password)
        
        if (!userData) {
          ElMessage.error('用户名或密码错误')
          loading.value = false
          return
        }
        
        // 保存用户信息
        const userInfo = {
          name: userData.name || userData.username,
          username: userData.username,
          realName: userData.realName || userData.name || userData.username,
          department: userData.department || '呼吸内科',
          loginTime: new Date().toISOString()
        }
        
        localStorage.setItem('emr_user', JSON.stringify(userInfo))
        localStorage.setItem('isLoggedIn', 'true')
        
        // 更新 store
        userStore.setUserInfo(userInfo)
        
        ElMessage.success(`欢迎回来，${userInfo.realName}`)
        router.push('/dashboard')
      } catch (error) {
        ElMessage.error('登录失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 注册处理
async function handleRegister() {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registering.value = true
      try {
        // 模拟注册延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 保存用户信息
        const userData = {
          username: registerForm.username,
          realName: registerForm.realName,
          department: registerForm.department,
          password: registerForm.password,
          registerTime: new Date().toISOString(),
          role: 'doctor'
        }
        
        const success = saveRegisteredUser(userData)
        
        if (!success) {
          ElMessage.error('用户名已存在')
          registering.value = false
          return
        }
        
        ElMessage.success('注册成功，请登录')
        
        // 清空注册表单
        registerForm.username = ''
        registerForm.realName = ''
        registerForm.department = ''
        registerForm.password = ''
        registerForm.confirmPassword = ''
        
        // 切换到登录标签页
        activeTab.value = 'login'
        
      } catch (error) {
        ElMessage.error('注册失败，请重试')
      } finally {
        registering.value = false
      }
    }
  })
}

// 重置密码
function handleResetPassword() {
  if (!resetForm.username) {
    ElMessage.warning('请输入用户名')
    return
  }
  if (!resetForm.newPassword || resetForm.newPassword.length < 6) {
    ElMessage.warning('新密码长度不能少于6位')
    return
  }
  if (resetForm.newPassword !== resetForm.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }
  
  // 检查用户是否存在
  const users = getRegisteredUsers()
  const userIndex = users.findIndex(u => u.username === resetForm.username)
  
  if (userIndex === -1) {
    ElMessage.warning('该用户不存在，请先注册')
    return
  }
  
  // 更新密码
  users[userIndex].password = resetForm.newPassword
  localStorage.setItem('registeredUsers', JSON.stringify(users))
  
  ElMessage.success('密码重置成功，请使用新密码登录')
  
  showResetDialog.value = false
  resetForm.username = ''
  resetForm.newPassword = ''
  resetForm.confirmPassword = ''
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
  max-width: 460px;
  margin: 0 16px;
  border: none;
  border-radius: 16px;
  position: relative;
  z-index: 10;
  overflow: hidden;
  background-color: #ffffff;
}

.card-content {
  padding: 32px 32px 32px;
}

/* Logo区域 */
.logo-area {
  text-align: center;
  margin-bottom: 24px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(64, 158, 255, 0.1);
  margin-bottom: 12px;
  color: #409eff;
}

.logo-icon .icon {
  width: 28px;
  height: 28px;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.subtitle {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

/* 标签页样式 */
.auth-tabs {
  margin-bottom: 20px;
}

.auth-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.auth-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

/* 表单样式 */
.auth-form {
  margin-bottom: 20px;
}

.auth-form .el-form-item {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 6px;
  text-align: left;
}

/* 统一输入框样式 */
.custom-input {
  width: 100%;
}

.custom-input :deep(.el-input__wrapper) {
  width: 100%;
  height: 42px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.2s;
}

.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.custom-input :deep(.el-input__inner) {
  height: 42px;
  line-height: 42px;
}

/* 下拉选择框样式 */
.custom-select {
  width: 100%;
}

.custom-select :deep(.el-input__wrapper) {
  height: 42px;
  border-radius: 8px;
}

/* 辅助功能区域 */
.form-helper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 18px;
  font-size: 12px;
}

.helper-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  font-size: 12px;
}

/* 认证按钮 */
.auth-button {
  width: 100%;
  height: 42px;
  font-size: 15px;
  font-weight: 500;
  margin-top: 6px;
  border-radius: 8px;
  background-color: #409eff;
  border-color: #409eff;
  transition: all 0.2s;
}

.auth-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

/* 底部信息 */
.footer-info {
  margin-top: 16px;
}

.footer-info :deep(.el-divider) {
  margin: 16px 0 12px;
}

.footer-info :deep(.el-divider__text) {
  padding: 0 10px;
  background-color: transparent;
  color: #909399;
}

.footer-text {
  text-align: center;
  color: #909399;
  font-size: 11px;
  margin: 0 0 6px 0;
}

.footer-tip {
  text-align: center;
  color: #c0c4cc;
  font-size: 10px;
  margin: 0;
}

/* 重置密码对话框样式 */
.reset-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 15px;
}

.reset-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.demo-hint {
  margin-bottom: 20px;
}

.demo-hint p {
  margin: 5px 0;
  font-size: 13px;
  line-height: 1.6;
}

.demo-hint strong {
  color: #409eff;
}

.reset-form .el-form-item {
  margin-bottom: 18px;
}

.reset-form :deep(.el-input__wrapper) {
  height: 40px;
  border-radius: 8px;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .login-container {
    background-color: #1e1e1e;
  }
  
  .login-card {
    background-color: #2a2a2a;
  }
  
  .title {
    color: #e5e5e5;
  }
  
  .subtitle {
    color: #808080;
  }
  
  .field-label {
    color: #a0a0a0;
  }
  
  .footer-text {
    color: #808080;
  }
  
  .footer-tip {
    color: #666;
  }
  
  .custom-input :deep(.el-input__wrapper) {
    background-color: #333;
    box-shadow: 0 0 0 1px #444 inset;
  }
  
  .custom-input :deep(.el-input__inner) {
    color: #e5e5e5;
    background-color: #333;
  }
  
  .custom-input :deep(.el-input__inner::placeholder) {
    color: #666;
  }
  
  .custom-select :deep(.el-input__wrapper) {
    background-color: #333;
  }
  
  .reset-dialog :deep(.el-dialog) {
    background-color: #2a2a2a;
  }
  
  .reset-dialog :deep(.el-dialog__title) {
    color: #e5e5e5;
  }
}
</style>