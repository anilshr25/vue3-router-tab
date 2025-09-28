import { defineStore, type StoreDefinition } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRouterTabs } from './useRouterTabs'
import type { RouterTabsSnapshot } from './core/types'

export interface RouterTabsPiniaOptions {
  /** Pinia store id. Defaults to 'routerTabs'. */
  storeId?: string
  /** Storage key used when persisting snapshots. Defaults to 'router-tabs:persistent'. */
  storageKey?: string
  /** Custom storage implementation (e.g. localStorage, sessionStorage). Defaults to window.localStorage. */
  storage?: Storage | null
  /** Fallback route to open when no snapshot exists. Defaults to RouterTab's default route. */
  fallbackRoute?: RouteLocationRaw
  /** Provide a custom store definition if you want to control persistence yourself. */
  store?: StoreDefinition<'routerTabs', { snapshot: RouterTabsSnapshot | null }, {}, { load(): void; setSnapshot(snapshot: RouterTabsSnapshot | null): void; clear(): void }>
}

const defaultStorageKey = 'router-tabs:persistent'

function resolveStorage(storage?: Storage | null): Storage | null {
  if (typeof window === 'undefined') return null
  if (storage === undefined) return window.localStorage ?? null
  return storage
}

function createDefaultStore(options: RouterTabsPiniaOptions) {
  const storage = resolveStorage(options.storage)
  const key = options.storageKey ?? defaultStorageKey

  return defineStore(options.storeId ?? 'routerTabs', {
    state: () => ({
      snapshot: null as RouterTabsSnapshot | null
    }),
    actions: {
      load() {
        if (!storage || this.snapshot) return
        try {
          const raw = storage.getItem(key)
          if (raw) {
            this.snapshot = JSON.parse(raw)
          }
        } catch (error) {
          if (import.meta.env?.DEV) {
            console.warn('[RouterTabs] Failed to load snapshot from storage', error)
          }
        }
      },
      setSnapshot(snapshot: RouterTabsSnapshot | null) {
        this.snapshot = snapshot
        if (!storage) return

        try {
          if (snapshot && snapshot.tabs.length) {
            storage.setItem(key, JSON.stringify(snapshot))
          } else {
            storage.removeItem(key)
          }
        } catch (error) {
          if (import.meta.env?.DEV) {
            console.warn('[RouterTabs] Failed to persist snapshot to storage', error)
          }
        }
      },
      clear() {
        this.setSnapshot(null)
      }
    }
  })
}

/**
 * Synchronise RouterTab state with a Pinia store so tab snapshots persist across reloads.
 *
 * ```ts
 * const store = useRouterTabsPiniaPersistence()
 * ```
 */
export function useRouterTabsPiniaPersistence(options: RouterTabsPiniaOptions = {}) {
  const controller = useRouterTabs({ optional: true })
  if (!controller) {
    throw new Error('[RouterTabs] Pinia helper must be used inside <router-tab>.')
  }
  const Store = options.store ?? createDefaultStore(options)
  const store = Store()
  const hydrating = ref(false)

  onMounted(async () => {
    store.load()
    const snapshot = store.snapshot
    if (snapshot && snapshot.tabs?.length) {
      try {
        hydrating.value = true
        await controller.hydrate(snapshot)
      } finally {
        hydrating.value = false
      }
    } else {
      try {
        hydrating.value = true
        const fallback = options.fallbackRoute ?? controller.options.defaultRoute
        await controller.reset(fallback)
      } finally {
        hydrating.value = false
      }
    }

    store.setSnapshot(controller.snapshot())
  })

  watch(
    () => ({
      tabs: controller.tabs.map(tab => ({
        to: tab.to,
        title: tab.title,
        tips: tab.tips,
        icon: tab.icon,
        tabClass: tab.tabClass,
        closable: tab.closable
      })),
      active: controller.activeId.value
    }),
    () => {
      if (hydrating.value) return
      store.setSnapshot(controller.snapshot())
    },
    { deep: true }
  )

  return store
}
