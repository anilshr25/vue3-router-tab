<template>
  <div class="diagnostics-container">
    <h1>📋 Blank Page Diagnostics</h1>
    
    <section class="section">
      <h2>🔧 Controller Status</h2>
      <div class="info-box">
        <p><strong>KeepAlive Enabled:</strong> {{ controller?.options.keepAlive }}</p>
        <p><strong>Max Alive Tabs:</strong> {{ controller?.options.maxAlive || 'unlimited' }}</p>
        <p><strong>Total Tabs:</strong> {{ controller?.tabs.length }}</p>
        <p><strong>Cache Keys in KeepAlive:</strong> {{ controller?.includeKeys.value?.length }}</p>
        <p><strong>Active Tab ID:</strong> {{ controller?.activeId?.value }}</p>
      </div>
    </section>

    <section class="section">
      <h2>📑 Tab Details</h2>
      <div class="tabs-list">
        <div v-if="!controller?.tabs.length" class="no-data">No tabs yet</div>
        <div v-for="(tab, idx) in controller?.tabs" :key="tab.id" class="tab-item">
          <div class="tab-header">
            <strong>#{{ idx + 1 }}: {{ tab.id }}</strong>
            <span class="status" :class="{ active: tab.id === controller?.activeId?.value }">
              {{ tab.id === controller?.activeId?.value ? 'ACTIVE' : 'INACTIVE' }}
            </span>
          </div>
          <div class="tab-details">
            <p><span class="label">Path:</span> {{ tab.to }}</p>
            <p><span class="label">Alive:</span> 
              <span class="badge" :class="{ yes: tab.alive, no: !tab.alive }">
                {{ tab.alive ? '✓ YES' : '✗ NO' }}
              </span>
            </p>
            <p><span class="label">Render Key:</span> {{ tab.renderKey }}</p>
            <p><span class="label">Cache Key:</span> {{ `${tab.id}::${tab.renderKey}` }}</p>
            <p><span class="label">In KeepAlive:</span> 
              <span class="badge" :class="{ yes: isInKeepAlive(tab), no: !isInKeepAlive(tab) }">
                {{ isInKeepAlive(tab) ? '✓ YES' : '✗ NO' }}
              </span>
            </p>
            <p><span class="label">Will Render:</span>
              <span class="badge" :class="{ yes: willRender(tab), no: !willRender(tab) }">
                {{ willRender(tab) ? '✓ YES' : '✗ NO' }}
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>🧪 Test Actions</h2>
      <div class="actions">
        <button @click="openManyTabs" class="btn btn-primary">
          Open 15 Random Tabs
        </button>
        <button @click="testCacheOverflow" class="btn btn-primary">
          Test Cache Overflow (maxAlive=3)
        </button>
        <button @click="navigateToAll" class="btn btn-info">
          Navigate to Each Tab
        </button>
        <button @click="clearAll" class="btn btn-danger">
          Close All Tabs
        </button>
      </div>
    </section>

    <section class="section">
      <h2>📊 Cache Status</h2>
      <div class="cache-info">
        <p><strong>Cache Keys:</strong></p>
        <div v-if="controller?.getCacheKeys().length" class="key-list">
          <div v-for="key in controller?.getCacheKeys()" :key="key" class="key-item">
            {{ key }}
          </div>
        </div>
        <div v-else class="no-data">No cached components</div>
      </div>
    </section>

    <section class="section">
      <h2>❓ Troubleshooting Guide</h2>
      <div class="guide">
        <div class="guide-item">
          <h3>Issue: Tab shows blank page</h3>
          <ul>
            <li>Check "Alive" column - should be <span class="badge yes">✓ YES</span></li>
            <li>Check "In KeepAlive" - should match "Alive" status</li>
            <li>Check "Will Render" - should be <span class="badge yes">✓ YES</span></li>
            <li>If "Alive" is NO but tab should be visible, it may have been evicted from cache</li>
          </ul>
        </div>
        <div class="guide-item">
          <h3>Issue: Too many tabs cause eviction</h3>
          <ul>
            <li>Check "Max Alive Tabs" setting</li>
            <li>If a tab's "Alive" changes to NO when opening new tabs, it was evicted</li>
            <li>Use cache control methods to manually manage: <code>setTabAlive()</code>, <code>evictCache()</code></li>
          </ul>
        </div>
        <div class="guide-item">
          <h3>Issue: Component doesn't update reactively</h3>
          <ul>
            <li>Component watchers may not be set up correctly</li>
            <li>Try refreshing the tab with the refresh button</li>
            <li>Check browser console for errors</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>📝 Recent Actions Log</h2>
      <div class="log">
        <div v-if="!actionLog.length" class="no-data">No actions yet</div>
        <div v-for="(log, idx) in actionLog.slice(-10)" :key="idx" class="log-item">
          <span class="timestamp">{{ log.time }}</span>
          <span class="message">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import type { RouterTabsContext } from '../../../lib/core/types'

const controller = inject<RouterTabsContext>('RouterTabsContext')
const actionLog = ref<Array<{ time: string; message: string }>>([])

const testPaths = [
  '/dashboard',
  '/products',
  '/orders',
  '/users',
  '/analytics',
  '/profile',
  '/settings'
]

function logAction(message: string) {
  const time = new Date().toLocaleTimeString()
  actionLog.value.push({ time, message })
  console.log(`[${time}] ${message}`)
}

function isInKeepAlive(tab: any) {
  const cacheKey = `${tab.id}::${tab.renderKey}`
  return controller?.includeKeys.value?.includes(cacheKey) ?? false
}

function willRender(tab: any) {
  // Matches the isTabReady logic in RouterTab.vue
  if (!controller?.options.keepAlive) return true
  return tab.alive
}

async function openManyTabs() {
  logAction('Opening 15 random tabs...')
  for (let i = 0; i < 15; i++) {
    const path = testPaths[Math.floor(Math.random() * testPaths.length)]
    await controller?.openTab(path)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  logAction('Opened 15 tabs')
}

async function testCacheOverflow() {
  logAction('Testing cache overflow with maxAlive=3')
  const originalMax = controller?.options.maxAlive
  
  // Simulate opening tabs beyond cache limit
  for (let i = 0; i < 5; i++) {
    const path = testPaths[i % testPaths.length]
    await controller?.openTab(path)
    await new Promise(resolve => setTimeout(resolve, 150))
    const aliveCount = controller?.tabs.filter((t: any) => t.alive).length
    logAction(`Tab ${i + 1}: ${aliveCount} tabs alive in cache`)
  }
}

async function navigateToAll() {
  if (!controller) return
  logAction(`Navigating to ${controller.tabs.length} tabs...`)
  for (let i = 0; i < controller.tabs.length; i++) {
    const tab = controller.tabs[i]
    await controller.ensureTab?.(tab.matched!)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  logAction('Navigation complete')
}

async function clearAll() {
  if (!controller) return
  logAction(`Closing all ${controller.tabs.length} tabs...`)
  const tabCount = controller.tabs.length
  // Close all except first
  for (let i = tabCount - 1; i > 0; i--) {
    const tab = controller.tabs[i]
    await controller.closeTab(tab.id)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  logAction('All tabs closed')
}

onMounted(() => {
  logAction('Diagnostics page loaded')
})
</script>

<style scoped lang="scss">
.diagnostics-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;

  h1 {
    color: #333;
    margin-bottom: 2rem;
    border-bottom: 3px solid #007bff;
    padding-bottom: 1rem;
  }

  h2 {
    color: #555;
    margin: 0 0 1rem;
    font-size: 1.25rem;
  }

  .section {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .info-box {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    border-left: 4px solid #007bff;

    p {
      margin: 0.5rem 0;
      font-size: 0.95rem;

      strong {
        color: #333;
        min-width: 150px;
        display: inline-block;
      }
    }
  }

  .tabs-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .tab-item {
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .tab-header {
      background: #f8f9fa;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;

      .status {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-weight: bold;

        &.active {
          background: #28a745;
          color: white;
        }

        &:not(.active) {
          background: #e0e0e0;
          color: #555;
        }
      }
    }

    .tab-details {
      padding: 1rem;

      p {
        margin: 0.5rem 0;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .label {
          font-weight: bold;
          color: #666;
          min-width: 120px;
        }
      }
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 2rem;
      font-style: italic;
    }
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: bold;

    &.yes {
      background: #d4edda;
      color: #155724;
    }

    &.no {
      background: #f8d7da;
      color: #721c24;
    }
  }

  .actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      font-size: 0.95rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;

      &.btn-primary {
        background: #007bff;
        color: white;

        &:hover {
          background: #0056b3;
        }
      }

      &.btn-info {
        background: #17a2b8;
        color: white;

        &:hover {
          background: #117a8b;
        }
      }

      &.btn-danger {
        background: #dc3545;
        color: white;

        &:hover {
          background: #c82333;
        }
      }
    }
  }

  .cache-info {
    .key-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;

      .key-item {
        background: #f8f9fa;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        border-left: 3px solid #007bff;
        word-break: break-all;
      }
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 1rem;
      font-style: italic;
    }
  }

  .guide {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .guide-item {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #ffc107;

      h3 {
        margin: 0 0 0.5rem;
        color: #333;
        font-size: 1rem;
      }

      ul {
        margin: 0;
        padding-left: 1.5rem;
        color: #666;

        li {
          margin: 0.5rem 0;
          line-height: 1.5;
        }

        code {
          background: #e0e0e0;
          padding: 0.2rem 0.4rem;
          border-radius: 2px;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
        }
      }
    }
  }

  .log {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 1rem;
    max-height: 300px;
    overflow-y: auto;
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;

    .log-item {
      display: flex;
      gap: 1rem;
      margin: 0.5rem 0;
      padding: 0.5rem;
      background: white;
      border-radius: 2px;
      border-left: 2px solid #007bff;

      .timestamp {
        color: #007bff;
        font-weight: bold;
        min-width: 80px;
      }

      .message {
        color: #333;
        flex: 1;
      }
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 1rem;
      font-style: italic;
    }
  }
}
</style>
