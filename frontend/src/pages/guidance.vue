<template>
  <v-app>
    <v-main>
      <v-container
        class="pa-6"
        fluid
      >
        <div class="mb-8">
          <div class="d-flex justify-space-between align-center mb-2">
            <h1 class="text-h4">Guidance</h1>
            <v-btn
              v-if="currentTab === 'guidance'"
              icon
              size="small"
              variant="text"
              :loading="isLoading"
              @click="handleRefresh"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
          <p class="text-body-1">Gain info here</p>
        </div>

        <!-- Debug info -->
        <div v-if="DEV_MODE" style="background: lightblue; padding: 10px; margin: 10px; border: 2px solid blue;">
            <h3>DEBUG: Guidance Page</h3>
            <p>currentTab: {{ currentTab }}</p>
            <p>Should show ArticleGrid: {{ currentTab === 'guidance' }}</p>
        </div>

        <!-- <AppHeader /> -->
        <NavigationTabs @tab-changed="handleTabChange" />
        <ArticleGrid v-if="currentTab === 'guidance'" />
        <AlertsView v-if="currentTab === 'alert'" />
        <SavedView v-if="currentTab === 'saved'" />
      </v-container>

      <!-- Refresh Confirmation Dialog -->
      <v-dialog
        v-model="refreshPromptVisible"
        max-width="500"
        persistent
      >
        <v-card>
          <v-card-title class="text-h6">
            Refresh Articles?
          </v-card-title>
          <v-card-text>
            <p class="mb-3">
              Your child's profile has changed. Refresh articles for <strong>{{ refreshPromptChild }}</strong>?
            </p>
            <v-alert
              type="warning"
              variant="tonal"
              density="compact"
            >
              This will replace current articles with new recommendations.
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="guidanceStore.cancelRefresh"
            >
              Keep Current Articles
            </v-btn>
            <v-btn
              color="primary"
              @click="guidanceStore.confirmRefresh"
            >
              Refresh Articles
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
  import { onMounted, provide, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useGuidanceStore } from '@/stores/guidance'
  import DEV_MODE from '@/utils/devMode'
  import NavigationTabs from '../components/guidance/NavigationTabs.vue'
  import ArticleGrid from '../components/guidance/ArticleGrid.vue'
  import AlertsView from '../components/guidance/AlertsView.vue'
  import SavedView from '../components/guidance/SavedView.vue'

  const route = useRoute()
  const currentTab = ref('guidance')
  const guidanceStore = useGuidanceStore()

  // Get reactive references from guidance store
  const { isArticleSaved, savedArticles, isLoading, refreshPromptVisible, refreshPromptChild } = storeToRefs(guidanceStore)

  // Initialize tab based on route query parameter
  onMounted(() => {
    const tabFromQuery = route.query.tab as string
    if (tabFromQuery && ['guidance', 'alert', 'saved'].includes(tabFromQuery)) {
      currentTab.value = tabFromQuery
    }
  })

  const handleTabChange = (tab: string): void => {
    currentTab.value = tab
  }

  const handleRefresh = async (): Promise<void> => {
    const { useChildrenStore } = await import('@/stores/children')
    const childrenStore = useChildrenStore()
    
    if (childrenStore.currentChild) {
      await guidanceStore.refreshArticles(childrenStore.currentChild.id, true)
    }
  }

  // Provide store functions to child components for compatibility
  provide('savedArticles', savedArticles)
  provide('toggleSaveArticle', guidanceStore.toggleSaveArticle)
  provide('isArticleSaved', (articleId: string) => isArticleSaved.value(articleId))
</script>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

  * {
    font-family: 'Inter', sans-serif !important;
  }

  .v-application {
    font-family: 'Inter', sans-serif !important;
  }

  .v-main {
    background-color: #faf9f5;
  }
</style>
