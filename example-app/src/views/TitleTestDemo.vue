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

      <!-- Simple Title Test -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-format-title</v-icon>
            Simple Title Update
          </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="customTitle"
              label="Enter custom title"
              hint="Type to update the tab title in real-time"
              persistent-hint
              clearable
            />
            
            <div class="mt-4">
              <p class="text-caption text-medium-emphasis">Current tab title:</p>
              <p class="text-h6 text-primary">{{ routeTabTitle }}</p>
            </div>

            <v-btn @click="resetTitle" color="grey" variant="outlined" block class="mt-4">
              Reset to Default
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Counter Test -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="success" class="mr-2">mdi-counter</v-icon>
            Counter with Badge
          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <div class="text-h2 text-primary mb-4">{{ counter }}</div>
              
              <v-btn-group divided variant="outlined">
                <v-btn @click="counter--" :disabled="counter <= 0">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <v-btn @click="counter++">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-btn-group>

              <v-btn @click="showCounter = !showCounter" color="primary" block class="mt-4">
                {{ showCounter ? 'Hide Counter in Title' : 'Show Counter in Title' }}
              </v-btn>

              <v-btn @click="counter = 0" color="grey" variant="outlined" block class="mt-2">
                Reset Counter
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Loading State Test -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="warning" class="mr-2">mdi-loading</v-icon>
            Loading State
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="isLoading"
              label="Simulate Loading"
              color="warning"
              hide-details
              class="mb-4"
            />

            <v-alert :type="isLoading ? 'warning' : 'success'" variant="tonal">
              <template #prepend>
                <v-icon v-if="isLoading">mdi-loading mdi-spin</v-icon>
                <v-icon v-else>mdi-check-circle</v-icon>
              </template>
              <div>
                Tab title shows: <strong>{{ isLoading ? 'Loading...' : 'Ready' }}</strong>
              </div>
              <div class="text-caption mt-1">
                Icon changes: {{ isLoading ? '⏳' : '✓' }}
              </div>
            </v-alert>

            <v-btn @click="simulateLoading" color="warning" block class="mt-4">
              Simulate 3s Loading
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Status Test -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="info" class="mr-2">mdi-traffic-light</v-icon>
            Status Indicator
          </v-card-title>
          <v-card-text>
            <p class="mb-3">Current Status:</p>
            <v-chip-group
              v-model="status"
              mandatory
              selected-class="bg-primary"
            >
              <v-chip value="idle" color="grey">Idle</v-chip>
              <v-chip value="working" color="blue">Working</v-chip>
              <v-chip value="error" color="red">Error</v-chip>
              <v-chip value="success" color="green">Success</v-chip>
            </v-chip-group>

            <v-alert :type="statusType" variant="tonal" class="mt-4">
              <strong>Tab shows:</strong> {{ getStatusTitle() }}
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Real-time Updates Test -->
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="error" class="mr-2">mdi-timer</v-icon>
            Real-time Clock
          </v-card-title>
          <v-card-text>
            <v-switch
              v-model="showClock"
              label="Show clock in tab title"
              color="error"
              hide-details
            />

            <div v-if="showClock" class="text-center mt-4">
              <div class="text-h4 text-primary">{{ currentTime }}</div>
              <p class="text-caption text-medium-emphasis">
                The tab title updates every second
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Info Card -->
      <v-col cols="12">
        <v-card color="primary" variant="tonal">
          <v-card-text class="text-center">
            <v-icon size="48" color="primary" class="mb-2">mdi-information</v-icon>
            <h3 class="text-h6 mb-2">Look at the Tab Title Above!</h3>
            <p class="mb-0">
              The tab title in the router-tab bar changes as you interact with the controls.
              This demonstrates the reactive tab title feature working in real-time.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Simple title
const customTitle = ref('Title Test Demo')

// Counter
const counter = ref(0)
const showCounter = ref(false)

// Loading
const isLoading = ref(false)

// Status
const status = ref('idle')

// Clock
const showClock = ref(false)
const currentTime = ref('')

// Computed reactive tab title that updates based on state
const routeTabTitle = computed(() => {
  if (showClock.value) {
    return `🕐 ${currentTime.value}`
  }
  
  if (isLoading.value) {
    return '⏳ Loading...'
  }
  
  if (status.value === 'error') {
    return '❌ Error State'
  }
  
  if (status.value === 'success') {
    return '✅ Success!'
  }
  
  if (status.value === 'working') {
    return '⚙️ Working...'
  }
  
  if (showCounter.value && counter.value > 0) {
    return `${customTitle.value} (${counter.value})`
  }
  
  return customTitle.value
})

// Computed icon that changes based on state
const routeTabIcon = computed(() => {
  if (isLoading.value) return 'mdi-loading mdi-spin'
  if (status.value === 'error') return 'mdi-alert-circle'
  if (status.value === 'success') return 'mdi-check-circle'
  if (status.value === 'working') return 'mdi-cog mdi-spin'
  if (showClock.value) return 'mdi-clock-outline'
  return 'mdi-format-title'
})

// Computed closability (can't close during loading)
const routeTabClosable = computed(() => !isLoading.value)

const statusType = computed(() => {
  if (status.value === 'error') return 'error'
  if (status.value === 'success') return 'success'
  if (status.value === 'working') return 'info'
  return 'info'
})

function resetTitle() {
  customTitle.value = 'Title Test Demo'
}

function getStatusTitle() {
  const titles = {
    idle: 'Title Test Demo',
    working: '⚙️ Working...',
    error: '❌ Error State',
    success: '✅ Success!'
  }
  return titles[status.value as keyof typeof titles]
}

async function simulateLoading() {
  isLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 3000))
  isLoading.value = false
}

// Clock interval
let clockInterval: number | null = null

function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString()
}

onMounted(() => {
  updateClock()
  clockInterval = window.setInterval(updateClock, 1000)
  console.log('✅ Title Test Demo mounted - tab title should be reactive')
})

onUnmounted(() => {
  if (clockInterval !== null) {
    clearInterval(clockInterval)
  }
})
</script>

<style scoped>
.v-chip-group {
  justify-content: center;
}
</style>
