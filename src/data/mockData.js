import { dayOffset } from '../utils/time'
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
]
// Faculty records: sign-up is only allowed for people listed here. Role/program come from here.
const base = [
  { id: 'f1', name: 'Maria Santos',       email: 'chair@dnsc.edu.ph',      role: 'chairperson', programId: 'bsit', instituteId: 'ic' },
  { id: 'f2', name: 'Roberto Cruz',       email: 'dean@dnsc.edu.ph',       role: 'dean',        programId: null,   instituteId: 'ic' },
  { id: 'f3', name: 'Ana Reyes',          email: 'instructor@dnsc.edu.ph', role: 'instructor',  programId: 'bsit', instituteId: 'ic' },
  { id: 'f4', name: 'Jose Lim',           email: 'jose.lim@dnsc.edu.ph',   role: 'instructor',  programId: 'bscs', instituteId: 'ic' },
  { id: 'f5', name: 'Carla Mendoza',      email: 'carla.m@dnsc.edu.ph',    role: 'instructor',  programId: 'bsit', instituteId: 'ic' },
  { id: 'f6', name: 'Mark Villanueva',    email: 'mark.v@dnsc.edu.ph',     role: 'instructor',  programId: 'bsit', instituteId: 'ic' },
  { id: 'f7', name: 'Liza Ramos',         email: 'liza.r@dnsc.edu.ph',     role: 'instructor',  programId: 'bsit', instituteId: 'ic' },
  { id: 'f8', name: 'Paolo Dizon',        email: 'paolo.d@dnsc.edu.ph',    role: 'instructor',  programId: null,   instituteId: 'iaas' },
  { id: 'f9', name: 'Ramon Torres',       email: 'ramon.t@dnsc.edu.ph',    role: 'dean',        programId: null,   instituteId: 'iaas' },
]
// A chairperson or dean also teaches, so they get the instructor role too (one account, switchable view)
export const faculty = base.map((f) => ({ ...f, roles: f.role === 'chairperson' || f.role === 'dean' ? [f.role, 'instructor'] : [f.role] }))
export const seedUsers = [
  { id: 'u1', facultyId: 'f1', email: 'chair@dnsc.edu.ph',      password: 'password123' },
  { id: 'u2', facultyId: 'f2', email: 'dean@dnsc.edu.ph',       password: 'password123' },
  { id: 'u3', facultyId: 'f3', email: 'instructor@dnsc.edu.ph', password: 'password123' },
]
export const courses = [
  { id: 'c1', code: 'ITC 312', title: 'Integrative Programming and Technologies 1', units: 3, programId: 'bsit', year: 3 },
  { id: 'c2', code: 'IT 311', title: 'Networking 2', units: 3, programId: 'bsit', year: 3 },
  { id: 'c3', code: 'GEELECT 3', title: 'Philippine Popular Culture', units: 3, programId: null, year: 3 },
  { id: 'c4', code: 'IT 221', title: 'Database Management Systems', units: 3, programId: 'bsit', year: 2 },
  { id: 'c5', code: 'IT 231', title: 'Networking 1', units: 3, programId: 'bsit', year: 2 },
  { id: 'c6', code: 'IT 241', title: 'Object-Oriented Programming', units: 3, programId: 'bsit', year: 2 },
  { id: 'c7', code: 'IT 311', title: 'Systems Analysis and Design', units: 3, programId: 'bsit', year: 3 },
  { id: 'c8', code: 'IT 321', title: 'Information Assurance and Security', units: 3, programId: 'bsit', year: 3 },
  { id: 'c9', code: 'CS 211', title: 'Discrete Structures', units: 3, programId: 'bscs', year: 2 },
  { id: 'c10', code: 'CS 221', title: 'Design and Analysis of Algorithms', units: 3, programId: 'bscs', year: 2 },
]
// Which instructors are qualified to teach which course
export const qualifications = {
  c1: ['f3', 'f5', 'f1'], c2: ['f3', 'f6'], c3: ['f5', 'f6', 'f7'], c4: ['f3', 'f7'], c5: ['f6', 'f1'],
  c6: ['f3', 'f5'], c7: ['f7', 'f1'], c8: ['f6', 'f7'], c9: ['f4'], c10: ['f4'],
}
export const classSets = [
  { id: 's1', name: 'BSIT 1-A', programId: 'bsit', year: 1, size: 35 },
  { id: 's2', name: 'BSIT 2-A', programId: 'bsit', year: 2, size: 38 },
  { id: 's3', name: 'BSIT 2-B', programId: 'bsit', year: 2, size: 32 },
  { id: 's4', name: 'BSIT 3-A', programId: 'bsit', year: 3, size: 30 },
  { id: 's5', name: 'BSCS 2-A', programId: 'bscs', year: 2, size: 28 },
]
// type: classroom | laboratory ; category: exclusive (has programId) | public
export const rooms = [
  { id: 'r1', name: 'IT Room 201', type: 'classroom', category: 'exclusive', programId: 'bsit', capacity: 40 },
  { id: 'r2', name: 'IT Room 202', type: 'classroom', category: 'exclusive', programId: 'bsit', capacity: 36 },
  { id: 'r3', name: 'IT Lab 1', type: 'laboratory', category: 'exclusive', programId: 'bsit', capacity: 35 },
  { id: 'r4', name: 'IT Lab 2', type: 'laboratory', category: 'exclusive', programId: 'bsit', capacity: 30 },
  { id: 'r5', name: 'IT Lab 3', type: 'laboratory', category: 'exclusive', programId: 'bsit', capacity: 32 },
  { id: 'r6', name: 'CS Room 101', type: 'classroom', category: 'exclusive', programId: 'bscs', capacity: 45 },
  { id: 'r7', name: 'CS Lab 1', type: 'laboratory', category: 'exclusive', programId: 'bscs', capacity: 30 },
  { id: 'r8', name: 'Room 101', type: 'classroom', category: 'public', programId: null, capacity: 50 },
  { id: 'r9', name: 'Room 102', type: 'classroom', category: 'public', programId: null, capacity: 45 },
  { id: 'r10', name: 'Room 103', type: 'classroom', category: 'public', programId: null, capacity: 60 },
  { id: 'r11', name: 'Room 305', type: 'classroom', category: 'public', programId: null, capacity: 40 },
  { id: 'r12', name: 'Audio-Visual Room', type: 'classroom', category: 'public', programId: null, capacity: 120 },
]
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()
// A class set taking a course; instructor optional until assigned
export const classCourses = [
  { id: 'cc1', classSetId: 's2', courseId: 'c2', instructorId: 'f3', createdAt: ago(30) },
  { id: 'cc2', classSetId: 's2', courseId: 'c3', instructorId: 'f5', createdAt: ago(29) },
  { id: 'cc3', classSetId: 's3', courseId: 'c4', instructorId: 'f7', createdAt: ago(8) },
  { id: 'cc4', classSetId: 's3', courseId: 'c6', instructorId: null, createdAt: ago(7) },
  { id: 'cc5', classSetId: 's4', courseId: 'c7', instructorId: 'f1', createdAt: ago(20) },
  { id: 'cc6', classSetId: 's1', courseId: 'c1', instructorId: 'f3', createdAt: ago(40) },
  { id: 'cc7', classSetId: 's5', courseId: 'c9', instructorId: 'f4', createdAt: ago(50) },
  { id: 'cc8', classSetId: 's4', courseId: 'c8', instructorId: 'f6', createdAt: ago(3) },
]
// Room assignments: days are 0=Mon..5=Sat
export const assignments = [
  { id: 'a1', ccId: 'cc1', roomId: 'r1', classType: 'discussion', days: [0, 2], start: '08:00', end: '09:30' },
  { id: 'a2', ccId: 'cc1', roomId: 'r3', classType: 'laboratory', days: [4], start: '08:00', end: '11:00' },
  { id: 'a3', ccId: 'cc2', roomId: 'r9', classType: 'discussion', days: [1, 3], start: '09:00', end: '10:30' },
  { id: 'a4', ccId: 'cc5', roomId: 'r10', classType: 'discussion', days: [1, 3], start: '13:00', end: '14:30' },
  { id: 'a5', ccId: 'cc6', roomId: 'r1', classType: 'discussion', days: [0, 2], start: '10:00', end: '11:30' },
  { id: 'a6', ccId: 'cc7', roomId: 'r6', classType: 'discussion', days: [0, 2, 4], start: '13:00', end: '14:00' },
]
// Only Approved reservations block rooms. Dates are relative to today for a live demo.
export const reservations = [
  { id: 'res1', instructorId: 'f3', deanId: 'f2', roomId: 'r10', date: dayOffset(-3), start: '15:00', end: '17:00', purpose: 'Thesis consultation seminar', submittedAt: ago(200), status: 'Approved', reason: '' },
  { id: 'res2', instructorId: 'f5', deanId: 'f2', roomId: 'r10', date: dayOffset(2), start: '15:00', end: '17:00', purpose: 'Capstone proposal defense', submittedAt: ago(60), status: 'Approved', reason: '' },
  { id: 'res3', instructorId: 'f5', deanId: 'f2', roomId: 'r12', date: dayOffset(4), start: '09:00', end: '11:00', purpose: 'Guest lecture on cloud computing', submittedAt: ago(10), status: 'Pending', reason: '' },
  { id: 'res4', instructorId: 'f6', deanId: 'f2', roomId: 'r11', date: dayOffset(5), start: '13:00', end: '15:00', purpose: 'Make-up class', submittedAt: ago(5), status: 'Pending', reason: '' },
  { id: 'res5', instructorId: 'f7', deanId: 'f2', roomId: 'r9', date: dayOffset(3), start: '08:00', end: '10:00', purpose: 'Group quiz', submittedAt: ago(100), status: 'Rejected', reason: 'Room is reserved for a faculty meeting.' },
  { id: 'res7', instructorId: 'f5', deanId: 'f2', roomId: 'r12', date: dayOffset(6), start: '13:00', end: '15:00', purpose: 'Department planning workshop', submittedAt: ago(70), status: 'Approved', reason: '',
    cancelRequest: { status: 'Pending', reason: 'The workshop was moved to next month.', requestedAt: ago(2) } },
  { id: 'res6', instructorId: 'f8', deanId: 'f9', roomId: 'r8', date: dayOffset(2), start: '10:00', end: '12:00', purpose: 'Engineering orientation', submittedAt: ago(4), status: 'Pending', reason: '' },
]

// Courses each instructor has chosen on My Courses (empty until they save a selection)
export const facultyCourses = { f3: [], f5: [], f6: [], f7: [], f4: [], f1: [] }
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
