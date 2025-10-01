import { ref, computed, type Ref, type ComputedRef } from 'vue'

export interface ReactiveTabState {
  title?: string | Ref<string> | ComputedRef<string>
  icon?: string | Ref<string> | ComputedRef<string>
  closable?: boolean | Ref<boolean> | ComputedRef<boolean>
  meta?: any | Ref<any> | ComputedRef<any>
}

export interface ReactiveTabReturn {
  routeTabTitle: Ref<string> | ComputedRef<string>
  routeTabIcon: Ref<string> | ComputedRef<string>
  routeTabClosable: Ref<boolean> | ComputedRef<boolean>
  routeTabMeta: Ref<any> | ComputedRef<any>
  updateTitle: (title: string) => void
  updateIcon: (icon: string) => void
  updateClosable: (closable: boolean) => void
  updateMeta: (meta: any) => void
}

/**
 * Composable for managing reactive tab properties
 * RouterTab will automatically watch these properties and update the tab accordingly
 */
export function useReactiveTab(initialState: ReactiveTabState = {}): ReactiveTabReturn {
  // Create reactive references
  const tabTitle = ref(initialState.title || 'Untitled')
  const tabIcon = ref(initialState.icon || 'mdi-tab')
  const tabClosable = ref(initialState.closable !== false)
  const tabMeta = ref(initialState.meta || {})

  // Convert to computed if needed
  const routeTabTitle = typeof initialState.title === 'function' 
    ? computed(initialState.title as () => string)
    : tabTitle
    
  const routeTabIcon = typeof initialState.icon === 'function'
    ? computed(initialState.icon as () => string)
    : tabIcon
    
  const routeTabClosable = typeof initialState.closable === 'function'
    ? computed(initialState.closable as () => boolean)
    : tabClosable
    
  const routeTabMeta = typeof initialState.meta === 'function'
    ? computed(initialState.meta as () => any)
    : tabMeta

  // Update functions
  const updateTitle = (title: string) => {
    if ('value' in tabTitle) {
      tabTitle.value = title
    }
  }

  const updateIcon = (icon: string) => {
    if ('value' in tabIcon) {
      tabIcon.value = icon
    }
  }

  const updateClosable = (closable: boolean) => {
    if ('value' in tabClosable) {
      tabClosable.value = closable
    }
  }

  const updateMeta = (meta: any) => {
    if ('value' in tabMeta) {
      tabMeta.value = meta
    }
  }

  return {
    routeTabTitle,
    routeTabIcon,
    routeTabClosable,
    routeTabMeta,
    updateTitle,
    updateIcon,
    updateClosable,
    updateMeta
  }
}

/**
 * Preset for loading state tabs
 */
export function useLoadingTab(loadingState: Ref<boolean>, baseTitle = 'Page') {
  return useReactiveTab({
    title: computed(() => loadingState.value ? 'Loading...' : baseTitle),
    icon: computed(() => loadingState.value ? 'mdi-loading mdi-spin' : 'mdi-page'),
    closable: computed(() => !loadingState.value)
  })
}

/**
 * Preset for notification-aware tabs
 */
export function useNotificationTab(
  count: Ref<number>, 
  baseTitle = 'Page',
  baseIcon = 'mdi-page'
) {
  return useReactiveTab({
    title: computed(() => count.value > 0 ? `${baseTitle} (${count.value})` : baseTitle),
    icon: computed(() => count.value > 0 ? 'mdi-bell-badge' : baseIcon)
  })
}

/**
 * Preset for status-aware tabs
 */
export function useStatusTab(
  status: Ref<'normal' | 'loading' | 'error' | 'success'>,
  baseTitle = 'Page'
) {
  const statusConfig = {
    normal: { suffix: '', icon: 'mdi-page' },
    loading: { suffix: ' - Loading', icon: 'mdi-loading mdi-spin' },
    error: { suffix: ' - Error', icon: 'mdi-alert' },
    success: { suffix: ' - Success', icon: 'mdi-check-circle' }
  }

  return useReactiveTab({
    title: computed(() => baseTitle + statusConfig[status.value].suffix),
    icon: computed(() => statusConfig[status.value].icon),
    closable: computed(() => status.value !== 'loading')
  })
}