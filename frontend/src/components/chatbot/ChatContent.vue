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

      <!-- Chat Messages with Center Alignment -->
      <div class="messages-list" :class="{ 'mt-12': messages.length === 0 }">
        <div class="messages-centered-container">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-wrapper mb-4"
            :class="message.sender === 'user' ? 'user-message' : 'ai-message'"
          >
            <v-card
              class="message-card"
              :class="message.sender === 'user' ? 'user-card' : 'ai-card'"
              rounded="lg"
              variant="flat"
            >
              <!-- Custom Loading Animation for AI responses -->
              <div v-if="message.isStreaming && !message.text && message.sender === 'ai'" class="custom-loading-animation">
                <div class="loading-container">
                  <img 
                    class="loading-gif"
                    :src="loadingAnimationSrc"
                    alt="Loading animation"
                  />
                </div>
              </div>
              
              <!-- Message content -->
              <div v-else class="text-body-2 markdown-content" v-html="renderMarkdown(message.text)"></div>
              
              <!-- Streaming cursor for ongoing responses -->
              <div v-if="message.isStreaming && message.text" class="streaming-cursor">|</div>
            </v-card>

             <!-- Action buttons -->
              <div 
                class="message-actions"
                :class="message.sender === 'user' ? 'user-actions' : 'ai-actions'"
              >
                <!-- User message actions: Edit + Copy -->
                <template v-if="message.sender === 'user'">
                  <v-btn
                    class="action-btn"
                    size="small"
                    variant="text"
                    icon
                   
                  >
                    <v-icon size="18">mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                  </v-btn>
                  <v-btn
                    class="action-btn"
                    size="small"
                    variant="text"
                    icon
                    @click="copyMessage(message.text)"
                  >
                    <v-icon size="18">mdi-content-copy</v-icon>
                    <v-tooltip activator="parent" location="top">Copy</v-tooltip>
                  </v-btn>
                </template>
                
                <!-- AI message actions: Copy only -->
                <template v-else>
                  <v-btn
                    class="action-btn"
                    size="small"
                    variant="text"
                    icon
                    @click="copyMessage(message.text)"
                  >
                    <v-icon size="18">mdi-content-copy</v-icon>
                    <v-tooltip activator="parent" location="top">Copy</v-tooltip>
                  </v-btn>
                </template>
              </div>
          </div>
        </div>
      </div>

      <!-- Fade effect overlay -->
      <div class="fade-overlay"></div>

      
    </div>

    <!-- Input Area -->
    <!-- Input Area -->
    <div class="input-section">
      <div class="input-centered-container">
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

        <!-- Disclaimer -->
        <div class="disclaimer-text">
          SuriAI  is for general guidance only. For medical or urgent matters, please consult a professional.
        </div>
      
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import { marked } from 'marked'

  import loadingAnimationSrc from '@/assets/SURICARE-ANIMATION.gif'

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

  const emit = defineEmits(['send-message', 'edit-message', 'copy-message'])

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


  //EDIT & COPY BUTTON
  // Edit functions
 
  const copyMessage = async (text: string) => {
    try {
      // Strip HTML tags from markdown content for cleaner copy
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = marked(text)
      const plainText = tempDiv.textContent || tempDiv.innerText || text
      
      await navigator.clipboard.writeText(plainText)
      emit('copy-message', 'Message copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy message:', err)
      emit('copy-message', 'Failed to copy message')
    }
  }
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
     padding: 24px 24px 12px 24px; 
    position: relative;
  }

 

  .messages-container {
  overflow-y: auto;
  flex-grow: 1;
  min-height: 0;
  position: relative;
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

/* Hide scrollbar for WebKit browsers (Chrome, Safari, Edge) */
.messages-container::-webkit-scrollbar {
  display: none;
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
    border: 1px #AEAAA9;
    background-color: white;
    min-height: 120px;
    min-width: 155px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px !important;
  }

  .prompt-card:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .message-wrapper {
  display: flex;
  flex-direction: column;
}

.message-with-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message-card{
    padding: 28px !important;
    max-width: 100%;
  }

  .user-message {
    justify-content: flex-end;
  }

  .user-message .message-card {
    align-self: flex-end;
  }


  .ai-message {
    font-size: 28px;
    justify-content: flex-start;
  }


  .user-card {
    background-color: #ffe1bb;
    padding: 12px 18px !important;
    box-shadow: none !important;
  }



  .ai-card {
    background-color: white;
    box-shadow: none !important;
    border: 1px solid #F5F5F5;
    max-width: 768px;
    margin-top: 8px;
  }

  /* Custom Loading Animation Styles */
  .custom-loading-animation {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 16px;
    width: fit-content;
    min-width: auto;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    width: fit-content;
  }

  .loading-gif {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 8px;
  }

  .loading-fallback {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    color: #d87179;
    font-size: 12px;
  }

  .loading-text {
    color: #d87179;
    font-size: 12px;
    font-weight: 500;
    animation: fade 2s ease-in-out infinite;
    align-self: flex-start;
  }

  @keyframes fade {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }




  /* Message Actions Styling */
  .message-actions {
    display: flex;
    gap: 4px;
    margin-top: 4px;
    opacity: 1;
  }

  .user-actions {
  justify-content: flex-start;
  align-self: flex-end;
}

.ai-actions {
  justify-content: flex-start;
  align-self: flex-start;
}
  .action-btn {
    min-width: auto !important;
    width: 24px !important;
    height: 24px !important;
    color: #9f9f9f !important;
    border-radius: 6px !important;
    box-shadow: none !important;
  }

  .action-btn:hover {
    background-color: #f5f5f5 !important;
    border-color: #d0d0d0 !important;
  }

  .input-section {
    padding: 0;
    position: relative;
    z-index: 2; /* Ensure input stays above fade */
  }

  .input-centered-container {
    max-width: 850px;
    margin: 0 auto;
    padding: 0;
  }

  .input-card {
    background-color: white;
    border: 1.5px solid #d87179;
    border-radius: 12px;
    overflow: hidden;
   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
   
    
  }

  .input-card :deep(.v-field__outline) {
    display: none;
  }

  .input-card :deep(.v-field) {
    border-radius: 24px !important;  
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

  /* Markdown list styling */
  .markdown-content :deep(ul) {
    padding-left: 20px;
    margin: 8px 0;
  }

  .markdown-content :deep(ol) {
    padding-left: 20px;
    margin: 8px 0;
  }

  .markdown-content :deep(li) {
    margin: 4px 0;
    list-style-position: outside;
  }

  .markdown-content :deep(ul li) {
    list-style-type: disc;
  }

  .markdown-content :deep(ol li) {
    list-style-type: decimal;
  }

  /* Text justification and line height for message content */
  .markdown-content {
    text-align: justify;
    line-height: 1.6;
  }


  /*align centered*/
  .messages-centered-container {
    max-width: 768px; 
    margin: 0 auto;
    padding: 0 16px;
  }


  /*FADE*/
  .chat-content::after {
    content: '';
    position: absolute;
    bottom: 100px; /* Position above the input area */
    left: 50%;
    transform: translateX(-50%);
    width: 840px; /* Match message width */
    max-width: calc(100vw - 32px); /* Responsive on mobile */
    height: 50px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(250, 249, 245, 1));
    pointer-events: none;
    z-index: 1;
  }

  .disclaimer-text {
    font-size: 12px;
    color: #ba5858;
    text-align: center;
    margin-top: 8px;
    margin-bottom: 0;
  }
</style>