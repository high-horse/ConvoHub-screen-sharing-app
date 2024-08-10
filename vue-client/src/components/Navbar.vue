<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../store/auth'

const menuItems = ref([
  { name: 'Login', path: '/' },
  { name: 'Home', path: '/home' }
])
</script>

<template>
  <span v-if="auth.isAuthenticated">
    <nav class="bg-gray-800 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <div class="text-white font-bold text-xl">Your App Name</div>
        <ul class="flex space-x-4">
          <li v-for="item in menuItems" :key="item.path">
            <router-link
              :to="item.path"
              class="text-white hover:text-gray-300 transition duration-300"
              active-class="text-blue-400"
            >
              {{ item.name }}
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </span>
</template>
