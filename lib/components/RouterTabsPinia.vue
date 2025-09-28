<template>
  <span class="router-tabs" aria-hidden="true" />
</template>

<script setup lang="ts">
import { useRouterTabsPiniaPersistence } from '../pinia'
defineOptions({ name: 'RouterTabs' })
import type { RouterTabsPiniaOptions } from '../pinia'

const props = defineProps<RouterTabsPiniaOptions>()

useRouterTabsPiniaPersistence(props as RouterTabsPiniaOptions)
</script>
