import type { App, Plugin } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  TabRecord,
  TabInput,
  RouterTabsOptions,
  CloseTabOptions,
  RouterTabsContext,
  RouterTabsMenuConfig,
  RouterTabsMenuItem,
  RouterTabsMenuPreset,
  RouterTabsSnapshot,
  RouterTabsSnapshotTab
} from './lib/core/types'

export type {
  TabRecord,
  TabInput,
  RouterTabsOptions,
  CloseTabOptions,
  RouterTabsContext,
  RouterTabsMenuConfig,
  RouterTabsMenuItem,
  RouterTabsMenuPreset,
  RouterTabsSnapshot,
  RouterTabsSnapshotTab
}

export declare const routerTabsKey: import('vue').InjectionKey<RouterTabsContext>

export declare function useRouterTabs(options?: { optional?: boolean }): RouterTabsContext | null

export interface RouterTabsPersistenceOptions {
  cookieKey?: string
  expiresInDays?: number
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  serialize?: (snapshot: RouterTabsSnapshot | null) => string
  deserialize?: (value: string | null) => RouterTabsSnapshot | null
  fallbackRoute?: import('vue-router').RouteLocationRaw
}

export declare function useRouterTabsPersistence(options?: RouterTabsPersistenceOptions): void

export declare const RouterTabs: import('vue').DefineComponent<RouterTabsPersistenceOptions, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<RouterTabsPersistenceOptions>, {}>

export declare const RouterTab: import('vue').DefineComponent<{
  tabs: {
    type: import('vue').PropType<TabInput[]>
    default: () => TabInput[]
  }
  keepAlive: {
    type: BooleanConstructor
    default: boolean
  }
  maxAlive: {
    type: NumberConstructor
    default: number
  }
  keepLastTab: {
    type: BooleanConstructor
    default: boolean
  }
  append: {
    type: import('vue').PropType<'last' | 'next'>
    default: 'last' | 'next'
  }
  defaultPage: {
    type: import('vue').PropType<RouteLocationRaw>
    default: RouteLocationRaw
  }
  tabTransition: {
    type: import('vue').PropType<import('./lib/core/types').TransitionLike>
    default: string | import('./lib/core/types').TransitionLike
  }
  pageTransition: {
    type: import('vue').PropType<import('./lib/core/types').TransitionLike>
    default: () => import('./lib/core/types').TransitionLike
  }
  contextmenu: {
    type: import('vue').PropType<boolean | RouterTabsMenuConfig[]>
    default: true
  }
  cookieKey: {
    type: StringConstructor
    default: string | null
  }
  persistence: {
    type: import('vue').PropType<RouterTabsPersistenceOptions | null>
    default: RouterTabsPersistenceOptions | null
  }
}, any, any, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, Record<string, any>, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  tabs?: TabInput[] | undefined
  keepAlive?: boolean | undefined
  maxAlive?: number | undefined
  keepLastTab?: boolean | undefined
  append?: 'last' | 'next' | undefined
  defaultPage?: RouteLocationRaw | undefined
  tabTransition?: import('./lib/core/types').TransitionLike | undefined
  pageTransition?: import('./lib/core/types').TransitionLike | undefined
  contextmenu?: boolean | RouterTabsMenuConfig[] | undefined
  cookieKey?: string | undefined
  persistence?: RouterTabsPersistenceOptions | null | undefined
}> & {
  tabs?: TabInput[] | undefined
  keepAlive?: boolean | undefined
  maxAlive?: number | undefined
  keepLastTab?: boolean | undefined
  append?: 'last' | 'next' | undefined
  defaultPage?: RouteLocationRaw | undefined
  tabTransition?: import('./lib/core/types').TransitionLike | undefined
  pageTransition?: import('./lib/core/types').TransitionLike | undefined
  contextmenu?: boolean | RouterTabsMenuConfig[] | undefined
  cookieKey?: string | undefined
  persistence?: RouterTabsPersistenceOptions | null | undefined
}, {
  tabs: TabInput[]
  keepAlive: boolean
  maxAlive: number
  keepLastTab: boolean
  append: 'last' | 'next'
  defaultPage: RouteLocationRaw
  tabTransition: import('./lib/core/types').TransitionLike
  pageTransition: import('./lib/core/types').TransitionLike
  contextmenu: true
  cookieKey: string | null
  persistence: RouterTabsPersistenceOptions | null
}>

export interface RouterTabPlugin extends Plugin {}

declare const plugin: RouterTabPlugin

export default plugin

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $tabs: RouterTabsContext | null
  }
}
declare module './constants' {
  const value: any;
  export = value;
}
