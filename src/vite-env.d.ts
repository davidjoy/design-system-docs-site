/// <reference types="vite/client" />

declare module '*.mdx' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
