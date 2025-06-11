<template>
  <v-app class="modern-app">
    <!-- Background -->
    <div class="app-background"></div>
    
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
    
    <v-main class="modern-main">
      <div class="main-content">
        <router-view />
      </div>
    </v-main>

    <!-- Growth Data Dialog -->
    <v-dialog
      v-model="growthDialog"
      max-width="500"
      class="modern-dialog"
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <div class="dialog-title-content">
            <h3>Update Growth Details</h3>
            <v-chip
              size="small"
              class="child-chip"
              color="pink"
              variant="tonal"
            >{{ childrenStore.currentChild.name }}</v-chip>
          </div>
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
                  color="pink"
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
                  color="pink"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="dialog-alert"
              color="pink"
            >
              <div class="alert-content">
                <div class="alert-line">
                  <strong>Last updated:</strong>
                  {{ formatGrowthUpdate(childrenStore.currentChild.growth?.lastUpdated) }}
                </div>
                <div class="alert-line">
                  <strong>Previous:</strong>
                  {{ childrenStore.currentChild.growth?.height || '--' }}cm,
                  {{ childrenStore.currentChild.growth?.weight || '--' }}kg
                </div>
              </div>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="growthDialog = false"
            class="cancel-btn"
          >Cancel</v-btn>
          <v-btn
            color="pink"
            variant="flat"
            @click="saveGrowthData"
            class="save-btn"
          >Save Changes</v-btn>
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

.modern-app {
  position: relative;
  overflow: hidden;
}

.app-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    #faf7f2 0%,
    #f8f4ef 25%,
    #fcfaf7 50%,
    #f5f2ed 75%,
    #faf7f2 100%
  );
  z-index: 0;
}

.app-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFB6C1' fill-opacity='0.02'%3E%3Cpolygon points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
}

.modern-main {
  padding-left: 110px !important;
  padding-top: 72px !important;
  position: relative;
  z-index: 1;
}

.main-content {
  min-height: calc(100vh - 72px);
  padding: 24px;
  position: relative;
}

// Dialog styling
.modern-dialog {
  :deep(.v-overlay__content) {
    background: transparent;
  }
}

.dialog-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 182, 193, 0.1) !important;
  border-radius: 24px !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15) !important;
  overflow: hidden !important;
}

.dialog-title {
  background: linear-gradient(135deg, 
    rgba(255, 182, 193, 0.1) 0%,
    rgba(255, 160, 180, 0.05) 100%
  ) !important;
  border-bottom: 1px solid rgba(255, 182, 193, 0.1) !important;
  padding: 24px !important;
}

.dialog-title-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.dialog-title h3 {
  font-family: 'Manrope', sans-serif !important;
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #2c1810 !important;
  margin: 0 !important;
}

.child-chip {
  font-family: 'Fredoka', cursive !important;
  font-weight: 500 !important;
}

.dialog-content {
  padding: 24px !important;
}

.dialog-field {
  margin-bottom: 8px;
  
  :deep(.v-field) {
    background: rgba(255, 255, 255, 0.8) !important;
    border-radius: 12px !important;
  }
  
  :deep(.v-field--focused) {
    background: rgba(255, 255, 255, 0.95) !important;
  }
}

.dialog-alert {
  border-radius: 16px !important;
  margin-top: 16px !important;
}

.alert-content {
  font-family: 'Inter', sans-serif !important;
}

.alert-line {
  font-size: 14px !important;
  line-height: 1.4 !important;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.dialog-actions {
  padding: 16px 24px 24px 24px !important;
  gap: 12px;
}

.cancel-btn {
  color: rgba(44, 24, 16, 0.7) !important;
  font-weight: 500 !important;
}

.save-btn {
  font-weight: 600 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  letter-spacing: -0.01em !important;
}

// Additional component-specific styling if needed
:deep(.v-dialog) {
  .v-overlay__content {
    background-color: transparent;
  }
}
</style>
