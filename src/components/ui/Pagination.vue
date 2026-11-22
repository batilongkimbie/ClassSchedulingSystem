<script setup>
import { computed } from 'vue'
const props = defineProps({ page: Number, size: Number, total: Number })
const emit = defineEmits(['update:page'])
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.size)))
const from = computed(() => (props.total ? (props.page - 1) * props.size + 1 : 0))
const to = computed(() => Math.min(props.total, props.page * props.size))
const b = 'rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white'
</script>
<template>
  <div class="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
    <span>Showing {{ from }}–{{ to }} of {{ total }}</span>
    <div class="flex items-center gap-2"><button :class="b" :disabled="page <= 1" @click="emit('update:page', page - 1)">Previous</button><span>Page {{ page }} of {{ pages }}</span><button :class="b" :disabled="page >= pages" @click="emit('update:page', page + 1)">Next</button></div>
  </div>
</template>
