<script setup>
import { toasts, useToast } from '../../composables/useToast'
import Icon from './Icon.vue'
const { dismiss } = useToast()
const styles = {
  success: 'border-emerald-300 bg-emerald-50 text-emerald-900', error: 'border-red-300 bg-red-50 text-red-900',
  warning: 'border-amber-300 bg-amber-50 text-amber-900', info: 'border-sky-300 bg-sky-50 text-sky-900',
}
</script>
<template>
  <div class="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 sm:w-96" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" role="status"
         :class="['flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md', styles[t.type]]">
      <Icon :name="t.type === 'success' ? 'check' : 'alert'" :size="18" class="mt-0.5 shrink-0" />
      <p class="flex-1 text-sm">{{ t.message }}</p>
      <button class="p-1 -m-1 opacity-60 hover:opacity-100" aria-label="Dismiss" @click="dismiss(t.id)"><Icon name="x" :size="16" /></button>
    </div>
  </div>
</template>
