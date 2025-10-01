# Title Management System

A comprehensive title management system for Vue 3 applications with support for advanced title processing, replacement rules, and customizable fallback behavior.

## Features

- **Smart Title Processing**: Handles null, undefined, empty, and whitespace-only titles
- **Custom Replacement Rules**: Replace specific title patterns with custom values
- **Flexible Fallback System**: Configurable placeholder text for missing titles
- **Title Normalization**: Trim whitespace, capitalize, and apply word normalization
- **Length Management**: Automatic truncation with ellipsis for long titles
- **Platform Agnostic**: Can be used in any JavaScript/TypeScript environment
- **Vue 3 Integration**: Built-in composable for Vue 3 applications

## Installation

The title management system is included with the vue3-router-tab package:

```bash
npm install vue3-router-tab
```

## Basic Usage

### Standalone Usage

```typescript
import { TitleManager, processTitle } from 'vue3-router-tab'

// Quick processing with defaults
const title = processTitle('untitled') // Returns: "Untitled"
const title2 = processTitle(null) // Returns: "Untitled"
const title3 = processTitle('My Profile') // Returns: "My Profile"

// Using TitleManager instance
const titleManager = new TitleManager({
  placeholder: 'No Title',
  capitalize: true,
  maxLength: 50
})

const processed = titleManager.processTitle('profile') // Returns: "Profile"
```

### Vue 3 Composable

```vue
<script setup>
import { useTitleManager } from 'vue3-router-tab'

const titleManager = useTitleManager({
  placeholder: 'Untitled Document',
  replacements: {
    'profile': 'User Profile',
    'settings': 'App Settings'
  }
})

const processedTitle = titleManager.processTitle('profile') // "User Profile"
</script>
```

## Configuration Options

### TitleConfig Interface

```typescript
interface TitleConfig {
  /** Default placeholder text when no title exists */
  placeholder?: string          // Default: 'Untitled'
  
  /** Text to show for loading states */
  loadingText?: string         // Default: 'Loading...'
  
  /** Maximum length before truncation */
  maxLength?: number           // Default: 200
  
  /** Whether to trim whitespace */
  trimWhitespace?: boolean     // Default: true
  
  /** Custom replacement rules (case-insensitive) */
  replacements?: Record<string, string>
  
  /** Words to normalize (case-insensitive) */
  normalizeWords?: Record<string, string>
  
  /** Whether to capitalize first letter */
  capitalize?: boolean         // Default: false
}
```

## Advanced Usage

### Custom Replacement Rules

```typescript
const titleManager = new TitleManager({
  replacements: {
    'profile': 'My Profile',
    'dashboard': 'Main Dashboard',
    'settings': 'App Settings',
    'untitled': 'New Document'
  }
})

// Add rules dynamically
titleManager.addReplacement('admin', 'Administration Panel')

// Remove rules
titleManager.removeReplacement('profile')

// Get all rules
const rules = titleManager.getReplacements()
```

### Word Normalization

```typescript
const titleManager = new TitleManager({
  normalizeWords: {
    'usr': 'User',
    'cfg': 'Configuration',
    'btn': 'Button'
  },
  capitalize: true
})

const result = titleManager.processTitle('usr cfg panel')
// Returns: "User Configuration panel"
```

### Title Replacement with Patterns

```typescript
// Replace title only if it matches specific patterns
const newTitle = titleManager.replaceTitle(
  'profile',           // Current title
  'My New Profile',    // New title
  ['profile', 'untitled', 'default'] // Match patterns
)

// If current title matches any pattern, returns "My New Profile"
// Otherwise returns processed current title
```

## RouterTab Integration

### Basic Integration

```vue
<template>
  <router-tab
    :title-config="titleConfig"
    :enable-title-replacement="true"
    :title-resolver="customTitleResolver"
    untitled-text="No Title"
  />
</template>

<script setup>
const titleConfig = {
  placeholder: 'Untitled Tab',
  maxLength: 30,
  capitalize: true,
  replacements: {
    'profile': 'User Profile',
    'settings': 'App Settings'
  }
}

const customTitleResolver = (tab) => {
  // Custom logic for specific routes
  if (tab.to.path === '/admin') {
    return 'Admin Panel'
  }
  return tab.title
}
</script>
```

### Programmatic Title Management

```vue
<script setup>
import { ref } from 'vue'

const routerTabRef = ref()

// Replace tab title if it matches patterns
const replaceTitle = (tabId, newTitle) => {
  return routerTabRef.value?.replaceTabTitle(
    tabId, 
    newTitle,
    ['profile', 'untitled'] // Match patterns
  )
}

// Update tab title directly
const updateTitle = (tabId, newTitle) => {
  return routerTabRef.value?.updateTabTitle(tabId, newTitle)
}

// Add custom replacement rule
const addRule = (from, to) => {
  routerTabRef.value?.addTitleReplacement(from, to)
}
</script>

<template>
  <router-tab ref="routerTabRef" />
</template>
```

## Processing Examples

### Input Handling

```typescript
const titleManager = new TitleManager()

// Null/undefined handling
titleManager.processTitle(null)        // "Untitled"
titleManager.processTitle(undefined)   // "Untitled"
titleManager.processTitle('')          // "Untitled"
titleManager.processTitle('   ')       // "Untitled"

// Array handling
titleManager.processTitle(['First', 'Second']) // "First"
titleManager.processTitle([])          // "Untitled"

// Object handling
titleManager.processTitle({ title: 'Page Title' }) // "Page Title"
titleManager.processTitle({ name: 'Item Name' })   // "Item Name"

// String processing
titleManager.processTitle('  my title  ') // "my title"
```

### Replacement Processing

```typescript
const titleManager = new TitleManager({
  replacements: {
    'profile': 'User Profile',
    'untitled': 'New Document'
  }
})

titleManager.processTitle('profile')    // "User Profile"
titleManager.processTitle('Profile')    // "User Profile" (case-insensitive)
titleManager.processTitle('PROFILE')    // "User Profile"
titleManager.processTitle('untitled')   // "New Document"
titleManager.processTitle('My Profile') // "My Profile" (no exact match)
```

### Length and Capitalization

```typescript
const titleManager = new TitleManager({
  maxLength: 20,
  capitalize: true
})

titleManager.processTitle('this is a very long title that will be truncated')
// Returns: "This is a very lo..."

titleManager.processTitle('short title')
// Returns: "Short title"
```

## API Reference

### TitleManager Class

#### Constructor
```typescript
new TitleManager(config?: TitleConfig)
```

#### Methods

- `processTitle(input: any, options?: Partial<TitleConfig>): string`
  - Main processing method with full normalization
  
- `replaceTitle(currentTitle: any, newTitle: string, matchPatterns?: string[]): string`
  - Replace title if it matches specific patterns
  
- `addReplacement(from: string, to: string): void`
  - Add custom replacement rule
  
- `removeReplacement(from: string): void`
  - Remove replacement rule
  
- `getReplacements(): Record<string, string>`
  - Get all current replacement rules
  
- `updateConfig(newConfig: Partial<TitleConfig>): void`
  - Update configuration

### Utility Functions

- `processTitle(input: any, config?: Partial<TitleConfig>): string`
- `replaceTitle(currentTitle: any, newTitle: string, matchPatterns?: string[]): string`
- `addTitleReplacement(from: string, to: string): void`

### Vue 3 Composable

```typescript
const {
  processTitle,
  replaceTitle,
  addReplacement,
  removeReplacement,
  getReplacements,
  updateConfig
} = useTitleManager(config?: TitleConfig)
```

## Best Practices

1. **Consistent Placeholder Text**: Use consistent placeholder text across your application
2. **Reasonable Length Limits**: Set appropriate `maxLength` values based on your UI constraints
3. **Case-Insensitive Rules**: Replacement rules are case-insensitive for better matching
4. **Performance**: Create TitleManager instances once and reuse them
5. **Validation**: Always validate titles in production environments

## Migration Guide

### From Basic String Handling

```typescript
// Before
function getTitle(title) {
  return title || 'Untitled'
}

// After
import { processTitle } from 'vue3-router-tab'

const getTitle = (title) => processTitle(title)
```

### From Custom Title Logic

```typescript
// Before
function processCustomTitle(title) {
  if (!title || title.trim() === '') return 'Untitled'
  if (title.toLowerCase() === 'profile') return 'User Profile'
  if (title.length > 50) return title.substring(0, 47) + '...'
  return title
}

// After
import { TitleManager } from 'vue3-router-tab'

const titleManager = new TitleManager({
  placeholder: 'Untitled',
  maxLength: 50,
  replacements: {
    'profile': 'User Profile'
  }
})

const processCustomTitle = (title) => titleManager.processTitle(title)
```

## TypeScript Support

Full TypeScript support is included with proper type definitions:

```typescript
import { TitleManager, TitleConfig, useTitleManager } from 'vue3-router-tab'

const config: TitleConfig = {
  placeholder: 'Untitled',
  maxLength: 100
}

const manager: TitleManager = new TitleManager(config)
const result: string = manager.processTitle('test')
```

## Browser Support

- Modern browsers with ES2015+ support
- Vue 3.0+
- TypeScript 4.0+ (optional)

## License

MIT License - see the main package for details.