// src/services/storageService.js

// 存储键名常量
const STORAGE_KEYS = {
  DRAFT: 'emr_draft',
  PATIENTS: 'emr_patients',
  PATIENTS_OUTPATIENT: 'emr_patients_outpatient',  // 新增：门诊患者
  ORDERS: 'emr_orders',
  LAB_RESULTS: 'emr_lab_results',
  IMAGING_REPORTS: 'emr_imaging_reports',
  TEMPLATES: 'emr_templates',
  EMR_RECORDS: 'emr_records',
  USER_PREFERENCES: 'emr_user_prefs'
}

class StorageService {
  // 初始化本地数据（如果不存在则加载默认Mock数据）
  async initializeData() {
      console.log('初始化本地存储数据')
      
      // 初始化住院患者数据
      if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
          try {
              const patientsData = await import('@/mock/patients.json')
              this.setPatients(patientsData.default)
              console.log('住院患者数据初始化完成，共', patientsData.default.length, '条')
          } catch (error) {
              console.error('加载住院患者数据失败:', error)
              this.setPatients([])
          }
      }
      
      // 初始化门诊患者数据
      if (!localStorage.getItem(STORAGE_KEYS.PATIENTS_OUTPATIENT)) {
          try {
              const outpatientData = await import('@/mock/patients_outpatient.json')
              this.setOutpatientPatients(outpatientData.default)
              console.log('门诊患者数据初始化完成，共', outpatientData.default.length, '条')
          } catch (error) {
              console.error('加载门诊患者数据失败:', error)
              this.setOutpatientPatients([])
          }
      }
      
      // 初始化医嘱数据
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
          try {
              const ordersData = await import('@/mock/orders.json')
              this.setOrders(ordersData.default)
              console.log('医嘱数据初始化完成，共', ordersData.default.length, '条')
          } catch (error) {
              console.error('加载医嘱数据失败:', error)
              this.setOrders([])
          }
      }
      
      // 初始化检验数据 - 关键修复！
      if (!localStorage.getItem(STORAGE_KEYS.LAB_RESULTS)) {
          try {
              const labData = await import('@/mock/lisData.json')
              // 解析 lisData.json 的数据结构：{code, message, data: {list}}
              let labList = []
              if (labData.default?.data?.list) {
                  labList = labData.default.data.list
              } else if (Array.isArray(labData.default)) {
                  labList = labData.default
              } else if (labData.default?.list) {
                  labList = labData.default.list
              }
              this.setLabResults(labList)
              console.log('检验数据初始化完成，共', labList.length, '条')
          } catch (error) {
              console.error('加载检验数据失败:', error)
              this.setLabResults([])
          }
      }
      
      // 初始化影像数据
      if (!localStorage.getItem(STORAGE_KEYS.IMAGING_REPORTS)) {
          try {
              const imagingData = await import('@/mock/pacsData.json')
              this.setImagingReports(imagingData.default)
              console.log('影像数据初始化完成，共', imagingData.default.length, '条')
          } catch (error) {
              console.error('加载影像数据失败:', error)
              this.setImagingReports([])
          }
      }
      
      // 初始化模板数据
      if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
          try {
              const templatesData = await import('@/mock/templates.json')
              this.setTemplates(templatesData.default)
              console.log('模板数据初始化完成，共', templatesData.default.length, '条')
          } catch (error) {
              console.error('加载模板数据失败:', error)
              this.setTemplates([])
          }
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.EMR_RECORDS)) {
          this.setEmrRecords([])
          console.log('病历记录初始化完成')
      }
  }
  
  // ========== 门诊患者数据 ==========
  getOutpatientPatients() {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS_OUTPATIENT)
      return data ? JSON.parse(data) : []
  }
  
  setOutpatientPatients(patients) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS_OUTPATIENT, JSON.stringify(patients))
  }
  
  // ========== 住院患者数据 ==========
  getPatients() {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS)
      return data ? JSON.parse(data) : []
  }
  
  setPatients(patients) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients))
  }
  
  getPatientById(id) {
      const patients = this.getPatients()
      return patients.find(p => p.id === id) || null
  }
  
  // ========== 医嘱模板 ==========
  getOrders() {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
      return data ? JSON.parse(data) : []
  }
  
  setOrders(orders) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  }
  
  // ========== 检验结果 ==========
  getLabResults() {
      const data = localStorage.getItem(STORAGE_KEYS.LAB_RESULTS)
      return data ? JSON.parse(data) : []
  }
  
  setLabResults(results) {
      localStorage.setItem(STORAGE_KEYS.LAB_RESULTS, JSON.stringify(results))
  }
  
  // ========== 影像报告 ==========
  getImagingReports() {
      const data = localStorage.getItem(STORAGE_KEYS.IMAGING_REPORTS)
      return data ? JSON.parse(data) : []
  }
  
  setImagingReports(reports) {
      localStorage.setItem(STORAGE_KEYS.IMAGING_REPORTS, JSON.stringify(reports))
  }
  
  // ========== 病历模板 ==========
  getTemplates() {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
      return data ? JSON.parse(data) : []
  }
  
  setTemplates(templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
  }
  
  // ========== 病历草稿 ==========
  saveDraft(draft) {
      const draftWithMeta = {
          ...draft,
          lastUpdated: new Date().toISOString(),
          version: '1.0'
      }
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draftWithMeta))
      console.log('草稿已保存')
  }
  
  getDraft() {
      const draft = localStorage.getItem(STORAGE_KEYS.DRAFT)
      return draft ? JSON.parse(draft) : null
  }
  
  clearDraft() {
      localStorage.removeItem(STORAGE_KEYS.DRAFT)
      console.log('草稿已清除')
  }
  
  hasDraft() {
      return localStorage.getItem(STORAGE_KEYS.DRAFT) !== null
  }
  
  // ========== 病历记录列表 ==========
  getEmrRecords() {
      const data = localStorage.getItem(STORAGE_KEYS.EMR_RECORDS)
      return data ? JSON.parse(data) : []
  }
  
  setEmrRecords(records) {
      localStorage.setItem(STORAGE_KEYS.EMR_RECORDS, JSON.stringify(records))
  }
  
  addEmrRecord(record) {
      const records = this.getEmrRecords()
      const newRecord = {
          ...record,
          id: record.id || `emr_${Date.now()}`,
          createTime: record.createTime || new Date().toISOString()
      }
      
      const existingIndex = records.findIndex(r => r.id === newRecord.id)
      if (existingIndex !== -1) {
          records[existingIndex] = newRecord
      } else {
          records.unshift(newRecord)
      }
      
      this.setEmrRecords(records)
      return newRecord
  }
  
  updateEmrRecord(id, updates) {
      const records = this.getEmrRecords()
      const index = records.findIndex(r => r.id === id)
      if (index !== -1) {
          records[index] = { ...records[index], ...updates }
          this.setEmrRecords(records)
          return records[index]
      }
      return null
  }
  
  // ========== 用户偏好 ==========
  getUserPreferences() {
      const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
      return prefs ? JSON.parse(prefs) : {}
  }
  
  setUserPreferences(prefs) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefs))
  }
  
  // 清空所有数据（用于测试）
  clearAllData() {
      Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key)
      })
      console.log('所有数据已清空')
  }
}

export default new StorageService()