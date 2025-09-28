<template>
  <span class="router-tabs-pinia" aria-hidden="true" />
</template>

<script setup lang="ts">
import { useRouterTabsPiniaPersistence } from '../pinia'
import type { RouterTabsPiniaOptions } from '../pinia'

const props = defineProps<RouterTabsPiniaOptions>()

useRouterTabsPiniaPersistence(props)
</script>
