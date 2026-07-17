<template>
  <section class="py-12 sm:py-16 px-4 bg-white dark:bg-darkBg border-t-2 border-black">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-center mb-4 px-2">
        Подготовим к поиску работы сразу после выпуска:
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
        <div
          v-for="(item, index) in benefits"
          :key="index"
          class="benefit-card border-2 border-black shadow-pixel p-4 sm:p-6 bg-gray-50 dark:bg-[#1D2633] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          :style="{ transitionDelay: index * 0.1 + 's' }"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-school21 border-2 border-black flex items-center justify-center group transition-transform duration-300 hover:scale-110"
            >
              <span class="text-xl sm:text-2xl font-bold text-black">{{ index + 1 }}</span>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-bold uppercase mb-2">{{ item.title }}</h3>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const benefits = [
  {
    title: 'Освоишь технические и HR-собеседования',
    desc: 'Подготовка к техническим интервью и встречам с HR',
  },
  {
    title: 'Выйдешь с готовой стратегией трудоустройства',
    desc: 'Индивидуальный план поиска работы',
  },
  {
    title: 'Создашь резюме и портфолио с реальными проектами',
    desc: 'Работы, которые можно показать работодателю',
  },
  {
    title: 'Научишься презентовать себя на рынке труда',
    desc: 'Навыки самопрезентации и переговоров',
  },
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
    { threshold: 0.2 },
  )

  document.querySelectorAll('.benefit-card').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Анимация появления */
.benefit-card {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease,
    box-shadow 0.2s,
    transform 0.2s;
}

.benefit-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
