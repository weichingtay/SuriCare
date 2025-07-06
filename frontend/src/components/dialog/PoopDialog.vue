<template>
  <BaseCheckInDialog
    icon="mdi-emoticon-poop"
    icon-color="#000000"
    :loading="loading"
    max-width="600px"
    :model-value="modelValue"
    :notes="notes"
    subtitle="Poop check for Jennie"
    title="Poop"
    @close="handleClose"
    @save="handleSave"
    @update:model-value="handleDialogUpdate"
    @update:notes="$emit('update:notes', $event)"
  >
    <template #custom-content>
      <div class="poop-content">
        <!-- Color Selection -->
        <div class="color-section">
          <label class="section-label">Color</label>
          <div class="color-options">
            <div v-if="isPoopOptionsLoading" class="d-flex justify-center pa-4">
              <v-progress-circular indeterminate size="20" />
            </div>
            <div
              v-for="poopColor in colorOptions"
              v-else
              :key="poopColor.value"
              class="color-option"
              :class="{ 'selected': localColor === poopColor.value }"
              @click="selectColor(poopColor.value)"
            >
              <div
                class="color-circle"
                :style="{
                  backgroundColor: poopColor.hex,

                }"
              />
              <div class="color-label">
                {{ poopColor.label }}
              </div>
            </div>
          </div>
          <div v-if="errors.color" class="error-message">
            {{ errors.color }}
          </div>
        </div>

        <!-- Texture Selection -->
        <div class="texture-section">
          <label class="section-label">Consistency</label>
          <div class="texture-options">
            <div v-if="isPoopOptionsLoading" class="d-flex justify-center pa-4">
              <v-progress-circular indeterminate size="20" />
            </div>
            <div
              v-for="poopTexture in textureOptions"
              v-else
              :key="poopTexture.value"
              class="texture-option"
              :class="{ 'selected': localTexture === poopTexture.value }"
              @click="selectTexture(poopTexture.value)"
            >
              <!-- Texture Visual -->
              <div class="texture-visual-img">
                <img
                  alt="texture"
                  class="texture-image"
                  :src="poopTexture.image"
                >
                <div class="texture-label">
                  {{ poopTexture.label }}
                </div>
              </div>

            </div>
          </div>
          <div v-if="errors.texture" class="error-message">
            {{ errors.texture }}
          </div>
        </div>
      </div>
    </template>
  </BaseCheckInDialog>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue'
  import BaseCheckInDialog from '@/components/dialog/BaseCheckInDialog.vue'
  import { useCheckinStore } from '@/stores/checkin' // Add this import

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '',
    },
    texture: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits([
    'update:modelValue',
    'update:color',
    'update:texture',
    'update:notes',
    'save',
    'close',
  ])

  // Use dynamic options from database
  import { usePoopOptions } from '@/composables/usePoopOptions'

  const {
    colorOptions,
    textureOptions,
    isLoading: isPoopOptionsLoading,
  } = usePoopOptions()

  const checkinStore = useCheckinStore() // Add this
  const localColor = ref('')
  const localTexture = ref('')
  const errors = ref({})

  let colorTimeout = null
  let textureTimeout = null

  watch(() => props.modelValue, newValue => {
    if (newValue) {
      localColor.value = props.color || ''
      localTexture.value = props.texture || ''
      errors.value = {}
    }
  }, { immediate: true })

  watch(() => props.color, newValue => {
    if (props.modelValue) {
      localColor.value = newValue || ''
    }
  })

  watch(() => props.texture, newValue => {
    if (props.modelValue) {
      localTexture.value = newValue || ''
    }
  })

  watch(localColor, newValue => {
    if (colorTimeout) clearTimeout(colorTimeout)
    colorTimeout = setTimeout(() => {
      emit('update:color', newValue)
      if (newValue && errors.value.color) {
        delete errors.value.color
      }
    }, 100)
  })

  watch(localTexture, newValue => {
    if (textureTimeout) clearTimeout(textureTimeout)
    textureTimeout = setTimeout(() => {
      emit('update:texture', newValue)
      if (newValue && errors.value.texture) {
        delete errors.value.texture
      }
    }, 100)
  })

  const selectColor = color => {
    localColor.value = color
  }

  const selectTexture = texture => {
    localTexture.value = texture
  }

  // Validation
  const validateColor = () => {
    if (!localColor.value) {
      errors.value.color = 'Please select a color'
      return false
    }
    delete errors.value.color
    return true
  }

  const validateTexture = () => {
    if (!localTexture.value) {
      errors.value.texture = 'Please select a texture'
      return false
    }
    delete errors.value.texture
    return true
  }

  const validateForm = () => {
    errors.value = {}
    const isColorValid = validateColor()
    const isTextureValid = validateTexture()
    return isColorValid && isTextureValid
  }

  const handleDialogUpdate = value => {
    emit('update:modelValue', value)
    if (!value) {
      nextTick(() => {
        errors.value = {}
        localColor.value = ''
        localTexture.value = ''
      })
    }
  }

  const handleClose = () => {
    errors.value = {}
    localColor.value = ''
    localTexture.value = ''
    emit('close')
  }

  const handleSave = async () => {
  console.log('🐾 PoopDialog handleSave clicked!')
  
  if (!validateForm()) {
    console.log('❌ Validation failed:', errors.value)
    return
  }

  const poopData = {
    color: localColor.value,
    texture: localTexture.value,
    notes: props.notes,
  }

  console.log('📦 Poop data to save:', poopData)
  errors.value = {}
  
  try {
    console.log('💾 About to call checkinStore.savePoop...')
    
    // Save to store (which handles backend integration)
    await checkinStore.savePoop(poopData)
    console.log('✅ Poop save completed successfully!')
    
    // Close dialog on success
    handleDialogUpdate(false)
  } catch (error) {
    console.error('❌ Failed to save poop data:', error)
  }
}
</script>

<style scoped>
.poop-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.color-section,
.texture-section {
    display: flex;
    flex-direction: column;
}

.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.color-options {
    display: flex;
    gap: 12px;
    justify-content: flex-start;
    flex-wrap: wrap;
}

.color-option {
    width: 47px;
    height: 61px;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px #E0E0E0 solid;
    border-radius: 8px;
    padding: 8px;
}

.color-option.selected{
    border:1px solid #d32f2f;
}

.color-circle {
    width: 24px;
    height: 24px;
    border-radius: 100%;
    margin-bottom: 4px;
}

.color-label {
    font-size: 10px;
    color: #333;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
}

.texture-options {
    display: flex;
    gap: 12px;
    justify-content: space-between;
}

.texture-option {
    width: 56px;
    height: 74px;
    border-radius: 8px;
    background-color: #FFffff;
    border: 1px solid #e0e0e0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
}

.texture-option.selected {
    border: 1px solid #D87179;
    transform: scale(1.05);
}

.texture-option:hover {
    transform: scale(1.05);
}

.texture-image{
    /* margin-bottom: 4px; */
    width: 40px;
    height: 40px;
    border-radius: 100%;
    background-color: #FFFDE6;
}

.texture-label {
    font-size: 10px;
    color: #333;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
}

.color-option:hover {
    transform: scale(1.05);
}

/* .color-option.selected {
    transform: scale(1.05);
} */

.error-message {
    color: #D87179;
    font-size: 12px;
    margin-top: 8px;
}

.color-options {
    min-height: 70px;
}


</style>
