<!-- src/views/EMREditorView.vue -->
<template>
  <div class="emr-editor-view">
    <!-- 患者信息卡片 -->
    <el-card v-if="currentPatient" class="patient-info-card" shadow="hover">
      <div class="patient-info-header">
        <h3>患者信息</h3>
        <el-tag :type="emrStatus === 'completed' ? 'success' : 'danger'">
          {{ emrStatus === 'completed' ? '已完成' : '未完成' }}
        </el-tag>
      </div>
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="info-item">
            <span class="label">姓名：</span>
            <span class="value">{{ currentPatient.name }}</span>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="info-item">
            <span class="label">性别：</span>
            <span class="value">{{ currentPatient.gender }}</span>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="info-item">
            <span class="label">年龄：</span>
            <span class="value">{{ currentPatient.age }}岁</span>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="info-item">
            <span class="label">住院号：</span>
            <span class="value">{{ currentPatient.id }}</span>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="info-item">
            <span class="label">床号：</span>
            <span class="value">{{ currentPatient.bedNumber }}</span>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="info-item">
            <span class="label">入院日期：</span>
            <span class="value">{{ currentPatient.admissionDate }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="info-item diagnosis">
            <span class="label">诊断：</span>
            <span class="value">{{ currentPatient.diagnosis }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 如果没有患者信息，显示加载中或错误提示 -->
    <el-alert
      v-else
      title="正在加载患者信息..."
      type="info"
      :closable="false"
      show-icon
    />

    <!-- 编辑器组件 - 使用正确的路径 -->
    <EMREditor 
      ref="editorRef"
      :patient-id="patientId"
      :emr-id="emrId"
      @save="handleSave"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
// 修改这里的导入路径 - 使用 @ 别名
import EMREditor from '@/components/editor/EMREditor.vue'
import { usePatientStore } from '@/stores/patientStore'
import { useEmrRecordStore } from '@/stores/emrRecordStore'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const emrRecordStore = useEmrRecordStore()

// 从路由参数获取患者ID
const patientId = ref(route.params.patientId)
const emrId = ref(route.query.emrId || `emr_${Date.now()}`)
const editorRef = ref(null)
const emrStatus = ref('pending')
const loadingPatient = ref(true)

// 当前患者
const currentPatient = computed(() => patientStore.currentPatient)

// 加载患者信息
async function loadPatientInfo() {
  console.log('加载患者信息，患者ID:', patientId.value)
  loadingPatient.value = true
  
  try {
    if (patientId.value) {
      // 先从 store 中查找
      let patient = patientStore.getPatientById(patientId.value)
      console.log('从store找到的患者:', patient)
      
      // 如果 store 中没有，从 mock 数据中查找
      if (!patient) {
        // 导入患者数据
        const patientsData = await import('@/mock/patients.json')
        patient = patientsData.default.find(p => p.id === patientId.value)
        console.log('从mock数据找到的患者:', patient)
      }
      
      if (patient) {
        patientStore.setCurrentPatient(patient)
      } else {
        console.error('未找到患者，ID:', patientId.value)
        ElMessage.error('未找到患者信息')
      }
    } else {
      console.error('没有患者ID')
      ElMessage.error('缺少患者ID')
    }
  } catch (error) {
    console.error('加载患者信息失败:', error)
    ElMessage.error('加载患者信息失败')
  } finally {
    loadingPatient.value = false
  }
}

onMounted(() => {
  console.log('EMREditorView mounted，路由参数:', route.params)
  loadPatientInfo()
})

function handleSave() {
  ElMessage.success('病历保存成功')
}

function handleSubmit() {
  ElMessageBox.confirm('确认提交病历？提交后将不可修改', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 创建病历记录并提交
    if (currentPatient.value) {
      console.log('=== 开始提交病历 ===')
      console.log('当前患者:', currentPatient.value)
      
      // 创建病历记录对象
      const emrRecord = {
        id: emrId.value,
        patientId: currentPatient.value.id,
        patientName: currentPatient.value.name,
        gender: currentPatient.value.gender,
        age: currentPatient.value.age,
        type: '病历记录',
        createTime: new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-'),
        status: 'completed',
        alert: null,
        diagnosis: currentPatient.value.diagnosis
      }
      
      console.log('准备添加的记录:', emrRecord)
      
      // 调用 store 的方法添加记录
      const addedRecord = emrRecordStore.addRecord(emrRecord)
      console.log('addRecord 返回:', addedRecord)
      
      // 同时更新状态（如果是已有记录）
      const updatedRecord = emrRecordStore.updateRecordStatus(currentPatient.value.id, emrId.value)
      console.log('updateRecordStatus 返回:', updatedRecord)
      
      // 查看当前 store 中的所有记录
      console.log('当前 store 中的所有记录:', emrRecordStore.recentEmrRecords)
    }
    
    emrStatus.value = 'completed'
    ElMessage.success('病历提交成功')
    
    // 延迟后返回工作台
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }).catch(() => {})
}
</script>

<style scoped>
.emr-editor-view {
  padding: 0;
  height: 100%;
}

.patient-info-card {
  margin-bottom: 20px;
}

.patient-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.patient-info-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.info-item {
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
  margin-right: 5px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.info-item.diagnosis .value {
  color: #409eff;
}
</style>