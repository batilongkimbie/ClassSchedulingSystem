import { dayOffset, dayIndexOf, overlaps } from '../utils/time'
// Central mock data. Replace with API calls once the backend exists.
export const institutes = [
  { id: 'ic', name: 'Institute of Computing' },
  { id: 'iaas', name: 'Institute of Aquatic and Applied Sciences' },
  { id: 'ited', name: 'Institute of Teacher Education' },
  { id: 'ibpa', name: 'Institute of Business and Public Affairs' },
]
export const programs = [
  { id: 'bsit', name: 'BS Information Technology', instituteId: 'ic' },
  { id: 'bsis', name: 'BS Information Systems', instituteId: 'ic' },
  { id: 'bsaf', name: 'BS Agro-Forestry', instituteId: 'iaas' },
  { id: 'bsfas', name: 'BS Fisheries and Aquatic Sciences', instituteId: 'iaas' },
  { id: 'bsft', name: 'BS Food Technology', instituteId: 'iaas' },
  { id: 'bsmb', name: 'BS Marine Biology', instituteId: 'iaas' },
  { id: 'bpa', name: 'Bachelor of Public Administration', instituteId: 'ibpa' },
  { id: 'bscrim', name: 'BS Criminology', instituteId: 'ibpa' },
  { id: 'bsdrm', name: 'BS Disaster Resilience and Management', instituteId: 'ibpa' },
  { id: 'bse', name: 'BS Entrepreneurship', instituteId: 'ibpa' },
  { id: 'bssw', name: 'BS Social Work', instituteId: 'ibpa' },
  { id: 'bstm', name: 'BS Tourism Management', instituteId: 'ibpa' },
  { id: 'bacomm', name: 'BA Communication', instituteId: 'ited' },
  { id: 'bsedm', name: 'Bachelor of Secondary Education - Mathematics', instituteId: 'ited' },
  { id: 'bsede', name: 'Bachelor of Secondary Education - English', instituteId: 'ited' },
  { id: 'bseds', name: 'Bachelor of Secondary Education - Science', instituteId: 'ited' },
  { id: 'btled', name: 'Bachelor of Technology and Livelihood Education', instituteId: 'ited' },
  { id: 'bped', name: 'Bachelor of Physical Education', instituteId: 'ited' },
]
// Faculty records: sign-up is only allowed for people listed here. Role/program come from here.
const base = [
  { id: 'f1', name: 'Reban Cliff Fajardo', email: 'chair@dnsc.edu.ph', role: 'chairperson', programId: 'bsit', instituteId: 'ic' },
  { id: 'f2', name: 'Mark Van Buladaco', email: 'dean@dnsc.edu.ph', role: 'dean', programId: 'bsit',   instituteId: 'ic' },
  { id: 'f3', name: 'Angelique Barnuevo', email: 'instructor@dnsc.edu.ph', role: 'instructor', programId: 'bsit', instituteId: 'ic' },
  { id: 'f4', name: 'Joshua Michael Ascano', email: 'joshua.ascano@dnsc.edu.ph', role: 'instructor', programId: null, instituteId: 'ic' },
  { id: 'f5', name: 'Ian Val Delos Reyes', email: 'ian.d@dnsc.edu.ph', role: 'instructor', programId: 'bsit', instituteId: 'ic' },
  { id: 'f6', name: 'Christopher Anana', email: 'christopher.a@dnsc.edu.ph', role: 'instructor', programId: 'bsit', instituteId: 'ic' },
  { id: 'f7', name: 'Jay Jr. Gulanes', email: 'gulanes.j@dnsc.edu.ph', role: 'instructor', programId: 'bsit', instituteId: 'ic' },
  { id: 'f8', name: 'Roanne Mae Anunciado', email: 'roanne.a@dnsc.edu.ph', role: 'instructor', programId: 'bsit',   instituteId: 'ic' },
  { id: 'f9', name: 'Jane Doe', email: 'jane.doe@dnsc.edu.ph', role: 'instructor', programId: 'bsit',   instituteId: 'ic' },
  { id: 'f10', name: 'John Doe', email: 'john.doe@dnsc.edu.ph', role: 'instructor', programId: 'bsit',   instituteId: 'ic' },
  { id: 'f11', name: 'Ramon Torres', email: 'ramon.t@dnsc.edu.ph', role: 'dean', programId: 'bsmb',   instituteId: 'iaas' },
]
// A chairperson or dean also teaches, so they get the instructor role too (one account, switchable view)
export const faculty = base.map((f) => ({ ...f, roles: f.role === 'chairperson' || f.role === 'dean' ? [f.role, 'instructor'] : [f.role] }))
// Mock accounts for all verified faculty records; the shared demo password is password123.
export const seedUsers = [
  { id: 'u1', facultyId: 'f1', email: 'chair@dnsc.edu.ph', password: 'password123' },
  { id: 'u2', facultyId: 'f2', email: 'dean@dnsc.edu.ph', password: 'password123' },
  { id: 'u3', facultyId: 'f3', email: 'instructor@dnsc.edu.ph', password: 'password123' },
  { id: 'u4', facultyId: 'f4', email: 'joshua.ascano@dnsc.edu.ph', password: 'password123' },
  { id: 'u5', facultyId: 'f5', email: 'ian.d@dnsc.edu.ph', password: 'password123' },
  { id: 'u6', facultyId: 'f6', email: 'christopher.a@dnsc.edu.ph', password: 'password123' },
  { id: 'u7', facultyId: 'f7', email: 'gulanes.j@dnsc.edu.ph', password: 'password123' },
  { id: 'u8', facultyId: 'f8', email: 'roanne.a@dnsc.edu.ph', password: 'password123' },
  { id: 'u9', facultyId: 'f9', email: 'jane.doe@dnsc.edu.ph', password: 'password123' },
  { id: 'u10', facultyId: 'f10', email: 'john.doe@dnsc.edu.ph', password: 'password123' },
  { id: 'u11', facultyId: 'f11', email: 'ramon.t@dnsc.edu.ph', password: 'password123' },
]
export const courses = [
  { id: 'c1', code: 'IT 312', title: 'Integrative Programming and Technologies 1', units: 3, programId: 'bsit', year: 3 },
  { id: 'c2', code: 'IT 311', title: 'Networking 2', units: 3, programId: 'bsit', year: 3 },
  { id: 'c3', code: 'GEELECT 3', title: 'Philippine Popular Culture', units: 3, programId: null, year: 3 },
  { id: 'c4', code: 'ITSPEC 2', title: 'Project Management', units: 3, programId: 'bsit', year: 3 },
  { id: 'c5', code: 'MS 221', title: 'Quantitative Methods', units: 3, programId: 'bsit', year: 3 },
  { id: 'c6', code: 'ITELEC 4', title: 'Platform Technology', units: 3, programId: 'bsit', year: 3 },
  { id: 'c7', code: 'IT 311', title: 'Systems Analysis and Design', units: 3, programId: 'bsit', year: 1 },
  { id: 'c8', code: 'IT 101', title: 'Introduction to Computing', units: 3, programId: 'bsit', year: 1 },
  { id: 'c9', code: 'IT 211', title: 'Object-Oriented Programming 1', units: 3, programId: 'bsit', year: 1 },
  { id: 'c10', code: 'IT 212', title: 'Object-Oriented Programming 2', units: 3, programId: 'bsit', year: 2 },
  { id: 'c11', code: 'MS 122', title: 'Discrete Mathematics', units: 3, programId: 'bsit', year: 2 },
  { id: 'c12', code: 'IT 221', title: 'Data Structures and Algorithms', units: 3, programId: 'bsit', year: 2 },
]
export const classSets = [
  { id: 's1', name: 'BSIT 1-A', programId: 'bsit', year: 1, size: 35 },
  { id: 's2', name: 'BSIT 2-A', programId: 'bsit', year: 2, size: 38 },
  { id: 's3', name: 'BSIT 2-B', programId: 'bsit', year: 2, size: 32 },
  { id: 's4', name: 'BSIT 3-A', programId: 'bsit', year: 3, size: 30 },
  { id: 's5', name: 'BSIT 3-B', programId: 'bsit', year: 3, size: 30 },
  { id: 's6', name: 'BSIT 3-C', programId: 'bsit', year: 3, size: 30 },
  { id: 's7', name: 'BSIS 2-A', programId: 'bsis', year: 2, size: 28 },
]
// type: classroom | laboratory ; category: exclusive (has programId) | public
export const rooms = [
  { id: 'r1', name: 'AES', type: 'classroom', category: 'exclusive', programId: 'bsit', capacity: 40 },
  { id: 'r2', name: 'Networking Lab', type: 'classroom', category: 'exclusive', programId: 'bsit', capacity: 36 },
  { id: 'r3', name: 'Comlab 1', type: 'laboratory', category: 'exclusive', programId: 'bsit', capacity: 35 },
  { id: 'r4', name: 'Comlab 2', type: 'laboratory', category: 'exclusive', programId: 'bsit', capacity: 30 },
  { id: 'r5', name: 'Mac Lab', type: 'laboratory', category: 'exclusive', programId: 'bsit', capacity: 32 },
  { id: 'r6', name: 'AB 3-1', type: 'classroom', category: 'exclusive', programId: 'bsis', capacity: 45 },
  { id: 'r7', name: 'AB 3-2', type: 'laboratory', category: 'exclusive', programId: 'bsis', capacity: 30 },
  { id: 'r8', name: 'AB 3-3', type: 'classroom', category: 'public', programId: null, capacity: 50 },
  { id: 'r9', name: 'AB 3-4', type: 'classroom', category: 'public', programId: null, capacity: 45 },
  { id: 'r10', name: 'AB 3-5', type: 'classroom', category: 'public', programId: null, capacity: 60 },
  { id: 'r11', name: 'AB 3-6', type: 'classroom', category: 'public', programId: null, capacity: 40 },
  { id: 'r12', name: 'AB 3-7', type: 'classroom', category: 'public', programId: null, capacity: 120 },
]
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()
// A class set taking a course; instructor optional until assigned
export const classCourses = [
  { id: 'cc1', classSetId: 's5', courseId: 'c1', instructorId: 'f5', createdAt: ago(30) },
  { id: 'cc2', classSetId: 's5', courseId: 'c2', instructorId: 'f3', createdAt: ago(29) },
  { id: 'cc3', classSetId: 's5', courseId: 'c3', instructorId: 'f4', createdAt: ago(8) },
  { id: 'cc4', classSetId: 's5', courseId: 'c4', instructorId: 'f7', createdAt: ago(7) },
  { id: 'cc5', classSetId: 's5', courseId: 'c5', instructorId: 'f8', createdAt: ago(9) },
  { id: 'cc6', classSetId: 's5', courseId: 'c6', instructorId: 'f6', createdAt: ago(20) },
  { id: 'cc7', classSetId: 's1', courseId: 'c7', instructorId: 'f9', createdAt: ago(40) },
  { id: 'cc8', classSetId: 's2', courseId: 'c10', instructorId: 'f1', createdAt: ago(50) },
  { id: 'cc9', classSetId: 's3', courseId: 'c12', instructorId: 'f3', createdAt: ago(3) },
]
// Room assignments: days are 0=Mon..5=Sat
export const assignments = [
  { id: 'a1', ccId: 'cc2', roomId: 'r2', classType: 'discussion', days: [0, 3], start: '18:00', end: '19:30' },
  { id: 'a2', ccId: 'cc3', roomId: 'r12', classType: 'discussion', days: [1, 3], start: '13:00', end: '14:30' },
  { id: 'a3', ccId: 'cc4', roomId: 'r11', classType: 'discussion', days: [2], start: '10:00', end: '10:30' },
  { id: 'a4', ccId: 'cc5', roomId: 'r12', classType: 'discussion', days: [2], start: '13:00', end: '14:30' },
  { id: 'a5', ccId: 'cc1', roomId: 'r1', classType: 'discussion', days: [2], start: '15:30', end: '16:30' },
  { id: 'a6', ccId: 'cc1', roomId: 'r3', classType: 'laboratory', days: [2], start: '16:30', end: '18:00' },
  { id: 'a7', ccId: 'cc6', roomId: 'r1', classType: 'discussion', days: [2, 4], start: '18:30', end: '19:30' },
  { id: 'a8', ccId: 'cc6', roomId: 'r4', classType: 'laboratory', days: [2, 4], start: '19:30', end: '21:00' },
]
const nextAvailableRoomDate = (roomId, start, end) => {
  for (let offset = 1; offset <= 14; offset++) {
    const date = dayOffset(offset), day = dayIndexOf(date)
    if (!assignments.some((a) => a.roomId === roomId && a.days.includes(day) && overlaps(start, end, a.start, a.end))) return date
  }
  throw new Error(`No available date found for the ${roomId} demo reservation.`)
}
// Only Approved reservations block rooms. Dates are relative to today for a live demo.
export const reservations = [
  { id: 'res1', instructorId: 'f3', deanId: 'f2', roomId: 'r10', date: dayOffset(-3), start: '15:00', end: '17:00', purpose: 'Thesis consultation seminar', submittedAt: ago(200), status: 'Approved', reason: '' },
  { id: 'res2', instructorId: 'f5', deanId: 'f2', roomId: 'r10', date: dayOffset(2), start: '15:00', end: '17:00', purpose: 'Capstone proposal defense', submittedAt: ago(60), status: 'Approved', reason: '' },
  { id: 'res3', instructorId: 'f5', deanId: 'f2', roomId: 'r12', date: dayOffset(4), start: '09:00', end: '11:00', purpose: 'Guest lecture on cloud computing', submittedAt: ago(10), status: 'Pending', reason: '' },
  { id: 'res4', instructorId: 'f6', deanId: 'f2', roomId: 'r11', date: dayOffset(5), start: '13:00', end: '15:00', purpose: 'Make-up class', submittedAt: ago(5), status: 'Pending', reason: '' },
  { id: 'res5', instructorId: 'f7', deanId: 'f2', roomId: 'r9', date: dayOffset(3), start: '08:00', end: '10:00', purpose: 'Group quiz', submittedAt: ago(100), status: 'Rejected', reason: 'Room is reserved for a faculty meeting.' },
  { id: 'res7', instructorId: 'f5', deanId: 'f2', roomId: 'r12', date: nextAvailableRoomDate('r12', '13:00', '15:00'), start: '13:00', end: '15:00', purpose: 'Department planning workshop', submittedAt: ago(70), status: 'Approved', reason: '',
    cancelRequest: { status: 'Pending', reason: 'The workshop was moved to next month.', requestedAt: ago(2) } },
  { id: 'res6', instructorId: 'f8', deanId: 'f9', roomId: 'r8', date: dayOffset(2), start: '10:00', end: '12:00', purpose: 'Engineering orientation', submittedAt: ago(4), status: 'Pending', reason: '' },
]

// Example My Courses selections matching the instructors on the seeded class schedules.
export const facultyCourses = {
  f1: ['c10'],
  f2: ['c12'],
  f3: ['c2', 'c12'],
  f4: ['c3'],
  f5: ['c1'],
  f6: ['c6'],
  f7: ['c4'],
  f8: ['c5'],
  f9: ['c7'],
  f10: ['c11'],
  f11: ['c9'],
}
export const notifications = [
  { id: 'n1', facultyId: 'f2', text: 'Carla Mendoza requested the Audio-Visual Room.', at: ago(10), read: false },
  { id: 'n2', facultyId: 'f2', text: 'Mark Villanueva requested Room 305.', at: ago(5), read: false },
  { id: 'n4', facultyId: 'f2', text: 'Carla Mendoza asked to cancel her approved reservation of the Audio-Visual Room.', at: ago(2), read: false },
  { id: 'n3', facultyId: 'f3', text: 'Your reservation for Room 103 was approved.', at: ago(190), read: true },
]
export const by = {
  course: (id) => courses.find((x) => x.id === id), room: (id) => rooms.find((x) => x.id === id),
  classSet: (id) => classSets.find((x) => x.id === id), faculty: (id) => faculty.find((x) => x.id === id),
}
