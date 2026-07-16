<script setup lang="ts">
import { trackGoal } from '../../utils/analytics'
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DuckSprite from '../shared/DuckSprite.vue'
import TurtleSprite from '../shared/TurtleSprite.vue'
import { isRaining, rainMascots, handleDuckClick } from '../../composables/useDuckRain'

gsap.registerPlugin(ScrollTrigger)

const streamMobileRef = ref<HTMLElement | null>(null)
const duckMobileWrapperRef = ref<HTMLElement | null>(null)
const duckMobileRef = ref<HTMLElement | null>(null)

let triggers: ScrollTrigger[] = []
let loops: gsap.core.Tween[] = []

function killAll() {
  triggers.forEach(t => t.kill())
  triggers = []
  loops.forEach(t => t.kill())
  loops = []
}

function setupMobileAnimation() {
  if (!streamMobileRef.value || !duckMobileWrapperRef.value || !duckMobileRef.value) return

  const duckSize = 32
  // Утка "плывёт" по самой верхней грани трека: почти всё её тело выше линии реки,
  // и только небольшая часть — как будто ватерлиния — лежит на треке.
  const rideYPercent = -78

  // Стартовая позиция сразу, не дожидаясь первого скролла
  gsap.set(duckMobileWrapperRef.value, { x: 0, yPercent: rideYPercent })
  gsap.set(duckMobileRef.value, { scaleX: 1 })

  let facing = 1 // 1 — плывёт вправо (вниз по странице), -1 — развернулась и плывёт влево (вверх)

  // Ширина трека пересчитывается на каждом апдейте скролла (а не один раз при mount),
  // иначе при неточном/устаревшем clientWidth утка "залипает" примерно в середине трека
  // и не выглядит так, будто она плывёт по нему до самого края.
  const st = ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: self => {
      if (!streamMobileRef.value || !duckMobileWrapperRef.value || !duckMobileRef.value) return

      const containerWidth = streamMobileRef.value.clientWidth
      const x = self.progress * (containerWidth - duckSize)
      gsap.set(duckMobileWrapperRef.value, { x, yPercent: rideYPercent })

      // Разворачиваем утку, когда меняется направление скролла — "плывёт обратно"
      const direction = self.direction === 1 ? 1 : -1
      if (direction !== facing) {
        facing = direction
        gsap.to(duckMobileRef.value, {
          scaleX: facing,
          duration: 0.35,
          ease: 'power1.out',
        })
      }
    },
  })
  triggers.push(st)

  const duckFloat = gsap.to(duckMobileRef.value, {
    y: 2,
    yoyo: true,
    repeat: -1,
    duration: 1.1,
    ease: 'sine.inOut',
  })
  loops.push(duckFloat)

  ScrollTrigger.refresh()
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  killAll()
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    setupMobileAnimation()
  }, 100)
}

onMounted(() => {
  setupMobileAnimation()
  window.addEventListener('resize', handleResize)
  window.visualViewport?.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.visualViewport?.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  killAll()
})
</script>

<template>
  <!-- МОБИЛЬНЫЙ: горизонтальный трек внизу -->
  <div ref="streamMobileRef" class="fixed bottom-4 left-4 right-4 h-3 z-30 sm:hidden">
    <svg class="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 200 20" preserveAspectRatio="none">
      <defs>
        <linearGradient id="streamGradH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#44EB99" />
          <stop offset="100%" stop-color="#0087CD" />
        </linearGradient>
        <clipPath id="streamClipH">
          <rect x="0" y="0" width="200" height="20" rx="10" />
        </clipPath>
      </defs>
      <g clip-path="url(#streamClipH)">
        <rect x="0" y="0" width="200" height="20" fill="url(#streamGradH)" />
        <g class="wave-layer wave-layer--slow wave-layer--horizontal">
          <path d="M10 -20 Q4 -10 10 0 T10 20 T10 40 T10 60" stroke="rgba(255,255,255,.4)" stroke-width="2" fill="none" />
          <path d="M100 -20 Q94 -10 100 0 T100 20 T100 40 T100 60" stroke="rgba(255,255,255,.3)" stroke-width="2" fill="none" />
          <path d="M180 -20 Q174 -10 180 0 T180 20 T180 40 T180 60" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none" />
        </g>
      </g>
    </svg>

    <!-- top-0 + yPercent(-78%) в JS: утка сидит на самой верхней грани трека, как на поверхности реки -->
    <div ref="duckMobileWrapperRef" class="absolute left-0 top-0 w-8 h-8 z-50" style="will-change: transform;">
      <div
        ref="duckMobileRef"
        class="w-full h-full cursor-pointer select-none"
        style="will-change: transform;"
        @click="handleDuckClick(duckMobileRef, 'duck')"
      >
        <DuckSprite class="w-full h-full" />
      </div>

      <!-- Диалоговый пузырь над уткой, не разворачивается вместе с уткой (текст всегда читаем) -->
      <a
        href="#register"
        @click="trackGoal('duck_bubble_register_clicked')"
        class="duck-bubble duck-bubble--down absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-auto
               bg-school21 hover:bg-school21dark text-black font-bold
               text-[9px] leading-none py-1 px-1.5
               border-2 border-black shadow-pixel-sm
               hover:shadow-none transition-all
               whitespace-nowrap uppercase"
      >
        Записаться!
      </a>
    </div>
  </div>

  <!-- Пасхалка: дождь из уток или черепах — тип каждой капли задан при спавне
       (клик по утке -> дождь из уток, клик по черепахе -> дождь из черепах) -->
  <div v-if="isRaining" class="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
    <div
      v-for="mascot in rainMascots"
      :key="mascot.id"
      class="duck-rain-item"
      :style="{
        left: mascot.left + '%',
        width: mascot.size + 'px',
        height: mascot.size + 'px',
        animationDuration: mascot.duration + 's',
        animationDelay: mascot.delay + 's',
        '--drift': mascot.drift + 'px',
        '--spin': mascot.spin + 'deg',
      }"
    >
      <TurtleSprite v-if="mascot.type === 'turtle'" class="w-full h-full" />
      <DuckSprite v-else class="w-full h-full" />
    </div>
  </div>
</template>

<style scoped>
.wave-layer path {
  vector-effect: non-scaling-stroke;
}
.wave-layer--slow { animation: flow-x 2.6s linear infinite; }
.wave-layer--fast { animation: flow-x 1.4s linear infinite; }
.wave-layer--horizontal { animation: flow-y 2.6s linear infinite; }
@keyframes flow-x { from { transform: translateX(0); } to { transform: translateX(20px); } }
@keyframes flow-y { from { transform: translateY(0); } to { transform: translateY(20px); } }

@media (prefers-reduced-motion: reduce) {
  .wave-layer { animation: none !important; }
}

/* Диалоговый пузырь-хвостик в пиксельном стиле: двойной треугольник
   (чуть больший чёрный "снизу" + цветной поверх) имитирует 2px обводку. */
.duck-bubble {
  position: absolute;
}

.duck-bubble--right::before,
.duck-bubble--right::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
}
.duck-bubble--right::before {
  left: -10px;
  border-style: solid;
  border-width: 7px 10px 7px 0;
  border-color: transparent black transparent transparent;
}
.duck-bubble--right::after {
  left: -7px;
  border-style: solid;
  border-width: 5px 7px 5px 0;
  border-color: transparent var(--color-school21) transparent transparent;
}

.duck-bubble--down::before,
.duck-bubble--down::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
}
.duck-bubble--down::before {
  bottom: -9px;
  border-style: solid;
  border-width: 9px 6px 0 6px;
  border-color: black transparent transparent transparent;
}
.duck-bubble--down::after {
  bottom: -6px;
  border-style: solid;
  border-width: 6px 4px 0 4px;
  border-color: var(--color-school21) transparent transparent transparent;
}

/* Пасхалка: падающие утки */
.duck-rain-item {
  position: absolute;
  top: -60px;
  animation-name: duck-fall;
  animation-timing-function: linear;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
  will-change: transform;
}
@keyframes duck-fall {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift), 115vh) rotate(var(--spin));
    opacity: 0.9;
  }
}

@media (prefers-reduced-motion: reduce) {
  .duck-rain-item { animation: none !important; display: none; }
}
</style>