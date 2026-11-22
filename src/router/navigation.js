// Single source of truth for sidebar links AND routes. Later stages swap the placeholder for real pages.
export const navByRole = {
  chairperson: [
    { path: 'dashboard', label: 'Dashboard', icon: 'home' },
    { path: 'create-schedule', label: 'Create Schedule', icon: 'plus' },
    { path: 'room-timetables', label: 'Room Timetables', icon: 'building' },
    { path: 'instructor-timetables', label: 'Instructor Timetables', icon: 'users' },
  ],
  dean: [
    { path: 'dashboard', label: 'Dashboard', icon: 'home' },
    { path: 'room-timetables', label: 'Room Timetables', icon: 'building' },
    { path: 'instructor-timetables', label: 'Instructor Timetables', icon: 'users' },
    { path: 'reservation-requests', label: 'Reservation Requests', icon: 'inbox' },
  ],
  instructor: [
    { path: 'dashboard', label: 'Dashboard', icon: 'home' },
    { path: 'my-courses', label: 'My Courses', icon: 'book' },
    { path: 'room-timetables', label: 'Room Timetables', icon: 'building' },
    { path: 'my-timetable', label: 'My Timetable', icon: 'calendar' },
    { path: 'my-reservations', label: 'My Reservations', icon: 'clock' },
  ],
}
export const rolePrefix = { chairperson: 'chair', dean: 'dean', instructor: 'instructor' }
