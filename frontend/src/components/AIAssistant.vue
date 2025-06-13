<template>
  <div class="mb-6">
    <h2 class="text-body-1 font-weight-medium mb-4">
      Ask SuriAI Anything
    </h2>

    <div class="suriai-section">
      <div class="d-flex mb-4">
        <v-avatar
          size="40"
          class="mr-3 flex-shrink-0"
        >
          <v-img
            src="@/assets/logo.svg"
          />
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-medium mb-1">
            SuriAI
          </div>
          <div class="text-body-2 text-grey suriai-description">
            Powered by AI for childcare guidance. SuriAI
            can help with sleep patterns, meal
            suggestions, development milestones, and
            more.
          </div>
        </div>
      </div>

      <div class="suriai-input-container">
        <v-text-field
          v-model="message"
          placeholder="Type your questions here"
          variant="outlined"
          density="comfortable"
          hide-details
          class="suriai-input"
          @keyup.enter="sendMessage"
        >
          <template v-slot:append-inner>
            <v-btn
              icon
              size="small"
              color="red"
              variant="flat"
              @click="sendMessage"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')

const emit = defineEmits(['send-message'])

const sendMessage = () => {
  if (message.value.trim()) {
    emit('send-message', message.value)
    message.value = ''
  }
}
</script>

<style lang="scss" scoped>

</style> 