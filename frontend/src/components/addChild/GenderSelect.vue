<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Gender
    </v-label>
    <v-select
      v-model="selectedGender"
      :items="genderOptions"
      placeholder="Select a gender"
      variant="outlined"
      :rules="rules"
      hide-details="auto"
      @update:modelValue="handleSelection"
    />
  </div>
</template>

<script setup>
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

  const selectedGender = ref(props.modelValue)

  const genderOptions = [
    { title: 'Male', value: 'male' },
    { title: 'Female', value: 'female' },
    { title: 'Other', value: 'other' },
    { title: 'Prefer not to say', value: 'prefer_not_to_say' },
  ]

  watch(
    () => props.modelValue,
    (newValue) => {
      selectedGender.value = newValue
    }
  )

  const handleSelection = () => {
    emit('update:modelValue', selectedGender.value)
  }
</script>
