<script setup lang="ts">
import Logo from '../layout/Logo.vue'
import { trackGoal } from '../../utils/analytics'

defineProps<{
  isDark: boolean
}>()

const onExternalClick = (type: string, event: Event) => {
  const anchor = event.currentTarget as HTMLAnchorElement | null
  const url = anchor?.href ?? ''
  trackGoal('external_link_clicked', { url, type })
}
</script>

<template>
  <footer class="bg-gray-100 dark:bg-[#161D27] border-t-2 border-black py-8 sm:py-12 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b-2 border-black">
        <!-- Логотип и описание -->
        <div class="text-center md:text-left">
          <Logo :is-dark="isDark" class="h-10 sm:h-12 mx-auto md:mx-0 mb-4" />
          <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Совместный кампус РУДН и «Школы 21»
          </p>
        </div>

        <!-- Навигация -->
        <div class="text-center">
          <h4 class="font-bold uppercase mb-3 text-sm sm:text-base">Навигация</h4>
          <ul class="space-y-2 text-sm sm:text-base">
            <li><a href="#about" class="hover:text-school21 transition-colors">О программе</a></li>
            <li><a href="#tracks" class="hover:text-school21 transition-colors">Треки</a></li>
            <li><a href="#howto" class="hover:text-school21 transition-colors">Как поступить</a></li>
            <li><a href="#faq" class="hover:text-school21 transition-colors">FAQ</a></li>
          </ul>
        </div>

        <!-- Соцсети и контакты -->
        <div class="text-center md:text-right">
          <h4 class="font-bold uppercase mb-3 text-sm sm:text-base">Мы в соцсетях</h4>
          <div class="flex justify-center md:justify-end gap-3 mb-4">
            <a
              href="https://vk.com/21school_rudn"
              target="_blank"
              @click="onExternalClick('vk', $event)"
              class="w-10 h-10 sm:w-12 sm:h-12 bg-[#4C75A3] hover:bg-[#3d5f85] border-2 border-black shadow-pixel-sm flex items-center justify-center transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <span class="text-white font-bold text-xs sm:text-sm leading-none">VK</span>
            </a>
            <a
              href="https://telegram.me/campus21_rudn"
              target="_blank"
              @click="onExternalClick('telegram', $event)"
              class="w-10 h-10 sm:w-12 sm:h-12 bg-[#2AABEE] hover:bg-[#2294d1] border-2 border-black shadow-pixel-sm flex items-center justify-center transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            >
              <span class="text-white font-bold text-xs sm:text-sm leading-none">TG</span>
            </a>
          </div>
          <p class="text-sm sm:text-base">
            <a href="mailto:21-school@rudn.ru" class="text-school21 hover:underline">21-school@rudn.ru</a>
          </p>
        </div>
      </div>

      <!-- Нижняя часть -->
      <div class="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>© Российский университет дружбы народов, 2026</p>
        <p>
          <a href="#" class="hover:underline">Политика обработки персональных данных</a>
        </p>
      </div>
    </div>
  </footer>
</template>