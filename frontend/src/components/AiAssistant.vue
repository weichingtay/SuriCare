<!-- AiAssistant.vue -->
<template>
  <v-card elevation="1" class="mb-6">
    <v-card-text>
      <div class="d-flex align-center mb-3">
        <v-avatar size="40" class="mr-3" rounded="0">
          <v-img 
            height="90%"
            :src="aiAvatarUrl"
          />
        </v-avatar>
        <div>
          <h3 class="text-h6">Ask SuriAI About Your Child</h3>
          <p class="text-body-2 text-grey">
            Powered by AI for childcare guidance. SuriAI can help with sleep patterns, meal suggestions, development milestones, and more.
          </p>
        </div>
      </div>
      <v-text-field
        v-model="question"
        placeholder="Type your questions here"
        variant="outlined"
        density="compact"
        append-inner-icon="mdi-send"
        hide-details
        @click:append-inner="handleSendQuestion"
        @keyup.enter="handleSendQuestion"
      ></v-text-field>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import meerkatIcon from '../assets/Meerkat_Mascot.svg'

const aiAvatarUrl = meerkatIcon

const question = ref('')

const handleSendQuestion = () => {
  if (question.value.trim()) {
    // TODO: Implement AI chat functionality
    console.log('Sending question:', question.value)
    question.value = ''
  }
}
</script> 