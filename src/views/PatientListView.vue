<!-- src/views/PatientListView.vue -->
<template>
  <div class="patient-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>患者列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索患者姓名/诊断"
              :prefix-icon="Search"
              clearable
              style="width: 250px; margin-right: 10px;"
            />
            <el-select v-model="selectedDepartment" placeholder="科室" clearable style="width: 120px;">
              <el-option
                v-for="dept in departments"
                :key="dept"
                :label="dept"
                :value="dept"
              />
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredPatients" stripe v-loading="loading">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column prop="idNumber" label="身份证号" width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="admissionDate" label="入院日期" width="120" />
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="bedNumber" label="床号" width="80" />
        <el-table-column prop="diagnosis" label="诊断" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
           <template #default="{ row }">
             <el-button type="primary" link @click="gotoEMREditor(row.id)">写病历</el-button>
             <el-button type="success" link @click="viewPatientDetail(row)">详情</el-button>
           </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import patientsData from '@/mock/patients.json'

const router = useRouter()
const loading = ref(false)
const patients = ref([])
const searchKeyword = ref('')
const selectedDepartment = ref('')

// 加载患者数据
onMounted(async () => {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    patients.value = patientsData
  } finally {
    loading.value = false
  }
})

// 科室列表
const departments = computed(() => {
  const deps = new Set(patients.value.map(p => p.department))
  return Array.from(deps)
})

// 过滤后的患者
const filteredPatients = computed(() => {
  let filtered = patients.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.diagnosis.toLowerCase().includes(keyword)
    )
  }
  
  if (selectedDepartment.value) {
    filtered = filtered.filter(p => p.department === selectedDepartment.value)
  }
  
  return filtered
})

function gotoEMREditor(patientId) {
  console.log('跳转到病历编辑器，患者ID:', patientId) // 添加日志
  router.push(`/emr-editor/${patientId}`)
}

function viewPatientDetail(patient) {
  ElMessage.info(`查看患者详情：${patient.name}`)
  // 可以打开详情对话框
}
</script>

<style scoped>
.patient-list {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}
</style>