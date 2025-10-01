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

export type {
  TabRecord,
  TabInput,
  RouterTabsOptions,
  CloseTabOptions,
  RouterTabsPersistenceOptions
} from './core/types'

export type { RouterTabsThemeOptions } from './theme'

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

import "./scss/index.scss";

const plugin: Plugin = {
  install(app: App) {
    if ((plugin as any)._installed) return
      ; (plugin as any)._installed = true

    initRouterTabsTheme()

    const componentName = RouterTab.name || 'RouterTab'
    const persistenceComponentName = RouterTabsComponent.name || 'RouterTabs'

    app.component(componentName, RouterTab)
    app.component(persistenceComponentName, RouterTabsComponent)

    if (persistenceComponentName !== 'router-tabs') {
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
