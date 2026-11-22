<script setup>
import Icon from './Icon.vue'
defineProps({ label: String, value: [Number, String], icon: String, tone: { type: String, default: 'emerald' } })
const t = { emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', sky: 'bg-sky-50 text-sky-700', slate: 'bg-slate-100 text-slate-600' }
</script>
<template>
  <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
    <span :class="['grid h-11 w-11 shrink-0 place-items-center rounded-lg', t[tone]]"><Icon :name="icon" /></span>
    <div><p class="text-2xl font-semibold text-slate-900">{{ value }}</p><p class="text-sm text-slate-500">{{ label }}</p></div>
  </div>
</template>
