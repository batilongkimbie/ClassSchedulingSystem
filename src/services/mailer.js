// MOCK email service. Replace the body with a real backend call, e.g.
//   const res = await fetch(`/api/reservations/${id}/approve`, { method: 'POST' })
// The frontend flow (approve -> send email -> show result) stays the same.
import { fmtDate, fmtTime } from '../utils/time'
export async function sendReservationApprovedEmail({ to, instructor, room, date, start, end, purpose }) {
  await new Promise((r) => setTimeout(r, 700)) // simulated network latency
  return { ok: true, to, subject: `Reservation approved: ${room} on ${fmtDate(date)}`,
    body: `Hello ${instructor}, your reservation of ${room} on ${fmtDate(date, true)}, ${fmtTime(start)} – ${fmtTime(end)} for "${purpose}" has been approved.` }
}

export async function sendCancellationRequestEmail({ to, dean, instructor, room, date, start, end, reason }) {
  await new Promise((r) => setTimeout(r, 600))
  return { ok: true, to, subject: `Cancellation requested: ${room} on ${fmtDate(date)}`,
    body: `Dear ${dean}, ${instructor} asks to cancel the approved reservation of ${room} on ${fmtDate(date, true)}, ${fmtTime(start)} – ${fmtTime(end)}. Reason: ${reason}` }
}
export async function sendCancellationApprovedEmail({ to, instructor, room, date }) {
  await new Promise((r) => setTimeout(r, 600))
  return { ok: true, to, subject: `Cancellation approved: ${room} on ${fmtDate(date)}`,
    body: `Hello ${instructor}, your cancellation of ${room} on ${fmtDate(date, true)} has been approved. The room is free again.` }
}
