import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useTabNavigation } from '../lib/useTabNavigation'
import type { RouterTabsContext, TabRecord } from '../lib/core/types'

function createTab(id: string): TabRecord {
  return {
    id,
    to: `/${id}`,
    fullPath: `/${id}`,
    matched: {} as TabRecord['matched'],
    alive: true,
    reusable: false,
    renderKey: 0
  }
}

describe('useTabNavigation', () => {
  it('opens the next tab with ArrowRight', async () => {
    const tabs = [createTab('a'), createTab('b')]
    const controller = {
      tabs,
      activeId: ref('a'),
      openTab: vi.fn(async (target) => {
        const tab = tabs.find(item => item.to === target)
        if (tab) controller.activeId.value = tab.id
      })
    } as unknown as RouterTabsContext

    const navigation = useTabNavigation(controller, vi.fn(), () => true)
    const event = { key: 'ArrowRight', preventDefault: vi.fn() } as unknown as KeyboardEvent

    await navigation.onTabKeydown(tabs[0], 0, event)
    await nextTick()

    expect(event.preventDefault).toHaveBeenCalled()
    expect(controller.openTab).toHaveBeenCalledWith('/b', false)
    expect(controller.activeId.value).toBe('b')
  })

  it('closes a closable tab with Delete', async () => {
    const tabs = [createTab('a')]
    const controller = {
      tabs,
      activeId: ref('a'),
      openTab: vi.fn()
    } as unknown as RouterTabsContext
    const close = vi.fn(async () => {})
    const navigation = useTabNavigation(controller, close, () => true)
    const event = { key: 'Delete', preventDefault: vi.fn() } as unknown as KeyboardEvent

    await navigation.onTabKeydown(tabs[0], 0, event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(close).toHaveBeenCalledWith(tabs[0])
  })
})
