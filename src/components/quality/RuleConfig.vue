<template>
  <el-drawer v-model="visible" title="质控规则配置" size="60%" direction="rtl">
    <div class="rule-config">
      <div class="config-actions" style="margin-bottom: 16px;">
        <el-button type="primary" @click="addRule">新增规则</el-button>
        <el-button @click="resetRules">重置</el-button>
      </div>
      
      <el-table :data="localRules" border stripe style="width: 100%">
        <el-table-column prop="name" label="规则名称" width="140">
          <template #default="{ row }">
            <el-input v-if="row.editing" v-model="row.name" size="small" />
            <span v-else>{{ row.name }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="field" label="检查字段" width="120">
          <template #default="{ row }">
            <el-select v-if="row.editing" v-model="row.field" size="small" placeholder="选择字段">
              <el-option label="主诉" value="chiefComplaint" />
              <el-option label="现病史" value="presentIllness" />
              <el-option label="诊断" value="diagnosis" />
              <el-option label="体格检查" value="physicalExam" />
              <el-option label="辅助检查" value="auxiliaryExam" />
              <el-option label="治疗意见" value="treatmentPlan" />
            </el-select>
            <span v-else>{{ getFieldLabel(row.field) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="规则类型" width="100">
          <template #default="{ row }">
            <el-select v-if="row.editing" v-model="row.type" size="small">
              <el-option label="必填" value="required" />
              <el-option label="长度限制" value="length" />
              <el-option label="关键词匹配" value="keyword" />
              <el-option label="敏感词检测" value="sensitive" />
            </el-select>
            <span v-else>{{ getTypeLabel(row.type) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="message" label="提示信息" min-width="150">
          <template #default="{ row }">
            <el-input v-if="row.editing" v-model="row.message" size="small" />
            <span v-else>{{ row.message }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="score" label="扣分" width="80" align="center">
          <template #default="{ row }">
            <el-input-number v-if="row.editing" v-model="row.score" :min="0" :max="50" size="small" controls-position="right" />
            <span v-else>{{ row.score }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="参数" width="180">
          <template #default="{ row }">
            <div v-if="row.editing">
              <template v-if="row.type === 'length'">
                <el-input v-model="row.min" placeholder="最小" size="small" style="width: 60px" />
                <span> - </span>
                <el-input v-model="row.max" placeholder="最大" size="small" style="width: 60px" />
              </template>
              <el-select 
                v-if="row.type === 'keyword' || row.type === 'sensitive'" 
                v-model="row.keywords" 
                multiple 
                filterable 
                allow-create 
                default-first-option 
                placeholder="输入关键词" 
                size="small" 
                style="width: 150px" 
              />
            </div>
            <span v-else>{{ formatParams(row) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row, $index }">
            <el-button link type="primary" size="small" @click="toggleEdit(row)">
              {{ row.editing ? '保存' : '编辑' }}
            </el-button>
            <el-button link type="danger" size="small" @click="deleteRule($index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div style="text-align: right; padding: 16px 0; margin-top: 16px; border-top: 1px solid #ebeef5;">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="saveRules">保存配置</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(props.modelValue)
const localRules = ref([])

// 监听 drawer 显示状态
watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 监听规则变化
watch(() => props.rules, (newRules) => {
  if (newRules && newRules.length) {
    localRules.value = JSON.parse(JSON.stringify(newRules))
  }
}, { immediate: true, deep: true })

// 字段映射
const fieldMap = {
  chiefComplaint: '主诉',
  presentIllness: '现病史',
  diagnosis: '诊断',
  physicalExam: '体格检查',
  auxiliaryExam: '辅助检查',
  treatmentPlan: '治疗意见'
}

// 类型映射
const typeMap = {
  required: '必填',
  length: '长度限制',
  keyword: '关键词匹配',
  sensitive: '敏感词检测'
}

const getFieldLabel = (field) => fieldMap[field] || field
const getTypeLabel = (type) => typeMap[type] || type

// 格式化参数显示
const formatParams = (row) => {
  if (row.type === 'length') {
    return `${row.min || 0} - ${row.max || 999} 字`
  }
  if (row.type === 'keyword' || row.type === 'sensitive') {
    return (row.keywords || []).join(', ')
  }
  return '-'
}

// 新增规则
const addRule = () => {
  localRules.value.push({
    id: Date.now(),
    name: '新规则',
    field: 'chiefComplaint',
    type: 'required',
    message: '',
    score: 5,
    editing: true
  })
}

// 编辑/保存规则
const toggleEdit = (row) => {
  if (row.editing) {
    row.editing = false
    ElMessage.success('规则已更新')
  } else {
    row.editing = true
  }
}

// 删除规则
const deleteRule = (index) => {
  localRules.value.splice(index, 1)
}

// 重置规则
const resetRules = () => {
  localRules.value = JSON.parse(JSON.stringify(props.rules))
  ElMessage.info('已重置为默认规则')
}

// 保存规则
const saveRules = () => {
  const validRules = localRules.value.filter(r => r.name && r.field && r.type)
  emit('save', validRules)
  visible.value = false
  ElMessage.success('规则配置已保存')
}
</script>

<style scoped>
.rule-config {
  padding: 0 4px;
}
</style>