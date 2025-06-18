<template>
  <!-- The popup dialog -->
  <v-dialog
    v-model="showDialog"
    max-width="647px"
    persistent
    
  >
    <v-card rounded="lg">
      <!-- Top part with title and X button -->
      <v-card-title class="d-flex align-center justify-space-between ps-6 pt-7 pb-7">
        <div class="d-flex align-center">
          <v-icon class="mr-2">mdi-silverware-fork-knife</v-icon>
          <span class="text-h6">Log Meal</span>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
        ></v-btn>
      </v-card-title>
      

      <!-- Subtitle -->
      <v-card-subtitle class="ps-6 ">
        What did Jennie eat?
      </v-card-subtitle>
      
      
      <!-- Main form content -->
      <v-card-text class="pa-4">
        
        <!-- Meal Time Buttons -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">Meal Time</label>
          <v-btn-toggle
            v-model="formData.mealTime"
            mandatory
            class="w-100"
          >
            <v-btn value="breakfast" size="small" class="flex-1">
              <v-icon class="mr-1">mdi-weather-sunny</v-icon>
              Breakfast
            </v-btn>
            <v-btn value="lunch" size="small" class="flex-1">
              <v-icon class="mr-1">mdi-silverware</v-icon>
              Lunch
            </v-btn>
            <v-btn value="dinner" size="small" class="flex-1">
              <v-icon class="mr-1">mdi-weather-night</v-icon>
              Dinner
            </v-btn>
          </v-btn-toggle>
        </div>
        
        <!-- Dropdown for consumption level -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">Consumption Level</label>
          <v-select
            v-model="formData.consumptionLevel"
            :items="consumptionOptions"
            variant="outlined"
            density="comfortable"
            hide-details
          ></v-select>
        </div>
        
        <!-- Food category buttons -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">Meal Category</label>
          <v-btn-toggle
            v-model="formData.categories"
            multiple
            class="w-100"
          >
            <v-btn value="milk" size="small" class="flex-1 ma-1">
              <v-icon class="mr-1">mdi-cup</v-icon>
              Milk
            </v-btn>
            <v-btn value="solid" size="small" class="flex-1 ma-1">
              <v-icon class="mr-1">mdi-food-apple</v-icon>
              Solid
            </v-btn>
            <v-btn value="mixed" size="small" class="flex-1 ma-1">
              <v-icon class="mr-1">mdi-mixer</v-icon>
              Mixed
            </v-btn>
            <v-btn value="others" size="small" class="flex-1 ma-1">
              <v-icon class="mr-1">mdi-dots-horizontal</v-icon>
              Others
            </v-btn>
          </v-btn-toggle>
        </div>
        
        <!-- Text area for notes -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">Remark/Notes</label>
          <v-textarea
            v-model="formData.notes"
            placeholder="Type details here"
            variant="outlined"
            rows="3"
            hide-details
          ></v-textarea>
        </div>
      </v-card-text>
      
      <!-- Bottom buttons -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          rounded="lg"
          @click="saveMeal"
          class="px-8"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'LogMealDialog',
  props: {
    // This controls if dialog shows or hides
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'save-meal'],
  data() {
    return {
      // Form data - what user types/selects
      formData: {
        mealTime: 'breakfast',
        consumptionLevel: '0% (Refused)',
        categories: [],
        notes: ''
      },
      // Options for the dropdown
      consumptionOptions: [
        '0% (Refused)',
        '25% (Quarter)',
        '50% (Half)',
        '75% (Most)',
        '100% (All)'
      ]
    }
  },
  computed: {
    // Controls if dialog is visible
    showDialog: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },
  methods: {
    // Close the dialog
    closeDialog() {
      this.showDialog = false
    },
    
    // Save button clicked
    saveMeal() {
      // Send the form data to parent component
      this.$emit('save-meal', this.formData)
      
      // Show what user entered (for now)
      console.log('User entered:', this.formData)
      
      // Close dialog
      this.closeDialog()
      
      // Reset form
      this.resetForm()
    },
    
    // Clear the form
    resetForm() {
      this.formData = {
        mealTime: 'breakfast',
        consumptionLevel: '0% (Refused)',
        categories: [],
        notes: ''
      }
    }
  }
}
</script>

<style scoped>
/* Make buttons take equal width */
.flex-1 {
  flex: 1;
}

.w-100 {
  width: 100%;
}

/* Style the button groups */
.v-btn-toggle {
  display: flex;
  width: 100%;
}

.v-btn-toggle .v-btn {
  border-radius: 8px !important;
  margin: 0 2px;
}

/* Food category buttons in 2x2 grid */
.v-btn-toggle[multiple] {
  flex-wrap: wrap;
}

.v-btn-toggle[multiple] .v-btn {
  min-width: calc(50% - 8px);
}
</style>