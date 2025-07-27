<template>
  <div class="mb-6">
    <v-tabs
      v-model="activeTab"
      class="mb-4"
      slider-color="#D87179"
    >
      <v-tab
        class="text-capitalize text-subtitle-1"
        :class="{ inactive: activeTab != 'guidance' }"
        value="guidance"
      >
        Guidance
      </v-tab>
      <v-tab
        class="text-capitalize text-subtitle-1"
        value="alert"
      >
        <div class="d-flex align-center">
          <v-badge
            v-if="alertsCount > 0"
            class="ml-2"
            color="#FF5252"
            :content="alertsCount"
            floating
            >Alert</v-badge
          >
          <div
            v-else
            :class="{ inactive: activeTab != 'alert' }"
          >
            Alert
          </div>
        </div>
      </v-tab>
      <v-tab
        class="text-capitalize text-subtitle-1"
        :class="{ inactive: activeTab != 'saved' }"
        value="saved"
      >
        Saved
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useHealthAlert } from '@/composables/useHealthAlert'
  import { useChildrenStore } from '@/stores/children' // ADD THIS
import { storeToRefs } from 'pinia' // ADD THIS

  const { getBadgeCount } = useHealthAlert()
  const route = useRoute()
  const router = useRouter()

  const activeTab = ref('guidance')
  const alertsCount = ref(0)

  const childrenStore = useChildrenStore()
const { currentChild } = storeToRefs(childrenStore)

const emit = defineEmits(['tab-changed', 'child-changed'])

  onMounted(async () => {
    // Load badge count
    try {
      alertsCount.value = await getBadgeCount()
    } catch (error) {
      console.error('Failed to load badge count:', error)
      alertsCount.value = 0
    }

    const tabFromQuery = route.query.tab as string
    if (tabFromQuery && ['guidance', 'alert', 'saved'].includes(tabFromQuery)) {
      activeTab.value = tabFromQuery
      emit('tab-changed', tabFromQuery)
    }
  })

  watch(activeTab, (newTab) => {
    emit('tab-changed', newTab)
    router.replace({
      query: { ...route.query, tab: newTab },
    })
  })

  watch(
    () => route.query.tab,
    (newTab) => {
      if (newTab && ['guidance', 'alert', 'saved'].includes(newTab as string)) {
        activeTab.value = newTab as string
        emit('tab-changed', newTab)
      }
    }
  )

  // ADD THIS NEW WATCHER:
watch(
  () => currentChild.value?.id,
  async (newChildId, oldChildId) => {
    if (oldChildId && newChildId !== oldChildId) {
      console.log('🔄 Refreshing badge count for child:', newChildId)
      try {
        alertsCount.value = await getBadgeCount()
        emit('child-changed', newChildId) // Emit to parent
      } catch (error) {
        console.error('Failed to refresh badge count:', error)
        alertsCount.value = 0
      }
    }
  }
)
</script>

<!-- Keep ALL your existing styles unchanged -->

<style scoped>
  .inactive {
    color: #797675;
  }

  /* Override global v-btn styling for tabs only */
  :deep(.v-tab.v-btn) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    text-transform: none !important;
    font-weight: normal !important;
    min-width: auto !important;
    padding: 12px 16px !important;
  }

  :deep(.v-tab.v-btn:hover) {
    background: transparent !important;
    box-shadow: none !important;
  }

  :deep(.v-tab.v-btn:focus) {
    background: transparent !important;
    box-shadow: none !important;
  }

  :deep(.v-tab.v-btn.v-tab--selected) {
    background: transparent !important;
    box-shadow: none !important;
  }
</style>