<template>
  <div>
    <!-- Alert Cards -->
    <div class="mb-6">
      <AlertCard
        v-for="alert in alerts"
        :key="alert.id"
        :alert="alert"
        class="mb-8"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import AlertCard from "./AlertCard.vue";

const alerts = ref([
  {
    id: 1,
    title: "Vitamin D Deficiency",
    description: "Your child has low levels of vitamin D.",
    type: "warning",
    suggestions: [
      {
        id: 1,
        title: "Suggestions",
        content:
          "Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.",
      },
      {
        id: 2,
        title: "Suggestions",
        content:
          "Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula. Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.",
      },
    ],
  },
  {
    id: 2,
    title: "Vitamin D Deficiency",
    description: "Your child has low levels of vitamin D.",
    type: "warning",
    suggestions: [
      {
        id: 1,
        title: "Suggestions",
        content:
          "Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.",
      },
    ],
  },
  {
    id: 3,
    title: "Vitamin D Deficiency",
    description: "Your child has low levels of vitamin D.",
    type: "warning",
    suggestions: [
      {
        id: 1,
        title: "Suggestions",
        content:
          "Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.",
      },
    ],
  },
  {
    id: 4,
    title: "Vitamin D Deficiency",
    description: "Your child has low levels of vitamin D.",
    type: "warning",
    suggestions: [
      {
        id: 1,
        title: "Suggestions",
        content:
          "Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.",
      },
    ],
  },
]);
</script>
