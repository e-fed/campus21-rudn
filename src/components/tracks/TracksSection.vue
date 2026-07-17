<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, Clock, Award, BookOpen, Briefcase } from 'lucide-vue-next'
import { useRiverState } from '../../composables/useRiver'
import DuckSprite from '../shared/DuckSprite.vue'
import TurtleSprite from '../shared/TurtleSprite.vue'
import { trackGoal } from '../../utils/analytics' // <-- ДОБАВЛЕН ИМПОРТ АНАЛИТИКИ

const riverState = useRiverState()

const tracks = [
  {
    id: 'duck' as const,
    name: 'ЦИФРОВОЙ ЗАКАЗЧИК',
    mascot: 'duck',
    duration: '10 месяцев',
    load: '4–6 ч/нед · 200 акад. часов',
    doc: 'Удостоверение о повышении квалификации',
    skills: ['Цифровая трансформация', 'ТЗ, API, Метрики', 'Scrum, Agile', 'No-code / Low-code'],
    career:
      'Лидер цифровизации, внедрение ИИ-решений в госсекторе и корпорациях, управление ИТ-командой.',
    tagline: 'БЫСТРЫЙ СТАРТ В IT',
    color: 'text-school21',
    borderColor: 'border-school21',
  },
  {
    id: 'turtle' as const,
    name: 'ИИ-ИНЖЕНЕР',
    mascot: 'turtle',
    duration: '20 месяцев',
    load: '4–6 ч/нед · 436 акад. часов',
    doc: 'Диплом о профессиональной переподготовке',
    skills: ['Python, SQL, Linux', 'Алгоритмы ИИ', 'Машинное обучение', 'LLM и нейросети'],
    career: 'ИИ-инженер, Data Scientist, ML-разработчик, проектирование и создание ИИ-продуктов.',
    tagline: 'МАРАФОН К ПРОФЕССИИ',
    color: 'text-school21purple',
    borderColor: 'border-school21purple',
  },
]

const activeTrack = ref<'duck' | 'turtle' | null>(null)
const isComparing = ref(false)

// Следим за выбором из квиза
watch(
  () => riverState.value.selectedTrack,
  (newTrack) => {
    if (newTrack) {
      activeTrack.value = newTrack
      isComparing.value = true // Автоматически раскрываем при выборе из теста
    }
  },
  { immediate: true },
)

// Выбор конкретного трека (карточка или кнопка внутри карточки)
const selectTrack = (trackId: 'duck' | 'turtle') => {
  activeTrack.value = trackId
  riverState.value.selectedTrack = trackId
  isComparing.value = true

  // <-- ДОБАВЛЕНА ОТПРАВКА ЦЕЛИ
  trackGoal('track_card_clicked', { track: trackId })
}

// Кнопка "Сравнить подробно" (нейтральный режим)
const startComparison = () => {
  isComparing.value = true
  activeTrack.value = null // Сбрасываем выделение карточек
  riverState.value.selectedTrack = null // Возвращаем реке исходный синий цвет!

  // <-- ДОБАВЛЕНА ОТПРАВКА ЦЕЛИ
  trackGoal('comparison_opened')
}

// Кнопка "Свернуть"
const stopComparison = () => {
  isComparing.value = false
  activeTrack.value = null
  riverState.value.selectedTrack = null
}

const getTrackOpacity = (trackId: 'duck' | 'turtle') => {
  if (!activeTrack.value) return 1 // Если сравнение нейтральное, обе карточки яркие
  return activeTrack.value === trackId ? 1 : 0.4 // Если выбран конкретный, второй тускнеет
}
</script>

<template>
  <section
    id="tracks"
    class="relative py-16 px-4 bg-white/30 dark:bg-darkBg/30 backdrop-blur-sm border-t-2 border-black overflow-visible"
  >
    <div class="max-w-6xl mx-auto relative z-10">
      <h2 class="text-4xl sm:text-5xl font-bold uppercase text-center mb-4">Выбери свой трек</h2>
      <p
        class="text-center text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
      >
        Нажми на программу или кнопку ниже, чтобы сравнить их детали
      </p>

      <!-- КАРТОЧКИ ТРЕКОВ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <!-- ТРЕК 1: УТКА -->
        <div
          @click="selectTrack('duck')"
          class="relative z-10 cursor-pointer transition-all duration-500 ease-in-out"
          :style="{
            opacity: getTrackOpacity('duck'),
            transform:
              activeTrack === 'duck' ? 'scale(1)' : activeTrack ? 'scale(0.98)' : 'scale(1)',
          }"
        >
          <div
            class="border-4 shadow-pixel bg-white/80 dark:bg-darkBg/80 backdrop-blur-md transition-all duration-500 h-full flex flex-col"
            :class="activeTrack === 'duck' ? 'border-school21 shadow-school21/50' : 'border-black'"
          >
            <!-- Минимальная часть (видна всегда) -->
            <div class="p-6 sm:p-8 text-center flex-grow flex flex-col items-center justify-center">
              <span
                class="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs uppercase font-bold mb-4"
              >
                {{ tracks[0]!.tagline }}
              </span>

              <DuckSprite
                class="w-32 h-32 sm:w-40 sm:h-40 mb-6 animate-[bob_3s_ease-in-out_infinite]"
              />

              <h3 class="text-3xl font-bold uppercase mb-2 text-school21">{{ tracks[0]!.name }}</h3>

              <div
                v-if="!isComparing"
                class="mt-4 text-sm text-gray-500 dark:text-gray-400 animate-pulse uppercase font-bold"
              >
                ▼ Нажми, чтобы сравнить ▼
              </div>
            </div>

            <!-- Детальная часть (видна только при isComparing) -->
            <div
              v-if="isComparing"
              class="border-t-4 border-black p-6 space-y-4 animate-fade-in-down bg-gray-50/50 dark:bg-black/20"
            >
              <div class="flex items-start gap-3">
                <Clock class="w-6 h-6 text-school21 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Длительность</p>
                  <p class="text-lg font-bold">{{ tracks[0]!.duration }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ tracks[0]!.load }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Award class="w-6 h-6 text-school21 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Документ</p>
                  <p class="text-base">{{ tracks[0]!.doc }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <BookOpen class="w-6 h-6 text-school21 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Чему научишься</p>
                  <ul class="text-sm space-y-1 mt-1">
                    <li
                      v-for="skill in tracks[0]!.skills"
                      :key="skill"
                      class="flex items-center gap-2"
                    >
                      <Check class="w-4 h-4 text-school21" /> {{ skill }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Briefcase class="w-6 h-6 text-school21 flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Карьера</p>
                  <p class="text-sm leading-snug">{{ tracks[0]!.career }}</p>
                </div>
              </div>

              <!-- ДОБАВЛЕН @click.stop, чтобы клик по кнопке не сворачивал карточку, и добавлена аналитика -->
              <a
                href="#register"
                @click.stop="trackGoal('register_button_clicked', { source: 'track_card_duck' })"
                class="block w-full text-center bg-school21 hover:bg-school21dark text-black font-bold py-3 border-2 border-black shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase mt-4"
              >
                Хочу на этот трек!
              </a>
            </div>
          </div>
        </div>

        <!-- ТРЕК 2: ЧЕРЕПАХА -->
        <div
          @click="selectTrack('turtle')"
          class="relative z-10 cursor-pointer transition-all duration-500 ease-in-out"
          :style="{
            opacity: getTrackOpacity('turtle'),
            transform:
              activeTrack === 'turtle' ? 'scale(1)' : activeTrack ? 'scale(0.98)' : 'scale(1)',
          }"
        >
          <div
            class="border-4 shadow-pixel bg-white/80 dark:bg-darkBg/80 backdrop-blur-md transition-all duration-500 h-full flex flex-col"
            :class="
              activeTrack === 'turtle'
                ? 'border-school21purple shadow-school21purple/50'
                : 'border-black'
            "
          >
            <div class="p-6 sm:p-8 text-center flex-grow flex flex-col items-center justify-center">
              <span
                class="inline-block bg-black dark:bg-white text-white dark:text-black px-3 py-1 text-xs uppercase font-bold mb-4"
              >
                {{ tracks[1]!.tagline }}
              </span>

              <TurtleSprite
                class="w-32 h-32 sm:w-40 sm:h-40 mb-6 animate-[bob_3s_ease-in-out_infinite]"
                style="animation-delay: 0.5s"
              />

              <h3 class="text-3xl font-bold uppercase mb-2 text-school21purple">
                {{ tracks[1]!.name }}
              </h3>

              <div
                v-if="!isComparing"
                class="mt-4 text-sm text-gray-500 dark:text-gray-400 animate-pulse uppercase font-bold"
              >
                ▼ Нажми, чтобы сравнить ▼
              </div>
            </div>

            <div
              v-if="isComparing"
              class="border-t-4 border-black p-6 space-y-4 animate-fade-in-down bg-gray-50/50 dark:bg-black/20"
            >
              <div class="flex items-start gap-3">
                <Clock class="w-6 h-6 text-school21purple flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Длительность</p>
                  <p class="text-lg font-bold">{{ tracks[1]!.duration }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ tracks[1]!.load }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Award class="w-6 h-6 text-school21purple flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Документ</p>
                  <p class="text-base">{{ tracks[1]!.doc }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <BookOpen class="w-6 h-6 text-school21purple flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Чему научишься</p>
                  <ul class="text-sm space-y-1 mt-1">
                    <li
                      v-for="skill in tracks[1]!.skills"
                      :key="skill"
                      class="flex items-center gap-2"
                    >
                      <Check class="w-4 h-4 text-school21purple" /> {{ skill }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <Briefcase class="w-6 h-6 text-school21purple flex-shrink-0 mt-1" />
                <div>
                  <p class="font-bold uppercase text-sm text-gray-500">Карьера</p>
                  <p class="text-sm leading-snug">{{ tracks[1]!.career }}</p>
                </div>
              </div>

              <!-- ДОБАВЛЕН @click.stop, чтобы клик по кнопке не сворачивал карточку, и добавлена аналитика -->
              <a
                href="#register"
                @click.stop="trackGoal('register_button_clicked', { source: 'track_card_turtle' })"
                class="block w-full text-center bg-school21purple hover:bg-purple-700 text-white font-bold py-3 border-2 border-black shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase mt-4"
              >
                Хочу на этот трек!
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ЦЕНТРАЛЬНАЯ КНОПКА СРАВНЕНИЯ -->
      <div class="text-center mt-8">
        <button
          v-if="!isComparing"
          @click="startComparison"
          class="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold py-3 px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-lg"
        >
          Сравнить программы подробно
        </button>

        <button
          v-else
          @click="stopComparison"
          class="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white font-bold py-3 px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-lg"
        >
          ✕ Свернуть сравнение
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.4s ease-out forwards;
}
</style>
