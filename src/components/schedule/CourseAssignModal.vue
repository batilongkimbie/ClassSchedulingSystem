<script setup>
import { ref, computed } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'
import InstructorSelectModal from './InstructorSelectModal.vue'
import RoomSelectModal from './RoomSelectModal.vue'
import RoomAssignmentModal from './RoomAssignmentModal.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { by } from '../../data/mockData'
import { DAYS, fmtTime } from '../../utils/time'
const props = defineProps({ open: Boolean, ccId: String })
const emit = defineEmits(['close'])
const store = useScheduleStore(), toast = useToast()
const showInst = ref(false), showRooms = ref(false), pick = ref(null), confirm = ref(null) // {kind,id}
const cc = computed(() => store.classCourses.find((c) => c.id === props.ccId))
const course = computed(() => cc.value && by.course(cc.value.courseId))
const set = computed(() => cc.value && by.classSet(cc.value.classSetId))
const inst = computed(() => cc.value?.instructorId && by.faculty(cc.value.instructorId))
const list = computed(() => (cc.value ? store.ccAssignments(cc.value.id) : []))
function doConfirm() {
  if (confirm.value.kind === 'assignment') { store.removeAssignment(confirm.value.id); toast.success('Room assignment removed.') }
  else { store.removeClassCourse(props.ccId); toast.success('Course removed from the class set.'); emit('close') }
  confirm.value = null
}
const btn = 'rounded-lg px-3.5 py-2 text-sm font-semibold'
</script>
<template>
  <Modal :open="open && !!cc" size="lg" title="Course assignment" :subtitle="course ? `${course.code} · ${set.name}` : ''" @close="emit('close')">
    <template v-if="cc">
      <dl class="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <div><dt class="text-xs text-slate-500">Course code</dt><dd class="font-medium">{{ course.code }}</dd></div>
        <div><dt class="text-xs text-slate-500">Status</dt><dd><StatusBadge :status="store.ccStatus(cc)" /></dd></div>
        <div class="sm:col-span-2"><dt class="text-xs text-slate-500">Course description</dt><dd class="font-medium">{{ course.title }} ({{ course.units }} units)</dd></div>
        <div><dt class="text-xs text-slate-500">Class set</dt><dd class="font-medium">{{ set.name }} · {{ set.size }} students</dd></div>
        <div><dt class="text-xs text-slate-500">Assigned instructor</dt>
          <dd><button class="rounded-lg border border-slate-300 px-3 py-1.5 text-left font-medium hover:bg-slate-50" @click="showInst = true">{{ inst ? inst.name : 'Select an instructor…' }}</button></dd></div>
      </dl>

      <div class="mt-6 flex items-center justify-between"><h3 class="text-sm font-semibold">Assigned classrooms</h3>
        <button :class="[btn, 'bg-emerald-700 text-white hover:bg-emerald-800']" @click="showRooms = true">+ Assign Room</button></div>
      <ul v-if="list.length" class="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
        <li v-for="a in list" :key="a.id" class="flex items-center gap-3 px-3 py-2.5 text-sm">
          <span :class="['h-8 w-1 rounded', a.classType === 'laboratory' ? 'bg-sky-500' : 'bg-emerald-500']"></span>
          <div class="min-w-0 flex-1"><p class="font-medium">{{ by.room(a.roomId).name }} <span class="text-xs font-normal capitalize text-slate-500">· {{ a.classType }}</span></p>
            <p class="text-xs text-slate-500">{{ a.days.map((d) => DAYS[d].slice(0, 3)).join(', ') }} · {{ fmtTime(a.start) }} – {{ fmtTime(a.end) }}</p></div>
          <button class="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50" @click="confirm = { kind: 'assignment', id: a.id }">Remove</button>
        </li>
      </ul>
      <p v-else class="mt-2 rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No room assigned yet.</p>
    </template>
    <template #footer>
      <button class="mr-auto rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50" @click="confirm = { kind: 'course' }">Remove course</button>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Done</button>
    </template>
  </Modal>
  <InstructorSelectModal :open="showInst" :cc-id="ccId" @close="showInst = false" />
  <RoomSelectModal :open="showRooms" :cc-id="ccId" @close="showRooms = false" @pick="(p) => (pick = p)" />
  <RoomAssignmentModal :open="!!pick" :cc-id="ccId" :room-id="pick?.roomId" :class-type="pick?.classType" @close="pick = null" @saved="showRooms = false" />
  <ConfirmModal :open="!!confirm" danger confirm-text="Remove" :title="confirm?.kind === 'course' ? 'Remove this course?' : 'Remove this room assignment?'"
                :message="confirm?.kind === 'course' ? 'The course and all of its room assignments will be removed from the class set.' : 'The room will become available again for that time.'"
                @confirm="doConfirm" @cancel="confirm = null" />
</template>
