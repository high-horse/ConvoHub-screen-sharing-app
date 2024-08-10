<script setup lang="ts">
import Navbar from './components/Navbar.vue';
</script>

<template>
  <div id="app1">
    <Navbar />
    <main class="container mx-auto mt-4">
        <router-view></router-view>
    </main>
  </div>
</template>

<style scoped></style>
