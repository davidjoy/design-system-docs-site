<template>
  <div class="search-container">
    <div class="search-input-wrapper">
      <input
        ref="searchInput"
        v-model="searchQuery"
        type="text"
        placeholder="Search documentation..."
        class="search-input"
        @input="handleSearch"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div class="search-icon">🔍</div>
    </div>

    <div
      v-if="showResults && searchQuery.length > 1"
      ref="searchResults"
      class="search-results"
    >
      <div v-if="loading" class="search-loading">
        <span class="loading-spinner">🔍</span> Searching for "{{ searchQuery }}"...
      </div>

      <div v-else-if="results.length === 0" class="search-no-results">
        No results found for "{{ searchQuery }}"
      </div>

      <div v-else class="search-results-list">
        <div
          v-for="(result, index) in results"
          :key="result.item.id"
          :class="['search-result-item', { active: selectedIndex === index }]"
          @mousedown="selectResult(result.item)"
          @mouseenter="selectedIndex = index"
        >
          <div class="result-type">{{ getTypeIcon(result.item.type) }}</div>
          <div class="result-content">
            <div class="result-title">{{ result.item.title }}</div>
            <div class="result-description">{{ getResultDescription(result.item) }}</div>
            <div v-if="result.item.hierarchy" class="result-hierarchy">
              {{ result.item.hierarchy.join(' > ') }}
            </div>
          </div>
          <div class="result-url">{{ result.item.url }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import Fuse from 'fuse.js'

interface SearchIndexEntry {
  id: string
  title: string
  url: string
  type: 'page' | 'heading' | 'component' | 'css-class'
  content: string
  keywords: string[]
  hierarchy?: string[]
}

interface SearchIndex {
  entries: SearchIndexEntry[]
  meta: {
    generatedAt: string
    totalEntries: number
    types: Record<string, number>
  }
}

const searchQuery = ref('')
const searchInput = ref<HTMLInputElement>()
const showResults = ref(false)
const loading = ref(false)
const results = ref<any[]>([])
const selectedIndex = ref(-1)
const searchIndex = ref<SearchIndex | null>(null)
const fuse = ref<any>(null)

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'content', weight: 2 },
    { name: 'keywords', weight: 1.5 },
    { name: 'type', weight: 1 }
  ],
  threshold: 0.3, // Lower = more strict matching
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true
}

onMounted(async () => {
  try {
    // Use import.meta.env.BASE_URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL || '/'
    const response = await fetch(`${baseUrl}search-index.json`)
    if (response.ok) {
      searchIndex.value = await response.json()
      if (searchIndex.value) {
        fuse.value = new Fuse(searchIndex.value.entries, fuseOptions)
      }
    } else {
      console.warn('Search index not found')
    }
  } catch (error) {
    console.error('Error loading search index:', error)
  }
})

onUnmounted(() => {
  // Clear any pending search timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})



let searchTimeout: number | null = null

const handleSearch = () => {
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // If query is too short, clear immediately
  if (!fuse.value || searchQuery.value.length < 2) {
    results.value = []
    showResults.value = false
    loading.value = false
    return
  }

  // Show dropdown immediately with loading state
  showResults.value = true
  loading.value = true
  results.value = [] // Clear previous results

  // Debounce the search
  searchTimeout = window.setTimeout(async () => {
    try {
      const searchResults = fuse.value!.search(searchQuery.value)
      results.value = searchResults.slice(0, 8) // Limit to 8 results
      selectedIndex.value = -1
    } catch (error) {
      console.error('Search error:', error)
      results.value = []
      showResults.value = false
    } finally {
      loading.value = false
    }
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showResults.value || results.value.length === 0) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
        selectResult(results.value[selectedIndex.value].item)
      } else if (results.value.length > 0) {
        // If no item selected but results exist, select the first one
        selectResult(results.value[0].item)
      }
      break
    case 'Escape':
      showResults.value = false
      searchInput.value?.blur()
      break
  }
}

const handleFocus = () => {
  if (searchQuery.value.length > 1 && results.value.length > 0) {
    showResults.value = true
  }
}

const handleBlur = () => {
  // Delay hiding results to allow for click events
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

const selectResult = (item: SearchIndexEntry) => {
  // Navigate to the selected result using relative navigation for GitHub Pages compatibility
  const baseUrl = import.meta.env.BASE_URL || '/'
  const fullUrl = item.url.startsWith('/') ? `${baseUrl}${item.url.slice(1)}` : item.url
  window.location.href = fullUrl
  showResults.value = false
  searchQuery.value = ''
}

const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'page': return '📄'
    case 'heading': return '📝'
    case 'component': return '🧩'
    case 'css-class': return '🎨'
    default: return '📄'
  }
}

const getResultDescription = (item: SearchIndexEntry): string => {
  switch (item.type) {
    case 'page':
      return 'Documentation page'
    case 'heading':
      return 'Section heading'
    case 'component':
      return 'Vue component'
    case 'css-class':
      return 'CSS class'
    default:
      return item.content.substring(0, 100) + '...'
  }
}

// Expose search focus method for external use
defineExpose({
  focus: () => {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.1);
}

.search-icon {
  position: absolute;
  right: 0.75rem;
  color: #666;
  pointer-events: none;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e5e9;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  max-height: 400px;
  overflow-y: auto;
}

.search-loading,
.search-no-results {
  padding: 1rem;
  text-align: center;
  color: #666;
  font-style: italic;
}

.search-loading .loading-spinner {
  display: inline-block;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.search-results-list {
  padding: 0.5rem 0;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover,
.search-result-item.active {
  background-color: #f8f9fa;
}

.result-type {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.result-description {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.result-hierarchy {
  font-size: 0.75rem;
  color: #999;
  font-style: italic;
}

.result-url {
  font-size: 0.75rem;
  color: #646cff;
  flex-shrink: 0;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .search-container {
    max-width: 100%;
  }

  .result-url {
    display: none;
  }

  .search-result-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}
</style>
