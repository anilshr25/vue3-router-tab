import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import RouterTab from "../../lib/index";

import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

const app = createApp(App);

const vuetify = createVuetify()

app.use(vuetify)

app.use(router);

app.use(RouterTab);

app.mount("#app");
