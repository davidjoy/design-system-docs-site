/**
 * MDX Pages Plugin for Vite
 *
 * This plugin automatically generates Vue wrapper components for MDX files to solve
 * production build issues with Vue Router.
 *
 * PROBLEM:
 * - In development, Vue Router can import MDX files directly without issues
 * - In production builds, MDX files don't work reliably with Vue Router's dynamic/static imports
 * - This causes "m.then is not a function" errors and navigation failures on GitHub Pages
 *
 * SOLUTION:
 * - Auto-generate Vue wrapper components that import MDX files
 * - Vue Router imports the reliable .vue components instead of MDX files directly
 * - MDX content is safely contained within Vue components
 *
 * DEVELOPER EXPERIENCE:
 * - Developers just create .mdx files as normal
 * - No manual boilerplate or wrapper creation needed
 * - Generated files are gitignored, keeping the repo clean
 * - Works seamlessly in both development and production
 *
 * EXAMPLE:
 * Input:  src/my-feature.mdx
 * Output: src/generated-pages/MyFeaturePage.vue (auto-generated wrapper)
 * Router: import MyFeaturePage from './generated-pages/MyFeaturePage.vue' (reliable)
 */

import type { Plugin } from 'vite'
import { glob } from 'glob'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

interface MdxPagesPluginOptions {
  mdxPattern?: string
  outputDir?: string
}

export default function mdxPagesPlugin(options: MdxPagesPluginOptions = {}): Plugin {
  const {
    mdxPattern = 'src/**/*.mdx',
    outputDir = 'src/generated-pages'
  } = options

  return {
    name: 'mdx-pages',
    buildStart() {
      // Create the output directory if it doesn't exist
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
      }

      // Find all MDX files in the project
      const mdxFiles = glob.sync(mdxPattern)

      mdxFiles.forEach(mdxFile => {
        // Skip MDX files that are already in the pages directory to avoid infinite loops
        if (mdxFile.startsWith(outputDir)) return

        // Extract the base filename without extension (e.g., "my-feature" from "my-feature.mdx")
        const baseName = path.basename(mdxFile, '.mdx')

        // Convert kebab-case to PascalCase for component names
        // e.g., "my-feature" -> "MyFeature"
        const componentName = baseName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('')

        // Map specific MDX files to expected Vue component names for routing
        // This handles our existing route structure while providing a pattern for new files
        let vueFileName: string
        if (baseName === 'design-system-documentation') {
          vueFileName = 'HomePage.vue'  // Main landing page
        } else if (baseName === 'components-page') {
          vueFileName = 'ComponentsPage.vue'  // Components documentation
        } else if (baseName === 'utilities') {
          vueFileName = 'UtilitiesPage.vue'  // Utility classes documentation
        } else {
          // For new MDX files, use PascalCase + "Page.vue"
          // e.g., "my-feature.mdx" -> "MyFeaturePage.vue"
          vueFileName = `${componentName}Page.vue`
        }

        const vuePath = path.join(outputDir, vueFileName)
        const relativeMdxPath = path.relative(outputDir, mdxFile)

        // Generate a simple Vue wrapper that imports and renders the MDX content
        // The wrapper provides a stable Vue component interface for Vue Router
        const vueContent = `<template>
  <${componentName}Content />
</template>

<script setup lang="ts">
import ${componentName}Content from '${relativeMdxPath}'
</script>
`

        // Write the generated Vue wrapper to disk
        writeFileSync(vuePath, vueContent)
      })

      console.log(`Generated Vue wrappers for ${mdxFiles.length} MDX files`)
    }
  }
}
