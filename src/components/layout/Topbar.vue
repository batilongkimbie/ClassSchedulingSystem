<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Icon from '../ui/Icon.vue'
import { useScheduleStore } from '../../stores/schedule'

const emit = defineEmits(['menu', 'logout'])
const auth = useAuthStore(), store = useScheduleStore()
const route = useRoute()
const menu = ref(null) // 'notif' | 'profile' | null
const root = ref(null)

const crumbs = computed(() => [auth.user.roleLabel, route.meta.title].filter(Boolean))

const notifications = computed(() => store.notificationsFor(auth.user.id))
const unread = computed(() => notifications.value.filter((n) => !n.read).length)
const ago = (iso) => { const m = Math.round((Date.now() - new Date(iso)) / 60000); return m < 1 ? 'Just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago` }
const toggle = (n) => (menu.value = menu.value === n ? null : n)
const outside = (e) => { if (root.value && !root.value.contains(e.target)) menu.value = null }
onMounted(() => document.addEventListener('click', outside))
onBeforeUnmount(() => document.removeEventListener('click', outside))
</script>
<template>
  <header ref="root" class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
    <button class="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu" @click="emit('menu')"><Icon name="menu" /></button>
    <nav aria-label="Breadcrumb" class="min-w-0 flex-1">
      <ol class="flex items-center gap-2 truncate text-sm text-slate-500">
        <li v-for="(c, i) in crumbs" :key="c" class="flex items-center gap-2 truncate">
          <span v-if="i" aria-hidden="true">/</span>
          <span :class="i === crumbs.length - 1 ? 'font-semibold text-slate-900' : ''">{{ c }}</span>
        </li>
      </ol>
    </nav>

    <div class="relative">
      <button class="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications" @click.stop="toggle('notif')">
        <Icon name="bell" /><span v-if="unread" class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">{{ unread }}</span>
      </button>
      <div v-if="menu === 'notif'" class="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-lg">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3"><p class="text-sm font-semibold">Notifications</p><button v-if="unread" class="text-xs font-medium text-emerald-700 hover:underline" @click="store.markAllRead(auth.user.id)">Mark all read</button></div>
        <ul class="max-h-80 divide-y divide-slate-100 overflow-y-auto"><li v-for="n in notifications" :key="n.id" :class="['px-4 py-3 text-sm text-slate-700', n.read ? '' : 'bg-emerald-50/60']">{{ n.text }}<p class="mt-1 text-xs text-slate-400">{{ ago(n.at) }}</p></li>
          <li v-if="!notifications.length" class="px-4 py-6 text-center text-sm text-slate-500">You're all caught up.</li></ul>
      </div>
    </div>

    <div class="relative">
      <button class="flex items-center gap-2.5 rounded-lg p-1.5 pr-2 hover:bg-slate-100" aria-haspopup="menu" @click.stop="toggle('profile')">
        <span class="grid h-9 w-9 place-items-center rounded-full bg-emerald-700 text-sm font-semibold text-white">{{ auth.user.initials }}</span>
        <span class="hidden text-left leading-tight sm:block">
          <span class="block text-sm font-medium text-slate-900">{{ auth.user.name }}</span>
          <span class="block text-xs text-slate-500">{{ auth.user.roleLabel }}</span>
        </span>
        <Icon name="chevron" :size="16" class="hidden text-slate-400 sm:block" />
      </button>
      <div v-if="menu === 'profile'" role="menu" class="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
        <div class="border-b border-slate-100 px-4 py-3 sm:hidden"><p class="text-sm font-medium">{{ auth.user.name }}</p><p class="text-xs text-slate-500">{{ auth.user.roleLabel }}</p></div>
        <RouterLink to="/profile" role="menuitem" class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50" @click="menu = null"><Icon name="user" :size="16" />My profile</RouterLink>
        <button role="menuitem" class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50" @click="menu = null; emit('logout')"><Icon name="logout" :size="16" />Log out</button>
      </div>
    </div>
  </header>
</template>
