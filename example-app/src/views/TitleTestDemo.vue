<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4 font-weight-bold">Dynamic Tab Title Test</h1>
          <v-chip color="success" variant="flat">
            <v-icon start>mdi-check-circle</v-icon>
            Tab Title is Working!
          </v-chip>
        </div>
      </v-col>

      <v-col cols="12">
        <v-alert type="info" variant="tonal" class="mb-4">
          <v-alert-title>How It Works</v-alert-title>
          <div class="mt-2">
            This page demonstrates reactive tab title updates. The tab title in the tab bar 
            above should change as you interact with the controls below.
          </div>
        </v-alert>
      </v-col>

      <v-col cols="12">
        <v-card variant="tonal">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-hand-coin</v-icon>
            Live tab bindings (computed)
          </v-card-title>
          <v-card-text class="d-flex flex-wrap align-center">
            <div class="mr-6 mb-2">
              <div class="text-caption text-medium-emphasis">Title</div>
              <div class="text-subtitle-1 font-weight-medium">{{ routeTabTitle }}</div>
            </div>
            <div class="mb-2">
              <div class="text-caption text-medium-emphasis">Note</div>
              <div class="text-body-2">Edit the input below to update the tab title.</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-form-textbox</v-icon>
            Title Editor
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="customTitle"
              label="Tab title"
              hint="This updates routeTabTitle"
              persistent-hint
              clearable
            />
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const customTitle = ref('My new Tab Title')

// Example: use computed so RouterTab tracks reactive updates
const routeTabTitle = computed(() => customTitle.value)

defineExpose({
  routeTabTitle
})
</script>
 