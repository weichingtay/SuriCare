<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Child Name
    </v-label>
    <v-text-field
      v-model="inputValue"
      hide-details="auto"
      placeholder="Input child name"
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

  const inputValue = ref(props.modelValue)

  watch(
    () => props.modelValue,
    newValue => {
      inputValue.value = newValue
    }
  )

  const handleInput = () => {
    emit('update:modelValue', inputValue.value)
  }
</script>
