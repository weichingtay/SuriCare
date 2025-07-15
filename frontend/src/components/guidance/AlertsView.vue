<template>
  <div>
    <div
      v-if="alerts.length === 0"
      class="text-center py-12"
    >
      <v-icon
        class="mb-4"
        color="grey-lighten-2"
        size="64"
      >
        mdi-bell-off-outline
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">You're all caught up</h3>
      <p class="text-body-2 text-grey-darken-1">
        You have no alerts at the moment. Check back later for updates.
      </p>
    </div>

    <!-- Alert Cards -->
    <div
      v-else
      class="mb-6"
    >
      <AlertCard
        v-for="alert in alerts"
        :key="alert.id"
        :alert="alert"
        class="mb-8"
        @read-alert="handleReadAlert(alert.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AlertCard from './AlertCard.vue'
  import { useGuidanceAlert } from '@/composables/useGuidanceAlert'

  const { alerts, removeAlert } = useGuidanceAlert()

  const handleReadAlert = id => {
    removeAlert(id)
  }
</script>
