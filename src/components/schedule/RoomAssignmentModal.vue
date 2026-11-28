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
const props = defineProps({ open: Boolean, ccId: String, roomId: String, classType: String, assignmentId: String })
const emit = defineEmits(['close', 'saved'])
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const week = defaultRange(), cols = dayCols(week.from, week.to)
const days = ref([]), start = ref(''), end = ref(''), touched = ref(false)
const selectedRoomId = ref(''), selectedClassType = ref('discussion')
const editing = computed(() => !!props.assignmentId)
const assignment = computed(() => store.assignments.find((a) => a.id === props.assignmentId))
watch(() => props.open, (v) => {
  if (v) {
    selectedRoomId.value = assignment.value?.roomId || props.roomId || ''
    selectedClassType.value = assignment.value?.classType || props.classType || 'discussion'
    days.value = assignment.value ? [...assignment.value.days] : []
    start.value = assignment.value?.start || ''
    end.value = assignment.value?.end || ''
    nextTick(() => (touched.value = false))
  }
})
watch([days, start, end, selectedRoomId, selectedClassType], () => (touched.value = true), { deep: true })
const cc = computed(() => store.classCourses.find((c) => c.id === props.ccId))
const course = computed(() => cc.value && by.course(cc.value.courseId))
const set = computed(() => cc.value && by.classSet(cc.value.classSetId))
const programId = computed(() => set.value?.programId || auth.user.programId)
const eligibleRooms = computed(() => store.roomsForProgram(programId.value, selectedClassType.value))
const room = computed(() => by.room(selectedRoomId.value))
const roomOptions = computed(() => {
  const eligible = eligibleRooms.value
  return room.value && !eligible.some((r) => r.id === room.value.id) ? [room.value, ...eligible] : eligible
})
const payload = computed(() => ({ ccId: props.ccId, roomId: selectedRoomId.value, classType: selectedClassType.value, days: [...days.value].sort(), start: start.value, end: end.value, programId: programId.value }))
const errors = computed(() => (touched.value && props.open ? store.validateAssignment({ ...payload.value, ignoreId: props.assignmentId }) : []))
const usage = computed(() => store.assignments.filter((a) => a.roomId === selectedRoomId.value).length)
const events = computed(() => {
  if (!props.open || !selectedRoomId.value) return []
  const list = store.eventsForRoom(selectedRoomId.value, week.from, week.to)
    .filter((e) => !props.assignmentId || !e.id.startsWith(`${props.assignmentId}-`))
  if (start.value && end.value && toMin(end.value) > toMin(start.value))
    for (const d of days.value) list.push({ id: 'draft' + d, col: addDays(week.from, d), start: start.value, end: end.value, color: 'draft', kind: 'draft', title: editing.value ? 'Updated assignment' : 'New assignment', lines: [course.value.code] })
  return list
})
const busyEvents = computed(() => {
  if (!props.open || !set.value) return []
  const classSetEvents = store.eventsForClassSet(set.value.id)
    .map((e) => ({ ...e, col: cols[DAYS.indexOf(e.col)]?.key }))
  const instructorEvents = cc.value?.instructorId
    ? store.eventsForInstructor(cc.value.instructorId, week.from, week.to).filter((e) => e.kind === 'class')
    : []
  return [...new Map([...classSetEvents, ...instructorEvents].map((e) => [e.id, e])).values()]
    .filter((e) => e.col && (!props.assignmentId || !e.id.startsWith(`${props.assignmentId}-`)))
})
function save() {
  touched.value = true
  const r = editing.value ? store.updateAssignment(props.assignmentId, payload.value) : store.saveAssignment(payload.value)
  if (!r.ok) return toast.error(r.errors[0])
  toast.success(editing.value ? `${course.value.code} schedule updated.` : `${room.value.name} assigned to ${course.value.code}.`)
  emit('saved'); emit('close')
}
const input = 'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <Modal :open="open" :z="70" size="xl" :title="editing ? 'Edit Schedule' : 'Room Assignment'" :subtitle="course ? `${course.code} ${course.title}` : ''" @close="emit('close')">
    <div v-if="room || editing" class="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div class="space-y-5">
        <section class="rounded-xl border border-slate-200 p-4">
          <h3 class="text-sm font-semibold text-slate-900">Room information</h3>
          <dl class="mt-3 space-y-1.5 text-sm">
            <div v-if="editing" class="flex items-center justify-between gap-2"><dt class="text-slate-500">Room</dt><dd>
              <select v-model="selectedRoomId" :class="input">
                <option value="">Select a room</option>
                <option v-for="r in roomOptions" :key="r.id" :value="r.id">{{ r.name }}{{ eligibleRooms.some((eligible) => eligible.id === r.id) ? '' : ' (not allowed for this class type)' }}</option>
              </select>
            </dd></div>
            <div v-else class="flex justify-between"><dt class="text-slate-500">Room</dt><dd class="font-medium">{{ room.name }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Type</dt><dd class="capitalize">{{ room?.type || '—' }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Category</dt><dd class="capitalize">{{ room?.category || '—' }}</dd></div>
            <div class="flex items-center justify-between gap-2"><dt class="text-slate-500">Class type</dt><dd v-if="editing">
              <select v-model="selectedClassType" :class="input"><option value="discussion">Discussion</option><option value="laboratory">Laboratory</option></select>
            </dd><dd v-else class="capitalize">{{ selectedClassType }}</dd></div>
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
            <label class="text-xs text-slate-500">Start<input v-model="start" type="time" min="06:00" max="22:00" step="60" :class="[input, 'mt-1 w-full']" /></label>
            <label class="text-xs text-slate-500">End<input v-model="end" type="time" min="06:00" max="22:00" step="60" :class="[input, 'mt-1 w-full']" /></label>
          </div>
        </section>
        <ul v-if="errors.length" class="space-y-1.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
          <li v-for="e in errors" :key="e">{{ e }}</li>
        </ul>
        <p v-else-if="touched && days.length && start && end" class="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">No conflicts. This slot is free.</p>
      </div>
      <section class="min-w-0">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2"><h3 class="text-sm font-semibold text-slate-900">Weekly timetable: {{ room?.name || 'Select a room' }}</h3><span class="text-xs text-slate-500">Week of {{ fmtDate(week.from) }} – {{ fmtDate(week.to) }}</span></div>
        <WeeklyTimetable :days="cols" :events="events" :busy-events="busyEvents" />
        <p class="mt-2 flex flex-wrap gap-x-4 text-xs text-slate-500"><span>■ <span class="text-slate-500">Class set or instructor already scheduled</span></span><span>■ <span class="text-emerald-600">Discussion</span></span><span>■ <span class="text-sky-600">Laboratory</span></span><span>■ <span class="text-amber-500">Reservation</span></span><span>▢ Your new assignment</span></p>
      </section>
    </div>
    <template #footer>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button>
      <button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="save">{{ editing ? 'Update Schedule' : 'Save & Exit' }}</button>
    </template>
  </Modal>
</template>
