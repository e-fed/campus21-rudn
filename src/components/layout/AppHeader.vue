<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import Logo from './Logo.vue'
import ThemeToggle from './ThemeToggle.vue'

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
const navDocked = ref(false)
const desktopNav = ref<HTMLElement | null>(null)
const restingNavSize = ref({ width: 0, height: 0 })

function updateDockedNav() {
  const shouldDock = window.scrollY > 120
  if (!navDocked.value && shouldDock && desktopNav.value) {
    const rect = desktopNav.value.getBoundingClientRect()
    restingNavSize.value = { width: rect.width, height: rect.height }
  }
  navDocked.value = shouldDock
}

onMounted(() => {
  updateDockedNav()
  window.addEventListener('scroll', updateDockedNav, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', updateDockedNav))
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-darkBg/90 backdrop-blur-sm border-b-2 border-black">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Логотип -->
      <div
        class="transition-all duration-500 shrink-0"
        :class="navDocked ? 'md:-translate-x-6' : 'md:translate-x-0'"
      >
        <Logo :is-dark="isDark" :is-docked="navDocked" />
      </div>

      <!-- Десктопное меню -->
      <span
        v-if="navDocked"
        aria-hidden="true"
        class="hidden md:block shrink-0"
        :style="{ width: `${restingNavSize.width}px`, height: `${restingNavSize.height}px` }"
      ></span>
      <nav
        ref="desktopNav"
        class="hidden md:flex items-center gap-2 xl:gap-4 transition-all duration-500 max-w-[85vw]"
        :class="navDocked
          ? 'fixed left-1/2 top-3 -translate-x-1/2 rounded-full border border-black/20 dark:border-white/20 p-2 pl-4 pr-2 shadow-pixel bg-white/95 dark:bg-darkBg/95 z-50'
          : 'relative'"
        style="overflow-x: auto; white-space: nowrap; scrollbar-width: none;"
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
          class="rounded-full bg-school21 px-3 py-1.5 text-sm font-bold text-black transition-all duration-300 hover:scale-[1.04] hover:bg-school21dark active:scale-95 whitespace-nowrap"
        >
          Регистрация
        </a>
      </nav>

      <!-- Правая группа -->
      <div
        class="flex items-center gap-2 shrink-0 transition-all duration-500"
        :class="navDocked ? 'md:-translate-x-6' : 'md:translate-x-0'"
      >
        <ThemeToggle :is-dark="isDark" @toggle-theme="emit('toggleTheme')" />

        <button
          type="button"
          class="relative z-50 flex size-11 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent md:hidden"
          aria-label="Меню"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <Menu v-if="!menuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Мобильное меню с гарантированно непрозрачным фоном -->
    <Transition name="menu">
      <div
        v-if="menuOpen"
        class="fixed inset-0 top-0 z-[70] md:hidden flex flex-col bg-white/95 dark:bg-darkBg/90 backdrop-blur-xl"
      >
        <!-- Шапка меню -->
        <div class="flex items-center justify-between p-4 border-b-2 border-black">
          <div class="shrink-0">
            <ThemeToggle :is-dark="isDark" @toggle-theme="emit('toggleTheme')" />
          </div>
          <button
            class="p-2 border-2 border-black bg-white dark:bg-gray-800 shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            @click="menuOpen = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Навигация -->
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
            class="w-full max-w-xs text-center bg-school21 hover:bg-school21dark text-black font-bold py-3 border-2 border-black shadow-pixel uppercase text-lg"
            @click.stop="menuOpen = false"
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