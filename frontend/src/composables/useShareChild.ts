import { ref } from 'vue'

/**
 * Provides reactive state and helper functions for generating and sharing a child access code/URL.
 * NOTE: This is placeholder logic for prototyping. In production, replace the random code
 * generation with a secure backend-driven implementation.
 */
export function useShareChild() {
  // Dialog visibility
  const showShareDialog = ref(false)

  // Access level selector
  const shareAccessType = ref<'full' | 'partial'>('partial')
  const accessOptions = [
    { title: 'Full Access', value: 'full' },
    { title: 'Partial Access', value: 'partial' },
  ] as const

  // Generated data
  const shareCode = ref('')
  const shareUrl = ref('')

  /**
   * Generates a placeholder code & URL for the given child id.
   * @param childId – the id of the child you want to share
   */
  const generatePlaceholderData = (childId: number | string) => {
    shareCode.value = Math.random().toString(36).substring(2, 8).toUpperCase()
    shareUrl.value = `https://example.com/child/${childId}/checkin`
  }

  /**
   * Opens the share dialog, generating fresh placeholder data for the provided child id.
   */
  const openShareDialog = (childId: number | string) => {
    generatePlaceholderData(childId)
    showShareDialog.value = true
  }

  /** Closes the share dialog. */
  const closeDialog = () => {
    showShareDialog.value = false
  }

  // Snackbar / copy-to-clipboard feedback
  const showCopySnackbar = ref(false)
  const copyMessage = ref('Copied!')

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      copyMessage.value = 'Copied!'
    } catch (e) {
      copyMessage.value = 'Failed to copy'
    }

    showCopySnackbar.value = true
  }

  return {
    // state
    showShareDialog,
    shareAccessType,
    accessOptions,
    shareCode,
    shareUrl,
    showCopySnackbar,
    copyMessage,
    // actions
    openShareDialog,
    closeDialog,
    copyToClipboard,
  }
} 