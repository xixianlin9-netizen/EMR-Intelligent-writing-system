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
      <!-- ==================== 医嘱选项卡 ==================== -->
      <el-tab-pane label="💊 医嘱" name="orders">
        <div class="tab-content">
          <!-- 搜索框 -->
          <el-input
            v-model="orderSearch"
            placeholder="搜索医嘱..."
            :prefix-icon="Search"
            size="small"
            class="search-input"
            clearable
          />
          
          <!-- 分类筛选 -->
          <el-select 
            v-model="selectedCategory" 
            placeholder="选择分类" 
            size="small" 
            clearable
            class="category-select"
          >
            <el-option label="全部分类" value="" />
            <el-option label="💊 西药" value="medication" />
            <el-option label="💉 输液治疗" value="treatment" />
            <el-option label="🔬 实验室检查" value="examination" />
            <el-option label="🩺 护理操作" value="nursing" />
            <el-option label="🍽️ 饮食指导" value="diet" />
            <el-option label="📋 医嘱建议" value="advice" />
          </el-select>
          
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
                <div class="item-name">
                  {{ item.name }}
                  <el-tag size="small" :type="getCategoryTagType(item.category)" class="category-tag">
                    {{ getCategoryName(item.category) }}
                  </el-tag>
                </div>
                <div class="item-desc">{{ item.description || item.content }}</div>
                <div class="item-meta" v-if="item.dosage || item.frequency">
                  <span v-if="item.dosage">💊 {{ item.dosage }}</span>
                  <span v-if="item.frequency">⏰ {{ getFrequencyText(item.frequency) }}</span>
                  <span v-if="item.route">💉 {{ getRouteText(item.route) }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredOrders.length === 0" description="暂无医嘱" />
          </el-scrollbar>
        </div>
      </el-tab-pane>
      
      <!-- ==================== 检验选项卡 ==================== -->
      <el-tab-pane label="🔬 检验" name="lab">
        <div class="tab-content">
          <!-- 当前患者提示 -->
          <div class="current-patient-info" v-if="currentPatient">
            <el-alert 
              :title="`当前患者：${currentPatient.name} (ID: ${currentPatient.id})`" 
              type="info" 
              :closable="false"
              show-icon
            />
            <div v-if="currentPatient.id?.startsWith('op') && filteredLabResults.length > 0" class="data-source-tip">
              <el-text size="small" type="success">✅ 已关联患者历史影像数据</el-text>
            </div>
          </div>
          <div class="current-patient-info" v-else-if="props.patientId">
            <el-alert 
              title="正在加载患者信息..." 
              type="info" 
              :closable="false"
              show-icon
            />
          </div>
          <div class="current-patient-info" v-else>
            <el-alert 
              title="请先从患者列表选择患者" 
              type="warning" 
              :closable="false"
              show-icon
            />
          </div>
          
          <!-- 日期选择 - 仅当有数据时显示 -->
          <el-select
            v-if="filteredLabDates.length > 0"
            v-model="selectedLabDate"
            placeholder="选择检查日期"
            size="small"
            class="date-select"
            clearable
            @change="onDateChange"
          >
            <el-option
              v-for="date in filteredLabDates"
              :key="date"
              :label="date"
              :value="date"
            />
          </el-select>
          
          <el-scrollbar height="400px">
            <!-- 无患者数据提示 -->
            <div v-if="!props.patientId && !currentPatient" class="empty-tip">
              <el-empty description="请先从患者列表选择患者" />
            </div>
            
            <!-- 有患者但无检验数据 -->
            <div v-else-if="filteredLabResults.length === 0" class="empty-tip">
              <el-empty description="该患者暂无检验数据" />
            </div>
            
            <!-- 显示检验报告信息 -->
            <div v-else-if="currentLabReport" class="lab-report-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">患者姓名：</span>
                  <span class="info-value">{{ currentLabReport.patientName || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">报告编号：</span>
                  <span class="info-value">{{ currentLabReport.reportNo || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">检查科室：</span>
                  <span class="info-value">{{ currentLabReport.department || '-' }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="info-label">诊断结论：</span>
                  <span class="info-value conclusion-text">{{ currentLabReport.conclusion || '-' }}</span>
                </div>
              </div>
            </div>
            
            <!-- 检验项目列表 -->
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
          </el-scrollbar>
        </div>
      </el-tab-pane>
      
      <!-- ==================== 影像选项卡 ==================== -->
      <el-tab-pane label="🩻 影像" name="imaging">
        <div class="tab-content">
          <!-- 当前患者提示 -->
          <div class="current-patient-info" v-if="currentPatient">
            <el-alert 
              :title="`当前患者：${currentPatient.name} (ID: ${currentPatient.id})`" 
              type="info" 
              :closable="false"
              show-icon
            />
          </div>
          <div class="current-patient-info" v-else-if="props.patientId">
            <el-alert 
              title="正在加载患者信息..." 
              type="info" 
              :closable="false"
              show-icon
            />
          </div>
          <div class="current-patient-info" v-else>
            <el-alert 
              title="请先从患者列表选择患者" 
              type="warning" 
              :closable="false"
              show-icon
            />
          </div>
          
          <el-scrollbar height="400px">
            <!-- 无患者数据提示 -->
            <div v-if="!props.patientId && !currentPatient" class="empty-tip">
              <el-empty description="请先从患者列表选择患者" />
            </div>
            
            <!-- 有患者但无影像数据 -->
            <div v-else-if="filteredImagingReports.length === 0" class="empty-tip">
              <el-empty description="该患者暂无影像数据" />
            </div>
            
            <!-- 影像报告列表 -->
            <div 
              v-for="item in filteredImagingReports" 
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
                <div class="item-name">
                  {{ item.modalityName || item.modality }} - {{ item.bodyPartName || item.bodyPart }}
                  <el-tag size="small" :type="getModalityTagType(item.modality)" class="modality-tag">
                    {{ item.modality }}
                  </el-tag>
                </div>
                <div class="item-desc">{{ item.finding }}</div>
                <div class="item-meta">
                  <span>📅 {{ item.date }}</span>
                  <el-tag size="small" type="success">{{ item.impression }}</el-tag>
                </div>
                <div class="item-recommendation" v-if="item.recommendation">
                  💡 建议：{{ item.recommendation }}
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-tab-pane>
      
      <!-- ==================== 模板选项卡 ==================== -->
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
                <div class="item-name">
                  {{ item.name }}
                  <el-tag size="small" type="warning">{{ item.categoryName || item.category }}</el-tag>
                </div>
                <div class="item-desc">{{ item.preview || item.content?.substring(0, 50) }}...</div>
                <div class="item-meta" v-if="item.usageCount">
                  <span>📊 使用 {{ item.usageCount }} 次</span>
                  <span v-if="item.tags">🏷️ {{ item.tags.join(', ') }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="filteredTemplates.length === 0" description="暂无模板" />
          </el-scrollbar>
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- ==================== 底部操作栏 ==================== -->
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
    
    <!-- ==================== 预览对话框 ==================== -->
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
import { usePatientStore } from '@/stores/patientStore'
import { formatReferenceItem, getItemTypeName, getItemTypeTag, getPreviewText, getItemSource } from '@/utils/ruleEngine'

const props = defineProps({
  patientId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['insert'])

// 使用store
const refStore = useReferenceStore()
const patientStore = usePatientStore()

// 当前激活的选项卡
const activeTab = computed({
  get: () => refStore.activeTab,
  set: (value) => refStore.activeTab = value
})

// 搜索和筛选
const orderSearch = ref('')
const templateSearch = ref('')
const selectedLabDate = ref('')
const selectedCategory = ref('')  // 医嘱分类筛选

// 预览相关
const previewVisible = ref(false)
const previewItems = ref([])

// 响应式布局
const isMobile = ref(false)

// 从 store 获取数据
const orders = computed(() => refStore.orders)
const allLabResults = computed(() => refStore.labResults)
const allImagingReports = computed(() => refStore.imagingReports)
const templates = computed(() => refStore.templates)

// 当前患者信息
const currentPatient = computed(() => patientStore.currentPatient)

// 获取当前有效的患者ID（优先使用 props，其次使用 store 中的当前患者）
const effectivePatientId = computed(() => {
  return props.patientId || currentPatient.value?.id || null
})

// 患者ID映射（门诊ID -> 住院ID）
const patientIdMap = {
  'op001': 'p001',  // 张明
  'op002': 'p002',  // 李芳
  'op003': 'p003',  // 王伟 -> 王建国
  'op004': 'p004',  // 刘洋 -> 刘秀英
  'op005': 'p005',  // 陈志远
  'op006': 'p006',  // 赵丽华
  'op007': 'p007'   // 孙德明
}

// 获取对应的住院ID
function getInpatientId(patientId) {
  if (!patientId) return null
  if (patientId.toLowerCase().startsWith('p')) return patientId.toLowerCase()
  return patientIdMap[patientId] || null
}

// ==================== 检验数据筛选 ====================
const filteredLabResults = computed(() => {
  const patientId = effectivePatientId.value
  if (!patientId) return []
  const inpatientId = getInpatientId(patientId)
  if (!inpatientId) return []
  return allLabResults.value.filter(report => 
    report.patientId?.toLowerCase() === inpatientId.toLowerCase()
  )
})

const filteredLabDates = computed(() => {
  return filteredLabResults.value.map(item => item.date)
})

const currentLabReport = computed(() => {
  if (filteredLabResults.value.length === 0) return null
  if (!selectedLabDate.value || !filteredLabDates.value.includes(selectedLabDate.value)) {
    selectedLabDate.value = filteredLabDates.value[0] || ''
  }
  return filteredLabResults.value.find(item => item.date === selectedLabDate.value)
})

const currentLabItems = computed(() => {
  return currentLabReport.value?.items || []
})

// ==================== 影像数据筛选 ====================
const filteredImagingReports = computed(() => {
  const patientId = effectivePatientId.value
  if (!patientId) return []
  const inpatientId = getInpatientId(patientId)
  if (!inpatientId) return []
  return allImagingReports.value.filter(report => 
    report.patientId?.toLowerCase() === inpatientId.toLowerCase()
  )
})

// ==================== 医嘱数据筛选 ====================
const filteredOrders = computed(() => {
  let result = orders.value
  if (selectedCategory.value) {
    result = result.filter(item => item.category === selectedCategory.value)
  }
  if (orderSearch.value) {
    const keyword = orderSearch.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.content?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword)
    )
  }
  return result
})

// ==================== 模板数据筛选 ====================
const filteredTemplates = computed(() => {
  if (!templateSearch.value) return templates.value
  return templates.value.filter(item => 
    item.name.includes(templateSearch.value)
  )
})

// ==================== 辅助函数 ====================
function getCategoryName(category) {
  const map = {
    medication: '西药',
    treatment: '输液治疗',
    examination: '实验室检查',
    nursing: '护理操作',
    diet: '饮食指导',
    advice: '医嘱建议'
  }
  return map[category] || category
}

function getCategoryTagType(category) {
  const map = {
    medication: 'primary',
    treatment: 'success',
    examination: 'warning',
    nursing: 'info',
    diet: 'success',
    advice: 'info'
  }
  return map[category] || 'info'
}

function getModalityTagType(modality) {
  const map = {
    'CT': 'primary',
    'MRI': 'success',
    'XR': 'warning',
    'US': 'info',
    'ECG': 'danger'
  }
  return map[modality] || 'info'
}

function getFrequencyText(frequency) {
  const map = {
    'qd': '每日1次', 'bid': '每日2次', 'tid': '每日3次', 'qid': '每日4次',
    'q2h': '每2小时1次', 'q4h': '每4小时1次', 'q6h': '每6小时1次',
    'q8h': '每8小时1次', 'q12h': '每12小时1次', 'stat': '立即',
    'prn': '必要时', 'ac': '餐前', 'pc': '餐后', 'continuous': '持续'
  }
  return map[frequency] || frequency
}

function getRouteText(route) {
  const map = {
    'po': '口服', 'iv': '静脉注射', 'ivgtt': '静脉滴注',
    'im': '肌肉注射', 'ih': '皮下注射', 'ng': '鼻饲',
    'neb': '雾化吸入', 'topical': '外用', 'nasal': '鼻导管'
  }
  return map[route] || route
}

function onDateChange() {}

function isSelected(type, id) {
  const map = {
    orders: refStore.selectedOrders,
    lab: refStore.selectedLab,
    imaging: refStore.selectedImaging,
    templates: refStore.selectedTemplates
  }
  return map[type]?.includes(id) || false
}

function toggleSelection(type, id) {
  refStore.toggleSelection(type, id)
}

function clearAllSelections() {
  refStore.clearAll()
  ElMessage.success('已清空选中项')
}

const totalSelected = computed(() => refStore.totalSelected)

function getFlagType(flag) {
  const map = { high: 'danger', low: 'warning', normal: 'success' }
  return map[flag] || 'info'
}

function getFlagClass(flag) {
  if (flag === 'high') return 'result-high'
  if (flag === 'low') return 'result-low'
  return ''
}

function previewSelected() {
  previewItems.value = refStore.getSelectedItemsWithDetails()
  previewVisible.value = true
}

function confirmInsert() {
  previewVisible.value = false
  insertSelected()
}

// ==================== 核心：插入选中项（支持模板结构化数据） ====================
function insertSelected() {
  const items = refStore.getSelectedItemsWithDetails()
  if (items.length === 0) {
    ElMessage.warning('请先选择要引用的项目')
    return
  }
  
  // 格式化每个项目，为模板添加 structuredData
  const formattedItems = items.map(item => {
    // 如果是模板，从原始模板数据中获取完整的 structuredData
    if (item.type === 'template') {
      const fullTemplate = templates.value.find(t => t.id === item.id)
      return {
        ...item,
        formattedText: formatReferenceItem(item),
        structuredData: fullTemplate?.structuredData || null,
        content: fullTemplate?.content || item.content,
        name: fullTemplate?.name || item.name
      }
    }
    // 普通引用（检验、医嘱、影像）
    return {
      ...item,
      formattedText: formatReferenceItem(item)
    }
  })
  
  emit('insert', formattedItems)
  
  // 统计插入类型
  const templateCount = formattedItems.filter(i => i.type === 'template').length
  const otherCount = formattedItems.length - templateCount
  
  if (templateCount > 0 && otherCount > 0) {
    ElMessage.success(`已应用 ${templateCount} 个模板，插入 ${otherCount} 项引用`)
  } else if (templateCount > 0) {
    ElMessage.success(`已应用 ${templateCount} 个模板到结构化表单`)
  } else {
    ElMessage.success(`已插入 ${formattedItems.length} 项引用`)
  }
}

// 响应式布局处理
function handleResize() {
  const width = window.innerWidth
  isMobile.value = width < 768
}

// 加载数据
onMounted(async () => {
  if (allLabResults.value.length === 0) {
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

.category-select {
  width: 100%;
  margin-bottom: 10px;
  padding: 0 5px;
}

.date-select {
  width: 100%;
  margin-bottom: 10px;
  padding: 0 5px;
}

.current-patient-info {
  margin-bottom: 12px;
  padding: 0 5px;
}

.data-source-tip {
  margin-top: 8px;
  text-align: center;
}

.empty-tip {
  padding: 20px 0;
}

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

.category-tag,
.modality-tag {
  font-size: 10px;
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

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  flex-wrap: wrap;
  align-items: center;
}

.item-recommendation {
  font-size: 12px;
  color: #e6a23c;
  margin-top: 4px;
}

.result-high {
  color: #f56c6c;
  font-weight: bold;
}

.result-low {
  color: #e6a23c;
  font-weight: bold;
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