<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4 font-weight-bold">Transition Effects Demo</h1>
          <v-chip color="info" variant="flat" class="pulse-animation">
            <v-icon start>mdi-refresh</v-icon>
            Loaded: {{ mountTime }}
          </v-chip>
        </div>
      </v-col>

      <v-col cols="12">
        <v-alert type="info" variant="tonal" class="mb-4">
          <v-alert-title>How to Test Transitions</v-alert-title>
          <div class="mt-2">
            <ol class="pl-4">
              <li>Select a transition effect from the chips above</li>
              <li>Right-click on any tab and select "Refresh"</li>
              <li>Watch the page reload with the selected transition effect</li>
              <li>Notice the timestamp changes each time you refresh</li>
            </ol>
          </div>
        </v-alert>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-animation</v-icon>
            Available Transitions
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-swap-horizontal</v-icon>
                </template>
                <v-list-item-title>Swap (Default)</v-list-item-title>
                <v-list-item-subtitle>Slides up/down with fade</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="success">mdi-arrow-left-right</v-icon>
                </template>
                <v-list-item-title>Slide</v-list-item-title>
                <v-list-item-subtitle>Horizontal slide transition</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="info">mdi-blur</v-icon>
                </template>
                <v-list-item-title>Fade</v-list-item-title>
                <v-list-item-subtitle>Simple opacity fade</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="warning">mdi-magnify-plus-outline</v-icon>
                </template>
                <v-list-item-title>Scale</v-list-item-title>
                <v-list-item-subtitle>Zoom in/out effect</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="error">mdi-flip-horizontal</v-icon>
                </template>
                <v-list-item-title>Flip</v-list-item-title>
                <v-list-item-subtitle>3D flip animation</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="purple">mdi-rotate-3d-variant</v-icon>
                </template>
                <v-list-item-title>Rotate</v-list-item-title>
                <v-list-item-subtitle>Rotate with scale</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="teal">mdi-basketball</v-icon>
                </template>
                <v-list-item-title>Bounce</v-list-item-title>
                <v-list-item-subtitle>Elastic bounce effect</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="success" class="mr-2">mdi-code-tags</v-icon>
            Usage Example
          </v-card-title>
          <v-card-text>
            <p class="mb-3">To use a custom transition in your RouterTab:</p>
            <v-code class="pa-3 rounded" tag="pre">
&lt;router-tab 
  :page-transition="{ 
    name: 'router-tab-bounce', 
    mode: 'out-in' 
  }"
/&gt;
            </v-code>

            <p class="mt-4 mb-3">Or as a string:</p>
            <v-code class="pa-3 rounded" tag="pre">
&lt;router-tab 
  page-transition="router-tab-slide"
/&gt;
            </v-code>

            <v-divider class="my-4" />

            <p class="text-caption text-medium-emphasis">
              <v-icon size="small" class="mr-1">mdi-information</v-icon>
              All transition CSS is included in the vue3-router-tab package.
              No additional configuration needed!
            </p>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-icon color="warning" class="mr-2">mdi-lightbulb-on</v-icon>
            Tips
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon size="small">mdi-check</v-icon>
                </template>
                <v-list-item-title>Use 'out-in' mode for smooth transitions</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon size="small">mdi-check</v-icon>
                </template>
                <v-list-item-title>Bounce and Flip are more dramatic</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon size="small">mdi-check</v-icon>
                </template>
                <v-list-item-title>Fade is best for subtle transitions</v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon size="small">mdi-check</v-icon>
                </template>
                <v-list-item-title>You can create custom transitions too!</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card color="primary" variant="tonal">
          <v-card-text class="text-center">
            <v-icon size="48" color="primary" class="mb-2">mdi-rocket-launch</v-icon>
            <h3 class="text-h6 mb-2">Ready to Test?</h3>
            <p class="mb-0">
              Right-click on this tab and select "Refresh" to see the current transition in action!
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const mountTime = ref('')

onMounted(() => {
  const now = new Date()
  mountTime.value = now.toLocaleTimeString()
  console.log('🎨 Transition Demo page mounted at:', mountTime.value)
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.pulse-animation {
  animation: pulse 0.5s ease-in-out;
}

.v-code {
  background-color: rgba(0, 0, 0, 0.05);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}
</style>
