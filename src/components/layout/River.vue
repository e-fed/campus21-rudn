<script setup lang="ts">
import { useRiverState } from '../../composables/useRiver'

const riverState = useRiverState()

const getRiverColor = () => {
  if (!riverState.value.selectedTrack) return '#3B82F6'
  return riverState.value.selectedTrack === 'duck' ? '#44EB99' : '#861BE3'
}

const getMainOpacity = () => {
  if (riverState.value.selectedTrack) return 0.45
  return 0.4
}

const getLeftOpacity = () => {
  if (!riverState.value.selectedTrack) return 0.4
  return riverState.value.selectedTrack === 'duck' ? 0.5 : 0.05
}

const getRightOpacity = () => {
  if (!riverState.value.selectedTrack) return 0.4
  return riverState.value.selectedTrack === 'turtle' ? 0.5 : 0.05
}
</script>

<template>
  <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
    <svg class="w-full h-full" viewBox="0 0 1000 4000" preserveAspectRatio="none">
      
      <!-- ОСНОВНАЯ РЕКА (плавный S-образный изгиб) -->
      <path 
        d="M 500 600 
           C 460 900, 560 1200, 520 1500 
           C 480 1800, 460 2100, 500 2400"
        fill="none"
        :stroke="getRiverColor()"
        stroke-width="180"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-all duration-1000"
        :opacity="getMainOpacity()"
      />
      
      <!-- ЛЕВОЕ РУСЛО (плавный уход влево) -->
      <path 
        d="M 500 2400 
           C 450 2600, 380 2800, 320 3000 
           C 260 3200, 230 3500, 240 3800 
           C 245 3900, 250 4000, 250 4000"
        fill="none"
        :stroke="getRiverColor()"
        stroke-width="180"
        stroke-linecap="round"
        stroke-linejoin="round"
        :opacity="getLeftOpacity()"
        class="transition-all duration-1000"
      />
      
      <!-- ПРАВОЕ РУСЛО (плавный уход вправо) -->
      <path 
        d="M 500 2400 
           C 550 2600, 620 2800, 680 3000 
           C 740 3200, 770 3500, 760 3800 
           C 755 3900, 750 4000, 750 4000"
        fill="none"
        :stroke="getRiverColor()"
        stroke-width="180"
        stroke-linecap="round"
        stroke-linejoin="round"
        :opacity="getRightOpacity()"
        class="transition-all duration-1000"
      />
      
      <!-- АНИМАЦИЯ ТЕЧЕНИЯ (основное русло) -->
      <path 
        d="M 500 600 
           C 460 900, 560 1200, 520 1500 
           C 480 1800, 460 2100, 500 2400"
        fill="none"
        stroke="white"
        stroke-width="20"
        stroke-dasharray="80 160"
        stroke-linecap="round"
        class="animate-flow-water"
        :opacity="getMainOpacity() * 0.4"
      />
      
      <!-- Анимация левого русла -->
      <path 
        d="M 500 2400 
           C 450 2600, 380 2800, 320 3000 
           C 260 3200, 230 3500, 240 3800 
           C 245 3900, 250 4000, 250 4000"
        fill="none"
        stroke="white"
        stroke-width="18"
        stroke-dasharray="80 160"
        stroke-linecap="round"
        class="animate-flow-water"
        :opacity="getLeftOpacity() * 0.25"
        style="animation-delay: 0.5s"
      />
      
      <!-- Анимация правого русла -->
      <path 
        d="M 500 2400 
           C 550 2600, 620 2800, 680 3000 
           C 740 3200, 770 3500, 760 3800 
           C 755 3900, 750 4000, 750 4000"
        fill="none"
        stroke="white"
        stroke-width="18"
        stroke-dasharray="80 160"
        stroke-linecap="round"
        class="animate-flow-water"
        :opacity="getRightOpacity() * 0.25"
        style="animation-delay: 1s"
      />
    </svg>
  </div>
</template>

<style scoped>
@keyframes flow-water {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -240; }
}
.animate-flow-water {
  animation: flow-water 5s linear infinite;
}
</style>