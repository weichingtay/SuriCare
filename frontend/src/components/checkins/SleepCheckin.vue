<template>
  <v-dialog
    v-model="isOpen"
    max-width="600px"
    persistent
    class="modern-dialog"
  >
    <v-card class="dialog-card">
      <!-- Header -->
      <v-card-title class="dialog-title">
        <div class="title-row">
          <div class="title-left">
            <v-icon size="20">mdi-sleep</v-icon>
            <h3>Sleep</h3>
          </div>
          <v-btn icon variant="text" size="small" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="subtitle">How did Jennie Sleep?</p>
      </v-card-title>

      <v-card-text class="dialog-body">
        <!-- Time Inputs -->
        <div class="time-section">
          <div class="time-group">
            <label class="label">Bed Time</label>
            <div class="time-input">
              <v-icon>mdi-clock-outline</v-icon>
              <input
                v-model="bedTime"
                type="time"
                placeholder="Input bed time"
              />
            </div>
          </div>

          <div class="time-group">
            <label class="label">Awake Time</label>
            <div class="time-input">
              <v-icon>mdi-clock-outline</v-icon>
              <input
                v-model="awakeTime"
                type="time"
                placeholder="Input awake time"
              />
            </div>
          </div>
        </div>

        <!-- Remarks -->
        <div class="section">
          <label class="label">Remarks/Notes</label>
          <div class="custom-textarea">
            <textarea
              v-model="remarks"
              placeholder="Type details here"
              rows="2"
            ></textarea>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn class="save-btn" @click="saveSleep">
          <v-icon start>mdi-content-save</v-icon>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'save'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const bedTime = ref('')
const awakeTime = ref('')
const remarks = ref('')

const closeDialog = () => {
  isOpen.value = false
}

const saveSleep = () => {
  emit('save', {
    type: 'sleep',
    bedTime: bedTime.value,
    awakeTime: awakeTime.value,
    remarks: remarks.value,
    timestamp: new Date()
  })
  closeDialog()
  bedTime.value = ''
  awakeTime.value = ''
  remarks.value = ''
}
</script>

<style lang="scss" scoped>
@use '@/styles/variables' as *;

.dialog-card {
  background: $dialog-background;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-xl;
  box-shadow: $shadow-lg;
}

.dialog-title {
  background: linear-gradient(135deg, rgba($app-primary, 0.1) 0%, rgba($app-primary-light, 0.05) 100%);
  border-bottom: 1px solid $dialog-border;
  padding: $spacing-lg;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.title-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  h3 {
    font-family: $font-heading;
    font-size: 20px;
    font-weight: 600;
    color: $dialog-text;
    margin: 0;
  }
  
  .v-icon {
    color: $dialog-text-secondary;
  }
}

.subtitle {
  font-family: $font-primary;
  font-size: 14px;
  color: $dialog-text-secondary;
  margin: 0;
}

.dialog-body {
  padding: $spacing-md $spacing-lg;
}

.time-section {
  display: flex;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
}

.time-group {
  flex: 1;
}

.section {
  margin-bottom: $spacing-lg;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  display: block;
  font-family: $font-primary;
  font-size: 14px;
  font-weight: 500;
  color: $dialog-text;
  margin-bottom: $spacing-md;
}

.time-input {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border: 1px solid $app-primary;
  border-radius: $border-radius-lg;
  background: white;
  
  .v-icon {
    color: $app-primary;
    font-size: 18px;
  }
  
  input {
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-primary;
    font-size: 14px;
    color: $field-text;
    width: 100%;
    cursor: pointer;
    
    &::placeholder {
      color: $field-label;
    }
  }
}

.custom-textarea {
  border: 1px solid $app-primary;
  border-radius: $border-radius-lg;
  background: white;
  
  textarea {
    width: 100%;
    padding: $spacing-md;
    border: none;
    outline: none;
    background: transparent;
    font-family: $font-primary;
    font-size: 14px;
    color: $field-text;
    resize: vertical;
    
    &::placeholder {
      color: $field-label;
    }
  }
}

.dialog-actions {
  padding: $spacing-md $spacing-lg $spacing-lg;
  gap: $spacing-md;
}

.save-btn {
  background: white;
  color: $app-primary;
  border: 1px solid $app-primary;
  font-weight: 600;
  
  &:hover {
    background: $glass-white-light;
  }
}
</style>