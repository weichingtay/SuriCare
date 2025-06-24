<template>
  <div class="account-type-selector mb-6">
    <h3 class="text-h5 font-weight-medium mb-4">Create an Account</h3>
    <v-tabs
      v-model="selectedType"
      color="black"
      align-tabs="center"
      grow
      class="mb-9"
    >
      <v-tab
        value="Legal Guardian"
        class="text-capitalize"
        :class="{ 'tab-active': selectedType === 'Legal Guardian', 'tab-inactive': selectedType !== 'Legal Guardian' }"
      >
        Legal Guardian
      </v-tab>
      <v-tab
        value="Caregiver"
        class="text-capitalize"
        :class="{ 'tab-active': selectedType === 'Caregiver', 'tab-inactive': selectedType !== 'Caregiver' }"
      >
        Caregiver
      </v-tab>
    </v-tabs>
  </div>
</template>

<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: 'Legal Guardian',
    },
  })

  const emit = defineEmits(['update:modelValue'])

  const selectedType = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })
</script>

<style scoped>
  .account-type-selector {
    text-align: center;
  }

  .tab-active {
    font-weight: 600;
  }

  .tab-inactive {
    color: #B3B3B3;
  }

  :deep(.v-tabs) {
    border-bottom: 1px solid #e0e0e0;
  }

  :deep(.v-tab) {
    font-weight: 500;
    text-transform: none;
  }

  :deep(.v-tab--selected) {
    color: #1976d2;
    font-weight: 600;
  }
</style>
