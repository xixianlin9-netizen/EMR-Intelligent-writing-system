<!-- src/components/editor/QuillEditor.vue -->
<template>
  <div class="quill-editor">
    <QuillEditor
      v-model:content="content"
      :options="editorOptions"
      contentType="html"
      @update:content="handleUpdate"
      @focus="handleFocus"
      @blur="handleBlur"
      ref="quillEditorRef"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  showToolbar: {
    type: Boolean,
    default: true
  },
  placeholder: {
    type: String,
    default: '请输入病历内容...'
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'change'])

const content = ref(props.modelValue)
const quillEditorRef = ref(null)

// 编辑器配置
const editorOptions = {
  theme: 'snow',
  modules: {
    toolbar: props.showToolbar ? [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'header': [1, 2, 3, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ] : false,
    clipboard: {
      matchVisual: false
    }
  },
  placeholder: props.placeholder,
  readOnly: !props.editable
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

// 处理内容更新
function handleUpdate(value) {
  emit('update:modelValue', value)
  emit('change', value)
}

function handleFocus() {
  emit('focus')
}

function handleBlur() {
  emit('blur')
}

// 插入引用内容
function insertReference(text, type, sourceId) {
  if (!quillEditorRef.value) return
  
  const quill = quillEditorRef.value.getQuill()
  const range = quill.getSelection(true)
  
  // 插入带样式的引用内容
  quill.insertText(range.index, text + ' ')
  
  quill.setSelection(range.index + text.length + 1, 0)
}

// 获取纯文本
function getTextContent() {
  if (!quillEditorRef.value) return ''
  const quill = quillEditorRef.value.getQuill()
  return quill.getText()
}

// 选中所有
function selectAll() {
  if (!quillEditorRef.value) return
  const quill = quillEditorRef.value.getQuill()
  const length = quill.getLength()
  quill.setSelection(0, length)
}

defineExpose({
  insertReference,
  getTextContent,
  selectAll
})
</script>

<style scoped>
.quill-editor {
  height: auto;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

/* 让编辑器内容区域自动撑开，不留多余空白 */
:deep(.ql-container) {
  min-height: 250px;
  font-size: 14px;
  flex: 1;
}

:deep(.ql-editor) {
  min-height: 250px;
  height: auto !important;
}

/* 去除编辑器底部多余空白 */
:deep(.ql-editor.ql-blank::before) {
  font-style: normal;
  color: #c0c4cc;
}

/* 确保工具栏和容器之间没有多余间距 */
:deep(.ql-toolbar.ql-snow) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

:deep(.ql-container.ql-snow) {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>