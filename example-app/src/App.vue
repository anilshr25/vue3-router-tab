<template>
  <v-app>
    <RouterView />
  </v-app>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { setRouterTabsTheme, setRouterTabsPrimary } from 'vue3-router-tab'

onMounted(() => {
setRouterTabsTheme('dark')
setRouterTabsPrimary('#22c55e')
})
</script>