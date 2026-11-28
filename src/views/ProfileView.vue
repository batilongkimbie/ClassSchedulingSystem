<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import BaseInput from '../components/ui/BaseInput.vue'
const auth = useAuthStore(), toast = useToast()
const user = computed(() => auth.user)
const photoInput = ref(null)
const photoError = ref('')
const password = reactive({ current: '', next: '', confirm: '' })
const errors = reactive({ current: '', next: '', confirm: '' })
const savingPassword = ref(false)
const passwordSaveError = ref('')
const rows = computed(() => [
  ['Full name', user.value.name],
  ['Email', user.value.email],
  ['Role', user.value.roleLabel],
  ['Can also act as', user.value.roles.filter((r) => r !== user.value.primaryRole).map((r) => ({ instructor: 'Instructor', chairperson: 'Program Chairperson', dean: 'Dean' })[r]).join(', ') || 'None'],
  ['Institute', user.value.institute],
  ['Program', user.value.program || 'Not applicable'],
])

async function updatePhoto(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  photoError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    photoError.value = 'Choose an image file.'
    return
  }
  if (file.size > 1024 * 1024) {
    photoError.value = 'Choose an image smaller than 1 MB.'
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result !== 'string') {
      photoError.value = 'The selected image could not be read.'
      return
    }
    try {
      const result = auth.updateProfilePhoto(reader.result)
      if (!result.ok) {
        photoError.value = result.message
        return
      }
      toast.success('Profile photo updated.')
    } catch {
      photoError.value = 'Could not save your photo. Try a smaller image.'
    }
  }
  reader.onerror = () => { photoError.value = 'The selected image could not be read.' }
  reader.readAsDataURL(file)
}

function savePassword() {
  errors.current = ''
  errors.next = ''
  errors.confirm = ''
  passwordSaveError.value = ''
  savingPassword.value = true
  try {
    const result = auth.changePassword({
      currentPassword: password.current,
      newPassword: password.next,
      confirmPassword: password.confirm,
    })
    if (!result.ok) {
      errors[result.field === 'currentPassword' ? 'current' : result.field === 'newPassword' ? 'next' : 'confirm'] = result.message
      return
    }
    password.current = ''
    password.next = ''
    password.confirm = ''
    toast.success('Password updated.')
  } catch {
    passwordSaveError.value = 'Could not save your password. Please try again.'
    toast.error(passwordSaveError.value)
  } finally {
    savingPassword.value = false
  }
}
</script>
<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-semibold">Profile</h1>
    <p class="mt-1 text-sm text-slate-600">Your faculty details are managed by an administrator. You can update your photo and password here.</p>
    <div class="mt-6 rounded-xl border border-slate-200 bg-white">
      <div class="flex items-center gap-4 border-b border-slate-100 p-6">
        <img v-if="user.photoUrl" :src="user.photoUrl" alt="Profile photo" class="h-16 w-16 rounded-full object-cover" />
        <span v-else class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-emerald-700 text-lg font-semibold text-white">{{ user.initials }}</span>
        <div class="min-w-0 flex-1"><p class="font-semibold">{{ user.name }}</p><p class="text-sm text-slate-500">{{ user.roleLabel }}</p></div>
        <div class="flex flex-wrap gap-2">
          <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden" @change="updatePhoto" />
          <button type="button" class="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="photoInput?.click()">Change photo</button>
        </div>
      </div>
      <dl class="divide-y divide-slate-100">
        <div v-for="[k, v] in rows" :key="k" class="flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:gap-0">
          <dt class="text-sm text-slate-500 sm:w-40">{{ k }}</dt><dd class="text-sm font-medium">{{ v }}</dd>
        </div>
      </dl>
      <p v-if="photoError" role="alert" class="border-t border-red-100 px-6 py-3 text-sm text-red-700">{{ photoError }}</p>
    </div>

    <section class="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <h2 class="text-lg font-semibold">Change password</h2>
      <p class="mt-1 text-sm text-slate-500">Choose at least 8 characters and include both letters and numbers.</p>
      <form class="mt-5 space-y-4" novalidate @submit.prevent="savePassword">
        <BaseInput v-model="password.current" label="Current password" type="password" autocomplete="current-password" :error="errors.current" />
        <BaseInput v-model="password.next" label="New password" type="password" autocomplete="new-password" :error="errors.next" />
        <BaseInput v-model="password.confirm" label="Confirm new password" type="password" autocomplete="new-password" :error="errors.confirm" />
        <p v-if="passwordSaveError" role="alert" class="text-sm text-red-700">{{ passwordSaveError }}</p>
        <button type="submit" :disabled="savingPassword" class="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {{ savingPassword ? 'Saving…' : 'Update password' }}
        </button>
      </form>
    </section>
  </div>
</template>
