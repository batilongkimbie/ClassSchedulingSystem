<script setup>
defineProps({
  open: Boolean, title: String, message: String,
  confirmText: { type: String, default: 'Confirm' }, danger: Boolean,
})
defineEmits(['confirm', 'cancel'])
</script>
<template>
  <Teleport to="body"><div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true"
       @keydown.esc="$emit('cancel')">
    <div class="absolute inset-0 bg-slate-900/50" @click="$emit('cancel')"></div>
    <div class="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
      <p class="mt-2 text-sm text-slate-600">{{ message }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="$emit('cancel')">Cancel</button>
        <button :class="['rounded-lg px-4 py-2 text-sm font-medium text-white', danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-700 hover:bg-emerald-800']"
                @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div></Teleport>
</template>
