<template>
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
</template>

<script setup>
import { ref } from "vue";
import ArticleCard from "./ArticleCard.vue";

const articles = ref([
  {
    id: 1,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 2,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 3,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 4,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 5,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 6,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 7,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 8,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
  {
    id: 9,
    title: "Article Title",
    description:
      "Lorem Ipsum dolor sit amet consectetur. Eu fames et faucibus gravida est non mi massa lacus. Lorem ipsum dolor sit amet consectetur.",
    tags: ["Sleep", "Sleeping"],
  },
]);
</script>
