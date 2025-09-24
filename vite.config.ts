import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'
import cssDocsPlugin from './plugins/vite-plugin-css-docs'
import remarkGfm from 'remark-gfm'


// https://vite.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages deployment
  // Replace 'design-system-docs-site' with your actual repository name
  base: process.env.NODE_ENV === 'production' ? '/design-system-docs-site/' : '/',

  plugins: [
    vue(),
    mdx({
      jsxImportSource: 'vue',
      remarkPlugins: [remarkGfm],
      rehypePlugins: []
    }),
    cssDocsPlugin({
      include: ['src/**/*.css', 'src/**/*.scss', 'src/styles/**/*.css'],
      outputDir: 'public',
      outputFile: 'css-docs.json'
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
