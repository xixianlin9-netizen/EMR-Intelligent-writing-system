// src/utils/modeAdapter.js
import { useSystemModeStore } from '@/stores/systemModeStore'

// 根据模式获取患者显示字段
export function getPatientDisplayFields() {
  const store = useSystemModeStore()
  return store.currentConfig.patientFields
}

// 根据模式获取病历类型列表
export function getRecordTypes() {
  const store = useSystemModeStore()
  return store.currentConfig.recordTypes
}

// 根据模式获取告警规则
export function getAlertRules() {
  const store = useSystemModeStore()
  return store.currentConfig.alertRules
}

// 格式化患者信息（根据模式）
export function formatPatientInfo(patient) {
  const store = useSystemModeStore()
  const fields = store.currentConfig.patientFields
  
  const info = {
    id: patient.id,
    name: patient.name,
    gender: patient.gender,
    age: patient.age,
    diagnosis: patient.diagnosis,
    phone: patient.phone
  }
  
  if (fields.showBedNumber) {
    info.bedNumber = patient.bedNumber || '-'
  }
  
  if (fields.showAdmissionDate) {
    info.admissionDate = patient.admissionDate || patient.visitDate || '-'
  }
  
  if (fields.showVisitDate) {
    info.visitDate = patient.visitDate || patient.admissionDate || '-'
  }
  
  if (fields.showVisitTime) {
    info.visitTime = patient.visitTime || '-'
  }
  
  return info
}

// 获取模式相关的统计卡片数据
export function getStatsCardData(emrRecordStore, patientStore) {
  const store = useSystemModeStore()
  
  if (store.isOutpatient) {
    return {
      todayVisits: emrRecordStore.todayCompletedCount || 0,
      pendingRecords: emrRecordStore.pendingCount || 0,
      totalPatients: patientStore.patients?.length || 0,
      avgWaitTime: '15分钟'
    }
  } else {
    return {
      todayAdmissions: emrRecordStore.todayCompletedCount || 0,
      pendingRecords: emrRecordStore.pendingCount || 0,
      inHospital: patientStore.patients?.length || 0,
      pendingOrders: 12
    }
  }
}