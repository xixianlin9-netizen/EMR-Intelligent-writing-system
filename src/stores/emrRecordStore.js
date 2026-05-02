// src/stores/emrRecordStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storageService from '@/services/storageService'

export const useEmrRecordStore = defineStore('emrRecord', () => {
  // 从 localStorage 加载病历记录
  const recentEmrRecords = ref(storageService.getEmrRecords())

  // 告警阈值（24小时 = 24 * 60 * 60 * 1000毫秒）
  const ALERT_THRESHOLD = 24 * 60 * 60 * 1000

  // 获取患者信息（辅助函数）
  function getPatientById(patientId) {
    const patients = storageService.getPatients()
    const outpatientPatients = storageService.getOutpatientPatients?.() || []
    const allPatients = [...patients, ...outpatientPatients]
    return allPatients.find(p => p.id === patientId)
  }

  // 保存病历草稿（状态：未完成）
  function saveDraftRecord(patientId, emrId, formData, richTextContent) {
    console.log('保存病历草稿:', patientId, emrId)
    
    const patient = getPatientById(patientId)
    if (!patient) {
      console.error('未找到患者信息')
      return null
    }
    
    const now = new Date()
    const createTime = now.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
    
    // 查找是否已有记录
    const existingIndex = recentEmrRecords.value.findIndex(r => r.id === emrId)
    
    let record
    if (existingIndex !== -1) {
      // 更新现有记录
      record = {
        ...recentEmrRecords.value[existingIndex],
        status: 'pending',
        updatedTime: now.toISOString(),
        lastEditTime: createTime,
        lastEditTimestamp: now.getTime(),
        formData: formData,
        richTextContent: richTextContent
      }
      const updatedRecords = [...recentEmrRecords.value]
      updatedRecords[existingIndex] = record
      recentEmrRecords.value = updatedRecords
      
      // 更新 localStorage
      storageService.updateEmrRecord(emrId, { 
        status: 'pending',
        updatedTime: now.toISOString(),
        lastEditTime: createTime
      })
    } else {
      // 创建新记录
      record = {
        id: emrId,
        patientId: patient.id,
        patientName: patient.name,
        gender: patient.gender,
        age: patient.age,
        bedNumber: patient.bedNumber || '',
        diagnosis: patient.diagnosis,
        department: patient.department,
        type: '病历记录',
        status: 'pending',
        createTime: createTime,
        lastEditTime: createTime,
        createTimestamp: now.getTime(),
        lastEditTimestamp: now.getTime(),
        formData: formData,
        richTextContent: richTextContent
      }
      
      // 添加到列表最前面
      recentEmrRecords.value = [record, ...recentEmrRecords.value]
      
      // 保存到 localStorage
      storageService.addEmrRecord(record)
    }
    
    console.log('病历草稿已保存，状态：未完成')
    return record
  }

  // 提交病历（状态：已完成）
  function submitRecord(patientId, emrId, formData, richTextContent) {
    console.log('提交病历:', patientId, emrId)
    
    const patient = getPatientById(patientId)
    if (!patient) {
      console.error('未找到患者信息')
      return null
    }
    
    const now = new Date()
    const submitTime = now.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
    
    // 查找是否已有记录
    const existingIndex = recentEmrRecords.value.findIndex(r => r.id === emrId)
    
    let record
    if (existingIndex !== -1) {
      // 更新现有记录为已完成
      record = {
        ...recentEmrRecords.value[existingIndex],
        status: 'completed',
        submitTime: submitTime,
        submitTimestamp: now.getTime(),
        completedTime: now.toISOString(),
        formData: formData,
        richTextContent: richTextContent
      }
      const updatedRecords = [...recentEmrRecords.value]
      updatedRecords[existingIndex] = record
      recentEmrRecords.value = updatedRecords
      
      // 更新 localStorage
      storageService.updateEmrRecord(emrId, { 
        status: 'completed',
        submitTime: submitTime,
        completedTime: now.toISOString()
      })
    } else {
      // 创建新记录（已完成）
      record = {
        id: emrId,
        patientId: patient.id,
        patientName: patient.name,
        gender: patient.gender,
        age: patient.age,
        bedNumber: patient.bedNumber || '',
        diagnosis: patient.diagnosis,
        department: patient.department,
        type: '病历记录',
        status: 'completed',
        createTime: submitTime,
        submitTime: submitTime,
        createTimestamp: now.getTime(),
        submitTimestamp: now.getTime(),
        formData: formData,
        richTextContent: richTextContent
      }
      
      recentEmrRecords.value = [record, ...recentEmrRecords.value]
      storageService.addEmrRecord(record)
    }
    
    console.log('病历已提交，状态：已完成')
    return record
  }

  // 计算每份病历的超时告警
  function calculateAlert(record) {
    if (record.status === 'completed') return null
    
    // 使用创建时间或最后编辑时间
    const targetTime = record.createTimestamp || new Date(record.createTime).getTime()
    const now = new Date().getTime()
    const hoursDiff = (now - targetTime) / (1000 * 60 * 60)
    
    if (hoursDiff >= 24) {
      const days = Math.floor(hoursDiff / 24)
      const remainingHours = Math.floor(hoursDiff % 24)
      return {
        level: 'warning',
        message: `${record.patientName} - 病历已超过24小时未提交${days > 0 ? `（超时${days}天${remainingHours}小时）` : `（超时${Math.floor(hoursDiff)}小时）`}`,
        hours: Math.floor(hoursDiff),
        patientName: record.patientName,
        patientId: record.patientId,
        recordId: record.id
      }
    }
    return null
  }

  // 获取所有告警
  const alerts = computed(() => {
    return recentEmrRecords.value
      .map(record => calculateAlert(record))
      .filter(alert => alert !== null)
  })

  // 获取待办数量（未完成的病历数量）
  const pendingCount = computed(() => {
    return recentEmrRecords.value.filter(r => r.status === 'pending').length
  })

  // 获取告警数量
  const alertCount = computed(() => alerts.value.length)

  // 获取今日完成的病历数量
  const todayCompletedCount = computed(() => {
    const today = new Date().toDateString()
    return recentEmrRecords.value.filter(r => {
      return r.status === 'completed' && 
             new Date(r.completedTime || r.submitTime || r.createTime).toDateString() === today
    }).length
  })

  // 刷新数据
  function refreshRecords() {
    recentEmrRecords.value = storageService.getEmrRecords()
    console.log('刷新病历记录，当前记录数:', recentEmrRecords.value.length)
  }

  // 根据患者ID获取病历记录
  function getRecordsByPatientId(patientId) {
    return recentEmrRecords.value.filter(r => r.patientId === patientId)
  }

  // 根据病历ID获取记录
  function getRecordById(id) {
    return recentEmrRecords.value.find(r => r.id === id) || null
  }

  return {
    recentEmrRecords,
    alerts,
    pendingCount,
    alertCount,
    todayCompletedCount,
    saveDraftRecord,
    submitRecord,
    getRecordsByPatientId,
    getRecordById,
    refreshRecords
  }
})