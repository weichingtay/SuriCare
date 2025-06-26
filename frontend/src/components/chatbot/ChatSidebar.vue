<template>
  <v-navigation-drawer class="chat-sidebar" color="#F5F5F5" permanent width="280">
    <!-- Header -->
    <div class="pa-4 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <span class="text-h6 font-weight-medium">Chat History</span>
      </div>

      <v-btn class="d-flex align-right" icon size="small" variant="text">
        <v-icon>mdi-menu</v-icon>
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

  const props = defineProps({
    chatHistory: {
      type: Array,
      required: true,
    },
    activeChatId: {
      type: Number,
      default: null,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const emit = defineEmits(['new-chat', 'select-chat'])

  const groupedChats = computed(() => {
    const groups = {}
    props.chatHistory.forEach(chat => {
      if (!groups[chat.date]) {
        groups[chat.date] = []
      }
      groups[chat.date].push(chat)
    })
    return groups
  })

  const isActiveChat = chatId => {
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
  height: calc(100vh - 140px);
}
</style>
