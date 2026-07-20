<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/*
 * Нативный скроллбар браузера рисуется отдельным слоем поверх ВСЕЙ страницы
 * (это часть UI браузера, а не DOM), поэтому средствами CSS z-index нельзя
 * "спрятать" его верхний кусок под фиксированную шапку — он физически не
 * является элементом страницы. Чтобы получить то, что просят (скроллбар,
 * который можно тащить, и который в верхней части уходит под шапку), нужен
 * свой, полностью кастомный скроллбар — обычный div с абсолютным
 * позиционированием, которым можно управлять как любым другим слоем сайта.
 *
 * Логика:
 *  - Нативный скроллбар скрывается глобально (см. main.css: scrollbar-width:
 *    none / ::-webkit-scrollbar { display:none }) — сам скролл (колесо мыши,
 *    свайп, стрелки, Page Up/Down) при этом продолжает работать как обычно,
 *    скрывается только его визуальная полоса.
 *  - Этот компонент рисует свой трек и бегунок (thumb) той же ширины у
 *    правого края экрана.
 *  - Высота и позиция бегунка пересчитываются от scrollY/scrollHeight.
 *  - Бегунок можно зажать (mousedown/touchstart) и тащить — скроллит страницу.
 *  - Клик по треку вне бегунка — прыжок на страницу вверх/вниз (как в
 *    нативных скроллбарах при клике по пустому треку).
 */

const THUMB_MIN_HEIGHT = 40 // px — чтобы на длинных страницах бегунок не становился точкой

const thumbTop = ref(0)
const thumbHeight = ref(THUMB_MIN_HEIGHT)
const isDragging = ref(false)
const trackRef = ref<HTMLElement | null>(null)

let dragStartY = 0
let dragStartScrollTop = 0
let rafId: number | null = null

function trackHeight() {
  return trackRef.value?.clientHeight ?? window.innerHeight
}

function updateThumb() {
  const doc = document.documentElement
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  const track = trackHeight()

  if (scrollHeight <= 0) {
    thumbHeight.value = track
    thumbTop.value = 0
    return
  }

  const ratio = doc.clientHeight / doc.scrollHeight
  thumbHeight.value = Math.max(THUMB_MIN_HEIGHT, track * ratio)

  const maxThumbTop = track - thumbHeight.value
  const scrollRatio = window.scrollY / scrollHeight
  thumbTop.value = maxThumbTop * scrollRatio
}

function onScrollOrResize() {
  if (rafId !== null) return
  rafId = requestAnimationFrame(() => {
    updateThumb()
    rafId = null
  })
}

function scrollToThumbTop(desiredThumbTop: number, behavior: ScrollBehavior = 'instant') {
  const doc = document.documentElement
  const scrollHeight = doc.scrollHeight - doc.clientHeight
  const track = trackHeight()
  const maxThumbTop = Math.max(1, track - thumbHeight.value)
  const clamped = Math.min(Math.max(0, desiredThumbTop), maxThumbTop)
  const scrollRatio = clamped / maxThumbTop
  window.scrollTo({ top: scrollRatio * scrollHeight, behavior })
}

function onThumbPointerDown(e: PointerEvent) {
  isDragging.value = true
  dragStartY = e.clientY
  dragStartScrollTop = thumbTop.value
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  e.preventDefault()
}

function onThumbPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  const delta = e.clientY - dragStartY
  scrollToThumbTop(dragStartScrollTop + delta)
}

function onThumbPointerUp(e: PointerEvent) {
  isDragging.value = false
  try {
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  } catch {
    // pointer capture могла уже быть снята браузером — не критично
  }
}

// Клик по треку (не по бегунку) — скачок на страницу вверх/вниз к точке клика
function onTrackClick(e: MouseEvent) {
  if (!trackRef.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const clickY = e.clientY - rect.top
  const desiredThumbTop = clickY - thumbHeight.value / 2
  scrollToThumbTop(desiredThumbTop, 'smooth')
}

onMounted(() => {
  updateThumb()
  window.addEventListener('scroll', onScrollOrResize, { passive: true })
  window.addEventListener('resize', onScrollOrResize)
  // Контент секций раскрывается динамически (квиз, треки) — следим за высотой документа
  const resizeObserver = new ResizeObserver(onScrollOrResize)
  resizeObserver.observe(document.body)
  ;(onScrollOrResize as unknown as { _ro?: ResizeObserver })._ro = resizeObserver
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScrollOrResize)
  window.removeEventListener('resize', onScrollOrResize)
  if (rafId !== null) cancelAnimationFrame(rafId)
  const ro = (onScrollOrResize as unknown as { _ro?: ResizeObserver })._ro
  ro?.disconnect()
})
</script>

<template>
  <!--
    z-30: сознательно НИЖЕ шапки (AppHeader — z-40). Благодаря этому верхний
    отрезок трека, который геометрически попадает под шапку (первые ~64px),
    визуально уходит под неё — ровно то поведение, которое нужно.
  -->
  <div
    ref="trackRef"
    class="hidden sm:block fixed top-0 right-0 bottom-0 z-30 w-3 lg:w-4"
    @click="onTrackClick"
  >
    <!-- Трек -->
    <div class="absolute inset-y-0 right-0 w-2 lg:w-2.5 bg-black/10 dark:bg-white/10" />

    <!-- Бегунок -->
    <div
      class="absolute right-0 w-2 lg:w-2.5 border-2 border-black bg-gradient-to-b from-school21 to-school21purple cursor-grab active:cursor-grabbing transition-[opacity] shadow-pixel-sm"
      :class="isDragging ? 'opacity-100' : 'opacity-80 hover:opacity-100'"
      :style="{ top: thumbTop + 'px', height: thumbHeight + 'px' }"
      @pointerdown="onThumbPointerDown"
      @pointermove="onThumbPointerMove"
      @pointerup="onThumbPointerUp"
      @pointercancel="onThumbPointerUp"
    />
  </div>
</template>