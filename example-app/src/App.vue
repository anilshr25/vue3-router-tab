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
  primary: "#f56505",
  background: "#ffffff",
  text: "#2a2525",
  border: "#e2e8f0",
  
  activeBackground: "#f56505",
  activeText: "#ffffff",
  activeBorder: "#f56505",
  
  headerBackground: "#ffffff",
  
  buttonBackground: "#f8fafc",
  buttonColor: "#f56505",
  activeButtonBackground: "#f56505",
  activeButtonColor: "#ffffff",
  
  iconColor: "#475569",
}

const defaultDarkColor: ColorStyle = {
  primary: "#f56505",
  background: "#2a2525",
  text: "#f1f5f9",
  border: "#334155",
  
  activeBackground: "#2a2525",
  activeText: "#f56505",
  activeBorder: "#f56505",
  
  headerBackground: "#1e293b", // Darker shade of primary
  
  buttonBackground: "#2a2525",
  buttonColor: "#f1f5f9",
  activeButtonBackground: "#f56505",
  activeButtonColor: "#2a2525",
  
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
