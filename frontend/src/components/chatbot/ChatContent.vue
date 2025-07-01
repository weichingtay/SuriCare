<template>
  <div class="chat-content d-flex flex-column flex-grow-1">
    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="messages-container flex-grow-1 pa-4"
    >
      <!-- Suggested Prompts -->
      <div
        v-if="messages.length === 0"
        class="empty-state"
      >
        <div class="suggested-prompts mb-8">
          <h1 class="text-h4 font-weight-normal text-center mb-7">
            What can I help with?
          </h1>

          <v-row
            class="mb-1"
            justify="center"
          >
            <v-col
              cols="12"
              lg="8"
              md="8"
            >
              <v-row>
                <v-col
                  v-for="(prompt, index) in suggestedPrompts"
                  :key="index"
                  class="pa-2"
                  cols="12"
                  sm="3"
                >
                  <v-card
                    class="prompt-card rounded-lg pa-4 text-left"
                    hover
                    variant="outlined"
                    @click="selectPrompt(prompt)"
                  >
                    <div class="text-body-2">{{ prompt }}</div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Chat Messages -->
      <div
        class="messages-list"
        :class="{ 'mt-12': messages.length === 0 }"
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
            rounded="lg"
            variant="flat"
          >
            <div v-if="message.isStreaming && !message.text" class="typing-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <div v-else class="text-body-2 markdown-content" v-html="renderMarkdown(message.text)"></div>
            <div v-if="message.isStreaming && message.text" class="streaming-cursor">|</div>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-section pa-4">
      <v-container class="pa-0">
        <v-row justify="center">
          <v-col
            cols="12"
            lg="12"
            md="12"
          >
            <v-card
              class="input-card"
              variant="outlined"
            >
              <div class="d-flex align-center px-4 py-2">
                <v-text-field
                  v-model="inputMessage"
                  class="flex-grow-1 centered-input"
                  hide-details
                  placeholder="Type your questions here"
                  variant="plain"
                  @keydown.enter="sendMessage"
                />
                <v-btn
                  class="ml-2"
                  color="#D87179"
                  :disabled="!inputMessage.trim()"
                  icon
                  variant="text"
                  @click="sendMessage"
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

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import { marked } from 'marked'

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

  const renderMarkdown = (text: string): string => {
    return marked(text)
  }

  const sendMessage = () => {
    if (inputMessage.value.trim()) {
      emit('send-message', inputMessage.value.trim())
      inputMessage.value = ''
    }
  }

  const selectPrompt = prompt => {
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
@import '@/styles/markdown.scss';
@import '@/styles/chat-responsive.scss';
  .chat-content {
    /* Let flexbox handle the sizing so this section uses only the space that
       remains after the header. */
    flex: 1 1 auto;
    min-height: 0; /* Important so the internal scroll container can shrink */
    overflow: hidden; /* Prevent the whole page from scrolling */
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
