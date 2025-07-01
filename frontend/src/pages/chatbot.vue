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
              Chatting about {{ childrenStore.currentChild.name }}
            </div>
          </div>
        </div>
        <ChatContent
          :messages="currentMessages"
          :suggested-prompts="suggestedPrompts"
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
  import { computed, onMounted, ref, watch } from 'vue';
  import axios from 'axios';
  import ChatSidebar from '../components/chatbot/ChatSidebar.vue';
  import ChatContent from '../components/chatbot/ChatContent.vue';
  import { useChildrenStore } from '../stores/children';
  
  // State
  const ownerId = ref(1); // Placeholder for the current user's ID
  const childrenStore = useChildrenStore();
  
  // Multi-child selection for chat context
  const selectedChildrenForChat = ref<number[]>([]);
  const showChildSelector = ref(false);
  const tempSelectedChildren = ref<number[]>([]);
  
  // Always use contextual chat when children are selected
  const useContextualChat = computed(() => selectedChildrenForChat.value.length > 0);
  const chatHistory = ref([]);
  const currentChatId = ref<string | null>(null);
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
  const handleNewChat = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.post(`${baseUrl}/chats?owner_id=${ownerId.value}`, {
        title: 'New Chat',
        child_ids: selectedChildrenForChat.value
      });
      const newChat = response.data;
      chatHistory.value.unshift({ 
        ...newChat, 
        messages: [],
        date: formatDateForGrouping(newChat.created_at || new Date().toISOString())
      });
      currentChatId.value = newChat.id;
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
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
    } catch (error) {
      console.error('Error fetching messages:', error);
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

  // Child selection methods
  const getChildName = (childId: number) => {
    const child = childrenStore.children.find(c => c.id === childId);
    return child ? child.name : 'Unknown';
  };

  const toggleChild = (childId: number) => {
    const index = tempSelectedChildren.value.indexOf(childId);
    if (index > -1) {
      tempSelectedChildren.value.splice(index, 1);
    } else {
      tempSelectedChildren.value.push(childId);
    }
  };

  const toggleAllChildren = () => {
    if (tempSelectedChildren.value.length === childrenStore.children.length) {
      tempSelectedChildren.value = [];
    } else {
      tempSelectedChildren.value = childrenStore.children.map(child => child.id);
    }
  };

  const applyChildSelection = () => {
    selectedChildrenForChat.value = [...tempSelectedChildren.value];
    showChildSelector.value = false;
  };

  const cancelChildSelection = () => {
    tempSelectedChildren.value = [...selectedChildrenForChat.value];
    showChildSelector.value = false;
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await axios.get(`${baseUrl}/chats/${ownerId.value}`);
      chatHistory.value = await Promise.all(response.data.map(async (chat: any) => {
        let title = chat.title;
        
        // If the title is still "New Chat", try to get the first message to use as title
        if (title === 'New Chat') {
          try {
            const messagesResponse = await axios.get(`${baseUrl}/chats/${chat.id}/messages`);
            const messages = messagesResponse.data;
            if (messages.length > 0) {
              const firstUserMessage = messages.find((msg: any) => msg.sender === 'user');
              if (firstUserMessage) {
                const messageText = firstUserMessage.message || firstUserMessage.text;
                title = messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '');
                
                // Update the title in the backend
                try {
                  await axios.put(`${baseUrl}/chats/${chat.id}`, { title });
                } catch (error) {
                  console.error('Error updating chat title:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching messages for title update:', error);
          }
        }
        
        return { 
          ...chat, 
          title,
          messages: [],
          date: formatDateForGrouping(chat.created_at || chat.updated_at || new Date().toISOString())
        };
      }));
      
      if (chatHistory.value.length > 0) {
        currentChatId.value = chatHistory.value[0].id;
        await handleSelectChat(currentChatId.value);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  onMounted(async () => {
    // Initialize chat-specific child selection with current child
    if (childrenStore.currentChild) {
      selectedChildrenForChat.value = [childrenStore.currentChild.id];
      tempSelectedChildren.value = [childrenStore.currentChild.id];
    }
    
    // Load chat history
    await loadChatHistory();
  });

  // Watch for changes in global child selection and sync to chat selection
  watch(() => childrenStore.currentChild, (newChild) => {
    if (newChild) {
      // If no children selected for chat, or if we want to reset to current child
      if (selectedChildrenForChat.value.length === 0 || 
          !selectedChildrenForChat.value.includes(newChild.id)) {
        selectedChildrenForChat.value = [newChild.id];
        tempSelectedChildren.value = [newChild.id];
      }
    }
  }, { immediate: true });

  const handleSendMessage = async (message: string) => {
    const currentChatIndex = chatHistory.value.findIndex(
      chat => chat.id === currentChatId.value
    );
    if (currentChatIndex !== -1) {
      const newMessage = {
        id: Date.now(), // Temporary ID for immediate display
        text: message,
        sender: 'user',
      };
      chatHistory.value[currentChatIndex].messages.push(newMessage);

      // Update chat title if it's the first message
      if (chatHistory.value[currentChatIndex].messages.length === 1) {
        const newTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '');
        chatHistory.value[currentChatIndex].title = newTitle;
        
        // Update the title in the backend
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
          await axios.put(`${baseUrl}/chats/${currentChatId.value}`, {
            title: newTitle
          });
        } catch (error) {
          console.error('Error updating chat title:', error);
        }
      }

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        
        // Save user message to backend
        await axios.post(`${baseUrl}/chats/${currentChatId.value}/messages`, {
          message,
          sender: 'user',
          created_at: new Date().toISOString(),
        });

        // Call backend endpoint (contextual or basic)
        let geminiResponse;
        
        if (useContextualChat.value && selectedChildrenForChat.value.length > 0) {
          // Use contextual chat endpoint with selected children
          geminiResponse = await axios.post(`${baseUrl}/chat/contextual`, {
            message,
            child_ids: selectedChildrenForChat.value,
            carer_id: ownerId.value
          });
        } else {
          // Use basic chat endpoint
          geminiResponse = await axios.post(`${baseUrl}/chat/`, {
            message,
          });
        }

        const aiResponseText = geminiResponse.data.reply ?? '(No response)';
        const aiResponse = {
          id: Date.now() + 1, // Temporary ID
          text: aiResponseText,
          sender: 'ai',
        };
        chatHistory.value[currentChatIndex].messages.push(aiResponse);

        // Save AI message to backend
        await axios.post(`${baseUrl}/chats/${currentChatId.value}/messages`, {
          message: aiResponseText,
          sender: 'ai',
          created_at: new Date().toISOString(),
        });

      } catch (error) {
        console.error('Error sending message or fetching AI response:', error);
        chatHistory.value[currentChatIndex].messages.push({
          id: Date.now() + 1,
          text: "Sorry, I couldn't fetch a response. Please try again later.",
          sender: 'ai',
        });
      }
    }
  };
</script>

<style scoped>
</style>
