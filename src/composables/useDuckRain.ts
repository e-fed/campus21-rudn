import { ref } from 'vue'
import gsap from 'gsap'
import { trackGoal } from '../utils/analytics'

export type MascotType = 'duck' | 'turtle'

let clickCount = 0
let clickThreshold = 10 + Math.floor(Math.random() * 11) // случайно 10..20

export const isRaining = ref(false)

// Каждая капля дождя теперь хранит свой тип — дождь всегда однородный
// (кликнули утку -> дождь из уток, кликнули черепаху -> дождь из черепах),
// но структура на будущее позволяет и смешанный дождь, если понадобится.
export const rainMascots = ref<
  {
    id: number
    type: MascotType
    left: number
    duration: number
    delay: number
    size: number
    drift: number
    spin: number
  }[]
>([])

let rainStopTimer: ReturnType<typeof setTimeout> | null = null

function bounce(el: HTMLElement | null) {
  if (!el) return
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.25, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' },
  )
}

function spawnMascotRain(type: MascotType) {
  const count = 80
  const mascots = []
  for (let i = 0; i < count; i++) {
    mascots.push({
      id: Date.now() + i,
      type,
      left: Math.random() * 100,
      duration: 2.6 + Math.random() * 2.4,
      delay: Math.random() * 2.2,
      size: 24 + Math.random() * 22,
      drift: (Math.random() - 0.5) * 120,
      spin: (Math.random() - 0.5) * 360,
    })
  }
  rainMascots.value = mascots
  isRaining.value = true

  if (rainStopTimer) clearTimeout(rainStopTimer)
  rainStopTimer = setTimeout(() => {
    isRaining.value = false
    rainMascots.value = []
    clickCount = 0
    clickThreshold = 10 + Math.floor(Math.random() * 11)
  }, 6500)
}

/**
 * Клик по маскоту — на мобильном треке всегда 'duck' (там маскот всегда утка),
 * на десктопной панели передаётся тот тип, что реально отображается сейчас
 * (по умолчанию — утка, если трек не выбран, или выбранный трек).
 */
export function handleDuckClick(el: HTMLElement | null, type: MascotType = 'duck') {
  bounce(el)
  if (isRaining.value) return

  clickCount++
  trackGoal('duck_easter_egg_clicked', { count: clickCount, mascot: type })

  if (clickCount >= clickThreshold) {
    trackGoal('duck_rain_triggered', { mascot: type })
    spawnMascotRain(type)
  }
}
