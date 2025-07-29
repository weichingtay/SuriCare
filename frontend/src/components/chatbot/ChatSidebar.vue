<template>
  <v-navigation-drawer 
    class="chat-sidebar" 
    color="#F5F5F5" 
    permanent 
    :width="drawerOpen ? 280 : 60"
  >
    <!-- Collapsed state - just hamburger menu -->
    <div v-if="!drawerOpen" class="collapsed-menu pa-2">
      <v-btn 
        icon 
        size="small" 
        variant="text"
        @click="toggleDrawer"
        elevation="0"
        
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </div>

    <!-- Expanded state - full sidebar -->
    <div v-if="drawerOpen">
      <!-- Header -->
      <div class="pa-4">
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-h6 font-weight-medium">Chat History</span>
          <v-btn 
            class="d-flex align-right" 
            icon 
            size="small" 
            variant="text"
            @click="toggleDrawer"
            elevation="0"
          >
            <v-icon>mdi-menu</v-icon>
          </v-btn>
        </div>
        
        <!-- New Chat Button -->
        <v-btn
          class="new-chat-btn btn-light-blue"
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
                <template #append>
                  <v-btn
                    class="delete-btn"
                    icon
                    size="x-small"
                    variant="text"
                    @click.stop="$emit('delete-chat', chat.id)"
                  >
                    <v-icon size="16">mdi-delete-outline</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </template>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  interface Chat {
    id: string
    title: string
    date: string
    created_at?: string
    updated_at?: string
  }

  const props = defineProps<{
    chatHistory: Chat[]
    activeChatId: string | null
  }>()

  const emit = defineEmits(['new-chat', 'select-chat', 'delete-chat', 'toggle-drawer'])

  // Simple drawer state management
  const drawerOpen = ref(true)

  const toggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value
    emit('toggle-drawer', drawerOpen.value)
  }

  // Sort dates in descending order (most recent first)
  const groupedChats = computed(() => {
    const groups: Record<string, Chat[]> = {}
    
    // Group chats by date
    props.chatHistory.forEach((chat: Chat) => {
      if (!groups[chat.date]) {
        groups[chat.date] = []
      }
      groups[chat.date].push(chat)
    })

    // Sort each group's chats by most recent first
    Object.keys(groups).forEach(date => {
      groups[date] = groups[date].sort((a, b) => {
        // Sort by updated_at or created_at timestamp (most recent first)
        const timestampA = new Date(a.updated_at || a.created_at || 0).getTime()
        const timestampB = new Date(b.updated_at || b.created_at || 0).getTime()
        return timestampB - timestampA // Most recent first
      })
    })

    // Convert to array, sort dates with proper priority for Today/Yesterday
    const sortedEntries = Object.entries(groups).sort((a, b) => {
      const dateA = a[0]
      const dateB = b[0]
      
      // Define priority order: Today = 0, Yesterday = 1, others = 2+
      const getPriority = (dateStr: string): number => {
        if (dateStr === 'Today') return 0
        if (dateStr === 'Yesterday') return 1
        return 2
      }
      
      const priorityA = getPriority(dateA)
      const priorityB = getPriority(dateB)
      
      // If priorities are different, sort by priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB
      }
      
      // If both are regular dates (priority 2), sort chronologically (most recent first)
      if (priorityA === 2 && priorityB === 2) {
        const realDateA = new Date(dateA)
        const realDateB = new Date(dateB)
        return realDateB.getTime() - realDateA.getTime()
      }
      
      // Otherwise maintain current order
      return 0
    })

    // Convert back to object while maintaining order
    const sortedGroups: Record<string, Chat[]> = {}
    sortedEntries.forEach(([date, chats]) => {
      sortedGroups[date] = chats
    })

    return sortedGroups
  })

  const isActiveChat = (chatId: string) => {
    return chatId === props.activeChatId
  }

  // Expose drawer state and toggle function to parent if needed
  defineExpose({
    drawerOpen,
    toggleDrawer
  })
</script>

<style scoped>
.chat-sidebar {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: width 0.3s ease;
}

.hamburger{
  box-shadow: none !important;
}
.collapsed-menu {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  padding-top: 16px;
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
   scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer and Edge */
}

.new-chat-btn {
  text-transform: none;
  font-weight: 500;
  background-color: #6cfc89;
  border: none !important;
  box-shadow: none;
  color: #ffffff !important;
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.chat-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background-color: rgba(255, 0, 0, 0.1) !important;
}
</style>