<template>
  <section class="min-h-[100dvh] flex flex-col items-center justify-between px-4 text-center relative overflow-hidden bg-gradient-to-b from-sky-200 via-blue-100 to-cyan-200 dark:from-sky-900 dark:via-blue-950 dark:to-cyan-950">
    <!-- Облака (скрыты на мобильных) -->
    <div class="absolute top-10 left-10 w-20 h-6 bg-white opacity-60 animate-pulse hidden sm:block"></div>
    <div class="absolute top-16 left-14 w-16 h-4 bg-white opacity-40 hidden sm:block"></div>
    <div class="absolute top-8 right-20 w-24 h-8 bg-white opacity-50 animate-pulse hidden sm:block" style="animation-delay: 1s"></div>

    <!-- Заголовок и кнопки -->
    <div class="relative z-10 pt-16 sm:pt-24 md:pt-32 flex flex-col items-center w-full">
      <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 uppercase tracking-wider leading-tight max-w-4xl">
        Научись создавать <br>
        <span class="text-school21">будущее</span> с помощью <span class="text-school21purple">ИИ</span>
      </h1>
      <p class="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-200 max-w-2xl mb-6 md:mb-8 px-2">
        Совместный кампус РУДН и «Школы 21». Синергия науки, индустрии и практики.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 sm:px-0">
        <a href="#register" class="w-full sm:w-auto bg-school21 hover:bg-school21dark text-black font-bold py-3 px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-lg sm:text-xl">
          Подать заявку
        </a>
        <a href="#tracks" class="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white font-bold py-3 px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-lg sm:text-xl">
          Выбрать трек
        </a>
      </div>
    </div>

    <!-- Озеро с утками и черепахами -->
    <div class="absolute bottom-0 left-0 right-0 h-64 sm:h-80">
      <div class="absolute bottom-0 left-0 right-0 h-8 bg-green-600 dark:bg-green-900"></div>
      <div class="absolute bottom-8 left-0 right-0 h-4 bg-green-500 dark:bg-green-800"></div>
      <div class="absolute bottom-12 left-0 right-0 h-full bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900">
        <div class="absolute top-4 left-10 w-8 h-2 bg-blue-300 opacity-60 animate-pulse"></div>
        <div class="absolute top-8 left-1/3 w-6 h-2 bg-blue-300 opacity-40 animate-pulse" style="animation-delay: 0.5s"></div>
        <div class="absolute top-6 right-20 w-10 h-2 bg-blue-300 opacity-50 animate-pulse" style="animation-delay: 1s"></div>
        <div class="absolute top-10 left-20 w-2 h-2 bg-white opacity-70 animate-bounce"></div>
        <div class="absolute top-16 right-1/3 w-2 h-2 bg-white opacity-50 animate-bounce" style="animation-delay: 0.7s"></div>
      </div>
      <div class="absolute bottom-20 left-1/4 w-16 h-8 bg-green-700 dark:bg-green-950"></div>
      <div class="absolute bottom-28 left-1/4 w-12 h-4 bg-green-600 dark:bg-green-900"></div>
      <div class="absolute bottom-12 left-10 w-2 h-12 bg-green-800 dark:bg-green-950"></div>
      <div class="absolute bottom-12 right-16 w-2 h-14 bg-green-800 dark:bg-green-950"></div>

      <!-- Утка 1 -->
      <div class="absolute bottom-16 animate-[swimRight_22s_linear_infinite]" style="animation-delay: -5s">
        <div class="animate-[bob_3s_ease-in-out_infinite]">
          <svg viewBox="0 0 16 16" class="w-16 h-16 sm:w-20 sm:h-20" shape-rendering="crispEdges">
            <rect x="4" y="8" width="8" height="6" fill="#FFD700" /><rect x="3" y="9" width="10" height="4" fill="#FFD700" /><rect x="5" y="4" width="6" height="5" fill="#FFD700" /><rect x="10" y="6" width="4" height="2" fill="#FF8C00" /><rect x="8" y="5" width="1" height="1" fill="#000000" /><rect x="5" y="10" width="4" height="2" fill="#E6C200" /><rect x="2" y="9" width="2" height="2" fill="#E6C200" />
          </svg>
        </div>
      </div>
      <!-- Черепаха 1 -->
      <div class="absolute bottom-24 animate-[swimLeft_35s_linear_infinite]" style="animation-delay: -12s">
        <div class="animate-[bob_4s_ease-in-out_infinite]">
          <svg viewBox="0 0 16 16" class="w-16 h-16 sm:w-20 sm:h-20" shape-rendering="crispEdges">
            <rect x="2" y="7" width="2" height="2" fill="#90EE90" /><rect x="3" y="9" width="2" height="2" fill="#90EE90" /><rect x="11" y="9" width="2" height="2" fill="#90EE90" /><rect x="4" y="7" width="8" height="2" fill="#B472EE" /><rect x="3" y="5" width="10" height="2" fill="#861BE3" /><rect x="4" y="4" width="8" height="1" fill="#861BE3" /><rect x="5" y="3" width="6" height="1" fill="#861BE3" /><rect x="5" y="5" width="2" height="2" fill="#B472EE" /><rect x="9" y="5" width="2" height="2" fill="#B472EE" /><rect x="12" y="5" width="3" height="3" fill="#90EE90" /><rect x="13" y="4" width="2" height="2" fill="#90EE90" /><rect x="13" y="5" width="1" height="1" fill="#000000" />
          </svg>
        </div>
      </div>
      <!-- Утка 2 -->
      <div class="absolute bottom-36 animate-[swimLeft_28s_linear_infinite]" style="animation-delay: -20s">
        <div class="animate-[bob_3.5s_ease-in-out_infinite]">
          <svg viewBox="0 0 16 16" class="w-10 h-10 sm:w-12 sm:h-12" shape-rendering="crispEdges">
            <rect x="4" y="8" width="8" height="6" fill="#FFD700" /><rect x="3" y="9" width="10" height="4" fill="#FFD700" /><rect x="5" y="4" width="6" height="5" fill="#FFD700" /><rect x="10" y="6" width="4" height="2" fill="#FF8C00" /><rect x="8" y="5" width="1" height="1" fill="#000000" /><rect x="5" y="10" width="4" height="2" fill="#E6C200" /><rect x="2" y="9" width="2" height="2" fill="#E6C200" />
          </svg>
        </div>
      </div>
      <!-- Черепаха 2 -->
      <div class="absolute bottom-40 animate-[swimRight_45s_linear_infinite]" style="animation-delay: -30s">
        <div class="animate-[bob_4.5s_ease-in-out_infinite]">
          <svg viewBox="0 0 16 16" class="w-10 h-10 sm:w-12 sm:h-12" shape-rendering="crispEdges">
            <rect x="2" y="7" width="2" height="2" fill="#90EE90" /><rect x="3" y="9" width="2" height="2" fill="#90EE90" /><rect x="11" y="9" width="2" height="2" fill="#90EE90" /><rect x="4" y="7" width="8" height="2" fill="#B472EE" /><rect x="3" y="5" width="10" height="2" fill="#861BE3" /><rect x="4" y="4" width="8" height="1" fill="#861BE3" /><rect x="5" y="3" width="6" height="1" fill="#861BE3" /><rect x="5" y="5" width="2" height="2" fill="#B472EE" /><rect x="9" y="5" width="2" height="2" fill="#B472EE" /><rect x="12" y="5" width="3" height="3" fill="#90EE90" /><rect x="13" y="4" width="2" height="2" fill="#90EE90" /><rect x="13" y="5" width="1" height="1" fill="#000000" />
          </svg>
        </div>
      </div>
      <!-- Утка 3 -->
      <div class="absolute bottom-28 animate-[swimRight_32s_linear_infinite]" style="animation-delay: -18s">
        <div class="animate-[bob_3.2s_ease-in-out_infinite]">
          <svg viewBox="0 0 16 16" class="w-12 h-12 sm:w-14 sm:h-14" shape-rendering="crispEdges">
            <rect x="4" y="8" width="8" height="6" fill="#FFD700" /><rect x="3" y="9" width="10" height="4" fill="#FFD700" /><rect x="5" y="4" width="6" height="5" fill="#FFD700" /><rect x="10" y="6" width="4" height="2" fill="#FF8C00" /><rect x="8" y="5" width="1" height="1" fill="#000000" /><rect x="5" y="10" width="4" height="2" fill="#E6C200" /><rect x="2" y="9" width="2" height="2" fill="#E6C200" />
          </svg>
        </div>
      </div>
    </div>

    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce text-3xl text-white z-20">▼</div>
  </section>
</template>

<script setup lang="ts">
// Логика анимации уже в глобальных CSS, дополнительных действий не требуется
</script>