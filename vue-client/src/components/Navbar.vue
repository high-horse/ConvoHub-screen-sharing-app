<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../store/auth'

import router from '../router'

const menuItems = ref([
  { name: 'Home', path: '/home' },
  { name: 'Logout', path: '/', action: logout }
])

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <nav v-if="auth.isAuthenticated" class="bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-white font-bold text-xl">Your App Name</div>
      <ul class="flex space-x-4">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            v-if="!item.action"
            :to="item.path"
            class="text-white hover:text-gray-300 transition duration-300"
            active-class="text-blue-400"
          >
            {{ item.name }}
          </router-link>
          <a
            v-else
            href="#"
            @click.prevent="item.action"
            class="text-white hover:text-gray-300 transition duration-300"
          >
            {{ item.name }}
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>
