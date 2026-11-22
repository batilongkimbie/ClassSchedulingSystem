<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { by } from '../../data/mockData'
const props = defineProps({ open: Boolean, ccId: String })
const emit = defineEmits(['close'])
const store = useScheduleStore(), toast = useToast(), q = ref('')
watch(() => props.open, (v) => v && (q.value = ''))
const cc = computed(() => store.classCourses.find((c) => c.id === props.ccId))
const course = computed(() => cc.value && by.course(cc.value.courseId))
const all = computed(() => (course.value ? store.qualifiedInstructors(course.value.id) : []))
const list = computed(() => all.value.filter((f) => f.name.toLowerCase().includes(q.value.toLowerCase())))
const load = (id) => store.classCourses.filter((c) => c.instructorId === id).length
function pick(f) {
  const r = store.assignInstructor(props.ccId, f.id)
  if (!r.ok) return toast.error(r.message)
  toast.success(`${f.name} assigned to ${course.value.code}.`); emit('close')
}
</script>
<template>
  <Modal :open="open" :z="60" :title="'Assign Instructor'" :subtitle="course ? `Qualified instructors for ${course.code} ${course.title}` : ''" @close="emit('close')">
    <template v-if="all.length">
      <input v-model="q" type="search" placeholder="Search instructor" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25" />
      <ul class="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
        <li v-for="f in list" :key="f.id" class="flex items-center gap-3 px-3 py-3">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-xs font-semibold text-white">{{ f.name.split(' ').map((w) => w[0]).slice(0, 2).join('') }}</span>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-slate-900">{{ f.name }}</p><p class="text-xs text-slate-500">{{ load(f.id) }} class{{ load(f.id) === 1 ? '' : 'es' }} this term</p></div>
          <span v-if="cc.instructorId === f.id" class="text-xs font-medium text-emerald-700">Current</span>
          <button v-else class="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800" @click="pick(f)">Select</button>
        </li>
        <li v-if="!list.length" class="px-3 py-6 text-center text-sm text-slate-500">No instructor matches your search.</li>
      </ul>
    </template>
    <p v-else class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">No qualified instructor is available for this course. Ask the dean to update the instructor's qualified courses.</p>
  </Modal>
</template>
