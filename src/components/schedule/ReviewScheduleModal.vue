<script setup>
import { computed } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import WeeklyTimetable from '../timetable/WeeklyTimetable.vue'
import { useScheduleStore } from '../../stores/schedule'
import { by } from '../../data/mockData'
import { DAYS, fmtTime } from '../../utils/time'
const props = defineProps({ open: Boolean, classSetId: String })
const emit = defineEmits(['close'])
const store = useScheduleStore()
const cols = DAYS.map((d) => ({ key: d, label: d, sub: '' }))
const set = computed(() => by.classSet(props.classSetId))
const ccs = computed(() => store.classCourses.filter((c) => c.classSetId === props.classSetId))
const events = computed(() => (props.open ? store.eventsForClassSet(props.classSetId) : []))
const incomplete = computed(() => ccs.value.filter((c) => store.ccStatus(c) !== 'Complete'))
const rows = computed(() => events.value.map((e) => ({ ...e.meta, id: e.id, day: e.col, start: e.start, end: e.end })).sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start)))
</script>
<template>
  <Modal :open="open" size="xl" :title="`Review schedule: ${set?.name || ''}`" subtitle="Weekly timetable for the whole class set" @close="emit('close')">
    <div v-if="incomplete.length" class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="alert">
      <p class="font-medium">{{ incomplete.length }} of {{ ccs.length }} course{{ ccs.length === 1 ? '' : 's' }} still incomplete</p>
      <ul class="mt-1 space-y-0.5"><li v-for="c in incomplete" :key="c.id">{{ by.course(c.courseId).code }}: <StatusBadge :status="store.ccStatus(c)" /></li></ul>
    </div>
    <p v-else-if="ccs.length" class="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">All courses have an instructor and a room. This schedule is complete.</p>
    <WeeklyTimetable :days="cols" :events="events" />
    <div class="mt-5 overflow-x-auto rounded-xl border border-slate-200">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th v-for="h in ['Class set', 'Code', 'Description', 'Instructor', 'Classroom', 'Day', 'Start', 'End', 'Type']" :key="h" class="px-3 py-2 font-medium">{{ h }}</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="r in rows" :key="r.id"><td class="px-3 py-2">{{ r.classSet }}</td><td class="px-3 py-2 font-medium">{{ r.course }}</td><td class="px-3 py-2">{{ r.courseTitle }}</td><td class="px-3 py-2">{{ r.instructor }}</td><td class="px-3 py-2">{{ r.room }}</td><td class="px-3 py-2">{{ r.day }}</td><td class="px-3 py-2">{{ fmtTime(r.start) }}</td><td class="px-3 py-2">{{ fmtTime(r.end) }}</td><td class="px-3 py-2 capitalize">{{ r.classType }}</td></tr>
          <tr v-if="!rows.length"><td colspan="9" class="px-3 py-8 text-center text-slate-500">No rooms have been assigned yet.</td></tr>
        </tbody>
      </table>
    </div>
    <template #footer><button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="emit('close')">Close</button></template>
  </Modal>
</template>
