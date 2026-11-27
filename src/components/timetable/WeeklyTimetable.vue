<script setup>
import { computed } from 'vue'
import { toMin, fmtTime } from '../../utils/time'
// days: [{key,label,sub}] ; events: [{col,start,end,color,title,lines,kind}] ; rows are 30 minutes, 6:00 AM to 10:00 PM
const props = defineProps({ days: Array, events: Array, startHour: { type: Number, default: 6 }, endHour: { type: Number, default: 22 } })
const emit = defineEmits(['select'])
const SLOT = 26 // px per 30 minutes
const slots = computed(() => Array.from({ length: (props.endHour - props.startHour) * 2 + 1 }, (_, i) => { const m = props.startHour * 60 + i * 30; return { i, label: fmtTime(`${Math.floor(m / 60)}:${m % 60 ? '30' : '00'}`), hour: m % 60 === 0 } }))
const height = computed(() => (props.endHour - props.startHour) * 2 * SLOT)
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
    const top = ((toMin(o.e.start) - props.startHour * 60) / 30) * SLOT, h = ((toMin(o.e.end) - toMin(o.e.start)) / 30) * SLOT
    return { ...o.e, style: { top: top + 'px', height: Math.max(h - 2, 20) + 'px', left: `calc(${(o.l / lanes.length) * 100}% + 2px)`, width: `calc(${100 / lanes.length}% - 4px)` } }
  })
}
const tall = (e) => toMin(e.end) - toMin(e.start) >= 60
</script>
<template>
  <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
    <div :style="{ minWidth: 72 + days.length * 120 + 'px' }">
      <div class="flex border-b border-slate-200 bg-slate-50 text-center text-xs font-medium text-slate-600">
        <div class="w-[4.5rem] shrink-0"></div>
        <div v-for="d in days" :key="d.key" class="flex-1 border-l border-slate-200 py-2"><span class="font-semibold text-slate-800">{{ d.label }}</span><span v-if="d.sub" class="block text-slate-500">{{ d.sub }}</span></div>
      </div>
      <div class="flex">
        <div class="relative w-[4.5rem] shrink-0" :style="{ height: height + 'px' }">
          <span v-for="s in slots" :key="s.i" :class="['absolute right-2 -translate-y-1/2 whitespace-nowrap text-[10px] leading-none', s.hour ? 'font-medium text-slate-600' : 'text-slate-400']" :style="{ top: s.i * SLOT + 'px' }">{{ s.label }}</span>
        </div>
        <div v-for="d in days" :key="d.key" class="relative flex-1 border-l border-slate-200"
             :style="{ height: height + 'px', backgroundImage: `linear-gradient(to bottom,#cbd5e1 1px,transparent 1px),linear-gradient(to bottom,#eef2f6 1px,transparent 1px)`, backgroundSize: `100% ${SLOT * 2}px,100% ${SLOT}px` }">
          <button v-for="e in laid(d.key)" :key="e.id" type="button" :style="e.style" @click="emit('select', e)"
                  :class="['absolute overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-left text-[11px] leading-tight shadow-sm', color[e.color] || color.emerald, e.kind === 'reservation' ? 'ring-1 ring-amber-400' : '']"
                  :title="[e.title, ...(e.lines || []), `${fmtTime(e.start)} – ${fmtTime(e.end)}`].join('\n')">
            <span class="block truncate font-semibold">{{ e.title }}</span>
            <template v-if="tall(e)"><span v-for="l in e.lines" :key="l" class="block truncate opacity-80">{{ l }}</span></template>
            <span class="block truncate opacity-70">{{ fmtTime(e.start).replace(' ', '') }}–{{ fmtTime(e.end).replace(' ', '') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
