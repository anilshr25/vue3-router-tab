<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';

const MainLayout = defineAsyncComponent(() => import('../components/MainLayout.vue'))

</script>

<template>
  <Component
    :is="MainLayout"
  >

    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
      >
        <Component :is="Component" />
      </Suspense>
    </RouterView>
  </Component>
</template>

