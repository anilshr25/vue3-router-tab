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

async function createReadyRouter(initialPath = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  await router.push(initialPath)
  await router.isReady()

  return router
}

async function mountRouterTab(initialPath = '/') {
  const router = await createReadyRouter(initialPath)
  const wrapper = mount(RouterTab, {
    attachTo: document.body,
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


it('supports keyboard menu navigation and restores focus on Escape', async () => {
  const { wrapper } = await mountRouterTab('/')
  const tab = wrapper.findAll('[role="tab"]')[1]
  await tab.trigger('keydown', { key: 'F10', shiftKey: true })
  await flushPromises()
  const menu = wrapper.get('[role="menu"]')
  expect(menu.isVisible()).toBe(true)
  expect(wrapper.findAll('[role="menuitem"]')[0].attributes('tabindex')).toBe('0')
  expect(document.activeElement).toBe(wrapper.findAll('[role="menuitem"]')[0].element)
  await menu.trigger('keydown', { key: 'ArrowDown' })
  await flushPromises()
  expect(menu.isVisible()).toBe(true)
  expect(wrapper.findAll('[role="menuitem"]')[1].attributes('tabindex')).toBe('0')
  await menu.trigger('keydown', { key: 'Escape' })
  await flushPromises()
  expect(wrapper.get('[role="menu"]').attributes('style')).toContain('display: none')
  expect(document.activeElement).toBe(tab.element)
  wrapper.unmount()
})

it('does not close a protected tab with the middle mouse button', async () => {
  const { wrapper } = await mountRouterTab('/')
  await wrapper.findAll('[role="tab"]')[0].trigger('auxclick', { button: 1 })
  await flushPromises()
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
  wrapper.unmount()
})


it('remounts the page on refresh when KeepAlive is disabled', async () => {
  const { wrapper } = await mountRouterTab('/users')
  await wrapper.setProps({ keepAlive: false })
  await flushPromises()
  const previousPage = wrapper.get('.router-tab-page').element
  const controller = (wrapper.vm as unknown as { controller: { reload: () => Promise<void> } }).controller
  await controller.reload()
  await flushPromises()
  expect(wrapper.get('.router-tab-page').element).not.toBe(previousPage)
  wrapper.unmount()
})

it('handles persistence read and write failures without blocking the page', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const router = await createReadyRouter('/')
  const storage: RouterTabsPersistenceStorage = {
    read: () => { throw new Error('Storage denied') },
    write: () => { throw new Error('Quota exceeded') },
    remove: vi.fn()
  }
  const persisted = mount(RouterTab, {
    props: { persistence: { storage } },
    global: { plugins: [router] }
  })
  await flushPromises()
  expect(persisted.find('.router-tab-page').exists()).toBe(true)
  await router.push('/users')
  await flushPromises()
  expect(persisted.find('.router-tab-page').exists()).toBe(true)
  expect(warn).toHaveBeenCalledWith('[RouterTabs] Failed to restore persisted tabs', expect.any(Error))
  expect(warn).toHaveBeenCalledWith('[RouterTabs] Failed to persist tabs', expect.any(Error))
  persisted.unmount()
  warn.mockRestore()
})

it('flushes the latest pending persistence write on unmount', async () => {
  vi.useFakeTimers()
  const router = await createReadyRouter('/')
  const write = vi.fn()
  const persisted = mount(RouterTab, {
    props: { persistence: { storage: { read: () => null, write, remove: vi.fn() }, debounceMs: 100 } },
    global: { plugins: [router] }
  })
  await flushPromises()
  write.mockClear()
  await router.push('/users')
  await flushPromises()
  expect(write).not.toHaveBeenCalled()
  persisted.unmount()
  expect(write).toHaveBeenCalledTimes(1)
  expect(JSON.parse(write.mock.calls[0][1]).active).toBe('/users')
  vi.advanceTimersByTime(100)
  expect(write).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})

it('keeps the routed page selected after persisted navigation is blocked', async () => {
  const router = await createReadyRouter('/')
  router.beforeEach(to => to.path !== '/users')
  const persisted = mount(RouterTab, {
    props: { persistence: { storage: {
      read: () => JSON.stringify({ tabs: [{ to: '/users' }], active: '/users' }),
      write: vi.fn(), remove: vi.fn()
    } } },
    global: { plugins: [router] }
  })
  await flushPromises()
  const active = persisted.findAll('[role="tab"]').find(tab => tab.attributes('aria-selected') === 'true')
  expect(active?.text()).toBe('Home')
  expect(router.currentRoute.value.fullPath).toBe('/')
  persisted.unmount()
})

it('renders tuple titles using their display text', async () => {
  const router = await createReadyRouter('/')
  router.currentRoute.value.meta.title = ['Home', 'translation-argument']
  const tuple = mount(RouterTab, { props: { cookieKey: null }, global: { plugins: [router] } })
  await flushPromises()
  expect(tuple.get('.router-tab__item-title').text()).toBe('Home')
  tuple.unmount()
  router.currentRoute.value.meta.title = 'Home'
})
