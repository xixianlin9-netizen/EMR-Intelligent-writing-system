<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <!-- 告警区域 -->
    <el-alert
      v-for="(alert, index) in alerts"
      :key="index"
      :title="alert.message"
      :type="alert.level === 'error' ? 'error' : alert.level"
      :closable="false"
      show-icon
      class="alert-item"
    />

    <el-row :gutter="20" class="mt-20">
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>今日接诊</span>
              <el-tag type="success">+{{ todayCompletedCount }}</el-tag>
            </div>
          </template>
          <div class="stat-number">{{ todayCompletedCount }}</div>
          <div class="stat-desc">今日已完成病历</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待写病历</span>
              <el-tag type="warning">{{ pendingCount }}份</el-tag>
            </div>
          </template>
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-desc">超时告警 {{ alertCount }}份</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>在院患者</span>
              <el-tag type="info">{{ recentPatients.length }}人</el-tag>
            </div>
          </template>
          <div class="stat-number">{{ recentPatients.length }}</div>
          <div class="stat-desc">床位使用率84%</div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理医嘱</span>
              <el-tag type="danger">12条</el-tag>
            </div>
          </template>
          <div class="stat-number">12</div>
          <div class="stat-desc">3条紧急</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近编辑病历</span>
              <el-button link type="primary" @click="$router.push('/patients')">查看更多</el-button>
            </div>
          </template>
          
          <!-- 使用 :key 强制重新渲染 -->
          <el-table :data="recentEmrRecords" stripe style="width: 100%" :key="tableKey">
            <el-table-column prop="patientName" label="患者姓名" width="100" />
            <el-table-column prop="gender" label="性别" width="60" />
            <el-table-column prop="age" label="年龄" width="60" />
            <el-table-column prop="type" label="病历类型" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="120" />
            <el-table-column prop="diagnosis" label="诊断" min-width="150" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <span :class="row.status === 'completed' ? 'status-completed' : 'status-pending'">
                  {{ row.status === 'completed' ? '已完成' : '未完成' }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="告警" width="80">
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
                  {{ row.status === 'completed' ? '已提交' : '继续编辑' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <!-- 空状态提示 -->
          <el-empty v-if="recentEmrRecords.length === 0" description="暂无病历记录" />
        </el-card>
      </el-col>
      
      <el-col :span="8">
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
import { ref, watch, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { Document, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEmrRecordStore } from '@/stores/emrRecordStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const emrRecordStore = useEmrRecordStore()

// 使用 storeToRefs 保持响应性
const { recentEmrRecords, alerts, pendingCount, alertCount, todayCompletedCount } = storeToRefs(emrRecordStore)

// 强制重新渲染的 key
const tableKey = ref(0)

// 监听数据变化
watch(recentEmrRecords, (newVal) => {
  console.log('recentEmrRecords 变化:', newVal?.length)
  tableKey.value++
}, { deep: true })

// 页面激活时强制刷新
onActivated(() => {
  console.log('Dashboard 激活，强制刷新')
  emrRecordStore.refreshRecords()
  tableKey.value++
})

// 初始化时加载数据
onMounted(() => {
  console.log('Dashboard 挂载，加载数据')
  emrRecordStore.refreshRecords()
})

// 最近患者数据（用于显示）
const recentPatients = ref([
  { id: 'p001', name: '张明', gender: '男', age: 45, diagnosis: '社区获得性肺炎', bedNumber: '12A' },
  { id: 'p002', name: '李芳', gender: '女', age: 52, diagnosis: '高血压病3级', bedNumber: '8C' },
  { id: 'p003', name: '王伟', gender: '男', age: 38, diagnosis: '急性支气管炎', bedNumber: '15B' },
  { id: 'p004', name: '刘洋', gender: '女', age: 29, diagnosis: '上呼吸道感染', bedNumber: '22D' }
])

// 常用模板
const commonTemplates = ref([
  { id: 'tmp_001', name: '普通感冒模板' },
  { id: 'tmp_002', name: '高血压随访模板' },
  { id: 'tmp_003', name: '入院记录模板' }
])

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
</style>