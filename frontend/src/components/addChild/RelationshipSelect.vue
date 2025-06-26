<template>
  <div>
    <v-label class="text-body-1 font-weight-medium mb-2 text-left d-block">
      Relationship to Child
    </v-label>
    <v-select
      v-model="selectedRelationship"
      :disabled="isRelationshipLoading"
      hide-details="auto"
      :items="relationshipOptions"
      :loading="isRelationshipLoading"
      placeholder="Select a relationship"
      :rules="rules"
      variant="outlined"
      @update:model-value="handleSelection"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

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

  // Use dynamic options from database
  import { useFormOptions } from '@/composables/useFormOptions'

  const {
    relationshipOptions: relationshipOptionsData,
    isLoading: isRelationshipLoading,
  } = useFormOptions()

  // Transform to match expected format for VSelect
  const relationshipOptions = computed(() =>
    relationshipOptionsData.value.map(option => ({
      title: option.label,
      value: option.value,
    }))
  )

  watch(
    () => props.modelValue,
    newValue => {
      selectedRelationship.value = newValue
    }
  )

  const handleSelection = () => {
    emit('update:modelValue', selectedRelationship.value)
  }
</script>
