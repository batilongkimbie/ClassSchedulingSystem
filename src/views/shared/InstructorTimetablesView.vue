<script setup>
import { ref, computed, watch } from 'vue'
import WeeklyTimetable from '../../components/timetable/WeeklyTimetable.vue'
import DateRangeBar from '../../components/timetable/DateRangeBar.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { useScheduleStore } from '../../stores/schedule'
import { useAuthStore } from '../../stores/auth'
import { by } from '../../data/mockData'
import { defaultRange, dayCols, fmtRange, fmtTime, fmtDate, DAYS } from '../../utils/time'
const props = defineProps({ selfOnly: Boolean })
const store = useScheduleStore(), auth = useAuthStore()
const range = ref(defaultRange()), q = ref('')
const all = computed(() => store.instructorList().filter((f) => f.instituteId === auth.user.instituteId))
const list = computed(() => all.value.filter((f) => f.name.toLowerCase().includes(q.value.toLowerCase())))
const id = ref(props.selfOnly ? auth.user.id : all.value.some((f) => f.id === auth.user.id) ? auth.user.id : all.value[0]?.id)
watch(list, (l) => { if (props.selfOnly) return; if (l.length && !l.some((f) => f.id === id.value)) id.value = l[0].id })
const person = computed(() => by.faculty(id.value))
const cols = computed(() => dayCols(range.value.from, range.value.to))
const events = computed(() => (id.value ? store.eventsForInstructor(id.value, range.value.from, range.value.to) : []))
const teaching = computed(() => store.classCourses.filter((c) => c.instructorId === id.value).map((c) => ({
  cc: c, course: by.course(c.courseId), set: by.classSet(c.classSetId),
  slots: store.ccAssignments(c.id).map((a) => ({ id: a.id, room: by.room(a.roomId).name, days: a.days.map((d) => DAYS[d].slice(0, 3)).join('/'), time: `${fmtTime(a.start)} – ${fmtTime(a.end)}`, type: a.classType })),
})))
const approved = computed(() => store.reservations.filter((r) => r.instructorId === id.value && r.status === 'Approved').sort((a, b) => a.date.localeCompare(b.date)))
const field = 'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/25'
</script>
<template>
  <div>
    <h1 class="text-2xl font-semibold">{{ selfOnly ? 'My Timetable' : 'Instructor Timetables' }}</h1>
    <p class="mt-1 text-sm text-slate-600">{{ selfOnly ? 'Your weekly teaching schedule, including approved room reservations.' : 'Weekly teaching schedule and approved reservations for each instructor.' }}</p>
    <div v-if="!selfOnly" class="mt-5 flex flex-wrap gap-3">
      <input v-model="q" type="search" placeholder="Search instructor" :class="[field, 'w-full sm:w-52']" />
      <select v-model="id" :class="field" aria-label="Instructor"><option v-for="f in list" :key="f.id" :value="f.id">{{ f.name }}</option></select>
    </div>
    <div class="mt-4"><DateRangeBar v-model="range" /></div>
    <template v-if="person">
      <div class="mt-5 flex flex-wrap items-baseline gap-3"><h2 class="text-lg font-semibold">{{ person.name }}</h2><span class="text-sm text-slate-400">{{ fmtRange(range) }}</span></div>
      <div class="mt-3"><WeeklyTimetable :days="cols" :events="events" /></div>
      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <section class="overflow-hidden rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <h3 class="border-b border-slate-100 px-4 py-3 font-semibold">Assigned courses</h3>
          <div class="overflow-x-auto"><table class="min-w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th v-for="h in ['Course', 'Class set', 'Classroom', 'Type', 'Days', 'Time']" :key="h" class="px-4 py-2 font-medium">{{ h }}</th></tr></thead>
            <tbody class="divide-y divide-slate-100">
              <template v-for="t in teaching" :key="t.cc.id">
                <tr v-for="(s, i) in (t.slots.length ? t.slots : [null])" :key="s?.id || 'none'">
                  <td class="px-4 py-2"><span class="font-medium">{{ t.course.code }}</span> <span class="text-slate-500">{{ t.course.title }}</span></td><td class="px-4 py-2">{{ t.set.name }}</td>
                  <td class="px-4 py-2">{{ s ? s.room : '—' }}</td><td class="px-4 py-2 capitalize">{{ s ? s.type : '—' }}</td><td class="px-4 py-2">{{ s ? s.days : 'No room yet' }}</td><td class="whitespace-nowrap px-4 py-2">{{ s ? s.time : '—' }}</td>
                </tr>
              </template>
              <tr v-if="!teaching.length"><td colspan="6" class="px-4 py-8 text-center text-slate-500">No courses assigned yet.</td></tr>
            </tbody></table></div>
        </section>
        <section class="rounded-xl border border-slate-200 bg-white">
          <h3 class="border-b border-slate-100 px-4 py-3 font-semibold">Approved reservations</h3>
          <ul v-if="approved.length" class="divide-y divide-slate-100"><li v-for="r in approved" :key="r.id" class="px-4 py-2.5 text-sm"><p class="font-medium">{{ by.room(r.roomId).name }}</p><p class="text-xs text-slate-500">{{ fmtDate(r.date) }}, {{ fmtTime(r.start) }} – {{ fmtTime(r.end) }}</p><p class="text-xs text-slate-500">{{ r.purpose }}</p></li></ul>
          <p v-else class="px-4 py-8 text-center text-sm text-slate-500">No approved reservations.</p>
        </section>
      </div>
    </template>
    <div v-else class="mt-6"><EmptyState title="No instructors found" message="Try a different search." /></div>
  </div>
</template>
