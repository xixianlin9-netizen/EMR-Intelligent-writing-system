<!-- src/components/template/TemplateReferenceDialog.vue -->
<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="选择病历模板" 
    width="700px"
    :close-on-click-modal="false"
  >
    <div class="template-reference-content">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="个人模板" name="personal">
          <div class="personal-templates">
            <div v-for="group in groups" :key="group.id" class="template-group">
              <div class="group-title">{{ group.name }}</div>
              <div class="template-items">
                <div 
                  v-for="template in getTemplatesByGroup(group.id)" 
                  :key="template.id"
                  class="template-card"
                  :class="{ selected: selectedTemplateId === template.id }"
                  @click="selectTemplate(template)"
                >
                  <div class="template-name">{{ template.name }}</div>
                  <div class="template-desc">使用 {{ template.usageCount || 0 }} 次</div>
                </div>
                <el-empty v-if="getTemplatesByGroup(group.id).length === 0" description="暂无模板" />
              </div>
            </div>
            <el-empty v-if="groups.length === 0" description="暂无分组，请先在模板库中创建" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <div class="mode-selector">
          <span class="mode-label">替换模式：</span>
          <el-radio-group v-model="replaceMode">
            <el-radio value="replace_single">单条替换</el-radio>
            <el-radio value="replace_all">整体替换</el-radio>
            <el-radio value="append">追加写回</el-radio>
          </el-radio-group>
        </div>
        <div class="action-buttons">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="applyTemplate" :disabled="!selectedTemplateId">
            应用模板
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { usePersonalTemplateStore } from '@/stores/personalTemplateStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentFormData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activeTab = ref('personal')
const selectedTemplateId = ref(null)
const replaceMode = ref('replace_single')

const templateStore = usePersonalTemplateStore()
const groups = computed(() => templateStore.groups)

// 加载数据
watch(() => props.modelValue, (val) => {
  if (val) {
    templateStore.loadData()
    selectedTemplateId.value = null
  }
})

function getTemplatesByGroup(groupId) {
  return templateStore.getTemplatesByGroup(groupId)
}

function selectTemplate(template) {
  selectedTemplateId.value = template.id
}

function applyTemplate() {
  if (!selectedTemplateId.value) {
    ElMessage.warning('请选择一个模板')
    return
  }
  
  const template = templateStore.getTemplateById(selectedTemplateId.value)
  if (!template) {
    ElMessage.warning('模板不存在')
    return
  }
  
  // 构建模板数据
  const templateData = {
    id: template.id,
    name: template.name,
    type: 'template',
    structuredData: {},
    content: template.content
  }
  
  // 将模板字段转换为结构化数据
  if (template.fields && template.fields.length > 0) {
    template.fields.forEach(field => {
      const key = field.code || field.label
      templateData.structuredData[key] = field.defaultValue || ''
      
      // 特殊处理字段映射
      if (field.code === 'CHIEF_COMPLAINT' || field.label === '主诉') {
        templateData.structuredData.chiefComplaint = field.defaultValue || ''
      }
      if (field.code === 'DIAGNOSIS' || field.label === '初步诊断') {
        templateData.structuredData.diagnoses = [field.defaultValue || '']
      }
      if (field.code === 'PRESENT_ILLNESS' || field.label === '现病史') {
        templateData.structuredData.presentIllnessDetail = field.defaultValue || ''
      }
      if (field.code === 'PHYSICAL_EXAM' || field.label === '体格检查') {
        templateData.structuredData.physicalExam = field.defaultValue || ''
      }
      if (field.code === 'TREATMENT' || field.label === '治疗意见') {
        templateData.structuredData.treatment = field.defaultValue || ''
      }
    })
  }
  
  emit('apply', {
    template: templateData,
    mode: replaceMode.value
  })
  
  dialogVisible.value = false
  ElMessage.success(`已应用模板：${template.name}`)
}
</script>

<style scoped>
.template-reference-content {
  min-height: 400px;
  max-height: 500px;
  overflow-y: auto;
}

.personal-templates {
  padding: 8px 0;
}

.template-group {
  margin-bottom: 20px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.template-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.template-card {
  width: calc(33.33% - 8px);
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.template-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.template-desc {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.mode-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-label {
  font-size: 14px;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .template-card {
    width: calc(50% - 6px);
  }
  .dialog-footer {
    flex-direction: column;
    gap: 12px;
  }
}
</style>