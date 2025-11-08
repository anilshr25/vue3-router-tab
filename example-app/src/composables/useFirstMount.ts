import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to handle Vue 3 Strict Mode double mount issue
 * 
 * Usage:
 * ```
 * const { onFirstMount } = useFirstMount()
 * 
 * onFirstMount(() => {
 *   console.log('This runs only once, not twice!')
 *   fetchData()
 * })
 * ```
 * 
 * Benefits:
 * - Prevents API calls from running twice
 * - Prevents event listeners from being attached twice
 * - Prevents memory leaks from duplicate setup
 * - Works seamlessly with Vue Strict Mode
 */
export function useFirstMount() {
  const isFirstMount = ref(true)

  const onFirstMount = (callback: () => void | Promise<void>) => {
    onMounted(async () => {
      if (isFirstMount.value) {
        try {
          await callback()
        } finally {
          isFirstMount.value = false
        }
      }
    })
  }

  const onFirstMountAsync = (callback: () => Promise<void>) => {
    onMounted(async () => {
      if (isFirstMount.value) {
        try {
          await callback()
        } finally {
          isFirstMount.value = false
        }
      }
    })
  }

  // Reset flag on unmount so component can mount again fresh
  onUnmounted(() => {
    isFirstMount.value = true
  })

  return {
    isFirstMount: isFirstMount.value,
    onFirstMount,
    onFirstMountAsync
  }
}

/**
 * Alternative: Async wrapper for fetch operations
 * Includes AbortController for cancelling in-flight requests
 */
export function useAsyncFetch() {
  const isFirstMount = ref(true)
  let abortController: AbortController | null = null

  const fetchOnFirstMount = async <T>(
    fetchFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    if (!isFirstMount.value) return null

    abortController = new AbortController()

    try {
      const result = await fetchFn(abortController.signal)
      isFirstMount.value = false
      return result
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Request was cancelled (component unmounted)
        return null
      }
      throw error
    }
  }

  onUnmounted(() => {
    abortController?.abort()
    isFirstMount.value = true
  })

  return {
    isFirstMount: isFirstMount.value,
    fetchOnFirstMount
  }
}
