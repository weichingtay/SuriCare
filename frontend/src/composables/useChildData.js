import { ref, computed, watch } from 'vue'
import { useChildStore } from '@/stores/child.store'

// Sample data - in a real app, this would come from an API
export const sampleDataByDate = {
  // Jennie's data (child ID: 1)
  '1-2025-05-27': {
    sleep: {
      hours: 12,
      quality: 'Good',
      bedtime: '2025-05-26T20:00:00',
      wakeTime: '2025-05-27T08:00:00'
    },
    food: {
      meals: ['Oatmeal', 'Chicken Rice', 'Pasta'],
      snacks: ['Apple', 'Yogurt'],
      waterIntake: 5 // in cups
    },
    mood: {
      mood: 'Happy',
      activities: ['Played outside', 'Drew pictures'],
      notes: 'Had a great day at the park!'
    }
  },
  // Add more sample data as needed
}

export function useChildData() {
  const childStore = useChildStore()
  const { currentChild } = storeToRefs(childStore)
  
  const currentDate = ref(new Date().toISOString().substr(0, 10))
  const currentAlert = ref(null)
  
  // Computed properties for the current child's data
  const childData = computed(() => {
    const key = `${currentChild.value.id}-${currentDate.value}`
    return sampleDataByDate[key] || generateRandomData(currentDate.value, currentChild.value.name)
  })
  
  // Update alert when child changes
  watch(currentChild, (newChild) => {
    updateAlertForChild(newChild)
  }, { immediate: true })
  
  // Function to update alert based on selected child
  function updateAlertForChild(child) {
    // In a real app, this would come from an API
    const alerts = {
      1: { 
        type: 'info', 
        message: `${child.name} has a doctor's appointment tomorrow at 2:00 PM`,
        icon: 'mdi-hospital-box'
      },
      2: {
        type: 'warning',
        message: `Don't forget to log ${child.name}'s nap time today`,
        icon: 'mdi-sleep'
      }
    }
    
    currentAlert.value = alerts[child.id] || null
  }
  
  // Function to handle date changes
  function handleDateChange(newDate) {
    currentDate.value = newDate
    // In a real app, you would fetch data for the new date here
  }
  
  // Function to generate random data for demonstration
  function generateRandomData(date, childName) {
    const moods = ['Happy', 'Tired', 'Energetic', 'Cranky', 'Playful']
    const activities = [
      'Played with toys', 'Read books', 'Took a nap', 'Went to the park',
      'Drew pictures', 'Played outside', 'Had a playdate'
    ]
    const foods = [
      ['Oatmeal', 'Sandwich', 'Pasta'],
      ['Apple', 'Banana', 'Crackers', 'Yogurt']
    ]
    
    // Randomly select items
    const randomMood = moods[Math.floor(Math.random() * moods.length)]
    const randomActivities = [...activities]
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
    
    return {
      sleep: {
        hours: Math.floor(Math.random() * 4) + 8, // 8-12 hours
        quality: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)],
        bedtime: new Date(date + 'T20:00:00').toISOString(),
        wakeTime: new Date(date + 'T07:00:00').toISOString()
      },
      food: {
        meals: foods[0].sort(() => 0.5 - Math.random()).slice(0, 3),
        snacks: foods[1].sort(() => 0.5 - Math.random()).slice(0, 2),
        waterIntake: Math.floor(Math.random() * 5) + 2 // 2-6 cups
      },
      mood: {
        mood: randomMood,
        activities: randomActivities,
        notes: `${childName} was ${randomMood.toLowerCase()} today. ${randomActivities.join(' and ')}.`
      }
    }
  }
  
  return {
    currentDate,
    currentAlert,
    childData,
    handleDateChange,
    updateAlertForChild
  }
}
