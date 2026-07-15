<template>
  <div class="fixed bottom-32 right-4 sm:bottom-6 sm:right-6 z-[60] opacity-70 backdrop-blur-sm transition-opacity hover:opacity-100">
    <!-- Кнопка открытия -->
    <Transition name="fade">
      <button
        v-if="!isOpen"
        @click="openChat"
        class="bg-school21 hover:bg-school21dark text-black font-bold p-4 sm:p-3 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full"
      >
        <MessageCircle class="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </Transition>

    <!-- Окно чата -->
    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="bg-white dark:bg-darkBg border-2 border-black shadow-pixel w-80 sm:w-96 h-96 flex flex-col rounded-2xl overflow-hidden"
      >
        <!-- Шапка -->
        <div class="flex justify-between items-center p-3 border-b-2 border-black bg-school21/20 dark:bg-school21/10">
          <div class="flex flex-col leading-tight">
            <span class="font-bold uppercase text-sm">FAQ-бот</span>
            <span class="text-[10px] normal-case font-normal opacity-70">
              <template v-if="aiMode === 'on'">ИИ-ответы включены </template>
              <template v-else>ответы по ключевым словам</template>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="toggleAiMode"
              type="button"
              class="text-[10px] px-1.5 py-0.5 border-2 border-black bg-white/60 dark:bg-black/20 hover:bg-school21 transition-colors rounded"
              :title="aiMode === 'on' ? 'Отключить ИИ-ответы' : 'Включить ИИ-ответы (запрос уходит на сервер)'"
            >
              {{ aiMode === 'on' ? 'ИИ: вкл' : 'ИИ: выкл' }}
            </button>
            <button @click="isOpen = false" class="hover:text-school21 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Сообщения -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-gray-900/30" ref="messagesContainer">
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="max-w-[80%] p-2 border-2 border-black shadow-pixel-sm text-sm whitespace-pre-line"
            :class="msg.from === 'user' ? 'bg-school21/20 ml-auto' : 'bg-white dark:bg-gray-800'"
          >
            {{ msg.text }}

            <!-- Кликабельные подсказки-темы под ответом бота -->
            <div v-if="msg.suggestions?.length" class="mt-2 flex flex-wrap gap-1">
              <button
                v-for="s in msg.suggestions"
                :key="s"
                type="button"
                @click="askSuggested(s)"
                class="text-[11px] px-2 py-0.5 border-2 border-black bg-school21/30 hover:bg-school21 transition-colors rounded-full"
              >
                {{ s }}
              </button>
            </div>
          </div>

          <div v-if="isTyping" class="text-xs text-gray-500 italic">Бот печатает...</div>
        </div>

        <!-- Форма ввода -->
        <form @submit.prevent="sendMessage" class="border-t-2 border-black p-2 flex gap-2">
          <input
            v-model="input"
            type="text"
            placeholder="Спроси про обучение..."
            class="flex-1 p-2 border-2 border-black bg-white dark:bg-darkBg text-black dark:text-white font-pixel text-sm focus:outline-none focus:border-school21 transition-colors"
          />
          <button
            type="submit"
            class="bg-school21 border-2 border-black px-3 py-1 font-bold text-sm hover:bg-school21dark transition-colors shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px]"
          >
            →
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { MessageCircle, X } from 'lucide-vue-next'

type ChatMessage = { from: 'user' | 'bot'; text: string; suggestions?: string[] }

const isOpen = ref(false)
const input = ref('')
const messages = ref<ChatMessage[]>([])
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()

/* ============================================================================
 * Режим ИИ-ответов.
 *
 * Раньше тут в браузер грузилась ONNX-модель эмбеддингов (~50 МБ с CDN
 * Hugging Face) — ненадёжно зависело от доступности CDN. Теперь вместо этого
 * при включённом режиме вопрос уходит на серверную функцию /api/chat
 * (см. api/chat.ts), которая обращается к бесплатному облачному LLM
 * (Groq/Llama). API-ключ хранится только на сервере.
 *
 * Лексический поиск по ключевым словам остаётся основой и работает всегда —
 * даже если сервер недоступен или лимит бесплатного API исчерпан, бот не
 * "молчит", а отвечает по базе FAQ.
 * ========================================================================== */
type AiMode = 'on' | 'off'
const AI_MODE_KEY = 'campus21-chat-ai-mode'

function readStoredMode(): AiMode {
  try {
    const v = localStorage.getItem(AI_MODE_KEY)
    if (v === 'on' || v === 'off') return v
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.)
  }
  return 'on' // по умолчанию пробуем ИИ, при ошибке сами откатимся на лексику
}

const aiMode = ref<AiMode>(readStoredMode())

function persistMode(value: AiMode) {
  try {
    localStorage.setItem(AI_MODE_KEY, value)
  } catch {
    // игнорируем — просто не сохранится между визитами
  }
}

function toggleAiMode() {
  aiMode.value = aiMode.value === 'on' ? 'off' : 'on'
  persistMode(aiMode.value)
  messages.value.push({
    from: 'bot',
    text: aiMode.value === 'on' ? 'Включаю ИИ-ответы.' : 'Отключаю ИИ-ответы, отвечаю по ключевым словам.',
  })
  scrollToBottom()
}

/* ============================================================================
 * Запрос к серверной функции /api/chat.
 * Хранит короткую историю диалога для контекста.
 * При любой ошибке (сеть, лимит API, сервер недоступен) возвращает null —
 * вызывающий код должен откатиться на лексический поиск.
 * ========================================================================== */
type Role = 'user' | 'assistant'
const aiHistory = ref<Array<{ role: Role; content: string }>>([])

async function askAi(question: string): Promise<string | null> {
  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question, history: aiHistory.value }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { answer?: string; error?: string }
    if (!data.answer) return null

    aiHistory.value.push({ role: 'user', content: question })
    aiHistory.value.push({ role: 'assistant', content: data.answer })
    aiHistory.value = aiHistory.value.slice(-6)

    return data.answer
  } catch (err) {
    console.warn('ИИ-сервер недоступен, откатываюсь на лексический поиск:', err)
    return null
  }
}

/* ============================================================================
 * Лексический поиск по банку вопрос-ответ — быстрый офлайн-фолбэк.
 * ========================================================================== */

interface FaqEntry {
  id: string
  keywords: string[]
  answer: string
  topic: string // короткая подпись для кнопки-подсказки
}

const faqBank: FaqEntry[] = [
  {
    id: 'address',
    topic: 'Адрес кампуса',
    keywords: ['адрес', 'кампус', 'где находится', 'локация', 'как пройти', 'как добраться', 'место', 'подольское шоссе', 'куда идти', 'где вы'],
    answer: 'Кампус находится по адресу: г. Москва, ул. Подольское шоссе, д. 8 (вход со стороны сквера).',
  },
  {
    id: 'documents',
    topic: 'Документы',
    keywords: ['документы', 'заявление', 'справка', 'какие бумаги', 'что принести', 'что нужно принести'],
    answer: 'После установочной встречи в личном кабинете появятся документы для заполнения. Их нужно принести в первый день обучения.',
  },
  {
    id: 'payment',
    topic: 'Оплата обучения',
    keywords: ['оплата', 'бесплатно', 'платно', 'стоимость', 'цена', 'сколько стоит', 'деньги', 'стоит ли платить'],
    answer: 'Обучение полностью бесплатное для студентов и сотрудников РУДН.',
  },
  {
    id: 'registration',
    topic: 'Регистрация',
    keywords: ['регистрация', 'зарегистрироваться', 'записаться', 'почта', 'email', 'домен', 'rudn.ru', 'как поступить в личный кабинет', 'аккаунт'],
    answer: 'Зарегистрируйтесь на нашем сайте, используя почту с доменом @rudn.ru (не @pfur). После регистрации выберите время установочной встречи в личном кабинете.',
  },
  {
    id: 'intensive',
    topic: 'Отборочный интенсив',
    keywords: ['интенсив', 'отборочный интенсив', 'сколько дней', 'формат отбора', 'очно', 'сколько длится отбор'],
    answer: 'Отборочный интенсив длится 4 дня очно в кампусе. Он проходит несколько раз в год (см. даты на странице).',
  },
  {
    id: 'duration',
    topic: 'Сроки обучения',
    keywords: ['длительность', 'срок', 'сколько учиться', 'сколько месяцев', 'продолжительность', 'сколько длится обучение', 'нагрузка', 'часов в неделю'],
    answer: 'ИИ-инженер — 20 месяцев (4–6 ч/нед, 436 акад. часов), Цифровой заказчик — 10 месяцев (4–6 ч/нед, 200 акад. часов).',
  },
  {
    id: 'certificate',
    topic: 'Диплом и сертификат',
    keywords: ['сертификат', 'диплом', 'удостоверение', 'что выдают по окончании', 'документ об образовании'],
    answer: 'По окончании выдаётся удостоверение о повышении квалификации (Цифровой заказчик) или диплом о профессиональной переподготовке (ИИ-инженер).',
  },
  {
    id: 'career',
    topic: 'Трудоустройство',
    keywords: ['работа', 'карьера', 'трудоустройство', 'резюме', 'собеседование', 'вакансии', 'куда устроиться', 'помогают ли с работой'],
    answer: 'Выпускники работают в ведущих IT-компаниях. Карьерный центр помогает с резюме, портфолио и подготовкой к собеседованиям.',
  },
  {
    id: 'skills',
    topic: 'Какие навыки дадут',
    keywords: ['навыки', 'чему научат', 'python', 'sql', 'ml', 'машинное обучение', 'управление проектами', 'чему учат', 'программа обучения'],
    answer: 'Вы получите практические навыки, востребованные в индустрии: Python, SQL, ML, управление проектами и многое другое.',
  },
  {
    id: 'selection',
    topic: 'Критерии отбора',
    keywords: ['отбор', 'критерии', 'кого берут', 'требования', 'нужен ли опыт', 'кто может поступить', 'условия поступления'],
    answer: 'Критерии отбора: для ИИ-инженера нужны базовые знания Python, для Цифрового заказчика — цифровая грамотность и логика. Также необходимо быть студентом или сотрудником РУДН.',
  },
  {
    id: 'how-to-apply',
    topic: 'Как поступить',
    keywords: ['как поступить', 'шаги поступления', 'этапы', 'план действий', 'с чего начать', 'алгоритм поступления'],
    answer: 'Шесть шагов: регистрация, выбор времени, установочная встреча, отборочный интенсив (4 дня), ожидание результатов, начало обучения. Подробности в разделе «Как поступить».',
  },
  {
    id: 'dates',
    topic: 'Даты набора',
    keywords: ['даты', 'когда начало', 'расписание набора', 'когда старт', 'ближайший набор', 'когда следующий интенсив'],
    answer: 'Ближайшие отборочные интенсивы: 1–4 июля, 29 сентября – 2 октября, 13–16 октября, 27–30 октября. Старт основного обучения — 18 ноября 2026.',
  },
  {
    id: 'contacts',
    topic: 'Контакты',
    keywords: ['контакты', 'телефон', 'написать', 'связаться', 'telegram', 'вконтакте', 'vk', 'почта поддержки', 'email поддержки'],
    answer: 'Email: 21-school@rudn.ru, Telegram: @campus21_rudn, ВКонтакте: vk.com/21school_rudn.',
  },
  {
    id: 'hours',
    topic: 'Часы работы',
    keywords: ['часы работы', 'расписание кампуса', 'во сколько открыт', 'режим работы', 'когда открыт кампус'],
    answer: 'Кампус открыт Пн–Сб, 9:00–21:00.',
  },
]

// Короткие/служебные слова, которые не несут смысла и не участвуют в сопоставлении
const stopWords = new Set([
  'и', 'в', 'на', 'с', 'по', 'что', 'как', 'где', 'это', 'чтобы', 'для', 'у', 'а', 'к', 'от',
  'мне', 'я', 'вы', 'ты', 'он', 'она', 'ли', 'же', 'то', 'из', 'при', 'до', 'но', 'или', 'бы',
  'есть', 'будет', 'нужно', 'можно', 'какой', 'какая', 'какие', 'про',
])

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Очень упрощённый "стеммер" для русского: срезает частые словоформенные окончания,
// чтобы "документов", "документами", "документ" совпадали друг с другом
function stem(word: string): string {
  if (word.length <= 4) return word
  const suffixes = [
    'ями', 'ами', 'иях', 'иям', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими',
    'ешь', 'ете', 'ует', 'уют', 'ится', 'иться', 'ится', 'ать', 'ять', 'еть', 'ить',
    'ов', 'ев', 'ах', 'ях', 'ей', 'ой', 'ый', 'ий', 'ая', 'яя', 'ое', 'ее',
    'ую', 'юю', 'ем', 'им', 'ам', 'ям', 'ю', 'я', 'ы', 'и', 'а', 'о', 'у', 'е', 'й', 'ь',
  ]
  for (const suf of suffixes) {
    if (word.length - suf.length >= 3 && word.endsWith(suf)) {
      return word.slice(0, word.length - suf.length)
    }
  }
  return word
}

function tokenize(str: string): string[] {
  return normalize(str)
    .split(' ')
    .filter(w => w.length > 1 && !stopWords.has(w))
    .map(stem)
}

// Расстояние Левенштейна — допускаем опечатки при сравнении коротких токенов
function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0) as number[])
  for (let i = 0; i <= a.length; i++) dp[i]![0] = i
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      )
    }
  }
  return dp[a.length]![b.length]!
}

function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return true
  // допускаем 1 опечатку на короткие слова, 2 — на длинные
  const maxDist = Math.max(a.length, b.length) >= 7 ? 2 : 1
  return levenshtein(a, b) <= maxDist
}

// Готовим стеммированные ключевые слова и IDF-подобные веса один раз при загрузке модуля
const bankKeywordTokens = faqBank.map(entry => {
  const kwTokens = new Set<string>()
  for (const kw of entry.keywords) {
    for (const t of tokenize(kw)) kwTokens.add(t)
  }
  return { entry, kwTokens: Array.from(kwTokens) }
})

// Считаем, в скольких записях встречается каждый токен — редкие токены весят больше
const docFrequency = new Map<string, number>()
for (const { kwTokens } of bankKeywordTokens) {
  const seen = new Set(kwTokens)
  for (const t of seen) {
    docFrequency.set(t, (docFrequency.get(t) ?? 0) + 1)
  }
}
function tokenWeight(token: string): number {
  const df = docFrequency.get(token) ?? 1
  return Math.log(1 + bankKeywordTokens.length / df)
}

interface MatchResult {
  entry: FaqEntry
  score: number
}

function lexicalScores(question: string): number[] {
  const qTokens = tokenize(question)
  return bankKeywordTokens.map(({ kwTokens }) => {
    let score = 0
    for (const qt of qTokens) {
      for (const kt of kwTokens) {
        if (tokensMatch(qt, kt)) {
          score += tokenWeight(kt)
          break
        }
      }
    }
    return score
  })
}

function findBestMatches(question: string, limit = 3): MatchResult[] {
  const lex = lexicalScores(question)
  return faqBank
    .map((entry, i) => ({ entry, score: lex[i] ?? 0 }))
    .filter(r => r.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

function lexicalAnswerFor(question: string): { text: string; suggestions?: string[] } {
  const matches = findBestMatches(question)

  const fallback = () => ({
    text: 'Хм, не нашёл точного ответа на этот вопрос в базе. Могу рассказать про один из этих разделов, либо напишите нам напрямую: 21-school@rudn.ru',
    suggestions: [...faqBank].sort(() => Math.random() - 0.5).slice(0, 4).map(e => e.topic),
  })

  const best = matches[0]
  const second = matches[1]
  if (!best) return fallback()

  const confident = !second || best.score >= second.score * 1.3
  if (confident) return { text: best.entry.answer }

  const topTopics = matches.map(m => m.entry.topic)
  return {
    text: `${best.entry.answer}\n\nЕсли вопрос был про другое — уточните тему:`,
    suggestions: topTopics,
  }
}

async function answerFor(question: string): Promise<{ text: string; suggestions?: string[] }> {
  if (aiMode.value === 'on') {
    const aiAnswer = await askAi(question)
    if (aiAnswer) return { text: aiAnswer }
    // сервер недоступен / лимит исчерпан — молча откатываемся на лексику
  }
  return lexicalAnswerFor(question)
}

onMounted(() => {
  messages.value.push({
    from: 'bot',
    text: 'Привет! Я бот-помощник кампуса РУДН × Школа 21. Задайте вопрос про обучение, поступление или кампус.',
  })
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function askSuggested(topic: string) {
  input.value = topic
  sendMessage()
}

function openChat() {
  isOpen.value = true
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text) return

  messages.value.push({ from: 'user', text })
  input.value = ''
  isTyping.value = true
  scrollToBottom()

  const start = Date.now()
  const { text: answer, suggestions } = await answerFor(text)

  // Небольшая минимальная задержка — ощущается более "живым" ботом, даже если
  // ответ (лексический, без ИИ) посчитался мгновенно
  const elapsed = Date.now() - start
  const minDelay = 400 + Math.random() * 300
  if (elapsed < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
  }

  messages.value.push({ from: 'bot', text: answer, suggestions })
  isTyping.value = false
  scrollToBottom()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>