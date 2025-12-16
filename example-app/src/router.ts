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
          keepAlive: true,
        },
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('./views/Users.vue'),
        meta: {
          title: 'Users',
          icon: 'fas fa-user',
          keepAlive: true,
        },
      },
      {
        path: '/products',
        name: 'Products',
        component: () => import('./views/Products.vue'),
        meta: {
          title: 'Products',
          icon: 'fas fa-bars',
          keepAlive: true,
        },
      },
      {
        path: '/orders',
        name: 'Orders',
        component: () => import('./views/Orders.vue'),
        meta: {
          title: 'Orders',
          icon: 'fas fa-shopping-cart',
          keepAlive: true,
        },
      },
      {
        path: '/analytics',
        name: 'Analytics',
        component: () => import('./views/Analytics.vue'),
        meta: {
          title: 'Analytics',
          icon: 'fas fa-chart-line',
          keepAlive: true,
        },
      },
      {
        path: '/settings',
        name: 'Settings',
        component: () => import('./views/Settings.vue'),
        meta: {
          title: 'Settings',
          icon: 'fas fa-cog',
          keepAlive: true,
        },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('./views/Products.vue'),
        meta: {
          title: 'Profile',
          icon: 'fas fa-account',
          keepAlive: true,
        },
      },
      {
        path: '/test-untitled',
        name: 'test-untitled',
        component: () => import('./views/TestUntitled.vue'),
        meta: {
          title: 'Then Demos',
          icon: 'mdi-test-tube',
          keepAlive: true,
        },
      },
      {
        path: '/advanced-demo',
        name: 'AdvancedDemo',
        component: () => import('./views/AdvancedTabDemo.vue'),
        meta: {
          title: 'Advanced Demo',
          icon: 'mdi-rocket',
          keepAlive: true,
        },
      },
      {
        path: '/composable-demo',
        name: 'ComposableDemo',
        component: () => import('./views/ComposableDemo.vue'),
        meta: {
          title: 'Composable Demo',
          icon: 'mdi-puzzle',
          keepAlive: true,
        },
      },
      {
        path: '/transition-demo',
        name: 'TransitionDemo',
        component: () => import('./views/TransitionDemo.vue'),
        meta: {
          title: 'Transition Effects',
          icon: 'mdi-animation-play',
          keepAlive: true,
        },
      },
      {
        path: '/title-test',
        name: 'TitleTest',
        component: () => import('./views/TitleTestDemo.vue'),
        meta: {
          title: 'Title Test',
          icon: 'mdi-format-title',
          keepAlive: true,
        },
      },
      {
        path: '/cache-control-demo',
        name: 'CacheControlDemo',
        component: () => import('./views/CacheControlDemo.vue'),
        meta: {
          title: 'Cache Control',
          icon: 'mdi-database-refresh',
          keepAlive: true,
        },
      },
      {
        path: '/blank-page-diagnostics',
        name: 'BlankPageDiagnostics',
        component: () => import('./views/BlankPageDiagnostics.vue'),
        meta: {
          title: 'Blank Page Diagnostics',
          icon: 'mdi-bug-check',
          keepAlive: true,
        },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('./views/NotFound.vue'),
        meta: {
          keepAlive: false,
        },
      },

    ],
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
