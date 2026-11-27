<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { rooms, by } from '../../data/mockData'
import { todayISO, dayOffset, toMin, fmtTime } from '../../utils/time'
const props = defineProps({ open: Boolean, roomId: String })
const emit = defineEmits(['close', 'submitted'])
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const q = ref(''), room = ref(''), date = ref(''), start = ref(''), end = ref(''), purpose = ref(''), touched = ref(false)
watch(() => props.open, (v) => { if (v) { q.value = ''; room.value = props.roomId || ''; date.value = dayOffset(1); start.value = ''; end.value = ''; purpose.value = ''; nextTick(() => (touched.value = false)) } })
const dean = computed(() => store.deanFor(auth.user.id)) // fixed, instructors never choose
const list = computed(() => rooms.filter((r) => r.name.toLowerCase().includes(q.value.toLowerCase())))
const payload = computed(() => ({ instructorId: auth.user.id, roomId: room.value, date: date.value, start: start.value, end: end.value, purpose: purpose.value }))
const errors = computed(() => (touched.value ? store.validateReservation(payload.value) : []))
const dayEvents = computed(() => (room.value && date.value ? store.eventsForRoom(room.value, date.value, date.value).sort((a, b) => a.start.localeCompare(b.start)) : []))
const slotKnown = computed(() => room.value && date.value && start.value && end.value && toMin(end.value) > toMin(start.value))
const slotFree = computed(() => slotKnown.value && !store.reservationConflicts({ roomId: room.value, date: date.value, start: start.value, end: end.value }).length)
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
  <Modal :open="open" size="lg" title="Reserve classroom" subtitle="Your request goes to the Dean. Only approved reservations block a room." @close="emit('close')">
    <div class="grid gap-5 md:grid-cols-2">
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
      <p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 md:col-span-2">This request will be sent to <span class="font-semibold">{{ dean ? `Dean ${dean.name}` : '(no dean assigned)' }}</span> for approval.</p>
      <section class="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="text-sm font-semibold">Room availability</h3>
        <p v-if="!room || !date" class="mt-2 text-sm text-slate-500">Choose a room and date to see what is already booked.</p>
        <template v-else>
          <p class="mt-1 text-xs text-slate-500">{{ by.room(room).name }} on {{ date }}</p>
          <ul v-if="dayEvents.length" class="mt-2 space-y-1.5"><li v-for="e in dayEvents" :key="e.id" class="rounded-lg bg-white px-3 py-2 text-xs ring-1 ring-slate-200"><span class="font-medium">{{ fmtTime(e.start) }} – {{ fmtTime(e.end) }}</span> · {{ e.kind === 'reservation' ? 'Reserved' : e.title }} <span class="text-slate-500">{{ e.lines[0] }}</span></li></ul>
          <p v-else class="mt-2 text-sm text-slate-600">Nothing booked that day.</p>
          <div v-if="slotKnown" class="mt-3 flex items-center gap-2 text-sm"><span>Your time:</span><StatusBadge :status="slotFree ? 'Available' : 'Rejected'" /><span v-if="!slotFree" class="text-xs text-red-700">Not available</span></div>
        </template>
      </section>
    </div>
    <ul v-if="errors.length" class="mt-4 space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert"><li v-for="e in errors" :key="e">{{ e }}</li></ul>
    <template #footer>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button>
      <button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submit">Submit request</button>
    </template>
  </Modal>
</template>
