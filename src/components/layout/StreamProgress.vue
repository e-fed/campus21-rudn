<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DuckSprite from '../shared/DuckSprite.vue'
import TurtleSprite from '../shared/TurtleSprite.vue'
import { useRiverState } from '../../composables/useRiver'
import { isRaining, rainMascots, handleDuckClick } from '../../composables/useDuckRain'
import { trackGoal } from '../../utils/analytics'

gsap.registerPlugin(ScrollTrigger)

const riverState = useRiverState()
// Утка по умолчанию (трек не выбран) или выбранный трек — единый маскот
// для обоих треков (десктопного вертикального и мобильного горизонтального).
const MascotComponent = computed(() =>
  riverState.value.selectedTrack === 'turtle' ? TurtleSprite : DuckSprite
)
const mascotType = computed<'duck' | 'turtle'>(() =>
  riverState.value.selectedTrack === 'turtle' ? 'turtle' : 'duck'
)

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

function killAll() {
  triggers.forEach(t => t.kill())
  triggers = []
  loops.forEach(t => t.kill())
  loops = []
}

/*
 * StreamProgress выполняет двойную роль: это и декоративная сцена (река/маскот,
 * анимируемая через GSAP ScrollTrigger при обычном скролле), и полноценный
 * скроллбар — трек можно кликнуть, чтобы прыгнуть к этой точке страницы, а
 * маскота-бегунка можно тащить, чтобы скроллить страницу вручную (как в
 * CustomScrollbar.vue). Логика скролла и логика GSAP-анимации не конфликтуют:
 * при драге мы напрямую двигаем window.scrollTo, а дальше ScrollTrigger сам
 * подхватывает новую позицию скролла и синхронизирует картинку маскота —
 * то есть визуально всё остаётся согласованным без ручной перезаписи позиций.
 */
const DUCK_SIZE = 40 // px, совпадает с размером маскота-бегунка на десктопе (w-10/h-10)
const DUCK_SIZE_MOBILE = 32 // px, совпадает с мобильным маскотом (w-8/h-8)
const DRAG_TAP_THRESHOLD = 4 // px — меньше этого считаем кликом (пасхалка), не драгом

const isDraggingDesktop = ref(false)
const isDraggingMobile = ref(false)
let dragStartClientPos = 0
let dragStartOffset = 0
let dragMoved = 0

function scrollableHeight() {
  const doc = document.documentElement
  return doc.scrollHeight - doc.clientHeight
}

function scrollToRatio(ratio: number, behavior: ScrollBehavior = 'auto') {
  const scrollable = scrollableHeight()
  if (scrollable <= 0) return
  const clamped = Math.min(1, Math.max(0, ratio))
  window.scrollTo({ top: clamped * scrollable, behavior })
}

// ---------- ДЕСКТОП: вертикальный трек ----------
function desktopMaxOffset() {
  const track = streamRef.value?.clientHeight ?? window.innerHeight
  return Math.max(1, track - DUCK_SIZE)
}

function onDesktopDuckPointerDown(e: PointerEvent) {
  isDraggingDesktop.value = true
  dragMoved = 0
  dragStartClientPos = e.clientY
  dragStartOffset = (gsap.getProperty(duckWrapperRef.value, 'y') as number) || 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onDesktopDuckPointerMove(e: PointerEvent) {
  if (!isDraggingDesktop.value) return
  const delta = e.clientY - dragStartClientPos
  dragMoved = Math.max(dragMoved, Math.abs(delta))
  const maxOffset = desktopMaxOffset()
  const desired = Math.min(maxOffset, Math.max(0, dragStartOffset + delta))
  scrollToRatio(desired / maxOffset)
}

function onDesktopDuckPointerUp(e: PointerEvent) {
  isDraggingDesktop.value = false
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    // pointer capture могла уже быть снята браузером — не критично
  }
  // Почти не двигали палец/мышь — это тап по маскоту, а не перетаскивание:
  // сохраняем прежнее поведение (пасхалка с подпрыгиванием/дождём).
  if (dragMoved < DRAG_TAP_THRESHOLD) {
    handleDuckClick(duckRef.value, mascotType.value)
  }
}

function onDesktopTrackClick(e: MouseEvent) {
  if (!streamRef.value || isDraggingDesktop.value) return
  const rect = streamRef.value.getBoundingClientRect()
  const clickOffset = e.clientY - rect.top - DUCK_SIZE / 2
  const maxOffset = desktopMaxOffset()
  const desired = Math.min(maxOffset, Math.max(0, clickOffset))
  scrollToRatio(desired / maxOffset, 'smooth')
}

// ---------- МОБИЛЬНЫЙ: горизонтальный трек ----------
function mobileMaxOffset() {
  const track = streamMobileRef.value?.clientWidth ?? window.innerWidth
  return Math.max(1, track - DUCK_SIZE_MOBILE)
}

function onMobileDuckPointerDown(e: PointerEvent) {
  isDraggingMobile.value = true
  dragMoved = 0
  dragStartClientPos = e.clientX
  dragStartOffset = (gsap.getProperty(duckMobileWrapperRef.value, 'x') as number) || 0
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onMobileDuckPointerMove(e: PointerEvent) {
  if (!isDraggingMobile.value) return
  const delta = e.clientX - dragStartClientPos
  dragMoved = Math.max(dragMoved, Math.abs(delta))
  const maxOffset = mobileMaxOffset()
  const desired = Math.min(maxOffset, Math.max(0, dragStartOffset + delta))
  scrollToRatio(desired / maxOffset)
}

function onMobileDuckPointerUp(e: PointerEvent) {
  isDraggingMobile.value = false
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    // pointer capture могла уже быть снята браузером — не критично
  }
  if (dragMoved < DRAG_TAP_THRESHOLD) {
    handleDuckClick(duckMobileRef.value, mascotType.value)
  }
}

function onMobileTrackClick(e: MouseEvent) {
  if (!streamMobileRef.value || isDraggingMobile.value) return
  const rect = streamMobileRef.value.getBoundingClientRect()
  const clickOffset = e.clientX - rect.left - DUCK_SIZE_MOBILE / 2
  const maxOffset = mobileMaxOffset()
  const desired = Math.min(maxOffset, Math.max(0, clickOffset))
  scrollToRatio(desired / maxOffset, 'smooth')
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
  <!-- ДЕСКТОП: трек на всю высоту экрана — одновременно декоративная сцена и полноценный
       скроллбар (клик по треку — прыжок, перетаскивание маскота — скролл).
       z-30 (а не z-40, как раньше): шапка сайта — z-40, поэтому верхний отрезок трека,
       который геометрически попадает под шапку, теперь уходит под неё, а не поверх. -->
  <div
    ref="streamRef"
    class="fixed left-2 sm:left-3 top-0 h-screen w-3 sm:w-4 z-30 hidden sm:block py-3 cursor-pointer"
    @click="onDesktopTrackClick"
  >
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

    <!-- Утка/черепаха-бегунок + диалоговый пузырь «Записаться», едут вместе одним контейнером.
         Это и есть "thumb" скроллбара: её можно тащить (pointerdown/move/up), а короткий
         тап без движения по-прежнему запускает пасхалку, как и раньше. -->
    <div
      ref="duckWrapperRef"
      class="absolute top-0 left-1/2 w-9 h-9 sm:w-10 sm:h-10 z-50"
      style="will-change: transform;"
      @click.stop
      @pointerdown="onDesktopDuckPointerDown"
      @pointermove="onDesktopDuckPointerMove"
      @pointerup="onDesktopDuckPointerUp"
      @pointercancel="onDesktopDuckPointerUp"
    >
      <div
        ref="duckRef"
        class="w-full h-full select-none touch-none"
        :class="isDraggingDesktop ? 'cursor-grabbing' : 'cursor-grab'"
      >
        <component :is="MascotComponent" class="w-full h-full" />
      </div>

      <!-- Пузырь сидит справа от маскота на его уровне и указывает "клювом" в голову.
           Появляется только когда доплыл до раздела «О программе» — иначе перекрывает лого. -->
      <a
        href="#register"
        @click="trackGoal('duck_bubble_register_clicked')"
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

  <!-- МОБИЛЬНЫЙ: горизонтальный трек внизу — тоже кликабельный трек + перетаскиваемый маскот -->
  <div
    ref="streamMobileRef"
    class="fixed bottom-4 left-4 right-4 h-3 z-30 sm:hidden cursor-pointer"
    @click="onMobileTrackClick"
  >
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

    <!-- top-0 + yPercent(-78%) в JS: маскот сидит на самой верхней грани трека, как на поверхности реки.
         Как и на десктопе — перетаскивание скроллит страницу, короткий тап запускает пасхалку. -->
    <div
      ref="duckMobileWrapperRef"
      class="absolute left-0 top-0 w-8 h-8 z-50 touch-none"
      style="will-change: transform;"
      @click.stop
      @pointerdown="onMobileDuckPointerDown"
      @pointermove="onMobileDuckPointerMove"
      @pointerup="onMobileDuckPointerUp"
      @pointercancel="onMobileDuckPointerUp"
    >
      <div
        ref="duckMobileRef"
        class="w-full h-full select-none"
        style="will-change: transform;"
      >
        <component :is="MascotComponent" class="w-full h-full" />
      </div>

      <!-- Диалоговый пузырь над маскотом, не разворачивается вместе с ним (текст всегда читаем) -->
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

  <!-- Пасхалка: дождь из уток/черепах — общий composable useDuckRain, тот же, что и раньше
       использовался в DesktopRiverPanel, чтобы не плодить вторую независимую копию логики. -->
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

/* Пасхалка: падающие маскоты */
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