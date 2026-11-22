<script setup>
import { computed } from 'vue'
import InstructorTimetablesView from '../shared/InstructorTimetablesView.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { useAuthStore } from '../../stores/auth'
import { useScheduleStore } from '../../stores/schedule'
const auth = useAuthStore(), store = useScheduleStore()
const ready = computed(() => store.selectedCourses(auth.user.id).length > 0) // rule: select courses before managing schedule
</script>
<template>
  <InstructorTimetablesView v-if="ready" self-only />
  <div v-else><h1 class="text-2xl font-semibold">My Timetable</h1>
    <div class="mt-6"><EmptyState title="Select your courses first" message="You need to choose the courses you will teach this semester before you can manage your schedule."><RouterLink to="/instructor/my-courses" class="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Go to My Courses</RouterLink></EmptyState></div></div>
</template>
