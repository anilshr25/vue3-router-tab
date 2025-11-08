<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4 font-weight-bold">Dashboard</h1>
          <v-chip color="success" variant="flat" class="pulse-animation">
            <v-icon start>mdi-refresh</v-icon>
            Loaded: {{ mountTime }}
          </v-chip>
        </div>
      </v-col>

      <!-- Stats Cards -->
      <v-col cols="12" md="3">
        <v-card color="primary">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold text-white">1,234</div>
                <div class="text-caption text-white">Total Users</div>
              </div>
              <v-icon size="48" color="white" style="opacity: 0.3">
                mdi-account-multiple
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold text-white">567</div>
                <div class="text-caption text-white">Active Orders</div>
              </div>
              <v-icon size="48" color="white" style="opacity: 0.3">
                mdi-cart
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="warning">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold text-white">89</div>
                <div class="text-caption text-white">Products</div>
              </div>
              <v-icon size="48" color="white" style="opacity: 0.3">
                mdi-package-variant
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="info">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-h4 font-weight-bold text-white">$45.6K</div>
                <div class="text-caption text-white">Revenue</div>
              </div>
              <v-icon size="48" color="white" style="opacity: 0.3">
                mdi-currency-usd
              </v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Activity -->
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Activity</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template #prepend>
                  <v-avatar color="primary">
                    <v-icon>mdi-account-plus</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>New user registered</v-list-item-title>
                <v-list-item-subtitle>2 minutes ago</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-avatar color="success">
                    <v-icon>mdi-cart-check</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>Order #1234 completed</v-list-item-title>
                <v-list-item-subtitle>15 minutes ago</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-avatar color="info">
                    <v-icon>mdi-package-variant</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>New product added</v-list-item-title>
                <v-list-item-subtitle>1 hour ago</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useFirstMount } from '../composables/useFirstMount'

const mountTime = ref('')
const { onFirstMount } = useFirstMount()

onFirstMount(() => {
  const now = new Date()
  mountTime.value = now.toLocaleTimeString()
  console.log('🔄 Dashboard page mounted at:', mountTime.value)
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
</style>
