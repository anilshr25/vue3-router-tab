import type { App } from 'vue'
import RouterTab from './components/RouterTab.vue'
import RouterTabsPinia from './components/RouterTabsPinia.vue'
import { routerTabsKey } from './constants'
import useRouterTabs from './useRouterTabs'
import { useRouterTabsPiniaPersistence } from './pinia'

import type { RouterTabsContext } from './core/types'

export type { TabRecord, TabInput, RouterTabsOptions, CloseTabOptions } from './core/types'

export { routerTabsKey, useRouterTabs, useRouterTabsPiniaPersistence, RouterTabsPinia }

import "./scss/index.scss";

export interface RouterTabPlugin {
  install(app: App): void
}

const plugin: RouterTabPlugin = {
  install(app: App) {
    if ((plugin as any)._installed) return;
    (plugin as any)._installed = true

    app.component(RouterTab.name, RouterTab)

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

export { RouterTab }
