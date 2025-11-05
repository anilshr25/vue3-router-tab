import { computed, nextTick, reactive, ref, shallowRef, watch } from 'vue'
import type {
  CloseTabOptions,
  RouteMatchResult,
  RouterTabsContext,
  RouterTabsMenuPreset,
  RouterTabsOptions,
  RouterTabsSnapshot,
  RouterTabsSnapshotTab,
  TabInput,
  TabRecord
} from './types'
import type {
  Router,
  RouteLocationRaw,
  RouteLocationNormalizedLoaded,
  RouteLocation
} from 'vue-router'

function resolveOptions(options: RouterTabsOptions = {}): Required<RouterTabsOptions> {
  return {
    initialTabs: options.initialTabs ?? [],
    keepAlive: options.keepAlive ?? true,
    maxAlive: options.maxAlive ?? 0,
    keepLastTab: options.keepLastTab ?? true,
    appendPosition: options.appendPosition ?? 'last',
    defaultRoute: options.defaultRoute ?? '/'
  }
}

function resolveRoute(router: Router, location: RouteLocationRaw): RouteLocationNormalizedLoaded {
  const resolved = router.resolve(location as RouteLocation)
  if (!resolved || !resolved.matched.length) {
    throw new Error(`[RouterTabs] Unable to resolve route: ${String(location)}`)
  }
  return resolved
}

const builtinKeyResolvers: Record<string, (route: RouteLocationNormalizedLoaded) => string> = {
  path: route => route.path,
  fullpath: route => route.fullPath,
  fullname: route => route.fullPath,
  full: route => route.fullPath,
  name: route => (route.name ? String(route.name) : route.fullPath)
}

function resolveKey(route: RouteLocationNormalizedLoaded): string {
  const metaKey = route.meta?.key as RouterTabsMenuPreset | string | ((route: RouteLocationNormalizedLoaded) => string) | undefined

  if (typeof metaKey === 'function') {
    const key = metaKey(route)
    if (typeof key === 'string' && key.length) return key
  } else if (typeof metaKey === 'string' && metaKey.length) {
    const resolver = builtinKeyResolvers[metaKey.toLowerCase()]
    if (resolver) return resolver(route)
    return metaKey
  }

  return route.fullPath
}

function resolveAlive(route: RouteLocationNormalizedLoaded, fallback: boolean): boolean {
  const keepAlive = route.meta?.keepAlive
  return typeof keepAlive === 'boolean' ? keepAlive : fallback
}

function resolveReusable(route: RouteLocationNormalizedLoaded, fallback: boolean): boolean {
  const reuse = route.meta?.reuse
  return typeof reuse === 'boolean' ? reuse : fallback
}

function pickMeta(route: RouteLocationNormalizedLoaded): Partial<TabRecord> {
  const meta = route.meta ?? {}
  const tab: Partial<TabRecord> = {}
  if ('title' in meta) tab.title = meta.title as TabRecord['title']
  if ('tips' in meta) tab.tips = meta.tips as TabRecord['tips']
  if ('icon' in meta) tab.icon = meta.icon as TabRecord['icon']
  if ('closable' in meta) tab.closable = meta.closable as TabRecord['closable']
  if ('tabClass' in meta) tab.tabClass = meta.tabClass as TabRecord['tabClass']
  if ('target' in meta) tab.target = meta.target as TabRecord['target']
  if ('href' in meta) tab.href = meta.href as TabRecord['href']
  return tab
}

function createTabFromRoute(
  route: RouteLocationNormalizedLoaded,
  base: Partial<TabRecord>,
  keepAliveDefault: boolean
): TabRecord {
  const meta = pickMeta(route)
  return {
    id: resolveKey(route),
    to: route.fullPath,
    fullPath: route.fullPath,
    matched: route,
    alive: resolveAlive(route, keepAliveDefault),
    reusable: resolveReusable(route, false),
    closable: meta.closable ?? true,
    renderKey: typeof base.renderKey === 'number' ? base.renderKey : 0,
    ...meta,
    ...base
  }
}

function insertTab(tabs: TabRecord[], tab: TabRecord, position: 'last' | 'next', referenceId: string | null) {
  const exists = tabs.find(item => item.id === tab.id)
  if (exists) return

  if (position === 'next' && referenceId) {
    const referenceIndex = tabs.findIndex(item => item.id === referenceId)
    if (referenceIndex !== -1) {
      tabs.splice(referenceIndex + 1, 0, tab)
      return
    }
  }

  tabs.push(tab)
}

function enforceMaxAlive(tabs: TabRecord[], maxAlive: number, activeId: string | null) {
  if (!maxAlive || maxAlive <= 0) return
  const aliveTabs = tabs.filter(tab => tab.alive)
  while (aliveTabs.length > maxAlive) {
    const candidate = aliveTabs.shift()
    if (!candidate || candidate.id === activeId) continue
    const idx = tabs.findIndex(tab => tab.id === candidate.id)
    if (idx > -1) tabs[idx].alive = false
  }
}

function toSnapshotTab(tab: TabRecord): RouterTabsSnapshotTab {
  return {
    to: tab.to,
    title: tab.title,
    tips: tab.tips,
    icon: tab.icon,
    tabClass: tab.tabClass,
    closable: tab.closable,
    renderKey: tab.renderKey
  }
}

function fromSnapshotTab(snapshot: RouterTabsSnapshotTab): Partial<TabRecord> {
  const base: Partial<TabRecord> = {}
  if ('title' in snapshot) base.title = snapshot.title
  if ('tips' in snapshot) base.tips = snapshot.tips
  if ('icon' in snapshot) base.icon = snapshot.icon
  if ('tabClass' in snapshot) base.tabClass = snapshot.tabClass
  if ('closable' in snapshot) base.closable = snapshot.closable
  if ('renderKey' in snapshot && typeof snapshot.renderKey === 'number') {
    base.renderKey = snapshot.renderKey
  }
  return base
}

export function createRouterTabs(
  router: Router,
  optionsInput: RouterTabsOptions = {}
): RouterTabsContext {
  const options = resolveOptions(optionsInput)

  const tabs = reactive<TabRecord[]>([])
  const activeId = ref<string | null>(null)
  const current = shallowRef<TabRecord>()
  const refreshingKey = ref<string | null>(null)
  const includeKeys = computed(() =>
    tabs
      .filter(tab => tab.alive)
      .map(tab => `${tab.id}::${tab.renderKey ?? 0}`)
  )

  let isHydrating = false

  function matchRoute(target: RouteLocationNormalizedLoaded | RouteLocationRaw): RouteMatchResult {
    const route =
      typeof (target as RouteLocationNormalizedLoaded).matched === 'object'
        ? (target as RouteLocationNormalizedLoaded)
        : resolveRoute(router, target as RouteLocationRaw)

    return {
      key: resolveKey(route),
      fullPath: route.fullPath,
      alive: resolveAlive(route, options.keepAlive),
      reusable: resolveReusable(route, false),
      matched: route
    }
  }

  function ensureTab(route: RouteLocationNormalizedLoaded) {
    const key = resolveKey(route)
    let tab = tabs.find(item => item.id === key)

    if (tab) {
      tab.fullPath = route.fullPath
      tab.to = route.fullPath
      tab.matched = route
      tab.alive = resolveAlive(route, options.keepAlive)
      tab.reusable = resolveReusable(route, tab.reusable)
      // Ensure renderKey is initialized
      if (typeof tab.renderKey !== 'number') {
        tab.renderKey = 0
      }
      Object.assign(tab, pickMeta(route))
      return tab
    }

    tab = createTabFromRoute(route, {}, options.keepAlive)
    insertTab(tabs, tab, options.appendPosition, activeId.value)
    enforceMaxAlive(tabs, options.maxAlive, activeId.value)
    return tab
  }

  async function openTab(path: RouteLocationRaw, replace = false, refresh: boolean | 'sameTab' = true) {
    const target = resolveRoute(router, path)
    const targetKey = resolveKey(target)
    const sameKey = activeId.value === targetKey

    if (refresh === 'sameTab') refresh = sameKey
    if (refresh) await refreshTab(targetKey, true)

    await router[replace ? 'replace' : 'push'](target)
    if (sameKey) await reload()
  }

  function fallbackAfterClose(closedId: string): RouteLocationRaw | null {
    const idx = tabs.findIndex(item => item.id === closedId)
    if (idx === -1) return options.defaultRoute
    
    // Priority: next tab -> previous tab -> first available tab
    const nextTab = tabs[idx + 1] // Next tab (after the one being closed)
    const prevTab = tabs[idx - 1] // Previous tab
    const firstTab = tabs.find(tab => tab.id !== closedId) // First available tab (excluding the one being closed)
    
    const candidate = nextTab || prevTab || firstTab
    if (candidate) return candidate.to
    return options.defaultRoute
  }

  async function closeTab(id: string | null = activeId.value, closeOptions: CloseTabOptions = {}) {
    if (!id) return
    if (!closeOptions.force && options.keepLastTab && tabs.length === 1) {
      throw new Error('[RouterTabs] Unable to close the final tab when keepLastTab is true.')
    }

    // Calculate fallback route BEFORE removing the tab
    const isClosingActiveTab = activeId.value === id
    const shouldRedirect = isClosingActiveTab && closeOptions.redirect !== null
    const fallbackRoute = shouldRedirect ? (closeOptions.redirect ?? fallbackAfterClose(id)) : null



    await removeTab(id, { force: closeOptions.force })

    // Only skip redirect if explicitly set to null
    if (closeOptions.redirect === null) return

    if (shouldRedirect && fallbackRoute) {
      await router.replace(fallbackRoute)
    }
  }

  async function removeTab(
    id: string,
    opts: { redirect?: RouteLocationRaw | null; force?: boolean } = {}
  ) {
    const index = tabs.findIndex(item => item.id === id)
    if (index === -1) return

    tabs.splice(index, 1)

    if (refreshingKey.value === id) {
      refreshingKey.value = null
    }

    if (activeId.value === id) {
      activeId.value = null
      current.value = undefined
    }
  }

  async function refreshTab(id: string | undefined = activeId.value ?? undefined, force = false) {
    if (!id) return
    const tab = tabs.find(item => item.id === id)
    if (!tab) return

    const wasAlive = options.keepAlive && tab.alive

    // Remove from KeepAlive cache if it was alive
    if (wasAlive) {
      tab.alive = false
      await nextTick()
    }

    // Increment render key to force re-render
    tab.renderKey = (tab.renderKey ?? 0) + 1

    // Restore to KeepAlive cache
    if (wasAlive) {
      tab.alive = true
    }

    // Set refreshing state to trigger component unmount with transition
    refreshingKey.value = id
    await nextTick()
    
    // Wait for unmount transition and new component mount
    if (!force) {
      await nextTick()
    }
    
    // Clear refreshing state to show the new component
    refreshingKey.value = null
  }

  async function refreshAll(force = false) {
    for (const tab of tabs) {
      await refreshTab(tab.id, force)
    }
  }

  async function reset(route: RouteLocationRaw = options.defaultRoute) {
    tabs.splice(0, tabs.length)
    activeId.value = null
    current.value = undefined

    for (const preset of options.initialTabs) {
      const resolved = resolveRoute(router, preset.to)
      const tab = createTabFromRoute(resolved, preset, options.keepAlive)
      tabs.push(tab)
    }

    await router.replace(route)
  }

  async function reload() {
    const id = activeId.value
    if (!id) return
    await refreshTab(id, true)
  }

  function getRouteKey(route: RouteLocationNormalizedLoaded | RouteLocationRaw): string {
    if (typeof (route as RouteLocationNormalizedLoaded).matched === 'object') {
      return resolveKey(route as RouteLocationNormalizedLoaded)
    }
    return resolveKey(resolveRoute(router, route as RouteLocationRaw))
  }

  function snapshot(): RouterTabsSnapshot {
    const activeTab = tabs.find(tab => tab.id === activeId.value)
    return {
      tabs: tabs.map(toSnapshotTab),
      active: activeTab ? activeTab.to : null
    }
  }

  async function hydrate(snapshot: RouterTabsSnapshot): Promise<void> {
    isHydrating = true
    tabs.splice(0, tabs.length)
    activeId.value = null
    current.value = undefined

    const records = snapshot?.tabs ?? []

    for (const record of records) {
      try {
        const route = resolveRoute(router, record.to)
        const base = fromSnapshotTab(record)
        const tab = createTabFromRoute(route, base, options.keepAlive)
        insertTab(tabs, tab, 'last', null)
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[RouterTabs] Failed to restore tab', record, error)
        }
      }
    }

    isHydrating = false

    const target = snapshot?.active ?? records[records.length - 1]?.to ?? options.defaultRoute
    if (target) {
      try {
        await router.replace(target)
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[RouterTabs] Failed to navigate to restored route', target, error)
        }
      }
    }
  }

  watch(
    () => router.currentRoute.value,
    route => {
      if (isHydrating) return
      const tab = ensureTab(route as RouteLocationNormalizedLoaded)
      activeId.value = tab.id
      current.value = tab
      enforceMaxAlive(tabs, options.maxAlive, activeId.value)
    },
    { immediate: true }
  )

  if (options.initialTabs.length) {
    options.initialTabs.forEach(preset => {
      const route = resolveRoute(router, preset.to)
      const tab = createTabFromRoute(route, preset, options.keepAlive)
      insertTab(tabs, tab, 'last', null)
    })
  }

  return {
    options,
    tabs,
    activeId,
    current,
    includeKeys,
    refreshingKey,
    openTab,
    closeTab,
    removeTab,
    refreshTab,
    refreshAll,
    reset,
    reload,
    getRouteKey,
    matchRoute,
    snapshot,
    hydrate
  }
}
