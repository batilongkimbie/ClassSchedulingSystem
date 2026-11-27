<script setup>
import { ref, computed } from 'vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import AddClassModal from '../../components/schedule/AddClassModal.vue'
import CourseAssignModal from '../../components/schedule/CourseAssignModal.vue'
import ReviewScheduleModal from '../../components/schedule/ReviewScheduleModal.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { by, classSets } from '../../data/mockData'
import { DAYS, fmtTime } from '../../utils/time'
const auth = useAuthStore(), store = useScheduleStore()
const showAdd = ref(false), addClassSetId = ref(''), activeCc = ref(null), reviewSet = ref(null), filterSet = ref(''), q = ref('')
const mySets = computed(() => classSets.filter((s) => s.programId === auth.user.programId))
const groups = computed(() => mySets.value.filter((s) => !filterSet.value || s.id === filterSet.value).map((s) => ({
  set: s,
  items: store.classCourses.filter((c) => c.classSetId === s.id && (by.course(c.courseId).code + ' ' + by.course(c.courseId).title).toLowerCase().includes(q.value.toLowerCase())),
  total: store.classCourses.filter((c) => c.classSetId === s.id).length,
})).filter((g) => g.total))
const done = (set) => store.classCourses.filter((c) => c.classSetId === set.id && store.ccStatus(c) === 'Complete').length
const roomText = (cc) => store.ccAssignments(cc.id).map((a) => `${by.room(a.roomId).name} (${a.days.map((d) => DAYS[d].slice(0, 3)).join('/')} ${fmtTime(a.start)}–${fmtTime(a.end)})`)
const field = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
const openAddClass = () => { addClassSetId.value = ''; showAdd.value = true }
const editClass = (classSetId) => { addClassSetId.value = classSetId; showAdd.value = true }
const closeAddClass = () => { showAdd.value = false; addClassSetId.value = '' }
</script>
<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div><h1 class="text-2xl font-semibold">Create Schedule</h1><p class="mt-1 text-sm text-slate-600">Add courses to a class set, then assign an instructor and room to each one.</p></div>
      <button class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800" @click="openAddClass">+ Add Class</button>
    </div>
    <div class="mt-5 flex flex-wrap gap-3">
      <select v-model="filterSet" :class="field" aria-label="Filter by class set"><option value="">All class sets</option><option v-for="s in mySets" :key="s.id" :value="s.id">{{ s.name }}</option></select>
      <input v-model="q" type="search" placeholder="Search courses" :class="[field, 'w-full sm:w-72']" />
    </div>

    <div v-if="groups.length" class="mt-6 space-y-8">
      <section v-for="g in groups" :key="g.set.id">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-lg font-semibold">{{ g.set.name }}</h2>
          <span class="text-sm text-slate-500">{{ g.set.size }} students · {{ done(g.set) }}/{{ g.total }} complete</span>
          <div class="hidden h-1.5 w-32 overflow-hidden rounded-full bg-slate-200 sm:block"><div class="h-full bg-emerald-600" :style="{ width: (done(g.set) / g.total) * 100 + '%' }"></div></div>
          <div class="ml-auto flex items-center gap-2">
            <button class="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" @click="editClass(g.set.id)">Edit Courses</button>
            <button class="rounded-lg border border-emerald-700 px-3.5 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50" @click="reviewSet = g.set.id">Review</button>
          </div>
        </div>
        <div class="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <button v-for="cc in g.items" :key="cc.id" type="button" class="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-500 hover:shadow-md" @click="activeCc = cc.id">
            <div class="flex items-start justify-between gap-2"><p class="font-semibold">{{ by.course(cc.courseId).code }}</p><StatusBadge :status="store.ccStatus(cc)" /></div>
            <p class="mt-0.5 text-sm text-slate-600">{{ by.course(cc.courseId).title }}</p>
            <dl class="mt-3 space-y-1 text-xs">
              <div class="flex gap-2"><dt class="w-16 shrink-0 text-slate-500">Instructor</dt><dd :class="cc.instructorId ? 'font-medium text-slate-800' : 'text-amber-700'">{{ cc.instructorId ? by.faculty(cc.instructorId).name : 'Not assigned' }}</dd></div>
              <div class="flex gap-2"><dt class="w-16 shrink-0 text-slate-500">Room</dt><dd class="min-w-0"><template v-if="roomText(cc).length"><span v-for="t in roomText(cc)" :key="t" class="block truncate font-medium text-slate-800">{{ t }}</span></template><span v-else class="text-amber-700">Not assigned</span></dd></div>
            </dl>
          </button>
          <p v-if="!g.items.length" class="text-sm text-slate-500">No courses match your search.</p>
        </div>
      </section>
    </div>
    <div v-else class="mt-6"><EmptyState title="No classes yet" message="Click Add Class to pick a class set and its courses."><button class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white" @click="openAddClass">+ Add Class</button></EmptyState></div>

    <AddClassModal :open="showAdd" :class-set-id="addClassSetId" @close="closeAddClass" />
    <CourseAssignModal :open="!!activeCc" :cc-id="activeCc" @close="activeCc = null" />
    <ReviewScheduleModal :open="!!reviewSet" :class-set-id="reviewSet" @close="reviewSet = null" />
  </div>
</template>
