// src/stores/systemModeStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSystemModeStore = defineStore('systemMode', () => {
  // 模式：'outpatient' 门诊 / 'inpatient' 住院
  const currentMode = ref(localStorage.getItem('systemMode') || 'outpatient')
  
  // 模式配置
  const modeConfig = {
    outpatient: {
      name: '门诊模式',
      icon: '📋',
      description: '门诊电子病历系统',
      // 患者字段配置
      patientFields: {
        showBedNumber: false,
        showAdmissionDate: false,
        showIdNumber: true,
        showVisitDate: true,
        showVisitTime: true
      },
      // 统计卡片
      statsCards: [
        { key: 'todayVisits', label: '今日门诊量', icon: 'User' },
        { key: 'pendingRecords', label: '待完成病历', icon: 'Document' },
        { key: 'totalPatients', label: '累计患者', icon: 'Users' },
        { key: 'avgWaitTime', label: '平均等候', icon: 'Clock' }
      ],
      // 告警规则（门诊模式无需超时告警）
      alertRules: []
    },
    inpatient: {
      name: '住院模式',
      icon: '🏥',
      description: '住院电子病历系统',
      patientFields: {
        showBedNumber: true,
        showAdmissionDate: true,
        showIdNumber: true,
        showVisitDate: false,
        showVisitTime: false
      },
      statsCards: [
        { key: 'todayAdmissions', label: '今日入院', icon: 'User' },
        { key: 'pendingRecords', label: '待写病历', icon: 'Document' },
        { key: 'inHospital', label: '在院患者', icon: 'Hospital' },
        { key: 'pendingOrders', label: '待处理医嘱', icon: 'List' }
      ],
      alertRules: [
        { type: 'admission', hours: 8, message: '入院记录应在8小时内完成' },
        { type: 'progress', hours: 24, message: '病程记录应在24小时内完成' },
        { type: 'discharge', hours: 24, message: '出院小结应在24小时内完成' }
      ]
    }
  }
  
  // 获取当前模式配置 - 使用 computed 确保响应式
  const currentConfig = computed(() => {
    return modeConfig[currentMode.value] || modeConfig.outpatient
  })
  
  // 切换模式
  function setMode(mode) {
    if (mode === 'outpatient' || mode === 'inpatient') {
      currentMode.value = mode
      localStorage.setItem('systemMode', mode)
      // 刷新页面以应用新配置
      window.location.reload()
    }
  }
  
  // 获取模式名称
  const modeName = computed(() => currentConfig.value?.name || '门诊模式')
  
  // 是否住院模式
  const isInpatient = computed(() => currentMode.value === 'inpatient')
  
  // 是否门诊模式
  const isOutpatient = computed(() => currentMode.value === 'outpatient')
  
  return {
    currentMode,
    currentConfig,
    modeName,
    isInpatient,
    isOutpatient,
    setMode,
    modeConfig
  }
})