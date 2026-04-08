<!-- src/views/DashboardView.vue - 删除快捷操作卡片后的版本 -->
<template>
  <div class="dashboard">
    <!-- 告警区域 - 仅住院模式显示 -->
    <template v-if="isInpatient && alerts && alerts.length > 0">
      <el-alert
        v-for="(alert, index) in alerts"
        :key="index"
        :title="alert.message"
        :type="alert.level === 'error' ? 'error' : alert.level"
        :closable="false"
        show-icon
        class="alert-item"
      />
    </template>

    <!-- 门诊模式提示条 -->
    <el-alert
      v-if="isOutpatient"
      title="门诊模式"
      description="当前为门诊电子病历系统，支持初诊记录、复诊记录、门诊小结等功能。"
      type="info"
      show-icon
      :closable="false"
      class="alert-item"
    />

    <!-- 住院模式提示条 -->
    <el-alert
      v-if="isInpatient"
      title="住院模式"
      description="当前为住院电子病历系统，支持入院记录、病程记录、出院小结等功能，病历超时会自动告警。"
      type="success"
      show-icon
      :closable="false"
      class="alert-item"
    />

    <el-row :gutter="20" class="mt-20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="card in statsCards" :key="card.key">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ card.label }}</span>
              <el-tag type="success">+{{ getStatsIncrease(card.key) }}</el-tag>
            </div>
          </template>
          <div class="stat-number">{{ getStatsValue(card.key) }}</div>
          <div class="stat-desc">{{ getStatsDesc(card.key) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ isOutpatient ? '最近门诊病历' : '最近编辑病历' }}</span>
              <el-button link type="primary" @click="$router.push('/patients')">查看更多</el-button>
            </div>
          </template>
          
          <el-table :data="recentEmrRecords || []" stripe style="width: 100%" :key="tableKey">
            <el-table-column prop="patientName" label="患者姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="60" />
            <el-table-column prop="age" label="年龄" width="60" />
            <el-table-column prop="type" label="病历类型" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="getRecordTypeTag(row.type)">
                  {{ getRecordTypeName(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="120" />
            <el-table-column prop="diagnosis" label="诊断" min-width="150" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <span :class="row.status === 'completed' ? 'status-completed' : 'status-pending'">
                  {{ row.status === 'completed' ? '已完成' : '未完成' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="告警" width="80" v-if="isInpatient">
              <template #default="{ row }">
                <el-tooltip 
                  v-if="row.alert" 
                  :content="row.alert.message"
                  placement="top"
                >
                  <el-icon :color="row.alert.level === 'warning' ? '#e6a23c' : '#f56c6c'">
                    <WarningFilled />
                  </el-icon>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  link 
                  @click="continueEdit(row)"
                  :disabled="row.status === 'completed'"
                >
                  {{ row.status === 'completed' ? '查看' : '继续编辑' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <el-empty v-if="!recentEmrRecords || recentEmrRecords.length === 0" description="暂无病历记录" />
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <!-- 常用模板卡片 -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>常用模板</span>
              <el-button link type="primary" @click="$router.push('/template-library')">管理</el-button>
            </div>
          </template>
          <div class="template-list">
            <div v-for="template in commonTemplates" :key="template.id" class="template-item">
              <el-icon><Document /></el-icon>
              <span>{{ template.name }}</span>
              <el-button link type="primary" size="small" @click="useTemplate(template)">使用</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { Document, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEmrRecordStore } from '@/stores/emrRecordStore'
import { usePatientStore } from '@/stores/patientStore'
import { useSystemModeStore } from '@/stores/systemModeStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const emrRecordStore = useEmrRecordStore()
const patientStore = usePatientStore()
const systemModeStore = useSystemModeStore()

// 使用 storeToRefs 保持响应性
const { recentEmrRecords, alerts, pendingCount, alertCount } = storeToRefs(emrRecordStore)
const { isOutpatient, isInpatient, currentConfig } = systemModeStore

// 强制重新渲染的 key
const tableKey = ref(0)

// 统计卡片配置 - 添加默认值防止 undefined
const statsCards = computed(() => {
  return currentConfig.value?.statsCards || [
    { key: 'todayVisits', label: '今日门诊量', icon: 'User' },
    { key: 'pendingRecords', label: '待完成病历', icon: 'Document' },
    { key: 'totalPatients', label: '累计患者', icon: 'Users' },
    { key: 'avgWaitTime', label: '平均等候', icon: 'Clock' }
  ]
})

// 监听数据变化
watch(recentEmrRecords, () => {
  tableKey.value++
}, { deep: true })

// 页面激活时强制刷新
onActivated(() => {
  if (emrRecordStore.refreshRecords) {
    emrRecordStore.refreshRecords()
  }
  tableKey.value++
})

// 初始化时加载数据
onMounted(() => {
  if (emrRecordStore.refreshRecords) {
    emrRecordStore.refreshRecords()
  }
})

// 常用模板
const commonTemplates = ref([
  { id: 'tmp_001', name: '普通感冒模板' },
  { id: 'tmp_002', name: '高血压随访模板' },
  { id: 'tmp_003', name: isOutpatient.value ? '门诊初诊模板' : '入院记录模板' }
])

// 获取统计卡片值
function getStatsValue(key) {
  switch (key) {
    case 'todayVisits':
    case 'todayAdmissions':
      return emrRecordStore.todayCompletedCount || 0
    case 'pendingRecords':
      return pendingCount.value || 0
    case 'totalPatients':
    case 'inHospital':
      return patientStore.patients?.length || 0
    case 'avgWaitTime':
      return '15'
    case 'pendingOrders':
      return 12
    default:
      return 0
  }
}

// 获取统计卡片增量
function getStatsIncrease(key) {
  switch (key) {
    case 'todayVisits':
      return 3
    case 'todayAdmissions':
      return 2
    case 'pendingRecords':
      return alertCount.value || 0
    case 'totalPatients':
      return 5
    case 'inHospital':
      return 2
    case 'avgWaitTime':
      return 2
    case 'pendingOrders':
      return 1
    default:
      return 0
  }
}

// 获取统计卡片描述
function getStatsDesc(key) {
  switch (key) {
    case 'todayVisits':
      return '较昨日增加3人'
    case 'todayAdmissions':
      return '较昨日增加2人'
    case 'pendingRecords':
      return `超时告警 ${alertCount.value || 0}份`
    case 'totalPatients':
      return '累计门诊量'
    case 'inHospital':
      return '床位使用率84%'
    case 'avgWaitTime':
      return '平均等候时间'
    case 'pendingOrders':
      return '3条紧急'
    default:
      return ''
  }
}

// 获取病历类型标签
function getRecordTypeTag(type) {
  const tagMap = {
    initial: 'primary',
    followup: 'success',
    summary: 'info',
    admission: 'primary',
    progress: 'success',
    discharge: 'info'
  }
  return tagMap[type] || 'info'
}

// 获取病历类型名称
function getRecordTypeName(type) {
  const nameMap = {
    initial: '初诊记录',
    followup: '复诊记录',
    summary: '门诊小结',
    admission: '入院记录',
    progress: '病程记录',
    discharge: '出院小结'
  }
  return nameMap[type] || type
}

// 继续编辑
function continueEdit(record) {
  if (record && record.patientId) {
    router.push(`/emr-editor/${record.patientId}?emrId=${record.id}`)
  } else {
    ElMessage.warning('病历信息不完整')
  }
}

// 使用模板
function useTemplate(template) {
  ElMessage.success(`已选择模板：${template.name}`)
  router.push('/emr-editor')
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.alert-item {
  margin-bottom: 15px;
}

.stat-card {
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 600;
  color: #409eff;
  margin: 10px 0;
}

.stat-desc {
  font-size: 13px;
  color: #909399;
}

.status-completed {
  color: #67c23a;
  font-weight: 500;
}

.status-pending {
  color: #f56c6c;
  font-weight: 500;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.template-item:last-child {
  border-bottom: none;
}

.template-item span {
  flex: 1;
}

.mt-20 {
  margin-top: 20px;
}
</style>