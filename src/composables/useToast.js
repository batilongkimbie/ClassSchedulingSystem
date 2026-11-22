import { reactive } from 'vue'
// type: success | error | warning | info
export const toasts = reactive([])
let n = 0
export function useToast() {
  const dismiss = (id) => { const i = toasts.findIndex((t) => t.id === id); if (i > -1) toasts.splice(i, 1) }
  const push = (type, message, ms = 4000) => {
    const id = ++n; toasts.push({ id, type, message }); setTimeout(() => dismiss(id), ms)
  }
  return {
    dismiss,
    success: (m) => push('success', m), error: (m) => push('error', m),
    warning: (m) => push('warning', m), info: (m) => push('info', m),
  }
}
