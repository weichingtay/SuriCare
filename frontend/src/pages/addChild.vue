<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
      v-if="action === 'signup'"
    >
      <v-col
        cols="12"
        lg="3"
        md="5"
        sm="7"
      >
        <v-card
          class="pa-8"
          elevation="0"
          style="background-color: transparent"
        >
          <AddChildForm @submit="handleSubmit" />
        </v-card>
      </v-col>
    </v-row>

    <v-row
      align="center"
      justify="center"
      v-else
    >
      <v-col
        cols="12"
        lg="5"
        md="7"
        sm="9"
      >
        <v-card
          class="pa-8"
          elevation="0"
          style="background-color: transparent"
        >
          <AddChildForm @submit="handleSubmit" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import AddChildForm from '../components/addChild/AddChildForm.vue'

  const route = useRoute()

  const action = route.query.action

  const handleSubmit = (childData) => {
    console.log('Child data submitted:', childData)
    // Handle form submission here
  }
</script>
