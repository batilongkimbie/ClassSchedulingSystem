<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'
import { sendReservationApprovedEmail, sendCancellationRequestEmail, sendCancellationApprovedEmail } from '../../services/mailer'
import { by } from '../../data/mockData'
import { fmtDate, fmtTime, todayISO } from '../../utils/time'
const props = defineProps({ open: Boolean, resId: String, mode: { type: String, default: 'dean' } })
const emit = defineEmits(['close'])
const store = useScheduleStore(), auth = useAuthStore(), toast = useToast()
const rejecting = ref(false), reason = ref(''), err = ref(''), busy = ref(false)
const flow = ref(null) // 'request-cancel' (instructor)
const confirm = ref(null) // 'approve' | 'cancel-pending' | 'approve-cancel'
watch(() => props.open, (v) => { if (v) { rejecting.value = false; flow.value = null; reason.value = ''; err.value = ''; busy.value = false } })
const r = computed(() => store.reservations.find((x) => x.id === props.resId))
const inst = computed(() => r.value && by.faculty(r.value.instructorId))
const dean = computed(() => r.value && by.faculty(r.value.deanId))
const room = computed(() => r.value && by.room(r.value.roomId))
const cr = computed(() => r.value?.cancelRequest)
const cancelPending = computed(() => cr.value?.status === 'Pending')
const isPast = computed(() => r.value && r.value.date < todayISO())
const conflicts = computed(() => (r.value && r.value.status === 'Pending' ? store.reservationConflicts({ roomId: r.value.roomId, date: r.value.date, start: r.value.start, end: r.value.end, ignoreId: r.value.id }) : []))
const approvedMail = computed(() => r.value && [...store.emails].reverse().find((e) => e.resId === r.value.id && e.kind === 'approved'))
const mailBase = () => ({ instructor: inst.value.name, room: room.value.name, date: r.value.date, start: r.value.start, end: r.value.end })

async function approve() {
  confirm.value = null; busy.value = true
  const res = store.approveReservation(r.value.id)
  if (!res.ok) { busy.value = false; return toast.error(res.message) }
  toast.success('Reservation approved. Room schedule updated.')
  const mail = await sendReservationApprovedEmail({ to: inst.value.email, purpose: r.value.purpose, ...mailBase() })
  store.logEmail(r.value, mail, 'approved'); busy.value = false
  toast.info(`Confirmation email sent to ${inst.value.email}.`)
}
function reject() {
  const res = store.rejectReservation(r.value.id, reason.value)
  if (!res.ok) return (err.value = res.message)
  toast.warning('Reservation rejected. The instructor has been notified.'); rejecting.value = false
}
function cancelPendingNow() {
  confirm.value = null
  const res = store.cancelReservation(r.value.id, auth.user.id)
  if (!res.ok) return toast.error(res.message)
  toast.success('Your request was cancelled.'); emit('close')
}
async function sendCancelRequest() {
  const res = store.requestCancellation(r.value.id, auth.user.id, reason.value)
  if (!res.ok) return (err.value = res.message)
  flow.value = null; busy.value = true
  toast.success(`Cancellation request sent to Dean ${dean.value.name}.`)
  const mail = await sendCancellationRequestEmail({ to: dean.value.email, dean: dean.value.name, reason: r.value.cancelRequest.reason, ...mailBase() })
  store.logEmail(r.value, mail, 'cancel-request'); busy.value = false
}
async function approveCancel() {
  confirm.value = null; busy.value = true
  const res = store.approveCancellation(r.value.id)
  if (!res.ok) { busy.value = false; return toast.error(res.message) }
  toast.success('Cancellation approved. The room is free again.')
  const mail = await sendCancellationApprovedEmail({ to: inst.value.email, ...mailBase() })
  store.logEmail(r.value, mail, 'cancel-approved'); busy.value = false
  toast.info(`${inst.value.name} was notified by email.`)
}
const row = 'flex justify-between gap-4 py-2 text-sm'
const area = 'mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
const ghost = 'rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
const solid = 'rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50'
</script>
<template>
  <Modal :open="open && !!r" size="md" title="Reservation details" :subtitle="r ? `Submitted ${fmtDate(r.submittedAt.slice(0, 10), true)}` : ''" @close="emit('close')">
    <template v-if="r">
      <div class="mb-3 flex flex-wrap items-center gap-2"><StatusBadge :status="r.status" /><StatusBadge v-if="cancelPending" status="Cancellation requested" /><span v-if="r.decidedAt" class="text-xs text-slate-500">decided {{ fmtDate(r.decidedAt.slice(0, 10)) }}</span></div>
      <dl class="divide-y divide-slate-100">
        <div :class="row"><dt class="text-slate-500">Instructor</dt><dd class="text-right font-medium">{{ inst.name }}<span class="block text-xs font-normal text-slate-500">{{ inst.email }}</span></dd></div>
        <div :class="row"><dt class="text-slate-500">Sent to (Dean)</dt><dd class="font-medium">{{ dean?.name || '—' }}</dd></div>
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
        <p class="font-medium">Approved. {{ room.name }} is reserved at this time.</p>
        <p class="mt-1 text-xs">{{ approvedMail ? `Confirmation email sent to ${approvedMail.to} on ${fmtDate(approvedMail.sentAt.slice(0, 10))}.` : 'Confirmation email is being sent.' }}</p>
      </div>
      <p v-if="r.status === 'Cancelled'" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{{ cr?.status === 'Approved' ? 'The Dean approved the cancellation. The room is free again.' : 'This request was cancelled before a decision was made.' }}</p>

      <div v-if="cr && r.status === 'Approved'" class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <p class="font-medium">{{ cr.status === 'Pending' ? (mode === 'dean' ? 'Cancellation requested by the instructor' : 'Cancellation requested. Waiting for the Dean.') : 'Cancellation declined' }}</p>
        <p class="mt-1 text-xs"><span class="font-medium">Reason:</span> {{ cr.reason }}</p>
        <p v-if="cr.declineReason" class="mt-1 text-xs"><span class="font-medium">Dean's answer:</span> {{ cr.declineReason }}</p>
      </div>

      <div v-if="rejecting || flow" class="mt-4">
        <label class="text-sm font-medium text-slate-700">{{ rejecting ? 'Rejection reason' : 'Why do you need to cancel?' }}
          <textarea v-model="reason" rows="3" :class="area" :placeholder="rejecting ? 'Explain your decision' : 'The Dean will see this reason'"></textarea></label>
        <p v-if="err" class="mt-1 text-sm text-red-600" role="alert">{{ err }}</p>
      </div>
      <p v-if="mode === 'instructor' && r.status === 'Approved' && isPast" class="mt-3 text-xs text-slate-500">This reservation date has passed, so it can no longer be cancelled.</p>
    </template>

    <template #footer>
      <template v-if="r && mode === 'dean' && r.status === 'Pending'">
        <template v-if="rejecting"><button :class="ghost" @click="rejecting = false; err = ''">Back</button><button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" @click="reject">Confirm rejection</button></template>
        <template v-else><button class="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="rejecting = true; reason = ''; err = ''">Reject</button>
          <button :disabled="busy || conflicts.length > 0" :class="solid" @click="confirm = 'approve'">{{ busy ? 'Sending email…' : 'Approve' }}</button></template>
      </template>
      <template v-else-if="r && mode === 'dean' && r.status === 'Approved' && cancelPending">
        <button :class="ghost" @click="emit('close')">Close</button>
        <button :disabled="busy" :class="solid" @click="confirm = 'approve-cancel'">{{ busy ? 'Sending email…' : 'Approve cancellation' }}</button>
      </template>
      <template v-else-if="r && mode === 'instructor' && r.status === 'Pending'"><button :class="ghost" @click="emit('close')">Close</button><button class="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="confirm = 'cancel-pending'">Cancel request</button></template>
      <template v-else-if="r && mode === 'instructor' && r.status === 'Approved' && !isPast && !cancelPending">
        <template v-if="flow === 'request-cancel'"><button :class="ghost" @click="flow = null; err = ''">Back</button><button :disabled="busy" :class="solid" @click="sendCancelRequest">Send cancellation request</button></template>
        <template v-else><button :class="ghost" @click="emit('close')">Close</button><button class="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="flow = 'request-cancel'; reason = ''; err = ''">Request cancellation</button></template>
      </template>
      <button v-else :class="solid" @click="emit('close')">Close</button>
    </template>
  </Modal>
  <ConfirmModal :open="confirm === 'approve'" title="Approve this reservation?" :message="inst ? `${room?.name} will be blocked at that time and a confirmation email will be sent to ${inst.name}.` : ''" confirm-text="Approve" @confirm="approve" @cancel="confirm = null" />
  <ConfirmModal :open="confirm === 'cancel-pending'" danger title="Cancel this request?" message="The Dean will no longer see it as pending. You can submit a new request any time." confirm-text="Cancel request" @confirm="cancelPendingNow" @cancel="confirm = null" />
  <ConfirmModal :open="confirm === 'approve-cancel'" title="Approve the cancellation?" :message="inst ? `${room?.name} becomes available again and ${inst.name} will be notified.` : ''" confirm-text="Approve cancellation" @confirm="approveCancel" @cancel="confirm = null" />
</template>
