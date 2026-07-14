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
      
      <!-- ОСНОВНАЯ РЕКА (жёсткая лесенка) -->
      <path
        d="M 500 600 
           L 500 640 L 480 660 L 480 700 L 520 720 L 520 760 
           L 500 780 L 500 820 L 460 840 L 460 880 L 520 900 
           L 520 940 L 500 960 L 500 1000 L 480 1020 L 480 1060 
           L 520 1080 L 520 1120 L 500 1140 L 500 1180 L 460 1200 
           L 460 1240 L 520 1260 L 520 1300 L 500 1320 L 500 1360 
           L 480 1380 L 480 1420 L 520 1440 L 520 1480 L 500 1500 
           L 500 2400"
        fill="none"
        :stroke="getRiverColor()"
        stroke-width="160"
        stroke-linecap="square"
        stroke-linejoin="miter"
        class="transition-all duration-1000"
        :opacity="getMainOpacity()"
      />

      <!-- ЛЕВОЕ РУСЛО (жёсткая лесенка) -->
      <path
        d="M 500 2400 
           L 500 2440 L 440 2460 L 440 2500 L 380 2520 L 380 2560 
           L 340 2580 L 340 2620 L 300 2640 L 300 2680 L 260 2700 
           L 260 2740 L 240 2760 L 240 2800 L 220 2820 L 220 2860 
           L 210 2880 L 210 2920 L 220 2940 L 220 2980 L 240 3000 
           L 240 3040 L 230 3060 L 230 3100 L 240 3120 L 240 3160 
           L 230 3180 L 230 3220 L 240 3240 L 240 3280 L 245 3300 
           L 245 3340 L 240 3360 L 240 3400 L 245 3420 L 245 3460 
           L 240 3480 L 240 3520 L 245 3540 L 245 3580 L 240 3600 
           L 240 3640 L 245 3660 L 245 3700 L 250 3720 L 250 4000"
        fill="none"
        :stroke="getRiverColor()"
        stroke-width="160"
        stroke-linecap="square"
        stroke-linejoin="miter"
        :opacity="getLeftOpacity()"
        class="transition-all duration-1000"
      />

      <!-- ПРАВОЕ РУСЛО (жёсткая лесенка) -->
      <path
        d="M 500 2400 
           L 500 2440 L 560 2460 L 560 2500 L 620 2520 L 620 2560 
           L 660 2580 L 660 2620 L 700 2640 L 700 2680 L 740 2700 
           L 740 2740 L 760 2760 L 760 2800 L 780 2820 L 780 2860 
           L 790 2880 L 790 2920 L 780 2940 L 780 2980 L 760 3000 
           L 760 3040 L 770 3060 L 770 3100 L 760 3120 L 760 3160 
           L 770 3180 L 770 3220 L 760 3240 L 760 3280 L 755 3300 
           L 755 3340 L 760 3360 L 760 3400 L 755 3420 L 755 3460 
           L 760 3480 L 760 3520 L 755 3540 L 755 3580 L 760 3600 
           L 760 3640 L 755 3660 L 755 3700 L 750 3720 L 750 4000"
        fill="none"
        :stroke="getRiverColor()"
        stroke-width="160"
        stroke-linecap="square"
        stroke-linejoin="miter"
        :opacity="getRightOpacity()"
        class="transition-all duration-1000"
      />

      <!-- АНИМАЦИЯ ТЕЧЕНИЯ (основная) -->
      <path
        d="M 500 600 
           L 500 640 L 480 660 L 480 700 L 520 720 L 520 760 
           L 500 780 L 500 820 L 460 840 L 460 880 L 520 900 
           L 520 940 L 500 960 L 500 1000 L 480 1020 L 480 1060 
           L 520 1080 L 520 1120 L 500 1140 L 500 1180 L 460 1200 
           L 460 1240 L 520 1260 L 520 1300 L 500 1320 L 500 1360 
           L 480 1380 L 480 1420 L 520 1440 L 520 1480 L 500 1500 
           L 500 2400"
        fill="none"
        stroke="var(--flow-stroke, rgba(0, 0, 0, 0.6))"
        stroke-width="18"
        stroke-dasharray="40 80"
        stroke-linecap="square"
        class="animate-flow-water"
        :opacity="getMainOpacity()"
      />

      <!-- Анимация левого русла -->
      <path
        d="M 500 2400 
           L 500 2440 L 440 2460 L 440 2500 L 380 2520 L 380 2560 
           L 340 2580 L 340 2620 L 300 2640 L 300 2680 L 260 2700 
           L 260 2740 L 240 2760 L 240 2800 L 220 2820 L 220 2860 
           L 210 2880 L 210 2920 L 220 2940 L 220 2980 L 240 3000 
           L 240 3040 L 230 3060 L 230 3100 L 240 3120 L 240 3160 
           L 230 3180 L 230 3220 L 240 3240 L 240 3280 L 245 3300 
           L 245 3340 L 240 3360 L 240 3400 L 245 3420 L 245 3460 
           L 240 3480 L 240 3520 L 245 3540 L 245 3580 L 240 3600 
           L 240 3640 L 245 3660 L 245 3700 L 250 3720 L 250 4000"
        fill="none"
        stroke="var(--flow-stroke, rgba(0, 0, 0, 0.6))"
        stroke-width="18"
        stroke-dasharray="40 80"
        stroke-linecap="square"
        class="animate-flow-water"
        :opacity="getLeftOpacity()"
        style="animation-delay: 0.5s"
      />

      <!-- Анимация правого русла -->
      <path
        d="M 500 2400 
           L 500 2440 L 560 2460 L 560 2500 L 620 2520 L 620 2560 
           L 660 2580 L 660 2620 L 700 2640 L 700 2680 L 740 2700 
           L 740 2740 L 760 2760 L 760 2800 L 780 2820 L 780 2860 
           L 790 2880 L 790 2920 L 780 2940 L 780 2980 L 760 3000 
           L 760 3040 L 770 3060 L 770 3100 L 760 3120 L 760 3160 
           L 770 3180 L 770 3220 L 760 3240 L 760 3280 L 755 3300 
           L 755 3340 L 760 3360 L 760 3400 L 755 3420 L 755 3460 
           L 760 3480 L 760 3520 L 755 3540 L 755 3580 L 760 3600 
           L 760 3640 L 755 3660 L 755 3700 L 750 3720 L 750 4000"
        fill="none"
        stroke="var(--flow-stroke, rgba(0, 0, 0, 0.6))"
        stroke-width="18"
        stroke-dasharray="40 80"
        stroke-linecap="square"
        class="animate-flow-water"
        :opacity="getRightOpacity()"
        style="animation-delay: 1s"
      />
    </svg>
  </div>
</template>

<style scoped>
@keyframes flow-water {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -120; }
}
.animate-flow-water {
  animation: flow-water 3s linear infinite;
}
</style>