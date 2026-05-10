import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useTabDragSort } from '../lib/useTabDragSort'
import type { TabRecord } from '../lib/core/types'

function createTab(id: string): TabRecord {
  return {
    id,
    to: `/${id}`,
    fullPath: `/${id}`,
    matched: {} as TabRecord['matched'],
    alive: true,
    reusable: false,
    renderKey: 0,
    title: id
  }
}

describe('useTabDragSort', () => {
  it('reorders tabs and emits drag events', async () => {
    const tabs = [createTab('a'), createTab('b'), createTab('c')]
    const emit = vi.fn()
    const dataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      setData: vi.fn()
    }

    const sort = useTabDragSort(tabs, () => true, emit)

    sort.onDragStart(tabs[0], 0, { dataTransfer } as unknown as DragEvent)
    sort.onDragEnter(2)
    sort.onDrop(2, {
      preventDefault: vi.fn()
    } as unknown as DragEvent)
    await nextTick()

    expect(tabs.map(tab => tab.id)).toEqual(['b', 'c', 'a'])
    expect(emit).toHaveBeenCalledWith('tab-sort', { tab: expect.objectContaining({ id: 'a' }), index: 0 })
    expect(emit).toHaveBeenCalledWith('tab-sorted', {
      tab: expect.objectContaining({ id: 'a' }),
      fromIndex: 0,
      toIndex: 2
    })
    expect(sort.dragState.dragging).toBe(false)
  })

  it('ignores drag events when sorting is disabled', () => {
    const tabs = [createTab('a'), createTab('b')]
    const emit = vi.fn()
    const sort = useTabDragSort(tabs, () => false, emit)

    sort.onDragStart(tabs[0], 0, {} as DragEvent)
    sort.onDrop(1, { preventDefault: vi.fn() } as unknown as DragEvent)

    expect(tabs.map(tab => tab.id)).toEqual(['a', 'b'])
    expect(emit).not.toHaveBeenCalled()
  })
})
