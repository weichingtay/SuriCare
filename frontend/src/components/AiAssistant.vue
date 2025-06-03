<!-- AiAssistant.vue -->
<template>
  <v-card class="ai-assistant-card">
    <v-card-text class="pa-6">
      <div class="d-flex align-start mb-4">
        <v-avatar size="48" rounded="lg" class="mr-4 assistant-avatar">
          <v-img
            :src="aiAvatarUrl"
            height="100%"
            cover
          />
        </v-avatar>
        <div class="flex-grow-1">
          <h3 class="text-h6 mb-1">Ask SuriAI About Your Child</h3>
          <p class="text-body-2 text-medium-emphasis">
            Powered by AI for childcare guidance. SuriAI can help with sleep patterns, meal suggestions, development milestones, and more.
          </p>
        </div>
      </div>

      <v-text-field
        v-model="question"
        placeholder="Type your questions here..."
        variant="outlined"
        density="comfortable"
        hide-details
        bg-color="white"
        class="question-input"
        @keyup.enter="handleSendQuestion"
      >
        <template v-slot:append-inner>
          <v-btn
            icon="mdi-send"
            variant="text"
            color="primary"
            :disabled="!question.trim()"
            @click="handleSendQuestion"
          ></v-btn>
        </template>
      </v-text-field>

      <div class="mt-4 d-flex align-center suggested-questions">
        <v-chip-group>
          <v-chip
            v-for="(suggestion, index) in suggestedQuestions"
            :key="index"
            density="comfortable"
            variant="outlined"
            class="suggestion-chip"
            @click="question = suggestion"
          >
            {{ suggestion }}
          </v-chip>
        </v-chip-group>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import meerkatIcon from '../assets/Meerkat_Mascot.svg'

const aiAvatarUrl = meerkatIcon
const question = ref('')

// TODO: should this be hardcoded or dynamic?
const suggestedQuestions = [
  "Sleep schedule advice?",
  "Meal planning tips",
  "Development milestones"
]

const handleSendQuestion = () => {
  if (question.value.trim()) {
    // TODO: Implement AI chat functionality
    console.log('Sending question:', question.value)
    question.value = ''
  }
}
</script>

<style scoped>
.ai-assistant-card {
  background-color: #FDF6E9 !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.assistant-avatar {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.question-input {
  :deep(.v-field__outline) {
    --v-field-border-opacity: 0.1;
  }

  :deep(.v-field__overlay) {
    opacity: 0;
  }
}

.suggestion-chip {
  background-color: white !important;
  font-size: 0.875rem;

  &:hover {
    background-color: #FAF0DE !important;
  }
}

:deep(.v-card-text) {
  position: relative;
}
</style>
