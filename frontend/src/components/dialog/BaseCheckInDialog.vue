<template>
  <v-dialog
    class="main-dialog"
    :max-width="maxWidth"
    :min-width="minWidth"
    :model-value="modelValue"
    persistent
    :style="{ maxWidth: maxWidth + ' !important' }"
    :width="width"
    @update:model-value="$emit('update:modelValue', $event)"
  > <!--TODO:BUT DIFFERENT DIALOG HAS DIFFERENT MAX-WIDTH-->
    <v-card
      class="checkin-dialog-card"
      elevation="0"
      style="border:1px solid #e0e0e0;"
    >
      <!-- Checkin Dialog Header -->
      <div class="checkin-dialog-header d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon
            class="mr-2"
            :color="iconColor"
            size="28"
          >
            {{ icon }}
          </v-icon>
          <span class="checkin-dialog-title">{{ title }}</span>
        </div>
        <v-btn
          color="grey"
          :disabled="loading"
          icon="mdi-close"
          size="medium"
          variant="text"
          @click="$emit('close')"
        />
        <!--small button size-->
        <!-- $emit: Emit event when clicked | @click="$emit('check-in')"-Send events to parent-->
      </div>

      <!-- Dialog Subtitle -->
      <div
        v-if="subtitle"
        class="dialog-subtitle"
      >
        {{ subtitle }}
      </div>
      

      <!-- Dialog Content -->
      <!-- Custom Content Slot -->
      <div
        v-if="$slots['custom-content']"
        class="dialog-custom-content"
      >   <!--HERE GOT ISSUES  name="custom-content"-->
        <slot name="custom-content" />
      </div> <!-- Only show if slot content exists -->
      <!--<slot name="breakdown"> - Parent can inject custom content-->


      <!-- Notes Section -->
      <div class="dialog-notes-section">
        <label class="dialog-notes-label">
          Remark/Notes
        </label>
        <v-textarea
          class="notes-textarea"
          :disabled="loading"
          hide-details
          :model-value="notes"
          placeholder="Type details here"
          rows="3"
          variant="outlined"
          @update:model-value="$emit('update:notes', $event)"
        />
      </div>

      <!-- Dialog Save Button -->
      <div class="dialog-save-button-footer">
        <v-spacer />
        <v-btn
          class="save-btn"
          :loading="loading"
          rounded="8"
          size="large "
          variant="flat"
          @click="$emit('save')"
        >
          <v-icon class="mr-2" size="18">mdi-content-save</v-icon>
          Save
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  defineProps({
    // Dialog Control
    modelValue: {
      type: Boolean,
      default: false,
    },
    maxWidth: {
      type: [String, Number],
      default: '800px',
    },
    width: {
      type: [String, Number],
      default: undefined,
    },
    minWidth: {
      type: [String, Number],
      default: '320px',
    },


    // Header Props
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    iconColor: {
      type: String,
      default: 'black',
    },

    // Subtitle
    subtitle: {
      type: String,
      default: '',
    },

    // Notes
    notes: {
      type: String,
      default: '',
    },

    // State
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
  })

  defineEmits([
    'update:modelValue',
    'update:notes',
    'save',
    'close',
    'clear-error',
  ])
</script>

<style scoped>


    .checkin-dialog-card {
        border: 1px solid #e0e0e0;
        background: white;
        margin: 0 auto;
        padding: 24px !important;
        box-sizing: border-box;

    }


    /* Dialog Header */
    .checkin-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
    }

    .checkin-dialog-title {
        font-size: 24px;
        font-weight: 700;
        color: black;
    }

    /* Dialog Subtitle */
    .dialog-subtitle {
        color: #666;
        font-size: 16px;
        font-weight: 500;
    }

    .dialog-custom-content{
        margin-top: 20px;
    }


    /* Notes Section */
    .dialog-notes-section {
        margin-top: 20px;
        margin-bottom: 24px;
    }

    .dialog-notes-label{
        font-size: 12px;
        font-weight: 500;
        color: #333;

    }

    /* Textarea styling - normal state */
    /* Textarea styling - normal state */
    .notes-textarea :deep(.v-field) {
        margin-top:4px;
        background-color: #eeeeee !important;
        border-radius: 8px !important;
        resize: none !important;
    }

    /* Remove default outline */
    .notes-textarea :deep(.v-field__outline) {
        border: none !important;
    }

    /* Focused state - very subtle border */
    .notes-textarea :deep(.v-field--focused) {
        border-radius: 8px;
        border: 1px solid #d0d0d0 !important;
        outline: none !important;
        box-shadow: none !important;
    }

    /* Remove focused outline from field outline */
    .notes-textarea :deep(.v-field--focused .v-field__outline) {
        border: none !important;
        outline: none !important;
    }

    /* Remove any control outline */
    .notes-textarea :deep(.v-field__outline__start),
    .notes-textarea :deep(.v-field__outline__notch),
    .notes-textarea :deep(.v-field__outline__end) {
        border: none !important;
    }

    .notes-textarea :deep(textarea) {
        resize: none !important;
    }

    .notes-textarea :deep(.v-field__input::placeholder) {
        color: #686868 !important;
        opacity: 1 !important;
    }


    /* Dialog Footer */
   .dialog-save-button-footer {
        display: flex ;
        justify-content: right ;
        width: 100%;
    }

    .save-btn {
        background-color: #D87179 !important;
        color: white;
        text-transform: none;
        font-weight: 500;
        padding: 8px 16px;

    }

    /* Remove default button effects */
    .v-btn {
        box-shadow: none !important;
    }

    .v-btn:hover {
        box-shadow: none !important;
    }

    /* Button text styling */

</style>
