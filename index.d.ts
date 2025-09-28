import type { App, Plugin } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  TabRecord,
  TabInput,
  RouterTabsOptions,
  CloseTabOptions,
  RouterTabsContext
} from './lib/core/types'

export type { TabRecord, TabInput, RouterTabsOptions, CloseTabOptions, RouterTabsContext }

export declare const routerTabsKey: import('vue').InjectionKey<RouterTabsContext>

export declare function useRouterTabs(options?: { optional?: boolean }): RouterTabsContext | null

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
}, any, any, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, Record<string, any>, string, import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps, Readonly<{
  tabs?: TabInput[] | undefined
  keepAlive?: boolean | undefined
  maxAlive?: number | undefined
  keepLastTab?: boolean | undefined
  append?: 'last' | 'next' | undefined
  defaultPage?: RouteLocationRaw | undefined
  tabTransition?: import('./lib/core/types').TransitionLike | undefined
  pageTransition?: import('./lib/core/types').TransitionLike | undefined
}> & {
  tabs?: TabInput[] | undefined
  keepAlive?: boolean | undefined
  maxAlive?: number | undefined
  keepLastTab?: boolean | undefined
  append?: 'last' | 'next' | undefined
  defaultPage?: RouteLocationRaw | undefined
  tabTransition?: import('./lib/core/types').TransitionLike | undefined
  pageTransition?: import('./lib/core/types').TransitionLike | undefined
}, {
  tabs: TabInput[]
  keepAlive: boolean
  maxAlive: number
  keepLastTab: boolean
  append: 'last' | 'next'
  defaultPage: RouteLocationRaw
  tabTransition: import('./lib/core/types').TransitionLike
  pageTransition: import('./lib/core/types').TransitionLike
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