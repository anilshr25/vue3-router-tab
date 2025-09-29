const STYLE_KEY = 'tab-theme-style'
const PRIMARY_KEY = 'tab-theme-primary-color'
const DEFAULT_STYLE: 'light' | 'dark' | 'system' = 'system'
const DEFAULT_PRIMARY = '#635bff'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

let mediaListener: ((event: MediaQueryListEvent) => void) | null = null

export interface RouterTabsThemeOptions {
  styleKey?: string
  primaryKey?: string
  defaultStyle?: 'light' | 'dark' | 'system'
  defaultPrimary?: string
}

function applyPrimary(color: string) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--theme-primary', color)
  document.documentElement.style.setProperty('--router-tab-primary', color)
}

function applyStyle(style: 'light' | 'dark' | 'system') {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const media = window.matchMedia(MEDIA_QUERY)

  const updateFromSystem = () => {
    root.dataset.theme = media.matches ? 'dark' : 'light'
  }

  if (mediaListener) {
    media.removeEventListener('change', mediaListener)
    mediaListener = null
  }

  if (style === 'system') {
    updateFromSystem()
    mediaListener = () => updateFromSystem()
    media.addEventListener('change', mediaListener)
  } else {
    root.dataset.theme = style
  }
}

export function initRouterTabsTheme(options: RouterTabsThemeOptions = {}) {
  if (typeof window === 'undefined') return

  const {
    styleKey = STYLE_KEY,
    primaryKey = PRIMARY_KEY,
    defaultStyle = DEFAULT_STYLE,
    defaultPrimary = DEFAULT_PRIMARY
  } = options

  const storedStyle = (window.localStorage.getItem(styleKey) as 'light' | 'dark' | 'system' | null) ?? defaultStyle
  const storedPrimary = window.localStorage.getItem(primaryKey) ?? defaultPrimary

  applyStyle(storedStyle)
  applyPrimary(storedPrimary)
}

export function setRouterTabsTheme(style: 'light' | 'dark' | 'system', options?: RouterTabsThemeOptions) {
  if (typeof window === 'undefined') return
  const key = options?.styleKey ?? STYLE_KEY
  window.localStorage.setItem(key, style)
  applyStyle(style)
}

export function setRouterTabsPrimary(color: string, options?: RouterTabsThemeOptions) {
  if (typeof window === 'undefined') return
  const key = options?.primaryKey ?? PRIMARY_KEY
  window.localStorage.setItem(key, color)
  applyPrimary(color)
}
