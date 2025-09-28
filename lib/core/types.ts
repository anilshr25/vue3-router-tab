import type { ComputedRef, Ref } from 'vue'
import type { RouteLocationRaw, RouteLocationNormalizedLoaded } from 'vue-router'

export type TransitionLike =
  | string
  | {
      name?: string
      mode?: 'in-out' | 'out-in' | 'default'
      appear?: boolean
      [key: string]: unknown
    }

export interface TabMeta {
  title?: string | [string, ...unknown[]]
  tips?: string | [string, ...unknown[]]
  icon?: string
  closable?: boolean
  tabClass?: string | string[] | Record<string, boolean>
  target?: string
  href?: string
}

export interface TabInput extends Partial<TabMeta> {
  to: RouteLocationRaw
  id?: string
}

export interface TabRecord extends TabMeta {
  id: string
  to: RouteLocationRaw
  fullPath: string
  matched: RouteLocationNormalizedLoaded
  alive: boolean
  reusable: boolean
}

export interface ContextMenuItem {
  id: string
  title: string
  icon?: string
  tips?: string
  visible?: boolean | ((ctx: ContextMenuContext) => boolean)
  enable?: boolean | ((ctx: ContextMenuContext) => boolean)
  handler: (ctx: ContextMenuContext) => void | Promise<void>
}

export interface ContextMenuContext {
  target: TabRecord
  closeTab: (id: string, options?: CloseTabOptions) => void
  closeOthers: (id: string) => void
  closeLefts: (id: string) => void
  closeRights: (id: string) => void
  closeAll: () => void
  refreshTab: (id: string) => void
}

export interface CloseTabOptions {
  redirect?: RouteLocationRaw | null
  force?: boolean
  refresh?: boolean | 'sameTab'
}

export interface RouterTabsOptions {
  initialTabs?: TabInput[]
  keepAlive?: boolean
  maxAlive?: number
  keepLastTab?: boolean
  appendPosition?: 'last' | 'next'
  defaultRoute?: RouteLocationRaw
}

export interface RouteMatchResult {
  key: string
  fullPath: string
  alive: boolean
  reusable: boolean
  matched: RouteLocationNormalizedLoaded
}

export interface RouterTabsContext {
  options: Required<RouterTabsOptions>
  tabs: TabRecord[]
  activeId: Ref<string | null>
  current: Ref<TabRecord | undefined>
  includeKeys: ComputedRef<string[]>
  openTab: (target: RouteLocationRaw, replace?: boolean, refresh?: boolean | 'sameTab') => Promise<void>
  closeTab: (id?: string, options?: CloseTabOptions) => Promise<void>
  removeTab: (id: string, opts?: { redirect?: RouteLocationRaw | null; force?: boolean }) => Promise<void>
  refreshTab: (id?: string, force?: boolean) => Promise<void>
  refreshAll: (force?: boolean) => Promise<void>
  reset: (route?: RouteLocationRaw) => Promise<void>
  reload: () => Promise<void>
  getRouteKey: (route: RouteLocationNormalizedLoaded | RouteLocationRaw) => string
  matchRoute: (route: RouteLocationNormalizedLoaded | RouteLocationRaw) => RouteMatchResult
  refreshingKey: Ref<string | null>
}
