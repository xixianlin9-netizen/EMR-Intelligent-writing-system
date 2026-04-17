<!-- src/components/template/TemplateEditor.vue -->
<template>
  <div class="template-editor">
    <!-- 头部 -->
    <div class="editor-header">
      <el-input 
        v-model="templateName" 
        placeholder="模板名称" 
        size="large"
        style="width: 300px"
        @input="onTemplateNameChange"
      />
      <el-button type="primary" @click="saveTemplate" :loading="saving">
        <el-icon><Check /></el-icon> 保存模板
      </el-button>
    </div>
    
    <!-- 字段列表 -->
    <div class="fields-section">
      <div class="section-header">
        <span>表单字段配置</span>
        <el-button type="primary" size="small" @click="showAddField">
          <el-icon><Plus /></el-icon> 添加字段
        </el-button>
      </div>
      
      <!-- 字段列表 -->
      <div class="fields-list">
        <div 
          v-for="(field, index) in templateFields" 
          :key="field.id"
          class="field-card"
        >
          <div class="field-card-header">
            <div class="field-title">
              <el-tag :type="getFieldTypeTag(field.type)" size="small">
                {{ getFieldTypeName(field.type) }}
              </el-tag>
              <span class="field-label">{{ field.label }}</span>
              <span class="field-code">({{ field.code }})</span>
            </div>
            <div class="field-actions">
              <el-button type="primary" link size="small" @click="editField(field, index)">
                编辑
              </el-button>
              <el-button type="danger" link size="small" @click="removeField(index)">
                删除
              </el-button>
            </div>
          </div>
          <div class="field-card-body">
            <div class="field-info">
              <span>类型: {{ getFieldTypeName(field.type) }}</span>
              <span v-if="field.required" class="required-badge">必填</span>
              <span v-if="!field.deletable" class="locked-badge">禁止删除</span>
            </div>
            <div class="field-preview">
              预览: 
              <template v-if="field.type === 'select'">
                下拉选择框
              </template>
              <template v-else-if="field.type === 'radio'">
                单选框组
              </template>
              <template v-else-if="field.type === 'textarea'">
                多行文本框
              </template>
              <template v-else>
                输入框
              </template>
              <span class="preview-value">(默认值: {{ field.defaultValue || '空' }})</span>
            </div>
          </div>
        </div>
        
        <el-empty v-if="templateFields.length === 0" description="暂无字段，点击「添加字段」开始配置" />
      </div>
    </div>
    
    <!-- 添加/编辑字段对话框 -->
    <el-dialog 
      v-model="fieldDialogVisible" 
      :title="editingIndex >= 0 ? '编辑字段' : '添加字段'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="fieldForm" label-width="100px" size="default">
        <el-form-item label="字段名称" required>
          <el-input 
            v-model="fieldForm.label" 
            placeholder="例如：主诉、年龄、体温"
          />
        </el-form-item>
        
        <el-form-item label="字段编码" required>
          <el-input 
            v-model="fieldForm.code" 
            placeholder="例如：CHIEF_COMPLAINT, AGE, TEMPERATURE"
          />
          <div style="font-size:12px; color:#909399; margin-top:4px">用于程序识别，建议使用大写字母和下划线</div>
        </el-form-item>
        
        <el-form-item label="字段类型" required>
          <el-select v-model="fieldForm.type" placeholder="请选择" style="width:100%">
            <el-option label="文本框" value="text" />
            <el-option label="多行文本" value="textarea" />
            <el-option label="数字输入" value="number" />
            <el-option label="日期选择" value="date" />
            <el-option label="下拉单选" value="select" />
            <el-option label="单选按钮" value="radio" />
            <el-option label="复选框" value="checkbox" />
          </el-select>
        </el-form-item>
        
        <!-- 选项配置（用于 select/radio/checkbox） -->
        <el-form-item v-if="fieldForm.type === 'select' || fieldForm.type === 'radio' || fieldForm.type === 'checkbox'" label="选项配置">
          <div class="option-list">
            <div v-for="(opt, idx) in fieldForm.options" :key="idx" class="option-row">
              <el-input 
                v-model="opt.label" 
                placeholder="选项名称" 
                size="small"
                style="width: 180px"
              />
              <el-input 
                v-model="opt.value" 
                placeholder="选项值" 
                size="small"
                style="width: 150px; margin:0 8px"
              />
              <el-button type="danger" link @click="removeOption(idx)" size="small">删除</el-button>
            </div>
            <el-button type="primary" link @click="addOption" size="small">
              <el-icon><Plus /></el-icon> 添加选项
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="默认值">
          <el-input 
            v-model="fieldForm.defaultValue" 
            :placeholder="fieldForm.type === 'select' ? '请输入选项值' : '请输入默认值'"
          />
        </el-form-item>
        
        <el-form-item label="占位提示">
          <el-input 
            v-model="fieldForm.placeholder" 
            placeholder="请输入占位提示文字"
          />
        </el-form-item>
        
        <el-divider content-position="left">高级设置</el-divider>
        
        <el-form-item label="必填">
          <el-switch v-model="fieldForm.required" />
          <span style="margin-left: 8px; font-size:12px; color:#909399">医生必须填写此项</span>
        </el-form-item>
        
        <el-form-item label="禁止删除">
          <el-switch v-model="fieldForm.deletable" :active-value="false" :inactive-value="true" />
          <span style="margin-left: 8px; font-size:12px; color:#909399">医生不能删除此字段</span>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="fieldDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmField">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Check, Plus } from '@element-plus/icons-vue'
import { usePersonalTemplateStore } from '@/stores/personalTemplateStore'

const props = defineProps({
  templateId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['saved'])

const templateStore = usePersonalTemplateStore()
const saving = ref(false)
const fieldDialogVisible = ref(false)
const editingIndex = ref(-1)

// 模板数据
const templateName = ref('')
const templateFields = ref([])

// 字段表单
const fieldForm = ref({
  type: 'text',
  label: '',
  code: '',
  placeholder: '',
  defaultValue: '',
  options: [],
  required: false,
  deletable: true,
  editable: true
})

// 监听模板变化
watch(() => props.templateId, (newId) => {
  if (newId) {
    const template = templateStore.getTemplateById(newId)
    if (template) {
      templateName.value = template.name
      templateFields.value = [...(template.fields || [])]
    }
  }
}, { immediate: true })

function onTemplateNameChange() {
  if (props.templateId) {
    templateStore.updateTemplate(props.templateId, { name: templateName.value })
  }
}

function getFieldTypeName(type) {
  const map = {
    text: '文本框',
    textarea: '多行文本',
    number: '数字',
    date: '日期',
    select: '下拉单选',
    radio: '单选按钮',
    checkbox: '复选框'
  }
  return map[type] || type
}

function getFieldTypeTag(type) {
  const map = {
    text: 'info',
    textarea: 'info',
    number: 'warning',
    date: 'warning',
    select: 'success',
    radio: 'primary',
    checkbox: 'success'
  }
  return map[type] || 'info'
}

function showAddField() {
  editingIndex.value = -1
  fieldForm.value = {
    type: 'text',
    label: '',
    code: '',
    placeholder: '',
    defaultValue: '',
    options: [],
    required: false,
    deletable: true,
    editable: true
  }
  fieldDialogVisible.value = true
}

function editField(field, index) {
  editingIndex.value = index
  fieldForm.value = JSON.parse(JSON.stringify(field))
  fieldDialogVisible.value = true
}

function addOption() {
  fieldForm.value.options.push({ label: '', value: '' })
}

function removeOption(index) {
  fieldForm.value.options.splice(index, 1)
}

function confirmField() {
  // 验证
  if (!fieldForm.value.label) {
    ElMessage.warning('请填写字段名称')
    return
  }
  if (!fieldForm.value.code) {
    ElMessage.warning('请填写字段编码')
    return
  }
  
  // 对于选择类型，验证选项
  if (['select', 'radio', 'checkbox'].includes(fieldForm.value.type)) {
    const validOptions = fieldForm.value.options.filter(opt => opt.label && opt.value)
    if (validOptions.length === 0) {
      ElMessage.warning('请至少添加一个有效选项')
      return
    }
    fieldForm.value.options = validOptions
  }
  
  const fieldData = { ...fieldForm.value }
  
  if (editingIndex.value >= 0) {
    // 更新
    const fieldId = templateFields.value[editingIndex.value].id
    templateStore.updateField(props.templateId, fieldId, fieldData)
    templateFields.value[editingIndex.value] = { ...templateFields.value[editingIndex.value], ...fieldData }
    ElMessage.success('字段已更新')
  } else {
    // 新增
    const newField = templateStore.addField(props.templateId, fieldData)
    templateFields.value.push(newField)
    ElMessage.success('字段已添加')
  }
  
  fieldDialogVisible.value = false
}

function removeField(index) {
  const field = templateFields.value[index]
  if (!field.deletable) {
    ElMessage.warning('该字段禁止删除')
    return
  }
  templateStore.deleteField(props.templateId, field.id)
  templateFields.value.splice(index, 1)
  ElMessage.success('字段已删除')
}

async function saveTemplate() {
  saving.value = true
  try {
    templateStore.updateTemplate(props.templateId, { fields: templateFields.value })
    ElMessage.success('模板保存成功')
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.template-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.fields-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 14px;
}

.fields-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.field-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.field-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.field-label {
  font-weight: 600;
  color: #303133;
}

.field-code {
  font-size: 12px;
  color: #909399;
}

.field-card-body {
  padding: 12px 16px;
}

.field-info {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #606266;
}

.required-badge {
  color: #f56c6c;
}

.locked-badge {
  color: #e6a23c;
}

.field-preview {
  font-size: 12px;
  color: #909399;
}

.preview-value {
  color: #409eff;
  margin-left: 8px;
}

.option-list {
  width: 100%;
}

.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
</style>