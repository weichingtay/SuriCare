import { computed, onMounted } from 'vue'
import { useLookupData } from './useLookupData'

// Fallback data with hex colors and texture images
const fallbackColorOptions = [
  { id: 1, value: 'yellow', label: 'Yellow', hex: '#FDD835' },
  { id: 2, value: 'red', label: 'Red', hex: '#E53935' },
  { id: 3, value: 'brown', label: 'Brown', hex: '#8D6E63' },
  { id: 4, value: 'green', label: 'Green', hex: '#43A047' },
  { id: 5, value: 'black', label: 'Black', hex: '#424242' },
  { id: 6, value: 'gray', label: 'Gray', hex: '#9E9E9E' },
]

const fallbackTextureOptions = [
  { id: 1, value: 'pellets', label: 'Pellets', image: '/assets/textures/pellets.png' },
  { id: 2, value: 'lumpy', label: 'Lumpy', image: '/assets/textures/lumpy.png' },
  { id: 3, value: 'cracked', label: 'Cracked', image: '/assets/textures/cracked.png' },
  { id: 4, value: 'smooth', label: 'Smooth', image: '/assets/textures/smooth.png' },
  { id: 5, value: 'soft', label: 'Soft', image: '/assets/textures/soft.png' },
  { id: 6, value: 'mushy', label: 'Mushy', image: '/assets/textures/mushy.png' },
  { id: 7, value: 'watery', label: 'Watery', image: '/assets/textures/watery.png' },
]

// Color mapping for hex values
const colorHexMap: { [key: string]: string } = {
  'yellow': '#FDD835',
  'red': '#E53935',
  'brown': '#8D6E63',
  'green': '#43A047',
  'black': '#424242',
  'gray': '#9E9E9E',
}

// Texture image mapping
const textureImageMap: { [key: string]: string } = {
  'pellets': '/assets/textures/pellets.png',
  'lumpy': '/assets/textures/lumpy.png',
  'cracked': '/assets/textures/cracked.png',
  'smooth': '/assets/textures/smooth.png',
  'soft': '/assets/textures/soft.png',
  'mushy': '/assets/textures/mushy.png',
  'watery': '/assets/textures/watery.png',
}

export function usePoopOptions () {
  const {
    fetchPoopColors,
    fetchPoopTextures,
    poopColors,
    poopTextures,
    isLoading,
    getError,
  } = useLookupData()

  // Enhanced color options with hex values
  const colorOptions = computed(() => {
    if (poopColors.value.length === 0) {
      return fallbackColorOptions
    }

    return poopColors.value.map(item => ({
      ...item,
      hex: colorHexMap[item.value] || '#9E9E9E', // fallback to gray
    }))
  })

  // Enhanced texture options with images
  const textureOptions = computed(() => {
    if (poopTextures.value.length === 0) {
      return fallbackTextureOptions
    }

    return poopTextures.value.map(item => ({
      ...item,
      image: textureImageMap[item.value] || '/assets/textures/smooth.png', // fallback
    }))
  })

  // Loading states
  const isColorLoading = computed(() => isLoading.value('poopColors'))
  const isTextureLoading = computed(() => isLoading.value('poopTextures'))

  // Error states
  const colorError = computed(() => getError.value('poopColors'))
  const textureError = computed(() => getError.value('poopTextures'))

  // Overall loading state
  const isLoadingOptions = computed(() => isColorLoading.value || isTextureLoading.value)

  // Load all poop-related lookup data
  const loadPoopOptions = async () => {
    await Promise.allSettled([
      fetchPoopColors(),
      fetchPoopTextures(),
    ])
  }

  // Helper function to get color hex by value
  const getColorHex = (colorValue: string): string => {
    return colorHexMap[colorValue] || '#9E9E9E'
  }

  // Helper function to get texture image by value
  const getTextureImage = (textureValue: string): string => {
    return textureImageMap[textureValue] || '/assets/textures/smooth.png'
  }

  // Auto-load on mount
  onMounted(() => {
    loadPoopOptions()
  })

  return {
    // Options
    colorOptions,
    textureOptions,

    // Loading states
    isColorLoading,
    isTextureLoading,
    isLoading: isLoadingOptions,

    // Error states
    colorError,
    textureError,

    // Helper functions
    getColorHex,
    getTextureImage,

    // Actions
    loadPoopOptions,
  }
}