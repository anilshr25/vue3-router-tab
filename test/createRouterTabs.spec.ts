import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import {
  createMemoryHistory,
  createRouter,
  type RouteRecordRaw
} from 'vue-router'
import { createRouterTabs } from '../lib/core/createRouterTabs'

const Page = defineComponent({
  name: 'TestPage',
  template: '<div />'
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
    path: '/settings',
    component: Page,
    meta: { title: 'Settings' }
  },
  {
    path: '/reports/:id',
    component: Page,
    meta: { title: 'Report', key: 'path' }
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

describe('createRouterTabs', () => {
  it('creates an initial tab from the current route', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router)

    expect(tabs.tabs).toHaveLength(1)
    expect(tabs.current.value?.fullPath).toBe('/')
    expect(tabs.current.value?.title).toBe('Home')
    expect(tabs.current.value?.closable).toBe(false)
  })

  it('opens routes and keeps the active tab in sync', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router)

    await tabs.openTab('/users')
    await nextTick()

    expect(router.currentRoute.value.fullPath).toBe('/users')
    expect(tabs.tabs.map(tab => tab.fullPath)).toEqual(['/', '/users'])
    expect(tabs.current.value?.title).toBe('Users')
  })

  it('redirects to the nearest remaining tab when closing the active tab', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router)

    await tabs.openTab('/users')
    await tabs.openTab('/settings')
    await nextTick()

    await tabs.closeTab(tabs.activeId.value)
    await nextTick()

    expect(router.currentRoute.value.fullPath).toBe('/users')
    expect(tabs.tabs.map(tab => tab.fullPath)).toEqual(['/', '/users'])
    expect(tabs.current.value?.fullPath).toBe('/users')
  })

  it('refreshes a tab with a new KeepAlive cache key', async () => {
    const router = await createReadyRouter('/users')
    const tabs = createRouterTabs(router)

    expect(tabs.getCacheKeys()).toEqual(['/users::0'])

    await tabs.refreshTab(tabs.activeId.value ?? undefined, true)

    expect(tabs.current.value?.renderKey).toBe(1)
    expect(tabs.getCacheKeys()).toEqual(['/users::1'])
  })

  it('enforces maxAlive without evicting the active tab', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router, { maxAlive: 1 })

    await tabs.openTab('/users')
    await nextTick()
    await tabs.openTab('/settings')
    await nextTick()

    expect(tabs.current.value?.fullPath).toBe('/settings')
    expect(tabs.getCacheKeys()).toEqual(['/settings::0'])
    expect(tabs.tabs.find(tab => tab.fullPath === '/settings')?.alive).toBe(true)
  })

  it('can reuse a path key across parameterized routes', async () => {
    const router = await createReadyRouter('/reports/1?tab=a')
    const tabs = createRouterTabs(router)

    await tabs.openTab('/reports/1?tab=b')
    await nextTick()

    expect(tabs.tabs).toHaveLength(1)
    expect(tabs.current.value?.to).toBe('/reports/1?tab=b')
    expect(tabs.current.value?.id).toBe('/reports/1')
  })
})
