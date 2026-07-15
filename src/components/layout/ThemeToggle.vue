<script setup lang="ts">
import { trackGoal } from '../../utils/analytics'

defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  toggleTheme: []
}>()

const handleToggle = () => {
  trackGoal('theme_toggled')
  emit('toggleTheme')
}
</script>

<template>
  <button
    @click="handleToggle"
    aria-label="Переключить тему"
    title="Переключить тему"
    class="group inline-flex size-12 items-center justify-center border-2 border-black bg-white dark:bg-gray-800 shadow-pixel-sm transition-all duration-300 hover:border-school21 hover:text-school21 hover:shadow-[0_0_12px_-2px_rgba(68,235,153,0.7)] active:scale-90"
  >
    <!-- Солнце (тёмная тема) -->
    <svg
      v-if="isDark"
      class="w-5 h-5 transition-transform duration-500 group-hover:rotate-45"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
    <!-- Луна (светлая тема) -->
    <svg
      v-else
      class="w-5 h-5 transition-transform duration-500 group-hover:-rotate-12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  </button>
</template>