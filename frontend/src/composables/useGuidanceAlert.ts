import { computed, ref } from 'vue'

const alerts = ref([
  {
    id: 1,
    title: 'Vitamin D Deficiency',
    description: 'Your child has low levels of vitamin D.',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Suggestions',
        content:
          'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
      },
      {
        id: 2,
        title: 'Suggestions',
        content:
          'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula. Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
      },
    ],
  },
  {
    id: 2,
    title: 'Vitamin D Deficiency',
    description: 'Your child has low levels of vitamin D.',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Suggestions',
        content:
          'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
      },
    ],
  },
  {
    id: 3,
    title: 'Vitamin D Deficiency',
    description: 'Your child has low levels of vitamin D.',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Suggestions',
        content:
          'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
      },
    ],
  },
  {
    id: 4,
    title: 'Vitamin D Deficiency',
    description: 'Your child has low levels of vitamin D.',
    type: 'warning',
    suggestions: [
      {
        id: 1,
        title: 'Suggestions',
        content:
          'Lorem ipsum dolor sit amet consectetur. Purus faucibus facilisis molestie mi. Libero massa praesent tellus tellus purus et ullamcorper blandit. At auctor id ultrices amet. Tristique integer pellentesque nulla elit nulla scelerisque ligula.',
      },
    ],
  },
])

export function useGuidanceAlert() {
  const removeAlert = (id: number) => {
    alerts.value = alerts.value.filter((alert) => alert.id !== id)
  }

  const alertsCount = computed(() => alerts.value.length)

  return {
    alerts,
    removeAlert,
    alertsCount,
  }
}
