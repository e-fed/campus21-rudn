<template>
  <section id="register" class="min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 bg-white dark:bg-darkBg border-t-2 border-black">
    <div class="max-w-2xl w-full text-center space-y-6">
      <h2 class="text-3xl sm:text-5xl font-bold uppercase">Оставь заявку</h2>
      <p class="text-lg sm:text-2xl">
        Стань студентом Школы 21 уже сегодня!
      </p>

      <form class="form-block space-y-4 text-left bg-gray-100 dark:bg-[#161D27] border-2 border-black shadow-pixel p-6 sm:p-8">
        <div>
          <label class="block font-bold uppercase mb-2">Email</label>
          <input
            type="email"
            placeholder="name@rudn.ru"
            class="w-full p-4 border-2 border-black bg-white dark:bg-darkBg text-black dark:text-white font-pixel text-lg focus:outline-none focus:border-school21"
          />
        </div>

        <div class="flex items-start gap-3">
          <input type="checkbox" id="consent" class="mt-1 w-5 h-5 border-2 border-black" />
          <label for="consent" class="text-sm sm:text-base">
            Даю согласие на обработку персональных данных
          </label>
        </div>

        <button
          type="submit"
          class="w-full bg-school21 hover:bg-school21dark text-black font-bold py-4 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xl"
        >
          Подать заявку
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// Анимация появления формы с таймером для плавного скрытия
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
    { threshold: 0.2 }
  )

  document.querySelectorAll('.form-block').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.form-block {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.form-block.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>