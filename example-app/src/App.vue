<template>
  <v-app>
    <RouterView />
  </v-app>
</template>
<script setup lang="ts">
import { onMounted, watch } from "vue";
import { setRouterTabsTheme, setRouterTabsPrimary } from "vue3-router-tab";
import { useTheme } from "vuetify";
import { ColorStyle } from "../../lib/theme";

const defaultColors: ColorStyle = {
  primary: "#034960",
  background: "#ffffff",
  text: "#1e293b",
  border: "#e2e8f0",
  
  activeBackground: "#034960",
  activeText: "#ffffff",
  activeBorder: "#034960",
  
  headerBackground: "#ffff",
  
  buttonBackground: "#f8fafc",
  buttonColor: "#034960",
  activeButtonBackground: "#034960",
  activeButtonColor: "#ffffff",
  
  iconColor: "#475569",
}

const defaultDarkColor: ColorStyle = {
  primary: "#38bdf8",
  background: "#0f172a",
  text: "#f1f5f9",
  border: "#334155",
  
  activeBackground: "#1e293b",
  activeText: "#38bdf8",
  activeBorder: "#38bdf8",
  
  headerBackground: "#fffff", // Darker shade of primary
  
  buttonBackground: "#1e293b",
  buttonColor: "#f1f5f9",
  activeButtonBackground: "#38bdf8",
  activeButtonColor: "#0f172a",
  
  iconColor: "#cbd5e1",
}

const setTabThemeStyle = () => {
  const themeStyle = useTheme();

  watch(
    () => themeStyle.current.value,
    () => {
      console.log("Theme changed", themeStyle.current.value.dark);
      setRouterTabsTheme(window.localStorage.getItem("tab-theme-style"));
      setRouterTabsPrimary(themeStyle.current.value.dark ? defaultDarkColor : defaultColors);
    },
    { immediate: true }
  );
};
onMounted(() => {
  setTabThemeStyle();
});
</script>
