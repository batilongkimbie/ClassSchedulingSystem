import { dayOffset, dayIndexOf, overlaps } from '../utils/time'

export const institutes = [
  { id: 'ic',   name: 'Institute of Computing' },
  { id: 'iaas', name: 'Institute of Aquatic and Applied Sciences' },
  { id: 'ited', name: 'Institute of Teacher Education' },
  { id: 'ibpa', name: 'Institute of Business and Public Affairs' },
]
export const programs = [
  { id: 'bsit',   name: 'BS Information Technology',                       instituteId: 'ic' },
  { id: 'bsis',   name: 'BS Information Systems',                          instituteId: 'ic' },
  { id: 'bsft',   name: 'BS Food Technology',                              instituteId: 'iaas' },
  { id: 'bsmb',   name: 'BS Marine Biology',                               instituteId: 'iaas' },
  { id: 'bssw',   name: 'BS Social Work',                                  instituteId: 'ibpa' },
  { id: 'bstm',   name: 'BS Tourism Management',                           instituteId: 'ibpa' },
  { id: 'bacomm', name: 'BA Communication',                                instituteId: 'ited' },
  { id: 'btled',  name: 'Bachelor of Technology and Livelihood Education', instituteId: 'ited' },
]

// Faculty records: sign-up is only allowed for people listed here. Role/program come from here.
const base = [
  { id: 'f1', name: 'Ic Dean',             email: 'ic.dean@dnsc.edu.ph',            role: 'dean',        programId: 'bsit',   instituteId: 'ic' },
  { id: 'f2', name: 'Iaas Dean',           email: 'iaas.dean@dnsc.edu.ph',          role: 'dean',        programId: 'bsft',   instituteId: 'iaas' },
  { id: 'f3', name: 'Ibpa Dean',           email: 'ibpa.dean@dnsc.edu.ph',          role: 'dean',        programId: 'bstm',   instituteId: 'ibpa' },
  { id: 'f4', name: 'Ited Dean',           email: 'ited.dean@dnsc.edu.ph',          role: 'dean',        programId: 'bacomm', instituteId: 'ited' },
  { id: 'f5', name: 'It Chair',            email: 'it.chair@dnsc.edu.ph',           role: 'chairperson', programId: 'bsit', instituteId: 'ic' },
  { id: 'f6', name: 'IS Chair',            email: 'is.chair@dnsc.edu.ph',           role: 'chairperson', programId: 'bsis', instituteId: 'ic' },
  { id: 'f7', name: 'Ft Chair',            email: 'ft.chair@dnsc.edu.ph',           role: 'chairperson', programId: 'bsft', instituteId: 'iaas' },
  { id: 'f8', name: 'Mb Chair',            email: 'mb.chair@dnsc.edu.ph',           role: 'chairperson', programId: 'bsmb', instituteId: 'iaas' },
  { id: 'f9', name: 'Sw Chair',            email: 'sw.chair@dnsc.edu.ph',           role: 'chairperson', programId: 'bssw', instituteId: 'ibpa' },
  { id: 'f10', name: 'Tm Chair',           email: 'tm.chair@dnsc.edu.ph',           role: 'chairperson', programId: 'bstm', instituteId: 'ibpa' },
  { id: 'f11', name: 'Bacomm Chair',       email: 'bacomm.chair@dnsc.edu.ph',       role: 'chairperson', programId: 'bacomm', instituteId: 'ited' },
  { id: 'f12', name: 'Btled Chair',        email: 'btled.chair@dnsc.edu.ph',        role: 'chairperson', programId: 'btled', instituteId: 'ited' },
  { id: 'f13', name: 'FIt instructor',     email: 'it.instructor1@dnsc.edu.ph',     role: 'instructor',  programId: 'bsit', instituteId: 'ic' },
  { id: 'f14', name: 'SIt instructor',     email: 'it.instructor2@dnsc.edu.ph',     role: 'instructor',  programId: 'bsit', instituteId: 'ic' },
  { id: 'f15', name: 'FFt Instructor',     email: 'ft.instructor1@dnsc.edu.ph',     role: 'instructor',  programId: 'bsft', instituteId: 'iaas' },
  { id: 'f16', name: 'SFt Instructor',     email: 'ft.instructor2@dnsc.edu.ph',     role: 'instructor',  programId: 'bsft', instituteId: 'iaas' },
  { id: 'f17', name: 'FSw Instructor',     email: 'sw.instructor1@dnsc.edu.ph',     role: 'instructor',  programId: 'bssw', instituteId: 'ibpa' },
  { id: 'f18', name: 'SSw Instructor',     email: 'sw.instructor2@dnsc.edu.ph',     role: 'instructor',  programId: 'bssw', instituteId: 'ibpa' },
  { id: 'f19', name: 'FBacomm Instructor', email: 'bacomm.instructor1@dnsc.edu.ph', role: 'instructor',  programId: 'bacomm', instituteId: 'ited' },
  { id: 'f20', name: 'SBacomm Instructor', email: 'bacomm.instructor2@dnsc.edu.ph', role: 'instructor',  programId: 'bacomm', instituteId: 'ited' },
  { id: 'f21', name: 'FGen Instructor',    email: 'gen.instructor1@dnsc.edu.ph',    role: 'instructor',  programId: null, instituteId: 'ited' },
  { id: 'f22', name: 'SGen Instructor',    email: 'gen.instructor2@dnsc.edu.ph',    role: 'instructor',  programId: null, instituteId: 'ited' },
]

// A chairperson or dean also teaches, so they get the instructor role too (one account, switchable view)
export const faculty = base.map((f) => ({ ...f, roles: f.role === 'chairperson' || f.role === 'dean' ? [f.role, 'instructor'] : [f.role] }))

export const seedUsers = [
  { id: 'u1',  facultyId: 'f1',   email: 'ic.dean@dnsc.edu.ph',            password: 'password123' },
  { id: 'u2',  facultyId: 'f2',   email: 'iaas.dean@dnsc.edu.ph',          password: 'password123' },
  { id: 'u3',  facultyId: 'f3',   email: 'ibpa.dean@dnsc.edu.ph',          password: 'password123' },
  { id: 'u4',  facultyId: 'f4',   email: 'ited.dean@dnsc.edu.ph',          password: 'password123' },
  { id: 'u5',  facultyId: 'f5',   email: 'it.chair@dnsc.edu.ph',           password: 'password123' },
  { id: 'u6',  facultyId: 'f7',   email: 'ft.chair@dnsc.edu.ph',           password: 'password123' },
  { id: 'u7',  facultyId: 'f9',   email: 'sw.chair@dnsc.edu.ph',           password: 'password123' },
  { id: 'u8',  facultyId: 'f11',  email: 'bacomm.chair@dnsc.edu.ph',       password: 'password123' },
  { id: 'u9',  facultyId: 'f13',  email: 'it.instructor1@dnsc.edu.ph',     password: 'password123' },
  { id: 'u10', facultyId: 'f14',  email: 'it.instructor2@dnsc.edu.ph',     password: 'password123' },
  { id: 'u11', facultyId: 'f15',  email: 'ft.instructor1@dnsc.edu.ph',     password: 'password123' },
  { id: 'u12', facultyId: 'f16',  email: 'ft.instructor2@dnsc.edu.ph',     password: 'password123' },
  { id: 'u13', facultyId: 'f17',  email: 'sw.instructor1@dnsc.edu.ph',     password: 'password123' },
  { id: 'u14', facultyId: 'f18',  email: 'sw.instructor2@dnsc.edu.ph',     password: 'password123' },
  { id: 'u15', facultyId: 'f19',  email: 'bacomm.instructor1@dnsc.edu.ph', password: 'password123' },
  { id: 'u16', facultyId: 'f20',  email: 'bacomm.instructor2@dnsc.edu.ph', password: 'password123' },
  { id: 'u17', facultyId: 'f21',  email: 'gen.instructor1@dnsc.edu.ph',    password: 'password123' },
  { id: 'u18', facultyId: 'f22',  email: 'gen.instructor2@dnsc.edu.ph',    password: 'password123' },
]
export const courses = [
  { id: 'c1',  code: 'IT 111',    title: 'Introduction to Computing',            units: 3, programId: 'bsit', year: 1 },
  { id: 'c2',  code: 'IT 112',    title: 'Computer Programming 2',               units: 3, programId: 'bsit', year: 2 },
  { id: 'c3',  code: 'IT 221',    title: 'Platform Technology',                  units: 3, programId: 'bsit', year: 3 },
  { id: 'c4',  code: 'IT 222',    title: 'Capstone 2',                           units: 3, programId: 'bsit', year: 4 },
  { id: 'c5',  code: 'FT 111',    title: 'Introduction to Food Science',         units: 3, programId: 'bsft', year: 1 },
  { id: 'c6',  code: 'FT 112',    title: 'Food Analysis',                        units: 3, programId: 'bsft', year: 2 },
  { id: 'c7',  code: 'FT 221',    title: 'Food Processing',                      units: 3, programId: 'bsft', year: 3 },
  { id: 'c8',  code: 'FT 222',    title: 'Food Plant Management',                units: 3, programId: 'bsft', year: 4 },
  { id: 'c9',  code: 'SW 111',    title: 'Filipino Personality and Social Work', units: 3, programId: 'bssw', year: 1 },
  { id: 'c10', code: 'SW 112',    title: 'Social Deviation and Social Work',     units: 3, programId: 'bssw', year: 2 },
  { id: 'c11', code: 'SW 221',    title: 'Social Work Research 1',               units: 3, programId: 'bssw', year: 3 },
  { id: 'c12', code: 'SW 222',    title: 'Social Work Research 2',               units: 3, programId: 'bssw', year: 4 },
  { id: 'c13', code: 'BAC 111',   title: 'Introduction to Communication Media',  units: 3, programId: 'bacomm', year: 1 },
  { id: 'c14', code: 'BAC 112',   title: 'Introduction to Broadcasting',         units: 3, programId: 'bacomm', year: 2 },
  { id: 'c15', code: 'BAC 221',   title: 'Development Communication',            units: 3, programId: 'bacomm', year: 3 },
  { id: 'c16', code: 'BAC 222',   title: 'Communication Management',             units: 3, programId: 'bacomm', year: 4 },
  { id: 'c17', code: 'GEELECT 1', title: 'Understanding the Self',               units: 3, programId: null, year: 1 },
  { id: 'c18', code: 'GEELECT 2', title: 'Life and works of Rizal',              units: 3, programId: null, year: 2 },
  { id: 'c19', code: 'GEELECT 3', title: 'Philippine Popular Culture',           units: 3, programId: null, year: 3 },
  { id: 'c20', code: 'GEELECT 4', title: 'Art Appreciation',                     units: 3, programId: null, year: 1 },
]
export const classSets = [
  { id: 's1',  name: 'BSIT 1-A',   programId: 'bsit',   year: 1, size: 35 },
  { id: 's2',  name: 'BSIT 2-A',   programId: 'bsit',   year: 2, size: 40 },
  { id: 's3',  name: 'BSIT 3-A',   programId: 'bsit',   year: 3, size: 25 },
  { id: 's4',  name: 'BSIT 4-A',   programId: 'bsit',   year: 4, size: 30 },
  { id: 's5',  name: 'BSFT 1-A',   programId: 'bsft',   year: 1, size: 30 },
  { id: 's6',  name: 'BSFT 2-A',   programId: 'bsft',   year: 2, size: 35 },
  { id: 's7',  name: 'BSFT 3-A',   programId: 'bsft',   year: 3, size: 25 },
  { id: 's8',  name: 'BSFT 4-A',   programId: 'bsft',   year: 4, size: 30 },
  { id: 's9',  name: 'BSSW 1-A',   programId: 'bssw',   year: 1, size: 30 },
  { id: 's10', name: 'BSSW 2-A',   programId: 'bssw',   year: 2, size: 35 },
  { id: 's11', name: 'BSSW 3-A',   programId: 'bssw',   year: 3, size: 25 },
  { id: 's12', name: 'BSSW 4-A',   programId: 'bssw',   year: 4, size: 30 },
  { id: 's13', name: 'BACOMM 1-A', programId: 'bacomm', year: 1, size: 30 },
  { id: 's14', name: 'BACOMM 2-A', programId: 'bacomm', year: 2, size: 35 },
  { id: 's15', name: 'BACOMM 3-A', programId: 'bacomm', year: 3, size: 25 },
  { id: 's16', name: 'BACOMM 4-A', programId: 'bacomm', year: 4, size: 30 },
]
// Restricted rooms are available to the listed programs; public rooms are available to all programs.
export const rooms = [
  { id: 'r1',  name: 'AB 3-1',     type: 'laboratory', category: 'exclusive', programIds: ['bsit', 'bsis'],   capacity: 40 },
  { id: 'r2',  name: 'Net Lab',    type: 'classroom',  category: 'exclusive', programIds: ['bsit'],           capacity: 36 },
  { id: 'r3',  name: 'Comlab 1',   type: 'laboratory', category: 'exclusive', programIds: ['bsit', 'bsis'],   capacity: 35 },
  { id: 'r4',  name: 'Comlab 2',   type: 'laboratory', category: 'exclusive', programIds: ['bsit', 'bsis'],   capacity: 30 },
  { id: 'r5',  name: 'Food Lab 1', type: 'laboratory', category: 'exclusive', programIds: ['bsft'],           capacity: 32 },
  { id: 'r6',  name: 'Food Lab 2', type: 'classroom',  category: 'exclusive', programIds: ['bsft'],           capacity: 45 },
  { id: 'r7',  name: 'AB 2-1',     type: 'classroom',  category: 'exclusive', programIds: ['bssw', 'bsft'],   capacity: 30 },
  { id: 'r8',  name: 'AB 2-2',     type: 'classroom',  category: 'exclusive', programIds: ['bacomm', 'bssw'], capacity: 50 },
  { id: 'r9',  name: 'AB 3-2',     type: 'laboratory', category: 'exclusive', programIds: ['bsit'],           capacity: 45 },
  { id: 'r10', name: 'AB 3-3',     type: 'classroom',  category: 'public',    programIds: [],                 capacity: 60 },
  { id: 'r11', name: 'AB 4-3',     type: 'classroom',  category: 'public',    programIds: [],                 capacity: 40 },
  { id: 'r12', name: 'AB 4-4',     type: 'classroom',  category: 'public',    programIds: [],                 capacity: 50 },
]
const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()
// A class set taking a course; instructor optional until assigned
export const classCourses = [
  { id: 'cc1', classSetId: 's1', courseId: 'c1',  instructorId: 'f13', createdAt: ago(30) },
  { id: 'cc2', classSetId: 's1', courseId: 'c17', instructorId: 'f21', createdAt: ago(29) },
  { id: 'cc3', classSetId: 's1', courseId: 'c20', instructorId: 'f22', createdAt: ago(8) },
  { id: 'cc4', classSetId: 's2', courseId: 'c2',  instructorId: 'f5',  createdAt: ago(8) },
]
// Room assignments: days are 0=Mon..5=Sat
export const assignments = [
  { id: 'a1', ccId: 'cc1', roomId: 'r2',  classType: 'discussion', days: [0, 2],    start: '18:00', end: '19:30' },
  { id: 'a2', ccId: 'cc1', roomId: 'r10', classType: 'discussion', days: [4],       start: '13:00', end: '14:30' },
  { id: 'a3', ccId: 'cc2', roomId: 'r10', classType: 'discussion', days: [1, 3],    start: '10:00', end: '11:30' },
  { id: 'a4', ccId: 'cc3', roomId: 'r11', classType: 'discussion', days: [1],       start: '13:00', end: '14:30' },
  { id: 'a5', ccId: 'cc4', roomId: 'r4',  classType: 'laboratory', days: [0, 2, 4], start: '13:00', end: '14:30' },
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
  { id: 'res1', instructorId: 'f13', deanId: 'f1', roomId: 'r2', date: dayOffset(-3), start: '09:00', end: '11:00', purpose: 'Thesis consultation seminar', submittedAt: ago(200), status: 'Approved', reason: '' },
  { id: 'res2', instructorId: 'f14', deanId: 'f1', roomId: 'r4', date: dayOffset(2), start: '15:00', end: '17:00', purpose: 'Capstone proposal defense', submittedAt: ago(60), status: 'Approved', reason: '' },
  { id: 'res3', instructorId: 'f16', deanId: 'f2', roomId: 'r10', date: nextAvailableRoomDate('r12', '13:00', '15:00'), start: '13:00', end: '15:00', purpose: 'Department planning workshop', submittedAt: ago(70), status: 'Approved', reason: '',
    cancelRequest: { status: 'Pending', reason: 'The workshop was moved to next month.', requestedAt: ago(2) } },
  { id: 'res4', instructorId: 'f8', deanId: 'f9', roomId: 'r8', date: dayOffset(2), start: '10:00', end: '12:00', purpose: 'Engineering orientation', submittedAt: ago(4), status: 'Pending', reason: '' },
]

// Example My Courses selections matching the instructors on the seeded class schedules.
export const facultyCourses = {
  f1: ['c3'],
  f2: ['c5'],
  f3: ['c10'],
  f4: ['c16'],
  f5: ['c3', 'c4'],
  f7: ['c6'],
  f9: ['c9', 'c11'],
  f11: ['c14'],
  f13: ['c1', 'c3'],
  f14: ['c2', 'c4'],
  f15: ['c5', 'c7'],
  f16: ['c6', 'c8'],
  f17: ['c9', 'c11'],
  f18: ['c10', 'c12'],
  f19: ['c13', 'c15'],
  f20: ['c14', 'c16'],
  f21: ['c17', 'c19'],
  f22: ['c18'],
}
export const notifications = [
  { id: 'n1', facultyId: 'f13', text: 'FIt Instructor requested the Network Lab.', at: ago(10), read: false },
  { id: 'n2', facultyId: 'f14', text: 'SIt Instructor requested Comlab 2.', at: ago(5), read: false },
  { id: 'n3', facultyId: 'f13', text: 'SFt Instructor asked to cancel her approved reservation of AB 3-3.', at: ago(2), read: false },
  { id: 'n4', facultyId: 'f14', text: 'Your reservation for Room 103 was approved.', at: ago(190), read: true },
]
export const by = {
  course: (id) => courses.find((x) => x.id === id), room: (id) => rooms.find((x) => x.id === id),
  classSet: (id) => classSets.find((x) => x.id === id), faculty: (id) => faculty.find((x) => x.id === id),
}
