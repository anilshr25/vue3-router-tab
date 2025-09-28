<template>
  <div class="tabs">
    <ul class="tab-list">
      <li
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
      >
        <RouterLink
          :to="tab.path"
          class="tab-link"
          active-class="active"
        >
          {{ tab.label }}
        </RouterLink>
      </li>
    </ul>

    <div class="tab-content">
      <router-tab />
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" }
];
</script>

<style scoped>
.tabs {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.tab-list {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: 1px solid #e2e8f0;
}

.tab-item {
  margin: 0;
}

.tab-link {
  display: block;
  padding: 10px 16px;
  text-decoration: none;
  font-size: 14px;
  color: #374151;
  transition: background 0.2s, color 0.2s;
}

.tab-link:hover {
  background: #f9fafb;
}

.tab-link.active {
  background: #fff;
  color: #2563eb;
  font-weight: 600;
  border-bottom: 2px solid #2563eb;
}

.tab-content {
  padding: 16px;
  font-size: 14px;
  color: #374151;
}
</style>
