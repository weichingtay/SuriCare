<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Child Name
    </v-label>
    <v-text-field
      v-model="inputValue"
      placeholder="Input child name"
      variant="outlined"
      :rules="rules"
      hide-details="auto"
      @input="handleInput"
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

  const inputValue = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newValue) => {
      inputValue.value = newValue
    }
  )

  const handleInput = () => {
    emit('update:modelValue', inputValue.value)
  }
</script>
