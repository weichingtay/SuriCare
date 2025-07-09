// Development mode configuration
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'

// Console logging utilities
export const devLog = (...args: any[]): void => {
  if (DEV_MODE) {
    console.log('[DEV]', ...args)
  }
}

export const devError = (...args: any[]): void => {
  if (DEV_MODE) {
    console.error('[DEV ERROR]', ...args)
  }
}

export const devWarn = (...args: any[]): void => {
  if (DEV_MODE) {
    console.warn('[DEV WARN]', ...args)
  }
}

export { DEV_MODE as default }