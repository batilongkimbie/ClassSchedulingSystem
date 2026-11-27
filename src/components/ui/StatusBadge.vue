<script setup>
const props = defineProps({ status: String })
const tone = { Complete: 'emerald', Approved: 'emerald', Available: 'emerald', Eligible: 'emerald', Pending: 'amber', 'Needs room': 'amber', 'Needs instructor': 'amber', Rejected: 'red', Unassigned: 'slate', Recommended: 'amber', Cancelled: 'slate', 'Cancellation requested': 'amber' }
const cls = { emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', amber: 'bg-amber-50 text-amber-800 ring-amber-600/25', red: 'bg-red-50 text-red-700 ring-red-600/20', slate: 'bg-slate-100 text-slate-600 ring-slate-500/20' }
</script>
<template><span :class="['inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', cls[tone[status] || 'slate']]">{{ status }}</span></template>
