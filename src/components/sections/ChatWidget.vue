<template>
  <div class="fixed bottom-24 right-4 md:right-6 z-[60]">
    <Transition name="fade">
      <button
        v-if="!isOpen"
        @click="openChat"
        aria-label="Открыть чат-помощник"
        class="bg-school21 hover:bg-school21dark text-black font-bold p-4 sm:p-3 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full opacity-70 hover:opacity-100"
      >
        <MessageCircle class="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="isOpen"
        class="bg-white dark:bg-darkBg border-2 border-black shadow-pixel w-80 sm:w-96 max-w-[calc(100vw-2rem)] h-96 flex flex-col rounded-2xl overflow-hidden"
      >
        <div class="flex justify-between items-center p-3 border-b-2 border-black bg-school21/20 dark:bg-school21/10">
          <div class="flex flex-col leading-tight">
            <span class="font-bold uppercase text-sm">FAQ-бот</span>
            <span class="text-[10px] normal-case font-normal opacity-70">
              <template v-if="aiMode === 'on'">ИИ-ответы включены</template>
              <template v-else>ответы по ключевым словам</template>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="toggleAiMode"
              type="button"
              aria-label="Переключить режим ИИ"
              class="text-[10px] px-1.5 py-0.5 border-2 border-black bg-white/60 dark:bg-black/20 hover:bg-school21 transition-colors rounded"
            >
              {{ aiMode === 'on' ? 'ИИ: вкл' : 'ИИ: выкл' }}
            </button>
            <button @click="isOpen = false" aria-label="Закрыть чат" class="hover:text-school21 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/50 dark:bg-gray-900/30" ref="messagesContainer">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="max-w-[80%] p-2 border-2 border-black shadow-pixel-sm text-sm whitespace-pre-line"
            :class="msg.from === 'user' ? 'bg-school21/20 ml-auto' : 'bg-white dark:bg-gray-800'"
          >
            {{ msg.text }}
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

        <form @submit.prevent="sendMessage" class="border-t-2 border-black p-2 flex gap-2">
          <label for="chat-input" class="sr-only">Введите сообщение</label>
          <input
            id="chat-input"
            v-model="input"
            type="text"
            placeholder="Спроси про обучение..."
            :disabled="isTyping"
            class="flex-1 p-2 border-2 border-black bg-white dark:bg-darkBg text-black dark:text-white font-pixel text-sm focus:outline-none focus:border-school21 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            :disabled="isTyping"
            class="bg-school21 border-2 border-black px-3 py-1 font-bold text-sm hover:bg-school21dark transition-colors shadow-pixel-sm active:translate-x-[1px] active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
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
import { trackGoal } from '../../utils/analytics'
import { CAMPUS_FACTS_ARRAY } from '../../data/campusFacts'

type ChatMessage = { id: string; from: 'user' | 'bot'; text: string; suggestions?: string[] }

const isOpen = ref(false)
const input = ref('')
const messages = ref<ChatMessage[]>([])
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()

const aiCache = new Map<string, string>()
const CACHE_KEY = 'campus21-ai-cache-v2'

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, string>
      const entries = Object.entries(obj).slice(-30)
      aiCache.clear()
      entries.forEach(([k, v]) => aiCache.set(k, v))
    }
  } catch {}
}

function saveCache() {
  try {
    const obj = Object.fromEntries(aiCache)
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch {}
}

function normalizeForCache(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s]/gi, '').replace(/\s+/g, ' ').trim()
}

loadCache()

type AiMode = 'on' | 'off'
const AI_MODE_KEY = 'campus21-chat-ai-mode-v2'

function readStoredMode(): AiMode {
  try {
    const v = localStorage.getItem(AI_MODE_KEY)
    if (v === 'on' || v === 'off') return v
  } catch {}
  return 'on'
}

const aiMode = ref<AiMode>(readStoredMode())

function persistMode(value: AiMode) {
  try { localStorage.setItem(AI_MODE_KEY, value) } catch {}
}

function toggleAiMode() {
  aiMode.value = aiMode.value === 'on' ? 'off' : 'on'
  persistMode(aiMode.value)
  trackGoal('chat_ai_mode_toggled', { mode: aiMode.value })
  messages.value.push({
    id: Date.now().toString(),
    from: 'bot',
    text: aiMode.value === 'on' ? 'Включаю ИИ-ответы.' : 'Отключаю ИИ-ответы, отвечаю по ключевым словам.',
  })
  scrollToBottom()
}

type Role = 'user' | 'assistant'
const aiHistory = ref<Array<{ role: Role; content: string }>>([])

async function askAi(question: string): Promise<string | null> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question, history: aiHistory.value }),
      signal: controller.signal,
    })
    
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}))
      const retryAfter = data.retryAfter || 5
      console.warn(`Rate limit. Ждём ${retryAfter}с...`)
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
      return askAi(question)
    }
    
    if (!res.ok) return null
    const data = (await res.json()) as { answer?: string }
    if (!data.answer) return null
    
    aiHistory.value.push({ role: 'user', content: question })
    aiHistory.value.push({ role: 'assistant', content: data.answer })
    aiHistory.value = aiHistory.value.slice(-4)
    
    return data.answer
  } catch (err) {
    console.warn('ИИ-сервер недоступен или таймаут:', err)
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

interface FaqEntry {
  id: string
  keywords: string[]
  answer: string
  topic: string
}

const faqBank: FaqEntry[] = CAMPUS_FACTS_ARRAY as FaqEntry[]

const stopWords = new Set([
  'и', 'в', 'на', 'с', 'по', 'что', 'как', 'где', 'это', 'чтобы', 'для', 'у', 'а', 'к', 'от',
  'мне', 'я', 'вы', 'ты', 'он', 'она', 'ли', 'же', 'то', 'из', 'при', 'до', 'но', 'или', 'бы',
  'есть', 'будет', 'нужно', 'можно', 'какой', 'какая', 'какие', 'про',
])

function normalize(str: string): string {
  return str.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim()
}

function stem(word: string): string {
  if (word.length <= 4) return word
  const suffixes = ['ями', 'ами', 'иях', 'иям', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими', 'ешь', 'ете', 'ует', 'уют', 'ится', 'иться', 'ать', 'ять', 'еть', 'ить', 'ов', 'ев', 'ах', 'ях', 'ей', 'ой', 'ый', 'ий', 'ая', 'яя', 'ое', 'ее', 'ую', 'юю', 'ем', 'им', 'ам', 'ям', 'ю', 'я', 'ы', 'и', 'а', 'о', 'у', 'е', 'й', 'ь']
  for (const suf of suffixes) {
    if (word.length - suf.length >= 3 && word.endsWith(suf)) {
      return word.slice(0, word.length - suf.length)
    }
  }
  return word
}

function tokenize(str: string): string[] {
  return normalize(str).split(' ').filter(w => w.length > 1 && !stopWords.has(w)).map(stem)
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0) as number[])
  for (let i = 0; i <= a.length; i++) dp[i]![0] = i
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost)
    }
  }
  return dp[a.length]![b.length]!
}

function tokensMatch(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length >= 4 && b.length >= 4 && (a.includes(b) || b.includes(a))) return true
  const maxDist = Math.max(a.length, b.length) >= 7 ? 2 : 1
  return levenshtein(a, b) <= maxDist
}

const bankKeywordTokens = faqBank.map(entry => {
  const kwTokens = new Set<string>()
  for (const kw of entry.keywords) {
    for (const t of tokenize(kw)) kwTokens.add(t)
  }
  return { entry, kwTokens: Array.from(kwTokens) }
})

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

function findBestMatches(question: string, limit = 3) {
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
    text: 'Хм, не нашёл точного ответа в базе. Напишите нам: 21-school@rudn.ru',
    suggestions: [...faqBank].sort(() => Math.random() - 0.5).slice(0, 4).map(e => e.topic),
  })

  const best = matches[0]
  const second = matches[1]
  if (!best) return fallback()

  const confident = !second || best.score >= second.score * 1.3
  if (confident) return { text: best.entry.answer }

  return {
    text: `${best.entry.answer}\n\nЕсли вопрос был про другое — уточните тему:`,
    suggestions: matches.map(m => m.entry.topic),
  }
}

async function answerFor(question: string): Promise<{ text: string; suggestions?: string[] }> {
  const normalized = normalizeForCache(question)
  if (aiCache.has(normalized)) {
    return { text: aiCache.get(normalized)! }
  }
  
  if (aiMode.value === 'on') {
    const aiAnswer = await askAi(question)
    if (aiAnswer) {
      aiCache.set(normalized, aiAnswer)
      saveCache()
      trackGoal('chat_ai_answer_provided')
      return { text: aiAnswer }
    }
  }
  trackGoal('chat_lexical_fallback_used')
  return lexicalAnswerFor(question)
}

onMounted(() => {
  messages.value.push({
    id: 'welcome',
    from: 'bot',
    text: 'Привет! Я бот-помощник кампуса РУДН × Школа 21. Задайте вопрос про обучение или кампус.',
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
  trackGoal('chat_suggestion_clicked', { topic })
  input.value = topic
  sendMessage()
}

function openChat() {
  isOpen.value = true
  trackGoal('chat_opened')
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || isTyping.value) return

  trackGoal('chat_message_sent')
  messages.value.push({ id: Date.now().toString(), from: 'user', text })
  input.value = ''
  isTyping.value = true
  scrollToBottom()

  const start = Date.now()
  const { text: answer, suggestions } = await answerFor(text)

  const elapsed = Date.now() - start
  const minDelay = 400 + Math.random() * 300
  if (elapsed < minDelay) {
    await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
  }

  messages.value.push({ id: (Date.now() + 1).toString(), from: 'bot', text: answer, suggestions })
  isTyping.value = false
  scrollToBottom()
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>