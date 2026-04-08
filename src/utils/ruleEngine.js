// src/utils/ruleEngine.js

// 检验结果转写
export function formatLabResult(item) {
  if (!item) return ''
  
  let result = `${item.itemName} ${item.value}${item.unit}`
  
  if (item.referenceRange) {
    result += `（参考范围 ${item.referenceRange}）`
  }
  
  // 添加异常标记
  if (item.flag === 'high') {
    result = `↑ ` + result
  } else if (item.flag === 'low') {
    result = `↓ ` + result
  }
  
  return result
}

// 影像描述转写
export function formatImagingReport(item) {
  if (!item) return ''
  
  const bodyPart = item.bodyPart || '胸部'
  const modality = item.modality || 'CT'
  const finding = item.finding || ''
  const impression = item.impression ? `，印象：${item.impression}` : ''
  
  return `${bodyPart}${modality}示：${finding}${impression}`
}

// 医嘱格式化
export function formatOrder(item) {
  if (!item) return ''
  return `${item.name}：${item.content}`
}

// 模板格式化
export function formatTemplate(item) {
  if (!item) return ''
  return item.content
}

// 根据类型格式化
export function formatReferenceItem(item) {
  switch (item.type) {
    case 'order':
      return formatOrder(item)
    case 'lab':
      return formatLabResult(item)
    case 'imaging':
      return formatImagingReport(item)
    case 'template':
      return formatTemplate(item)
    default:
      return item.content || JSON.stringify(item)
  }
}

// 获取项目类型名称
export function getItemTypeName(type) {
  const map = {
    order: '医嘱',
    lab: '检验',
    imaging: '影像',
    template: '模板'
  }
  return map[type] || type
}

// 获取项目类型标签样式
export function getItemTypeTag(type) {
  const map = {
    order: 'info',
    lab: 'warning',
    imaging: 'success',
    template: 'primary'
  }
  return map[type] || 'info'
}

// 获取预览文本
export function getPreviewText(item) {
  switch (item.type) {
    case 'order':
      return `${item.name}：${(item.content || '').substring(0, 50)}${(item.content || '').length > 50 ? '...' : ''}`
    case 'lab':
      return `${item.itemName} ${item.value}${item.unit}`
    case 'imaging':
      return `${item.modality}：${(item.finding || '').substring(0, 50)}${(item.finding || '').length > 50 ? '...' : ''}`
    case 'template':
      return item.name
    default:
      return JSON.stringify(item)
  }
}

// 获取项目来源
export function getItemSource(item) {
  switch (item.type) {
    case 'order':
      return item.category || '医嘱'
    case 'lab':
      return item.date ? `${item.date} 检验` : '检验'
    case 'imaging':
      return item.date ? `${item.date} 影像` : '影像'
    case 'template':
      return item.category || '模板'
    default:
      return ''
  }
}