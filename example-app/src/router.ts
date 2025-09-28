import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Profile from "./views/Profile.vue";
import Contact from "./views/Contact.vue";


const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: {
      title: "Home",
      icon: "fa fa-home",
      key: "fullPath",
      closable: true
    }
  },
  {
    path: "/about",
    name: "about",
    component: About,
    meta: { title: "About" }
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    meta: { title: "Profile" }
  },
  {
    path: "/contact",
    name: "contact",
    component: Contact,
    meta: { title: "Contact" }
  }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
