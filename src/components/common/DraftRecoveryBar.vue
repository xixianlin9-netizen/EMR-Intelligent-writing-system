<!-- src/components/common/DraftRecoveryBar.vue -->
<template>
    <Transition name="slide-down">
      <div v-if="visible" class="draft-recovery-bar" :class="typeClass">
        <div class="recovery-content">
          <!-- 图标区域 -->
          <div class="recovery-icon">
            <el-icon :size="20" v-if="type === 'info'">
              <InfoFilled />
            </el-icon>
            <el-icon :size="20" v-else-if="type === 'success'">
              <SuccessFilled />
            </el-icon>
            <el-icon :size="20" v-else-if="type === 'warning'">
              <WarningFilled />
            </el-icon>
            <el-icon :size="20" v-else-if="type === 'error'">
              <CircleCloseFilled />
            </el-icon>
          </div>
          
          <!-- 消息内容 -->
          <div class="recovery-message">
            <span class="message-title">{{ title }}</span>
            <span class="message-desc">{{ message }}</span>
            
            <!-- 草稿详情（如果有） -->
            <div v-if="draftInfo" class="draft-info">
              <el-tag size="small" type="info" effect="plain">
                最后编辑: {{ draftInfo.lastEditTime }}
              </el-tag>
              <el-tag size="small" type="info" effect="plain">
                字数: {{ draftInfo.wordCount }}
              </el-tag>
              <el-tag 
                v-if="draftInfo.patientName" 
                size="small" 
                type="info" 
                effect="plain"
              >
                患者: {{ draftInfo.patientName }}
              </el-tag>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="recovery-actions">
            <el-button 
              v-if="showRestore"
              type="primary" 
              size="small" 
              @click="handleRestore"
              :loading="restoring"
            >
              <el-icon class="button-icon"><Refresh /></el-icon>
              恢复草稿
            </el-button>
            
            <el-button 
              v-if="showIgnore"
              size="small" 
              @click="handleIgnore"
            >
              <el-icon class="button-icon"><Close /></el-icon>
              忽略
            </el-button>
            
            <el-button 
              v-if="showSave"
              type="success" 
              size="small" 
              @click="handleSave"
              :loading="saving"
            >
              <el-icon class="button-icon"><Check /></el-icon>
              保存当前
            </el-button>
            
            <el-button 
              v-if="showClear"
              size="small" 
              type="danger" 
              @click="handleClear"
            >
              <el-icon class="button-icon"><Delete /></el-icon>
              清除草稿
            </el-button>
            
            <el-button 
              v-if="showClose"
              size="small" 
              text 
              @click="handleClose"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </div>
        
        <!-- 进度条（可选，用于显示自动保存倒计时） -->
        <div v-if="showProgress" class="recovery-progress">
          <el-progress 
            :percentage="progress" 
            :show-text="false" 
            :stroke-width="2"
            :color="progressColor"
          />
        </div>
      </div>
    </Transition>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import {
    InfoFilled,
    SuccessFilled,
    WarningFilled,
    CircleCloseFilled,
    Refresh,
    Close,
    Check,
    Delete
  } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'info'
    },
    title: {
      type: String,
      default: '检测到未保存的草稿'
    },
    message: {
      type: String,
      default: '您有未保存的病历草稿，是否恢复？'
    },
    draftInfo: {
      type: Object,
      default: null
    },
    showRestore: {
      type: Boolean,
      default: true
    },
    showIgnore: {
      type: Boolean,
      default: true
    },
    showSave: {
      type: Boolean,
      default: false
    },
    showClear: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    autoHide: {
      type: Number,
      default: 0
    },
    draggable: {
      type: Boolean,
      default: false
    }
  })
  
  const emit = defineEmits([
    'restore',
    'ignore',
    'save',
    'clear',
    'close',
    'update:visible'
  ])
  
  // 状态
  const restoring = ref(false)
  const saving = ref(false)
  const progress = ref(0)
  const progressInterval = ref(null)
  
  // 根据类型返回对应的样式类
  const typeClass = computed(() => `recovery-bar-${props.type}`)
  
  // 进度条颜色
  const progressColor = computed(() => {
    const colors = {
      info: '#909399',
      success: '#67c23a',
      warning: '#e6a23c',
      error: '#f56c6c'
    }
    return colors[props.type] || colors.info
  })
  
  // 处理恢复
  async function handleRestore() {
    restoring.value = true
    try {
      await emit('restore')
      ElMessage.success('草稿恢复成功')
      handleClose()
    } catch (error) {
      ElMessage.error('恢复失败，请重试')
    } finally {
      restoring.value = false
    }
  }
  
  // 处理忽略
  function handleIgnore() {
    ElMessageBox.confirm('确定忽略草稿吗？忽略后将无法恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      emit('ignore')
      handleClose()
      ElMessage.info('已忽略草稿')
    }).catch(() => {})
  }
  
  // 处理保存
  async function handleSave() {
    saving.value = true
    try {
      await emit('save')
      ElMessage.success('保存成功')
      handleClose()
    } catch (error) {
      ElMessage.error('保存失败，请重试')
    } finally {
      saving.value = false
    }
  }
  
  // 处理清除
  function handleClear() {
    ElMessageBox.confirm('确定清除草稿吗？此操作不可撤销', '警告', {
      confirmButtonText: '确定清除',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      emit('clear')
      handleClose()
      ElMessage.success('草稿已清除')
    }).catch(() => {})
  }
  
  // 处理关闭
  function handleClose() {
    emit('update:visible', false)
    emit('close')
    stopProgress()
  }
  
  // 开始进度条
  function startProgress(duration = 30000) {
    if (!props.showProgress) return
    
    progress.value = 0
    const step = 100 / (duration / 100)
    
    progressInterval.value = setInterval(() => {
      progress.value = Math.min(progress.value + step, 100)
      if (progress.value >= 100) {
        stopProgress()
      }
    }, 100)
  }
  
  // 停止进度条
  function stopProgress() {
    if (progressInterval.value) {
      clearInterval(progressInterval.value)
      progressInterval.value = null
    }
  }
  
  // 自动隐藏
  let autoHideTimer = null
  
  function startAutoHide() {
    if (props.autoHide > 0) {
      autoHideTimer = setTimeout(() => {
        handleClose()
      }, props.autoHide)
    }
  }
  
  function clearAutoHide() {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
      autoHideTimer = null
    }
  }
  
  // 监听visible变化
  watch(() => props.visible, (val) => {
    if (val) {
      startAutoHide()
      if (props.showProgress) {
        startProgress()
      }
    } else {
      clearAutoHide()
      stopProgress()
    }
  })
  
  // 清理
  onUnmounted(() => {
    clearAutoHide()
    stopProgress()
  })
  </script>
  
  <style scoped>
  .draft-recovery-bar {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    min-width: 600px;
    max-width: 800px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    overflow: hidden;
    border-left: 4px solid;
    transition: all 0.3s ease;
  }
  
  /* 类型样式 - 边框颜色 */
  .recovery-bar-info {
    border-left-color: #909399;
  }
  
  .recovery-bar-success {
    border-left-color: #67c23a;
  }
  
  .recovery-bar-warning {
    border-left-color: #e6a23c;
  }
  
  .recovery-bar-error {
    border-left-color: #f56c6c;
  }
  
  /* 类型样式 - 图标颜色 */
  .recovery-bar-info .recovery-icon {
    color: #909399;
  }
  
  .recovery-bar-success .recovery-icon {
    color: #67c23a;
  }
  
  .recovery-bar-warning .recovery-icon {
    color: #e6a23c;
  }
  
  .recovery-bar-error .recovery-icon {
    color: #f56c6c;
  }
  
  .recovery-content {
    display: flex;
    align-items: flex-start;
    padding: 16px 20px;
    gap: 16px;
  }
  
  .recovery-icon {
    flex-shrink: 0;
  }
  
  .recovery-message {
    flex: 1;
    min-width: 0;
  }
  
  .message-title {
    font-weight: 600;
    font-size: 16px;
    color: #303133;
    display: block;
    margin-bottom: 4px;
  }
  
  .message-desc {
    font-size: 14px;
    color: #606266;
    display: block;
    line-height: 1.5;
  }
  
  .draft-info {
    margin-top: 10px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .recovery-actions {
    flex-shrink: 0;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .button-icon {
    margin-right: 4px;
  }
  
  .recovery-progress {
    height: 2px;
    background-color: #f0f0f0;
  }
  
  /* 动画 */
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease;
  }
  
  .slide-down-enter-from {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  
  .slide-down-leave-to {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  
  /* 响应式 */
  @media (max-width: 768px) {
    .draft-recovery-bar {
      min-width: 90%;
      max-width: 90%;
      top: 10px;
    }
    
    .recovery-content {
      flex-direction: column;
      align-items: stretch;
    }
    
    .recovery-actions {
      justify-content: flex-end;
    }
  }
  </style>