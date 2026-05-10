// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  type RouteRecordRaw
} from 'vue-router'
import RouterTab from '../lib/components/RouterTab.vue'
import type { RouterTabsPersistenceStorage } from '../lib/core/types'

const Page = defineComponent({
  name: 'TestPage',
  template: '<main>Page</main>'
})

const ReactiveTitlePage = defineComponent({
  name: 'ReactiveTitlePage',
  setup() {
    const routeTabTitle = ref('Dynamic title')
    return { routeTabTitle }
  },
  template: '<main>Reactive</main>'
})

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Page,
    meta: { title: 'Home', closable: false }
  },
  {
    path: '/users',
    component: Page,
    meta: { title: 'Users' }
  },
  {
    path: '/reactive',
    component: ReactiveTitlePage,
    meta: { title: 'Fallback' }
  }
]

async function mountRouterTab(initialPath = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  await router.push(initialPath)
  await router.isReady()

  const wrapper = mount(RouterTab, {
    props: {
      tabs: [{ to: '/users' }],
      keepLastTab: false,
      cookieKey: null
    },
    global: {
      plugins: [router]
    }
  })

  await nextTick()

  return { router, wrapper }
}

describe('RouterTab accessibility', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders tabs with ARIA state and keyboard navigation', async () => {
    const { router, wrapper } = await mountRouterTab('/')

    const tablist = wrapper.get('[role="tablist"]')
    expect(tablist.exists()).toBe(true)

    let tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[0].attributes('tabindex')).toBe('0')
    expect(tabs[1].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('tabindex')).toBe('-1')

    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    await flushPromises()
    await nextTick()

    expect(router.currentRoute.value.fullPath).toBe('/users')

    tabs = wrapper.findAll('[role="tab"]')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
    expect(tabs[1].attributes('tabindex')).toBe('0')
  })

  it('uses a labelled button for closing tabs', async () => {
    const { wrapper } = await mountRouterTab('/users')

    const closeButton = wrapper.get('.router-tab__item-close')
    expect(closeButton.element.tagName).toBe('BUTTON')
    expect(closeButton.attributes('type')).toBe('button')
    expect(closeButton.attributes('aria-label')).toBe('Close Users')
  })

  it('opens the built-in context menu from a tab', async () => {
    const { wrapper } = await mountRouterTab('/')
    const usersTab = wrapper.findAll('[role="tab"]')[1]

    await usersTab.trigger('contextmenu', { clientX: 16, clientY: 20 })
    await flushPromises()
    await nextTick()

    const menu = wrapper.get('[role="menu"]')
    expect(menu.isVisible()).toBe(true)

    const items = wrapper.findAll('[role="menuitem"]')
    expect(items.map(item => item.text())).toContain('Refresh')
    expect(items.map(item => item.text())).toContain('Close Others')
    expect(items[0].element.tagName).toBe('BUTTON')
  })

  it('updates the tab title from exposed reactive route tab state', async () => {
    const { wrapper } = await mountRouterTab('/reactive')
    await flushPromises()
    await nextTick()

    expect(wrapper.find('[role="tab"]').text()).toBe('Dynamic title')
  })

  it('supports custom debounced persistence storage', async () => {
    vi.useFakeTimers()

    const write = vi.fn()
    const storage: RouterTabsPersistenceStorage = {
      read: () => null,
      write,
      remove: vi.fn()
    }

    const router = createRouter({
      history: createMemoryHistory(),
      routes
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(RouterTab, {
      props: {
        keepLastTab: false,
        persistence: {
          cookieKey: 'custom-tabs',
          storage,
          debounceMs: 50
        }
      },
      global: {
        plugins: [router]
      }
    })

    await flushPromises()
    await nextTick()

    expect(write).toHaveBeenCalledTimes(1)
    write.mockClear()

    await router.push('/users')
    await flushPromises()
    await nextTick()

    expect(write).not.toHaveBeenCalled()

    vi.advanceTimersByTime(49)
    expect(write).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(write).toHaveBeenCalledTimes(1)
    expect(write.mock.calls[0][0]).toBe('custom-tabs')

    wrapper.unmount()
  })

  it('does not clear a newer global tabs controller when an older instance unmounts', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes
    })
    await router.push('/')
    await router.isReady()

    const Parent = defineComponent({
      components: { RouterTab },
      setup() {
        const showFirst = ref(true)
        return { showFirst }
      },
      template: `
        <RouterTab v-if="showFirst" :cookie-key="null" />
        <RouterTab :cookie-key="null" />
      `
    })

    const wrapper = mount(Parent, {
      global: {
        plugins: [router]
      }
    })
    await nextTick()

    const activeController = (wrapper.vm as unknown as { $tabs: unknown }).$tabs
    expect(activeController).toBeTruthy()

    wrapper.vm.showFirst = false
    await nextTick()

    expect((wrapper.vm as unknown as { $tabs: unknown }).$tabs).toBe(activeController)
  })
})
