import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

import { auth } from '../store/auth'

import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

import ScreenShare from '../views/ScreenShare.vue'
// import ScreenShare from '../views/_ScreenShare.vue'

// _ScreenShare.vue

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // No auth required for Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true } // Auth required for Home
  },
  {
    path: '/screen-share',
    name: 'Screen Share',
    component: ScreenShare,
    meta: { requiresAuth: true } // Auth required for Home
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})
export default router
