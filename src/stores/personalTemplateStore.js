// src/stores/personalTemplateStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
// 直接从现有的 templates.json 导入
import systemTemplates from '@/mock/templates.json'

export const usePersonalTemplateStore = defineStore('personalTemplate', () => {
  const groups = ref([])
  const templates = ref([])
  const currentGroupId = ref(null)
  const currentTemplateId = ref(null)

  // 加载数据
  function loadData() {
    console.log('personalTemplateStore: 开始加载数据')
    
    const storedGroups = localStorage.getItem('personal_template_groups')
    const storedTemplates = localStorage.getItem('personal_templates')
    
    if (storedGroups && storedTemplates) {
      // 已有数据，从 localStorage 加载
      groups.value = JSON.parse(storedGroups)
      templates.value = JSON.parse(storedTemplates)
      console.log('从 localStorage 加载个人模板数据:', templates.value.length, '条')
    } else {
      // 首次使用，从系统模板导入
      console.log('首次使用，从系统模板 templates.json 导入数据')
      initFromSystemTemplates()
    }
  }
  
  // 从系统模板初始化
  function initFromSystemTemplates() {
    console.log('系统模板数据:', systemTemplates)
    
    // 检查 systemTemplates 的结构
    let templateList = []
    if (Array.isArray(systemTemplates)) {
      templateList = systemTemplates
    } else if (systemTemplates.data && Array.isArray(systemTemplates.data)) {
      templateList = systemTemplates.data
    } else if (systemTemplates.list && Array.isArray(systemTemplates.list)) {
      templateList = systemTemplates.list
    }
    
    console.log('解析后的模板列表:', templateList.length, '条')
    
    // 创建默认分组
    const defaultGroups = [
      { id: 'group_common', name: '常用模板', order: 1, templateCount: 0 },
      { id: 'group_admission', name: '入院记录', order: 2, templateCount: 0 },
      { id: 'group_discharge', name: '出院小结', order: 3, templateCount: 0 },
      { id: 'group_progress', name: '病程记录', order: 4, templateCount: 0 }
    ]
    
    // 转换模板格式
    const importedTemplates = templateList.map((t, index) => ({
      id: t.id || `tmp_${Date.now()}_${index}`,
      name: t.name || `模板${index + 1}`,
      groupId: getGroupIdByCategory(t.category),
      fields: [],
      content: t.content || '',
      preview: t.preview || '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
    
    // 更新分组模板数量
    defaultGroups.forEach(group => {
      group.templateCount = importedTemplates.filter(t => t.groupId === group.id).length
    })
    
    groups.value = defaultGroups
    templates.value = importedTemplates
    
    saveGroups()
    saveTemplates()
    
    console.log('系统模板导入完成，共', templates.value.length, '条')
    console.log('分组:', groups.value)
  }
  
  // 根据分类获取分组ID
  function getGroupIdByCategory(category) {
    const map = {
      'common': 'group_common',
      'admission': 'group_admission',
      'discharge': 'group_discharge',
      'progress': 'group_progress',
      'chronic': 'group_common',
      'emergency': 'group_common',
      'exam': 'group_common',
      'surgery': 'group_common',
      'consultation': 'group_common',
      'transfer': 'group_common',
      'communication': 'group_common'
    }
    return map[category] || 'group_common'
  }
  
  // 保存分组
  function saveGroups() {
    localStorage.setItem('personal_template_groups', JSON.stringify(groups.value))
  }
  
  // 保存模板
  function saveTemplates() {
    localStorage.setItem('personal_templates', JSON.stringify(templates.value))
  }
  
  // 更新分组模板数量
  function updateGroupCounts() {
    groups.value.forEach(group => {
      group.templateCount = templates.value.filter(t => t.groupId === group.id).length
    })
    saveGroups()
  }
  
  // ==================== 分组操作 ====================
  function addGroup(name) {
    const newGroup = {
      id: `group_${Date.now()}`,
      name: name,
      order: groups.value.length + 1,
      templateCount: 0
    }
    groups.value.push(newGroup)
    saveGroups()
    return newGroup
  }
  
  function updateGroup(groupId, newName) {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
      group.name = newName
      saveGroups()
    }
  }
  
  function deleteGroup(groupId) {
    // 删除分组下的模板
    templates.value = templates.value.filter(t => t.groupId !== groupId)
    groups.value = groups.value.filter(g => g.id !== groupId)
    saveGroups()
    saveTemplates()
  }
  
  // ==================== 模板操作 ====================
  function addTemplate(groupId, name) {
    const newTemplate = {
      id: `tmp_${Date.now()}`,
      name: name,
      groupId: groupId,
      fields: [],
      content: '',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    templates.value.push(newTemplate)
    saveTemplates()
    updateGroupCounts()
    return newTemplate
  }
  
  function updateTemplate(templateId, updates) {
    const template = templates.value.find(t => t.id === templateId)
    if (template) {
      Object.assign(template, updates)
      template.updatedAt = new Date().toISOString()
      saveTemplates()
    }
  }
  
  function deleteTemplate(templateId) {
    templates.value = templates.value.filter(t => t.id !== templateId)
    saveTemplates()
    updateGroupCounts()
  }
  
  function getTemplatesByGroup(groupId) {
    return templates.value.filter(t => t.groupId === groupId)
  }
  
  function getTemplateById(templateId) {
    return templates.value.find(t => t.id === templateId)
  }
  
  // ==================== 字段操作 ====================
  function addField(templateId, fieldData) {
    const template = templates.value.find(t => t.id === templateId)
    if (template) {
      const newField = {
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...fieldData
      }
      if (!template.fields) template.fields = []
      template.fields.push(newField)
      template.updatedAt = new Date().toISOString()
      saveTemplates()
      return newField
    }
    return null
  }
  
  function updateField(templateId, fieldId, updates) {
    const template = templates.value.find(t => t.id === templateId)
    if (template && template.fields) {
      const field = template.fields.find(f => f.id === fieldId)
      if (field) {
        Object.assign(field, updates)
        template.updatedAt = new Date().toISOString()
        saveTemplates()
      }
    }
  }
  
  function deleteField(templateId, fieldId) {
    const template = templates.value.find(t => t.id === templateId)
    if (template && template.fields) {
      template.fields = template.fields.filter(f => f.id !== fieldId)
      template.updatedAt = new Date().toISOString()
      saveTemplates()
    }
  }
  
  // ==================== 模板使用 ====================
  function recordUsage(templateId) {
    const template = templates.value.find(t => t.id === templateId)
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1
      saveTemplates()
    }
  }
  
  function applyTemplate(templateId, mode, currentData = {}) {
    const template = getTemplateById(templateId)
    if (!template) return null
    
    recordUsage(templateId)
    
    const generatedData = {}
    if (template.fields) {
      template.fields.forEach(field => {
        if (field.type === 'select' || field.type === 'radio') {
          generatedData[field.code || field.label] = field.defaultValue || ''
        } else if (field.type === 'checkbox') {
          generatedData[field.code || field.label] = field.defaultValue || []
        } else {
          generatedData[field.code || field.label] = field.defaultValue || ''
        }
      })
    }
    
    switch (mode) {
      case 'replace_single':
        return { ...currentData, ...generatedData }
      case 'replace_all':
        return generatedData
      case 'append':
        return { ...currentData, ...generatedData, appendContent: template.content }
      default:
        return generatedData
    }
  }
  
  return {
    groups,
    templates,
    currentGroupId,
    currentTemplateId,
    loadData,
    addGroup,
    updateGroup,
    deleteGroup,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByGroup,
    getTemplateById,
    addField,
    updateField,
    deleteField,
    recordUsage,
    applyTemplate
  }
})