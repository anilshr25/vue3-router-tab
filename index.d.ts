import type { App, Plugin, DefineComponent, PropType } from 'vue'
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
  RouterTabsSnapshotTab,
  RouterTabsPersistenceOptions
} from './lib/core/types'
import type { ColorStyle, RouterTabsThemeOptions } from './lib/theme'

export interface RouterTabsPluginOptions {
  /**
   * Whether to initialise the theme system automatically during install.
   * Defaults to `true`.
   */
  initTheme?: boolean
  /**
   * Theme options passed to `initRouterTabsTheme` when `initTheme` is enabled.
   */
  themeOptions?: RouterTabsThemeOptions
  /**
   * Global component name used when registering `RouterTab`.
   * Defaults to the component's `name` option or `"RouterTab"`.
   */
  componentName?: string
  /**
   * Global component name used when registering `RouterTabs`.
   * Defaults to the component's `name` option or `"RouterTabs"`.
   */
  tabsComponentName?: string
}

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
  RouterTabsSnapshotTab,
  RouterTabsPersistenceOptions,
  RouterTabsThemeOptions
}

export declare const routerTabsKey: import('vue').InjectionKey<RouterTabsContext>

export declare function useRouterTabs(options?: { optional?: boolean }): RouterTabsContext | null

export declare function useRouterTabsPersistence(options?: RouterTabsPersistenceOptions): { hydrating: import('vue').Ref<boolean> }

export declare function initRouterTabsTheme(options?: RouterTabsThemeOptions): void
export declare function setRouterTabsTheme(style: 'light' | 'dark' | 'system', options?: RouterTabsThemeOptions): void
export declare function setRouterTabsPrimary(color: ColorStyle, options?: RouterTabsThemeOptions): void

export declare const RouterTabs: DefineComponent<RouterTabsPersistenceOptions, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<RouterTabsPersistenceOptions>, {}>

export declare const RouterTab: DefineComponent<{
  tabs: {
    type: PropType<TabInput[]>
    default: () => TabInput[]
  }
  keepAlive: BooleanConstructor
  maxAlive: NumberConstructor
  keepLastTab: BooleanConstructor
  append: PropType<'last' | 'next'>
  defaultPage: PropType<RouteLocationRaw>
  tabTransition: PropType<import('./lib/core/types').TransitionLike>
  pageTransition: PropType<import('./lib/core/types').TransitionLike>
  contextmenu: PropType<boolean | RouterTabsMenuConfig[]>
  cookieKey: StringConstructor
  persistence: PropType<RouterTabsPersistenceOptions | null>
}, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, Record<string, any>, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
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
  contextmenu: boolean | RouterTabsMenuConfig[]
  cookieKey: string
  persistence: RouterTabsPersistenceOptions | null
}>

export interface RouterTabPlugin {
  install: (app: App, options?: RouterTabsPluginOptions) => void
}

declare const plugin: RouterTabPlugin

export default plugin
