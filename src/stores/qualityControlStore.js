// src/stores/qualityControlStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQualityControlStore = defineStore('qualityControl', () => {
  // 质控记录
  const qcRecords = ref({})
  
  // 质控规则（根据你的病历字段调整）
  const qcRules = [
    { id: 1, name: '主诉必填', field: 'chiefComplaint', message: '主诉不能为空', score: 15 },
    { id: 2, name: '现病史必填', field: 'presentIllness', message: '现病史不能为空', score: 15 },
    { id: 3, name: '诊断必填', field: 'diagnosis', message: '诊断不能为空', score: 15 },
    { id: 4, name: '主诉长度合理', field: 'chiefComplaint', min: 5, max: 200, message: '主诉应在5-200字之间', score: 5 },
    { id: 5, name: '现病史包含时间', field: 'presentIllness', keywords: ['天前', '小时前', '周前', '月前'], message: '应包含发病时间描述', score: 10 },
    { id: 6, name: '诊断规范', field: 'diagnosis', keywords: ['诊断', '考虑', '拟诊'], message: '诊断描述应规范', score: 10 },
    { id: 7, name: '体格检查完整', field: 'physicalExam', message: '体格检查不能为空', score: 10 },
    { id: 8, name: '辅助检查记录', field: 'auxiliaryExam', message: '辅助检查应记录', score: 10 },
    { id: 9, name: '治疗意见明确', field: 'treatmentPlan', keywords: ['建议', '方案', '治疗'], message: '治疗意见应明确', score: 10 }
  ]
  
  // 执行质控检查
  const performQC = (emrData) => {
    const issues = []
    let totalScore = 100
    
    for (const rule of qcRules) {
      let value = emrData[rule.field] || ''
      
      let isValid = true
      if (rule.keywords) {
        isValid = rule.keywords.some(k => value.includes(k))
      } else if (rule.min !== undefined) {
        isValid = value.length >= rule.min && value.length <= rule.max
      } else {
        isValid = value && value.trim().length > 0
      }
      
      if (!isValid) {
        issues.push({
          ruleName: rule.name,
          message: rule.message,
          score: rule.score
        })
        totalScore -= rule.score
      }
    }
    
    const grade = totalScore >= 90 ? 'A' : totalScore >= 75 ? 'B' : totalScore >= 60 ? 'C' : 'D'
    
    return { 
      score: Math.max(0, totalScore), 
      grade, 
      issues, 
      passed: totalScore >= 60,
      checkTime: new Date().toISOString()
    }
  }
  
  // 保存质控记录
  const saveQC = (emrId, result) => {
    if (!qcRecords.value[emrId]) {
      qcRecords.value[emrId] = []
    }
    qcRecords.value[emrId].unshift({ ...result, time: new Date().toISOString() })
  }
  
  // 获取质控记录
  const getQC = (emrId) => qcRecords.value[emrId] || []
  
  // 获取最新质控结果
  const getLatestQC = (emrId) => {
    const records = getQC(emrId)
    return records.length > 0 ? records[0] : null
  }
  
  return { qcRules, qcRecords, performQC, saveQC, getQC, getLatestQC }
})