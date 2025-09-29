
<template>
  <AppLayout
    :menu-items="menuItems"
    @logout="handleLogout"
    @footer-link="handleFooterLink"
  >
    <!-- Custom Logo -->
    <template #sidebar-logo>
      <div class="d-flex align-center cursor-pointer" @click="$router.push('/')">
        <v-avatar color="primary" size="32">
          <span class="text-white font-weight-bold">AP</span>
        </v-avatar>
        <span class="text-h6 ml-3 font-weight-bold">MyApp</span>
      </div>
    </template>

    <!-- Custom Header Actions -->
    <template #header-actions>
      <v-btn icon @click="toggleTheme" variant="text">
        <v-icon>{{ theme.global.current.value.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      <v-btn icon="mdi-magnify" variant="text" />
      <v-btn icon variant="text">
        <v-badge color="error" content="5">
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="36" color="primary">
              <span class="text-white">JD</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title class="font-weight-bold">John Doe</v-list-item-title>
            <v-list-item-subtitle>admin@example.com</v-list-item-subtitle>
          </v-list-item>
          <v-divider />
          <v-list-item to="/profile">
            <template #prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item to="/settings">
            <template #prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="handleLogout">
            <template #prepend>
              <v-icon color="error">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { MenuItem } from '../types/menu'
import AppLayout from './AppLayout.vue'

const theme = useTheme()

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Users', icon: 'mdi-account-multiple', to: '/users', badge: '12' },
  { title: 'Products', icon: 'mdi-package-variant', to: '/products' },
  { title: 'Orders', icon: 'mdi-cart', to: '/orders', badge: '5' },
  { title: 'Analytics', icon: 'mdi-chart-line', to: '/analytics' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
]

const toggleTheme = () => {
  theme.change(theme.global.current.value.dark ? 'light' : 'dark')
  window.localStorage.setItem('tab-theme-style', theme.global.current.value.dark ? 'light' : 'dark')
  window.localStorage.setItem('tab-theme-primary-color', theme.global.current.value.dark ? '#ffffff' : '#635bff')
}

const handleLogout = () => {
  console.log('Logout clicked')
}

const handleFooterLink = (link: string) => {
  console.log('Footer link clicked:', link)
}
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>