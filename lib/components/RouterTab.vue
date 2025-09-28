<template>
  <div class="router-tab">
    <header class="router-tab__header">
      <div class="router-tab__slot-start">
        <slot name="start" />
      </div>

      <div class="router-tab__scroll">
        <transition-group
          tag="ul"
          class="router-tab__nav"
          v-bind="tabTransitionProps"
        >
          <li
            v-for="tab in tabs"
            :key="tab.id"
            :class="buildTabClass(tab)"
            @click="activate(tab)"
            @auxclick.middle.prevent="close(tab)"
            @contextmenu.prevent="showContextMenu(tab, $event)"
          >
            <span class="router-tab__item-title" :title="tabTitle(tab)">
              <i v-if="tab.icon" :class="['router-tab__item-icon', tab.icon]" />
              {{ tabTitle(tab) }}
            </span>
            <a
              v-if="isClosable(tab)"
              class="router-tab__item-close"
              @click.stop="close(tab)"
            >
          </a>
          </li>
        </transition-group>
      </div>

      <div class="router-tab__slot-end">
        <slot name="end" />
      </div>
    </header>

    <div class="router-tab__container">
      <RouterView v-slot="{ Component, route }">
        <transition
          v-bind="pageTransitionProps"
          appear
        >
          <KeepAlive
            v-if="controller.options.keepAlive"
            :include="includeKeys"
            :max="controller.options.maxAlive || undefined"
          >
            <component
              v-if="!isRefreshing(route)"
              :is="Component"
              :key="controller.getRouteKey(route)"
              class="router-tab-page"
            />
          </KeepAlive>
        </transition>

        <transition
          v-bind="pageTransitionProps"
          appear
        >
          <component
            v-if="!controller.options.keepAlive || isRefreshing(route)"
            :is="Component"
            :key="controller.getRouteKey(route) + (isRefreshing(route) ? '-refresh' : '')"
            class="router-tab-page"
          />
        </transition>
      </RouterView>
    </div>

    <div
      v-if="context.visible && context.target"
      class="router-tab__contextmenu"
      :style="{ left: context.position.x + 'px', top: context.position.y + 'px' }"
    >
      <a
        v-for="item in menuItems"
        :key="item.id"
        class="router-tab__contextmenu-item"
        :aria-disabled="item.disabled"
        @click.prevent="handleMenuAction(item)"
      >
        {{ item.label }}
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  watch
} from 'vue'
import { RouterView, type RouteLocationNormalizedLoaded } from 'vue-router'
import type { PropType } from 'vue'
import { createRouterTabs } from '../core/createRouterTabs'
import type {
  RouterTabsMenuConfig,
  RouterTabsMenuContext,
  RouterTabsMenuItem,
  RouterTabsMenuPreset,
  RouterTabsOptions,
  RouterTabsSnapshot,
  TabInput,
  TabRecord,
  TransitionLike
} from '../core/types'
import { getTransOpt } from '../util/index'
import { routerTabsKey } from '../constants'

const hasSessionStorage = typeof window !== 'undefined' && 'sessionStorage' in window

interface ResolvedMenuItem {
  id: string
  label: string
  disabled: boolean
  action: () => Promise<void>
}

export default defineComponent({
  name: 'RouterTab',
  components: { RouterView },
  props: {
    tabs: {
      type: Array as PropType<TabInput[]>,
      default: () => []
    },
    keepAlive: {
      type: Boolean,
      default: true
    },
    maxAlive: {
      type: Number,
      default: 0
    },
    keepLastTab: {
      type: Boolean,
      default: true
    },
    append: {
      type: String as PropType<'last' | 'next'>,
      default: 'last'
    },
    defaultPage: {
      type: [String, Object] as PropType<RouterTabsOptions['defaultRoute']>,
      default: '/'
    },
    tabTransition: {
      type: [String, Object] as PropType<TransitionLike>,
      default: 'router-tab-zoom'
    },
    pageTransition: {
      type: [String, Object] as PropType<TransitionLike>,
      default: () => ({ name: 'router-tab-swap', mode: 'out-in' })
    },
    contextmenu: {
      type: [Boolean, Array] as PropType<boolean | RouterTabsMenuConfig[]>,
      default: true
    },
    storage: {
      type: [Boolean, String],
      default: false
    }
  },
  setup(props) {
    const instance = getCurrentInstance()
    if (!instance) {
      throw new Error('[RouterTab] component must be used within a Vue application context.')
    }

    const router = instance.appContext.app.config.globalProperties.$router
    if (!router) {
      throw new Error('[RouterTab] Vue Router is required. Make sure to call app.use(router) before RouterTab.')
    }

    const controller = createRouterTabs(router, {
      initialTabs: props.tabs,
      keepAlive: props.keepAlive,
      maxAlive: props.maxAlive,
      keepLastTab: props.keepLastTab,
      appendPosition: props.append,
      defaultRoute: props.defaultPage
    })

    provide(routerTabsKey, controller)
    instance.appContext.config.globalProperties.$tabs = controller

    const tabTransitionProps = computed(() => getTransOpt(props.tabTransition))
    const pageTransitionProps = computed(() => getTransOpt(props.pageTransition))

    const context = reactive({
      visible: false,
      target: null as TabRecord | null,
      position: { x: 0, y: 0 }
    })

    const storageKey = computed(() => {
      if (!props.storage || !hasSessionStorage) return null
      if (typeof props.storage === 'string') return props.storage
      const base = router.options?.history?.base ?? ''
      return `router-tabs:${base || 'default'}`
    })

    let restoring = Boolean(storageKey.value)

    type MenuConfig = RouterTabsMenuConfig
    type MenuActionContext = RouterTabsMenuContext
    type CustomMenuOption = RouterTabsMenuItem
    type MenuPresetId = RouterTabsMenuPreset

    type BuiltinMenuItem = {
      label: string
      handler: (ctx: MenuActionContext) => void | Promise<void>
      enable?: (ctx: MenuActionContext) => boolean
      visible?: (ctx: MenuActionContext) => boolean
    }

    const defaultMenuOrder: MenuPresetId[] = [
      'refresh',
      'refreshAll',
      'close',
      'closeLefts',
      'closeRights',
      'closeOthers'
    ]

    function getTabIndex(id: string) {
      return controller.tabs.findIndex(item => item.id === id)
    }

    function getLeftTabs(tab: TabRecord) {
      const idx = getTabIndex(tab.id)
      return idx > 0 ? controller.tabs.slice(0, idx) : []
    }

    function getRightTabs(tab: TabRecord) {
      const idx = getTabIndex(tab.id)
      return idx > -1 ? controller.tabs.slice(idx + 1) : []
    }

    function getOtherTabs(tab: TabRecord) {
      return controller.tabs.filter(item => item.id !== tab.id)
    }

    async function closeTabsGroup(tabsToClose: TabRecord[], reference: TabRecord) {
      const closable = tabsToClose.filter(item => item.closable !== false)
      if (!closable.length) return

      for (const tab of closable) {
        if (controller.activeId.value === tab.id) {
          await controller.closeTab(tab.id, { redirect: reference.to, force: true })
        } else {
          await controller.removeTab(tab.id, { force: true })
        }
      }

      if (controller.activeId.value !== reference.id) {
        await controller.openTab(reference.to, true, false)
      }
    }

    const builtinMenu: Record<MenuPresetId, BuiltinMenuItem> = {
      refresh: {
        label: 'Refresh',
        handler: async ({ target }) => {
          await controller.refreshTab(target.id, true)
        }
      },
      refreshAll: {
        label: 'Refresh All',
        handler: async () => {
          await controller.refreshAll(true)
        }
      },
      close: {
        label: 'Close',
        handler: async ({ target }) => {
          await controller.closeTab(target.id)
        },
        enable: ({ target }) => isClosable(target)
      },
      closeLefts: {
        label: 'Close to the Left',
        handler: async ({ target }) => {
          await closeTabsGroup(getLeftTabs(target), target)
        },
        enable: ({ target }) => getLeftTabs(target).some(tab => tab.closable !== false)
      },
      closeRights: {
        label: 'Close to the Right',
        handler: async ({ target }) => {
          await closeTabsGroup(getRightTabs(target), target)
        },
        enable: ({ target }) => getRightTabs(target).some(tab => tab.closable !== false)
      },
      closeOthers: {
        label: 'Close Others',
        handler: async ({ target }) => {
          await closeTabsGroup(getOtherTabs(target), target)
        },
        enable: ({ target }) => getOtherTabs(target).some(tab => tab.closable !== false)
      }
    }

    function hideContextMenu() {
      context.visible = false
      context.target = null
    }

    function showContextMenu(tab: TabRecord, event: MouseEvent) {
      if (!props.contextmenu) return
      context.visible = true
      context.target = tab
      context.position.x = event.clientX
      context.position.y = event.clientY

      document.addEventListener('click', hideContextMenu, { once: true })
    }

    function normalizeMenuItem(raw: MenuConfig, ctx: MenuActionContext): ResolvedMenuItem | null {
      const config: CustomMenuOption = typeof raw === 'string' ? { id: raw } : raw
      const builtin = builtinMenu[config.id as MenuPresetId]

      const label = config.label ?? builtin?.label ?? String(config.id)

      const visibleResolver = config.visible ?? builtin?.visible ?? true
      const isVisible = typeof visibleResolver === 'function' ? visibleResolver(ctx) : visibleResolver !== false
      if (!isVisible) return null

      const enableResolver = config.enable ?? builtin?.enable ?? true
      const isEnabled = typeof enableResolver === 'function' ? enableResolver(ctx) : enableResolver !== false

      const sourceHandler = config.handler ?? builtin?.handler
      if (!sourceHandler) return null

      const action = async () => {
        await Promise.resolve(sourceHandler(ctx))
      }

      return {
        id: String(config.id),
        label,
        disabled: !isEnabled,
        action
      }
    }

    const menuItems = computed<ResolvedMenuItem[]>(() => {
      if (!context.visible || !context.target || props.contextmenu === false) return []
      const source = Array.isArray(props.contextmenu) ? props.contextmenu : defaultMenuOrder
      const ctx: MenuActionContext = { target: context.target, controller }
      return source
        .map(item => normalizeMenuItem(item, ctx))
        .filter((item): item is ResolvedMenuItem => !!item)
    })

    async function handleMenuAction(item: ResolvedMenuItem) {
      if (item.disabled) return
      hideContextMenu()
      await item.action()
    }

    function tabTitle(tab: TabRecord) {
      if (typeof tab.title === 'string') return tab.title
      if (Array.isArray(tab.title) && tab.title.length) return String(tab.title[0])
      return tab.fullPath
    }

    function isClosable(tab: TabRecord) {
      if (tab.closable === false) return false
      if (controller.options.keepLastTab && controller.tabs.length <= 1) return false
      return true
    }

    async function close(tab: TabRecord) {
      await controller.closeTab(tab.id)
    }

    function activate(tab: TabRecord) {
      if (controller.activeId.value === tab.id) return
      controller.openTab(tab.to, false)
    }

    function buildTabClass(tab: TabRecord) {
      return [
        'router-tab__item',
        {
          'is-active': controller.activeId.value === tab.id,
          'is-closable': isClosable(tab)
        },
        tab.tabClass
      ]
    }

    function isRefreshing(route: RouteLocationNormalizedLoaded) {
      return controller.refreshingKey.value === controller.getRouteKey(route)
    }

    async function restoreTabsFromStorage() {
      const key = storageKey.value
      if (!key || !hasSessionStorage) return
      const raw = window.sessionStorage.getItem(key)
      if (!raw) return

      try {
        const parsed = JSON.parse(raw) as RouterTabsSnapshot
        if (!parsed || !Array.isArray(parsed.tabs)) return
        restoring = true
        await controller.hydrate(parsed)
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[RouterTabs] Failed to restore tabs from storage', error)
        }
      } finally {
        restoring = false
        persistTabsSnapshot()
      }
    }

    function persistTabsSnapshot() {
      const key = storageKey.value
      if (!key || !hasSessionStorage || restoring) return
      try {
        const snapshot = controller.snapshot()
        window.sessionStorage.setItem(key, JSON.stringify(snapshot))
      } catch (error) {
        if (import.meta.env?.DEV) {
          console.warn('[RouterTabs] Failed to persist tabs snapshot', error)
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', hideContextMenu)
      restoreTabsFromStorage()
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', hideContextMenu)
      instance.appContext.config.globalProperties.$tabs = null
      persistTabsSnapshot()
    })

    watch(
      () => props.keepAlive,
      value => {
        controller.options.keepAlive = value
      }
    )

    watch(
      () => controller.activeId.value,
      () => hideContextMenu()
    )

    watch(
      () => props.contextmenu,
      value => {
        if (!value) hideContextMenu()
      }
    )

    watch(
      () => menuItems.value.length,
      length => {
        if (context.visible && length === 0) {
          hideContextMenu()
        }
      }
    )

    watch(
      () => ({
        key: storageKey.value,
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
        persistTabsSnapshot()
      },
      { deep: true }
    )

    const includeKeys = controller.includeKeys

    return {
      controller,
      tabs: controller.tabs,
      includeKeys,
      tabTransitionProps,
      pageTransitionProps,
      buildTabClass,
      activate,
      close,
      context,
      menuItems,
      handleMenuAction,
      showContextMenu,
      hideContextMenu,
      tabTitle,
      isClosable,
      isRefreshing
    }
  }
})
</script>
