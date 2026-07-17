<template>
  <section
    id="register"
    class="relative min-h-screen flex items-center justify-center px-4 py-10 sm:py-16 border-t-2 border-black"
  >
    <div class="absolute inset-0 z-0 pointer-events-none bg-white/95 dark:bg-darkBg/95" />

    <div class="relative z-10 max-w-2xl w-full text-center space-y-6">
      <h2 class="text-3xl sm:text-5xl font-bold uppercase">Оставь заявку</h2>
      <p class="text-lg sm:text-2xl">Стань студентом Школы 21 уже сегодня!</p>

      <div v-if="isSubmitted" class="bg-school21/20 border-2 border-black shadow-pixel p-6">
        <p class="text-xl font-bold uppercase">Заявка отправлена!</p>
        <p class="text-sm sm:text-base mt-2">Мы свяжемся с вами по указанной почте.</p>
      </div>

      <!-- Добавлены атрибуты Netlify Forms: data-netlify, name, и скрытый input -->
      <form
        v-else
        ref="formRef"
        name="registration"
        data-netlify="true"
        @submit.prevent="handleSubmit"
        class="form-block space-y-4 text-left bg-gray-100 dark:bg-[#161D27] border-2 border-black shadow-pixel p-6 sm:p-8"
      >
        <!-- Скрытое поле обязательно для Netlify Forms -->
        <input type="hidden" name="form-name" value="registration" />

        <div>
          <label for="reg-email" class="block font-bold uppercase mb-2">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            name="email"
            placeholder="name@rudn.ru"
            class="w-full p-4 border-2 border-black bg-white dark:bg-darkBg text-black dark:text-white font-pixel text-lg focus:outline-none focus:border-school21 transition-colors"
            :class="{ 'border-red-500 bg-red-50 dark:bg-red-900/20': emailError }"
          />
          <p v-if="emailError" class="text-red-500 text-sm mt-1 font-bold">{{ emailError }}</p>
        </div>

        <div class="flex items-start gap-3">
          <input
            id="consent"
            v-model="consent"
            name="consent"
            type="checkbox"
            class="mt-1 w-5 h-5 border-2 border-black flex-shrink-0 cursor-pointer"
            :class="{ 'border-red-500': consentError }"
          />
          <label
            for="consent"
            class="text-sm sm:text-base cursor-pointer select-none"
            :class="{ 'text-red-500': consentError }"
          >
            Даю согласие на обработку персональных данных
          </label>
        </div>
        <p v-if="consentError" class="text-red-500 text-sm font-bold text-right -mt-2">
          {{ consentError }}
        </p>

        <button
          type="submit"
          class="w-full bg-school21 hover:bg-school21dark text-black font-bold py-4 border-2 border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase text-xl"
        >
          Подать заявку
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { trackGoal } from '../../utils/analytics'

const email = ref('')
const consent = ref(false)
const emailError = ref('')
const consentError = ref('')
const isSubmitted = ref(false)
const formRef = ref<HTMLElement | null>(null)

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
    { threshold: 0.15 },
  )
  if (formRef.value) observer.observe(formRef.value)
})

onUnmounted(() => {
  observer?.disconnect()
})

function isValidRudnEmail(value: string): boolean {
  const trimmed = (value ?? '').trim().toLowerCase()
  if (!trimmed) return false
  if (!trimmed.endsWith('@rudn.ru')) return false
  if (trimmed.includes('@pfur')) return false
  return trimmed.indexOf('@') > 0
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  emailError.value = ''
  consentError.value = ''

  let hasError = false

  if (!email.value.trim()) {
    emailError.value = 'Введите email'
    trackGoal('form_error', { reason: 'empty_email' })
    hasError = true
  } else if (!isValidRudnEmail(email.value)) {
    emailError.value = 'Используйте почту с доменом @rudn.ru (не @pfur)'
    trackGoal('form_error', { reason: 'wrong_domain' }) // Email убран из параметров
    hasError = true
  }

  if (!consent.value) {
    consentError.value = 'Необходимо дать согласие'
    trackGoal('form_error', { reason: 'no_consent' })
    hasError = true
  }

  if (hasError) return

  // Отправка формы через Netlify Forms API
  const formData = new FormData(e.target as HTMLFormElement)

  try {
    await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
    })

    trackGoal('form_submitted_success') // Email убран из параметров
    isSubmitted.value = true
    email.value = ''
    consent.value = false
  } catch (err) {
    console.error('Form submission failed:', err)
    emailError.value = 'Ошибка отправки. Попробуйте позже.'
  }
}
</script>

<style scoped>
.form-block {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.form-block.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
