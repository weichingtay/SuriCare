// import { ref } from 'vue'

// export const useUserProfile = () => {
//   const userProfile = ref({
//     name: 'Sarah Johnson',
//     email: 'sarah.johnson@example.com',
//     role: 'Guardian',
//   })

//   const setRole = (newRole: 'Guardian' | 'Caregiver') => {
//     userProfile.value.role = newRole
//   }

//   return {
//     userProfile,
//     setRole,
//   }
// }

import { reactive } from 'vue'

// Create a shared reactive state
const state = reactive({
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  role: 'Guardian' // Default role
})

export const useUserProfile = () => {
  return {
    userProfile: state
  }
}
