import { ref } from 'vue'
import { useChildrenStore } from '@/stores/children'

export function useGrowthDialog() {
  const childrenStore = useChildrenStore()
  const growthDialog = ref(false)
  const growthFormData = ref({
    height: '',
    weight: '',
  })

  const formatGrowthUpdate = (date: Date | undefined) => {
    if (!date) return 'Never'

    const now = new Date()
    const updated = new Date(date)
    const diffTime = Math.abs(now.getTime() - updated.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}m ago`
  }

  const handleOpenGrowthDialog = () => {
    growthFormData.value = {
      height: childrenStore.currentChild.growth?.height?.toString() || '',
      weight: childrenStore.currentChild.growth?.weight?.toString() || '',
    }
    growthDialog.value = true
  }

  const saveGrowthData = () => {
    const height = parseFloat(growthFormData.value.height)
    const weight = parseFloat(growthFormData.value.weight)
    
    childrenStore.updateChildGrowth(childrenStore.currentChild.id, height, weight)
    
    growthDialog.value = false
    console.log('Growth data updated:', childrenStore.currentChild.growth)
  }

  return {
    growthDialog,
    growthFormData,
    formatGrowthUpdate,
    handleOpenGrowthDialog,
    saveGrowthData
  }
} 