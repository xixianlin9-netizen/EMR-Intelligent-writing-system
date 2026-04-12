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
        
        // 加载检验数据 - 保留患者信息
        const rawLabResults = storageService.getLabResults()
        console.log('原始检验数据:', rawLabResults.length, '条')
        
        // 转换检验数据格式，保留患者ID和姓名
        labResults.value = rawLabResults.map(report => ({
            id: report.reportId,
            reportNo: report.reportNo,
            date: report.reportDate ? report.reportDate.split(' ')[0] : '',
            dateTime: report.reportDate,
            patientId: report.patientId,        // 关键：保留患者ID
            patientName: report.patientName,    // 关键：保留患者姓名
            patientAge: report.patientAge,
            patientGender: report.patientGender,
            department: report.department,
            doctor: report.doctor,
            conclusion: report.conclusion,
            suggestion: report.suggestion,
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
        
        console.log('转换后的检验数据:', labResults.value.length, '条')
        
        // 加载影像数据 - 保留患者信息
        const rawImagingReports = storageService.getImagingReports()
        console.log('原始影像数据:', rawImagingReports.length, '条')
        
        // 转换影像数据格式，保留患者ID和姓名
        imagingReports.value = rawImagingReports.map(report => ({
            id: report.id,
            patientId: report.patientId,        // 关键：保留患者ID
            patientName: report.patientName,    // 关键：保留患者姓名
            date: report.date,
            modality: report.modality,
            modalityName: report.modalityName || getModalityName(report.modality),
            bodyPart: report.bodyPart,
            bodyPartName: report.bodyPartName || report.bodyPart,
            finding: report.finding,
            impression: report.impression,
            recommendation: report.recommendation,
            department: report.department,
            reportDoctor: report.reportDoctor,
            reviewer: report.reviewer,
            status: report.status
        }))
        
        console.log('转换后的影像数据:', imagingReports.value.length, '条')
        
        // 加载模板数据
        templates.value = storageService.getTemplates()
        console.log('模板数据:', templates.value.length, '条')
    }
    
    // 获取 modality 中文名称
    function getModalityName(modality) {
        const map = {
            'CT': '计算机断层扫描',
            'MRI': '磁共振成像',
            'XR': 'X线摄影',
            'US': '超声检查',
            'ECG': '心电图',
            'PET': '正电子发射断层扫描',
            'MG': '乳腺摄影'
        }
        return map[modality] || modality
    }
    
    // 根据患者ID获取检验数据
    function getLabResultsByPatientId(patientId) {
        if (!patientId) return []
        return labResults.value.filter(report => report.patientId === patientId)
    }
    
    // 根据患者ID获取影像数据
    function getImagingReportsByPatientId(patientId) {
        if (!patientId) return []
        return imagingReports.value.filter(report => report.patientId === patientId)
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
                        patientId: report.patientId,
                        patientName: report.patientName,
                        department: report.department,
                        doctor: report.doctor,
                        conclusion: report.conclusion
                    })
                    break
                }
            }
        })
        
        // 影像
        selectedImaging.value.forEach(id => {
            const item = imagingReports.value.find(i => i.id === id)
            if (item) items.push({ 
                ...item, 
                type: 'imaging',
                formattedText: formatImagingText(item)
            })
        })
        
        // 模板
        selectedTemplates.value.forEach(id => {
            const item = templates.value.find(t => t.id === id)
            if (item) items.push({ ...item, type: 'template' })
        })
        
        return items
    }
    
    // 格式化影像文本（用于插入编辑器）
    function formatImagingText(item) {
        if (!item) return ''
        return `【影像检查】${item.modalityName || item.modality} - ${item.bodyPartName || item.bodyPart}\n` +
               `影像所见：${item.finding}\n` +
               `诊断印象：${item.impression}\n` +
               `建议：${item.recommendation || '结合临床'}`
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
    
    // 重置所有数据（用于模式切换后）
    function reset() {
        clearAll()
        activeTab.value = 'orders'
    }
    
    return {
        // 状态
        orders,
        labResults,
        imagingReports,
        templates,
        selectedOrders,
        selectedLab,
        selectedImaging,
        selectedTemplates,
        activeTab,
        
        // 计算属性
        totalSelected,
        
        // 方法
        loadMockData,
        getLabResultsByPatientId,
        getImagingReportsByPatientId,
        toggleSelection,
        getSelectedItemsWithDetails,
        clearAll,
        reset,
        
        // 辅助函数
        getModalityName,
        formatImagingText
    }
})