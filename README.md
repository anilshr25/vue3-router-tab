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

## Basic Usage

```vue
<template>
  <router-tab cookie-key="app-tabs" />
</template>
```

> Hint: `cookie-key` is optional. Omit it to fall back to the default `router-tabs:snapshot` cookie, or set your own as shown above.

### Enhanced Usage

```vue
<template>
  <router-tab 
    cookie-key="app-tabs"
    :sortable="true"
    @tab-sort="onTabSort"
    @tab-sorted="onTabSorted"
  />
</template>

<script setup>
function onTabSort({ tab, index }) {
  console.log('Tab drag started:', tab.title, 'at index', index)
}

function onTabSorted({ tab, fromIndex, toIndex }) {
  console.log('Tab moved:', tab.title, 'from', fromIndex, 'to', toIndex)
}
</script>
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

## Configuration

### RouterTab Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `TabInput[]` | `[]` | Initial tabs to display |
| `keepAlive` | `boolean` | `true` | Enable keep-alive for tab components |
| `maxAlive` | `number` | `0` | Maximum number of alive components (0 = unlimited) |
| `keepLastTab` | `boolean` | `true` | Prevent closing the last remaining tab |
| `append` | `'last' \| 'next'` | `'last'` | Where to append new tabs |
| `defaultPage` | `string \| object` | `'/'` | Default route to navigate to |
| `tabTransition` | `string \| object` | `'router-tab-zoom'` | Transition for tab changes |
| `pageTransition` | `string \| object` | `{ name: 'router-tab-swap', mode: 'out-in' }` | Transition for page changes |
| `contextmenu` | `boolean \| array` | `true` | Enable context menu or provide custom menu items |
| `cookieKey` | `string` | `'router-tabs:snapshot'` | Cookie key for persistence |
| `persistence` | `object \| null` | `null` | Persistence configuration |
| `sortable` | `boolean` | `true` | Enable drag-and-drop tab sorting |

### Reactive Tab Updates

RouterTab automatically watches for reactive properties in your page components and updates the corresponding tab information in real-time. The tab titles, icons, and other properties displayed in the tab bar will automatically update when the reactive properties in your components change.

#### Watched Properties

The following reactive properties in your page components are automatically monitored:

- **`routeTabTitle`** - Updates the tab title
- **`routeTabIcon`** - Updates the tab icon
- **`routeTabClosable`** - Updates whether the tab can be closed
- **`routeTabMeta`** - Updates additional tab metadata

#### Basic Usage

```vue
<template>
  <div>
    <button @click="updateTitle">Update Title</button>
    <button @click="toggleLoading">Toggle Loading</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Simple reactive title - tab updates immediately when this changes
const routeTabTitle = ref('My Page')

// Dynamic title based on state
const isLoading = ref(false)
const routeTabTitle = computed(() => 
  isLoading.value ? 'Loading...' : 'My Page'
)

// Dynamic icon - tab icon updates automatically
const routeTabIcon = computed(() => 
  isLoading.value ? 'mdi-loading mdi-spin' : 'mdi-page'
)

// Conditional closability - tab close button appears/disappears automatically
const routeTabClosable = computed(() => !isLoading.value)

// Functions that trigger reactive updates
function updateTitle() {
  routeTabTitle.value = `Updated ${Date.now()}`
}

function toggleLoading() {
  isLoading.value = !isLoading.value
}
</script>
```

#### Advanced Examples

```vue
<script setup>
import { ref, computed } from 'vue'

const notifications = ref(0)
const hasError = ref(false)
const isProcessing = ref(false)

// Dynamic title with notification count
const routeTabTitle = computed(() => {
  if (hasError.value) return 'Error!'
  if (isProcessing.value) return 'Processing...'
  if (notifications.value > 0) return `Messages (${notifications.value})`
  return 'Dashboard'
})

// State-based icons
const routeTabIcon = computed(() => {
  if (hasError.value) return 'mdi-alert'
  if (isProcessing.value) return 'mdi-loading mdi-spin'
  if (notifications.value > 0) return 'mdi-bell-badge'
  return 'mdi-view-dashboard'
})

// Prevent closing during critical operations
const routeTabClosable = computed(() => !isProcessing.value)

// Custom metadata for advanced use cases
const routeTabMeta = computed(() => ({
  status: hasError.value ? 'error' : 'normal',
  count: notifications.value,
  timestamp: Date.now()
}))
</script>
```

#### Using Composables

For easier reactive tab management, use the provided composables:

```vue
<script setup>
import { 
  useReactiveTab, 
  useLoadingTab, 
  useNotificationTab, 
  useStatusTab 
} from 'vue3-router-tab'

// Basic composable
const { routeTabTitle, routeTabIcon, updateTitle } = useReactiveTab({
  title: 'My Page',
  icon: 'mdi-page'
})

// Loading state preset
const isLoading = ref(false)
const loadingTab = useLoadingTab(isLoading, 'Dashboard')

// Notification preset
const count = ref(0)
const notificationTab = useNotificationTab(count, 'Messages')

// Status preset
const status = ref('normal')
const statusTab = useStatusTab(status, 'Process')
</script>
```

**Available Composables:**
- `useReactiveTab(config)` - Basic reactive tab management
- `useLoadingTab(loading, baseTitle)` - Loading state management
- `useNotificationTab(count, baseTitle, baseIcon)` - Notification badges
- `useStatusTab(status, baseTitle)` - Status-based updates

### Tab Closing Behavior

When a tab is closed, the plugin automatically navigates to the next available tab with the following priority:

1. **Next tab** - The tab immediately to the right
2. **Previous tab** - The tab immediately to the left  
3. **First tab** - If no adjacent tabs exist
4. **Default route** - If no other tabs exist

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

## Theme system

The plugin initialises a lightweight theme layer on install:

- Reads `tab-theme-style` (`'light'`, `'dark'`, or `'system'`; defaults to `'system'`).
- Reads `tab-theme-primary-color` (defaults to `#0f172a`).
- Applies the choice via `data-theme` and `--theme-primary` CSS variables, keeping “system” in sync with OS changes.

Override the theme at runtime:

```ts
import { setRouterTabsTheme, setRouterTabsPrimary } from 'vue3-router-tab'

setRouterTabsTheme('dark')
setRouterTabsPrimary('#22c55e')
```

Customise the defaults with:

```ts
import { initRouterTabsTheme } from 'vue3-router-tab'

initRouterTabsTheme({
  defaultStyle: 'dark',
  defaultPrimary: '#0ea5e9'
})
```

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

## Advanced Features

### Tab Sorting

Enable drag-and-drop tab reordering with the `sortable` prop:

```vue
<router-tab 
  :sortable="true"
  @tab-sort="onTabSort"
  @tab-sorted="onTabSorted"
/>
```



### Persistence Options

Fine-grained control over tab persistence:

```vue
<router-tab 
  :persistence="{
    cookieKey: 'my-app-tabs',
    expiresInDays: 30,
    fallbackRoute: '/dashboard',
    serialize: (snapshot) => btoa(JSON.stringify(snapshot)),
    deserialize: (data) => JSON.parse(atob(data))
  }"
/>
```

## Customising the Context Menu

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

### Built-in Menu Items

- `refresh` - Refresh current tab
- `refreshAll` - Refresh all tabs  
- `close` - Close current tab
- `closeLefts` - Close tabs to the left
- `closeRights` - Close tabs to the right
- `closeOthers` - Close all other tabs

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
