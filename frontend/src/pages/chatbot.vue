<template>
  <v-app>
    <v-layout>
      <!-- Sidebar -->
      <ChatSidebar
        :chat-history="chatHistory"
        :active-chat-id="currentChatId"
        @new-chat="handleNewChat"
        @select-chat="handleSelectChat"
      />

      <!-- Main Content -->
      <v-main class="d-flex flex-column">
        <div class="d-flex align-center ml-6 mt-6">
          <v-avatar size="60" class="mr-4" rounded="0">
            <v-img height="92.25%" src="@/assets/logo.png" alt="SuriAI" />
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

<script setup>
import { ref, computed } from "vue";
import ChatSidebar from "../components/chatbot/ChatSidebar.vue";
import ChatContent from "../components/chatbot/ChatContent.vue";
import { useRouter } from 'vue-router'

const router = useRouter()
// State
const chatHistory = ref([
  {
    id: 1,
    title: "New Chat",
    date: "Today",
    messages: [],
  },
  {
    id: 2,
    title: "Treat rash",
    date: "Today",
    messages: [
      { id: 1, text: "How do I treat a mild rash at home?", sender: "user" },
      {
        id: 2,
        text: "Here are some gentle home remedies for treating a mild rash...",
        sender: "ai",
      },
    ],
  },
  {
    id: 3,
    title: "Feeding",
    date: "Yesterday",
    messages: [],
  },
  {
    id: 4,
    title: "Jennie's Sleep Pattern",
    date: "Yesterday",
    messages: [],
  },
]);

const currentChatId = ref(1);
const suggestedPrompts = ref([
  "How do I treat a mild rash at home?",
  "How do I treat a mild rash at home?",
  "How do I treat a mild rash at home?",
  "How do I treat a mild rash at home?",
]);

// Computed
const currentChat = computed(() =>
  chatHistory.value.find((chat) => chat.id === currentChatId.value)
);

const currentMessages = computed(() => currentChat.value?.messages || []);

// Methods
const handleNewChat = () => {
  const newChat = {
    id: Date.now(),
    title: "New Chat",
    date: "Today",
    messages: [],
  };
  chatHistory.value.unshift(newChat);
  currentChatId.value = newChat.id;
};

const handleSelectChat = (chatId) => {
  currentChatId.value = chatId;
};

const handleSendMessage = (message) => {
  const currentChatIndex = chatHistory.value.findIndex(
    (chat) => chat.id === currentChatId.value
  );
  if (currentChatIndex !== -1) {
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
    };
    chatHistory.value[currentChatIndex].messages.push(newMessage);

    // Update chat title if it's the first message
    if (chatHistory.value[currentChatIndex].messages.length === 1) {
      chatHistory.value[currentChatIndex].title =
        message.slice(0, 20) + (message.length > 20 ? "..." : "");
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "This is a simulated AI response to: " + message,
        sender: "ai",
      };
      chatHistory.value[currentChatIndex].messages.push(aiResponse);
    }, 1000);
  }
};
</script>

<style scoped>
.v-main {
  background-color: #faf9f5;
}
</style>
