<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import AuthLayout from '../components/AuthLayout.vue'
import BaseInput from '../components/ui/BaseInput.vue'

const auth = useAuthStore(), router = useRouter(), toast = useToast()
const form = reactive({ name: '', email: '', password: '', confirm: '' })
const errors = reactive({ name: '', email: '', password: '', confirm: '' })
const loading = ref(false)

function validate() {
  errors.name = form.name.trim().length < 2 ? 'Enter your full name as it appears in faculty records.' : ''
  errors.email = !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Enter a valid email address.' : ''
  errors.password = form.password.length < 8 ? 'Use at least 8 characters.' : !/\d/.test(form.password) || !/[a-zA-Z]/.test(form.password) ? 'Include both letters and numbers.' : ''
  errors.confirm = form.confirm !== form.password ? 'Passwords do not match.' : ''
  return Object.values(errors).every((e) => !e)
}
async function submit() {
  if (!validate()) return
  loading.value = true
  await new Promise((r) => setTimeout(r, 600))
  const res = auth.register(form) // role comes from the faculty record, not this form
  loading.value = false
  if (!res.ok) { errors[res.field] = res.message; toast.error(res.message); return }
  toast.success('Account created. Log in to continue.')
  router.push('/login')
}
</script>
<template>
  <AuthLayout>
    <h1 class="text-2xl font-semibold text-slate-900">Sign up</h1>
    <p class="mt-1 text-sm text-slate-500">Only DNSC faculty can create an account. Your role is assigned from faculty records.</p>
    <form class="mt-6 space-y-5" novalidate @submit.prevent="submit">
      <BaseInput v-model="form.name" label="Full name" autocomplete="name" :error="errors.name" placeholder="Maria Santos" />
      <BaseInput v-model="form.email" label="Email address" type="email" autocomplete="email" :error="errors.email" placeholder="name@dnsc.edu.ph" />
      <BaseInput v-model="form.password" label="Password" type="password" autocomplete="new-password" :error="errors.password" hint="At least 8 characters with letters and numbers." />
      <BaseInput v-model="form.confirm" label="Confirm password" type="password" autocomplete="new-password" :error="errors.confirm" />
      <button :disabled="loading" class="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        {{ loading ? 'Checking faculty records…' : 'Create account' }}
      </button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-600">Already registered? <RouterLink to="/login" class="font-medium text-emerald-700 hover:underline">Log in</RouterLink></p>
    <p class="mt-6 rounded-lg border border-dashed border-slate-300 p-3.5 text-xs text-slate-500">Demo: register <b>Jose Lim</b> (jose.lim@dnsc.edu.ph) or <b>Carla Mendoza</b> (carla.m@dnsc.edu.ph).</p>
  </AuthLayout>
</template>
