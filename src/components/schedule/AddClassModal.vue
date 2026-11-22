<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { classSets, courses } from '../../data/mockData'
const props = defineProps({ open: Boolean })
const emit = defineEmits(['close', 'added'])
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const setId = ref(''), q = ref(''), picked = ref([]), err = ref('')
const mySets = computed(() => classSets.filter((s) => s.programId === auth.user.programId))
const list = computed(() => courses.filter((c) => c.programId === auth.user.programId && (c.code + ' ' + c.title).toLowerCase().includes(q.value.toLowerCase())))
const taken = (id) => store.classCourses.some((c) => c.classSetId === setId.value && c.courseId === id)
watch(() => props.open, (v) => { if (v) { setId.value = ''; q.value = ''; picked.value = []; err.value = '' } })
watch(setId, () => (picked.value = []))
function submit() {
  err.value = ''
  if (!setId.value) return (err.value = 'Select a class set.')
  if (!picked.value.length) return (err.value = 'Select at least one course.')
  const n = store.addCourses(setId.value, picked.value)
  toast.success(`${n} course${n === 1 ? '' : 's'} added to the class set.`)
  emit('added', setId.value); emit('close')
}
</script>
<template>
  <Modal :open="open" title="Add Class" subtitle="Choose a class set, then pick one or more courses." @close="emit('close')">
    <label class="block text-sm font-medium text-slate-700">Class set / section
      <select v-model="setId" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25">
        <option value="" disabled>Select a class set</option>
        <option v-for="s in mySets" :key="s.id" :value="s.id">{{ s.name }} ({{ s.size }} students)</option>
      </select>
    </label>
    <div class="mt-5">
      <div class="flex items-center justify-between"><p class="text-sm font-medium text-slate-700">Courses</p><p class="text-sm text-emerald-700">{{ picked.length }} selected</p></div>
      <input v-model="q" type="search" placeholder="Search by code or description" class="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25" />
      <ul class="mt-3 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
        <li v-for="c in list" :key="c.id">
          <label :class="['flex items-center gap-3 px-3 py-2.5 text-sm', !setId || taken(c.id) ? 'opacity-50' : 'cursor-pointer hover:bg-slate-50']">
            <input v-model="picked" type="checkbox" :value="c.id" :disabled="!setId || taken(c.id)" class="h-4 w-4 accent-emerald-700" />
            <span class="font-medium text-slate-900">{{ c.code }}</span><span class="flex-1 text-slate-600">{{ c.title }}</span>
            <span v-if="taken(c.id)" class="text-xs text-slate-500">Already added</span>
          </label>
        </li>
        <li v-if="!list.length" class="px-3 py-6 text-center text-sm text-slate-500">No courses match your search.</li>
      </ul>
    </div>
    <p v-if="err" class="mt-3 text-sm text-red-600" role="alert">{{ err }}</p>
    <template #footer>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button>
      <button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800" @click="submit">Add Courses</button>
    </template>
  </Modal>
</template>
