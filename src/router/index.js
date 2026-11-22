import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { navByRole, rolePrefix } from './navigation'
import AppLayout from '../components/layout/AppLayout.vue'

const Placeholder = () => import('../views/PlaceholderView.vue')
// Real pages replace placeholders as each stage is built
const pages = {
  'chairperson-dashboard': () => import('../views/chair/DashboardView.vue'),
  'chairperson-create-schedule': () => import('../views/chair/CreateScheduleView.vue'),
  'chairperson-room-timetables': () => import('../views/shared/RoomTimetablesView.vue'),
  'chairperson-instructor-timetables': () => import('../views/shared/InstructorTimetablesView.vue'),
  'dean-dashboard': () => import('../views/dean/DashboardView.vue'),
  'dean-room-timetables': () => import('../views/shared/RoomTimetablesView.vue'),
  'dean-instructor-timetables': () => import('../views/shared/InstructorTimetablesView.vue'),
  'dean-reservation-requests': () => import('../views/dean/ReservationRequestsView.vue'),
  'instructor-dashboard': () => import('../views/instructor/DashboardView.vue'),
  'instructor-my-courses': () => import('../views/instructor/MyCoursesView.vue'),
  'instructor-room-timetables': () => import('../views/instructor/RoomTimetablesView.vue'),
  'instructor-my-timetable': () => import('../views/instructor/MyTimetableView.vue'),
  'instructor-my-reservations': () => import('../views/instructor/MyReservationsView.vue'),
}

const roleRoutes = Object.entries(navByRole).map(([role, items]) => ({
  path: `/${rolePrefix[role]}`,
  component: AppLayout,
  meta: { role },
  redirect: `/${rolePrefix[role]}/dashboard`,
  children: items.map((i) => ({
    path: i.path, name: `${role}-${i.path}`, component: pages[`${role}-${i.path}`] || Placeholder,
    meta: { role, title: i.label },
  })),
}))

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { guest: true } },
    { path: '/signup', name: 'signup', component: () => import('../views/SignUpView.vue'), meta: { guest: true } },
    ...roleRoutes,
    {
      path: '/profile', component: AppLayout, meta: { anyRole: true },
      children: [{ path: '', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { title: 'Profile' } }],
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.guest && auth.isAuthenticated) return auth.homePath
  const needsAuth = to.matched.some((r) => r.meta.role || r.meta.anyRole)
  if (needsAuth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  const role = to.matched.find((r) => r.meta.role)?.meta.role
  if (role && role !== auth.user.role) return auth.homePath // wrong role -> own dashboard
})

export default router
