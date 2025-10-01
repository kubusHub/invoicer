// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'
import Dashboard from '../components/Dashboard.vue'
import InvoiceEdit from '../components/InvoiceEdit.vue'
import Login from '../components/Login.vue'
import MonthlySummary from '../components/MonthlySummary.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/invoice/:id',
    name: 'InvoiceEdit',
    component: InvoiceEdit,
    props: true,
  },
  { path: '/monthly', name: 'MonthlySummary', component: MonthlySummary },
  { path: '/reports', name: 'Reports', component: () => import('../components/Reports.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  // For single-user app, no auth guard needed - always allow access
  next()
})

export default router
