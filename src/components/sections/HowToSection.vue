<template>
  <section id="howto" class="py-10 sm:py-16 px-4 bg-gray-100 dark:bg-[#161D27] border-t-2 border-black">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-3xl sm:text-5xl font-bold uppercase text-center mb-8 sm:mb-12">Как поступить</h2>

      <div class="space-y-4 sm:space-y-6">
        <div
          v-for="step in steps"
          :key="step.num"
          class="howto-item bg-white dark:bg-darkBg border-2 border-black shadow-pixel p-5 sm:p-6 transition-all duration-500 ease-out hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
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

      <div class="mt-12 bg-white dark:bg-darkBg border-2 border-black shadow-pixel p-6">
        <h3 class="text-2xl font-bold uppercase mb-4 text-center">Критерии отбора</h3>
        <ol class="space-y-3 list-decimal list-inside text-base sm:text-lg">
          <li>Для «ИИ-инженер» требуются знания базового Python</li>
          <li>Для «Цифрового заказчика» нужна цифровая грамотность и логика</li>
          <li>На момент обучения необходимо быть студентом или сотрудником РУДН</li>
        </ol>
      </div>

      <div class="mt-8 bg-school21/10 dark:bg-school21/20 border-2 border-black p-6 text-center">
        <p class="font-bold uppercase mb-2">Даты отборочных испытаний:</p>
        <p class="text-base sm:text-lg">1 — 4 июля, 29 сентября — 2 октября, 13 — 16 октября, 27 — 30 октября</p>
        <p class="font-bold uppercase mt-4 mb-2">Старт основного обучения:</p>
        <p class="text-2xl font-bold text-school21">18 ноября 2026</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const steps = [
  { num: 1, title: 'Регистрация', desc: 'Зарегистрироваться в личном кабинете' },
  { num: 2, title: 'Выбор времени', desc: 'Выбрать удобное время установочной встречи в личном кабинете после регистрации' },
  { num: 3, title: 'Установочная встреча', desc: 'Прийти на установочную встречу в кампусе или подключиться онлайн' },
  { num: 4, title: 'Отборочный этап', desc: 'Пройти отборочный этап: 4 дня очно в кампусе «Школы 21» и РУДН' },
  { num: 5, title: 'Ожидание результатов', desc: 'Дождаться результатов отбора' },
  { num: 6, title: 'Начало обучения', desc: 'Начать свой путь уже в этом семестре' }
]

// Анимация появления с таймером для плавного скрытия
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          // Отменяем запланированное скрытие, если элемент снова появился
          if (el.dataset.hideTimeout) {
            clearTimeout(Number(el.dataset.hideTimeout))
            delete el.dataset.hideTimeout
          }
        } else {
          // Запускаем таймер на удаление класса через 300 мс
          const timeout = window.setTimeout(() => {
            el.classList.remove('is-visible')
            delete el.dataset.hideTimeout
          }, 300)
          el.dataset.hideTimeout = String(timeout)
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.howto-item').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.howto-item {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.howto-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>