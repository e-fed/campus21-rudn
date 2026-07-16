<template>
  <section id="howto" class="relative py-10 sm:py-16 px-4 border-t-2 border-black overflow-hidden">
    <!-- Фон секции вынесен в отдельный слой z-0 (а не на сам <section>), чтобы река
         (z-[1] в общем isolate-контексте обёртки в App.vue) могла лечь поверх фона,
         но при этом контент секции (z-10 ниже) всё равно оставался выше реки. -->
    <div class="absolute inset-0 z-0 pointer-events-none bg-gray-100/95 dark:bg-[#161D27]/95" />

    <div class="relative z-10 max-w-5xl mx-auto">
      <h2 class="text-3xl sm:text-5xl font-bold uppercase text-center mb-3">Как поступить</h2>
      <p class="text-center text-gray-600 dark:text-gray-400 mb-10 sm:mb-14">Шесть шагов от регистрации до первого дня в кампусе</p>

      <div class="relative" ref="roadmap">
        <svg ref="svgContainer" class="absolute inset-0 w-full h-full pointer-events-none z-0 hidden md:block" preserveAspectRatio="none"></svg>

        <!-- Маскоты, блуждающие по всей секции -->
        <div class="absolute inset-0 z-20 pointer-events-none hidden md:block" ref="mascotsContainer">
          <!-- Утка – стартует справа сверху -->
          <div
            ref="duckRef"
            class="absolute w-16 h-16 opacity-80 pointer-events-auto cursor-pointer"
            style="top: 10%; left: 80%;"
            @mouseenter="jumpAway(duckRef)"
          >
            <DuckSprite class="w-12 h-12" />
          </div>
          <!-- Черепаха – стартует слева снизу -->
          <div
            ref="turtleRef"
            class="absolute w-16 h-16 opacity-80 pointer-events-auto cursor-pointer"
            style="top: 85%; left: 10%;"
            @mouseenter="jumpAway(turtleRef)"
          >
            <TurtleSprite class="w-14 h-14 sm:w-16 sm:h-16" />
          </div>
        </div>

        <div class="relative z-10 space-y-16">
          <div
            v-for="(step, index) in steps"
            :key="step.num"
            :ref="el => { if (el) cardRefs[index] = el as HTMLElement }"
            class="step-card bg-white dark:bg-darkBg border-2 border-black shadow-pixel p-5 sm:p-6 max-w-md mx-auto md:mx-0 opacity-0 transition-all duration-300 ease-out"
            :class="{
              'md:ml-0 md:mr-auto': index % 2 === 0,
              'md:ml-auto md:mr-0': index % 2 === 1,
              'is-visible': cardVisible[index]
            }"
          >
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-school21 border-2 border-black flex items-center justify-center font-bold text-2xl text-black">
                {{ step.num }}
              </div>
              <div>
                <h3 class="text-xl font-bold uppercase mb-2">{{ step.title }}</h3>
                <p class="text-base sm:text-lg">{{ step.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-14 bg-white dark:bg-darkBg border-2 border-black shadow-pixel p-6 opacity-0 transition-all duration-300 ease-out" :class="{ 'is-visible': cardsReady }">
        <h3 class="text-2xl font-bold uppercase mb-4 text-center">Критерии отбора</h3>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 text-center">
          Отборочные испытания на оба образовательных трека проходят в одном месте и в одно время, но зарегистрироваться можно только на один!
        </p>
        <ol class="space-y-3 list-decimal list-inside text-base sm:text-lg">
          <li>Для «ИИ-инженер» требуются знания базового Python</li>
          <li>Для «Цифрового заказчика» нужна цифровая грамотность и логика</li>
          <li>На момент обучения необходимо быть студентом или сотрудником РУДН</li>
        </ol>
      </div>

      <div class="mt-8 bg-school21/10 dark:bg-school21/20 border-2 border-black p-6 text-center opacity-0 transition-all duration-300 ease-out" :class="{ 'is-visible': cardsReady }">
        <p class="font-bold uppercase mb-2">Даты отборочных испытаний:</p>
        <p class="text-base sm:text-lg">1 — 4 июля, 29 сентября — 2 октября, 13 — 16 октября, 27 — 30 октября</p>
        <p class="font-bold uppercase mt-4 mb-2">Старт основного обучения:</p>
        <p class="text-2xl font-bold text-school21">18 ноября 2026</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DuckSprite from '../shared/DuckSprite.vue'
import TurtleSprite from '../shared/TurtleSprite.vue'
import { trackGoal } from '../../utils/analytics'

const steps = [
  { num: 1, title: 'Регистрация', desc: 'Зарегистрироваться в личном кабинете.' },
  { num: 2, title: 'Выбор времени', desc: 'Выбрать удобное время установочной встречи в личном кабинете после регистрации.' },
  { num: 3, title: 'Установочная встреча', desc: 'Прийти на установочную встречу в кампусе или подключиться онлайн и получить информацию, необходимую для выбора трека обучения.' },
  { num: 4, title: 'Отборочный этап', desc: 'Пройти отборочный этап на свой трек: 4 дня очно в новом кампусе «Школы 21» и РУДН. Отборочные испытания на оба трека проходят в одном месте и в одно время, но зарегистрироваться можно только на один!' },
  { num: 5, title: 'Ожидание результатов', desc: 'Дождаться результатов отбора.' },
  { num: 6, title: 'Начало обучения', desc: 'Начать свой путь — уже в этом семестре.' }
]

const cardRefs = ref<HTMLElement[]>([])
const cardVisible = ref<boolean[]>([false, false, false, false, false, false])
const cardsReady = ref(false)
const svgContainer = ref<SVGSVGElement | null>(null)
const roadmap = ref<HTMLElement | null>(null)

const duckRef = ref<HTMLElement | null>(null)
const turtleRef = ref<HTMLElement | null>(null)
let duckInterval: number | null = null
let turtleInterval: number | null = null

let observer: IntersectionObserver | null = null
let animationStarted = false

function getCardCenter(card: HTMLElement, container: HTMLElement): { x: number; y: number } {
  const cardRect = card.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()
  return {
    x: cardRect.left - containerRect.left + cardRect.width / 2,
    y: cardRect.top - containerRect.top + cardRect.height / 2
  }
}

function animateDashedCurve(
  from: { x: number; y: number },
  to: { x: number; y: number },
  onHalfway?: () => void,
  onComplete?: () => void
) {
  if (!svgContainer.value) {
    if (onHalfway) setTimeout(onHalfway, 150)
    if (onComplete) setTimeout(onComplete, 400)
    return
  }

  const svg = svgContainer.value
  const cp1x = from.x + (to.x - from.x) * (0.3 + Math.random() * 0.4)
  const cp1y = from.y + (to.y - from.y) * 0.2
  const cp2x = from.x + (to.x - from.x) * 0.7
  const cp2y = to.y - (to.y - from.y) * 0.2
  const segmentCount = 12

  for (let i = 0; i < segmentCount; i++) {
    const tStart = i / segmentCount
    const tEnd = (i + 0.6) / segmentCount
    const x1 = bezierPoint(from.x, cp1x, cp2x, to.x, tStart)
    const y1 = bezierPoint(from.y, cp1y, cp2y, to.y, tStart)
    const x2 = bezierPoint(from.x, cp1x, cp2x, to.x, tEnd)
    const y2 = bezierPoint(from.y, cp1y, cp2y, to.y, tEnd)

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x1.toString())
    line.setAttribute('y1', y1.toString())
    line.setAttribute('x2', x2.toString())
    line.setAttribute('y2', y2.toString())
    line.setAttribute('stroke', '#44EB99')
    line.setAttribute('stroke-width', '3')
    line.setAttribute('opacity', '0.7')
    line.setAttribute('stroke-linecap', 'round')
    svg.appendChild(line)

    const length = Math.hypot(x2 - x1, y2 - y1)
    line.style.strokeDashoffset = length.toString()
    line.style.strokeDasharray = length.toString()
    line.style.transition = `stroke-dashoffset 0.2s ease ${i * 0.02}s`

    requestAnimationFrame(() => {
      line.style.strokeDashoffset = '0'
    })
  }

  if (onHalfway) {
    setTimeout(onHalfway, segmentCount * 0.02 * 1000 + 120)
  }
  if (onComplete) {
    setTimeout(onComplete, segmentCount * 0.02 * 1000 + 350)
  }
}

function bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t
  return mt ** 3 * p0 + 3 * mt ** 2 * t * p1 + 3 * mt * t ** 2 * p2 + t ** 3 * p3
}

function clampPosition(mascot: HTMLElement, parent: HTMLElement) {
  const maxX = parent.clientWidth - 64
  const maxY = parent.clientHeight - 64
  let left = parseFloat(mascot.style.left) || 0
  let top = parseFloat(mascot.style.top) || 0
  left = Math.max(0, Math.min(maxX, left))
  top = Math.max(0, Math.min(maxY, top))
  mascot.style.left = `${left}px`
  mascot.style.top = `${top}px`
}

function smallStep(mascot: HTMLElement) {
  const parent = mascot.parentElement
  if (!parent) return

  const maxX = parent.clientWidth - 64
  const maxY = parent.clientHeight - 64

  const currentLeft = parseFloat(mascot.style.left) || 0
  const currentTop = parseFloat(mascot.style.top) || 0

  const angle = Math.random() * 2 * Math.PI
  const distance = 10 + Math.random() * 15
  const targetLeft = Math.max(0, Math.min(maxX, currentLeft + Math.cos(angle) * distance))
  const targetTop = Math.max(0, Math.min(maxY, currentTop + Math.sin(angle) * distance))

  mascot.style.transition = `left 2.5s ease-in-out, top 2.5s ease-in-out`
  mascot.style.left = `${targetLeft}px`
  mascot.style.top = `${targetTop}px`
}

function jumpAway(mascot: HTMLElement | null) {
  if (!mascot || !mascot.parentElement) return

  const isDuck = mascot === duckRef.value
  trackGoal('mascot_interaction', { type: isDuck ? 'duck' : 'turtle' })
  
  const parent = mascot.parentElement
  const maxX = parent.clientWidth - 64
  const maxY = parent.clientHeight - 64

  const currentLeft = parseFloat(mascot.style.left) || 0
  const currentTop = parseFloat(mascot.style.top) || 0

  const angle = Math.random() * 2 * Math.PI
  const distance = 20 + Math.random() * 20
  const targetLeft = Math.max(0, Math.min(maxX, currentLeft + Math.cos(angle) * distance))
  const targetTop = Math.max(0, Math.min(maxY, currentTop + Math.sin(angle) * distance))

  mascot.style.transition = `left 0.4s ease-out, top 0.4s ease-out`
  mascot.style.left = `${targetLeft}px`
  mascot.style.top = `${targetTop}px`
}

function startRandomWalks() {
  if (duckRef.value) {
    clampPosition(duckRef.value, duckRef.value.parentElement!)
    duckInterval = window.setInterval(() => smallStep(duckRef.value!), 3000)
  }
  if (turtleRef.value) {
    clampPosition(turtleRef.value, turtleRef.value.parentElement!)
    turtleInterval = window.setInterval(() => smallStep(turtleRef.value!), 3500)
  }
}

function stopRandomWalks() {
  if (duckInterval !== null) clearInterval(duckInterval)
  if (turtleInterval !== null) clearInterval(turtleInterval)
}

function animateSequence() {
  if (animationStarted || !roadmap.value) return
  animationStarted = true

  cardVisible.value[0] = true
  let currentIndex = 0

  function showNext() {
    if (currentIndex >= steps.length - 1) {
      cardsReady.value = true
      return
    }

    const currentCard = cardRefs.value[currentIndex]
    const nextCard = cardRefs.value[currentIndex + 1]
    if (!currentCard || !nextCard) return

    const from = getCardCenter(currentCard, roadmap.value!)
    const to = getCardCenter(nextCard, roadmap.value!)

    animateDashedCurve(from, to,
      () => {
        if (!cardVisible.value[currentIndex + 1]) {
          cardVisible.value[currentIndex + 1] = true
        }
      },
      () => {
        currentIndex++
        showNext()
      }
    )
  }

  setTimeout(() => showNext(), 200)
}

onMounted(() => {
  observer = new IntersectionObserver(
  (entries) => {
    const first = entries[0]
    if (first && first.isIntersecting) {
      animateSequence()
      startRandomWalks()
      observer?.unobserve(first.target)
    }
  },
  { threshold: 0.2 }
)
  const section = document.querySelector('#howto')
  if (section) observer.observe(section)
})

onUnmounted(() => {
  observer?.disconnect()
  stopRandomWalks()
})
</script>

<style scoped>
.step-card {
  transform: translateY(20px);
}
.is-visible {
  opacity: 1 !important;
}
</style>