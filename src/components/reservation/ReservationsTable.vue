<script setup>
import { ref, computed, watch } from 'vue'
import StatusBadge from '../ui/StatusBadge.vue'
import Pagination from '../ui/Pagination.vue'
import { by } from '../../data/mockData'
import { fmtDate, fmtTime } from '../../utils/time'
const props = defineProps({ rows: Array, mode: { type: String, default: 'dean' } })
const emit = defineEmits(['open'])
const q = ref(''), status = ref('All'), page = ref(1), SIZE = 8
const tabs = ['All', 'Pending', 'Approved', 'Rejected']
const count = (s) => (s === 'All' ? props.rows.length : props.rows.filter((r) => r.status === s).length)
const filtered = computed(() => props.rows.filter((r) => (status.value === 'All' || r.status === status.value)
  && `${by.faculty(r.instructorId).name} ${by.room(r.roomId).name} ${r.purpose}`.toLowerCase().includes(q.value.toLowerCase()))
  .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)))
const paged = computed(() => filtered.value.slice((page.value - 1) * SIZE, page.value * SIZE))
watch([q, status], () => (page.value = 1))
const heads = computed(() => [...(props.mode === 'dean' ? ['Instructor'] : []), props.mode === 'dean' ? 'Room requested' : 'Requested classroom', 'Date', 'Start', 'End', 'Purpose', 'Submitted', 'Status', props.mode === 'dean' ? 'Actions' : 'Action'])
</script>
<template>
  <div class="rounded-xl border border-slate-200 bg-white">
    <div class="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
      <div class="flex flex-wrap gap-1.5"><button v-for="t in tabs" :key="t" :class="['rounded-full px-3 py-1 text-sm font-medium', status === t ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200']" @click="status = t">{{ t }} <span class="opacity-70">{{ count(t) }}</span></button></div>
      <input v-model="q" type="search" placeholder="Search requests" class="ml-auto w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 sm:w-64" />
    </div>
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th v-for="h in heads" :key="h" class="whitespace-nowrap px-4 py-2.5 font-medium">{{ h }}</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="r in paged" :key="r.id" class="cursor-pointer hover:bg-slate-50" @click="emit('open', r.id)">
            <td v-if="mode === 'dean'" class="whitespace-nowrap px-4 py-3 font-medium">{{ by.faculty(r.instructorId).name }}</td>
            <td class="whitespace-nowrap px-4 py-3">{{ by.room(r.roomId).name }}</td><td class="whitespace-nowrap px-4 py-3">{{ fmtDate(r.date) }}</td>
            <td class="whitespace-nowrap px-4 py-3">{{ fmtTime(r.start) }}</td><td class="whitespace-nowrap px-4 py-3">{{ fmtTime(r.end) }}</td>
            <td class="max-w-[16rem] truncate px-4 py-3" :title="r.purpose">{{ r.purpose }}</td><td class="whitespace-nowrap px-4 py-3 text-slate-500">{{ fmtDate(r.submittedAt.slice(0, 10)) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="r.status" /></td>
            <td class="px-4 py-3"><button class="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-white" @click.stop="emit('open', r.id)">{{ mode === 'dean' && r.status === 'Pending' ? 'Review' : 'View' }}</button></td>
          </tr>
          <tr v-if="!filtered.length"><td :colspan="heads.length" class="px-4 py-12 text-center text-slate-500">{{ rows.length ? 'No requests match your filters.' : 'No reservation requests yet.' }}</td></tr>
        </tbody>
      </table>
    </div>
    <Pagination v-model:page="page" :size="SIZE" :total="filtered.length" />
  </div>
</template>
