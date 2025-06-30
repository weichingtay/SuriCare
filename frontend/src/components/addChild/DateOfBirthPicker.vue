<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Date of Birth
    </v-label>
    <v-text-field
      v-model="dateValue"
      hide-details="auto"
      placeholder="Select date of birth"
      prepend-inner-icon="mdi-calendar"
      readonly
      :rules="rules"
      variant="outlined"
      @click="openDatePicker"
    />

    <v-dialog
      v-model="datePickerDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title class="text-h6"> Select Date of Birth </v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="selectedDate"
            color="primary"
            show-adjacent-months
            @update:model-value="handleDateSelection"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="datePickerDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="confirmDateSelection"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    rules: {
      type: Array,
      default: () => [],
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const dateValue = ref(props.modelValue)
  const selectedDate = ref(null)
  const datePickerDialog = ref(false)

  watch(
    () => props.modelValue,
    newValue => {
      dateValue.value = newValue
      if (newValue) {
        // Convert string date to Date object for picker
        const date = new Date(newValue)
        if (!isNaN(date.getTime())) {
          selectedDate.value = date
        }
      }
    }
  )

  const openDatePicker = () => {
    datePickerDialog.value = true
  }

  const handleDateSelection = date => {
    selectedDate.value = date
  }

  const confirmDateSelection = () => {
    if (selectedDate.value) {
      const formattedDate = formatDate(selectedDate.value)
      dateValue.value = formattedDate
      emit('update:modelValue', formattedDate)
    }
    datePickerDialog.value = false
  }

  const formatDate = date => {
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    return date.toLocaleDateString('en-US', options)
  }
</script>
