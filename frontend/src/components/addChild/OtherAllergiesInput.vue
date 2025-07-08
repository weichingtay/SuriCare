<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Other Allergies
    </v-label>
    <v-text-field
      v-model="inputOtherAllergies"
      hide-details="auto"
      placeholder="Input other allergies"
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

  const inputOtherAllergies = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newValue) => {
      inputOtherAllergies.value = newValue
    }
  )

  const handleInput = () => {
    emit('update:modelValue', inputOtherAllergies.value)
  }
</script>
