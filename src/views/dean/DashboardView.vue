<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SummaryCard from '../../components/ui/SummaryCard.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
import { rooms, by } from '../../data/mockData'
import { todayISO, defaultRange, toMin, fmtDate, fmtTime } from '../../utils/time'
const auth = useAuthStore(), store = useScheduleStore(), router = useRouter()
const reqs = computed(() => store.reservationsForDean(auth.user.id))
const recent = computed(() => [...reqs.value].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5))
const upcoming = computed(() => reqs.value.filter((r) => r.status === 'Approved' && r.date >= todayISO()).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).slice(0, 5))
const wk = defaultRange(), CAP = 6 * 14 * 60
const info = computed(() => rooms.map((r) => {
  const mins = store.eventsForRoom(r.id, wk.from, wk.to).reduce((n, e) => n + toMin(e.end) - toMin(e.start), 0)
  return { r, now: store.inUseNow(r.id), util: Math.min(100, Math.round((mins / CAP) * 100)) }
}).sort((a, b) => b.util - a.util))
const occupied = computed(() => info.value.filter((i) => i.now).length)
const stats = computed(() => [
  { label: 'Total classrooms', value: rooms.length, icon: 'building', tone: 'emerald' },
  { label: 'Occupied right now', value: occupied.value, icon: 'clock', tone: 'sky' },
  { label: 'Available right now', value: rooms.length - occupied.value, icon: 'check', tone: 'slate' },
  { label: 'Pending requests', value: reqs.value.filter((r) => r.status === 'Pending' || r.cancelRequest?.status === 'Pending').length, icon: 'inbox', tone: 'amber' },
])
const card = 'rounded-xl border border-slate-200 bg-white'
</script>
<template>
  <div>
    <h1 class="text-2xl font-semibold">Welcome, Dean {{ auth.user.name.split(' ').slice(-1)[0] }}</h1>
    <p class="mt-1 text-sm text-slate-600">Classroom utilization and reservation activity for the {{ auth.user.institute }}.</p>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard v-for="s in stats" :key="s.label" v-bind="s" /></div>
    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <section :class="[card, 'lg:col-span-2']">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3.5"><h2 class="font-semibold">Recent reservation requests</h2><button class="text-sm font-medium text-emerald-700 hover:underline" @click="router.push({ name: 'dean-reservation-requests' })">View all</button></div>
        <ul v-if="recent.length" class="divide-y divide-slate-100"><li v-for="r in recent" :key="r.id" class="flex items-center gap-3 px-5 py-3 text-sm">
          <div class="min-w-0 flex-1"><p class="truncate font-medium">{{ by.faculty(r.instructorId).name }} · {{ by.room(r.roomId).name }}</p><p class="text-xs text-slate-500">{{ fmtDate(r.date) }}, {{ fmtTime(r.start) }} – {{ fmtTime(r.end) }}</p></div><StatusBadge :status="r.status" /></li></ul>
        <p v-else class="px-5 py-10 text-center text-sm text-slate-500">No reservation requests yet.</p>
      </section>
      <section :class="card">
        <h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Quick access</h2>
        <div class="grid gap-2 p-4">
          <button class="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-emerald-50" @click="router.push({ name: 'dean-room-timetables' })">Room timetables</button>
          <button class="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-emerald-50" @click="router.push({ name: 'dean-instructor-timetables' })">Instructor timetables</button>
          <button class="rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-medium hover:bg-emerald-50" @click="router.push({ name: 'dean-reservation-requests' })">Reservation requests</button>
        </div>
      </section>
      <section :class="[card, 'lg:col-span-2']">
        <h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Classroom availability overview <span class="text-xs font-normal text-slate-500">(this week's utilization)</span></h2>
        <ul class="max-h-96 divide-y divide-slate-100 overflow-y-auto"><li v-for="i in info" :key="i.r.id" class="flex items-center gap-3 px-5 py-2.5 text-sm">
          <span class="w-36 truncate font-medium">{{ i.r.name }}</span><StatusBadge :status="i.now ? 'Pending' : 'Available'" class="hidden" />
          <span :class="['w-20 text-xs font-medium', i.now ? 'text-amber-700' : 'text-emerald-700']">{{ i.now ? 'In use now' : 'Free now' }}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div :class="['h-full', i.util > 70 ? 'bg-amber-500' : 'bg-emerald-600']" :style="{ width: i.util + '%' }"></div></div><span class="w-10 text-right text-xs text-slate-500">{{ i.util }}%</span></li></ul>
      </section>
      <section :class="card">
        <h2 class="border-b border-slate-100 px-5 py-3.5 font-semibold">Upcoming reservations</h2>
        <ul v-if="upcoming.length" class="divide-y divide-slate-100"><li v-for="r in upcoming" :key="r.id" class="px-5 py-3 text-sm"><p class="font-medium">{{ by.room(r.roomId).name }}</p><p class="text-xs text-slate-500">{{ fmtDate(r.date) }}, {{ fmtTime(r.start) }} – {{ fmtTime(r.end) }} · {{ by.faculty(r.instructorId).name }}</p></li></ul>
        <p v-else class="px-5 py-10 text-center text-sm text-slate-500">No upcoming approved reservations.</p>
      </section>
    </div>
  </div>
</template>
