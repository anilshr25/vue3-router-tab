import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Orders.vue";
import About from "./views/Users.vue";
import Profile from "./views/Products.vue";
import Contact from "./views/Analytics.vue";

const routes = [
  {
    path: '/',
    redirect: '/home',
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
