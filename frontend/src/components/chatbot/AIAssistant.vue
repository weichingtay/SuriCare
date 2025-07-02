<template>
  <div class="mb-6">
    <h2 class="text-body-1 font-weight-medium mb-4">Ask SuriAI Anything</h2>

    <div class="suriai-section">
      <div class="d-flex mb-4">
        <div class="logo-container mr-3">
          <img
            alt="SuriAI Logo"
            src="@/assets/logo.svg"
            style="width: 70px; height: 70px; overflow: hidden; border-radius: 15px; cover"
          >
        </div>
        <div class="d-flex flex-column flex-grow-1">
          <div class="text-body-1 font-weight-medium mb-1">SuriAI</div>
          <div class="text-body-2 text-grey suriai-description mb-1">
            Powered by AI for childcare guidance. SuriAI can help with sleep
            patterns, meal suggestions, development milestones, and more.
          </div>
          <div class="suriai-input-container">
            <v-card
              class="input-card"
              variant="outlined"
            >
              <div class="d-flex align-center px-4 py-2">
                <v-text-field
                  v-model="message"
                  class="flex-grow-1 centered-input"
                  hide-details
                  placeholder="Type your questions here"
                  variant="plain"
                  @keyup.enter="sendMessage"
                />
                <v-btn
                  class="ml-2"
                  color="#D87179"
                  :disabled="!message.trim()"
                  icon
                  variant="text"
                  @click="sendMessage"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useChatbotStore } from '@/stores/chatbot'

  const message = ref('')
  const chatbotStore = useChatbotStore()

  const sendMessage = async () => {
    if (message.value.trim()) {
      // If no current chat, create one first
      if (!chatbotStore.currentChatId) {
        await chatbotStore.handleNewChat()
      }
      
      // Send the message through the store
      await chatbotStore.sendMessage(message.value)
      message.value = ''
    }
  }
</script>

<style lang="scss" scoped>
  @use '@/styles/variables' as *;

  // TODO: MOVE TO GLOBAL STYLES
  // .logo-container {
  //   width: 110px;
  //   height: 110px;
  //   border-radius: 80%;
  //   overflow: hidden;
  //   background-color: $app-beige;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   border: 1px solid $app-primary-light;
  // }

  /* Try targeting the field outline start/end */
  .input-card {
  background-color: white;
  border: 1.5px solid #d87179;
  border-radius: 12px;
  overflow: hidden;
}

.input-card :deep(.v-field__outline) {
  display: none;
}

.input-card :deep(.v-field) {
  border-radius: 24px;
}

.centered-input :deep(.v-field__input) {
  align-items: center;
  padding-top: 0;
  padding-bottom: 0;
}

.centered-input :deep(.v-field__field) {
  display: flex;
  align-items: center;
}

// Remove the old suriai-input styles
</style>
