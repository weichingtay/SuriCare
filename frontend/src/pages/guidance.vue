<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6">
        <AppHeader />
        <NavigationTabs @tab-changed="handleTabChange" />
        <ArticleGrid v-if="currentTab === 'guidance'" />
        <AlertsView v-if="currentTab === 'alert'" />
        <SavedView v-if="currentTab === 'saved'" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import AppHeader from "../components/AppHeader.vue";
import NavigationTabs from "../components/NavigationTabs.vue";
import ArticleGrid from "../components/ArticleGrid.vue";
import AlertsView from "../components/AlertsView.vue";
import SavedView from "../components/SavedView.vue";

const currentTab = ref("guidance");

const handleTabChange = (tab) => {
  currentTab.value = tab;
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap");

* {
  font-family: "Inter", sans-serif !important;
}

.v-application {
  font-family: "Inter", sans-serif !important;
}

.v-main {
  background-color: #faf9f5;
}
</style>
