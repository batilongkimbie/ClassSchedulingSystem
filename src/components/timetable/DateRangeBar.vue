<script setup>
import { ref, watch } from 'vue'
import { addDays, defaultRange, diffDays } from '../../utils/time'
const props = defineProps({ modelValue: Object })
const emit = defineEmits(['update:modelValue'])
const from = ref(props.modelValue.from), to = ref(props.modelValue.to), err = ref('')
watch(() => props.modelValue, (v) => { from.value = v.from; to.value = v.to })
function apply() {
  err.value = ''
  if (!from.value || !to.value) { err.value = 'Choose both a start and an end date.'; return }
  if (to.value < from.value) { err.value = 'End date must be on or after the start date.'; return }
  if (diffDays(from.value, to.value) > 6) { to.value = addDays(from.value, 6); err.value = 'A range can cover at most 7 days, so the end date was adjusted.' }
  emit('update:modelValue', { from: from.value, to: to.value })
}
function shift(n) { from.value = addDays(from.value, n); to.value = addDays(to.value, n); err.value = ''; emit('update:modelValue', { from: from.value, to: to.value }) }
const btn = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
const input = 'rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <div>
    <div class="flex flex-wrap items-end gap-2">
      <button :class="btn" @click="shift(-7)">‹ Previous week</button>
      <button :class="btn" @click="emit('update:modelValue', defaultRange())">Current week</button>
      <button :class="btn" @click="shift(7)">Next week ›</button>
      <label class="ml-0 text-xs text-slate-500 sm:ml-3">From<input v-model="from" type="date" :class="[input, 'mt-1 block']" @change="apply" /></label>
      <label class="text-xs text-slate-500">To<input v-model="to" type="date" :class="[input, 'mt-1 block']" @change="apply" /></label>
    </div>
    <p v-if="err" class="mt-2 text-sm text-red-600" role="alert">{{ err }}</p>
  </div>
</template>
