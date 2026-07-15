<script setup lang="ts">
import { useRiverState } from '../../composables/useRiver'

const riverState = useRiverState()

const getRiverColor = () => {
  if (!riverState.value.selectedTrack) return '#3B82F6'
  return riverState.value.selectedTrack === 'duck' ? '#44EB99' : '#861BE3'
}

const getMainOpacity = () => (riverState.value.selectedTrack ? 0.45 : 0.4)
const getLeftOpacity = () => {
  if (!riverState.value.selectedTrack) return 0.4
  return riverState.value.selectedTrack === 'duck' ? 0.5 : 0.05
}
const getRightOpacity = () => {
  if (!riverState.value.selectedTrack) return 0.4
  return riverState.value.selectedTrack === 'turtle' ? 0.5 : 0.05
}

// Координаты в диапазоне x: ~210-790 внутри viewBox с полями по 150 юнитов с каждой стороны —
// запас под самую широкую обводку (160/2=80 + буфер), чтобы ничего не резалось по краям.
const MAIN_PATH =
  'M 500 600 C 460 700 540 780 500 900 C 460 1020 540 1100 500 1220 ' +
  'C 460 1340 540 1420 500 1500 C 500 1650 500 1800 500 1950 C 500 2130 500 2280 500 2400'

// ЛЕВЫЙ рукав — короче, пологий, крайняя точка x=280 (запас до края viewBox достаточный)
const LEFT_PATH =
  'M 500 2400 C 440 2470 380 2470 330 2560 C 290 2650 270 2760 280 2880 ' +
  'C 288 2980 320 3040 312 3160 C 305 3300 275 3420 292 3560 ' +
  'C 305 3680 350 3760 358 3880 C 362 3950 358 3980 350 4000'

// ПРАВЫЙ рукав — длиннее, извилистее, крайняя точка x=795
const RIGHT_PATH =
  'M 500 2400 C 570 2450 620 2420 670 2500 C 720 2580 730 2660 700 2740 ' +
  'C 670 2820 625 2860 640 2960 C 655 3070 715 3110 740 3220 ' +
  'C 762 3320 745 3420 760 3520 C 775 3610 810 3660 795 3760 ' +
  'C 786 3830 758 3900 750 4000'
</script>

<template>
  <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
    <!-- viewBox с полями по 150 юнитов слева/справа — обводка больше не режется по краям -->
    <svg class="w-full h-full" viewBox="-150 0 1300 4000" preserveAspectRatio="none">
      <defs>
        <!-- шевроны течения: тайл, непрерывно уезжающий вниз вдоль всей реки -->
        <pattern id="flowChevrons" width="46" height="30" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
          <path d="M0,30 L23,4 L46,30" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="6" stroke-linecap="round" />
          <animateTransform attributeName="patternTransform" type="translate" from="0,-30" to="0,0" dur="0.9s" repeatCount="indefinite" />
        </pattern>
        <pattern id="flowChevronsSlow" width="70" height="46" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
          <path d="M0,46 L35,6 L70,46" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="8" stroke-linecap="round" />
          <animateTransform attributeName="patternTransform" type="translate" from="0,-46" to="0,0" dur="1.6s" repeatCount="indefinite" />
        </pattern>
      </defs>

      <!-- Один <g> на КАЖДОЕ русло: цветная подложка + оба слоя волн внутри одной группы,
           так что они всегда двигаются как единое целое и волны не могут "вылезти" за подложку. -->
      <g class="river-branch">
        <path :d="MAIN_PATH" fill="none" :stroke="getRiverColor()" stroke-width="160" stroke-linecap="round" stroke-linejoin="round"
          class="transition-colors duration-1000" :opacity="getMainOpacity()" />
        <path :d="MAIN_PATH" fill="none" stroke="url(#flowChevronsSlow)" stroke-width="150" stroke-linecap="round" :opacity="getMainOpacity()" />
        <path :d="MAIN_PATH" fill="none" stroke="url(#flowChevrons)" stroke-width="90" stroke-linecap="round" :opacity="getMainOpacity()" />
      </g>

      <g class="river-branch">
        <path :d="LEFT_PATH" fill="none" :stroke="getRiverColor()" stroke-width="140" stroke-linecap="round" stroke-linejoin="round"
          class="transition-colors duration-1000" :opacity="getLeftOpacity()" />
        <path :d="LEFT_PATH" fill="none" stroke="url(#flowChevronsSlow)" stroke-width="130" stroke-linecap="round" :opacity="getLeftOpacity()" />
        <path :d="LEFT_PATH" fill="none" stroke="url(#flowChevrons)" stroke-width="76" stroke-linecap="round" :opacity="getLeftOpacity()" />
      </g>

      <g class="river-branch">
        <path :d="RIGHT_PATH" fill="none" :stroke="getRiverColor()" stroke-width="150" stroke-linecap="round" stroke-linejoin="round"
          class="transition-colors duration-1000" :opacity="getRightOpacity()" />
        <path :d="RIGHT_PATH" fill="none" stroke="url(#flowChevronsSlow)" stroke-width="140" stroke-linecap="round" :opacity="getRightOpacity()" />
        <path :d="RIGHT_PATH" fill="none" stroke="url(#flowChevrons)" stroke-width="82" stroke-linecap="round" :opacity="getRightOpacity()" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  #flowChevrons animateTransform,
  #flowChevronsSlow animateTransform {
    display: none;
  }
}
</style>