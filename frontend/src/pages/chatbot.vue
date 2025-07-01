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
          <span class="text-h4 font-weight-medium">SuriAI</span>
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
  import { computed, onMounted, ref } from 'vue';
  import axios from 'axios';
  import ChatSidebar from '../components/chatbot/ChatSidebar.vue';
  import ChatContent from '../components/chatbot/ChatContent.vue';
  // State
  const ownerId = ref(1); // Placeholder for the current user's ID
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
      const response = await axios.post('http://localhost:8000/chats', {
        title: 'New Chat',
        owner_id: ownerId.value,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
      const response = await axios.get(`http://localhost:8000/chats/${chatId}/messages`);
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
      await axios.delete(`http://localhost:8000/chats/${chatToDelete.value}`);
      
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

  onMounted(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/chats/${ownerId.value}`);
      chatHistory.value = await Promise.all(response.data.map(async (chat: any) => {
        let title = chat.title;
        
        // If the title is still "New Chat", try to get the first message to use as title
        if (title === 'New Chat') {
          try {
            const messagesResponse = await axios.get(`http://localhost:8000/chats/${chat.id}/messages`);
            const messages = messagesResponse.data;
            if (messages.length > 0) {
              const firstUserMessage = messages.find((msg: any) => msg.sender === 'user');
              if (firstUserMessage) {
                const messageText = firstUserMessage.message || firstUserMessage.text;
                title = messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '');
                
                // Update the title in the backend
                try {
                  await axios.put(`http://localhost:8000/chats/${chat.id}`, { title });
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
  });

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
          await axios.put(`http://localhost:8000/chats/${currentChatId.value}`, {
            title: newTitle
          });
        } catch (error) {
          console.error('Error updating chat title:', error);
        }
      }

      try {
        // Save user message to backend
        await axios.post(`http://localhost:8000/chats/${currentChatId.value}/messages`, {
          message,
          sender: 'user',
          created_at: new Date().toISOString(),
        });

        // Call backend Gemini endpoint
        const geminiResponse = await axios.post('http://localhost:8000/chat/', {
          message,
        });

        const aiResponseText = geminiResponse.data.reply ?? '(No response)';
        const aiResponse = {
          id: Date.now() + 1, // Temporary ID
          text: aiResponseText,
          sender: 'ai',
        };
        chatHistory.value[currentChatIndex].messages.push(aiResponse);

        // Save AI message to backend
        await axios.post(`http://localhost:8000/chats/${currentChatId.value}/messages`, {
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
