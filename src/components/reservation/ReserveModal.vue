<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import WeeklyTimetable from '../timetable/WeeklyTimetable.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { by } from '../../data/mockData'
import { todayISO, dayOffset, toMin, fmtDate, parseISO } from '../../utils/time'
const props = defineProps({ open: Boolean, roomId: String })
const emit = defineEmits(['close', 'submitted'])
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const q = ref(''), room = ref(''), date = ref(''), start = ref(''), end = ref(''), purpose = ref(''), touched = ref(false)
watch(() => props.open, (v) => { if (v) { q.value = ''; room.value = props.roomId || ''; date.value = dayOffset(1); start.value = ''; end.value = ''; purpose.value = ''; nextTick(() => (touched.value = false)) } })
const dean = computed(() => store.deanFor(auth.user.id)) // fixed, instructors never choose
const list = computed(() => store.roomsForProgram(auth.user.programId, 'discussion').filter((r) => r.name.toLowerCase().includes(q.value.toLowerCase())))
const payload = computed(() => ({ instructorId: auth.user.id, roomId: room.value, date: date.value, start: start.value, end: end.value, purpose: purpose.value }))
const errors = computed(() => (touched.value ? store.validateReservation(payload.value) : []))
const timetableDays = computed(() => date.value ? [{
  key: date.value,
  label: parseISO(date.value).toLocaleDateString('en-US', { weekday: 'long' }),
  sub: fmtDate(date.value),
}] : [])
const roomEvents = computed(() => room.value && date.value
  ? store.eventsForRoom(room.value, date.value, date.value).map((e) => e.kind === 'class' ? { ...e, color: 'emerald' } : e)
  : [])
const instructorEvents = computed(() => {
  if (!date.value) return []
  const roomEventIds = new Set(roomEvents.value.map((e) => e.id))
  return store.eventsForInstructor(auth.user.id, date.value, date.value).filter((e) => !roomEventIds.has(e.id))
})
const slotKnown = computed(() => room.value && date.value && start.value && end.value && toMin(end.value) > toMin(start.value))
const selectedSlot = computed(() => slotKnown.value ? [{
  id: 'selected-slot', col: date.value, start: start.value, end: end.value,
  color: 'selection', kind: 'selection', title: 'Selected time', lines: [],
}] : [])
const timetableEvents = computed(() => [...roomEvents.value, ...selectedSlot.value])
const slotConflicts = computed(() => slotKnown.value ? [
  ...store.reservationConflicts({ roomId: room.value, date: date.value, start: start.value, end: end.value }),
  ...store.reservationInstructorConflicts({ instructorId: auth.user.id, date: date.value, start: start.value, end: end.value }),
] : [])
const slotFree = computed(() => slotKnown.value && !slotConflicts.value.length)
function submit() {
  touched.value = true
  const res = store.submitReservation(payload.value)
  if (!res.ok) return toast.error(res.errors[0])
  toast.success('Request submitted. It was forwarded to the Dean for approval.')
  emit('submitted', res.reservation); emit('close')
}
const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <Modal :open="open" size="xl" title="Reserve classroom" subtitle="Your request goes to the Dean. Only approved reservations block a room." @close="emit('close')">
    <div class="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div class="space-y-4">
        <div><label class="text-sm font-medium text-slate-700">Classroom</label>
          <input v-model="q" type="search" placeholder="Search room" :class="[input, 'mt-1.5']" />
          <select v-model="room" :class="[input, 'mt-2']" aria-label="Classroom"><option value="" disabled>Select a classroom</option><option v-for="r in list" :key="r.id" :value="r.id">{{ r.name }} · {{ r.type }} · {{ r.capacity }} seats</option></select></div>
        <label class="block text-sm font-medium text-slate-700">Reservation date<input v-model="date" type="date" :min="todayISO()" :class="[input, 'mt-1.5']" /></label>
        <div class="grid grid-cols-2 gap-3">
          <label class="block text-sm font-medium text-slate-700">Start time<input v-model="start" type="time" min="06:00" max="22:00" step="60" :class="[input, 'mt-1.5']" /></label>
          <label class="block text-sm font-medium text-slate-700">End time<input v-model="end" type="time" min="06:00" max="22:00" step="60" :class="[input, 'mt-1.5']" /></label>
        </div>
        <label class="block text-sm font-medium text-slate-700">Purpose of reservation<textarea v-model="purpose" rows="3" :class="[input, 'mt-1.5']" placeholder="e.g. Make-up class for IT 212"></textarea></label>
      </div>
      <section class="min-w-0">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold">Availability for selected day</h3>
          <span v-if="room && date" class="text-xs text-slate-500">{{ by.room(room).name }} · {{ fmtDate(date, true) }}</span>
        </div>
        <p v-if="!date" class="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Choose a date to view the timetable.</p>
        <template v-else>
          <WeeklyTimetable :days="timetableDays" :events="timetableEvents" :busy-events="instructorEvents" />
          <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>■ <span class="text-slate-500">Your schedule (any room)</span></span>
            <span>■ <span class="text-emerald-600">Class in selected room</span></span>
            <span>■ <span class="text-amber-600">Reserved in selected room</span></span>
            <span>▢ Selected time</span>
          </p>
          <div v-if="slotKnown" class="mt-3 flex items-center gap-2 text-sm"><span>Your time:</span><StatusBadge :status="slotFree ? 'Available' : 'Rejected'" /><span v-if="!slotFree" class="text-xs text-red-700">Overlaps your schedule or a room booking.</span></div>
        </template>
      </section>
      <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 lg:col-span-2">This request will be sent to <span class="font-semibold">{{ dean ? `Dean ${dean.name}` : '(no dean assigned)' }}</span> for approval.</p>
    </div>
    <ul v-if="errors.length" class="mt-4 space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert"><li v-for="e in errors" :key="e">{{ e }}</li></ul>
    <template #footer>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button>
      <button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submit">Submit request</button>
    </template>
  </Modal>
</template>
