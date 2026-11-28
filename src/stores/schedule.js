import { defineStore } from 'pinia'
import * as seed from '../data/mockData'
import { by, rooms, faculty, courses, programs } from '../data/mockData'
import { DAYS, toMin, fmtTime, overlaps, visibleDays, dayIndexOf, todayISO } from '../utils/time'

const KEY = 'css_schedule_v3'
const COURSE_SELECTION_SEED_VERSION = 2
const PALETTE = ['emerald', 'sky', 'violet', 'rose', 'amber', 'indigo', 'teal']
const clone = (x) => JSON.parse(JSON.stringify(x))
const defaults = () => ({ classCourses: clone(seed.classCourses), assignments: clone(seed.assignments), reservations: clone(seed.reservations),
  facultyCourses: clone(seed.facultyCourses), notifications: clone(seed.notifications), emails: [] })
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s?.classCourses) {
      const state = { ...defaults(), ...s }
      if (s.courseSelectionSeedVersion !== COURSE_SELECTION_SEED_VERSION) {
        for (const [facultyId, courseIds] of Object.entries(seed.facultyCourses)) {
          if (!Array.isArray(s.facultyCourses?.[facultyId]) || !s.facultyCourses[facultyId].length)
            state.facultyCourses[facultyId] = [...courseIds]
        }
        localStorage.setItem(KEY, JSON.stringify({ ...s, facultyCourses: state.facultyCourses, courseSelectionSeedVersion: COURSE_SELECTION_SEED_VERSION }))
      }
      const workshop = state.reservations.find((r) => r.id === 'res7' && r.purpose === 'Department planning workshop' && r.status === 'Approved')
      const seedWorkshop = seed.reservations.find((r) => r.id === 'res7')
      if (workshop && seedWorkshop && state.assignments.some((a) => a.roomId === workshop.roomId && a.days.includes(dayIndexOf(workshop.date)) && overlaps(workshop.start, workshop.end, a.start, a.end))) {
        workshop.date = seedWorkshop.date
      }
      return state
    }
  } catch { /* ignore */ }
  return defaults()
}

// Single shared data layer used by every role (Chair, Dean, Instructor).
export const useScheduleStore = defineStore('schedule', {
  state: () => load(),
  actions: {
    save() { localStorage.setItem(KEY, JSON.stringify({ classCourses: this.classCourses, assignments: this.assignments, reservations: this.reservations, facultyCourses: this.facultyCourses, courseSelectionSeedVersion: COURSE_SELECTION_SEED_VERSION, notifications: this.notifications, emails: this.emails })) },
    resetDemo() { localStorage.removeItem(KEY); Object.assign(this, defaults()) },

    // ---- lookups
    ccStatus(cc) {
      const has = this.assignments.some((a) => a.ccId === cc.id)
      if (cc.instructorId && has) return 'Complete'
      if (!cc.instructorId && !has) return 'Unassigned'
      return cc.instructorId ? 'Needs room' : 'Needs instructor'
    },
    ccAssignments(ccId) { return this.assignments.filter((a) => a.ccId === ccId) },
    instructorsForCourse(courseId, facultyIds) {
      return faculty.filter((f) => facultyIds.includes(f.id) && this.selectedCourses(f.id).includes(courseId))
    },
    roomAllowedForPrograms(room, programIds) {
      if (room.category === 'public') return true
      const roomProgramIds = Array.isArray(room.programIds) ? room.programIds : []
      return roomProgramIds.some((id) => programIds.includes(id))
    },
    roomAllowedForProgram(room, programId) {
      return this.roomAllowedForPrograms(room, programId ? [programId] : [])
    },
    roomsForInstitute(instituteId) {
      const programIds = programs.filter((p) => p.instituteId === instituteId).map((p) => p.id)
      return rooms.filter((room) => this.roomAllowedForPrograms(room, programIds))
    },
    instructorList() { return faculty.filter((f) => f.role === 'instructor' || this.classCourses.some((c) => c.instructorId === f.id)) },
    roomsForProgram(programId, classType) {
      return rooms.filter((r) => classType === 'laboratory'
        ? r.type === 'laboratory' && r.category === 'exclusive' && this.roomAllowedForProgram(r, programId)
        : r.type === 'classroom' && this.roomAllowedForProgram(r, programId))
    },

    // ---- conflicts (only Approved reservations block; pending never does)
    roomConflicts({ roomId, days, start, end, ignoreId }) {
      const out = []
      for (const a of this.assignments) {
        if (a.roomId !== roomId || a.id === ignoreId) continue
        const d = a.days.filter((x) => days.includes(x))
        if (d.length && overlaps(start, end, a.start, a.end)) {
          const cc = this.classCourses.find((c) => c.id === a.ccId)
          out.push(`${by.room(roomId).name} is occupied on ${d.map((x) => DAYS[x]).join(', ')} ${fmtTime(a.start)}–${fmtTime(a.end)} by ${by.course(cc.courseId).code} (${by.classSet(cc.classSetId).name}).`)
        }
      }
      for (const r of this.reservations) {
        if (r.status !== 'Approved' || r.roomId !== roomId || r.date < todayISO()) continue
        if (days.includes(dayIndexOf(r.date)) && overlaps(start, end, r.start, r.end))
          out.push(`${by.room(roomId).name} has an approved reservation on ${r.date} ${fmtTime(r.start)}–${fmtTime(r.end)} (${r.purpose}).`)
      }
      return out
    },
    personConflicts({ instructorId, classSetId, days, start, end, ignoreId }) {
      const out = []
      for (const a of this.assignments) {
        if (a.id === ignoreId) continue
        const cc = this.classCourses.find((c) => c.id === a.ccId)
        const d = a.days.filter((x) => days.includes(x))
        if (!d.length || !overlaps(start, end, a.start, a.end)) continue
        const when = `${d.map((x) => DAYS[x].slice(0, 3)).join('/')} ${fmtTime(a.start)}–${fmtTime(a.end)}`
        if (instructorId && cc.instructorId === instructorId) out.push(`${by.faculty(instructorId).name} already teaches ${by.course(cc.courseId).code} on ${when}.`)
        if (classSetId && cc.classSetId === classSetId) out.push(`${by.classSet(classSetId).name} already has ${by.course(cc.courseId).code} on ${when}.`)
      }
      return out
    },
    validateAssignment({ ccId, roomId, classType, days, start, end, ignoreId }) {
      const errs = [], cc = this.classCourses.find((c) => c.id === ccId), room = by.room(roomId)
      if (!room) return ['Select a room.']
      if (!cc) return ['Select a class.']
      if (!days.length) errs.push('Select at least one day.')
      if (!start || !end) errs.push('Set both a start time and an end time.')
      else if (toMin(end) <= toMin(start)) errs.push('End time must be later than the start time.')
      else if (toMin(start) < 6 * 60 || toMin(end) > 22 * 60) errs.push('Classes must be between 6:00 AM and 10:00 PM.')
      const programId = by.classSet(cc.classSetId)?.programId
      const allowed = this.roomsForProgram(programId, classType).some((r) => r.id === roomId)
      if (!allowed) errs.push(`${room.name} cannot be used for ${classType} classes by this program.`)
      if (errs.length) return errs
      return [...this.roomConflicts({ roomId, days, start, end, ignoreId }),
        ...this.personConflicts({ instructorId: cc.instructorId, classSetId: cc.classSetId, days, start, end, ignoreId })]
    },

    // ---- mutations
    addCourses(classSetId, courseIds) {
      let n = 0
      for (const courseId of courseIds) {
        if (this.classCourses.some((c) => c.classSetId === classSetId && c.courseId === courseId)) continue
        this.classCourses.push({ id: 'cc' + Date.now() + n, classSetId, courseId, instructorId: null, createdAt: new Date().toISOString() }); n++
      }
      this.save(); return n
    },
    removeClassCourse(ccId) {
      this.classCourses = this.classCourses.filter((c) => c.id !== ccId)
      this.assignments = this.assignments.filter((a) => a.ccId !== ccId); this.save()
    },
    assignInstructor(ccId, instructorId) {
      const cc = this.classCourses.find((c) => c.id === ccId)
      for (const a of this.ccAssignments(ccId)) {
        const e = this.personConflicts({ instructorId, days: a.days, start: a.start, end: a.end, ignoreId: a.id })
        if (e.length) return { ok: false, message: e[0] }
      }
      cc.instructorId = instructorId; this.save(); return { ok: true }
    },
    saveAssignment(p) {
      const errs = this.validateAssignment(p)
      if (errs.length) return { ok: false, errors: errs }
      this.assignments.push({ id: 'a' + Date.now(), ccId: p.ccId, roomId: p.roomId, classType: p.classType, days: [...p.days].sort(), start: p.start, end: p.end })
      this.save(); return { ok: true }
    },
    updateAssignment(id, p) {
      const assignment = this.assignments.find((a) => a.id === id)
      if (!assignment) return { ok: false, errors: ['This room assignment no longer exists.'] }
      const errs = this.validateAssignment({ ...p, ignoreId: id })
      if (errs.length) return { ok: false, errors: errs }
      Object.assign(assignment, { roomId: p.roomId, classType: p.classType, days: [...p.days].sort(), start: p.start, end: p.end })
      this.save(); return { ok: true, assignment }
    },
    removeAssignment(id) { this.assignments = this.assignments.filter((a) => a.id !== id); this.save() },

    // ---- notifications (in-app) and course selection
    notify(facultyId, text) { this.notifications.unshift({ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), facultyId, text, at: new Date().toISOString(), read: false }); this.save() },
    notificationsFor(id) { return this.notifications.filter((n) => n.facultyId === id) },
    markAllRead(id) { this.notifications.forEach((n) => { if (n.facultyId === id) n.read = true }); this.save() },
    selectedCourses(id) { return this.facultyCourses[id] || [] },
    saveCourseSelection(id, courseIds) {
      const selected = [...new Set(courseIds.filter((courseId) => courses.some((c) => c.id === courseId)))]
      this.facultyCourses[id] = selected; this.save(); return selected.length
    },

    // ---- reservations (only Approved ones block rooms)
    reservationConflicts({ roomId, date, start, end, ignoreId }) {
      const out = [], di = dayIndexOf(date)
      for (const a of this.assignments) {
        if (a.roomId !== roomId || !a.days.includes(di) || !overlaps(start, end, a.start, a.end)) continue
        const cc = this.classCourses.find((c) => c.id === a.ccId)
        out.push(`${by.room(roomId).name} has ${by.course(cc.courseId).code} (${by.classSet(cc.classSetId).name}) on ${DAYS[di]}s, ${fmtTime(a.start)}–${fmtTime(a.end)}.`)
      }
      for (const r of this.reservations) {
        if (r.status !== 'Approved' || r.id === ignoreId || r.roomId !== roomId || r.date !== date || !overlaps(start, end, r.start, r.end)) continue
        out.push(`${by.room(roomId).name} is already reserved ${fmtTime(r.start)}–${fmtTime(r.end)} (${r.purpose}).`)
      }
      return out
    },
    validateReservation({ instructorId, roomId, date, start, end, purpose, ignoreId }) {
      const e = []
      const room = by.room(roomId)
      if (!room || room.type !== 'classroom') e.push('Select a classroom.')
      else if (!this.roomAllowedForProgram(room, by.faculty(instructorId)?.programId))
        e.push(`${room.name} is not available to your program.`)
      if (!date) e.push('Choose a reservation date.')
      else if (date < todayISO()) e.push('The reservation date cannot be in the past.')
      else if (dayIndexOf(date) === 6) e.push('Reservations are not available on Sundays.')
      if (!start || !end) e.push('Set both a start time and an end time.')
      else if (toMin(end) <= toMin(start)) e.push('End time must be later than the start time.')
      else if (toMin(start) < 360 || toMin(end) > 1320) e.push('Reservations must be between 6:00 AM and 10:00 PM.')
      if ((purpose || '').trim().length < 5) e.push('Describe the purpose (at least 5 characters).')
      if (e.length) return e
      const out = this.reservationConflicts({ roomId, date, start, end, ignoreId })
      out.push(...this.personConflicts({ instructorId, days: [dayIndexOf(date)], start, end }).filter((m) => m.includes('already teaches')).map((m) => m.replace(/ already teaches/, ' has a class:')))
      for (const r of this.reservations) if (r.status === 'Approved' && r.id !== ignoreId && r.instructorId === instructorId && r.date === date && overlaps(start, end, r.start, r.end)) out.push('You already have an approved reservation at that time.')
      return out
    },
    deanFor(instructorId) { const inst = by.faculty(instructorId); return faculty.find((f) => f.role === 'dean' && f.instituteId === inst?.instituteId) || null },
    submitReservation(p) {
      const errors = this.validateReservation(p)
      if (errors.length) return { ok: false, errors }
      const dean = this.deanFor(p.instructorId) // requests always go to the instructor's own institute dean
      if (!dean) return { ok: false, errors: ['No dean is assigned to your institute yet.'] }
      const r = { id: 'res' + Date.now(), instructorId: p.instructorId, deanId: dean.id, roomId: p.roomId, date: p.date, start: p.start, end: p.end, purpose: p.purpose.trim(), submittedAt: new Date().toISOString(), status: 'Pending', reason: '' }
      this.reservations.push(r)
      if (dean.id !== p.instructorId) this.notify(dean.id, `${by.faculty(p.instructorId).name} requested ${by.room(p.roomId).name}.`)
      this.save(); return { ok: true, reservation: r }
    },
    approveReservation(id) {
      const r = this.reservations.find((x) => x.id === id)
      if (!r || r.status !== 'Pending') return { ok: false, message: 'This request has already been decided.' }
      const c = this.reservationConflicts({ roomId: r.roomId, date: r.date, start: r.start, end: r.end, ignoreId: r.id })
      if (c.length) return { ok: false, message: 'Cannot approve: ' + c[0] }
      r.status = 'Approved'; r.decidedAt = new Date().toISOString()
      this.notify(r.instructorId, `Your reservation for ${by.room(r.roomId).name} was approved.`)
      this.save(); return { ok: true, reservation: r }
    },
    rejectReservation(id, reason) {
      const r = this.reservations.find((x) => x.id === id)
      if (!r || r.status !== 'Pending') return { ok: false, message: 'This request has already been decided.' }
      if ((reason || '').trim().length < 3) return { ok: false, message: 'Please give a rejection reason.' }
      r.status = 'Rejected'; r.reason = reason.trim(); r.decidedAt = new Date().toISOString()
      this.notify(r.instructorId, `Your reservation for ${by.room(r.roomId).name} was rejected.`)
      this.save(); return { ok: true, reservation: r }
    },
    // ---- cancellation: pending requests are cancelled directly; approved ones need the dean to confirm
    cancelReservation(id, instructorId) {
      const r = this.reservations.find((x) => x.id === id)
      if (!r || r.instructorId !== instructorId) return { ok: false, message: 'You can only cancel your own requests.' }
      if (r.status !== 'Pending') return { ok: false, message: 'Only pending requests can be cancelled directly.' }
      r.status = 'Cancelled'; r.decidedAt = new Date().toISOString()
      if (r.deanId !== r.instructorId) this.notify(r.deanId, `${by.faculty(r.instructorId).name} cancelled the request for ${by.room(r.roomId).name}.`)
      this.save(); return { ok: true, reservation: r }
    },
    requestCancellation(id, instructorId, reason) {
      const r = this.reservations.find((x) => x.id === id)
      if (!r || r.instructorId !== instructorId) return { ok: false, message: 'You can only cancel your own reservations.' }
      if (r.status !== 'Approved') return { ok: false, message: 'Only approved reservations need a cancellation request.' }
      if (r.date < todayISO()) return { ok: false, message: 'Past reservations cannot be cancelled.' }
      if (r.cancelRequest?.status === 'Pending') return { ok: false, message: 'A cancellation request is already waiting for the Dean.' }
      if ((reason || '').trim().length < 5) return { ok: false, message: 'Give a short reason (at least 5 characters).' }
      r.cancelRequest = { status: 'Pending', reason: reason.trim(), requestedAt: new Date().toISOString() }
      this.notify(r.deanId, `${by.faculty(r.instructorId).name} asked to cancel the approved reservation of ${by.room(r.roomId).name} on ${r.date}.`)
      this.save(); return { ok: true, reservation: r }
    },
    approveCancellation(id) {
      const r = this.reservations.find((x) => x.id === id)
      if (!r || r.cancelRequest?.status !== 'Pending') return { ok: false, message: 'There is no pending cancellation request.' }
      r.status = 'Cancelled'; r.cancelRequest.status = 'Approved'; r.cancelRequest.decidedAt = new Date().toISOString() // Cancelled never blocks a room
      this.notify(r.instructorId, `Your cancellation of ${by.room(r.roomId).name} on ${r.date} was approved.`)
      this.save(); return { ok: true, reservation: r }
    },
    declineCancellation(id, reason) {
      const r = this.reservations.find((x) => x.id === id)
      if (!r || r.cancelRequest?.status !== 'Pending') return { ok: false, message: 'There is no pending cancellation request.' }
      if ((reason || '').trim().length < 3) return { ok: false, message: 'Please give a reason for declining.' }
      r.cancelRequest.status = 'Declined'; r.cancelRequest.declineReason = reason.trim(); r.cancelRequest.decidedAt = new Date().toISOString()
      this.notify(r.instructorId, `Your cancellation request for ${by.room(r.roomId).name} on ${r.date} was declined. The reservation stays active.`)
      this.save(); return { ok: true, reservation: r }
    },
    logEmail(r, mail, kind = 'approved') { this.emails.push({ id: 'em' + Date.now() + Math.random().toString(36).slice(2, 5), resId: r.id, kind, to: mail.to, subject: mail.subject, sentAt: new Date().toISOString() }); this.save() },
    reservationsForDean(deanId) { return this.reservations.filter((r) => r.deanId === deanId) },
    reservationsForInstitute(instituteId) { return this.reservations.filter((r) => by.faculty(r.instructorId)?.instituteId === instituteId) },
    inUseNow(roomId) {
      const d = new Date(), t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, today = todayISO()
      return this.eventsForRoom(roomId, today, today).some((e) => e.start <= t && t < e.end)
    },

    // ---- timetable events. `col` is the timetable column key (ISO date, or a day name for class sets)
    classEvent(a, col, color) {
      const cc = this.classCourses.find((c) => c.id === a.ccId), course = by.course(cc.courseId), set = by.classSet(cc.classSetId)
      const inst = cc.instructorId ? by.faculty(cc.instructorId).name : 'No instructor yet', room = by.room(a.roomId)
      return { id: `${a.id}-${col}`, col, start: a.start, end: a.end, kind: 'class', color: color || (a.classType === 'laboratory' ? 'sky' : 'emerald'),
        title: course.code, lines: [set.name, inst, room.name],
        meta: { type: 'Class', course: course.code, courseTitle: course.title, classSet: set.name, instructor: inst, room: room.name, classType: a.classType, days: a.days } }
    },
    resEvent(r, col) {
      const room = by.room(r.roomId), inst = by.faculty(r.instructorId).name
      return { id: `${r.id}-${col}`, col, start: r.start, end: r.end, kind: 'reservation', color: 'amber', title: 'Reservation', lines: [r.purpose, inst, room.name],
        meta: { type: 'Reservation', course: '—', courseTitle: r.purpose, classSet: '—', instructor: inst, room: room.name, classType: 'reservation' } }
    },
    eventsForRoom(roomId, from, to) {
      const out = []
      for (const d of visibleDays(from, to)) {
        for (const a of this.assignments) if (a.roomId === roomId && a.days.includes(dayIndexOf(d))) out.push(this.classEvent(a, d))
        for (const r of this.reservations) if (r.status === 'Approved' && r.roomId === roomId && r.date === d) out.push(this.resEvent(r, d))
      }
      return out
    },
    eventsForInstructor(id, from, to) {
      const out = []
      for (const d of visibleDays(from, to)) {
        for (const a of this.assignments) {
          const cc = this.classCourses.find((c) => c.id === a.ccId)
          if (cc.instructorId === id && a.days.includes(dayIndexOf(d))) out.push(this.classEvent(a, d))
        }
        for (const r of this.reservations) if (r.status === 'Approved' && r.instructorId === id && r.date === d) out.push(this.resEvent(r, d))
      }
      return out
    },
    eventsForClassSet(setId) {
      const out = []
      for (const a of this.assignments) {
        const cc = this.classCourses.find((c) => c.id === a.ccId)
        if (cc.classSetId !== setId) continue
        const color = PALETTE[Math.max(0, this.classCourses.filter((c) => c.classSetId === setId).findIndex((c) => c.id === cc.id)) % PALETTE.length]
        for (const d of a.days) out.push(this.classEvent(a, DAYS[d], color))
      }
      return out
    },
  },
})
