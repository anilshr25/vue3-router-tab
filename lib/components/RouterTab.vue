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
            v-for="(tab, index) in tabs"
            :key="tab.id"
            :class="buildTabClass(tab)"
            :data-title="getTabTitle(tab)"
            :draggable="sortable"
            @click="activate(tab)"
            @auxclick.middle.prevent="close(tab)"
            @contextmenu.prevent="showContextMenu(tab, $event)"
            @dragstart="onDragStart(tab, index, $event)"
            @dragover="onDragOver(index, $event)"
            @dragenter="onDragEnter(index)"
            @dragleave="onDragLeave"
            @drop="onDrop(index, $event)"
            @dragend="onDragEnd"
          >
            <i v-if="tab.icon" :class="['router-tab__item-icon', tab.icon]" />
            <span class="router-tab__item-title" :title="getTabTitle(tab)">
              {{ getTabTitle(tab) }}
            </span>
            <a
              v-if="isClosable(tab)"
              class="router-tab__item-close"
              @click.stop="close(tab)"
            />
          </li>
        </transition-group>
      </div>

      <div class="router-tab__slot-end">
        <slot name="end" />
      </div>
    </header>

    <div class="router-tab__container">
      <RouterView v-slot="routerSlot">
        <template v-if="hasCustomSlot">
          <slot v-bind="{ ...routerSlot, controller }" />
        </template>
        <template v-else>
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
                v-if="!isRefreshing(routerSlot.route)"
                :is="routerSlot.Component"
                :key="controller.getRouteKey(routerSlot.route)"
                class="router-tab-page"
              />
            </KeepAlive>
          </transition>

          <transition
            v-bind="pageTransitionProps"
            appear
          >
            <component
              v-if="!controller.options.keepAlive || isRefreshing(routerSlot.route)"
              :is="routerSlot.Component"
              :key="controller.getRouteKey(routerSlot.route) + (isRefreshing(routerSlot.route) ? '-refresh' : '')"
              class="router-tab-page"
            />
          </transition>
        </template>
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
  RouterTabsPersistenceOptions,
  TabInput,
  TabRecord,
  TransitionLike
} from '../core/types'
import { getTransOpt } from '../util/index'
import { routerTabsKey, routerTabsCookie } from '../constants'
import { useRouterTabsPersistence } from '../persistence'
import { useTitleManager, type TitleConfig } from '../titleManager'

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
    cookieKey: {
      type: String,
      default: routerTabsCookie
    },
    persistence: {
      type: Object as PropType<RouterTabsPersistenceOptions | null>,
      default: null
    },
    sortable: {
      type: Boolean,
      default: true
    },
    titleResolver: {
      type: Function as PropType<(tab: TabRecord) => string>,
      default: null
    },
    untitledText: {
      type: String,
      default: 'Untitled'
    },
    titleConfig: {
      type: Object as PropType<TitleConfig>,
      default: () => ({})
    },
    enableTitleReplacement: {
      type: Boolean,
      default: true
    }
  },
  emits: ['tab-sort', 'tab-sorted'],
  setup(props, { emit }) {
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
      defaultRoute: props.defaultPage,
    })

    provide(routerTabsKey, controller)
    instance.appContext.config.globalProperties.$tabs = controller

    const hasCustomSlot = computed(() => Boolean(instance?.slots?.default))

    // Initialize title manager with merged config
    const titleManagerConfig: TitleConfig = {
      placeholder: props.untitledText,
      ...props.titleConfig
    }
    const titleManagerInstance = useTitleManager(titleManagerConfig)

    if (props.cookieKey !== null || props.persistence) {
      const options: RouterTabsPersistenceOptions = {
        ...(props.persistence ?? {})
      }
      if (props.cookieKey !== null) {
        options.cookieKey = props.cookieKey || routerTabsCookie
      } else if (!options.cookieKey) {
        options.cookieKey = routerTabsCookie
      }
      useRouterTabsPersistence(options)
    }

    const tabTransitionProps = computed(() => getTransOpt(props.tabTransition))
    const pageTransitionProps = computed(() => getTransOpt(props.pageTransition))

    const context = reactive({
      visible: false,
      target: null as TabRecord | null,
      position: { x: 0, y: 0 }
    })

    // Drag and drop state
    const dragState = reactive({
      dragging: false,
      dragIndex: -1,
      dropIndex: -1,
      dragTab: null as TabRecord | null
    })

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

    function getTabTitle(tab: TabRecord): string {
      // Use custom title resolver if provided
      if (props.titleResolver) {
        const resolvedTitle = props.titleResolver(tab)
        return props.enableTitleReplacement 
          ? titleManagerInstance.processTitle(resolvedTitle)
          : resolvedTitle
      }

      // Use title manager for comprehensive title processing
      if (props.enableTitleReplacement) {
        return titleManagerInstance.processTitle(tab.title)
      }

      // Fallback to legacy behavior
      if (typeof tab.title === 'string' && tab.title.trim()) return tab.title
      if (Array.isArray(tab.title) && tab.title.length && String(tab.title[0]).trim()) return String(tab.title[0])
      return props.untitledText
    }

    /**
     * Replace tab title with new title if it matches specific patterns
     */
    function replaceTabTitle(tabId: string, newTitle: string, matchPatterns?: string[]): boolean {
      const tab = controller.tabs.find(t => t.id === tabId)
      if (!tab) return false

      const currentTitle = tab.title
      const updatedTitle = titleManagerInstance.replaceTitle(currentTitle, newTitle, matchPatterns)
      
      // Update the tab title if replacement occurred
      if (updatedTitle !== titleManagerInstance.processTitle(currentTitle)) {
        tab.title = updatedTitle
        return true
      }
      
      return false
    }

    /**
     * Update tab title directly
     */
    function updateTabTitle(tabId: string, newTitle: string): boolean {
      const tab = controller.tabs.find(t => t.id === tabId)
      if (!tab) return false

      tab.title = props.enableTitleReplacement 
        ? titleManagerInstance.processTitle(newTitle)
        : newTitle
      return true
    }

    /**
     * Add custom title replacement rule
     */
    function addTitleReplacement(from: string, to: string): void {
      titleManagerInstance.addReplacement(from, to)
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
          'is-closable': isClosable(tab),
          'is-dragging': dragState.dragging && dragState.dragTab?.id === tab.id,
          'is-drag-over': dragState.dropIndex === getTabIndex(tab.id)
        },
        tab.tabClass
      ]
    }

    function isRefreshing(route: RouteLocationNormalizedLoaded) {
      return controller.refreshingKey.value === controller.getRouteKey(route)
    }

    // Drag and drop handlers
    function onDragStart(tab: TabRecord, index: number, event: DragEvent) {
      if (!props.sortable) return
      
      dragState.dragging = true
      dragState.dragIndex = index
      dragState.dragTab = tab
      
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', tab.id)
      }

      emit('tab-sort', { tab, index })
    }

    function onDragOver(index: number, event: DragEvent) {
      if (!props.sortable || !dragState.dragging) return
      event.preventDefault()
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }

    function onDragEnter(index: number) {
      if (!props.sortable || !dragState.dragging) return
      dragState.dropIndex = index
    }

    function onDragLeave() {
      if (!props.sortable || !dragState.dragging) return
      // Don't reset dropIndex immediately to prevent flicker
    }

    function onDrop(index: number, event: DragEvent) {
      if (!props.sortable || !dragState.dragging) return
      
      event.preventDefault()
      
      if (dragState.dragIndex !== -1 && dragState.dragIndex !== index) {
        const movedTab = controller.tabs.splice(dragState.dragIndex, 1)[0]
        controller.tabs.splice(index, 0, movedTab)
        
        emit('tab-sorted', {
          tab: movedTab,
          fromIndex: dragState.dragIndex,
          toIndex: index
        })
      }

      onDragEnd()
    }

    function onDragEnd() {
      dragState.dragging = false
      dragState.dragIndex = -1
      dragState.dropIndex = -1
      dragState.dragTab = null
    }

    onMounted(() => {
      document.addEventListener('keydown', hideContextMenu)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', hideContextMenu)
      instance.appContext.config.globalProperties.$tabs = null
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
      getTabTitle,
      replaceTabTitle,
      updateTabTitle,
      addTitleReplacement,
      isClosable,
      isRefreshing,
      hasCustomSlot,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
      onDragEnd
    }
  }
})
</script>