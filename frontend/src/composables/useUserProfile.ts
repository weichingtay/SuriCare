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

import { reactive, computed } from 'vue'

// Account options
const accountOptions = [
  { id: 'wei-ching', name: 'Wei Ching', role: 'Guardian' },
  { id: 'yoshi', name: 'Yoshi', role: 'Caregiver' },
  { id: 'aunty-anne', name: 'Aunty Anne', role: 'Caregiver' }
]

// Get persisted account or default to wei-ching
const getPersistedAccount = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('selectedAccountId') || 'wei-ching'
  }
  return 'wei-ching'
}

// Create a shared reactive state
const state = reactive({
  name: 'Wei Ching',
  email: 'weiching@suricare.com',
  role: 'Guardian', // Default role
  selectedAccountId: getPersistedAccount() // Persisted account
})

// Initialize role based on selected account
const initAccount = accountOptions.find(acc => acc.id === state.selectedAccountId)
if (initAccount) {
  state.role = initAccount.role
}

export const useUserProfile = () => {
  const currentAccount = computed(() => {
    return accountOptions.find(acc => acc.id === state.selectedAccountId) || accountOptions[0]
  })

  const availableAccounts = computed(() => {
    return accountOptions.filter(acc => acc.id !== state.selectedAccountId)
  })

  const setAccount = (accountId: string) => {
    const account = accountOptions.find(acc => acc.id === accountId)
    if (account) {
      state.selectedAccountId = accountId
      state.role = account.role
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedAccountId', accountId)
      }
    }
  }

  return {
    userProfile: state,
    currentAccount,
    accountOptions,
    availableAccounts,
    setAccount
  }
}
