<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4 font-weight-bold">Users Management</h1>
          <v-chip color="primary" variant="flat" class="reload-indicator">
            <v-icon start>mdi-clock-outline</v-icon>
            {{ mountTime }}
          </v-chip>
        </div>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row align="center">
              <v-col>Users List</v-col>
              <v-col cols="auto">
                <v-btn color="primary" prepend-icon="mdi-plus">
                  Add User
                </v-btn>
              </v-col>
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="users"
              :items-per-page="5"
            >
              <template #item.status="{ item }">
                <v-chip :color="item.status === 'Active' ? 'success' : 'error'" size="small">
                  {{ item.status }}
                </v-chip>
              </template>
              <template #item.actions>
                <v-btn icon="mdi-pencil" size="small" variant="text" />
                <v-btn icon="mdi-delete" size="small" variant="text" color="error" />
              </template>
            </v-data-table>
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
  console.log('🔄 Users page mounted at:', mountTime.value)
})

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const users = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
]
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.reload-indicator {
  animation: slideIn 0.4s ease-out;
}
</style>
