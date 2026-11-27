<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SummaryCard from '../../components/ui/SummaryCard.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import ReserveModal from '../../components/reservation/ReserveModal.vue'
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { by } from '../../data/mockData'
import { todayISO, addDays, fmtDate, fmtTime } from '../../utils/time'
const auth = useAuthStore(), store = useScheduleStore(), router = useRouter(), reserve = ref(false)
const id = auth.user.id, today = todayISO()
const selected = computed(() => store.selectedCourses(id))
const mine = computed(() => store.classCourses.filter((c) => c.instructorId === id))
const slots = computed(() => store.assignments.filter((a) => mine.value.some((c) => c.id === a.ccId)).length)
const week = computed(() => store.eventsForInstructor(id, today, addDays(today, 6)))
const nowT = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }
const todays = computed(() => week.value.filter((e) => e.col === today).sort((a, b) => a.start.localeCompare(b.start)))
const upcoming = computed(() => week.value.filter((e) => e.col > today || (e.col === today && e.end > nowT())).sort((a, b) => (a.col + a.start).localeCompare(b.col + b.start)).slice(0, 6))
const reqs = computed(() => store.reservations.filter((r) => r.instructorId === id).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)))
const count = (s) => reqs.value.filter((r) => r.status === s).length
const stats = computed(() => [
  { label: 'Assigned courses', value: selected.value.length, icon: 'book', tone: 'emerald' },
  { label: 'Scheduled classes', value: slots.value, icon: 'calendar', tone: 'sky' },
  { label: 'Upcoming (next 7 days)', value: upcoming.value.length, icon: 'clock', tone: 'slate' },
  { label: 'Pending reservations', value: count('Pending'), icon: 'inbox', tone: 'amber' },
])
const card = 'rounded-xl border border-slate-200 bg-white'
const evText = (e) => `${fmtTime(e.start)} – ${fmtTime(e.end)} · ${e.kind === 'reservation' ? 'Reserved ' + e.lines[2] : e.title + ' · ' + e.lines[2]}`
</script>
<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3"><div><h1 class="text-2xl font-semibold">Welcome, {{ auth.user.name.split(' ')[0] }}</h1><p class="mt-1 text-sm text-slate-600">Your classes and room reservations at a glance.</p></div>
      <div class="flex gap-2"><button class="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50" @click="router.push({ name: 'instructor-room-timetables' })">Room timetables</button><button class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800" @click="reserve = true">Reserve a room</button></div></div>
    <div v-if="!selected.length" class="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <span class="flex-1">Start by selecting the courses you will teach this semester. Your timetable unlocks after that.</span><RouterLink to="/instructor/my-courses" class="rounded-lg bg-amber-500 px-3.5 py-2 font-semibold text-emerald-950">Select courses</RouterLink></div>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard v-for="s in stats" :key="s.label" v-bind="s" /></div>
    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section :class="card"><h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Today's schedule <span class="text-xs font-normal text-slate-500">{{ fmtDate(today) }}</span></h2>
        <ul v-if="todays.length" class="divide-y divide-slate-100"><li v-for="e in todays" :key="e.id" class="px-5 py-3 text-sm">{{ evText(e) }}</li></ul><p v-else class="px-5 py-10 text-center text-sm text-slate-500">No classes today.</p></section>
      <section :class="card"><h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Upcoming classes</h2>
        <ul v-if="upcoming.length" class="divide-y divide-slate-100"><li v-for="e in upcoming" :key="e.id" class="px-5 py-3 text-sm"><p class="text-xs text-slate-500">{{ fmtDate(e.col, true) }}</p>{{ evText(e) }}</li></ul><p v-else class="px-5 py-10 text-center text-sm text-slate-500">Nothing in the next 7 days.</p></section>
      <section :class="card"><h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Reservation status</h2>
        <div class="space-y-3 p-5"><div v-for="[s, c] in [['Pending', 'bg-amber-500'], ['Approved', 'bg-emerald-600'], ['Rejected', 'bg-red-500'], ['Cancelled', 'bg-slate-400']]" :key="s" class="flex items-center gap-3 text-sm"><span class="w-20"><StatusBadge :status="s" /></span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div :class="['h-full', c]" :style="{ width: reqs.length ? (count(s) / reqs.length) * 100 + '%' : '0%' }"></div></div><span class="w-6 text-right">{{ count(s) }}</span></div></div></section>
      <section :class="[card, 'lg:col-span-3']"><div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5"><h2 class="font-semibold">Recent reservation requests</h2><RouterLink to="/instructor/my-reservations" class="text-sm font-medium text-emerald-700 hover:underline">View all</RouterLink></div>
        <ul v-if="reqs.length" class="divide-y divide-slate-100"><li v-for="r in reqs.slice(0, 4)" :key="r.id" class="flex items-center gap-3 px-5 py-3 text-sm"><div class="min-w-0 flex-1"><p class="truncate font-medium">{{ by.room(r.roomId).name }} · {{ r.purpose }}</p><p class="text-xs text-slate-500">{{ fmtDate(r.date) }}, {{ fmtTime(r.start) }} – {{ fmtTime(r.end) }}</p></div><StatusBadge :status="r.status" /></li></ul>
        <p v-else class="px-5 py-8 text-center text-sm text-slate-500">You haven't requested a room yet.</p></section>
    </div>
    <ReserveModal :open="reserve" @close="reserve = false" />
  </div>
</template>
