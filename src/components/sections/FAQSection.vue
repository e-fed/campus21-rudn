<template>
  <section id="faq" class="py-10 sm:py-16 px-4 bg-gray-100 dark:bg-[#161D27] border-t-2 border-black">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl sm:text-5xl font-bold uppercase text-center mb-8 sm:mb-12">
        Частые вопросы
      </h2>

      <div class="space-y-3 sm:space-y-4">
        <div
          v-for="(faq, index) in faqList"
          :key="index"
          class="faq-item bg-white dark:bg-darkBg border-2 border-black shadow-pixel p-5 sm:p-6 transition-all duration-500 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          :style="{ transitionDelay: index * 0.08 + 's' }"
        >
          <h3 class="font-bold uppercase mb-2 text-lg">{{ faq.q }}</h3>
          <p class="text-sm sm:text-lg">{{ faq.a }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const faqList = [
  {
    q: 'Где находится кампус?',
    a: 'Факультет искусственного интеллекта РУДН (г. Москва, Подольское шоссе, д. 8, вход со стороны сквера).'
  },
  {
    q: 'Кто может обучаться?',
    a: 'Студенты и сотрудники РУДН.'
  },
  {
    q: 'Это действительно бесплатно?',
    a: 'Да, обучение полностью бесплатное.'
  },
  {
    q: 'Как попасть на обучение?',
    a: 'Регистрируйся на нашем сайте. Важно: используйте почту с доменом @rudn.ru (не @pfur).'
  },
  {
    q: 'Как проходят отборочные интенсивы?',
    a: 'Только очно, в кампусе в течение 4 дней. Дистанционный формат не предусмотрен.'
  },
  {
    q: 'Сколько длится обучение?',
    a: '«ИИ-инженер» — 20 месяцев; «Цифровой заказчик» — 10 месяцев.'
  }
]

// Анимация появления при скролле с таймером для плавного скрытия
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
          // Если элемент снова появился, отменяем запланированное скрытие
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
    { threshold: 0.15 }
  )

  document.querySelectorAll('.faq-item').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.faq-item {
  opacity: 0;
  transform: translateY(20px);
}

.faq-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>