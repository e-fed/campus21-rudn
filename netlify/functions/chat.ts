// Netlify serverless-функция (POST /api/chat)
// Вызывается из ChatWidget.vue для получения ответа от Groq.
// API-ключ хранится в переменной окружения GROQ_API_KEY на Netlify.

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'qwen-2.5-32b'

const SYSTEM_PROMPT = `Ты — дружелюбный бот-помощник кампуса РУДН × Школа 21 (программы «ИИ-инженер» и «Цифровой заказчик»).
Отвечай кратко (2-5 предложений), по-русски, только на основе фактов ниже. Если ответа в фактах нет — честно скажи,
что не знаешь, и предложи написать на 21-school@rudn.ru. Не выдумывай факты, которых нет в списке.

Факты:
- Адрес кампуса: г. Москва, ул. Подольское шоссе, д. 8 (вход со стороны сквера).
- Обучение полностью бесплатное для студентов и сотрудников РУДН.
- Регистрация — на сайте, только с почтой на домене @rudn.ru (не @pfur). После регистрации в личном кабинете выбирается время установочной встречи.
- После установочной встречи в личном кабинете появляются документы для заполнения, их нужно принести в первый день обучения.
- Отборочный интенсив — 4 дня очно в кампусе, проходит несколько раз в год.
- Ближайшие отборочные интенсивы: 1–4 июля, 29 сентября – 2 октября, 13–16 октября, 27–30 октября. Старт основного обучения — 18 ноября 2026.
- Длительность обучения: «ИИ-инженер» — 20 месяцев, 4-6 ч/нед, 436 акад. часов. «Цифровой заказчик» — 10 месяцев, 4-6 ч/нед, 200 акад. часов.
- По окончании: удостоверение о повышении квалификации («Цифровой заказчик») или диплом о профессиональной переподготовке («ИИ-инженер»).
- Критерии отбора: «ИИ-инженер» — базовые знания Python; «Цифровой заказчик» — цифровая грамотность и логика. В обоих случаях нужно быть студентом или сотрудником РУДН.
- Шесть шагов поступления: регистрация → выбор времени → установочная встреча → отборочный интенсив (4 дня) → ожидание результатов → начало обучения.
- Чему учат: Python, SQL, ML, управление проектами и другие навыки, востребованные в индустрии.
- Трудоустройство: карьерный центр помогает с резюме, портфолио, подготовкой к собеседованиям; выпускники работают в ведущих IT-компаниях.
- Часы работы кампуса: Пн–Сб, 9:00–21:00.
- Контакты: email 21-school@rudn.ru, Telegram @campus21_rudn, ВКонтакте vk.com/21school_rudn.`

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Только POST-запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'method not allowed' }),
    }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GROQ_API_KEY не задан на сервере' }),
    }
  }

  let body: { message?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'bad json' }),
    }
  }

  const message = (body.message ?? '').toString().trim().slice(0, 1000)
  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'empty message' }),
    }
  }

  const history = Array.isArray(body.history) ? body.history.slice(-6) : []

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: message },
        ],
      }),
    })

    if (!groqRes.ok) {
      const errText = await groqRes.text()
      console.error('Groq API error:', groqRes.status, errText)
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'upstream error' }),
      }
    }

    const data = await groqRes.json()
    const answer: string = data?.choices?.[0]?.message?.content ?? ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    }
  } catch (err) {
    console.error('Chat proxy failed:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'internal error' }),
    }
  }
}