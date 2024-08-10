import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import { auth } from '../store/auth'

import Login from '../views/Login.vue';
import Home from '../views/Home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
      path: '/home',
      name: 'Home',
      component: Home
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})
export default router;