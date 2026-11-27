<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import WeeklyTimetable from '../timetable/WeeklyTimetable.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { by } from '../../data/mockData'
import { DAYS, toMin, defaultRange, dayCols, addDays, fmtDate } from '../../utils/time'
const props = defineProps({ open: Boolean, ccId: String, roomId: String, classType: String })
const emit = defineEmits(['close', 'saved'])
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const week = defaultRange(), cols = dayCols(week.from, week.to)
const days = ref([]), start = ref(''), end = ref(''), touched = ref(false)
watch(() => props.open, (v) => { if (v) { days.value = []; start.value = ''; end.value = ''; nextTick(() => (touched.value = false)) } })
watch([days, start, end], () => (touched.value = true), { deep: true })
const room = computed(() => by.room(props.roomId))
const cc = computed(() => store.classCourses.find((c) => c.id === props.ccId))
const course = computed(() => cc.value && by.course(cc.value.courseId))
const payload = computed(() => ({ ccId: props.ccId, roomId: props.roomId, classType: props.classType, days: [...days.value].sort(), start: start.value, end: end.value, programId: auth.user.programId }))
const errors = computed(() => (touched.value && props.open ? store.validateAssignment(payload.value) : []))
const usage = computed(() => store.assignments.filter((a) => a.roomId === props.roomId).length)
const events = computed(() => {
  if (!props.open) return []
  const list = store.eventsForRoom(props.roomId, week.from, week.to)
  if (start.value && end.value && toMin(end.value) > toMin(start.value))
    for (const d of days.value) list.push({ id: 'draft' + d, col: addDays(week.from, d), start: start.value, end: end.value, color: 'draft', kind: 'draft', title: 'New assignment', lines: [course.value.code] })
  return list
})
function save() {
  touched.value = true
  const r = store.saveAssignment(payload.value)
  if (!r.ok) return toast.error(r.errors[0])
  toast.success(`${room.value.name} assigned to ${course.value.code}.`)
  emit('saved'); emit('close')
}
const input = 'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <Modal :open="open" :z="70" size="xl" title="Room Assignment" :subtitle="course ? `${course.code} ${course.title}` : ''" @close="emit('close')">
    <div v-if="room" class="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div class="space-y-5">
        <section class="rounded-xl border border-slate-200 p-4">
          <h3 class="text-sm font-semibold text-slate-900">Room information</h3>
          <dl class="mt-3 space-y-1.5 text-sm">
            <div class="flex justify-between"><dt class="text-slate-500">Room</dt><dd class="font-medium">{{ room.name }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Type</dt><dd class="capitalize">{{ room.type }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Category</dt><dd class="capitalize">{{ room.category }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Class type</dt><dd class="capitalize">{{ classType }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Availability</dt><dd><StatusBadge status="Available" /> <span class="text-xs text-slate-400">{{ usage }} weekly</span></dd></div>
          </dl>
        </section>
        <section>
          <h3 class="text-sm font-semibold text-slate-900">Days</h3>
          <p class="text-xs text-slate-500">Selected days share one room, time range and class type.</p>
          <div class="mt-2 grid grid-cols-3 gap-2">
            <label v-for="(d, i) in DAYS" :key="d" :class="['flex cursor-pointer items-center justify-center rounded-lg border px-2 py-2 text-sm', days.includes(i) ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-800' : 'border-slate-300 hover:bg-slate-50']">
              <input v-model="days" type="checkbox" :value="i" class="sr-only" />{{ d.slice(0, 3) }}</label>
          </div>
        </section>
        <section>
          <h3 class="text-sm font-semibold text-slate-900">Time range</h3>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <label class="text-xs text-slate-500">Start<input v-model="start" type="time" min="06:00" max="22:00" step="900" :class="[input, 'mt-1 w-full']" /></label>
            <label class="text-xs text-slate-500">End<input v-model="end" type="time" min="06:00" max="22:00" step="900" :class="[input, 'mt-1 w-full']" /></label>
          </div>
        </section>
        <ul v-if="errors.length" class="space-y-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <li v-for="e in errors" :key="e">{{ e }}</li>
        </ul>
        <p v-else-if="touched && days.length && start && end" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">No conflicts. This slot is free.</p>
      </div>
      <section class="min-w-0">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 class="text-sm font-semibold text-slate-900">Weekly timetable: {{ room.name }}</h3><span class="text-xs text-slate-500">Week of {{ fmtDate(week.from) }} – {{ fmtDate(week.to) }}</span></div>
        <WeeklyTimetable :days="cols" :events="events" />
        <p class="mt-2 flex flex-wrap gap-x-4 text-xs text-slate-500"><span>■ <span class="text-emerald-600">Discussion</span></span><span>■ <span class="text-sky-600">Laboratory</span></span><span>■ <span class="text-amber-500">Reservation</span></span><span>▢ Your new assignment</span></p>
      </section>
    </div>
    <template #footer>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button>
      <button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="save">Save &amp; Exit</button>
    </template>
  </Modal>
</template>
