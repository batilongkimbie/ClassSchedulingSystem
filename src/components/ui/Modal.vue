<script setup>
defineProps({ open: Boolean, title: String, subtitle: String, size: { type: String, default: 'md' }, z: { type: Number, default: 50 } })
const emit = defineEmits(['close'])
const w = { sm: 'sm:max-w-md', md: 'sm:max-w-2xl', lg: 'sm:max-w-4xl', xl: 'sm:max-w-6xl' }
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4" :style="{ zIndex: z }" role="dialog" aria-modal="true">
      <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')"></div>
      <div :class="['relative flex max-h-[94vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl', w[size]]">
        <header class="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
          <div class="min-w-0 flex-1"><h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2><p v-if="subtitle" class="mt-0.5 text-sm text-slate-500">{{ subtitle }}</p></div>
          <button class="-m-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close" @click="emit('close')">✕</button>
        </header>
        <div class="flex-1 overflow-y-auto px-5 py-4"><slot /></div>
        <footer v-if="$slots.footer" class="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-3"><slot name="footer" /></footer>
      </div>
    </div>
  </Teleport>
</template>
