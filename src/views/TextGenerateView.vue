<template>
    <DoctorLayout>
      <div>
        <h2>智能医学文本生成</h2>
        <p>当前结构化字段：</p>
        <p>主诉：{{ fields.chiefComplaint }}</p>
        <p>现病史：{{ fields.presentIllness }}</p>
        <p>既往史：{{ fields.pastHistory }}</p>
  
        <h3>自动生成医学文本</h3>
        <textarea v-model="generatedText" rows="6" cols="60"></textarea>
        <div>
          <button @click="insertText">插入病历</button>
          <button @click="regenerate">重新生成</button>
        </div>
      </div>
    </DoctorLayout>
  </template>
  
  <script>
  import DoctorLayout from '@/components/layout/DoctorLayout.vue'
  import { useEMRStore } from '@/stores/emrStore'
  import { ref } from 'vue'
  
  export default {
    components: { DoctorLayout },
    setup() {
      const store = useEMRStore()
      const fields = store.structuredFields
      const generatedText = ref('患者因“头痛3天”就诊。3天前无明显诱因出现头痛症状。')
  
      const insertText = () => { store.editorContent += generatedText.value }
      const regenerate = () => { generatedText.value += ' （重新生成示例）' }
  
      return { fields, generatedText, insertText, regenerate }
    }
  }
  </script>