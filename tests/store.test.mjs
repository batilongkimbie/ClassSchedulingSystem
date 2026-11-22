const mem = {}; globalThis.localStorage = { getItem: k => mem[k] ?? null, setItem: (k, v) => (mem[k] = v), removeItem: k => delete mem[k] }
import { createPinia, setActivePinia } from 'pinia'
import { useScheduleStore } from '../src/stores/schedule.js'
import { dayOffset, todayISO, addDays } from '../src/utils/time.js'
setActivePinia(createPinia()); const s = useScheduleStore()
let fails = 0; const t = (n, v) => { if (!v) fails++; console.log(v ? 'PASS' : 'FAIL', n) }
const mon = dayOffset(1) // some future non-Sunday day
// --- Instructor -> Dean -> Instructor workflow
const before = s.reservationsForInstitute('ioc').filter(r => r.status === 'Pending').length
let r = s.submitReservation({ instructorId: 'f3', roomId: 'r11', date: addDays(todayISO(), 10) > mon ? mon : mon, start: '16:00', end: '17:00', purpose: 'Review session' })
t('instructor submit ok (or only blocked by a real conflict)', r.ok || /class|reserved/.test(r.errors[0]))
if (!r.ok) { r = s.submitReservation({ instructorId: 'f3', roomId: 'r11', date: addDays(mon, 14), start: '16:00', end: '17:00', purpose: 'Review session' }) }
t('submit ok', r.ok); const id = r.reservation.id
t('status is Pending, not auto-approved', r.reservation.status === 'Pending')
t('appears in Dean institute list', s.reservationsForInstitute('ioc').some(x => x.id === id))
t('dean got notification', s.notificationsFor('f2').some(n => /Ana Reyes requested Room 305/.test(n.text)))
t('pending does NOT block room', !s.reservationConflicts({ roomId: 'r11', date: r.reservation.date, start: '16:00', end: '17:00' }).length)
t('other institute hidden from dean', !s.reservationsForInstitute('ioc').some(x => x.instructorId === 'f8') && s.reservationsForInstitute('ioe').length === 1)
const ap = s.approveReservation(id)
t('approve ok', ap.ok && s.reservations.find(x => x.id === id).status === 'Approved')
t('approved shows on room timetable', s.eventsForRoom('r11', r.reservation.date, r.reservation.date).some(e => e.kind === 'reservation'))
t('approved shows on instructor timetable', s.eventsForInstructor('f3', r.reservation.date, r.reservation.date).some(e => e.kind === 'reservation'))
t('instructor notified', s.notificationsFor('f3').some(n => /Room 305 was approved/.test(n.text)))
t('approved now blocks the room', s.reservationConflicts({ roomId: 'r11', date: r.reservation.date, start: '16:30', end: '17:30' }).length === 1)
const dup = s.submitReservation({ instructorId: 'f5', roomId: 'r11', date: r.reservation.date, start: '16:30', end: '17:30', purpose: 'Conflict test' })
t('overlapping request rejected at submit', !dup.ok)
t('approve twice blocked', !s.approveReservation(id).ok)
// reject needs reason
const r2 = s.submitReservation({ instructorId: 'f5', roomId: 'r12', date: addDays(mon, 21), start: '09:00', end: '10:00', purpose: 'Seminar prep' })
t('reject w/o reason blocked', !s.rejectReservation(r2.reservation.id, '').ok)
t('reject with reason', s.rejectReservation(r2.reservation.id, 'Room under maintenance').ok && s.reservations.find(x => x.id === r2.reservation.id).reason.includes('maintenance'))
// validations
const V = (o) => s.validateReservation({ instructorId: 'f3', roomId: 'r11', date: mon, start: '16:00', end: '17:00', purpose: 'Valid purpose', ...o })
t('past date rejected', V({ date: '2020-01-01' }).some(e => /past/.test(e)))
t('bad time range', V({ start: '17:00', end: '16:00' }).some(e => /later/.test(e)))
t('purpose required', V({ purpose: '' }).some(e => /purpose/i.test(e)))
// class-vs-reservation (Room 103 has IT 311 Tue/Thu 13:00)
const tue = (() => { let d = todayISO(); for (let i = 0; i < 14; i++) { d = addDays(d, 1); if (new Date(d + 'T00:00').getDay() === 2) break } return d })()
t('class blocks reservation', V({ roomId: 'r10', date: tue, start: '13:00', end: '14:00' }).some(e => /IT 311/.test(e)))
// --- Chair -> everywhere
const cc = s.classCourses.find(c => c.id === 'cc4')
const a = s.saveAssignment({ ccId: 'cc3', roomId: 'r2', classType: 'discussion', days: [3], start: '15:00', end: '16:00', programId: 'bsit' })
t('chair room assignment saved', a.ok)
const col = addDays(todayISO(), 0)
t('room assignment visible on room timetable', s.eventsForRoom('r2', addDays(mon, -6), addDays(mon, 6)).some(e => e.title === 'IT 221'))
t('and on instructor timetable', s.eventsForInstructor('f7', addDays(mon, -6), addDays(mon, 6)).some(e => e.title === 'IT 221'))
// approved res blocks chair assignment
t('approved reservation blocks chair room assignment', s.validateAssignment({ ccId: 'cc4', roomId: 'r11', classType: 'discussion', days: [0,1,2,3,4,5], start: '16:00', end: '17:00', programId: 'bsit' }).some(e => /reservation/.test(e)))
// course selection
t('select only authorized courses', s.saveCourseSelection('f3', ['c1', 'c2', 'c9', 'c1']) === 2)
t('no duplicates', new Set(s.selectedCourses('f3')).size === s.selectedCourses('f3').length)
// persistence roundtrip
setActivePinia(createPinia()); const s2 = useScheduleStore()
t('persisted across reload', s2.reservations.some(x => x.id === id && x.status === 'Approved') && s2.selectedCourses('f3').length === 2)
console.log(fails ? `${fails} FAILED` : 'ALL PASSED'); process.exit(fails ? 1 : 0)
