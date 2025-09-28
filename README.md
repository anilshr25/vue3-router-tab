# vue3-router-tab

A Vue 3 tab-bar plugin that keeps multiple routes alive with transition support, context menus, and optional Pinia persistence.

## Installation

```bash
npm install vue3-router-tab
# or
pnpm add vue3-router-tab
```

## Register the plugin

```ts
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import RouterTab from "vue3-router-tab";

const app = createApp(App);
app.use(router);
app.use(RouterTab);
app.mount("#app");
```

The plugin automatically registers two components globally:

- `<router-tab>` – the tab layout and router-view wrapper
- `<router-tabs>` – a helper to persist tabs through Pinia/localStorage (optional)

## Basic usage

```vue
<template>
  <router-tab> </router-tab>
</template>
```

Configure the routes with meta information to control titles, icons, and whether a tab can be closed:

```ts
// router.ts
const routes = [
  {
    path: "/",
    component: Home,
    meta: {
      title: "Home",
      icon: "fa fa-home",
      key: "fullPath",
      closable: true,
      keepAlive: true,
    },
  },
  {
    path: "/about",
    component: About,
    meta: {
      title: "About",
      icon: "fa fa-info-circle",
      keepAlive: false,
    },
  },
];
```

`meta.key` accepts the built-in shortcuts `fullPath`, `path`, or `name`, or you can supply a custom function.

## Pinia persistence

`<router-tabs>` wraps `useRouterTabsPiniaPersistence` and synchronises the tab snapshot with Pinia/localStorage. You can configure it through props:

```vue
<router-tabs
  storage-key="app-tabs"      <!-- storage key name -->
  :fallback-route="'/dashboard'" <!-- optional route used when no snapshot exists -->
/>
```

Prefer to use the composable directly?

```ts
<script setup lang="ts">
import { useRouterTabsPiniaPersistence } from 'vue3-router-tab'

useRouterTabsPiniaPersistence({
  storageKey: 'app-tabs',
  fallbackRoute: '/dashboard',
})
</script>
```

You can provide your own Pinia store via the `store` option if you need to persist snapshots to a backend or IndexedDB.

## Customising the context menu

The context menu can be disabled or extended via the `contextmenu` prop:

```vue
<router-tab
  :contextmenu="[
    'refresh',
    'close',
    { id: 'closeOthers', label: 'Close All Others' },
    {
      id: 'my-action',
      label: 'Open in new window',
      handler: ({ target }) => window.open(target.to, '_blank'),
    },
  ]"
/>
```

Pass `false` to hide the menu entirely.

## Slots

- `start` / `end` – areas on either side of the tab list (useful for toolbars and the Pinia helper)
- `default` – the routed tab content (provided by `<router-tab>` automatically)

## Styling

The package ships with its own SCSS/CSS bundle (imported automatically by the plugin). To customise, override the classes prefixed with `router-tab__` in your own CSS.

## Types

The library ships TypeScript definitions for the tab records, menu configuration, Pinia options, and helper APIs. Import the types from the root module:

```ts
import type { TabRecord, RouterTabsSnapshot } from "vue3-router-tab";
```

## License

MIT
