<template>
  <section id="about" class="min-h-screen flex items-center justify-center px-4 py-16 sm:py-20 bg-white/40 dark:bg-darkBg/40 backdrop-blur-sm border-t-2 border-black relative">
    <div class="max-w-3xl text-center space-y-6 relative z-10">
      <h2 class="about-animate text-3xl sm:text-5xl font-bold uppercase opacity-0 translate-y-8 transition-all duration-700 ease-out">
        О программе
      </h2>
      <p class="about-animate text-lg sm:text-2xl leading-relaxed opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out">
        Мы объединили возможности РУДН и «Школы 21», чтобы создать новое пространство — для тех, кто хочет запускать ИИ-продукты и задавать ИТ-тренды в своей профессиональной области.
      </p>
      <div class="about-animate bg-white/90 dark:bg-darkBg/90 border-2 border-black p-6 shadow-pixel inline-block opacity-0 translate-y-8 transition-all duration-700 delay-300 ease-out">
        <p class="text-2xl font-bold text-school21purple uppercase">
          Здесь ты не сдаёшь зачёты.<br>
          Ты создаёшь решения.
        </p>
      </div>
      <p class="about-animate text-base text-gray-500 dark:text-gray-400 opacity-0 translate-y-8 transition-all duration-700 delay-500 ease-out">*для тех, кто учится или работает в РУДН</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        } else {
          entry.target.classList.remove('is-visible')
        }
      })
    },
    { threshold: 0.2 }
  )

  document.querySelectorAll('.about-animate').forEach((el) => observer?.observe(el))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.about-animate {
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.about-animate.is-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
</style>