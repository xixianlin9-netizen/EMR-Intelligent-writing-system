<!-- src/components/editor/EMREditor.vue -->
<template>
  <div class="emr-editor">
    <el-row :gutter="20">
      <!-- 左侧引用面板 - 传递当前患者ID -->
      <el-col :span="6">
        <DataReferencePanel 
          :patient-id="currentPatient?.id"
          @insert="handleInsert"
        />
      </el-col>
      
      <!-- 右侧编辑区 -->
      <el-col :span="18">
        <el-card class="editor-card" :body-style="{ padding: '20px' }">
          <!-- 患者信息栏 -->
          <div class="patient-info" v-if="currentPatient">
            <el-tag type="info">患者：{{ currentPatient.name }}</el-tag>
            <el-tag>{{ currentPatient.gender }} {{ currentPatient.age }}岁</el-tag>
            <el-tag type="success" v-if="currentPatient.bedNumber">床号：{{ currentPatient.bedNumber }}</el-tag>
            <el-tag type="warning">诊断：{{ currentPatient.diagnosis }}</el-tag>
          </div>
          
          <!-- 结构化表单 -->
          <StructuredForm 
            ref="structuredFormRef"
            v-model:chiefComplaint="chiefComplaint"
            v-model:presentIllness="presentIllness"
            v-model:diagnoses="diagnoses"
          />
          
          <el-divider content-position="left">病历内容</el-divider>
          
          <!-- 使用 QuillEditor -->
          <div class="editor-wrapper">
            <QuillEditor 
              ref="editorRef"
              v-model="richTextContent"
              @update:modelValue="handleContentChange"
            />
          </div>
          
          <!-- 底部操作栏 -->
          <div class="editor-footer">
            <div class="footer-left">
              <span class="word-count">字数：{{ wordCount }}</span>
              <span class="save-status" :class="{ 'saved': isSaved }">
                {{ isSaved ? '已保存' : '保存中...' }}
              </span>
            </div>
            <div class="footer-right">
              <el-button @click="handlePreview">预览</el-button>
              <el-button type="primary" @click="handleSave" :loading="saving">
                保存病历
              </el-button>
              <el-button type="success" @click="handleSubmit">
                提交
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 草稿恢复提示 -->
    <DraftRecoveryBar 
      v-if="showDraftRecovery"
      @restore="restoreDraft"
      @ignore="ignoreDraft"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEmrStore } from '@/stores/emrStore'
import { usePatientStore } from '@/stores/patientStore'
import DataReferencePanel from './DataReferencePanel.vue'
import StructuredForm from './StructuredForm.vue'
import QuillEditor from './QuillEditor.vue'
import DraftRecoveryBar from '../common/DraftRecoveryBar.vue'
import { autoSave, loadDraft, clearDraft, hasDraft } from '@/utils/autoSave'
import { formatReferenceItem } from '@/utils/ruleEngine'

const emit = defineEmits(['submit'])

const emrStore = useEmrStore()
const patientStore = usePatientStore()

// 添加 ref 引用
const structuredFormRef = ref(null)
const editorRef = ref(null)

// 从 store 获取数据
const chiefComplaint = computed({
  get: () => emrStore.chiefComplaint,
  set: (val) => emrStore.setChiefComplaint(val)
})

const presentIllness = computed({
  get: () => emrStore.presentIllness,
  set: (val) => emrStore.setPresentIllness(val)
})

const diagnoses = computed({
  get: () => emrStore.diagnoses,
  set: (val) => emrStore.diagnoses = val
})

const richTextContent = computed({
  get: () => emrStore.richTextContent,
  set: (val) => emrStore.richTextContent = val
})

// 当前患者
const currentPatient = computed(() => patientStore.currentPatient)

// UI状态
const saving = ref(false)
const isSaved = ref(true)
const showDraftRecovery = ref(false)

// 字数统计
const wordCount = computed(() => {
  const text = richTextContent.value.replace(/<[^>]*>/g, '')
  return text.length
})

// 监听变化，触发自动保存
watch([chiefComplaint, presentIllness, diagnoses, richTextContent], () => {
  isSaved.value = false
  autoSave()
}, { deep: true })

// ==================== 核心：处理插入引用 ====================
function handleInsert(items) {
  items.forEach(item => {
    // 如果是模板类型且有结构化数据
    if (item.type === 'template' && item.structuredData) {
      // 只填充结构化表单，不插入到富文本编辑器
      if (structuredFormRef.value) {
        structuredFormRef.value.setFormData(item.structuredData)
        ElMessage.success(`已应用模板：${item.name || '模板'}，请完善结构化信息`)
      } else {
        console.warn('结构化表单组件未找到')
      }
      // 添加到引用记录
      emrStore.addReferenceRecord(item)
    } 
    // 普通引用（检验、医嘱、影像）插入到富文本编辑器
    else {
      const formattedText = formatReferenceItem(item)
      if (editorRef.value) {
        editorRef.value.insertReference?.(formattedText, item.type, item.id)
      }
      emrStore.addReferenceRecord(item)
    }
  })
  
  // 显示汇总消息
  const templateCount = items.filter(i => i.type === 'template' && i.structuredData).length
  const otherCount = items.length - templateCount
  
  if (templateCount > 0 && otherCount > 0) {
    ElMessage.success(`已应用 ${templateCount} 个模板，插入 ${otherCount} 项引用`)
  } else if (templateCount > 0) {
    ElMessage.success(`已应用 ${templateCount} 个模板到结构化表单`)
  } else {
    ElMessage.success(`已插入 ${items.length} 项引用`)
  }
}

// 处理内容变化
function handleContentChange(content) {
  emrStore.richTextContent = content
}

// 保存病历
async function handleSave() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    isSaved.value = true
    clearDraft()
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}

// 预览
function handlePreview() {
  ElMessage.info('预览功能开发中')
}

// 提交
function handleSubmit() {
  ElMessageBox.confirm('确认提交病历？提交后将不可修改', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(() => {
    handleSave()
    emit('submit')
  })
}

// 草稿恢复
function restoreDraft() {
  const draft = loadDraft()
  if (draft) {
    emrStore.restoreState(draft)
    showDraftRecovery.value = false
    ElMessage.success('草稿已恢复')
  }
}

function ignoreDraft() {
  clearDraft()
  showDraftRecovery.value = false
}

// 检查草稿
onMounted(() => {
  if (hasDraft() && !emrStore.richTextContent) {
    showDraftRecovery.value = true
  }
})
</script>

<style scoped>
.emr-editor {
  height: 100%;
  padding: 0;
}

.editor-card {
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px !important;
}

.patient-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  flex-shrink: 0;
}

.patient-info .el-tag {
  margin-right: 10px;
}

.editor-wrapper {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 20px;
  background-color: #fff;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 350px;
}

.editor-wrapper .quill-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.footer-left {
  font-size: 14px;
  color: #909399;
}

.save-status {
  margin-left: 15px;
  color: #e6a23c;
}

.save-status.saved {
  color: #67c23a;
}
</style>