import type { App, Plugin } from 'vue'
import RouterTab from './components/RouterTab.vue'
import RouterTabsComponent from './components/RouterTabs.vue'
import { routerTabsKey } from './constants'
import useRouterTabs from './useRouterTabs'
import { useRouterTabsPersistence } from './persistence'
import {
  initRouterTabsTheme,
  setRouterTabsPrimary,
  setRouterTabsTheme
} from './theme'

import type { RouterTabsContext } from './core/types'
import type { RouterTabsThemeOptions } from './theme'

export type {
  TabRecord,
  TabInput,
  RouterTabsOptions,
  CloseTabOptions,
  RouterTabsPersistenceOptions
} from './core/types'

export type { RouterTabsThemeOptions } from './theme'

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

export {
  routerTabsKey,
  useRouterTabs,
  useRouterTabsPersistence,
  RouterTab,
  RouterTabsComponent as RouterTabs,
  initRouterTabsTheme,
  setRouterTabsTheme,
  setRouterTabsPrimary
}

export {
  useReactiveTab,
  useLoadingTab,
  useNotificationTab,
  useStatusTab
} from './useReactiveTab'

export type {
  ReactiveTabState,
  ReactiveTabReturn
} from './useReactiveTab'

import './scss/index.scss'

let installed = false

const plugin: Plugin = {
  install(app: App, options?: RouterTabsPluginOptions) {
    if (installed) return
    installed = true

    const {
      initTheme = true,
      themeOptions,
      componentName = RouterTab.name || 'RouterTab',
      tabsComponentName = RouterTabsComponent.name || 'RouterTabs'
    } = options ?? {}

    if (initTheme) {
      initRouterTabsTheme(themeOptions ?? {})
    }

    app.component(componentName, RouterTab)
    app.component(tabsComponentName, RouterTabsComponent)

    if (tabsComponentName.toLowerCase() !== 'router-tabs') {
      app.component('router-tabs', RouterTabsComponent)
    }

    Object.defineProperty(app.config.globalProperties, '$tabs', {
      configurable: true,
      enumerable: false,
      get() {
        return app._context.provides[routerTabsKey as unknown as symbol] as RouterTabsContext | null
      },
      set(value: RouterTabsContext | null) {
        if (value) {
          app.provide(routerTabsKey, value)
        }
      }
    })
  }
}

export default plugin
