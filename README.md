# vue3-router-tab

A Vue 3 tab-bar plugin that keeps multiple routes alive with transition support, context menus, and optional cookie-based persistence.

## Installation

```bash
npm install vue3-router-tab
# or
pnpm add vue3-router-tab
```

## Register the plugin

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import RouterTab from 'vue3-router-tab'

const app = createApp(App)
app.use(router)
app.use(RouterTab)
app.mount('#app')
```

The plugin registers the `<router-tab>` component globally. It also exposes an optional `<router-tabs>` helper for advanced cookie options, but you rarely need it now that persistence can be enabled directly on the tab component.

## Basic usage

```vue
<template>
  <router-tab cookie-key="app-tabs" />
</template>
```

Need to customise the rendered output? Provide a slot and use the routed component directly—see [`example-app/src/App.vue`](example-app/src/App.vue) for a working sample:

```vue
<router-tab cookie-key="app-tabs">
  <template #default="{ Component, route }">
    <Suspense>
      <component :is="Component" :key="route.fullPath" />
    </Suspense>
  </template>
</router-tab>
```

Configure route metadata to control tab labels, icons, and lifecycle behaviour:

```ts
const routes = [
  {
    path: '/',
    component: Home,
    meta: {
      title: 'Home',
      icon: 'fa fa-home',
      key: 'fullPath',
      closable: true,
      keepAlive: true,
    },
  },
  {
    path: '/about',
    component: About,
    meta: {
      title: 'About',
      icon: 'fa fa-info-circle',
      keepAlive: false,
    },
  },
]
```

`meta.key` accepts the shortcuts `fullPath`, `path`, or `name`, or you can supply your own function.

## Cookie persistence

`<router-tab cookie-key="…" />` is usually all you need. If you prefer fine grained control (custom expiry, same-site, etc.) you can still use the headless helper:

```vue
<router-tab>
  <template #start>
    <router-tabs
      cookie-key="app-tabs"
      :expires-in-days="14"
      fallback-route="/dashboard"
    />
  </template>
</router-tab>
```

Want to wire it up yourself?

```ts
<script setup lang="ts">
import { useRouterTabsPersistence } from 'vue3-router-tab'

useRouterTabsPersistence({
  cookieKey: 'app-tabs',
  expiresInDays: 30,
  fallbackRoute: '/dashboard'
})
</script>
```
The composable also exposes `serialize` / `deserialize` options so you can encrypt or customise the cookie payload.

### Custom rendering

You can override the default routed view by providing a `#default` slot. The slot receives the same values you would normally get from `<RouterView v-slot>`:

```vue
<router-tab cookie-key="app-tabs">
  <template #default="{ Component, route }">
    <Suspense>
      <component :is="Component" :key="route.fullPath" />
    </Suspense>
  </template>
</router-tab>
```

## Customising the context menu

```vue
<router-tab
  :contextmenu="[
    'refresh',
    'close',
    { id: 'closeOthers', label: 'Close All Others' },
    {
      id: 'openWindow',
      label: 'Open in new window',
      handler: ({ target }) => window.open(target.to, '_blank')
    }
  ]"
/>
```

Pass `false` to disable the context menu entirely.

## Slots

- `start` / `end` – positioned on either side of the tab list (ideal for toolbars or the `<router-tabs>` helper).
- `default` – routed content (rendered automatically by `<router-tab>`).

## Styling

The package ships with its own CSS bundle (imported automatically). Override the `router-tab__*` classes in your stylesheet to customise the appearance.

## Types

```ts
import type { TabRecord, RouterTabsSnapshot, RouterTabsPersistenceOptions } from 'vue3-router-tab'
```

## License

MIT
