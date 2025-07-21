<!-- TODO: USE AI HERE INSTEAD OF HEALTH!! -->
<template>
    <div
        v-if="hasHealthAlert"
        class="mb-6"
    >
        <h2 class="text-body-1 font-weight-medium mb-3">
            {{ currentChild.name }}'s Smart Alert
        </h2>
        <v-alert
            class="health-alert"
            color="#FFF2F0"
            variant="tonal"
        >
            <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                    <v-icon
                        class="mr-3 ml-1"
                        color="#FF5252"
                        >mdi-alert</v-icon
                    >
                    <div>
                        <div class="text-body-1 font-weight-medium mb-1">
                            {{ healthData.status }}
                        </div>
                        <div class="text-body-2 text-grey-darken-1">
                            {{ healthData.message }}
                            <div
                                v-if="healthData.symptoms?.length"
                                class="mt-1"
                            >
                                Symptoms: {{ healthData.symptoms.join(', ') }}
                            </div>
                            <div
                                v-if="healthData.temperature"
                                class="mt-1"
                            >
                                Temperature: {{ healthData.temperature }}°C
                            </div>
                        </div>
                    </div>
                </div>
                <v-btn
                    class="text-white mr-3"
                    color="#FF5252"
                    size="small"
                    variant="flat"
                    @click="navigateToAlerts"
                >
                    View More
                </v-btn>
            </div>
        </v-alert>
    </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { useHealthAlert } from '@/composables/useHealthAlert'

  const props = defineProps({
    currentChild: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['view-more'])
  const router = useRouter()

  const { healthData, hasHealthAlert } = useHealthAlert()

  const navigateToAlerts = () => {
    // Navigate to guidance page with alert tab active
    router.push('/guidance?tab=alert')
    
    // Also emit the event for any parent component that might need it
    emit('view-more', healthData.value)
  }
</script>