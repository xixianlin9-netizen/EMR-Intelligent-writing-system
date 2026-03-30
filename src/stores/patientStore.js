// src/stores/patientStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import patientsData from '@/mock/patients.json'

export const usePatientStore = defineStore('patient', () => {
  // 患者列表
  const patients = ref([])
  const currentPatient = ref(null)
  const loading = ref(false)
  const searchKeyword = ref('')
  const selectedDepartment = ref('')

  // 加载患者数据
  async function loadPatients() {
    loading.value = true
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500))
      patients.value = patientsData
    } catch (error) {
      console.error('加载患者失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 设置当前患者
  function setCurrentPatient(patient) {
    console.log('设置当前患者:', patient)
    currentPatient.value = patient
  }

  // 根据ID获取患者
  function getPatientById(id) {
    console.log('getPatientById 查找:', id, '当前患者列表:', patients.value)
    // 先从当前患者列表中查找
    const patient = patients.value.find(p => p.id === id)
    if (patient) {
      console.log('找到患者:', patient)
      return patient
    }
    
    // 如果列表为空，尝试从导入的数据中查找
    if (patients.value.length === 0) {
      const found = patientsData.find(p => p.id === id)
      console.log('从原始数据找到患者:', found)
      return found
    }
    
    console.log('未找到患者，ID:', id)
    return null
  }

  // 搜索患者
  const filteredPatients = computed(() => {
    let filtered = patients.value
    
    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(keyword) ||
        p.id.toLowerCase().includes(keyword) ||
        p.diagnosis.toLowerCase().includes(keyword)
      )
    }
    
    // 按科室筛选
    if (selectedDepartment.value) {
      filtered = filtered.filter(p => 
        p.department === selectedDepartment.value
      )
    }
    
    return filtered
  })

  // 获取科室列表
  const departments = computed(() => {
    const deps = new Set(patients.value.map(p => p.department))
    return ['全部', ...Array.from(deps)]
  })

  // 清空当前患者
  function clearCurrentPatient() {
    currentPatient.value = null
  }

  return {
    patients,
    currentPatient,
    loading,
    searchKeyword,
    selectedDepartment,
    filteredPatients,
    departments,
    loadPatients,
    setCurrentPatient,
    getPatientById,
    clearCurrentPatient
  }
})