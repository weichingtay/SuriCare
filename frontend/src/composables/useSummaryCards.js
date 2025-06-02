import { computed } from 'vue'

// Card configurations
const cardConfigs = {
  sleep: {
    title: 'Sleep',
    icon: 'mdi-power-sleep',
    iconColor: 'purple',
    transformData: (data) => ({
      metrics: [
        { value: `${data?.nightHours || 0}h`, label: 'Night' },
        { value: `${data?.napHours || 0}h`, label: 'Nap' },
        { value: data?.wakeCount || 0, label: 'Wakes' }
      ]
    })
  },
  poop: {
    title: 'Poop',
    icon: 'mdi-emoticon',
    iconColor: 'brown',
    transformData: (data) => ({
      metrics: [
        { value: data?.count || 0, label: 'Total' },
        { value: data?.normal || 0, label: 'Normal' },
        { value: data?.unusual || 0, label: 'Unusual' }
      ]
    })
  },
  meals: {
    title: 'Meals',
    icon: 'mdi-food',
    iconColor: 'green',
    transformData: (data) => ({
      metrics: [
        { value: data?.count || 0, label: 'Meals' },
        { value: `${data?.percentages?.breakfast || 0}%`, label: 'Breakfast' },
        { value: `${data?.percentages?.lunch || 0}%`, label: 'Lunch' },
        { value: `${data?.percentages?.dinner || 0}%`, label: 'Dinner' }
      ],
      additionalInfo: [
        ...(data?.refusedItems?.length ? [{
          icon: 'mdi-close-circle',
          text: `Refused: ${data.refusedItems.join(', ')}`
        }] : []),
        ...(data?.preferences?.length ? [{
          icon: 'mdi-heart',
          text: `Liked: ${data.preferences.join(', ')}`
        }] : [])
      ]
    })
  },
  // TODO: need to consider what makes "healthy?", what kind of information does this get
  health: {
    title: 'Health',
    icon: 'mdi-heart-pulse',
    transformData: (data) => ({
      iconColor: data?.status === 'Healthy' ? 'success' : 'warning',
      metrics: [
        { value: data?.status || 'N/A', label: 'Status' }
      ],
      additionalInfo: data?.message ? [{
        icon: 'mdi-information',
        text: data.message
      }] : []
    })
  }
}

export function useSummaryCards(summaryData) {
  // Transform raw data into card props
  const transformedCards = computed(() => {
    const data = summaryData.value
    if (!data) return {}

    return Object.entries(cardConfigs).reduce((acc, [type, config]) => {
      const typeData = data[type]
      
      acc[type] = {
        title: config.title,
        icon: config.icon,
        iconColor: config.iconColor,
        noData: typeData?.noData || false,
        ...config.transformData(typeData)
      }
      
      return acc
    }, {})
  })

  // Get all available card types
  const cardTypes = Object.keys(cardConfigs)

  return {
    transformedCards,
    cardTypes
  }
} 