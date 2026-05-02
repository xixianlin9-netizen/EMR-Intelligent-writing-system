<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="banner-text">
          <h2>欢迎回来，{{ doctorName }}医生</h2>
          <p>{{ currentDate }} | 今日门诊量 {{ todayVisits }} 人次</p>
        </div>
        <div class="banner-stats">
          <div class="banner-stat">
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">待完成病历</div>
          </div>
          <div class="banner-stat">
            <div class="stat-value">{{ alertCount }}</div>
            <div class="stat-label">超时告警</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 告警区域 - 仅住院模式显示原有告警 -->
    <template v-if="isInpatient && oldAlerts && oldAlerts.length > 0">
      <div class="alert-container">
        <div v-for="(alert, index) in oldAlerts" :key="index" class="alert-item">
          <el-alert
            :title="alert.message"
            :type="alert.level === 'error' ? 'error' : 'warning'"
            :closable="true"
            show-icon
          />
        </div>
      </div>
    </template>

    <!-- 超时告警区域 - 显示超过24小时未提交的病历 -->
    <div v-if="alerts && alerts.length > 0" class="alert-section">
      <div class="alert-header">
        <el-icon class="alert-icon"><WarningFilled /></el-icon>
        <span class="alert-title">病历超时告警</span>
        <span class="alert-count">共 {{ alerts.length }} 份病历超时</span>
      </div>
      <div class="alert-list">
        <div 
          v-for="alert in alerts" 
          :key="alert.recordId"
          class="alert-item"
          @click="goToEdit(alert.patientId, alert.recordId)"
        >
          <el-icon class="alert-item-icon"><Warning /></el-icon>
          <span class="alert-message">{{ alert.message }}</span>
          <el-button type="primary" link size="small" @click.stop="goToEdit(alert.patientId, alert.recordId)">
            立即处理
          </el-button>
        </div>
      </div>
    </div>

    <!-- 模式提示条 -->
    <div class="mode-tip" :class="{ 'outpatient-mode': isOutpatient, 'inpatient-mode': isInpatient }">
      <div class="mode-icon-wrapper" :class="{ 'outpatient': isOutpatient, 'inpatient': isInpatient }">
        <el-icon class="mode-icon"><component :is="isOutpatient ? 'User' : 'OfficeBuilding'" /></el-icon>
      </div>
      <div class="mode-tip-content">
        <span class="mode-tip-title">{{ modeTipTitle }}</span>
        <span class="mode-tip-desc">{{ modeTipDesc }}</span>
      </div>
    </div>

    <!-- 动态可视化统计卡片 -->
    <el-row :gutter="24" class="stats-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" v-for="card in statsCards" :key="card.key">
        <div class="stat-card" @click="handleCardClick(card.key)">
          <!-- 卡片头部 -->
          <div class="stat-card-header">
            <span class="stat-card-label">{{ card.label }}</span>
            <el-icon class="stat-card-icon" :size="20"><component :is="card.icon" /></el-icon>
          </div>
          
          <!-- 主要数值 -->
          <div class="stat-card-value">
            <span class="value-number" :style="{ color: card.color }">{{ getStatsValue(card.key) }}</span>
            <span class="value-unit">{{ card.unit }}</span>
          </div>
          
          <!-- 迷你趋势图 -->
          <div class="stat-card-chart">
            <canvas :ref="el => setChartCanvas(el, card.key)" class="mini-canvas"></canvas>
          </div>
          
          <!-- 底部趋势信息 -->
          <div class="stat-card-footer">
            <div class="trend-info" :class="getTrendClass(card.trend)">
              <el-icon><component :is="getTrendIcon(card.trend)" /></el-icon>
              <span>{{ card.trend }}</span>
            </div>
            <div class="compare-info">较昨日</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主要内容区 -->
    <el-row :gutter="24" class="main-row">
      <el-col :xs="24" :lg="16">
        <div class="section-card">
          <div class="section-header">
            <div class="header-left">
              <div class="header-icon" :class="{ 'outpatient': isOutpatient, 'inpatient': isInpatient }">
                <el-icon><Document /></el-icon>
              </div>
              <div class="header-text">
                <h3>{{ isOutpatient ? '最近门诊病历' : '最近编辑病历' }}</h3>
                <p>近期的病历记录</p>
              </div>
            </div>
            <el-button link type="primary" @click="$router.push('/patients')" class="view-more">
              查看更多
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          
          <div class="table-wrapper">
            <el-table :data="recentEmrRecords || []" stripe style="width: 100%" :key="tableKey">
              <el-table-column prop="patientName" label="患者姓名" width="100">
                <template #default="{ row }">
                  <div class="patient-cell">
                    <el-avatar :size="32" :style="{ background: getAvatarColor(row.patientName) }">
                      {{ row.patientName?.charAt(0) }}
                    </el-avatar>
                    <span>{{ row.patientName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="gender" label="性别" width="70">
                <template #default="{ row }">
                  <el-tag :type="row.gender === '男' ? 'primary' : 'danger'" size="small" effect="plain">
                    {{ row.gender }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="age" label="年龄" width="70" />
              <el-table-column prop="type" label="病历类型" width="110">
                <template #default="{ row }">
                  <el-tag size="small" :type="getRecordTypeTag(row.type)" effect="light">
                    {{ getRecordTypeName(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="120" />
              <el-table-column prop="lastEditTime" label="最后编辑" width="120">
                <template #default="{ row }">
                  {{ row.lastEditTime || row.createTime || '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="diagnosis" label="诊断" min-width="150" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="diagnosis-text">{{ row.diagnosis || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="90">
                <template #default="{ row }">
                  <span :class="row.status === 'completed' ? 'status-completed' : 'status-pending'">
                    {{ row.status === 'completed' ? '已完成' : '未完成' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    link 
                    @click="continueEdit(row)"
                    class="action-btn"
                  >
                    {{ row.status === 'completed' ? '查看' : '继续编辑' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <el-empty v-if="!recentEmrRecords || recentEmrRecords.length === 0" description="暂无病历记录" />
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <div class="section-card">
          <div class="section-header">
            <div class="header-left">
              <div class="header-icon template-icon">
                <el-icon><Files /></el-icon>
              </div>
              <div class="header-text">
                <h3>常用模板</h3>
                <p>快速开始病历书写</p>
              </div>
            </div>
            <el-button link type="primary" @click="$router.push('/template-library')" class="view-more">
              管理
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          
          <div class="template-list">
            <div 
              v-for="template in commonTemplates" 
              :key="template.id" 
              class="template-item"
              @click="useTemplate(template)"
            >
              <div class="template-icon-wrapper" :style="{ background: template.color || '#eef2f7' }">
                <el-icon><Document /></el-icon>
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.desc || '点击使用该模板' }}</div>
              </div>
              <el-button link class="template-use-btn">
                使用
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="section-card quick-actions">
          <div class="section-header">
            <div class="header-left">
              <div class="header-icon quick-icon">
                <el-icon><Guide /></el-icon>
              </div>
              <div class="header-text">
                <h3>快捷操作</h3>
                <p>常用功能快速入口</p>
              </div>
            </div>
          </div>
          
          <div class="actions-grid">
            <div class="action-item" @click="$router.push('/patients')">
              <div class="action-icon">
                <el-icon><User /></el-icon>
              </div>
              <span>患者列表</span>
            </div>
            <div class="action-item" @click="$router.push('/emr-editor')">
              <div class="action-icon">
                <el-icon><Edit /></el-icon>
              </div>
              <span>新建病历</span>
            </div>
            <div class="action-item" @click="$router.push('/data-reference')">
              <div class="action-icon">
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <span>数据引用</span>
            </div>
            <div class="action-item" @click="$router.push('/quality')">
              <div class="action-icon">
                <el-icon><DocumentChecked /></el-icon>
              </div>
              <span>病历质控</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onActivated, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  Document, ArrowUp, ArrowRight, User, OfficeBuilding,
  Files, Guide, Edit, DataAnalysis, DocumentChecked, 
  Clock, UserFilled, List, WarningFilled, Warning
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEmrRecordStore } from '@/stores/emrRecordStore'
import { usePatientStore } from '@/stores/patientStore'
import { useSystemModeStore } from '@/stores/systemModeStore'
import { useUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const emrRecordStore = useEmrRecordStore()
const patientStore = usePatientStore()
const systemModeStore = useSystemModeStore()
const userStore = useUserStore()

const { recentEmrRecords, alerts, pendingCount, alertCount } = storeToRefs(emrRecordStore)
const { isOutpatient, isInpatient } = systemModeStore
const doctorName = computed(() => userStore.userInfo?.name || '张')

// 保留原有的告警数据（来自 alertStore）
const oldAlerts = ref([])

const chartCanvasMap = ref(new Map())
const chartDataMap = ref({})

const currentDate = computed(() => {
  const now = new Date()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`
})

const todayVisits = computed(() => emrRecordStore.todayCompletedCount || 0)
const tableKey = ref(0)

// 模拟趋势数据
const trendData = {
  todayVisits: [12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45, 48],
  pendingRecords: [8, 7, 9, 6, 8, 5, 7, 4, 6, 3, 5, 4],
  totalPatients: [120, 125, 130, 128, 135, 140, 138, 145, 150, 148, 155, 160],
  avgWaitTime: [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7],
  todayAdmissions: [5, 6, 8, 7, 9, 10, 8, 11, 12, 10, 13, 14],
  inHospital: [45, 46, 48, 47, 49, 50, 48, 51, 52, 50, 53, 54],
  pendingOrders: [10, 9, 11, 8, 10, 7, 9, 6, 8, 5, 7, 6]
}

// 统计卡片配置
const statsCards = computed(() => {
  const baseCards = {
    outpatient: [
      { key: 'todayVisits', label: '今日门诊量', icon: 'User', unit: '人次', color: '#409eff', trend: '+12%' },
      { key: 'pendingRecords', label: '待完成病历', icon: 'Document', unit: '份', color: '#e6a23c', trend: '+3' },
      { key: 'totalPatients', label: '累计患者', icon: 'UserFilled', unit: '人', color: '#67c23a', trend: '+28' },
      { key: 'avgWaitTime', label: '平均等候', icon: 'Clock', unit: '分钟', color: '#8ba3c4', trend: '-2' }
    ],
    inpatient: [
      { key: 'todayAdmissions', label: '今日入院', icon: 'OfficeBuilding', unit: '人', color: '#409eff', trend: '+5' },
      { key: 'pendingRecords', label: '待写病历', icon: 'Document', unit: '份', color: '#e6a23c', trend: '+2' },
      { key: 'inHospital', label: '在院患者', icon: 'UserFilled', unit: '人', color: '#67c23a', trend: '+8' },
      { key: 'pendingOrders', label: '待处理医嘱', icon: 'List', unit: '条', color: '#f56c6c', trend: '+4' }
    ]
  }
  return baseCards[isOutpatient.value ? 'outpatient' : 'inpatient']
})

const modeTipTitle = computed(() => isOutpatient.value ? '门诊模式' : '住院模式')
const modeTipDesc = computed(() => isOutpatient.value 
  ? '门诊电子病历系统，支持初诊记录、复诊记录、门诊小结等功能'
  : '住院电子病历系统，支持入院记录、病程记录、出院小结等功能，病历超时会自动告警'
)

const commonTemplates = ref([
  { id: 'tmp_001', name: '普通感冒模板', icon: 'Document', color: '#eef2f7', desc: '适用于发热、咳嗽等症状' },
  { id: 'tmp_002', name: '高血压随访模板', icon: 'Document', color: '#eef2f7', desc: '血压监测与用药记录' },
  { id: 'tmp_003', name: isOutpatient.value ? '门诊初诊模板' : '入院记录模板', icon: 'Document', color: '#eef2f7', desc: '标准入院/初诊记录' }
])

// 初始化图表
function initCharts() {
  nextTick(() => {
    chartCanvasMap.value.forEach((canvas, key) => {
      if (!canvas) return
      const data = trendData[key] || [10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38]
      const card = statsCards.value.find(c => c.key === key)
      const color = card?.color || '#409eff'
      
      const chart = echarts.init(canvas)
      chart.setOption({
        grid: { left: '0%', right: '0%', top: '5%', bottom: '0%', containLabel: true },
        xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], show: false },
        yAxis: { type: 'value', show: false },
        series: [{
          data: data,
          type: 'line',
          smooth: true,
          lineStyle: { width: 2, color: color },
          areaStyle: { opacity: 0.2, color: color },
          showSymbol: false,
          tooltip: { show: false }
        }],
        tooltip: { show: false },
        animation: true,
        animationDuration: 1000
      })
      
      window.addEventListener('resize', () => chart.resize())
    })
  })
}

function setChartCanvas(el, key) {
  if (!el) return
  chartCanvasMap.value.set(key, el)
  initCharts()
}

function getTrendIcon(trend) {
  if (!trend) return 'ArrowRight'
  const num = parseFloat(trend)
  return num >= 0 ? 'ArrowUp' : 'ArrowDown'
}

function getTrendClass(trend) {
  if (!trend) return ''
  const num = parseFloat(trend)
  if (num > 0) return 'trend-up'
  if (num < 0) return 'trend-down'
  return 'trend-steady'
}

// 跳转到病历编辑器
function goToEdit(patientId, recordId) {
  router.push(`/emr-editor/${patientId}?emrId=${recordId}`)
}

function continueEdit(record) {
  if (record && record.patientId) {
    router.push(`/emr-editor/${record.patientId}?emrId=${record.id}`)
  } else {
    ElMessage.warning('病历信息不完整')
  }
}

function useTemplate(template) {
  ElMessage.success(`已选择模板：${template.name}`)
  router.push('/emr-editor')
}

watch(recentEmrRecords, () => {
  tableKey.value++
}, { deep: true })

onActivated(() => {
  emrRecordStore.refreshRecords?.()
  tableKey.value++
  initCharts()
})

onMounted(() => {
  emrRecordStore.refreshRecords?.()
  initCharts()
})

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

function handleCardClick(key) {
  if (key === 'pendingRecords') {
    router.push('/patients')
  }
}

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

function getAvatarColor(name) {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#8ba3c4']
  const index = (name?.charCodeAt(0) || 0) % colors.length
  return colors[index]
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background: #f0f2f5;
  min-height: 100%;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #2c3e50 0%, #1f2d3d 100%);
  border-radius: 20px;
  padding: 24px 32px;
  margin-bottom: 24px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(31, 45, 61, 0.15);
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 50%;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.banner-text h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.banner-text p {
  font-size: 14px;
  opacity: 0.85;
}

.banner-stats {
  display: flex;
  gap: 32px;
}

.banner-stat {
  text-align: center;
}

.banner-stat .stat-value {
  font-size: 32px;
  font-weight: 700;
}

.banner-stat .stat-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

/* 告警容器 */
.alert-container {
  margin-bottom: 24px;
}

/* 超时告警区域 */
.alert-section {
  background: #fff;
  border-radius: 16px;
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #e6a23c;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fdf6ec;
  border-bottom: 1px solid #f0e0c0;
}

.alert-icon {
  font-size: 20px;
  color: #e6a23c;
}

.alert-title {
  font-size: 15px;
  font-weight: 600;
  color: #e6a23c;
}

.alert-count {
  margin-left: auto;
  font-size: 13px;
  color: #909399;
}

.alert-list {
  max-height: 200px;
  overflow-y: auto;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.alert-item:hover {
  background: #fafafa;
}

.alert-item:last-child {
  border-bottom: none;
}

.alert-item-icon {
  font-size: 16px;
  color: #e6a23c;
}

.alert-message {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

/* 模式提示条 */
.mode-tip {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e8eaed;
}

.outpatient-mode {
  border-left: 4px solid #409eff;
}

.inpatient-mode {
  border-left: 4px solid #67c23a;
}

.mode-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-icon-wrapper.outpatient {
  background: #ecf5ff;
}

.mode-icon-wrapper.inpatient {
  background: #f0f9eb;
}

.mode-icon {
  font-size: 24px;
}

.outpatient-mode .mode-icon {
  color: #409eff;
}

.inpatient-mode .mode-icon {
  color: #67c23a;
}

.mode-tip-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-tip-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.mode-tip-desc {
  font-size: 13px;
  color: #4a627a;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #2c3e50, #409eff);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-card-label {
  font-size: 13px;
  color: #6c8aae;
  font-weight: 500;
}

.stat-card-icon {
  color: #8ba3c4;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-card-icon {
  transform: rotate(15deg) scale(1.1);
}

.stat-card-value {
  margin-bottom: 12px;
}

.value-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.value-unit {
  font-size: 13px;
  color: #6c8aae;
  margin-left: 4px;
}

.stat-card-chart {
  height: 60px;
  margin-bottom: 12px;
}

.mini-canvas {
  width: 100%;
  height: 100%;
}

.stat-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #eef2f7;
}

.trend-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trend-info.trend-up {
  color: #67c23a;
}

.trend-info.trend-down {
  color: #f56c6c;
}

.trend-info.trend-steady {
  color: #909399;
}

.compare-info {
  font-size: 11px;
  color: #8ba3c4;
}

/* 主要内容区 */
.main-row {
  margin-top: 0;
}

.section-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-icon.outpatient {
  background: #ecf5ff;
  color: #409eff;
}

.header-icon.inpatient {
  background: #f0f9eb;
  color: #67c23a;
}

.header-icon.template-icon {
  background: #fef5e8;
  color: #e6a23c;
}

.header-icon.quick-icon {
  background: #eef2f7;
  color: #6c8aae;
}

.header-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-text p {
  font-size: 12px;
  color: #6c8aae;
  margin: 4px 0 0 0;
}

.view-more {
  font-size: 13px;
}

.view-more .el-icon {
  margin-left: 4px;
  transition: transform 0.2s;
}

.view-more:hover .el-icon {
  transform: translateX(4px);
}

.table-wrapper {
  overflow-x: auto;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.diagnosis-text {
  color: #4a627a;
}

.status-completed {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #67c23a, #5daf34);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e6a23c, #d8962e);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.action-btn {
  font-weight: 500;
}

/* 模板列表 */
.template-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 14px;
  transition: all 0.25s ease;
  cursor: pointer;
}

.template-item:hover {
  background: #ecf5ff;
  transform: translateX(4px);
}

.template-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-icon-wrapper .el-icon {
  font-size: 22px;
  color: #409eff;
}

.template-info {
  flex: 1;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.template-desc {
  font-size: 11px;
  color: #6c8aae;
}

.template-use-btn {
  opacity: 0;
  transition: opacity 0.25s;
}

.template-item:hover .template-use-btn {
  opacity: 1;
}

/* 快捷操作 */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-item:hover {
  background: #ecf5ff;
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-item span {
  font-size: 13px;
  font-weight: 500;
  color: #4a627a;
}

/* 响应式 */
@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }
  
  .welcome-banner {
    padding: 16px 20px;
  }
  
  .banner-text h2 {
    font-size: 18px;
  }
  
  .banner-stats {
    gap: 16px;
  }
  
  .banner-stat .stat-value {
    font-size: 24px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .value-number {
    font-size: 24px;
  }
  
  .section-card {
    padding: 16px;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-card-chart {
    height: 50px;
  }
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard > * {
  animation: fadeInUp 0.4s ease forwards;
}

.stat-card, .section-card {
  animation: fadeInUp 0.4s ease forwards;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.value-number {
  animation: countUp 0.6s ease forwards;
}
</style>