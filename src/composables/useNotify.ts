import { Notify } from 'quasar'

export function useNotify() {
  const success = (message: string) => {
    Notify.create({
      type: 'positive',
      message,
      position: 'top',
      timeout: 3000
    })
  }

  const error = (message: string) => {
    Notify.create({
      type: 'negative',
      message,
      position: 'top',
      timeout: 5000
    })
  }

  const warning = (message: string) => {
    Notify.create({
      type: 'warning',
      message,
      position: 'top',
      timeout: 4000
    })
  }

  const info = (message: string) => {
    Notify.create({
      type: 'info',
      message,
      position: 'top',
      timeout: 3000
    })
  }

  return {
    success,
    error,
    warning,
    info
  }
}
