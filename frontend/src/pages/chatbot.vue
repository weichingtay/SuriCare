<template>
  <v-app>
    <v-layout>
      <!-- Sidebar -->
      <ChatSidebar
        :active-chat-id="currentChatId"
        :chat-history="chatHistory"
        @new-chat="handleNewChat"
        @select-chat="handleSelectChat"
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
  const currentChatId = ref(null);
  const suggestedPrompts = ref([
    'How do I treat a mild rash at home?',
    'What are the activities to help my child with motor skills?',
    'When is the best time to visit the doctor?',
    'What are the symptoms of a rash?',
  ]);

  // Computed
  const currentChat = computed(() =>
    chatHistory.value.find(chat => chat.id === currentChatId.value)
  );

const currentChatId = ref(1);
const suggestedPrompts = ref([
  "How do I treat a mild rash at home?",
  "Where can I find a good doctor?",
  "What are good activies for the motor skills of my child?",
  "What are the best ways to help my child with their sleep?",
]);

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
      chatHistory.value.unshift({ ...newChat, messages: [] });
      currentChatId.value = newChat.id;
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSelectChat = async chatId => {
    currentChatId.value = chatId;
    try {
      const response = await axios.get(`http://localhost:8000/chats/${chatId}/messages`);
      const messages = response.data;
      const chatIndex = chatHistory.value.findIndex(chat => chat.id === chatId);
      if (chatIndex !== -1) {
        chatHistory.value[chatIndex].messages = messages;
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  onMounted(async () => {
    try {
      const response = await axios.get(`http://localhost:8000/chats/${ownerId.value}`);
      chatHistory.value = response.data.map(chat => ({ ...chat, messages: [] }));
      if (chatHistory.value.length > 0) {
        currentChatId.value = chatHistory.value[0].id;
        await handleSelectChat(currentChatId.value);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  });

  const handleSendMessage = async message => {
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
        chatHistory.value[currentChatIndex].title =
          message.slice(0, 20) + (message.length > 20 ? '...' : '');
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
