<template>
  <v-navigation-drawer class="chat-sidebar" color="#F5F5F5" permanent width="280">
    <!-- Header -->
    <div class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-h6 font-weight-medium">Chat History</span>
        <v-btn class="d-flex align-right" icon size="small" variant="text">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
      
      <!-- New Chat Button -->
      <v-btn
        class="new-chat-btn"
        color="primary"
        prepend-icon="mdi-plus"
        variant="outlined"
        block
        @click="$emit('new-chat')"
      >
        New Chat
      </v-btn>
    </div>

    <!-- Chat History -->
    <div class="chat-history">
      <template v-for="(dateGroup, date) in groupedChats" :key="date">
        <div class="date-header px-4 py-2">
          <span class="text-caption text-medium-emphasis font-weight-medium">{{
            date
          }}</span>
        </div>

        <div class="chat-list px-2">
          <v-list class="py-0 transparent" density="compact">
            <v-list-item
              v-for="chat in dateGroup"
              :key="chat.id"
              class="chat-item mb-1"
              :class="{ 'active-chat': isActiveChat(chat.id) }"
              rounded="lg"
              :value="chat.id"
              @click="$emit('select-chat', chat.id)"
            >
              <v-list-item-title class="text-body-2 text-truncate">
                {{ chat.title }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </template>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Chat {
    id: number
    title: string
    date: string
  }

  const props = defineProps<{
    chatHistory: Chat[]
    activeChatId: number | null
  }>()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const emit = defineEmits(['new-chat', 'select-chat'])

  const groupedChats = computed(() => {
    const groups: Record<string, Chat[]> = {}
    props.chatHistory.forEach((chat: Chat) => {
      if (!groups[chat.date]) {
        groups[chat.date] = []
      }
      groups[chat.date].push(chat)
    })
    return groups
  })

  const isActiveChat = (chatId: number) => {
    return chatId === props.activeChatId
  }
</script>

<style scoped>
.chat-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.date-header {
  background-color: #F5F5F5;
}

.chat-list {
  background-color: transparent;
}

.chat-list :deep(.v-list) {
  background-color: transparent;
}

.chat-item {
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 2px 0;
  background-color: transparent;
}

.chat-item:hover {
  background-color: white !important;
}

.active-chat {
  background-color: white !important;
}

.chat-item :deep(.v-list-item__overlay) {
  background-color: transparent;
}

.chat-item:hover :deep(.v-list-item__overlay) {
  background-color: white !important;
}

.active-chat :deep(.v-list-item__overlay) {
  background-color: white !important;
}

.chat-history {
  overflow-y: auto;
  height: calc(100vh - 200px);
}

.new-chat-btn {
  text-transform: none;
  font-weight: 500;
}
</style>
