<template>
  <div class="css-doc">
    <h3 v-if="title">{{ title }}</h3>
    <div v-if="docs.length === 0" class="no-docs">
      No documentation found in {{ filePath }}
    </div>
    <div v-for="(doc, index) in docs" :key="index" class="doc-section">
      <div class="doc-header">
        <h4 v-if="doc.selector" class="selector">{{ doc.selector }}</h4>
        <span v-if="doc.deprecated" class="deprecated">Deprecated</span>
        <span v-if="doc.since" class="since">Since: {{ doc.since }}</span>
      </div>

      <p v-if="doc.description" class="description">{{ doc.description }}</p>

      <div v-if="doc.params" class="params">
        <h5>Parameters:</h5>
        <ul>
          <li v-for="param in doc.params" :key="param.name">
            <code>{{ param.name }}</code>: {{ param.description }}
          </li>
        </ul>
      </div>

      <div v-if="doc.example" class="example">
        <h5>Example:</h5>
        <pre><code>{{ doc.example }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface CssDocComment {
  description: string
  selector?: string
  params?: Array<{ name: string; description: string }>
  example?: string
  since?: string
  deprecated?: boolean
}

interface Props {
  filePath: string
  title?: string
}

const props = defineProps<Props>()
const docs = ref<CssDocComment[]>([])

onMounted(async () => {
  try {
    // Fetch the pre-generated documentation data
    const response = await fetch('/css-docs.json')
    if (response.ok) {
      const allDocs = await response.json()
      docs.value = allDocs[props.filePath] || []
    } else {
      console.warn(`CSS documentation file not found. Run the build to generate it.`)
      docs.value = []
    }
  } catch (error) {
    console.error(`Error loading CSS documentation for ${props.filePath}:`, error)
    docs.value = []
  }
})
</script>

<style scoped>
.css-doc {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  background: #f8f9fa;
  color: #333;
}

.doc-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e1e5e9;
}

.doc-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.doc-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.selector {
  font-family: 'Courier New', monospace;
  background: #e3f2fd;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  margin: 0;
  font-size: 0.9rem;
}

.deprecated {
  background: #ffeb3b;
  color: #f57c00;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
}

.since {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.8rem;
}

.description {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.params ul {
  margin: 0.5rem 0;
  padding-left: 1rem;
}

.params li {
  margin-bottom: 0.3rem;
}

.example pre {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.example code {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.no-docs {
  color: #666;
  font-style: italic;
}

h3, h4, h5 {
  color: #333;
}
</style>
