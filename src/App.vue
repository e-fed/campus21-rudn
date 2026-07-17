<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'

// Layout компоненты
import StreamProgress from './components/layout/StreamProgress.vue'
import TracksSection from './components/tracks/TracksSection.vue'
import QuickQuiz from './components/quiz/QuickQuiz.vue'
import River from './components/layout/River.vue'
import AppHeader from './components/layout/AppHeader.vue'

// Вынесенные секции
import HeroSection from './components/sections/HeroSection.vue'
import AboutSection from './components/sections/AboutSection.vue'
import HowToSection from './components/sections/HowToSection.vue'
import RegistrationForm from './components/sections/RegistrationForm.vue'
import FooterSection from './components/sections/FooterSection.vue'

// Чат-виджет грузится асинхронно отдельным чанком: он не нужен для первого экрана,
// а его код (Groq-интеграция, история диалога) достаточно тяжёлый, чтобы не тянуть
// его в основной бандл и не задерживать первую отрисовку страницы.
const ChatWidget = defineAsyncComponent(() => import('./components/sections/ChatWidget.vue'))

// Другие секции
import MainTraining from './components/sections/MainTraining.vue'
import CareerPrep from './components/sections/CareerPrep.vue'
import Employers from './components/sections/Employers.vue'
import AboutSchool from './components/sections/AboutSchool.vue'

import DesktopRiverPanel from './components/layout/DesktopRiverPanel.vue'
import FloatingRegisterButton from './components/layout/FloatingRegisterButton.vue'
import { provideRiverState } from './composables/useRiver'
import { initScrollDepthTracking } from './composables/useScrollDepth'

provideRiverState()
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

  initScrollDepthTracking()
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) document.documentElement.classList.add('dark')
  else document.documentElement.classList.remove('dark')
}
</script>

<template>
  <div
    class="min-h-screen bg-[#F4F4F9] dark:bg-darkBg text-textMain dark:text-white transition-colors duration-300 font-pixel text-xl sm:text-2xl"
  >
    <AppHeader :is-dark="isDark" @toggle-theme="toggleTheme" />

    <!-- Ручеек с уткой (десктоп/мобильный) -->
    <StreamProgress />

    <!-- Основной контент: без левого отступа на мобильных -->
    <main class="pt-16">
      <HeroSection :is-dark="isDark" @toggle-theme="toggleTheme" />

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

      <!-- Фоновая река: DesktopRiverPanel рендерится ПЕРВЫМ внутри relative/overflow-hidden/isolate
           обёртки как absolute-слой. isolate создаёт единый stacking context для этой обёртки,
           поэтому z-index внутренних фонов секций (z-0), реки (z-[1]) и контента секций (z-10)
           сравниваются напрямую друг с другом, а не блокируются собственным stacking context
           каждой секции — это и даёт нужный порядок слоёв и кликабельность маскота. -->
      <div class="relative overflow-hidden isolate">
        <DesktopRiverPanel />
        <HowToSection />
        <AboutSchool />
        <RegistrationForm />
      </div>

      <FooterSection :is-dark="isDark" />
    </main>

    <!-- Чат-виджет -->
    <ChatWidget />
    <FloatingRegisterButton />
  </div>
</template>

<style>
@keyframes swimRight {
  0% {
    transform: translateX(-100vw);
  }
  100% {
    transform: translateX(100vw);
  }
}
@keyframes swimLeft {
  0% {
    transform: translateX(100vw) scaleX(-1);
  }
  100% {
    transform: translateX(-100vw) scaleX(-1);
  }
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@keyframes breathe {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.03);
  }
}
.animate-breathe {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes bounce-right {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}
.animate-bounce-right {
  animation: bounce-right 1.5s ease-in-out infinite;
}
</style>