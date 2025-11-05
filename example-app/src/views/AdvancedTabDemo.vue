<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Advanced Tab Reactivity Demo</h1>
        <p class="text-body-1 mb-4">
          This demonstrates advanced reactive tab features including conditional updates, 
          computed properties, and tab metadata synchronization.
        </p>
      </v-col>

      <!-- Scenario Controls -->
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-play</v-icon>
            Demo Scenarios
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="simulateLoading"
                  color="primary"
                  :loading="isLoading"
                  block
                >
                  Simulate Loading State
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="simulateError"
                  color="error"
                  :disabled="isLoading"
                  block
                >
                  Simulate Error State
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="simulateSuccess"
                  color="success"
                  block
                >
                  Simulate Success State
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="toggleNotifications"
                  :color="hasNotifications ? 'orange' : 'grey'"
                  block
                >
                  Toggle Notifications ({{ notificationCount }})
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Live Tab Info -->
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Live Tab Information
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-format-title</v-icon>
                </template>
                <v-list-item-title>Title</v-list-item-title>
                <v-list-item-subtitle>{{ routeTabTitle }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon>{{ routeTabIcon }}</v-icon>
                </template>
                <v-list-item-title>Icon</v-list-item-title>
                <v-list-item-subtitle>{{ routeTabIcon }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon>{{ routeTabClosable ? 'mdi-close' : 'mdi-close-circle-outline' }}</v-icon>
                </template>
                <v-list-item-title>Closable</v-list-item-title>
                <v-list-item-subtitle>{{ routeTabClosable ? 'Yes' : 'No' }}</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template #prepend>
                  <v-icon>mdi-database</v-icon>
                </template>
                <v-list-item-title>Custom Meta</v-list-item-title>
                <v-list-item-subtitle>{{ JSON.stringify(routeTabMeta) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Status Cards -->
      <v-col cols="12" md="4">
        <v-card :color="isLoading ? 'blue' : 'grey'" dark>
          <v-card-title>
            <v-icon class="mr-2">mdi-loading</v-icon>
            Loading State
          </v-card-title>
          <v-card-text>
            <div class="text-h6">{{ isLoading ? 'Active' : 'Inactive' }}</div>
            <v-progress-linear 
              v-if="isLoading" 
              indeterminate 
              color="white"
              class="mt-2"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card :color="hasError ? 'red' : 'grey'" dark>
          <v-card-title>
            <v-icon class="mr-2">mdi-alert</v-icon>
            Error State
          </v-card-title>
          <v-card-text>
            <div class="text-h6">{{ hasError ? 'Error Active' : 'No Errors' }}</div>
            <div v-if="errorMessage" class="text-caption mt-1">{{ errorMessage }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card :color="hasNotifications ? 'orange' : 'grey'" dark>
          <v-card-title>
            <v-icon class="mr-2">mdi-bell</v-icon>
            Notifications
          </v-card-title>
          <v-card-text>
            <div class="text-h6">{{ notificationCount }} New</div>
            <div class="text-caption">Click to toggle</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// State management
const isLoading = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const notificationCount = ref(0)
const hasNotifications = computed(() => notificationCount.value > 0)

// Reactive tab properties
const routeTabTitle = computed(() => {
  if (isLoading.value) return 'Loading...'
  if (hasError.value) return 'Error!'
  if (hasNotifications.value) return `Notifications (${notificationCount.value})`
  return 'Advanced Demo'
})

const routeTabIcon = computed(() => {
  if (isLoading.value) return 'mdi-loading mdi-spin'
  if (hasError.value) return 'mdi-alert'
  if (hasNotifications.value) return 'mdi-bell-badge'
  return 'mdi-rocket'
})

const routeTabClosable = computed(() => {
  // Don't allow closing during loading or error states
  return !isLoading.value && !hasError.value
})

const routeTabMeta = computed(() => ({
  status: isLoading.value ? 'loading' : hasError.value ? 'error' : 'normal',
  notifications: notificationCount.value,
  timestamp: Date.now()
}))

// Demo functions
async function simulateLoading() {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  isLoading.value = false
}

function simulateError() {
  hasError.value = true
  errorMessage.value = 'Something went wrong!'
  isLoading.value = false
  
  // Auto-clear error after 5 seconds
  setTimeout(() => {
    hasError.value = false
    errorMessage.value = ''
  }, 5000)
}

function simulateSuccess() {
  hasError.value = false
  errorMessage.value = ''
  isLoading.value = false
  notificationCount.value = Math.floor(Math.random() * 5) + 1
}

function toggleNotifications() {
  if (hasNotifications.value) {
    notificationCount.value = 0
  } else {
    notificationCount.value = Math.floor(Math.random() * 10) + 1
  }
}

// Initialize with some notifications
onMounted(() => {
  notificationCount.value = 3
})
</script>

<style scoped>
.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>