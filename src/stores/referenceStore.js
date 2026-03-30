// src/stores/referenceStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReferenceStore = defineStore('reference', () => {
  // 数据源
  const orders = ref([])          // 医嘱
  const labResults = ref([])       // 检验
  const imagingReports = ref([])   // 影像
  const templates = ref([])        // 模板
  
  // 选中状态
  const selectedOrders = ref([])
  const selectedLab = ref([])
  const selectedImaging = ref([])
  const selectedTemplates = ref([])
  
  // 当前选项卡
  const activeTab = ref('orders')
  
  // 加载 Mock 数据
  function loadMockData() {
    // 医嘱模板数据
    orders.value = [
      { 
        id: 'ord_001', 
        name: '抗感染方案', 
        category: 'medication', 
        content: '头孢呋辛酯片 0.25g bid po',
        description: '适用于呼吸道感染'
      },
      { 
        id: 'ord_002', 
        name: '补液方案', 
        category: 'treatment', 
        content: '0.9%氯化钠注射液 500ml ivgtt qd',
        description: '基础补液'
      },
      { 
        id: 'ord_003', 
        name: '止咳化痰', 
        category: 'medication', 
        content: '盐酸氨溴索片 30mg tid po',
        description: '祛痰治疗'
      },
      { 
        id: 'ord_004', 
        name: '降压方案', 
        category: 'medication', 
        content: '硝苯地平缓释片 30mg qd po',
        description: '高血压常规治疗'
      }
    ]
    
    // 检验结果数据
    labResults.value = [
      {
        id: 'lab_001',
        date: '2026-03-17',
        items: [
          { id: 'lab_item_001', itemName: '白细胞', value: 6.5, unit: '×10⁹/L', referenceRange: '4.0-10.0', flag: 'normal' },
          { id: 'lab_item_002', itemName: '中性粒细胞', value: 70, unit: '%', referenceRange: '50-70', flag: 'normal' },
          { id: 'lab_item_003', itemName: 'C反应蛋白', value: 8.2, unit: 'mg/L', referenceRange: '<10', flag: 'normal' }
        ]
      },
      {
        id: 'lab_002',
        date: '2026-03-16',
        items: [
          { id: 'lab_item_004', itemName: '白细胞', value: 12.5, unit: '×10⁹/L', referenceRange: '4.0-10.0', flag: 'high' },
          { id: 'lab_item_005', itemName: '中性粒细胞', value: 85, unit: '%', referenceRange: '50-70', flag: 'high' },
          { id: 'lab_item_006', itemName: 'C反应蛋白', value: 25.3, unit: 'mg/L', referenceRange: '<10', flag: 'high' }
        ]
      }
    ]
    
    // 影像报告数据
    imagingReports.value = [
      { 
        id: 'img_001', 
        modality: 'CT', 
        bodyPart: '胸部', 
        finding: '双肺纹理增粗，未见明显实变',
        impression: '支气管炎可能',
        date: '2026-03-17'
      },
      { 
        id: 'img_002', 
        modality: 'X线', 
        bodyPart: '胸部', 
        finding: '右下肺斑片状阴影',
        impression: '肺炎',
        date: '2026-03-16'
      }
    ]
    
    // 模板数据
    templates.value = [
      { 
        id: 'tmp_001', 
        name: '普通感冒模板', 
        category: 'common',
        content: '主诉：发热、咳嗽3天。患者急性起病，体温最高38.5℃，伴有鼻塞、流涕。'
      },
      { 
        id: 'tmp_002', 
        name: '高血压随访模板', 
        category: 'chronic',
        content: '患者高血压病史5年，近期血压控制在140/90mmHg左右，规律服用降压药物。'
      },
      { 
        id: 'tmp_003', 
        name: '入院记录模板', 
        category: 'admission',
        content: '患者因"发热、咳嗽3天"入院。患者3天前无明显诱因出现发热，体温最高38.5℃...'
      }
    ]
  }
  
  // 切换选中
  function toggleSelection(type, id) {
    const map = {
      orders: selectedOrders,
      lab: selectedLab,
      imaging: selectedImaging,
      templates: selectedTemplates
    }
    
    const selected = map[type]
    if (!selected) return
    
    const index = selected.value.indexOf(id)
    if (index === -1) {
      selected.value.push(id)
    } else {
      selected.value.splice(index, 1)
    }
  }
  
  // 获取所有选中项
  const selectedItems = computed(() => {
    const items = []
    
    selectedOrders.value.forEach(id => {
      const item = orders.value.find(o => o.id === id)
      if (item) items.push({ ...item, type: 'order' })
    })
    
    selectedLab.value.forEach(id => {
      // 需要在 labResults 中查找具体的检验项
      labResults.value.forEach(report => {
        const item = report.items.find(i => i.id === id)
        if (item) items.push({ ...item, type: 'lab', date: report.date })
      })
    })
    
    selectedImaging.value.forEach(id => {
      const item = imagingReports.value.find(i => i.id === id)
      if (item) items.push({ ...item, type: 'imaging' })
    })
    
    selectedTemplates.value.forEach(id => {
      const item = templates.value.find(t => t.id === id)
      if (item) items.push({ ...item, type: 'template' })
    })
    
    return items
  })
  
  // 总选中数
  const totalSelected = computed(() => {
    return selectedOrders.value.length + 
           selectedLab.value.length + 
           selectedImaging.value.length + 
           selectedTemplates.value.length
  })
  
  // 获取选中项详情（带完整数据）
  function getSelectedItemsWithDetails() {
    const items = []
    
    // 医嘱
    selectedOrders.value.forEach(id => {
      const item = orders.value.find(o => o.id === id)
      if (item) items.push({ ...item, type: 'order' })
    })
    
    // 检验
    selectedLab.value.forEach(id => {
      labResults.value.forEach(report => {
        const item = report.items.find(i => i.id === id)
        if (item) items.push({ 
          ...item, 
          type: 'lab', 
          date: report.date,
          reportId: report.id 
        })
      })
    })
    
    // 影像
    selectedImaging.value.forEach(id => {
      const item = imagingReports.value.find(i => i.id === id)
      if (item) items.push({ ...item, type: 'imaging' })
    })
    
    // 模板
    selectedTemplates.value.forEach(id => {
      const item = templates.value.find(t => t.id === id)
      if (item) items.push({ ...item, type: 'template' })
    })
    
    return items
  }
  
  // 清空所有选中
  function clearAll() {
    selectedOrders.value = []
    selectedLab.value = []
    selectedImaging.value = []
    selectedTemplates.value = []
  }
  
  return {
    orders,
    labResults,
    imagingReports,
    templates,
    selectedOrders,
    selectedLab,
    selectedImaging,
    selectedTemplates,
    activeTab,
    selectedItems,
    totalSelected,
    loadMockData,
    toggleSelection,
    getSelectedItemsWithDetails,
    clearAll
  }
})