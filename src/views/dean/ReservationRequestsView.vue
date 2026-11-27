<script setup>
import { ref, computed } from 'vue'
import ReservationsTable from '../../components/reservation/ReservationsTable.vue'
import ReservationDetailsModal from '../../components/reservation/ReservationDetailsModal.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
const auth = useAuthStore(), store = useScheduleStore(), open = ref(null)
const rows = computed(() => store.reservationsForDean(auth.user.id)) // each request goes to one specific dean
</script>
<template>
  <div>
    <h1 class="text-2xl font-semibold">Reservation Requests</h1>
    <p class="mt-1 text-sm text-slate-600">Review classroom reservation requests from instructors in your institute.</p>
    <div class="mt-5"><ReservationsTable :rows="rows" mode="dean" @open="open = $event" /></div>
    <ReservationDetailsModal :open="!!open" :res-id="open" mode="dean" @close="open = null" />
  </div>
</template>
