<template>
  <BaseCheckInDialog
    icon="mdi-heart"
    icon-color="#D87179"
    :loading="loading"
    max-width="800px"
    :model-value="modelValue"
    :notes="localNotes"
    :subtitle="`Does ${currentChild.name} have any symptoms?`"
    title="Health"
    @close="handleClose"
    @save="handleSave"
    @update:model-value="handleDialogUpdate"
    @update:notes="updateNotes"
  >
    <template #custom-content>
      <div class="symptoms-content">
        <!-- Symptoms Selection -->
        <div class="symptoms-section">
          <label class="section-label">Symptoms</label>
          <div class="symptoms-buttons">
            <div v-if="isSymptomOptionsLoading" class="d-flex justify-center pa-4">
              <v-progress-circular indeterminate size="20" />
            </div>
            <v-btn
              v-for="symptom in symptomOptions"
              v-else
              :key="symptom.value"
              class="symptom-btn"
              :color="localSymptoms.includes(symptom.value) ? 'primary' : 'default'"
              :disabled="loading"
              rounded="20"
              size="small"
              :variant="localSymptoms.includes(symptom.value) ? 'flat' : 'outlined'"
              @click="toggleSymptom(symptom.value)"
            >
              <v-icon
                class="mr-1"
                :icon="symptom.icon"
                size="14"
              />
              {{ symptom.label }}
            </v-btn>
          </div>

          <div v-if="localSymptoms.includes('other')" class="other-symptom-section" style="margin-top: 16px;">
            <label class="section-label">Specify other symptoms</label>
            <v-text-field
              v-model="localOtherSymptom"
              class="other-symptom-input"
              density="compact"
              :disabled="loading"
              :error="!!errors.otherSymptom"
              hide-details
              placeholder="Please describe the specific symptoms"
              variant="outlined"
              @focus="clearError('otherSymptom')"
              @input="clearError('otherSymptom')"
            />
            <div v-if="errors.otherSymptom" class="error-message">
              {{ errors.otherSymptom }}
            </div>
          </div>

          <div v-if="errors.symptoms" class="error-message">
            {{ errors.symptoms }}
          </div>
        </div>

        <!-- Log Photo Section -->
        <div class="photo-section">
          <label class="section-label">Log Photo</label>
          <div
            class="photo-upload-area"
            @click="triggerFileInput"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <v-icon class="mb-2" color="grey-lighten-1" size="40">
              mdi-cloud-upload-outline
            </v-icon>
            <div class="upload-title">
              Upload a File
            </div>
            <div class="upload-subtitle">
              Click to browse, or drag & drop a file here
            </div>
            <input
              ref="fileInput"
              accept="image/*"
              style="display: none;"
              type="file"
              @change="handleFileSelect"
            >
          </div>

          <div v-if="selectedFile" class="selected-file" style="margin-top: 12px;">
            <v-chip
              closable
              color="success"
              size="small"
              variant="outlined"
              @click:close="removeFile"
            >
              <v-icon icon="mdi-file-image" size="16" start />
              {{ selectedFile.name }}
            </v-chip>

            <div v-if="imagePreview" class="image-preview" style="margin-top: 8px;">
              <img
                alt="Preview"
                :src="imagePreview"
                style="max-width: 100px; max-height: 100px; border-radius: 4px; border: 1px solid #e0e0e0;"
              >
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseCheckInDialog>
</template>

<script setup lang="ts">
  import BaseCheckInDialog from './BaseCheckInDialog.vue'
  import { useCheckinStore } from '@/stores/checkin' 
  import { nextTick, ref, watch, computed } from 'vue'
  import { useSymptomOptions } from '@/composables/useSymptomOptions'
  import type { SymptomsData } from '@/stores/checkin'

  const checkinStore = useCheckinStore()

  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false,
    },
    currentChild: {
    type: Object,
    default: () => ({ name: 'Child' })
  },
    maxWidth: {
      type: String,
      default:'800px',
    },
    symptoms: {
      type: Array,
      default: () => [],
    },
    photo: {
      type: File,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    otherSymptom: {
      type: String,
      default: '',
    },
    // NEW: Add editing mode support
    isEditing: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits([
    'update:modelValue',
    'update:symptoms',
    'update:photo',
    'update:notes',
    'update:otherSymptom',
    'save',
    'close',
  ])

  const {
    symptomOptions,
    isLoading: isSymptomOptionsLoading,
  } = useSymptomOptions()

  // Local reactive data
  const localSymptoms = ref([])
  const selectedFile = ref(null)
  const fileInput = ref(null)
  const errors = ref({})
  const localOtherSymptom = ref('')
  const localNotes = ref('')
  const imagePreview = ref(null)

  let symptomsTimeout = null
  let otherSymptomTimeout = null

  watch(() => props.modelValue, newValue => {
    if (newValue) {
      console.log('🏥 Health dialog opened, isEditing:', props.isEditing)
      console.log('🏥 Props:', {
        symptoms: props.symptoms,
        otherSymptom: props.otherSymptom,
        notes: props.notes,
        photo: props.photo
      })
      
      localSymptoms.value = [...(props.symptoms || [])]
      selectedFile.value = props.photo || null
      localOtherSymptom.value = props.otherSymptom || ''
      localNotes.value = props.notes || ''
      imagePreview.value = null

      if (props.photo) {
        createImagePreview(props.photo)
      }

      errors.value = {}
    }
  }, { immediate: true })

  watch(() => props.symptoms, newValue => {
    if (props.modelValue) {
      localSymptoms.value = [...(newValue || [])]
    }
  })

  watch(() => props.photo, newValue => {
    if (props.modelValue) {
      selectedFile.value = newValue || null
      if (newValue) {
        createImagePreview(newValue)
      } else {
        imagePreview.value = null
      }
    }
  })

  watch(() => props.otherSymptom, newValue => {
    if (props.modelValue) {
      localOtherSymptom.value = newValue || ''
    }
  })

  watch(() => props.notes, newValue => {
    if (props.modelValue) {
      localNotes.value = newValue || ''
    }
  })

  watch(localSymptoms, newValue => {
    if (symptomsTimeout) clearTimeout(symptomsTimeout)
    symptomsTimeout = setTimeout(() => {
      if (props.isEditing) {
        emit('update:symptoms', newValue)
      }
      if (newValue && newValue.length > 0 && errors.value.symptoms) {
        delete errors.value.symptoms
      }
    }, 100)
  }, { deep: true })

  watch(localOtherSymptom, newValue => {
    if (otherSymptomTimeout) clearTimeout(otherSymptomTimeout)
    otherSymptomTimeout = setTimeout(() => {
      if (props.isEditing) {
        emit('update:otherSymptom', newValue)
      }
      if (newValue && errors.value.otherSymptom) {
        delete errors.value.otherSymptom
      }
    }, 100)
  })

  watch(selectedFile, newValue => {
    if (props.isEditing) {
      emit('update:photo', newValue)
    }
    if (newValue) {
      createImagePreview(newValue)
    } else {
      imagePreview.value = null
    }
  })

  const updateNotes = (notes: string) => {
    localNotes.value = notes
    if (props.isEditing) {
      emit('update:notes', notes)
    }
  }

  // Methods
  const toggleSymptom = symptom => {
    const currentSymptoms = [...localSymptoms.value]
    const index = currentSymptoms.indexOf(symptom)

    if (index > -1) {
      currentSymptoms.splice(index, 1)
      if (symptom === 'other') {
        localOtherSymptom.value = ''
      }
    } else {
      currentSymptoms.push(symptom)
    }

    localSymptoms.value = currentSymptoms
  }

  const triggerFileInput = () => {
    if (fileInput.value) {
      fileInput.value.click()
    }
  }

  const handleFileSelect = event => {
    const file = event.target.files?.[0]
    if (file) {
      selectedFile.value = file
      createImagePreview(file)
    }
  }

  const handleFileDrop = event => {
    const file = event.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      selectedFile.value = file
      createImagePreview(file)
    }
  }

  const createImagePreview = file => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => {
        imagePreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    selectedFile.value = null
    imagePreview.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  const clearError = field => {
    if (errors.value[field]) {
      delete errors.value[field]
    }
  }

  // Validation
  const validateSymptoms = () => {
    if (!localSymptoms.value || localSymptoms.value.length === 0) {
      errors.value.symptoms = 'Please select at least one symptom'
      return false
    }

    delete errors.value.symptoms
    return true
  }

  const validateOtherSymptom = () => {
    if (localSymptoms.value.includes('other') && !localOtherSymptom.value.trim()) {
      errors.value.otherSymptom = 'Please describe the specific symptoms'
      return false
    }

    delete errors.value.otherSymptom
    return true
  }

  const validateForm = () => {
    const isSymptomsValid = validateSymptoms()
    const isOtherSymptomValid = validateOtherSymptom()

    return isSymptomsValid && isOtherSymptomValid
  }

  // Handle dialog events
  const handleDialogUpdate = value => {
    emit('update:modelValue', value)
    if (!value) {
      nextTick(() => {
        errors.value = {}
        localSymptoms.value = []
        selectedFile.value = null
        localOtherSymptom.value = ''
        localNotes.value = ''
        imagePreview.value = null
      })
    }
  }

  const handleClose = () => {
    errors.value = {}
    localSymptoms.value = []
    selectedFile.value = null
    localOtherSymptom.value = ''
    localNotes.value = ''
    imagePreview.value = null
    emit('close')
  }

  const resetFormData = () => {
    errors.value = {}
    localSymptoms.value = []
    selectedFile.value = null
    localOtherSymptom.value = ''
    localNotes.value = ''
    imagePreview.value = null
  }

  // Handle save
  const handleSave = async () => {
    console.log('🏥 Health dialog handleSave clicked!')
    console.log('🔍 isEditing:', props.isEditing)
    
    if (!validateForm()) {
      console.log('❌ Health validation failed')
      return
    }

    const symptomsData: SymptomsData = {
      symptoms: localSymptoms.value,
      photo: selectedFile.value,
      otherSymptom: localOtherSymptom.value,
      notes: localNotes.value,
    }

    console.log('🏥 Health data to save:', symptomsData)
    errors.value = {}

    if (props.isEditing) {
      // 🖊️ EDIT MODE: Just emit to parent timeline, don't call store
      console.log('📝 Edit mode: emitting save to timeline')
      emit('save', symptomsData)
    } else {
      // ➕ CREATE MODE: Call store to create new entry (normal check-in)
      console.log('➕ Create mode: calling checkinStore.saveSymptoms for new entry')
      
      try {
        console.log('💾 Saving symptoms directly:', symptomsData)

        // Save using the checkin store
        await checkinStore.saveSymptoms(symptomsData)

        console.log('✅ Symptoms saved successfully')

        // Emit save event for parent component
        emit('save')
        // Close dialog and reset form
        resetFormData()
        emit('update:modelValue', false)

      } catch (error) {
        console.error('❌ Failed to save symptoms:', error)
        // Dialog stays open so user can retry
        // Error is already handled by the store and displayed via checkinStore.error
      }
    }
  }
</script>

<style scoped>
.symptoms-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.symptoms-section {
    display: flex;
    flex-direction: column;
}

.section-label {
    font-size: 12px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.symptoms-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.symptom-btn {
    text-transform: none;
    font-weight: 400;
    min-width: 80px;
    height: 32px;
    font-size: 13px;
    border: 1px solid #e0e0e0 !important;
    border-radius: 4px !important;
    color: #000000 !important;
}

.symptom-btn.v-btn--variant-flat {
    background-color: #D87179 !important;
    color: white !important;
}

.symptom-btn.v-btn--variant-flat .v-icon {
    color: white !important;
}

.other-symptom-section {
    display: flex;
    flex-direction: column;
}

.other-symptom-input {
    min-width: 300px;
}

.error-message {
    color: #d32f2f;
    font-size: 12px;
    margin-top: 8px;
}

.photo-section {
    display: flex;
    flex-direction: column;
}

.photo-upload-area {
    border: 2px dashed #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    text-align: center;
    background: #fafafa;
    cursor: pointer;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.photo-upload-area:hover {
    border-color: #1976d2;
    background: #f5f5f5;
}

.upload-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.upload-subtitle {
    font-size: 14px;
    color: #666;
    text-align: center;
}

.selected-file {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
}

.image-preview {
    display: flex;
    justify-content: flex-start;
}

.image-preview img {
    object-fit: cover;
}

/* Override button styling */
.v-btn {
    box-shadow: none !important;
}

.v-btn:hover {
    box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
}
</style>