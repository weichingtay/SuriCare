<template>
  <v-app>
    <!-- Navigation sidebar -->
    <AppNavigation 
      :activeTab="activeTab"
      @nav-change="handleNavChange"
    />
    
    <!-- Header -->
    <AppHeader 
      :currentChild="childrenStore.currentChild"
      :children="childrenStore.children"
      @child-selected="childrenStore.selectChild"
      @open-growth-dialog="handleOpenGrowthDialog"
    />
    
    <v-main>
      <router-view />
    </v-main>

    <!-- Growth Data Dialog -->
    <v-dialog
      v-model="growthDialog"
      max-width="500"
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          Update Growth Details
          <v-chip
            size="small"
            class="ml-2"
          >{{ childrenStore.currentChild.name }}</v-chip>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="growthForm">
            <v-row>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="growthFormData.height"
                  label="Height (cm)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-human-male-height"
                  class="dialog-field"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="growthFormData.weight"
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-weight-kilogram"
                  class="dialog-field"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="mt-2 dialog-alert"
              color="pink"
            >
              <div class="text-caption">
                Last updated:
                {{ formatGrowthUpdate(childrenStore.currentChild.growth?.lastUpdated) }}
              </div>
              <div class="text-caption">
                Previous:
                {{ childrenStore.currentChild.growth?.height || '--' }}cm,
                {{ childrenStore.currentChild.growth?.weight || '--' }}kg
              </div>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="growthDialog = false"
          >Cancel</v-btn>
          <v-btn
            color="pink"
            variant="flat"
            @click="saveGrowthData"
          >Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- <AppFooter /> -->
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppNavigation from '@/components/AppNavigation.vue'
import { useChildrenStore } from '@/stores/children'

// Use the children store
const childrenStore = useChildrenStore()

const activeTab = ref('home')

// Growth dialog data
const growthDialog = ref(false)
const growthFormData = ref({
  height: '',
  weight: '',
})

// Format growth update date
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

const handleNavChange = (tabName: string) => {
  activeTab.value = tabName
}

const handleOpenGrowthDialog = () => {
  growthFormData.value = {
    height: childrenStore.currentChild.growth?.height?.toString() || '',
    weight: childrenStore.currentChild.growth?.weight?.toString() || '',
  }
  growthDialog.value = true
}

// Save growth data using the store
const saveGrowthData = () => {
  const height = parseFloat(growthFormData.value.height)
  const weight = parseFloat(growthFormData.value.weight)
  
  childrenStore.updateChildGrowth(childrenStore.currentChild.id, height, weight)
  
  growthDialog.value = false
  console.log('Growth data updated:', childrenStore.currentChild.growth)
}
</script>

<style lang="scss" scoped>
@import '@/styles/settings.scss';

/* Additional component-specific styling if needed */
:deep(.v-dialog) {
  .v-overlay__content {
    background-color: transparent;
  }
}
</style>
