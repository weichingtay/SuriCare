<!-- ChildSelector.vue -->
<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" variant="text" class="text-none">
        <!-- Child avatar -->
        <v-avatar size="32" class="mr-2">
          <v-img :src="currentChild.avatar"></v-img>
        </v-avatar>
        <!-- Child info -->
        <div class="d-flex flex-column align-start mr-2">
          <span>{{ currentChild.name }}</span>
          <span class="text-caption text-grey">{{ currentChild.age }} years old</span>
        </div>
        <v-icon>mdi-chevron-down</v-icon>
      </v-btn>
    </template>

    <!-- Dropdown list of children -->
    <v-list>
      <v-list-item
        v-for="child in children"
        :key="child.id"
        @click="handleChildSelect(child)"
      >
        <template v-slot:prepend>
          <v-avatar size="32">
            <v-img :src="child.avatar"></v-img>
          </v-avatar>
        </template>
        <v-list-item-title>{{ child.name }}</v-list-item-title>
        <v-list-item-subtitle>{{ child.age }} years old</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { useChildStore } from '../stores/childStore'
import { useAlertStore } from '../stores/alertStore'
import { useSummaryStore } from '../stores/summaryStore'
import { storeToRefs } from 'pinia'

const childStore = useChildStore()
const alertStore = useAlertStore()
const summaryStore = useSummaryStore()

const { children, currentChild } = storeToRefs(childStore)
const { selectedDate } = storeToRefs(summaryStore)

const handleChildSelect = (child) => {
  childStore.selectChild(child)
  alertStore.updateAlertForChild(child.id)
  summaryStore.loadDataForDate(selectedDate.value, child.id)
}
</script> 