<template>
  <div style="padding: 20px;">
    <h2>Debug Reactive Tab Test</h2>
    
    <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 4px;">
      <h3>Current Values:</h3>
      <p><strong>routeTabTitle:</strong> {{ routeTabTitle }}</p>
      <p><strong>routeTabIcon:</strong> {{ routeTabIcon }}</p>
      <p><strong>routeTabClosable:</strong> {{ routeTabClosable }}</p>
    </div>
    
    <div style="margin: 20px 0;">
      <button @click="testUpdate" style="padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; border-radius: 4px;">
        Update Title to "{{ nextTitle }}"
      </button>
      
      <button @click="testIcon" style="padding: 10px 20px; margin: 5px; background: #28a745; color: white; border: none; border-radius: 4px;">
        Change Icon
      </button>
      
      <button @click="testClosable" style="padding: 10px 20px; margin: 5px; background: #ffc107; color: black; border: none; border-radius: 4px;">
        Toggle Closable
      </button>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background: #e7f3ff; border-radius: 4px;">
      <h3>Test Instructions:</h3>
      <ol>
        <li>Watch the tab title in the tab bar above</li>
        <li>Click "Update Title" and see if the tab title changes immediately</li>
        <li>Click "Change Icon" and see if the tab icon changes</li>
        <li>Click "Toggle Closable" and see if the close button appears/disappears</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Create reactive properties
const routeTabTitle = ref('Debug Test')
const routeTabIcon = ref('mdi-bug')
const routeTabClosable = ref(true)

// Test data
const nextTitle = ref('Updated Title!')
const icons = ['mdi-bug', 'mdi-star', 'mdi-heart', 'mdi-cog', 'mdi-fire', 'mdi-rocket']
let iconIndex = 0

// routeTabTitle is a ref so RouterTab can watch it and we can update it programmatically

// Test functions
const testUpdate = () => {
  console.log('Debug Test: Updating title from', routeTabTitle.value, 'to', nextTitle.value)
  routeTabTitle.value = nextTitle.value
  nextTitle.value = `Updated ${Date.now()}`
}

const testIcon = () => {
  iconIndex = (iconIndex + 1) % icons.length
  const newIcon = icons[iconIndex]
  console.log('Debug Test: Changing icon from', routeTabIcon.value, 'to', newIcon)
  routeTabIcon.value = newIcon
}

const testClosable = () => {
  console.log('Debug Test: Toggling closable from', routeTabClosable.value, 'to', !routeTabClosable.value)
  routeTabClosable.value = !routeTabClosable.value
}

// Watch for changes and log them
watch(routeTabTitle, (newVal, oldVal) => {
  console.log('Debug Test: routeTabTitle changed from', oldVal, 'to', newVal)
})

watch(routeTabIcon, (newVal, oldVal) => {
  console.log('Debug Test: routeTabIcon changed from', oldVal, 'to', newVal)
})

watch(routeTabClosable, (newVal, oldVal) => {
  console.log('Debug Test: routeTabClosable changed from', oldVal, 'to', newVal)
})

// Expose for RouterTab
defineExpose({
  routeTabTitle,
  routeTabIcon,
  routeTabClosable
})

console.log('Debug Test component loaded with initial values:', {
  title: routeTabTitle.value,
  icon: routeTabIcon.value,
  closable: routeTabClosable.value
})
</script>