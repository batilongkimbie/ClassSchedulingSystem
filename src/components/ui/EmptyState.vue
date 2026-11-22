<script setup>
defineProps({ title: String, message: String })
</script>
<template>
  <div class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
    <p class="font-medium text-slate-800">{{ title }}</p><p v-if="message" class="mx-auto mt-1 max-w-sm text-sm text-slate-500">{{ message }}</p>
    <div class="mt-4"><slot /></div>
  </div>
</template>
