<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<template>
  <div>
    <h1 class="text-2xl font-semibold">{{ route.meta.title }}</h1>
    <p class="mt-1 text-sm text-slate-600">This page is built in a later stage. Navigation and role access already work.</p>
    <div class="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">Coming in the next stages</div>
  </div>
</template>
