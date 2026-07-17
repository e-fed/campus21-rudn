<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import Logo from './Logo.vue'
import ThemeToggle from './ThemeToggle.vue'
import { trackGoal } from '../../utils/analytics'

defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  toggleTheme: []
}>()

const navItems = [
  { title: 'О программе', link: '#about' },
  { title: 'Тест', link: '#quiz' },
  { title: 'Треки', link: '#tracks' },
  { title: 'Как поступить', link: '#howto' },
  { title: 'Кампус', link: '#campus' },
  { title: 'FAQ', link: 'https://t.me/campus21_rudn', external: true },
  { title: 'Личный кабинет', link: 'https://applicant.21-school.ru/', external: true },
]

const menuOpen = ref(false)

// Скрывающийся при скролле хедер (только на md+, на мобильных всегда виден — см. классы в template)
const hideHeader = ref(false)
const SCROLL_THRESHOLD = 150
let lastScrollY = window.scrollY
let ticking = false

function handleScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const currentY = window.scrollY

    if (currentY <= SCROLL_THRESHOLD) {
      // у самого верха страницы шапка всегда видна
      hideHeader.value = false
    } else if (currentY > lastScrollY) {
      // скролл вниз — прячем
      hideHeader.value = true
    } else if (currentY < lastScrollY) {
      // скролл вверх — показываем
      hideHeader.value = false
    }

    lastScrollY = currentY
    ticking = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-darkBg/90 backdrop-blur-sm border-b-2 border-black transition-transform duration-300 ease-in-out"
    :class="hideHeader ? 'md:-translate-y-full' : 'md:translate-y-0'"
  >
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Логотип -->
      <Logo :is-dark="isDark" />

      <!-- Полное меню — только на lg+ (1024px). На планшетах (768-1024px) места
           под логотип + 7 пунктов + пилюлю Регистрация + ThemeToggle физически
           не хватает: у <nav> не было min-w-0, поэтому flexbox не ужимал его
           (default min-width:auto для flex-item'ов не даёт сжаться меньше
           содержимого), overflow-x:auto не успевал включиться — и nav просто
           наезжал своей полной шириной на соседний блок с ThemeToggle.
           Решение: на этом диапазоне показываем компактный хедер (лого + тема + бургер),
           как на мобильных — тесноты и наложений там больше не будет ни при каких условиях. -->
      <nav
        class="hidden lg:flex items-center gap-2 xl:gap-4 min-w-0 max-w-[70vw]"
        style="overflow-x: auto; white-space: nowrap; scrollbar-width: none"
      >
        <a
          v-for="item in navItems"
          :key="item.title"
          :href="item.link"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener' : undefined"
          class="relative whitespace-nowrap text-sm uppercase hover:text-school21 transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-school21 after:transition-transform after:duration-300 hover:after:scale-x-100 px-1"
        >
          {{ item.title }}
        </a>
        <a
          href="#register"
          @click="trackGoal('register_button_clicked', { source: 'header_desktop' })"
          class="rounded-full bg-school21 px-3 py-1.5 text-sm font-bold text-black transition-all duration-300 hover:scale-[1.04] hover:bg-school21dark active:scale-95 whitespace-nowrap"
        >
          Регистрация
        </a>
      </nav>

      <!-- Правая группа -->
      <div class="flex items-center gap-2 shrink-0">
        <ThemeToggle :is-dark="isDark" @toggle-theme="emit('toggleTheme')" />

        <button
          type="button"
          class="relative z-50 flex size-11 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent lg:hidden"
          aria-label="Меню"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <Menu v-if="!menuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Мобильное/планшетное меню (теперь до lg включительно, т.е. и на 768-1024px тоже) -->
    <Transition name="menu">
      <div
        v-if="menuOpen"
        class="fixed inset-0 top-0 z-[70] lg:hidden flex flex-col bg-white/95 dark:bg-darkBg/90 backdrop-blur-xl"
      >
        <div class="flex items-center justify-between p-4 border-b-2 border-black">
          <div class="shrink-0">
            <ThemeToggle :is-dark="isDark" @toggle-theme="emit('toggleTheme')" />
          </div>
          <button
            aria-label="Закрыть меню"
            class="p-2 border-2 border-black bg-white dark:bg-gray-800 shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            @click="menuOpen = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <nav class="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <a
            v-for="item in navItems"
            :key="item.title"
            :href="item.link"
            :target="item.external ? '_blank' : undefined"
            :rel="item.external ? 'noopener' : undefined"
            class="text-xl font-bold uppercase hover:text-school21 transition-colors"
            @click.stop="menuOpen = false"
          >
            {{ item.title }}
          </a>
          <a
            href="#register"
            @click.stop="
              menuOpen = false
              trackGoal('register_button_clicked', { source: 'header_mobile' })
            "
            class="w-full max-w-xs text-center bg-school21 hover:bg-school21dark text-black font-bold py-3 border-2 border-black shadow-pixel uppercase text-lg"
          >
            Регистрация
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: all 0.3s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
