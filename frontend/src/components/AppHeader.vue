<template>
  <v-app-bar
    app
    class="app-header"
    color="transparent"
    elevation="0"
    height="72"
  >
    <!-- Glassmorphism background overlay -->
    <div class="header-background" />

    <v-container
      class="header-container"
      fluid
    >
      <!-- Left section: Welcome message and child selector in one row -->
      <div class="left-section">
        <!-- Child selector -->
        <div>
          <v-menu class="dropdown-menu">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                class="child-selector-btn"
                height="48"
                style="justify-content: flex-start;"
                variant="elevated"
              >
                <v-avatar
                  class="child-avatar"
                  size="32"
                  style="margin-right: 12px"
                >
                  <v-img :src="currentChild.avatar" />
                </v-avatar>
                <div
                  class="child-info"
                  style="flex: 1; text-align: left"
                >
                  <span class="child-name">{{ currentChild.name }}</span>
                  <span class="child-age">{{ currentChild.age }}</span>
                </div>
                <v-icon
                  class="dropdown-icon"
                  size="16"
                >mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list class="child-dropdown">
              <v-list-item
                v-for="child in children"
                :key="child.id"
                :active="child.id === currentChild.id"
                class="child-dropdown-item"
                @click="selectChild(child)"
              >
                <template #prepend>
                  <v-avatar
                    class="dropdown-avatar"
                    size="32"
                  >
                    <v-img :src="child.avatar" />
                  </v-avatar>
                </template>
                <v-list-item-title class="dropdown-name">{{
                  child.name
                }}</v-list-item-title>
                <v-list-item-subtitle class="dropdown-age">{{
                  child.age
                }}</v-list-item-subtitle>
              </v-list-item>

              <!-- Single Add Child at bottom -->
              <v-list-item
                class="add-child-item"
                style="border-top: 1px solid rgba(255, 255, 255, 0.2); margin-top: 8px;"
                @click="addNewChild"
              >
                <template #prepend>
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: #f0c6c9; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                    <v-icon size="16" style="color: #d87179;">mdi-plus</v-icon>
                  </div>
                </template>
                <v-list-item-title style="color: #d87179; font-weight: 500;">
                  Add Child
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Growth data cards -->
        <!-- TODO: THE HOVER HERE LOOKS ABIT DIFFERENT ADJUST IT -->
        <div class="growth-cards">
          <div
            class="growth-card combined-card"
            @click="openGrowthDialog"
          >
            <!-- Metric Pairs: icon + (label+value) -->
            <div class="metric-pair height-pair">
              <v-icon size="20">mdi-human-male-height</v-icon>
              <div class="metric-info">
                <span class="growth-label">Height</span>
                <span class="growth-value">{{ currentChild.growth?.height || '100' }}cm</span>
              </div>
            </div>

            <div class="metric-pair weight-pair">
              <v-icon size="20">mdi-weight-kilogram</v-icon>
              <div class="metric-info">
                <span class="growth-label">Weight</span>
                <span class="growth-value">{{ currentChild.growth?.weight || '20' }}kg</span>
              </div>
            </div>

            <div class="metric-pair head-pair">
              <v-icon size="20">mdi-head</v-icon>
              <div class="metric-info">
                <span class="growth-label">Head Circ.</span>
                <span class="growth-value">{{ currentChild.growth?.headCircumference || '45' }}cm</span>
              </div>
            </div>

            <v-btn
              class="growth-edit-btn"
              icon
              size="x-small"
              variant="text"
              @click.stop="openGrowthDialog"
            >
              <v-icon
                color="rgba(0,0,0,0.6)"
                size="14"
              >mdi-pencil</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Right section: Share functionality -->
      <div class="right-section">
        <!-- Share button -->
        <v-btn
          class="share-child-btn"
          height="48"
          variant="elevated"
          @click="openShareDialog"
        >
          Share Child Info
        </v-btn>
      </div>
    </v-container>

    <!-- Growth Data Dialog -->
    <GrowthDialog
      v-model="growthDialog"
      :head-circumference="growthFormData.headCircumference"
      :height="growthFormData.height"
      :loading="false"
      :notes="growthFormData.notes"
      :weight="growthFormData.weight"
      @close="growthDialog = false"
      @save="saveGrowthData"
      @update:head-circumference="growthFormData.headCircumference = $event"
      @update:height="growthFormData.height = $event"
      @update:notes="growthFormData.notes = $event"
      @update:weight="growthFormData.weight = $event"
    />

    <!-- Share dialog -->
    <v-dialog
      v-model="showShareDialog"
      width="420"
    >
      <v-card
        style="background-color: #fdf9f7; color: #000; border-radius: 12px"
      >
        <v-card-title class="headline">Share Child Info</v-card-title>
        <v-card-text>
          <!-- Access type selector inside dialog -->
          <v-select
            v-model="shareAccessType"
            density="comfortable"
            :items="accessOptions"
            label="Access Level"
            variant="outlined"
          />

          <!-- Share code instruction -->
          <p
            style="
              margin-bottom: 16px;
              color: rgba(0, 0, 0, 0.7);
              font-size: 14px;
            "
          >
            Share this code to invite caregivers to SuriCare
          </p>

          <!-- Modern code field -->
          <v-text-field
            append-inner-icon="mdi-content-copy"
            density="comfortable"
            hide-details
            label="Invitation Code"
            :model-value="shareCode"
            prepend-inner-icon="mdi-account-key"
            readonly
            style="margin-bottom: 16px"
            variant="outlined"
            @click:append-inner="copyToClipboard(shareCode)"
          />

          <!-- Modern URL field -->
          <v-text-field
            append-inner-icon="mdi-content-copy"
            density="comfortable"
            hide-details
            label="Share URL"
            :model-value="shareUrl"
            prepend-inner-icon="mdi-link"
            readonly
            style="margin-bottom: 8px"
            variant="outlined"
            @click:append-inner="copyToClipboard(shareUrl)"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
          >Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Copy feedback snackbar -->
    <v-snackbar
      v-model="showCopySnackbar"
      location="bottom"
      timeout="2000"
    >
      {{ copyMessage }}
    </v-snackbar>
  </v-app-bar>
</template>

<script setup lang="ts">
  import { useShareChild } from '@/composables/useShareChild'
  import { useGrowthDialog } from '@/composables/useGrowthDialog'
  import GrowthDialog from '../components/dialog/GrowthDialog.vue'

  import type { Child } from '@/stores/children'

  // Props
  const props = defineProps<{
    currentChild: Child
    children: Child[]
  }>()

  // Emits
  const emit = defineEmits<{
    'child-selected': [child: Child]
  }>()

  // Methods
  const selectChild = (child: Child) => {
    emit('child-selected', child)
  }

  const addNewChild = () => {
    // Add your logic here to open add child dialog or navigate to add child page
    console.log('Add new child clicked')
  }

  // Growth dialog logic
  const {
    growthDialog,
    growthFormData,
    handleOpenGrowthDialog,
    saveGrowthData,
  } = useGrowthDialog()

  const openGrowthDialog = () => {
    handleOpenGrowthDialog()
  }

  // Share Child Info logic – handled by composable
  const {
    showShareDialog,
    shareAccessType,
    accessOptions,
    shareCode,
    shareUrl,
    showCopySnackbar,
    copyMessage,
    copyToClipboard,
    openShareDialog: _openShareDialog,
    closeDialog,
  } = useShareChild()

  // Wrapper to supply the current child id when opening the dialog
  const openShareDialog = () => {
    _openShareDialog(props.currentChild.id)
  }
</script>

<style lang="scss" scoped>
  .header-container {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }

  .left-section {
    flex: 0 0 auto !important;
  }

  .right-section {
    flex: 0 0 auto !important;
    margin-left: auto !important;
  }

  // Force dropdown button to be smaller
  :deep(.child-selector-btn) {
    max-width: 180px !important;
    min-width: unset !important;
    
    .v-btn__content {
      justify-content: space-between !important;
    }
    
    .dropdown-icon {
      margin-left: auto !important;
    }
    
    .child-info {
      flex: 1 !important;
      margin-right: 8px !important;
    }
  }

  // Force share button text to align right
  :deep(.share-child-btn) {
    max-width: 180px !important;
    min-width: 180px !important;
    width: 180px !important;
    
    .v-btn__content {
      justify-content: flex-end !important;
      text-align: right !important;
      width: 100% !important;
    }
  }

  // Alternative targeting for share button
  :deep(.v-btn.share-child-btn) {
    max-width: 180px !important;
    min-width: 180px !important;
    width: 180px !important;
  }

  // Alternative approach - use global styles
  :deep(.v-btn.child-selector-btn) {
    max-width: 180px !important;
    width: auto !important;
  }

  :deep(.v-btn.share-child-btn) {
    justify-content: flex-end !important;
    
    .v-btn__content {
      justify-content: flex-end !important;
      margin-left: auto !important;
    }
  }
</style>