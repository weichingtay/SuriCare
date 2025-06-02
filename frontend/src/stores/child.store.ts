import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChildStore = defineStore('child', () => {
  // State
  const children = ref([
    {
      id: 1,
      name: 'Jennie Kim',
      age: 4,
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 2,
      name: 'John Doe',
      age: 2,
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
  ])

  const currentChildId = ref(1)
  const caregiverName = ref('Mom')

  // Getters
  const currentChild = computed(() => 
    children.value.find(child => child.id === currentChildId.value) || children.value[0]
  )

  // Actions
  function selectChild(child) {
    currentChildId.value = child.id
    // You can add additional logic here when child changes
  }

  function updateCaregiverName(name) {
    caregiverName.value = name
  }

  return {
    children,
    currentChild,
    caregiverName,
    selectChild,
    updateCaregiverName,
  }
})
