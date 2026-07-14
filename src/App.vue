<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sun, Moon, ArrowRight } from 'lucide-vue-next'

// Layout компоненты
import StreamProgress from './components/layout/StreamProgress.vue'
import TracksSection from './components/tracks/TracksSection.vue'
import QuickQuiz from './components/quiz/QuickQuiz.vue'
import River from './components/layout/River.vue'
import Logo from './components/layout/Logo.vue'
import MobileMenu from './components/layout/MobileMenu.vue'

// Вынесенные секции
import HeroSection from './components/sections/HeroSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import HowToSection from './components/sections/HowToSection.vue'
import FAQSection from './components/sections/FAQSection.vue'
import RegistrationForm from './components/sections/RegistrationForm.vue'
import FooterSection from './components/sections/FooterSection.vue'

// Другие секции
import MainTraining from './components/sections/MainTraining.vue'
import CareerPrep from './components/sections/CareerPrep.vue'
import Employers from './components/sections/Employers.vue'
import AboutSchool from './components/sections/AboutSchool.vue'

import { provideRiverState } from './composables/useRiver'

const riverState = provideRiverState()
const isDark = ref(false)

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDark.value = mediaQuery.matches

  if (isDark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')

  mediaQuery.addEventListener('change', (e) => {
    isDark.value = e.matches
    if (e.matches) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  })
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}

const navLinks = [
  { href: '#about', text: 'О программе' },
  { href: '#quiz', text: 'Тест' },
  { href: '#tracks', text: 'Треки' },
  { href: '#howto', text: 'Как поступить' },
  { href: '#campus', text: 'Кампус' },
  { href: '#faq', text: 'FAQ' },
]
</script>

<template>
  <div class="min-h-screen bg-[#F4F4F9] dark:bg-darkBg text-textMain dark:text-white transition-colors duration-300 font-pixel text-xl sm:text-2xl">
    <!-- Мобильное меню -->
    <MobileMenu :is-dark="isDark" @toggle-theme="toggleTheme" />

    <!-- Навигация -->
    <nav class="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-darkBg/90 backdrop-blur-sm border-b-2 border-black">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <div class="hidden md:flex gap-6">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="hover:text-school21 transition-colors uppercase text-base"
          >
            {{ link.text }}
          </a>
        </div>

        <div class="flex items-center gap-2">
          <!-- Кнопка темы (видна только на десктопе) -->
          <button
            @click="toggleTheme"
            class="hidden md:inline-flex p-2 border-2 border-black bg-white dark:bg-gray-800 shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            title="Переключить тему"
          >
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <a href="#register" class="hidden md:block bg-school21 hover:bg-school21dark text-black font-bold py-2 px-6 border-2 border-black shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-base">
            Записаться
          </a>
        </div>
      </div>
    </nav>

    <!-- Ручеек с уткой (десктоп/мобильный) -->
    <StreamProgress />

    <!-- Основной контент: без левого отступа на мобильных -->
    <main class="pl-0 sm:pl-16 pt-16">
      <HeroSection />

      <!-- Контейнер с рекой (для эффекта привязки) -->
      <div class="relative">
        <River />
        <AboutSection />
        <QuickQuiz />
        <section id="tracks">
          <TracksSection />
        </section>
      </div>

      <MainTraining />
      <CareerPrep />
      <Employers />
      <HowToSection />
      <FAQSection />
      <AboutSchool />
      <RegistrationForm />
      <FooterSection />
    </main>

    <!-- Плавающая кнопка -->
    <a
      href="#register"
      class="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 group
            bg-school21 hover:bg-school21dark text-black font-bold
            py-2 px-4 sm:py-3 sm:px-6
            border-2 border-black shadow-pixel
            hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
            transition-all duration-200
            animate-breathe
            uppercase min-h-[44px] flex items-center gap-2"
    >
      <span class="hidden sm:inline">Записаться</span>
      <ArrowRight class="w-5 h-5 sm:hidden animate-bounce-right" />
    </a>
  </div>
</template>

<style>
@keyframes swimRight {
  0% { transform: translateX(-100vw); }
  100% { transform: translateX(100vw); }
}
@keyframes swimLeft {
  0% { transform: translateX(100vw) scaleX(-1); }
  100% { transform: translateX(-100vw) scaleX(-1); }
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
.animate-breathe {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes bounce-right {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
}
.animate-bounce-right {
  animation: bounce-right 1.5s ease-in-out infinite;
}
</style>
