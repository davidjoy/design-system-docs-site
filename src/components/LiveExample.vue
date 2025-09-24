<template>
  <div class="live-example">
    <h4 v-if="title" class="live-example-title">{{ title }}</h4>
    <VueLive
      :code="code"
      :components="components"
      :data-scope="dataScope"
      :delay="300"
      @error="handleError"
      @success="handleSuccess"
    />
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueLive } from 'vue-live'

interface Props {
  code: string
  title?: string
  components?: Record<string, any>
  dataScope?: Record<string, any>
}

withDefaults(defineProps<Props>(), {
  components: () => ({}),
  dataScope: () => ({})
})

const error = ref<string | null>(null)

const handleError = (e: Error) => {
  error.value = e.message
  console.error('LiveExample error:', e)
}

const handleSuccess = () => {
  error.value = null
}
</script>

<style scoped>
.live-example {
  margin: 1.5rem 0;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.live-example-title {
  margin: 0;
  padding: 1rem 1rem 0.5rem;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-top: 1px solid #fcc;
  font-size: 0.9rem;
}

/* Editor styling */
:deep(.VueLive-editor) {
  background: #f8f9fa;
  padding: 1rem;
}

:deep(.VueLivePreview) {
  padding: 1rem;
}

:deep(.VueLive-editor .prism-editor__container) {
  background: transparent;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Menlo', monospace;
  font-size: 14px;
}

:deep(.VueLive-editor .prism-editor__textarea:focus) {
  outline: none;
}

</style>
