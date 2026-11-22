<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SummaryCard from '../../components/ui/SummaryCard.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { by, courses } from '../../data/mockData'
const auth = useAuthStore(), store = useScheduleStore(), router = useRouter()
const mine = computed(() => store.classCourses.filter((c) => by.classSet(c.classSetId).programId === auth.user.programId))
const noInst = computed(() => mine.value.filter((c) => !c.instructorId))
const noRoom = computed(() => mine.value.filter((c) => !store.ccAssignments(c.id).length))
const recent = computed(() => [...mine.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5))
const stats = computed(() => [
  { label: 'Total classes', value: mine.value.length, icon: 'calendar', tone: 'emerald' },
  { label: 'Total courses', value: courses.filter((c) => c.programId === auth.user.programId).length, icon: 'book', tone: 'sky' },
  { label: 'Assigned instructors', value: new Set(mine.value.map((c) => c.instructorId).filter(Boolean)).size, icon: 'users', tone: 'slate' },
  { label: 'Unassigned courses', value: mine.value.filter((c) => store.ccStatus(c) !== 'Complete').length, icon: 'alert', tone: 'amber' },
])
const label = (c) => `${by.course(c.courseId).code} · ${by.classSet(c.classSetId).name}`
const go = (name) => router.push({ name })
const card = 'rounded-xl border border-slate-200 bg-white'
</script>
<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div><h1 class="text-2xl font-semibold">Welcome, {{ auth.user.name.split(' ')[0] }}</h1><p class="mt-1 text-sm text-slate-600">Scheduling overview for {{ auth.user.program }}.</p></div>
      <button class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800" @click="go('chairperson-create-schedule')">+ Create new schedule</button>
    </div>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard v-for="s in stats" :key="s.label" v-bind="s" /></div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section :class="[card, 'lg:col-span-2']">
        <h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Recently created schedules</h2>
        <ul v-if="recent.length" class="divide-y divide-slate-100">
          <li v-for="c in recent" :key="c.id" class="flex items-center gap-3 px-5 py-3 text-sm">
            <div class="min-w-0 flex-1"><p class="truncate font-medium">{{ label(c) }}</p><p class="truncate text-xs text-slate-500">{{ by.course(c.courseId).title }}</p></div>
            <StatusBadge :status="store.ccStatus(c)" />
          </li>
        </ul>
        <EmptyState v-else title="No schedules yet" message="Add a class set to get started." />
      </section>
      <section :class="card">
        <h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Quick actions</h2>
        <div class="grid gap-2 p-4">
          <button class="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-emerald-50" @click="go('chairperson-create-schedule')">Create schedule</button>
          <button class="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-emerald-50" @click="go('chairperson-room-timetables')">View room timetables</button>
          <button class="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-emerald-50" @click="go('chairperson-instructor-timetables')">View instructor timetables</button>
        </div>
      </section>
      <section v-for="[title, list, empty] in [['Courses awaiting instructor', noInst, 'Every course has an instructor.'], ['Courses awaiting room', noRoom, 'Every course has a room.']]" :key="title" :class="[card, 'lg:col-span-1']">
        <h2 class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 font-semibold">{{ title }}<span class="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">{{ list.length }}</span></h2>
        <ul v-if="list.length" class="divide-y divide-slate-100"><li v-for="c in list" :key="c.id" class="px-5 py-2.5 text-sm">{{ label(c) }}</li></ul>
        <p v-else class="px-5 py-8 text-center text-sm text-slate-500">{{ empty }}</p>
      </section>
    </div>
  </div>
</template>
