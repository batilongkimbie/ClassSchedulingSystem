<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { navByRole, rolePrefix } from '../../router/navigation'
import Icon from '../ui/Icon.vue'
import { brand } from '../../config/brand'

defineProps({ open: Boolean })
const emit = defineEmits(['close', 'logout'])
const auth = useAuthStore()
const route = useRoute()
const role = computed(() => auth.user.role)
const links = computed(() => [
  ...navByRole[role.value].map((i) => ({ ...i, to: `/${rolePrefix[role.value]}/${i.path}` })),
  { label: 'Profile', icon: 'user', to: '/profile' },
])
const active = (to) => route.path === to
</script>
<template>
  <div v-if="open" class="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" @click="emit('close')"></div>
  <aside :class="['fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-emerald-950 text-emerald-50 transition-transform duration-200 lg:translate-x-0',
                  open ? 'translate-x-0' : '-translate-x-full']" aria-label="Primary navigation">
    <div class="flex h-16 items-center gap-3 border-b border-emerald-900 px-5">
      <img v-if="brand.logoImage" :src="brand.logoImage" alt="" class="h-9 w-9 shrink-0 rounded-full object-contain" />
      <span v-else class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-500 text-emerald-950"><Icon name="cap" :size="20" /></span>
      <div class="leading-tight"><p class="font-semibold">{{ brand.short }}</p><p class="text-xs text-emerald-300">{{ brand.system }}</p></div>
      <button class="ml-auto p-1 lg:hidden" aria-label="Close menu" @click="emit('close')"><Icon name="x" /></button>
    </div>
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      <RouterLink v-for="l in links" :key="l.to" :to="l.to" @click="emit('close')"
        :aria-current="active(l.to) ? 'page' : undefined"
        :class="['relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                 active(l.to) ? 'bg-emerald-900 text-white' : 'text-emerald-200 hover:bg-emerald-900/60 hover:text-white']">
        <span v-if="active(l.to)" class="absolute -left-3 top-2 bottom-2 w-1 rounded-r bg-amber-500"></span>
        <Icon :name="l.icon" :size="18" />{{ l.label }}
      </RouterLink>
    </nav>
    <div class="border-t border-emerald-900 p-3">
      <button class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-200 hover:bg-emerald-900/60 hover:text-white"
              @click="emit('logout')"><Icon name="logout" :size="18" />Log out</button>
    </div>
  </aside>
</template>
