<template>
  <v-btn
    block
    color="#D87179"
    :disabled="disabled"
    :loading="loading"
    size="large"
    @click="handleClick"
  >
    Add Child
  </v-btn>
</template>

<script setup lang="ts">
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  })

  const emit = defineEmits(['click'])

  const handleClick = () => {
    emit('click')
  }
</script>
