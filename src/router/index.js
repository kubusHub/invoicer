// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
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
  const sessionExpires = sessionStorage.getItem('session_expires')
  const isLoggedIn = sessionExpires && parseInt(sessionExpires) > Date.now()
  if (!isLoggedIn && to.name !== 'Login') {
    next('/login')
  } else {
    next()
  }
})

export default router
