<script setup>
// Replace these two when you have your own images.
// Put the files in /public and use paths like '/building.jpg' and '/logo.png'.
const backgroundImage = 'public/dnsc_bg.jpg' // e.g. '/building.jpg'
const logoImage = 'public/dnsc_logo.jpg'       // e.g. '/logo.png'
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald-950 px-4 py-10">
    <!-- Background image placeholder -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}"
      aria-hidden="true"
    />
    <!-- Green overlay keeps the form readable over any photo -->
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-emerald-800/30 to-emerald-950/50" aria-hidden="true" />

    <section class="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">

      <div class="px-8 pb-8 pt-7 sm:px-10">
        <header class="flex items-center gap-4">
          <img
            v-if="logoImage"
            :src="logoImage"
            alt="Davao del Norte State College logo"
            class="h-14 w-14 shrink-0 rounded-full object-contain"
          />
          <div
            v-else
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-emerald-300 bg-emerald-50 text-[10px] font-medium text-emerald-700"
          >
            Logo
          </div>
          <div class="leading-tight">
            <p class="text-xs font-medium text-emerald-700">Davao del Norte State College</p>
            <p class="text-lg font-semibold text-slate-900">Class Scheduling System</p>
          </div>
        </header>

        <hr class="my-6 border-slate-200" />

        <slot />
      </div>
    </section>
  </main>
</template>
