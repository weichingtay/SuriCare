import { ref } from 'vue'

export function useAIChat () {
  // Chat history (for future use)
  const chatHistory = ref<Array<{ message: string, sender: 'user' | 'ai', timestamp: Date }>>([])

  // Loading state
  const isLoading = ref(false)

  // Handle AI message sending
  const sendMessage = async (message: string) => {
    console.log('AI Message sent:', message)

    // Add user message to history
    chatHistory.value.push({
      message,
      sender: 'user',
      timestamp: new Date(),
    })

    // Set loading state
    isLoading.value = true

    try {
      // TODO: Replace with actual AI API call
      // const response = await aiService.sendMessage(message)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock AI response
      const aiResponse = `I understand you're asking about: "${message}". This will be connected to our AI service soon!`

      // Add AI response to history
      chatHistory.value.push({
        message: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      })

      return aiResponse
    } catch (error) {
      console.error('AI message error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Clear chat history
  const clearHistory = () => {
    chatHistory.value = []
  }

  return {
    chatHistory,
    isLoading,
    sendMessage,
    clearHistory,
  }
}
