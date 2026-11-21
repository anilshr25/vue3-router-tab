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


describe('tab lifecycle regressions', () => {
  it('respects protected tabs for close and remove unless forced', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router, { keepLastTab: false })
    await tabs.openTab('/users')
    await tabs.closeTab('/')
    await tabs.removeTab('/')
    expect(tabs.tabs.map(tab => tab.id)).toContain('/')
    await tabs.removeTab('/', { force: true })
    expect(tabs.tabs.map(tab => tab.id)).not.toContain('/')
  })

  it('keeps the active tab when a guard cancels closing navigation', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router)
    await tabs.openTab('/users')
    router.beforeEach(to => to.path === '/' ? false : true)
    await tabs.closeTab('/users')
    expect(tabs.activeId.value).toBe('/users')
    expect(tabs.current.value?.id).toBe('/users')
    expect(tabs.tabs).toHaveLength(2)
  })

  it('restores active state when resetting to the current route', async () => {
    const router = await createReadyRouter('/users')
    const tabs = createRouterTabs(router)
    await tabs.reset('/users')
    expect(tabs.activeId.value).toBe('/users')
    expect(tabs.current.value?.id).toBe('/users')
    expect(tabs.tabs).toHaveLength(1)
  })

  it('does not refresh the same tab when refresh is false and refreshes once otherwise', async () => {
    const router = await createReadyRouter('/users')
    const tabs = createRouterTabs(router)
    await tabs.openTab('/users', false, false)
    expect(tabs.current.value?.renderKey).toBe(0)
    await tabs.openTab('/users')
    expect(tabs.current.value?.renderKey).toBe(1)
  })

  it('keeps the newly active page cached when maxAlive is one', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router, { maxAlive: 1 })
    await tabs.openTab('/users')
    expect(tabs.getCacheKeys()).toEqual(['/users::0'])
  })

  it('applies cache limits to initial tabs', async () => {
    const router = await createReadyRouter('/')
    const tabs = createRouterTabs(router, {
      maxAlive: 1,
      initialTabs: [{ to: '/users' }, { to: '/settings' }]
    })
    expect(tabs.getCacheKeys()).toEqual(['/::0'])
  })
})

it('keeps active state consistent when hydration navigation is cancelled', async () => {
  const router = await createReadyRouter('/')
  const tabs = createRouterTabs(router)
  router.beforeEach(to => to.path !== '/users')
  await tabs.hydrate({ tabs: [{ to: '/users' }], active: '/users' })
  expect(router.currentRoute.value.fullPath).toBe('/')
  expect(tabs.activeId.value).toBe('/')
  expect(tabs.current.value?.fullPath).toBe('/')
})

it('deduplicates preset tabs on reset', async () => {
  const router = await createReadyRouter('/')
  const tabs = createRouterTabs(router, { initialTabs: [{ to: '/users' }, { to: '/users' }] })
  await tabs.reset('/')
  expect(tabs.tabs.filter(tab => tab.id === '/users')).toHaveLength(1)
})

it('does not cache duplicate snapshot render keys', async () => {
  const router = await createReadyRouter('/users')
  const tabs = createRouterTabs(router)
  await tabs.hydrate({ tabs: [{ to: '/users', renderKey: 1 }, { to: '/users', renderKey: 2 }], active: '/users' })
  expect(tabs.tabs).toHaveLength(1)
  expect(tabs.getCacheKeys()).toEqual(['/users::1'])
})

it('preserves existing tabs and cache when reset navigation is blocked', async () => {
  const router = await createReadyRouter('/')
  const tabs = createRouterTabs(router)
  await tabs.openTab('/users')
  const before = tabs.snapshot()
  const cache = tabs.getCacheKeys()
  router.beforeEach(to => to.path !== '/settings')
  await tabs.reset('/settings')
  expect(tabs.snapshot()).toEqual(before)
  expect(tabs.getCacheKeys()).toEqual(cache)
})

it('preserves existing tabs when resetting to an invalid destination', async () => {
  const router = await createReadyRouter('/users')
  const tabs = createRouterTabs(router)
  const before = tabs.snapshot()
  await expect(tabs.reset({ name: 'missing-route' })).rejects.toThrow()
  expect(tabs.snapshot()).toEqual(before)
})
