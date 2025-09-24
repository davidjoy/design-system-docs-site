import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./design-system-documentation.mdx')
  },
  {
    path: '/components-page',
    name: 'Components',
    component: () => import('./components-page.mdx')
  },
  {
    path: '/utilities',
    name: 'Utilities', 
    component: () => import('./utilities.mdx')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
