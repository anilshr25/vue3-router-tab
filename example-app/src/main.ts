import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import RouterTab from "vue3-router-tab";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(RouterTab);

app.mount("#app");
