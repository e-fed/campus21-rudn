<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check, RotateCcw, Share2, Loader2 } from 'lucide-vue-next'
import { useRiverState } from '../../composables/useRiver'
import DuckSprite from '../shared/DuckSprite.vue'
import TurtleSprite from '../shared/TurtleSprite.vue'
import { trackGoal } from '../../utils/analytics'
import { shareResultImage } from '../../composables/useShareResult'

const riverState = useRiverState()

const questions = [
  {
    id: 1,
    text: 'Представь: в рабочем процессе полный хаос. Твоя первая реакция?',
    options: [
      {
        text: 'Собрать команду, расставить приоритеты и выстроить чёткий план.',
        points: { duck: 1, turtle: 0 },
      },
      {
        text: 'Найти корень проблемы в системе и написать скрипт для автоматизации.',
        points: { duck: 0, turtle: 1 },
      },
    ],
  },
  {
    id: 2,
    text: 'Вышла новая мощная нейросеть. Что ты сделаешь в первую очередь?',
    options: [
      {
        text: 'Открою документацию, чтобы понять, как она устроена под капотом.',
        points: { duck: 0, turtle: 1 },
      },
      {
        text: 'Придумаю, как внедрить её в свой проект, чтобы сэкономить 10 часов в неделю.',
        points: { duck: 1, turtle: 0 },
      },
    ],
  },
  {
    id: 3,
    text: 'Твой идеальный формат работы над новым продуктом?',
    options: [
      {
        text: 'Обсуждение идеи у доски, общение с пользователями и прототипирование.',
        points: { duck: 1, turtle: 0 },
      },
      {
        text: 'Тишина, ноутбук, чашка кофе и написание кода, пока прототип не заработает.',
        points: { duck: 0, turtle: 1 },
      },
    ],
  },
  {
    id: 4,
    text: 'Что для тебя значит «успешно завершённый проект»?',
    options: [
      {
        text: 'Код написан элегантно, без багов, а система работает быстро и стабильно.',
        points: { duck: 0, turtle: 1 },
      },
      {
        text: 'Он запущен в срок, уложился в бюджет и решил бизнес-задачу заказчика.',
        points: { duck: 1, turtle: 0 },
      },
    ],
  },
]

const currentQuestion = ref(0)
const scores = ref({ duck: 0, turtle: 0 })
const isFinished = ref(false)

// Безопасный доступ к текущему вопросу
const currentQuestionData = computed(() => questions[currentQuestion.value])

const result = computed(() => {
  if (scores.value.duck > scores.value.turtle) return 'duck'
  if (scores.value.turtle > scores.value.duck) return 'turtle'
  return 'tie'
})

const selectAnswer = (points: { duck: number; turtle: number }) => {
  scores.value.duck += points.duck
  scores.value.turtle += points.turtle

  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value++
  } else {
    isFinished.value = true
  }
}

const resetQuiz = () => {
  currentQuestion.value = 0
  scores.value = { duck: 0, turtle: 0 }
  isFinished.value = false
  riverState.value.selectedTrack = null
  riverState.value.quizCompleted = false
}

watch(isFinished, (finished) => {
  if (finished) {
    riverState.value.quizCompleted = true

    // Фиксируем факт прохождения
    trackGoal('quiz_completed')

    // Фиксируем конкретный результат (quiz_result_duck, quiz_result_turtle или quiz_result_tie)
    trackGoal(`quiz_result_${result.value}`)

    if (result.value !== 'tie') {
      riverState.value.selectedTrack = result.value as 'duck' | 'turtle'
    }
  }
})

const selectTrack = (trackId: 'duck' | 'turtle') => {
  riverState.value.selectedTrack = trackId
}

const isSharing = ref(false)
// Короткая подпись под кнопкой — иначе в фолбэк-сценарии (скачивание + буфер обмена)
// человек не видит вообще никакого отклика на клик и не понимает, сработало ли.
const shareStatus = ref<'downloaded' | null>(null)
let shareStatusTimer: ReturnType<typeof setTimeout> | null = null

// Готовые обложки уже лежат в public/share/ (og-duck.png/og-turtle.png/og-tie.png) —
// именно их прикрепляем как файл при шеринге. Ссылка в тексте — всегда на реальный
// адрес сайта (не window.location.origin, чтобы не отправить, например, адрес
// превью-деплоя или localhost, если делятся не с продакшена), ведёт сразу на раздел
// с квизом.
const SITE_QUIZ_URL = 'https://campus21-rudn.netlify.app/#quiz'

const shareAssets: Record<'duck' | 'turtle' | 'tie', { image: string; title: string }> = {
  duck: { image: '/share/og-duck.png', title: 'Мой путь: Цифровой заказчик' },
  turtle: { image: '/share/og-turtle.png', title: 'Мой путь: ИИ-инженер' },
  tie: { image: '/share/og-tie.png', title: 'Мне подходят оба трека!' },
}

async function handleShare() {
  if (isSharing.value) return
  isSharing.value = true
  trackGoal('quiz_result_share_clicked')

  const key = result.value
  const asset = shareAssets[key]
  const shareUrl = SITE_QUIZ_URL

  const shareText =
    key === 'tie'
      ? `Я прошёл квиз кампуса РУДН × Школа 21 — оказалось, мне подходят сразу оба трека: «Цифровой заказчик» и «ИИ-инженер»! Пройди и узнай свой: ${shareUrl}`
      : `Прошёл(-ла) квиз кампуса РУДН × Школа 21 — мой трек: ${key === 'duck' ? programs.duck.name : programs.turtle.name}. Пройди тоже: ${shareUrl}`

  const status = await shareResultImage({
    imagePath: asset.image,
    fileName: `campus21-rudn-${key}.png`,
    shareTitle: asset.title,
    shareText,
  })

  // При 'shared' системное меню само показывает результат — отдельно уведомлять не нужно.
  // При 'downloaded' (фолбэк) люди иначе не поймут, что картинка сохранилась,
  // а текст со ссылкой уже лежит в буфере обмена — готов вставить в сообщение.
  if (status === 'downloaded') {
    shareStatus.value = 'downloaded'
    if (shareStatusTimer) clearTimeout(shareStatusTimer)
    shareStatusTimer = setTimeout(() => (shareStatus.value = null), 4000)
  }

  isSharing.value = false
}

const programs = {
  duck: {
    name: 'ЦИФРОВОЙ ЗАКАЗЧИК',
    desc: 'Ты — стратег и лидер. Тебе не нужно писать код, чтобы управлять им. Ты будешь внедрять ИИ-решения, ставить ТЗ и вести команды к результату.',
    duration: '10 месяцев',
    doc: 'Удостоверение о повышении квалификации',
    color: 'text-school21',
  },
  turtle: {
    name: 'ИИ-ИНЖЕНЕР',
    desc: 'Ты — создатель и технарь. Тебе важно понимать, как всё работает изнутри. Ты будешь проектировать архитектуры, обучать модели и писать чистый код.',
    duration: '20 месяцев',
    doc: 'Диплом о профессиональной переподготовке',
    color: 'text-school21purple',
  },
}
</script>

<template>
  <section
    id="quiz"
    class="min-h-screen flex items-center justify-center px-4 py-12 sm:py-20 bg-white/40 dark:bg-darkBg/40 backdrop-blur-sm border-t-2 border-black relative"
  >
    <!-- КАРТОЧКА КВИЗА -->
    <div
      class="max-w-2xl w-full bg-white/80 dark:bg-darkBg/80 backdrop-blur-md border-2 border-black shadow-pixel p-4 sm:p-6 md:p-10"
    >
      <!-- Заголовок -->
      <div class="text-center mb-6 sm:mb-8">
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 uppercase tracking-wider">
          Кто ты в мире ИИ?
        </h2>
        <p class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
          Ответь на 4 вопроса, и мы подберем твой трек
        </p>
      </div>

      <!-- Экран с вопросами -->
      <div v-if="!isFinished" class="space-y-5 sm:space-y-6">
        <!-- Прогресс-бар -->
        <div class="w-full bg-gray-300/50 dark:bg-gray-700/50 border-2 border-black h-3 sm:h-4">
          <div
            class="bg-school21 h-full transition-all duration-500"
            :style="{ width: ((currentQuestion + 1) / questions.length) * 100 + '%' }"
          ></div>
        </div>

        <!-- Текст вопроса и варианты (только если currentQuestionData не undefined) -->
        <template v-if="currentQuestionData">
          <h3
            class="text-lg sm:text-xl md:text-2xl font-bold text-center uppercase leading-snug px-2"
          >
            {{ currentQuestionData.text }}
          </h3>

          <div class="grid gap-3 sm:gap-4">
            <button
              v-for="(option, index) in currentQuestionData.options"
              :key="index"
              @click="selectAnswer(option.points)"
              class="w-full p-3 sm:p-4 md:p-5 text-left border-2 border-black bg-white/60 dark:bg-darkBg/60 hover:bg-school21 hover:text-black dark:hover:bg-school21 dark:hover:text-black transition-all duration-100 shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px] group min-h-[48px] flex items-center"
            >
              <div
                class="flex items-center justify-between font-bold uppercase text-sm sm:text-base md:text-lg leading-snug w-full"
              >
                <span class="pr-2">{{ option.text }}</span>
                <span
                  class="opacity-0 group-hover:opacity-100 transition-opacity text-xl sm:text-2xl flex-shrink-0"
                  >▶</span
                >
              </div>
            </button>
          </div>
        </template>
      </div>

      <!-- Экран результата: УТКА -->
      <div
        v-else-if="result === 'duck'"
        class="text-center space-y-4 sm:space-y-6 animate-fade-in"
      >
        <div class="flex justify-center mb-2 sm:mb-4">
          <DuckSprite
            class="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 animate-[bob_3s_ease-in-out_infinite]"
          />
        </div>
        <h3 class="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase leading-tight px-2">
          Твой путь: <span :class="programs.duck.color">{{ programs.duck.name }}</span>
        </h3>
        <p
          class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed px-2"
        >
          {{ programs.duck.desc }}
        </p>
        <div class="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base px-4">
          <p><span class="font-bold">Длительность:</span> {{ programs.duck.duration }}</p>
          <p><span class="font-bold">Документ:</span> {{ programs.duck.doc }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
          <a
            href="#register"
            class="inline-flex items-center justify-center gap-2 bg-school21 hover:bg-school21dark text-black font-bold py-3 px-6 sm:py-4 sm:px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm sm:text-base md:text-xl min-h-[48px]"
          >
            <Check class="w-5 h-5 sm:w-6 sm:h-6" /> Подать заявку
          </a>
          <button
            @click="resetQuiz"
            class="inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-darkBg/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-3 px-6 sm:py-4 sm:px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm sm:text-base md:text-xl min-h-[48px]"
          >
            <RotateCcw class="w-5 h-5 sm:w-6 sm:h-6" /> Заново
          </button>
          <button
            @click="handleShare"
            :disabled="isSharing"
            class="inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-darkBg/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-3 px-6 sm:py-4 sm:px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm sm:text-base md:text-xl min-h-[48px] disabled:opacity-60"
          >
            <Loader2 v-if="isSharing" class="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            <Share2 v-else class="w-5 h-5 sm:w-6 sm:h-6" /> Поделиться
          </button>
        </div>
        <p v-if="shareStatus === 'downloaded'" class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Картинка скачана, текст с ссылкой скопирован — можно вставить в сообщение
        </p>
      </div>

      <!-- Экран результата: ЧЕРЕПАХА -->
      <div
        v-else-if="result === 'turtle'"
        class="text-center space-y-4 sm:space-y-6 animate-fade-in"
      >
        <div class="flex justify-center mb-2 sm:mb-4">
          <TurtleSprite
            class="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 animate-[bob_3s_ease-in-out_infinite]"
          />
        </div>
        <h3 class="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase leading-tight px-2">
          Твой путь: <span :class="programs.turtle.color">{{ programs.turtle.name }}</span>
        </h3>
        <p
          class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed px-2"
        >
          {{ programs.turtle.desc }}
        </p>
        <div class="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base px-4">
          <p><span class="font-bold">Длительность:</span> {{ programs.turtle.duration }}</p>
          <p><span class="font-bold">Документ:</span> {{ programs.turtle.doc }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4">
          <a
            href="#register"
            class="inline-flex items-center justify-center gap-2 bg-school21 hover:bg-school21dark text-black font-bold py-3 px-6 sm:py-4 sm:px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm sm:text-base md:text-xl min-h-[48px]"
          >
            <Check class="w-5 h-5 sm:w-6 sm:h-6" /> Подать заявку
          </a>
          <button
            @click="resetQuiz"
            class="inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-darkBg/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-3 px-6 sm:py-4 sm:px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm sm:text-base md:text-xl min-h-[48px]"
          >
            <RotateCcw class="w-5 h-5 sm:w-6 sm:h-6" /> Заново
          </button>
          <button
            @click="handleShare"
            :disabled="isSharing"
            class="inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-darkBg/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-3 px-6 sm:py-4 sm:px-8 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-sm sm:text-base md:text-xl min-h-[48px] disabled:opacity-60"
          >
            <Loader2 v-if="isSharing" class="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            <Share2 v-else class="w-5 h-5 sm:w-6 sm:h-6" /> Поделиться
          </button>
        </div>
        <p v-if="shareStatus === 'downloaded'" class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Картинка скачана, текст с ссылкой скопирован — можно вставить в сообщение
        </p>
      </div>

      <!-- Экран результата: НИЧЬЯ -->
      <div
        v-else-if="result === 'tie'"
        class="text-center space-y-4 sm:space-y-6 animate-fade-in"
      >
        <!-- (без изменений) -->
        <div class="flex justify-center gap-4 sm:gap-6 mb-2 sm:mb-4">
          <div class="animate-[jump_1.5s_ease-in-out_infinite]">
            <DuckSprite class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
          </div>
          <div class="animate-[jump_1.5s_ease-in-out_infinite]" style="animation-delay: 0.3s">
            <TurtleSprite class="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" />
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-school21 to-school21purple p-3 sm:p-4 border-2 border-black shadow-pixel mx-2 sm:mx-0"
        >
          <h3
            class="text-lg sm:text-xl md:text-2xl font-extrabold uppercase leading-tight text-white"
          >
            Ты — универсальный специалист!
          </h3>
        </div>

        <p
          class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed px-2"
        >
          Удивительно! Ты одинаково хорошо подходишь и под управление, и под разработку. Выбор за
          тобой!
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 sm:pt-4 px-2 sm:px-0">
          <div
            class="border-2 border-black shadow-pixel p-3 sm:p-4 bg-white/60 dark:bg-darkBg/60 backdrop-blur-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <h4
              class="font-bold uppercase mb-1 sm:mb-2 text-sm sm:text-base"
              :class="programs.duck.color"
            >
              {{ programs.duck.name }}
            </h4>
            <p class="text-xs sm:text-sm mb-1 sm:mb-2">{{ programs.duck.duration }}</p>
            <p class="text-xs sm:text-sm mb-2 sm:mb-3">{{ programs.duck.doc }}</p>
            <button
              @click="selectTrack('duck')"
              class="block w-full text-center bg-school21 hover:bg-school21dark text-black font-bold py-2.5 px-4 border-2 border-black shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
            >
              Выбрать
            </button>
          </div>

          <div
            class="border-2 border-black shadow-pixel p-3 sm:p-4 bg-white/60 dark:bg-darkBg/60 backdrop-blur-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            <h4
              class="font-bold uppercase mb-1 sm:mb-2 text-sm sm:text-base"
              :class="programs.turtle.color"
            >
              {{ programs.turtle.name }}
            </h4>
            <p class="text-xs sm:text-sm mb-1 sm:mb-2">{{ programs.turtle.duration }}</p>
            <p class="text-xs sm:text-sm mb-2 sm:mb-3">{{ programs.turtle.doc }}</p>
            <button
              @click="selectTrack('turtle')"
              class="block w-full text-center bg-school21 hover:bg-school21dark text-black font-bold py-2.5 px-4 border-2 border-black shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xs sm:text-sm min-h-[44px] flex items-center justify-center"
            >
              Выбрать
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center mt-2 sm:mt-4">
          <button
            @click="resetQuiz"
            class="inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-darkBg/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-2.5 px-6 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xs sm:text-sm min-h-[44px]"
          >
            <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5" />
            Пройти заново
          </button>
          <button
            @click="handleShare"
            :disabled="isSharing"
            class="inline-flex items-center justify-center gap-2 bg-white/60 dark:bg-darkBg/60 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white font-bold py-2.5 px-6 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xs sm:text-sm min-h-[44px] disabled:opacity-60"
          >
            <Loader2 v-if="isSharing" class="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            <Share2 v-else class="w-4 h-4 sm:w-5 sm:h-5" />
            Поделиться
          </button>
        </div>
        <p v-if="shareStatus === 'downloaded'" class="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Картинка скачана, текст с ссылкой скопирован — можно вставить в сообщение
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>