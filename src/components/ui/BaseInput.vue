<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  modelValue: String, label: String, type: { type: String, default: 'text' },
  error: String, hint: String, id: String, autocomplete: String, placeholder: String,
})
defineEmits(['update:modelValue'])
const show = ref(false)
const isPw = computed(() => props.type === 'password')
const inputId = props.id || 'in-' + Math.random().toString(36).slice(2, 8)
</script>
<template>
  <div>
    <label :for="inputId" class="mb-1.5 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="relative">
      <input :id="inputId" :value="modelValue" :type="isPw && show ? 'text' : type" :autocomplete="autocomplete"
             :placeholder="placeholder" :aria-invalid="!!error" :aria-describedby="error ? inputId + '-err' : undefined"
             @input="$emit('update:modelValue', $event.target.value)"
             :class="['w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2',
                      isPw ? 'pr-16' : '',
                      error ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/25']" />
      <button v-if="isPw" type="button" class="absolute inset-y-0 right-0 px-3.5 text-xs font-medium text-slate-500 hover:text-emerald-700"
              :aria-label="show ? 'Hide password' : 'Show password'" @click="show = !show">
        {{ show ? 'Hide' : 'Show' }}
      </button>
    </div>
    <p v-if="error" :id="inputId + '-err'" class="mt-1.5 text-xs text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-slate-500">{{ hint }}</p>
  </div>
</template>
