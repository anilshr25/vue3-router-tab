<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-4">Orders</h1>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Orders</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="orders"
              :items-per-page="10"
            >
              <template #item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const headers = [
  { title: 'Order ID', key: 'id' },
  { title: 'Customer', key: 'customer' },
  { title: 'Amount', key: 'amount' },
  { title: 'Status', key: 'status' },
  { title: 'Date', key: 'date' },
]

const orders = [
  { id: '#1234', customer: 'John Doe', amount: '$299.99', status: 'Completed', date: '2025-09-28' },
  { id: '#1235', customer: 'Jane Smith', amount: '$149.99', status: 'Pending', date: '2025-09-29' },
  { id: '#1236', customer: 'Bob Johnson', amount: '$399.99', status: 'Processing', date: '2025-09-29' },
]

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Completed: 'success',
    Pending: 'warning',
    Processing: 'info',
    Cancelled: 'error',
  }
  return colors[status] || 'grey'
}
onMounted(() => {
  console.log('📦 Orders page mounted')
})
</script>