<!-- src/components/common/ModeSwitcher.vue -->
<template>
    <div class="mode-switcher">
      <el-dropdown @command="handleModeSwitch" trigger="click">
        <div class="mode-selector">
          <span class="mode-icon">{{ currentIcon }}</span>
          <span class="mode-name">{{ modeName }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="mode-dropdown-menu">
            <el-dropdown-item command="outpatient" :class="{ active: currentMode === 'outpatient' }">
              <div class="mode-option">
                <div class="option-icon outpatient-icon">🏥</div>
                <div class="option-info">
                  <span class="option-name">门诊模式</span>
                  <span class="option-desc">门诊电子病历系统</span>
                </div>
                <el-tag v-if="currentMode === 'outpatient'" size="small" type="success" class="active-tag">当前</el-tag>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="inpatient" :class="{ active: currentMode === 'inpatient' }">
              <div class="mode-option">
                <div class="option-icon inpatient-icon">🏥</div>
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
        width="440px"
        :close-on-click-modal="false"
        class="mode-confirm-dialog"
      >
        <div class="confirm-content">
          <div class="confirm-icon">
            <div class="icon-circle">
              <el-icon :size="32" color="#e6a23c"><WarningFilled /></el-icon>
            </div>
          </div>
          <div class="confirm-title">{{ targetModeName }}切换确认</div>
          <div class="confirm-message">
            确定要切换到{{ targetModeName }}吗？切换模式后：
          </div>
          <ul class="confirm-list">
            <li><el-icon><RefreshRight /></el-icon> 页面将自动刷新</li>
            <li><el-icon><List /></el-icon> 患者列表显示字段会相应调整</li>
            <li><el-icon><Document /></el-icon> 病历类型会切换</li>
            <li><el-icon><Warning /></el-icon> 当前未保存的草稿将丢失</li>
          </ul>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showConfirmDialog = false" size="large">取消</el-button>
            <el-button type="primary" @click="confirmSwitch" size="large">确认切换</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { ArrowDown, WarningFilled, RefreshRight, List, Document, Warning } from '@element-plus/icons-vue'
  import { useSystemModeStore } from '@/stores/systemModeStore'
  
  const systemModeStore = useSystemModeStore()
  const { currentMode, modeName, setMode } = systemModeStore
  
  const showConfirmDialog = ref(false)
  const targetMode = ref('')
  
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
    localStorage.setItem('systemMode', targetMode.value)
    showConfirmDialog.value = false
    window.location.reload()
  }
  </script>
  
  <style scoped>
  .mode-switcher {
    margin-right: 8px;
  }
  
  .mode-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: #f5f7fa;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid #e4e9f0;
  }
  
  .mode-selector:hover {
    background: #eef2f7;
    border-color: #409eff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
  }
  
  .mode-icon {
    font-size: 18px;
    color: #2c3e50;
  }
  
  .mode-name {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
  }
  
  .dropdown-icon {
    font-size: 14px;
    color: #8ba3c4;
    transition: transform 0.25s ease;
  }
  
  .mode-selector:hover .dropdown-icon {
    transform: rotate(180deg);
  }
  
  /* 下拉菜单样式 */
  .mode-dropdown-menu {
    border-radius: 12px;
    padding: 8px;
    min-width: 240px;
    box-shadow: 0 12px 28px rgba(31, 45, 61, 0.15);
    border: none;
  }
  
  :deep(.mode-dropdown-menu .el-dropdown-menu__item) {
    padding: 10px 12px;
    border-radius: 8px;
    margin: 4px 0;
    transition: all 0.2s ease;
  }
  
  :deep(.mode-dropdown-menu .el-dropdown-menu__item:hover) {
    background-color: #eef2f7;
  }
  
  :deep(.mode-dropdown-menu .el-dropdown-menu__item.active) {
    background: linear-gradient(135deg, #eef2f7, #e4e9f0);
  }
  
  .mode-option {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
  }
  
  .option-icon {
    font-size: 28px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }
  
  .option-icon.outpatient-icon {
    background: rgba(64, 158, 255, 0.1);
  }
  
  .option-icon.inpatient-icon {
    background: rgba(103, 194, 58, 0.1);
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
    color: #2c3e50;
    font-size: 14px;
  }
  
  .option-desc {
    font-size: 11px;
    color: #6c8aae;
  }
  
  .active-tag {
    margin-left: auto;
    border-radius: 20px;
    padding: 4px 10px;
  }
  
  /* 确认对话框样式 */
  .confirm-content {
    text-align: center;
  }
  
  .icon-circle {
    width: 64px;
    height: 64px;
    background: rgba(230, 162, 60, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  
  .confirm-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 12px;
  }
  
  .confirm-message {
    font-size: 14px;
    color: #4a627a;
    margin-bottom: 16px;
  }
  
  .confirm-list {
    list-style: none;
    padding: 0;
    margin: 0;
    text-align: left;
    background: #f8f9fc;
    border-radius: 12px;
    padding: 16px;
  }
  
  .confirm-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 0;
    font-size: 13px;
    color: #4a627a;
    border-bottom: 1px solid #eef2f7;
  }
  
  .confirm-list li:last-child {
    border-bottom: none;
  }
  
  .confirm-list li .el-icon {
    color: #e6a23c;
    font-size: 16px;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  </style>