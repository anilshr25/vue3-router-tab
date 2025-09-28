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
      <a class="router-tab__contextmenu-item" @click="refresh(context.target)">
        Refresh
      </a>
      <a class="router-tab__contextmenu-item" @click="closeOthers(context.target)">
        Close Others
      </a>
      <a class="router-tab__contextmenu-item" @click="close(context.target)">
        Close
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, provide, reactive, watch } from 'vue'
import { RouterView, type RouteLocationNormalizedLoaded } from 'vue-router'
import type { PropType } from 'vue'
import { createRouterTabs } from '../core/createRouterTabs'
import type { RouterTabsOptions, TabInput, TabRecord, TransitionLike } from '../core/types'
import { getTransOpt } from '../util/index'
import { routerTabsKey } from '../constants'

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
      type: Boolean,
      default: true
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

    async function refresh(tab: TabRecord) {
      await controller.refreshTab(tab.id, true)
    }

    async function closeOthers(tab: TabRecord) {
      const ids = controller.tabs.filter(item => item.id !== tab.id).map(item => item.id)
      for (const id of ids) {
        await controller.removeTab(id, { force: true })
      }
      await controller.openTab(tab.to, true)
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
      refresh,
      closeOthers,
      context,
      showContextMenu,
      hideContextMenu,
      tabTitle,
      isClosable,
      isRefreshing
    }
  }
})
</script>