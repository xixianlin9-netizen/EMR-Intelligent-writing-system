// src/stores/alertStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlertStore = defineStore('alert', () => {
  // 告警规则配置
  const alertRules = ref({
    admission: { hours: 8, message: '入院记录应在8小时内完成' },      // 入院记录
    progress: { hours: 24, message: '病程记录应在24小时内完成' },      // 病程记录
    discharge: { hours: 24, message: '出院小结应在24小时内完成' }       // 出院小结
  })

  // 检查病历是否超时
  function checkAlert(record) {
    if (!record.createTime || record.status === 'completed') return null
    
    const createTime = new Date(record.createTime).getTime()
    const now = new Date().getTime()
    const hoursDiff = (now - createTime) / (1000 * 60 * 60)
    
    const rule = alertRules.value[record.type || 'progress']
    if (rule && hoursDiff > rule.hours) {
      return {
        level: 'warning',
        message: `${record.patientName} - ${rule.message}`,
        hours: Math.floor(hoursDiff)
      }
    }
    return null
  }

  // 获取所有告警
  function getAlerts(records) {
    return records
      .map(record => checkAlert(record))
      .filter(alert => alert !== null)
  }

  return {
    alertRules,
    checkAlert,
    getAlerts
  }
})