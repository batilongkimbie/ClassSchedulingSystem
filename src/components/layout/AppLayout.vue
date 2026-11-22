<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'
import ConfirmModal from '../ui/ConfirmModal.vue'

const auth = useAuthStore(), router = useRouter(), route = useRoute(), toast = useToast()
const sidebarOpen = ref(false)
const confirmLogout = ref(false)
watch(() => route.path, () => (sidebarOpen.value = false))

function logout() {
  confirmLogout.value = false
  auth.logout()
  router.push('/login')
  toast.info('You have been logged out.')
}
</script>
<template>
  <div v-if="auth.user" class="min-h-screen bg-slate-50 text-slate-900">
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" @logout="confirmLogout = true" />
    <div class="lg:pl-64">
      <Topbar @menu="sidebarOpen = true" @logout="confirmLogout = true" />
      <main class="mx-auto max-w-7xl p-4 sm:p-6"><RouterView /></main>
    </div>
    <ConfirmModal :open="confirmLogout" title="Log out?" message="You will need to log in again to continue."
                  confirm-text="Log out" @confirm="logout" @cancel="confirmLogout = false" />
  </div>
</template>
