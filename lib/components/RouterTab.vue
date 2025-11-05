<template>
  <div class="router-tab">
    <header class="router-tab__header">
      <div
        class="router-tab__slot-start"
        :class="{ 'has-content': hasStartSlot }"
      >
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
            <span class="router-tab__item-title" :title="getReactiveTabTitle(tab)">
              {{ getReactiveTabTitle(tab) }}
            </span>
            <a
              v-if="isClosable(tab)"
              class="router-tab__item-close"
              @click.stop="close(tab)"
            />
          </li>
        </transition-group>
      </div>

      <div
        class="router-tab__slot-end"
        :class="{ 'has-content': hasEndSlot }"
      >
        <slot name="end" />
      </div>
    </header>

    <div class="router-tab__container">
      <RouterView v-slot="routerSlot">
        <template v-if="hasCustomSlot">
          <slot
            v-bind="{
              ...routerSlot,
              controller,
              // Expose a ref binder so custom slots can keep reactivity
              pageRef: (el: any) => handleComponentRef(el, controller.getRouteKey(routerSlot.route))
            }"
          />
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
                :key="getComponentCacheKey(routerSlot.route)"
                :ref="(el: any) => handleComponentRef(el, controller.getRouteKey(routerSlot.route))"
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
              :key="getRefreshComponentKey(routerSlot.route)"
              :ref="(el: any) => handleComponentRef(el, controller.getRouteKey(routerSlot.route))"
              class="router-tab-page"
            />
          </transition>
        </template>
      </RouterView>
    </div>

    <div
      v-if="context.visible && context.target"
      ref="menuRef"
      class="router-tab__contextmenu"
      role="menu"
      @keydown="onMenuKeydown"
      :style="{ left: context.position.x + 'px', top: context.position.y + 'px' }"
    >
      <a
        v-for="(item, index) in menuItems"
        :key="item.id"
        role="menuitem"
        :class="['router-tab__contextmenu-item', { 'is-focused': index === highlightedIndex }]"
        :aria-disabled="item.disabled"
        :disabled="item.disabled"
        :tabindex="item.disabled ? -1 : index === highlightedIndex ? 0 : -1"
        :ref="el => setMenuItemRef(el, index)"
        @mouseenter="!item.disabled && highlightMenuIndex(index)"
        @click="handleMenuAction(item)"
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
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  reactive,
  ref,
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
    const hasStartSlot = computed(() => Boolean(instance?.slots?.start))
    const hasEndSlot = computed(() => Boolean(instance?.slots?.end))

    // Force reactivity by creating a trigger ref
    const tabUpdateTrigger = ref(0)
    
    // Reactive tab titles that update when tabs change
    const reactiveTabTitles = computed(() => {
      // Access the trigger to ensure reactivity
      tabUpdateTrigger.value
      const titles: Record<string, string> = {}
      controller.tabs.forEach(tab => {
        // Use the tab's current title (which is updated by watchers)
        const currentTitle = typeof tab.title === 'string' ? tab.title : String(tab.title || getTabTitle(tab))
        titles[tab.id] = currentTitle
      })
      return titles
    })

    // Function to trigger reactivity updates
    function triggerTabUpdate() {
      tabUpdateTrigger.value++
    }

    // Reactive tab update system
    const componentInstances = new Map<string, any>()
    const watchedProperties = new Map<string, (() => void)[]>()

    // Watch for component instance changes and set up reactivity
    function setupComponentWatching(routeKey: string, componentInstance: any) {
      if (!componentInstance || componentInstances.has(routeKey)) return
      
      // setup watchers for exposed reactive tab props
      
      componentInstances.set(routeKey, componentInstance)
      
      // Find the tab for this route
      const tab = controller.tabs.find(t => controller.getRouteKey(t.to) === routeKey)
      if (!tab) return
      
      const unwatchers: (() => void)[] = []
      
      // Watch routeTabTitle for title updates
      if (componentInstance.routeTabTitle !== undefined) {
        const unwatchTitle = watch(
          () => {
            // Handle both ref values and regular values
            const titleValue = componentInstance.routeTabTitle
            return titleValue && typeof titleValue === 'object' && 'value' in titleValue ? titleValue.value : titleValue
          },
          (newTitle) => {
            if (newTitle !== undefined && newTitle !== null) {
              const titleString = String(newTitle)
              tab.title = titleString
              triggerTabUpdate() // Trigger reactivity
            }
          },
          { immediate: true }
        )
        unwatchers.push(unwatchTitle)
      }
      
      // Watch routeTabIcon for icon updates
      if (componentInstance.routeTabIcon !== undefined) {
        const unwatchIcon = watch(
          () => {
            const iconValue = componentInstance.routeTabIcon
            return iconValue && typeof iconValue === 'object' && 'value' in iconValue ? iconValue.value : iconValue
          },
          (newIcon) => {
            if (newIcon !== undefined && newIcon !== null) {
              tab.icon = String(newIcon)
              triggerTabUpdate() // Trigger reactivity
            }
          },
          { immediate: true }
        )
        unwatchers.push(unwatchIcon)
      }
      
      // Watch routeTabClosable for closable state updates
      if (componentInstance.routeTabClosable !== undefined) {
        const unwatchClosable = watch(
          () => {
            const closableValue = componentInstance.routeTabClosable
            return closableValue && typeof closableValue === 'object' && 'value' in closableValue ? closableValue.value : closableValue
          },
          (newClosable) => {
            if (newClosable !== undefined && newClosable !== null) {
              tab.closable = Boolean(newClosable)
              triggerTabUpdate() // Trigger reactivity
            }
          },
          { immediate: true }
        )
        unwatchers.push(unwatchClosable)
      }
      
      // Watch routeTabMeta for general meta updates
      if (componentInstance.routeTabMeta !== undefined) {
        const unwatchMeta = watch(
          () => {
            const metaValue = componentInstance.routeTabMeta
            return metaValue && typeof metaValue === 'object' && 'value' in metaValue ? metaValue.value : metaValue
          },
          (newMeta) => {
            if (newMeta && typeof newMeta === 'object') {
              Object.assign(tab, newMeta)
              triggerTabUpdate() // Trigger reactivity
            }
          },
          { immediate: true, deep: true }
        )
        unwatchers.push(unwatchMeta)
      }
      
      watchedProperties.set(routeKey, unwatchers)
    }
    
    // Cleanup watchers when component is unmounted
    function cleanupComponentWatching(routeKey: string) {
      const unwatchers = watchedProperties.get(routeKey)
      if (unwatchers) {
        unwatchers.forEach(unwatcher => unwatcher())
        watchedProperties.delete(routeKey)
      }
      componentInstances.delete(routeKey)
    }
    
    // Handle component ref changes
    function handleComponentRef(el: any, routeKey: string) {
      if (el) {
        // Component mounted - set up watching
        // Check if properties are exposed directly on el (Vue 3 with defineExpose)
        if (el.routeTabTitle !== undefined || el.routeTabIcon !== undefined || el.routeTabClosable !== undefined) {
          setupComponentWatching(routeKey, el)
        } else if (el.$ && (el.$.routeTabTitle !== undefined || el.$.routeTabIcon !== undefined || el.$.routeTabClosable !== undefined)) {
          setupComponentWatching(routeKey, el.$)
        }
      } else if (el === null) {
        // Component unmounted - cleanup
        cleanupComponentWatching(routeKey)
      }
    }

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

    const menuRef = ref<HTMLElement | null>(null)
    const menuItemRefs = ref<(HTMLElement | null)[]>([])
    const highlightedIndex = ref(-1)

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
      highlightedIndex.value = -1
      menuItemRefs.value = []
    }

    function showContextMenu(tab: TabRecord, event: MouseEvent) {
      if (!props.contextmenu) return
      context.visible = true
      context.target = tab
      context.position.x = event.clientX
      context.position.y = event.clientY

      document.addEventListener('click', hideContextMenu, { once: true })
      nextTick(() => {
        adjustMenuPosition()
      })
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

    function adjustMenuPosition() {
      const menuEl = menuRef.value
      if (!menuEl) return
      const margin = 8
      const { innerWidth, innerHeight } = window
      const rect = menuEl.getBoundingClientRect()

      let nextX = context.position.x
      let nextY = context.position.y

      if (rect.right > innerWidth - margin) {
        nextX = Math.max(margin, innerWidth - rect.width - margin)
      }

      if (rect.bottom > innerHeight - margin) {
        nextY = Math.max(margin, innerHeight - rect.height - margin)
      }

      if (nextX !== context.position.x || nextY !== context.position.y) {
        context.position.x = nextX
        context.position.y = nextY
      }
    }

    function setMenuItemRef(el: Element | null, index: number) {
      menuItemRefs.value[index] = (el as HTMLElement) ?? null
    }

    function focusMenuItem(index: number) {
      if (index < 0) return
      const el = menuItemRefs.value[index]
      el?.focus({ preventScroll: true })
    }

    function findNextEnabledIndex(start: number, step: 1 | -1, items = menuItems.value): number {
      if (!items.length) return -1
      const total = items.length
      let idx = start

      for (let i = 0; i < total; i++) {
        idx = (idx + step + total) % total
        if (!items[idx].disabled) return idx
      }

      return -1
    }

    function highlightMenuIndex(index: number) {
      highlightedIndex.value = index
      if (index < 0) return
      nextTick(() => focusMenuItem(index))
    }

    function moveHighlight(step: 1 | -1) {
      const nextIndex = findNextEnabledIndex(highlightedIndex.value, step)
      if (nextIndex !== -1) {
        highlightMenuIndex(nextIndex)
      }
    }

    function onMenuKeydown(event: KeyboardEvent) {
      if (!context.visible) return

      const key = event.key
      const items = menuItems.value
      if (!items.length) return

      if (key === 'Tab') {
        hideContextMenu()
        return
      }

      const handledKeys = [
        'ArrowDown',
        'ArrowUp',
        'ArrowRight',
        'ArrowLeft',
        'Home',
        'End',
        'Enter',
        ' ',
        'Spacebar',
        'Escape'
      ]

      if (!handledKeys.includes(key)) return

      event.preventDefault()

      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
          moveHighlight(1)
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          moveHighlight(-1)
          break
        case 'Home':
          highlightMenuIndex(findNextEnabledIndex(-1, 1))
          break
        case 'End':
          highlightMenuIndex(findNextEnabledIndex(items.length, -1))
          break
        case 'Enter':
        case ' ':
        case 'Spacebar': {
          const index = highlightedIndex.value
          if (index > -1) {
            const item = items[index]
            if (!item.disabled) {
              handleMenuAction(item)
            }
          }
          break
        }
        case 'Escape':
          hideContextMenu()
          break
      }
    }

    async function handleMenuAction(item: ResolvedMenuItem) {
      if (item.disabled) return
      hideContextMenu()
      await item.action()
    }

    function getTabTitle(tab: TabRecord): string {
      if (typeof tab.title === 'string' && tab.title.trim()) return tab.title
      if (Array.isArray(tab.title) && tab.title.length && String(tab.title[0]).trim()) return String(tab.title[0])
      return 'Untitled'
    }
    
    // Reactive function to get tab title
    function getReactiveTabTitle(tab: TabRecord): string {
      // Access the reactive titles to ensure reactivity
      const reactiveTitles = reactiveTabTitles.value
      return reactiveTitles[tab.id] || getTabTitle(tab)
    }

    function getComponentCacheKey(route: RouteLocationNormalizedLoaded): string {
      const routeKey = controller.getRouteKey(route)
      const tab = controller.tabs.find(item => item.id === routeKey)
      const renderKey = tab?.renderKey ?? 0
      return `${routeKey}::${renderKey}`
    }

    function getRefreshComponentKey(route: RouteLocationNormalizedLoaded): string {
      return `${getComponentCacheKey(route)}::refresh`
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
      if (tab.href && typeof window !== 'undefined') {
        if (tab.target && tab.target !== '_self') {
          window.open(tab.href as string, tab.target)
        } else {
          window.location.assign(tab.href as string)
        }
        return
      }

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
      
      // Cleanup all component watchers
      watchedProperties.forEach((unwatchers) => {
        unwatchers.forEach(unwatcher => unwatcher())
      })
      watchedProperties.clear()
      componentInstances.clear()
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

    watch(menuItems, items => {
      menuItemRefs.value = new Array(items.length).fill(null)
      if (!context.visible) return
      const first = findNextEnabledIndex(-1, 1, items)
      highlightMenuIndex(first)
    })

    watch(
      () => context.visible,
      visible => {
        if (!visible) {
          highlightedIndex.value = -1
          menuItemRefs.value = []
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
      isClosable,
      isRefreshing,
      hasCustomSlot,
      hasStartSlot,
      hasEndSlot,
      onDragStart,
      onDragOver,
      onDragEnter,
      onDragLeave,
      onDrop,
      onDragEnd,
      setupComponentWatching,
      cleanupComponentWatching,
      handleComponentRef,
      getReactiveTabTitle,
      getComponentCacheKey,
      getRefreshComponentKey,
      triggerTabUpdate,
      menuRef,
      highlightedIndex,
      setMenuItemRef,
      onMenuKeydown,
      highlightMenuIndex
    }
  }
})
</script>
