// 存储键名常量
const STORAGE_KEYS = {
    DRAFT: 'emr_draft',                    // 病历草稿
    PATIENTS: 'emr_patients',              // 患者数据
    ORDERS: 'emr_orders',                  // 医嘱模板
    LAB_RESULTS: 'emr_lab_results',         // 检验结果
    IMAGING_REPORTS: 'emr_imaging_reports', // 影像报告
    TEMPLATES: 'emr_templates',             // 病历模板
    EMR_RECORDS: 'emr_records',             // 病历记录列表
    USER_PREFERENCES: 'emr_user_prefs'      // 用户偏好设置
  }
  
  class StorageService {
    // 初始化本地数据（如果不存在则加载默认Mock数据）
    async initializeData() {
      console.log('初始化本地存储数据')
      
      if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
        try {
          const patientsData = await import('@/mock/patients.json')
          this.setPatients(patientsData.default)
          console.log('患者数据初始化完成')
        } catch (error) {
          console.error('加载患者数据失败:', error)
          this.setPatients([])
        }
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        try {
          const ordersData = await import('@/mock/orders.json')
          this.setOrders(ordersData.default)
          console.log('医嘱数据初始化完成')
        } catch (error) {
          console.error('加载医嘱数据失败:', error)
          this.setOrders([])
        }
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.LAB_RESULTS)) {
        try {
          const labData = await import('@/mock/lisData.json')
          this.setLabResults(labData.default)
          console.log('检验数据初始化完成')
        } catch (error) {
          console.error('加载检验数据失败:', error)
          this.setLabResults([])
        }
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.IMAGING_REPORTS)) {
        try {
          const imagingData = await import('@/mock/pacsData.json')
          this.setImagingReports(imagingData.default)
          console.log('影像数据初始化完成')
        } catch (error) {
          console.error('加载影像数据失败:', error)
          this.setImagingReports([])
        }
      }
      
      if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
        try {
          const templatesData = await import('@/mock/templates.json')
          this.setTemplates(templatesData.default)
          console.log('模板数据初始化完成')
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
  
    // 病历草稿相关
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
  
    // 患者数据
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
  
    // 医嘱模板
    getOrders() {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
      return data ? JSON.parse(data) : []
    }
  
    setOrders(orders) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    }
  
    // 检验结果
    getLabResults() {
      const data = localStorage.getItem(STORAGE_KEYS.LAB_RESULTS)
      return data ? JSON.parse(data) : []
    }
  
    setLabResults(results) {
      localStorage.setItem(STORAGE_KEYS.LAB_RESULTS, JSON.stringify(results))
    }
  
    // 影像报告
    getImagingReports() {
      const data = localStorage.getItem(STORAGE_KEYS.IMAGING_REPORTS)
      return data ? JSON.parse(data) : []
    }
  
    setImagingReports(reports) {
      localStorage.setItem(STORAGE_KEYS.IMAGING_REPORTS, JSON.stringify(reports))
    }
  
    // 病历模板
    getTemplates() {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
      return data ? JSON.parse(data) : []
    }
  
    setTemplates(templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates))
    }
  
    // 病历记录列表
    getEmrRecords() {
      const data = localStorage.getItem(STORAGE_KEYS.EMR_RECORDS)
      console.log('获取病历记录:', data)
      return data ? JSON.parse(data) : []
    }
  
    setEmrRecords(records) {
      console.log('保存病历记录:', records)
      localStorage.setItem(STORAGE_KEYS.EMR_RECORDS, JSON.stringify(records))
    }
  
    addEmrRecord(record) {
      console.log('添加病历记录:', record)
      const records = this.getEmrRecords()
      const newRecord = {
        ...record,
        id: record.id || `emr_${Date.now()}`,
        createTime: record.createTime || new Date().toISOString()
      }
      
      // 检查是否已存在
      const existingIndex = records.findIndex(r => r.id === newRecord.id)
      if (existingIndex !== -1) {
        records[existingIndex] = newRecord
        console.log('更新现有记录')
      } else {
        records.unshift(newRecord) // 添加到开头
        console.log('添加新记录到开头')
      }
      
      this.setEmrRecords(records)
      return newRecord
    }
  
    updateEmrRecord(id, updates) {
      console.log('更新病历记录:', id, updates)
      const records = this.getEmrRecords()
      const index = records.findIndex(r => r.id === id)
      if (index !== -1) {
        records[index] = { ...records[index], ...updates }
        this.setEmrRecords(records)
        console.log('更新成功:', records[index])
        return records[index]
      }
      console.log('未找到记录:', id)
      return null
    }
  
    // 用户偏好设置
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