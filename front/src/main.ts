import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { Quasar } from 'quasar'

import App from './App.vue'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/roboto-font/roboto-font.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Import app css
import './css/app.css'

console.log('🚀 [Main] Starting MyNet Quasar application')

// Create the Vue application
const myApp = createApp(App)

// Create and use Pinia BEFORE using Quasar
const pinia = createPinia()
myApp.use(pinia)

// Use Quasar
myApp.use(Quasar, {
  plugins: {} // import Quasar plugins and add here
})

// Mount the app
myApp.mount('#q-app')

console.log('✅ [Main] Application mounted successfully')
