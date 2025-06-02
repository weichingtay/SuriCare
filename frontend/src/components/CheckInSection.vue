<template>
  <v-card class="mb-6" :elevation="theme.components.card.elevation">
    <v-card-text>
      <div class="d-flex align-center mb-3">
        <h2 class="text-h6">Check In</h2>
        <v-btn
          icon="mdi-plus"
          size="small"
          variant="tonal"
          color="pink"
          class="ml-auto"
          @click="$emit('open-checkin')"
        ></v-btn>
      </div>
      <p class="text-body-2 text-grey">
        Log in {{ childName }}'s details including meal, sleep, mood, milestones, and incidents.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme.store'

const theme = useThemeStore()

defineProps({
  childName: {
    type: String,
    required: true
  }
})

defineEmits(['open-checkin'])
</script>
