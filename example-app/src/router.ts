import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('./layouts/Default.vue'),
    meta: {
      middleware: 'auth',
    },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('./views/Dashboard.vue'),
        meta: {
          title: 'Dashboard',
          icon: 'fas fa-home',
          closable: false,
        },
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('./views/Users.vue'),
        meta: {
          title: 'Users',
          icon: 'fas fa-user',
        },
      },
      {
        path: '/products',
        name: 'Products',
        component: () => import('./views/Products.vue'),
        meta: {
          title: 'Products',
          icon: 'fas fa-bars',
        },
      },
      {
        path: '/orders',
        name: 'Orders',
        component: () => import('./views/Orders.vue'),
        meta: {
          title: 'Orders',
          icon: 'fas fa-shopping-cart',
        },
      },
      {
        path: '/analytics',
        name: 'Analytics',
        component: () => import('./views/Analytics.vue'),
        meta: {
          title: 'Analytics',
          icon: 'fas fa-chart-line',
        },
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('./views/Settings.vue'),
        meta: {
          title: 'Settings',
          icon: 'fas fa-cog',
        },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('./views/Products.vue'),
        meta: {
          title: 'Profile',
          icon: 'fas fa-account',
        },
      },
      {
        path: '/test-untitled',
        name: 'test-untitled',
        component: () => import('./views/TestUntitled.vue'),
        meta: {
          title: 'Then Demos',
          icon: 'mdi-test-tube',
        },
      },
      {
        path: '/advanced-demo',
        name: 'AdvancedDemo',
        component: () => import('./views/AdvancedTabDemo.vue'),
        meta: {
          title: 'Advanced Demo',
          icon: 'mdi-rocket',
        },
      },
      {
        path: '/composable-demo',
        name: 'ComposableDemo',
        component: () => import('./views/ComposableDemo.vue'),
        meta: {
          title: 'Composable Demo',
          icon: 'mdi-puzzle',
        },
      },
      {
        path: '/simple-test',
        name: 'SimpleTest',
        component: () => import('./views/SimpleTest.vue'),
        meta: {
          title: 'Simple Test',
          icon: 'mdi-test-tube-empty',
        },
      },
      {
        path: '/debug-test',
        name: 'DebugTest',
        component: () => import('./views/DebugTest.vue'),
        meta: {
          title: 'Debug Test',
          icon: 'mdi-bug-outline',
        },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('./views/NotFound.vue'),
      },

    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
