<!-- src/views/DataReferenceView.vue -->
<template>
  <div class="data-reference-view">
    <el-row :gutter="20">
      <el-col :span="6">
        <DataReferencePanel @insert="handleInsert" />
      </el-col>
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>引用预览</span>
              <el-button type="primary" @click="applyToEditor">应用到编辑器</el-button>
            </div>
          </template>
          
          <div class="preview-area">
            <div v-for="(item, index) in selectedItems" :key="index" class="preview-item">
              <el-tag :type="getTagType(item.type)" size="small">{{ item.type }}</el-tag>
              <span class="preview-content">{{ formatItem(item) }}</span>
              <el-button type="danger" link @click="removeItem(index)">删除</el-button>
            </div>
            <el-empty v-if="selectedItems.length === 0" description="暂无选中项" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import DataReferencePanel from '@/components/editor/DataReferencePanel.vue'

const selectedItems = ref([])

function handleInsert(items) {
  selectedItems.value.push(...items)
  ElMessage.success(`已添加 ${items.length} 项`)
}

function getTagType(type) {
  const map = {
    order: 'info',
    lab: 'warning',
    imaging: 'success',
    template: 'primary'
  }
  return map[type] || 'info'
}

function formatItem(item) {
  switch (item.type) {
    case 'order':
      return `${item.name}：${item.content}`
    case 'lab':
      return `${item.itemName} ${item.value}${item.unit}`
    case 'imaging':
      return `${item.modality}：${item.finding}`
    case 'template':
      return item.name
    default:
      return JSON.stringify(item)
  }
}

function removeItem(index) {
  selectedItems.value.splice(index, 1)
}

function applyToEditor() {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要引用的项目')
    return
  }
  // 跳转到编辑器并传递选中项
  ElMessage.success('已应用到编辑器')
}
</script>

<style scoped>
.data-reference-view {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-area {
  min-height: 400px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-content {
  flex: 1;
  font-size: 14px;
}
</style>