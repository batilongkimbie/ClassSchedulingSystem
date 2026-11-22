<script setup>
import { ref, computed, watch } from 'vue'
import WeeklyTimetable from '../../components/timetable/WeeklyTimetable.vue'
import DateRangeBar from '../../components/timetable/DateRangeBar.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { useScheduleStore } from '../../stores/schedule'
import { rooms, by } from '../../data/mockData'
import { defaultRange, dayCols, fmtRange, fmtTime, fmtDate, DAYS, dayIndexOf } from '../../utils/time'
const store = useScheduleStore()
const range = ref(defaultRange()), q = ref(''), roomId = ref(rooms[0].id), selected = ref(null)
const list = computed(() => rooms.filter((r) => r.name.toLowerCase().includes(q.value.toLowerCase())))
watch(list, (l) => { if (l.length && !l.some((r) => r.id === roomId.value)) roomId.value = l[0].id })
const room = computed(() => by.room(roomId.value))
const cols = computed(() => dayCols(range.value.from, range.value.to))
const events = computed(() => (room.value ? store.eventsForRoom(roomId.value, range.value.from, range.value.to) : []))
const sorted = computed(() => [...events.value].sort((a, b) => a.col.localeCompare(b.col) || a.start.localeCompare(b.start)))
const field = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <div>
    <h1 class="text-2xl font-semibold">Room Timetables</h1>
    <p class="mt-1 text-sm text-slate-600">Scheduled classes and approved reservations for every classroom on campus.</p>
    <div class="mt-5 flex flex-wrap items-end gap-3">
      <input v-model="q" type="search" placeholder="Search room" :class="[field, 'w-full sm:w-52']" />
      <select v-model="roomId" :class="field" aria-label="Room"><option v-for="r in list" :key="r.id" :value="r.id">{{ r.name }}</option></select>
      <slot name="actions" :room-id="roomId" />
    </div>
    <div class="mt-4"><DateRangeBar v-model="range" /></div>
    <template v-if="room">
      <div class="mt-5 flex flex-wrap items-center gap-3 text-sm"><h2 class="text-lg font-semibold">{{ room.name }}</h2>
        <span class="capitalize text-slate-500">{{ room.type }} · {{ room.category }} · capacity {{ room.capacity }}</span><span class="text-slate-400">{{ fmtRange(range) }}</span></div>
      <div class="mt-3"><WeeklyTimetable :days="cols" :events="events" @select="selected = $event" /></div>
      <p class="mt-2 flex flex-wrap gap-x-4 text-xs text-slate-500"><span class="text-emerald-600">■ Discussion</span><span class="text-sky-600">■ Laboratory</span><span class="text-amber-500">■ Approved reservation</span></p>

      <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th v-for="h in ['Day', 'Time', 'Type', 'Course / purpose', 'Instructor', 'Class set']" :key="h" class="px-4 py-2.5 font-medium">{{ h }}</th></tr></thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="e in sorted" :key="e.id" :class="selected?.id === e.id ? 'bg-emerald-50' : ''">
              <td class="px-4 py-2.5">{{ DAYS[dayIndexOf(e.col)].slice(0, 3) }}, {{ fmtDate(e.col) }}</td><td class="whitespace-nowrap px-4 py-2.5">{{ fmtTime(e.start) }} – {{ fmtTime(e.end) }}</td>
              <td class="px-4 py-2.5"><span :class="['rounded-full px-2 py-0.5 text-xs font-medium', e.kind === 'reservation' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700']">{{ e.meta.type }}</span></td>
              <td class="px-4 py-2.5"><span class="font-medium">{{ e.meta.course !== '—' ? e.meta.course : '' }}</span> {{ e.meta.courseTitle }}</td><td class="px-4 py-2.5">{{ e.meta.instructor }}</td><td class="px-4 py-2.5">{{ e.meta.classSet }}</td>
            </tr>
            <tr v-if="!sorted.length"><td colspan="6" class="px-4 py-10 text-center text-slate-500">Nothing is scheduled in {{ room.name }} for this date range.</td></tr>
          </tbody>
        </table>
      </div>
    </template>
    <div v-else class="mt-6"><EmptyState title="No rooms found" message="Try a different search." /></div>
  </div>
</template>
