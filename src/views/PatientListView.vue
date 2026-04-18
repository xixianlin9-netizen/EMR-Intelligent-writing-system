<!-- src/views/PatientListView.vue -->
<template>
  <div class="patient-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon :size="20" class="title-icon">
              <UserFilled />
            </el-icon>
            <span class="title-text">{{ isOutpatient ? '门诊患者列表' : '住院患者列表' }}</span>
            <el-tag :type="isOutpatient ? 'success' : 'primary'" size="small" class="mode-tag">
              {{ isOutpatient ? '门诊模式' : '住院模式' }}
            </el-tag>
          </div>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              :placeholder="isOutpatient ? '搜索患者姓名/诊断' : '搜索患者姓名/诊断/床号'"
              :prefix-icon="Search"
              clearable
              style="width: 260px; margin-right: 10px;"
            />
            <el-select v-model="selectedDepartment" placeholder="科室筛选" clearable style="width: 140px;">
              <el-option
                v-for="dept in departments"
                :key="dept"
                :label="dept"
                :value="dept"
              />
            </el-select>
            <el-button @click="refreshList" :icon="Refresh" circle />
          </div>
        </div>
      </template>
      
      <el-table :data="filteredPatients" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="姓名" width="100" fixed="left">
          <template #default="{ row }">
            <span class="patient-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="70" />
        <el-table-column prop="age" label="年龄" width="70" />
        
        <!-- 住院模式专属字段 -->
        <el-table-column v-if="isInpatient" prop="bedNumber" label="床号" width="80">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.bedNumber || '-' }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="phone" label="联系电话" width="130" />
        
        <!-- 住院模式：身份证号 -->
        <el-table-column v-if="isInpatient" prop="idNumber" label="身份证号" width="180" show-overflow-tooltip />
        
        <!-- 门诊模式：就诊日期和时间 -->
        <el-table-column v-if="isOutpatient" prop="visitDate" label="就诊日期" width="110" />
        <el-table-column v-if="isOutpatient" prop="visitTime" label="就诊时间" width="90" />
        
        <!-- 住院模式：入院日期 -->
        <el-table-column v-if="isInpatient" prop="admissionDate" label="入院日期" width="110" />
        
        <el-table-column prop="department" label="科室" width="110" />
        <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip min-width="180">
          <template #default="{ row }">
            <span class="diagnosis-text">{{ row.diagnosis }}</span>
          </template>
        </el-table-column>
        
        <!-- 门诊模式：就诊医生 -->
        <el-table-column v-if="isOutpatient" prop="doctor" label="接诊医生" width="100" />
        
        <!-- 住院模式：主治医生 -->
        <el-table-column v-if="isInpatient" prop="attendingDoctor" label="主治医生" width="100" />
        
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button 
              plain
              size="small"
              @click="gotoEMREditor(row.id)"
              class="action-btn-custom"
            >
              <el-icon><Edit /></el-icon>
              写病历
            </el-button>
            <el-button 
              plain
              size="small"
              @click="viewPatientDetail(row)"
              class="action-btn-custom"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 空状态 -->
      <el-empty v-if="filteredPatients.length === 0 && !loading" description="暂无患者数据" />
      
      <!-- 底部统计 -->
      <div class="table-footer" v-if="filteredPatients.length > 0">
        <div class="footer-left">
          <span class="total-count">共 {{ filteredPatients.length }} 条记录</span>
          <span class="mode-info">
            <el-icon><InfoFilled /></el-icon>
            {{ isOutpatient ? '今日门诊量：' + todayVisitCount : '在院患者数：' + filteredPatients.length }}
          </span>
        </div>
      </div>
    </el-card>
    
    <!-- 患者详情对话框 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :title="`患者详情 - ${currentPatient?.name || ''}`" 
      width="550px"
      class="patient-detail-dialog"
    >
      <div v-if="currentPatient" class="patient-detail">
        <div class="detail-section">
          <h4>基本信息</h4>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">姓名：</span>
                <span class="value">{{ currentPatient.name }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">性别：</span>
                <span class="value">{{ currentPatient.gender }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">年龄：</span>
                <span class="value">{{ currentPatient.age }}岁</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ currentPatient.phone }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="detail-item">
                <span class="label">科室：</span>
                <span class="value">{{ currentPatient.department }}</span>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <div class="detail-item">
                <span class="label">诊断：</span>
                <span class="value">{{ currentPatient.diagnosis }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="detail-section" v-if="isInpatient">
          <h4>住院信息</h4>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">床号：</span>
                <span class="value">{{ currentPatient.bedNumber || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">入院日期：</span>
                <span class="value">{{ currentPatient.admissionDate || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">主治医生：</span>
                <span class="value">{{ currentPatient.attendingDoctor || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="detail-section" v-if="isOutpatient">
          <h4>门诊信息</h4>
          <el-row :gutter="16">
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">就诊日期：</span>
                <span class="value">{{ currentPatient.visitDate || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">就诊时间：</span>
                <span class="value">{{ currentPatient.visitTime || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="detail-item">
                <span class="label">接诊医生：</span>
                <span class="value">{{ currentPatient.doctor || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="gotoEMREditor(currentPatient?.id)">
          写病历
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, UserFilled, Edit, View, InfoFilled, Refresh } from '@element-plus/icons-vue'
import { useSystemModeStore } from '@/stores/systemModeStore'
import { usePatientStore } from '@/stores/patientStore'

// 静态导入数据
import outpatientData from '@/mock/patients_outpatient.json'
import inpatientData from '@/mock/patients.json'

const router = useRouter()
const systemModeStore = useSystemModeStore()
const patientStore = usePatientStore()

// 获取模式状态
const isOutpatient = computed(() => systemModeStore.isOutpatient)
const isInpatient = computed(() => systemModeStore.isInpatient)

// 本地状态
const loading = ref(false)
const searchKeyword = ref('')
const selectedDepartment = ref('')
const detailDialogVisible = ref(false)
const currentPatient = ref(null)
const patients = ref([])

// 科室列表
const departments = computed(() => {
  const deps = new Set(patients.value.map(p => p.department))
  return ['全部科室', ...Array.from(deps)]
})

// 今日门诊量（门诊模式）
const todayVisitCount = computed(() => {
  if (!isOutpatient.value) return 0
  const today = new Date().toISOString().slice(0, 10)
  return patients.value.filter(p => p.visitDate === today).length
})

// 过滤后的患者
const filteredPatients = computed(() => {
  let filtered = patients.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.diagnosis.toLowerCase().includes(keyword) ||
      (isInpatient.value && p.bedNumber?.toLowerCase().includes(keyword))
    )
  }
  
  if (selectedDepartment.value && selectedDepartment.value !== '全部科室') {
    filtered = filtered.filter(p => p.department === selectedDepartment.value)
  }
  
  return filtered
})

// 加载患者数据
async function loadPatients() {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    console.log('当前模式:', isOutpatient.value ? '门诊模式' : '住院模式')
    
    if (isOutpatient.value) {
      patients.value = outpatientData
      console.log('加载门诊数据，数量:', patients.value.length)
    } else {
      patients.value = inpatientData
      console.log('加载住院数据，数量:', patients.value.length)
    }
    
    // 更新 store 中的患者数据
    patientStore.patients = patients.value
  } catch (error) {
    console.error('加载患者数据失败:', error)
    patients.value = []
  } finally {
    loading.value = false
  }
}

// 刷新列表
function refreshList() {
  loadPatients()
  ElMessage.success('列表已刷新')
}

// 跳转到病历编辑器
function gotoEMREditor(patientId) {
  if (patientId) {
    router.push(`/emr-editor/${patientId}`)
  } else {
    ElMessage.warning('患者信息不完整')
  }
}

// 查看患者详情
function viewPatientDetail(patient) {
  currentPatient.value = patient
  detailDialogVisible.value = true
}

// 监听模式切换，重新加载数据
watch(() => systemModeStore.currentMode, (newMode, oldMode) => {
  console.log('模式切换:', oldMode, '->', newMode)
  searchKeyword.value = ''
  selectedDepartment.value = ''
  loadPatients()
})

// 初始化加载
onMounted(() => {
  console.log('PatientListView 初始化，当前模式:', systemModeStore.currentMode)
  loadPatients()
})
</script>

<style scoped>
.patient-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  color: #409eff;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.mode-tag {
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-name {
  font-weight: 500;
  color: #303133;
}

.diagnosis-text {
  color: #606266;
}

/* 自定义操作按钮样式 - 浅灰色悬浮背景 */
.action-btn-custom {
  background: transparent;
  border: none;
  color: #409eff;
  transition: all 0.2s ease;
  padding: 5px 12px;
  border-radius: 6px;
  margin: 0 2px;
}

.action-btn-custom:hover {
  background-color: #f5f7fa;
  transform: translateY(-1px);
}

.action-btn-custom:last-child {
  color: #67c23a;
}

.action-btn-custom:last-child:hover {
  background-color: #f5f7fa;
  color: #67c23a;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  margin-top: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.total-count {
  font-weight: 500;
  color: #606266;
}

.mode-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 患者详情对话框样式 */
.patient-detail-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-item {
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item .label {
  color: #909399;
  margin-right: 8px;
}

.detail-item .value {
  color: #303133;
  font-weight: 500;
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  .title-text {
    color: #e5e5e5;
  }
  
  .patient-name {
    color: #e5e5e5;
  }
  
  .diagnosis-text {
    color: #a0a0a0;
  }
  
  .action-btn-custom:hover {
    background-color: #2a2a2a !important;
  }
}
</style>