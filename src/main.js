// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { supabase } from './supabase'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

import './styles.css' // optional, we'll create simple CSS below

const app = createApp(App).use(router)

app.mount('#app')

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    router.push('/')
  } else if (event === 'SIGNED_OUT') {
    router.push('/login')
  }
})
