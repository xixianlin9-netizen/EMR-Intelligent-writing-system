<!-- src/components/template/FieldConfigDialog.vue -->
<template>
  <el-dialog 
    v-model="visible" 
    :title="field ? '编辑字段' : '添加字段'"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
      <!-- 字段类型 -->
      <el-form-item label="字段类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择字段类型" @change="onTypeChange">
          <el-option label="文本框" value="text">
            <div><el-icon><Edit /></el-icon> 文本框</div>
          </el-option>
          <el-option label="多行文本" value="textarea">
            <div><el-icon><Document /></el-icon> 多行文本</div>
          </el-option>
          <el-option label="数字" value="number">
            <div><el-icon><Edit /></el-icon> 数字</div>
          </el-option>
          <el-option label="日期" value="date">
            <div><el-icon><Calendar /></el-icon> 日期</div>
          </el-option>
          <el-option label="下拉单选" value="select">
            <div><el-icon><ArrowDown /></el-icon> 下拉单选</div>
          </el-option>
          <el-option label="下拉多选" value="checkbox">
            <div><el-icon><Select /></el-icon> 下拉多选</div>
          </el-option>
          <el-option label="单选按钮" value="radio">
            <div><el-icon><CircleCheck /></el-icon> 单选按钮</div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- 字段名称 -->
      <el-form-item label="字段名称" prop="label">
        <el-input 
          v-model="formData.label" 
          placeholder="请输入字段名称，如：年龄"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      
      <!-- 字段编码 -->
      <el-form-item label="字段编码" prop="code">
        <el-input 
          v-model="formData.code" 
          placeholder="请输入字段编码，如：AGE_001"
          maxlength="30"
        />
        <div class="form-tip">用于数据标识，建议使用大写字母和下划线</div>
      </el-form-item>
      
      <!-- 占位提示 -->
      <el-form-item label="占位提示" prop="placeholder" v-if="isInputType">
        <el-input 
          v-model="formData.placeholder" 
          placeholder="请输入占位提示文字"
        />
      </el-form-item>
      
      <!-- 默认值 -->
      <el-form-item label="默认值" prop="defaultValue" v-if="!isSelectType">
        <el-input 
          v-model="formData.defaultValue" 
          placeholder="请输入默认值"
        />
      </el-form-item>
      
      <!-- 选项配置（用于 select/radio/checkbox） -->
      <el-form-item label="选项配置" v-if="isSelectType">
        <div class="options-editor">
          <div 
            v-for="(option, index) in formData.options" 
            :key="index"
            class="option-item"
          >
            <el-input 
              v-model="option.label" 
              placeholder="选项名称"
              size="small"
              style="width: 200px"
            />
            <el-input 
              v-model="option.value" 
              placeholder="选项值"
              size="small"
              style="width: 150px; margin-left: 8px"
            />
            <el-button 
              type="danger" 
              link 
              @click="removeOption(index)"
              :icon="Delete"
            />
          </div>
          <el-button type="primary" link @click="addOption" size="small">
            <el-icon><Plus /></el-icon> 添加选项
          </el-button>
        </div>
      </el-form-item>
      
      <!-- 高级设置 -->
      <el-divider content-position="left">高级设置</el-divider>
      
      <!-- 是否必填 -->
      <el-form-item label="必填">
        <el-switch v-model="formData.required" />
        <span class="form-tip">开启后，医生填写时必须填写此项</span>
      </el-form-item>
      
      <!-- 是否可删除 -->
      <el-form-item label="禁止删除">
        <el-switch v-model="formData.deletable" :active-value="false" :inactive-value="true" />
        <span class="form-tip">开启后，医生在写病历时不能删除该元素</span>
      </el-form-item>
      
      <!-- 是否可编辑 -->
      <el-form-item label="禁止编辑">
        <el-switch v-model="formData.editable" :active-value="false" :inactive-value="true" />
        <span class="form-tip">开启后，医生在写病历时不能修改该元素</span>
      </el-form-item>
      
      <!-- 最大长度（用于 text/textarea） -->
      <el-form-item label="最大长度" v-if="isInputType">
        <el-input-number 
          v-model="formData.maxLength" 
          :min="0" 
          :max="1000"
          placeholder="0表示不限制"
        />
      </el-form-item>
      
      <!-- 数值范围（用于 number） -->
      <template v-if="formData.type === 'number'">
        <el-form-item label="最小值">
          <el-input-number v-model="formData.min" placeholder="最小值" />
        </el-form-item>
        <el-form-item label="最大值">
          <el-input-number v-model="formData.max" placeholder="最大值" />
        </el-form-item>
      </template>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Document, Calendar, ArrowDown, Select, CircleCheck, Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  field: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(false)
const formRef = ref(null)

const formData = reactive({
  type: 'text',
  label: '',
  code: '',
  placeholder: '',
  defaultValue: '',
  options: [],
  required: false,
  deletable: true,
  editable: true,
  maxLength: 0,
  min: null,
  max: null
})

const isInputType = computed(() => ['text', 'textarea', 'number', 'date'].includes(formData.type))
const isSelectType = computed(() => ['select', 'radio', 'checkbox'].includes(formData.type))

const rules = {
  label: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
  code: [{ required: true, message: '请输入字段编码', trigger: 'blur' }]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.field) {
    Object.assign(formData, props.field)
  } else if (val) {
    resetForm()
  }
})

function resetForm() {
  formData.type = 'text'
  formData.label = ''
  formData.code = ''
  formData.placeholder = ''
  formData.defaultValue = ''
  formData.options = []
  formData.required = false
  formData.deletable = true
  formData.editable = true
  formData.maxLength = 0
  formData.min = null
  formData.max = null
}

function onTypeChange() {
  if (isSelectType.value && formData.options.length === 0) {
    formData.options = [{ label: '选项1', value: 'option1' }]
  }
}

function addOption() {
  const index = formData.options.length + 1
  formData.options.push({ label: `选项${index}`, value: `option${index}` })
}

function removeOption(index) {
  formData.options.splice(index, 1)
}

async function handleConfirm() {
  try {
    await formRef.value?.validate()
    emit('confirm', { ...formData })
    visible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.options-editor {
  width: 100%;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}
</style>