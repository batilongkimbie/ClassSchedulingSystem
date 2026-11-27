<script setup>
import { useAuthStore } from '../stores/auth'
const { user } = useAuthStore()
const rows = [['Full name', user.name], ['Email', user.email], ['Role', user.roleLabel],['Can also act as', user.roles.filter((r) => r !== user.primaryRole).map((r) => ({ instructor: 'Instructor', chairperson: 'Program Chairperson', dean: 'Dean' })[r]).join(', ') || 'None'], ['Institute', user.institute], ['Program', user.program || 'Not applicable']]
</script>
<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold">Profile</h1>
    <p class="mt-1 text-sm text-slate-600">Your details come from faculty records and can only be changed by an administrator.</p>
    <div class="mt-6 rounded-xl border border-slate-200 bg-white">
      <div class="flex items-center gap-4 border-b border-slate-100 p-6">
        <span class="grid h-14 w-14 place-items-center rounded-full bg-emerald-700 text-lg font-semibold text-white">{{ user.initials }}</span>
        <div><p class="font-semibold">{{ user.name }}</p><p class="text-sm text-slate-500">{{ user.roleLabel }}</p></div>
      </div>
      <dl class="divide-y divide-slate-100">
        <div v-for="[k, v] in rows" :key="k" class="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:gap-0">
          <dt class="text-sm text-slate-500 sm:w-40">{{ k }}</dt><dd class="text-sm font-medium">{{ v }}</dd>
        </div>
      </dl>
    </div>
  </div>
</template>
