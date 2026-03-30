<!-- src/views/TemplateLibraryView.vue -->
<template>
  <div class="template-library">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <template #header>
            <span>分类</span>
          </template>
          <el-menu :default-active="activeCategory" @select="handleCategorySelect">
            <el-menu-item index="all">全部模板</el-menu-item>
            <el-menu-item index="common">常用模板</el-menu-item>
            <el-menu-item index="admission">入院记录</el-menu-item>
            <el-menu-item index="progress">病程记录</el-menu-item>
            <el-menu-item index="discharge">出院小结</el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ categoryName }}</span>
              <div>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索模板"
                  :prefix-icon="Search"
                  clearable
                  style="width: 200px; margin-right: 10px;"
                />
                <el-button type="primary" @click="showCreateDialog = true">新建模板</el-button>
              </div>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8" v-for="template in filteredTemplates" :key="template.id">
              <el-card class="template-card" shadow="hover">
                <div class="template-header">
                  <h3>{{ template.name }}</h3>
                  <el-tag size="small">{{ template.category }}</el-tag>
                </div>
                <p class="template-preview">{{ template.preview }}</p>
                <div class="template-footer">
                  <el-button type="primary" link @click="useTemplate(template)">使用</el-button>
                  <el-button type="success" link @click="editTemplate(template)">编辑</el-button>
                  <el-button type="danger" link @click="deleteTemplate(template)">删除</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 新建模板对话框 -->
    <el-dialog v-model="showCreateDialog" title="新建模板" width="600px">
      <el-form :model="newTemplate" label-width="80px">
        <el-form-item label="模板名称">
          <el-input v-model="newTemplate.name" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="newTemplate.category">
            <el-option label="常用模板" value="common" />
            <el-option label="入院记录" value="admission" />
            <el-option label="病程记录" value="progress" />
            <el-option label="出院小结" value="discharge" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="newTemplate.content" type="textarea" :rows="8" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTemplate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeCategory = ref('all')
const searchKeyword = ref('')
const showCreateDialog = ref(false)

const categoryName = computed(() => {
  const map = {
    all: '全部模板',
    common: '常用模板',
    admission: '入院记录',
    progress: '病程记录',
    discharge: '出院小结'
  }
  return map[activeCategory.value] || '全部模板'
})

const templates = ref([
  { id: 1, name: '普通感冒模板', category: 'common', preview: '主诉：发热、咳嗽...' },
  { id: 2, name: '高血压随访模板', category: 'common', preview: '患者高血压病史...' },
  { id: 3, name: '入院记录模板', category: 'admission', preview: '患者因...入院' },
  { id: 4, name: '日常病程记录', category: 'progress', preview: '患者今日情况...' },
  { id: 5, name: '出院小结模板', category: 'discharge', preview: '患者经治疗后...' }
])

const filteredTemplates = computed(() => {
  let filtered = templates.value
  
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(t => t.category === activeCategory.value)
  }
  
  if (searchKeyword.value) {
    filtered = filtered.filter(t => 
      t.name.includes(searchKeyword.value) || 
      t.preview.includes(searchKeyword.value)
    )
  }
  
  return filtered
})

const newTemplate = ref({
  name: '',
  category: 'common',
  content: ''
})

function handleCategorySelect(index) {
  activeCategory.value = index
}

function useTemplate(template) {
  ElMessage.success(`已使用模板：${template.name}`)
}

function editTemplate(template) {
  ElMessage.info(`编辑模板：${template.name}`)
}

function deleteTemplate(template) {
  ElMessageBox.confirm(`确定删除模板"${template.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index !== -1) {
      templates.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  })
}

function createTemplate() {
  if (!newTemplate.value.name || !newTemplate.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  const template = {
    id: templates.value.length + 1,
    ...newTemplate.value,
    preview: newTemplate.value.content.substring(0, 20) + '...'
  }
  
  templates.value.push(template)
  showCreateDialog.value = false
  newTemplate.value = { name: '', category: 'common', content: '' }
  ElMessage.success('创建成功')
}
</script>

<style scoped>
.template-library {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-card:hover {
  transform: translateY(-5px);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.template-header h3 {
  margin: 0;
  font-size: 16px;
}

.template-preview {
  color: #666;
  font-size: 13px;
  margin: 10px 0;
  height: 40px;
  overflow: hidden;
}

.template-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
}
</style>