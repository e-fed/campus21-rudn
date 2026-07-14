<!-- src/components/sections/CountdownTimer.vue -->
<template>
  <div class="flex justify-center gap-2 sm:gap-4 mt-4">
    <div class="bg-white dark:bg-gray-800 border-2 border-black shadow-pixel p-2 sm:p-3 text-center w-16 sm:w-20">
      <span class="block text-2xl sm:text-3xl font-bold">{{ days }}</span>
      <span class="text-xs sm:text-sm uppercase">дн</span>
    </div>
    <div class="bg-white dark:bg-gray-800 border-2 border-black shadow-pixel p-2 sm:p-3 text-center w-16 sm:w-20">
      <span class="block text-2xl sm:text-3xl font-bold">{{ hours }}</span>
      <span class="text-xs sm:text-sm uppercase">ч</span>
    </div>
    <div class="bg-white dark:bg-gray-800 border-2 border-black shadow-pixel p-2 sm:p-3 text-center w-16 sm:w-20">
      <span class="block text-2xl sm:text-3xl font-bold">{{ minutes }}</span>
      <span class="text-xs sm:text-sm uppercase">мин</span>
    </div>
    <div class="bg-white dark:bg-gray-800 border-2 border-black shadow-pixel p-2 sm:p-3 text-center w-16 sm:w-20">
      <span class="block text-2xl sm:text-3xl font-bold">{{ seconds }}</span>
      <span class="text-xs sm:text-sm uppercase">сек</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const targetDate = new Date('2026-11-18T00:00:00')
const now = ref(Date.now())
let interval: number

const diff = computed(() => targetDate.getTime() - now.value)

const days = computed(() => Math.floor(diff.value / (1000 * 60 * 60 * 24)))
const hours = computed(() => Math.floor((diff.value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
const minutes = computed(() => Math.floor((diff.value % (1000 * 60 * 60)) / (1000 * 60)))
const seconds = computed(() => Math.floor((diff.value % (1000 * 60)) / 1000))

onMounted(() => {
  interval = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>