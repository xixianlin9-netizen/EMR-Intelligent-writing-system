<!-- src/views/TemplateLibraryView.vue -->
<template>
  <div class="template-library">
    <el-row :gutter="20" class="full-height">
      <!-- 左侧：分组和模板列表 -->
      <el-col :span="8" class="left-panel">
        <el-card class="group-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>模板分组</span>
              <el-button type="primary" link @click="showAddGroupDialog">
                <el-icon><Plus /></el-icon> 新增分组
              </el-button>
            </div>
          </template>
          
          <div class="group-list">
            <div 
              v-for="group in groups" 
              :key="group.id"
              class="group-item"
              :class="{ active: currentGroupId === group.id }"
              @click="selectGroup(group.id)"
            >
              <div class="group-info">
                <el-icon><Folder /></el-icon>
                <span class="group-name">{{ group.name }}</span>
                <el-badge :value="group.templateCount || 0" class="group-badge" />
              </div>
              <div class="group-actions" @click.stop>
                <el-dropdown trigger="click">
                  <el-button type="primary" link :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editGroup(group)">
                        <el-icon><Edit /></el-icon> 编辑
                      </el-dropdown-item>
                      <el-dropdown-item @click="deleteGroupConfirm(group)" divided>
                        <el-icon><Delete /></el-icon> 删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <el-empty v-if="groups.length === 0" description="暂无分组，点击新增分组" />
          </div>
        </el-card>
        
        <el-card class="template-list-card" shadow="never" v-if="currentGroupId">
          <template #header>
            <div class="card-header">
              <span>模板列表</span>
              <el-button type="primary" link @click="showAddTemplateDialog">
                <el-icon><Plus /></el-icon> 新增模板
              </el-button>
            </div>
          </template>
          
          <div class="template-list">
            <div 
              v-for="template in groupTemplates" 
              :key="template.id"
              class="template-item"
              :class="{ active: currentTemplateId === template.id }"
              @click="selectTemplate(template.id)"
            >
              <div class="template-info">
                <el-icon><Document /></el-icon>
                <span>{{ template.name }}</span>
                <span class="usage-count">使用 {{ template.usageCount || 0 }} 次</span>
              </div>
              <div class="template-actions" @click.stop>
                <el-dropdown trigger="click">
                  <el-button type="primary" link :icon="MoreFilled" />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="renameTemplate(template)">
                        <el-icon><Edit /></el-icon> 重命名
                      </el-dropdown-item>
                      <el-dropdown-item @click="deleteTemplateConfirm(template)" divided>
                        <el-icon><Delete /></el-icon> 删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <el-empty v-if="groupTemplates.length === 0" description="暂无模板，点击新增模板" />
          </div>
        </el-card>
      </el-col>
      
      <!-- 右侧：模板编辑器 -->
      <el-col :span="16" class="right-panel">
        <el-card class="editor-card" shadow="never" v-if="currentTemplateId">
          <TemplateEditor 
            :template-id="currentTemplateId"
            @saved="onTemplateSaved"
          />
        </el-card>
        <el-empty v-else description="请从左侧选择一个模板进行编辑" />
      </el-col>
    </el-row>
    
    <!-- 新增分组对话框 -->
    <el-dialog v-model="addGroupVisible" title="新增分组" width="400px">
      <el-form :model="newGroupForm" :rules="groupRules" ref="groupFormRef">
        <el-form-item label="分组名称" prop="name">
          <el-input 
            v-model="newGroupForm.name" 
            placeholder="请输入分组名称，如：呼吸系统疾病"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addGroupVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddGroup">确认</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑分组对话框 -->
    <el-dialog v-model="editGroupVisible" title="编辑分组" width="400px">
      <el-form :model="editGroupForm" :rules="groupRules" ref="editGroupFormRef">
        <el-form-item label="分组名称" prop="name">
          <el-input 
            v-model="editGroupForm.name" 
            placeholder="请输入分组名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editGroupVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditGroup">确认</el-button>
      </template>
    </el-dialog>
    
    <!-- 新增模板对话框 -->
    <el-dialog v-model="addTemplateVisible" title="新增模板" width="400px">
      <el-form :model="newTemplateForm" :rules="templateRules" ref="templateFormRef">
        <el-form-item label="模板名称" prop="name">
          <el-input 
            v-model="newTemplateForm.name" 
            placeholder="请输入模板名称"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addTemplateVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddTemplate">确认</el-button>
      </template>
    </el-dialog>
    
    <!-- 重命名模板对话框 -->
    <el-dialog v-model="renameVisible" title="重命名模板" width="400px">
      <el-form :model="renameForm" :rules="templateRules" ref="renameFormRef">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="renameForm.name" placeholder="请输入新名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRename">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, MoreFilled, Folder, Document, Edit, Delete } from '@element-plus/icons-vue'
import { usePersonalTemplateStore } from '@/stores/personalTemplateStore'
import TemplateEditor from '@/components/template/TemplateEditor.vue'

const templateStore = usePersonalTemplateStore()

// 响应式数据
const groups = computed(() => templateStore.groups)
const groupTemplates = computed(() => {
  if (!currentGroupId.value) return []
  return templateStore.getTemplatesByGroup(currentGroupId.value)
})

const currentGroupId = ref(null)
const currentTemplateId = ref(null)

// 对话框状态
const addGroupVisible = ref(false)
const editGroupVisible = ref(false)
const addTemplateVisible = ref(false)
const renameVisible = ref(false)

// 表单数据
const newGroupForm = ref({ name: '' })
const editGroupForm = ref({ id: '', name: '' })
const newTemplateForm = ref({ name: '' })
const renameForm = ref({ id: '', name: '' })

// 表单引用
const groupFormRef = ref(null)
const editGroupFormRef = ref(null)
const templateFormRef = ref(null)
const renameFormRef = ref(null)

// 表单验证规则
const groupRules = {
  name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在1-20个字符之间', trigger: 'blur' }
  ]
}

const templateRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 1, max: 30, message: '长度在1-30个字符之间', trigger: 'blur' }
  ]
}

// 选择分组
function selectGroup(groupId) {
  currentGroupId.value = groupId
  currentTemplateId.value = null
}

// 选择模板
function selectTemplate(templateId) {
  currentTemplateId.value = templateId
}

// 新增分组
function showAddGroupDialog() {
  newGroupForm.value = { name: '' }
  addGroupVisible.value = true
}

async function confirmAddGroup() {
  try {
    await groupFormRef.value?.validate()
    templateStore.addGroup(newGroupForm.value.name)
    addGroupVisible.value = false
    ElMessage.success('分组创建成功')
  } catch (error) {
    console.error('创建分组失败:', error)
  }
}

// 编辑分组
function editGroup(group) {
  editGroupForm.value = { id: group.id, name: group.name }
  editGroupVisible.value = true
}

async function confirmEditGroup() {
  try {
    await editGroupFormRef.value?.validate()
    templateStore.updateGroup(editGroupForm.value.id, editGroupForm.value.name)
    editGroupVisible.value = false
    ElMessage.success('分组修改成功')
  } catch (error) {
    console.error('修改分组失败:', error)
  }
}

// 删除分组
function deleteGroupConfirm(group) {
  ElMessageBox.confirm(
    `确定要删除分组"${group.name}"吗？分组内的模板也会被删除！`,
    '警告',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    templateStore.deleteGroup(group.id)
    if (currentGroupId.value === group.id) {
      currentGroupId.value = null
      currentTemplateId.value = null
    }
    ElMessage.success('分组已删除')
  }).catch(() => {})
}

// 新增模板
function showAddTemplateDialog() {
  if (!currentGroupId.value) {
    ElMessage.warning('请先选择一个分组')
    return
  }
  newTemplateForm.value = { name: '' }
  addTemplateVisible.value = true
}

async function confirmAddTemplate() {
  try {
    await templateFormRef.value?.validate()
    const newTemplate = templateStore.addTemplate(currentGroupId.value, newTemplateForm.value.name)
    currentTemplateId.value = newTemplate.id
    addTemplateVisible.value = false
    ElMessage.success('模板创建成功')
  } catch (error) {
    console.error('创建模板失败:', error)
  }
}

// 重命名模板
function renameTemplate(template) {
  renameForm.value = { id: template.id, name: template.name }
  renameVisible.value = true
}

async function confirmRename() {
  try {
    await renameFormRef.value?.validate()
    templateStore.updateTemplate(renameForm.value.id, { name: renameForm.value.name })
    renameVisible.value = false
    ElMessage.success('重命名成功')
  } catch (error) {
    console.error('重命名失败:', error)
  }
}

// 删除模板
function deleteTemplateConfirm(template) {
  ElMessageBox.confirm(
    `确定要删除模板"${template.name}"吗？`,
    '提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    templateStore.deleteTemplate(template.id)
    if (currentTemplateId.value === template.id) {
      currentTemplateId.value = null
    }
    ElMessage.success('模板已删除')
  }).catch(() => {})
}

// 模板保存成功回调
function onTemplateSaved() {
  ElMessage.success('模板已保存')
}

// 初始化
onMounted(() => {
  templateStore.loadData()
  
  // 如果没有分组，自动创建示例数据（可选）
  if (templateStore.groups.length === 0) {
    templateStore.initSampleData()
  }
  
  // 默认选中第一个分组
  if (templateStore.groups.length > 0 && !currentGroupId.value) {
    currentGroupId.value = templateStore.groups[0].id
  }
})
</script>

<style scoped>
.template-library {
  height: 100%;
  padding: 0;
}

.full-height {
  height: 100%;
}

.left-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-card,
.template-list-card {
  height: auto;
  flex-shrink: 0;
}

.group-card :deep(.el-card__body) {
  padding: 0;
}

.template-list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.template-list-card :deep(.el-card__body) {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-list {
  padding: 8px 0;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.group-item:hover {
  background-color: #f5f7fa;
}

.group-item.active {
  background-color: #ecf5ff;
  border-left-color: #409eff;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-name {
  font-size: 14px;
  color: #303133;
}

.group-badge {
  margin-left: 8px;
}

.group-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.group-item:hover .group-actions {
  opacity: 1;
}

.template-list {
  padding: 8px 0;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.template-item:hover {
  background-color: #f5f7fa;
}

.template-item.active {
  background-color: #ecf5ff;
  border-left-color: #409eff;
}

.template-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usage-count {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.template-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.template-item:hover .template-actions {
  opacity: 1;
}

.right-panel {
  height: 100%;
}

.editor-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-card :deep(.el-card__body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}
</style>