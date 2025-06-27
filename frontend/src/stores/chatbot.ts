import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

// Type definitions matching the backend models and frontend needs
export interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp?: string
}

export interface Chat {
  id: string
  title: string | null
  date: string
  messages: ChatMessage[]
  created_at?: string
  updated_at?: string
}

// Backend API response types
interface BackendChatbotChat {
  id: string
  title: string | null
  owner_id: number
  created_at: string
  updated_at: string
}

interface BackendChatMessage {
  id: string
  chat_id: string
  message: string
  sender: string
  created_at: string
}

export const useChatbotStore = defineStore('chatbot', () => {
  const authStore = useAuthStore()

  // State
  const chats = ref<Chat[]>([])
  const currentChatId = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  const isLoadingMessages = ref<boolean>(false)
  const isSendingMessage = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Computed properties
  const currentChat = computed(() => 
    chats.value.find(chat => chat.id === currentChatId.value) || null
  )

  const currentMessages = computed(() => currentChat.value?.messages || [])

  const sortedChats = computed(() => 
    [...chats.value].sort((a, b) => 
      new Date(b.updated_at || b.created_at || '').getTime() - 
      new Date(a.updated_at || a.created_at || '').getTime()
    )
  )

  // Helper functions
  const setError = (message: string | null) => {
    error.value = message
  }

  const clearError = () => {
    error.value = null
  }

  const formatDateForDisplay = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const transformBackendChatToFrontend = (backendChat: BackendChatbotChat, messages: BackendChatMessage[] = []): Chat => {
    return {
      id: backendChat.id,
      title: backendChat.title || 'New Chat',
      date: formatDateForDisplay(backendChat.updated_at || backendChat.created_at),
      messages: messages.map(msg => ({
        id: msg.id,
        text: msg.message,
        sender: msg.sender as 'user' | 'ai',
        timestamp: msg.created_at
      })),
      created_at: backendChat.created_at,
      updated_at: backendChat.updated_at
    }
  }

  const getApiUrl = (endpoint: string): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${baseUrl}${endpoint}`
  }

  const makeApiCall = async <T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    const authHeaders = authStore.getAuthHeaders()
    // Filter out undefined values from auth headers
    const cleanAuthHeaders = Object.fromEntries(
      Object.entries(authHeaders).filter(([_, value]) => value !== undefined)
    )
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...cleanAuthHeaders,
      ...(options.headers as Record<string, string> || {})
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  // Load all chats for the current user
  const loadChats = async () => {
    if (!authStore.userId) {
      setError('User not authenticated')
      return
    }

    try {
      isLoading.value = true
      clearError()

      const backendChats = await makeApiCall<BackendChatbotChat[]>(
        getApiUrl(`/chats/${authStore.userId}`)
      )

      // Transform and load chats (without messages initially for performance)
      chats.value = backendChats.map(chat => transformBackendChatToFrontend(chat))

      console.log('Chats loaded:', chats.value.length)

    } catch (err) {
      console.error('Error loading chats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chats')
      
      // Fallback to empty state instead of hardcoded data
      chats.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Load messages for a specific chat
  const loadMessagesForChat = async (chatId: string) => {
    try {
      isLoadingMessages.value = true
      clearError()

      const messages = await makeApiCall<BackendChatMessage[]>(
        getApiUrl(`/chats/${chatId}/messages`)
      )

      // Update the chat with loaded messages
      const chatIndex = chats.value.findIndex(chat => chat.id === chatId)
      if (chatIndex !== -1) {
        chats.value[chatIndex].messages = messages.map(msg => ({
          id: msg.id,
          text: msg.message,
          sender: msg.sender as 'user' | 'ai',
          timestamp: msg.created_at
        }))
      }

      console.log('Messages loaded for chat:', chatId, messages.length)

    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      isLoadingMessages.value = false
    }
  }

  // Create a new chat
  const createNewChat = async (): Promise<string | null> => {
    if (!authStore.userId) {
      setError('User not authenticated')
      return null
    }

    try {
      isLoading.value = true
      clearError()

      const newChatData = {
        title: null,
        owner_id: authStore.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const createdChat = await makeApiCall<BackendChatbotChat>(
        getApiUrl('/chats'),
        {
          method: 'POST',
          body: JSON.stringify(newChatData)
        }
      )

      const frontendChat = transformBackendChatToFrontend(createdChat)
      chats.value.unshift(frontendChat)

      console.log('New chat created:', createdChat.id)
      return createdChat.id

    } catch (err) {
      console.error('Error creating chat:', err)
      setError(err instanceof Error ? err.message : 'Failed to create new chat')
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Send a message in the current chat
  const sendMessage = async (messageText: string): Promise<boolean> => {
    if (!currentChatId.value || !authStore.userId) {
      setError('No active chat or user not authenticated')
      return false
    }

    try {
      isSendingMessage.value = true
      clearError()

      // Add user message to UI immediately (optimistic update)
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        text: messageText,
        sender: 'user',
        timestamp: new Date().toISOString()
      }

      const chatIndex = chats.value.findIndex(chat => chat.id === currentChatId.value)
      if (chatIndex !== -1) {
        chats.value[chatIndex].messages.push(userMessage)
        
        // Update chat title if it's the first message
        if (chats.value[chatIndex].messages.length === 1) {
          chats.value[chatIndex].title = messageText.slice(0, 30) + (messageText.length > 30 ? '...' : '')
        }
      }

      // Save user message to backend
      const userMessageData = {
        message: messageText,
        sender: 'user',
        created_at: new Date().toISOString()
      }

      const savedUserMessage = await makeApiCall<BackendChatMessage>(
        getApiUrl(`/chats/${currentChatId.value}/messages`),
        {
          method: 'POST',
          body: JSON.stringify(userMessageData)
        }
      )

      // Update the temporary message with the real ID
      if (chatIndex !== -1) {
        const msgIndex = chats.value[chatIndex].messages.findIndex(msg => msg.id === userMessage.id)
        if (msgIndex !== -1) {
          chats.value[chatIndex].messages[msgIndex].id = savedUserMessage.id
        }
      }

      // Get AI response
      const aiResponse = await makeApiCall<{ reply: string }>(
        getApiUrl('/chat/'),
        {
          method: 'POST',
          body: JSON.stringify({ message: messageText })
        }
      )

      // Add AI response to UI
      const aiMessage: ChatMessage = {
        id: `temp-ai-${Date.now()}`,
        text: aiResponse.reply || 'Sorry, I couldn\'t generate a response.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      }

      if (chatIndex !== -1) {
        chats.value[chatIndex].messages.push(aiMessage)
      }

      // Save AI message to backend
      const aiMessageData = {
        message: aiMessage.text,
        sender: 'ai',
        created_at: new Date().toISOString()
      }

      const savedAiMessage = await makeApiCall<BackendChatMessage>(
        getApiUrl(`/chats/${currentChatId.value}/messages`),
        {
          method: 'POST',
          body: JSON.stringify(aiMessageData)
        }
      )

      // Update the temporary AI message with the real ID
      if (chatIndex !== -1) {
        const aiMsgIndex = chats.value[chatIndex].messages.findIndex(msg => msg.id === aiMessage.id)
        if (aiMsgIndex !== -1) {
          chats.value[chatIndex].messages[aiMsgIndex].id = savedAiMessage.id
        }
      }

      console.log('Message sent and AI response received')
      return true

    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      // Remove the optimistic user message on error
      const chatIndex = chats.value.findIndex(chat => chat.id === currentChatId.value)
      if (chatIndex !== -1) {
        chats.value[chatIndex].messages = chats.value[chatIndex].messages.filter(
          msg => !msg.id.startsWith('temp-')
        )
      }
      
      return false
    } finally {
      isSendingMessage.value = false
    }
  }

  // Select a chat
  const selectChat = async (chatId: string) => {
    currentChatId.value = chatId
    
    // Load messages if not already loaded
    const chat = chats.value.find(c => c.id === chatId)
    if (chat && chat.messages.length === 0) {
      await loadMessagesForChat(chatId)
    }
  }

  // Create new chat and select it
  const handleNewChat = async () => {
    const newChatId = await createNewChat()
    if (newChatId) {
      currentChatId.value = newChatId
    }
  }

  // Initialize chatbot data
  const initializeChatbot = async () => {
    if (!authStore.isAuthenticated) {
      console.log('User not authenticated, skipping chatbot initialization')
      return
    }

    await loadChats()
    
    // Select first chat if available and no current chat selected
    if (chats.value.length > 0 && !currentChatId.value) {
      await selectChat(chats.value[0].id)
    }
  }

  // Suggested prompts for new chats
  const suggestedPrompts = ref([
    "How do I treat a mild rash at home?",
    "Where can I find a good doctor?", 
    "What are good activities for the motor skills of my child?",
    "What are the best ways to help my child with their sleep?"
  ])

  return {
    // State
    chats: readonly(chats),
    currentChatId: readonly(currentChatId),
    isLoading: readonly(isLoading),
    isLoadingMessages: readonly(isLoadingMessages),
    isSendingMessage: readonly(isSendingMessage),
    error: readonly(error),
    suggestedPrompts: readonly(suggestedPrompts),

    // Computed
    currentChat,
    currentMessages,
    sortedChats,

    // Actions
    loadChats,
    loadMessagesForChat,
    createNewChat,
    sendMessage,
    selectChat,
    handleNewChat,
    initializeChatbot,
    setError,
    clearError
  }
}) 