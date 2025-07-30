<template>
  <v-app>
    <v-layout>
      <!-- Sidebar -->
      <ChatSidebar
        :active-chat-id="currentChatId"
        :chat-history="chatHistory"
        @new-chat="handleNewChat"
        @select-chat="handleSelectChat"
        @delete-chat="handleDeleteChat"
      />

      <!-- Main Content -->
      <v-main class="d-flex flex-column">
        <div class="d-flex align-center ml-6 mt-6">
          <v-avatar class="mr-4" rounded="0" size="60">
            <v-img alt="SuriAI" height="92.25%" src="@/assets/logo.png" />
          </v-avatar>
          <div>
            <span class="text-h4 font-weight-medium">SuriAI</span>
            <div v-if="childrenStore.currentChild" class="text-caption text-medium-emphasis">
              Chat context: {{ childrenStore.currentChild.name }}
            </div>
            <div v-else class="text-caption text-medium-emphasis">
              General chat (no child selected)
            </div>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="d-flex justify-center align-center pa-8">
          <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
          <span class="ml-4">Loading chat history...</span>
        </div>

        <!-- Error state -->
        <v-alert
          v-if="error && showError"
          type="error"
          class="ma-4"
          closable
          @click:close="showError = false"
        >
          <div class="d-flex align-center">
            <div class="flex-grow-1">
              <strong>Connection Error</strong><br>
              {{ error }}
            </div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              @click="loadChatHistory"
              class="ml-4"
            >
              Retry
            </v-btn>
          </div>
        </v-alert>

        <ChatContent
          v-if="!isLoading"
          :messages="currentMessages"
          :suggested-prompts="suggestedPrompts"
          :initial-message="initialMessage"
          :auto-send="autoSend"
          @send-message="handleSendMessage"
        />
      </v-main>
    </v-layout>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Delete Chat
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete this chat? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cancelDeleteChat">
            Cancel
          </v-btn>
          <v-btn color="error" text @click="confirmDeleteChat">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import axios from 'axios';
  import ChatSidebar from '../components/chatbot/ChatSidebar.vue';
  import ChatContent from '../components/chatbot/ChatContent.vue';
  import { useChildrenStore } from '../stores/children';

  // State
  const ownerId = ref(1); // Placeholder for the current user's ID
  const childrenStore = useChildrenStore();
  const route = useRoute();

  // Single child selection for chat context
  const selectedChildForChat = ref<number | null>(null);

  // Always use contextual chat when a child is selected
  const useContextualChat = computed(() => selectedChildForChat.value !== null);
  const chatHistory = ref([]);
  const currentChatId = ref<string | null>(null);

  // Error handling state
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const showError = ref(false);
  const suggestedPrompts = ref([
    'How do I treat a mild rash at home?',
    'What are the activities to help my child with motor skills?',
    'When is the best time to visit the doctor?',
    'What are the symptoms of a rash?',
  ]);

  // Computed
  const currentChat = computed(() =>
    chatHistory.value.find((chat: any) => chat.id === currentChatId.value)
  );

  const currentMessages = computed(() =>
    currentChat.value?.messages || []
  );

  // Helper function to format date for grouping
  const formatDateForGrouping = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Methods
  const handleNewChat = () => {
    // Simply clear the current chat selection - actual chat will be created when user sends first message
    currentChatId.value = null;
    
    // Clear any previous errors
    error.value = null;
    showError.value = false;
  };

  const handleSelectChat = async (chatId: string) => {
    currentChatId.value = chatId;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.get(`${baseUrl}/chats/${chatId}/messages`);
      const messages = response.data.map((msg: any) => ({
        id: msg.id,
        text: msg.message || msg.text,
        sender: msg.sender
      }));
      const chatIndex = chatHistory.value.findIndex((chat: any) => chat.id === chatId);
      if (chatIndex !== -1) {
        chatHistory.value[chatIndex].messages = messages;
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      error.value = getErrorMessage(err);
      showError.value = true;
    }
  };

  const showDeleteDialog = ref(false);
  const chatToDelete = ref<string | null>(null);

  const handleDeleteChat = (chatId: string) => {
    console.log('Delete chat called for ID:', chatId);
    chatToDelete.value = chatId;
    showDeleteDialog.value = true;
  };

  const confirmDeleteChat = async () => {
    if (chatToDelete.value === null) return;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      await axios.delete(`${baseUrl}/chats/${chatToDelete.value}`);

      // Remove chat from local state
      const chatIndex = chatHistory.value.findIndex((chat: any) => chat.id === chatToDelete.value);
      if (chatIndex !== -1) {
        chatHistory.value.splice(chatIndex, 1);
      }

      // If the deleted chat was the current one, select another chat or clear selection
      if (currentChatId.value === chatToDelete.value) {
        if (chatHistory.value.length > 0) {
          currentChatId.value = chatHistory.value[0].id;
          await handleSelectChat(currentChatId.value);
        } else {
          currentChatId.value = null;
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }

    showDeleteDialog.value = false;
    chatToDelete.value = null;
  };

  const cancelDeleteChat = () => {
    showDeleteDialog.value = false;
    chatToDelete.value = null;
  };


  // Helper function to get error message from axios error
  const getErrorMessage = (error: any): string => {
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to connect to the server. Please check if the backend is running and try again.';
    }
    if (error.response?.status === 500) {
      return 'Server error. This might be a database connection issue. Please try refreshing the page.';
    }
    if (error.response?.status === 404) {
      return 'Chat data not found. The database might need to be set up.';
    }
    return error.response?.data?.detail || error.message || 'An unexpected error occurred';
  };

  // Load chat history filtered by current child
  const loadChatHistory = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

      // Build URL with optional child filter
      let url = `${baseUrl}/chats/${ownerId.value}`;
      if (selectedChildForChat.value !== null) {
        url += `?child_id=${selectedChildForChat.value}`;
      }

      const response = await axios.get(url);
      chatHistory.value = response.data.map((chat: any) => ({
        ...chat,
        messages: [],
        date: formatDateForGrouping(chat.created_at || chat.updated_at || new Date().toISOString())
      }));

      if (chatHistory.value.length > 0) {
        currentChatId.value = chatHistory.value[0].id;
        await handleSelectChat(currentChatId.value);
      }
    } catch (err: any) {
      error.value = getErrorMessage(err);
      showError.value = true;
      console.error('Error fetching chat history:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Pass the query message to ChatContent for pre-filling
  const initialMessage = route.query.message && typeof route.query.message === 'string' ? route.query.message : null;
  const autoSend = route.query.autoSend === 'true';

  // Watch for changes in global child selection and sync to chat selection
  watch(() => childrenStore.currentChild, async (newChild, oldChild) => {
    if (newChild) {
      const newChildId = newChild.id;

      // Update selected child for chat
      selectedChildForChat.value = newChildId;

      // Reload chat history if the child actually changed
      if (!oldChild || oldChild.id !== newChildId) {
        await loadChatHistory();
        // Clear current chat selection since we're switching contexts
        currentChatId.value = null;
      }
    } else {
      // No child selected - show all chats or general chats
      selectedChildForChat.value = null;
      await loadChatHistory();
      currentChatId.value = null;
    }

    // No auto-sending logic needed anymore
  }, { immediate: true });

  const handleSendMessage = async (message: string) => {
    let currentChatIndex = chatHistory.value.findIndex(
      chat => chat.id === currentChatId.value
    );

    // If no current chat exists, create a new one with the first message
    if (currentChatIndex === -1) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const chatTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '');
        
        const response = await axios.post(`${baseUrl}/chats?owner_id=${ownerId.value}`, {
          title: chatTitle,
          child_id: selectedChildForChat.value
        });
        const newChat = {
          ...response.data,
          title: chatTitle,
          messages: [],
          date: formatDateForGrouping(response.data.created_at || new Date().toISOString())
        };

        // Add to chat history
        chatHistory.value.unshift(newChat);
        currentChatId.value = newChat.id;
        currentChatIndex = 0;

        // Clear any previous errors
        error.value = null;
        showError.value = false;
      } catch (err: any) {
        console.error('Error creating new chat:', err);
        error.value = getErrorMessage(err);
        showError.value = true;
        return; // Exit early if chat creation fails
      }
    }

    if (currentChatIndex !== -1) {
      const newMessage = {
        id: Date.now(), // Temporary ID for immediate display
        text: message,
        sender: 'user',
      };
      chatHistory.value[currentChatIndex].messages.push(newMessage);

      // Title is already set when creating the chat, no need to update it again

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

        // Save user message to backend
        await axios.post(`${baseUrl}/chats/${currentChatId.value}/messages`, {
          message,
          sender: 'user',
          created_at: new Date().toISOString(),
        });

        // Create placeholder AI message for streaming
        const aiResponseId = Date.now() + 1;
        const aiResponse = {
          id: aiResponseId,
          text: '',
          sender: 'ai',
          isStreaming: true,
        };
        chatHistory.value[currentChatIndex].messages.push(aiResponse);

        // Start streaming response
        let streamUrl;
        let requestBody;

        if (useContextualChat.value && selectedChildForChat.value !== null) {
          // Use contextual streaming endpoint
          streamUrl = `${baseUrl}/chat/contextual/stream`;
          requestBody = {
            message,
            child_id: selectedChildForChat.value,
            carer_id: ownerId.value
          };
        } else {
          // Use basic streaming endpoint
          streamUrl = `${baseUrl}/chat/stream`;
          requestBody = { message };
        }

        // Make streaming request
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (data.content) {
                      fullResponse += data.content;
                      // Update the streaming message
                      const messageIndex = chatHistory.value[currentChatIndex].messages.findIndex(
                        msg => msg.id === aiResponseId
                      );
                      if (messageIndex !== -1) {
                        chatHistory.value[currentChatIndex].messages[messageIndex].text = fullResponse;
                      }
                    }

                    if (data.done) {
                      // Mark as complete
                      const messageIndex = chatHistory.value[currentChatIndex].messages.findIndex(
                        msg => msg.id === aiResponseId
                      );
                      if (messageIndex !== -1) {
                        chatHistory.value[currentChatIndex].messages[messageIndex].isStreaming = false;
                      }
                      break;
                    }
                  } catch (e) {
                    console.error('Error parsing streaming data:', e);
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }

        // Save AI message to backend
        await axios.post(`${baseUrl}/chats/${currentChatId.value}/messages`, {
          message: fullResponse || '(No response)',
          sender: 'ai',
          created_at: new Date().toISOString(),
        });

      } catch (err: any) {
        console.error('Error sending message or fetching AI response:', err);
        const errorMessage = getErrorMessage(err);

        // Update the streaming message with error
        const messageIndex = chatHistory.value[currentChatIndex].messages.findIndex(
          msg => msg.sender === 'ai' && msg.isStreaming
        );
        if (messageIndex !== -1) {
          chatHistory.value[currentChatIndex].messages[messageIndex].text = `Sorry, I couldn't fetch a response: ${errorMessage}`;
          chatHistory.value[currentChatIndex].messages[messageIndex].isStreaming = false;
        } else {
          // Add error message if no streaming message found
          chatHistory.value[currentChatIndex].messages.push({
            id: Date.now() + 1,
            text: `Sorry, I couldn't fetch a response: ${errorMessage}`,
            sender: 'ai',
          });
        }
      }
    }
  };
</script>

<style scoped>
</style>
