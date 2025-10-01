# vue3-router-tab

A Vue 3 tab-bar plugin that keeps multiple routes alive with transition support, context menus, advanced title management, and optional cookie-based persistence.

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
    :title-resolver="customTitleResolver"
    untitled-text="No Title"
    @tab-sort="onTabSort"
    @tab-sorted="onTabSorted"
  />
</template>

<script setup>
function customTitleResolver(tab) {
  // Custom title logic
  if (tab.meta?.customTitle) {
    return tab.meta.customTitle
  }
  if (tab.params?.id) {
    return `Item ${tab.params.id}`
  }
  return tab.meta?.title || null // Will fall back to untitled-text
}

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
| `titleResolver` | `function` | `null` | Custom function to resolve tab titles |
| `untitledText` | `string` | `'Untitled'` | Text to display when tab has no title |

### Title Resolution

The plugin provides flexible title resolution with the following priority:

1. **titleResolver function** - Custom function for complete control
2. **meta.title** - Route meta title (string or array)
3. **untitledText prop** - Fallback text (default: "Untitled")

```vue
<router-tab 
  :title-resolver="(tab) => tab.meta?.customTitle || 'My Tab'"
  untitled-text="No Title"
/>
```

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

### Advanced Title Management

Comprehensive title management with replacement rules, normalization, and smart fallbacks:

```vue
<router-tab 
  :title-resolver="customTitleResolver"
  :title-config="{
    placeholder: 'Untitled Document',
    maxLength: 30,
    capitalize: true,
    replacements: {
      'profile': 'User Profile',
      'settings': 'App Settings',
      'untitled': 'New Document'
    }
  }"
  :enable-title-replacement="true"
  untitled-text="No Title"
/>
```

**Key Features:**
- **Smart Processing**: Handles null, undefined, empty strings, arrays, and objects
- **Custom Replacements**: Replace specific title patterns (case-insensitive)
- **Length Management**: Automatic truncation for long titles
- **Normalization**: Trim whitespace, capitalize, and apply word transformations
- **Flexible Fallbacks**: Configurable placeholder text for missing titles

**Programmatic Title Management:**
```vue
<script setup>
const routerTabRef = ref()

// Replace title if it matches patterns
const updateProfileTitle = () => {
  routerTabRef.value?.replaceTabTitle(
    'profile-tab-id', 
    'My New Profile',
    ['profile', 'untitled'] // Match patterns
  )
}

// Add custom replacement rules
const addTitleRule = () => {
  routerTabRef.value?.addTitleReplacement('admin', 'Administration')
}
</script>

<template>
  <router-tab ref="routerTabRef" />
</template>
```

**Standalone Usage:**
```typescript
import { TitleManager, processTitle } from 'vue3-router-tab'

// Quick processing
const title = processTitle('untitled') // "Untitled"

// Advanced configuration
const titleManager = new TitleManager({
  placeholder: 'No Title',
  replacements: { 'profile': 'User Profile' }
})
const result = titleManager.processTitle('profile') // "User Profile"
```

📖 **[Complete Title Management Documentation](TITLE_MANAGEMENT.md)**

### Custom Title Resolution (Legacy)

For simpler title customization, use the title resolver function:

```vue
<router-tab 
  :title-resolver="(tab) => {
    // Custom logic for tab titles
    if (tab.meta?.isDynamic) {
      return `Dynamic: ${tab.params?.id}`
    }
    return tab.meta?.title || 'Untitled'
  }"
  untitled-text="No Name"
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
