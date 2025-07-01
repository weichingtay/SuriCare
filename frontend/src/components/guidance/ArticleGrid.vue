<template>
  <div>
    <div
      v-if="articles.length === 0"
      class="text-center py-12"
    >
      <v-icon
        class="mb-4"
        color="grey-lighten-2"
        size="64"
      >
        mdi-book-outline
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">No articles available</h3>
      <p class="text-body-2 text-grey-darken-1">
        Please check back later or contact support if you need help.
      </p>
    </div>

    <v-row>
      <v-col
        v-for="article in articles"
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

<script setup lang="ts">
  import { ref } from 'vue'
  import ArticleCard from './ArticleCard.vue'

  const articles = ref([
    {
      id: 1,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 2,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 3,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 4,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 5,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 6,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 7,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 8,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
    {
      id: 9,
      title: 'Article Title',
      description:
        'Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.',
      tags: ['Sleep', 'Sleeping'],
    },
  ])
</script>
