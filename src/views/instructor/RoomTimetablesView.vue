<script setup>
import { ref } from 'vue'
import RoomTimetablesView from '../shared/RoomTimetablesView.vue'
import ReserveModal from '../../components/reservation/ReserveModal.vue'
const open = ref(false), room = ref('')
</script>
<template>
  <RoomTimetablesView>
    <template #actions="{ roomId }"><button class="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-sm hover:bg-amber-400" @click="room = roomId; open = true">Reserve</button></template>
  </RoomTimetablesView>
  <ReserveModal :open="open" :room-id="room" @close="open = false" />
</template>
