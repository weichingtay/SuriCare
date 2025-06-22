<template>
  <v-app-bar
    app
    color="transparent"
    elevation="0"
    height="72"
    class="app-header"
  >
    <!-- Glassmorphism background overlay -->
    <div class="header-background"></div>

    <v-container
      fluid
      class="header-container"
    >
      <!-- Left section: Welcome message and child selector in one row -->
      <div class="left-section">
        <!-- Child selector -->
        <div>
          <v-menu class="dropdown-menu">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="elevated"
                class="child-selector-btn"
                height="48"
                style="justify-content: flex-start"
              >
                <v-avatar
                  size="32"
                  class="child-avatar"
                  style="margin-right: 12px"
                >
                  <v-img :src="currentChild.avatar"></v-img>
                </v-avatar>
                <div
                  class="child-info"
                  style="flex: 1; text-align: left"
                >
                  <span class="child-name">{{ currentChild.name }}</span>
                  <span class="child-age"
                    >{{ currentChild.age }} years old</span
                  >
                </div>
                <v-icon
                  size="16"
                  class="dropdown-icon"
                  >mdi-chevron-down</v-icon
                >
              </v-btn>
            </template>

            <v-list class="child-dropdown">
              <v-list-item
                v-for="child in children"
                :key="child.id"
                @click="selectChild(child)"
                :active="child.id === currentChild.id"
                class="child-dropdown-item"
              >
                <template v-slot:prepend>
                  <v-avatar
                    size="32"
                    class="dropdown-avatar"
                  >
                    <v-img :src="child.avatar"></v-img>
                  </v-avatar>
                </template>
                <v-list-item-title class="dropdown-name">{{
                  child.name
                }}</v-list-item-title>
                <v-list-item-subtitle class="dropdown-age"
                  >{{ child.age }} years old</v-list-item-subtitle
                >
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
                <span class="growth-value"
                  >{{ currentChild.growth?.height || '100' }}cm</span
                >
              </div>
            </div>

            <div class="metric-pair weight-pair">
              <v-icon size="20">mdi-weight-kilogram</v-icon>
              <div class="metric-info">
                <span class="growth-label">Weight</span>
                <span class="growth-value"
                  >{{ currentChild.growth?.weight || '20' }}kg</span
                >
              </div>
            </div>

            <div class="metric-pair head-pair">
              <v-icon size="20">mdi-head</v-icon>
              <div class="metric-info">
                <span class="growth-label">Head Circ.</span>
                <span class="growth-value"
                  >{{ currentChild.growth?.headCircumference || '45' }}cm</span
                >
              </div>
            </div>

            <v-btn
              icon
              size="x-small"
              variant="text"
              class="growth-edit-btn"
              @click.stop="openGrowthDialog"
            >
              <v-icon
                size="14"
                color="rgba(0,0,0,0.6)"
                >mdi-pencil</v-icon
              >
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Right section: Share functionality -->
      <div
        class="right-section"
        style="display: flex; align-items: center; gap: 8px"
      >
        <!-- Share button -->
        <v-btn
          variant="elevated"
          class="share-child-btn"
          height="40"
          @click="openShareDialog"
        >
          Share Child Info
        </v-btn>
      </div>
    </v-container>

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
              >{{ currentChild.name }}</v-chip
            >
          </div>
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="growthForm">
            <v-row>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="growthFormData.height"
                  label="Height (cm)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-human-male-height"
                  class="dialog-field"
                  base-color="pink"
                  color="pink"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="4"
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
                  base-color="pink"
                  color="pink"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="4"
              >
                <v-text-field
                  v-model="growthFormData.headCircumference"
                  label="Head Circ. (cm)"
                  type="number"
                  step="0.1"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-head"
                  class="dialog-field"
                  base-color="pink"
                  color="pink"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-alert
              type="info"
              variant="tonal"
              density="compact"
            >
              <div class="alert-content">
                <div class="alert-line">
                  <strong>Last updated:</strong>
                  {{ formatGrowthUpdate(currentChild.growth?.lastUpdated) }}
                </div>
                <div class="alert-line">
                  <strong>Previous:</strong>
                  {{ currentChild.growth?.height || '--' }}cm,
                  {{ currentChild.growth?.weight || '--' }}kg,
                  {{ currentChild.growth?.headCircumference || '--' }}cm
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
            >Cancel</v-btn
          >
          <v-btn
            color="pink"
            variant="flat"
            @click="saveGrowthData"
            class="save-btn"
            >Save Changes</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Share dialog -->
    <v-dialog
      v-model="showShareDialog"
      width="420"
    >
      <v-card style="background-color: #fdf9f7; color: #000">
        <v-card-title class="headline">Share Child Info</v-card-title>
        <v-card-text>
          <!-- Access type selector inside dialog -->
          <v-select
            v-model="shareAccessType"
            :items="accessOptions"
            label="Access Level"
            density="comfortable"
            variant="outlined"
            style="margin-bottom: 16px"
          ></v-select>

          <!-- Modern code field -->
          <v-text-field
            :model-value="shareCode"
            label="Share Code"
            prepend-inner-icon="mdi-account-key"
            append-inner-icon="mdi-content-copy"
            readonly
            hide-details
            density="comfortable"
            variant="outlined"
            style="margin-bottom: 16px"
            @click:append-inner="copyToClipboard(shareCode)"
          ></v-text-field>

          <!-- Modern URL field -->
          <v-text-field
            :model-value="shareUrl"
            label="Share URL"
            prepend-inner-icon="mdi-link"
            append-inner-icon="mdi-content-copy"
            readonly
            hide-details
            density="comfortable"
            variant="outlined"
            style="margin-bottom: 8px"
            @click:append-inner="copyToClipboard(shareUrl)"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDialog"
            >Close</v-btn
          >
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

<script setup>
  import { useShareChild } from '@/composables/useShareChild'
  import { useGrowthDialog } from '@/composables/useGrowthDialog'

  // Props
  const props = defineProps({
    currentChild: {
      type: Object,
      required: true,
    },
    children: {
      type: Array,
      required: true,
    },
  })

  // Emits (no longer need open-growth-dialog)
  const emit = defineEmits(['child-selected'])

  // Methods
  const selectChild = (child) => {
    emit('child-selected', child)
  }

  // Growth dialog logic
  const {
    growthDialog,
    growthFormData,
    formatGrowthUpdate,
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
  // .v-text-field--outlined >>> fieldset {
  //   border-color: rgba(192, 0, 250, 0.986);
  // }
</style>
