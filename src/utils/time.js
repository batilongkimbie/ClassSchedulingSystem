export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
export const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}` }
export const overlaps = (a1, a2, b1, b2) => toMin(a1) < toMin(b2) && toMin(b1) < toMin(a2)
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parseISO = (s) => new Date(s + 'T00:00:00')
export const todayISO = () => iso(new Date())
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d) }
export const dayIndexOf = (s) => (parseISO(s).getDay() + 6) % 7 // 0 = Mon ... 6 = Sun
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5)
export const weekStart = (s) => addDays(s, -dayIndexOf(s))
export const defaultRange = () => { const m = weekStart(todayISO()); return { from: m, to: addDays(m, 5) } }
export const fmtDate = (s, long = false) => parseISO(s).toLocaleDateString('en-US', long ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' })
export const fmtRange = (r) => `${fmtDate(r.from)} – ${fmtDate(r.to)}, ${parseISO(r.to).getFullYear()}`
// Dates from..to without Sundays (no classes on Sunday)
export const visibleDays = (from, to) => { const out = []; for (let d = from; d <= to && out.length < 7; d = addDays(d, 1)) if (dayIndexOf(d) !== 6) out.push(d); return out }
export const dayCols = (from, to) => visibleDays(from, to).map((d) => ({ key: d, label: DAYS[dayIndexOf(d)].slice(0, 3), sub: fmtDate(d) }))
// Demo helper: today + n days, skipping Sundays
export const dayOffset = (n) => { let d = addDays(todayISO(), n); if (dayIndexOf(d) === 6) d = addDays(d, 1); return d }
