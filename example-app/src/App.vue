<template>
  <v-app>
    <RouterView />
  </v-app>
</template>
<script setup lang="ts">
import { onMounted, watch } from "vue";
import { setRouterTabsTheme, setRouterTabsPrimary } from "vue3-router-tab";
import { useTheme } from "vuetify";

const theme = useTheme();

const setTabThemeStyle = () => {
  watch(() => {
    setRouterTabsTheme(theme.global.current.value.dark ? "dark" : "light");
    setRouterTabsPrimary(
      theme.global.current.value.dark
        ? theme.themes.value.dark.colors.primary
        : theme.themes.value.light.colors.primary
    );
  });
};
onMounted(() => {
  setTabThemeStyle();
});
</script>
