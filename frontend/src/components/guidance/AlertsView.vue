<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular color="primary" indeterminate />
      <p class="mt-2">Loading alerts...</p>
    </div>

    <!-- No Alerts -->
    <div v-else-if="displayAlerts.length === 0" class="text-center py-12">
      <v-icon class="mb-4" color="grey-lighten-2" size="64">
        mdi-bell-off-outline
      </v-icon>
      <h3 class="text-h6 text-grey-darken-1 mb-2">You're all caught up</h3>
      <p class="text-body-2 text-grey-darken-1">
        No alerts at the moment. Check back later for updates.
      </p>
    </div>

    <!-- Alert Cards -->
    <div v-else>
      <AlertCard
        v-for="alert in displayAlerts"
        :key="alert.id"
        :alert="alert"
        class="mb-6"
        @read-alert="handleDeleteAlert"
      />
    </div>
  </div>
</template>

// Update your AlertsView.vue script section:

<script setup lang="ts">
  import { onMounted, ref, watch, onBeforeUnmount } from 'vue' // Add watch and onBeforeUnmount
  import AlertCard from './AlertCard.vue'
  import { useHealthAlert } from '@/composables/useHealthAlert'
  import { useChildrenStore } from '@/stores/children' // Add this import
  import { storeToRefs } from 'pinia' // Add this import

  const { loadAlertsForTab, deleteAlert, getBadgeCount } = useHealthAlert()
  
  // Add children store
  const childrenStore = useChildrenStore()
  const { currentChild } = storeToRefs(childrenStore)
  
  const displayAlerts = ref([])
  const loading = ref(false)
  
  // Component lifecycle flag (matching ArticleGrid pattern)
  const isUnmounted = ref(false)

  // Function to load alerts for current child
  const loadAlertsForCurrentChild = async () => {
    if (isUnmounted.value) return
    
    loading.value = true
    try {
      displayAlerts.value = await loadAlertsForTab()
      console.log('✅ Alerts loaded for child:', currentChild.value?.name)
    } catch (error) {
      console.error('❌ Error loading alerts:', error)
      displayAlerts.value = []
    } finally {
      loading.value = false
    }
  }

  // Load alerts when component mounts
  onMounted(async () => {
    await loadAlertsForCurrentChild()
  })

 watch(
  () => currentChild.value?.id,
  async (newChildId, oldChildId) => {
    console.log('👶 Child changed in AlertsView:', oldChildId, '→', newChildId)
    
    if (!newChildId) {
      displayAlerts.value = []
      return
    }
    
    if (oldChildId && newChildId !== oldChildId) {
      console.log('🔄 Refreshing alerts for new child')
      loading.value = true
      try {
        displayAlerts.value = await loadAlertsForTab()
      } finally {
        loading.value = false
      }
    }
  }
)
  // Handle delete alert (when user clicks X)
  const handleDeleteAlert = async (alertId: string) => {
    await deleteAlert(alertId)
    // Remove from display immediately
    displayAlerts.value = displayAlerts.value.filter(alert => alert.id !== alertId)
    
    // Force badge count refresh by reloading the page component
    // (NavigationTabs will reload badge count on mount)
    window.dispatchEvent(new CustomEvent('badge-update'))
  }
</script>