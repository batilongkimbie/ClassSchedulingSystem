<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import StatusBadge from '../ui/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { by } from '../../data/mockData'
import { DAYS, toMin } from '../../utils/time'
const props = defineProps({ open: Boolean, ccId: String })
const emit = defineEmits(['close', 'pick'])
const auth = useAuthStore(), store = useScheduleStore()
const classType = ref(''), q = ref(''), days = ref([]), start = ref(''), end = ref('')
watch(() => props.open, (v) => { if (v) { classType.value = ''; q.value = ''; days.value = []; start.value = ''; end.value = '' } })
const cc = computed(() => store.classCourses.find((c) => c.id === props.ccId))
const set = computed(() => cc.value && by.classSet(cc.value.classSetId))
const slotOk = computed(() => days.value.length && start.value && end.value && toMin(end.value) > toMin(start.value))
const eligible = computed(() => (classType.value ? store.roomsForProgram(auth.user.programId, classType.value) : []))
const free = computed(() => eligible.value.filter((r) => !slotOk.value || !store.roomConflicts({ roomId: r.id, days: days.value, start: start.value, end: end.value }).length))
const visible = computed(() => free.value.filter((r) => r.name.toLowerCase().includes(q.value.toLowerCase())))
const hidden = computed(() => eligible.value.length - free.value.length)
// Recommendation: free room that fits the class size with the least spare seats; prefer program-exclusive
const recommended = computed(() => [...free.value].filter((r) => r.capacity >= set.value.size).sort((a, b) => a.capacity - b.capacity || (a.category === 'exclusive' ? -1 : 1))[0]?.id)
const booked = (id) => store.assignments.filter((a) => a.roomId === id).length
const input = 'rounded-lg border border-slate-300 px-2.5 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <Modal :open="open" :z="60" size="lg" title="Assign Room" :subtitle="set ? `${by.course(cc.courseId).code} for ${set.name} (${set.size} students)` : ''" @close="emit('close')">
    <p class="text-sm font-medium text-slate-700">1. Class type</p>
    <div class="mt-2 grid gap-2 sm:grid-cols-2">
      <label v-for="t in ['discussion', 'laboratory']" :key="t" :class="['flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm', classType === t ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 hover:bg-slate-50']">
        <input v-model="classType" type="radio" :value="t" class="mt-0.5 accent-emerald-700" />
        <span><span class="block font-medium capitalize">{{ t }}</span><span class="text-xs text-slate-500">{{ t === 'discussion' ? 'Your program’s classrooms and public classrooms' : 'Your program’s laboratories only' }}</span></span>
      </label>
    </div>

    <template v-if="classType">
      <p class="mt-5 text-sm font-medium text-slate-700">2. Narrow by preferred schedule <span class="font-normal text-slate-500">(optional)</span></p>
      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <label v-for="(d, i) in DAYS" :key="d" class="flex items-center gap-1.5 text-sm"><input v-model="days" type="checkbox" :value="i" class="accent-emerald-700" />{{ d.slice(0, 3) }}</label>
        <input v-model="start" type="time" :class="input" aria-label="Preferred start" /><span class="text-slate-400">to</span><input v-model="end" type="time" :class="input" aria-label="Preferred end" />
      </div>
      <p v-if="hidden" class="mt-2 text-xs text-slate-500">{{ hidden }} room{{ hidden === 1 ? '' : 's' }} hidden because {{ hidden === 1 ? 'it is' : 'they are' }} occupied at that time.</p>

      <p class="mt-5 text-sm font-medium text-slate-700">3. Choose a room</p>
      <input v-model="q" type="search" placeholder="Search room" :class="[input, 'mt-2 w-full']" />
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <button v-for="r in visible" :key="r.id" type="button" @click="emit('pick', { roomId: r.id, classType })"
                :class="['rounded-xl border p-4 text-left transition hover:shadow-md', r.id === recommended ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300' : 'border-slate-200 bg-white hover:border-emerald-500']">
          <div class="flex items-start justify-between gap-2"><p class="font-semibold text-slate-900">{{ r.name }}</p><StatusBadge v-if="r.id === recommended" status="Recommended" /></div>
          <p class="mt-1 text-xs capitalize text-slate-500">{{ r.type }} · {{ r.category }}{{ r.category === 'exclusive' ? ' to your program' : '' }}</p>
          <div class="mt-3 flex flex-wrap items-center gap-2"><StatusBadge status="Available" />
            <span class="text-xs text-slate-600">Capacity {{ r.capacity }}</span><span class="text-xs text-slate-400">{{ booked(r.id) }} weekly class{{ booked(r.id) === 1 ? '' : 'es' }}</span></div>
          <p v-if="r.capacity < set.size" class="mt-2 text-xs text-amber-700">Seats fewer than the {{ set.size }} students in this class set.</p>
        </button>
      </div>
      <p v-if="!visible.length" class="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No available rooms match. Try a different time or clear the search.</p>
    </template>
    <p v-else class="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Choose a class type to see the rooms you can use.</p>
    <template #footer><button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button></template>
  </Modal>
</template>
