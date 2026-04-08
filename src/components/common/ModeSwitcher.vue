<!-- src/components/common/ModeSwitcher.vue -->
<template>
    <div class="mode-switcher">
      <el-dropdown @command="handleModeSwitch" trigger="click">
        <div class="mode-selector">
          <span class="mode-icon">{{ currentIcon }}</span>
          <span class="mode-name">{{ modeName }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="outpatient" :class="{ active: currentMode === 'outpatient' }">
              <div class="mode-option">
                <span class="option-icon">🏥</span>
                <div class="option-info">
                  <span class="option-name">门诊模式</span>
                  <span class="option-desc">门诊电子病历系统</span>
                </div>
                <el-tag v-if="currentMode === 'outpatient'" size="small" type="success" class="active-tag">当前</el-tag>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="inpatient" :class="{ active: currentMode === 'inpatient' }">
              <div class="mode-option">
                <span class="option-icon">🏥</span>
                <div class="option-info">
                  <span class="option-name">住院模式</span>
                  <span class="option-desc">住院电子病历系统</span>
                </div>
                <el-tag v-if="currentMode === 'inpatient'" size="small" type="primary" class="active-tag">当前</el-tag>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      
      <!-- 切换确认对话框 -->
      <el-dialog 
        v-model="showConfirmDialog" 
        title="切换系统模式" 
        width="420px"
        :close-on-click-modal="false"
      >
        <div class="confirm-content">
          <el-alert 
            :title="`确定切换到${targetModeName}吗？`" 
            type="warning"
            :closable="false"
            show-icon
          >
            <template #default>
              <p style="margin: 8px 0 4px 0;">切换模式后：</p>
              <ul style="margin: 0 0 0 20px; padding: 0;">
                <li>页面将自动刷新</li>
                <li>患者列表显示字段会相应调整</li>
                <li>病历类型会切换</li>
                <li>当前未保存的草稿将丢失</li>
              </ul>
            </template>
          </el-alert>
        </div>
        <template #footer>
          <el-button @click="showConfirmDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmSwitch">确认切换</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { useSystemModeStore } from '@/stores/systemModeStore'
  
  const systemModeStore = useSystemModeStore()
  const { currentMode, modeName, setMode } = systemModeStore
  
  const showConfirmDialog = ref(false)
  const targetMode = ref('')
  
  // 根据当前模式显示不同的图标
  const currentIcon = computed(() => {
    return currentMode.value === 'outpatient' ? '🏥' : '🏥'
  })
  
  const targetModeName = computed(() => {
    return targetMode.value === 'outpatient' ? '门诊模式' : '住院模式'
  })
  
  function handleModeSwitch(command) {
    if (command === currentMode.value) return
    targetMode.value = command
    showConfirmDialog.value = true
  }
  
  function confirmSwitch() {
  // 保存模式到 localStorage
  localStorage.setItem('systemMode', targetMode.value)
  
  // 关闭对话框
  showConfirmDialog.value = false
  
  // 强制刷新页面，所有组件重新初始化时会读取新的模式
  window.location.reload()
}
  </script>
  
  <style scoped>
  .mode-switcher {
    margin-right: 16px;
  }
  
  .mode-selector {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background-color: #f5f7fa;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #e4e7ed;
  }
  
  .mode-selector:hover {
    background-color: #ecf5ff;
    border-color: #409eff;
  }
  
  .mode-icon {
    font-size: 16px;
  }
  
  .mode-name {
    font-size: 13px;
    font-weight: 500;
    color: #303133;
  }
  
  .mode-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
  
  .option-icon {
    font-size: 22px;
  }
  
  .option-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    flex: 1;
  }
  
  .option-name {
    font-weight: 600;
    color: #303133;
    font-size: 14px;
  }
  
  .option-desc {
    font-size: 11px;
    color: #909399;
  }
  
  .active-tag {
    margin-left: auto;
  }
  
  :deep(.el-dropdown-menu__item) {
    padding: 10px 16px;
  }
  
  :deep(.el-dropdown-menu__item.active) {
    background-color: #ecf5ff;
  }
  
  .confirm-content ul {
    margin: 8px 0 0 20px;
    padding: 0;
  }
  
  .confirm-content li {
    font-size: 13px;
    color: #606266;
    line-height: 1.6;
  }
  </style>