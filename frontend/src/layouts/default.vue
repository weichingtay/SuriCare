<template>
  <v-app class="custom-app">
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
    
    <v-main class="custom-main">
      <div class="custom-main-content">
        <router-view />
      </div>
    </v-main>

    <!-- TODO: MOVE DIALOGS TO THE APP HEADER  -->
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
// import AppHeader from '@/components/AppHeader.vue'
// import AppNavigation from '@/components/AppNavigation.vue'
import { useChildrenStore } from '@/stores/children'
import { useGrowthDialog } from '@/composables/useGrowthDialog'

// Use the children store
const childrenStore = useChildrenStore()

const activeTab = ref('home')

// Use growth dialog composable
const {
  growthDialog,
  growthFormData,
  formatGrowthUpdate,
  handleOpenGrowthDialog,
  saveGrowthData
} = useGrowthDialog()

const handleNavChange = (tabName: string) => {
  activeTab.value = tabName
}
</script>

<style lang="scss" scoped>

</style>
