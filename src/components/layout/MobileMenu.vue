<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X, Sun, Moon } from 'lucide-vue-next'

defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  toggleTheme: []
}>()

const isOpen = ref(false)

const navLinks = [
  { href: '#about', text: 'О программе' },
  { href: '#quiz', text: 'Тест' },
  { href: '#tracks', text: 'Треки' },
  { href: '#howto', text: 'Как поступить' },
  { href: '#campus', text: 'Кампус' },
  { href: '#faq', text: 'FAQ' },
  { href: '#register', text: 'Регистрация' },
]

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <!-- Гамбургер -->
  <button
    @click="isOpen = !isOpen"
    class="fixed top-4 right-4 z-[60] p-3 bg-white dark:bg-darkBg border-2 border-black shadow-pixel sm:hidden transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
  >
    <Menu v-if="!isOpen" class="w-6 h-6" />
    <X v-else class="w-6 h-6" />
  </button>

  <!-- Выпадающее меню -->
  <Transition name="menu">
    <div
      v-if="isOpen"
      class="fixed inset-0 top-0 z-50 bg-white/98 dark:bg-darkBg/98 backdrop-blur-md sm:hidden flex flex-col"
    >
      <!-- Шапка: кнопка темы слева, надпись "Меню" по центру -->
      <div class="flex items-center p-4 border-b-2 border-black relative">
        <button
          @click="emit('toggleTheme')"
          class="p-2 border-2 border-black bg-white dark:bg-gray-800 shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <Sun v-if="isDark" class="w-5 h-5" />
          <Moon v-else class="w-5 h-5" />
        </button>
        <span class="font-bold text-lg uppercase absolute left-1/2 transform -translate-x-1/2">Меню</span>
      </div>

      <!-- Ссылки -->
      <nav class="flex-1 flex flex-col items-center justify-center space-y-6 px-8">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          @click="closeMenu"
          class="text-2xl font-bold uppercase hover:text-school21 transition-colors py-2"
        >
          {{ link.text }}
        </a>
      </nav>

      <!-- Кнопка записи -->
      <div class="p-6 border-t-2 border-black">
        <a
          href="#register"
          @click="closeMenu"
          class="block w-full text-center bg-school21 hover:bg-school21dark text-black font-bold py-4 border-2 border-black shadow-pixel uppercase text-xl"
        >
          Записаться
        </a>
      </div>
    </div>
  </Transition>
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