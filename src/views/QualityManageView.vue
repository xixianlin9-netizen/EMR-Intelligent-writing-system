<!-- src/views/QualityManageView.vue -->
<template>
  <div class="quality-manage">
    <el-card class="header-card">
      <h2>📋 病历质控管理</h2>
      <p class="subtitle">对患者病历进行质量检查和评分</p>
    </el-card>
    
    <el-row :gutter="20">
      <!-- 左侧：患者列表 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>患者列表</span>
              <el-input 
                v-model="searchText" 
                placeholder="搜索患者" 
                size="small" 
                style="width: 140px"
                clearable
              />
            </div>
          </template>
          
          <div class="patient-list">
            <div 
              v-for="patient in filteredPatients" 
              :key="patient.id"
              class="patient-item"
              :class="{ active: selectedPatient?.id === patient.id }"
              @click="selectPatient(patient)"
            >
              <div class="patient-name">{{ patient.name }}</div>
              <div class="patient-info">
                <span>{{ patient.gender }} {{ patient.age }}岁</span>
                <el-tag :type="getEmrStatusType(patient)" size="small">
                  {{ getEmrStatusText(patient) }}
                </el-tag>
              </div>
              <div class="patient-diagnosis">{{ patient.diagnosis || '未填写诊断' }}</div>
            </div>
            
            <el-empty v-if="filteredPatients.length === 0" description="暂无患者" />
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：质控详情 -->
      <el-col :span="16">
        <el-card v-if="selectedPatient">
          <template #header>
            <div class="card-header">
              <span>
                <strong>{{ selectedPatient.name }}</strong> - 病历质控
                <el-tag :type="getEmrStatusType(selectedPatient)" size="small" style="margin-left: 10px">
                  {{ getEmrStatusText(selectedPatient) }}
                </el-tag>
              </span>
              <el-button type="primary" @click="runQualityCheck" :loading="checking">
                <el-icon><DocumentChecked /></el-icon>
                开始质控
              </el-button>
            </div>
          </template>
          
          <!-- 病历内容预览 -->
          <div class="emr-preview">
            <h4>病历内容</h4>
            <div class="preview-item">
              <strong>主诉：</strong>{{ emrData.chiefComplaint || '未填写' }}
            </div>
            <div class="preview-item">
              <strong>现病史：</strong>{{ emrData.presentIllness || '未填写' }}
            </div>
            <div class="preview-item">
              <strong>诊断：</strong>{{ emrData.diagnosis || '未填写' }}
            </div>
            <div class="preview-item">
              <strong>体格检查：</strong>{{ emrData.physicalExam || '未填写' }}
            </div>
            <div class="preview-item">
              <strong>辅助检查：</strong>{{ emrData.auxiliaryExam || '未填写' }}
            </div>
          </div>
          
          <!-- 质控结果 -->
          <div v-if="qcResult" class="qc-result">
            <el-divider />
            <h4>质控结果</h4>
            
            <div class="score-area" :class="scoreClass">
              <div class="score-number">{{ qcResult.score }}</div>
              <div class="score-label">总分</div>
              <div class="score-grade">等级 {{ qcResult.grade }}</div>
            </div>
            
            <div v-if="qcResult.issues.length > 0" class="issues">
              <el-alert title="发现以下问题，建议修改" type="warning" :closable="false" />
              <el-table :data="qcResult.issues" size="small" style="margin-top: 12px">
                <el-table-column prop="ruleName" label="检查项" width="120" />
                <el-table-column prop="message" label="问题描述" />
                <el-table-column prop="score" label="扣分" width="80" align="center">
                  <template #default="{ row }">
                    <el-tag type="danger" size="small">-{{ row.score }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <div v-else class="pass-result">
              <el-result icon="success" title="质控通过" sub-title="病历质量合格">
                <template #extra>
                  <el-button type="success" @click="markAsApproved">标记为已通过</el-button>
                </template>
              </el-result>
            </div>
            
            <div class="qc-actions" v-if="qcResult && !qcResult.passed">
              <el-button type="warning" @click="requestRevision">要求修改</el-button>
              <el-button type="danger" @click="reject">驳回</el-button>
            </div>
          </div>
          
          <!-- 历史记录 -->
          <div v-if="historyRecords.length > 0" class="history">
            <el-divider />
            <h4>质控历史</h4>
            <el-timeline>
              <el-timeline-item 
                v-for="record in historyRecords" 
                :key="record.time"
                :timestamp="formatTime(record.time)"
                :type="record.passed ? 'success' : 'danger'"
              >
                得分：{{ record.score }} ({{ record.grade }}级)
                <span v-if="record.issues.length">，发现{{ record.issues.length }}个问题</span>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
        
        <el-empty v-else description="请从左侧选择一位患者" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentChecked } from '@element-plus/icons-vue'
import { useQualityControlStore } from '@/stores/qualityControlStore'
import patientsData from '@/mock/patients.json'

const qcStore = useQualityControlStore()

const searchText = ref('')
const selectedPatient = ref(null)
const emrData = ref({})
const qcResult = ref(null)
const checking = ref(false)

// 患者列表（直接从 mock 数据读取）
const patients = ref([])

// 加载患者数据
const loadPatients = () => {
  try {
    patients.value = patientsData.map(p => ({
      ...p,
      // 确保有这些字段
      chiefComplaint: p.chiefComplaint || '',
      presentIllness: p.presentIllness || '',
      diagnosis: p.diagnosis || '',
      physicalExam: p.physicalExam || '',
      auxiliaryExam: p.auxiliaryExam || ''
    }))
    console.log('加载患者数据成功，共', patients.value.length, '人')
  } catch (error) {
    console.error('加载患者数据失败:', error)
    ElMessage.error('加载患者数据失败')
  }
}

// 筛选患者
const filteredPatients = computed(() => {
  if (!searchText.value) return patients.value
  return patients.value.filter(p => 
    p.name?.includes(searchText.value) || 
    p.id?.includes(searchText.value)
  )
})

// 历史记录
const historyRecords = computed(() => {
  if (!selectedPatient.value) return []
  return qcStore.getQC(selectedPatient.value.id)
})

// 选择患者
const selectPatient = (patient) => {
  selectedPatient.value = patient
  // 从患者数据中提取病历内容
  emrData.value = {
    chiefComplaint: patient.chiefComplaint || '',
    presentIllness: patient.presentIllness || '',
    diagnosis: patient.diagnosis || '',
    physicalExam: patient.physicalExam || '',
    auxiliaryExam: patient.auxiliaryExam || '',
    treatmentPlan: patient.treatmentPlan || ''
  }
  // 获取历史质控结果
  qcResult.value = qcStore.getLatestQC(patient.id)
}

// 执行质控
const runQualityCheck = async () => {
  if (!selectedPatient.value) {
    ElMessage.warning('请先选择患者')
    return
  }
  
  checking.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const result = qcStore.performQC(emrData.value)
    qcResult.value = result
    qcStore.saveQC(selectedPatient.value.id, result)
    
    if (result.passed) {
      ElMessage.success(`质控完成！得分：${result.score}，等级：${result.grade}`)
    } else {
      ElMessage.warning(`质控得分：${result.score}，存在${result.issues.length}个问题需要修改`)
    }
  } finally {
    checking.value = false
  }
}

// 标记为已通过
const markAsApproved = () => {
  ElMessageBox.confirm('确认该病历通过质控？', '确认', { type: 'success' })
    .then(() => {
      ElMessage.success('已标记为通过质控')
    })
    .catch(() => {})
}

// 要求修改
const requestRevision = () => {
  ElMessageBox.prompt('请输入修改意见', '要求修改', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputType: 'textarea'
  }).then(({ value }) => {
    ElMessage.info(`已通知医生修改：${value}`)
  }).catch(() => {})
}

// 驳回
const reject = () => {
  ElMessageBox.confirm('确认驳回该病历？', '驳回', { type: 'warning' })
    .then(() => {
      ElMessage.error('已驳回')
    })
    .catch(() => {})
}

// 获取病历状态类型
const getEmrStatusType = (patient) => {
  // 可以根据患者是否有病历记录来判断
  if (patient.emrStatus === 'completed') return 'success'
  if (patient.emrStatus === 'pending') return 'warning'
  return 'info'
}

// 获取病历状态文本
const getEmrStatusText = (patient) => {
  if (patient.emrStatus === 'completed') return '已完成'
  if (patient.emrStatus === 'pending') return '待质控'
  return '未开始'
}

// 得分样式
const scoreClass = computed(() => {
  if (!qcResult.value) return ''
  const s = qcResult.value.score
  if (s >= 90) return 'score-excellent'
  if (s >= 75) return 'score-good'
  if (s >= 60) return 'score-pass'
  return 'score-fail'
})

// 格式化时间
const formatTime = (time) => new Date(time).toLocaleString('zh-CN')

// 页面加载时加载患者数据
onMounted(() => {
  loadPatients()
})
</script>

<style scoped>
.quality-manage { padding: 20px; }
.header-card { margin-bottom: 20px; }
.header-card h2 { margin: 0 0 8px 0; }
.subtitle { color: #909399; margin: 0; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-list { max-height: 600px; overflow-y: auto; }
.patient-item {
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.2s;
}
.patient-item:hover { background: #f5f7fa; }
.patient-item.active { background: #ecf5ff; border-left: 3px solid #409eff; }
.patient-name { font-weight: bold; margin-bottom: 6px; }
.patient-info { display: flex; justify-content: space-between; font-size: 12px; color: #909399; margin-bottom: 6px; }
.patient-diagnosis { font-size: 13px; color: #606266; }

.emr-preview { background: #fafafa; padding: 16px; border-radius: 8px; }
.preview-item { margin-bottom: 12px; line-height: 1.6; }

.score-area {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  margin: 16px 0;
}
.score-number { font-size: 48px; font-weight: bold; }
.score-label { font-size: 14px; color: #909399; }
.score-grade { font-size: 16px; margin-top: 8px; }
.score-excellent { background: #f0f9eb; color: #67c23a; }
.score-good { background: #ecf5ff; color: #409eff; }
.score-pass { background: #fdf6ec; color: #e6a23c; }
.score-fail { background: #fef0f0; color: #f56c6c; }

.pass-result { margin: 20px 0; }
.qc-actions { display: flex; gap: 12px; justify-content: center; margin: 20px 0; }
.history { margin-top: 20px; }
</style>