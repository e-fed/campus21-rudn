<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Десктоп элементы
const streamRef = ref<HTMLElement | null>(null)
const waterRef = ref<HTMLElement | null>(null)
const duckWrapperRef = ref<HTMLElement | null>(null)
const duckRef = ref<HTMLElement | null>(null)

// Мобильные элементы
const streamMobileRef = ref<HTMLElement | null>(null)
const waterMobileRef = ref<HTMLElement | null>(null)
const duckMobileRef = ref<HTMLElement | null>(null)

let triggers: ScrollTrigger[] = []
let tweens: gsap.core.Tween[] = []

function killAll() {
  triggers.forEach(t => t.kill())
  triggers = []
  tweens.forEach(t => t.kill())
  tweens = []
}

function setupDesktopAnimation() {
  if (!streamRef.value || !waterRef.value || !duckWrapperRef.value || !duckRef.value) return

  const containerHeight = streamRef.value.clientHeight
  const duckSize = 48

  // Вода
  const waterTween = gsap.fromTo(waterRef.value,
    { height: '0%' },
    {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    }
  )
  tweens.push(waterTween)
  const st = ScrollTrigger.getAll().find(t => t.vars?.trigger === document.body && t.vars?.start === 'top top')
  if (st) triggers.push(st)

  // Утка
  const duckMoveTween = gsap.fromTo(duckWrapperRef.value,
    { y: containerHeight - duckSize },
    {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    }
  )
  tweens.push(duckMoveTween)

  // Покачивание (только десктоп)
  const duckWobble = gsap.to(duckRef.value, {
    y: 3,
    rotation: 5,
    yoyo: true,
    repeat: -1,
    duration: 0.4,
    ease: 'steps(4)'
  })
  tweens.push(duckWobble)

  ScrollTrigger.refresh()
}

function setupMobileAnimation() {
  if (!streamMobileRef.value || !waterMobileRef.value || !duckMobileRef.value) return

  const containerWidth = streamMobileRef.value.clientWidth
  const duckSize = 32

  // Вода
  const waterTween = gsap.fromTo(waterMobileRef.value,
    { width: '0%' },
    {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    }
  )
  tweens.push(waterTween)
  const st = ScrollTrigger.getAll().find(t => t.vars?.trigger === document.body && t.vars?.start === 'top top')
  if (st) triggers.push(st)

  // Утка (без покачивания, просто горизонтальное движение)
  const duckMoveTween = gsap.fromTo(duckMobileRef.value,
    { x: 0 },
    {
      x: containerWidth - duckSize,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
      }
    }
  )
  tweens.push(duckMoveTween)

  ScrollTrigger.refresh()
}

function handleResize() {
  killAll()
  setTimeout(() => {
    setupDesktopAnimation()
    setupMobileAnimation()
  }, 100)
}

onMounted(() => {
  setupDesktopAnimation()
  setupMobileAnimation()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  killAll()
})
</script>

<template>
  <!-- ДЕСКТОП: вертикальный ручеёк слева -->
  <div
    ref="streamRef"
    class="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 h-[60vh] w-2 sm:w-4 z-40 hidden sm:block"
  >
    <div class="absolute inset-0 border-2 border-black bg-gray-200 dark:bg-gray-800 shadow-pixel"></div>

    <div
      ref="waterRef"
      class="absolute bottom-0 left-0 right-0 h-0 bg-school21 dark:bg-school21 border-r-2 border-l-2 border-black"
    >
      <div class="absolute top-0 left-0 right-0 h-2 bg-white/40 animate-pulse"></div>
    </div>

    <div
      ref="duckWrapperRef"
      class="absolute top-0 left-1/2 w-10 h-10 sm:w-12 sm:h-12 z-50"
      style="transform: translateX(-50%); will-change: transform;"
    >
      <div ref="duckRef" class="w-full h-full drop-shadow-md">
        <svg viewBox="0 0 16 16" class="w-full h-full" shape-rendering="crispEdges">
          <rect x="4" y="8" width="8" height="6" fill="#FFD700" />
          <rect x="3" y="9" width="10" height="4" fill="#FFD700" />
          <rect x="5" y="4" width="6" height="5" fill="#FFD700" />
          <rect x="10" y="6" width="4" height="2" fill="#FF8C00" />
          <rect x="8" y="5" width="1" height="1" fill="#000000" />
          <rect x="5" y="10" width="4" height="2" fill="#E6C200" />
          <rect x="2" y="9" width="2" height="2" fill="#E6C200" />
        </svg>
      </div>
    </div>
  </div>

  <!-- МОБИЛЬНЫЙ: горизонтальный ручеёк внизу (утка над баром, без тряски) -->
  <div
    ref="streamMobileRef"
    class="fixed bottom-4 left-4 right-4 h-3 z-30 sm:hidden"
  >
    <div class="absolute inset-0 border-2 border-black bg-gray-200 dark:bg-gray-800 shadow-pixel"></div>

    <div
      ref="waterMobileRef"
      class="absolute left-0 top-0 bottom-0 w-0 bg-school21 dark:bg-school21 border-t-2 border-b-2 border-black"
    >
      <div class="absolute right-0 top-0 bottom-0 w-2 bg-white/40 animate-pulse"></div>
    </div>

    <!-- Утка над баром (top: -20px) -->
    <div
      ref="duckMobileRef"
      class="absolute w-8 h-8 z-50"
      style="left: 0; top: -20px; will-change: transform;"
    >
      <svg viewBox="0 0 16 16" class="w-full h-full drop-shadow-md" shape-rendering="crispEdges">
        <rect x="4" y="8" width="8" height="6" fill="#FFD700" />
        <rect x="3" y="9" width="10" height="4" fill="#FFD700" />
        <rect x="5" y="4" width="6" height="5" fill="#FFD700" />
        <rect x="10" y="6" width="4" height="2" fill="#FF8C00" />
        <rect x="8" y="5" width="1" height="1" fill="#000000" />
        <rect x="5" y="10" width="4" height="2" fill="#E6C200" />
        <rect x="2" y="9" width="2" height="2" fill="#E6C200" />
      </svg>
    </div>
  </div>
</template>