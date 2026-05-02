<!-- src/components/editor/EMREditor.vue -->
<template>
  <div class="emr-editor">
    <el-row :gutter="20">
      <!-- 左侧引用面板 -->
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
          
         <!-- 操作工具栏 -->
         <div class="editor-toolbar">
            <el-button type="primary" class="primary-blue-btn" @click="showTemplateDialog">
             <el-icon><Files /></el-icon> 引用个人模板
           </el-button>
         </div>
          
          <!-- 结构化表单 -->
          <StructuredForm 
            ref="structuredFormRef"
            v-model:chiefComplaint="formData.chiefComplaint"
            v-model:presentIllness="formData.presentIllness"
            v-model:diagnoses="formData.diagnoses"
            :patient-gender="currentPatient?.gender"
            @change="handleFormChange"
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
              <span class="draft-status" v-if="hasDraftFlag">
                <el-icon><Document /></el-icon> 有未保存草稿
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
    
    <!-- 模板引用对话框 -->
    <TemplateReferenceDialog 
      v-model="templateDialogVisible"
      :current-form-data="currentFormData"
      @apply="onTemplateApply"
    />
    
    <!-- 草稿恢复提示 -->
    <DraftRecoveryBar 
      v-if="showDraftRecovery"
      :visible="showDraftRecovery"
      title="检测到未保存的草稿"
      :message="`上次编辑时间：${draftInfo?.lastSaved || '未知'}`"
      :draft-info="draftInfo"
      @restore="restoreDraft"
      @ignore="ignoreDraft"
      @update:visible="showDraftRecovery = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Files, Document } from '@element-plus/icons-vue'
import { useEmrStore } from '@/stores/emrStore'
import { usePatientStore } from '@/stores/patientStore'
import { useEmrRecordStore } from '@/stores/emrRecordStore'
import DataReferencePanel from './DataReferencePanel.vue'
import StructuredForm from './StructuredForm.vue'
import QuillEditor from './QuillEditor.vue'
import DraftRecoveryBar from '../common/DraftRecoveryBar.vue'
import TemplateReferenceDialog from '@/components/template/TemplateReferenceDialog.vue'
import { formatReferenceItem } from '@/utils/ruleEngine'

const route = useRoute()
const router = useRouter()
const emit = defineEmits(['submit'])

const emrStore = useEmrStore()
const patientStore = usePatientStore()
const emrRecordStore = useEmrRecordStore()

// ref 引用
const structuredFormRef = ref(null)
const editorRef = ref(null)

// 从路由参数获取患者ID
const patientId = ref(route.params.patientId)
const emrId = ref(route.query.emrId || `emr_${Date.now()}`)

// 模板对话框
const templateDialogVisible = ref(false)

// UI状态
const saving = ref(false)
const isSaved = ref(true)
const showDraftRecovery = ref(false)
const draftInfo = ref(null)
const hasDraftFlag = ref(false)

// 当前患者
const currentPatient = computed(() => patientStore.currentPatient)

// ==================== 表单数据结构 ====================
const formData = reactive({
  chiefComplaint: '',
  presentIllness: '急性',
  diagnoses: [],
  pastHistory: [],
  familyHistory: [],
  physicalExam: '',
  auxiliaryExam: '',
  fourDiagnosis: '',
  treatment: '',
  menstrualHistory: {
    onset: '',
    cycle: '',
    duration: '',
    lastMenstrual: '',
    regularity: '',
    remarks: ''
  },
  presentIllnessType: '急性',
  symptoms: [],
  symptomDescription: '',
  vitalSigns: {
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    bloodPressure: ''
  }
})

// 富文本内容
const richTextContent = ref('')

// 当前表单数据（用于模板应用）
const currentFormData = computed(() => ({
  chiefComplaint: formData.chiefComplaint,
  presentIllness: formData.presentIllness,
  presentIllnessType: formData.presentIllnessType,
  diagnoses: formData.diagnoses,
  pastHistory: formData.pastHistory,
  familyHistory: formData.familyHistory,
  physicalExam: formData.physicalExam,
  auxiliaryExam: formData.auxiliaryExam,
  fourDiagnosis: formData.fourDiagnosis,
  treatment: formData.treatment,
  menstrualHistory: formData.menstrualHistory,
  symptoms: formData.symptoms,
  symptomDescription: formData.symptomDescription,
  vitalSigns: formData.vitalSigns,
  richTextContent: richTextContent.value
}))

// 字数统计
const wordCount = computed(() => {
  const text = richTextContent.value.replace(/<[^>]*>/g, '')
  return text.length
})

// ==================== 草稿保存与恢复 ====================
function generateDraftData() {
  return {
    formData: {
      chiefComplaint: formData.chiefComplaint,
      presentIllness: formData.presentIllness,
      diagnoses: formData.diagnoses,
      pastHistory: formData.pastHistory,
      familyHistory: formData.familyHistory,
      physicalExam: formData.physicalExam,
      auxiliaryExam: formData.auxiliaryExam,
      fourDiagnosis: formData.fourDiagnosis,
      treatment: formData.treatment,
      menstrualHistory: formData.menstrualHistory,
      presentIllnessType: formData.presentIllnessType,
      symptoms: formData.symptoms,
      symptomDescription: formData.symptomDescription,
      vitalSigns: formData.vitalSigns
    },
    richTextContent: richTextContent.value,
    patientId: currentPatient.value?.id,
    lastSaved: new Date().toLocaleString(),
    version: '1.0'
  }
}

function saveDraft() {
  const draft = generateDraftData()
  localStorage.setItem('emr_draft', JSON.stringify(draft))
  hasDraftFlag.value = true
  console.log('草稿已保存', draft.lastSaved)
}

function loadDraft() {
  const draftJson = localStorage.getItem('emr_draft')
  if (!draftJson) return null
  try {
    const draft = JSON.parse(draftJson)
    if (draft.patientId !== currentPatient.value?.id) return null
    return draft
  } catch (e) {
    console.error('加载草稿失败', e)
    return null
  }
}

function restoreDraft() {
  const draft = loadDraft()
  if (!draft) {
    ElMessage.warning('未找到可恢复的草稿')
    return
  }
  if (draft.formData) Object.assign(formData, draft.formData)
  richTextContent.value = draft.richTextContent || ''
  clearDraft()
  showDraftRecovery.value = false
  isSaved.value = true
  ElMessage.success('草稿恢复成功')
}

function clearDraft() {
  localStorage.removeItem('emr_draft')
  hasDraftFlag.value = false
}

function ignoreDraft() {
  clearDraft()
  showDraftRecovery.value = false
  ElMessage.info('已忽略草稿')
}

function checkDraft() {
  const draft = loadDraft()
  if (draft) {
    draftInfo.value = { lastSaved: draft.lastSaved, patientName: currentPatient.value?.name }
    showDraftRecovery.value = true
  }
}

// ==================== 表单变化处理 ====================
let saveTimer = null

function handleFormChange() {
  isSaved.value = false
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (!isSaved.value) saveDraft()
  }, 30000)
}

function handleContentChange(content) {
  richTextContent.value = content
  handleFormChange()
}

// ==================== 保存和提交 ====================
async function handleSave() {
  saving.value = true
  try {
    const formDataToSave = {
      chiefComplaint: formData.chiefComplaint,
      presentIllness: formData.presentIllness,
      diagnoses: formData.diagnoses,
      pastHistory: formData.pastHistory,
      familyHistory: formData.familyHistory,
      physicalExam: formData.physicalExam,
      auxiliaryExam: formData.auxiliaryExam,
      fourDiagnosis: formData.fourDiagnosis,
      treatment: formData.treatment,
      menstrualHistory: formData.menstrualHistory,
      symptoms: formData.symptoms,
      symptomDescription: formData.symptomDescription,
      vitalSigns: formData.vitalSigns
    }
    
    emrRecordStore.saveDraftRecord(
      currentPatient.value?.id, 
      emrId.value, 
      formDataToSave, 
      richTextContent.value
    )
    
    isSaved.value = true
    clearDraft()
    ElMessage.success('病历保存成功')
  } finally {
    saving.value = false
  }
}

function handleSubmit() {
  ElMessageBox.confirm('确认提交病历？提交后将不可修改', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const formDataToSave = {
      chiefComplaint: formData.chiefComplaint,
      presentIllness: formData.presentIllness,
      diagnoses: formData.diagnoses,
      pastHistory: formData.pastHistory,
      familyHistory: formData.familyHistory,
      physicalExam: formData.physicalExam,
      auxiliaryExam: formData.auxiliaryExam,
      fourDiagnosis: formData.fourDiagnosis,
      treatment: formData.treatment,
      menstrualHistory: formData.menstrualHistory,
      symptoms: formData.symptoms,
      symptomDescription: formData.symptomDescription,
      vitalSigns: formData.vitalSigns
    }
    
    emrRecordStore.submitRecord(
      currentPatient.value?.id, 
      emrId.value, 
      formDataToSave, 
      richTextContent.value
    )
    
    isSaved.value = true
    clearDraft()
    ElMessage.success('病历提交成功')
    setTimeout(() => router.push('/dashboard'), 1500)
  }).catch(() => {})
}

// ==================== 模板应用 ====================
function showTemplateDialog() { templateDialogVisible.value = true }

function onTemplateApply({ template, mode }) {
  if (!template.structuredData) {
    ElMessage.warning('模板没有配置结构化数据')
    return
  }
  const data = template.structuredData
  if (data.chiefComplaint !== undefined) formData.chiefComplaint = data.chiefComplaint
  if (data.presentIllnessType !== undefined) formData.presentIllness = data.presentIllnessType
  if (data.diagnoses !== undefined) formData.diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [data.diagnoses]
  if (data.pastHistory !== undefined) formData.pastHistory = data.pastHistory
  if (data.familyHistory !== undefined) formData.familyHistory = data.familyHistory
  if (data.physicalExam !== undefined) formData.physicalExam = data.physicalExam
  if (data.auxiliaryExam !== undefined) formData.auxiliaryExam = data.auxiliaryExam
  if (data.fourDiagnosis !== undefined) formData.fourDiagnosis = data.fourDiagnosis
  if (data.treatment !== undefined) formData.treatment = data.treatment
  if (data.symptoms !== undefined) formData.symptoms = data.symptoms
  if (data.symptomDescription !== undefined) formData.symptomDescription = data.symptomDescription
  if (data.vitalSigns !== undefined) formData.vitalSigns = { ...formData.vitalSigns, ...data.vitalSigns }
  if (data.menstrualHistory !== undefined) formData.menstrualHistory = { ...formData.menstrualHistory, ...data.menstrualHistory }
  
  if (mode === 'append' && template.content) {
    richTextContent.value = richTextContent.value + '<br/><br/>' + template.content
  }
  handleFormChange()
  ElMessage.success(`已应用模板：${template.name}`)
}

// ==================== 引用插入 ====================
function handleInsert(items) {
  items.forEach(item => {
    if (item.type === 'template' && item.structuredData) {
      if (structuredFormRef.value) {
        structuredFormRef.value.setFormData(item.structuredData)
        ElMessage.success(`已应用模板：${item.name || '模板'}`)
      }
    } else {
      const formattedText = formatReferenceItem(item)
      if (editorRef.value) editorRef.value.insertReference?.(formattedText, item.type, item.id)
    }
  })
  handleFormChange()
}

function handlePreview() { ElMessage.info('预览功能开发中') }

// ==================== 初始化 ====================
async function loadPatientInfo() {
  if (patientId.value) {
    let patient = patientStore.getPatientById(patientId.value)
    if (!patient) {
      const patientsData = await import('@/mock/patients.json')
      patient = patientsData.default.find(p => p.id === patientId.value)
    }
    if (patient) patientStore.setCurrentPatient(patient)
    else ElMessage.error('未找到患者信息')
  } else {
    ElMessage.error('缺少患者ID')
  }
}

onMounted(() => {
  loadPatientInfo()
  checkDraft()
})

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
  if (!isSaved.value) saveDraft()
})
</script>

<style scoped>
.primary-blue-btn {
  background: linear-gradient(135deg, #409eff, #3a8ee6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.primary-blue-btn:hover {
  background: linear-gradient(135deg, #66b1ff, #409eff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  color: white;
}

.primary-blue-btn:active {
  transform: translateY(0);
}
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
  margin-bottom: 16px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  flex-shrink: 0;
}

.patient-info .el-tag {
  margin-right: 10px;
}

.editor-toolbar {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #909399;
}

.save-status {
  color: #e6a23c;
}

.save-status.saved {
  color: #67c23a;
}

.draft-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.footer-right {
  display: flex;
  gap: 12px;
}
</style>