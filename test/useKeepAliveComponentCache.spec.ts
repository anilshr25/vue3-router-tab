import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { useKeepAliveComponentCache } from '../lib/useKeepAliveComponentCache'
import type { RouterTabsContext, TabRecord } from '../lib/core/types'

function createTab(id: string, renderKey = 0): TabRecord {
  return {
    id,
    to: id,
    fullPath: id,
    matched: {} as TabRecord['matched'],
    alive: true,
    reusable: false,
    renderKey
  }
}

function createController(tabs: TabRecord[]): RouterTabsContext {
  return {
    tabs,
    getRouteKey: (route) => typeof route === 'string' ? route : route.fullPath
  } as RouterTabsContext
}

describe('useKeepAliveComponentCache', () => {
  it('creates stable named wrappers per cache key', () => {
    const source = defineComponent({ name: 'SourcePage', template: '<div />' })
    const cache = useKeepAliveComponentCache(createController([createTab('/users')]))

    const first = cache.getNamedComponent(source, '/users::0')
    const second = cache.getNamedComponent(source, '/users::0')
    const refreshed = cache.getNamedComponent(source, '/users::1')

    expect(first).toBe(second)
    expect(refreshed).not.toBe(first)
    expect((first as { name?: string }).name).toBe('/users::0')
    expect((refreshed as { name?: string }).name).toBe('/users::1')
  })

  it('builds cache keys from route keys and tab render keys', () => {
    const cache = useKeepAliveComponentCache(createController([createTab('/users', 2)]))

    expect(cache.getComponentCacheKey({
      fullPath: '/users',
      matched: []
    } as unknown as TabRecord['matched'])).toBe('/users::2')

    expect(cache.getComponentCacheKey({
      fullPath: '/missing',
      matched: []
    } as unknown as TabRecord['matched'])).toBe('/missing::0')
  })
})
