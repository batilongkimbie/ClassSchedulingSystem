<script setup>
import { computed } from 'vue'
import { toMin, fmtTime } from '../../utils/time'
// days: [{key,label,sub}] ; events: [{col,start,end,color,title,lines,kind}]
const props = defineProps({ days: Array, events: Array, startHour: { type: Number, default: 7 }, endHour: { type: Number, default: 21 } })
const emit = defineEmits(['select'])
const ROW = 44
const hours = computed(() => Array.from({ length: props.endHour - props.startHour }, (_, i) => props.startHour + i))
const height = computed(() => (props.endHour - props.startHour) * ROW)
const color = {
  emerald: 'bg-emerald-100 border-emerald-600 text-emerald-950', sky: 'bg-sky-100 border-sky-600 text-sky-950', violet: 'bg-violet-100 border-violet-600 text-violet-950',
  rose: 'bg-rose-100 border-rose-600 text-rose-950', amber: 'bg-amber-100 border-amber-500 text-amber-950', indigo: 'bg-indigo-100 border-indigo-600 text-indigo-950',
  teal: 'bg-teal-100 border-teal-600 text-teal-950', draft: 'bg-slate-100 border-slate-500 border-dashed text-slate-800 ring-2 ring-slate-400/40',
}
function laid(col) {
  const list = props.events.filter((e) => e.col === col).sort((a, b) => toMin(a.start) - toMin(b.start)), lanes = [], out = []
  for (const e of list) {
    let l = lanes.findIndex((end) => end <= toMin(e.start)); if (l === -1) { l = lanes.length; lanes.push(0) }
    lanes[l] = toMin(e.end); out.push({ e, l })
  }
  return out.map((o) => {
    const top = ((toMin(o.e.start) - props.startHour * 60) / 60) * ROW, h = ((toMin(o.e.end) - toMin(o.e.start)) / 60) * ROW
    return { ...o.e, style: { top: top + 'px', height: Math.max(h - 2, 18) + 'px', left: `calc(${(o.l / lanes.length) * 100}% + 2px)`, width: `calc(${100 / lanes.length}% - 4px)` } }
  })
}
</script>
<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <div :style="{ minWidth: 56 + days.length * 120 + 'px' }">
      <div class="flex border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600">
        <div class="w-14 shrink-0"></div>
        <div v-for="d in days" :key="d.key" class="flex-1 border-l border-slate-200 py-2"><span class="font-semibold text-slate-800">{{ d.label }}</span><span v-if="d.sub" class="block text-slate-500">{{ d.sub }}</span></div>
      </div>
      <div class="flex">
        <div class="relative w-14 shrink-0" :style="{ height: height + 'px' }">
          <span v-for="(h, i) in hours" :key="h" class="absolute right-2 -translate-y-2 text-[11px] text-slate-400" :style="{ top: i * ROW + 'px' }">{{ i ? fmtTime(h + ':00').replace(':00', '') : '' }}</span>
        </div>
        <div v-for="d in days" :key="d.key" class="relative flex-1 border-l border-slate-200"
             :style="{ height: height + 'px', backgroundImage: 'linear-gradient(to bottom,#e2e8f0 1px,transparent 1px)', backgroundSize: `100% ${ROW}px` }">
          <button v-for="e in laid(d.key)" :key="e.id" type="button" :style="e.style" @click="emit('select', e)"
                  :class="['absolute overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-left text-[11px] leading-tight shadow-sm', color[e.color] || color.emerald, e.kind === 'reservation' ? 'ring-1 ring-amber-400' : '']"
                  :title="[e.title, ...(e.lines || []), `${fmtTime(e.start)} – ${fmtTime(e.end)}`].join('\n')">
            <span class="block truncate font-semibold">{{ e.title }}</span>
            <span v-for="l in e.lines" :key="l" class="block truncate opacity-80">{{ l }}</span>
            <span class="block truncate opacity-70">{{ fmtTime(e.start).replace(' ', '') }}–{{ fmtTime(e.end).replace(' ', '') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
