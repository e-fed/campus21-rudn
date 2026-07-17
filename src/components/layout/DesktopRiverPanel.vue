<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DuckSprite from '../shared/DuckSprite.vue'
import TurtleSprite from '../shared/TurtleSprite.vue'
import { useRiverState } from '../../composables/useRiver'
import { handleDuckClick } from '../../composables/useDuckRain'
import { isRiverPanelActive } from '../../composables/usePanelState'
import { trackGoal } from '../../utils/analytics'

gsap.registerPlugin(ScrollTrigger)

const riverState = useRiverState()
const MascotComponent = computed(() =>
  riverState.value.selectedTrack === 'turtle' ? TurtleSprite : DuckSprite,
)
const isTurtle = computed(() => riverState.value.selectedTrack === 'turtle')

const showBubble = ref(false)
const trackRef = ref<HTMLElement | null>(null)
const mascotWrapperRef = ref<HTMLElement | null>(null)
const mascotRef = ref<HTMLElement | null>(null)

const MASCOT_SIZE = 56

let st: ScrollTrigger | null = null
let floatLoop: gsap.core.Tween | null = null
let heightObserver: ResizeObserver | null = null
let refreshDebounce: ReturnType<typeof setTimeout> | null = null

function setup() {
  const startEl = document.getElementById('howto')
  const endEl = document.getElementById('register')
  if (!startEl || !endEl || !trackRef.value || !mascotWrapperRef.value || !mascotRef.value) return

  st = ScrollTrigger.create({
    trigger: startEl,
    start: 'top center',
    endTrigger: endEl,
    end: 'bottom center',
    onEnter: () => {
      isRiverPanelActive.value = true
      showBubble.value = true
    },
    onLeave: () => {
      isRiverPanelActive.value = false
      showBubble.value = false
    },
    onEnterBack: () => {
      isRiverPanelActive.value = true
      showBubble.value = true
    },
    onLeaveBack: () => {
      isRiverPanelActive.value = false
      showBubble.value = false
    },
    onUpdate: (self) => {
      if (!trackRef.value || !mascotWrapperRef.value) return
      const trackHeight = trackRef.value.clientHeight
      // Явный clamp — доп. страховка, чтобы маскот физически не мог оказаться
      // за пределами видимого ручейка, даже если self.progress на миг некорректен
      // из-за ещё не отработавшего ScrollTrigger.refresh() после изменения вёрстки выше.
      const maxY = Math.max(0, trackHeight - MASCOT_SIZE)
      const y = gsap.utils.clamp(0, maxY, self.progress * maxY)
      gsap.set(mascotWrapperRef.value, { y })
    },
  })

  floatLoop = gsap.to(mascotRef.value, {
    y: 3,
    rotation: 4,
    yoyo: true,
    repeat: -1,
    duration: 1.1,
    ease: 'sine.inOut',
  })

  // Главный источник бага «маскот убегает»: раскрытие карточек в TracksSection (и любые
  // другие динамические изменения высоты страницы выше по документу) сдвигают #howto
  // и #register относительно документа, но ScrollTrigger кэширует их пиксельные позиции
  // при создании/последнем refresh. Без пересчёта прогресс скролла начинает не совпадать
  // с реальной позицией секций. ResizeObserver на body — самый надёжный способ поймать
  // ЛЮБОЕ изменение высоты страницы (не только раскрытие треков) и вовремя обновить триггер.
  heightObserver = new ResizeObserver(() => {
    if (refreshDebounce) clearTimeout(refreshDebounce)
    refreshDebounce = setTimeout(() => ScrollTrigger.refresh(), 120)
  })
  heightObserver.observe(document.body)

  ScrollTrigger.refresh()
}

function teardown() {
  st?.kill()
  st = null
  floatLoop?.kill()
  floatLoop = null
  heightObserver?.disconnect()
  heightObserver = null
  if (refreshDebounce) clearTimeout(refreshDebounce)
  refreshDebounce = null
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null
function handleResize() {
  if (window.innerWidth < 768) return
  teardown()
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(setup, 100)
}

onMounted(() => {
  setup()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  teardown()
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  isRiverPanelActive.value = false
})

function onMascotClick() {
  // Тип совпадает с тем, что реально отображается сейчас: утка по умолчанию
  // (трек не выбран) или выбранный трек — дождь идёт из того же маскота.
  const mascotType = riverState.value.selectedTrack === 'turtle' ? 'turtle' : 'duck'
  handleDuckClick(mascotRef.value, mascotType)
}

interface PixelRect {
  x: number
  y: number
  w: number
  h: number
}

function buildPixelRows(rows: number[], totalCols: number, unit: number): PixelRect[] {
  return rows.map((cols, i) => ({
    x: ((totalCols - cols) / 2) * unit,
    y: i * unit,
    w: cols * unit,
    h: unit,
  }))
}

// Юнит и сетка увеличены (было 9/14x10, стало 11/18x12) — озёра заметно крупнее.
const UNIT = 11
const COLS = 18
const ROWS = 12

// ГЛАВНОЕ ИЗМЕНЕНИЕ: земля/трава теперь только 1-пиксельная КАЙМА по периметру,
// вода занимает почти весь силуэт (было наоборот — вода была маленьким "озерцом"
// внутри толстого земляного кольца, из-за этого и читалось как "земля").
const grassRows = [4, 10, 14, 16, 18, 18, 18, 18, 18, 16, 14, 4]
const dirtRows = buildOffsetRows([6, 12, 16, 18, 18, 18, 16, 12, 6], 1)
const waterOuterRows = buildOffsetRows([8, 14, 16, 16, 14, 8], 2)
const waterDeepRows = buildOffsetRows([10, 12, 12, 10], 3)

function buildOffsetRows(rows: number[], rowOffset: number): number[] {
  const full = Array.from({ length: ROWS }, () => 0)
  rows.forEach((v, i) => {
    full[i + rowOffset] = v
  })
  return full
}

const grassRects = buildPixelRows(grassRows, COLS, UNIT)
const dirtRects = buildPixelRows(dirtRows, COLS, UNIT).filter((r) => r.w > 0)
const waterOuterRects = buildPixelRows(waterOuterRows, COLS, UNIT).filter((r) => r.w > 0)
const waterDeepRects = buildPixelRows(waterDeepRows, COLS, UNIT).filter((r) => r.w > 0)

const LAKE_VIEWBOX_W = COLS * UNIT
const LAKE_VIEWBOX_H = ROWS * UNIT

const reeds = [
  { x: UNIT, h: UNIT * 2.6 },
  { x: UNIT * 2.4, h: UNIT * 3.4 },
  { x: LAKE_VIEWBOX_W - UNIT * 1.8, h: UNIT * 3 },
  { x: LAKE_VIEWBOX_W - UNIT * 3.2, h: UNIT * 2.2 },
]

// Блики — жёсткие пиксельные квадраты поверх воды (не blur), несколько штук
// по обеим глубинам, чтобы поверхность читалась как рябь, а не плоская заливка.
const shimmerSpots = [
  { x: waterOuterRects[1]?.x ?? 0, y: waterOuterRects[1]?.y ?? 0, w: UNIT * 1.4, dim: false },
  {
    x: (waterOuterRects[2]?.x ?? 0) + UNIT * 3,
    y: (waterOuterRects[2]?.y ?? 0) + UNIT,
    w: UNIT,
    dim: true,
  },
  {
    x: (waterDeepRects[1]?.x ?? 0) + UNIT,
    y: (waterDeepRects[1]?.y ?? 0) + UNIT * 0.5,
    w: UNIT * 1.2,
    dim: false,
  },
  { x: (waterOuterRects[4]?.x ?? 0) + UNIT * 2, y: waterOuterRects[4]?.y ?? 0, w: UNIT, dim: true },
]

const droplets = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: 6 + ((i * 31) % 88),
  delay: (i % 8) * 0.16,
  duration: 0.85 + (i % 3) * 0.15,
  size: 4 + (i % 3) * 2,
}))
</script>

<template>
  <!-- Панель: 170px на md (768-1024px, где меньше всего свободного места до текста),
       260px на lg (1024px+, там гарантированно достаточно gutter'а). -->
  <div
    class="hidden md:flex absolute left-2 lg:left-10 top-0 bottom-0 z-[1] flex-col items-center pointer-events-none river-mask"
    style="width: 170px"
  >
    <div class="lg:!w-[260px] w-full flex flex-col items-center flex-1">
      <!-- ОЗЕРО-СТАРТ -->
      <div
        class="relative w-56 h-32 lg:w-72 lg:h-40 shrink-0 mt-3 border-2 border-black shadow-pixel overflow-hidden"
      >
        <svg
          :viewBox="`0 0 ${LAKE_VIEWBOX_W} ${LAKE_VIEWBOX_H}`"
          class="w-full h-full"
          preserveAspectRatio="none"
          shape-rendering="crispEdges"
        >
          <defs>
            <!-- Вода теперь доминирующий цвет: яркий бирюзово-синий градиент, а не приглушённый -->
            <linearGradient id="lakeTopWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#5EEBC4" />
              <stop offset="45%" stop-color="#12C4E8" />
              <stop offset="100%" stop-color="#0670C9" />
            </linearGradient>
            <linearGradient id="lakeTopDeep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0D5FB8" />
              <stop offset="100%" stop-color="#083E8C" />
            </linearGradient>
          </defs>

          <!-- Трава — только 1-пиксельная кайма по периметру -->
          <rect
            v-for="(r, i) in grassRects"
            :key="'g' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="#4FA23C"
          />
          <!-- Земля — тоже тонкая кайма, на 1 юнит уже -->
          <rect
            v-for="(r, i) in dirtRects"
            :key="'d' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="#7A4E28"
          />
          <!-- Вода — основной массив, светлая версия -->
          <rect
            v-for="(r, i) in waterOuterRects"
            :key="'wo' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="url(#lakeTopWater)"
          />
          <!-- Более тёмное "глубокое" ядро в центре — даёт эффект глубины -->
          <rect
            v-for="(r, i) in waterDeepRects"
            :key="'wd' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="url(#lakeTopDeep)"
            opacity="0.55"
          />

          <!-- Блики: жёсткие квадраты, часть мигает (покадрово), часть статична -->
          <g>
            <rect
              v-for="(s, i) in shimmerSpots"
              :key="'s' + i"
              :x="s.x"
              :y="s.y"
              :width="s.w"
              :height="s.w * 0.4"
              :fill="s.dim ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.75)'"
              :class="s.dim ? 'shimmer-blink shimmer-blink--b' : 'shimmer-blink shimmer-blink--a'"
            />
          </g>

          <g fill="#3E7A2F">
            <rect
              v-for="(reed, i) in reeds"
              :key="i"
              :x="reed.x"
              :y="LAKE_VIEWBOX_H - reed.h - UNIT"
              width="5"
              :height="reed.h"
            />
          </g>
        </svg>
      </div>

      <!-- РУЧЕЁК -->
      <div
        ref="trackRef"
        class="relative w-11 lg:w-14 flex-1 my-0 overflow-hidden border-x-2 border-black"
      >
        <div class="absolute inset-0 stream-base" />
        <div class="absolute inset-0 stream-flow stream-flow--a" />
        <div class="absolute inset-0 stream-flow stream-flow--b" />

        <div class="absolute inset-0 overflow-hidden">
          <span
            v-for="d in droplets"
            :key="d.id"
            class="droplet"
            :style="{
              left: d.left + '%',
              width: d.size + 'px',
              height: d.size + 'px',
              animationDelay: d.delay + 's',
              animationDuration: d.duration + 's',
            }"
          />
        </div>

        <div
          ref="mascotWrapperRef"
          class="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-auto"
          :style="{
            width: MASCOT_SIZE + 'px',
            height: MASCOT_SIZE + 'px',
            willChange: 'transform',
          }"
        >
          <div class="mascot-shadow" />
          <div
            ref="mascotRef"
            class="w-full h-full cursor-pointer select-none relative z-10"
            @click="onMascotClick"
          >
            <component :is="MascotComponent" class="w-full h-full" />
          </div>

          <a
            href="#register"
            @click="trackGoal('duck_bubble_register_clicked', { source: 'desktop_panel' })"
            class="duck-bubble duck-bubble--right absolute top-1/2 left-full -translate-y-1/2 ml-3 bg-school21 hover:bg-school21dark text-black font-bold text-xs leading-tight py-1.5 px-2.5 border-2 border-black shadow-pixel-sm hover:shadow-none transition-all duration-300 whitespace-nowrap uppercase z-20"
            :class="
              showBubble
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-75 pointer-events-none'
            "
          >
            Записаться!
          </a>
        </div>
      </div>

      <!-- ОЗЕРО-ФИНИШ -->
      <div
        class="relative w-56 h-32 lg:w-72 lg:h-40 shrink-0 mb-3 border-2 border-black shadow-pixel overflow-hidden"
      >
        <svg
          :viewBox="`0 0 ${LAKE_VIEWBOX_W} ${LAKE_VIEWBOX_H}`"
          class="w-full h-full"
          preserveAspectRatio="none"
          shape-rendering="crispEdges"
        >
          <defs>
            <linearGradient id="lakeBottomWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0670C9" />
              <stop offset="55%" stop-color="#12C4E8" />
              <stop offset="100%" stop-color="#5EEBC4" />
            </linearGradient>
            <linearGradient id="lakeBottomDeep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#083E8C" />
              <stop offset="100%" stop-color="#0D5FB8" />
            </linearGradient>
          </defs>

          <rect
            v-for="(r, i) in grassRects"
            :key="'g' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="#4FA23C"
          />
          <rect
            v-for="(r, i) in dirtRects"
            :key="'d' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="#7A4E28"
          />
          <rect
            v-for="(r, i) in waterOuterRects"
            :key="'wo' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="url(#lakeBottomWater)"
          />
          <rect
            v-for="(r, i) in waterDeepRects"
            :key="'wd' + i"
            :x="r.x"
            :y="r.y"
            :width="r.w"
            :height="r.h"
            fill="url(#lakeBottomDeep)"
            opacity="0.55"
          />

          <g>
            <rect
              v-for="(s, i) in shimmerSpots"
              :key="'s' + i"
              :x="s.x"
              :y="s.y"
              :width="s.w"
              :height="s.w * 0.4"
              :fill="s.dim ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.75)'"
              :class="s.dim ? 'shimmer-blink shimmer-blink--b' : 'shimmer-blink shimmer-blink--a'"
            />
          </g>

          <g fill="#3E7A2F">
            <rect
              v-for="(reed, i) in reeds"
              :key="i"
              :x="reed.x"
              :y="LAKE_VIEWBOX_H - reed.h - UNIT"
              width="5"
              :height="reed.h"
            />
          </g>

          <g
            :transform="
              isTurtle
                ? `translate(${LAKE_VIEWBOX_W / 2 - 14}, ${LAKE_VIEWBOX_H - UNIT * 3.4}) scale(1.5)`
                : `translate(${LAKE_VIEWBOX_W / 2 - 14}, ${LAKE_VIEWBOX_H - UNIT * 3}) scale(1.5)`
            "
            opacity="0.85"
          >
            <rect v-if="isTurtle" width="26" height="15" fill="#861BE3" />
            <rect v-else width="24" height="13" fill="#F4F4F9" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.river-mask {
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black 40px,
    black calc(100% - 40px),
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0,
    black 40px,
    black calc(100% - 40px),
    transparent 100%
  );
}

/* Покадровое мерцание бликов на воде — два разных ритма, чтобы не мигало синхронно */
.shimmer-blink {
  animation-timing-function: steps(2);
  animation-iteration-count: infinite;
}
.shimmer-blink--a {
  animation-name: shimmer-toggle;
  animation-duration: 1.4s;
}
.shimmer-blink--b {
  animation-name: shimmer-toggle;
  animation-duration: 2.1s;
  animation-delay: 0.3s;
}
@keyframes shimmer-toggle {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0.25;
  }
}

.stream-base {
  background-image: repeating-linear-gradient(
    to bottom,
    #0670c9 0px,
    #0670c9 10px,
    #12c4e8 10px,
    #12c4e8 20px
  );
}
.stream-flow {
  background-repeat: repeat-y;
  animation-timing-function: steps(4);
  animation-iteration-count: infinite;
}
.stream-flow--a {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.55) 0px,
    rgba(255, 255, 255, 0.55) 6px,
    transparent 6px,
    transparent 30px
  );
  background-size: 100% 30px;
  animation-name: stream-shift-a;
  animation-duration: 0.8s;
}
.stream-flow--b {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.32) 0px,
    rgba(255, 255, 255, 0.32) 4px,
    transparent 4px,
    transparent 18px
  );
  background-size: 100% 18px;
  animation-name: stream-shift-b;
  animation-duration: 0.5s;
}
@keyframes stream-shift-a {
  from {
    background-position-y: -30px;
  }
  to {
    background-position-y: 0;
  }
}
@keyframes stream-shift-b {
  from {
    background-position-y: -18px;
  }
  to {
    background-position-y: 0;
  }
}

.droplet {
  position: absolute;
  top: -10px;
  background: rgba(255, 255, 255, 0.85);
  animation-name: droplet-fall;
  animation-timing-function: steps(6);
  animation-iteration-count: infinite;
}
@keyframes droplet-fall {
  0% {
    transform: translateY(-10px);
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    transform: translateY(340px);
    opacity: 0;
  }
}

.mascot-shadow {
  position: absolute;
  left: 50%;
  bottom: -4px;
  width: 60%;
  height: 6px;
  background: rgba(0, 0, 0, 0.35);
  transform: translateX(-50%);
}

@media (prefers-reduced-motion: reduce) {
  .stream-flow,
  .droplet,
  .shimmer-blink {
    animation: none !important;
  }
}

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
</style>
