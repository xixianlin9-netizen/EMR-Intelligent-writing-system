<!-- src/views/QualityManageView.vue -->
<template>
  <div class="quality-manage">
    <el-card class="header-card">
      <h2>📋 病历质控管理</h2>
      <p class="subtitle">对患者病历进行质量检查和评分</p>
    </el-card>

    <!-- 功能按钮栏 -->
    <div class="action-buttons" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
      <el-button type="primary" plain @click="showStatistics = true" :icon="DataAnalysis">统计图表</el-button>
      <el-button type="warning" plain @click="showRuleConfig = true" :icon="Setting">规则配置</el-button>
      <el-button type="info" plain @click="showNotifications = true" :icon="Bell">
        通知
        <el-badge v-if="unreadCount > 0" :value="unreadCount" class="badge" />
      </el-button>
      <el-button type="success" plain @click="exportReport" :icon="Download" :disabled="!qcResult">导出报告</el-button>
      
      <!-- 批量操作按钮 -->
      <el-divider direction="vertical" />
      <el-button type="primary" @click="selectAll" :icon="Select">全选</el-button>
      <el-button type="primary" plain @click="clearSelection" :icon="Close">取消全选</el-button>
      <el-button 
        type="danger" 
        @click="batchQualityCheck" 
        :loading="batchChecking"
        :disabled="selectedPatients.length === 0"
        :icon="DocumentChecked"
      >
        批量质控 ({{ selectedPatients.length }})
      </el-button>
    </div>
    
    <el-row :gutter="20">
      <!-- 左侧：患者列表（带多选框） -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>
                患者列表
                <el-tag v-if="selectedPatients.length > 0" type="success" size="small" style="margin-left: 8px">
                  已选 {{ selectedPatients.length }} 人
                </el-tag>
              </span>
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
            <!-- 表头：全选复选框 -->
            <div class="list-header">
              <el-checkbox 
                v-model="isAllSelected" 
                :indeterminate="isIndeterminate"
                @change="handleSelectAll"
              >
                全选
              </el-checkbox>
              <span class="header-tip">点击患者可查看详情</span>
            </div>
            
            <div 
              v-for="patient in filteredPatients" 
              :key="patient.id"
              class="patient-item"
              :class="{ active: selectedPatient?.id === patient.id }"
            >
              <div class="patient-checkbox">
                <el-checkbox 
                  :model-value="isPatientSelected(patient.id)"
                  @change="toggleSelectPatient(patient)"
                />
              </div>
              <div class="patient-content" @click="selectPatient(patient)">
                <div class="patient-name">{{ patient.name }}</div>
                <div class="patient-info">
                  <span>{{ patient.gender }} {{ patient.age }}岁</span>
                  <el-tag :type="getEmrStatusType(patient)" size="small">
                    {{ getEmrStatusText(patient) }}
                  </el-tag>
                </div>
                <div class="patient-diagnosis">{{ patient.diagnosis || '未填写诊断' }}</div>
              </div>
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
        
        <!-- 批量质控结果展示 -->
        <el-card v-else-if="batchResults.length > 0">
          <template #header>
            <div class="card-header">
              <span>批量质控结果</span>
              <el-button type="primary" link @click="exportBatchReport">导出批量报告</el-button>
            </div>
          </template>
          
          <el-table :data="batchResults" stripe style="width: 100%">
            <el-table-column prop="patientName" label="患者姓名" width="100" />
            <el-table-column prop="score" label="得分" width="80" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.score >= 60 ? '#67c23a' : '#f56c6c' }">
                  {{ row.score }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="grade" label="等级" width="80" align="center" />
            <el-table-column prop="passed" label="是否通过" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.passed ? 'success' : 'danger'" size="small">
                  {{ row.passed ? '通过' : '不通过' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="issues" label="问题数" width="80" align="center">
              <template #default="{ row }">
                <el-badge :value="row.issues.length" :type="row.issues.length > 0 ? 'danger' : 'success'">
                  <span>{{ row.issues.length }}个</span>
                </el-badge>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="viewBatchDetail(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 批量统计 -->
          <div class="batch-stats">
            <el-divider />
            <el-row :gutter="16">
              <el-col :span="6">
                <div class="batch-stat-item">
                  <div class="stat-value">{{ batchResults.length }}</div>
                  <div class="stat-label">总质控数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="batch-stat-item">
                  <div class="stat-value">{{ batchPassCount }}</div>
                  <div class="stat-label">通过数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="batch-stat-item">
                  <div class="stat-value">{{ batchFailCount }}</div>
                  <div class="stat-label">不通过数</div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="batch-stat-item">
                  <div class="stat-value">{{ batchPassRate }}%</div>
                  <div class="stat-label">通过率</div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
        
        <el-empty v-else description="请从左侧选择一位患者，或勾选多个患者进行批量质控" />
      </el-col>
    </el-row>

    <!-- 统计图表抽屉 -->
    <el-drawer v-model="showStatistics" title="质控统计分析" size="60%" direction="rtl">
      <QualityStatistics :qc-records="qcStore.qcRecords" />
    </el-drawer>

    <!-- 规则配置抽屉 -->
    <RuleConfig v-model="showRuleConfig" :rules="qcRules" @save="handleRuleSave" />

    <!-- 通知抽屉 -->
    <el-drawer v-model="showNotifications" title="通知中心" size="400px" direction="rtl">
      <div class="notification-list">
        <div 
          v-for="notif in notifications" 
          :key="notif.id" 
          class="notification-item" 
          :class="{ unread: !notif.read }" 
          @click="markAsRead(notif.id)"
        >
          <div class="notif-title">{{ notif.title }}</div>
          <div class="notif-message">{{ notif.message }}</div>
          <div class="notif-time">{{ formatTime(notif.time) }}</div>
        </div>
        <el-empty v-if="notifications.length === 0" description="暂无通知" />
      </div>
    </el-drawer>

    <!-- 批量详情对话框 -->
    <el-dialog v-model="showBatchDetail" :title="`${batchDetailPatient?.name} - 质控详情`" width="600px">
      <div v-if="batchDetailResult">
        <div class="score-area" :class="getScoreClass(batchDetailResult.score)" style="margin-bottom: 20px;">
          <div class="score-number">{{ batchDetailResult.score }}</div>
          <div class="score-label">总分</div>
          <div class="score-grade">等级 {{ batchDetailResult.grade }}</div>
        </div>
        
        <div v-if="batchDetailResult.issues.length > 0">
          <el-alert title="发现以下问题" type="warning" :closable="false" />
          <el-table :data="batchDetailResult.issues" size="small" style="margin-top: 12px">
            <el-table-column prop="ruleName" label="检查项" width="120" />
            <el-table-column prop="message" label="问题描述" />
            <el-table-column prop="score" label="扣分" width="80" align="center">
              <template #default="{ row }">
                <el-tag type="danger" size="small">-{{ row.score }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else>
          <el-result icon="success" title="质控通过" sub-title="病历质量合格" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DocumentChecked, DataAnalysis, Setting, Bell, Download, Select, Close } from '@element-plus/icons-vue'
import { useQualityControlStore } from '@/stores/qualityControlStore'
import QualityStatistics from '@/components/quality/QualityStatistics.vue'
import RuleConfig from '@/components/quality/RuleConfig.vue'
import { notificationService } from '@/utils/notificationService'
import { reportExporter } from '@/utils/reportExporter'
import patientsData from '@/mock/patients.json'

const qcStore = useQualityControlStore()

const searchText = ref('')
const selectedPatient = ref(null)
const emrData = ref({})
const qcResult = ref(null)
const checking = ref(false)

// 批量质控相关
const selectedPatientsIds = ref([])  // 存储选中的患者ID
const batchResults = ref([])  // 批量质控结果
const batchChecking = ref(false)
const showBatchDetail = ref(false)
const batchDetailPatient = ref(null)
const batchDetailResult = ref(null)

// 新增：UI控制变量
const showStatistics = ref(false)
const showRuleConfig = ref(false)
const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = ref(0)

// 患者列表（直接从 mock 数据读取）
const patients = ref([])

// 获取质控规则（用于规则配置）
const qcRules = computed(() => qcStore.qcRules)

// 计算属性：当前显示的患者列表（筛选后）
const filteredPatients = computed(() => {
  if (!searchText.value) return patients.value
  return patients.value.filter(p => 
    p.name?.includes(searchText.value) || 
    p.id?.includes(searchText.value)
  )
})

// 计算属性：选中的患者对象列表
const selectedPatients = computed(() => {
  return patients.value.filter(p => selectedPatientsIds.value.includes(p.id))
})

// 全选状态
const isAllSelected = computed(() => {
  if (filteredPatients.value.length === 0) return false
  return filteredPatients.value.every(p => selectedPatientsIds.value.includes(p.id))
})

// 半选状态
const isIndeterminate = computed(() => {
  const selectedCount = filteredPatients.value.filter(p => selectedPatientsIds.value.includes(p.id)).length
  return selectedCount > 0 && selectedCount < filteredPatients.value.length
})

// 批量统计
const batchPassCount = computed(() => batchResults.value.filter(r => r.passed).length)
const batchFailCount = computed(() => batchResults.value.filter(r => !r.passed).length)
const batchPassRate = computed(() => {
  if (batchResults.value.length === 0) return 0
  return Math.round((batchPassCount.value / batchResults.value.length) * 100)
})

// 加载患者数据
const loadPatients = () => {
  try {
    patients.value = patientsData.map(p => ({
      ...p,
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

// 判断患者是否选中
const isPatientSelected = (patientId) => {
  return selectedPatientsIds.value.includes(patientId)
}

// 切换选中状态
const toggleSelectPatient = (patient) => {
  const index = selectedPatientsIds.value.indexOf(patient.id)
  if (index > -1) {
    selectedPatientsIds.value.splice(index, 1)
  } else {
    selectedPatientsIds.value.push(patient.id)
  }
}

// 全选
const selectAll = () => {
  const allIds = filteredPatients.value.map(p => p.id)
  selectedPatientsIds.value = [...new Set([...selectedPatientsIds.value, ...allIds])]
  ElMessage.success(`已选中 ${selectedPatientsIds.value.length} 位患者`)
}

// 取消全选
const clearSelection = () => {
  selectedPatientsIds.value = []
  ElMessage.info('已取消所有选中')
}

// 全选/取消全选（复选框）
const handleSelectAll = (val) => {
  if (val) {
    selectAll()
  } else {
    clearSelection()
  }
}

// 批量质控
const batchQualityCheck = async () => {
  if (selectedPatientsIds.value.length === 0) {
    ElMessage.warning('请先选择患者')
    return
  }
  
  batchChecking.value = true
  batchResults.value = []
  
  let successCount = 0
  let failCount = 0
  
  for (const patientId of selectedPatientsIds.value) {
    const patient = patients.value.find(p => p.id === patientId)
    if (!patient) continue
    
    // 构建病历数据
    const patientEmrData = {
      chiefComplaint: patient.chiefComplaint || '',
      presentIllness: patient.presentIllness || '',
      diagnosis: patient.diagnosis || '',
      physicalExam: patient.physicalExam || '',
      auxiliaryExam: patient.auxiliaryExam || '',
      treatmentPlan: patient.treatmentPlan || ''
    }
    
    // 执行质控
    const result = qcStore.performQC(patientEmrData)
    qcStore.saveQC(patient.id, result)
    
    // 记录结果
    batchResults.value.push({
      patientId: patient.id,
      patientName: patient.name,
      score: result.score,
      grade: result.grade,
      passed: result.passed,
      issues: result.issues,
      checkTime: new Date().toISOString()
    })
    
    if (result.passed) {
      successCount++
      // 通过时发送通知
      notificationService.notifyQualityPassed(patient.name, 'doctor_001', result.score)
    } else {
      failCount++
      // 不通过时发送通知
      notificationService.notifyQualityFailed(patient.name, 'doctor_001', result.score, result.issues)
    }
    
    // 添加小延迟，避免UI卡顿
    await new Promise(r => setTimeout(r, 50))
  }
  
  batchChecking.value = false
  loadNotifications()
  
  ElMessage.success(`批量质控完成！通过：${successCount}，不通过：${failCount}`)
  
  // 如果有不通过的，弹出警告
  if (failCount > 0) {
    ElMessage.warning(`${failCount} 份病历未通过质控，请查看详情`)
  }
  
  // 清空选中状态
  selectedPatientsIds.value = []
}

// 查看批量质控详情
const viewBatchDetail = (row) => {
  const patient = patients.value.find(p => p.id === row.patientId)
  batchDetailPatient.value = patient
  batchDetailResult.value = {
    score: row.score,
    grade: row.grade,
    passed: row.passed,
    issues: row.issues
  }
  showBatchDetail.value = true
}

// 导出批量报告
const exportBatchReport = async () => {
  if (batchResults.value.length === 0) return
  
  // 生成批量报告HTML
  const reportHtml = generateBatchReportHtml(batchResults.value)
  const blob = new Blob([reportHtml], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `批量质控报告_${new Date().toISOString().split('T')[0]}.html`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// 生成批量报告HTML
const generateBatchReportHtml = (results) => {
  const passCount = results.filter(r => r.passed).length
  const failCount = results.filter(r => !r.passed).length
  
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>批量质控报告</title>
    <style>
      body { font-family: 'Microsoft YaHei', sans-serif; padding: 40px; max-width: 1000px; margin: 0 auto; }
      .header { text-align: center; border-bottom: 2px solid #409EFF; padding-bottom: 20px; margin-bottom: 30px; }
      .title { font-size: 24px; color: #303133; margin: 0; }
      .summary { display: flex; gap: 20px; margin: 20px 0; padding: 20px; background: #f5f7fa; border-radius: 8px; }
      .summary-item { flex: 1; text-align: center; }
      .summary-value { font-size: 32px; font-weight: bold; }
      .summary-label { color: #909399; margin-top: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #EBEEF5; padding: 10px; text-align: left; }
      th { background: #f5f7fa; }
      .pass { color: #67C23A; }
      .fail { color: #F56C6C; }
      .footer { text-align: center; color: #909399; margin-top: 40px; padding-top: 20px; border-top: 1px solid #EBEEF5; }
    </style>
    </head>
    <body>
      <div class="header"><h1 class="title">批量质控报告</h1><p>生成时间：${new Date().toLocaleString()}</p></div>
      <div class="summary">
        <div class="summary-item"><div class="summary-value">${results.length}</div><div class="summary-label">总质控数</div></div>
        <div class="summary-item"><div class="summary-value" style="color:#67C23A">${passCount}</div><div class="summary-label">通过数</div></div>
        <div class="summary-item"><div class="summary-value" style="color:#F56C6C">${failCount}</div><div class="summary-label">不通过数</div></div>
        <div class="summary-item"><div class="summary-value">${Math.round((passCount/results.length)*100)}%</div><div class="summary-label">通过率</div></div>
      </div>
      <table>
        <thead><tr><th>患者姓名</th><th>得分</th><th>等级</th><th>状态</th><th>问题数</th></tr></thead>
        <tbody>
          ${results.map(r => `<tr><td>${r.patientName}</td><td>${r.score}</td><td>${r.grade}</td><td class="${r.passed ? 'pass' : 'fail'}">${r.passed ? '通过' : '不通过'}</td><td>${r.issues.length}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="footer"><p>电子病历智能书写系统 - 批量质控报告</p></div>
    </body>
    </html>
  `
}

// 历史记录
const historyRecords = computed(() => {
  if (!selectedPatient.value) return []
  return qcStore.getQC(selectedPatient.value.id)
})

// 选择患者
const selectPatient = (patient) => {
  selectedPatient.value = patient
  emrData.value = {
    chiefComplaint: patient.chiefComplaint || '',
    presentIllness: patient.presentIllness || '',
    diagnosis: patient.diagnosis || '',
    physicalExam: patient.physicalExam || '',
    auxiliaryExam: patient.auxiliaryExam || '',
    treatmentPlan: patient.treatmentPlan || ''
  }
  qcResult.value = qcStore.getLatestQC(patient.id)
}

// 执行质控（单个）
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
    
    if (!result.passed) {
      notificationService.notifyQualityFailed(
        selectedPatient.value.name, 
        'doctor_001', 
        result.score, 
        result.issues
      )
    } else {
      notificationService.notifyQualityPassed(
        selectedPatient.value.name, 
        'doctor_001', 
        result.score
      )
    }
    loadNotifications()
    
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

// 获取得分样式（用于批量详情）
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 75) return 'score-good'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 格式化时间
const formatTime = (time) => new Date(time).toLocaleString('zh-CN')

// ========== 新增功能方法 ==========

// 加载通知
const loadNotifications = () => {
  notifications.value = notificationService.getUnreadNotifications('doctor_001')
  unreadCount.value = notifications.value.length
}

// 标记通知为已读
const markAsRead = (id) => {
  notificationService.markAsRead(id)
  loadNotifications()
}

// 保存规则配置
const handleRuleSave = (newRules) => {
  console.log('规则已更新:', newRules)
  ElMessage.success('规则配置已保存')
}

// 导出报告
const exportReport = async () => {
  if (!qcResult.value || !selectedPatient.value) {
    ElMessage.warning('请先进行质控检查')
    return
  }
  await reportExporter.exportQualityReport(
    selectedPatient.value, 
    qcResult.value, 
    historyRecords.value
  )
}

// 页面加载时加载患者数据
onMounted(() => {
  loadPatients()
  notificationService.requestNotificationPermission()
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

/* 患者列表样式 */
.patient-list { max-height: 600px; overflow-y: auto; }
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}
.header-tip { color: #909399; font-size: 12px; }

.patient-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.2s;
}
.patient-item:hover { background: #f5f7fa; }
.patient-item.active { background: #ecf5ff; border-left: 3px solid #409eff; }

.patient-checkbox { margin-right: 12px; padding-top: 2px; }
.patient-content { flex: 1; }

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

/* 批量统计样式 */
.batch-stats { margin-top: 20px; }
.batch-stat-item {
  text-align: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}
.batch-stat-item .stat-value { font-size: 24px; font-weight: bold; color: #409EFF; }
.batch-stat-item .stat-label { font-size: 13px; color: #909399; margin-top: 4px; }

/* 其他样式 */
.action-buttons { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
.badge { margin-left: 4px; }
.notification-list { max-height: 600px; overflow-y: auto; }
.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background 0.2s;
}
.notification-item:hover { background: #f5f7fa; }
.notification-item.unread { background: #ecf5ff; }
.notif-title { font-weight: bold; margin-bottom: 6px; }
.notif-message { font-size: 13px; color: #606266; margin-bottom: 6px; }
.notif-time { font-size: 12px; color: #909399; }
</style>