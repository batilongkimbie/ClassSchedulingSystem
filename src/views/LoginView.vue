<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'
import AuthLayout from '../components/AuthLayout.vue'
import BaseInput from '../components/ui/BaseInput.vue'

const auth = useAuthStore(), router = useRouter(), route = useRoute(), toast = useToast()
const form = reactive({ email: '', password: '', remember: false })
const errors = reactive({ email: '', password: '', form: '' })
const loading = ref(false)

function validate() {
  errors.email = !form.email.trim() ? 'Enter your email address.' : !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Enter a valid email address.' : ''
  errors.password = form.password ? '' : 'Enter your password.'
  errors.form = ''
  return !errors.email && !errors.password
}
async function submit() {
  if (!validate()) return
  loading.value = true
  await new Promise((r) => setTimeout(r, 500)) // simulate network
  const res = auth.login(form)
  loading.value = false
  if (!res.ok) { errors.form = res.message; return }
  toast.success(`Welcome back, ${auth.user.name.split(' ')[0]}.`)
  // Honor ?redirect only if it stays inside this user's own role area
  const area = auth.homePath.split('/')[1]
  const r = route.query.redirect
  router.push(typeof r === 'string' && r.startsWith(`/${area}/`) ? r : auth.homePath)
}
</script>
<template>
  <AuthLayout>
    <h1 class="text-center text-2xl font-semibold text-slate-900">Welcome Back!</h1>
    <p class="mt-1 text-center text-sm text-slate-500">Use your DNSC faculty email to continue.</p>
    <form class="mt-6 space-y-5" novalidate @submit.prevent="submit">
      <p v-if="errors.form" role="alert" class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{{ errors.form }}</p>
      <BaseInput v-model="form.email" label="Email address" type="email" autocomplete="email" :error="errors.email" placeholder="name@dnsc.edu.ph" />
      <BaseInput v-model="form.password" label="Password" type="password" autocomplete="current-password" :error="errors.password" />
      <label class="flex items-center gap-2 text-sm text-slate-700">
        <input v-model="form.remember" type="checkbox" class="h-4 w-4 rounded border-slate-300 accent-emerald-700" /> Remember me
      </label>
      <button :disabled="loading" class="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
    <p class="mt-6 text-center text-sm text-slate-600">New faculty member? <RouterLink to="/signup" class="font-medium text-emerald-700 hover:underline">Create an account</RouterLink></p>
  </AuthLayout>
</template>
