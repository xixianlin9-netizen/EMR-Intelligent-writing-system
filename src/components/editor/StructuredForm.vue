<!-- src/components/editor/StructuredForm.vue -->
<template>
  <div class="structured-form">
    <!-- 主诉 -->
    <el-form-item label="主诉" required>
      <el-input
        v-model="localChiefComplaint"
        type="textarea"
        :rows="2"
        placeholder="例如：发热、咳嗽3天"
        @input="handleChiefComplaintChange"
        :maxlength="200"
        show-word-limit
      />
    </el-form-item>

    <!-- 现病史 -->
    <el-form-item label="现病史" required>
      <div class="illness-type">
        <el-radio-group v-model="localPresentIllness" @change="handlePresentIllnessChange">
          <el-radio-button value="急性">急性起病</el-radio-button>
          <el-radio-button value="慢性">慢性病程</el-radio-button>
          <el-radio-button value="亚急性">亚急性起病</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 症状标签选择 -->
      <div class="symptom-tags" v-if="showSymptoms">
        <div class="tag-label">常见症状：</div>
        <el-tag
          v-for="symptom in commonSymptoms"
          :key="symptom"
          :type="selectedSymptoms.includes(symptom) ? 'primary' : 'info'"
          :effect="selectedSymptoms.includes(symptom) ? 'light' : 'plain'"
          @click="toggleSymptom(symptom)"
          class="symptom-tag"
          size="large"
        >
          {{ symptom }}
        </el-tag>
      </div>
      
      <!-- 症状描述输入 -->
      <el-input
        v-model="symptomDescription"
        type="textarea"
        :rows="3"
        placeholder="详细描述症状特征、持续时间、加重缓解因素等"
        @input="updatePresentIllness"
      />
    </el-form-item>

    <!-- 既往史 -->
    <el-form-item label="既往史">
      <el-select
        v-model="selectedPastHistory"
        multiple
        filterable
        allow-create
        default-first-option
        :reserve-keyword="false"
        placeholder="选择或输入既往病史"
        class="past-history-select"
        @change="updatePastHistory"
      >
        <el-option
          v-for="item in commonPastHistory"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>

    <!-- 体格检查 -->
    <el-form-item label="体格检查">
      <div class="vital-signs">
        <el-input
          v-model="vitalSigns.temperature"
          placeholder="体温"
          class="vital-input"
          @input="updateVitalSigns"
        >
          <template #append>℃</template>
        </el-input>
        <el-input
          v-model="vitalSigns.heartRate"
          placeholder="心率"
          class="vital-input"
          @input="updateVitalSigns"
        >
          <template #append>次/分</template>
        </el-input>
        <el-input
          v-model="vitalSigns.respiratoryRate"
          placeholder="呼吸"
          class="vital-input"
          @input="updateVitalSigns"
        >
          <template #append>次/分</template>
        </el-input>
        <el-input
          v-model="vitalSigns.bloodPressure"
          placeholder="血压"
          class="vital-input"
          @input="updateVitalSigns"
        >
          <template #append>mmHg</template>
        </el-input>
      </div>
      <el-input
        v-model="physicalExam"
        type="textarea"
        :rows="4"
        placeholder="其他体格检查发现..."
        @input="updatePhysicalExam"
      />
    </el-form-item>

    <!-- 诊断 -->
    <el-form-item label="诊断" required>
      <div v-for="(diagnosis, index) in localDiagnoses" :key="index" class="diagnosis-item">
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input
              v-model="localDiagnoses[index]"
              placeholder="输入诊断名称"
              @input="handleDiagnosisChange"
            />
          </el-col>
          <el-col :span="6">
            <el-select 
              v-model="diagnosisTypes[index]" 
              placeholder="类型"
              size="small"
              @change="handleDiagnosisTypeChange"
            >
              <el-option label="主要诊断" value="primary" />
              <el-option label="次要诊断" value="secondary" />
              <el-option label="待查" value="suspected" />
            </el-select>
          </el-col>
          <el-col :span="2">
            <el-button 
              type="danger" 
              :icon="Delete" 
              circle 
              size="small"
              @click="removeDiagnosis(index)"
            />
          </el-col>
        </el-row>
        
        <!-- ICD-10 建议 -->
        <div v-if="showICDSuggestions(index)" class="icd-suggestions">
          <el-tag 
            v-for="code in icdSuggestions[localDiagnoses[index]]" 
            :key="code"
            size="small"
            type="info"
            effect="plain"
            @click="applyICDCode(index, code)"
          >
            {{ code }}
          </el-tag>
        </div>
      </div>
      
      <el-button 
        type="primary" 
        link 
        @click="addDiagnosis"
        :icon="Plus"
      >
        添加诊断
      </el-button>
    </el-form-item>

    <!-- 过敏史 -->
    <el-form-item label="过敏史">
      <el-select
        v-model="allergies"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder="选择或输入过敏药物/物质"
        class="allergy-select"
        @change="updateAllergies"
      >
        <el-option
          v-for="item in commonAllergies"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'

const props = defineProps({
  chiefComplaint: {
    type: String,
    default: ''
  },
  presentIllness: {
    type: String,
    default: '急性'
  },
  diagnoses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:chiefComplaint',
  'update:presentIllness',
  'update:diagnoses',
  'change'
])

// 本地状态
const localChiefComplaint = ref(props.chiefComplaint)
const localPresentIllness = ref(props.presentIllness)
const localDiagnoses = ref([...props.diagnoses])

// 扩展字段
const diagnosisTypes = ref([])
const selectedSymptoms = ref([])
const symptomDescription = ref('')
const selectedPastHistory = ref([])
const physicalExam = ref('')
const allergies = ref([])

// 生命体征
const vitalSigns = ref({
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  bloodPressure: ''
})

// 常见症状
const commonSymptoms = [
  '发热', '咳嗽', '咳痰', '胸痛', '呼吸困难',
  '头痛', '头晕', '恶心', '呕吐', '腹痛',
  '腹泻', '关节痛', '乏力', '食欲不振'
]

// 常见既往史
const commonPastHistory = [
  '高血压', '糖尿病', '冠心病', '肝炎', '结核',
  '手术史', '外伤史', '输血史', '吸烟史', '饮酒史'
]

// 常见过敏原
const commonAllergies = [
  '青霉素', '头孢菌素', '磺胺类', '阿司匹林',
  '碘造影剂', '花粉', '尘螨', '海鲜', '鸡蛋'
]

// ICD-10 建议（模拟数据）
const icdSuggestions = {
  '肺炎': ['J15.9', 'J18.9'],
  '高血压': ['I10', 'I11.9'],
  '糖尿病': ['E11.9', 'E14.9'],
  '支气管炎': ['J40', 'J42']
}

// 显示症状标签的条件
const showSymptoms = computed(() => {
  return localPresentIllness.value === '急性' || localPresentIllness.value === '亚急性'
})

// 完整的现病史文本
const fullPresentIllness = computed(() => {
  let text = `${localPresentIllness.value === '急性' ? '急性' : 
              localPresentIllness.value === '慢性' ? '慢性' : '亚急性'}起病`
  
  if (selectedSymptoms.value.length > 0) {
    text += `，主要表现为${selectedSymptoms.value.join('、')}`
  }
  
  if (symptomDescription.value) {
    text += `，${symptomDescription.value}`
  }
  
  return text
})

// 监听props变化
watch(() => props.chiefComplaint, (val) => {
  localChiefComplaint.value = val
})

watch(() => props.presentIllness, (val) => {
  localPresentIllness.value = val
})

watch(() => props.diagnoses, (val) => {
  localDiagnoses.value = [...val]
}, { deep: true })

// ==================== 新增：设置表单数据的方法 ====================
function setFormData(data) {
  console.log('StructuredForm: 设置表单数据', data)
  
  // 设置主诉
  if (data.chiefComplaint !== undefined) {
    localChiefComplaint.value = data.chiefComplaint
    emit('update:chiefComplaint', data.chiefComplaint)
  }
  
  // 设置现病史类型
  if (data.presentIllnessType !== undefined) {
    localPresentIllness.value = data.presentIllnessType
    emit('update:presentIllness', data.presentIllnessType)
  }
  
  // 设置症状列表
  if (data.symptoms !== undefined && Array.isArray(data.symptoms)) {
    selectedSymptoms.value = data.symptoms
  }
  
  // 设置症状描述
  if (data.symptomDescription !== undefined) {
    symptomDescription.value = data.symptomDescription
  }
  
  // 设置诊断（支持数组或字符串）
  if (data.diagnoses !== undefined) {
    const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [data.diagnoses]
    localDiagnoses.value = diagnoses
    emit('update:diagnoses', diagnoses)
  }
  
  // 设置体格检查
  if (data.physicalExam !== undefined) {
    physicalExam.value = data.physicalExam
    emit('change', { field: 'physicalExam', value: data.physicalExam })
  }
  
  // 设置既往史
  if (data.pastHistory !== undefined && Array.isArray(data.pastHistory)) {
    selectedPastHistory.value = data.pastHistory
    emit('change', { field: 'pastHistory', value: data.pastHistory })
  }
  
  // 设置生命体征
  if (data.vitalSigns !== undefined) {
    vitalSigns.value = { ...vitalSigns.value, ...data.vitalSigns }
    emit('change', { field: 'vitalSigns', value: vitalSigns.value })
  }
  
  // 触发整体变化事件
  emit('change', { field: 'structuredData', value: data })
}

// 暴露方法给父组件
defineExpose({
  setFormData
})

// ==================== 原有方法 ====================
function handleChiefComplaintChange() {
  emit('update:chiefComplaint', localChiefComplaint.value)
  emit('change', { field: 'chiefComplaint', value: localChiefComplaint.value })
}

function handlePresentIllnessChange() {
  emit('update:presentIllness', localPresentIllness.value)
  emit('change', { field: 'presentIllness', value: localPresentIllness.value })
}

function toggleSymptom(symptom) {
  const index = selectedSymptoms.value.indexOf(symptom)
  if (index === -1) {
    selectedSymptoms.value.push(symptom)
  } else {
    selectedSymptoms.value.splice(index, 1)
  }
  updatePresentIllness()
}

function updatePresentIllness() {
  emit('change', { field: 'presentIllnessDetail', value: fullPresentIllness.value })
}

function updatePastHistory() {
  emit('change', { field: 'pastHistory', value: selectedPastHistory.value })
}

function updateVitalSigns() {
  emit('change', { field: 'vitalSigns', value: vitalSigns.value })
}

function updatePhysicalExam() {
  emit('change', { field: 'physicalExam', value: physicalExam.value })
}

function updateAllergies() {
  emit('change', { field: 'allergies', value: allergies.value })
}

function addDiagnosis() {
  localDiagnoses.value.push('')
  diagnosisTypes.value.push('secondary')
  emit('update:diagnoses', [...localDiagnoses.value])
}

function removeDiagnosis(index) {
  localDiagnoses.value.splice(index, 1)
  diagnosisTypes.value.splice(index, 1)
  emit('update:diagnoses', [...localDiagnoses.value])
}

function handleDiagnosisChange() {
  emit('update:diagnoses', [...localDiagnoses.value])
  emit('change', { field: 'diagnoses', value: localDiagnoses.value })
}

function handleDiagnosisTypeChange() {
  emit('change', { field: 'diagnosisTypes', value: diagnosisTypes.value })
}

function showICDSuggestions(index) {
  const diagnosis = localDiagnoses.value[index]
  return diagnosis && icdSuggestions[diagnosis]
}

function applyICDCode(index, code) {
  localDiagnoses.value[index] = `${localDiagnoses.value[index]} (${code})`
  handleDiagnosisChange()
}
</script>

<style scoped>
.structured-form {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
}

.illness-type {
  margin-bottom: 15px;
}

.symptom-tags {
  margin-bottom: 15px;
}

.tag-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.symptom-tag {
  margin: 0 8px 8px 0;
  cursor: pointer;
}

.vital-signs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.vital-input {
  width: 120px;
}

.diagnosis-item {
  margin-bottom: 10px;
}

.icd-suggestions {
  margin-top: 5px;
  margin-left: 20px;
}

.icd-suggestions .el-tag {
  margin-right: 5px;
  cursor: pointer;
}

.past-history-select,
.allergy-select {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-radio-button__inner) {
  padding: 8px 16px;
}
</style>