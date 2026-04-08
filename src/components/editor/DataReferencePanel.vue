<!-- src/components/editor/DataReferencePanel.vue -->
<template>
  <el-card class="reference-panel" :body-style="{ padding: 0 }">
    <!-- 面板头部 -->
    <div class="panel-header">
      <h3>📋 数据引用</h3>
      <el-button 
        type="primary" 
        link 
        :disabled="totalSelected === 0"
        @click="clearAllSelections"
      >
        清空选中
      </el-button>
    </div>
    
    <!-- 选项卡 -->
    <el-tabs v-model="activeTab" class="reference-tabs">
      <!-- 医嘱选项卡 -->
      <el-tab-pane label="💊 医嘱" name="orders">
        <div class="tab-content">
          <el-input
            v-model="orderSearch"
            placeholder="搜索医嘱..."
            :prefix-icon="Search"
            size="small"
            class="search-input"
            clearable
          />
          <el-scrollbar height="400px">
            <div 
              v-for="item in filteredOrders" 
              :key="item.id"
              class="list-item"
              :class="{ 'is-selected': isSelected('orders', item.id) }"
              @click="toggleSelection('orders', item.id)"
            >
              <el-checkbox 
                :model-value="isSelected('orders', item.id)"
                @click.stop
                @change="() => toggleSelection('orders', item.id)"
              />
              <div class="item-content">
                <div class="item-name">{{ item.name }}</div>
                <div class="item-desc">{{ item.description || item.content }}</div>
                <el-tag size="small" type="info">{{ item.category }}</el-tag>
              </div>
            </div>
            <el-empty v-if="filteredOrders.length === 0" description="暂无医嘱" />
          </el-scrollbar>
        </div>
      </el-tab-pane>
      
      <!-- 检验选项卡 -->
      <el-tab-pane label="🔬 检验" name="lab">
        <div class="tab-content">
          <el-select
            v-model="selectedLabDate"
            placeholder="选择日期"
            size="small"
            class="date-select"
            clearable
            @change="onDateChange"
          >
            <el-option
              v-for="date in labDates"
              :key="date"
              :label="date"
              :value="date"
            />
          </el-select>
          <el-scrollbar height="400px">
            <!-- 报告信息卡片 - 优化版 -->
            <div v-if="currentLabReport" class="lab-report-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">报告编号：</span>
                  <span class="info-value">{{ currentLabReport.reportNo || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">科室：</span>
                  <span class="info-value">{{ currentLabReport.department || '-' }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">结论：</span>
                  <span class="info-value conclusion-text">{{ currentLabReport.conclusion || '-' }}</span>
                </div>
              </div>
            </div>
            <div 
              v-for="item in currentLabItems" 
              :key="item.id"
              class="list-item"
              :class="{ 'is-selected': isSelected('lab', item.id) }"
              @click="toggleSelection('lab', item.id)"
            >
              <el-checkbox 
                :model-value="isSelected('lab', item.id)"
                @click.stop
                @change="() => toggleSelection('lab', item.id)"
              />
              <div class="item-content">
                <div class="item-name">
                  {{ item.itemName }}
                  <el-tag 
                    size="small" 
                    :type="getFlagType(item.flag)"
                    class="flag-tag"
                  >
                    {{ item.flag === 'high' ? '↑' : item.flag === 'low' ? '↓' : '' }}
                  </el-tag>
                </div>
                <div class="item-value" :class="getFlagClass(item.flag)">
                  {{ item.value }} {{ item.unit }}
                </div>
                <div class="item-desc">
                  参考范围：{{ item.referenceRange }}
                </div>
              </div>
            </div>
            <el-empty v-if="currentLabItems.length === 0" description="暂无检验数据" />
          </el-scrollbar>
        </div>
      </el-tab-pane>
      
      <!-- 影像选项卡 -->
      <el-tab-pane label="🩻 影像" name="imaging">
        <div class="tab-content">
          <el-scrollbar height="400px">
            <div 
              v-for="item in imagingReports" 
              :key="item.id"
              class="list-item"
              :class="{ 'is-selected': isSelected('imaging', item.id) }"
              @click="toggleSelection('imaging', item.id)"
            >
              <el-checkbox 
                :model-value="isSelected('imaging', item.id)"
                @click.stop
                @change="() => toggleSelection('imaging', item.id)"
              />
              <div class="item-content">
                <div class="item-name">{{ item.modality }} - {{ item.bodyPart }}</div>
                <div class="item-desc">{{ item.finding }}</div>
                <div class="item-meta">
                  <span>{{ item.date }}</span>
                  <el-tag size="small" type="success">{{ item.impression }}</el-tag>
                </div>
              </div>
            </div>
            <el-empty v-if="imagingReports.length === 0" description="暂无影像数据" />
          </el-scrollbar>
        </div>
      </el-tab-pane>
      
      <!-- 模板选项卡 -->
      <el-tab-pane label="📝 模板" name="templates">
        <div class="tab-content">
          <el-input
            v-model="templateSearch"
            placeholder="搜索模板..."
            :prefix-icon="Search"
            size="small"
            class="search-input"
            clearable
          />
          <el-scrollbar height="400px">
            <div 
              v-for="item in filteredTemplates" 
              :key="item.id"
              class="list-item"
              :class="{ 'is-selected': isSelected('templates', item.id) }"
              @click="toggleSelection('templates', item.id)"
            >
              <el-checkbox 
                :model-value="isSelected('templates', item.id)"
                @click.stop
                @change="() => toggleSelection('templates', item.id)"
              />
              <div class="item-content">
                <div class="item-name">{{ item.name }}</div>
                <el-tag size="small" type="warning">{{ item.category }}</el-tag>
              </div>
            </div>
            <el-empty v-if="filteredTemplates.length === 0" description="暂无模板" />
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 底部操作栏 -->
    <div class="panel-footer">
      <div class="selected-count">
        已选中 <span class="count-number">{{ totalSelected }}</span> 项
      </div>
      <div class="action-buttons">
        <el-button 
          type="info" 
          :disabled="totalSelected === 0"
          @click="previewSelected"
          size="small"
        >
          预览
        </el-button>
        <el-button 
          type="primary" 
          :disabled="totalSelected === 0"
          @click="insertSelected"
          size="small"
        >
          插入选中项
        </el-button>
      </div>
    </div>
    
    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="引用预览" width="500px">
      <div class="preview-content">
        <div v-for="(item, index) in previewItems" :key="index" class="preview-item">
          <div class="preview-header">
            <el-tag size="small" :type="getItemTypeTag(item.type)">{{ getItemTypeName(item.type) }}</el-tag>
            <span class="preview-source">{{ getItemSource(item) }}</span>
          </div>
          <div class="preview-text">{{ getPreviewText(item) }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInsert">确认插入</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useReferenceStore } from '@/stores/referenceStore'
import { formatReferenceItem, getItemTypeName, getItemTypeTag, getPreviewText, getItemSource } from '@/utils/ruleEngine'

const emit = defineEmits(['insert'])

// 使用store
const refStore = useReferenceStore()

// 当前激活的选项卡
const activeTab = computed({
  get: () => refStore.activeTab,
  set: (value) => refStore.activeTab = value
})

// 搜索和筛选
const orderSearch = ref('')
const templateSearch = ref('')
const selectedLabDate = ref('')

// 预览相关
const previewVisible = ref(false)
const previewItems = ref([])

// 响应式布局
const isMobile = ref(false)

// 从 store 获取数据
const orders = computed(() => refStore.orders)
const labResults = computed(() => refStore.labResults)
const imagingReports = computed(() => refStore.imagingReports)
const templates = computed(() => refStore.templates)

// 过滤后的医嘱
const filteredOrders = computed(() => {
  if (!orderSearch.value) return orders.value
  return orders.value.filter(item => 
    item.name.includes(orderSearch.value) || 
    item.content?.includes(orderSearch.value)
  )
})

// 过滤后的模板
const filteredTemplates = computed(() => {
  if (!templateSearch.value) return templates.value
  return templates.value.filter(item => 
    item.name.includes(templateSearch.value)
  )
})

// 检验日期列表
const labDates = computed(() => {
  return labResults.value.map(item => item.date)
})

// 当前选中的检验报告
const currentLabReport = computed(() => {
  if (!selectedLabDate.value && labResults.value.length > 0) {
    selectedLabDate.value = labResults.value[0]?.date || ''
  }
  return labResults.value.find(item => item.date === selectedLabDate.value)
})

// 当前选中日期的检验项目
const currentLabItems = computed(() => {
  return currentLabReport.value?.items || []
})

// 日期变化时刷新
function onDateChange() {
  // 触发重新渲染
}

// 检查是否选中
function isSelected(type, id) {
  const map = {
    orders: refStore.selectedOrders,
    lab: refStore.selectedLab,
    imaging: refStore.selectedImaging,
    templates: refStore.selectedTemplates
  }
  return map[type]?.includes(id) || false
}

// 切换选中
function toggleSelection(type, id) {
  refStore.toggleSelection(type, id)
}

// 清空所有选中
function clearAllSelections() {
  refStore.clearAll()
  ElMessage.success('已清空选中项')
}

// 总选中数
const totalSelected = computed(() => refStore.totalSelected)

// 获取标记类型
function getFlagType(flag) {
  const map = { high: 'danger', low: 'warning', normal: 'success' }
  return map[flag] || 'info'
}

function getFlagClass(flag) {
  if (flag === 'high') return 'result-high'
  if (flag === 'low') return 'result-low'
  return ''
}

// 预览选中项
function previewSelected() {
  previewItems.value = refStore.getSelectedItemsWithDetails()
  previewVisible.value = true
}

// 确认插入
function confirmInsert() {
  previewVisible.value = false
  insertSelected()
}

// 插入选中项
function insertSelected() {
  const items = refStore.getSelectedItemsWithDetails()
  if (items.length > 0) {
    // 格式化每个项目
    const formattedItems = items.map(item => ({
      ...item,
      formattedText: formatReferenceItem(item)
    }))
    emit('insert', formattedItems)
    ElMessage.success(`已插入 ${items.length} 项`)
  }
}

// 响应式布局处理
function handleResize() {
  const width = window.innerWidth
  isMobile.value = width < 768
}

// 加载数据
onMounted(async () => {
  // 确保 store 中有数据
  if (labResults.value.length === 0) {
    refStore.loadMockData()
  }
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.reference-panel {
  height: 100%;
  border: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.reference-tabs {
  padding: 0 10px;
}

.tab-content {
  padding: 10px 0;
}

.search-input {
  margin-bottom: 10px;
  padding: 0 5px;
}

.date-select {
  width: 100%;
  margin-bottom: 10px;
  padding: 0 5px;
}

/* 报告信息卡片样式 - 网格布局 */
.lab-report-info {
  margin-bottom: 12px;
  padding: 0 5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
  background-color: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
}

.info-item {
  display: flex;
  align-items: baseline;
  font-size: 13px;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-label {
  color: #909399;
  width: 70px;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  font-weight: 500;
  word-break: break-word;
  flex: 1;
}

.conclusion-text {
  color: #409eff;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .info-item.full-width {
    grid-column: span 1;
  }
  
  .info-label {
    width: 65px;
  }
}

.list-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  margin: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid transparent;
}

.list-item:hover {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
}

.list-item.is-selected {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.list-item .el-checkbox {
  margin-right: 10px;
  margin-top: 2px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.item-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
  word-break: break-word;
}

.item-value {
  font-size: 14px;
  color: #409eff;
  margin-bottom: 4px;
}

.result-high {
  color: #f56c6c;
  font-weight: bold;
}

.result-low {
  color: #e6a23c;
  font-weight: bold;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.flag-tag {
  margin-left: 5px;
}

.panel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #fafafa;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.count-number {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
  margin: 0 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.preview-content {
  max-height: 400px;
  overflow-y: auto;
}

.preview-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.preview-source {
  font-size: 12px;
  color: #909399;
}

.preview-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

:deep(.el-tabs__header) {
  margin-bottom: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 10px;
}

:deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>