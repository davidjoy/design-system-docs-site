import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mdx from '@mdx-js/rollup'
import cssDocsPlugin from './plugins/vite-plugin-css-docs'
import searchIndexPlugin from './plugins/vite-plugin-search-index'
import mdxPagesPlugin from './plugins/vite-plugin-mdx-pages'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'


// https://vite.dev/config/
export default defineConfig({
  // Set base path for GitHub Pages deployment
  // Replace 'design-system-docs-site' with your actual repository name
  base: process.env.NODE_ENV === 'production' ? '/design-system-docs-site/' : '/',

  plugins: [
    mdxPagesPlugin(), // Generate Vue wrappers for MDX files
    vue(),
    mdx({
      jsxImportSource: 'vue',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ]
    }),
    cssDocsPlugin({
      include: ['src/**/*.css', 'src/**/*.scss', 'src/styles/**/*.css'],
      outputDir: 'public',
      outputFile: 'css-docs.json'
    }),
    searchIndexPlugin({
      include: ['src/**/*.mdx'],
      outputDir: 'public',
      outputFile: 'search-index.json',
      cssDocsPath: 'public/css-docs.json'
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
