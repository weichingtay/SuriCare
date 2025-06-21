<template>
  <v-app>
    <v-main>
      <v-container
        fluid
        class="pa-6"
      >
        <div class="mb-8">
          <h1 class="text-h4 mb-2">Guidance</h1>
          <p class="text-body-1">Gain info here</p>
        </div>

        <!-- <AppHeader /> -->
        <NavigationTabs @tab-changed="handleTabChange" />
        <ArticleGrid v-if="currentTab === 'guidance'" />
        <AlertsView v-if="currentTab === 'alert'" />
        <SavedView v-if="currentTab === 'saved'" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import { ref } from 'vue'
  import AppHeader from '../components/AppHeader.vue'
  import NavigationTabs from '../components/guidance/NavigationTabs.vue'
  import ArticleGrid from '../components/guidance/ArticleGrid.vue'
  import AlertsView from '../components/guidance/AlertsView.vue'
  import SavedView from '../components/guidance/SavedView.vue'
  import { useRouter } from 'vue-router'

const router = useRouter()
  const currentTab = ref('guidance')

  const handleTabChange = (tab) => {
    currentTab.value = tab
  }

  // Global state for saved articles
  const savedArticles = ref([])

  // Provide the saved articles state to child components
  provide('savedArticles', savedArticles)

  const toggleSaveArticle = (article) => {
    const existingIndex = savedArticles.value.findIndex(
      (saved) => saved.id === article.id
    )

    if (existingIndex > -1) {
      // Remove from saved
      savedArticles.value.splice(existingIndex, 1)
    } else {
      // Add to saved
      savedArticles.value.push({ ...article })
    }
  }

  provide('toggleSaveArticle', toggleSaveArticle)

  const isArticleSaved = (articleId) => {
    return savedArticles.value.some((saved) => saved.id === articleId)
  }

  provide('isArticleSaved', isArticleSaved)
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
