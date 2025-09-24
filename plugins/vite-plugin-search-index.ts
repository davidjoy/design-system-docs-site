import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

interface SearchIndexEntry {
  id: string
  title: string
  url: string
  type: 'page' | 'heading' | 'component' | 'css-class'
  content: string
  keywords: string[]
  hierarchy?: string[] // For nested headings like ["Components", "Buttons", "Primary Button"]
}

interface SearchIndexOptions {
  include?: string[]
  outputDir?: string
  outputFile?: string
  cssDocsPath?: string // Path to existing css-docs.json for integration
}

function parseMDXContent(content: string, filePath: string): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = []

  // Extract title from first heading or filename
  const titleMatch = content.match(/^#\s+(.+)/m)
  const pageTitle = titleMatch ? titleMatch[1] : filePath.replace(/.*\//, '').replace('.mdx', '')

  // Create main page entry - use relative URLs that work with base path
  const pageUrl = filePath.replace('src/', '').replace('.mdx', '')
  entries.push({
    id: `page-${filePath}`,
    title: pageTitle,
    url: pageUrl,
    type: 'page',
    content: content.replace(/[#*`]/g, '').substring(0, 300), // Clean content preview
    keywords: extractKeywords(content)
  })

  // Extract headings
  const headingMatches = content.matchAll(/^(#{1,6})\s+(.+)/gm)
  const hierarchy: string[] = []

  for (const match of headingMatches) {
    const level = match[1].length
    const heading = match[2]

    // Update hierarchy based on heading level
    hierarchy[level - 1] = heading
    hierarchy.length = level // Trim deeper levels

    entries.push({
      id: `heading-${filePath}-${heading.toLowerCase().replace(/\s+/g, '-')}`,
      title: heading,
      url: `${pageUrl}#${heading.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'heading',
      content: heading,
      keywords: extractKeywords(heading),
      hierarchy: [...hierarchy]
    })
  }

  // Extract Vue component references and link to relevant sections
  const componentMatches = content.matchAll(/<(\w+)[^>]*>/g)
  const seenComponents = new Set<string>()

  for (const match of componentMatches) {
    const componentName = match[1]
    if (componentName && componentName[0] === componentName[0].toUpperCase() && !seenComponents.has(componentName)) {
      seenComponents.add(componentName)

      // Try to find a relevant section for this component
      let componentUrl = pageUrl
      if (componentName === 'CssDoc') {
        componentUrl = `${pageUrl}#button-components` // First CssDoc usage
      } else if (componentName === 'LiveExample') {
        componentUrl = `${pageUrl}#live-code-examples`
      } else if (componentName === 'HelloWorld') {
        componentUrl = pageUrl // Just go to top of page
      }

      entries.push({
        id: `component-${filePath}-${componentName}`,
        title: componentName,
        url: componentUrl,
        type: 'component',
        content: `${componentName} component used in ${pageTitle}`,
        keywords: [componentName.toLowerCase(), 'component', ...extractKeywords(componentName)]
      })
    }
  }

  return entries
}

function extractKeywords(text: string): string[] {
  // Extract meaningful words, filter common words
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index) // Unique words
}

// Helper function to determine section based on file path and selector
function getCSSSection(filePath: string, selector: string): { section: string; anchor: string } {
  // Extract filename to determine the section
  const fileName = filePath.split('/').pop()?.replace('.css', '') || ''

  // Create section anchor ID (convert to kebab-case)
  const sectionAnchor = `${fileName.replace(/([A-Z])/g, '-$1').toLowerCase()}-components`
    .replace(/^-/, '') // Remove leading dash

  // Create specific selector anchor
  const selectorAnchor = selector.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()

  return {
    section: sectionAnchor,
    anchor: selectorAnchor
  }
}

function integrateCSSDocsData(cssDocsPath: string): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = []

  try {
    if (existsSync(cssDocsPath)) {
      const cssDocsContent = readFileSync(cssDocsPath, 'utf-8')
      const cssDocsData = JSON.parse(cssDocsContent)

      for (const [filePath, docs] of Object.entries(cssDocsData)) {
        for (const doc of docs as any[]) {
          if (doc.selector) {
            const { section, anchor } = getCSSSection(filePath, doc.selector)
            const cssUrl = `design-system-documentation#${anchor}`

            entries.push({
              id: `css-${filePath}-${doc.selector}`,
              title: doc.selector,
              url: cssUrl,
              type: 'css-class',
              content: doc.description || `CSS class ${doc.selector}`,
              keywords: [
                doc.selector.replace(/[^\w]/g, ''),
                'css',
                'style',
                'class',
                section.replace('-components', ''), // Add base section name as keyword
                ...extractKeywords(doc.description || '')
              ]
            })
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not integrate CSS docs data:', error)
  }

  return entries
}

export default function searchIndexPlugin(options: SearchIndexOptions = {}): Plugin {
  const {
    include = ['src/**/*.mdx'],
    outputDir = 'public',
    outputFile = 'search-index.json',
    cssDocsPath = 'public/css-docs.json'
  } = options

  const generateSearchIndex = () => {
    try {
      const allEntries: SearchIndexEntry[] = []

      // Process MDX files
      for (const pattern of include) {
        const files = glob.sync(pattern)

        for (const file of files) {
          try {
            const content = readFileSync(file, 'utf-8')
            const entries = parseMDXContent(content, file)
            allEntries.push(...entries)
          } catch (error) {
            console.warn(`Could not parse file ${file}:`, error)
          }
        }
      }

      // Integrate CSS documentation
      const cssEntries = integrateCSSDocsData(cssDocsPath)
      allEntries.push(...cssEntries)

      // Ensure output directory exists
      const outputPath = resolve(outputDir)
      if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true })
      }

      // Write the search index
      const outputFilePath = join(outputPath, outputFile)
      const searchIndex = {
        entries: allEntries,
        meta: {
          generatedAt: new Date().toISOString(),
          totalEntries: allEntries.length,
          types: {
            pages: allEntries.filter(e => e.type === 'page').length,
            headings: allEntries.filter(e => e.type === 'heading').length,
            components: allEntries.filter(e => e.type === 'component').length,
            cssClasses: allEntries.filter(e => e.type === 'css-class').length
          }
        }
      }

      writeFileSync(outputFilePath, JSON.stringify(searchIndex, null, 2))

      console.log(`Generated search index with ${allEntries.length} entries`)
      console.log(`  - ${searchIndex.meta.types.pages} pages`)
      console.log(`  - ${searchIndex.meta.types.headings} headings`)
      console.log(`  - ${searchIndex.meta.types.components} components`)
      console.log(`  - ${searchIndex.meta.types.cssClasses} CSS classes`)
    } catch (error) {
      console.error('Error generating search index:', error)
    }
  }

  return {
    name: 'search-index',
    buildStart() {
      generateSearchIndex()
    },
    handleHotUpdate({ file }) {
      if (file.match(/\.(mdx|css|scss|sass|less)$/)) {
        generateSearchIndex()
      }
    }
  }
}
