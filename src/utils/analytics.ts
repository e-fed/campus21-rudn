// src/utils/analytics.ts

// Объявляем глобальный тип для window.ym, чтобы TypeScript не ругался
declare global {
  interface Window {
    ym?: (counterId: number, action: string, goalId: string, params?: Record<string, any>) => void
  }
}

const COUNTER_ID = 110756922 // Ваш реальный номер счётчика

export function trackGoal(goalId: string, params?: Record<string, any>) {
  // В режиме разработки (npm run dev) просто пишем в консоль, 
  // чтобы не засорять реальную статистику тестовыми кликами
  if (import.meta.env.DEV) {
    console.log(`[Analytics Goal] ${goalId}:`, params || '')
    return
  }

  // В продакшене (после сборки) отправляем данные в Яндекс.Метрику
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(COUNTER_ID, 'reachGoal', goalId, params)
  }
}