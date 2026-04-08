// src/stores/referenceStore.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storageService from '@/services/storageService'

export const useReferenceStore = defineStore('reference', () => {
    // 数据源
    const orders = ref([])
    const labResults = ref([])
    const imagingReports = ref([])
    const templates = ref([])
    
    // 选中状态
    const selectedOrders = ref([])
    const selectedLab = ref([])
    const selectedImaging = ref([])
    const selectedTemplates = ref([])
    
    // 当前选项卡
    const activeTab = ref('orders')
    
    // 加载 Mock 数据（从 localStorage 读取）
    function loadMockData() {
        console.log('referenceStore: 开始加载数据')
        
        // 加载医嘱
        orders.value = storageService.getOrders()
        console.log('医嘱数据:', orders.value.length, '条')
        
        // 加载检验数据 - 关键修复：转换格式
        const rawLabResults = storageService.getLabResults()
        console.log('原始检验数据:', rawLabResults)
        
        // 转换数据格式以匹配组件期望
        labResults.value = rawLabResults.map(report => ({
            id: report.reportId,
            reportNo: report.reportNo,
            date: report.reportDate ? report.reportDate.split(' ')[0] : '',
            dateTime: report.reportDate,
            department: report.department,
            doctor: report.doctor,
            conclusion: report.conclusion,
            items: (report.items || []).map(item => ({
                id: `${report.reportId}_${item.testCode}`,
                itemName: item.testName,
                value: item.result,
                unit: item.unit,
                referenceRange: item.referenceMax ? 
                    (item.referenceMin ? `${item.referenceMin}~${item.referenceMax}` : `≤${item.referenceMax}`) :
                    (item.referenceMin ? `≥${item.referenceMin}` : '-'),
                flag: item.abnormalFlag === 'N' ? 'normal' : (item.abnormalFlag === 'H' ? 'high' : 'low')
            }))
        }))
        
        console.log('转换后的检验数据:', labResults.value)
        
        // 加载影像数据
        imagingReports.value = storageService.getImagingReports()
        console.log('影像数据:', imagingReports.value.length, '条')
        
        // 加载模板数据
        templates.value = storageService.getTemplates()
        console.log('模板数据:', templates.value.length, '条')
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
    
    // 获取所有选中项（带完整数据）
    function getSelectedItemsWithDetails() {
        const items = []
        
        // 医嘱
        selectedOrders.value.forEach(id => {
            const item = orders.value.find(o => o.id === id)
            if (item) items.push({ ...item, type: 'order' })
        })
        
        // 检验
        selectedLab.value.forEach(id => {
            for (const report of labResults.value) {
                const item = report.items.find(i => i.id === id)
                if (item) {
                    items.push({ 
                        ...item, 
                        type: 'lab', 
                        date: report.date,
                        reportId: report.id,
                        reportNo: report.reportNo,
                        department: report.department,
                        doctor: report.doctor
                    })
                    break
                }
            }
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
    
    // 总选中数
    const totalSelected = computed(() => {
        return selectedOrders.value.length + 
               selectedLab.value.length + 
               selectedImaging.value.length + 
               selectedTemplates.value.length
    })
    
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
        totalSelected,
        loadMockData,
        toggleSelection,
        getSelectedItemsWithDetails,
        clearAll
    }
})