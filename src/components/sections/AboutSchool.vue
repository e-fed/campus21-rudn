<template>
  <section id="campus" class="relative py-12 sm:py-16 px-4 border-t-2 border-black">
    <div class="absolute inset-0 z-0 pointer-events-none bg-white/95 dark:bg-darkBg/95" />

    <div class="relative z-10 max-w-6xl mx-auto">
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-center mb-8 sm:mb-12">
        О Школе
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <div
          v-for="(item, index) in features"
          :key="index"
          class="feature-card border-2 border-black shadow-pixel p-4 sm:p-6 bg-gray-50 dark:bg-[#1D2633]"
          :style="{ transitionDelay: index * 0.1 + 's' }"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-10 h-10 bg-school21purple border-2 border-black flex items-center justify-center group transition-transform duration-300 hover:scale-110"
            >
              <component :is="item.icon" class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-bold uppercase mb-2">{{ item.title }}</h3>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Кампус -->
      <div
        class="campus-block bg-gray-100 dark:bg-[#161D27] border-2 border-black shadow-pixel p-6 sm:p-8"
      >
        <h3 class="text-xl sm:text-2xl font-bold uppercase mb-6 text-center">Кампус</h3>

        <div class="grid md:grid-cols-2 gap-6">
          <div class="text-center space-y-3 sm:space-y-4">
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <MapPin class="w-5 h-5 flex-shrink-0" />
              <p class="text-base sm:text-lg">
                <span class="font-bold">Адрес: </span> г. Москва, ул. Подольское шоссе, д.8
              </p>
            </div>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <Mail class="w-5 h-5 flex-shrink-0" />
              <p class="text-base sm:text-lg">
                <span class="font-bold">Email: </span>
                <a href="mailto:21-school@rudn.ru" class="text-school21 hover:underline"
                  >21-school@rudn.ru</a
                >
              </p>
            </div>
            <div class="flex items-center justify-center gap-2 flex-wrap">
              <Clock class="w-5 h-5 flex-shrink-0" />
              <p class="text-base sm:text-lg">
                <span class="font-bold">Часы работы: </span> Пн–Сб, 9:00–21:00
              </p>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <div
              class="w-full aspect-[4/3] md:aspect-auto md:h-full min-h-[220px] border-2 border-black shadow-pixel overflow-hidden"
            >
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.623595%2C55.713987&z=17&l=map&pt=37.623595,55.713987,pm2rdm"
                width="100%"
                height="100%"
                frameborder="0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Кампус РУДН × Школа 21 на Яндекс Картах — Подольское шоссе, 8"
                class="grayscale-[15%] contrast-[1.05]"
              ></iframe>
            </div>
            <a
              href="https://yandex.ru/maps/213/moscow/?ll=37.623940%2C55.713671&mode=poi&poi%5Bpoint%5D=37.623595%2C55.713987&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D32481427192&z=19.32"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase text-school21dark dark:text-school21 hover:underline"
            >
              <MapPin class="w-4 h-4" /> Открыть на Яндекс Картах
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Code, Target, Users, MapPin, Mail, Clock } from 'lucide-vue-next'

const features = [
  {
    icon: Code,
    title: 'Много практики',
    desc: 'Реальные задачи, геймификация, твой проект - реальный кейс в портфолио',
  },
  {
    icon: Target,
    title: 'Без расписаний и лекций',
    desc: 'Прокачка навыков на практике',
  },
  {
    icon: Users,
    title: 'Равный равному',
    desc: 'Обучение в коллаборации с другими студентами, всегда в команде',
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
          if (el.dataset.hideTimeout) {
            clearTimeout(Number(el.dataset.hideTimeout))
            delete el.dataset.hideTimeout
          }
        } else {
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

  document.querySelectorAll('.feature-card, .campus-block').forEach((el) => {
    observer?.observe(el)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
/* Анимация появления */
.feature-card,
.campus-block {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.feature-card.is-visible,
.campus-block.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>