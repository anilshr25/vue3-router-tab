// Title Management System
// Comprehensive title handling with replacement, fallback, and normalization

export interface TitleConfig {
  /** Default placeholder text when no title exists */
  placeholder?: string
  /** Text to show for loading states */
  loadingText?: string
  /** Maximum length before truncation */
  maxLength?: number
  /** Whether to trim whitespace */
  trimWhitespace?: boolean
  /** Custom replacement rules */
  replacements?: Record<string, string>
  /** Words to normalize (case-insensitive) */
  normalizeWords?: Record<string, string>
  /** Whether to capitalize first letter */
  capitalize?: boolean
}

export interface TitleReplacement {
  /** Original value to match (case-insensitive) */
  from: string
  /** New value to replace with */
  to: string
  /** Whether to match exactly or partially */
  exact?: boolean
}

export class TitleManager {
  private config: Required<TitleConfig>
  private customReplacements: Map<string, string> = new Map()

  constructor(config: TitleConfig = {}) {
    this.config = {
      placeholder: config.placeholder || 'Untitled',
      loadingText: config.loadingText || 'Loading...',
      maxLength: config.maxLength || 200,
      trimWhitespace: config.trimWhitespace ?? true,
      replacements: config.replacements || {},
      normalizeWords: config.normalizeWords || {},
      capitalize: config.capitalize ?? false
    }

    // Initialize default replacements
    this.initializeDefaultReplacements()
  }

  private initializeDefaultReplacements() {
    const defaults = {
      'untitled': this.config.placeholder,
      'no title': this.config.placeholder,
      'undefined': this.config.placeholder,
      'null': this.config.placeholder,
      '': this.config.placeholder
    }

    Object.entries({ ...defaults, ...this.config.replacements }).forEach(([key, value]) => {
      this.customReplacements.set(key.toLowerCase(), value)
    })
  }

  /**
   * Process a title with full normalization and replacement logic
   */
  processTitle(input: any, options: Partial<TitleConfig> = {}): string {
    const mergedConfig = { ...this.config, ...options }
    
    // Step 1: Convert input to string and handle null/undefined
    let title = this.normalizeInput(input)
    
    // Step 2: Apply whitespace trimming
    if (mergedConfig.trimWhitespace) {
      title = title.trim()
    }

    // Step 3: Handle empty or whitespace-only strings
    if (!title || title.length === 0) {
      return mergedConfig.placeholder
    }

    // Step 4: Apply custom replacements (case-insensitive)
    title = this.applyReplacements(title)

    // Step 5: Apply word normalization
    title = this.applyWordNormalization(title, mergedConfig.normalizeWords)

    // Step 6: Apply capitalization
    if (mergedConfig.capitalize) {
      title = this.capitalizeFirst(title)
    }

    // Step 7: Apply length truncation
    if (title.length > mergedConfig.maxLength) {
      title = title.substring(0, mergedConfig.maxLength - 3) + '...'
    }

    // Step 8: Final validation
    return title || mergedConfig.placeholder
  }

  /**
   * Replace title if it matches specific patterns
   */
  replaceTitle(currentTitle: any, newTitle: string, matchPatterns: string[] = []): string {
    const normalizedCurrent = this.normalizeInput(currentTitle).toLowerCase().trim()
    
    // Default patterns to match for replacement
    const defaultPatterns = [
      'profile',
      'untitled',
      'no title',
      'undefined',
      'null',
      ''
    ]

    const patterns = matchPatterns.length > 0 ? matchPatterns : defaultPatterns
    
    // Check if current title matches any replacement pattern
    const shouldReplace = patterns.some(pattern => 
      normalizedCurrent === pattern.toLowerCase() ||
      normalizedCurrent.includes(pattern.toLowerCase())
    )

    if (shouldReplace) {
      return this.processTitle(newTitle)
    }

    return this.processTitle(currentTitle)
  }

  /**
   * Add custom title replacement rule
   */
  addReplacement(from: string, to: string): void {
    this.customReplacements.set(from.toLowerCase(), to)
  }

  /**
   * Remove custom replacement rule
   */
  removeReplacement(from: string): void {
    this.customReplacements.delete(from.toLowerCase())
  }

  /**
   * Get all current replacement rules
   */
  getReplacements(): Record<string, string> {
    return Object.fromEntries(this.customReplacements)
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TitleConfig>): void {
    this.config = { ...this.config, ...newConfig }
    if (newConfig.replacements) {
      this.initializeDefaultReplacements()
    }
  }

  private normalizeInput(input: any): string {
    if (input === null || input === undefined) return ''
    if (typeof input === 'string') return input
    if (Array.isArray(input)) return input.length > 0 ? String(input[0]) : ''
    if (typeof input === 'object') {
      // Handle objects with title properties
      if ('title' in input) return this.normalizeInput(input.title)
      if ('name' in input) return this.normalizeInput(input.name)
      if ('label' in input) return this.normalizeInput(input.label)
    }
    return String(input)
  }

  private applyReplacements(title: string): string {
    const lowerTitle = title.toLowerCase()
    
    // Exact matches first
    if (this.customReplacements.has(lowerTitle)) {
      return this.customReplacements.get(lowerTitle)!
    }

    // Partial matches
    for (const [pattern, replacement] of this.customReplacements) {
      if (lowerTitle.includes(pattern)) {
        return replacement
      }
    }

    return title
  }

  private applyWordNormalization(title: string, normalizeWords: Record<string, string>): string {
    let result = title
    
    Object.entries(normalizeWords).forEach(([from, to]) => {
      const regex = new RegExp(`\\b${from}\\b`, 'gi')
      result = result.replace(regex, to)
    })

    return result
  }

  private capitalizeFirst(str: string): string {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}

// Default global instance
export const titleManager = new TitleManager()

// Convenience functions for common use cases
export function processTitle(input: any, config?: Partial<TitleConfig>): string {
  return titleManager.processTitle(input, config)
}

export function replaceTitle(currentTitle: any, newTitle: string, matchPatterns?: string[]): string {
  return titleManager.replaceTitle(currentTitle, newTitle, matchPatterns)
}

export function addTitleReplacement(from: string, to: string): void {
  titleManager.addReplacement(from, to)
}

// Vue 3 Composable
export function useTitleManager(config?: TitleConfig) {
  const manager = new TitleManager(config)

  return {
    processTitle: (input: any, options?: Partial<TitleConfig>) => manager.processTitle(input, options),
    replaceTitle: (current: any, newTitle: string, patterns?: string[]) => manager.replaceTitle(current, newTitle, patterns),
    addReplacement: (from: string, to: string) => manager.addReplacement(from, to),
    removeReplacement: (from: string) => manager.removeReplacement(from),
    getReplacements: () => manager.getReplacements(),
    updateConfig: (newConfig: Partial<TitleConfig>) => manager.updateConfig(newConfig)
  }
}