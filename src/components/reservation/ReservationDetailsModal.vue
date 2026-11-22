<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { sendReservationApprovedEmail } from '../../services/mailer'
import { by } from '../../data/mockData'
import { fmtDate, fmtTime } from '../../utils/time'
const props = defineProps({ open: Boolean, resId: String, mode: { type: String, default: 'dean' } })
const emit = defineEmits(['close'])
const store = useScheduleStore(), toast = useToast()
const rejecting = ref(false), reason = ref(''), reasonErr = ref(''), confirmApprove = ref(false), busy = ref(false)
watch(() => props.open, (v) => { if (v) { rejecting.value = false; reason.value = ''; reasonErr.value = ''; busy.value = false } })
const r = computed(() => store.reservations.find((x) => x.id === props.resId))
const inst = computed(() => r.value && by.faculty(r.value.instructorId))
const room = computed(() => r.value && by.room(r.value.roomId))
const conflicts = computed(() => (r.value && r.value.status === 'Pending' ? store.reservationConflicts({ roomId: r.value.roomId, date: r.value.date, start: r.value.start, end: r.value.end, ignoreId: r.value.id }) : []))
const email = computed(() => r.value && [...store.emails].reverse().find((e) => e.resId === r.value.id))
async function approve() {
  confirmApprove.value = false; busy.value = true
  const res = store.approveReservation(r.value.id)
  if (!res.ok) { busy.value = false; return toast.error(res.message) }
  toast.success('Reservation approved. Room schedule updated.')
  const mail = await sendReservationApprovedEmail({ to: inst.value.email, instructor: inst.value.name, room: room.value.name, date: r.value.date, start: r.value.start, end: r.value.end, purpose: r.value.purpose })
  store.logEmail(r.value, mail); busy.value = false
  toast.info(`Confirmation email sent to ${inst.value.email}.`)
}
function reject() {
  const res = store.rejectReservation(r.value.id, reason.value)
  if (!res.ok) return (reasonErr.value = res.message)
  toast.warning('Reservation rejected. The instructor has been notified.'); rejecting.value = false
}
const row = 'flex justify-between gap-4 py-2 text-sm'
</script>
<template>
  <Modal :open="open && !!r" size="md" title="Reservation details" :subtitle="r ? `Submitted ${fmtDate(r.submittedAt.slice(0, 10), true)}` : ''" @close="emit('close')">
    <template v-if="r">
      <div class="mb-3 flex items-center gap-2"><StatusBadge :status="r.status" /><span v-if="r.decidedAt" class="text-xs text-slate-500">decided {{ fmtDate(r.decidedAt.slice(0, 10)) }}</span></div>
      <dl class="divide-y divide-slate-100">
        <div :class="row"><dt class="text-slate-500">Instructor</dt><dd class="text-right font-medium">{{ inst.name }}<span class="block text-xs font-normal text-slate-500">{{ inst.email }}</span></dd></div>
        <div :class="row"><dt class="text-slate-500">Requested classroom</dt><dd class="text-right font-medium">{{ room.name }}<span class="block text-xs font-normal capitalize text-slate-500">{{ room.type }} · {{ room.category }} · capacity {{ room.capacity }}</span></dd></div>
        <div :class="row"><dt class="text-slate-500">Reservation date</dt><dd class="font-medium">{{ fmtDate(r.date, true) }}</dd></div>
        <div :class="row"><dt class="text-slate-500">Time</dt><dd class="font-medium">{{ fmtTime(r.start) }} – {{ fmtTime(r.end) }}</dd></div>
        <div :class="row"><dt class="text-slate-500">Purpose</dt><dd class="max-w-xs text-right">{{ r.purpose }}</dd></div>
      </dl>

      <section v-if="r.status === 'Pending'" class="mt-4">
        <h3 class="text-sm font-semibold">Current room availability</h3>
        <p v-if="!conflicts.length" class="mt-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{{ room.name }} is free at the requested time.</p>
        <ul v-else class="mt-1.5 space-y-1 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><li v-for="c in conflicts" :key="c">{{ c }}</li></ul>
      </section>
      <p v-if="r.status === 'Rejected'" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><span class="font-medium">Reason:</span> {{ r.reason || 'No reason given.' }}</p>
      <div v-if="r.status === 'Approved'" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
        <p class="font-medium">Approved. {{ room.name }} is reserved for you at this time.</p>
        <p class="mt-1 text-xs">{{ email ? `Confirmation email sent to ${email.to} on ${fmtDate(email.sentAt.slice(0, 10))}.` : 'Confirmation email is being sent.' }}</p>
      </div>

      <div v-if="mode === 'dean' && r.status === 'Pending' && rejecting" class="mt-4">
        <label class="text-sm font-medium text-slate-700">Rejection reason
          <textarea v-model="reason" rows="3" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25" placeholder="Explain why this request cannot be approved"></textarea></label>
        <p v-if="reasonErr" class="mt-1 text-sm text-red-600" role="alert">{{ reasonErr }}</p>
      </div>
    </template>
    <template #footer>
      <template v-if="r && mode === 'dean' && r.status === 'Pending'">
        <template v-if="rejecting"><button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium" @click="rejecting = false">Back</button><button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="reject">Confirm rejection</button></template>
        <template v-else><button class="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="rejecting = true">Reject</button>
          <button :disabled="busy || conflicts.length > 0" class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50" @click="confirmApprove = true">{{ busy ? 'Sending email…' : 'Approve' }}</button></template>
      </template>
      <button v-else class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="emit('close')">Close</button>
    </template>
  </Modal>
  <ConfirmModal :open="confirmApprove" title="Approve this reservation?" :message="inst ? `${room?.name} will be blocked at that time and a confirmation email will be sent to ${inst.name}.` : ''" confirm-text="Approve" @confirm="approve" @cancel="confirmApprove = false" />
</template>
