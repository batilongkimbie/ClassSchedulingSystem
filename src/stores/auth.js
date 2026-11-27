import { defineStore } from 'pinia'
import { faculty, seedUsers, programs, institutes } from '../data/mockData'

// FRONTEND-ONLY MOCK. Passwords here are plain text and checks are client-side,
// so this is NOT real security. The backend must hash passwords and enforce roles.
const USERS_KEY = 'css_users', SESSION_KEY = 'css_session', ROLE_KEY = 'css_role'
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ')
const loadUsers = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(USERS_KEY))
    if (!Array.isArray(saved)) return [...seedUsers]
    const users = new Map(seedUsers.map((user) => [user.facultyId, user]))
    for (const user of saved) users.set(user.facultyId, user)
    return [...users.values()]
  } catch { return [...seedUsers] }
}

export const roleHome = { chairperson: '/chair/dashboard', dean: '/dean/dashboard', instructor: '/instructor/dashboard' }
export const roleLabel = { chairperson: 'Program Chairperson', dean: 'Dean', instructor: 'Instructor' }

export const useAuthStore = defineStore('auth', {
  state: () => ({ users: loadUsers(), userId: null, activeRole: null }),
  getters: {
    account: (s) => s.users.find((u) => u.id === s.userId) || null,
    user() {
      const f = this.account && faculty.find((x) => x.id === this.account.facultyId)
      if (!f) return null
      const role = f.roles.includes(this.activeRole) ? this.activeRole : f.role // role currently being viewed
      return {
        ...f,
        role, primaryRole: f.role,
        roleLabel: roleLabel[role],
        program: programs.find((p) => p.id === f.programId)?.name || null,
        institute: institutes.find((i) => i.id === f.instituteId)?.name || null,
        initials: f.name.split(' ').map((w) => w[0]).slice(0, 2).join(''),
      }
    },
    isAuthenticated() { return !!this.user },
    homePath() { return this.user ? roleHome[this.user.role] : '/login' },
  },
  actions: {
    persistUsers() { localStorage.setItem(USERS_KEY, JSON.stringify(this.users)) },
    restoreSession() {
      const id = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
      if (id && this.users.some((u) => u.id === id)) { this.userId = id; this.activeRole = localStorage.getItem(ROLE_KEY) || sessionStorage.getItem(ROLE_KEY) }
    },
    register({ name, email, password }) {
      const rec = faculty.find((f) => norm(f.email) === norm(email) && norm(f.name) === norm(name))
      if (!rec) return { ok: false, field: 'email', message: 'No faculty record matches this name and email. Check with your department.' }
      if (this.users.some((u) => norm(u.email) === norm(email)))
        return { ok: false, field: 'email', message: 'An account with this email already exists. Log in instead.' }
      this.users.push({ id: 'u' + Date.now(), facultyId: rec.id, email: rec.email, password })
      this.persistUsers()
      return { ok: true }
    },
    login({ email, password, remember }) {
      const acc = this.users.find((u) => norm(u.email) === norm(email) && u.password === password)
      if (!acc) return { ok: false, message: 'Incorrect email or password.' }
      this.userId = acc.id
      this.activeRole = faculty.find((f) => f.id === acc.facultyId).role // always start in the main role
      const store = remember ? localStorage : sessionStorage
      store.setItem(SESSION_KEY, acc.id); store.setItem(ROLE_KEY, this.activeRole)
      return { ok: true }
    },
    switchRole(role) {
      if (!this.user?.roles.includes(role)) return false
      this.activeRole = role
      ;(localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage).setItem(ROLE_KEY, role); return true
    },
    logout() {
      this.userId = null; this.activeRole = null
      for (const st of [localStorage, sessionStorage]) { st.removeItem(SESSION_KEY); st.removeItem(ROLE_KEY) }
    },
  },
})
