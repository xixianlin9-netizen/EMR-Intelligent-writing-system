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
        class="history-select"
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

    <!-- 家族史 -->
    <el-form-item label="家族史">
      <el-select
        v-model="selectedFamilyHistory"
        multiple
        filterable
        allow-create
        default-first-option
        :reserve-keyword="false"
        placeholder="选择或输入家族遗传病史"
        class="history-select"
        @change="updateFamilyHistory"
      >
        <el-option
          v-for="item in commonFamilyHistory"
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

    <!-- 辅助检查 -->
    <el-form-item label="辅助检查">
      <el-input
        v-model="auxiliaryExam"
        type="textarea"
        :rows="3"
        placeholder="血常规、影像学检查等结果..."
        @input="updateAuxiliaryExam"
      />
    </el-form-item>

    <!-- 四诊摘要 -->
    <el-form-item label="四诊摘要">
      <el-input
        v-model="fourDiagnosis"
        type="textarea"
        :rows="3"
        placeholder="望、闻、问、切四诊摘要..."
        @input="updateFourDiagnosis"
      />
    </el-form-item>

    <!-- 处理 -->
    <el-form-item label="处理">
      <el-input
        v-model="treatment"
        type="textarea"
        :rows="4"
        placeholder="治疗方案、用药建议等..."
        @input="updateTreatment"
      />
    </el-form-item>

    <!-- 月经史（仅限女性患者显示） -->
    <el-form-item v-if="isFemalePatient" label="月经史">
      <el-row :gutter="16">
        <el-col :span="8">
          <el-input
            v-model="menstrualHistory.onset"
            placeholder="初潮年龄"
            @input="updateMenstrualHistory"
          >
            <template #append>岁</template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="menstrualHistory.cycle"
            placeholder="月经周期"
            @input="updateMenstrualHistory"
          >
            <template #append>天</template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="menstrualHistory.duration"
            placeholder="经期持续时间"
            @input="updateMenstrualHistory"
          >
            <template #append>天</template>
          </el-input>
        </el-col>
      </el-row>
      <el-row :gutter="16" style="margin-top: 12px">
        <el-col :span="12">
          <el-input
            v-model="menstrualHistory.lastMenstrual"
            placeholder="末次月经"
            @input="updateMenstrualHistory"
          >
            <template #prepend>末次月经</template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-select
            v-model="menstrualHistory.regularity"
            placeholder="月经规律性"
            clearable
            @change="updateMenstrualHistory"
          >
            <el-option label="规律" value="regular" />
            <el-option label="不规律" value="irregular" />
          </el-select>
        </el-col>
      </el-row>
      <el-row style="margin-top: 12px">
        <el-col :span="24">
          <el-input
            v-model="menstrualHistory.remarks"
            placeholder="备注（如：痛经、经量异常等）"
            @input="updateMenstrualHistory"
          />
        </el-col>
      </el-row>
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
  },
  patientGender: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:chiefComplaint',
  'update:presentIllness',
  'update:diagnoses',
  'change'
])

// ==================== 本地状态 ====================
// 主诉
const localChiefComplaint = ref(props.chiefComplaint)

// 现病史
const localPresentIllness = ref(props.presentIllness)
const selectedSymptoms = ref([])
const symptomDescription = ref('')

// 既往史
const selectedPastHistory = ref([])

// 家族史
const selectedFamilyHistory = ref([])

// 体格检查
const vitalSigns = ref({
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  bloodPressure: ''
})
const physicalExam = ref('')

// 辅助检查
const auxiliaryExam = ref('')

// 四诊摘要
const fourDiagnosis = ref('')

// 处理
const treatment = ref('')

// 月经史（仅女性）
const menstrualHistory = ref({
  onset: '',
  cycle: '',
  duration: '',
  lastMenstrual: '',
  regularity: '',
  remarks: ''
})

// 诊断（保留原有功能）
const localDiagnoses = ref([...props.diagnoses])
const diagnosisTypes = ref([])

// ==================== 常量定义 ====================
// 常见症状
const commonSymptoms = [
  '发热', '咳嗽', '咳痰', '胸痛', '呼吸困难',
  '头痛', '头晕', '恶心', '呕吐', '腹痛',
  '腹泻', '关节痛', '乏力', '食欲不振', '口干',
  '盗汗', '心悸', '水肿', '失眠', '焦虑'
]

// 常见既往史
const commonPastHistory = [
  '高血压', '糖尿病', '冠心病', '心肌梗死', '心力衰竭',
  '慢性阻塞性肺疾病', '哮喘', '肝炎', '肝硬化', '肾病综合征',
  '脑梗死', '脑出血', '甲状腺功能亢进', '甲状腺功能减退',
  '手术史', '外伤史', '输血史', '过敏史', '吸烟史', '饮酒史'
]

// 常见家族史
const commonFamilyHistory = [
  '高血压家族史', '糖尿病家族史', '冠心病家族史', '脑血管病家族史',
  '恶性肿瘤家族史', '结核病家族史', '遗传性疾病家族史', '精神病家族史'
]

// ==================== 计算属性 ====================
// 是否显示症状标签
const showSymptoms = computed(() => {
  return localPresentIllness.value === '急性' || localPresentIllness.value === '亚急性'
})

// 是否为女性患者
const isFemalePatient = computed(() => {
  return props.patientGender === '女' || props.patientGender === 'female'
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

// ==================== 监听器 ====================
watch(() => props.chiefComplaint, (val) => {
  localChiefComplaint.value = val
})

watch(() => props.presentIllness, (val) => {
  localPresentIllness.value = val
})

watch(() => props.diagnoses, (val) => {
  localDiagnoses.value = [...val]
}, { deep: true })

// ==================== setFormData 方法（供父组件调用） ====================
function setFormData(data) {
  console.log('StructuredForm: 设置表单数据', data)
  
  if (data.chiefComplaint !== undefined) {
    localChiefComplaint.value = data.chiefComplaint
    emit('update:chiefComplaint', data.chiefComplaint)
  }
  
  if (data.presentIllnessType !== undefined) {
    localPresentIllness.value = data.presentIllnessType
    emit('update:presentIllness', data.presentIllnessType)
  }
  
  if (data.symptoms !== undefined && Array.isArray(data.symptoms)) {
    selectedSymptoms.value = data.symptoms
  }
  
  if (data.symptomDescription !== undefined) {
    symptomDescription.value = data.symptomDescription
  }
  
  if (data.pastHistory !== undefined && Array.isArray(data.pastHistory)) {
    selectedPastHistory.value = data.pastHistory
  }
  
  if (data.familyHistory !== undefined && Array.isArray(data.familyHistory)) {
    selectedFamilyHistory.value = data.familyHistory
  }
  
  if (data.diagnoses !== undefined) {
    const diagnoses = Array.isArray(data.diagnoses) ? data.diagnoses : [data.diagnoses]
    localDiagnoses.value = diagnoses
    emit('update:diagnoses', diagnoses)
  }
  
  if (data.vitalSigns !== undefined) {
    vitalSigns.value = { ...vitalSigns.value, ...data.vitalSigns }
  }
  
  if (data.physicalExam !== undefined) {
    physicalExam.value = data.physicalExam
  }
  
  if (data.auxiliaryExam !== undefined) {
    auxiliaryExam.value = data.auxiliaryExam
  }
  
  if (data.fourDiagnosis !== undefined) {
    fourDiagnosis.value = data.fourDiagnosis
  }
  
  if (data.treatment !== undefined) {
    treatment.value = data.treatment
  }
  
  if (data.menstrualHistory !== undefined && isFemalePatient.value) {
    menstrualHistory.value = { ...menstrualHistory.value, ...data.menstrualHistory }
  }
  
  emit('change', { field: 'structuredData', value: data })
}

// ==================== 事件处理函数 ====================
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

function updateFamilyHistory() {
  emit('change', { field: 'familyHistory', value: selectedFamilyHistory.value })
}

function updateVitalSigns() {
  emit('change', { field: 'vitalSigns', value: vitalSigns.value })
}

function updatePhysicalExam() {
  emit('change', { field: 'physicalExam', value: physicalExam.value })
}

function updateAuxiliaryExam() {
  emit('change', { field: 'auxiliaryExam', value: auxiliaryExam.value })
}

function updateFourDiagnosis() {
  emit('change', { field: 'fourDiagnosis', value: fourDiagnosis.value })
}

function updateTreatment() {
  emit('change', { field: 'treatment', value: treatment.value })
}

function updateMenstrualHistory() {
  emit('change', { field: 'menstrualHistory', value: menstrualHistory.value })
}

// ==================== 诊断相关方法（保留） ====================
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

// 暴露方法给父组件
defineExpose({
  setFormData
})
</script>

<style scoped>
.structured-form {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
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
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.symptom-tag:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
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

.history-select {
  width: 100%;
}

.diagnosis-item {
  margin-bottom: 10px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

:deep(.el-radio-button__inner) {
  padding: 8px 16px;
}
</style>