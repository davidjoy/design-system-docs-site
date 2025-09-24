import { createRouter, createWebHistory } from 'vue-router'
import DesignSystemDocumentation from './design-system-documentation.mdx'
import ComponentsPage from './components-page.mdx'
import Utilities from './utilities.mdx'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: DesignSystemDocumentation
  },
  {
    path: '/components-page',
    name: 'Components',
    component: ComponentsPage
  },
  {
    path: '/utilities',
    name: 'Utilities',
    component: Utilities
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
