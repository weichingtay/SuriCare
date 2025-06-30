<template>
  <v-card
    class="mx-auto article-card"
    rounded="lg"
    variant="outlined"
  >
    <v-card-text class="pa-5">
      <div class="d-flex justify-space-between align-center mb-4">
        <p class="text-h5 font-weight-regular">
          {{ article.title }}
        </p>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="handleToggleSave"
        >
          <v-icon
            :color="isSaved ? 'red' : 'black'"
            size="20"
          >
            {{ isSaved ? 'mdi-heart' : 'mdi-heart-outline' }}
          </v-icon>
        </v-btn>
      </div>

      <p class="text-body-2 mb-6">
        {{ article.description }}
      </p>

      <div class="d-flex justify-space-between align-center">
        <div class="d-flex ga-3">
          <v-chip
            v-for="tag in article.tags"
            :key="tag"
            class="text-caption"
            color="#E6E2DF"
            variant="flat"
          >
            {{ tag }}
          </v-chip>
        </div>

        <v-btn
          class="text-capitalize px-4 font-weight-regular text-body-2"
          color="#D87179"
          rounded="lg"
          variant="flat"
        >
          Read Article
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'

  const props = defineProps({
    article: {
      type: Object,
      required: true,
    },
  })

  const toggleSaveArticle = inject('toggleSaveArticle')
  const isArticleSaved = inject('isArticleSaved')

  const isSaved = computed(() => isArticleSaved(props.article.id))

  const handleToggleSave = () => {
    toggleSaveArticle(props.article)
  }
</script>

<style scoped>
  .article-card {
    background-color: white;
    height: 100%;
    transition: transform 0.2s ease-in-out;
    border: 1.25px solid #aeaaa9;
  }

  .article-card:hover {
    transform: translateY(-2px);
  }
</style>
