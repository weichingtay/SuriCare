<template>
  <div class="chat-content d-flex flex-column flex-grow-1">
    <!-- Messages Area -->
    <div
      class="messages-container flex-grow-1 pa-4"
      ref="messagesContainer"
    >
      <div
        v-if="messages.length === 0"
        class="empty-state"
      >
        <!-- Suggested Prompts -->
        <div class="suggested-prompts mb-8">
          <h1 class="text-h4 font-weight-normal text-center mb-7">
            What can I help with?
          </h1>

          <v-row
            justify="center"
            class="mb-1"
          >
            <v-col
              cols="12"
              md="8"
              lg="8"
            >
              <v-row>
                <v-col
                  v-for="(prompt, index) in suggestedPrompts"
                  :key="index"
                  cols="12"
                  sm="3"
                  class="pa-2"
                >
                  <v-card
                    class="prompt-card rounded-lg pa-4 text-left"
                    variant="outlined"
                    hover
                    @click="selectPrompt(prompt)"
                  >
                    <div class="text-body-2">{{ prompt }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col
              cols="12"
              md="8"
              lg="8"
            >
              <v-card
                class="input-card"
                variant="outlined"
              >
                <div class="d-flex align-center px-4 py-2">
                  <v-text-field
                    v-model="inputMessage"
                    placeholder="Type your questions here"
                    variant="plain"
                    hide-details
                    class="flex-grow-1 centered-input"
                    @keydown.enter="sendMessage"
                  />
                  <v-btn
                    icon
                    variant="text"
                    color="#D87179"
                    @click="sendMessage"
                    :disabled="!inputMessage.trim()"
                    class="ml-2"
                  >
                    <v-icon>mdi-send</v-icon>
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Chat Messages -->
      <div
        v-else
        class="messages-list"
      >
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-wrapper mb-4"
          :class="message.sender === 'user' ? 'user-message' : 'ai-message'"
        >
          <v-card
            class="message-card pa-4"
            :class="message.sender === 'user' ? 'user-card' : 'ai-card'"
            variant="flat"
            rounded="lg"
          >
            <div class="text-body-1">{{ message.text }}</div>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="input-section pa-4"
      v-if="messages.length !== 0"
    >
      <v-container class="pa-0">
        <v-row justify="center">
          <v-col
            cols="12"
            md="12"
            lg="12"
          >
            <v-card
              class="input-card"
              variant="outlined"
            >
              <div class="d-flex align-center px-4 py-2">
                <v-text-field
                  v-model="inputMessage"
                  placeholder="Type your questions here"
                  variant="plain"
                  hide-details
                  class="flex-grow-1 centered-input"
                  @keydown.enter="sendMessage"
                />
                <v-btn
                  icon
                  variant="text"
                  color="#D87179"
                  @click="sendMessage"
                  :disabled="!inputMessage.trim()"
                  class="ml-2"
                >
                  <v-icon>mdi-send</v-icon>
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, nextTick } from 'vue'

  const props = defineProps({
    messages: {
      type: Array,
      required: true,
    },
    suggestedPrompts: {
      type: Array,
      default: () => [],
    },
  })

  const emit = defineEmits(['send-message'])

  const inputMessage = ref('')
  const messagesContainer = ref(null)

  const sendMessage = () => {
    if (inputMessage.value.trim()) {
      emit('send-message', inputMessage.value.trim())
      inputMessage.value = ''
    }
  }

  const selectPrompt = (prompt) => {
    emit('send-message', prompt)
  }

  // Auto-scroll to bottom when new messages arrive
  watch(
    () => props.messages,
    async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    },
    { deep: true }
  )
</script>

<style scoped>
  .chat-content {
    /* Let flexbox handle the sizing so this section uses only the space that
       remains after the header. */
    flex: 1 1 auto;
    min-height: 0; /* Important so the internal scroll container can shrink */
    overflow: hidden; /* Prevent the whole page from scrolling */
    background-color: #faf9f5;
  }

  .messages-container {
    /* height: calc(100vh - (72px + 800px)); */
    overflow-y: auto;
    flex-grow: 1;
    min-height: 0; /* Allow the container to shrink and scroll instead of forcing the page to grow */
  }

  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .prompt-card {
    cursor: pointer;
    transition: all 0.2s;
    border: 2px AEAAA9;
    background-color: white;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .prompt-card:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .message-wrapper {
    display: flex;
  }

  .user-message {
    justify-content: flex-end;
  }

  .ai-message {
    justify-content: flex-start;
  }

  .message-card {
    max-width: 70%;
    word-wrap: break-word;
  }

  .user-card {
    background-color: white;
    border: 1px solid black;
  }

  .ai-card {
    background-color: rgba(216, 113, 121, 0.3);
  }

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
</style>
