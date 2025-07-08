<template>
  <v-btn
    block
    color="#D87179"
    :disabled="disabled"
    :loading="loading"
    size="large"
    @click="handleClick"
    v-if="action === 'signup'"
  >
    Add Child
  </v-btn>

  <v-btn
    class="w-50"
    color="#D87179"
    :disabled="disabled"
    :loading="loading"
    size="large"
    @click="handleClick"
    v-else
  >
    Add Child
  </v-btn>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const action = route.query.action
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
