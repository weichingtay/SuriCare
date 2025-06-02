<template>
  <v-toolbar class="fixed-tabs-bar">
    <v-app-bar elevation="1" color="grey-lighten-5" style="padding-left: 30px;">
      <!-- Child profile dropdown menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <!-- Button that shows current child's info -->
          <v-btn 
            v-bind="props"
            variant="text"
            class="text-none"
          >
            <!-- Child's profile picture -->
            <v-avatar size="32" class="mr-2">
              <v-img :src="currentChild.avatar"></v-img>
            </v-avatar>
            <!-- Child's name and age -->
            <div class="d-flex flex-column align-start mr-2">
              <span>{{ currentChild.name }}</span>
              <span class="text-caption text-grey">{{ currentChild.age }} years old</span>
            </div>
            <!-- Dropdown arrow -->
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <!-- Dropdown menu content -->
        <v-list>
          <!-- Loop through all children to create menu items -->
          <v-list-item
            v-for="child in children"
            :key="child.id"
            @click="selectChild(child)"
          >
            <template v-slot:prepend>
              <v-avatar size="32" class="mr-2">
                <v-img :src="child.avatar"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title>{{ child.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ child.age }} years old</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </v-toolbar>
</template>

<script setup>
import { useChildStore } from '@/stores/child.store'
import { storeToRefs } from 'pinia'

const childStore = useChildStore()
const { children, currentChild } = storeToRefs(childStore)
const { selectChild } = childStore
</script>

<style scoped>
.fixed-tabs-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #f5f5f5;
}
</style>
