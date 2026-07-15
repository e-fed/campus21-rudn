<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DuckSprite from '../shared/DuckSprite.vue'

gsap.registerPlugin(ScrollTrigger)

const streamRef = ref<HTMLElement | null>(null)
const duckWrapperRef = ref<HTMLElement | null>(null)
const duckRef = ref<HTMLElement | null>(null)

const streamMobileRef = ref<HTMLElement | null>(null)
const duckMobileWrapperRef = ref<HTMLElement | null>(null)
const duckMobileRef = ref<HTMLElement | null>(null)

// Пузырь на десктопе появляется только когда утка "доплыла" до раздела «О программе»,
// чтобы не перекрывать лого в шапке
const showDesktopBubble = ref(false)

let triggers: ScrollTrigger[] = []
let loops: gsap.core.Tween[] = []

// --- Пасхалка: клики по утке → дождь из уток ---
// Фишка бесконечная: после каждого дождя счётчик сбрасывается и выбирается
// новый случайный порог (10..20), так что дождь можно вызывать снова и снова.
let clickCount = 0
let clickThreshold = 10 + Math.floor(Math.random() * 11) // случайно 10..20
const isRaining = ref(false)
const rainDucks = ref<{ id: number; left: number; duration: number; delay: number; size: number; drift: number; spin: number }[]>([])
let rainStopTimer: ReturnType<typeof setTimeout> | null = null

function bounceDuck(el: HTMLElement | null) {
  if (!el) return
  gsap.fromTo(el, { scale: 1 }, { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' })
}

function spawnDuckRain() {
  const count = 80
  const ducks = []
  for (let i = 0; i < count; i++) {
    ducks.push({
      id: Date.now() + i,
      left: Math.random() * 100,
      duration: 2.6 + Math.random() * 2.4,
      delay: Math.random() * 2.2,
      size: 24 + Math.random() * 22,
      drift: (Math.random() - 0.5) * 120,
      spin: (Math.random() - 0.5) * 360,
    })
  }
  rainDucks.value = ducks
  isRaining.value = true

  if (rainStopTimer) clearTimeout(rainStopTimer)
  rainStopTimer = setTimeout(() => {
    isRaining.value = false
    rainDucks.value = []
    // сбрасываем счётчик и выбираем новый случайный порог — можно вызвать дождь ещё раз
    clickCount = 0
    clickThreshold = 10 + Math.floor(Math.random() * 11)
  }, 6500)
}

function handleDuckClick(el: HTMLElement | null) {
  bounceDuck(el)
  if (isRaining.value) return
  clickCount++
  if (clickCount >= clickThreshold) {
    spawnDuckRain()
  }
}

function killAll() {
  triggers.forEach(t => t.kill())
  triggers = []
  loops.forEach(t => t.kill())
  loops = []
}

function setupDesktopAnimation() {
  if (!streamRef.value || !duckWrapperRef.value || !duckRef.value) return

  const containerHeight = streamRef.value.clientHeight
  const duckSize = 40

  const duckMoveTween = gsap.fromTo(
    duckWrapperRef.value,
    { y: 0, xPercent: -50 },
    {
      y: containerHeight - duckSize,
      xPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      },
    }
  )
  if (duckMoveTween.scrollTrigger) triggers.push(duckMoveTween.scrollTrigger)

  const duckFloat = gsap.to(duckRef.value, {
    y: 2.5,
    rotation: 4,
    yoyo: true,
    repeat: -1,
    duration: 1.1,
    ease: 'sine.inOut',
  })
  loops.push(duckFloat)

  // Пузырь-приглашение появляется, только когда снизу показывается раздел с тестом —
  // выше он перекрывал бы лого в шапке.
  const quizSection = document.getElementById('quiz')
  if (quizSection) {
    const bubbleTrigger = ScrollTrigger.create({
      trigger: quizSection,
      start: 'top 85%',
      end: 'bottom top',
      onEnter: () => { showDesktopBubble.value = true },
      onLeaveBack: () => { showDesktopBubble.value = false },
    })
    triggers.push(bubbleTrigger)
  }

  ScrollTrigger.refresh()
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
    setupDesktopAnimation()
    setupMobileAnimation()
  }, 100)
}

onMounted(() => {
  setupDesktopAnimation()
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
  <!-- ДЕСКТОП: трек на всю высоту экрана -->
  <div ref="streamRef" class="fixed left-2 sm:left-3 top-0 h-screen w-3 sm:w-4 z-40 hidden sm:block py-3">
    <div class="relative w-full h-full rounded-full overflow-hidden">
      <svg class="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 20 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="streamGradV" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#44EB99" />
            <stop offset="100%" stop-color="#0087CD" />
          </linearGradient>
          <clipPath id="streamClip">
            <rect x="0" y="0" width="20" height="200" rx="10" />
          </clipPath>
        </defs>
        <g clip-path="url(#streamClip)">
          <rect x="0" y="0" width="20" height="200" fill="url(#streamGradV)" />
          <g class="wave-layer wave-layer--slow">
            <path d="M-20 10 Q-10 4 0 10 T20 10 T40 10 T60 10" stroke="rgba(255,255,255,.45)" stroke-width="2" fill="none" />
            <path d="M-20 60 Q-10 54 0 60 T20 60 T40 60 T60 60" stroke="rgba(255,255,255,.35)" stroke-width="2" fill="none" />
            <path d="M-20 110 Q-10 104 0 110 T20 110 T40 110 T60 110" stroke="rgba(255,255,255,.4)" stroke-width="2" fill="none" />
            <path d="M-20 160 Q-10 154 0 160 T20 160 T40 160 T60 160" stroke="rgba(255,255,255,.3)" stroke-width="2" fill="none" />
          </g>
          <g class="wave-layer wave-layer--fast">
            <path d="M-20 30 Q-10 26 0 30 T20 30 T40 30 T60 30" stroke="rgba(255,255,255,.25)" stroke-width="1.4" fill="none" />
            <path d="M-20 85 Q-10 81 0 85 T20 85 T40 85 T60 85" stroke="rgba(255,255,255,.25)" stroke-width="1.4" fill="none" />
            <path d="M-20 140 Q-10 136 0 140 T20 140 T40 140 T60 140" stroke="rgba(255,255,255,.2)" stroke-width="1.4" fill="none" />
          </g>
        </g>
      </svg>
    </div>

    <!-- Утка-бегунок + диалоговый пузырь «Записаться», едут вместе одним контейнером -->
    <div ref="duckWrapperRef" class="absolute top-0 left-1/2 w-9 h-9 sm:w-10 sm:h-10 z-50" style="will-change: transform;">
      <div
        ref="duckRef"
        class="w-full h-full cursor-pointer select-none"
        @click="handleDuckClick(duckRef)"
      >
        <DuckSprite class="w-full h-full" />
      </div>

      <!-- Пузырь сидит справа от утки на её уровне и указывает "клювом" ей в голову.
           Появляется только когда утка доплыла до раздела «О программе» — иначе перекрывает лого. -->
      <a
        href="#register"
        class="duck-bubble duck-bubble--right absolute top-1/2 left-full -translate-y-1/2 ml-2.5 z-50
               bg-school21 hover:bg-school21dark text-black font-bold
               text-[11px] leading-tight py-1 px-2
               border-2 border-black shadow-pixel-sm
               hover:shadow-none transition-all duration-300
               whitespace-nowrap uppercase"
        :class="showDesktopBubble ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'"
      >
        Записаться!
      </a>
    </div>
  </div>

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
        @click="handleDuckClick(duckMobileRef)"
      >
        <DuckSprite class="w-full h-full" />
      </div>

      <!-- Диалоговый пузырь над уткой, не разворачивается вместе с уткой (текст всегда читаем) -->
      <a
        href="#register"
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

  <!-- Пасхалка: дождь из уток после N кликов по бегунку -->
  <div v-if="isRaining" class="fixed inset-0 z-[9999] overflow-hidden pointer-events-none">
    <div
      v-for="duck in rainDucks"
      :key="duck.id"
      class="duck-rain-item"
      :style="{
        left: duck.left + '%',
        width: duck.size + 'px',
        height: duck.size + 'px',
        animationDuration: duck.duration + 's',
        animationDelay: duck.delay + 's',
        '--drift': duck.drift + 'px',
        '--spin': duck.spin + 'deg',
      }"
    >
      <DuckSprite class="w-full h-full" />
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