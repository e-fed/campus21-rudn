<template>
  <section class="py-12 sm:py-16 px-4 bg-gray-100 dark:bg-[#161D27] border-t-2 border-black">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-center mb-8 sm:mb-12">
        Основное обучение
      </h2>

      <!-- Главный блок -->
      <div
        class="fade-in-up bg-white dark:bg-darkBg border-4 border-black shadow-pixel p-6 sm:p-8 relative"
      >
        <!-- Дата начала — яркий баннер + таймер -->
        <div class="text-center mb-8">
          <div
            class="inline-block bg-school21 border-2 border-black px-6 py-3 shadow-pixel transform -rotate-1 hover:rotate-0 transition-transform"
          >
            <p class="text-sm uppercase font-bold">Старт обучения</p>
            <p class="text-3xl sm:text-4xl font-black text-black">18 ноября 2026</p>
          </div>
          <!-- Таймер обратного отсчёта -->
          <CountdownTimer />

          <!-- Добавить дату старта в календарь — работает на повторные визиты/напоминание -->
          <button
            type="button"
            @click="handleAddToCalendar"
            class="mt-4 inline-flex items-center gap-2 bg-white dark:bg-darkBg hover:bg-gray-100 dark:hover:bg-[#222c3a] text-black dark:text-white font-bold py-2 px-4 border-2 border-black shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xs sm:text-sm"
          >
            <Calendar class="w-4 h-4" /> Добавить в календарь
          </button>
        </div>

        <!-- Блок ВАЖНО -->
        <div
          class="bg-red-100 dark:bg-red-900/30 border-2 border-black p-4 sm:p-6 mb-6 shadow-pixel"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex-shrink-0 w-10 h-10 bg-red-600 border-2 border-black flex items-center justify-center"
            >
              <span class="text-white font-bold text-xl">!</span>
            </div>
            <div>
              <h3
                class="text-xl sm:text-2xl font-bold uppercase mb-2 text-red-600 dark:text-red-400"
              >
                Важно!
              </h3>
              <p class="text-base sm:text-lg mb-2">
                В первый день необходимо принести заполненные оригиналы документов в кампус.
              </p>
              <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Документы появятся в личном кабинете после установочной встречи — их можно будет
                скачать по ссылке.
              </p>
            </div>
          </div>
        </div>

        <!-- Дополнительная информация с иконками Lucide -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3">
            <div
              class="flex-shrink-0 w-8 h-8 bg-school21 border-2 border-black flex items-center justify-center"
            >
              <Calendar class="w-4 h-4 text-black" />
            </div>
            <p class="text-base sm:text-lg">
              Записаться на установочную встречу можно в личном кабинете.
            </p>
          </div>
          <div class="flex items-center gap-3">
            <div
              class="flex-shrink-0 w-8 h-8 bg-school21 border-2 border-black flex items-center justify-center"
            >
              <Bell class="w-4 h-4 text-black" />
            </div>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
              Следите за анонсами в Telegram и проверяйте рассылку!
            </p>
          </div>
        </div>

        <!-- Оферта -->
        <div class="text-center pt-4 border-t-2 border-dashed border-gray-400">
          <a
            href="https://21-school.rudn.ru/documents/additional_education_programs_offer.pdf"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-black px-6 py-2 shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase font-bold text-sm"
          >
            <FileText class="w-4 h-4" />
            Ознакомиться с офертой
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { Calendar, Bell, FileText } from 'lucide-vue-next'
import CountdownTimer from './CountdownTimer.vue'
import { downloadStartDateIcs } from '../../utils/calendar'
import { trackGoal } from '../../utils/analytics'

const handleAddToCalendar = () => {
  downloadStartDateIcs()
  trackGoal('add_to_calendar_clicked')
}

// Анимация появления
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement
        if (entry.isIntersecting) {
          el.classList.add('is-visible')
        } else {
          el.classList.remove('is-visible')
        }
      })
    },
    { threshold: 0.2 },
  )

  document.querySelectorAll('.fade-in-up').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.fade-in-up.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>