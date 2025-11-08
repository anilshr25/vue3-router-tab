<template>
  <div class="cache-control-demo">
    <h1>Cache Control & KeepAlive Demo</h1>
    
    <div class="demo-section">
      <h2>Cache Control Methods</h2>
      <div class="button-group">
        <button @click="showCacheStatus">📊 Show Cache Status</button>
        <button @click="evictCurrentTab">🗑️ Evict Current Tab Cache</button>
        <button @click="clearAllCache">🧹 Clear All Cache</button>
        <button @click="keepAliveToggle" :class="{ active: keepAliveEnabled }">
          {{ keepAliveEnabled ? '🔒 KeepAlive ON' : '🔓 KeepAlive OFF' }}
        </button>
      </div>
    </div>

    <div class="demo-section">
      <h2>Tab State Control</h2>
      <div class="button-group">
        <button @click="toggleCurrentTabAlive">
          {{ currentTabAlive ? '⬇️ Disable KeepAlive' : '⬆️ Enable KeepAlive' }}
        </button>
        <button @click="toggleAllTabs">🔀 Toggle All Tabs</button>
      </div>
    </div>

    <div class="demo-section">
      <h2>Status Information</h2>
      <div class="status-box">
        <p><strong>Active Tab ID:</strong> {{ tabs.activeId.value }}</p>
        <p><strong>Total Tabs:</strong> {{ tabs.tabs.length }}</p>
        <p><strong>Alive Cache Keys:</strong> {{ tabs.getCacheKeys().length }}</p>
        <p><strong>KeepAlive Enabled:</strong> {{ keepAliveEnabled }}</p>
        <p><strong>Max Alive:</strong> {{ tabs.options.maxAlive || 'Unlimited' }}</p>
      </div>
    </div>

    <div class="demo-section">
      <h2>Cache Keys Information</h2>
      <div class="cache-keys-box">
        <div v-if="tabs.getCacheKeys().length > 0">
          <p><strong>Currently Cached Tabs ({{ tabs.getCacheKeys().length }}):</strong></p>
          <ul>
            <li v-for="key in tabs.getCacheKeys()" :key="key">{{ key }}</li>
          </ul>
        </div>
        <div v-else>
          <p>No tabs in cache</p>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>Tab Details</h2>
      <table class="tabs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Alive</th>
            <th>Render Key</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tab in tabs.tabs" :key="tab.id">
            <td>{{ tab.id }}</td>
            <td>{{ tab.title || 'Untitled' }}</td>
            <td>
              <span :class="{ alive: tab.alive, dead: !tab.alive }">
                {{ tab.alive ? '✅ Yes' : '❌ No' }}
              </span>
            </td>
            <td>{{ tab.renderKey }}</td>
            <td>
              <button @click="toggleTabAlive(tab.id)" :disabled="tab.id === tabs.activeId.value">
                {{ tab.alive ? 'Disable' : 'Enable' }}
              </button>
              <button @click="evictTabCache(tab.id)">Evict</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="demo-section info">
      <h2>ℹ️ Information</h2>
      <p><strong>KeepAlive:</strong> When enabled, components stay in memory and preserve their state when switching tabs.</p>
      <p><strong>Cache Control:</strong> Use cache methods to control which tabs are kept in memory and free up resources.</p>
      <p><strong>evictCache:</strong> Remove a tab from the cache without closing it. Component will be recreated next time.</p>
      <p><strong>clearCache:</strong> Remove all tabs from the cache at once.</p>
      <p><strong>setTabAlive:</strong> Control whether a specific tab is kept in memory.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouterTabs } from '../../../lib/useRouterTabs'
import type { TabRecord } from '../../../lib/core/types'

const tabs = useRouterTabs()!
const keepAliveEnabled = ref(true)

const currentTabAlive = computed(() => {
  const activeTab = tabs.tabs.find((t: TabRecord) => t.id === tabs.activeId.value)
  return activeTab?.alive ?? false
})

onMounted(() => {
  keepAliveEnabled.value = tabs.options.keepAlive
})

function showCacheStatus() {
  const cacheKeys = tabs.getCacheKeys()
  alert(`
Cache Status:
- Cached Tabs: ${cacheKeys.length}
- Total Tabs: ${tabs.tabs.length}
- Active Tab: ${tabs.activeId.value}

Cached Tab Keys:
${cacheKeys.map((key: string) => `  • ${key}`).join('\n')}
  `)
}

function evictCurrentTab() {
  if (tabs.activeId.value) {
    tabs.evictCache(tabs.activeId.value)
    alert(`Evicted cache for tab: ${tabs.activeId.value}`)
  }
}

function clearAllCache() {
  if (confirm('Clear all tabs from cache? Components will be recreated next time.')) {
    tabs.clearCache()
    alert('All cache cleared!')
  }
}

function keepAliveToggle() {
  keepAliveEnabled.value = !keepAliveEnabled.value
  tabs.options.keepAlive = keepAliveEnabled.value
  alert(`KeepAlive: ${keepAliveEnabled.value ? 'Enabled' : 'Disabled'}`)
}

function toggleCurrentTabAlive() {
  if (tabs.activeId.value) {
    const activeTab = tabs.tabs.find((t: TabRecord) => t.id === tabs.activeId.value)
    if (activeTab) {
      const newState = !activeTab.alive
      tabs.setTabAlive(tabs.activeId.value, newState)
      alert(`Tab cache ${newState ? 'enabled' : 'disabled'}`)
    }
  }
}

function toggleAllTabs() {
  const allAlive = tabs.tabs.every((t: TabRecord) => t.alive)
  tabs.tabs.forEach((tab: TabRecord) => {
    tabs.setTabAlive(tab.id, !allAlive)
  })
  alert(`All tabs cache ${!allAlive ? 'enabled' : 'disabled'}`)
}

function toggleTabAlive(tabId: string) {
  const tab = tabs.tabs.find((t: TabRecord) => t.id === tabId)
  if (tab) {
    const newState = !tab.alive
    tabs.setTabAlive(tabId, newState)
  }
}

function evictTabCache(tabId: string) {
  tabs.evictCache(tabId)
  alert(`Cache evicted for tab: ${tabId}`)
}
</script>

<style scoped>
.cache-control-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 20px;
  border-bottom: 3px solid #0f172a;
  padding-bottom: 10px;
}

h2 {
  color: #555;
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 1.2em;
}

.demo-section {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.demo-section.info {
  background: #e3f2fd;
  border-color: #1976d2;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

button {
  padding: 10px 15px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;
  transition: all 0.3s;
}

button:hover:not(:disabled) {
  background: #1e2850;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.active {
  background: #4caf50;
}

button.active:hover {
  background: #45a049;
}

.status-box {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.status-box p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cache-keys-box {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.cache-keys-box ul {
  list-style: none;
  padding: 0;
  margin: 5px 0;
}

.cache-keys-box li {
  padding: 5px;
  background: #f5f5f5;
  margin: 3px 0;
  border-left: 3px solid #0f172a;
  padding-left: 10px;
  font-family: monospace;
}

.tabs-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  margin-top: 10px;
}

.tabs-table th,
.tabs-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.tabs-table th {
  background: #f5f5f5;
  font-weight: bold;
  color: #333;
}

.tabs-table tr:nth-child(even) {
  background: #fafafa;
}

.tabs-table tr:hover {
  background: #f0f0f0;
}

.tabs-table .alive {
  color: #4caf50;
  font-weight: bold;
}

.tabs-table .dead {
  color: #f44336;
  font-weight: bold;
}

.tabs-table button {
  padding: 5px 10px;
  margin-right: 5px;
  font-size: 0.85em;
}

.demo-section.info p {
  margin: 8px 0;
  line-height: 1.5;
}

.demo-section.info strong {
  color: #1976d2;
}
</style>
