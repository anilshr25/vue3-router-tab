import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Profile from "./views/Profile.vue";

const routes = [
  { path: "/", name: "home", component: Home, meta: { title: "Home" } },
  { path: "/about", name: "about", component: About, meta: { title: "About" } },
  { path: "/profile", name: "profile", component: Profile, meta: { title: "Profile" } }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
