<template>
  <section class="py-12 sm:py-16 px-0 bg-gray-100 dark:bg-[#161D27] border-t-2 border-black">
    <!-- Заголовок и описание с анимацией -->
    <div class="max-w-6xl mx-auto text-center px-4">
      <div class="fade-in-up">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-4">
          Наши партнеры
        </h2>
        <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
          Выпускники работают в ведущих IT-компаниях
        </p>
      </div>
    </div>

    <!-- Анимированная лента логотипов на всю ширину -->
    <div class="relative overflow-hidden mb-8 sm:mb-12 w-full">
      <div class="marquee-wrapper">
        <div class="marquee-track flex items-center">
          <!-- Первый набор логотипов -->
          <div
            v-for="(logo, index) in logos"
            :key="'a-' + index"
            class="logo-card bg-gray-300 dark:bg-gray-600 border-2 border-black shadow-pixel p-4 sm:p-6 h-24 sm:h-32 w-40 sm:w-48 flex-shrink-0 flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all mx-4"
          >
            <img :src="logo" :alt="'Партнер ' + (index + 1)" class="max-w-full max-h-full object-contain" />
          </div>
          <!-- Дубликат для бесшовной анимации -->
          <div
            v-for="(logo, index) in logos"
            :key="'b-' + index"
            class="logo-card bg-gray-300 dark:bg-gray-600 border-2 border-black shadow-pixel p-4 sm:p-6 h-24 sm:h-32 w-40 sm:w-48 flex-shrink-0 flex items-center justify-center hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all mx-4"
          >
            <img :src="logo" :alt="'Партнер ' + (index + 1)" class="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </div>
    </div>

    <!-- Призыв и кнопка с анимацией -->
    <div class="max-w-6xl mx-auto text-center px-4">
      <div class="fade-in-up delay-200">
        <p class="text-xl sm:text-2xl font-bold uppercase mb-6 sm:mb-8">
          Стань частью этого сообщества!
        </p>
        <a
          href="#register"
          class="inline-block bg-school21 hover:bg-school21dark text-black font-bold py-3 px-8 sm:py-4 sm:px-12 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-lg sm:text-xl min-h-[48px] flex items-center justify-center mx-auto"
        >
          Подать заявку
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import e1 from '../../assets/images/e1.png'
import e2 from '../../assets/images/e2.png'
import e3 from '../../assets/images/e3.png'
import e4 from '../../assets/images/e4.png'
import e5 from '../../assets/images/e5.png'

const logos = [e1, e2, e3, e4, e5]

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
    { threshold: 0.2 }
  )

  document.querySelectorAll('.fade-in-up').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.marquee-wrapper {
  display: flex;
  overflow: hidden;
}

.marquee-track {
  display: flex;
  animation: scroll 20s linear infinite;
}

.marquee-wrapper:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.logo-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

/* Анимация появления текста */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.delay-200 {
  transition-delay: 0.2s;
}
</style>