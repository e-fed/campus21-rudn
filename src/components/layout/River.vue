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

const MAIN_PATH =
  'M 500 600 C 460 700 540 780 500 900 C 460 1020 540 1100 500 1220 ' +
  'C 460 1340 540 1420 500 1500 C 500 1650 500 1800 500 1950 C 500 2130 500 2280 500 2400'

const LEFT_PATH =
  'M 500 2400 C 440 2470 380 2470 330 2560 C 290 2650 270 2760 280 2880 ' +
  'C 288 2980 320 3040 312 3160 C 305 3300 275 3420 292 3560 ' +
  'C 305 3680 350 3760 358 3880 C 362 3950 358 3980 350 4000'

const RIGHT_PATH =
  'M 500 2400 C 570 2450 620 2420 670 2500 C 720 2580 730 2660 700 2740 ' +
  'C 670 2820 625 2860 640 2960 C 655 3070 715 3110 740 3220 ' +
  'C 762 3320 745 3420 760 3520 C 775 3610 810 3660 795 3760 ' +
  'C 786 3830 758 3900 750 4000'
</script>

<template>
  <!--
    ВАЖНО: только md+ — на узких ширинах (в т.ч. когда DevTools обрезает viewport
    ниже md) секции AboutSection/QuickQuiz/TracksSection переверстываются в
    мобильную раскладку и их суммарная высота меняется непропорционально фиксированным
    Y-опорным точкам пути (развилка и т.д.) — река визуально "съезжает" относительно
    контента. Проще и надёжнее не рендерить декоративный слой на этих ширинах,
    чем пытаться пересчитывать путь под каждую раскладку.
  -->
  <div class="hidden md:block absolute inset-0 pointer-events-none z-0 overflow-hidden">
    <svg class="w-full h-full" viewBox="-150 0 1300 4000" preserveAspectRatio="none">
      <defs>
        <pattern id="flowChevrons" width="46" height="30" patternUnits="userSpaceOnUse">
          <path
            d="M0,30 L23,4 L46,30"
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            stroke-width="6"
            stroke-linecap="round"
          />
        </pattern>
        <pattern id="flowChevronsSlow" width="70" height="46" patternUnits="userSpaceOnUse">
          <path
            d="M0,46 L35,6 L70,46"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            stroke-width="8"
            stroke-linecap="round"
          />
        </pattern>
        <!-- клип по каждому руслу, чтобы CSS-анимированные волны не вылезали за пределы обводки -->
        <clipPath id="clipMain">
          <path :d="MAIN_PATH" stroke-width="160" fill="none" stroke-linecap="round" />
        </clipPath>
      </defs>

      <g class="river-branch">
        <path
          :d="MAIN_PATH"
          fill="none"
          :stroke="getRiverColor()"
          stroke-width="160"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-colors duration-1000"
          :opacity="getMainOpacity()"
        />
        <!-- течение теперь через CSS transform на <g>, а не SMIL animateTransform -->
        <g class="flow-layer flow-layer--slow" :opacity="getMainOpacity()">
          <path
            :d="MAIN_PATH"
            fill="none"
            stroke="url(#flowChevronsSlow)"
            stroke-width="150"
            stroke-linecap="round"
          />
        </g>
        <g class="flow-layer flow-layer--fast" :opacity="getMainOpacity()">
          <path
            :d="MAIN_PATH"
            fill="none"
            stroke="url(#flowChevrons)"
            stroke-width="90"
            stroke-linecap="round"
          />
        </g>
      </g>

      <g class="river-branch">
        <path
          :d="LEFT_PATH"
          fill="none"
          :stroke="getRiverColor()"
          stroke-width="140"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-colors duration-1000"
          :opacity="getLeftOpacity()"
        />
        <g class="flow-layer flow-layer--slow" :opacity="getLeftOpacity()">
          <path
            :d="LEFT_PATH"
            fill="none"
            stroke="url(#flowChevronsSlow)"
            stroke-width="130"
            stroke-linecap="round"
          />
        </g>
        <g class="flow-layer flow-layer--fast" :opacity="getLeftOpacity()">
          <path
            :d="LEFT_PATH"
            fill="none"
            stroke="url(#flowChevrons)"
            stroke-width="76"
            stroke-linecap="round"
          />
        </g>
      </g>

      <g class="river-branch">
        <path
          :d="RIGHT_PATH"
          fill="none"
          :stroke="getRiverColor()"
          stroke-width="150"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-colors duration-1000"
          :opacity="getRightOpacity()"
        />
        <g class="flow-layer flow-layer--slow" :opacity="getRightOpacity()">
          <path
            :d="RIGHT_PATH"
            fill="none"
            stroke="url(#flowChevronsSlow)"
            stroke-width="140"
            stroke-linecap="round"
          />
        </g>
        <g class="flow-layer flow-layer--fast" :opacity="getRightOpacity()">
          <path
            :d="RIGHT_PATH"
            fill="none"
            stroke="url(#flowChevrons)"
            stroke-width="82"
            stroke-linecap="round"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
/* CSS вместо SMIL — надёжно переживает переключение DevTools / смену режима отрисовки */
.flow-layer {
  animation: flow-move 1.4s linear infinite;
}
.flow-layer--slow {
  animation-duration: 2.2s;
}
.flow-layer--fast {
  animation-duration: 1.1s;
}
@keyframes flow-move {
  from {
    transform: translateY(-46px);
  }
  to {
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .flow-layer {
    animation: none !important;
  }
}

/* Защитный дубль: сама река уже не рендерится на <md (hidden md:block на корневом
   div — см. template), поэтому анимация физически не выполняется браузером.
   Правило ниже — просто страховка на случай, если в будущем div-обёртку
   изменят и уберут hidden, не заметив, что анимация должна остаться md+. */
@media (max-width: 767px) {
  .flow-layer {
    animation: none !important;
  }
}
</style>
