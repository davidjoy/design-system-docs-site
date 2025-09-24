import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './generated-pages/HomePage.vue'
import ComponentsPage from './generated-pages/ComponentsPage.vue'
import UtilitiesPage from './generated-pages/UtilitiesPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/components-page',
    name: 'Components',
    component: ComponentsPage
  },
  {
    path: '/utilities',
    name: 'Utilities',
    component: UtilitiesPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
