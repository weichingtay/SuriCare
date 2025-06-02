import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChildStore = defineStore('child', () => {
  // State
  const children = ref([
    {
      id: 1,
      name: 'Pui Sim',
      age: 3,
      avatar: 'https://images.pexels.com/photos/2806752/pexels-photo-2806752.jpeg'
    },
    {
      id: 2,
      name: 'Alex',
      age: 5,
      avatar: 'https://images.pexels.com/photos/1288182/pexels-photo-1288182.jpeg'
    }
  ])

  const currentChild = ref(children.value[0])
  const caregiverName = ref('Yoshi')

  // Actions
  function selectChild(child) {
    currentChild.value = child
  }

  // Getters
  const getCurrentChild = computed(() => currentChild.value)
  const getAllChildren = computed(() => children.value)
  const getCaregiverName = computed(() => caregiverName.value)

  return {
    // State
    children,
    currentChild,
    caregiverName,
    
    // Actions
    selectChild,
    
    // Getters
    getCurrentChild,
    getAllChildren,
    getCaregiverName
  }
}) 