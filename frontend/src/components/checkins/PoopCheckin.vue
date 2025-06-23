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
            <v-icon size="20">mdi-emoticon-poop</v-icon>
            <h3>Poop</h3>
          </div>
          <v-btn icon variant="text" size="small" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <p class="subtitle">Poop check for Jennie</p>
      </v-card-title>

      <v-card-text class="dialog-body">
        <!-- Color Selection -->
        <div class="section">
          <label class="label">Color</label>
          <div class="options-row">
            <button
              v-for="color in colorOptions"
              :key="color.value"
              :class="['option-btn', { 'selected': selectedColor === color.value }]"
              @click="selectedColor = color.value"
            >
              <div class="color-dot" :style="{ backgroundColor: color.hex }"></div>
              {{ color.label }}
            </button>
          </div>
        </div>

        <!-- Texture Selection -->
        <div class="section">
          <label class="label">Texture</label>
          <div class="options-row">
            <button
              v-for="texture in textureOptions"
              :key="texture.value"
              :class="['option-btn', { 'selected': selectedTexture === texture.value }]"
              @click="selectedTexture = texture.value"
            >
              <div class="texture-icon">
                <div :class="['texture-visual', `texture-${texture.value}`]"></div>
              </div>
              {{ texture.label }}
            </button>
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
        <v-btn class="save-btn" @click="savePoop">
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

const selectedColor = ref('')
const selectedTexture = ref('')
const remarks = ref('')

const colorOptions = [
  { value: 'yellow', label: 'Yellow', hex: '#F9D71C' },
  { value: 'red', label: 'Red', hex: '#E53E3E' },
  { value: 'brown', label: 'Brown', hex: '#8B4513' },
  { value: 'green', label: 'Green', hex: '#38A169' },
  { value: 'black', label: 'Black', hex: '#2D3748' },
  { value: 'gray', label: 'Gray', hex: '#718096' }
]

const textureOptions = [
  { value: 'pellets', label: 'Pellets' },
  { value: 'lumpy', label: 'Lumpy' },
  { value: 'cracked', label: 'Cracked' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'soft', label: 'Soft' },
  { value: 'mushy', label: 'Mushy' },
  { value: 'watery', label: 'Watery' }
]

const closeDialog = () => {
  isOpen.value = false
}

const savePoop = () => {
  emit('save', {
    type: 'poop',
    color: selectedColor.value,
    texture: selectedTexture.value,
    remarks: remarks.value,
    timestamp: new Date()
  })
  closeDialog()
  selectedColor.value = ''
  selectedTexture.value = ''
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

.options-row {
  display: flex;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: $spacing-sm $spacing-lg;
  border: 1px solid $dialog-border;
  border-radius: $border-radius-lg;
  background: white;
  color: $dialog-text;
  font-family: $font-primary;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: $app-primary-light;
    background: $glass-white-light;
  }
  
  &.selected {
    border-color: $app-primary;
    background: white;
  }
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.texture-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.texture-visual {
  width: 12px;
  height: 12px;
  
  &.texture-pellets {
    background: radial-gradient(circle, $app-grey 40%, transparent 40%);
    border-radius: 50%;
  }
  
  &.texture-lumpy {
    background: repeating-linear-gradient(45deg, $app-grey, $app-grey 2px, transparent 2px, transparent 4px);
    border-radius: 20%;
  }
  
  &.texture-cracked {
    background: $app-grey;
    border-radius: 15%;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 20%;
      bottom: 20%;
      left: 50%;
      width: 1px;
      background: white;
      transform: translateX(-50%);
    }
  }
  
  &.texture-smooth {
    background: $app-grey;
    border-radius: 20%;
  }
  
  &.texture-soft {
    background: radial-gradient(ellipse, $app-grey 60%, rgba($app-grey, 0.7) 60%);
    border-radius: 40%;
  }
  
  &.texture-mushy {
    background: radial-gradient(circle, $app-grey 30%, transparent 30%, transparent 40%, rgba($app-grey, 0.6) 40%, rgba($app-grey, 0.6) 60%, transparent 60%);
    border-radius: 50%;
  }
  
  &.texture-watery {
    background: radial-gradient(circle, transparent 20%, rgba($app-grey, 0.4) 20%, rgba($app-grey, 0.4) 30%, transparent 30%, transparent 50%, rgba($app-grey, 0.3) 50%, rgba($app-grey, 0.3) 60%, transparent 60%);
    border-radius: 50%;
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