<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Allergic to Food
    </v-label>
    <v-text-field
      v-model="inputAllergicToFood"
      hide-details="auto"
      placeholder="Input allergic to food"
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

  const inputAllergicToFood = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newValue) => {
      inputAllergicToFood.value = newValue
    }
  )

  const handleInput = () => {
    emit('update:modelValue', inputAllergicToFood.value)
  }
</script>
