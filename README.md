# vue3-router-tab

A Vue 3 tab-bar plugin that keeps multiple routes alive with transition support, context menus, and optional cookie-based persistence.

## ✨ Features

- 🎯 **Multi-tab Navigation** - Keep multiple routes alive simultaneously
- 🔄 **7 Built-in Transitions** - Smooth page transitions (swap, slide, fade, scale, flip, rotate, bounce)
- 🎨 **Reactive Tab Titles** - Automatically update tab titles, icons, and closability from component state
- 🖱️ **Context Menu** - Right-click tabs for refresh, close, and navigation options
- 🔀 **Drag & Drop** - Reorder tabs with drag-and-drop
- 💾 **Cookie Persistence** - Restore tabs on page refresh
- 🎭 **Theme Support** - Light, dark, and system themes with customizable colors
- ⚡ **KeepAlive Support** - Preserve component state when switching tabs
- 🎛️ **Highly Configurable** - Extensive props and events for customization
- 📱 **TypeScript Support** - Full TypeScript definitions included

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

## Page Transitions

Vue3 Router Tab includes 7 built-in page transition effects that are displayed when switching between tabs or refreshing pages.

### Available Transitions

| Transition | Description | Use Case |
|------------|-------------|----------|
| `router-tab-swap` | Slides up/down with fade (default) | General purpose, smooth |
| `router-tab-slide` | Horizontal sliding animation | Dashboard-style navigation |
| `router-tab-fade` | Simple opacity fade | Subtle, minimal distraction |
| `router-tab-scale` | Zoom in/out effect | Dramatic, attention-grabbing |
| `router-tab-flip` | 3D flip animation | Creative, modern feel |
| `router-tab-rotate` | Rotation with scale | Playful, dynamic |
| `router-tab-bounce` | Elastic bounce effect | Fun, energetic |

### Using Transitions

#### Default Transition

```vue
<router-tab />
<!-- Uses router-tab-swap by default -->
```

#### Custom Transition

```vue
<router-tab 
  :page-transition="{ name: 'router-tab-scale', mode: 'out-in' }"
/>
```

#### String Shorthand

```vue
<router-tab page-transition="router-tab-fade" />
```

#### Dynamic Transitions

Change transitions at runtime:

```vue
<template>
  <div>
    <select v-model="currentTransition">
      <option value="router-tab-swap">Swap</option>
      <option value="router-tab-slide">Slide</option>
      <option value="router-tab-fade">Fade</option>
      <option value="router-tab-scale">Scale</option>
      <option value="router-tab-flip">Flip</option>
      <option value="router-tab-rotate">Rotate</option>
      <option value="router-tab-bounce">Bounce</option>
    </select>
    
    <router-tab 
      :page-transition="{ name: currentTransition, mode: 'out-in' }"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
const currentTransition = ref('router-tab-swap')
</script>
```

### Custom Transitions

Create your own transitions by defining CSS classes:

```css
/* Your custom transition */
.my-custom-enter-active,
.my-custom-leave-active {
  transition: all 0.5s ease;
}

.my-custom-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.my-custom-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}
```

```vue
<router-tab page-transition="my-custom" />
```

### Transition Tips

- **Performance**: Use `mode: 'out-in'` for smooth transitions without layout shifts
- **Duration**: Built-in transitions are optimized at 0.5-0.8 seconds
- **Accessibility**: Consider users with motion sensitivity - provide options to disable
- **Context**: Match transition style to your app's design language

## Changing Tab Titles Dynamically

Vue3 Router Tab automatically watches for reactive properties in your page components and updates the corresponding tab information in real-time.

### Quick Start

Simply expose reactive properties from your component:

```vue
<template>
  <div>
    <h1>{{ routeTabTitle }}</h1>
    <button @click="updateTitle">Change Tab Title</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// This ref is automatically watched - tab title updates when it changes!
const routeTabTitle = ref('My Page')

function updateTitle() {
  routeTabTitle.value = 'Updated Title'
}
</script>
```

### Watched Properties

The following reactive properties are automatically monitored:

| Property | Description | Example |
|----------|-------------|---------|
| `routeTabTitle` | Tab title text | `ref('Dashboard')` |
| `routeTabIcon` | Tab icon class | `ref('mdi-home')` |
| `routeTabClosable` | Can tab be closed | `ref(true)` |
| `routeTabMeta` | Additional metadata | `ref({ badge: 5 })` |

### Dynamic Titles with Computed

Create titles that update based on your component state:

```vue
<script setup>
import { ref, computed } from 'vue'

const isLoading = ref(false)
const notifications = ref(0)

// Tab title automatically updates when dependencies change
const routeTabTitle = computed(() => {
  if (isLoading.value) return 'Loading...'
  if (notifications.value > 0) return `Messages (${notifications.value})`
  return 'Dashboard'
})

// Tab icon changes based on state
const routeTabIcon = computed(() => 
  isLoading.value ? 'mdi-loading mdi-spin' : 'mdi-view-dashboard'
)

// Prevent closing during operations
const routeTabClosable = computed(() => !isLoading.value)
</script>
```

### Real-World Examples

#### Example 1: User Profile with Name

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const user = ref(null)
const isLoading = ref(true)

const routeTabTitle = computed(() => 
  isLoading.value ? 'Loading...' : `Profile - ${user.value?.name || 'Unknown'}`
)

const routeTabIcon = computed(() => 
  isLoading.value ? 'mdi-loading mdi-spin' : 'mdi-account'
)

onMounted(async () => {
  user.value = await fetchUser()
  isLoading.value = false
})
</script>
```

#### Example 2: Form with Unsaved Changes

```vue
<script setup>
import { ref, computed } from 'vue'

const formData = ref({})
const hasUnsavedChanges = ref(false)

const routeTabTitle = computed(() => 
  hasUnsavedChanges.value ? '• Edit Form' : 'Edit Form'
)

const routeTabClosable = computed(() => !hasUnsavedChanges.value)

function onChange() {
  hasUnsavedChanges.value = true
}
</script>
```

#### Example 3: Real-time Notifications

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const unreadCount = ref(0)

const routeTabTitle = computed(() => {
  if (unreadCount.value === 0) return 'Messages'
  return `Messages (${unreadCount.value})`
})

const routeTabIcon = computed(() => 
  unreadCount.value > 0 ? 'mdi-bell-badge' : 'mdi-bell-outline'
)

// Simulate real-time updates
onMounted(() => {
  setInterval(() => {
    unreadCount.value = Math.floor(Math.random() * 10)
  }, 5000)
})
</script>
```

### Using the Composable API

For advanced use cases, use the `useReactiveTab` composable:

```vue
<script setup>
import { useReactiveTab } from 'vue3-router-tab'
import { ref } from 'vue'

const user = ref({ name: 'John Doe', status: 'online' })

const { 
  routeTabTitle, 
  routeTabIcon, 
  routeTabClosable 
} = useReactiveTab({
  title: () => `${user.value.name} - ${user.value.status}`,
  icon: () => user.value.status === 'online' ? 'mdi-account' : 'mdi-account-off',
  closable: () => user.value.status !== 'editing'
})
</script>
```

### Important Notes

1. **Automatic Exposure in `<script setup>`**: Properties defined in `<script setup>` are automatically exposed - no need for `defineExpose()`
2. **Reactive types**: Use `ref()` or `computed()` - plain values won't trigger updates
3. **Automatic watching**: No manual watchers needed - the plugin handles everything
4. **Performance**: Only active tab components are watched to minimize overhead

> 💡 **Try it yourself**: Check out the live demo at `/title-test` in the example app to see all these features in action!

### Options API Support

If you're using the Options API, you need to expose the properties:

```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup() {
    const routeTabTitle = ref('My Page')
    const routeTabIcon = computed(() => 'mdi-page')
    
    return {
      routeTabTitle,
      routeTabIcon
    }
  }
}
</script>
```

Or with `defineExpose`:

```vue
<script setup>
import { ref } from 'vue'

const routeTabTitle = ref('My Page')

// Only needed if you're NOT using top-level refs in <script setup>
defineExpose({ routeTabTitle })
</script>
```

**Note**: With `<script setup>`, top-level bindings are automatically exposed, so `defineExpose` is typically not needed.

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

## Programmatic API

Access the router tabs controller to programmatically manage tabs.

### Using the Composable

```vue
<script setup>
import { useRouterTabs } from 'vue3-router-tab'

const tabs = useRouterTabs()

// Available methods
tabs.openTab('/users')              // Open a tab
tabs.closeTab(tabId)                // Close a specific tab
tabs.refreshTab(tabId)              // Refresh a tab
tabs.refreshAll()                   // Refresh all tabs
tabs.closeAll()                     // Close all tabs
tabs.closeOthers(tabId)             // Close all except specified tab
</script>
```

### Using Global Property

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const tabs = instance?.appContext.config.globalProperties.$tabs

// Same methods available
tabs?.openTab('/dashboard')
tabs?.refreshTab('users-123')
</script>
```

### Controller Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `openTab(to, active?, replace?)` | Route location, activate flag, replace flag | Open or activate a tab |
| `closeTab(id, options?)` | Tab ID, close options | Close a specific tab |
| `refreshTab(id, force?)` | Tab ID, force flag | Refresh tab component |
| `refreshAll(force?)` | Force flag | Refresh all tabs |
| `closeAll(options?)` | Close options | Close all closable tabs |
| `closeOthers(id, options?)` | Tab ID, options | Close all tabs except specified |
| `removeTab(id, options?)` | Tab ID, options | Remove tab without navigation |

### Example: Custom Tab Controls

```vue
<template>
  <div>
    <button @click="openDashboard">Open Dashboard</button>
    <button @click="refreshCurrent">Refresh Current</button>
    <button @click="closeAllTabs">Close All</button>
  </div>
</template>

<script setup>
import { useRouterTabs } from 'vue3-router-tab'
import { useRoute } from 'vue-router'

const tabs = useRouterTabs()
const route = useRoute()

function openDashboard() {
  tabs.openTab('/dashboard', true)
}

function refreshCurrent() {
  const currentTab = tabs.tabs.find(t => t.to.path === route.path)
  if (currentTab) {
    tabs.refreshTab(currentTab.id, true)
  }
}

function closeAllTabs() {
  tabs.closeAll({ force: true })
}
</script>
```

### Tab State Access

```vue
<script setup>
import { useRouterTabs } from 'vue3-router-tab'

const controller = useRouterTabs()

// Access current state
console.log(controller.tabs)           // Array of all tabs
console.log(controller.activeId.value) // Current active tab ID
console.log(controller.includeKeys)    // KeepAlive include keys
</script>
```

## Events

RouterTab emits events for tab interactions.

### Available Events

| Event | Payload | Description |
|-------|---------|-------------|
| `tab-sort` | `{ tab, index }` | Fired when tab drag starts |
| `tab-sorted` | `{ tab, fromIndex, toIndex }` | Fired when tab is dropped in new position |

### Usage Example

```vue
<template>
  <router-tab 
    @tab-sort="onTabSort"
    @tab-sorted="onTabSorted"
  />
</template>

<script setup>
function onTabSort({ tab, index }) {
  console.log('Dragging tab:', tab.title, 'from index:', index)
}

function onTabSorted({ tab, fromIndex, toIndex }) {
  console.log('Tab moved:', tab.title)
  console.log('From:', fromIndex, 'To:', toIndex)
  
  // Save new order to backend
  saveTabOrder(tab, toIndex)
}
</script>
```

## Slots

- `start` / `end` – positioned on either side of the tab list (ideal for toolbars or the `<router-tabs>` helper).
- `default` – routed content (rendered automatically by `<router-tab>`).

## Styling

The package ships with its own CSS bundle (imported automatically). Override CSS custom properties or the `router-tab__*` classes to customize the appearance.

### CSS Custom Properties

```css
:root {
  /* Layout */
  --router-tab-header-height: 48px;
  --router-tab-padding: 16px;
  --router-tab-font-size: 14px;
  
  /* Colors */
  --router-tab-primary: #0f172a;
  --router-tab-background: #ffffff;
  --router-tab-text: #334155;
  --router-tab-border: #e2e8f0;
  --router-tab-active-background: #0f172a;
  --router-tab-active-text: #ffffff;
  
  /* Icons & Buttons */
  --router-tab-icon-color: #64748b;
  --router-tab-button-background: #f1f5f9;
  --router-tab-button-color: #0f172a;
}
```

### Custom Styles Example

```css
/* Change tab height */
.router-tab__header {
  height: 56px;
}

/* Custom tab hover effect */
.router-tab__item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Custom active tab */
.router-tab__item.is-active {
  background: #4f46e5;
  border-radius: 8px 8px 0 0;
}

/* Custom close button */
.router-tab__item-close {
  border-radius: 4px;
}

/* Dark theme adjustments */
[data-theme="dark"] .router-tab {
  --router-tab-background: #1e293b;
  --router-tab-text: #f1f5f9;
  --router-tab-border: #334155;
}
```

## Types

```ts
import type { TabRecord, RouterTabsSnapshot, RouterTabsPersistenceOptions } from 'vue3-router-tab'
```

## Examples

Check out the [example-app](./example-app) directory for comprehensive demos including:

- **Basic Usage** - Simple tab navigation
- **Dynamic Titles** - Reactive tab title updates ([/title-test](./example-app/src/views/TitleTestDemo.vue))
- **Transitions** - All 7 transition effects ([/transition-demo](./example-app/src/views/TransitionDemo.vue))
- **Composables** - Using helper composables ([/composable-demo](./example-app/src/views/ComposableDemo.vue))
- **Advanced Features** - Sorting, context menus, persistence

### Run Examples

```bash
cd example-app
npm install
npm run dev
```

## Troubleshooting

### Tab titles not updating

**Problem**: Tab title doesn't change when component state updates.

**Solution**: Ensure you're using reactive refs or computed properties:

```vue
<!-- ✅ Correct -->
<script setup>
const routeTabTitle = ref('My Page')  // Reactive
</script>

<!-- ❌ Wrong -->
<script setup>
const routeTabTitle = 'My Page'  // Plain string - won't update
</script>
```

### Transitions not working

**Problem**: Page transitions don't show when refreshing tabs.

**Solution**: Make sure you're not using a custom default slot that overrides transitions. Remove the custom slot or include transition components:

```vue
<!-- ✅ Default behavior with transitions -->
<router-tab page-transition="router-tab-fade" />

<!-- ❌ Custom slot without transitions -->
<router-tab>
  <template #default="{ Component }">
    <component :is="Component" />  <!-- No transition! -->
  </template>
</router-tab>

<!-- ✅ Custom slot with transitions -->
<router-tab>
  <template #default="{ Component }">
    <transition name="router-tab-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </template>
</router-tab>
```

### Tabs not persisting on refresh

**Problem**: Tabs are lost when refreshing the browser.

**Solution**: Add the `cookie-key` prop:

```vue
<router-tab cookie-key="my-app-tabs" />
```

Check that cookies are enabled in the browser and not being blocked.

### KeepAlive not working

**Problem**: Component state is lost when switching tabs.

**Solution**: Ensure `:keep-alive="true"` (default) and components are properly keyed:

```ts
// In router config
meta: {
  keepAlive: true,  // Enable for this route
  key: 'fullPath'   // Unique key per instance
}
```

### TypeScript errors

**Problem**: TypeScript shows errors for router tab properties.

**Solution**: Import types and use them:

```ts
import type { TabRecord, RouterTabsOptions } from 'vue3-router-tab'

const options: RouterTabsOptions = {
  keepAlive: true,
  maxAlive: 10
}
```

## Browser Support

- Chrome/Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- Modern mobile browsers

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

---

Made with ❤️ by the Vue community
