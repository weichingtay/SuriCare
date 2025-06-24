import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Child {
  id: number
  name: string
  age: number
  avatar: string
  growth: {
    height: number
    weight: number
    headCircumference: number
    lastUpdated: Date
  }
}

export const useChildrenStore = defineStore('children', () => {
  // State
  const children = ref<Child[]>([])

  const currentChildId = ref<number>(1) // Default to first child

  // Demo fallback dataset
  const demoChildren: Child[] = [
    {
      id: 1,
      name: 'Jennie',
      age: 2,
      avatar: 'https://images.pexels.com/photos/2806752/pexels-photo-2806752.jpeg',
      growth: {
        height: 100,
        weight: 20,
        headCircumference: 45,
        lastUpdated: new Date('2025-05-15'),
      },
    },
    {
      id: 2,
      name: 'Alex',
      age: 5,
      avatar: 'https://images.pexels.com/photos/1288182/pexels-photo-1288182.jpeg',
      growth: {
        height: 110,
        weight: 20.2,
        headCircumference: 47,
        lastUpdated: new Date('2025-04-20'),
      },
    },
  ]

  // Helper: calculate age in years from birth_date
  const calcAge = (birthDateStr: string): number => {
    const bd = new Date(birthDateStr)
    const diff = Date.now() - bd.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25))
  }

  // Action: load children from Supabase
  const loadChildren = async () => {
    const { supabase } = await import('@/plugins/supabase') // lazy import to avoid circular deps
    const { data, error } = await supabase
      .from('child')
      .select('*')

    if (error) {
      console.error('Failed to load children', error.message)
      children.value = demoChildren
      return
    }

    if (!data || data.length === 0) {
      children.value = demoChildren
      return
    }

    children.value = data.map(row => ({
      id: row.id,
      name: row.name,
      age: calcAge(row.birth_date),
      avatar: 'https://images.pexels.com/photos/2806752/pexels-photo-2806752.jpeg', // placeholder; swap if you store avatars
      growth: {
        height: 0,
        weight: 0,
        headCircumference: 0,
        lastUpdated: new Date(row.birth_date),
      },
    }))
  }

  // Getters
  const currentChild = computed(() => {
    if (children.value.length === 0) {
      return demoChildren[0]
    }
    return (
      children.value.find(child => child.id === currentChildId.value) || children.value[0]
    )
  })

  // Actions
  const selectChild = (child: Child) => {
    currentChildId.value = child.id
  }

  const updateChildGrowth = (childId: number, height: number, weight: number, headCircumference: number) => {
    const child = children.value.find(c => c.id === childId)
    if (child) {
      child.growth = {
        height,
        weight,
        headCircumference,
        lastUpdated: new Date(),
      }
    }
  }

  const addChild = (child: Omit<Child, 'id'>) => {
    const newId = Math.max(...children.value.map(c => c.id)) + 1
    children.value.push({
      ...child,
      id: newId,
    })
  }

  const removeChild = (childId: number) => {
    const index = children.value.findIndex(c => c.id === childId)
    if (index > -1) {
      children.value.splice(index, 1)
      // If current child was removed, select first available child
      if (currentChildId.value === childId && children.value.length > 0) {
        currentChildId.value = children.value[0].id
      }
    }
  }

  return {
    // State
    children,
    currentChildId,

    // Getters
    currentChild,

    // Actions
    selectChild,
    updateChildGrowth,
    addChild,
    removeChild,
    loadChildren,
  }
})
