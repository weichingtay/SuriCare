<template>
  <v-btn
    color="red-lighten-1"
    size="large"
    block
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  >
    Add Child
  </v-btn>
</template>

<script setup>
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
