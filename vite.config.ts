import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'
import cssDocsPlugin from './plugins/vite-plugin-css-docs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    mdx({
      jsxImportSource: 'vue',
      remarkPlugins: [],
      rehypePlugins: []
    }),
    cssDocsPlugin({
      include: ['src/**/*.css', 'src/**/*.scss', 'src/styles/**/*.css'],
      outputDir: 'src/generated',
      outputFile: 'css-docs.json'
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
