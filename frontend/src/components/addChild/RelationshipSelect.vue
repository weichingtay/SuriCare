<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Relationship to Child
    </v-label>
    <v-select
      v-model="selectedRelationship"
      :items="relationshipOptions"
      placeholder="Select a relationship"
      variant="outlined"
      :rules="rules"
      hide-details="auto"
      @update:modelValue="handleSelection"
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

  const selectedRelationship = ref(props.modelValue)

  const relationshipOptions = [
    { title: 'Mother', value: 'mother' },
    { title: 'Father', value: 'father' },
    { title: 'Grandfather', value: 'grandfather' },
    { title: 'Grandmother', value: 'grandmother' },
    { title: 'Nanny/Babysitter', value: 'nanny_babysitter' },
    { title: 'Aunt', value: 'aunt' },
    { title: 'Uncle', value: 'uncle' },
    { title: 'Guardian', value: 'guardian' },
    { title: 'Other', value: 'other' },
  ]

  watch(
    () => props.modelValue,
    (newValue) => {
      selectedRelationship.value = newValue
    }
  )

  const handleSelection = () => {
    emit('update:modelValue', selectedRelationship.value)
  }
</script>
