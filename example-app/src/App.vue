<template>
  <v-app>
    <RouterView />
  </v-app>
</template>
<script setup lang="ts">
import { onMounted, watch } from "vue";
import { setRouterTabsTheme, setRouterTabsPrimary } from "vue3-router-tab";
import { useTheme } from "vuetify";

const setTabThemeStyle = () => {
  const themeStyle = useTheme();

  watch(
    () => themeStyle.current.value,
    () => {
      setRouterTabsTheme(window.localStorage.getItem("tab-theme-style") ?? "system");
      setRouterTabsPrimary(window.localStorage.getItem("tab-theme-primary-color") ?? "#635bff");
    },
    { immediate: true }
  );
};
onMounted(() => {
  setTabThemeStyle();
});
</script>
