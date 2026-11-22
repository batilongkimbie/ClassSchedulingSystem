<script setup>
import { ref, computed } from 'vue'
import ReservationsTable from '../../components/reservation/ReservationsTable.vue'
import ReservationDetailsModal from '../../components/reservation/ReservationDetailsModal.vue'
import ReserveModal from '../../components/reservation/ReserveModal.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
const auth = useAuthStore(), store = useScheduleStore(), open = ref(null), reserve = ref(false)
const rows = computed(() => store.reservations.filter((r) => r.instructorId === auth.user.id)) // own requests only
</script>
<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3"><div><h1 class="text-2xl font-semibold">My Reservations</h1><p class="mt-1 text-sm text-slate-600">Track the classroom requests you have submitted to the Dean.</p></div>
      <button class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800" @click="reserve = true">+ New reservation</button></div>
    <div class="mt-5"><ReservationsTable :rows="rows" mode="instructor" @open="open = $event" /></div>
    <ReservationDetailsModal :open="!!open" :res-id="open" mode="instructor" @close="open = null" />
    <ReserveModal :open="reserve" @close="reserve = false" />
  </div>
</template>
