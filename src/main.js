import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/css/base.css'
import App from './App.vue'
import { createPinia } from 'pinia' // 引入pinia    
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import router from './router/index.js'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(pinia)
app.mount('#app')
