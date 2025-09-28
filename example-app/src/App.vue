<template>
  <div id="app">
    <nav class="nav">
      <RouterLink to="/">Home</RouterLink>
      <span>|</span>
      <RouterLink to="/about">About</RouterLink>
      <span>|</span>
      <RouterLink to="/contact">Contact</RouterLink>
    </nav>

    <router-tab>
      <template #start>
        <RouterTabsPinia storage-key="example-tabs" />
      </template>
    </router-tab>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouterTabsPinia } from 'vue3-router-tab'
</script>

<style scoped>
.nav {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
}

.nav a {
  color: rebeccapurple;
  text-decoration: none;
}

.nav span {
  color: #666;
}
</style>
