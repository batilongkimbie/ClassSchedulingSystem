<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '../ui/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { classSets, courses } from '../../data/mockData'
const props = defineProps({ open: Boolean, classSetId: { type: String, default: '' } })
const emit = defineEmits(['close', 'added'])
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const setId = ref(''), picked = ref([]), err = ref('')
const mySets = computed(() => classSets.filter((s) => s.programId === auth.user.programId && !store.classCourses.some((c) => c.classSetId === s.id)))
const selectedSet = computed(() => classSets.find((s) => s.id === setId.value))
const list = computed(() => courses.filter((c) =>
  (!c.programId || c.programId === selectedSet.value?.programId) &&
  c.year === selectedSet.value?.year
))
const taken = (id) => store.classCourses.some((c) => c.classSetId === setId.value && c.courseId === id)
watch(() => [props.open, props.classSetId], ([open, classSetId]) => {
  if (open) { setId.value = classSetId || ''; picked.value = []; err.value = '' }
})
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
  <Modal :open="open" :title="classSetId ? `Edit Class: ${selectedSet?.name || ''}` : 'Add Class'" :subtitle="classSetId ? 'Add more courses to this class set.' : 'Choose a class set, then pick one or more courses.'" @close="emit('close')">
    <label v-if="classSetId" class="block text-sm font-medium text-slate-700">Class set / section
      <span class="mt-1.5 block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-700">{{ selectedSet?.name }} ({{ selectedSet?.size }} students)</span>
    </label>
    <label v-else-if="mySets.length" class="block text-sm font-medium text-slate-700">Class set / section
      <select v-model="setId" class="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25">
        <option value="" disabled>Select a class set</option>
        <option v-for="s in mySets" :key="s.id" :value="s.id">{{ s.name }} ({{ s.size }} students)</option>
      </select>
    </label>
    <p v-else class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">All class sets already have courses. Use Edit Courses on a class set to add more.</p>
    <div class="mt-5">
      <div class="flex items-center justify-between"><p class="text-sm font-medium text-slate-700">Courses</p><p class="text-sm text-emerald-700">{{ picked.length }} selected</p></div>
      <div v-if="setId && list.length" class="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
        <label
          v-for="c in list"
          :key="c.id"
          :class="[
            'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition',
            taken(c.id)
              ? 'border-slate-200 bg-slate-50 opacity-50'
              : picked.includes(c.id)
                ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40'
          ]"
        >
          <input
            v-model="picked"
            type="checkbox"
            :value="c.id"
            :disabled="taken(c.id)"
            class="mt-0.5 h-4 w-4 rounded-full accent-emerald-700"
          />
          <span class="min-w-0 flex-1">
            <span class="block font-semibold text-slate-900">{{ c.code }}</span>
            <span class="block text-xs text-slate-600">{{ c.title }}</span>
            <span v-if="taken(c.id)" class="mt-1 block text-xs font-medium text-slate-500">Already added</span>
          </span>
        </label>
      </div>
      <p v-else-if="setId" class="mt-2 rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No courses are available for this class set.</p>
      <p v-else class="mt-2 rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Select a class set to view courses.</p>
    </div>
    <p v-if="err" class="mt-3 text-sm text-red-600" role="alert">{{ err }}</p>
    <template #footer>
      <button class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="emit('close')">Cancel</button>
      <button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" :disabled="!classSetId && !mySets.length" @click="submit">Add Courses</button>
    </template>
  </Modal>
</template>
