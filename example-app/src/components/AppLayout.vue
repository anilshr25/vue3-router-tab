<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      app
    >
      <template #prepend>
        <div class="pa-4 d-flex align-center justify-space-between">
          <slot name="sidebar-logo">
            <div class="d-flex align-center cursor-pointer" @click="router.push('/')">
              <v-icon 
                :size="rail ? 24 : 32" 
                color="primary"
              >
                mdi-view-dashboard
              </v-icon>
              <span 
                v-if="!rail" 
                class="text-h6 ml-2 font-weight-bold"
              >
                Admin Panel
              </span>
            </div>
          </slot>
        </div>
      </template>

      <!-- Sidebar Content Slot -->
      <slot name="sidebar-content">
        <v-list density="compact" nav>
          <v-list-item
            v-for="item in menuItems"
            :key="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            :value="item.to"
            color="primary"
          >
            <template v-if="item.badge" #append>
              <v-badge
                :content="item.badge"
                color="error"
                inline
              />
            </template>
          </v-list-item>
        </v-list>
      </slot>

      <template #append>
        <div class="pa-4">
          <slot name="sidebar-footer">
            <v-btn
              :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
              variant="text"
              @click="rail = !rail"
            />
          </slot>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Header -->
    <v-app-bar
      app
      elevation="1"
      color="surface"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <slot name="header-title">
        <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>
      </slot>

      <v-spacer />

      <slot name="header-actions">
        <v-btn icon="mdi-magnify" variant="text" />
        <v-btn icon variant="text">
          <v-badge
            color="error"
            content="3"
            offset-x="-5"
            offset-y="-5"
          >
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon
              v-bind="props"
            >
              <v-avatar size="36" color="primary">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="router.push('/profile')">
              <template #prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item @click="router.push('/settings')">
              <template #prepend>
                <v-icon>mdi-cog</v-icon>
              </template>
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleLogout">
              <template #prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </slot>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <slot name="content">
          <router-tab v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-tab>
        </slot>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer
      app
      color="surface"
      elevation="8"
    >
      <slot name="footer">
        <v-container fluid>
          <v-row align="center" justify="space-between">
            <v-col cols="auto">
              <span class="text-caption">
                © {{ currentYear }} Admin Panel. All rights reserved.
              </span>
            </v-col>
            <v-col cols="auto">
              <slot name="footer-links">
                <v-btn
                  variant="text"
                  size="small"
                  @click="handleFooterLink('privacy')"
                >
                  Privacy Policy
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  @click="handleFooterLink('terms')"
                >
                  Terms of Service
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  @click="handleFooterLink('contact')"
                >
                  Contact
                </v-btn>
              </slot>
            </v-col>
          </v-row>
        </v-container>
      </slot>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { MenuItem } from '../types/menu'

// Props
interface Props {
  initialDrawer?: boolean
  initialRail?: boolean
  menuItems?: MenuItem[]
}

const props = withDefaults(defineProps<Props>(), {
  initialDrawer: true,
  initialRail: false,
  menuItems: () => [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
    { title: 'Users', icon: 'mdi-account-multiple', to: '/users', badge: '12' },
    { title: 'Products', icon: 'mdi-package-variant', to: '/products' },
    { title: 'Orders', icon: 'mdi-cart', to: '/orders', badge: '5' },
    { title: 'Analytics', icon: 'mdi-chart-line', to: '/analytics' },
    { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
  ],
})

// Emits
const emit = defineEmits<{
  logout: []
  footerLink: [link: string]
}>()

// Router
const router = useRouter()
const route = useRoute()

// State
const drawer = ref(props.initialDrawer)
const rail = ref(props.initialRail)

// Computed
const currentYear = computed(() => new Date().getFullYear())
const currentPageTitle = computed(() => route.meta.title || route.name || 'Dashboard')

// Methods
const handleLogout = () => {
  emit('logout')
}

const handleFooterLink = (link: string) => {
  emit('footerLink', link)
}
</script>

<style scoped>
.v-navigation-drawer {
  transition: width 0.2s;
}

.cursor-pointer {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>