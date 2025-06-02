<!-- QuickActions.vue -->
<template>
  <div>
    <h2 class="text-h6 mb-3">Quick Actions</h2>
    <v-row>
      <v-col 
        v-for="action in quickActions" 
        :key="action.title"
        cols="12" 
        md="6"
      >
        <v-card elevation="1" @click="handleActionClick(action.route)">
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="large" class="mr-3">{{ action.icon }}</v-icon>
              <div>
                <h4 class="text-subtitle-1">{{ action.title }}</h4>
                <p class="text-body-2 text-grey">
                  {{ action.description }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const quickActions = [
  {
    title: 'Dashboard',
    description: 'Display data trends using interactive graphs and charts for sleep duration, poop, and dietary habits',
    icon: 'mdi-chart-line',
    route: '/dashboard'
  },
  {
    title: 'Guidance Hub',
    description: 'Get personalised recommendations based on child\'s daily checkins',
    icon: 'mdi-chart-bar',
    route: '/guidance'
  }
]

const handleActionClick = (route) => {
  router.push(route)
}
</script> 