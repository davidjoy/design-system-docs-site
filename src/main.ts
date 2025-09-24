import { createApp } from 'vue'
import './style.css'
import 'vue-live/style.css'
import 'prismjs/themes/prism.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
