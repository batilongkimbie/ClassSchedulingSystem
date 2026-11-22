<script setup>
import { ref, computed } from 'vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { useToast } from '../../composables/useToast'
import { courses, qualifications, by } from '../../data/mockData'
const auth = useAuthStore(), store = useScheduleStore(), toast = useToast()
const q = ref(''), draft = ref([...store.selectedCourses(auth.user.id)]), err = ref('')
// Only courses this instructor is authorized to teach
const authorized = computed(() => courses.filter((c) => (qualifications[c.id] || []).includes(auth.user.id)))
const list = computed(() => authorized.value.filter((c) => `${c.code} ${c.title}`.toLowerCase().includes(q.value.toLowerCase())))
const saved = computed(() => store.selectedCourses(auth.user.id).map(by.course))
const dirty = computed(() => [...draft.value].sort().join() !== [...store.selectedCourses(auth.user.id)].sort().join())
const classes = (courseId) => store.classCourses.filter((c) => c.courseId === courseId && c.instructorId === auth.user.id).map((c) => by.classSet(c.classSetId).name)
function toggle(id) { draft.value = draft.value.includes(id) ? draft.value.filter((x) => x !== id) : [...draft.value, id]; err.value = '' }
function save() {
  if (!draft.value.length) return (err.value = 'Select at least one course.')
  const n = store.saveCourseSelection(auth.user.id, draft.value); draft.value = [...store.selectedCourses(auth.user.id)]
  toast.success(`${n} course${n === 1 ? '' : 's'} saved to your semester load.`)
}
</script>
<template>
  <div>
    <h1 class="text-2xl font-semibold">My Courses</h1>
    <p class="mt-1 text-sm text-slate-600">Choose the courses you will teach this semester. You can only pick courses you are authorized to handle.</p>
    <div class="mt-6 grid gap-6 lg:grid-cols-5">
      <section class="rounded-xl border border-slate-200 bg-white lg:col-span-3">
        <div class="border-b border-slate-100 p-4"><input v-model="q" type="search" placeholder="Search course" class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25" /></div>
        <ul v-if="list.length" class="divide-y divide-slate-100"><li v-for="c in list" :key="c.id"><label class="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
          <input type="checkbox" :checked="draft.includes(c.id)" class="h-4 w-4 accent-emerald-700" @change="toggle(c.id)" /><span class="font-medium">{{ c.code }}</span><span class="flex-1 text-slate-600">{{ c.title }}</span><span class="text-xs text-slate-400">{{ c.units }} units</span></label></li></ul>
        <p v-else class="px-4 py-10 text-center text-sm text-slate-500">{{ authorized.length ? 'No courses match your search.' : 'No courses are assigned to you yet.' }}</p>
      </section>
      <section class="rounded-xl border border-slate-200 bg-white lg:col-span-2">
        <h2 class="border-b border-slate-100 px-4 py-3.5 font-semibold">Selected courses ({{ draft.length }})</h2>
        <ul v-if="draft.length" class="divide-y divide-slate-100"><li v-for="id in draft" :key="id" class="flex items-center gap-2 px-4 py-2.5 text-sm"><span class="font-medium">{{ by.course(id).code }}</span><span class="flex-1 truncate text-slate-600">{{ by.course(id).title }}</span><button class="text-xs text-red-600 hover:underline" @click="toggle(id)">Remove</button></li></ul>
        <p v-else class="px-4 py-8 text-center text-sm text-slate-500">Nothing selected yet.</p>
        <div class="border-t border-slate-100 p-4"><p v-if="err" class="mb-2 text-sm text-red-600" role="alert">{{ err }}</p>
          <button :disabled="!dirty" class="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50" @click="save">Save Selection</button></div>
      </section>
    </div>
    <h2 class="mt-8 text-lg font-semibold">Saved courses</h2>
    <div class="mt-3" v-if="saved.length"><div class="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table class="min-w-full text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th v-for="h in ['Code', 'Description', 'Units', 'Class sets assigned by chairperson']" :key="h" class="px-4 py-2.5 font-medium">{{ h }}</th></tr></thead>
      <tbody class="divide-y divide-slate-100"><tr v-for="c in saved" :key="c.id"><td class="px-4 py-2.5 font-medium">{{ c.code }}</td><td class="px-4 py-2.5">{{ c.title }}</td><td class="px-4 py-2.5">{{ c.units }}</td><td class="px-4 py-2.5">{{ classes(c.id).join(', ') || 'Not yet assigned' }}</td></tr></tbody></table></div></div>
    <div v-else class="mt-3"><EmptyState title="No saved courses" message="Select your courses above and click Save Selection." /></div>
  </div>
</template>
