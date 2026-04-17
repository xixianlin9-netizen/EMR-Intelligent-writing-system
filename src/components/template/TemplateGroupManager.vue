<!-- src/components/template/TemplateGroupManager.vue -->
<template>
    <div class="template-group-manager">
      <div class="group-header">
        <span>病历模板分组</span>
        <el-button type="primary" link @click="showAddGroupDialog">
          <el-icon><Plus /></el-icon> 新增分组
        </el-button>
      </div>
      
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
                  <el-dropdown-item @click="deleteGroup(group)" divided>
                    <el-icon><Delete /></el-icon> 删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      
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
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus, MoreFilled, Folder, Edit, Delete } from '@element-plus/icons-vue'
  import { usePersonalTemplateStore } from '@/stores/personalTemplateStore'
  
  const props = defineProps({
    currentGroupId: {
      type: String,
      default: null
    }
  })
  
  const emit = defineEmits(['select-group', 'group-changed'])
  
  const templateStore = usePersonalTemplateStore()
  const groups = computed(() => templateStore.groups)
  
  const addGroupVisible = ref(false)
  const editGroupVisible = ref(false)
  const groupFormRef = ref(null)
  const editGroupFormRef = ref(null)
  
  const newGroupForm = ref({ name: '' })
  const editGroupForm = ref({ id: '', name: '' })
  
  const groupRules = {
    name: [
      { required: true, message: '请输入分组名称', trigger: 'blur' },
      { min: 1, max: 20, message: '长度在1-20个字符之间', trigger: 'blur' }
    ]
  }
  
  function selectGroup(groupId) {
    emit('select-group', groupId)
  }
  
  function showAddGroupDialog() {
    newGroupForm.value = { name: '' }
    addGroupVisible.value = true
  }
  
  async function confirmAddGroup() {
    await groupFormRef.value?.validate()
    templateStore.addGroup(newGroupForm.value.name)
    addGroupVisible.value = false
    ElMessage.success('分组创建成功')
    emit('group-changed')
  }
  
  function editGroup(group) {
    editGroupForm.value = { id: group.id, name: group.name }
    editGroupVisible.value = true
  }
  
  async function confirmEditGroup() {
    await editGroupFormRef.value?.validate()
    templateStore.updateGroup(editGroupForm.value.id, editGroupForm.value.name)
    editGroupVisible.value = false
    ElMessage.success('分组修改成功')
    emit('group-changed')
  }
  
  function deleteGroup(group) {
    ElMessageBox.confirm(
      `确定要删除分组"${group.name}"吗？分组内的模板也会被删除！`,
      '警告',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    ).then(() => {
      templateStore.deleteGroup(group.id)
      ElMessage.success('分组已删除')
      emit('group-changed')
    }).catch(() => {})
  }
  </script>
  
  <style scoped>
  .template-group-manager {
    height: 100%;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 16px;
    border-bottom: 1px solid #e4e7ed;
    font-weight: 600;
  }
  
  .group-list {
    max-height: calc(100% - 50px);
    overflow-y: auto;
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
  </style>