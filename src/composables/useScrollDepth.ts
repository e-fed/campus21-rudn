import { trackGoal } from '../utils/analytics'

// Отправляет цели в аналитику при достижении 25/50/75/100% прокрутки страницы.
// Нужно для метрик из ТЗ («глубина просмотра», «доходят до конца страницы»).
const THRESHOLDS = [25, 50, 75, 100] as const

export function initScrollDepthTracking() {
  const reached = new Set<number>()
  let ticking = false

  const checkDepth = () => {
    ticking = false
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight <= 0) return

    const percent = Math.round((scrollTop / docHeight) * 100)

    for (const threshold of THRESHOLDS) {
      if (percent >= threshold && !reached.has(threshold)) {
        reached.add(threshold)
        trackGoal(`scroll_depth_${threshold}`)
      }
    }

    // Все пороги достигнуты — больше не нужно слушать скролл
    if (reached.size === THRESHOLDS.length) {
      window.removeEventListener('scroll', onScroll)
    }
  }

  const onScroll = () => {
    if (!ticking) {
      ticking = true
      window.requestAnimationFrame(checkDepth)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  // Проверяем сразу — вдруг страница короче экрана или уже проскроллена (например, якорь в URL)
  checkDepth()

  return () => window.removeEventListener('scroll', onScroll)
}