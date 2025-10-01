<template>
  <div class="title-management-demo">
    <h2>Title Management Demo</h2>
    
    <!-- Router Tab with enhanced title management -->
    <router-tab
      ref="routerTabRef"
      :title-config="titleConfig"
      :enable-title-replacement="enableTitleReplacement"
      :title-resolver="customTitleResolver"
    />

    <!-- Controls Panel -->
    <div class="controls-panel">
      <h3>Title Management Controls</h3>
      
      <!-- Basic Configuration -->
      <div class="control-group">
        <h4>Configuration</h4>
        <label>
          <input 
            v-model="enableTitleReplacement" 
            type="checkbox"
          />
          Enable Title Replacement
        </label>
        
        <label>
          Placeholder Text:
          <input 
            v-model="titleConfig.placeholder" 
            type="text"
            placeholder="Untitled"
          />
        </label>
        
        <label>
          Max Length:
          <input 
            v-model.number="titleConfig.maxLength" 
            type="number"
            min="10"
            max="500"
          />
        </label>
        
        <label>
          <input 
            v-model="titleConfig.capitalize" 
            type="checkbox"
          />
          Capitalize First Letter
        </label>
      </div>

      <!-- Title Testing -->
      <div class="control-group">
        <h4>Test Title Processing</h4>
        <label>
          Input Title:
          <input 
            v-model="testTitle" 
            type="text"
            placeholder="Enter test title..."
          />
        </label>
        <div class="processed-result">
          <strong>Processed:</strong> "{{ processedTestTitle }}"
        </div>
      </div>

      <!-- Tab Title Replacement -->
      <div class="control-group">
        <h4>Replace Tab Titles</h4>
        <div class="replace-form">
          <select v-model="selectedTabId">
            <option value="">Select a tab</option>
            <option 
              v-for="tab in availableTabs" 
              :key="tab.id" 
              :value="tab.id"
            >
              {{ tab.title || 'Untitled' }} ({{ tab.route }})
            </option>
          </select>
          
          <input 
            v-model="newTitleText" 
            type="text"
            placeholder="New title..."
          />
          
          <button 
            @click="replaceSelectedTitle"
            :disabled="!selectedTabId || !newTitleText"
          >
            Replace Title
          </button>
        </div>
      </div>

      <!-- Custom Replacement Rules -->
      <div class="control-group">
        <h4>Custom Replacement Rules</h4>
        <div class="replacement-form">
          <input 
            v-model="newRuleFrom" 
            type="text"
            placeholder="From (e.g., 'profile')"
          />
          <input 
            v-model="newRuleTo" 
            type="text"
            placeholder="To (e.g., 'My Profile')"
          />
          <button 
            @click="addCustomRule"
            :disabled="!newRuleFrom || !newRuleTo"
          >
            Add Rule
          </button>
        </div>
        
        <div class="current-rules">
          <h5>Current Rules:</h5>
          <div 
            v-for="(to, from) in currentReplacements" 
            :key="from"
            class="rule-item"
          >
            <span>"{{ from }}" → "{{ to }}"</span>
            <button @click="removeRule(String(from))" class="remove-btn">×</button>
          </div>
        </div>
      </div>

      <!-- Demo Scenarios -->
      <div class="control-group">
        <h4>Demo Scenarios</h4>
        <button @click="loadDemoScenarios">Load Demo Tabs</button>
        <button @click="testReplacementScenarios">Test Replacements</button>
        <button @click="clearAllTabs">Clear All Tabs</button>
      </div>
    </div>

    <!-- Title Processing Examples -->
    <div class="examples-panel">
      <h3>Title Processing Examples</h3>
      <div class="example-grid">
        <div 
          v-for="(example, index) in titleExamples" 
          :key="index"
          class="example-item"
        >
          <div class="input">Input: <code>{{ JSON.stringify(example.input) }}</code></div>
          <div class="output">Output: <code>"{{ example.output }}"</code></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTitleManager, type TitleConfig, type TabRecord } from '../../../lib'

// Title management configuration
const titleConfig = ref<TitleConfig>({
  placeholder: 'Untitled',
  maxLength: 50,
  capitalize: false,
  trimWhitespace: true,
  replacements: {
    'profile': 'My Profile',
    'settings': 'App Settings',
    'dashboard': 'Main Dashboard'
  }
})

const enableTitleReplacement = ref(true)
const routerTabRef = ref()

// Title manager instance
const titleManager = useTitleManager(titleConfig.value)

// Test title processing
const testTitle = ref('')
const processedTestTitle = computed(() => 
  titleManager.processTitle(testTitle.value, titleConfig.value)
)

// Tab management
const selectedTabId = ref('')
const newTitleText = ref('')
const availableTabs = computed(() => {
  return routerTabRef.value?.tabs || []
})

// Custom replacement rules
const newRuleFrom = ref('')
const newRuleTo = ref('')
const currentReplacements = computed(() => titleManager.getReplacements())

// Custom title resolver
const customTitleResolver = (tab: TabRecord): string => {
  // Custom logic for specific routes
  const path = typeof tab.to === 'string' ? tab.to : tab.to.path || ''
  if (path === '/profile') {
    return 'User Profile'
  }
  if (path.startsWith('/admin')) {
    return `Admin: ${tab.title || 'Panel'}`
  }
  return tab.title as string
}

// Title processing examples
const titleExamples = computed(() => {
  const examples = [
    { input: null },
    { input: undefined },
    { input: '' },
    { input: '   ' },
    { input: 'profile' },
    { input: 'Profile' },
    { input: 'PROFILE' },
    { input: 'My Dashboard' },
    { input: 'untitled' },
    { input: ['First Title', 'Second'] },
    { input: { title: 'Object Title' } },
    { input: 'This is a very long title that should be truncated because it exceeds the maximum length' }
  ]
  
  return examples.map(example => ({
    input: example.input,
    output: titleManager.processTitle(example.input, titleConfig.value)
  }))
})

// Methods
function replaceSelectedTitle() {
  if (!routerTabRef.value || !selectedTabId.value || !newTitleText.value) return
  
  const success = routerTabRef.value.replaceTabTitle(
    selectedTabId.value, 
    newTitleText.value,
    ['profile', 'untitled', 'settings'] // Match patterns
  )
  
  if (success) {
    alert('Title replaced successfully!')
    newTitleText.value = ''
  } else {
    alert('Failed to replace title')
  }
}

function addCustomRule() {
  if (!newRuleFrom.value || !newRuleTo.value) return
  
  titleManager.addReplacement(newRuleFrom.value, newRuleTo.value)
  
  // Also add to router tab if available
  if (routerTabRef.value) {
    routerTabRef.value.addTitleReplacement(newRuleFrom.value, newRuleTo.value)
  }
  
  newRuleFrom.value = ''
  newRuleTo.value = ''
}

function removeRule(from: string) {
  titleManager.removeReplacement(from)
  
  // Also remove from router tab if available
  if (routerTabRef.value) {
    routerTabRef.value.addTitleReplacement(from, '') // Empty replacement removes rule
  }
}

function loadDemoScenarios() {
  // This would add demo tabs with various title scenarios
  const demoTabs = [
    { path: '/profile', title: 'profile' },
    { path: '/settings', title: null },
    { path: '/dashboard', title: '' },
    { path: '/orders', title: 'untitled' },
    { path: '/products', title: 'My Products' },
    { path: '/analytics', title: ['Analytics Dashboard', 'Stats'] }
  ]
  
  // Implementation would depend on your router setup
  console.log('Would load demo tabs:', demoTabs)
}

function testReplacementScenarios() {
  const testCases = [
    { current: 'profile', new: 'My New Profile' },
    { current: 'untitled', new: 'Custom Title' },
    { current: 'Settings Page', new: 'App Configuration' }
  ]
  
  testCases.forEach(test => {
    console.log(`"${test.current}" → "${titleManager.replaceTitle(test.current, test.new)}"`)
  })
}

function clearAllTabs() {
  // Implementation would depend on your router tab setup
  console.log('Would clear all tabs')
}

// Watch for config changes
watch(titleConfig, (newConfig) => {
  titleManager.updateConfig(newConfig)
}, { deep: true })
</script>

<style scoped>
.title-management-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls-panel, .examples-panel {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.control-group {
  margin: 15px 0;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.control-group h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.control-group label {
  display: block;
  margin: 8px 0;
}

.control-group input[type="text"],
.control-group input[type="number"],
.control-group select {
  margin-left: 10px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.processed-result {
  margin: 10px 0;
  padding: 8px;
  background: #e8f4fd;
  border-radius: 4px;
  font-family: monospace;
}

.replace-form, .replacement-form {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.current-rules {
  margin-top: 15px;
}

.rule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  margin: 5px 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.remove-btn {
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 12px;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.example-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
}

.input, .output {
  margin: 5px 0;
}

.input code, .output code {
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 12px;
}

button {
  padding: 6px 12px;
  background: #007cba;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #005a87;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>