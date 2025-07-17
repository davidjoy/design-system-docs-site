import type { Plugin } from 'vite'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'glob'

interface CssDocComment {
  description: string
  selector?: string
  params?: Array<{ name: string; description: string }>
  example?: string
  since?: string
  deprecated?: boolean
}

interface CssDocsOptions {
  include?: string[]
  outputDir?: string
  outputFile?: string
}

function parseCssComments(content: string): CssDocComment[] {
  const comments: CssDocComment[] = []

  // Regex to match JSDoc-style comments followed by CSS rules
  const commentRegex = /\/\*\*([\s\S]*?)\*\/\s*([\s\S]*?)(?=\/\*\*|$)/g

  let match
  while ((match = commentRegex.exec(content)) !== null) {
    const commentContent = match[1]
    const followingCSS = match[2]

    // Extract selector from following CSS
    const selectorMatch = followingCSS.match(/^\s*([^{]+)\s*{/)
    const selector = selectorMatch ? selectorMatch[1].trim() : undefined

    // Parse comment content
    const lines = commentContent.split('\n').map(line => line.replace(/^\s*\*\s?/, '').trim())

    let description = ''
    const params: Array<{ name: string; description: string }> = []
    let example = ''
    let since = ''
    let deprecated = false

    let currentSection = 'description'

    for (const line of lines) {
      if (line.startsWith('@param')) {
        currentSection = 'param'
        const paramMatch = line.match(/@param\s+(\w+)\s+(.+)/)
        if (paramMatch) {
          params.push({ name: paramMatch[1], description: paramMatch[2] })
        }
      } else if (line.startsWith('@example')) {
        currentSection = 'example'
        example = line.replace('@example', '').trim()
      } else if (line.startsWith('@since')) {
        since = line.replace('@since', '').trim()
      } else if (line.startsWith('@deprecated')) {
        deprecated = true
      } else if (line && currentSection === 'description') {
        description += (description ? ' ' : '') + line
      } else if (line && currentSection === 'example') {
        example += '\n' + line
      }
    }

    if (description || selector) {
      comments.push({
        description: description.trim(),
        selector,
        params: params.length > 0 ? params : undefined,
        example: example.trim() || undefined,
        since: since || undefined,
        deprecated
      })
    }
  }

  return comments
}

export default function cssDocsPlugin(options: CssDocsOptions = {}): Plugin {
  const {
    include = ['src/**/*.css', 'src/**/*.scss'],
    outputDir = 'src/generated',
    outputFile = 'css-docs.json'
  } = options

  const generateDocs = () => {
    try {
      const allDocs: Record<string, CssDocComment[]> = {}

      // Find all CSS files
      for (const pattern of include) {
        const files = glob.sync(pattern)

        for (const file of files) {
          try {
            const content = readFileSync(file, 'utf-8')
            const docs = parseCssComments(content)

            if (docs.length > 0) {
              allDocs[file] = docs
            }
          } catch (error) {
            console.warn(`Could not parse CSS file ${file}:`, error)
          }
        }
      }

      // Ensure output directory exists
      const outputPath = resolve(outputDir)
      if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true })
      }

      // Write the documentation data
      const outputFilePath = join(outputPath, outputFile)
      writeFileSync(outputFilePath, JSON.stringify(allDocs, null, 2))

      console.log(`Generated CSS documentation for ${Object.keys(allDocs).length} files`)
    } catch (error) {
      console.error('Error generating CSS docs:', error)
    }
  }

  return {
    name: 'css-docs',
    buildStart() {
      generateDocs()
    },
    handleHotUpdate({ file }) {
      if (file.match(/\.(css|scss|sass|less)$/)) {
        generateDocs()
      }
    }
  }
}
