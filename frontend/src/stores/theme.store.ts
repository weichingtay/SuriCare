import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Define your color palette
  const colors = {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#FAF9F5',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
  }

  // Define component-specific styles
  const components = {
    card: {
      elevation: 0,
      borderRadius: '8px',
      padding: '16px',
    },
    button: {
      borderRadius: '4px',
    },
  }

  // You can add theme switching logic here if needed
  const isDark = ref(false)

  return {
    colors,
    components,
    isDark,
  }
})
