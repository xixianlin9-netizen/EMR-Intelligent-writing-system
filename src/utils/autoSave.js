// src/utils/autoSave.js
import { debounce } from 'lodash-es'
import storageService from '@/services/storageService'

// 生成内容哈希用于比对
const generateHash = (content) => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(content))))
}

// 自动保存（防抖30秒）
export const autoSave = debounce((emrState) => {
  try {
    // 生成当前内容的哈希
    const currentHash = generateHash(emrState)
    
    // 获取上次保存的草稿
    const lastDraft = storageService.getDraft()
    
    // 如果内容没有变化，不保存
    if (lastDraft && lastDraft.hash === currentHash) {
      console.log('内容无变化，跳过自动保存')
      return false
    }
    
    // 准备保存的数据
    const draftData = {
      ...emrState,
      hash: currentHash,
      lastSaved: new Date().toISOString(),
      autoSave: true
    }
    
    // 保存到 localStorage
    storageService.saveDraft(draftData)
    console.log('草稿自动保存成功', new Date().toLocaleTimeString())
    
    return true
  } catch (error) {
    console.error('自动保存失败:', error)
    return false
  }
}, 30000)

// 手动保存
export function manualSave(emrState) {
  try {
    const hash = generateHash(emrState)
    const draftData = {
      ...emrState,
      hash,
      lastSaved: new Date().toISOString(),
      autoSave: false
    }
    storageService.saveDraft(draftData)
    console.log('手动保存成功')
    return true
  } catch (error) {
    console.error('手动保存失败:', error)
    return false
  }
}

// 加载草稿
export function loadDraft() {
  return storageService.getDraft()
}

// 清除草稿
export function clearDraft() {
  storageService.clearDraft()
}

// 检查是否有草稿
export function hasDraft() {
  return storageService.hasDraft()
}

// 比较草稿与当前内容的差异
export function compareDraftWithCurrent(currentState) {
  const draft = storageService.getDraft()
  if (!draft) return null
  
  const currentHash = generateHash(currentState)
  
  return {
    hasChanges: draft.hash !== currentHash,
    draft,
    current: currentState
  }
}

// 恢复草稿后清除
export function restoreAndClear() {
  const draft = storageService.getDraft()
  storageService.clearDraft()
  return draft
}