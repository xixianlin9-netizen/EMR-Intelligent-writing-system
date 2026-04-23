// src/stores/emrStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 确保使用 export 导出
export const useEmrStore = defineStore('emr', () => {
  // 结构化字段
  const chiefComplaint = ref('')  // 主诉
  const presentIllness = ref('急性')  // 现病史类型
  const diagnoses = ref([])  // 诊断列表
  
  // 患者信息
  const currentPatient = ref(null)
  
  // 富文本内容
  const richTextContent = ref('')
  
  // 引用记录
  const referenceRecords = ref([])
  
  // 草稿信息
  const draftInfo = ref({
    lastSaved: null,
    hasUnsavedChanges: false
  })
  
  // 成套医嘱引用记录（用于可编辑插入）
  const insertedOrders = ref([])
  
  // 检验检查引用记录
  const insertedLabItems = ref([])
  
  // 更新方法
  function setChiefComplaint(value) {
    chiefComplaint.value = value
    draftInfo.value.hasUnsavedChanges = true
  }
  
  function setPresentIllness(value) {
    presentIllness.value = value
    draftInfo.value.hasUnsavedChanges = true
  }
  
  function addDiagnosis(diagnosis) {
    diagnoses.value.push(diagnosis)
    draftInfo.value.hasUnsavedChanges = true
  }
  
  function removeDiagnosis(index) {
    diagnoses.value.splice(index, 1)
    draftInfo.value.hasUnsavedChanges = true
  }
  
  function setCurrentPatient(patient) {
    currentPatient.value = patient
  }
  
  // 添加引用记录
  function addReferenceRecord(record) {
    const newRecord = {
      ...record,
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      insertedAt: new Date().toISOString()
    }
    referenceRecords.value.push(newRecord)
    draftInfo.value.hasUnsavedChanges = true
    
    if (record.type === 'order') {
      insertedOrders.value.push(newRecord)
    } else if (record.type === 'lab') {
      insertedLabItems.value.push(newRecord)
    }
    
    return newRecord
  }
  
  // 移除引用记录
  function removeReferenceRecord(id) {
    const index = referenceRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const record = referenceRecords.value[index]
      referenceRecords.value.splice(index, 1)
      
      if (record.type === 'order') {
        const orderIndex = insertedOrders.value.findIndex(o => o.id === id)
        if (orderIndex !== -1) insertedOrders.value.splice(orderIndex, 1)
      } else if (record.type === 'lab') {
        const labIndex = insertedLabItems.value.findIndex(l => l.id === id)
        if (labIndex !== -1) insertedLabItems.value.splice(labIndex, 1)
      }
      
      draftInfo.value.hasUnsavedChanges = true
    }
  }
  
  // 更新引用内容
  function updateReferenceContent(id, newContent) {
    const record = referenceRecords.value.find(r => r.id === id)
    if (record) {
      record.content = newContent
      record.edited = true
      record.editedAt = new Date().toISOString()
      draftInfo.value.hasUnsavedChanges = true
    }
  }
  
  // 完整状态
  const fullState = computed(() => ({
    chiefComplaint: chiefComplaint.value,
    presentIllness: presentIllness.value,
    diagnoses: diagnoses.value,
    currentPatient: currentPatient.value,
    richTextContent: richTextContent.value,
    referenceRecords: referenceRecords.value,
    insertedOrders: insertedOrders.value,
    insertedLabItems: insertedLabItems.value,
    draftInfo: draftInfo.value
  }))
  
  // 恢复状态
  function restoreState(state) {
    chiefComplaint.value = state.chiefComplaint || ''
    presentIllness.value = state.presentIllness || '急性'
    diagnoses.value = state.diagnoses || []
    currentPatient.value = state.currentPatient || null
    richTextContent.value = state.richTextContent || ''
    referenceRecords.value = state.referenceRecords || []
    insertedOrders.value = state.insertedOrders || []
    insertedLabItems.value = state.insertedLabItems || []
    draftInfo.value = {
      ...state.draftInfo,
      hasUnsavedChanges: false,
      restored: true
    }
  }
  
  // 触发自动保存
  function triggerAutoSave() {
    // autoSave 函数需要从外部传入，避免循环依赖
    console.log('触发自动保存')
  }
  
  // 手动保存
  function saveDraft() {
    console.log('手动保存')
    draftInfo.value.lastSaved = new Date().toISOString()
    draftInfo.value.hasUnsavedChanges = false
    return true
  }
  
  // 加载草稿
  function loadDraftFromStorage() {
    console.log('加载草稿')
    return false
  }
  
  // 清除草稿
  function clearDraftFromStorage() {
    console.log('清除草稿')
    draftInfo.value.hasUnsavedChanges = false
    draftInfo.value.lastSaved = null
  }
  
  // 重置状态
  function $reset() {
    chiefComplaint.value = ''
    presentIllness.value = '急性'
    diagnoses.value = []
    currentPatient.value = null
    richTextContent.value = ''
    referenceRecords.value = []
    insertedOrders.value = []
    insertedLabItems.value = []
    draftInfo.value = {
      lastSaved: null,
      hasUnsavedChanges: false
    }
  }
  
  return {
    // 状态
    chiefComplaint,
    presentIllness,
    diagnoses,
    currentPatient,
    richTextContent,
    referenceRecords,
    insertedOrders,
    insertedLabItems,
    draftInfo,
    
    // 方法
    setChiefComplaint,
    setPresentIllness,
    addDiagnosis,
    removeDiagnosis,
    setCurrentPatient,
    addReferenceRecord,
    removeReferenceRecord,
    updateReferenceContent,
    fullState,
    restoreState,
    triggerAutoSave,
    saveDraft,
    loadDraftFromStorage,
    clearDraftFromStorage,
    $reset
  }
})