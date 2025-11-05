<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Composable Demo</h1>
        <p class="text-body-1 mb-4">
          This demonstrates using the <code>useReactiveTab</code> composable for easier 
          reactive tab management.
        </p>
      </v-col>

      <!-- Demo Controls -->
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-tune</v-icon>
            Tab Controls
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="toggleLoading"
                  :color="isLoading ? 'orange' : 'primary'"
                  :loading="isLoading"
                  block
                >
                  {{ isLoading ? 'Stop Loading' : 'Start Loading' }}
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="addNotification"
                  color="info"
                  block
                >
                  Add Notification (+{{ Math.floor(Math.random() * 5) + 1 }})
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="clearNotifications"
                  color="grey"
                  :disabled="notifications === 0"
                  block
                >
                  Clear Notifications
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn 
                  @click="cycleStatus"
                  :color="statusColors[currentStatus]"
                  block
                >
                  Status: {{ currentStatus.toUpperCase() }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Current State Display -->
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            Current Tab State
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-card variant="outlined">
                  <v-card-title class="text-h6">Loading Tab</v-card-title>
                  <v-card-text>
                    <div><strong>Title:</strong> {{ loadingTab.routeTabTitle.value }}</div>
                    <div><strong>Icon:</strong> {{ loadingTab.routeTabIcon.value }}</div>
                    <div><strong>Closable:</strong> {{ loadingTab.routeTabClosable.value }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card variant="outlined">
                  <v-card-title class="text-h6">Notification Tab</v-card-title>
                  <v-card-text>
                    <div><strong>Title:</strong> {{ notificationTab.routeTabTitle.value }}</div>
                    <div><strong>Icon:</strong> {{ notificationTab.routeTabIcon.value }}</div>
                    <div><strong>Count:</strong> {{ notifications }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card variant="outlined">
                  <v-card-title class="text-h6">Status Tab</v-card-title>
                  <v-card-text>
                    <div><strong>Title:</strong> {{ statusTab.routeTabTitle.value }}</div>
                    <div><strong>Icon:</strong> {{ statusTab.routeTabIcon.value }}</div>
                    <div><strong>Status:</strong> {{ currentStatus }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Usage Examples -->
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-code-tags</v-icon>
            Usage Examples
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="activeTab">
              <v-tab value="basic">Basic Usage</v-tab>
              <v-tab value="loading">Loading Preset</v-tab>
              <v-tab value="notifications">Notification Preset</v-tab>
              <v-tab value="status">Status Preset</v-tab>
            </v-tabs>

            <v-tabs-window v-model="activeTab">
              <v-tabs-window-item value="basic">
                <pre class="mt-4"><code>import { useReactiveTab } from 'vue3-router-tab'

const { routeTabTitle, routeTabIcon, updateTitle } = useReactiveTab({
  title: 'My Page',
  icon: 'mdi-page',
  closable: true
})

// Update title programmatically
updateTitle('Updated Title')</code></pre>
              </v-tabs-window-item>

              <v-tabs-window-item value="loading">
                <pre class="mt-4"><code>import { useLoadingTab } from 'vue3-router-tab'

const isLoading = ref(false)
const { routeTabTitle, routeTabIcon, routeTabClosable } = useLoadingTab(
  isLoading, 
  'My Page'
)

// When isLoading changes, tab updates automatically</code></pre>
              </v-tabs-window-item>

              <v-tabs-window-item value="notifications">
                <pre class="mt-4"><code>import { useNotificationTab } from 'vue3-router-tab'

const notificationCount = ref(0)
const { routeTabTitle, routeTabIcon } = useNotificationTab(
  notificationCount,
  'Messages',
  'mdi-message'
)

// Tab shows count automatically</code></pre>
              </v-tabs-window-item>

              <v-tabs-window-item value="status">
                <pre class="mt-4"><code>import { useStatusTab } from 'vue3-router-tab'

const status = ref('normal')
const { routeTabTitle, routeTabIcon, routeTabClosable } = useStatusTab(
  status,
  'Dashboard'
)

// Tab reflects current status</code></pre>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoadingTab, useNotificationTab, useStatusTab } from '../../../lib'

// State
const isLoading = ref(false)
const notifications = ref(3)
const currentStatus = ref<'normal' | 'loading' | 'error' | 'success'>('normal')
const activeTab = ref('basic')

// Status colors for UI
const statusColors = {
  normal: 'primary',
  loading: 'orange',
  error: 'error',
  success: 'success'
}

// Using composables for reactive tabs
const loadingTab = useLoadingTab(isLoading, 'Loading Demo')
const notificationTab = useNotificationTab(notifications, 'Messages', 'mdi-message')
const statusTab = useStatusTab(currentStatus, 'Status Demo')

// Since we want to demonstrate all three, we'll use a computed to combine them
// In a real app, you'd typically use just one approach per component
const routeTabTitle = computed(() => {
  if (isLoading.value) return loadingTab.routeTabTitle.value
  if (notifications.value > 0) return notificationTab.routeTabTitle.value
  return statusTab.routeTabTitle.value
})

const routeTabIcon = computed(() => {
  if (isLoading.value) return loadingTab.routeTabIcon.value
  if (notifications.value > 0) return notificationTab.routeTabIcon.value
  return statusTab.routeTabIcon.value
})

const routeTabClosable = computed(() => {
  return loadingTab.routeTabClosable.value && statusTab.routeTabClosable.value
})

// Demo functions
function toggleLoading() {
  isLoading.value = !isLoading.value
}

function addNotification() {
  notifications.value += Math.floor(Math.random() * 5) + 1
}

function clearNotifications() {
  notifications.value = 0
}

function cycleStatus() {
  const statuses: Array<'normal' | 'loading' | 'error' | 'success'> = ['normal', 'loading', 'error', 'success']
  const currentIndex = statuses.indexOf(currentStatus.value)
  currentStatus.value = statuses[(currentIndex + 1) % statuses.length]
}

// Expose reactive properties for RouterTab to access
defineExpose({
  routeTabTitle,
  routeTabIcon,
  routeTabClosable
})
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}
</style>