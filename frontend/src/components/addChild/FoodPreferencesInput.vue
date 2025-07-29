<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Food Preferences
    </v-label>
    <v-text-field
      v-model="inputFoodPreferences"
      hide-details="auto"
      placeholder="Input food preferences"
      :rules="rules"
      variant="outlined"
      @input="handleInput"
    />
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

  const inputFoodPreferences = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newValue) => {
      inputFoodPreferences.value = newValue
    }
  )

  const handleInput = () => {
    emit('update:modelValue', inputFoodPreferences.value)
  }
</script>
