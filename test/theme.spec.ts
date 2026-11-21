// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { initRouterTabsTheme, setRouterTabsTheme } from '../lib/theme'

afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); vi.unstubAllGlobals() })

it('updates inline palette values on explicit and system theme changes', () => {
  let listener: (() => void) | undefined
  const media = {
    matches: false,
    addEventListener: vi.fn((_event: string, callback: () => void) => { listener = callback }),
    removeEventListener: vi.fn()
  }
  vi.stubGlobal('matchMedia', () => media)
  initRouterTabsTheme()
  expect(document.documentElement.style.getPropertyValue('--router-tab-background')).toBe('#ffffff')
  media.matches = true
  listener?.()
  expect(document.documentElement.dataset.theme).toBe('dark')
  expect(document.documentElement.style.getPropertyValue('--router-tab-background')).toBe('#0f172a')
  setRouterTabsTheme('light')
  expect(document.documentElement.style.getPropertyValue('--router-tab-background')).toBe('#ffffff')
  setRouterTabsTheme('dark')
  expect(document.documentElement.style.getPropertyValue('--router-tab-background')).toBe('#0f172a')
})

it('preserves a custom palette when switching themes', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  localStorage.setItem('custom-palette', JSON.stringify({ primary: '#123456' }))
  initRouterTabsTheme({ primaryKey: 'custom-palette' })
  setRouterTabsTheme('dark')
  expect(document.documentElement.style.getPropertyValue('--router-tab-primary')).toBe('#123456')
  expect(document.documentElement.style.getPropertyValue('--router-tab-background')).toBe('#0f172a')
})

it('applies themes when browser storage is denied', () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }))
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded') })
  expect(() => initRouterTabsTheme()).not.toThrow()
  expect(() => setRouterTabsTheme('dark')).not.toThrow()
  expect(document.documentElement.style.getPropertyValue('--router-tab-background')).toBe('#0f172a')
})
