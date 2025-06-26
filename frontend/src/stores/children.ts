import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface Child {
  id: number
  name: string
  age: string
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
      age: '2 years',
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
      age: '5 years',
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
  const calcAge = (birthDateStr: string): string => {
    const birthDate = new Date(birthDateStr)

    console.log(birthDate)
    // Guard: if the date is invalid, return 0 so the UI doesn't break
    if (isNaN(birthDate.getTime())) {
      console.warn('Invalid birth_date received:', birthDateStr)
      return '0 months old'
    }

    const today = new Date()
    let ageYears = today.getFullYear() - birthDate.getFullYear()

    // Adjust age if the birthday hasn't happened yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth()
    const dayDiff = today.getDate() - birthDate.getDate()
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      ageYears--
    }

    // If under 1 year old, calculate months
    if (ageYears < 1) {
      let ageMonths = monthDiff
      if (dayDiff < 0) {
        ageMonths--
      }
      if (ageMonths < 0) {
        ageMonths += 12
      }

      return ageMonths === 1 ? '1 month old' : `${ageMonths} months old`
    }

    console.log(ageYears)
    return ageYears === 1 ? '1 year old' : `${ageYears} years old`
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
        // connect height & weight to the right tables
        height: 0,
        weight: 0,
        headCircumference: 0,
        // lastUpdated date is wrong
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
