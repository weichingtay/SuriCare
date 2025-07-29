<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Allergic to Medicine
    </v-label>
    <v-text-field
      v-model="inputAllergicToMedicine"
      hide-details="auto"
      placeholder="Input allergic to medicine"
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

  const inputAllergicToMedicine = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newValue) => {
      inputAllergicToMedicine.value = newValue
    }
  )

  const handleInput = () => {
    emit('update:modelValue', inputAllergicToMedicine.value)
  }
</script>
