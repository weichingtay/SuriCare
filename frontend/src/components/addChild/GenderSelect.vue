<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Gender
    </v-label>
    <v-select
      v-model="selectedGender"
      :disabled="isGenderLoading"
      hide-details="auto"
      :items="genderOptions"
      :loading="isGenderLoading"
      :rules="rules"
      variant="outlined"
      @update:model-value="handleSelection"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

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

  const selectedGender = ref(props.modelValue)

  // Use dynamic options from database
  import { useFormOptions } from '@/composables/useFormOptions'

  const {
    genderOptions: genderOptionsData,
    isLoading: isGenderLoading,
  } = useFormOptions()

  // Transform to match expected format for VSelect
  const genderOptions = computed(() =>
    genderOptionsData.value.map(option => ({
      title: option.label,
      value: option.value,
      disabled: option.disabled || false,
    }))
  )

  watch(
    () => props.modelValue,
    newValue => {
      selectedGender.value = newValue
    }
  )

  const handleSelection = () => {
    emit('update:modelValue', selectedGender.value)
  }
</script>
