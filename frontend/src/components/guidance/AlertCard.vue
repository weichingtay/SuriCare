<template>
  <v-card
    class="alert-card"
    :class="{ 'alert-card-border': !isExpanded }"
    color="white"
    elevation="0"
    rounded="lg"
  >
    <!-- Alert Header Section -->
    <v-card-text
      class="pt-3 pb-3 ps-4 alert-header"
      :class="{ 'header-border': isExpanded }"
      style="background-color: #FFF2F0"
    >
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-start">
          <v-icon
            class="mt-1 mr-3"
            color="#FF5252"
            size="20"
          >
            mdi-alert
          </v-icon>
          <div>
            <h3 class="text-subtitle-1 font-weight-medium mb-1">
              {{ alert.title }}
            </h3>
            <p class="text-body-2 mb-0">
              {{ alert.description }}
            </p>
          </div>
        </div>
        <v-btn
          icon
          size="small"
          variant="text"
          @click="toggleExpanded"
        >
          <v-icon
            :class="{ 'rotate-180': isExpanded }"
            color="grey-darken-2"
            size="20"
            style="transition: transform 0.2s ease"
          >
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </div>
    </v-card-text>

    <!-- Expandable Suggestions Section -->
    <v-expand-transition>
      <div
        v-if="isExpanded"
        class="suggestions-section"
        style="position: relative"
      >
        <v-btn
          class="close-btn"
          density="comfortable"
          icon="$close"
          style="position: absolute; top: 12px; right: 12px; z-index: 1"
          variant="plain"
          @click="$emit('read-alert')"
        />

        <div class="pa-6">
          <div
            v-for="suggestion in alert.suggestions"
            :key="suggestion.id"
            class="suggestion-item mb-6"
          >
            <div class="d-flex align-center mb-3">
              <v-icon
                class="mr-1"
                size="28"
              >
                mdi-lightbulb-variant
              </v-icon>
              <h4 class="text-subtitle-2 font-weight-bold">
                {{ suggestion.title }}
              </h4>
            </div>

            <div class="suggestion-content">
              <p class="text-body-2 line-height-relaxed">
                {{ suggestion.content }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps({
    alert: {
      type: Object,
      required: true,
    },
  })

  const isExpanded = ref(false)
  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value
  }

  defineEmits(['read-alert'])
</script>

<style scoped>
  .alert-card {
    transition: all 0.2s ease-in-out;
  }

  .alert-card-border {
    border: 1.5px solid #ff5252;
  }

  .alert-card:hover {
    transform: translateY(-1px);
  }

  .rotate-180 {
    transform: rotate(180deg);
  }

  .suggestion-item:last-child {
    margin-bottom: 0 !important;
  }

  .suggestion-content {
    padding-left: 0.25rem;
  }

  .line-height-relaxed {
    line-height: 1.6;
  }

  .alert-header {
    border-radius: 8px 8px 0 0;
  }

  .alert-header.header-border {
    border: 1.5px solid #ff5252;
  }

  .suggestions-section {
    background-color: white;
    border-radius: 0 0 8px 8px;
  }
</style>
