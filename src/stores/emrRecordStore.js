// src/stores/emrRecordStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storageService from '@/services/storageService'

export const useEmrRecordStore = defineStore('emrRecord', () => {
  // 从 localStorage 加载病历记录
  const recentEmrRecords = ref(storageService.getEmrRecords())

  // 更新病历状态为已完成
  function updateRecordStatus(patientId, emrId) {
    console.log('更新病历状态:', patientId, emrId)
    
    // 查找匹配的病历记录
    const index = recentEmrRecords.value.findIndex(r => r.id === emrId || r.patientId === patientId)
    
    if (index !== -1) {
      // 更新记录
      const updatedRecord = {
        ...recentEmrRecords.value[index],
        status: 'completed',
        alert: null,
        completedTime: new Date().toISOString()
      }
      
      // 创建新数组
      const updatedRecords = [...recentEmrRecords.value]
      updatedRecords[index] = updatedRecord
      
      // 更新响应式数据
      recentEmrRecords.value = updatedRecords
      
      // 保存到 localStorage
      storageService.updateEmrRecord(updatedRecord.id, { 
        status: 'completed', 
        alert: null,
        completedTime: new Date().toISOString()
      })
      
      console.log('病历状态已更新为已完成')
      return updatedRecord
    }
    return null
  }

  // 添加新病历记录
  function addRecord(record) {
    console.log('添加新病历记录:', record)
    
    // 检查是否已存在相同记录
    const existingIndex = recentEmrRecords.value.findIndex(r => r.id === record.id)
    
    let newRecord
    if (existingIndex !== -1) {
      // 更新现有记录
      newRecord = {
        ...recentEmrRecords.value[existingIndex],
        ...record,
        updatedTime: new Date().toISOString()
      }
      const updatedRecords = [...recentEmrRecords.value]
      updatedRecords[existingIndex] = newRecord
      recentEmrRecords.value = updatedRecords
      
      // 更新 localStorage
      storageService.updateEmrRecord(record.id, newRecord)
    } else {
      // 创建新记录
      newRecord = {
        ...record,
        id: record.id || `emr_${Date.now()}`,
        createTime: record.createTime || new Date().toLocaleString('zh-CN', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\//g, '-'),
        addedTime: new Date().toISOString()
      }
      
      // 添加到列表最前面
      recentEmrRecords.value = [newRecord, ...recentEmrRecords.value]
      
      // 保存到 localStorage
      storageService.addEmrRecord(newRecord)
    }
    
    console.log('病历记录已添加/更新，当前记录数:', recentEmrRecords.value.length)
    return newRecord
  }

  // 根据患者ID获取病历记录
  function getRecordsByPatientId(patientId) {
    return recentEmrRecords.value.filter(r => r.patientId === patientId)
  }

  // 根据病历ID获取记录
  function getRecordById(id) {
    return recentEmrRecords.value.find(r => r.id === id) || null
  }

  // 获取告警列表
  const alerts = computed(() => {
    return recentEmrRecords.value
      .map(record => {
        if (record.status === 'pending' && record.alert) {
          return record.alert
        }
        return null
      })
      .filter(alert => alert !== null)
  })

  // 获取待办数量
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
             new Date(r.completedTime || r.createTime).toDateString() === today
    }).length
  })

  // 刷新数据（从 localStorage 重新加载）
  function refreshRecords() {
    recentEmrRecords.value = storageService.getEmrRecords()
    console.log('刷新病历记录，当前记录数:', recentEmrRecords.value.length)
  }

  return {
    recentEmrRecords,
    alerts,
    pendingCount,
    alertCount,
    todayCompletedCount,
    updateRecordStatus,
    addRecord,
    getRecordsByPatientId,
    getRecordById,
    refreshRecords
  }
})