import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css' // your existing file with the Tailwind directives/import

const app = createApp(App)
app.use(createPinia())
useAuthStore().restoreSession() // before router so guards see the user
app.use(router)
app.mount('#app')
