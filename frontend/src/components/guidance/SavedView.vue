<template>
  <div>
    <div
      v-if="savedArticles.length === 0"
      class="text-center py-12"
    >
      <v-icon
        size="64"
        color="grey-lighten-2"
        class="mb-4"
      >
        mdi-heart-outline
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No saved articles yet</h3>
      <p class="text-body-2 text-grey-darken-1">
        Click the heart icon on articles in the Guidance tab to save them here
      </p>
    </div>

    <v-row v-else>
      <v-col
        v-for="article in savedArticles"
        :key="article.id"
        cols="12"
        md="4"
        sm="6"
      >
        <ArticleCard :article="article" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import { inject } from 'vue'
  import ArticleCard from './ArticleCard.vue'

  const savedArticles = inject('savedArticles')
</script>
